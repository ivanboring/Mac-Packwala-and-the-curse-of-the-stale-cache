// Act 1 scenery helpers (town, interiors). Builds on the shared art kit.
import { Painter, type Pt } from '../engine/paint';
import { C } from '../engine/palette';
import { drawText, textWidth } from '../engine/font';
import { rng } from '../engine/rng';

export function cobbles(p: Painter, x: number, y: number, w: number, h: number, seed = 7, a = C.stone, b = C.stoneshade, gap = C.darkgray) {
  p.rect(x, y, w, h, gap);
  const r = rng(seed);
  let yy = y;
  let row = 0;
  while (yy < y + h) {
    const t = (yy - y) / h;
    const rh = Math.round(3 + t * 5);
    const sw = Math.round(7 + t * 9);
    let xx = x - (row % 2 ? Math.floor(sw / 2) : 0);
    while (xx < x + w) {
      const cw = sw + r.int(-2, 2);
      const c = r.chance(0.25) ? b : a;
      p.rect(xx + 1, yy + 1, cw - 1, rh - 1, c);
      p.hline(xx + 2, xx + cw - 2, yy + 1, r.chance(0.5) ? C.lightgray : c);
      p.px(xx + 1, yy + 1, gap); p.px(xx + cw - 1, yy + 1, gap);
      xx += cw;
    }
    yy += rh;
    row++;
  }
}

/** Interior back wall + floor with a perspective seam. */
export function interior(p: Painter, w: number, floorY: number, wallA: number, wallB: number, floorA: number, floorB: number, seed = 3) {
  p.gradV(0, 0, w, floorY, [wallB, wallA, wallA]);
  const r = rng(seed);
  for (let i = 0; i < w; i += 14) p.vline(i + r.int(0, 3), 0, floorY - 1, [wallB, wallA, '25']);
  // floor boards fanning out (fake perspective)
  p.gradV(0, floorY, w, 144 - floorY, [floorB, floorA]);
  const cx = w / 2;
  for (let k = -12; k <= 12; k++) {
    const x0 = cx + k * 14, x1 = cx + k * 34;
    p.line(x0, floorY, x1, 143, floorB);
  }
  p.hline(0, w - 1, floorY, C.darkbrown);
}

export function shelf(p: Painter, x: number, y: number, w: number, c = C.wood) {
  p.rect(x, y, w, 3, c);
  p.hline(x, x + w - 1, y + 3, C.darkbrown);
  p.rect(x + 2, y + 3, 2, 4, C.darkbrown);
  p.rect(x + w - 4, y + 3, 2, 4, C.darkbrown);
}

/** A box on a shelf with a tiny label. */
export function box(p: Painter, x: number, y: number, w: number, h: number, c: number, label?: string, ink = C.white) {
  p.rect(x, y, w, h, c);
  p.hline(x, x + w - 1, y, C.white);
  p.vline(x + w - 1, y, y + h - 1, C.ink);
  if (label) drawText(p, label, Math.round(x + w / 2 - textWidth(label) / 2), y + Math.max(1, Math.round(h / 2 - 3)), ink);
}

/** Counter seen from the front: drawn on the front layer to hide legs. */
export function counter(p: Painter, x: number, y: number, w: number, h: number, top = C.woodlight, front = C.wood) {
  p.poly([[x - 4, y], [x + w + 4, y], [x + w, y + 5], [x, y + 5]], top);
  p.rect(x, y + 5, w, h - 5, front);
  for (let i = x + 10; i < x + w; i += 18) p.vline(i, y + 6, y + h - 2, C.darkbrown);
  p.hline(x, x + w - 1, y + 5, C.darkbrown);
}

export function pennants(p: Painter, pts: Pt[], colors: number[]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    p.line(x0, y0, x1, y1, C.ink);
    const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / 9));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n;
      const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 3;
      p.poly([[px - 3, py], [px + 3, py], [px, py + 5]], colors[(i * n + k) % colors.length]);
    }
  }
}

export function plaque(p: Painter, x: number, y: number, lines: string[], bg = C.brandink, fg = C.brandpaper, border = C.gold) {
  const w = Math.max(...lines.map(textWidth)) + 8;
  const h = lines.length * 9 + 4;
  p.rect(x, y, w, h, bg);
  p.frame(x, y, w, h, border);
  lines.forEach((l, i) => drawText(p, l, Math.round(x + w / 2 - textWidth(l) / 2), y + 3 + i * 9, fg));
  return { w, h };
}

export function table(p: Painter, x: number, y: number, w: number, top = C.woodlight, legs = C.wood) {
  p.ellipse(x + w / 2, y, w / 2, 4, top);
  p.hline(x + 2, x + w - 3, y + 3, legs);
  p.rect(x + w / 2 - 2, y + 3, 4, 12, legs);
  p.rect(x + w / 2 - 7, y + 14, 14, 2, legs);
}

export function stool(p: Painter, x: number, y: number) {
  p.ellipse(x, y, 5, 2, C.woodlight);
  p.line(x - 4, y + 1, x - 5, y + 10, C.wood);
  p.line(x + 4, y + 1, x + 5, y + 10, C.wood);
  p.hline(x - 4, x + 4, y + 6, C.wood);
}

export function flame(p: Painter, x: number, y: number, t: number, s = 1) {
  const k = Math.sin(t / 90) * 1.5;
  p.ellipse(x, y, 4 * s, 6 * s + k, C.orange);
  p.ellipse(x, y + 1, 2.5 * s, 4 * s + k / 2, C.yellow);
  p.ellipse(x, y + 2, 1.2 * s, 2 * s, C.glow);
}
