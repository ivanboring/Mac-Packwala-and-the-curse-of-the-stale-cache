// The desktop app icon: Mac on a teal tile, 128x128 pixels drawn at 4x -> build/icon.png (512x512).
// Usage: npx tsx tools/make-icon.ts
import { Bitmap, Painter } from '../src/engine/paint';
import { renderCharacter } from '../src/engine/sprite';
import { C } from '../src/engine/palette';
import { content } from '../src/content/index';
import { writePng } from './png';

const S = 128;
const bmp = new Bitmap(S, S);
const p = new Painter(bmp);
p.rect(0, 0, S, S, C.clear);
p.ellipse(S / 2, S / 2, 63, 63, C.nodedark);
p.ellipse(S / 2, S / 2, 60, 60, C.node);
p.ellipse(S / 2 - 18, S / 2 - 22, 16, 12, C.nodelight);
// Mac, big: head and shoulders, cropped by the circle
const mac = renderCharacter(content.characters.mac, { dir: 'front', walk: -1, talk: false, t: 500 });
const sc = 3;
p.blit(mac, Math.round(S / 2 - (mac.w * sc) / 2), 18, { scale: sc });
for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
  if (Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2) > 63) bmp.data[y * S + x] = 0;
}
// rim on top of Mac, so the crop is clean
for (let a = 0; a < 720; a++) {
  const t = (a / 720) * Math.PI * 2;
  for (const r of [61, 62, 63]) p.px(Math.round(S / 2 - 0.5 + Math.cos(t) * r), Math.round(S / 2 - 0.5 + Math.sin(t) * r), C.nodedark);
}
writePng('build/icon.png', bmp, 4, 0x00000000);
console.log('wrote build/icon.png');
