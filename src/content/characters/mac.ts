import { drawHuman, type HumanSpec } from '../../engine/puppet';
import { C } from '../../engine/palette';
import type { CharacterDef } from '../../engine/types';

// Mac Packwala: modeled on the workflows-of-ai.com pixel avatar.
// Black swept quiff, pointy nose, black tee with a white drop, grey trousers,
// black watch, and the backpack that gives him his surname.
export const macSpec: HumanSpec = {
  skin: C.skin,
  skinShade: C.skinshade,
  hair: C.brandink,
  hairStyle: 'swoop',
  headW: 7,
  headH: 8,
  nose: 'pointy',
  noseLen: 6,
  eyes: 'normal',
  brows: C.brandink,
  shirt: C.brandink,
  shirtShade: C.darkgray,
  torsoW: 10,
  torsoH: 15,
  sleeve: 'short',
  legs: C.gray,
  legsShade: C.brandslate,
  legLen: 17,
  shoes: C.brandink,
  logo: (p, x, y, side) => {
    // little white drop, as on the workflows-of-ai.com avatar
    const lx = side ? x + 1 : x;
    p.px(lx, y, C.white);
    p.rect(lx - 1, y + 1, 3, 1, C.white);
    p.rect(lx - 2, y + 2, 5, 2, C.white);
    p.rect(lx - 1, y + 4, 3, 1, C.white);
  },
  behind: (p, a) => {
    if (a.side) {
      // backpack on his back (left side when facing right)
      p.rect(a.cx - a.spec.torsoW / 2 - 4, a.shoulderY + 1, 5, 11, C.brandblue);
      p.rect(a.cx - a.spec.torsoW / 2 - 4, a.shoulderY + 7, 5, 1, C.navy);
      p.rect(a.cx - a.spec.torsoW / 2 - 3, a.shoulderY + 9, 3, 2, C.brandbluelight);
    } else if (a.back) {
      p.rect(a.cx - 5, a.shoulderY + 1, 11, 12, C.brandblue);
      p.rect(a.cx - 3, a.shoulderY + 6, 7, 4, C.brandbluelight);
      p.hline(a.cx - 5, a.cx + 5, a.shoulderY + 5, C.navy);
    }
  },
  extras: (p, a) => {
    if (a.front) {
      // backpack straps
      p.vline(a.cx - 3, a.shoulderY + 1, a.shoulderY + 7, C.brandblue);
      p.vline(a.cx + 3, a.shoulderY + 1, a.shoulderY + 7, C.brandblue);
    }
    if (a.side && !a.back) {
      p.vline(a.cx + 2, a.shoulderY + 1, a.shoulderY + 6, C.brandblue);
      // watch
      p.rect(a.handX - 1, a.handY - 3, 3, 1, C.black);
    }
  },
};

export const mac: CharacterDef = {
  id: 'mac',
  name: 'Mac Packwala',
  color: 'white',
  w: 40,
  h: 62,
  speed: 70,
  draw: (p, pose) => drawHuman(p, macSpec, pose, 40, 62),
};
