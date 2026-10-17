// Browser presenter: main loop, rendering, SCUMM-style UI and input.
import { Bitmap, Painter, ditherMix, makeBitmap, outline } from './paint';
import type { Pt } from './paint';
import { C } from './palette';
import { drawCentered, drawText, drawTextOutlined, LINE_H, textWidth, wrap } from './font';
import { WalkMap } from './walk';
import { hotspotAt } from './hit';
import { fullscreenSupported, isFullscreen, onFullscreenChange, toggleFullscreen } from './fullscreen';
import { SpriteCache } from './sprite';
import { GameCore, newState, type Content, type Presenter, type Target } from './core';
import type { CharacterDef, Dir, ItemDef, Role, RoomDef, SaveState, Verb } from './types';
import { ROLE_EXPLAIN, ROLE_LABEL } from './roles';
import { loadSave, loadSettings, saveSettings, writeSave, hasSave, type Settings } from './save';
import { GameAudio, voiceKey } from './audio';

const W = 320, H = 200, ROOM_H = 144;

const VERBS: { v: Verb; label: string }[] = [
  { v: 'give', label: 'Give' }, { v: 'pickup', label: 'Pick up' }, { v: 'use', label: 'Use' },
  { v: 'open', label: 'Open' }, { v: 'look', label: 'Look at' }, { v: 'push', label: 'Push' },
  { v: 'close', label: 'Close' }, { v: 'talk', label: 'Talk to' }, { v: 'pull', label: 'Pull' },
];
const VERB_LABEL: Record<Verb, string> = {
  walk: 'Walk to', give: 'Give', pickup: 'Pick up', use: 'Use', open: 'Open', look: 'Look at',
  push: 'Push', close: 'Close', talk: 'Talk to', pull: 'Pull',
};

const INV_X = 162, INV_Y = 156, INV_COLS = 4, INV_ROWS = 2, CELL_W = 31, CELL_H = 21;

interface ActorRT {
  id: string;
  def: CharacterDef;
  x: number;
  y: number;
  dir: Dir;
  visible: boolean;
  path: Pt[];
  arrive?: () => void;
  dist: number;
  gesture?: string;
  talking: boolean;
  scripted: boolean;
}

interface Speech { actor: string; lines: string[]; color: number; until: number; resolve: () => void; }
interface Choice { options: { id: string; text: string; lines: string[] }[]; resolve: (id: string) => void; scroll: number; }
interface Btn { x: number; y: number; w: number; h: number; label: string; act: () => void; }

export class BrowserGame implements Presenter {
  ctx: CanvasRenderingContext2D;
  img: ImageData;
  screen = new Bitmap(W, H);
  p = new Painter(this.screen);
  core!: GameCore;

  bg: Bitmap | null = null;
  fg: Bitmap | null = null;
  bgKey = '';
  walkMap: WalkMap | null = null;
  walkKey = '';
  camX = 0;
  actors = new Map<string, ActorRT>();
  sprites = new SpriteCache();
  iconCache = new Map<string, Bitmap>();

  verb: Verb = 'walk';
  pending: string | null = null;
  hover: Target | null = null;
  mouse = { x: 160, y: 100, inside: false, touch: false };
  invScroll = 0;
  invTab: 'bag' | 'tools' = 'bag';
  speech: Speech | null = null;
  narration: Speech | null = null;
  choice: Choice | null = null;
  choiceHover = -1;
  banner: { title: string; sub: string; until: number; resolve: () => void } | null = null;
  cardState: { lines: string[]; until: number; resolve: () => void } | null = null;
  toast: { text: string; until: number } | null = null;
  fade = 0;
  shakeUntil = 0;
  menu: null | 'main' | 'save' | 'load' = null;
  menuBtns: Btn[] = [];
  title = true;
  titleBtns: Btn[] = [];
  time = 0;
  last = 0;
  dirty = true;
  lastSentence = '';
  settings: Settings = loadSettings();
  audio = new GameAudio();
  debug = false;
  longPress: number | null = null;
  // touch zoom: pinch to zoom, two-finger drag to pan, two-finger tap to toggle
  zoom = 1;
  pan = { x: 0, y: 0 };
  touches = new Map<number, { x: number; y: number }>();
  pinch: { d0: number; z0: number; qx: number; qy: number; mx: number; my: number; t0: number; moved: boolean } | null = null;
  gestured = false;
  zoomHinted = false;
  invFlash = 0;
  roomEntered = false;

  constructor(public canvas: HTMLCanvasElement, public content: Content) {
    this.ctx = canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(W, H);
    this.debug = new URLSearchParams(location.search).has('debug');
    this.audio.setVolumes(this.settings.speechVolume, this.settings.musicVolume);
    this.bindInput();
    this.resize();
    addEventListener('resize', () => this.resize());
    onFullscreenChange(() => this.resize());
    requestAnimationFrame((t) => this.frame(t));
    (window as any).mz = this;
  }

  // =========================================================== lifecycle
  async newGame() {
    this.title = false;
    this.audio.setMusic(null);
    this.core = new GameCore(this.content, this, false, newState(this.content));
    this.actors.clear();
    const room = this.content.rooms[this.core.state.room];
    this.core.busy = true;
    try {
      await this.core.goto(room.id, room.start, room.startFace);
    } finally { this.core.busy = false; }
  }

  async continueGame(slot = 'auto') {
    const st = loadSave(slot);
    if (!st) return this.newGame();
    this.title = false;
    this.core = new GameCore(this.content, this, false, st);
    this.actors.clear();
    const room = this.content.rooms[st.room];
    await this.enterRoom(room, [st.mac.x, st.mac.y], st.mac.dir);
  }

  resize() {
    const margin = innerWidth > 700 && innerHeight > 500 && !isFullscreen() ? 24 : 0;
    const s = Math.min((innerWidth - margin) / W, (innerHeight - margin) / H);
    // Whole-number scaling keeps pixels perfectly square, unless it would waste lots of screen.
    const scale = Math.floor(s) >= 1 && Math.floor(s) / s > 0.8 ? Math.floor(s) : s;
    this.canvas.style.width = `${Math.floor(W * scale)}px`;
    this.canvas.style.height = `${Math.floor(H * scale)}px`;
    this.applyZoom();
  }

  /** Zoom and pan the canvas with a CSS transform, kept so the screen is always covered. */
  private applyZoom() {
    const cw = this.canvas.offsetWidth * this.zoom, ch = this.canvas.offsetHeight * this.zoom;
    const clamp = (v: number, size: number, view: number) => {
      if (size <= view) return 0;
      const lim = (size - view) / 2;
      return Math.max(-lim, Math.min(lim, v));
    };
    this.pan.x = clamp(this.pan.x, cw, innerWidth);
    this.pan.y = clamp(this.pan.y, ch, innerHeight);
    this.canvas.style.transform = this.zoom === 1 ? '' : `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
  }

  private setZoom(z: number, mx: number, my: number, qx: number, qy: number) {
    this.zoom = Math.max(1, Math.min(4, z));
    // keep the content point (qx, qy) under the fingers at (mx, my)
    this.pan.x = mx - innerWidth / 2 - this.zoom * qx;
    this.pan.y = my - innerHeight / 2 - this.zoom * qy;
    if (this.zoom === 1) { this.pan.x = 0; this.pan.y = 0; }
    this.applyZoom();
  }

  private pinchPoints() {
    const [a, b] = [...this.touches.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }

  private startPinch() {
    if (this.longPress !== null) { clearTimeout(this.longPress); this.longPress = null; }
    this.gestured = true;
    const { d, mx, my } = this.pinchPoints();
    this.pinch = {
      d0: Math.max(1, d), z0: this.zoom, mx, my, t0: performance.now(), moved: false,
      qx: (mx - innerWidth / 2 - this.pan.x) / this.zoom,
      qy: (my - innerHeight / 2 - this.pan.y) / this.zoom,
    };
  }

  private movePinch() {
    const pc = this.pinch!;
    const { d, mx, my } = this.pinchPoints();
    if (Math.abs(d - pc.d0) > 12 || Math.hypot(mx - pc.mx, my - pc.my) > 12) pc.moved = true;
    if (pc.moved) this.setZoom(pc.z0 * (d / pc.d0), mx, my, pc.qx, pc.qy);
  }

  private endPinch() {
    const pc = this.pinch!;
    this.pinch = null;
    if (!pc.moved && performance.now() - pc.t0 < 300) {
      // two-finger tap: zoom in 2x there, or back out to fit
      if (this.zoom > 1) this.setZoom(1, 0, 0, 0, 0);
      else this.setZoom(2, pc.mx, pc.my, pc.qx, pc.qy);
    } else if (this.zoom < 1.08) this.setZoom(1, 0, 0, 0, 0);
  }

  // =========================================================== Presenter
  speak(actor: string, text: string): Promise<void> {
    return new Promise((resolve) => {
      const a = this.actors.get(actor);
      const def = this.content.characters[actor];
      const color = def ? C[def.color] : C.white;
      const lines = wrap(text, actor === 'mac' || a ? 180 : 280);
      const ms = (900 + text.length * 55) / this.settings.textSpeed;
      if (a) a.talking = true;
      const sp = {
        actor, lines, color, until: this.time + ms,
        resolve: () => { if (a) a.talking = false; if (this.speech === sp) this.audio.stopVoice(); this.speech = null; resolve(); },
      };
      this.speech = sp;
      // once the Grand Maintainer switches voices on, a line with a recorded clip lasts as long as the clip
      const key = voiceKey(actor, text);
      if (this.core?.flag('voicesOn') && this.audio.hasVoice(key)) {
        sp.until = this.time + ms + 8000; // cap, in case the clip never loads
        this.audio.playVoice(key, () => this.speech === sp).then((len) => {
          if (this.speech === sp) sp.until = this.time + (len === null ? ms : len + 250);
        });
      }
    });
  }

  narrate(text: string): Promise<void> {
    return new Promise((resolve) => {
      const ms = (1400 + text.length * 50) / this.settings.textSpeed;
      this.narration = { actor: '', lines: wrap(text, 280), color: C.white, until: this.time + ms, resolve: () => { this.narration = null; resolve(); } };
    });
  }

  walk(id: string, to: Pt): Promise<void> {
    const a = this.actors.get(id);
    if (!a || !this.walkMap) return Promise.resolve();
    a.arrive?.();
    const path = id === 'mac' || !a.scripted ? this.walkMap.path([a.x, a.y], to) : [to];
    a.path = path;
    return new Promise((resolve) => { a.arrive = () => { a.arrive = undefined; resolve(); }; });
  }

  stop(id: string) {
    const a = this.actors.get(id);
    if (!a) return;
    a.path = [];
    a.dist = 0;
    a.arrive?.();
  }

  face(id: string, dir: Dir) {
    const a = this.actors.get(id);
    if (a) a.dir = dir;
  }

  wait(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  choose(options: { id: string; text: string }[]): Promise<string> {
    return new Promise((resolve) => {
      this.choice = {
        options: options.map((o) => ({ ...o, lines: wrap(o.text, 300) })),
        scroll: 0,
        resolve: (id) => { this.choice = null; resolve(id); },
      };
    });
  }

  async enterRoom(room: RoomDef, at: Pt, face: Dir) {
    if (this.roomEntered) await this.fadeTo(1, 220);
    this.roomEntered = true;
    this.bg = null; this.bgKey = ''; this.walkMap = null; this.walkKey = '';
    const mac = this.actors.get('mac');
    for (const id of [...this.actors.keys()]) if (id !== 'mac') this.actors.delete(id);
    if (!room.noMac) {
      const def = this.content.characters.mac;
      if (mac) { mac.x = at[0]; mac.y = at[1]; mac.dir = face; mac.path = []; mac.visible = true; mac.arrive?.(); }
      else this.actors.set('mac', this.mkActor(def, at[0], at[1], face));
    } else this.actors.delete('mac');
    this.syncRoom(true);
    this.updateCamera(true);
    this.speech = null;
    this.roomMusic();
    await this.fadeTo(0, 220);
  }

  async roleGranted(role: Role) {
    await new Promise<void>((resolve) => {
      this.banner = {
        title: `ROLE GRANTED: ${ROLE_LABEL[role].toUpperCase()}`,
        sub: ROLE_EXPLAIN[role],
        until: this.time + 5200 / this.settings.textSpeed,
        resolve: () => { this.banner = null; resolve(); },
      };
    });
  }

  itemGained(item: ItemDef) {
    const name = typeof item.name === 'function' ? item.name(this.core) : item.name;
    this.toast = { text: `${item.tool ? 'Tool card added to the Tool API Belt' : 'Picked up'}: ${name}`, until: this.time + 2200 };
    this.invFlash = this.time + 900;
    if (item.tool) this.invTab = 'tools';
    else this.invTab = 'bag';
    const list = this.invList();
    const idx = list.indexOf(item.id);
    if (idx >= 0) this.invScroll = Math.max(0, Math.floor(idx / INV_COLS) - (INV_ROWS - 1));
  }

  async fx(name: string, args: any[]) {
    if (this.core?.headless) return;
    switch (name) {
      case 'fadeOut': return this.fadeTo(1, args[0] ?? 400);
      case 'fadeIn': return this.fadeTo(0, args[0] ?? 400);
      case 'flash': this.flashUntil = this.time + (args[0] ?? 200); return;
      case 'music': this.roomMusic(); return;
      case 'patch': this.patch = args[0] ?? null; return;
    }
  }

  /** Each area has its own track, once text-to-music has been switched on in the story. */
  private roomMusic() {
    if (!this.core?.flag('musicOn')) return;
    const track = this.content.music?.[this.core.state.room];
    if (track) this.audio.setMusic(track);
  }
  flashUntil = 0;
  /** The patch under review, kept on screen while Mac picks his comment: a title, then code. */
  patch: string[] | null = null;

  card(lines: string[], ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.cardState = { lines, until: this.time + ms, resolve: () => { this.cardState = null; resolve(); } };
    });
  }

  shake() { this.shakeUntil = this.time + 450; }
  now() { return this.time; }
  async toTitle() { this.title = true; this.audio.setMusic(null); }
  refresh() { this.dirty = true; }

  actorPos(id: string) {
    const a = this.actors.get(id);
    return a ? { x: a.x, y: a.y, dir: a.dir, visible: a.visible } : null;
  }

  setActor(id: string, patch: Partial<{ x: number; y: number; dir: Dir; visible: boolean; gesture: string | undefined }>) {
    let a = this.actors.get(id);
    if (!a) {
      const def = this.content.characters[id];
      if (!def) return;
      a = this.mkActor(def, patch.x ?? 160, patch.y ?? 120, patch.dir ?? 'front');
      a.scripted = true;
      this.actors.set(id, a);
    }
    Object.assign(a, patch);
    if ('gesture' in patch) a.gesture = patch.gesture;
  }

  saved(state: SaveState) {
    const mac = this.actors.get('mac');
    if (mac) state.mac = { x: Math.round(mac.x), y: Math.round(mac.y), dir: mac.dir };
    writeSave('auto', state);
  }

  // =========================================================== helpers
  private mkActor(def: CharacterDef, x: number, y: number, dir: Dir): ActorRT {
    return { id: def.id, def, x, y, dir, visible: true, path: [], dist: 0, talking: false, scripted: false };
  }

  private fadeTo(target: number, ms: number): Promise<void> {
    const start = this.fade, t0 = performance.now();
    return new Promise((resolve) => {
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        this.fade = start + (target - start) * k;
        if (k < 1) requestAnimationFrame(step); else resolve();
      };
      step();
    });
  }

  private roomScale(room: RoomDef, y: number): number {
    const s = room.scale;
    if (!s) return 1;
    const [y0, s0, y1, s1] = s;
    const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
    return s0 + (s1 - s0) * t;
  }

  /** Re-evaluate background, walk area and NPC presence after state changes. */
  private syncRoom(force = false) {
    if (!this.core) return;
    const room = this.core.room;
    const key = room.id + '|' + (room.bgKey ? room.bgKey(this.core) : '');
    if (force || key !== this.bgKey || !this.bg) {
      this.bgKey = key;
      const w = room.width ?? W;
      this.bg = new Bitmap(w, ROOM_H);
      room.paint(new Painter(this.bg), this.core);
      if (room.front) {
        this.fg = new Bitmap(w, ROOM_H);
        room.front(new Painter(this.fg), this.core);
      } else this.fg = null;
    }
    const polys = typeof room.walk === 'function' ? room.walk(this.core) : room.walk;
    const wk = room.id + JSON.stringify(polys);
    if (force || wk !== this.walkKey) {
      this.walkKey = wk;
      this.walkMap = new WalkMap(room.width ?? W, ROOM_H, polys);
    }
    for (const n of room.npcs ?? []) {
      const present = !n.when || n.when(this.core);
      const a = this.actors.get(n.id);
      if (present && !a) {
        const def = this.content.characters[n.id];
        if (def) this.actors.set(n.id, this.mkActor(def, n.at[0], n.at[1], n.face ?? 'front'));
      } else if (!present && a && !a.scripted) this.actors.delete(n.id);
    }
    this.dirty = false;
  }

  private updateCamera(snap = false) {
    const room = this.core.room;
    const w = room.width ?? W;
    if (w <= W) { this.camX = 0; return; }
    const mac = this.actors.get('mac');
    const centre = (mac ? mac.x : w / 2) - W / 2;
    // Mac may roam 40px either side of centre before the camera follows. The slack is applied
    // before clamping to the room, so near an edge the camera still goes all the way to it.
    const lo = Math.max(0, Math.min(w - W, centre - 40)), hi = Math.max(0, Math.min(w - W, centre + 40));
    const target = snap ? Math.max(0, Math.min(w - W, centre)) : Math.max(lo, Math.min(hi, this.camX));
    if (snap) this.camX = target;
    else {
      const d = target - this.camX;
      this.camX += Math.sign(d) * Math.min(Math.abs(d), 4);
    }
    this.camX = Math.round(this.camX);
  }

  invList(): string[] {
    if (!this.core) return [];
    return this.core.state.inv.filter((id) => !!this.content.items[id]?.tool === (this.invTab === 'tools'));
  }

  private hasTools(): boolean {
    return !!this.core?.state.inv.some((id) => this.content.items[id]?.tool);
  }

  private icon(id: string): Bitmap {
    let b = this.iconCache.get(id);
    if (!b) {
      const it = this.content.items[id];
      b = makeBitmap(28, 19, (p) => it.icon(p, this.core), C.ink);
      this.iconCache.set(id, b);
    }
    return b;
  }

  // =========================================================== frame
  private frame(now: number) {
    const dt = Math.min(50, now - (this.last || now));
    this.last = now;
    this.time += dt;
    if (this.core) this.core.state.playMs += dt;
    try {
      if (!this.title && this.core) this.update(dt);
      this.render();
    } catch (e) {
      console.error(e);
    }
    requestAnimationFrame((t) => this.frame(t));
  }

  private update(dt: number) {
    if (this.dirty) this.syncRoom();
    const room = this.core.room;
    for (const a of this.actors.values()) {
      if (!a.path.length) continue;
      const [tx, ty] = a.path[0];
      const dx = tx - a.x, dy = ty - a.y;
      const d = Math.hypot(dx, dy);
      const sc = this.roomScale(room, a.y) * (a.id === 'mac' ? room.macScale ?? 1 : 1);
      const step = ((a.def.speed ?? 60) * sc * dt) / 1000;
      if (Math.abs(dx) > Math.abs(dy) * 0.9) a.dir = dx < 0 ? 'left' : 'right';
      else a.dir = dy < 0 ? 'back' : 'front';
      if (d <= step) {
        a.x = tx; a.y = ty; a.path.shift();
        if (!a.path.length) { a.dist = 0; a.arrive?.(); }
      } else {
        a.x += (dx / d) * step; a.y += (dy / d) * step;
        a.dist += step / Math.max(0.3, sc);
      }
    }
    this.updateCamera();
    if (this.speech && this.time > this.speech.until) this.speech.resolve();
    if (this.narration && this.time > this.narration.until) this.narration.resolve();
    if (this.banner && this.time > this.banner.until) this.banner.resolve();
    if (this.cardState && this.time > this.cardState.until) this.cardState.resolve();
    if (this.toast && this.time > this.toast.until) this.toast = null;
    this.hover = this.pick();
  }

  // =========================================================== render
  private render() {
    const p = this.p;
    p.resetClip(); p.ox = 0; p.oy = 0;
    if (this.title) { this.renderTitle(); this.renderCursor(); this.blitToCanvas(); return; }
    if (!this.core) return;
    if (this.cardState) {
      this.renderCard();
      this.renderCursor();
      this.blitToCanvas();
      return;
    }
    const room = this.core.room;
    const sx = this.time < this.shakeUntil ? Math.round(Math.sin(this.time / 20) * 2) : 0;
    p.setClip(0, 0, W, ROOM_H);
    p.rect(0, 0, W, ROOM_H, C.black);
    p.ox = -this.camX + sx;
    if (this.bg) p.blit(this.bg, 0, 0);
    room.anim?.(p, this.core, this.time);
    const sorted = [...this.actors.values()].filter((a) => a.visible).sort((a, b) => a.y - b.y);
    for (const a of sorted) this.drawActor(a);
    if (this.fg) p.blit(this.fg, 0, 0);
    room.animFront?.(p, this.core, this.time);
    if (this.debugOverlay) this.drawDebug();
    p.ox = 0;
    if (this.fade > 0) {
      const d = this.screen.data;
      for (let y = 0; y < ROOM_H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        d[i] = ditherMix(x, y, d[i], C.black, this.fade);
      }
    }
    if (this.time < this.flashUntil) p.rect(0, 0, W, ROOM_H, [C.white, 0]);
    this.renderSpeech();
    this.renderPatch();
    this.renderNarration();
    this.renderToast();
    this.renderMenuButton();
    p.resetClip();
    this.renderPanel();
    if (this.banner) this.renderBanner();
    if (this.menu) this.renderMenu();
    this.renderCursor();
    this.blitToCanvas();
  }

  private drawActor(a: ActorRT) {
    const room = this.core.room;
    const sc = this.roomScale(room, a.y) * (a.id === 'mac' ? room.macScale ?? 1 : 1);
    const walking = a.path.length > 0;
    const pose = {
      dir: a.dir,
      walk: walking ? Math.floor(a.dist / 6) % 4 : -1,
      talk: a.talking && Math.floor(this.time / 130) % 2 === 0,
      t: this.time + a.id.length * 777,
      gesture: a.gesture,
    };
    const bmp = this.sprites.get(a.def, pose);
    const w = bmp.w * sc, h = bmp.h * sc;
    this.p.blit(bmp, Math.round(a.x - w / 2), Math.round(a.y - h + 1), { scale: sc, flip: a.dir === 'left' });
  }

  private headTop(a: ActorRT): number {
    const room = this.core.room;
    const sc = this.roomScale(room, a.y) * (a.id === 'mac' ? room.macScale ?? 1 : 1);
    return a.y - a.def.h * sc - (a.def.talkY ?? 0);
  }

  private renderSpeech() {
    const s = this.speech;
    if (!s) return;
    const a = this.actors.get(s.actor);
    const p = this.p;
    p.setClip(0, 0, W, ROOM_H);
    const h = s.lines.length * LINE_H;
    let cx: number, top: number;
    if (a && a.visible) {
      cx = a.x - this.camX;
      top = Math.round(this.headTop(a) - h - 2);
    } else {
      cx = W / 2; top = 6;
    }
    const maxW = Math.max(...s.lines.map(textWidth));
    cx = Math.max(maxW / 2 + 3, Math.min(W - maxW / 2 - 3, cx));
    top = Math.max(3, Math.min(ROOM_H - h - 2, top));
    if (!a || !a.visible) {
      // off-screen voice (radio, Slack, ...) gets a little name tag
      const def = this.content.characters[s.actor];
      if (def && s.actor !== 'mac') {
        drawTextOutlined(p, def.name + ':', Math.round(cx - textWidth(def.name + ':') / 2), top, C.brandbluelight, C.black);
        top += LINE_H;
      }
    }
    drawCentered(p, s.lines, cx, top, s.color, C.black);
  }

  private renderNarration() {
    const n = this.narration;
    if (!n) return;
    const p = this.p;
    const h = n.lines.length * LINE_H + 8;
    const w = Math.max(...n.lines.map(textWidth)) + 14;
    const x = Math.round((W - w) / 2), y = 6;
    p.rect(x + 2, y + 2, w, h, C.brandblue);
    p.rect(x, y, w, h, C.brandink);
    p.frame(x, y, w, h, C.brandmist);
    drawCentered(p, n.lines, W / 2, y + 5, C.brandpaper);
  }

  private renderPatch() {
    const lines = this.patch;
    if (!lines) return;
    const p = this.p;
    const x = 8, y = 16, w = W - 16, h = lines.length * LINE_H + 10; // below the menu button
    p.rect(x + 2, y + 2, w, h, C.brandblue);
    p.rect(x, y, w, h, C.brandink);
    p.frame(x, y, w, h, C.brandmist);
    lines.forEach((l, i) => {
      const comment = /^\s*(\/\/|#|\{#)/.test(l);
      drawText(p, l, x + 6, y + 5 + i * LINE_H + (i ? 2 : 0), i === 0 ? C.brandbluelight : comment ? C.gray : C.brandpaper);
    });
    p.hline(x + 4, x + w - 5, y + LINE_H + 4, C.brandslate);
  }

  private renderToast() {
    if (!this.toast) return;
    const p = this.p;
    const w = textWidth(this.toast.text) + 10;
    const x = Math.round((W - w) / 2), y = ROOM_H - 16;
    p.rect(x + 2, y + 2, w, 12, C.brandpink);
    p.rect(x, y, w, 12, C.brandpaper);
    p.frame(x, y, w, 12, C.brandink);
    drawText(p, this.toast.text, x + 5, y + 3, C.brandink);
  }

  private renderMenuButton() {
    const p = this.p;
    const x = W - 14, y = 2;
    const hot = this.inRect(x, y, 12, 10);
    p.rect(x, y, 12, 10, hot ? C.brandblue : [C.brandink, 0]);
    for (let i = 0; i < 3; i++) p.hline(x + 3, x + 8, y + 2 + i * 3, C.brandpaper);
  }

  private renderBanner() {
    const b = this.banner!;
    const p = this.p;
    const sub = wrap(b.sub, 260);
    const h = 26 + sub.length * LINE_H;
    const y = Math.round((ROOM_H - h) / 2);
    p.rect(12 + 3, y + 3, W - 24, h, C.brandblue);
    p.rect(12, y, W - 24, h, C.brandpink);
    p.frame(12, y, W - 24, h, C.brandink);
    const t = `★ ${b.title} ★`;
    drawTextOutlined(p, t, Math.round((W - textWidth(t)) / 2), y + 6, C.white, C.brandink);
    drawCentered(p, sub, W / 2, y + 20, C.brandpaper);
  }

  private renderCard() {
    const p = this.p;
    p.rect(0, 0, W, H, C.brandink);
    for (let y = 4; y < H; y += 8) for (let x = 4; x < W; x += 8) p.px(x, y, C.darkgray);
    const lines = this.cardState!.lines.flatMap((l) => wrap(l, 280));
    const h = lines.length * LINE_H;
    let y = Math.round((H - h) / 2);
    lines.forEach((l, i) => {
      const c = i === 0 ? C.brandpink : C.brandpaper;
      drawText(p, l, Math.round((W - textWidth(l)) / 2), y + i * LINE_H, c);
    });
  }

  // ---- bottom panel ----------------------------------------------------------------
  private renderPanel() {
    const p = this.p;
    p.rect(0, ROOM_H, W, H - ROOM_H, C.brandink);
    p.hline(0, W - 1, ROOM_H, C.brandslate);
    if (this.choice) { this.renderChoice(); return; }
    // sentence line
    const sentence = this.sentence();
    if (!this.core.busy) this.lastSentence = sentence;
    const st = this.core.busy ? this.lastSentence : sentence;
    drawText(p, st, Math.round(124 - textWidth(st) / 2), ROOM_H + 3, C.brandbluelight);
    // role badge
    const role = ROLE_LABEL[this.core.role];
    const rw = textWidth(role) + 6;
    p.rect(W - rw - 2, ROOM_H + 2, rw, 10, C.brandpink);
    drawText(p, role, W - rw + 1, ROOM_H + 3, C.white);
    // verbs
    const dv = this.hover && !this.core.busy ? this.core.defaultVerb(this.hover) : null;
    VERBS.forEach((vb, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 4 + col * 52, y = INV_Y + row * 14;
      const hot = this.inRect(x, y, 50, 13) && !this.menu;
      const sel = this.verb === vb.v;
      let c = C.brandslate;
      if (dv === vb.v) c = C.brandmist;
      if (sel) c = C.white;
      if (hot) c = C.brandbluelight;
      if (this.core.busy) c = C.darkgray;
      if (sel && !this.core.busy) p.rect(x, y, 50, 13, C.brandblue);
      drawText(p, vb.label, Math.round(x + 25 - textWidth(vb.label) / 2), y + 3, c);
    });
    // inventory
    const list = this.invList();
    const flash = this.time < this.invFlash && Math.floor(this.time / 120) % 2 === 0;
    p.frame(INV_X - 2, INV_Y - 2, INV_COLS * CELL_W + 3, INV_ROWS * CELL_H + 3, flash ? C.brandpink : C.darkgray);
    for (let r = 0; r < INV_ROWS; r++) for (let c = 0; c < INV_COLS; c++) {
      const idx = (this.invScroll + r) * INV_COLS + c;
      const x = INV_X + c * CELL_W, y = INV_Y + r * CELL_H;
      const id = list[idx];
      if (!id) continue;
      const hot = this.inRect(x, y, CELL_W - 1, CELL_H - 1);
      if (hot || this.pending === id) p.rect(x, y, CELL_W - 1, CELL_H - 1, this.pending === id ? C.brandblue : C.navy);
      p.blit(this.icon(id), x + 1, y + 1);
    }
    // side strip: up, tab, down
    const sx = 289;
    const canUp = this.invScroll > 0;
    const canDown = (this.invScroll + INV_ROWS) * INV_COLS < list.length;
    this.stripBtn(sx, INV_Y - 1, '▲', canUp);
    if (this.hasTools()) {
      const label = this.invTab === 'bag' ? 'API' : 'BAG';
      this.stripBtn(sx, INV_Y + 14, label, true, this.invTab === 'tools');
    }
    this.stripBtn(sx, INV_Y + 29, '▼', canDown);
  }

  private stripBtn(x: number, y: number, label: string, enabled: boolean, on = false) {
    const p = this.p;
    const hot = enabled && this.inRect(x, y, 28, 13);
    p.rect(x, y, 28, 13, on ? C.brandpink : hot ? C.brandblue : C.navy);
    drawText(p, label, Math.round(x + 14 - textWidth(label) / 2), y + 3, enabled ? C.white : C.darkgray);
  }

  private renderChoice() {
    const p = this.p;
    const ch = this.choice!;
    const rows: { idx: number; line: string; first: boolean }[] = [];
    ch.options.forEach((o, i) => o.lines.forEach((l, j) => rows.push({ idx: i, line: (j ? '  ' : '') + l, first: !j })));
    const visible = 5;
    const start = Math.min(ch.scroll, Math.max(0, rows.length - visible));
    this.choiceHover = this.choiceAt();
    for (let r = 0; r < visible && start + r < rows.length; r++) {
      const row = rows[start + r];
      const y = ROOM_H + 4 + r * LINE_H;
      drawText(p, row.line, 6, y, row.idx === this.choiceHover ? C.white : C.brandbluelight);
    }
    if (rows.length > visible) {
      this.stripBtn(W - 30, ROOM_H + 4, '▲', start > 0);
      this.stripBtn(W - 30, H - 16, '▼', start + visible < rows.length);
    }
  }

  private choiceRows() {
    const ch = this.choice!;
    const rows: { idx: number; line: string }[] = [];
    ch.options.forEach((o, i) => o.lines.forEach((l, j) => rows.push({ idx: i, line: (j ? '  ' : '') + l })));
    return rows;
  }

  /** Index of the dialogue option under the pointer, or -1. */
  private choiceAt(): number {
    if (!this.choice || !this.mouse.inside) return -1;
    const rows = this.choiceRows();
    const visible = 5;
    const start = Math.min(this.choice.scroll, Math.max(0, rows.length - visible));
    for (let r = 0; r < visible && start + r < rows.length; r++) {
      const y = ROOM_H + 4 + r * LINE_H;
      if (this.mouse.y >= y - 1 && this.mouse.y < y + LINE_H - 1 && this.mouse.x < (rows.length > visible ? W - 32 : W)) return rows[start + r].idx;
    }
    return -1;
  }

  private sentence(): string {
    const h = this.hover ? this.core.nameOf(this.hover) : '';
    if (this.pending) {
      const item = this.core.nameOf({ kind: 'item', id: this.pending });
      const pend = this.verb === 'give' ? `Give ${item} to` : `Use ${item} with`;
      return h && !(this.hover?.kind === 'item' && this.hover.id === this.pending) ? `${pend} ${h}` : pend;
    }
    if (this.verb === 'walk' && this.hover?.kind === 'item') return `Use ${h}`;
    return `${VERB_LABEL[this.verb]} ${h}`.trim();
  }

  // ---- menu ----------------------------------------------------------------------
  private renderMenu() {
    const p = this.p;
    p.rect(0, 0, W, H, [C.brandink, 0]);
    const bw = 200, bh = 150, x = (W - bw) / 2, y = (H - bh) / 2;
    p.rect(x + 4, y + 4, bw, bh, C.brandblue);
    p.rect(x, y, bw, bh, C.brandpaper);
    p.frame(x, y, bw, bh, C.brandink);
    drawText(p, 'marcus@workflows:~$ menu', x + 8, y + 7, C.brandpink);
    this.menuBtns = [];
    const add = (label: string, act: () => void) => {
      const i = this.menuBtns.length;
      this.menuBtns.push({ x: x + 20, y: y + 22 + i * 15, w: bw - 40, h: 12, label, act });
    };
    if (this.menu === 'main') {
      add('Resume', () => (this.menu = null));
      add('Save game', () => (this.menu = 'save'));
      add('Load game', () => (this.menu = 'load'));
      const sp = this.settings.textSpeed;
      add(`Text speed: ${sp < 0.9 ? 'Slow' : sp > 1.1 ? 'Fast' : 'Normal'}`, () => {
        this.settings.textSpeed = sp < 0.9 ? 1 : sp > 1.1 ? 0.7 : 1.6;
        saveSettings(this.settings);
      });
      add(`Full screen: ${isFullscreen() ? 'On' : 'Off'}  [F]`, () => this.toggleFullscreen());
      const vol = (key: 'speechVolume' | 'musicVolume', label: string) => {
        const v = this.settings[key];
        add(`${label}: ${v <= 0 ? 'Off' : `${Math.round(v * 100)}%`}`, () => {
          this.settings[key] = v >= 1 ? 0 : Math.min(1, Math.round((v + 0.25) * 4) / 4);
          this.audio.setVolumes(this.settings.speechVolume, this.settings.musicVolume);
          saveSettings(this.settings);
        });
      };
      vol('speechVolume', 'Speech volume');
      vol('musicVolume', 'Music volume');
      add('Restart', () => { this.menu = null; this.title = true; this.audio.setMusic(null); });
    } else {
      for (const slot of ['1', '2', '3']) {
        const st = loadSave(slot);
        const label = st ? `Slot ${slot}: ${this.content.rooms[st.room]?.name ?? st.room} (${ROLE_LABEL[st.role]})` : `Slot ${slot}: empty`;
        add(label, () => {
          if (this.menu === 'save') { this.saved(this.core.state); writeSave(slot, this.core.state); this.menu = null; this.toast = { text: `Saved to slot ${slot}`, until: this.time + 1500 }; }
          else if (st) { this.menu = null; this.continueGame(slot); }
        });
      }
      add('Back', () => (this.menu = 'main'));
    }
    for (const b of this.menuBtns) {
      const hot = this.inRect(b.x, b.y, b.w, b.h);
      p.rect(b.x + 2, b.y + 2, b.w, b.h, C.brandink);
      p.rect(b.x, b.y, b.w, b.h, hot ? C.brandblue : C.white);
      p.frame(b.x, b.y, b.w, b.h, C.brandink);
      drawText(p, b.label, Math.round(b.x + b.w / 2 - textWidth(b.label) / 2), b.y + 2, hot ? C.white : C.brandink);
    }
  }

  // ---- title -----------------------------------------------------------------------
  private renderTitle() {
    const p = this.p;
    p.rect(0, 0, W, H, C.brandpaper);
    for (let y = 3; y < H; y += 6) for (let x = 3; x < W; x += 6) p.px(x, y, C.brandmist);
    const prompt = 'marcus@workflows:~$ ./escape-island.sh';
    const n = Math.min(prompt.length, Math.floor(this.time / 45));
    drawText(p, prompt.slice(0, n) + (Math.floor(this.time / 400) % 2 ? '_' : ''), 12, 10, C.brandpink);
    this.bigText('Mac Packwala', 12, 26, C.brandink, 2);
    drawText(p, 'and the Curse of the Stale Cache', 14, 46, C.brandblue);
    const blurb = wrap('A point-and-click adventure about escaping a desert island with nothing but Drupal AI, a rubber duck and questionable life choices.', 170);
    blurb.forEach((l, i) => drawText(p, l, 14, 64 + i * LINE_H, C.brandslate));
    const mac = this.content.characters.mac;
    const fr = this.sprites.get(mac, { dir: 'front', walk: -1, talk: false, t: this.time });
    p.blit(fr, 236, 60, { scale: 2 });
    p.hline(200, 310, 183, C.brandmist);
    this.titleBtns = [];
    const addBtn = (label: string, y: number, act: () => void) => this.titleBtns.push({ x: 14, y, w: 120, h: 14, label, act });
    addBtn('New game', 120, () => this.newGame());
    if (hasSave('auto')) addBtn('Continue', 140, () => this.continueGame('auto'));
    for (const b of this.titleBtns) {
      const hot = this.inRect(b.x, b.y, b.w, b.h);
      p.rect(b.x + 3, b.y + 3, b.w, b.h, C.brandink);
      p.rect(b.x, b.y, b.w, b.h, hot ? C.brandblue : b.label === 'New game' ? C.brandblue : C.white);
      p.frame(b.x, b.y, b.w, b.h, C.brandink);
      const fg = hot || b.label === 'New game' ? C.white : C.brandink;
      drawText(p, b.label, Math.round(b.x + b.w / 2 - textWidth(b.label) / 2), b.y + 3, fg);
    }
    drawText(p, 'workflows-of-ai.com', 14, 188, C.brandslate);
  }

  private bigText(s: string, x: number, y: number, c: number, scale: number) {
    const b = new Bitmap(textWidth(s) + 2, 12);
    drawText(new Painter(b), s, 1, 1, c);
    this.p.blit(b, x, y, { scale });
  }

  private renderCursor() {
    if (!this.mouse.inside || this.mouse.touch) return;
    const p = this.p;
    const { x, y } = this.mouse;
    const busy = this.core?.busy && !this.title && !this.choice && !this.menu;
    const c = busy ? C.brandslate : (Math.floor(this.time / 200) % 2 ? C.white : C.brandbluelight);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      for (let i = 2; i <= 4; i++) { p.px(x + dx * i + (dy ? 1 : 0), y + dy * i + (dx ? 1 : 0), C.black); }
      for (let i = 2; i <= 4; i++) p.px(x + dx * i, y + dy * i, c);
    }
    p.px(x, y, c);
  }

  private drawDebug() {
    const p = this.p;
    if (this.walkMap) {
      const m = this.walkMap;
      for (let y = 0; y < m.h; y += 2) for (let x = (y / 2) % 2; x < m.w; x += 4) if (m.mask[y * m.w + x]) p.px(x, y, C.lime);
    }
    for (const h of this.core.visibleHotspots()) {
      if (h.rect) p.frame(h.rect[0], h.rect[1], h.rect[2], h.rect[3], C.magenta);
      if (h.poly) p.polyline(h.poly, C.magenta, true);
    }
  }

  private blitToCanvas() {
    new Uint32Array(this.img.data.buffer).set(this.screen.data);
    this.ctx.putImageData(this.img, 0, 0);
  }

  // =========================================================== picking & input
  private inRect(x: number, y: number, w: number, h: number) {
    const m = this.mouse;
    return m.inside && m.x >= x && m.y >= y && m.x < x + w && m.y < y + h;
  }

  private pick(): Target | null {
    const m = this.mouse;
    if (!m.inside || this.choice || this.menu) return null;
    if (m.y < ROOM_H) {
      const rx = m.x + this.camX, ry = m.y;
      const room = this.core.room;
      // actors first, front-most first
      const acts = [...this.actors.values()].filter((a) => a.visible && a.id !== 'mac').sort((a, b) => b.y - a.y);
      for (const a of acts) {
        const hs = room.hotspots.find((h) => h.actor === a.id && (!h.when || h.when(this.core)));
        if (!hs) continue;
        const sc = this.roomScale(room, a.y);
        const w = a.def.w * sc * 0.7, hgt = a.def.h * sc;
        if (rx >= a.x - w / 2 && rx <= a.x + w / 2 && ry >= a.y - hgt && ry <= a.y + 2) return { kind: 'hotspot', id: hs.id };
      }
      const hs = hotspotAt(this.core.visibleHotspots(), rx, ry);
      return hs ? { kind: 'hotspot', id: hs.id } : null;
    }
    const it = this.invAt(m.x, m.y);
    return it ? { kind: 'item', id: it } : null;
  }

  private invAt(x: number, y: number): string | null {
    if (x < INV_X || y < INV_Y) return null;
    const c = Math.floor((x - INV_X) / CELL_W), r = Math.floor((y - INV_Y) / CELL_H);
    if (c >= INV_COLS || r >= INV_ROWS) return null;
    return this.invList()[(this.invScroll + r) * INV_COLS + c] ?? null;
  }

  private bindInput() {
    const cv = this.canvas;
    const toLocal = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      this.mouse.x = Math.floor(((e.clientX - r.left) / r.width) * W);
      this.mouse.y = Math.floor(((e.clientY - r.top) / r.height) * H);
      this.mouse.inside = true;
      this.mouse.touch = e.pointerType === 'touch';
    };
    cv.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' && this.touches.has(e.pointerId)) {
        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pinch && this.touches.size >= 2) { this.movePinch(); return; }
        if (this.gestured) return;
      }
      toLocal(e);
    });
    cv.addEventListener('pointerleave', () => { this.mouse.inside = false; });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      toLocal(e);
      e.preventDefault();
      if (e.pointerType === 'touch') {
        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try { cv.setPointerCapture(e.pointerId); } catch { /* not supported */ }
        if (this.touches.size >= 2) { if (!this.pinch) this.startPinch(); return; }
        if (!this.zoomHinted && !this.title) {
          this.zoomHinted = true;
          this.toast = { text: 'Tip: pinch with two fingers to zoom. Two-finger tap zooms in or out.', until: this.time + 3500 };
        }
        this.hover = this.title || !this.core ? null : this.pick();
        this.longPress = window.setTimeout(() => { this.longPress = null; this.click(true); }, 550);
        return;
      }
      this.click(e.button === 2);
    });
    const endTouch = (e: PointerEvent) => {
      this.touches.delete(e.pointerId);
      if (this.pinch && this.touches.size < 2) this.endPinch();
      const wasGesture = this.gestured;
      if (this.touches.size === 0) this.gestured = false;
      return wasGesture;
    };
    cv.addEventListener('pointercancel', (e) => {
      if (e.pointerType !== 'touch') return;
      endTouch(e);
      if (this.longPress !== null) { clearTimeout(this.longPress); this.longPress = null; }
    });
    cv.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch' && endTouch(e)) return;
      if (e.pointerType === 'touch' && this.longPress !== null) {
        clearTimeout(this.longPress); this.longPress = null;
        this.click(false);
      }
    });
    addEventListener('keydown', (e) => {
      this.audio.unlock();
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) this.toggleFullscreen();
      else if (e.key === 'Escape') { if (!this.title) this.menu = this.menu ? null : 'main'; }
      else if (e.key === ' ' || e.key === 'Enter' || e.key === '.') this.skip();
      else if (this.debug && e.key === 'd') this.debugOverlay = !this.debugOverlay;
      else if (!this.title && !this.menu && !this.choice && this.core) {
        const keys: Record<string, Verb> = { g: 'give', p: 'pickup', u: 'use', o: 'open', l: 'look', s: 'push', c: 'close', t: 'talk', y: 'pull', w: 'walk' };
        const v = keys[e.key.toLowerCase()];
        if (v && !(this.debug && e.key === 'd')) { this.verb = v; this.pending = null; }
      }
    });
  }
  debugOverlay = false;

  private toggleFullscreen() {
    if (!fullscreenSupported()) {
      this.toast = { text: 'This browser does not allow full screen here.', until: this.time + 2500 };
      return;
    }
    toggleFullscreen();
  }

  private skip() {
    if (this.banner) { this.banner.resolve(); return true; }
    if (this.cardState) { this.cardState.resolve(); return true; }
    if (this.speech) { this.speech.resolve(); return true; }
    if (this.narration) { this.narration.resolve(); return true; }
    return false;
  }

  private click(right: boolean) {
    const m = this.mouse;
    if (this.title) {
      for (const b of this.titleBtns) if (this.inRect(b.x, b.y, b.w, b.h)) b.act();
      return;
    }
    if (!this.core) return;
    if (this.menu) {
      for (const b of this.menuBtns) if (this.inRect(b.x, b.y, b.w, b.h)) { b.act(); return; }
      return;
    }
    if (this.inRect(W - 14, 2, 12, 10) && !this.choice) { this.menu = 'main'; return; }
    if (this.skip()) return;
    if (this.choice) {
      const ch = this.choice;
      if (this.inRect(W - 30, ROOM_H + 4, 28, 13)) { ch.scroll = Math.max(0, ch.scroll - 1); return; }
      if (this.inRect(W - 30, H - 16, 28, 13)) { ch.scroll++; return; }
      const idx = this.choiceAt();
      if (idx >= 0) ch.resolve(ch.options[idx].id);
      return;
    }
    if (this.core.busy) {
      if (this.core.canInterrupt()) this.core.interrupt().then(() => this.click(right));
      return;
    }
    this.hover = this.pick();
    const t = this.hover;

    if (m.y < ROOM_H) {
      if (right) {
        if (t) this.exec(this.core.defaultVerb(t), t);
        else this.walkMac();
        return;
      }
      if (this.pending && t && t.kind === 'hotspot') {
        this.exec(this.verb, { kind: 'item', id: this.pending }, t);
        return;
      }
      if (t && this.verb !== 'walk') { this.exec(this.verb, t); return; }
      if (t) { this.exec('walk', t); return; }
      this.walkMac();
      return;
    }
    // verbs
    for (let i = 0; i < VERBS.length; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      if (this.inRect(4 + col * 52, INV_Y + row * 14, 50, 13)) {
        this.verb = VERBS[i].v; this.pending = null; return;
      }
    }
    // inventory strip
    const list = this.invList();
    if (this.inRect(289, INV_Y - 1, 28, 13)) { this.invScroll = Math.max(0, this.invScroll - 1); return; }
    if (this.inRect(289, INV_Y + 29, 28, 13)) { if ((this.invScroll + INV_ROWS) * INV_COLS < list.length) this.invScroll++; return; }
    if (this.inRect(289, INV_Y + 14, 28, 13) && this.hasTools()) { this.invTab = this.invTab === 'bag' ? 'tools' : 'bag'; this.invScroll = 0; return; }
    if (t && t.kind === 'item') {
      const item = this.content.items[t.id];
      if (right) { this.exec('look', t); return; }
      if (this.pending) {
        if (this.pending === t.id) {
          if (this.verb === 'use' && item.use) this.exec('use', t);
          else { this.pending = null; }
          return;
        }
        this.exec(this.verb, { kind: 'item', id: this.pending }, t);
        return;
      }
      if (this.verb === 'walk' || this.verb === 'use' || this.verb === 'give') {
        if (this.verb !== 'give' && item.useAlone) { this.exec('use', t); return; }
        if (this.verb === 'walk') this.verb = 'use';
        this.pending = t.id;
        return;
      }
      this.exec(this.verb, t);
    }
  }

  private walkMac() {
    if (this.core.room.noMac) return;
    if (this.core.room.canWalk && !this.core.room.canWalk(this.core)) return;
    if (!this.actors.get('mac')?.visible) return;
    const rx = this.mouse.x + this.camX, ry = this.mouse.y;
    this.walk('mac', [rx, ry]);
  }

  private exec(verb: Verb, a: Target, b?: Target) {
    this.verb = 'walk';
    this.pending = null;
    this.core.perform(verb, a, b).catch((e) => console.error(e));
  }
}
