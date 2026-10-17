// Walkable-area mask + grid A* with line-of-sight smoothing.
// Rooms describe walk areas as a union of polygons; we rasterize them once.
import type { Pt } from './paint';

const CELL = 3;

export class WalkMap {
  w: number;
  h: number;
  mask: Uint8Array;
  private gw: number;
  private gh: number;
  private grid: Uint8Array;

  constructor(width: number, height: number, polys: Pt[][]) {
    this.w = width;
    this.h = height;
    this.mask = new Uint8Array(width * height);
    for (const poly of polys) this.fill(poly);
    this.gw = Math.ceil(width / CELL);
    this.gh = Math.ceil(height / CELL);
    this.grid = new Uint8Array(this.gw * this.gh);
    for (let gy = 0; gy < this.gh; gy++) for (let gx = 0; gx < this.gw; gx++) {
      const x = Math.min(width - 1, gx * CELL + 1), y = Math.min(height - 1, gy * CELL + 1);
      this.grid[gy * this.gw + gx] = this.mask[y * width + x];
    }
  }

  private fill(pts: Pt[]) {
    let minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    const xs: number[] = [];
    for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(this.h - 1, Math.ceil(maxY)); y++) {
      const sy = y + 0.5;
      xs.length = 0;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi <= sy && yj > sy) || (yj <= sy && yi > sy)) xs.push(xi + ((sy - yi) / (yj - yi)) * (xj - xi));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(this.w, Math.round(xs[k + 1])); x++) this.mask[y * this.w + x] = 1;
      }
    }
  }

  ok(x: number, y: number): boolean {
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return false;
    return this.mask[y * this.w + x] === 1;
  }

  /** Closest walkable pixel to (x,y). */
  nearest(x: number, y: number): Pt {
    x = Math.round(x); y = Math.round(y);
    if (this.ok(x, y)) return [x, y];
    for (let r = 1; r < Math.max(this.w, this.h); r++) {
      let best: Pt | null = null, bd = Infinity;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        if (this.ok(x + dx, y + dy)) {
          // Prefer vertical moves less: people expect to walk "to" the spot horizontally.
          const d = dx * dx + dy * dy * 1.5;
          if (d < bd) { bd = d; best = [x + dx, y + dy]; }
        }
      }
      if (best) return best;
    }
    return [x, y];
  }

  lineOk(a: Pt, b: Pt): boolean {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)));
    for (let i = 0; i <= n; i++) {
      const t = n === 0 ? 0 : i / n;
      if (!this.ok(a[0] + dx * t, a[1] + dy * t)) return false;
    }
    return true;
  }

  /** Path from a to b (b snapped to the walk area). Returns waypoints excluding a. */
  path(a: Pt, bIn: Pt): Pt[] {
    const start = this.nearest(a[0], a[1]);
    const goal = this.nearest(bIn[0], bIn[1]);
    if (this.lineOk(start, goal)) return [goal];
    const { gw, gh, grid } = this;
    const toG = (p: Pt) => {
      let gx = Math.min(gw - 1, Math.max(0, Math.floor(p[0] / CELL)));
      let gy = Math.min(gh - 1, Math.max(0, Math.floor(p[1] / CELL)));
      if (!grid[gy * gw + gx]) {
        // nudge into a walkable cell
        let found = false;
        for (let r = 1; r < 6 && !found; r++) for (let dy = -r; dy <= r && !found; dy++) for (let dx = -r; dx <= r && !found; dx++) {
          const nx = gx + dx, ny = gy + dy;
          if (nx >= 0 && ny >= 0 && nx < gw && ny < gh && grid[ny * gw + nx]) { gx = nx; gy = ny; found = true; }
        }
      }
      return gy * gw + gx;
    };
    const s = toG(start), g = toG(goal);
    const N = gw * gh;
    const gScore = new Float32Array(N).fill(Infinity);
    const came = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    // binary heap
    const heap: number[] = [];
    const f = new Float32Array(N).fill(Infinity);
    const push = (n: number) => {
      heap.push(n);
      let i = heap.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (f[heap[p]] <= f[heap[i]]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop()!;
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < heap.length && f[heap[l]] < f[heap[m]]) m = l;
          if (r < heap.length && f[heap[r]] < f[heap[m]]) m = r;
          if (m === i) break;
          [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;
        }
      }
      return top;
    };
    const gx1 = g % gw, gy1 = Math.floor(g / gw);
    const hfn = (n: number) => { const x = n % gw, y = Math.floor(n / gw); return Math.hypot(x - gx1, y - gy1); };
    gScore[s] = 0; f[s] = hfn(s); push(s);
    let reached = false;
    while (heap.length) {
      const cur = pop();
      if (cur === g) { reached = true; break; }
      if (closed[cur]) continue;
      closed[cur] = 1;
      const cx = cur % gw, cy = Math.floor(cur / gw);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const nb = ny * gw + nx;
        if (!grid[nb] || closed[nb]) continue;
        if (dx && dy && (!grid[cy * gw + nx] || !grid[ny * gw + cx])) continue;
        const ng = gScore[cur] + (dx && dy ? 1.414 : 1);
        if (ng < gScore[nb]) { gScore[nb] = ng; came[nb] = cur; f[nb] = ng + hfn(nb); push(nb); }
      }
    }
    if (!reached) return [goal];
    const cells: Pt[] = [];
    for (let n = g; n !== -1 && n !== s; n = came[n]) {
      cells.push([(n % gw) * CELL + 1, Math.floor(n / gw) * CELL + 1]);
    }
    cells.reverse();
    cells.push(goal);
    // string-pull smoothing
    const out: Pt[] = [];
    let anchor = start;
    let i = 0;
    while (i < cells.length) {
      let j = cells.length - 1;
      while (j > i && !this.lineOk(anchor, cells[j])) j--;
      out.push(cells[j]);
      anchor = cells[j];
      i = j + 1;
    }
    return out;
  }
}
