import { drawHuman, type HumanSpec } from '../../engine/puppet';
import { C } from '../../engine/palette';
import type { Painter } from '../../engine/paint';
import type { CharacterDef, PuppetPose } from '../../engine/types';

// ---- Modelia Contexta, keeper of the lighthouse (and of everyone's context) --------------
const modeliaSpec: HumanSpec = {
  skin: C.skin, skinShade: C.skinshade, hair: C.lightgray, hairStyle: 'bun',
  headW: 7, headH: 8, nose: 'round', noseLen: 5, noseColor: C.pink, eyes: 'glasses', brows: C.gray,
  shirt: C.navy, shirtShade: C.night, torsoW: 12, torsoH: 15, belly: 2, sleeve: 'long',
  legs: C.navy, legsShade: C.night, legLen: 15, shoes: C.darkbrown,
  robe: C.gold, robeShade: C.olive,
  extras: (p, a, pose) => {
    // yellow sou'wester rain hat
    const hy = a.headY - a.spec.headH - 2;
    p.ellipse(a.headX, hy + 1, a.spec.headW + 1, 4, C.yellow);
    p.poly([[a.headX - a.spec.headW - 4, hy + 3], [a.headX + a.spec.headW + 5, hy + 2], [a.headX + a.spec.headW + 6, hy + 5], [a.headX - a.spec.headW - 5, hy + 6]], C.gold);
    // knitted sweater stripes peeking out of the raincoat
    if (!a.back) p.hline(a.cx - 3, a.cx + 3, a.shoulderY + 2, C.white);
    // the fog broom
    if (a.side && !pose.gesture) {
      p.line(a.handX + 1, a.handY - 14, a.handX - 6, a.base - 2, C.wood);
      p.poly([[a.handX - 9, a.base - 6], [a.handX - 3, a.base - 6], [a.handX, a.base], [a.handX - 12, a.base]], C.tan);
      p.line(a.handX - 9, a.base - 3, a.handX - 2, a.base - 3, C.wood);
    } else if (a.front) {
      p.line(a.cx + 9, a.shoulderY - 6, a.cx + 9, a.base - 4, C.wood);
      p.poly([[a.cx + 5, a.base - 6], [a.cx + 13, a.base - 6], [a.cx + 15, a.base], [a.cx + 3, a.base]], C.tan);
    }
  },
};

export const modelia: CharacterDef = {
  id: 'modelia', name: 'Modelia Contexta', color: 'cyan', w: 44, h: 64, speed: 45,
  draw: (p, pose) => drawHuman(p, modeliaSpec, pose, 44, 64),
};

// ---- Slackbot the parrot: aubergine body, four Slack-coloured wing feathers --------------
function drawParrot(p: Painter, pose: PuppetPose) {
  const W = 30, base = 35;
  const bob = Math.floor(pose.t / 600) % 2;
  const cx = 14;
  // tail
  p.poly([[cx - 4, base - 10], [cx + 1, base - 10], [cx - 1, base], [cx - 7, base + 0]], C.cyan);
  p.poly([[cx - 2, base - 10], [cx + 2, base - 10], [cx + 3, base - 1], [cx - 1, base]], C.green);
  // feet
  p.rect(cx - 1, base - 3, 2, 3, C.orange);
  p.rect(cx + 3, base - 3, 2, 3, C.orange);
  // body
  p.ellipse(cx + 1, base - 12 - bob, 7, 9, C.darkpurple);
  p.ellipse(cx + 3, base - 10 - bob, 4, 6, C.purple);
  // wing with Slack colours
  const wy = base - 17 - bob;
  p.poly([[cx - 6, wy], [cx + 1, wy - 1], [cx + 2, wy + 12], [cx - 4, wy + 10]], C.darkpurple);
  p.rect(cx - 5, wy + 1, 3, 3, C.cyan);
  p.rect(cx - 2, wy + 1, 3, 3, C.green);
  p.rect(cx - 5, wy + 5, 3, 3, C.gold);
  p.rect(cx - 2, wy + 5, 3, 3, C.brandpink);
  // head
  const hy = base - 24 - bob;
  p.circle(cx + 3, hy, 6, C.darkpurple);
  p.ellipse(cx + 4, hy + 2, 4, 3, C.purple);
  // crest
  p.poly([[cx, hy - 5], [cx - 4, hy - 10], [cx + 2, hy - 6]], C.brandpink);
  p.poly([[cx + 2, hy - 5], [cx + 1, hy - 11], [cx + 4, hy - 6]], C.gold);
  // eye
  if ((pose.t % 3700) < 140) p.hline(cx + 4, cx + 6, hy - 1, C.ink);
  else { p.circle(cx + 5, hy - 1, 2, C.white); p.rect(cx + 5, hy - 2, 2, 2, C.ink); }
  // beak
  if (pose.talk) {
    p.poly([[cx + 8, hy - 2], [cx + 13, hy], [cx + 9, hy + 1]], C.yellow);
    p.poly([[cx + 8, hy + 3], [cx + 12, hy + 4], [cx + 8, hy + 5]], C.orange);
  } else {
    p.poly([[cx + 8, hy - 2], [cx + 13, hy + 1], [cx + 10, hy + 4], [cx + 8, hy + 3]], C.yellow);
    p.px(cx + 12, hy + 2, C.orange);
  }
  // "typing..." bubble
  if (pose.gesture === 'typing') {
    p.rect(cx + 6, 0, 14, 7, C.white);
    const k = Math.floor(pose.t / 300) % 3;
    for (let i = 0; i < 3; i++) p.rect(cx + 8 + i * 4, 2 + (i === k ? 0 : 1), 2, 2, C.gray);
  }
  void W;
}

export const slackbot: CharacterDef = {
  id: 'slackbot', name: 'Slackbot', color: 'lavender', w: 30, h: 36, speed: 40, talkY: 2,
  draw: drawParrot,
};

// ---- Captain Node: airship captain, shaped like a node in a graph ------------------------
export function drawNode(p: Painter, cx: number, cy: number, r: number, talk: boolean, t: number) {
  // arms: two graph edges ending in little node "hands", waving gently
  const wave = Math.round(Math.sin(t / 500) * 2);
  p.line(cx - r + 1, cy + 2, cx - r - 6, cy - 3 + wave, C.nodedark);
  p.line(cx + r - 1, cy + 2, cx + r + 6, cy - 3 - wave, C.nodedark);
  p.circle(cx - r - 7, cy - 4 + wave, 2, C.node);
  p.circle(cx + r + 7, cy - 4 - wave, 2, C.node);
  // body
  p.circle(cx, cy, r, C.node);
  p.ellipse(cx + 2, cy + 3, r - 3, r - 4, C.nodedark);
  p.ellipse(cx, cy + 1, r - 3, r - 4, C.node);
  p.ellipse(cx - r + 4, cy - 3, 2, 3, C.nodelight);
  // captain's cap with pilot goggles on the band
  const hy = cy - r + 1;
  p.ellipse(cx, hy - 3, r - 2, 4, C.navy);
  p.rect(cx - r + 3, hy - 2, (r - 3) * 2 + 1, 3, C.white);
  p.hline(cx - r + 1, cx + r - 1, hy + 1, C.ink);
  p.circle(cx - 3, hy - 1, 2, C.lightgray); p.px(cx - 3, hy - 1, C.cyan);
  p.circle(cx + 3, hy - 1, 2, C.lightgray); p.px(cx + 3, hy - 1, C.cyan);
  p.px(cx, hy - 5, C.gold);
  // eyes with lashes, rosy cheeks
  const blink = (t % 4100) < 150;
  const ey = cy + 1;
  if (blink) { p.hline(cx - 6, cx - 2, ey, C.ink); p.hline(cx + 2, cx + 6, ey, C.ink); }
  else {
    p.ellipse(cx - 4, ey, 2, 3, C.white);
    p.ellipse(cx + 4, ey, 2, 3, C.white);
    p.rect(cx - 4, ey - 1, 2, 3, C.ink);
    p.rect(cx + 4, ey - 1, 2, 3, C.ink);
    p.px(cx - 7, ey - 3, C.ink); p.px(cx + 7, ey - 3, C.ink);
  }
  p.px(cx - 7, ey + 3, C.pink); p.px(cx + 7, ey + 3, C.pink);
  // smile
  if (talk) { p.ellipse(cx, cy + 7, 3, 2, C.ink); p.hline(cx - 1, cx + 1, cy + 8, C.pink); }
  else { p.line(cx - 3, cy + 6, cx, cy + 7, C.ink); p.line(cx, cy + 7, cx + 3, cy + 6, C.ink); }
}

export const captainNode: CharacterDef = {
  id: 'node', name: 'Captain Node', color: 'cyan', w: 40, h: 46, speed: 40,
  draw: (p, pose) => {
    const hover = Math.round(Math.sin(pose.t / 300) * 1.5);
    // little shadow on the ground (she floats)
    p.ellipse(20, 44, 8, 2, C.nodedark);
    drawNode(p, 20, 28 + hover, 11, pose.talk, pose.t);
  },
};

// ---- Officer Fiftie: Rosetta customs, checks AI labels (EU AI Act, Article 50) -------------
const officerSpec: HumanSpec = {
  skin: C.skindark, skinShade: C.brown, hair: C.ink, hairStyle: 'none',
  headW: 7, headH: 8, nose: 'button', noseLen: 4, eyes: 'normal', brows: C.ink,
  shirt: C.white, shirtShade: C.brandmist, torsoW: 12, torsoH: 16, belly: 1, sleeve: 'short',
  behind: (p, a) => {
    // a neat bun under the cap, regulation height
    if (a.side) p.circle(a.headX - a.spec.headW, a.headY + 1, 3, C.ink);
    else { p.rect(a.headX - a.spec.headW - 2, a.headY - 5, 3, 7, C.ink); p.rect(a.headX + a.spec.headW, a.headY - 5, 3, 7, C.ink); }
  },
  legs: C.navy, legsShade: C.night, legLen: 15, shoes: C.black,
  extras: (p, a, pose) => {
    if (a.back) { p.ellipse(a.headX, a.headY, a.spec.headW, a.spec.headH - 1, C.ink); p.circle(a.headX, a.headY + 4, 3, C.ink); }
    // peaked customs cap with an EU-blue band and a gold star
    const hy = a.headY - a.spec.headH;
    p.ellipse(a.headX, hy + 1, a.spec.headW + 1, 4, C.white);
    p.rect(a.headX - a.spec.headW, hy + 2, a.spec.headW * 2 + 1, 3, C.blue);
    p.px(a.headX + (a.side ? 2 : 0), hy + 3, C.yellow);
    if (a.side) p.poly([[a.headX + 2, hy + 4], [a.headX + a.spec.headW + 5, hy + 5], [a.headX + 2, hy + 6]], C.ink);
    else if (!a.back) p.hline(a.headX - a.spec.headW + 1, a.headX + a.spec.headW - 1, hy + 5, C.ink);
    // navy epaulettes + badge (a ring of yellow stars on blue)
    if (!a.back) {
      p.rect(a.cx - 7, a.shoulderY, 4, 2, C.navy);
      p.rect(a.cx + 4, a.shoulderY, 4, 2, C.navy);
      const bx = a.side ? a.cx + 3 : a.cx - 4, by = a.shoulderY + 6;
      p.circle(bx, by, 3, C.blue);
      p.px(bx, by - 2, C.yellow); p.px(bx + 2, by, C.yellow); p.px(bx, by + 2, C.yellow); p.px(bx - 2, by, C.yellow);
    }
    // the big rubber stamp, raised when she's stamping
    if (pose.gesture === 'stamp') {
      p.rect(a.handX - 2, a.handY - 12, 5, 4, C.wood);
      p.rect(a.handX - 4, a.handY - 8, 9, 3, C.darkred);
    } else if (a.side) {
      p.rect(a.handX - 1, a.handY - 3, 4, 3, C.wood);
      p.rect(a.handX - 2, a.handY, 6, 2, C.darkred);
    }
  },
};

export const officer: CharacterDef = {
  id: 'officer', name: 'Officer Fiftie', color: 'yellow', w: 44, h: 64, speed: 45,
  draw: (p, pose) => drawHuman(p, officerSpec, pose, 44, 64),
};

// ---- The Island Security Team: three quiet heroes in brand-blue uniforms ----------------
// Captain Xena Filter (Xss::filter), Chuck Plain (check_plain) and Toby Token (CSRF tokens).
const shield = (p: Painter, x: number, y: number, side: boolean) => {
  const sx = side ? x + 1 : x;
  p.rect(sx - 2, y, 5, 3, C.white);
  p.rect(sx - 1, y + 3, 3, 1, C.white);
  p.px(sx, y + 4, C.white);
  p.px(sx, y + 1, C.brandpink);
};
const uniform = {
  shirt: C.brandblue, shirtShade: C.navy, legs: C.night, legsShade: C.ink, shoes: C.black,
  sleeve: 'long' as const, logo: shield,
};

const xenaSpec: HumanSpec = {
  ...uniform,
  skin: C.skinshade, skinShade: C.skindark, hair: C.black, hairStyle: 'long',
  headW: 7, headH: 8, nose: 'button', noseLen: 3, eyes: 'normal', brows: C.black,
  torsoW: 11, torsoH: 15, legLen: 16,
  extras: (p, a) => {
    // captain's cap with a gold badge
    const hy = a.headY - a.spec.headH - 1;
    p.rect(a.headX - a.spec.headW, hy - 3, a.spec.headW * 2 + 1, 4, C.navy);
    p.hline(a.headX - a.spec.headW, a.headX + a.spec.headW, hy, C.white);
    if (a.side) p.rect(a.headX + a.spec.headW - 1, hy + 1, 4, 1, C.black);
    else if (a.front) p.hline(a.headX - a.spec.headW + 1, a.headX + a.spec.headW - 1, hy + 1, C.black);
    if (!a.back) p.rect(a.headX - 1 + (a.side ? 2 : 0), hy - 2, 2, 2, C.gold);
    // epaulettes
    if (!a.side) { p.hline(a.cx - 6, a.cx - 4, a.shoulderY, C.gold); p.hline(a.cx + 4, a.cx + 6, a.shoulderY, C.gold); }
  },
};

const chuckSpec: HumanSpec = {
  ...uniform,
  skin: C.skin, skinShade: C.skinshade, hair: C.lightgray, hairStyle: 'side', beard: C.lightgray,
  headW: 8, headH: 8, nose: 'big', noseLen: 5, eyes: 'glasses', brows: C.gray,
  torsoW: 14, torsoH: 15, belly: 3, legLen: 14,
  extras: (p, a) => {
    // a giant ESC keycap, carried like a shield: he escapes everything
    // side views get mirrored when he faces left, so only the front view shows the letters
    const key = (x: number, y: number, label: boolean) => {
      p.rect(x, y, 15, 13, C.darkgray);
      p.rect(x + 1, y + 1, 13, 9, C.lightgray);
      p.rect(x + 2, y + 2, 11, 7, C.white);
      if (!label) return;
      // tiny "ESC"
      const ink = C.ink;
      for (const lx of [x + 3, x + 7, x + 11]) { p.hline(lx - 1, lx + 1, y + 3, ink); p.hline(lx - 1, lx + 1, y + 7, ink); }
      p.hline(x + 2, x + 4, y + 5, ink); p.hline(x + 6, x + 8, y + 5, ink); // middle bars: E and S, not C
      p.vline(x + 2, y + 3, y + 7, ink);                    // E
      p.px(x + 6, y + 4, ink); p.px(x + 8, y + 6, ink);     // S
      p.vline(x + 10, y + 3, y + 7, ink);                   // C
    };
    if (a.side) key(a.handX - 3, a.handY - 9, false);
    else if (a.front) key(a.cx + 8, a.hipY - 8, true);
  },
};

const tobySpec: HumanSpec = {
  ...uniform,
  skin: C.skindark, skinShade: C.brown, hair: C.ink, hairStyle: 'spiky',
  headW: 7, headH: 8, nose: 'button', noseLen: 3, eyes: 'wide', brows: C.ink,
  sleeve: 'short', torsoW: 10, torsoH: 13, legLen: 15,
  extras: (p, a) => {
    // lanyard with a visitor-sized badge, and a brass spyglass
    if (!a.back) {
      p.line(a.cx - 2, a.shoulderY + 1, a.cx, a.shoulderY + 6, C.brandpink);
      p.rect(a.cx - 1 + (a.side ? 2 : 0), a.shoulderY + 6, 3, 4, C.white);
    }
    if (a.side) {
      p.rect(a.handX - 1, a.handY - 2, 9, 3, C.gold);
      p.rect(a.handX + 7, a.handY - 3, 2, 5, C.olive);
    }
  },
};

export const xena: CharacterDef = {
  id: 'xena', name: 'Captain Xena Filter', color: 'brandbluelight', w: 44, h: 66, speed: 70,
  draw: (p, pose) => drawHuman(p, xenaSpec, pose, 44, 66),
};
export const chuck: CharacterDef = {
  id: 'chuck', name: 'Chuck Plain', color: 'lime', w: 48, h: 64, speed: 60,
  draw: (p, pose) => drawHuman(p, chuckSpec, pose, 48, 64),
};
export const toby: CharacterDef = {
  id: 'toby', name: 'Toby Token', color: 'yellow', w: 44, h: 62, speed: 80,
  draw: (p, pose) => drawHuman(p, tobySpec, pose, 44, 62),
};

export const act3Characters: CharacterDef[] = [modelia, slackbot, captainNode, officer, xena, chuck, toby];
