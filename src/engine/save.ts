// localStorage persistence. Every access is guarded: private windows and
// blocked storage must never break the game.
import type { SaveState } from './types';

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

export function loadSave(slot: string): SaveState | null {
  const raw = get(`save:${slot}`);
  if (!raw) return null;
  try {
    const st = JSON.parse(raw) as SaveState;
    if (!st || st.v !== 1) return null;
    // flag renamed when the rescuer became Captain Node
    if (st.flags?.druplicon1) { st.flags.nodeContacted = st.flags.druplicon1; delete st.flags.druplicon1; }
    // saved as an Editor before the Grand Maintainer switched sound on: switch it on now
    if ((st.role === 'editor' || st.role === 'sitebuilder') && st.flags) { st.flags.voicesOn = true; st.flags.musicOn = true; }
    return st;
  } catch { return null; }
}

export function hasSave(slot: string): boolean {
  return loadSave(slot) !== null;
}

export function loadSettings(): Settings {
  try {
    const s = JSON.parse(get('settings') ?? '{}');
    const num = (v: unknown, d: number) => (typeof v === 'number' ? v : d);
    return { textSpeed: num(s.textSpeed, 1), speechVolume: num(s.speechVolume, 1), musicVolume: num(s.musicVolume, 0.5) };
  } catch { return { textSpeed: 1, speechVolume: 1, musicVolume: 0.5 }; }
}

export function saveSettings(s: Settings) {
  put('settings', JSON.stringify(s));
}
