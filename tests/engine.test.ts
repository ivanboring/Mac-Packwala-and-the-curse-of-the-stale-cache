import { describe, expect, it } from 'vitest';
import { WalkMap } from '../src/engine/walk';
import { atLeast, refusal } from '../src/engine/roles';
import { GameCore, newState, type Content } from '../src/engine/core';
import { HeadlessPresenter } from '../src/engine/headless';
import { wrap, textWidth } from '../src/engine/font';
import type { Hotspot, RoomDef } from '../src/engine/types';
import { hotspotAt, hits } from '../src/engine/hit';
import { content } from '../src/content/index';

describe('walk map', () => {
  // U-shaped floor: must walk around the gap in the middle
  const m = new WalkMap(100, 100, [
    [[0, 0], [30, 0], [30, 100], [0, 100]],
    [[70, 0], [100, 0], [100, 100], [70, 100]],
    [[0, 80], [100, 80], [100, 100], [0, 100]],
  ]);
  it('finds a path around obstacles', () => {
    const path = m.path([10, 10], [90, 10]);
    expect(path.at(-1)).toEqual([90, 10]);
    expect(path.some(([, y]) => y >= 80)).toBe(true);
    let prev: [number, number] = [10, 10];
    for (const p of path) { expect(m.lineOk(prev, p)).toBe(true); prev = p; }
  });
  it('snaps unreachable targets to the walk area', () => {
    expect(m.ok(...m.nearest(50, 10))).toBe(true);
  });
});

describe('roles', () => {
  it('orders roles', () => {
    expect(atLeast('editor', 'authenticated')).toBe(true);
    expect(atLeast('anonymous', 'editor')).toBe(false);
    expect(refusal('anonymous', 'editor', 0)).toMatch(/Anonymous/);
  });
});

describe('font', () => {
  it('wraps text within width', () => {
    for (const l of wrap('The quick brown fox jumps over the lazy dog many many times', 80)) expect(textWidth(l)).toBeLessThanOrEqual(80);
  });
});

describe('core verbs, role gates and dialogues', () => {
  const room: RoomDef = {
    id: 'r', name: 'Room', paint: () => {}, walk: [[[0, 0], [320, 0], [320, 144], [0, 144]]],
    hotspots: [
      { id: 'door', name: 'door', rect: [0, 0, 10, 10], roles: { open: 'editor' }, open: (g) => g.set('opened') },
      { id: 'npc', name: 'npc', rect: [20, 0, 10, 10], talk: (g) => g.talk('d') },
      { id: 'box', name: 'box', rect: [40, 0, 10, 10], useItem: { key: (g) => g.set('unlocked') } },
    ],
  };
  const content: Content = {
    rooms: { r: room },
    items: {
      key: { id: 'key', name: 'key', look: 'A key.', icon: () => {} },
      lock: { id: 'lock', name: 'lock', look: 'A lock.', icon: () => {}, combine: { key: (g) => g.set('combined') } },
    },
    characters: {},
    dialogues: {
      d: { id: 'd', with: 'npc', options: [
        { id: 'a', text: 'Once only', once: true, run: (g) => { g.inc('a'); } },
        { id: 'b', text: 'Bye', end: true },
      ] },
    },
    duels: {}, bugs: [], patches: [], startRoom: 'r', fallback: { look: ['Meh {name}.'] },
  };
  const mk = () => {
    const pres = new HeadlessPresenter();
    const core = new GameCore(content, pres, true, newState(content));
    pres.core = core;
    return { core, pres };
  };
  it('blocks verbs below the required role', async () => {
    const { core } = mk();
    await core.goto('r');
    await core.perform('open', { kind: 'hotspot', id: 'door' });
    expect(core.flag('opened')).toBeUndefined();
    expect(core.log.some((l) => /403|denied/i.test(l))).toBe(true);
    core.state.role = 'editor';
    await core.perform('open', { kind: 'hotspot', id: 'door' });
    expect(core.flag('opened')).toBe(true);
  });
  it('uses items on hotspots and items on items (both directions)', async () => {
    const { core } = mk();
    await core.goto('r');
    core.give('key'); core.give('lock');
    await core.perform('use', { kind: 'item', id: 'key' }, { kind: 'hotspot', id: 'box' });
    expect(core.flag('unlocked')).toBe(true);
    await core.perform('use', { kind: 'item', id: 'key' }, { kind: 'item', id: 'lock' });
    expect(core.flag('combined')).toBe(true);
  });
  it('hides once-only dialogue options after use', async () => {
    const { core, pres } = mk();
    await core.goto('r');
    pres.queue.push('a', 'b');
    await core.perform('talk', { kind: 'hotspot', id: 'npc' });
    pres.queue.push('b');
    await core.perform('talk', { kind: 'hotspot', id: 'npc' });
    expect(pres.lastOptions.map((o) => o.id)).toEqual(['b']);
    expect(core.flag('a')).toBe(1);
  });
});

describe('hotspot hit testing', () => {
  const big: Hotspot = { id: 'sign', name: 'sign', rect: [0, 0, 60, 60] };
  const small: Hotspot = { id: 'bottle', name: 'bottle', rect: [10, 10, 8, 8] };

  it('picks the smallest hotspot under the cursor, whatever the list order', () => {
    expect(hotspotAt([small, big], 12, 12)?.id).toBe('bottle');
    expect(hotspotAt([big, small], 12, 12)?.id).toBe('bottle');
    expect(hotspotAt([small, big], 40, 40)?.id).toBe('sign');
    expect(hotspotAt([small, big], 80, 80)).toBeUndefined();
  });

  it('every small hotspot in the game is clickable over most of its area', () => {
    const same = (a: Hotspot, b: Hotspot) => JSON.stringify(a.rect ?? a.poly) === JSON.stringify(b.rect ?? b.poly);
    for (const room of Object.values(content.rooms)) {
      const all = room.hotspots.filter((h) => !h.actor);
      for (const h of all) {
        // hotspots with identical geometry are alternatives (only one is ever visible)
        const list = all.filter((o) => o === h || !same(o, h));
        let tot = 0, win = 0;
        for (let y = 0; y < 144; y++) for (let x = 0; x < (room.width ?? 320); x++) {
          if (!hits(h, x, y)) continue;
          tot++;
          if (hotspotAt(list, x, y) === h) win++;
        }
        if (tot && tot < 2000) expect(win / tot, `${room.id}/${h.id}`).toBeGreaterThan(0.5);
      }
    }
  });
});

describe('saves', () => {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  const put = (v: unknown) => store.set('mac-zakpackin:save:t', typeof v === 'string' ? v : JSON.stringify(v));
  const good = () => newState(content);

  it('loads a real save', async () => {
    const { loadSave } = await import('../src/engine/save');
    put(good());
    expect(loadSave('t', content)?.room).toBe(content.startRoom);
    put({ ...good(), inv: ['removed_item', Object.keys(content.items)[0]] });
    expect(loadSave('t', content)?.inv).toEqual([Object.keys(content.items)[0]]);
  });

  it('rejects corrupt or foreign saves instead of crashing later', async () => {
    const { loadSave } = await import('../src/engine/save');
    const bad: unknown[] = [
      '{', { v: 1 }, { ...good(), v: 2 }, { ...good(), room: 'nowhere' }, { ...good(), room: 'toString' },
      { ...good(), role: 'admin' }, { ...good(), mac: { x: 'a', y: 1, dir: 'front' } }, { ...good(), mac: { x: 1, y: 1, dir: 'up' } },
      { ...good(), inv: [1] }, { ...good(), inv: 'lamp' }, { ...good(), flags: [] }, { ...good(), flags: { a: {} } },
      { ...good(), playMs: -1 },
    ];
    for (const b of bad) { put(b); expect(loadSave('t', content), JSON.stringify(b)).toBeNull(); }
  });

  it('keeps settings finite and in range', async () => {
    const { loadSettings } = await import('../src/engine/save');
    store.set('mac-zakpackin:settings', '{"textSpeed":0,"speechVolume":9,"musicVolume":0.25}');
    expect(loadSettings()).toEqual({ textSpeed: 1, speechVolume: 1, musicVolume: 0.25 });
    store.set('mac-zakpackin:settings', 'null');
    expect(loadSettings()).toEqual({ textSpeed: 1, speechVolume: 1, musicVolume: 0.5 });
  });
});
