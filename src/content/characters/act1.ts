import { drawHuman, type HumanSpec } from '../../engine/puppet';
import { C } from '../../engine/palette';
import type { CharacterDef, PuppetPose } from '../../engine/types';
import type { Painter } from '../../engine/paint';

function human(id: string, name: string, color: CharacterDef['color'], spec: HumanSpec, w = 44, h = 64, extra: Partial<CharacterDef> = {}): CharacterDef {
  return { id, name, color, w, h, speed: 55, draw: (p, pose) => drawHuman(p, spec, pose, w, h), ...extra };
}

// ---- Cookie Consent Guard -------------------------------------------------------------
export const guard = human('guard', 'Cookie Consent Guard', 'yellow', {
  skin: C.skin, skinShade: C.skinshade, hair: C.brown, hairStyle: 'fringe',
  headW: 8, headH: 8, nose: 'big', noseLen: 6, noseColor: C.pink, eyes: 'normal', brows: C.brown,
  moustache: C.brown,
  shirt: C.navy, shirtShade: C.night, torsoW: 14, torsoH: 17, belly: 4, sleeve: 'long',
  legs: C.navy, legsShade: C.night, legLen: 15, shoes: C.black,
  extras: (p, a, pose) => {
    // helmet with a cookie badge
    p.ellipse(a.headX, a.headY - a.spec.headH + 1, a.spec.headW + 1, 4, C.navy);
    p.rect(a.headX - a.spec.headW - 2, a.headY - a.spec.headH + 3, a.spec.headW * 2 + 4, 2, C.night);
    p.circle(a.headX + (a.side ? 3 : 0), a.headY - a.spec.headH, 2, C.tan);
    // giant cookie shield
    if (!a.back) {
      const sx = a.side ? a.cx + 8 : a.cx - 10, sy = a.shoulderY + 10;
      p.circle(sx, sy, 8, C.tan);
      p.circle(sx, sy, 7, C.woodlight);
      for (const [dx, dy] of [[-3, -3], [2, -4], [-4, 2], [3, 1], [0, 4], [-1, -1]]) p.rect(sx + dx, sy + dy, 2, 2, C.darkbrown);
    }
    if (pose.gesture === 'loading') {
      // loading spinner over his head
      const k = Math.floor(pose.t / 120) % 8;
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        p.px(a.headX + Math.round(Math.cos(ang) * 4), a.headY - a.spec.headH - 9 + Math.round(Math.sin(ang) * 4), i === k ? C.white : C.gray);
      }
    }
  },
});

// ---- Crabby the linter ---------------------------------------------------------------
export const crab: CharacterDef = {
  id: 'crab', name: 'Crab', color: 'orange', w: 22, h: 14, speed: 30,
  draw: (p: Painter, pose: PuppetPose) => {
    const step = pose.walk >= 0 ? pose.walk % 2 : 0;
    const by = 9;
    for (let i = 0; i < 3; i++) {
      p.line(6 - i * 2, by + 1, 3 - i * 2, by + 4 - (step && i === 1 ? 1 : 0), C.darkred);
      p.line(15 + i * 2, by + 1, 18 + i * 2, by + 4 - (step && i === 1 ? 1 : 0), C.darkred);
    }
    p.ellipse(11, by, 7, 4, C.red);
    p.hline(6, 16, by + 2, C.darkred);
    // claws
    p.circle(3, by - 3 - step, 2, C.red);
    p.circle(19, by - 3 + step, 2, C.red);
    // eye stalks
    p.vline(9, by - 6, by - 3, C.darkred);
    p.vline(13, by - 6, by - 3, C.darkred);
    p.rect(8, by - 8, 2, 2, C.white); p.px(9, by - 7, C.black);
    p.rect(12, by - 8, 2, 2, C.white); p.px(12, by - 7, C.black);
    if (pose.talk) p.hline(10, 12, by + 1, C.black);
  },
};


// helpers for eye positions so extras can close eyes etc.
function eyeSpots(a: { headX: number; headY: number; side: boolean; front: boolean; spec: HumanSpec }): [number, number][] {
  const ey = a.headY - Math.round(a.spec.headH * 0.15);
  if (a.side) return [[a.headX + Math.round(a.spec.headW * 0.45), ey]];
  const off = Math.max(3, Math.round(a.spec.headW * 0.4));
  return [[a.headX - off, ey], [a.headX + off, ey]];
}
function closeEyes(p: Painter, a: Parameters<typeof eyeSpots>[0]) {
  if ((a as any).back) return;
  for (const [x, y] of eyeSpots(a)) {
    p.rect(x - 2, y - 2, 6, 5, a.spec.skin);
    p.hline(x - 1, x + 2, y, C.ink);
  }
}

// ---- Old Cron: poor man's cron, sleeps until someone visits ------------------------------
export const cron = human('cron', 'Old Cron', 'lavender', {
  skin: C.skin, skinShade: C.skinshade, hair: C.white, hairStyle: 'wild',
  headW: 8, headH: 9, nose: 'hook', noseLen: 6, noseColor: C.pink, eyes: 'sleepy', brows: C.white,
  beard: C.white,
  shirt: C.blue, shirtShade: C.navy, torsoW: 12, torsoH: 14, sleeve: 'long',
  legs: C.blue, legsShade: C.navy, legLen: 9, shoes: C.brown,
  robe: C.blue, robeShade: C.navy,
  extras: (p, a, pose) => {
    // nightcap
    const top = a.headY - a.spec.headH;
    p.poly([[a.headX - 8, top + 3], [a.headX + 8, top + 3], [a.headX + 14, top - 6], [a.headX + 2, top - 5]], C.red);
    p.circle(a.headX + 15, top - 6, 2, C.white);
    p.rect(a.headX - 9, top + 2, 18, 2, C.white);
    // pocket watch
    if (!a.back) { p.circle(a.cx + 3, a.shoulderY + 9, 2, C.gold); p.px(a.cx + 3, a.shoulderY + 9, C.white); }
    if (pose.gesture === 'sleep') closeEyes(p, a);
  },
}, 48, 64);

// ---- The Grand Maintainer: in maintenance mode for 15 years ----------------------------
export const maintainer = human('maintainer', 'The Grand Maintainer', 'gold', {
  skin: C.skin, skinShade: C.skinshade, hair: C.lightgray, hairStyle: 'bald',
  headW: 9, headH: 9, nose: 'big', noseLen: 8, noseColor: C.pink, eyes: 'glasses', brows: C.lightgray,
  moustache: C.lightgray,
  shirt: C.white, shirtShade: C.lightgray, torsoW: 14, torsoH: 15, belly: 3, sleeve: 'long',
  legs: C.white, legsShade: C.lightgray, legLen: 10, shoes: C.brown,
  robe: C.white, robeShade: C.lightgray,
  extras: (p, a) => {
    // laurel wreath
    const top = a.headY - a.spec.headH + 2;
    for (let i = -7; i <= 7; i += 3) p.rect(a.headX + i, top + Math.abs(i) / 3, 2, 2, C.green);
    // purple sash
    if (!a.back) p.line(a.cx - 6, a.shoulderY + 1, a.cx + 6, a.hipY - 1, C.purple);
    // the "UNDER MAINTENANCE" sign hanging round his neck
    if (!a.back) {
      const sx = a.cx - 11 + (a.side ? 3 : 0), sy = a.shoulderY + 4;
      p.line(a.cx - 3, a.shoulderY, sx + 3, sy, C.darkbrown);
      p.line(a.cx + 3, a.shoulderY, sx + 19, sy, C.darkbrown);
      p.rect(sx, sy, 22, 10, C.yellow);
      p.frame(sx, sy, 22, 10, C.darkbrown);
      for (let i = 0; i < 4; i++) p.rect(sx + 2 + i * 5, sy + 2, 3, 2, C.black);
      p.hline(sx + 2, sx + 19, sy + 6, C.darkbrown);
    }
  },
}, 50, 66);

// ---- Sign painter (needs an AI CKEditor assistant) -------------------------------------
export const painter = human('painter', 'Sign Painter', 'pink', {
  skin: C.skin, skinShade: C.skinshade, hair: C.brown, hairStyle: 'side',
  headW: 7, headH: 8, nose: 'long', noseLen: 8, eyes: 'normal', brows: C.darkbrown,
  moustache: C.darkbrown,
  shirt: C.white, shirtShade: C.lightgray, torsoW: 11, torsoH: 15, sleeve: 'long',
  legs: C.brandslate, legsShade: C.darkgray, legLen: 17, shoes: C.brown,
  logo: (p, x, y) => {
    p.px(x - 3, y, C.red); p.px(x + 2, y + 2, C.blue); p.px(x - 1, y + 5, C.yellow); p.px(x + 3, y + 7, C.green); p.px(x - 4, y + 8, C.brandpink);
  },
  extras: (p, a, pose) => {
    // beret
    const top = a.headY - a.spec.headH;
    p.ellipse(a.headX - 1, top + 1, a.spec.headW + 2, 3, C.red);
    p.px(a.headX - 1, top - 3, C.red);
    // brush in hand
    if (!a.back) {
      p.line(a.handX, a.handY, a.handX + 5, a.handY - 7, C.wood);
      p.rect(a.handX + 5, a.handY - 9, 2, 3, pose.gesture === 'paint' ? C.brandblue : C.red);
    }
  },
}, 44, 64);

// ---- Clerk Formsworth: the Form API joke -----------------------------------------------
export const formsworth = human('formsworth', 'Clerk Formsworth', 'lime', {
  skin: C.skin, skinShade: C.skinshade, hair: C.darkbrown, hairStyle: 'side',
  headW: 7, headH: 10, nose: 'pointy', noseLen: 7, eyes: 'glasses', brows: C.darkbrown,
  shirt: C.white, shirtShade: C.lightgray, torsoW: 9, torsoH: 15, sleeve: 'long',
  legs: C.darkgray, legsShade: C.black, legLen: 17, shoes: C.black,
  extras: (p, a) => {
    // green accountant's visor
    const top = a.headY - a.spec.headH + 3;
    p.rect(a.headX - a.spec.headW - 1, top, a.spec.headW * 2 + 2, 2, C.green);
    if (a.side) p.poly([[a.headX + 2, top], [a.headX + a.spec.headW + 6, top + 2], [a.headX + 2, top + 3]], [C.green, C.lime]);
    else p.rect(a.headX - a.spec.headW, top + 2, a.spec.headW * 2, 2, [C.green, C.lime]);
    // bow tie + sleeve garters
    if (!a.back) {
      p.poly([[a.cx - 4, a.shoulderY + 1], [a.cx, a.shoulderY + 3], [a.cx - 4, a.shoulderY + 5]], C.red);
      p.poly([[a.cx + 4, a.shoulderY + 1], [a.cx, a.shoulderY + 3], [a.cx + 4, a.shoulderY + 5]], C.red);
    }
  },
}, 44, 64);

// ---- Captain Hook_alter: the hooks joke ------------------------------------------------
export const hook = human('hook', 'Captain Hook_alter', 'red', {
  skin: C.skin, skinShade: C.skinshade, hair: C.brandink, hairStyle: 'bald',
  headW: 8, headH: 9, nose: 'big', noseLen: 7, noseColor: C.pink, eyes: 'patch', brows: C.brandink,
  beard: C.darkbrown,
  shirt: C.red, shirtShade: C.darkred, torsoW: 14, torsoH: 16, belly: 2, sleeve: 'long',
  legs: C.brandink, legsShade: C.darkgray, legLen: 15, shoes: C.black,
  extras: (p, a, pose) => {
    // tricorn hat with a skull
    const top = a.headY - a.spec.headH;
    p.poly([[a.headX - 13, top + 2], [a.headX, top - 7], [a.headX + 13, top + 2], [a.headX, top - 1]], C.brandink);
    p.circle(a.headX, top - 2, 2, C.white);
    p.px(a.headX - 1, top - 2, C.black); p.px(a.headX + 1, top - 2, C.black);
    // gold buttons
    if (!a.back) for (let i = 0; i < 3; i++) p.px(a.cx + (a.side ? 4 : 2), a.shoulderY + 3 + i * 4, C.gold);
    // the hook
    if (!a.back) {
      const hx = a.handX + 1, hy = a.handY + 1;
      p.rect(hx - 1, hy - 1, 3, 2, C.gray);
      p.line(hx, hy, hx, hy + 3, C.lightgray);
      p.line(hx, hy + 4, hx + 3, hy + 4, C.lightgray);
      p.px(hx + 3, hy + 3, C.lightgray);
      if (pose.gesture === 'weighted') {
        p.vline(hx + 1, hy + 5, hy + 8, C.darkgray);
        p.ellipse(hx + 1, hy + 10, 2, 2, C.gray);
      }
    }
  },
}, 50, 68);

// ---- Bartender Ignatius: a .gitignore in human form ------------------------------------
export const bartender = human('bartender', 'Bartender Ignatius', 'orange', {
  skin: C.skin, skinShade: C.skinshade, hair: C.darkbrown, hairStyle: 'bald',
  headW: 9, headH: 8, nose: 'round', noseLen: 6, noseColor: C.pink, eyes: 'sleepy', brows: C.darkbrown,
  moustache: C.darkbrown,
  shirt: C.white, shirtShade: C.lightgray, torsoW: 15, torsoH: 16, belly: 4, sleeve: 'short',
  legs: C.darkbrown, legsShade: C.brown, legLen: 15, shoes: C.black,
  extras: (p, a) => {
    if (a.back) return;
    // handlebar moustache tips + apron
    const my = a.headY + Math.round(a.spec.headH * 0.55) - 2;
    if (!a.side) { p.px(a.headX - 5, my - 1, C.darkbrown); p.px(a.headX + 5, my - 1, C.darkbrown); }
    p.rect(a.cx - 5, a.shoulderY + 5, 10, a.spec.torsoH - 4, C.brandmist);
    p.hline(a.cx - 6, a.cx + 5, a.shoulderY + 7, C.brandslate);
    // glass being polished, forever
    p.rect(a.handX - 1, a.handY - 6, 4, 5, C.foam);
    p.rect(a.handX - 2, a.handY - 3, 5, 2, C.white);
  },
}, 48, 64);

// ---- Wordy Pressington: there's a plugin for that! -------------------------------------
export const wordy = human('wordy', 'Wordy Pressington', 'skyblue', {
  skin: C.skin, skinShade: C.skinshade, hair: C.gold, hairStyle: 'side',
  headW: 8, headH: 9, nose: 'button', noseLen: 3, eyes: 'wide', brows: C.gold,
  shirt: C.orange, shirtShade: C.brown, torsoW: 13, torsoH: 16, sleeve: 'long',
  legs: C.navy, legsShade: C.night, legLen: 16, shoes: C.white,
  logo: (p, x, y, side) => {
    // loud check pattern + plugin-shaped tie
    for (let i = -4; i <= 4; i += 3) p.vline(x + i, y - 3, y + 9, C.yellow);
    if (!side) { p.rect(x - 1, y - 4, 3, 10, C.brandblue); p.rect(x - 2, y + 6, 5, 3, C.brandblue); }
  },
  extras: (p, a) => {
    if (a.back) return;
    // enormous salesman grin
    const my = a.headY + Math.round(a.spec.headH * 0.5);
    if (a.side) p.rect(a.headX + 1, my - 1, 6, 2, C.white);
    else { p.rect(a.headX - 4, my - 1, 9, 2, C.white); p.hline(a.headX - 4, a.headX + 4, my + 1, C.darkred); }
  },
}, 46, 66);

// ---- The Composer: plays `composer require` ---------------------------------------------
export const composer = human('composer', 'The Composer', 'magenta', {
  skin: C.skin, skinShade: C.skinshade, hair: C.white, hairStyle: 'wild',
  headW: 8, headH: 9, nose: 'hook', noseLen: 7, eyes: 'normal', brows: C.lightgray,
  shirt: C.brandink, shirtShade: C.darkgray, torsoW: 12, torsoH: 17, sleeve: 'long',
  legs: C.brandink, legsShade: C.darkgray, legLen: 16, shoes: C.black,
  behind: (p, a) => {
    // coat tails
    if (a.side) p.poly([[a.cx - 6, a.hipY - 2], [a.cx - 2, a.hipY - 2], [a.cx - 4, a.hipY + 10], [a.cx - 9, a.hipY + 9]], C.brandink);
  },
  extras: (p, a, pose) => {
    if (a.back) return;
    // white cravat
    p.rect(a.cx - 2, a.shoulderY, 5, 5, C.white);
    // baton
    if (pose.gesture === 'conduct') {
      p.line(a.handX, a.handY, a.handX + 8, a.handY - 10, C.white);
    } else p.line(a.handX, a.handY, a.handX + 6, a.handY + 3, C.white);
  },
}, 46, 66);

// ---- The Dependency Cat: cat ^2.0, piano needs ^3 ---------------------------------------
export const cat: CharacterDef = {
  id: 'cat', name: 'Dependency Cat', color: 'orange', w: 30, h: 22, speed: 90,
  draw: (p: Painter, pose: PuppetPose) => {
    const by = 21;
    const tail = Math.round(Math.sin(pose.t / 300) * 3);
    if (pose.walk >= 0) {
      const s = pose.walk % 2 ? 2 : -2;
      p.ellipse(14, by - 8, 9, 5, C.orange);
      for (const lx of [8, 11, 17, 20]) p.rect(lx + (lx < 14 ? s : -s), by - 5, 2, 5, C.orange);
      p.line(5, by - 9, 1, by - 15 + tail, C.orange);
      p.line(5, by - 10, 1, by - 16 + tail, C.orange);
      p.circle(24, by - 12, 4, C.orange);
      p.poly([[21, by - 15], [22, by - 19], [24, by - 15]], C.orange);
      p.poly([[25, by - 15], [27, by - 19], [28, by - 14]], C.orange);
      p.px(25, by - 13, C.lime); p.px(27, by - 13, C.lime);
      p.px(28, by - 11, C.pink);
      return;
    }
    // sitting loaf, side-ish
    p.ellipse(14, by - 7, 9, 7, C.orange);
    for (let i = 0; i < 3; i++) p.line(9 + i * 4, by - 12, 10 + i * 4, by - 6, C.brown);
    p.line(5, by - 3, 1 + tail, by - 8, C.orange);
    p.line(5, by - 4, 2 + tail, by - 9, C.orange);
    p.circle(20, by - 15, 5, C.orange);
    p.poly([[16, by - 18], [17, by - 23], [20, by - 19]], C.orange);
    p.poly([[21, by - 19], [24, by - 23], [25, by - 17]], C.orange);
    p.px(18, by - 16, C.lime); p.px(22, by - 16, C.lime);
    if ((pose.t % 3700) < 140) { p.px(18, by - 16, C.orange); p.px(22, by - 16, C.orange); }
    p.px(20, by - 14, C.pink);
    if (pose.talk) p.px(20, by - 12, C.darkred);
    // collar with version tag
    p.hline(16, 24, by - 11, C.brandblue);
    p.rect(19, by - 10, 3, 3, C.gold);
  },
};

/** Behind-the-counter variant: everything below `keep` rows is erased (the room draws the counter). */
function waistUp(def: CharacterDef, keep: number): CharacterDef {
  return {
    ...def,
    draw: (p, pose) => {
      def.draw(p, pose);
      const d = p.bmp.data;
      for (let y = keep; y < def.h; y++) d.fill(0, y * def.w, (y + 1) * def.w);
    },
  };
}

export const formsworthDesk = waistUp(formsworth, 47);
export const bartenderDesk = waistUp(bartender, 46);
export const wordyDesk = waistUp(wordy, 50);

export const act1Characters: CharacterDef[] = [guard, crab, cron, maintainer, painter, formsworthDesk, hook, bartenderDesk, wordyDesk, composer, cat];
export { human };
