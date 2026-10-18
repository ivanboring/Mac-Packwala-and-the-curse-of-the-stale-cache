// localStorage persistence. Every access is guarded: private windows and
// blocked storage must never break the game.
import type { Dir, Role, SaveState } from './types';

const PREFIX = 'mac-zakpackin:'; // old name kept so existing saves still load

export interface Settings { textSpeed: number; speechVolume: number; musicVolume: number }

function get(key: string): string | null {
  try { return localStorage.getItem(PREFIX + key); } catch { return null; }
}
function put(key: string, value: string) {
  try { localStorage.setItem(PREFIX + key, value); } catch { /* storage unavailable */ }
}

export function writeSave(slot: string, state: SaveState) {
  put(`save:${slot}`, JSON.stringify(state));
}

/** Rooms and items that exist; a save naming anything else is not one of ours. */
export interface KnownIds { rooms: Record<string, unknown>; items: Record<string, unknown> }

const ROLES: Role[] = ['anonymous', 'authenticated', 'editor', 'sitebuilder'];
const DIRS: Dir[] = ['left', 'right', 'front', 'back'];
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const own = (o: Record<string, unknown>, k: unknown) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);

/** The whole shape, checked: anything else (corrupt, hand-edited, from another game) is no save at all. */
function validSave(st: any, known?: KnownIds): st is SaveState {
  if (!st || typeof st !== 'object' || st.v !== 1) return false;
  if (typeof st.room !== 'string' || (known && !own(known.rooms, st.room))) return false;
  if (!ROLES.includes(st.role)) return false;
  if (!st.mac || !finite(st.mac.x) || !finite(st.mac.y) || !DIRS.includes(st.mac.dir)) return false;
  if (!finite(st.playMs) || st.playMs < 0) return false;
  if (!Array.isArray(st.inv) || !st.inv.every((i: unknown) => typeof i === 'string')) return false;
  if (!st.flags || typeof st.flags !== 'object' || Array.isArray(st.flags)) return false;
  return Object.values(st.flags).every((f) => typeof f === 'boolean' || typeof f === 'string' || finite(f));
}

export function loadSave(slot: string, known?: KnownIds): SaveState | null {
  const raw = get(`save:${slot}`);
  if (!raw) return null;
  try {
    const st = JSON.parse(raw);
    if (st?.flags && typeof st.flags === 'object') {
      // flag renamed when the rescuer became Captain Node
      if (st.flags.druplicon1) { st.flags.nodeContacted = st.flags.druplicon1; delete st.flags.druplicon1; }
    }
    if (!validSave(st, known)) return null;
    // items since removed from the game are dropped, not the whole save
    if (known) st.inv = st.inv.filter((i) => own(known.items, i));
    // saved as an Editor before the Grand Maintainer switched sound on: switch it on now
    if (st.role === 'editor' || st.role === 'sitebuilder') { st.flags.voicesOn = true; st.flags.musicOn = true; }
    return st;
  } catch { return null; }
}

export function hasSave(slot: string, known?: KnownIds): boolean {
  return loadSave(slot, known) !== null;
}

export function loadSettings(): Settings {
  try {
    const s = JSON.parse(get('settings') ?? '{}');
    // finite and within what the menu can set; anything else falls back to the default
    const num = (v: unknown, d: number, lo: number, hi: number) => (finite(v) && v >= lo && v <= hi ? v : d);
    return { textSpeed: num(s?.textSpeed, 1, 0.25, 4), speechVolume: num(s?.speechVolume, 1, 0, 1), musicVolume: num(s?.musicVolume, 0.5, 0, 1) };
  } catch { return { textSpeed: 1, speechVolume: 1, musicVolume: 0.5 }; }
}

export function saveSettings(s: Settings) {
  put('settings', JSON.stringify(s));
}
