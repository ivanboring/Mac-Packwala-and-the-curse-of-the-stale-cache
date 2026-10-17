// Shared scenery kit: reusable, slightly wonky DOTT-style props.
import { Painter, type Pt } from '../engine/paint';
import { C } from '../engine/palette';
import { drawText, textWidth } from '../engine/font';
import { rng } from '../engine/rng';

export { C };

export function sky(p: Painter, w: number, h: number, mood: 'day' | 'dusk' | 'fog' | 'night' = 'day') {
  const stops = {
    day: [C.blue, C.skyblue, C.skyblue, C.foam],
    dusk: [C.purple, C.magenta, C.sunset, C.glow],
    fog: [C.gray, C.lightgray, C.fog, C.fog],
    night: [C.night, C.night, C.navy, C.purple],
  }[mood];
  p.gradV(0, 0, w, h, stops);
}

export function cloud(p: Painter, x: number, y: number, s = 1, c = C.white, shade = C.foam) {
  p.ellipse(x, y + 2 * s, 14 * s, 5 * s, shade);
  p.ellipse(x - 6 * s, y, 8 * s, 5 * s, c);
  p.ellipse(x + 5 * s, y - 2 * s, 9 * s, 6 * s, c);
  p.ellipse(x + 12 * s, y + 1 * s, 6 * s, 4 * s, c);
}

export function stars(p: Painter, w: number, h: number, seed = 3) {
  const r = rng(seed);
  for (let i = 0; i < w * h * 0.004; i++) p.px(r.int(0, w - 1), r.int(0, h - 1), r.chance(0.3) ? C.glow : C.white);
}

export function sea(p: Painter, x: number, y: number, w: number, h: number) {
  p.gradV(x, y, w, h, [C.skyblue, C.sea, C.sea, C.seadark]);
  const r = rng(77);
  for (let i = 0; i < w * h * 0.02; i++) {
    const yy = y + r.int(1, h - 1);
    const xx = x + r.int(0, w - 1);
    p.hline(xx, xx + r.int(2, 6), yy, (yy - y) < h / 3 ? C.foam : C.skyblue);
  }
}

/** Animated foam lines along a shore. */
export function surf(p: Painter, t: number, pts: Pt[], phase = 0) {
  const k = (Math.sin(t / 700 + phase) + 1) / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const off = Math.round(k * 3);
    p.line(x0, y0 - off, x1, y1 - off, C.foam);
    if (i % 2 === 0) p.line(x0 + 3, y0 - off - 2, x1 - 3, y1 - off - 2, C.white);
  }
}

export function sand(p: Painter, x: number, y: number, w: number, h: number, seed = 5) {
  p.gradV(x, y, w, h, [C.sand, C.sand, C.sandshade]);
  p.speckle(x, y, w, h, C.sandshade, 0.03, seed);
  p.speckle(x, y, w, h, C.white, 0.006, seed + 1);
}

export function palm(p: Painter, x: number, y: number, h: number, lean = 8, seed = 1) {
  // trunk: wobbly segments
  const segs = Math.round(h / 6);
  for (let i = 0; i < segs; i++) {
    const t = i / segs;
    const cx = x + Math.sin(t * 1.6) * lean;
    const cy = y - i * 6;
    const w = 6 - t * 2;
    p.poly([[cx - w / 2, cy], [cx + w / 2, cy], [cx + w / 2 + 1, cy - 6], [cx - w / 2 + 1, cy - 6]], i % 2 ? C.wood : C.woodlight);
    p.hline(cx - w / 2, cx + w / 2, cy - 1, C.brown);
  }
  const tx = x + Math.sin(1.6) * lean, ty = y - segs * 6;
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI + (i / 6) * Math.PI + r.next() * 0.3;
    const len = 18 + r.int(0, 8);
    const ex = tx + Math.cos(a) * len, ey = ty + Math.sin(a) * len * 0.5 + 10;
    const mx = tx + Math.cos(a) * len * 0.5, my = ty + Math.sin(a) * len * 0.5 - 4;
    p.poly([[tx, ty], [mx, my - 3], [ex, ey], [mx, my + 3]], i % 2 ? C.green : C.darkgreen);
    p.line(tx, ty, ex, ey, C.darkgreen);
  }
  p.circle(tx - 2, ty + 2, 2, C.brown);
  p.circle(tx + 2, ty + 3, 2, C.darkbrown);
}

export function rock(p: Painter, x: number, y: number, w: number, h: number, seed = 1, c = C.stone, shade = C.stoneshade) {
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI;
    pts.push([x + w / 2 + Math.cos(a) * (w / 2) * (0.85 + r.next() * 0.2), y + Math.sin(a) * h * (0.8 + r.next() * 0.25)]);
  }
  p.poly(pts, c);
  p.poly(pts.slice(5).concat([[x + w, y]]), shade);
  p.hline(x, x + w, y, shade);
}

/** Wooden sign on a post with painted text. */
export function signpost(p: Painter, x: number, y: number, w: number, lines: string[], postH = 14, board = C.woodlight, ink = C.darkbrown) {
  const h = lines.length * 9 + 5;
  p.rect(x + w / 2 - 1, y + h - 1, 3, postH, C.wood);
  p.poly([[x, y + 1], [x + w, y], [x + w + 1, y + h - 1], [x - 1, y + h]], board);
  p.hline(x, x + w, y + h - 1, C.wood);
  lines.forEach((l, i) => drawText(p, l, Math.round(x + w / 2 - textWidth(l) / 2), y + 3 + i * 9, ink));
}

export function crate(p: Painter, x: number, y: number, w: number, h: number, open = false) {
  p.rect(x, y, w, h, C.woodlight);
  p.frame(x, y, w, h, C.wood);
  p.line(x, y, x + w - 1, y + h - 1, C.wood);
  p.line(x + w - 1, y, x, y + h - 1, C.wood);
  // top face (perspective)
  p.poly([[x, y], [x + w, y], [x + w - 4, y - 5], [x + 4, y - 5]], open ? C.darkbrown : C.tan);
  if (open) p.poly([[x + w - 2, y - 4], [x + w + 8, y - 14], [x + w + 12, y - 10], [x + w + 2, y]], C.woodlight);
}

export function barrel(p: Painter, x: number, y: number, w: number, h: number, c = C.wood) {
  p.rect(x, y + 2, w, h - 4, c);
  p.ellipse(x + w / 2, y + 2, w / 2, 2, C.woodlight);
  p.ellipse(x + w / 2, y + h - 2, w / 2, 2, c);
  p.hline(x, x + w - 1, y + Math.round(h * 0.3), C.darkgray);
  p.hline(x, x + w - 1, y + Math.round(h * 0.7), C.darkgray);
  p.vline(x + 2, y + 3, y + h - 3, C.woodlight);
}

/** Leaning cartoon door. */
export function door(p: Painter, x: number, y: number, w: number, h: number, c = C.wood, open = false) {
  p.poly([[x, y + 2], [x + w, y], [x + w + 1, y + h], [x - 1, y + h]], open ? C.darkbrown : c);
  if (!open) {
    for (let i = 1; i < 3; i++) p.line(x + (w * i) / 3, y + 1, x + (w * i) / 3, y + h - 1, C.darkbrown);
    p.circle(x + w - 4, y + h / 2 + 2, 1, C.gold);
  } else {
    p.poly([[x + w, y], [x + w + 6, y + 3], [x + w + 7, y + h + 2], [x + w + 1, y + h]], c);
  }
}

export function windowPane(p: Painter, x: number, y: number, w: number, h: number, glass = C.skyblue, frameC = C.woodlight, lit = false) {
  p.rect(x - 2, y - 2, w + 4, h + 4, frameC);
  p.gradV(x, y, w, h, lit ? [C.glow, C.yellow] : [glass, C.white, glass]);
  p.vline(x + w / 2, y, y + h - 1, frameC);
  p.hline(x, x + w - 1, y + h / 2, frameC);
}

/** Simple building facade with crooked roof. */
export function house(p: Painter, x: number, y: number, w: number, h: number, wall: number, roof: number, seed = 1) {
  const r = rng(seed);
  const skew = r.int(-3, 3);
  p.poly([[x, y], [x + w, y + skew], [x + w, y + h], [x, y + h]], wall);
  p.speckle(x, y, w, h, [wall, C.black, '25'], 0.02, seed);
  p.poly([[x - 6, y + 2], [x + w / 2 + skew, y - h * 0.45], [x + w + 6, y + skew + 2]], roof);
  p.line(x - 6, y + 2, x + w + 6, y + skew + 2, C.ink);
}

export function bush(p: Painter, x: number, y: number, s = 1, c = C.green, shade = C.darkgreen) {
  p.ellipse(x, y, 9 * s, 6 * s, shade);
  p.ellipse(x - 4 * s, y - 3 * s, 6 * s, 5 * s, c);
  p.ellipse(x + 4 * s, y - 2 * s, 6 * s, 5 * s, c);
  p.px(x - 3 * s, y - 5 * s, C.lime);
}

export function grassTufts(p: Painter, x: number, y: number, w: number, h: number, seed = 2, c = C.green) {
  const r = rng(seed);
  for (let i = 0; i < (w * h) / 40; i++) {
    const gx = x + r.int(0, w), gy = y + r.int(0, h);
    p.line(gx, gy, gx - 1, gy - 3, c);
    p.line(gx + 1, gy, gx + 2, gy - 3, c);
  }
}

export function bottle(p: Painter, x: number, y: number, c = C.lime) {
  p.rect(x, y, 4, 7, c);
  p.rect(x + 1, y - 3, 2, 3, c);
  p.px(x + 1, y - 4, C.wood);
  p.px(x + 1, y + 1, C.white);
  p.rect(x + 1, y + 2, 2, 3, C.white);
}

export function textOn(p: Painter, s: string, x: number, y: number, c: number) {
  drawText(p, s, x, y, c);
}

export function centeredText(p: Painter, s: string, cx: number, y: number, c: number) {
  drawText(p, s, Math.round(cx - textWidth(s) / 2), y, c);
}

/** Plank floor / wall with grain. */
export function planks(p: Painter, x: number, y: number, w: number, h: number, vertical: boolean, a = C.wood, b = C.woodlight, seed = 4) {
  const r = rng(seed);
  if (vertical) {
    for (let i = 0; i < w; i += 8) {
      p.rect(x + i, y, 8, h, i % 16 ? a : b);
      p.vline(x + i, y, y + h - 1, C.darkbrown);
      for (let k = 0; k < 3; k++) { const yy = y + r.int(0, h); p.vline(x + i + r.int(2, 6), yy, yy + r.int(3, 8), C.brown); }
    }
  } else {
    for (let j = 0; j < h; j += 6) {
      p.rect(x, y + j, w, 6, j % 12 ? a : b);
      p.hline(x, x + w - 1, y + j, C.darkbrown);
      for (let k = 0; k < w / 20; k++) { const xx = x + r.int(0, w); p.hline(xx, xx + r.int(4, 10), y + j + r.int(2, 4), C.brown); }
    }
  }
}

/** Stone block wall. */
export function bricks(p: Painter, x: number, y: number, w: number, h: number, c = C.stone, mortar = C.stoneshade, bw = 12, bh = 6) {
  p.rect(x, y, w, h, c);
  for (let j = 0; j < h; j += bh) {
    p.hline(x, x + w - 1, y + j, mortar);
    const off = (j / bh) % 2 ? bw / 2 : 0;
    for (let i = -off; i < w; i += bw) p.vline(x + i, y + j, y + j + bh - 1, mortar);
  }
}

export function lantern(p: Painter, x: number, y: number, lit = true) {
  p.vline(x + 2, y - 4, y, C.darkgray);
  p.rect(x, y, 5, 6, C.darkgray);
  p.rect(x + 1, y + 1, 3, 4, lit ? C.glow : C.gray);
}

export function seagull(p: Painter, x: number, y: number, t: number) {
  const up = Math.floor(t / 180) % 2;
  p.line(x - 4, y + (up ? -2 : 1), x, y, C.white);
  p.line(x, y, x + 4, y + (up ? -2 : 1), C.white);
}
