// Game logic. Knows nothing about pixels: all timing and drawing goes through
// a Presenter, so the same scripts run in the browser and in headless tests.
import type {
  ActorHandle, CharacterDef, Dialogue, Dir, Game, Handler, Hotspot, ItemDef, Role, RoomDef, SaveState, Verb,
} from './types';
import type { Pt } from './paint';
import { atLeast, refusal, ROLE_ORDER } from './roles';
import { rng } from './rng';
import { runReview } from './codeReview';

export interface DuelDef {
  id: string;
  opponent: string;
  /** The Master's review: a few of her own patches, in random order, the stale cache last. */
  master?: boolean;
  /** Misses allowed before the review is lost (default 0). */
  mistakes?: number;
}

/** A kind of bug a code review can catch. Mac's comment for it is an option once he has learned it. */
export interface BugDef {
  id: string;
  /** For Mac's review notes: "New in your review notes: ..." */
  name: string;
  /** Mac's review comment that names it. */
  comment: string;
}

/** A patch under review. Its bug is one of the BugDefs; the reviewer explains it if Mac misses it. */
export interface PatchDef {
  id: string;
  /** The reviewer who shows it. */
  who: string;
  bug: string;
  title: string;
  code: string[];
  intro: string[];
  /** Mac's wrong comments, and what the reviewer says to each. */
  decoys: { text: string; reply: string }[];
  /** After a miss: what the bug is, and how to fix it. */
  explain: string[];
  /** After Mac finds it. */
  yes: string[];
}

export interface Content {
  rooms: Record<string, RoomDef>;
  items: Record<string, ItemDef>;
  characters: Record<string, CharacterDef>;
  dialogues: Record<string, Dialogue>;
  duels: Record<string, DuelDef>;
  bugs: BugDef[];
  patches: PatchDef[];
  startRoom: string;
  /** Lines when nothing else applies. */
  fallback: Partial<Record<Verb | 'combine', string[]>>;
  /** Music track per room id (see public/audio/music). */
  music?: Record<string, string>;
  /** Called after a duel ends. */
  afterDuel?: (g: Game, duel: DuelDef, won: boolean) => void | Promise<void>;
  /** The puzzle chain in order, for analytics (how far players get). */
  milestones?: { id: string; done: (g: Game) => boolean }[];
}

export type Target = { kind: 'hotspot'; id: string } | { kind: 'item'; id: string };

export interface Presenter {
  speak(actor: string, text: string): Promise<void>;
  narrate(text: string): Promise<void>;
  walk(actor: string, to: Pt): Promise<void>;
  /** Stop a walk immediately (resolving its promise). */
  stop(actor: string): void;
  face(actor: string, dir: Dir): void;
  wait(ms: number): Promise<void>;
  choose(options: { id: string; text: string }[]): Promise<string>;
  enterRoom(room: RoomDef, at: Pt, face: Dir): Promise<void>;
  roleGranted(role: Role): Promise<void>;
  itemGained(item: ItemDef): void;
  fx(name: string, args: any[]): Promise<void>;
  card(lines: string[], ms: number): Promise<void>;
  shake(): void;
  refresh(): void;
  now(): number;
  toTitle(): Promise<void>;
  actorPos(id: string): { x: number; y: number; dir: Dir; visible: boolean } | null;
  setActor(id: string, patch: Partial<{ x: number; y: number; dir: Dir; visible: boolean; gesture: string | undefined }>): void;
  saved(state: SaveState): void;
}

class Cancelled extends Error {}

export function newState(content: Content): SaveState {
  const room = content.rooms[content.startRoom];
  const start = room.start ?? [160, 120];
  return {
    v: 1,
    room: content.startRoom,
    role: 'anonymous',
    flags: {},
    inv: [],
    mac: { x: start[0], y: start[1], dir: room.startFace ?? 'front' },
    playMs: 0,
  };
}

export class GameCore implements Game {
  state: SaveState;
  busy = false;
  log: string[] = [];
  private rand = rng(1234);
  private refusals = 0;
  private fallbackN = 0;

  constructor(
    public content: Content,
    public presenter: Presenter,
    public headless = false,
    state?: SaveState,
  ) {
    this.state = state ?? newState(content);
  }

  // ---- state ----------------------------------------------------------------
  get room(): RoomDef { return this.content.rooms[this.state.room]; }
  flag<T = any>(name: string): T { return this.state.flags[name] as T; }
  set(name: string, value: number | string | boolean = true) {
    if (value === false) delete this.state.flags[name];
    else this.state.flags[name] = value;
    this.presenter.refresh();
  }
  inc(name: string, by = 1) { const v = (Number(this.state.flags[name]) || 0) + by; this.state.flags[name] = v; return v; }
  has(item: string) { return this.state.inv.includes(item); }
  give(item: string, quiet = false) {
    if (!this.content.items[item]) throw new Error(`Unknown item: ${item}`);
    if (!this.has(item)) this.state.inv.push(item);
    this.state.flags[`got:${item}`] = true;
    if (!quiet) this.presenter.itemGained(this.content.items[item]);
    this.presenter.refresh();
  }
  take(item: string) {
    this.state.inv = this.state.inv.filter((i) => i !== item);
    this.presenter.refresh();
  }
  get role(): Role { return this.state.role; }
  atLeast(r: Role) { return atLeast(this.state.role, r); }
  async grantRole(r: Role) {
    if (ROLE_ORDER.indexOf(r) <= ROLE_ORDER.indexOf(this.state.role)) return;
    this.state.role = r;
    this.log.push(`ROLE ${r}`);
    await this.presenter.roleGranted(r);
  }
  random<T>(arr: readonly T[]): T { return arr[Math.floor((this.headless ? this.rand.next() : Math.random()) * arr.length)]; }

  // ---- speech & movement ------------------------------------------------------
  private lines(text: string | string[]) { return Array.isArray(text) ? text : [text]; }
  async say(text: string | string[]) { return this.sayAs('mac', text); }
  async sayAs(actor: string, text: string | string[]) {
    for (const t of this.lines(text)) {
      this.log.push(`${actor}: ${t}`);
      await this.presenter.speak(actor, t);
    }
  }
  async narrate(text: string | string[]) {
    for (const t of this.lines(text)) {
      this.log.push(`NARRATOR: ${t}`);
      await this.presenter.narrate(t);
    }
  }
  actor(id: string): ActorHandle {
    const core = this;
    const pos = () => core.presenter.actorPos(id) ?? { x: 0, y: 0, dir: 'front' as Dir, visible: false };
    return {
      id,
      get x() { return pos().x; },
      set x(v: number) { core.presenter.setActor(id, { x: v }); },
      get y() { return pos().y; },
      set y(v: number) { core.presenter.setActor(id, { y: v }); },
      get dir() { return pos().dir; },
      set dir(v: Dir) { core.presenter.setActor(id, { dir: v }); },
      get visible() { return pos().visible; },
      set visible(v: boolean) { core.presenter.setActor(id, { visible: v }); },
      set gesture(v: string | undefined) { core.presenter.setActor(id, { gesture: v }); },
      say: (t) => core.sayAs(id, t),
      walkTo: (x, y) => core.presenter.walk(id, [x, y]),
      face: (d) => core.presenter.face(id, d),
    };
  }
  get mac() { return this.actor('mac'); }
  walkTo(x: number, y: number) { return this.presenter.walk('mac', [x, y]); }
  face(dir: Dir) { this.presenter.face('mac', dir); }
  wait(ms: number) { return this.presenter.wait(ms); }
  shake() { this.presenter.shake(); }
  refresh() { this.presenter.refresh(); }
  now() { return this.presenter.now(); }
  async toTitle() { this.state.flags.gameOver = true; await this.presenter.toTitle(); }
  fx(name: string, ...args: any[]) { return this.presenter.fx(name, args); }
  card(lines: string[], ms = 3500) { return this.presenter.card(lines, ms); }
  choose(options: { id: string; text: string }[]) { return this.presenter.choose(options); }

  async goto(roomId: string, at?: Pt, face?: Dir) {
    const from = this.state.room;
    const room = this.content.rooms[roomId];
    if (!room) throw new Error(`Unknown room: ${roomId}`);
    this.state.room = roomId;
    const p = at ?? room.start ?? [160, 120];
    this.state.mac = { x: p[0], y: p[1], dir: face ?? room.startFace ?? 'front' };
    this.log.push(`ROOM ${roomId}`);
    await this.presenter.enterRoom(room, p, this.state.mac.dir);
    if (room.enter) await room.enter(this, from);
  }

  // ---- dialogue ----------------------------------------------------------------
  async talk(dialogueId: string) {
    const d = this.content.dialogues[dialogueId];
    if (!d) throw new Error(`Unknown dialogue: ${dialogueId}`);
    if (d.start) await d.start(this);
    for (let guard = 0; guard < 200; guard++) {
      const opts = d.options.filter((o) => (!o.when || o.when(this)) && !(o.once && this.flag(`dlg:${d.id}:${o.id}`)));
      if (!opts.length) return;
      const text = (o: (typeof opts)[number]) => (typeof o.text === 'function' ? o.text(this) : o.text);
      const pick = await this.choose(opts.map((o) => ({ id: o.id, text: text(o) })));
      const opt = opts.find((o) => o.id === pick)!;
      if (opt.once) this.state.flags[`dlg:${d.id}:${opt.id}`] = true;
      if (opt.say !== false) await this.say(text(opt));
      const r = opt.run ? await opt.run(this) : undefined;
      if (r === 'end' || opt.end) return;
    }
  }

  // ---- code review ----------------------------------------------------------------
  async duel(id: string): Promise<boolean> {
    const def = this.content.duels[id];
    const won = await runReview(this, def);
    if (this.content.afterDuel) await this.content.afterDuel(this, def, won);
    return won;
  }

  // ---- verbs -------------------------------------------------------------------
  hotspot(id: string): Hotspot | undefined {
    return this.room.hotspots.find((h) => h.id === id);
  }
  nameOf(t: Target): string {
    if (t.kind === 'item') {
      const it = this.content.items[t.id];
      return typeof it.name === 'function' ? it.name(this) : it.name;
    }
    const h = this.hotspot(t.id);
    if (!h) return '';
    return typeof h.name === 'function' ? h.name(this) : h.name;
  }

  async run(h: Handler | undefined): Promise<boolean> {
    if (h === undefined) return false;
    if (typeof h === 'string' || Array.isArray(h)) await this.say(h);
    else await h(this);
    return true;
  }

  private async refuse(needed: Role, custom?: string) {
    await this.say(custom ?? refusal(this.state.role, needed, this.refusals++));
  }

  private roleFor(roles: Hotspot['roles'], verb: Verb): Role | undefined {
    if (!roles) return undefined;
    return roles[verb] ?? roles['*'];
  }

  private async fallback(verb: Verb, name: string) {
    const lines = this.content.fallback[verb] ?? this.content.fallback.look ?? ['Hmm.'];
    const line = lines[this.fallbackN++ % lines.length].replace('{name}', name.toLowerCase());
    await this.say(line);
  }

  private async approach(h: Hotspot) {
    if (h.noWalk) return;
    const me = this.presenter.actorPos('mac');
    if (!me || !me.visible) return;
    let wp: Pt | undefined = typeof h.walkTo === 'function' ? h.walkTo(this) : h.walkTo;
    if (!wp && h.actor) {
      const a = this.presenter.actorPos(h.actor);
      if (a) wp = [a.x + (this.state.mac.x < a.x ? -26 : 26), a.y];
    }
    if (!wp && h.rect) wp = [h.rect[0] + h.rect[2] / 2, h.rect[1] + h.rect[3] + 4];
    if (wp) {
      this.approaching = true;
      await this.presenter.walk('mac', wp);
      this.approaching = false;
      if (this.cancelled) throw new Cancelled();
    }
    if (h.face) this.presenter.face('mac', h.face);
    else if (h.actor) {
      const a = this.presenter.actorPos(h.actor);
      const m = this.presenter.actorPos('mac');
      if (a && m) this.presenter.face('mac', a.x < m.x ? 'left' : 'right');
    }
  }

  private approaching = false;
  private cancelled = false;
  private current: Promise<void> | null = null;

  /** Execute a full sentence ("Use duck with crab"). Safe to call from UI or tests. */
  perform(verb: Verb, a: Target, b?: Target): Promise<void> {
    if (this.busy) return Promise.resolve();
    this.busy = true;
    this.cancelled = false;
    this.current = (async () => {
      try {
        await this.performInner(verb, a, b);
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e;
      } finally {
        this.busy = false;
        this.approaching = false;
        this.presenter.saved(this.state);
      }
    })();
    return this.current;
  }

  /** True while Mac is only walking toward the target (a new click may cancel). */
  canInterrupt() { return this.busy && this.approaching; }

  async interrupt() {
    if (!this.canInterrupt()) return;
    this.cancelled = true;
    this.presenter.stop('mac');
    await this.current;
  }

  private async performInner(verb: Verb, a: Target, b?: Target) {
    this.log.push(`> ${verb} ${a.kind}:${a.id}${b ? ` ${b.kind}:${b.id}` : ''}`);
    const icpt = this.room.intercept?.(this, verb, b ?? a);
    if (icpt !== undefined) { await this.run(icpt); return; }
    // Inventory item as primary object
    if (a.kind === 'item') {
      const item = this.content.items[a.id];
      if (!item) return;
      const needed = this.roleFor(item.roles, verb);
      if ((verb === 'use' || verb === 'give') && b) {
        if (b.kind === 'item') {
          const other = this.content.items[b.id];
          const h = item.combine?.[b.id] ?? other?.combine?.[a.id];
          if (needed && !this.atLeast(needed)) return this.refuse(needed, item.roleRefusal);
          if (await this.run(h)) return;
          return this.say(this.random(this.content.fallback.combine ?? ["I can't use those together."]));
        }
        const hs = this.hotspot(b.id);
        if (!hs) return;
        await this.approach(hs);
        const hNeed = this.roleFor(hs.roles, verb);
        if (hNeed && !this.atLeast(hNeed)) return this.refuse(hNeed, hs.roleRefusal);
        if (needed && !this.atLeast(needed)) return this.refuse(needed, item.roleRefusal);
        const handler = verb === 'give' ? hs.giveItem?.[a.id] : hs.useItem?.[a.id];
        if (await this.run(handler)) return;
        if (hs.anyItem) return void (await hs.anyItem(this, a.id, verb));
        return this.fallback(verb === 'give' ? 'give' : 'use', this.nameOf(b));
      }
      if (needed && !this.atLeast(needed)) return this.refuse(needed, item.roleRefusal);
      const handler: Handler | undefined =
        verb === 'look' ? item.look : verb === 'use' ? item.use : verb === 'open' ? item.open :
        verb === 'close' ? item.close : verb === 'push' ? item.push : verb === 'pull' ? item.pull :
        verb === 'talk' ? item.talk : verb === 'pickup' ? (item.pickup ?? 'I already have it.') : undefined;
      if (await this.run(handler)) return;
      return this.fallback(verb, this.nameOf(a));
    }

    const h = this.hotspot(a.id);
    if (!h || (h.when && !h.when(this))) return;

    if (verb === 'walk') {
      await this.approach(h);
      const needed = this.roleFor(h.roles, 'walk');
      if (needed && !this.atLeast(needed)) return this.refuse(needed, h.roleRefusal);
      if (h.walk) { await this.run(h.walk); return; }
      if (h.exit) await this.goto(h.exit.to, h.exit.at, h.exit.face);
      return;
    }

    await this.approach(h);
    const needed = this.roleFor(h.roles, verb);
    if (needed && !this.atLeast(needed)) return this.refuse(needed, h.roleRefusal);
    const handler = (h as any)[verb] as Handler | undefined;
    if (await this.run(handler)) return;
    if (h.exit && (verb === 'open' || verb === 'use')) {
      await this.goto(h.exit.to, h.exit.at, h.exit.face);
      return;
    }
    return this.fallback(verb, this.nameOf(a));
  }

  /** Default verb for right-click / quick tap. */
  defaultVerb(t: Target): Verb {
    if (t.kind === 'item') return 'look';
    const h = this.hotspot(t.id);
    if (!h) return 'walk';
    if (h.defaultVerb) return h.defaultVerb;
    if (h.exit) return 'walk';
    if (h.actor) return 'talk';
    return 'look';
  }

  visibleHotspots(): Hotspot[] {
    return this.room.hotspots.filter((h) => !h.when || h.when(this));
  }
}
