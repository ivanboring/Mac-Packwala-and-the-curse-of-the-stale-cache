// Procedural cartoon humans in a DOTT-ish style: big heads, bigger noses,
// skinny bodies. Drawn at 1x into a sprite bitmap, then auto-outlined.
import { Painter } from './paint';
import { C } from './palette';
import type { PuppetPose } from './types';

export type HairStyle = 'swoop' | 'bald' | 'fringe' | 'spiky' | 'long' | 'bun' | 'wild' | 'side' | 'none';
export type NoseStyle = 'pointy' | 'big' | 'round' | 'hook' | 'long' | 'button';
export type EyeStyle = 'normal' | 'sleepy' | 'glasses' | 'monocle' | 'patch' | 'shades' | 'wide';

export interface HumanSpec {
  skin: number;
  skinShade: number;
  hair: number;
  hairStyle: HairStyle;
  headW: number;   // radius x
  headH: number;   // radius y
  nose: NoseStyle;
  noseLen: number;
  noseColor?: number;
  eyes: EyeStyle;
  brows?: number;
  beard?: number;      // beard color
  moustache?: number;
  shirt: number;
  shirtShade: number;
  torsoW: number;
  torsoH: number;
  belly?: number;      // extra belly radius
  sleeve: 'short' | 'long';
  legs: number;
  legsShade: number;
  legLen: number;
  shoes: number;
  /** Long robe/dress/coat covering the legs (color). */
  robe?: number;
  robeShade?: number;
  neck?: number;
  /** Extra decorations; anchors give useful coordinates. */
  extras?: (p: Painter, a: Anchors, pose: PuppetPose) => void;
  /** Drawn before body (e.g. backpack, cape behind). */
  behind?: (p: Painter, a: Anchors, pose: PuppetPose) => void;
  /** Logo/print on the chest (front & side). */
  logo?: (p: Painter, x: number, y: number, side: boolean) => void;
}

export interface Anchors {
  cx: number;
  base: number;
  hipY: number;
  shoulderY: number;
  headX: number;
  headY: number;
  side: boolean;   // drawn facing right (left is mirrored by the renderer)
  back: boolean;
  front: boolean;
  handX: number;
  handY: number;
  bob: number;
  spec: HumanSpec;
}

const WALK_LEG = [3, 0, -3, 0];
const WALK_BOB = [0, -1, 0, -1];

export function drawHuman(p: Painter, s: HumanSpec, pose: PuppetPose, W: number, H: number) {
  const dir = pose.dir;
  const side = dir === 'left' || dir === 'right';
  const back = dir === 'back';
  const front = dir === 'front';
  const walking = pose.walk >= 0;
  const bob = walking ? WALK_BOB[pose.walk] : (Math.floor(pose.t / 900) % 2 === 0 ? 0 : 0);
  const cx = Math.floor(W / 2);
  const base = H - 1;
  const hipY = base - s.legLen + bob;
  const shoulderY = hipY - s.torsoH;
  const neck = s.neck ?? 2;
  const headY = shoulderY - neck - s.headH + 2;
  const headX = cx + (side ? 1 : 0);
  const blink = (pose.t % 3700) < 140;

  const A: Anchors = {
    cx, base, hipY, shoulderY, headX, headY, side, back, front,
    handX: cx, handY: hipY - 2, bob, spec: s,
  };

  if (s.behind) s.behind(p, A, pose);

  // ---- legs --------------------------------------------------------------------
  if (!s.robe) {
    if (side) {
      const sw = walking ? WALK_LEG[pose.walk] : 0;
      // back leg (shade) then front leg
      leg(p, cx - 1 - sw, hipY, base, s.legsShade, s.shoes, true);
      leg(p, cx - 1 + sw, hipY, base, s.legs, s.shoes, true);
    } else {
      const lift = walking ? (pose.walk === 0 ? -1 : pose.walk === 2 ? 1 : 0) : 0;
      leg(p, cx - 4, hipY, base + Math.min(0, lift), s.legs, s.shoes, false);
      leg(p, cx + 1, hipY, base + Math.min(0, -lift), s.legs, s.shoes, false);
      if (!back) { p.rect(cx - 5, base - 1 + Math.min(0, lift), 5, 2, s.shoes); p.rect(cx + 1, base - 1 + Math.min(0, -lift), 5, 2, s.shoes); }
      else { p.rect(cx - 4, base - 1, 4, 2, s.shoes); p.rect(cx + 1, base - 1, 4, 2, s.shoes); }
    }
  } else {
    const rs = s.robeShade ?? s.robe;
    const sway = walking ? WALK_LEG[pose.walk] / 3 : 0;
    p.poly([[cx - s.torsoW / 2, hipY - 2], [cx + s.torsoW / 2, hipY - 2], [cx + s.torsoW / 2 + 3 + sway, base - 1], [cx - s.torsoW / 2 - 3 + sway, base - 1]], s.robe);
    p.vline(cx + (side ? 2 : 0), hipY, base - 2, rs);
    p.rect(cx - 4 + (side ? 2 : 0), base - 1, 4, 1, s.shoes);
    if (!side) p.rect(cx + 1, base - 1, 4, 1, s.shoes);
  }

  // ---- torso -------------------------------------------------------------------
  const tw = s.torsoW;
  const tTop = shoulderY, tBot = hipY + 1;
  if (side) {
    p.poly([[cx - tw / 2 + 1, tTop + 1], [cx + tw / 2 - 1, tTop], [cx + tw / 2 + (s.belly ?? 0), tBot - 3], [cx + tw / 2 - 1, tBot], [cx - tw / 2, tBot], [cx - tw / 2, tTop + 2]], s.shirt);
    p.vline(cx - tw / 2 + 1, tTop + 2, tBot - 1, s.shirtShade);
    if (s.belly) p.ellipse(cx + 1, tBot - 5, tw / 2 + s.belly - 1, 5, s.shirt);
  } else {
    p.poly([[cx - tw / 2, tTop + 1], [cx - tw / 2 + 2, tTop], [cx + tw / 2 - 2, tTop], [cx + tw / 2, tTop + 1], [cx + tw / 2 + (s.belly ?? 0) / 2, tBot - 2], [cx + tw / 2, tBot], [cx - tw / 2, tBot], [cx - tw / 2 - (s.belly ?? 0) / 2, tBot - 2]], s.shirt);
    if (s.belly) p.ellipse(cx, tBot - 5, tw / 2 + s.belly / 2, 5, s.shirt);
    p.vline(cx - tw / 2, tTop + 2, tBot - 1, s.shirtShade);
  }
  if (s.logo && !back) s.logo(p, side ? cx + 1 : cx, tTop + Math.floor(s.torsoH / 3), side);

  // ---- arms --------------------------------------------------------------------
  const armLen = Math.round(s.torsoH * 0.95);
  const sleeveC = s.sleeve === 'long' ? s.shirt : s.skin;
  if (side) {
    const swing = walking ? -WALK_LEG[pose.walk] : 0;
    const g = pose.gesture;
    if (g === 'reach' || g === 'give') {
      // arm stretched forward
      p.rect(cx, tTop + 2, 6, 3, s.shirt);
      p.rect(cx + 6, tTop + 2, 6, 3, sleeveC);
      p.rect(cx + 11, tTop + 1, 3, 4, s.skin);
      A.handX = cx + 13; A.handY = tTop + 3;
    } else if (g === 'point' || g === 'up') {
      p.line(cx, tTop + 2, cx + 6, tTop - 6, s.shirt);
      p.line(cx + 1, tTop + 2, cx + 7, tTop - 6, s.shirt);
      p.rect(cx + 6, tTop - 9, 3, 3, s.skin);
      A.handX = cx + 7; A.handY = tTop - 8;
    } else {
      const hx = cx + Math.round(swing / 2);
      p.line(cx, tTop + 2, hx + 1, tTop + armLen - 3, s.shirt);
      p.line(cx + 1, tTop + 2, hx + 2, tTop + armLen - 3, s.shirt);
      if (s.sleeve === 'short') {
        p.line(cx, tTop + 2, cx + swing / 4, tTop + 5, s.shirtShade);
        p.line(cx + Math.round(swing / 4), tTop + 5, hx + 1, tTop + armLen - 3, s.skin);
        p.line(cx + 1 + Math.round(swing / 4), tTop + 5, hx + 2, tTop + armLen - 3, s.skin);
      }
      p.rect(hx, tTop + armLen - 3, 3, 3, s.skin);
      A.handX = hx + 1; A.handY = tTop + armLen - 2;
    }
  } else {
    const swing = walking ? (pose.walk === 0 ? 1 : pose.walk === 2 ? -1 : 0) : 0;
    for (const sgn of [-1, 1]) {
      const ax = cx + sgn * (tw / 2 + 1);
      const up = pose.gesture === 'shrug' ? -3 : 0;
      p.rect(ax - (sgn < 0 ? 1 : 0), tTop + 1, 2, armLen - 2 + sgn * swing + up, sleeveC);
      if (s.sleeve === 'short') p.rect(ax - (sgn < 0 ? 1 : 0), tTop + 1, 2, 4, s.shirt);
      p.rect(ax - (sgn < 0 ? 2 : 0), tTop + armLen - 3 + sgn * swing + up, 3, 3, s.skin);
    }
    A.handX = cx + tw / 2 + 2; A.handY = tTop + armLen - 2;
    if (pose.gesture === 'shrug') { p.px(cx - tw / 2 - 3, tTop - 1, s.skin); p.px(cx + tw / 2 + 3, tTop - 1, s.skin); }
  }

  // ---- neck & head ---------------------------------------------------------------
  p.rect(cx - 1, shoulderY - neck, 3, neck + 1, s.skinShade);
  head(p, s, A, pose, blink);
  if (s.extras) s.extras(p, A, pose);
}

function leg(p: Painter, x: number, hipY: number, base: number, c: number, shoe: number, side: boolean) {
  p.rect(x, hipY, 3, base - hipY - 1, c);
  if (side) p.rect(x, base - 2, 6, 3, shoe);
}

function head(p: Painter, s: HumanSpec, A: Anchors, pose: PuppetPose, blink: boolean) {
  const { headX: hx, headY: hy, side, back } = A;
  const hw = s.headW, hh = s.headH;
  const skin = s.skin, shade = s.skinShade;

  // back hair (behind head)
  if (s.hairStyle === 'long') {
    if (side) p.poly([[hx - hw, hy - 2], [hx + 1, hy - hh], [hx + 2, hy + hh + 6], [hx - hw - 2, hy + hh + 6]], s.hair);
    else p.rect(hx - hw - 1, hy - 2, hw * 2 + 2, hh + 7, s.hair);
  }

  if (side) {
    p.ellipse(hx, hy, hw, hh, skin);
    // jaw shading
    p.ellipse(hx - 1, hy + hh - 3, hw - 2, 2, skin);
    p.hline(hx - hw + 2, hx + 1, hy + hh - 1, shade);
    // ear
    p.ellipse(hx - Math.round(hw * 0.25), hy + 1, 2, 3, shade);
    p.px(hx - Math.round(hw * 0.25), hy + 1, skin);
  } else {
    p.ellipse(hx, hy, hw, hh, skin);
    p.hline(hx - hw + 3, hx + hw - 3, hy + hh - 1, shade);
    p.px(hx - hw, hy + 1, shade); p.px(hx + hw - 1, hy + 1, shade);
  }

  if (back) {
    hair(p, s, A, true);
    return;
  }

  // beard (under the face features)
  if (s.beard !== undefined) {
    if (side) p.poly([[hx - hw + 3, hy + 1], [hx + hw, hy + 2], [hx + hw - 1, hy + hh + 2], [hx + 2, hy + hh + 5], [hx - hw + 4, hy + hh - 1]], s.beard);
    else p.poly([[hx - hw + 1, hy + 1], [hx + hw - 1, hy + 1], [hx + hw - 2, hy + hh + 2], [hx, hy + hh + 6], [hx - hw + 2, hy + hh + 2]], s.beard);
  }

  const talk = pose.talk;
  if (side) {
    const ex = hx + Math.round(hw * 0.45), ey = hy - Math.round(hh * 0.15);
    eyesSide(p, s, ex, ey, blink);
    // nose
    const nx = hx + hw - 2, ny = ey + 2;
    const nc = s.noseColor ?? skin;
    noseSide(p, s.nose, s.noseLen, nx, ny, nc, shade);
    // mouth
    const mx = hx + Math.round(hw * 0.55), my = hy + Math.round(hh * 0.5);
    if (s.moustache !== undefined) p.rect(mx - 1, my - 2, 4, 2, s.moustache);
    if (talk) { p.rect(mx, my - 1, 3, 3, C.darkred); p.px(mx + 1, my + 1, C.pink); }
    else p.hline(mx, mx + 2, my, C.skindark);
  } else {
    const ey = hy - Math.round(hh * 0.15);
    eyesFront(p, s, hx, ey, blink);
    const nc = s.noseColor ?? skin;
    noseFront(p, s.nose, s.noseLen, hx, ey + 2, nc, shade);
    const my = hy + Math.round(hh * 0.55);
    if (s.moustache !== undefined) p.rect(hx - 3, my - 2, 7, 2, s.moustache);
    if (talk) { p.ellipse(hx + 0.5, my + 1, 2, 2, C.darkred); }
    else p.hline(hx - 2, hx + 2, my, C.skindark);
  }
  hair(p, s, A, false);
}

function eyesSide(p: Painter, s: HumanSpec, ex: number, ey: number, blink: boolean) {
  if (s.brows !== undefined) p.hline(ex - 2, ex + 2, ey - 4, s.brows);
  switch (s.eyes) {
    case 'shades':
      p.rect(ex - 2, ey - 2, 6, 3, C.black); p.px(ex + 2, ey - 2, C.gray); return;
    case 'patch':
      p.rect(ex - 1, ey - 2, 4, 4, C.black); p.line(ex - 6, ey - 4, ex + 3, ey - 1, C.black); return;
    case 'glasses':
      p.frame(ex - 2, ey - 2, 6, 5, C.ink); p.line(ex - 6, ey, ex - 2, ey, C.ink);
      break;
    case 'monocle':
      p.frame(ex - 2, ey - 2, 6, 5, C.gold); p.vline(ex + 1, ey + 3, ey + 9, C.gold);
      break;
  }
  if (blink) { p.hline(ex - 1, ex + 2, ey, C.ink); return; }
  if (s.eyes === 'sleepy') { p.hline(ex - 1, ex + 2, ey - 1, s.skinShade); p.rect(ex - 1, ey, 4, 2, C.white); p.rect(ex + 1, ey, 2, 2, C.ink); return; }
  const big = s.eyes === 'wide' ? 1 : 0;
  p.ellipse(ex + 0.5, ey, 2 + big, 2 + big, C.white);
  p.rect(ex + 1, ey - 1, 2, 2 + big, C.ink);
}

function eyesFront(p: Painter, s: HumanSpec, hx: number, ey: number, blink: boolean) {
  const off = Math.max(3, Math.round(s.headW * 0.4));
  for (const sgn of [-1, 1]) {
    const ex = hx + sgn * off;
    if (s.brows !== undefined) p.hline(ex - 2, ex + 2, ey - 4, s.brows);
    if (s.eyes === 'shades') { p.rect(ex - 2, ey - 2, 5, 3, C.black); continue; }
    if (s.eyes === 'patch' && sgn < 0) { p.rect(ex - 2, ey - 2, 4, 4, C.black); continue; }
    if (blink) { p.hline(ex - 1, ex + 1, ey, C.ink); continue; }
    p.ellipse(ex + 0.5, ey, 2, 2, C.white);
    p.rect(ex, ey - 1 + (s.eyes === 'sleepy' ? 1 : 0), 2, 2, C.ink);
    if (s.eyes === 'sleepy') p.hline(ex - 1, ex + 2, ey - 2, s.skinShade);
    if (s.eyes === 'glasses') p.frame(ex - 2, ey - 2, 5, 5, C.ink);
    if (s.eyes === 'monocle' && sgn > 0) p.frame(ex - 2, ey - 2, 5, 5, C.gold);
  }
  if (s.eyes === 'glasses') p.hline(hx - 1, hx + 1, ey - 1, C.ink);
  if (s.eyes === 'patch') p.line(hx - s.headW, ey - 4, hx + s.headW, ey - 3, C.black);
}

function noseSide(p: Painter, style: NoseStyle, len: number, nx: number, ny: number, c: number, shade: number) {
  switch (style) {
    case 'pointy':
    case 'long':
      p.poly([[nx - 2, ny - 3], [nx + len, ny + 1], [nx - 2, ny + 3]], c);
      p.hline(nx - 1, nx + len - 2, ny + 2, shade);
      break;
    case 'hook':
      p.poly([[nx - 2, ny - 3], [nx + len - 1, ny - 1], [nx + len, ny + 2], [nx + len - 2, ny + 3], [nx - 2, ny + 3]], c);
      p.px(nx + len - 1, ny + 2, shade);
      break;
    case 'big':
    case 'round':
      p.ellipse(nx + len / 2, ny + 1, len / 2 + 1, len / 2 + (style === 'big' ? 1 : 0), c);
      p.px(nx + len / 2, ny + len / 2 + 1, shade);
      break;
    case 'button':
      p.rect(nx, ny, 2, 2, c);
      break;
  }
}

function noseFront(p: Painter, style: NoseStyle, len: number, hx: number, ny: number, c: number, shade: number) {
  const r = Math.max(1, Math.round(len / 3));
  switch (style) {
    case 'big': case 'round':
      p.ellipse(hx + 0.5, ny + 2, r + 1, r + 1, c); p.px(hx - 1, ny + 3, shade); p.px(hx + 1, ny + 3, shade); break;
    case 'button':
      p.rect(hx, ny + 1, 2, 2, shade); break;
    default:
      p.poly([[hx, ny - 2], [hx + 3, ny + r + 2], [hx - 2, ny + r + 2]], c);
      p.hline(hx - 1, hx + 2, ny + r + 2, shade);
  }
}

function hair(p: Painter, s: HumanSpec, A: Anchors, back: boolean) {
  const { headX: hx, headY: hy, side } = A;
  const hw = s.headW, hh = s.headH, c = s.hair;
  switch (s.hairStyle) {
    case 'none': case 'bald':
      if (s.hairStyle === 'bald') {
        if (side) p.poly([[hx - hw, hy - 1], [hx - hw + 2, hy - 4], [hx - 1, hy - 2], [hx - 2, hy + 3], [hx - hw + 1, hy + 3]], c);
        else if (back) p.rect(hx - hw + 1, hy - 1, hw * 2 - 2, 5, c);
        else { p.rect(hx - hw, hy - 3, 2, 5, c); p.rect(hx + hw - 2, hy - 3, 2, 5, c); }
      }
      break;
    case 'swoop':
      // Mac's big black swept quiff (from the workflows-of-ai.com avatar)
      if (side) {
        p.poly([[hx - hw - 1, hy + 2], [hx - hw - 1, hy - hh + 2], [hx - hw + 3, hy - hh - 2], [hx + 1, hy - hh - 3], [hx + hw + 4, hy - hh - 2], [hx + hw + 6, hy - hh + 1], [hx + hw, hy - hh + 2], [hx + hw - 3, hy - hh + 3], [hx + 2, hy - hh + 4], [hx - 1, hy - 1], [hx - 3, hy + 3]], c);
        p.line(hx - hw + 2, hy - hh - 1, hx + hw + 2, hy - hh - 1, C.darkgray);
      } else if (back) {
        p.ellipse(hx, hy - 1, hw + 1, hh, c);
        p.poly([[hx - hw, hy - hh + 2], [hx - 2, hy - hh - 2], [hx + hw + 1, hy - hh - 1], [hx + hw + 1, hy - hh + 3]], c);
        p.hline(hx - hw + 2, hx + hw - 1, hy - hh, C.darkgray);
      } else {
        p.poly([[hx - hw - 1, hy + 1], [hx - hw - 1, hy - hh + 2], [hx - hw + 3, hy - hh - 2], [hx + hw + 2, hy - hh - 3], [hx + hw + 4, hy - hh], [hx + hw, hy - hh + 3], [hx - 1, hy - hh + 5], [hx - hw + 2, hy - hh + 4], [hx - hw + 1, hy + 1]], c);
        p.hline(hx - hw + 3, hx + hw, hy - hh - 1, C.darkgray);
      }
      break;
    case 'fringe':
      if (side) p.poly([[hx - hw, hy + 2], [hx - hw, hy - hh + 2], [hx, hy - hh - 1], [hx + hw, hy - hh + 2], [hx + hw - 1, hy - hh + 4], [hx - 2, hy - hh + 3], [hx - 2, hy + 1]], c);
      else if (back) p.ellipse(hx, hy - 1, hw + 1, hh, c);
      else p.poly([[hx - hw - 1, hy + 2], [hx - hw, hy - hh + 1], [hx, hy - hh - 1], [hx + hw, hy - hh + 1], [hx + hw + 1, hy + 2], [hx + hw - 2, hy - hh + 4], [hx - hw + 2, hy - hh + 4]], c);
      break;
    case 'spiky':
      for (let i = -hw; i <= hw; i += 3) p.poly([[hx + i - 2, hy - hh + 3], [hx + i + 1, hy - hh - 5], [hx + i + 3, hy - hh + 3]], c);
      p.ellipse(hx, hy - hh + 3, hw, 3, c);
      if (back) p.ellipse(hx, hy, hw, hh - 2, c);
      break;
    case 'wild':
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        p.circle(hx + Math.cos(a) * (hw + 1), hy - 2 + Math.sin(a) * (hh + 1), 3, c);
      }
      if (back) p.ellipse(hx, hy, hw + 2, hh, c);
      break;
    case 'long':
      if (side) p.poly([[hx - hw - 1, hy + hh], [hx - hw - 1, hy - hh + 2], [hx, hy - hh - 1], [hx + hw, hy - hh + 1], [hx + hw - 1, hy - hh + 4], [hx - 1, hy - hh + 3], [hx - 2, hy + hh]], c);
      else if (back) p.rect(hx - hw - 1, hy - hh + 1, hw * 2 + 2, hh * 2 + 4, c);
      else p.poly([[hx - hw - 2, hy + hh + 4], [hx - hw - 1, hy - hh + 2], [hx, hy - hh - 1], [hx + hw + 1, hy - hh + 2], [hx + hw + 2, hy + hh + 4], [hx + hw - 1, hy + hh + 4], [hx + hw - 2, hy - hh + 4], [hx - hw + 2, hy - hh + 4], [hx - hw + 1, hy + hh + 4]], c);
      break;
    case 'bun':
      p.ellipse(hx, hy - hh + 2, hw, 4, c);
      p.circle(hx + (side ? -hw + 1 : 0), hy - hh - 3, 4, c);
      if (back) p.ellipse(hx, hy, hw, hh - 2, c);
      break;
    case 'side':
      if (side) p.poly([[hx - hw, hy + 2], [hx - hw, hy - hh + 1], [hx + hw - 1, hy - hh + 1], [hx + hw - 2, hy - hh + 4], [hx - 1, hy - hh + 4], [hx - 2, hy + 2]], c);
      else if (back) p.ellipse(hx, hy - 1, hw + 1, hh, c);
      else p.poly([[hx - hw - 1, hy + 1], [hx - hw, hy - hh + 1], [hx + hw, hy - hh + 1], [hx + hw + 1, hy + 1], [hx + hw - 1, hy - hh + 4], [hx - 2, hy - hh + 4], [hx - hw + 1, hy + 1]], c);
      break;
  }
}
