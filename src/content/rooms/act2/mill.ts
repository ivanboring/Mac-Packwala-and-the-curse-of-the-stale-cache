import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, cloud, house, windowPane, signpost, bush, grassTufts, textOn } from '../../art';
import { fern } from '../../art2';
import { trialComplete } from './trials';
import { SUSPENDED_LINE, providerRefuses } from '../../items/act2';

const WHEEL = { x: 150, y: 74, r: 26 };

function box(p: Painter, x: number, y: number, s: number, tagged: boolean) {
  const w = Math.round(10 * s), h = Math.round(7 * s);
  p.rect(x, y, w, h, C.tan);
  p.poly([[x, y], [x + w, y], [x + w - 2, y - 3 * s], [x + 2, y - 3 * s]], C.sand);
  p.vline(x + w / 2, y - 3 * s, y + h - 1, C.sandshade);
  if (tagged) {
    p.rect(x + 1, y + 1, Math.max(3, w / 2 - 1), Math.max(3, h - 3), C.white);
    p.hline(x + 2, x + Math.max(3, w / 2 - 2), y + 2, C.gray);
  } else p.rect(x + 1, y + 1, Math.max(2, w / 2 - 2), 2, C.white);
}

function paint(p: Painter, g: Game) {
  sky(p, 400, 70, 'day');
  cloud(p, 70, 14, 1); cloud(p, 300, 20, 0.9); cloud(p, 380, 8, 0.7);
  // distant hills
  p.poly([[0, 62], [60, 44], [130, 56], [210, 40], [300, 54], [400, 42], [400, 80], [0, 80]], C.green);
  p.poly([[0, 70], [80, 58], [170, 66], [260, 56], [400, 64], [400, 90], [0, 90]], C.darkgreen);
  // ground
  p.gradV(0, 86, 400, 58, [C.lime, C.green, C.green]);
  grassTufts(p, 0, 92, 400, 50, 21, C.darkgreen);
  // back fence
  for (let x = 0; x < 400; x += 10) p.rect(x, 88, 3, 12, C.woodlight);
  p.hline(0, 399, 92, C.wood); p.hline(0, 399, 96, C.wood);
  // red barn
  house(p, 20, 44, 64, 58, C.red, C.darkred, 4);
  p.poly([[40, 102], [64, 102], [64, 70], [40, 70]], C.darkred);
  p.line(40, 70, 64, 102, C.white); p.line(64, 70, 40, 102, C.white);
  p.frame(40, 70, 25, 33, C.white);
  windowPane(p, 46, 50, 12, 10, C.glow, C.white);
  // the stream feeding the wheel
  p.poly([[96, 86], [124, 66], [134, 70], [108, 92]], C.sea);
  p.line(102, 86, 126, 70, C.foam);
  // mill building
  p.poly([[168, 104], [168, 34], [234, 30], [236, 104]], C.woodlight);
  for (let y = 38; y < 104; y += 6) p.line(168, y, 235, y - 3, C.wood);
  p.poly([[160, 36], [201, 8], [244, 32]], C.brown);
  p.line(160, 36, 244, 32, C.darkbrown);
  windowPane(p, 210, 46, 14, 12, C.skyblue, C.wood);
  // brass hopper on the roof
  p.poly([[188, 6], [214, 6], [206, 22], [196, 22]], C.gold);
  p.poly([[188, 6], [214, 6], [212, 9], [190, 9]], C.yellow);
  p.rect(198, 22, 6, 10, C.gold);
  textOn(p, 'IN', 196, 11, C.darkbrown);
  // gears on the side
  for (const [gx, gy, gr] of [[226, 70, 7], [218, 84, 5]] as const) {
    p.circle(gx, gy, gr + 1, C.darkgray);
    p.circle(gx, gy, gr - 1, C.gray);
    p.circle(gx, gy, 1, C.darkgray);
  }
  // brass plate
  p.rect(174, 88, 58, 11, C.gold);
  p.frame(174, 88, 58, 11, C.darkbrown);
  textOn(p, 'AUTOMATOR', 177, 89, C.darkbrown);
  // the prompt slot
  p.rect(184, 66, 16, 4, C.ink);
  if (g.flag('promptLoaded')) p.rect(186, 62, 12, 5, C.white);
  textOn(p, 'PROMPT', 176, 72, C.darkbrown);
  // output chute to the field
  p.poly([[236, 60], [290, 82], [290, 90], [236, 70]], C.gray);
  p.line(236, 60, 290, 82, C.lightgray);
  // the SAVE lever
  p.rect(258, 96, 12, 8, C.darkgray);
  const pulled = !!g.flag('automatorDone');
  if (pulled) { p.line(264, 96, 274, 84, C.lightgray); p.circle(275, 83, 3, C.red); }
  else { p.line(264, 96, 256, 82, C.lightgray); p.circle(255, 81, 3, C.red); }
  textOn(p, 'SAVE', 252, 106, C.white);
  // field of empty product boxes
  const done = !!g.flag('automatorDone');
  for (let row = 0; row < 4; row++) {
    const s = 0.8 + row * 0.15;
    const y = 98 + row * 11;
    for (let x = 292 + row * -6; x < 400; x += Math.round(13 * s)) box(p, x, y, s, done);
  }
  // sign
  signpost(p, 304, 24, 86, ['FIELDSWORTH', '10,000 products', done ? 'ALL described!' : '0 descriptions'], 36);
  // well
  p.ellipse(30, 116, 12, 4, C.stoneshade);
  p.rect(18, 116, 25, 12, C.stone);
  p.ellipse(30, 128, 12, 3, C.stone);
  p.rect(18, 98, 2, 18, C.wood); p.rect(41, 98, 2, 18, C.wood);
  p.poly([[14, 100], [30, 90], [46, 100]], C.darkred);
  p.vline(30, 100, 112, C.tan);
  bush(p, 130, 104, 0.8);
  fern(p, 150, 108, 0.8);
}

function goat(p: Painter, x: number, y: number, t: number) {
  const nod = Math.floor(t / 600) % 3 === 0 ? 1 : 0;
  p.rect(x - 10, y - 10, 18, 9, C.white);
  for (const lx of [-9, -5, 3, 6]) p.rect(x + lx, y - 2, 2, 6, C.lightgray);
  p.rect(x + 6, y - 15 + nod, 7, 7, C.white);
  p.px(x + 10, y - 13 + nod, C.ink);
  p.line(x + 7, y - 16 + nod, x + 5, y - 19 + nod, C.lightgray);
  p.line(x + 10, y - 16 + nod, x + 11, y - 19 + nod, C.lightgray);
  p.rect(x + 11, y - 9 + nod, 2, 3, C.lightgray); // beard
  p.px(x - 11, y - 9, C.white);
  // its product tag
  p.rect(x - 4, y - 14, 6, 4, C.yellow);
}

function anim(p: Painter, g: Game, t: number) {
  // water wheel: turns slowly once the Automator runs, fast while running
  const running = !!g.flag('millRunning');
  const speed = running ? 150 : g.flag('automatorDone') ? 1200 : 0;
  const a0 = speed ? t / speed : 0.3;
  const { x, y, r } = WHEEL;
  p.circle(x, y, r, C.wood);
  p.circle(x, y, r - 4, C.brown);
  for (let i = 0; i < 8; i++) {
    const a = a0 + (i / 8) * Math.PI * 2;
    p.line(x, y, x + Math.cos(a) * (r - 1), y + Math.sin(a) * (r - 1), C.woodlight);
    p.rect(x + Math.cos(a) * (r - 2) - 2, y + Math.sin(a) * (r - 2) - 2, 4, 4, C.woodlight);
  }
  p.circle(x, y, 4, C.darkgray);
  // splash
  if (speed) for (let i = 0; i < 4; i++) p.px(x - r + ((t / 60 + i * 7) % 14), y + r - 2 - ((t / 80 + i * 3) % 6), C.foam);
  // provider glowing in the hopper
  if (g.flag('hopperProvider')) {
    const glow = g.flag('providerSuspended') ? (Math.floor(t / 500) % 2 ? C.red : C.darkred) : Math.floor(t / 300) % 2 ? C.brandbluelight : C.brandblue;
    p.circle(201, 12, 4, glow);
    p.px(200, 11, C.white);
  }
  // paper flying out of the chute while running
  if (running) for (let i = 0; i < 5; i++) {
    const k = ((t / 6 + i * 40) % 120) / 120;
    p.rect(Math.round(240 + k * 60), Math.round(62 + k * 22 - Math.sin(k * Math.PI) * 18), 4, 3, C.white);
  }
  goat(p, 160, 134, t);
}

async function pullLever(g: Game) {
  if (g.flag('automatorDone')) {
    await g.say("It's done. Ten thousand descriptions. I'm not pulling it again, it might describe ME.");
    return;
  }
  await g.say('I pull the big red SAVE lever...');
  if (!g.flag('hopperProvider')) {
    g.shake();
    await g.say(['*CLUNK*', 'Nothing. The Automator has no provider connected. Nothing to think with.']);
    await g.sayAs('fieldsworth', "Same thing happens when I pull it. Thought it was just shy.");
    return;
  }
  g.set('millRunning');
  g.shake();
  await g.say('*WHIRR* *CLANK* The wheel spins up! Paper flies out of the chute!');
  await g.wait(900);
  if (!g.flag('promptLoaded')) {
    g.set('millRunning', false);
    g.set('badRun');
    await g.sayAs('fieldsworth', [
      'Let me see that... "Delve into the rich tapestry of this product, a testament to synergy."',
      'And this one... "Delve into the rich tapestry of this product, a testament to synergy."',
      "That's the goat AND the tractor! My goat is not synergetic! Look at her!",
    ]);
    await g.say(["With no real prompt, the AI just writes generic mush.", 'I need a better prompt. One I have actually tested first.']);
    return;
  }
  await g.wait(600);
  g.set('millRunning', false);
  g.set('automatorDone');
  await g.sayAs('fieldsworth', [
    '"A galvanised steel bucket that holds 10 litres. Use it to carry water or feed for your animals."',
    '"A wooden rake for gathering leaves and hay. Light, sturdy, and rather handsome."',
    "It's beautiful! Ten thousand of 'em! Every box, a proper description!",
  ]);
  await g.say([
    'That is an AI Automator: when content is saved, it fills in fields automatically using a provider and a prompt.',
    'Nobody had to write ten thousand descriptions by hand. Except the three Fieldsworth already did.',
  ]);
  await g.sayAs('fieldsworth', ['The machine spat this out too, at the end. A card. Says "Create Content".', 'Reckon it\'s one of them Tool doohickeys. Yours, partner.']);
  g.give('tool_create');
  await trialComplete(g, 'TRIAL OF AUTOMATION', 'Ten thousand fields, filled while you watched.');
  await sendBill(g);
}

/** Ten thousand descriptions are not free. The idols send the bill, and nobody set a budget. */
async function sendBill(g: Game) {
  g.shake();
  await g.say('*PFFT* Uh-oh. The provider in the hopper just turned red.');
  await g.narrate(['A receipt starts unrolling out of the chute.', 'And unrolling.', 'And unrolling.']);
  await g.sayAs('fieldsworth', [
    '"10,000 product descriptions. 4.2 million tokens." Itemised, too.',
    'Item 4,512: "A friendly goat. Not for sale." Four hundred tokens. For a GOAT.',
  ]);
  g.set('providerSuspended');
  await g.sayAs('idols', ['BILLING CYCLE COMPLETE.', SUSPENDED_LINE]);
  await g.say([
    'My provider is suspended! Nobody set a budget, so it spent like nobody was watching.',
    'I need somebody who counts everything. Obsessively. Paranoidly.',
  ]);
  await g.sayAs('fieldsworth', 'Sounds like that feller with all the keys up in the hills. Counts his padlocks twice a day.');
}

async function loadProvider(g: Game) {
  if (await providerRefuses(g)) return;
  if (g.flag('hopperProvider')) { await g.say('The provider is already connected to the Automator.'); return; }
  g.set('hopperProvider');
  await g.say([
    'I plug the provider into the hopper. It starts to glow.',
    "It's a connection, not a gift - like lending a library card. I still have it.",
  ]);
}

async function loadPrompt(g: Game) {
  if (!g.flag('hopperProvider')) {
    await g.say("I could slot in the prompt, but without a provider there's nobody to read it.");
  }
  g.take('prompt');
  g.set('promptLoaded');
  await g.say('I slide the tested prompt card into the PROMPT slot. *click*');
}

export const millDialogues: Dialogue[] = [
  {
    id: 'fieldsworth',
    with: 'fieldsworth',
    start: async (g) => {
      if (!g.flag('fieldsworthMet')) {
        g.set('fieldsworthMet');
        await g.sayAs('fieldsworth', ["Howdy, stranger! Fieldsworth's the name, fields are the game.", 'I grow fields. Product fields. Ten thousand of \'em.']);
      } else if (g.flag('automatorDone')) {
        await g.sayAs('fieldsworth', 'Partner! Come to admire the descriptions? Go on, read one. They\'re all different!');
      } else await g.sayAs('fieldsworth', 'Back again! Any luck with the contraption?');
    },
    options: [
      {
        id: 'problem', text: "What's the problem?", once: true,
        run: (g) => g.sayAs('fieldsworth', [
          "Ten thousand products and not a single one has a description. The shop opens Monday!",
          "I've been writing 'em by hand. I'm on number three. It's a bucket. I wrote \"bucket\".",
        ]),
      },
      {
        id: 'machine', text: "What's that big contraption?",
        run: (g) => g.sayAs('fieldsworth', [
          'That there is the Automator! Arrived with the AI module. Fills in fields by itself whenever you hit SAVE.',
          "Never run, though. Needs a provider to do the thinkin', and a prompt to know what to think about.",
        ]),
      },
      {
        id: 'goat', text: 'About that goat...', once: true,
        run: async (g) => {
          await g.sayAs('fieldsworth', ["That's Gertrude. She's product number 4,512.", "Don't ask why the goat is a product. Legacy reasons."]);
        },
      },
      {
        id: 'bad', text: 'About those descriptions...',
        when: (g) => !!g.flag('badRun') && !g.flag('automatorDone'),
        run: (g) => g.sayAs('fieldsworth', [
          "Every single one says \"delve into the rich tapestry\"! What IS a tapestry? I sell buckets!",
          'Feed it a proper prompt, partner. Something clear. Something tested.',
        ]),
      },
      {
        id: 'bill', text: 'About that bill...',
        when: (g) => !!g.flag('providerSuspended'),
        run: async (g) => {
          await g.sayAs('fieldsworth', [
            "Ten thousand descriptions, and every one of 'em cost tokens. Nobody told the machine when to stop.",
            'On a farm we call that leaving the gate open. Go see the Key Keeper. He counts EVERYTHING.',
          ]);
        },
      },
      {
        id: 'bye', text: 'Good luck with the fields.', end: true,
        run: (g) => g.sayAs('fieldsworth', g.flag('automatorDone') ? 'Thanks to you, I don\'t need luck! Just bandwidth.' : 'Much obliged. Mind the goat.'),
      },
    ],
  },
  {
    id: 'explorer',
    with: 'aiexplorer',
    start: async (g) => {
      await g.say(g.flag('got:prompt') ? 'I open the AI Explorer for a little recreational prompting.' : 'I open the AI Explorer. Time to test a prompt before I trust it.');
    },
    options: [
      {
        id: 'generic', text: 'Prompt: "Write a product description."',
        say: false,
        run: async (g) => {
          await g.sayAs('aiexplorer', '"Delve into the rich tapestry of this product: a testament to synergy, innovation and excellence."');
          await g.say("Generic mush. Every product would sound exactly the same. Vague prompt in, vague words out.");
        },
      },
      {
        id: 'epic', text: 'Prompt: "Write an EPIC, LEGENDARY, AWARD-WINNING description!!!"',
        say: false,
        run: async (g) => {
          await g.sayAs('aiexplorer', '"BEHOLD! The Bucket of DESTINY! Forged in the fires of AGRICULTURE! Ten litres of PURE GLORY!"');
          await g.say("Fun. Also a lie. It's a bucket.");
        },
      },
      {
        id: 'pirate', text: 'Prompt: "Describe the product in pirate speak."',
        say: false,
        run: async (g) => {
          await g.sayAs('aiexplorer', "\"Arr, 'tis a bucket, matey. It holds water. Unlike yer plans.\"");
          await g.say("Tempting. But most of Fieldsworth's customers aren't pirates. Most.");
        },
      },
      {
        id: 'good', text: 'Prompt: "Describe this product in two sentences for a farmer: what it is and what it\'s for. No buzzwords."',
        say: false,
        when: (g) => !g.flag('got:prompt'),
        run: async (g) => {
          await g.sayAs('aiexplorer', '"A galvanised steel bucket that holds 10 litres. Use it to carry water or feed for your animals."');
          await g.say(["That's it! Short, clear, useful. Being specific about the audience and format makes all the difference.", "I'll save this prompt."]);
          g.give('prompt');
          g.set('promptGood');
          return 'end';
        },
      },
      { id: 'close', text: 'Close the AI Explorer.', say: false, end: true },
    ],
  },
];

export const mill: RoomDef = {
  id: 'mill',
  name: 'Automator Mill',
  width: 400,
  paint,
  anim,
  bgKey: (g) => ['promptLoaded', 'automatorDone'].map((k) => (g.flag(k) ? 1 : 0)).join(''),
  scale: [104, 0.84, 143, 1],
  walk: [[[0, 106], [282, 106], [290, 120], [400, 136], [400, 143], [0, 143]]],
  start: [56, 134],
  startFace: 'right',
  npcs: [{ id: 'fieldsworth', at: [96, 130], face: 'right' }],
  enter: async (g) => {
    if (!g.flag('millSeen')) {
      g.set('millSeen');
      await g.say(['A farm. A barn. A goat. And a huge brass machine bolted onto an old mill.', "One of these things is not like the others. It's the goat. The goat has a barcode."]);
    }
  },
  hotspots: [
    {
      id: 'mill_path', name: 'path back to the jungle', rect: [0, 88, 16, 56], walkTo: [8, 124], face: 'left',
      exit: { to: 'map' },
      look: 'The path back into the jungle.',
    },
    {
      id: 'automator', name: 'Automator', poly: [[160, 104], [160, 36], [244, 30], [244, 104]], walkTo: [204, 114], face: 'back',
      look: [
        'The AI Automator. In Drupal AI, Automators fill in fields automatically when content is saved.',
        'You give it a provider to think with and a prompt that says what to write. Then it does the boring bit for you.',
      ],
      useItem: { provider: loadProvider, prompt: loadPrompt, explorer: (g) => g.say('The Explorer is for testing prompts. I just USE it on its own, then feed the machine the result.') },
      giveItem: { provider: loadProvider, prompt: loadPrompt },
      open: "There's a little hatch. Inside: gears, cogs, and a sign saying \"No user-serviceable parts. Also, no users.\"",
      push: "It's bolted down. It's the most solid thing on this island apart from the Grand Maintainer's opinions.",
      anyItem: (g, item) => g.say(item === 'readme' ? 'It does not need a README. It needs a prompt.' : "The Automator doesn't know what to do with that."),
    },
    {
      id: 'hopper', name: 'hopper', rect: [184, 2, 34, 22], walkTo: [204, 114], face: 'back',
      look: (g) => g.say(g.flag('providerSuspended') ? 'The hopper, glowing an angry red. The provider is connected, but suspended. Ten thousand descriptions will do that.'
        : g.flag('hopperProvider') ? 'The hopper, glowing softly. The provider is connected.' : 'A brass hopper labelled IN. Something that can THINK needs to go in there.'),
      useItem: { provider: loadProvider, prompt: loadPrompt },
    },
    {
      id: 'promptslot', name: 'prompt slot', rect: [176, 60, 30, 18], walkTo: [192, 114], face: 'back',
      look: (g) => g.say(g.flag('promptLoaded') ? 'My tested prompt is in the slot.' : 'A slot labelled PROMPT. Right now it would run with whatever vague default it came with.'),
      useItem: { prompt: loadPrompt, provider: loadProvider },
    },
    {
      id: 'lever', name: 'SAVE lever', rect: [248, 76, 30, 30], walkTo: [258, 114], face: 'back',
      look: 'A big lever with a red knob labelled SAVE. Automators run when content is saved. Very literal machine.',
      pull: pullLever,
      push: pullLever,
      use: pullLever,
    },
    {
      id: 'wheel', name: 'water wheel', rect: [122, 46, 58, 58], walkTo: [150, 112], face: 'back',
      look: (g) => g.say(g.flag('automatorDone') ? 'The water wheel turns happily now.' : 'A big water wheel. It is not turning. The water is here, the will is not.'),
      push: 'It barely moves. The machine needs a reason to run - a SAVE.',
      pull: 'It barely moves. Pulling things is for levers.',
    },
    {
      id: 'field', name: 'field of product boxes', rect: [280, 92, 120, 48],
      walkTo: [290, 128], face: 'right',
      look: (g) => g.say(g.flag('automatorDone')
        ? 'Ten thousand boxes, each with a neat little description tag. A field of filled fields.'
        : 'Rows and rows of cardboard boxes, each with a blank label. Ten thousand products, zero descriptions.'),
      pickup: 'There are ten thousand of them. Pick one, and nine thousand nine hundred and ninety-nine get jealous.',
    },
    {
      id: 'chute', name: 'output chute', rect: [236, 56, 56, 34], walkTo: [270, 116], face: 'back',
      look: 'The output chute. Whatever the Automator writes slides down here into the field.',
    },
    {
      id: 'fieldsworth', name: 'Farmer Fieldsworth', actor: 'fieldsworth',
      look: 'A farmer in a straw hat, holding a pitchfork like a bad review. She looks overworked and under-described.',
      talk: (g) => g.talk('fieldsworth'),
      giveItem: {
        provider: (g) => g.sayAs('fieldsworth', "Don't give it to me, partner. Feed it to the Automator. The hopper on top."),
        prompt: (g) => g.sayAs('fieldsworth', 'Pop it into the slot on the machine, would you? I\'d only put it in upside down.'),
        herring: (g) => g.sayAs('fieldsworth', "A red herring? I've got 10,000 products to describe, I don't need distractions!"),
      },
    },
    {
      id: 'goat', name: 'goat', rect: [146, 116, 30, 22], walkTo: [136, 134], face: 'right',
      look: 'A goat with a product tag on her ear. Product number 4,512. Description: none. Opinion of me: low.',
      talk: async (g) => {
        await g.say('Hello, goat.');
        await g.sayAs('fieldsworth', g.flag('automatorDone') ? 'Her description says "A friendly goat. Not for sale. Really, please stop asking."' : "That's Gertrude. She don't talk. She bleats in protest at being a product.");
      },
      pickup: "She's product number 4,512. I'd need a shopping cart. A big one.",
      giveItem: { herring: 'She sniffs it, looks at me with deep disappointment, and goes back to chewing the fence.' },
    },
    {
      id: 'barn', name: 'barn', rect: [14, 30, 76, 74], walkTo: [56, 112], face: 'back',
      look: 'A big red barn. Every farm needs one. It is where products go before they become products.',
      open: (g) => g.sayAs('fieldsworth', "Barn's locked, partner. Stock-take in progress. It's been in progress since 2014."),
    },
    {
      id: 'well', name: 'well', rect: [14, 90, 34, 40],
      look: "A stone well. I toss in a thought: \"I wish for automatic descriptions.\" The well doesn't answer. Wells are not providers.",
      use: "I'm not thirsty enough to trust well water on Legacy Island.",
    },
    {
      id: 'millsign', name: 'farm sign', rect: [302, 22, 92, 36], walkTo: [300, 112], face: 'back',
      look: (g) => g.say(g.flag('automatorDone') ? '"FIELDSWORTH FARM. 10,000 products. ALL described!" Someone updated it with fresh paint.' : '"FIELDSWORTH FARM. 10,000 products. 0 descriptions." Honest, at least.'),
    },
  ],
};
