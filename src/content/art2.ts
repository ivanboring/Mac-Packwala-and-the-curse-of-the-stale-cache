// Extra scenery for Act 2: jungle, temples, libraries, graveyards.
import type { Painter, Pt } from '../engine/paint';
import { C } from '../engine/palette';
import { drawText, textWidth } from '../engine/font';
import { rng } from '../engine/rng';

/** Layered jungle foliage filling a band. */
export function jungle(p: Painter, x: number, y: number, w: number, h: number, seed = 1, dark = false) {
  const r = rng(seed);
  const cols = dark ? [C.night, C.darkgreen, C.teal] : [C.darkgreen, C.green, C.lime];
  for (let layer = 0; layer < 3; layer++) {
    const n = Math.round((w / 14) * (1 + layer * 0.4));
    for (let i = 0; i < n; i++) {
      const cx = x + r.int(-6, w + 6);
      const cy = y + h * (0.15 + layer * 0.28) + r.int(-8, 8);
      const rx = r.int(8, 16), ry = r.int(6, 12);
      p.ellipse(cx, cy, rx, ry, cols[layer]);
      if (layer === 2 && r.chance(0.4)) p.px(cx - 2, cy - ry + 2, dark ? C.green : C.yellow);
    }
  }
}

export function fern(p: Painter, x: number, y: number, s = 1, c = C.green) {
  for (let i = -3; i <= 3; i++) {
    const ex = x + i * 4 * s, ey = y - (9 - Math.abs(i) * 2) * s;
    p.line(x, y, ex, ey, c);
    p.line(x, y, ex + (i < 0 ? -2 : 2), ey + 2, C.darkgreen);
  }
}

export function vine(p: Painter, x: number, y: number, len: number, seed = 1) {
  const r = rng(seed);
  let cx = x;
  for (let i = 0; i < len; i += 3) {
    cx += r.int(-1, 1);
    p.vline(cx, y + i, y + i + 3, C.darkgreen);
    if (i % 9 === 0) p.rect(cx + (r.chance(0.5) ? 1 : -3), y + i, 3, 2, C.green);
  }
}

export function conifer(p: Painter, x: number, y: number, h: number) {
  p.rect(x - 2, y - 10, 5, 10, C.brown);
  const tiers = 5;
  for (let t = 0; t < tiers; t++) {
    const ty = y - 8 - t * (h / tiers) * 0.8;
    const half = (tiers - t) * (h / 18) + 4;
    p.poly([[x - half, ty], [x + half, ty], [x, ty - h / tiers - 6]], t % 2 ? C.darkgreen : C.green);
    p.line(x - half, ty, x, ty - h / tiers - 6, C.darkgreen);
  }
}

/** Perspective tiled floor between yTop and yBot. */
export function tiles(p: Painter, x: number, yTop: number, w: number, yBot: number, a: number, b: number, vp = 0.5) {
  p.gradV(x, yTop, w, yBot - yTop, [a, a, b]);
  const cx = x + w * vp;
  for (let i = -12; i <= 12; i++) p.line(cx + i * 10, yTop, cx + i * 40, yBot, b);
  let yy = yTop, step = 3;
  while (yy < yBot) { p.hline(x, x + w - 1, Math.round(yy), b); yy += step; step *= 1.35; }
}

export function torchPost(p: Painter, x: number, y: number) {
  p.rect(x - 2, y, 5, 22, C.stoneshade);
  p.rect(x - 4, y - 3, 9, 4, C.darkgray);
}

export function flame(p: Painter, x: number, y: number, t: number, seed = 0) {
  const k = Math.floor((t + seed * 97) / 110) % 3;
  p.ellipse(x, y - 4, 4 - (k === 1 ? 1 : 0), 6 + k, C.orange);
  p.ellipse(x, y - 3, 2, 4 + (k === 2 ? 1 : 0), C.yellow);
  p.px(x + (k - 1), y - 10 - k, C.glow);
}

export function tombstone(p: Painter, x: number, y: number, w: number, h: number, lines: string[], c = C.stone, shade = C.stoneshade, tilt = 0) {
  const pts: Pt[] = [[x + tilt, y + 6], [x + 3 + tilt, y + 1], [x + w / 2 + tilt, y - 2], [x + w - 3 + tilt, y + 1], [x + w + tilt, y + 6], [x + w, y + h], [x, y + h]];
  p.poly(pts, c);
  p.vline(x + w - 1, y + 6, y + h - 1, shade);
  p.hline(x, x + w - 1, y + h - 1, shade);
  lines.forEach((l, i) => drawText(p, l, Math.round(x + w / 2 - textWidth(l) / 2 + tilt / 2), y + 6 + i * 9, C.ink));
  p.rect(x - 2, y + h - 1, w + 4, 2, C.darkgreen);
}

export function bookshelf(p: Painter, x: number, y: number, w: number, h: number, seed = 1) {
  const r = rng(seed);
  p.rect(x, y, w, h, C.darkbrown);
  p.frame(x, y, w, h, C.wood);
  const spines = [C.red, C.darkred, C.blue, C.navy, C.green, C.darkgreen, C.purple, C.gold, C.brandblue, C.brandpink, C.tan, C.teal];
  for (let sy = y + 3; sy + 12 < y + h; sy += 15) {
    let sx = x + 2;
    while (sx < x + w - 4) {
      const bw = r.int(2, 4), bh = r.int(9, 12);
      const c = r.pick(spines);
      if (r.chance(0.08)) { p.poly([[sx, sy + 12], [sx + 2, sy + 12], [sx + 7, sy + 3], [sx + 5, sy + 2]], c); sx += 7; continue; }
      p.rect(sx, sy + 12 - bh, bw, bh, c);
      p.px(sx, sy + 13 - bh + 2, C.gold);
      sx += bw + (r.chance(0.1) ? 2 : 0);
    }
    p.rect(x + 1, sy + 12, w - 2, 2, C.wood);
  }
}

export function moon(p: Painter, x: number, y: number, r: number) {
  p.circle(x, y, r + 3, [C.night, C.navy]);
  p.circle(x, y, r, C.glow);
  p.circle(x - r / 3, y - r / 4, r / 4, C.yellow);
  p.circle(x + r / 3, y + r / 3, r / 5, C.yellow);
}

export function deadTree(p: Painter, x: number, y: number, h: number) {
  p.poly([[x - 4, y], [x + 4, y], [x + 2, y - h], [x - 1, y - h]], C.darkbrown);
  p.line(x, y - h * 0.6, x - 18, y - h * 0.9, C.darkbrown);
  p.line(x + 1, y - h * 0.6, x - 17, y - h * 0.9, C.darkbrown);
  p.line(x - 10, y - h * 0.78, x - 14, y - h - 4, C.darkbrown);
  p.line(x + 1, y - h * 0.75, x + 20, y - h * 0.95, C.darkbrown);
  p.line(x + 1, y - h * 0.74, x + 20, y - h * 0.94, C.darkbrown);
  p.line(x + 12, y - h * 0.86, x + 16, y - h - 6, C.darkbrown);
  p.line(x + 1, y - h, x + 4, y - h - 10, C.darkbrown);
}

export function plaque(p: Painter, x: number, y: number, lines: string[], bg = C.brandpaper, fg = C.brandink, border = C.brandink) {
  const w = Math.max(...lines.map(textWidth)) + 8;
  const h = lines.length * 9 + 4;
  p.rect(x + 2, y + 2, w, h, C.brandblue);
  p.rect(x, y, w, h, bg);
  p.frame(x, y, w, h, border);
  lines.forEach((l, i) => drawText(p, l, x + 4, y + 3 + i * 9, fg));
  return { w, h };
}

export function rope(p: Painter, x: number, y0: number, y1: number) {
  for (let y = y0; y < y1; y++) p.px(x + ((y >> 1) % 2), y, C.tan);
}
