// Render a room (background, animation frame, NPCs, Mac, front layer) to PNG.
// Usage: npx tsx tools/preview-room.ts <roomId> <out.png> [flagsJSON] [role]
import { Bitmap, Painter } from '../src/engine/paint';
import { SpriteCache } from '../src/engine/sprite';
import { headlessGame } from '../src/engine/headless';
import { content } from '../src/content/index';
import { C } from '../src/engine/palette';
import { WalkMap } from '../src/engine/walk';
import { writePng } from './png';

const [roomId, out = 'room.png', flagsJson = '{}', role = 'anonymous', debug = ''] = process.argv.slice(2);
const { core, pres } = headlessGame(content);
Object.assign(core.state.flags, JSON.parse(flagsJson));
core.state.role = role as any;
core.state.room = roomId;
const room = content.rooms[roomId];
pres.enterRoom(room, room.start ?? [160, 120], room.startFace ?? 'front');
const w = room.width ?? 320;
const bmp = new Bitmap(w, 144);
const p = new Painter(bmp);
room.paint(p, core);
room.anim?.(p, core, 1000);
const cache = new SpriteCache();
const scale = (y: number) => {
  if (!room.scale) return 1;
  const [y0, s0, y1, s1] = room.scale;
  const t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));
  return s0 + (s1 - s0) * t;
};
const actors = [...pres.actors.entries()].filter(([id, a]) => a.visible && content.characters[id]).sort((a, b) => a[1].y - b[1].y);
for (const [id, a] of actors) {
  const def = content.characters[id];
  const sc = scale(a.y) * (id === 'mac' ? room.macScale ?? 1 : 1);
  const b = cache.get(def, { dir: a.dir, walk: -1, talk: false, t: 1000, gesture: a.gesture });
  p.blit(b, Math.round(a.x - (b.w * sc) / 2), Math.round(a.y - b.h * sc + 1), { scale: sc, flip: a.dir === 'left' });
}
if (room.front) room.front(p, core);
room.animFront?.(p, core, 1000);
if (debug) {
  const polys = typeof room.walk === 'function' ? room.walk(core) : room.walk;
  const m = new WalkMap(w, 144, polys);
  for (let y = 0; y < 144; y += 2) for (let x = (y / 2) % 2 ? 1 : 0; x < w; x += 3) if (m.mask[y * w + x]) p.px(x, y, C.lime);
  for (const h of room.hotspots) {
    if (h.when && !h.when(core)) continue;
    if (h.rect) p.frame(h.rect[0], h.rect[1], h.rect[2], h.rect[3], C.magenta);
    if (h.poly) p.polyline(h.poly, C.magenta, true);
  }
}
writePng(out, bmp, 3);
console.log('wrote', out);
