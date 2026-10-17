// Instant presenter for tests: no timing, no pixels. Choices come from a
// queue or a chooser callback so a walkthrough can play the whole game.
import type { Pt } from './paint';
import { GameCore, newState, type Content, type Presenter } from './core';
import type { Dir, ItemDef, Role, RoomDef, SaveState } from './types';

export class HeadlessPresenter implements Presenter {
  core!: GameCore;
  actors = new Map<string, { x: number; y: number; dir: Dir; visible: boolean; gesture?: string }>();
  queue: string[] = [];
  chooser?: (options: { id: string; text: string }[], core: GameCore) => string | undefined;
  lastOptions: { id: string; text: string }[] = [];

  speak() { return Promise.resolve(); }
  narrate() { return Promise.resolve(); }
  walk(id: string, to: Pt) {
    const a = this.actors.get(id);
    if (a) { a.x = to[0]; a.y = to[1]; }
    return Promise.resolve();
  }
  stop(_id: string) {}
  face(id: string, dir: Dir) { const a = this.actors.get(id); if (a) a.dir = dir; }
  wait() { return Promise.resolve(); }
  choose(options: { id: string; text: string }[]) {
    this.lastOptions = options;
    let pick: string | undefined;
    while (this.queue.length && !pick) {
      const want = this.queue.shift()!;
      const found = options.find((o) => o.id === want || o.text === want);
      if (found) pick = found.id;
      else throw new Error(`Choice "${want}" not available. Options: ${options.map((o) => o.id).join(', ')}`);
    }
    if (!pick && this.chooser) pick = this.chooser(options, this.core);
    if (!pick) throw new Error(`No choice queued. Options: ${options.map((o) => `${o.id} (${o.text})`).join(' | ')}`);
    return Promise.resolve(pick);
  }
  enterRoom(room: RoomDef, at: Pt, face: Dir) {
    for (const id of [...this.actors.keys()]) if (id !== 'mac') this.actors.delete(id);
    this.actors.set('mac', { x: at[0], y: at[1], dir: face, visible: !room.noMac });
    for (const n of room.npcs ?? []) {
      if (!n.when || n.when(this.core)) this.actors.set(n.id, { x: n.at[0], y: n.at[1], dir: n.face ?? 'front', visible: true });
    }
    return Promise.resolve();
  }
  roleGranted(_r: Role) { return Promise.resolve(); }
  itemGained(_i: ItemDef) {}
  fx() { return Promise.resolve(); }
  card() { return Promise.resolve(); }
  shake() {}
  now() { return 0; }
  toTitle() { return Promise.resolve(); }
  refresh() {
    const room = this.core?.room;
    if (!room) return;
    for (const n of room.npcs ?? []) {
      const present = !n.when || n.when(this.core);
      if (present && !this.actors.has(n.id)) this.actors.set(n.id, { x: n.at[0], y: n.at[1], dir: n.face ?? 'front', visible: true });
      if (!present && this.actors.has(n.id)) this.actors.delete(n.id);
    }
  }
  actorPos(id: string) { return this.actors.get(id) ?? null; }
  setActor(id: string, patch: any) {
    const a = this.actors.get(id) ?? { x: 0, y: 0, dir: 'front' as Dir, visible: true };
    Object.assign(a, patch);
    this.actors.set(id, a);
  }
  saved(_s: SaveState) {}
}

export function headlessGame(content: Content, state?: SaveState) {
  const pres = new HeadlessPresenter();
  const core = new GameCore(content, pres, true, state ?? newState(content));
  pres.core = core;
  return { core, pres };
}
