import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import { C, sky, cloud, sea, sand, palm, rock, signpost, crate, bottle, surf, seagull, bush, grassTufts } from '../../art';

const SHORE: [number, number][] = [[0, 96], [40, 92], [90, 90], [140, 88], [190, 87], [240, 88], [290, 92], [320, 94]];

function paint(p: import('../../../engine/paint').Painter, g: Game) {
  sky(p, 320, 60, 'day');
  cloud(p, 60, 14, 1);
  cloud(p, 190, 22, 0.8);
  cloud(p, 280, 10, 1.2);
  // fog bank of technical debt on the horizon
  for (let i = 0; i < 8; i++) p.ellipse(200 + i * 18, 54 - (i % 3) * 2, 16, 7, [C.fog, C.lightgray]);
  p.ellipse(310, 50, 20, 9, C.fog);
  sea(p, 0, 56, 320, 44);
  // sand with a wavy shoreline
  p.poly([[0, 96], ...SHORE, [320, 144], [0, 144]], C.sand);
  sand(p, 0, 96, 320, 48, 11);
  p.poly([[0, 96], ...SHORE, [320, 98], [0, 100]], [C.sandshade, C.sand]);

  // cliff on the left with a path up
  p.poly([[0, 0], [26, 0], [34, 30], [30, 60], [40, 92], [24, 104], [0, 108]], C.stone);
  p.poly([[0, 0], [12, 0], [16, 40], [10, 104], [0, 106]], C.stoneshade);
  for (let i = 0; i < 6; i++) p.line(26 - i * 2, 100 - i * 15, 34 - i * 3, 92 - i * 15, C.sandshade);
  p.speckle(0, 0, 40, 104, C.stoneshade, 0.05, 3);
  bush(p, 30, 64, 0.8);
  grassTufts(p, 14, 70, 20, 30, 4);

  // shipwreck in the shallows
  p.poly([[44, 92], [58, 64], [120, 58], [134, 70], [126, 92]], C.wood);
  p.poly([[58, 64], [120, 58], [124, 64], [62, 70]], C.woodlight);
  for (let i = 0; i < 6; i++) p.line(52 + i * 2, 76 + i * 3, 128 - i, 74 + i * 3, C.brown);
  p.poly([[92, 68], [106, 66], [102, 80], [94, 82]], C.darkbrown); // hole
  p.line(84, 62, 74, 12, C.darkbrown);
  p.line(85, 62, 75, 12, C.wood);
  p.hline(66, 88, 24, C.darkbrown);
  p.poly([[60, 92], [134, 90], [134, 96], [60, 98]], [C.sea, C.foam, '25']);
  // name on the hull
  p.hline(66, 96, 86, C.white);

  // the sign
  signpost(p, 168, 44, 58, ['Welcome to', 'LEGACY', 'ISLAND', 'Pop.: 404'], 14);
  palm(p, 228, 104, 54, -10, 2);
  palm(p, 306, 106, 64, 8, 5);
  rock(p, 140, 104, 18, 6, 9, C.sandshade, C.tan);
  // path to town
  p.poly([[300, 100], [320, 98], [320, 140], [292, 130]], [C.sand, C.tan, '25']);

  // the crate
  crate(p, 106, 112, 18, 14, !!g.flag('crateOpen'));
  // plank
  if (!g.flag('got:plank')) {
    p.poly([[188, 130], [214, 124], [216, 127], [190, 133]], C.woodlight);
    p.line(190, 131, 213, 126, C.wood);
  }
  // seaweed pile
  p.ellipse(252, 120, 10, 4, C.darkgreen);
  p.ellipse(248, 118, 6, 3, C.green);
  p.line(244, 119, 258, 117, C.olive);
  // duck
  if (!g.flag('got:duck')) {
    p.ellipse(62, 134, 5, 3, C.yellow);
    p.circle(58, 130, 3, C.yellow);
    p.rect(54, 130, 2, 1, C.orange);
    p.px(57, 129, C.black);
  }
  // sail: covering Mac at the start, crumpled afterwards
  if (!g.flag('sailOff')) {
    p.poly([[132, 128], [146, 112], [160, 108], [176, 114], [184, 128], [160, 132]], C.white);
    p.poly([[146, 112], [160, 108], [158, 120]], C.foam);
    p.line(140, 126, 180, 126, C.lightgray);
    p.rect(128, 126, 6, 4, C.skin); // a hand sticking out
  } else {
    p.poly([[176, 136], [190, 130], [206, 132], [212, 140], [182, 142]], C.white);
    p.line(184, 136, 208, 138, C.lightgray);
  }
}

function anim(p: import('../../../engine/paint').Painter, g: Game, t: number) {
  surf(p, t, SHORE);
  seagull(p, 140 + Math.sin(t / 3000) * 60, 30 + Math.sin(t / 900) * 4, t);
  seagull(p, 210 + Math.sin(t / 2500 + 2) * 40, 18 + Math.cos(t / 800) * 3, t + 90);
  // torn sail flapping on the mast
  const k = Math.round(Math.sin(t / 250) * 2);
  p.poly([[76, 26], [88, 26], [92 + k, 40], [80 + k, 50], [74, 44]], C.white);
  p.line(80 + k, 50, 76, 26, C.lightgray);
  // bottles bobbing in the surf
  const bob = Math.round(Math.sin(t / 400) * 1.5);
  if (!g.flag('got:bottle')) bottle(p, 222, 86 + bob, C.lime);
  if (g.flag('regSent') && !g.flag('got:verifylink')) bottle(p, 196, 85 - bob, C.skyblue);
  // the guard's spinner etc. are drawn by the sprite
}

export const beachDialogues: Dialogue[] = [
  {
    id: 'guard',
    with: 'guard',
    start: async (g) => {
      if (!g.flag('guardMet')) {
        g.set('guardMet');
        await g.sayAs('guard', ['Halt! Before you enter Legacy Town:', 'This island uses cookies to improve your experience.', 'Do you consent?']);
      } else {
        await g.sayAs('guard', 'Back again? This island still uses cookies. Do you consent?');
      }
    },
    options: [
      {
        id: 'accept', text: 'Accept all.',
        run: async (g) => { await acceptAll(g); return 'end'; },
      },
      {
        id: 'manage', text: 'Manage preferences.',
        run: async (g) => { await g.talk('cookieprefs'); return 'end'; },
      },
      {
        id: 'what', text: "What's a cookie?", once: true,
        run: async (g) => {
          await g.sayAs('guard', [
            'A cookie is a tiny file a website saves on your computer to remember you.',
            'Some are useful. Some follow you around the internet like a lost puppy with a notepad.',
            'Also, it is a biscuit. We have both. Mostly the notepad kind.',
          ]);
        },
      },
      {
        id: 'who', text: 'Who are you?', once: true,
        run: async (g) => {
          await g.sayAs('guard', ['I am the Cookie Consent Guard. I pop up in front of everything.', 'It is a calling.']);
        },
      },
      { id: 'bye', text: "I'll think about it.", end: true },
    ],
  },
  {
    id: 'cookieprefs',
    with: 'guard',
    start: async (g) => {
      g.set('prefPage', 1);
      await g.sayAs('guard', 'Excellent! We have 47 categories. Let us begin.');
    },
    options: [
      { id: 'p1a', text: 'Strictly necessary cookies (always on)', when: (g) => g.flag('prefPage') === 1, say: false, run: (g) => g.sayAs('guard', 'Those cannot be turned off. They are necessary. Strictly.') },
      { id: 'p1b', text: 'Performance cookies', when: (g) => g.flag('prefPage') === 1, say: false, run: (g) => g.sayAs('guard', 'Toggled! Your performance has been noted. It was average.') },
      { id: 'p1c', text: 'Chocolate chip cookies', when: (g) => g.flag('prefPage') === 1, say: false, run: (g) => g.sayAs('guard', 'Toggled ON. Wise choice. Nobody turns those off.') },
      { id: 'p1n', text: 'Next page ->', when: (g) => g.flag('prefPage') === 1, say: false, run: (g) => { g.set('prefPage', 2); } },

      { id: 'p2a', text: 'Third-party cookies', when: (g) => g.flag('prefPage') === 2, say: false, run: (g) => g.sayAs('guard', 'Toggled! The third party is disappointed.') },
      { id: 'p2b', text: 'Fourth-party cookies', when: (g) => g.flag('prefPage') === 2, say: false, run: (g) => g.sayAs('guard', 'The fourth party is a friend of the third party. They share everything.') },
      { id: 'p2c', text: 'Fifth-party cookies (we do not know who they are either)', when: (g) => g.flag('prefPage') === 2, say: false, run: (g) => g.sayAs('guard', 'Toggled. Somewhere, a seagull with a laptop sighs.') },
      { id: 'p2n', text: 'Next page ->', when: (g) => g.flag('prefPage') === 2, say: false, run: (g) => { g.set('prefPage', 3); } },

      { id: 'p3a', text: "Grandma's oatmeal raisin (legitimate interest)", when: (g) => g.flag('prefPage') === 3, say: false, run: (g) => g.sayAs('guard', 'Grandma has a legitimate interest in you. You cannot argue with Grandma.') },
      { id: 'p3b', text: 'Fortune cookies (they already know your choice)', when: (g) => g.flag('prefPage') === 3, say: false, run: (g) => g.sayAs('guard', '"You will click Accept all." Spooky.') },
      { id: 'p3n', text: 'Next page ->', when: (g) => g.flag('prefPage') === 3, say: false, run: (g) => { g.set('prefPage', 4); } },

      { id: 'p4a', text: 'SAVE PREFERENCES', when: (g) => g.flag('prefPage') === 4, say: false, run: async (g) => {
        await g.say('Save preferences.');
        await g.sayAs('guard', "Preferences saved! According to your preferences, you've accepted all.");
        await g.say('What? I turned things off!');
        await acceptAll(g, true);
        return 'end';
      } },
      { id: 'p4b', text: '(a tiny, pale grey link that says "reject all")', when: (g) => g.flag('prefPage') === 4, say: false, run: async (g) => {
        await g.say('...reject all.');
        await g.sayAs('guard', ['Reject... ALL?', 'Nobody has ever found that button. It was hidden behind three pages and a colour with no contrast.', 'Fine. FINE. You may pass. Without cookies. Like an animal.']);
        g.set('cookiesDone');
        g.set('cookieLoading', false);
        g.actor('guard').gesture = undefined;
        await g.say('Achievement unlocked: GDPR Ninja.');
        return 'end';
      } },
      { id: 'pback', text: 'Back to the start, please.', when: (g) => (g.flag<number>('prefPage') ?? 1) > 1, say: false, run: (g) => { g.set('prefPage', 1); } },
    ],
  },
];

async function acceptAll(g: Game, already = false) {
  if (!already) await g.say('Accept all.');
  await g.sayAs('guard', ['Wonderful! Sharing your data with our 847 trusted partners...', 'Loading partner 1 of 847...', 'Loading partner 2 of 847...']);
  g.set('cookieLoading');
  g.actor('guard').gesture = 'loading';
  await g.sayAs('guard', 'Loading partner 3 of 8...47...');
  await g.say("He's frozen. A loading spinner is hovering over his head. And he's still blocking the path.");
}

export const beach: RoomDef = {
  id: 'beach',
  name: 'Shipwreck Beach',
  paint,
  anim,
  bgKey: (g) => ['crateOpen', 'got:plank', 'got:duck', 'sailOff'].map((k) => (g.flag(k) ? 1 : 0)).join(''),
  scale: [92, 0.78, 143, 1],
  walk: [[[14, 108], [40, 100], [90, 98], [150, 96], [200, 95], [250, 96], [296, 102], [320, 104], [320, 143], [0, 143], [0, 116]]],
  start: [154, 128],
  startFace: 'front',
  npcs: [
    { id: 'guard', at: [296, 120], face: 'left' },
    { id: 'crab', at: [176, 139], face: 'right' },
  ],
  canWalk: (g) => !!g.flag('sailOff'),
  intercept: (g, verb, t) => {
    if (g.flag('sailOff')) return undefined;
    if (t.kind === 'hotspot' && t.id === 'sail') return undefined;
    return g.random([
      'Mmmph! (I\'m under a sail. I should probably PULL it off me.)',
      'Mmmf mmph! (Everything is dark and smells like seaweed. PULL the sail!)',
    ]);
  },
  enter: async (g, from) => {
    if (!g.flag('introDone')) {
      g.set('introDone');
      g.mac.visible = false;
      await g.card(['Mac Packwala', 'and the Curse of the Stale Cache', '', 'A Workflows of AI adventure'], 4200);
      await g.narrate([
        'Mac Packwala, Drupal site builder, was sailing to a conference aboard the SS Waterfall.',
        'The voyage had a two-year plan, a fixed scope, and no lifeboats.',
        'It sank in four minutes.',
        'Now Mac lies under a sail on a strange beach, on an island no map has ever shown...',
        'An island where nothing has changed in years, because nobody has cleared the cache. The locals call it the Curse of the Stale Cache.',
      ]);
      return;
    }
    if (!g.flag('sailOff')) { g.mac.visible = false; return; }
    if (g.flag('cookieLoading')) g.actor('guard').gesture = 'loading';
    if (g.flag('regSent') && !g.flag('got:verifylink') && !g.flag('saw2ndBottle')) {
      g.set('saw2ndBottle');
      await g.say('Another bottle just washed up! That must be my inbox.');
    }
  },
  hotspots: [
    {
      id: 'sail', name: (g) => (g.flag('sailOff') ? 'sail' : 'suspicious lump under a sail'),
      rect: [128, 106, 58, 28],
      when: (g) => !g.flag('sailOff'),
      noWalk: true,
      look: 'Mmmph. (It\'s dark under here.)',
      pull: async (g) => {
        g.set('sailOff');
        const m = g.mac;
        m.x = 154; m.y = 130; m.visible = true;
        g.face('front');
        await g.say(['Gah! Daylight!', 'Where am I? Last thing I remember, the captain said "we\'ll fix the hull in the next sprint".']);
        await g.narrate('(Tip: pick a verb, then click on things. Right-click does the obvious thing. Talk to the rubber duck if you get stuck... once you find one.)');
      },
      push: 'Mmmph! (Pushing just makes the sail wrap tighter. PULL!)',
    },
    {
      id: 'sailOld', name: 'sail', rect: [176, 128, 38, 14],
      when: (g) => !!g.flag('sailOff'),
      look: 'The sail that was my blanket. It says "SS WATERFALL - PHASE 1 OF 7".',
      pickup: "It's a sail, not a souvenir. Also it's wet. Also it's huge.",
    },
    {
      id: 'wreck', name: 'shipwreck', poly: [[44, 92], [58, 64], [120, 58], [134, 70], [126, 92]],
      walkTo: [90, 102],
      look: [
        'The SS Waterfall. Planned for two years, sank in four minutes.',
        'Nobody ever wrote a test case for "reef".',
      ],
      open: 'The hull is already very open. That was the problem.',
      use: "I'm not getting back on that. It's legacy now.",
    },
    {
      id: 'mast', name: 'mast', rect: [70, 10, 26, 50], walkTo: [86, 102],
      look: 'The mast is still standing. Its torn sail flaps like a status flag set to "deprecated".',
      pull: "I can't reach it. And I've had enough of sails for one day.",
    },
    {
      id: 'crate', name: (g) => (g.flag('crateOpen') ? 'open crate' : 'crate'), rect: [104, 104, 24, 22], walkTo: [116, 132], face: 'back',
      look: (g) => g.say(g.flag('crateOpen')
        ? 'The crate is empty now. Except for some packing peanuts shaped like semicolons.'
        : 'A crate from the wreck. Stencilled: "KEYBOARD PARTS - THIS SIDE UP". And smaller: "FISHING SUPPLIES". Someone had a very specific hobby.'),
      open: (g) => g.say(g.flag('crateOpen') ? "It's already open." : "It's nailed shut. Whoever packed this really didn't want the contents to escape. Relatable."),
      pickup: 'Too heavy. Keyboard parts are surprisingly dense. Like some product managers.',
      useItem: {
        plank: async (g) => {
          if (g.flag('crateOpen')) return g.say("It's already open.");
          g.set('crateOpen');
          await g.say('I jam the plank under the lid and... heave!');
          g.shake();
          await g.say('*CRACK!*');
          g.give('f5key');
          await g.say('A giant F5 key! From a giant keyboard, I guess.');
          g.give('weight');
          await g.say('And a lead fishing weight. Heavy little thing.');
        },
      },
    },
    {
      id: 'plank', name: 'driftwood plank', rect: [186, 122, 32, 12], when: (g) => !g.flag('got:plank'),
      look: 'A sturdy plank of driftwood from the wreck.',
      pickup: async (g) => { g.give('plank'); await g.say('A good plank. Every pirate island needs at least one.'); },
    },
    {
      id: 'duck', name: 'rubber duck', rect: [52, 126, 18, 12], when: (g) => !g.flag('got:duck'),
      look: 'A rubber duck, half buried in the sand. It looks like it has heard a lot of debugging monologues.',
      pickup: async (g) => {
        g.give('duck');
        await g.say(['A rubber duck! Programmers explain their problems to these until the answer becomes obvious.', "If I'm ever stuck, I'll talk to it."]);
      },
      talk: "I should pick it up first. Talking to sand-ducks in public is weird even for me.",
    },
    {
      id: 'seaweed', name: 'pile of seaweed', rect: [240, 112, 24, 12],
      look: (g) => g.say(g.flag('got:atshell') ? 'Just seaweed now.' : 'A pile of seaweed. Something is curled up in it.'),
      pickup: async (g) => {
        if (g.flag('got:atshell')) return g.say("I don't need more seaweed. Nobody does.");
        g.give('atshell');
        await g.say('Under the seaweed: a snail shell shaped exactly like an @. How very social.');
      },
    },
    {
      id: 'bottle', name: 'bottle in the surf', rect: [216, 78, 16, 16], walkTo: [222, 100], face: 'back',
      when: (g) => !g.flag('got:bottle'),
      look: 'A bottle bobbing in the surf. There seems to be a message in it.',
      pickup: async (g) => { g.give('bottle'); await g.say('A message in a bottle! Classic.'); },
    },
    {
      id: 'bottle2', name: 'another bottle', rect: [190, 77, 16, 16], walkTo: [198, 100], face: 'back',
      when: (g) => !!g.flag('regSent') && !g.flag('got:verifylink'),
      look: 'Another bottle, with a fancy official seal. My inbox!',
      pickup: async (g) => {
        g.give('verifylink');
        await g.say(['You have (1) new message: "Please verify your account."', 'A one-time login link. Written on a scroll. In a bottle.']);
      },
    },
    {
      id: 'sign', name: 'sign', rect: [166, 42, 62, 56], walkTo: [196, 102], face: 'back',
      look: ['"Welcome to LEGACY ISLAND. Population: 404."', 'Population not found. Encouraging.'],
      pickup: 'It is firmly planted. Like a legacy dependency.',
    },
    {
      id: 'sea', name: 'sea', rect: [130, 56, 190, 30], walkTo: [170, 98], face: 'back',
      look: (g) => g.say(g.random(['The sea. Somewhere out there is a world with automatic updates.', 'Endless water. Like a ticket queue, but wetter.'])),
      pickup: "It's mostly water. And I don't have a big enough bucket.",
      use: "I'm not swimming. That fog looks like it could eat a ship.",
    },
    {
      id: 'fog', name: 'fog bank', rect: [180, 40, 140, 18], noWalk: true,
      look: ['A thick wall of fog on the horizon. It looks heavy. Like technical debt.', 'No ship gets through that without exact coordinates.'],
    },
    {
      id: 'cliffpath', name: 'path up the cliff', rect: [0, 60, 30, 46], walkTo: [16, 108], face: 'back',
      exit: { to: 'lookout', at: [290, 126], face: 'left' },
      look: 'A narrow path winds up the cliff.',
    },
    {
      id: 'townpath', name: 'path to town', rect: [300, 96, 20, 40], walkTo: [306, 124],
      look: 'A sandy path between the palms, leading inland. Toward civilisation. Or at least toward a town.',
      walk: async (g) => {
        if (!g.flag('cookiesDone')) {
          if (g.flag('cookieLoading')) {
            await g.sayAs('guard', '...loading partner 4 of 847: Seagull Analytics Ltd...');
            await g.say("He's frozen solid. He needs a refresh.");
            return;
          }
          await g.sayAs('guard', 'Not so fast!');
          await g.talk('guard');
          return;
        }
        await g.goto('square', [28, 126], 'right');
      },
    },
    {
      id: 'guard', name: 'Cookie Consent Guard', actor: 'guard',
      look: (g) => g.say(g.flag('cookieLoading')
        ? 'He is frozen mid-sentence. A loading spinner circles his helmet.'
        : g.flag('cookiesDone') ? 'The Cookie Guard, sulking. He has had his cookies rejected.' : 'A guard holding a giant cookie as a shield. He blocks the path to town with the determination of a modal dialog.'),
      talk: async (g) => {
        if (g.flag('cookiesDone')) return g.sayAs('guard', g.random(['Move along. Cookie-less.', 'Hmph. Rejecter.', 'One day you will come back and accept us.']));
        if (g.flag('cookieLoading')) return g.sayAs('guard', '...loading partner 5 of 847: Definitely-Not-Tracking Inc...');
        await g.talk('guard');
      },
      useItem: {
        f5key: async (g) => {
          if (!g.flag('cookieLoading')) return g.say("He's not stuck. Yet.");
          await g.say('I press F5 on his... forehead.');
          g.actor('guard').gesture = undefined;
          g.set('cookieLoading', false);
          g.set('cookiesDone');
          await g.sayAs('guard', ['Huh? Where was I?', 'Ah, I see you already consented. Move along! Enjoy your 847 partners.']);
          await g.say('Refreshing things: works every time.');
        },
      },
      giveItem: {
        herring: "He's guarding cookies, not fish.",
      },
    },
    {
      id: 'crab', name: 'crab', actor: 'crab',
      look: 'A crab. It walks sideways and points out tiny mistakes. Like a code linter, but pinchier.',
      talk: async (g) => {
        await g.say('Hello, crab.');
        await g.sayAs('crab', g.random([
          'Line too long.',
          'Missing semicolon.',
          'Trailing whitespace detected on line 1 of your face.',
          'Expected 2 spaces, found 4.',
        ]));
      },
      pickup: "It pinches. Linters always do.",
    },
  ],
};
