import { headlessGame } from '../src/engine/headless';
import { content } from '../src/content/index';
import type { Verb } from '../src/engine/types';
import type { GameCore, Target } from '../src/engine/core';

export function newGame() {
  const h = headlessGame(content);
  return h;
}

function target(core: GameCore, id: string): Target {
  if (core.has(id)) return { kind: 'item', id };
  if (core.hotspot(id)) return { kind: 'hotspot', id };
  throw new Error(`"${id}" is neither in inventory (${core.state.inv.join(',')}) nor a hotspot in ${core.state.room} (${core.room.hotspots.map((h) => h.id).join(',')})`);
}

/** do(core, 'use', 'plank', 'crate') — choices queued via `choices`. */
export async function act(h: ReturnType<typeof newGame>, verb: Verb, a: string, b?: string, choices: string[] = []) {
  const { core, pres } = h;
  const hs = core.hotspot(a);
  if (hs?.when && !hs.when(core) && !core.has(a)) throw new Error(`Hotspot ${a} not present in ${core.state.room}`);
  pres.queue.push(...choices);
  await core.perform(verb, target(core, a), b ? target(core, b) : undefined);
  if (pres.queue.length) throw new Error(`Unused choices: ${pres.queue.join(', ')}`);
}

export async function go(h: ReturnType<typeof newGame>, exitHotspot: string, choices: string[] = []) {
  await act(h, 'walk', exitHotspot, undefined, choices);
}
