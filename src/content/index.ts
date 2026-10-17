import type { Content } from '../engine/core';
import { fallback } from './common';
import { mac } from './characters/mac';
import * as act1 from './act1';
import * as act2 from './act2';
import * as act3 from './act3';
import { MUSIC } from './music';

const byId = <T extends { id: string }>(list: T[]) => {
  const out: Record<string, T> = {};
  for (const x of list) {
    if (out[x.id]) throw new Error(`Duplicate id: ${x.id}`);
    out[x.id] = x;
  }
  return out;
};

export const content: Content = {
  rooms: byId([...act1.rooms, ...act2.rooms, ...act3.rooms]),
  items: byId([...act1.items, ...act2.items, ...act3.items]),
  characters: byId([mac, ...act1.characters, ...act2.characters, ...act3.characters]),
  dialogues: byId([...act1.dialogues, ...act2.dialogues, ...act3.dialogues]),
  duels: byId(act2.duels),
  bugs: act2.bugs,
  patches: act2.patches,
  startRoom: 'beach',
  fallback,
  afterDuel: act2.afterDuel,
  music: MUSIC,
};
