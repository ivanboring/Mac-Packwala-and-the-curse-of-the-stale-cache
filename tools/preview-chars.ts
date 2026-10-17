// Render every character in every pose to a contact sheet PNG.
// Usage: npx tsx tools/preview-chars.ts [out.png] [ids,comma,separated]
import { Bitmap, Painter } from '../src/engine/paint';
import { renderCharacter } from '../src/engine/sprite';
import { C } from '../src/engine/palette';
import type { CharacterDef, Dir } from '../src/engine/types';
import { content } from '../src/content/index';
const characters = content.characters;
import { writePng } from './png';

const out = process.argv[2] ?? 'chars.png';
const only = process.argv[3]?.split(',');
const list: CharacterDef[] = Object.values(characters).filter((c) => !only || only.includes(c.id));
const poses: { dir: Dir; walk: number; talk: boolean; gesture?: string }[] = [
  { dir: 'right', walk: -1, talk: false },
  { dir: 'right', walk: -1, talk: true },
  { dir: 'right', walk: 0, talk: false },
  { dir: 'right', walk: 1, talk: false },
  { dir: 'right', walk: 2, talk: false },
  { dir: 'right', walk: 3, talk: false },
  { dir: 'front', walk: -1, talk: false },
  { dir: 'front', walk: -1, talk: true },
  { dir: 'front', walk: 0, talk: false },
  { dir: 'back', walk: -1, talk: false },
  { dir: 'right', walk: -1, talk: false, gesture: 'reach' },
  { dir: 'front', walk: -1, talk: false, gesture: 'shrug' },
];
const cellW = Math.max(...list.map((c) => c.w)) + 4;
const cellH = Math.max(...list.map((c) => c.h)) + 4;
const sheet = new Bitmap(cellW * poses.length, cellH * list.length);
const p = new Painter(sheet);
p.rect(0, 0, sheet.w, sheet.h, C.sand);
list.forEach((c, row) => {
  poses.forEach((pose, col) => {
    const b = renderCharacter(c, { ...pose, t: 500 });
    p.blit(b, col * cellW + 2 + (cellW - 4 - c.w) / 2, row * cellH + 2 + (cellH - 4 - c.h));
  });
});
writePng(out, sheet, 4);
console.log(`wrote ${out}: ${list.map((c) => c.id).join(', ')}`);
