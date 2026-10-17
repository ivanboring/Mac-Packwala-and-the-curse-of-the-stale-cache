// Pixel painter: integer-only drawing into a Uint32 bitmap, so every pixel is
// a palette color (no antialiasing). This is what gives the chunky VGA look.

export type Fill =
  | number
  | [number, number]
  | [number, number, '25' | '75' | 'h' | 'v' | 'check'];

export type Pt = [number, number];

export class Bitmap {
  data: Uint32Array;
  constructor(public w: number, public h: number) {
    this.data = new Uint32Array(w * h);
  }
  clear(c = 0) {
    this.data.fill(c);
  }
  get(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.data[y * this.w + x];
  }
  clone(): Bitmap {
    const b = new Bitmap(this.w, this.h);
    b.data.set(this.data);
    return b;
  }
}

const BAYER4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

/** Ordered-dither between a and b; t in [0,1] is the share of b. */
export function ditherMix(x: number, y: number, a: number, b: number, t: number): number {
  const th = (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16;
  return t > th ? b : a;
}

function resolve(f: Fill, x: number, y: number): number {
  if (typeof f === 'number') return f;
  const [a, b, mode] = f;
  switch (mode) {
    case '25': return ((x & 1) === 0 && (y & 1) === 0) ? b : a;
    case '75': return ((x & 1) === 0 && (y & 1) === 0) ? a : b;
    case 'h': return (y & 1) ? b : a;
    case 'v': return (x & 1) ? b : a;
    default: return ((x + y) & 1) ? b : a;
  }
}

export class Painter {
  ox = 0;
  oy = 0;
  cx0 = 0;
  cy0 = 0;
  cx1: number;
  cy1: number;

  constructor(public bmp: Bitmap) {
    this.cx1 = bmp.w;
    this.cy1 = bmp.h;
  }

  setClip(x: number, y: number, w: number, h: number) {
    this.cx0 = Math.max(0, x);
    this.cy0 = Math.max(0, y);
    this.cx1 = Math.min(this.bmp.w, x + w);
    this.cy1 = Math.min(this.bmp.h, y + h);
  }
  resetClip() {
    this.cx0 = 0; this.cy0 = 0; this.cx1 = this.bmp.w; this.cy1 = this.bmp.h;
  }

  px(x: number, y: number, f: Fill) {
    x = Math.round(x) + this.ox;
    y = Math.round(y) + this.oy;
    if (x < this.cx0 || y < this.cy0 || x >= this.cx1 || y >= this.cy1) return;
    const c = resolve(f, x, y);
    if (c === 0) return;
    this.bmp.data[y * this.bmp.w + x] = c;
  }

  /** Raw span in buffer coordinates (already offset). */
  private span(x0: number, x1: number, y: number, f: Fill) {
    if (y < this.cy0 || y >= this.cy1) return;
    if (x0 > x1) [x0, x1] = [x1, x0];
    x0 = Math.max(this.cx0, x0);
    x1 = Math.min(this.cx1 - 1, x1);
    const row = y * this.bmp.w;
    const d = this.bmp.data;
    if (typeof f === 'number') {
      if (f === 0) return;
      for (let x = x0; x <= x1; x++) d[row + x] = f;
    } else {
      for (let x = x0; x <= x1; x++) {
        const c = resolve(f, x, y);
        if (c !== 0) d[row + x] = c;
      }
    }
  }

  hline(x0: number, x1: number, y: number, f: Fill) {
    this.span(Math.round(x0) + this.ox, Math.round(x1) + this.ox, Math.round(y) + this.oy, f);
  }

  vline(x: number, y0: number, y1: number, f: Fill) {
    if (y0 > y1) [y0, y1] = [y1, y0];
    for (let y = Math.round(y0); y <= Math.round(y1); y++) this.px(x, y, f);
  }

  rect(x: number, y: number, w: number, h: number, f: Fill) {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = 0; j < h; j++) this.span(x + this.ox, x + w - 1 + this.ox, y + j + this.oy, f);
  }

  frame(x: number, y: number, w: number, h: number, f: Fill) {
    this.hline(x, x + w - 1, y, f);
    this.hline(x, x + w - 1, y + h - 1, f);
    this.vline(x, y, y + h - 1, f);
    this.vline(x + w - 1, y, y + h - 1, f);
  }

  line(x0: number, y0: number, x1: number, y1: number, f: Fill) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.px(x0, y0, f);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  polyline(pts: Pt[], f: Fill, closed = false) {
    for (let i = 0; i < pts.length - 1; i++) this.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], f);
    if (closed && pts.length > 2) {
      const a = pts[pts.length - 1], b = pts[0];
      this.line(a[0], a[1], b[0], b[1], f);
    }
  }

  /** Scanline polygon fill (even-odd), sampled at pixel centers. */
  poly(pts: Pt[], f: Fill) {
    if (pts.length < 3) return;
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    const xs: number[] = [];
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi <= sy && yj > sy) || (yj <= sy && yi > sy)) {
          xs.push(xi + ((sy - yi) / (yj - yi)) * (xj - xi));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const a = Math.round(xs[k]), b = Math.round(xs[k + 1]) - 1;
        if (b >= a) this.span(a + this.ox, b + this.ox, y + this.oy, f);
      }
    }
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, f: Fill) {
    if (rx <= 0 || ry <= 0) { this.px(cx, cy, f); return; }
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const t = (y + 0.5 - cy) / ry;
      if (t < -1 || t > 1) continue;
      const dx = rx * Math.sqrt(1 - t * t);
      const a = Math.round(cx - dx), b = Math.round(cx + dx) - 1;
      if (b >= a) this.span(a + this.ox, b + this.ox, y + this.oy, f);
    }
  }

  circle(cx: number, cy: number, r: number, f: Fill) {
    this.ellipse(cx, cy, r, r, f);
  }

  ellipseOutline(cx: number, cy: number, rx: number, ry: number, f: Fill) {
    const steps = Math.max(16, Math.round((rx + ry) * 4));
    let px = -9999, py = -9999;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(a) * rx - 0.5);
      const y = Math.round(cy + Math.sin(a) * ry - 0.5);
      if (x !== px || y !== py) this.px(x, y, f);
      px = x; py = y;
    }
  }

  /** Vertical gradient through color stops with ordered dithering between bands. */
  gradV(x: number, y: number, w: number, h: number, stops: number[]) {
    const n = stops.length - 1;
    for (let j = 0; j < h; j++) {
      const t = h <= 1 ? 0 : (j / (h - 1)) * n;
      const i = Math.min(n - 1, Math.floor(t));
      const frac = n === 0 ? 0 : t - i;
      const a = stops[i], b = stops[Math.min(n, i + 1)];
      const yy = y + j + this.oy;
      if (yy < this.cy0 || yy >= this.cy1) continue;
      for (let k = 0; k < w; k++) {
        const xx = x + k + this.ox;
        if (xx < this.cx0 || xx >= this.cx1) continue;
        this.bmp.data[yy * this.bmp.w + xx] = ditherMix(xx, yy, a, b, frac);
      }
    }
  }

  gradH(x: number, y: number, w: number, h: number, stops: number[]) {
    const n = stops.length - 1;
    for (let k = 0; k < w; k++) {
      const t = w <= 1 ? 0 : (k / (w - 1)) * n;
      const i = Math.min(n - 1, Math.floor(t));
      const frac = n === 0 ? 0 : t - i;
      const a = stops[i], b = stops[Math.min(n, i + 1)];
      for (let j = 0; j < h; j++) {
        const xx = x + k + this.ox, yy = y + j + this.oy;
        if (xx < this.cx0 || yy < this.cy0 || xx >= this.cx1 || yy >= this.cy1) continue;
        this.bmp.data[yy * this.bmp.w + xx] = ditherMix(xx, yy, a, b, frac);
      }
    }
  }

  /** Fill a polygon with a vertical gradient. */
  polyGradV(pts: Pt[], stops: number[]) {
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    const h = Math.max(1, maxY - minY);
    const n = stops.length - 1;
    const xs: number[] = [];
    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi <= sy && yj > sy) || (yj <= sy && yi > sy)) xs.push(xi + ((sy - yi) / (yj - yi)) * (xj - xi));
      }
      xs.sort((a, b) => a - b);
      const t = Math.max(0, Math.min(1, (y - minY) / h)) * n;
      const i = Math.min(n - 1, Math.floor(t));
      const frac = t - i;
      const a = stops[i], b = stops[Math.min(n, i + 1)];
      const yy = y + this.oy;
      if (yy < this.cy0 || yy >= this.cy1) continue;
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const x0 = Math.max(this.cx0, Math.round(xs[k]) + this.ox);
        const x1 = Math.min(this.cx1 - 1, Math.round(xs[k + 1]) - 1 + this.ox);
        for (let xx = x0; xx <= x1; xx++) this.bmp.data[yy * this.bmp.w + xx] = ditherMix(xx, yy, a, b, frac);
      }
    }
  }

  /** Random sprinkle of pixels (textures: sand, grass, stone). */
  speckle(x: number, y: number, w: number, h: number, f: Fill, density: number, seed = 1) {
    let s = seed * 9301 + 49297;
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const n = Math.round(w * h * density);
    for (let i = 0; i < n; i++) this.px(x + Math.floor(r() * w), y + Math.floor(r() * h), f);
  }

  /** Recolor every pixel of color `from` inside a rect (e.g. shading a region). */
  recolor(x: number, y: number, w: number, h: number, from: number, to: Fill) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const xx = x + i + this.ox, yy = y + j + this.oy;
      if (xx < this.cx0 || yy < this.cy0 || xx >= this.cx1 || yy >= this.cy1) continue;
      const idx = yy * this.bmp.w + xx;
      if (this.bmp.data[idx] === from) this.bmp.data[idx] = resolve(to, xx, yy);
    }
  }

  /** Copy a bitmap (0 = transparent). Optional nearest-neighbour scale and horizontal flip. */
  blit(src: Bitmap, dx: number, dy: number, opts: { flip?: boolean; scale?: number; tint?: number } = {}) {
    const scale = opts.scale ?? 1;
    const dw = Math.max(1, Math.round(src.w * scale));
    const dh = Math.max(1, Math.round(src.h * scale));
    dx = Math.round(dx) + this.ox;
    dy = Math.round(dy) + this.oy;
    const d = this.bmp.data, W = this.bmp.w;
    for (let j = 0; j < dh; j++) {
      const yy = dy + j;
      if (yy < this.cy0 || yy >= this.cy1) continue;
      const sy = Math.min(src.h - 1, Math.floor(j / scale));
      for (let i = 0; i < dw; i++) {
        const xx = dx + i;
        if (xx < this.cx0 || xx >= this.cx1) continue;
        let sx = Math.min(src.w - 1, Math.floor(i / scale));
        if (opts.flip) sx = src.w - 1 - sx;
        const c = src.data[sy * src.w + sx];
        if (c !== 0) d[yy * W + xx] = opts.tint ?? c;
      }
    }
  }
}

/** Give every opaque shape a 1px cartoon outline (transparent neighbours become `color`). */
export function outline(bmp: Bitmap, color: number, diagonal = false) {
  const src = bmp.data.slice();
  const { w, h } = bmp;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (src[y * w + x] !== 0) continue;
    let hit = false;
    for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) {
      if (!dx && !dy) continue;
      if (!diagonal && dx && dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const c = src[ny * w + nx];
      if (c !== 0 && c !== color) hit = true;
    }
    if (hit) bmp.data[y * w + x] = color;
  }
}

/** Build a bitmap by drawing into it. */
export function makeBitmap(w: number, h: number, draw: (p: Painter) => void, outlineColor?: number): Bitmap {
  const b = new Bitmap(w, h);
  const p = new Painter(b);
  draw(p);
  if (outlineColor !== undefined) outline(b, outlineColor);
  return b;
}
