import { drawHuman, type HumanSpec } from '../../engine/puppet';
import { C } from '../../engine/palette';
import type { CharacterDef, PuppetPose } from '../../engine/types';
import type { Painter } from '../../engine/paint';

function human(id: string, name: string, color: CharacterDef['color'], spec: HumanSpec, w = 44, h = 64, extra: Partial<CharacterDef> = {}): CharacterDef {
  return { id, name, color, w, h, speed: 55, draw: (p, pose) => drawHuman(p, spec, pose, w, h), ...extra };
}

// ---- The Key Keeper: paranoid hermit, keys everywhere ---------------------------------
export const keykeeper = human('keykeeper', 'Key Keeper', 'gold', {
  skin: C.skindark, skinShade: C.brown, hair: C.darkgray, hairStyle: 'long',
  headW: 7, headH: 8, nose: 'round', noseLen: 5, eyes: 'wide', brows: C.white,
  beard: C.lightgray,
  shirt: C.brown, shirtShade: C.darkbrown, torsoW: 11, torsoH: 16, sleeve: 'long',
  legs: C.brown, legsShade: C.darkbrown, legLen: 14, shoes: C.darkbrown,
  robe: C.brown, robeShade: C.darkbrown,
  extras: (p, a) => {
    // grey locs: darker strands through the long hair
    const hx = a.headX, hy = a.headY, hw = a.spec.headW, hh = a.spec.headH;
    if (a.back) { for (let x = hx - hw + 1; x <= hx + hw - 1; x += 3) p.vline(x, hy - hh + 3, hy + hh + 4, C.lightgray); return; }
    if (a.side) { p.vline(hx - hw, hy - 1, hy + hh + 5, C.lightgray); p.vline(hx - hw + 2, hy + 1, hy + hh + 5, C.lightgray); }
    else { p.vline(hx - hw - 1, hy, hy + hh + 3, C.lightgray); p.vline(hx + hw + 1, hy, hy + hh + 3, C.lightgray); }
    // necklace of keys
    const y = a.shoulderY + 3;
    for (let i = -2; i <= 2; i++) {
      const kx = a.cx + i * 3 + (a.side ? 2 : 0), ky = y + Math.abs(i) * -1 + 4;
      p.px(kx, ky - 1, C.gold);
      p.rect(kx, ky, 1, 3, C.gold);
      p.px(kx + 1, ky + 2, C.gold);
    }
    p.hline(a.cx - 6 + (a.side ? 2 : 0), a.cx + 6 + (a.side ? 2 : 0), y + 1, C.darkgray);
    // a big key in his hand
    p.rect(a.handX, a.handY - 1, 5, 1, C.gold);
    p.circle(a.handX + 6, a.handY - 1, 2, C.gold);
  },
});

// ---- Ollama the llama: local, fluffy, extremely slow ---------------------------------
export const ollama: CharacterDef = {
  id: 'ollama', name: 'Ollama the Llama', color: 'lavender', w: 44, h: 60, speed: 12, talkY: 0,
  draw: (p: Painter, pose: PuppetPose) => {
    const fur = C.white, shade = C.foam, dark = C.lightgray;
    const step = pose.walk >= 0 ? (pose.walk % 2) * 2 - 1 : 0;
    const chew = Math.floor(pose.t / 400) % 2;
    if (pose.dir === 'front' || pose.dir === 'back') {
      // legs
      for (const x of [14, 18, 25, 29]) p.rect(x, 48, 3, 11, dark);
      p.ellipse(22, 42, 11, 9, fur);
      p.ellipse(22, 45, 10, 5, shade);
      // neck + head
      p.rect(18, 16, 9, 26, fur);
      p.ellipse(22, 14, 7, 6, fur);
      p.poly([[16, 10], [14, 2], [18, 8]], fur);
      p.poly([[28, 10], [30, 2], [26, 8]], fur);
      if (pose.dir === 'front') {
        p.rect(18, 11, 3, 2, C.white); p.rect(25, 11, 3, 2, C.white);
        p.hline(18, 20, 11, C.ink); p.hline(25, 27, 11, C.ink); // sleepy lids
        p.px(19, 12, C.ink); p.px(26, 12, C.ink);
        p.ellipse(22, 17, 3, 2, C.pink);
        p.hline(21, 23, 19 + (pose.talk ? 1 : chew), C.skindark);
        // bangs
        p.ellipse(22, 8, 4, 2, shade);
      }
      // blanket in brand colors
      p.rect(14, 34, 17, 6, C.brandblue);
      p.hline(14, 30, 36, C.brandpink);
      return;
    }
    // side view, facing right
    p.rect(10 + step, 46, 3, 13, dark);
    p.rect(14 - step, 46, 3, 13, shade);
    p.rect(27 - step, 46, 3, 13, dark);
    p.rect(31 + step, 46, 3, 13, shade);
    p.ellipse(22, 40, 14, 9, fur);
    p.ellipse(22, 44, 13, 5, shade);
    p.circle(8, 36, 3, fur); // tail
    // blanket
    p.poly([[14, 32], [30, 32], [31, 41], [13, 41]], C.brandblue);
    p.hline(14, 30, 36, C.brandpink);
    for (let x = 15; x < 30; x += 3) p.px(x, 42, C.brandpink);
    // neck
    p.poly([[28, 36], [34, 36], [36, 12], [30, 12]], fur);
    p.vline(30, 14, 34, shade);
    // head
    p.ellipse(36, 12, 6, 5, fur);
    p.ellipse(41, 14, 4, 3, fur);
    p.poly([[32, 8], [31, 0], [35, 6]], fur);
    p.poly([[35, 7], [36, 0], [38, 6]], shade);
    // half-closed eye: relaxed, possibly asleep
    p.rect(36, 10, 3, 2, C.white); p.hline(36, 38, 10, C.ink); p.px(38, 11, C.ink);
    p.px(43, 13, C.skindark);
    if (pose.talk) p.rect(41, 16, 3, 2, C.darkred);
    else p.hline(40, 43, 16 + chew, C.skindark);
    p.ellipse(34, 7, 3, 2, shade); // bangs
  },
};

// ---- Professor Promptington (AI Explorer) ---------------------------------------------
export const promptington = human('promptington', 'Professor Promptington', 'tan', {
  skin: C.skin, skinShade: C.skinshade, hair: C.white, hairStyle: 'side',
  headW: 7, headH: 8, nose: 'long', noseLen: 8, noseColor: C.pink, eyes: 'monocle', brows: C.white,
  moustache: C.white,
  shirt: C.tan, shirtShade: C.sandshade, torsoW: 11, torsoH: 15, sleeve: 'long', belly: 2,
  legs: C.sandshade, legsShade: C.wood, legLen: 16, shoes: C.darkbrown,
  extras: (p, a) => {
    // pith helmet
    const hx = a.headX, hy = a.headY - a.spec.headH + 1;
    p.ellipse(hx, hy, a.spec.headW + 1, 5, C.sand);
    p.rect(hx - a.spec.headW - 4, hy + 2, a.spec.headW * 2 + 8, 2, C.sandshade);
    p.hline(hx - a.spec.headW, hx + a.spec.headW, hy + 1, C.wood);
    if (!a.back) {
      // notebook in hand
      p.rect(a.handX - 1, a.handY - 6, 5, 6, C.red);
      p.vline(a.handX, a.handY - 6, a.handY - 1, C.darkred);
      // pocket with pencils
      p.rect(a.cx - 4, a.shoulderY + 4, 3, 3, C.sandshade);
      p.vline(a.cx - 3, a.shoulderY + 1, a.shoulderY + 4, C.yellow);
    }
  },
});

// ---- Farmer Fieldsworth (Automators) --------------------------------------------------
export const fieldsworth = human('fieldsworth', 'Farmer Fieldsworth', 'lime', {
  skin: C.skindark, skinShade: C.brown, hair: C.darkbrown, hairStyle: 'none',
  headW: 8, headH: 7, nose: 'button', noseLen: 4, eyes: 'normal', brows: C.darkbrown,
  shirt: C.red, shirtShade: C.darkred, torsoW: 12, torsoH: 15, sleeve: 'long',
  legs: C.blue, legsShade: C.navy, legLen: 15, shoes: C.darkbrown,
  behind: (p, a) => {
    // big curly hair puffing out under the hat brim
    const hx = a.headX, hy = a.headY, hw = a.spec.headW;
    const c = a.spec.hair;
    if (a.side) { p.circle(hx - hw - 1, hy - 2, 4, c); p.circle(hx - hw, hy + 3, 4, c); p.circle(hx - 2, hy - 3, 4, c); }
    else for (const d of [-1, 1]) { p.circle(hx + d * (hw + 1), hy - 2, 4, c); p.circle(hx + d * (hw + 1), hy + 3, 3, c); }
    if (a.back) p.ellipse(hx, hy, hw + 4, a.spec.headH + 2, c);
  },
  logo: (p, x, y) => {
    // overall bib
    p.rect(x - 4, y - 1, 8, 8, C.blue);
    p.px(x - 3, y, C.gold); p.px(x + 2, y, C.gold);
  },
  extras: (p, a) => {
    // straw hat
    const hx = a.headX, hy = a.headY - a.spec.headH + 1;
    p.ellipse(hx, hy + 2, a.spec.headW + 7, 2, C.yellow);
    p.rect(hx - 6, hy - 4, 12, 6, C.yellow);
    p.hline(hx - 6, hx + 5, hy, C.red);
    p.hline(hx - a.spec.headW - 6, hx + a.spec.headW + 6, hy + 3, C.gold);
    // gold hoop earrings
    if (a.front) { p.px(a.headX - a.spec.headW - 1, a.headY + 3, C.gold); p.px(a.headX + a.spec.headW + 1, a.headY + 3, C.gold); }
    else if (a.side) p.px(a.headX - 2, a.headY + 4, C.gold);
    if (!a.back) {
      // pitchfork
      const x = a.side ? a.cx - a.spec.torsoW / 2 - 3 : a.cx + a.spec.torsoW / 2 + 3;
      p.vline(x, a.shoulderY - 14, a.base - 4, C.wood);
      for (const dx of [-2, 0, 2]) p.vline(x + dx, a.shoulderY - 20, a.shoulderY - 14, C.lightgray);
      p.hline(x - 2, x + 2, a.shoulderY - 14, C.lightgray);
    }
  },
}, 48, 70);

// ---- The Librarian (AI Search) --------------------------------------------------------
export const librarian = human('librarian', 'The Librarian', 'pink', {
  skin: C.skinshade, skinShade: C.skindark, hair: C.gray, hairStyle: 'bun',
  headW: 7, headH: 8, nose: 'pointy', noseLen: 4, eyes: 'glasses', brows: C.darkgray,
  shirt: C.purple, shirtShade: C.darkpurple, torsoW: 11, torsoH: 15, sleeve: 'long',
  legs: C.darkpurple, legsShade: C.night, legLen: 15, shoes: C.black,
  robe: C.darkpurple, robeShade: C.night,
  extras: (p, a) => {
    if (a.back) return;
    // pearl necklace + pencil in bun
    for (let i = -3; i <= 3; i++) p.px(a.cx + i * 1 + (a.side ? 1 : 0), a.shoulderY + 1 + Math.abs(i) / 2, C.white);
    p.line(a.headX - 4, a.headY - a.spec.headH - 6, a.headX + 2, a.headY - a.spec.headH - 1, C.yellow);
  },
});

// ---- Ghosts ------------------------------------------------------------------------------
function ghostBody(p: Painter, pose: PuppetPose, cx: number, top: number, w: number, h: number, body = C.ghost, shade = C.ghostshade) {
  const wob = Math.floor(pose.t / 300) % 2;
  p.ellipse(cx, top + w, w, w, body);
  p.rect(cx - w, top + w, w * 2 + 1, h - w * 2, body);
  // wavy tail
  const by = top + h - w;
  for (let i = 0; i < 4; i++) {
    const x = cx - w + i * (w / 2);
    p.poly([[x, by], [x + w / 2, by], [x + w / 4, by + 6 + ((i + wob) % 2) * 3]], body);
  }
  p.vline(cx - w, top + w, by, shade);
}

function ghostFace(p: Pick<Painter, 'rect' | 'ellipse' | 'px' | 'hline'>, cx: number, ey: number, talk: boolean, side: boolean) {
  const o = side ? 3 : 0;
  p.ellipse(cx - 3 + o, ey, 2, 3, C.ink);
  p.ellipse(cx + 3 + o, ey, 2, 3, C.ink);
  p.px(cx - 3 + o, ey - 1, C.white); p.px(cx + 3 + o, ey - 1, C.white);
  if (talk) p.ellipse(cx + o, ey + 6, 2, 2, C.ink);
  else p.hline(cx - 1 + o, cx + 1 + o, ey + 6, C.ink);
}

export const ghostflash: CharacterDef = {
  id: 'ghostflash', name: 'Ghost of Flash', color: 'red', w: 36, h: 56,
  draw: (p, pose) => {
    const bob = Math.floor(pose.t / 500) % 2;
    ghostBody(p, pose, 18, 6 + bob, 11, 44);
    ghostFace(p, 18, 18 + bob, pose.talk, pose.dir !== 'front');
    // the red badge with an "f"
    p.rect(12, 30 + bob, 12, 12, C.red);
    p.vline(18, 32 + bob, 39 + bob, C.white);
    p.hline(18, 21, 32 + bob, C.white);
    p.hline(16, 20, 35 + bob, C.white);
    // loading bar arms
    p.rect(3, 34 + bob, 5, 2, C.ghost); p.rect(28, 30 + bob, 5, 2, C.ghost);
  },
};

export const ghostgeo: CharacterDef = {
  id: 'ghostgeo', name: 'Ghost of GeoCities', color: 'magenta', w: 38, h: 58,
  draw: (p, pose) => {
    const bob = Math.floor(pose.t / 450) % 2;
    ghostBody(p, pose, 19, 8 + bob, 11, 46);
    ghostFace(p, 19, 22 + bob, pose.talk, pose.dir !== 'front');
    // under-construction hard hat
    p.ellipse(19, 10 + bob, 11, 5, C.yellow);
    p.rect(7, 12 + bob, 25, 2, C.gold);
    for (let x = 9; x < 30; x += 4) p.rect(x, 7 + bob, 2, 4, C.black);
    // glitter sparkles (cycle)
    const k = Math.floor(pose.t / 400) % 4;
    const spots = [[4, 20], [33, 26], [6, 40], [31, 44]];
    spots.forEach(([x, y], i) => {
      const c = i === k ? C.white : C.lavender;
      p.px(x, y + bob, c); p.px(x - 1, y + bob, C.magenta); p.px(x + 1, y + bob, C.magenta); p.px(x, y - 1 + bob, C.magenta); p.px(x, y + 1 + bob, C.magenta);
    });
    // a tiny "NEW!" badge
    p.rect(22, 34 + bob, 9, 5, C.red);
    p.hline(23, 29, 36 + bob, C.yellow);
  },
};

export const ghostblink: CharacterDef = {
  id: 'ghostblink', name: 'Ghost of <blink>', color: 'cyan', w: 34, h: 52,
  draw: (p, pose) => {
    // It blinks. That is its entire personality.
    const on = Math.floor(pose.t / 400) % 2 === 0 || pose.talk;
    if (!on) { p.px(17, 30, C.ghostshade); return; }
    ghostBody(p, pose, 17, 6, 10, 42, C.cyan, C.teal);
    ghostFace(p, 17, 18, pose.talk, pose.dir !== 'front');
    // "<b>" on its belly
    p.line(10, 34, 7, 37, C.navy); p.line(7, 37, 10, 40, C.navy);
    p.line(24, 34, 27, 37, C.navy); p.line(27, 37, 24, 40, C.navy);
    p.vline(15, 33, 40, C.navy); p.rect(16, 37, 3, 3, C.navy);
  },
};

export const speakotron: CharacterDef = {
  id: 'speakotron', name: 'Speak-o-Tron', color: 'orange', w: 40, h: 54,
  draw: (p, pose) => {
    const bob = Math.floor(pose.t / 500) % 2;
    // ghostly tail under a toy computer
    ghostBody(p, pose, 20, 22 + bob, 9, 30, C.ghost, C.ghostshade);
    // the toy: red/orange body with a handle
    p.rect(5, 10 + bob, 30, 22, C.orange);
    p.rect(5, 10 + bob, 30, 3, C.red);
    p.rect(14, 5 + bob, 12, 3, C.red);
    p.rect(14, 5 + bob, 2, 6, C.red); p.rect(24, 5 + bob, 2, 6, C.red);
    // display
    p.rect(8, 14 + bob, 24, 6, C.night);
    const lit = pose.talk;
    p.hline(10, lit ? 29 : 13, 17 + bob, lit ? C.lime : C.darkgreen);
    // keypad
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) p.rect(8 + c * 4, 22 + r * 4 + bob, 3, 3, (r + c) % 2 ? C.yellow : C.white);
    // speaker grille = mouth
    p.rect(26, 22 + bob, 6, 6, C.darkred);
    if (pose.talk) p.rect(27, 23 + bob, 4, 4, C.black);
  },
};

// ---- Reviewer pirates (code review) -------------------------------------------------------
function bandana(color: number) {
  return (p: Painter, a: import('../../engine/puppet').Anchors) => {
    const hx = a.headX, hy = a.headY - a.spec.headH + 2;
    p.ellipse(hx, hy, a.spec.headW + 1, 4, color);
    p.rect(hx - a.spec.headW - 1, hy, a.spec.headW * 2 + 2, 3, color);
    if (a.side) p.poly([[hx - a.spec.headW - 1, hy + 1], [hx - a.spec.headW - 7, hy + 6], [hx - a.spec.headW - 4, hy + 7]], color);
    for (let x = hx - a.spec.headW + 1; x < hx + a.spec.headW; x += 3) p.px(x, hy + 1, C.white);
  };
}

function redPen(p: Painter, a: import('../../engine/puppet').Anchors) {
  if (a.back) return;
  // the reviewer's sword: a giant red pen
  if (a.side) {
    // en garde: pen held forward, tip up, clear of the face
    const x = a.handX, y = a.handY;
    p.line(x, y, x + 9, y - 9, C.red);
    p.line(x + 1, y, x + 10, y - 9, C.red);
    p.line(x + 10, y - 10, x + 12, y - 12, C.white);
    p.px(x + 12, y - 12, C.ink);
    p.rect(x - 1, y - 1, 3, 3, C.darkgray);
    return;
  }
  const x = a.cx + a.spec.torsoW / 2 + 2;
  const y = a.handY;
  p.rect(x, y - 16, 2, 16, C.red);
  p.poly([[x, y - 16], [x + 1, y - 20], [x + 2, y - 16]], C.white);
  p.px(x + 1, y - 20, C.ink);
  p.rect(x - 1, y - 2, 4, 2, C.darkgray);
}

export const nell = human('nell', 'Nitpick Nell', 'yellow', {
  skin: C.skin, skinShade: C.skinshade, hair: C.black, hairStyle: 'long',
  headW: 7, headH: 8, nose: 'button', noseLen: 3, eyes: 'glasses', brows: C.black,
  shirt: C.white, shirtShade: C.lightgray, torsoW: 10, torsoH: 15, sleeve: 'long',
  legs: C.darkbrown, legsShade: C.black, legLen: 16, shoes: C.black,
  logo: (p, x, y) => { p.hline(x - 4, x + 4, y + 4, C.red); p.hline(x - 4, x + 4, y + 6, C.red); },
  extras: (p, a) => { bandana(C.red)(p, a); redPen(p, a); },
});

// id stays 'bob' so saves that remember the current reviewer keep working
export const bob = human('bob', 'Bikeshed Bianca', 'skyblue', {
  skin: C.skinshade, skinShade: C.skindark, hair: C.darkbrown, hairStyle: 'long',
  headW: 7, headH: 8, nose: 'button', noseLen: 4, eyes: 'patch', brows: C.darkbrown,
  shirt: C.blue, shirtShade: C.navy, torsoW: 12, torsoH: 16, belly: 2, sleeve: 'short',
  legs: C.gray, legsShade: C.darkgray, legLen: 14, shoes: C.black,
  logo: (p, x, y) => {
    // a tiny bike shed
    p.poly([[x - 3, y + 2], [x, y - 1], [x + 3, y + 2]], C.red);
    p.rect(x - 2, y + 2, 5, 3, C.woodlight);
  },
  extras: (p, a) => {
    bandana(C.green)(p, a);
    // big gold hoops
    if (a.front) { p.circle(a.headX - a.spec.headW - 1, a.headY + 4, 1, C.gold); p.circle(a.headX + a.spec.headW + 1, a.headY + 4, 1, C.gold); }
    else if (a.side) p.circle(a.headX - 2, a.headY + 5, 1, C.gold);
    redPen(p, a);
  },
});

// id stays 'larry' for the same reason
export const larry = human('larry', 'LGTM Lenny', 'lime', {
  skin: C.skindark, skinShade: C.brown, hair: C.ink, hairStyle: 'side',
  headW: 6, headH: 8, nose: 'button', noseLen: 3, eyes: 'shades', brows: C.ink,
  shirt: C.orange, shirtShade: C.brown, torsoW: 9, torsoH: 15, sleeve: 'short',
  legs: C.olive, legsShade: C.darkgreen, legLen: 18, shoes: C.white,
  logo: (p, x, y) => {
    // thumbs up
    p.rect(x - 2, y + 1, 4, 4, C.yellow);
    p.rect(x - 1, y - 2, 2, 3, C.yellow);
  },
  extras: (p, a) => { redPen(p, a); },
});

// ---- Master Rebase, the Code Review Master ---------------------------------------------
export const master = human('master', 'Master Rebase', 'brandpink', {
  skin: C.skin, skinShade: C.skinshade, hair: C.brandink, hairStyle: 'long',
  headW: 7, headH: 8, nose: 'pointy', noseLen: 5, eyes: 'normal', brows: C.brandink,
  shirt: C.brandpink, shirtShade: C.darkred, torsoW: 11, torsoH: 16, sleeve: 'long',
  legs: C.brandink, legsShade: C.black, legLen: 18, shoes: C.brandink,
  robe: C.brandpink, robeShade: C.darkred,
  extras: (p, a) => {
    if (a.back) return;
    // black belt sash + a very large red pen sword
    p.hline(a.cx - a.spec.torsoW / 2, a.cx + a.spec.torsoW / 2, a.hipY - 1, C.brandink);
    p.hline(a.cx - a.spec.torsoW / 2, a.cx + a.spec.torsoW / 2, a.hipY, C.brandink);
    p.rect(a.cx + 2, a.hipY, 2, 6, C.brandink);
    redPen(p, a);
    // headband
    p.hline(a.headX - a.spec.headW, a.headX + a.spec.headW, a.headY - a.spec.headH + 3, C.white);
  },
}, 44, 68);

// Voices without bodies (drawn as scenery, speak via sayAs).
export const idols: CharacterDef = { id: 'idols', name: 'The Cloud Idols', color: 'cyan', w: 2, h: 2, draw: () => {} };
export const aiexplorer: CharacterDef = { id: 'aiexplorer', name: 'AI Explorer output', color: 'lime', w: 2, h: 2, draw: () => {} };

export const act2Characters: CharacterDef[] = [
  idols, aiexplorer, keykeeper, ollama, promptington, fieldsworth, librarian,
  ghostflash, ghostgeo, ghostblink, speakotron, nell, bob, larry, master,
];
