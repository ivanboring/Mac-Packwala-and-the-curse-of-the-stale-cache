import type { Game, Hotspot, Role, RoomDef } from '../../../engine/types';
import type { Painter, Pt } from '../../../engine/paint';
import { C, signpost } from '../../art';
import { conifer } from '../../art2';
import { drawText, textWidth } from '../../../engine/font';
import { rng } from '../../../engine/rng';

// Island outline (the map is a top-down parchment-ish view floating in the sea).
const ISLAND: Pt[] = [[38, 72], [52, 44], [86, 28], [136, 20], [196, 16], [246, 26], [282, 40], [292, 62], [276, 80], [268, 106], [236, 126], [176, 134], [124, 132], [82, 124], [46, 106]];

interface Loc { id: string; room: string; name: string; at: Pt; r: [number, number, number, number]; role?: Role; look: string | string[]; }

const LOCS: Loc[] = [
  { id: 'loc_town', room: 'square', name: 'Legacy Town', at: [148, 98], r: [132, 84, 34, 24], look: 'Legacy Town. Home of the Grand Maintainer, Formsworth, and roughly forty years of unmigrated content.' },
  { id: 'loc_beach', room: 'beach', name: 'Shipwreck Beach', at: [108, 122], r: [94, 112, 28, 16], look: 'Where I washed up. The SS Waterfall is still lying there, being a lesson to everyone.' },
  { id: 'loc_keyhut', room: 'keyhut', name: "Key Keeper's Hut", at: [62, 66], r: [48, 54, 28, 22], role: 'editor', look: "The Key Keeper's hut. It has more locks than windows." },
  { id: 'loc_temple', room: 'temple', name: 'Temple of Providers', at: [220, 48], r: [204, 32, 32, 24], role: 'editor', look: 'The Temple of Providers. Where the AI idols live, and charge by the word.' },
  { id: 'loc_mill', room: 'mill', name: 'Automator Mill', at: [238, 98], r: [224, 82, 30, 26], role: 'editor', look: "Farmer Fieldsworth's mill. It has a suspiciously modern machine attached." },
  { id: 'loc_library', room: 'library', name: 'Library of Unindexed Knowledge', at: [98, 44], r: [84, 32, 30, 22], role: 'editor', look: 'The Library of Unindexed Knowledge. Thousands of books. Zero search results.' },
  { id: 'loc_graveyard', room: 'graveyard', name: 'Graveyard of Dead Web Tech', at: [60, 98], r: [46, 86, 30, 22], role: 'editor', look: 'The Graveyard of Dead Web Tech. Flash, GeoCities and <blink> rest here. Mostly.' },
  { id: 'loc_crossroads', room: 'crossroads', name: 'Code Review Crossroads', at: [166, 66], r: [152, 54, 28, 22], role: 'editor', look: 'Code Review Crossroads. Reviewer pirates hang around there, waiting to criticise passers-by.' },
  { id: 'loc_waterfall', room: 'waterfall', name: 'The Waterfall', at: [168, 30], r: [156, 16, 28, 26], role: 'editor', look: 'The Waterfall. Nobody uses the Waterfall anymore.' },
  { id: 'loc_lighthouse', room: 'lighthouse', name: 'Lighthouse', at: [282, 50], r: [270, 30, 24, 30], role: 'editor', look: 'The old lighthouse on the cape. Its lamp has been dark for years.' },
  { id: 'loc_reef', room: 'reef', name: 'Slack Reef', at: [284, 122], r: [272, 110, 26, 22], role: 'editor', look: 'Slack Reef. Something out there keeps squawking "new message in thread".' },
];

function paint(p: Painter, g: Game) {
  // the sea
  p.gradV(0, 0, 320, 144, [C.sea, C.seadark, C.seadark]);
  const r = rng(42);
  for (let i = 0; i < 90; i++) {
    const x = r.int(0, 318), y = r.int(0, 142);
    p.hline(x, x + 3, y, C.sea);
    p.px(x + 1, y - 1, C.skyblue);
  }
  // shallow water ring + island
  const grow = (pts: Pt[], d: number): Pt[] => pts.map(([x, y]) => [160 + (x - 160) * (1 + d), 76 + (y - 76) * (1 + d * 1.4)]);
  p.poly(grow(ISLAND, 0.07), [C.sea, C.skyblue]);
  p.poly(grow(ISLAND, 0.03), C.sandshade);
  p.poly(ISLAND, C.sand);
  p.poly(grow(ISLAND, -0.07), C.green);
  p.speckle(40, 20, 250, 110, C.darkgreen, 0.05, 7);
  p.speckle(40, 20, 250, 110, C.lime, 0.01, 8);
  // mountains in the north, the waterfall coming off them
  for (const [mx, my, mw] of [[120, 36, 26], [150, 30, 30], [190, 34, 24], [100, 50, 16]] as const) {
    p.poly([[mx - mw, my + 14], [mx, my - 12], [mx + mw, my + 14]], C.stone);
    p.poly([[mx, my - 12], [mx + mw, my + 14], [mx + 4, my + 14]], C.stoneshade);
    p.poly([[mx - 5, my - 6], [mx, my - 12], [mx + 5, my - 6], [mx, my - 8]], C.white);
  }
  p.rect(166, 20, 4, 18, [C.foam, C.skyblue, 'v']);
  p.ellipse(168, 40, 6, 3, C.skyblue);
  p.line(168, 43, 150, 70, C.skyblue); p.line(150, 70, 128, 96, C.skyblue); // river
  // jungle blobs
  for (let i = 0; i < 26; i++) {
    const x = r.int(60, 270), y = r.int(56, 118);
    if (Math.hypot(x - 148, y - 98) < 22) continue;
    p.circle(x, y, r.int(3, 5), r.chance(0.5) ? C.darkgreen : C.green);
  }
  // dotted paths from town to every place
  for (const l of LOCS) {
    if (l.id === 'loc_town' || l.id === 'loc_reef') continue;
    const [x0, y0] = [148, 98], [x1, y1] = l.at;
    const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 4);
    for (let i = 1; i < n; i++) p.rect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), 1, 1, C.tan);
  }
  // ---- landmarks --------------------------------------------------------------
  // Legacy Town: crooked roofs
  for (const [hx, hy, c] of [[138, 94, C.red], [148, 90, C.brandblue], [158, 95, C.orange], [144, 102, C.purple], [156, 103, C.teal]] as const) {
    p.rect(hx - 4, hy, 8, 6, C.white);
    p.poly([[hx - 6, hy], [hx, hy - 5], [hx + 6, hy]], c);
    p.px(hx - 1, hy + 2, C.navy);
  }
  // Beach: tiny wreck
  p.poly([[100, 124], [104, 118], [116, 118], [118, 124]], C.wood);
  p.vline(109, 110, 118, C.darkbrown);
  // Key Keeper's hut + giant key
  p.rect(56, 64, 12, 8, C.wood);
  p.poly([[54, 64], [62, 57], [70, 64]], C.darkbrown);
  p.circle(70, 60, 2, C.gold); p.hline(71, 76, 60, C.gold);
  // Temple: stepped pyramid
  for (let i = 0; i < 4; i++) p.rect(208 + i * 3, 52 - i * 5, 26 - i * 6, 5, i % 2 ? C.stone : C.stoneshade);
  p.rect(218, 47, 4, 5, C.black);
  // Mill: windmill
  p.poly([[234, 106], [236, 94], [242, 94], [244, 106]], C.white);
  p.poly([[234, 94], [239, 89], [244, 94]], C.red);
  // Library: columns
  p.rect(88, 40, 20, 10, C.white);
  p.poly([[86, 40], [98, 33], [110, 40]], C.lightgray);
  for (let i = 0; i < 4; i++) p.vline(90 + i * 5, 41, 49, C.lightgray);
  // Graveyard: stones
  for (const [gx, gy] of [[52, 96], [58, 100], [64, 95], [68, 101]]) { p.rect(gx, gy, 4, 5, C.lightgray); p.px(gx + 1, gy + 1, C.gray); }
  p.line(56, 92, 54, 86, C.darkbrown);
  // Crossroads: a signpost
  p.vline(166, 58, 70, C.wood);
  p.rect(160, 58, 12, 3, C.woodlight); p.rect(162, 63, 10, 3, C.woodlight);
  conifer(p, 176, 72, 14);
  // Lighthouse on the cape
  p.poly([[278, 58], [280, 34], [284, 34], [286, 58]], C.white);
  p.rect(279, 42, 7, 3, C.red); p.rect(279, 50, 8, 3, C.red);
  p.rect(279, 30, 6, 4, C.darkgray);
  // Slack Reef: rocks in the sea
  for (const [rx, ry] of [[280, 124], [288, 120], [284, 129], [293, 127]]) p.ellipse(rx, ry, 4, 3, C.stoneshade);
  p.rect(286, 113, 3, 5, C.green); p.px(287, 112, C.red); p.px(288, 114, C.yellow);
  // windmill blades
  p.line(233, 88, 245, 100, C.woodlight); p.line(245, 88, 233, 100, C.woodlight);
  void g;
}

function front(p: Painter) {
  // compass rose + title cartouche sit above the fog
  const cx = 24, cy = 122;
  p.poly([[cx, cy - 10], [cx + 3, cy], [cx, cy + 10], [cx - 3, cy]], C.brandpaper);
  p.poly([[cx - 10, cy], [cx, cy - 3], [cx + 10, cy], [cx, cy + 3]], C.brandmist);
  p.poly([[cx, cy - 10], [cx + 3, cy], [cx, cy]], C.brandpink);
  drawText(p, 'N', cx - 2, cy - 21, C.white);
  signpost(p, 4, 4, 82, ['LEGACY ISLAND', 'not to scale'], 0, C.sand, C.darkbrown);
}

function anim(p: Painter, g: Game, t: number) {
  // the Fog of Technical Debt, drifting around the whole map edge
  const r = rng(9);
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + t / 40000;
    const rx = 176 + r.int(-4, 10), ry = 88 + r.int(-2, 8);
    const x = 160 + Math.cos(a) * rx, y = 76 + Math.sin(a) * ry;
    p.ellipse(x, y, 14 + (i % 3) * 3, 7 + (i % 2) * 2, i % 2 ? C.fog : [C.fog, C.lightgray]);
  }
  // little "you are here" marker
  const at = LOCS.find((l) => l.room === g.flag('mapAt'))?.at;
  if (at && Math.floor(t / 400) % 2 === 0) {
    p.poly([[at[0] - 4, at[1] - 14], [at[0] + 5, at[1] - 14], [at[0], at[1] - 8]], C.brandpink);
    p.rect(at[0] - 1, at[1] - 18, 3, 4, C.brandpink);
  }
  // hover labels are handled by the sentence line; draw a tiny legend title
  const title = 'Click a place to travel';
  drawText(p, title, 314 - textWidth(title), 134, C.brandpaper);
}

const locHotspots: Hotspot[] = LOCS.map((l) => ({
  id: l.id,
  name: l.name,
  rect: l.r,
  exit: { to: l.room },
  defaultVerb: 'walk',
  roles: l.role ? { walk: l.role, use: l.role, open: l.role } : undefined,
  roleRefusal: "The jungle paths are only open to Editors. I should get the Grand Maintainer's blessing first.",
  look: l.look,
}));

export const map: RoomDef = {
  id: 'map',
  name: 'Island Map',
  noMac: true,
  paint,
  anim,
  animFront: (p) => front(p),
  walk: [[[0, 0], [1, 0], [1, 1]]],
  enter: async (g, from) => {
    if (from) g.set('mapAt', from);
    if (!g.flag('mapSeen')) {
      g.set('mapSeen');
      await g.narrate('The island map. Click a place to travel there. The fog surrounds everything - no ship can see this island.');
    }
  },
  hotspots: [
    ...locHotspots,
    {
      id: 'mapfog', name: 'fog of technical debt', rect: [0, 0, 320, 14], noWalk: true,
      look: ['The Fog of Technical Debt. It surrounds the whole island.', "Nobody gets in, nobody gets out. Unless someone outside knows exactly where we are."],
    },
    {
      id: 'mapsea', name: 'sea', rect: [0, 14, 30, 100], noWalk: true,
      look: 'The sea. A lot of it. Most of it between me and anywhere with automatic updates.',
    },
  ],
};
