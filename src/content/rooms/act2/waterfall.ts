import type { Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, rock, grassTufts, bush, textOn } from '../../art';
import { jungle, fern, vine, plaque } from '../../art2';
import { textWidth } from '../../../engine/font';

const TIERS = ['REQUIREMENTS', 'DESIGN', 'IMPLEMENTATION', 'VERIFICATION', 'MAINTENANCE'];
const tier = (i: number) => ({ x: 8 + i * 64, y: 14 + i * 17, w: 92 });
// The cave hides behind the last (and biggest) fall.
const CAVE = { x: 352, y: 84, w: 30, h: 26 };

function paint(p: Painter) {
  sky(p, 400, 60, 'day');
  jungle(p, 0, 2, 400, 60, 21);
  // the cliff the methodology is carved into
  const cliff: [number, number][] = [[0, 112], [0, 2]];
  TIERS.forEach((_l, i) => { const { x, y, w } = tier(i); cliff.push([x + w - 6, y - 10], [x + w + 8, y + 4]); });
  cliff.push([400, 76], [400, 112]);
  p.poly(cliff, C.stoneshade);
  p.speckle(0, 2, 400, 110, [C.stoneshade, C.darkgray, '25'], 0.06, 4);
  p.polyline(cliff.slice(1, -1), C.stone);
  // jungle spilling over each step of the cliff
  TIERS.forEach((_l, i) => { const { x, y, w } = tier(i); bush(p, x + w + 10, y + 2, 1.1); });
  TIERS.forEach((label, i) => {
    const { x, y, w } = tier(i);
    // the ledge: top, face and a shadow under it
    p.rect(x, y + 12, w, 16, C.darkgray);
    p.poly([[x, y], [x + w, y], [x + w + 4, y + 4], [x + 4, y + 4]], C.stone);
    p.rect(x, y + 4, w, 12, C.stone);
    p.hline(x, x + w - 1, y + 15, C.stoneshade);
    p.speckle(x, y + 4, w, 12, C.stoneshade, 0.08, i + 3);
    // the label, carved neatly as if anyone ever read it
    const lx = Math.round(x + (w - 18 - textWidth(label)) / 2);
    textOn(p, label, lx, y + 5, C.ink);
    // water on the ledge
    p.rect(x + 18, y, w - 18, 3, C.sea);
    p.hline(x + 20, x + w - 3, y + 1, C.foam);
  });
  // the cave mouth (the falls are drawn over it in anim)
  p.poly([[CAVE.x, CAVE.y + CAVE.h], [CAVE.x + 2, CAVE.y + 6], [CAVE.x + CAVE.w / 2, CAVE.y], [CAVE.x + CAVE.w - 2, CAVE.y + 6], [CAVE.x + CAVE.w, CAVE.y + CAVE.h]], C.black);
  // the pool
  p.ellipse(340, 120, 70, 14, C.navy);
  p.ellipse(340, 119, 66, 12, C.sea);
  p.ellipse(330, 122, 40, 6, C.blue);
  // ground
  p.gradV(0, 108, 400, 36, [C.green, C.darkgreen]);
  p.ellipse(340, 122, 64, 11, C.sea);
  p.ellipse(330, 124, 36, 5, C.blue);
  grassTufts(p, 0, 112, 268, 32, 7, C.lime);
  // stepping stones to the cave
  for (const [x, y] of [[284, 116], [300, 112], [318, 110], [336, 108]] as const) {
    p.ellipse(x, y, 7, 3, C.stone);
    p.hline(x - 5, x + 5, y + 2, C.stoneshade);
  }
  rock(p, 236, 112, 22, 12, 3);
  rock(p, 384, 128, 20, 12, 6);
  bush(p, 22, 116, 1);
  bush(p, 200, 114, 0.9);
  fern(p, 60, 120, 1);
  fern(p, 214, 122, 0.9);
  vine(p, 48, 0, 30, 3);
  vine(p, 150, 0, 22, 6);
  // the sign
  p.rect(70, 112, 3, 16, C.wood);
  plaque(p, 40, 78, ['DEPRECATED', 'SINCE 2001.', 'PLEASE USE', 'AGILE RAPIDS', '         ->'], C.woodlight, C.darkbrown, C.wood);
  // the Agile Rapids: a tiny frantic stream that changes direction a lot
  p.polyline([[120, 143], [128, 136], [120, 132], [132, 128], [126, 124], [136, 120]], C.sea);
  p.polyline([[121, 143], [129, 136], [121, 132], [133, 128], [127, 124], [137, 120]], C.foam);
}

function anim(p: Painter, _g: Game, t: number) {
  // the falls: one off the end of every ledge, the last one the widest
  TIERS.forEach((_l, i) => {
    const { x, y, w } = tier(i);
    const fx = x + w, top = y + 1;
    const bottom = i < TIERS.length - 1 ? tier(i + 1).y + 1 : 116;
    const width = i < TIERS.length - 1 ? 6 : 36;
    const left = i < TIERS.length - 1 ? fx : CAVE.x - 4;
    p.rect(left, top, width, bottom - top, C.sea);
    for (let s = 0; s < width; s += 2) {
      const off = Math.floor((t / 40 + s * 7 + i * 13) % 12);
      for (let yy = top + off; yy < bottom; yy += 12) p.vline(left + s, yy, Math.min(bottom, yy + 4), (s / 2) % 2 ? C.foam : C.white);
    }
    // a glimpse of the dark cave through the last curtain
    if (i === TIERS.length - 1) {
      for (let yy = CAVE.y + 8; yy < CAVE.y + CAVE.h; yy += 3) {
        const k = Math.floor(t / 120 + yy) % 3;
        p.hline(CAVE.x + 6 + k, CAVE.x + CAVE.w - 8 + k, yy, C.navy);
      }
    }
    // splash
    for (let s = 0; s < 3; s++) {
      const ph = Math.floor((t / 90 + s * 3 + i) % 4);
      p.px(left - 1 - ph + s * 3, bottom - 1 - ph, C.white);
      p.px(left + width + ph - s * 2, bottom - 1 - ph, C.foam);
    }
  });
  // mist drifting over the pool
  for (let i = 0; i < 6; i++) {
    const mx = Math.round(300 + ((t / 50 + i * 23) % 90)), my = 106 + (i % 3) * 3;
    p.hline(mx, mx + 8, my, [C.foam, C.sea, 'check']);
  }
  // rainbow in the mist
  const bands = [C.red, C.orange, C.yellow, C.lime, C.skyblue, C.purple];
  bands.forEach((c, i) => {
    const r = 34 - i;
    for (let a = 0; a <= 40; a++) {
      const ang = Math.PI * (0.1 + a * 0.02);
      if ((a + i) % 9 === 0 && Math.floor(t / 400) % 2) continue;
      p.px(Math.round(326 + Math.cos(ang) * r), Math.round(118 - Math.sin(ang) * r * 0.6), c);
    }
  });
  // the frog on a lily pad
  p.ellipse(318, 126, 7, 2, C.green);
  p.px(318, 125, C.sea);
  const blink = Math.floor(t / 2400) % 5 === 0;
  p.ellipse(318, 123, 4, 3, C.lime);
  p.px(316, 120, blink ? C.lime : C.ink);
  p.px(320, 120, blink ? C.lime : C.ink);
  if (Math.floor(t / 1700) % 4 === 0) p.ellipse(318, 126, 3, 2, C.yellow); // throat
}

async function enterCave(g: Game) {
  if (!g.flag('knowsDojo')) {
    await g.say(['Walk into the Waterfall? No way. We\'re agile now.', 'Also it is wet. Very, very wet. Like a 300-page spec.']);
    return;
  }
  await g.say(['"Behind the Waterfall," the reviewer said.', 'For once, the Waterfall leads somewhere. Deep breath...']);
  await g.goto('dojo');
}

export const waterfall: RoomDef = {
  id: 'waterfall',
  name: 'The Waterfall',
  width: 400,
  paint,
  anim,
  scale: [108, 0.84, 143, 1],
  walk: [
    [[0, 114], [274, 114], [270, 143], [0, 143]],
    [[268, 114], [300, 108], [340, 102], [346, 110], [302, 116], [272, 122]],
    [[266, 136], [400, 136], [400, 143], [266, 143]],
  ],
  start: [24, 136],
  startFace: 'right',
  enter: async (g, from) => {
    if (!g.flag('waterfallSeen')) {
      g.set('waterfallSeen');
      await g.say(['The Waterfall. Each step carved with a phase. Water flows down in one direction only, forever.', 'No going back up. Classic.']);
    }
    if (from === 'dojo') await g.say("I'm drenched. But enlightened. Mostly drenched.");
  },
  hotspots: [
    {
      id: 'wf_path', name: 'path back', rect: [0, 100, 22, 44], walkTo: [8, 132], face: 'left',
      look: 'The path back through the jungle.',
      exit: { to: 'map' },
    },
    {
      id: 'tiers', name: 'carved ledges', rect: [8, 14, 320, 86], walkTo: [140, 118], face: 'back',
      look: [
        'REQUIREMENTS, DESIGN, IMPLEMENTATION, VERIFICATION, MAINTENANCE. The Waterfall method.',
        'You finish each phase completely before the next starts, and the water never flows back up.',
        'So if the requirements were wrong, you find out at the bottom. Soaking wet. Two years later.',
      ],
      pickup: 'I can\'t pick up a methodology. Many have tried. Some are still holding it.',
      push: "It's carved in stone. That was always the problem.",
    },
    {
      id: 'maint', name: 'MAINTENANCE ledge', rect: [264, 82, 84, 18], walkTo: [270, 116], face: 'back',
      look: 'MAINTENANCE: the biggest ledge and the biggest fall. Nobody budgets for it. Everybody ends up there.',
    },
    {
      id: 'cave', name: 'the falls', rect: [344, 76, 44, 34], walkTo: [338, 106], face: 'right',
      look: (g) => g.say(g.flag('knowsDojo')
        ? 'Now that I look closely... there IS a dark opening behind the curtain of water. "Behind the Waterfall."'
        : 'The last and biggest fall, crashing into the pool. Something dark is behind it. Probably more Waterfall.'),
      exit: { to: 'dojo' },
      walk: enterCave,
      use: enterCave,
      open: enterCave,
    },
    {
      id: 'pool', name: 'pool', rect: [272, 112, 128, 22], walkTo: [270, 130], face: 'right',
      look: 'The pool at the bottom, where every project ends up. Deep, cold, and full of change requests.',
      use: "I dip a toe in. It's freezing. Like a code freeze, but wetter.",
      pickup: "I can't carry a pool. Not even a connection pool.",
    },
    {
      id: 'wf_sign', name: 'sign', rect: [38, 76, 76, 52], walkTo: [76, 132], face: 'back',
      look: '"Methodology deprecated since 2001. Please use the Agile Rapids." There\'s an arrow pointing at a tiny stream.',
    },
    {
      id: 'rapids', name: 'Agile Rapids', rect: [116, 118, 24, 25],
      look: 'The Agile Rapids. Tiny, fast, changes direction every two weeks. Holds a stand-up meeting every morning.',
      use: 'I step over it. It immediately pivots.',
    },
    {
      id: 'frog', name: 'frog', rect: [308, 116, 20, 12],
      look: 'A frog on a lily pad. It has seen many projects go over the falls. It no longer reacts.',
      talk: 'Ribbit. Which is frog for "out of scope".',
      pickup: "He hops just out of reach. He's been dodging requirements for years.",
      giveItem: { herring: 'The frog considers the herring, then me, and decides neither is worth the effort.' },
    },
    {
      id: 'rainbow', name: 'rainbow', rect: [292, 96, 68, 14],
      look: 'A rainbow in the mist. At the end of it, a pot of technical debt.',
      pickup: "I grab for it. My hand goes straight through. Like most roadmaps.",
    },
    {
      id: 'wf_rocks', name: 'rocks', rect: [222, 104, 30, 14],
      look: 'Wet rocks. Smoothed by decades of falling specification documents.',
      push: "It doesn't move. Rocks are very committed to the plan.",
    },
    {
      id: 'stones', name: 'stepping stones', rect: [276, 104, 66, 14], walkTo: [300, 116], face: 'right',
      look: (g) => g.say(g.flag('knowsDojo') ? 'Stepping stones lead right up to the falls. Someone walks this path. Someone with a red pen.' : 'Stepping stones lead to the falls. To nowhere. Probably a decorative feature.'),
    },
  ],
};
