import { Bitmap, Painter, outline } from './paint';
import { C } from './palette';
import type { CharacterDef, PuppetPose } from './types';

/** Render one frame of a character: drawn facing right (left = mirrored at blit time). */
export function renderCharacter(def: CharacterDef, pose: PuppetPose): Bitmap {
  const b = new Bitmap(def.w, def.h);
  const p = new Painter(b);
  def.draw(p, { ...pose, dir: pose.dir === 'left' ? 'right' : pose.dir });
  outline(b, C.ink);
  return b;
}

/** Simple per-frame cache: most frames repeat. */
export class SpriteCache {
  private map = new Map<string, Bitmap>();
  get(def: CharacterDef, pose: PuppetPose): Bitmap {
    const blinkPhase = (pose.t % 3700) < 140 ? 1 : 0;
    const idle = Math.floor(pose.t / 500) % 8;
    const key = `${def.id}|${pose.dir === 'left' ? 'right' : pose.dir}|${pose.walk}|${pose.talk ? 1 : 0}|${blinkPhase}|${pose.gesture ?? ''}|${idle}`;
    let b = this.map.get(key);
    if (!b) {
      // quantize time so cached frames are deterministic
      b = renderCharacter(def, { ...pose, t: blinkPhase ? 0 : 200 + idle * 400 });
      if (this.map.size > 3000) this.map.clear();
      this.map.set(key, b);
    }
    return b;
  }
}
