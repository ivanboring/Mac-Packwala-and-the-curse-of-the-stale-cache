// Act 3 scenery helpers: fog, lighthouse stripes, Captain Node's airship.
import type { Painter, Pt } from '../engine/paint';
import { C } from '../engine/palette';

/** Drifting fog bands. `amount` 0..1 (1 = thick). Drawn per frame. */
export function fogBands(p: Painter, t: number, w: number, top: number, bottom: number, amount: number) {
  if (amount <= 0) return;
  const mode = amount > 0.75 ? '75' : amount > 0.5 ? 'check' : '25';
  for (let i = 0; i < 6; i++) {
    const y = top + ((bottom - top) * i) / 6;
    const drift = ((t / (60 + i * 25)) + i * 53) % (w + 120) - 60;
    for (let k = -1; k < Math.ceil(w / 160) + 1; k++) {
      const x = drift + k * 160 - 80;
      p.ellipse(x, y, 46 + (i % 3) * 10, 5 + (i % 2) * 2, [0, i % 2 ? C.fog : C.white, mode as any]);
    }
  }
}

/** Run `fn` with drawing clipped to a room-space rect (restores the previous clip). */
export function withClip(p: Painter, x: number, y: number, w: number, h: number, fn: () => void) {
  const saved = [p.cx0, p.cy0, p.cx1, p.cy1];
  const x0 = Math.max(saved[0], x + p.ox), y0 = Math.max(saved[1], y + p.oy);
  const x1 = Math.min(saved[2], x + w + p.ox), y1 = Math.min(saved[3], y + h + p.oy);
  p.cx0 = x0; p.cy0 = y0; p.cx1 = Math.max(x0, x1); p.cy1 = Math.max(y0, y1);
  try { fn(); } finally { [p.cx0, p.cy0, p.cx1, p.cy1] = saved; }
}

/** A dithered veil of fog over a whole rect. */
export function fogVeil(p: Painter, x: number, y: number, w: number, h: number, amount: number) {
  if (amount <= 0) return;
  if (amount > 0.8) p.rect(x, y, w, h, [0, C.fog, '75']);
  else if (amount > 0.5) p.rect(x, y, w, h, [0, C.fog, 'check']);
  else if (amount > 0.2) p.rect(x, y, w, h, [0, C.fog, '25']);
  else {
    for (let j = y; j < y + h; j += 4) for (let i = x + ((j / 4) % 2) * 2; i < x + w; i += 4) p.px(i, j, C.fog);
  }
}

/** Horizontal bands alternating two colours, clipped to a polygon-ish column. */
export function stripedColumn(p: Painter, x0: number, x1: number, y0: number, y1: number, band: number, a: number, b: number) {
  for (let y = y0, i = 0; y < y1; y += band, i++) p.rect(x0, y, x1 - x0, Math.min(band, y1 - y), i % 2 ? a : b);
}

/** Captain Node's airship: a round teal balloon with a node-graph emblem and a pink gondola. (cx, cy) = balloon centre. */
export function airship(p: Painter, cx: number, cy: number, t: number) {
  cx = Math.round(cx); cy = Math.round(cy);
  // ropes
  p.line(cx - 12, cy + 18, cx - 16, cy + 34, C.ink);
  p.line(cx + 12, cy + 18, cx + 16, cy + 34, C.ink);
  p.line(cx, cy + 22, cx, cy + 34, C.ink);
  // gondola
  p.poly([[cx - 22, cy + 34], [cx + 22, cy + 34], [cx + 18, cy + 46], [cx - 18, cy + 46]], C.brandpink);
  p.hline(cx - 22, cx + 22, cy + 34, C.ink);
  p.hline(cx - 20, cx + 20, cy + 38, C.white);
  for (let i = -14; i <= 14; i += 7) p.rect(cx + i - 2, cy + 40, 4, 3, C.glow);
  // propeller
  const k = Math.floor(t / 60) % 2;
  p.rect(cx + 22, cy + 38, 3, 3, C.darkgray);
  if (k) p.vline(cx + 25, cy + 32, cy + 46, C.lightgray); else p.hline(cx + 23, cx + 28, cy + 39, C.lightgray);
  // the balloon (outline by hand: it's drawn straight into the room)
  p.ellipse(cx, cy - 6, 27, 29, C.ink);
  drawBalloon(p, cx, cy, t);
}

function drawBalloon(p: Painter, cx: number, cy: number, t: number) {
  p.ellipse(cx, cy - 6, 26, 28, C.node);
  p.ellipse(cx + 6, cy, 18, 20, C.nodedark);
  p.ellipse(cx + 2, cy - 4, 19, 22, C.node);
  // panel seams
  for (const dx of [-14, 0, 14]) p.line(cx + Math.round(dx * 0.6), cy - 33, cx + dx, cy + 20, C.nodedark);
  p.ellipse(cx - 16, cy - 16, 3, 8, C.nodelight);
  // the emblem: three nodes joined by edges, on a white disc
  p.circle(cx, cy - 4, 11, C.white);
  const pulse = Math.floor(t / 700) % 3;
  const pts: [number, number][] = [[cx - 5, cy - 1], [cx + 5, cy - 1], [cx, cy - 10]];
  p.line(pts[0][0], pts[0][1], pts[1][0], pts[1][1], C.navy);
  p.line(pts[1][0], pts[1][1], pts[2][0], pts[2][1], C.navy);
  p.line(pts[2][0], pts[2][1], pts[0][0], pts[0][1], C.navy);
  pts.forEach(([x, y], i) => p.circle(x, y, 2, i === pulse ? C.brandpink : C.nodedark));
}

export function ladder(p: Painter, x0: number, y0: number, x1: number, y1: number) {
  // two rails from (x0,y0) bottom to (x1,y1) top, rungs between
  p.line(x0 - 5, y0, x1 - 4, y1, C.wood);
  p.line(x0 + 5, y0, x1 + 4, y1, C.wood);
  p.line(x0 - 4, y0, x1 - 3, y1, C.woodlight);
  p.line(x0 + 6, y0, x1 + 5, y1, C.woodlight);
  const n = Math.round(Math.abs(y0 - y1) / 8);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    p.hline(x - 4, x + 4, y, C.woodlight);
  }
}

export type { Pt };
