import type { Painter, Pt } from './paint';
import type { ColorName } from './palette';

export type Role = 'anonymous' | 'authenticated' | 'editor' | 'sitebuilder';
export type Verb = 'give' | 'pickup' | 'use' | 'open' | 'look' | 'push' | 'close' | 'talk' | 'pull' | 'walk';
export type Dir = 'left' | 'right' | 'front' | 'back';

/** A script: plain text (Mac says it), a list (Mac says each line), or code. */
export type Handler = string | string[] | ((g: Game) => void | Promise<void>);

export interface Hotspot {
  id: string;
  name: string | ((g: Game) => string);
  rect?: [number, number, number, number];
  poly?: Pt[];
  /** Hit area follows this character's sprite. */
  actor?: string;
  walkTo?: Pt | ((g: Game) => Pt);
  face?: Dir;
  /** Present only when this returns true. */
  when?: (g: Game) => boolean;
  /** Walking onto it leaves the room. */
  exit?: { to: string; at?: Pt; face?: Dir };
  defaultVerb?: Verb;
  /** Minimum role per verb ('*' = any verb). */
  roles?: Partial<Record<Verb | '*', Role>>;
  /** Custom refusal for role failures. */
  roleRefusal?: string;
  look?: Handler;
  talk?: Handler;
  pickup?: Handler;
  open?: Handler;
  close?: Handler;
  push?: Handler;
  pull?: Handler;
  use?: Handler;
  walk?: Handler;
  /** "Use <item> with <this>" */
  useItem?: Record<string, Handler>;
  /** "Give <item> to <this>" */
  giveItem?: Record<string, Handler>;
  /** Fallback for any item used on / given to this hotspot. */
  anyItem?: (g: Game, item: string, verb: 'use' | 'give') => void | Promise<void>;
  /** Skip walking over before acting (for things far away, like the sky). */
  noWalk?: boolean;
}

export interface ItemDef {
  id: string;
  name: string | ((g: Game) => string);
  look: Handler;
  /** Draw the inventory icon into a 28x19 area at 0,0. */
  icon: (p: Painter, g?: Game) => void;
  /** Tool API tool card: lives in the Tool API Belt tab. */
  tool?: boolean;
  /** "Use" runs immediately instead of asking "Use X with...". */
  useAlone?: boolean;
  use?: Handler;
  open?: Handler;
  close?: Handler;
  push?: Handler;
  pull?: Handler;
  talk?: Handler;
  pickup?: Handler;
  /** "Use <this> with <other item>" (looked up both ways). */
  combine?: Record<string, Handler>;
  roles?: Partial<Record<Verb | '*', Role>>;
  roleRefusal?: string;
}

export interface NpcPlacement {
  id: string;
  at: Pt;
  face?: Dir;
  when?: (g: Game) => boolean;
}

export interface RoomDef {
  id: string;
  name: string;
  width?: number;
  /** Static background; repainted only when bgKey changes. */
  paint: (p: Painter, g: Game) => void;
  bgKey?: (g: Game) => string;
  /** Drawn over the actors (cached like the background). */
  front?: (p: Painter, g: Game) => void;
  /** Per-frame animation layer under the actors. `t` is milliseconds. */
  anim?: (p: Painter, g: Game, t: number) => void;
  /** Per-frame layer over the actors. */
  animFront?: (p: Painter, g: Game, t: number) => void;
  /** Walkable area: union of polygons. */
  walk: Pt[][] | ((g: Game) => Pt[][]);
  /** Depth scaling: [yFar, scaleFar, yNear, scaleNear]. */
  scale?: [number, number, number, number];
  hotspots: Hotspot[];
  npcs?: NpcPlacement[];
  /** Default entry point. */
  start?: Pt;
  startFace?: Dir;
  enter?: (g: Game, from: string | null) => void | Promise<void>;
  /** Mac is hidden (title, map screen draws its own marker). */
  noMac?: boolean;
  /** Map-scale Mac (tiny). */
  macScale?: number;
  /** Runs before every verb in this room; return a handler to override. */
  intercept?: (g: Game, verb: Verb, target: { kind: 'hotspot' | 'item'; id: string }) => Handler | undefined;
  /** Click-to-walk allowed (default true). */
  canWalk?: (g: Game) => boolean;
}

export interface DialogueOption {
  id: string;
  text: string | ((g: Game) => string);
  when?: (g: Game) => boolean;
  /** Disappears after being chosen once (remembered in the save). */
  once?: boolean;
  /** Mac says the option text before `run` (default true). */
  say?: boolean;
  /** Return 'end' (or a Promise of it) to end the conversation. */
  run?: (g: Game) => unknown;
  /** Ends the conversation after running. */
  end?: boolean;
}

export interface Dialogue {
  id: string;
  with: string;
  options: DialogueOption[];
  start?: (g: Game) => void | Promise<void>;
}

export interface PuppetPose {
  dir: Dir;
  walk: number;   // -1 standing, 0..3 walk frame
  talk: boolean;  // mouth open frame
  t: number;      // ms clock for idle animation
  gesture?: string;
}

export interface CharacterDef {
  id: string;
  name: string;
  color: ColorName;
  /** Draw centered at x=W/2, feet at bottom of a W x H bitmap. */
  draw: (p: Painter, pose: PuppetPose) => void;
  w: number;
  h: number;
  /** Walk speed px/s at scale 1. */
  speed?: number;
  /** Offset of speech text above the sprite top. */
  talkY?: number;
}

export interface SaveState {
  v: number;
  room: string;
  role: Role;
  flags: Record<string, number | string | boolean>;
  inv: string[];
  mac: { x: number; y: number; dir: Dir };
  playMs: number;
}

export interface ActorHandle {
  readonly id: string;
  x: number;
  y: number;
  dir: Dir;
  visible: boolean;
  gesture?: string;
  say(text: string | string[]): Promise<void>;
  walkTo(x: number, y: number): Promise<void>;
  face(dir: Dir): void;
}

/** The API every room/item/dialogue script talks to. */
export interface Game {
  readonly state: SaveState;
  readonly headless: boolean;
  readonly room: RoomDef;
  flag<T = any>(name: string): T;
  set(name: string, value?: number | string | boolean): void;
  inc(name: string, by?: number): number;
  has(item: string): boolean;
  give(item: string, quiet?: boolean): void;
  take(item: string): void;
  role: Role;
  atLeast(role: Role): boolean;
  grantRole(role: Role): Promise<void>;
  say(text: string | string[]): Promise<void>;
  sayAs(actor: string, text: string | string[]): Promise<void>;
  narrate(text: string | string[]): Promise<void>;
  actor(id: string): ActorHandle;
  mac: ActorHandle;
  walkTo(x: number, y: number): Promise<void>;
  face(dir: Dir): void;
  wait(ms: number): Promise<void>;
  goto(room: string, at?: Pt, face?: Dir): Promise<void>;
  choose(options: { id: string; text: string }[]): Promise<string>;
  talk(dialogueId: string): Promise<void>;
  /** Run a room effect by name (visual only; no-op headless). */
  fx(name: string, ...args: any[]): Promise<void>;
  /** Plays a full-screen card (chapter titles, endings). */
  card(lines: string[], ms?: number): Promise<void>;
  /** A code review against a reviewer (see codeReview.ts). Resolves true if Mac wins. */
  duel(opponent: string): Promise<boolean>;
  random<T>(arr: readonly T[]): T;
  shake(): void;
  refresh(): void;
  /** Presenter clock in ms (0 when headless). Useful for timed room animations. */
  now(): number;
  /** End of game: return to the title screen. */
  toTitle(): Promise<void>;
}
