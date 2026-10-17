import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, planks, barrel, door, windowPane, textOn, centeredText, lantern } from '../../art';
import { interior, shelf, counter, table, stool, flame } from '../../art1';

function paint(p: Painter, g: Game) {
  interior(p, 320, 100, C.wood, C.brown, C.woodlight, C.wood, 5);
  planks(p, 0, 0, 320, 100, true, C.wood, C.brown, 8);
  // beams
  p.rect(0, 0, 320, 6, C.darkbrown);
  for (const x of [34, 150, 270]) p.rect(x, 0, 6, 100, C.darkbrown);

  // entrance door (left)
  door(p, 6, 54, 24, 46, C.darkbrown, false);
  p.rect(10, 60, 16, 6, C.tan);
  textOn(p, 'EXIT', 10, 59, C.darkred);

  // fireplace
  p.rect(44, 52, 46, 48, C.stone);
  p.rect(40, 48, 54, 6, C.stoneshade);
  p.rect(52, 66, 30, 34, C.black);
  p.rect(54, 92, 26, 4, C.darkbrown);

  // stuffed fish trophy
  p.rect(96, 22, 44, 18, C.darkbrown);
  p.ellipse(116, 30, 14, 5, C.teal);
  p.poly([[128, 30], [136, 24], [136, 36]], C.teal);
  p.px(106, 29, C.white);
  textOn(p, 'MERGED', 99, 41, C.gold);

  // dartboard with a familiar blue "e"
  p.circle(170, 34, 10, C.black);
  p.circle(170, 34, 8, C.red);
  p.circle(170, 34, 5, C.white);
  textOn(p, 'e', 168, 30, C.blue);
  p.line(174, 30, 180, 26, C.lightgray);

  // menu board
  p.rect(184, 22, 76, 34, C.brandink);
  p.frame(184, 22, 76, 34, C.wood);
  centeredText(p, 'TODAY:', 222, 24, C.yellow);
  centeredText(p, 'Spaghetti', 222, 33, C.white);
  centeredText(p, 'code', 222, 42, C.white);

  // shelves of bottles behind the bar
  for (const y of [60, 74]) {
    shelf(p, 196, y, 116);
    for (let i = 0; i < 12; i++) {
      const c = [C.lime, C.red, C.gold, C.skyblue, C.brown][i % 5];
      p.rect(200 + i * 9, y - 9, 4, 9, c);
      p.rect(201 + i * 9, y - 12, 2, 3, c);
    }
  }
  windowPane(p, 284, 20, 22, 26, C.night, C.darkbrown, false);
  p.px(290, 26, C.glow); p.px(298, 32, C.white);

  // the bar counter (Ignatius stands behind it, drawn waist-up)
  counter(p, 196, 90, 120, 26, C.woodlight, C.wood);
  p.rect(206, 94, 100, 3, C.darkbrown);
  textOn(p, 'This bartender', 210, 98, C.sand);
  textOn(p, 'is a .gitignore', 208, 106, C.sand);
  // grog tap
  p.rect(300, 80, 4, 10, C.gold);
  p.rect(298, 78, 8, 3, C.gold);
  // coaster
  if (!g.flag('got:gitignore')) { p.ellipse(228, 89, 5, 1.5, C.tan); p.px(228, 89, C.darkbrown); }
  // crackers bowl
  p.ellipse(282, 88, 8, 3, C.brandblue);
  if (!g.flag('got:crackers')) for (let i = 0; i < 4; i++) p.rect(277 + i * 3, 84 + (i % 2), 3, 2, C.gold);

  // red herring barrel
  barrel(p, 160, 96, 20, 26, C.wood);
  p.rect(158, 104, 24, 10, C.white);
  textOn(p, 'RED', 161, 105, C.red);
  for (let i = 0; i < 3; i++) p.poly([[163 + i * 5, 96], [167 + i * 5, 90 - (i % 2) * 2], [168 + i * 5, 96]], C.red);

  // Hook's table, and a pirate asleep on another
  table(p, 120, 116, 34);
  p.rect(130, 108, 6, 7, C.foam);
  table(p, 56, 120, 40);
  // the sleeping pirate (scenery)
  p.ellipse(78, 112, 10, 6, C.purple);
  p.circle(66, 110, 6, C.skin);
  p.poly([[58, 106], [74, 104], [70, 100], [62, 101]], C.red);
  p.rect(86, 104, 4, 6, C.lime);
  stool(p, 20, 130);
}

function anim(p: Painter, g: Game, t: number) {
  flame(p, 60, 88, t, 1);
  flame(p, 72, 90, t + 200, 0.8);
  // chandelier sway
  const sx = Math.round(Math.sin(t / 900) * 2);
  p.line(110, 6, 110 + sx, 14, C.darkgray);
  p.hline(98 + sx, 122 + sx, 14, C.darkgray);
  for (const dx of [-12, 0, 12]) { p.rect(109 + dx + sx, 10, 2, 4, C.white); if (Math.floor(t / 150 + dx) % 5) p.px(110 + dx + sx, 9, C.yellow); }
  // snoring pirate
  if (Math.floor(t / 1000) % 2) textOn(p, 'z', 58, 92 - Math.floor((t % 1000) / 200), C.white);
  lantern(p, 6, 30, Math.floor(t / 120) % 9 !== 0);
}

async function alterForm(g: Game) {
  g.take('tokenform');
  await g.sayAs('hook', ['Hand it over, lad. Let me alter it.', "Arr... adding a field... 'Purpose'... required... value: 'ESCAPE THIS ISLAND'..."]);
  g.actor('hook').gesture = 'reach';
  await g.wait(400);
  g.actor('hook').gesture = 'weighted';
  await g.sayAs('hook', ['And because I be heaviest, me alteration runs LAST. Nobody undoes it!', 'Plus a little skull in the corner. For style.']);
  g.give('tokenform2');
  await g.say('An altered form! Hooks: still the best way to change something you didn\'t write.');
}

export const tavernDialogues: Dialogue[] = [
  {
    id: 'hook',
    with: 'hook',
    start: async (g) => {
      if (!g.flag('metHook')) {
        g.set('metHook');
        await g.sayAs('hook', ['Arr! Who goes there?', "I be Captain Hook_alter! I alter anything that passes by me.", 'Forms. Menus. Pirates. The occasional wedding.']);
      } else await g.sayAs('hook', g.random(['Arr.', 'Back again, lad?', 'Got something that needs alterin\'?']));
    },
    options: [
      {
        id: 'name', text: 'Hook_alter? Like the Drupal hooks?', once: true,
        run: (g) => g.sayAs('hook', [
          'Aye. A hook be a place where yer code can jump in and change what other code is doin\'.',
          'Me hooks used to be plain old procedural functions. mymodule_form_alter() and such.',
          'Now they be OOP classes with #[Hook] attributes. Still alter everything, mind.',
          'Just with more ceremony. And a namespace. And a service container.',
        ]),
      },
      {
        id: 'hand', text: 'What happened to your hand?', once: true,
        run: (g) => g.sayAs('hook', ['Lost it in a merge conflict, I did.', 'Both branches wanted the hand. Git picked neither.']),
      },
      {
        id: 'alter', text: 'Could you alter this form for me?', when: (g) => g.has('tokenform'),
        run: async (g) => {
          if (g.flag('hookWeighted')) return alterForm(g);
          await g.sayAs('hook', [
            'Aye, I can add yer missing field. But it never sticks, lad.',
            'Some other module\'s hook runs after mine and undoes me work. Every. Single. Time.',
            'Me weight be too low! In Drupal, a module with a heavier weight runs later. The last one to alter wins.',
          ]);
          g.set('hookNeedsWeight');
        },
      },
      {
        id: 'weight', text: 'How do I make you... heavier?', when: (g) => !!g.flag('hookNeedsWeight') && !g.flag('hookWeighted'),
        run: (g) => g.sayAs('hook', ['Ha! If I had somethin\' heavy hangin\' off me hook...', 'Lead, lad. Lead is heavy. I\'d run dead last.']),
      },
      {
        id: 'advice', text: 'Any advice for a stranded site builder?',
        run: (g) => g.sayAs('hook', g.random([
          ['Never alter a form ye can\'t spell.'],
          ['Always clear yer cache before ye blame the pirate.'],
          ['Don\'t hack core, lad. Hook into it.'],
        ])),
      },
      {
        id: 'herring', text: 'What\'s in that barrel?', once: true,
        run: (g) => g.sayAs('hook', ['Red herrings! Ignatius orders \'em by the ton.', 'Completely useless. Distract ye from the real problem. Like most bug reports.']),
      },
      { id: 'bye', text: 'Fair winds, Captain.', end: true },
    ],
  },
];

export const tavern: RoomDef = {
  id: 'tavern',
  name: 'The Deprecated Function',
  paint,
  anim,
  bgKey: (g) => ['got:gitignore', 'got:crackers'].map((k) => (g.flag(k) ? 1 : 0)).join(''),
  scale: [104, 0.88, 143, 1.02],
  walk: [[[0, 112], [150, 110], [192, 114], [200, 118], [320, 120], [320, 143], [0, 143]]],
  start: [32, 122],
  startFace: 'right',
  npcs: [
    { id: 'hook', at: [108, 128], face: 'right' },
    { id: 'bartender', at: [252, 112], face: 'front' },
  ],
  enter: async (g) => {
    if (g.flag('hookWeighted')) g.actor('hook').gesture = 'weighted';
    if (!g.flag('tavernEntered')) {
      g.set('tavernEntered');
      await g.say('The Deprecated Function. Smells like grog and backwards compatibility.');
    }
  },
  hotspots: [
    {
      id: 'exit', name: 'door to the square', rect: [4, 52, 28, 50], walkTo: [22, 120],
      exit: { to: 'square', at: [72, 108], face: 'front' },
      look: 'The way back out to the square.',
    },
    {
      id: 'hook', name: 'Captain Hook_alter', actor: 'hook',
      look: (g) => g.say(g.flag('hookWeighted')
        ? 'Captain Hook_alter, with my lead weight dangling proudly from his hook. He runs last now. He is insufferable about it.'
        : ['A pirate captain with a hook for a hand, a patch for an eye, and a quill behind his ear.', 'He looks like he has altered a lot of things.']),
      talk: (g) => g.talk('hook'),
      giveItem: {
        weight: async (g) => {
          g.take('weight');
          g.set('hookWeighted');
          await g.sayAs('hook', ['A lead weight! Hang it on me hook...', '*CLUNK*']);
          g.actor('hook').gesture = 'weighted';
          await g.sayAs('hook', ['Arr! I be the heaviest module on the island now. I run LAST!', 'Nobody overrides Captain Hook_alter again!']);
          if (g.has('tokenform')) await alterForm(g);
          else await g.sayAs('hook', 'Bring me any form, lad. I\'ll alter it and it\'ll stay altered.');
        },
        tokenform: async (g) => {
          if (g.flag('hookWeighted')) return alterForm(g);
          g.set('hookNeedsWeight');
          await g.sayAs('hook', ['I\'d alter it, lad, but another hook runs after mine and undoes it.', 'Me module weight be too low. If only I were heavier... lead heavy.']);
        },
        tokenform2: (g) => g.sayAs('hook', 'Already altered. Me finest work. Take it to that clerk.'),
        herring: (g) => g.sayAs('hook', 'A red herring? Don\'t try to distract me, lad.'),
        duck: (g) => g.sayAs('hook', 'Arr, a rubber duck! I explain me bugs to a parrot, meself.'),
      },
      useItem: {
        weight: (g) => g.say('I should give it to him. Attaching lead to a pirate without asking is rude.'),
      },
      pickup: "He's a pirate. They don't fit in backpacks. I've tried. Well, I haven't. But I can tell.",
    },
    {
      id: 'bartender', name: 'Bartender Ignatius', actor: 'bartender', walkTo: [252, 126], face: 'back',
      look: [
        'Bartender Ignatius, polishing the same glass forever.',
        'A little sign on the bar: "This bartender is a .gitignore. He ignores everything on his list." Everyone is on his list.',
      ],
      talk: async (g) => {
        await g.say(g.random(['Excuse me, barkeep?', 'Hello? A grog, please?', 'Sir? SIR?']));
        await g.sayAs('bartender', '...');
        await g.say(g.random([
          'He polishes his glass. He is ignoring me. I am in his ignore file.',
          "Nothing. Not even eye contact. He's a .gitignore all right.",
          'He looks straight through me. Like a file in node_modules.',
        ]));
      },
      anyItem: async (g) => { await g.sayAs('bartender', '...'); await g.say('Ignored. Of course.'); },
      pickup: "He's quite large. And he would ignore me trying.",
    },
    {
      id: 'coaster', name: 'coaster', rect: [220, 84, 16, 8], walkTo: [230, 126], face: 'back',
      when: (g) => !g.flag('got:gitignore'),
      look: 'A beer coaster printed with ".gitignore". Whatever you put on it gets ignored.',
      pickup: async (g) => {
        g.give('gitignore');
        await g.say(['I take the coaster right in front of him.', 'He doesn\'t react. He ignores that too. This is the perfect crime.']);
      },
    },
    {
      id: 'crackers', name: 'bowl of crackers', rect: [272, 80, 20, 10], walkTo: [282, 126], face: 'back',
      when: (g) => !g.flag('got:crackers'),
      look: 'A bowl of crackers. The box beside it says "OAuth - Open Authorization. Contains tokens."',
      pickup: async (g) => {
        g.give('crackers');
        await g.say(['Free bar snacks! The box says "OAuth". They come in little tokens.', "Somebody's parrot would love these."]);
      },
    },
    {
      id: 'herring', name: 'barrel of red herrings', rect: [156, 86, 28, 38], walkTo: [168, 128], face: 'back',
      look: ['A barrel labelled "RED HERRINGS - NOT USEFUL, HONEST".', 'Classic adventure game misdirection. I would never fall for it.'],
      pickup: async (g) => {
        if (g.has('herring') || g.flag('catGone')) return g.say('One red herring per adventure is plenty.');
        g.give('herring');
        await g.say(['I take a red herring. Completely useless, obviously.', 'I just like having it. For no reason.']);
      },
      open: "It's already open. Herrings everywhere.",
    },
    {
      id: 'fireplace', name: 'fireplace', rect: [42, 50, 50, 50], walkTo: [66, 116], face: 'back',
      look: 'A crackling fireplace. The firewood is old printouts of terms and conditions. Nobody will miss them.',
      use: "I warm my hands. That's the only thing on this island that warms up quickly.",
    },
    {
      id: 'fish', name: 'stuffed fish', rect: [96, 20, 44, 26], walkTo: [118, 116], face: 'back',
      look: ['A stuffed fish on a plaque: "MERGED".', 'The plaque underneath reads "The one that got merged. Without review."'],
    },
    {
      id: 'dartboard', name: 'dartboard', rect: [158, 22, 26, 26], walkTo: [170, 112], face: 'back',
      look: "A dartboard with a big blue 'e' in the middle. An old browser logo. Generations of web developers threw darts at it.",
      use: "I throw an imaginary dart. Bullseye. It still renders the dart wrong.",
    },
    {
      id: 'menu', name: 'menu board', rect: [184, 22, 76, 34], walkTo: [222, 116], face: 'back',
      look: ['"TODAY: Spaghetti code."', 'Underneath, in smaller chalk: "Tomorrow: more spaghetti code. Bring a fork. Or a fork of a fork."'],
    },
    {
      id: 'tap', name: 'grog tap', rect: [296, 76, 12, 16], walkTo: [298, 126], face: 'back',
      look: 'A grog tap labelled "@deprecated - use grog_v2 instead". There is no grog_v2.',
      use: (g) => g.sayAs('bartender', '...'),
      pull: async (g) => { await g.sayAs('bartender', '...'); await g.say("He ignores me, but somehow the tap won't move either. Ignored by plumbing."); },
    },
    {
      id: 'sleeper', name: 'sleeping pirate', rect: [54, 98, 40, 22], walkTo: [76, 130], face: 'back',
      look: "A pirate asleep on the table. He's been in a merge-conflict coma since the last release.",
      talk: async (g) => { await g.say('Wake up!'); await g.say('He mumbles: "Accept incoming... no... accept current..." and keeps snoring.'); },
      pickup: 'He is load-bearing for that table now.',
    },
    {
      id: 'window', name: 'window', rect: [282, 18, 26, 30], walkTo: [300, 126], face: 'back',
      look: "A window. Outside it's always night in here, no matter the time. Very cozy. Very legacy.",
    },
  ],
};
