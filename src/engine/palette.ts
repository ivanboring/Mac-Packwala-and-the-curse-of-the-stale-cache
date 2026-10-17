// A fixed, VGA-ish cartoon palette. Everything on screen is drawn from these.
// Colors are stored as 32-bit ABGR (little-endian ImageData layout).

const HEX = {
  clear: '#00000000',
  black: '#000000',
  ink: '#1a1020',
  darkgray: '#3c3c4a',
  gray: '#6e6e80',
  lightgray: '#a8a8b8',
  white: '#f4f4ec',
  skin: '#f0b888',
  skinshade: '#c8845c',
  skindark: '#8c5a3c',
  brown: '#6b3f1f',
  darkbrown: '#3f2410',
  tan: '#c49a6c',
  sand: '#e8cc8a',
  sandshade: '#c8a464',
  red: '#c8282c',
  darkred: '#7c141c',
  pink: '#f07890',
  orange: '#f08c28',
  yellow: '#f8e040',
  gold: '#d8a820',
  olive: '#8c8c28',
  green: '#48a838',
  darkgreen: '#1f6428',
  lime: '#a8e048',
  teal: '#20908c',
  cyan: '#58d8e8',
  skyblue: '#78b8f0',
  blue: '#2c5cc8',
  navy: '#1c2860',
  purple: '#7840a8',
  darkpurple: '#40205c',
  lavender: '#b088e0',
  magenta: '#c838a8',
  sea: '#2878b0',
  seadark: '#144c80',
  foam: '#c8ecf8',
  night: '#101838',
  stone: '#8c8478',
  stoneshade: '#5c564c',
  wood: '#9c6430',
  woodlight: '#c88c4c',
  fog: '#c8ccd8',
  node: '#2cc0a8',
  nodedark: '#13786c',
  nodelight: '#9ef0dc',
  sunset: '#f8a058',
  glow: '#fff8b0',
  ghost: '#d0f0e8',
  ghostshade: '#88c0b8',
  // workflows-of-ai.com brand colors
  brandink: '#0a0c10',
  brandblue: '#4242fa',
  brandbluelight: '#8c8cff',
  brandpink: '#e60067',
  brandslate: '#5a6072',
  brandmist: '#d6d8e1',
  brandpaper: '#f1f3f9',
  chair: '#4a505e',
  mug: '#e8186c',
} as const;

export type ColorName = keyof typeof HEX;

function hexToABGR(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) : 255;
  return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

export const C = Object.fromEntries(
  Object.entries(HEX).map(([k, v]) => [k, hexToABGR(v)]),
) as Record<ColorName, number>;

export const CSS = HEX as Record<ColorName, string>;

export const TRANSPARENT = 0;
