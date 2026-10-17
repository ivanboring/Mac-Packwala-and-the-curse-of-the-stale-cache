// Hotspot hit testing. When areas overlap, the smallest one under the cursor wins,
// so a bottle in front of a big sign stays clickable whatever order they are listed in.
import type { Pt } from './paint';
import type { Hotspot } from './types';

export function pointInPoly(x: number, y: number, pts: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function hotspotArea(h: Hotspot): number {
  if (h.rect) return h.rect[2] * h.rect[3];
  if (!h.poly) return Infinity;
  let a = 0;
  for (let i = 0, j = h.poly.length - 1; i < h.poly.length; j = i++) a += (h.poly[j][0] + h.poly[i][0]) * (h.poly[j][1] - h.poly[i][1]);
  return Math.abs(a / 2);
}

export function hits(h: Hotspot, x: number, y: number): boolean {
  if (h.rect) return x >= h.rect[0] && y >= h.rect[1] && x < h.rect[0] + h.rect[2] && y < h.rect[1] + h.rect[3];
  return !!h.poly && pointInPoly(x, y, h.poly);
}

/** The hotspot (not actor-bound) at room point x,y: smallest area first, later in the list on a tie. */
export function hotspotAt(list: Hotspot[], x: number, y: number): Hotspot | undefined {
  let best: Hotspot | undefined, bestArea = Infinity;
  for (const h of list) {
    if (h.actor || !hits(h, x, y)) continue;
    const a = hotspotArea(h);
    if (a <= bestArea) { best = h; bestArea = a; }
  }
  return best;
}
