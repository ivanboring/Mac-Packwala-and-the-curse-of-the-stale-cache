import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, cloud, palm, bush, door, windowPane, lantern, centeredText, textOn, bricks, planks, signpost } from '../../art';
import { cobbles, pennants, box } from '../../art1';
import { drawText, textWidth } from '../../../engine/font';

const W = 480;

function paint(p: Painter, g: Game) {
  sky(p, W, 60, 'day');
  cloud(p, 90, 10, 0.9);
  cloud(p, 300, 6, 1.1);
  cloud(p, 430, 16, 0.7);
  // distant rooftops & jungle hills
  p.poly([[0, 60], [80, 40], [160, 56], [260, 36], [360, 50], [480, 34], [480, 80], [0, 80]], C.darkgreen);
  for (let i = 0; i < 12; i++) p.circle(380 + i * 9, 44 + (i % 3) * 3, 7, i % 2 ? C.green : C.darkgreen);

  // plaza
  cobbles(p, 0, 96, W, 48, 9, C.tan, C.sandshade, C.stoneshade);

  // ---- left edge: palms & path to the beach
  palm(p, 8, 100, 60, 6, 3);
  p.poly([[0, 104], [22, 102], [26, 144], [0, 144]], [C.sand, C.stone, '25']);

  // ---- tavern: The Deprecated Function
  p.poly([[24, 30], [74, 8], [124, 30]], C.darkred);
  for (let i = 0; i < 6; i++) p.line(30 + i * 8, 28 - i * 3, 118 - i * 8, 28 - i * 3, C.red);
  planks(p, 28, 30, 90, 68, true, C.wood, C.woodlight, 2);
  door(p, 60, 62, 24, 36, C.darkbrown);
  windowPane(p, 34, 44, 16, 14, C.skyblue, C.woodlight, true);
  windowPane(p, 96, 68, 16, 14, C.skyblue, C.woodlight, true);
  // hanging sign
  p.hline(84, 112, 44, C.darkgray);
  p.vline(90, 44, 48, C.darkgray); p.vline(106, 44, 48, C.darkgray);
  p.rect(84, 48, 30, 14, C.brandink);
  p.frame(84, 48, 30, 14, C.gold);
  textOn(p, '@dep', 89, 51, C.gold);
  // wanted poster
  p.rect(36, 66, 16, 20, C.sand);
  textOn(p, '$$', 38, 68, C.red);
  p.hline(38, 49, 78, C.brown); p.hline(38, 46, 81, C.brown);
  // 403 carved in the door
  if (!g.atLeast('authenticated')) textOn(p, '403', 63, 72, C.tan);

  // ---- alley to the harbour
  p.rect(118, 40, 28, 58, C.night);
  p.poly([[118, 98], [146, 98], [140, 86], [124, 86]], C.stoneshade);
  p.gradV(122, 56, 20, 30, [C.navy, C.sea]);
  // anchor sign
  p.rect(120, 30, 24, 10, C.navy);
  p.circle(132, 33, 2, C.foam);
  p.vline(132, 34, 38, C.foam);
  p.hline(129, 135, 38, C.foam);

  // ---- town hall with clock tower
  bricks(p, 146, 32, 88, 66, C.stone, C.stoneshade);
  p.poly([[140, 34], [190, 20], [240, 34]], C.stoneshade);
  p.rect(176, 0, 28, 24, C.stone);
  p.frame(176, 0, 28, 24, C.stoneshade);
  p.circle(190, 11, 8, C.white);
  p.circle(190, 11, 7, C.brandpaper);
  p.line(190, 11, 190, 6, C.ink);
  p.line(190, 11, 194, 13, C.ink);
  for (const x of [154, 170, 210, 226]) { p.rect(x - 2, 40, 5, 58, C.lightgray); p.hline(x - 3, x + 3, 40, C.white); }
  p.rect(182, 60, 16, 38, C.darkbrown);
  centeredText(p, 'TOWN HALL', 190, 26, C.ink);
  p.rect(180, 66, 20, 8, C.yellow);
  textOn(p, 'BRB', 182, 66, C.black);

  // fountain with the statue of Sir Table Layout
  p.ellipse(190, 96, 30, 6, C.stoneshade);
  p.ellipse(190, 94, 28, 5, C.sea);
  p.ellipse(190, 93, 24, 3, C.skyblue);
  p.rect(186, 76, 8, 18, C.stone);
  // statue: a man made of nested tables
  for (let i = 0; i < 3; i++) {
    const s = 12 - i * 3;
    p.frame(190 - s / 2, 62 - i * 6, s, 6, C.lightgray);
    p.vline(190, 62 - i * 6, 67 - i * 6, C.lightgray);
  }
  p.rect(186, 68, 8, 8, C.lightgray);
  p.frame(186, 68, 8, 8, C.gray);

  // ---- the welcome sign on posts
  const fixed = !!g.flag('signFixed');
  p.rect(246, 40, 4, 62, C.wood);
  p.rect(300, 40, 4, 62, C.wood);
  p.poly([[236, 38], [314, 34], [316, 60], [234, 62]], C.woodlight);
  p.poly([[236, 38], [314, 34], [314, 37], [236, 41]], C.tan);
  const l1 = fixed ? 'WELCOME TO' : 'WELCOM TO';
  const l2 = fixed ? 'LEGACY TOWN' : 'LEGASY TOWN';
  centeredText(p, l1, 275, 41, fixed ? C.brandblue : C.darkred);
  centeredText(p, l2, 275, 51, fixed ? C.brandblue : C.darkred);
  if (!fixed) { p.line(266, 48, 270, 48, C.darkred); }
  // paint pots at the foot of the sign
  for (const [x, c] of [[252, C.red], [260, C.brandblue], [292, C.yellow]] as const) {
    p.rect(x, 96, 6, 6, C.lightgray);
    p.rect(x, 96, 6, 2, c);
  }
  // ladder leaning on the right post
  if (!g.flag('got:ladder')) {
    p.line(306, 104, 316, 46, C.woodlight);
    p.line(312, 104, 322, 46, C.woodlight);
    for (let i = 0; i < 8; i++) p.hline(307 + i * 1.3, 313 + i * 1.3, 98 - i * 7, C.wood);
  }

  // ---- Wordy's Plugin Emporium
  const ex = 330;
  p.rect(ex, 30, 82, 68, C.brandpaper);
  for (let i = 0; i < 82; i += 10) p.rect(ex + i, 30, 5, 68, [C.brandpaper, C.brandmist, '25']);
  p.poly([[ex - 6, 30], [ex + 41, 12], [ex + 88, 30]], C.brandblue);
  // striped awning
  for (let i = 0; i < 8; i++) p.poly([[ex + i * 11, 52], [ex + i * 11 + 11, 52], [ex + i * 11 + 13, 60], [ex + i * 11 + 2, 60]], i % 2 ? C.white : C.brandpink);
  p.rect(ex + 4, 32, 74, 18, C.brandink);
  centeredText(p, "WORDY'S", ex + 41, 33, C.yellow);
  centeredText(p, 'PLUGINS', ex + 41, 42, C.white);
  door(p, ex + 28, 64, 22, 34, C.brandblue);
  // display window with plugin boxes
  p.rect(ex + 54, 64, 24, 24, C.skyblue);
  p.frame(ex + 54, 64, 24, 24, C.brandink);
  box(p, ex + 56, 78, 9, 9, C.red);
  box(p, ex + 66, 74, 10, 13, C.lime);
  box(p, ex + 58, 70, 6, 7, C.yellow);
  p.rect(ex + 4, 64, 20, 20, C.skyblue);
  p.frame(ex + 4, 64, 20, 20, C.brandink);
  // SALE tag in tiny 3x5 letters, so it fits inside the window
  p.rect(ex + 6, 69, 17, 9, C.white);
  p.frame(ex + 6, 69, 17, 9, C.brandpink);
  const tiny: string[][] = [
    ['###', '#..', '###', '..#', '###'], // S
    ['.#.', '#.#', '###', '#.#', '#.#'], // A
    ['#..', '#..', '#..', '#..', '###'], // L
    ['###', '#..', '##.', '#..', '###'], // E
  ];
  tiny.forEach((rows, i) => rows.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === '#') p.px(ex + 7 + i * 4 + x, 71 + y, C.brandpink);
  })));

  // ---- jungle gate in a stone wall
  bricks(p, 414, 40, 66, 58, C.stoneshade, C.darkgray);
  p.rect(420, 50, 36, 48, C.darkgreen);
  for (let i = 0; i < 6; i++) p.circle(424 + i * 6, 60 + (i % 2) * 8, 6, i % 2 ? C.green : C.darkgreen);
  if (!g.flag('aiInstalled')) {
    planks(p, 420, 50, 36, 48, true, C.wood, C.woodlight, 5);
    p.line(420, 64, 456, 64, C.darkgray);
    p.line(420, 66, 456, 66, C.darkgray);
    p.rect(434, 62, 8, 8, C.gold);
    p.rect(432, 72, 14, 12, C.white);
    textOn(p, 'AI?', 433, 74, C.red);
  } else {
    // gate swung open
    p.poly([[420, 50], [410, 46], [410, 100], [420, 98]], C.wood);
    p.poly([[456, 50], [466, 46], [466, 100], [456, 98]], C.wood);
    p.poly([[426, 98], [450, 98], [444, 80], [432, 80]], C.sandshade);
  }
  p.poly([[414, 40], [438, 30], [462, 40]], C.stone);
  textOn(p, 'JUNGLE', 421, 32, C.ink);

  // right edge: path to the bandstand
  bush(p, 470, 92, 1.1);
  p.poly([[462, 102], [480, 100], [480, 144], [466, 144]], [C.stone, C.sand, '25']);
  signpost(p, 456, 70, 24, ['->', '♥'], 14, C.woodlight, C.darkred);

  // bench for the Grand Maintainer
  p.rect(222, 104, 36, 4, C.woodlight);
  p.rect(222, 96, 36, 3, C.woodlight);
  p.rect(224, 108, 3, 8, C.wood);
  p.rect(253, 108, 3, 8, C.wood);

  // lamp posts & flower pots
  for (const x of [130, 322]) { p.rect(x, 70, 2, 30, C.darkgray); lantern(p, x - 1, 64, true); }
  for (const x of [26, 140, 236, 416]) {
    p.poly([[x, 100], [x + 10, 100], [x + 8, 108], [x + 2, 108]], C.orange);
    bush(p, x + 5, 98, 0.45, C.green, C.darkgreen);
    p.px(x + 3, 95, C.brandpink); p.px(x + 7, 94, C.yellow);
  }
  // bunting
  pennants(p, [[118, 30], [146, 26]], [C.brandpink, C.brandblue, C.yellow]);
  pennants(p, [[412, 30], [438, 24], [462, 30]], [C.brandblue, C.yellow, C.brandpink]);
}

function anim(p: Painter, g: Game, t: number) {
  // fountain spray
  for (let i = 0; i < 5; i++) {
    const k = ((t / 600) + i / 5) % 1;
    const x = 190 + (i - 2) * 4 * k * 2;
    const y = 74 + Math.round(-6 * Math.sin(k * Math.PI)) + Math.round(k * 16);
    p.px(x, y, C.foam);
  }
  // pigeons pecking
  for (const [x, ph] of [[150, 0], [160, 1], [380, 2]] as const) {
    const peck = Math.floor(t / 400 + ph) % 3 === 0 ? 1 : 0;
    p.ellipse(x, 132, 3, 2, C.lightgray);
    p.circle(x + 3, 130 + peck, 1.5, C.gray);
    p.px(x + 5, 130 + peck, C.orange);
  }
  // the painter's wet paint glistens
  if (!g.flag('signFixed') && Math.floor(t / 500) % 4 === 0) p.px(262, 44, C.white);
}

// ---------------------------------------------------------------------------- Maintainer
const trialsDone = (g: Game) => !!(g.flag('providerReady') && g.flag('automatorDone') && g.flag('masterBeaten'));

async function maintainerTalk(g: Game) {
  if (g.role === 'anonymous') {
    if (!g.flag('metMaint')) {
      g.set('metMaint');
      await g.sayAs('maintainer', ['This site is currently under maintenance.', 'We should be back shortly. Thank you for your patience.']);
    }
    return g.talk('maintainerAnon');
  }
  if (!g.flag('trialsGiven')) {
    g.set('trialsGiven');
    await g.sayAs('maintainer', [
      'Oh! A logged-in user! It has been years. Let me take off my... no, the sign stays on.',
      'I am the Grand Maintainer. You want to leave the island, I can see it in your eyes.',
      'Only a true AI Site Builder can escape. You must pass the Three Trials:',
      'The Trial of the Provider. The Trial of the Automator. The Trial of the Agent.',
    ]);
    await g.say('What are those?');
    await g.sayAs('maintainer', [
      'Things you do with Drupal AI. Which is not installed. Nothing here is installed. We don\'t like change.',
      'And trials are for Editors. You\'re barely Authenticated.',
      'Get the AI module installed without breaking the site, and I\'ll make you an Editor.',
      'The Composer at the bandstand installs things. When he is in the mood.',
    ]);
    return;
  }
  if (g.flag('aiInstalled') && !g.atLeast('editor')) {
    await g.sayAs('maintainer', [
      'I heard music! "composer require drupal/ai"! And the site... is still up?',
      'You installed a module without breaking anything. That is the very definition of an Editor.',
    ]);
    await g.grantRole('editor');
    await speakAndPlay(g);
    await g.sayAs('maintainer', [
      'The jungle gate is open now. The trials await in the jungle.',
      'Provider: the Temple. Automator: the Mill. Agent: the Code Review Master, wherever she hides.',
    ]);
    await g.card(['Part II', 'The Three Trials'], 3500);
    return;
  }
  if (g.atLeast('editor') && !g.atLeast('sitebuilder') && trialsDone(g)) {
    await g.sayAs('maintainer', [
      'A provider configured. Content automated. An agent mastered.',
      'You have passed all Three Trials! I have not been this excited since the last security release.',
      'Kneel. Actually, don\'t, my knees are in maintenance mode too.',
    ]);
    await g.grantRole('sitebuilder');
    g.give('blankcard');
    await g.sayAs('maintainer', [
      'Take this blank Tool API card. Site Builders define tools that agents can use.',
      'Now - about leaving the island.',
    ]);
    await g.say('Yes! Finally! Where\'s the boat?');
    await g.sayAs('maintainer', [
      'Boat? Ha! Passing trials doesn\'t get you off the island. Nothing gets through the Fog of Technical Debt.',
      'No ship finds us without exact coordinates. And nobody knows where we are.',
      'Only the Lighthouse can reach beyond the fog. Modelia Contexta keeps it. Its lamp speaks to servers far away.',
    ]);
    g.set('fogTwist');
    await g.card(['Part III', 'Beyond the Fog'], 3500);
    return;
  }
  if (g.atLeast('sitebuilder') && g.flag('nodeContacted') && !g.flag('mcpServerGiven')) {
    await g.say('Captain Node answered! But she wants coordinates via a tool call, from an MCP server.');
    await g.sayAs('maintainer', [
      'An MCP server! I have one. Well, the island has one. It has been under maintenance since... always.',
      'Here. The MCP Server relic. Put your tools on it, and outside agents can use them.',
    ]);
    g.set('mcpServerGiven');
    g.give('mcpserver');
    await g.sayAs('maintainer', 'Be careful who you give permissions to. Permissions are the whole point.');
    return;
  }
  return g.talk('maintainer');
}

export const squareDialogues: Dialogue[] = [
  {
    id: 'maintainerAnon',
    with: 'maintainer',
    options: [
      {
        id: 'when', text: 'When will the maintenance be over?',
        run: async (g) => {
          await g.sayAs('maintainer', 'Shortly.');
          await g.say('How short is shortly?');
          await g.sayAs('maintainer', 'Fifteen years, so far. Thank you for your patience.');
        },
      },
      {
        id: 'who', text: 'Who are you?', once: true,
        run: (g) => g.sayAs('maintainer', ['The Grand Maintainer. I keep Legacy Town running.', 'In the sense that I keep it exactly as it was. Nothing changes on my watch.']),
      },
      {
        id: 'leave', text: 'How do I get off this island?',
        run: (g) => g.sayAs('maintainer', ['Visitors don\'t get to ask that question.', 'Anonymous users see the maintenance page. Log in, then we can talk.']),
      },
      {
        id: 'back', text: "What's on the back of your sign?", once: true,
        run: async (g) => {
          await g.sayAs('maintainer', 'Nothing! Nothing at all.');
          await g.say('He flips it nervously. On the back, scribbled in marker: "admin / admin".');
          g.set('sawAdmin');
        },
      },
      {
        id: 'admin', text: 'Log me in. Username admin, password admin.', when: (g) => !!g.flag('sawAdmin'), once: true,
        run: async (g) => {
          await g.sayAs('maintainer', ['Ha! Nice try. That stopped working in 2009.', 'Register like everybody else. The Harbour Office handles registrations.']);
          g.set('knowsRegister');
        },
      },
      { id: 'bye', text: 'Carry on maintaining.', end: true },
    ],
  },
  {
    id: 'maintainer',
    with: 'maintainer',
    options: [
      {
        id: 'trials', text: 'Remind me about the trials.',
        run: async (g) => {
          if (!g.atLeast('editor')) {
            await g.sayAs('maintainer', ['Trials are for Editors.', 'Get the AI module installed. The Composer at the bandstand does the installing.']);
            return;
          }
          await g.sayAs('maintainer', [
            `Provider: ${g.flag('providerReady') ? 'done!' : 'connect an AI provider at the Temple. Safely.'}`,
            `Automator: ${g.flag('automatorDone') ? 'done!' : 'make the Mill write its own content.'}`,
            `Agent: ${g.flag('masterBeaten') ? 'done!' : 'defeat the Code Review Master.'}`,
          ]);
        },
      },
      {
        id: 'provider', text: 'What is an AI provider, exactly?', when: (g) => g.atLeast('editor') && !g.flag('providerReady'), once: true,
        run: (g) => g.sayAs('maintainer', [
          'A provider is the company or machine that runs the actual language model. Drupal AI talks to many.',
          'You need a key to use most of them. Keep the key secret. Secrets in the wrong place... ruin islands.',
        ]),
      },
      {
        id: 'automator', text: 'What does an Automator do?', when: (g) => g.atLeast('editor') && !g.flag('automatorDone'), once: true,
        run: (g) => g.sayAs('maintainer', [
          'An AI Automator fills in a field for you when content is saved. Summaries, tags, descriptions.',
          'Farmer Fieldsworth at the Mill has ten thousand empty fields. She is not coping.',
        ]),
      },
      {
        id: 'agent', text: 'Who is the Code Review Master?', when: (g) => g.atLeast('editor') && !g.flag('masterBeaten'), once: true,
        run: (g) => g.sayAs('maintainer', [
          'The greatest reviewer on the island. She knows everything about AI Agents.',
          'To find her, first learn to survive the reviewers at the Code Review Crossroads.',
        ]),
      },
      {
        id: 'nell', text: 'I met Nitpick Nell at the crossroads.', when: (g) => !!g.flag('met:nell'), once: true,
        run: (g) => g.sayAs('maintainer', [
          'Nell! A Drupal core committer. Half of what runs on this island went through her review.',
          "When Nell says a patch is ready, I don't even check. That's not laziness. That's trust.",
        ]),
      },
      {
        id: 'lighthouse', text: 'Tell me about the Lighthouse.', when: (g) => !!g.flag('fogTwist'),
        run: (g) => g.sayAs('maintainer', [
          'The Lighthouse lamp is an MCP Client. It can talk to servers beyond the fog. Any server that speaks the protocol.',
          'Modelia Contexta keeps it. She only lets Site Builders up. Which you now are. Congratulations, I suppose.',
        ]),
      },
      {
        id: 'sign', text: 'Why do you still wear the maintenance sign?',
        run: (g) => g.sayAs('maintainer', g.random([
          ['If I take it off, people will expect things to work.'],
          ['It is load-bearing. Emotionally.'],
          ['Every time I try to take it off, someone files a bug report.'],
        ])),
      },
      { id: 'bye', text: 'See you later.', end: true },
    ],
  },
  {
    id: 'painter',
    with: 'painter',
    options: [
      {
        id: 'what', text: 'What are you painting?', once: true,
        run: (g) => g.sayAs('painter', ['The welcome sign! "Welcom to Legasy Town."', 'I paint what I hear. Spelling costs extra.']),
      },
      {
        id: 'wrong', text: "It's spelled wrong.", when: (g) => !g.flag('signFixed'),
        run: async (g) => {
          await g.sayAs('painter', ['Wrong? Spelling is a matter of opinion.', 'I bought a spellchecker plugin from Wordy once. It underlined everything in red. Including me.']);
          g.set('painterSpell');
        },
      },
      {
        id: 'ladder', text: 'Can I borrow your ladder?', when: (g) => !g.flag('got:ladder'),
        run: (g) => g.sayAs('painter', [
          'My ladder? Never! A painter without a ladder is just a man with opinions about walls.',
          'Maybe... if my sign were perfect, I would have nothing left to climb toward.',
        ]),
      },
      {
        id: 'ai', text: 'Would you like an AI to help you write?', when: (g) => !g.flag('signFixed'), once: true,
        run: (g) => g.sayAs('painter', ['An AI? Will it steal my job?', 'Hmm. If it only fixes my spelling... and I still hold the brush... that I could live with.']),
      },
      { id: 'bye', text: 'Keep up the good work.', end: true },
    ],
  },
];

async function fixSign(g: Game) {
  if (g.flag('signFixed')) return g.sayAs('painter', 'The sign is already perfect. Like me.');
  g.take('ckeditor');
  await g.say('Here. The AI CKEditor assistant. It sits right in your editor and helps with the writing.');
  await g.sayAs('painter', 'Let us see. I type... "Welcom to Legasy Town"...');
  g.actor('painter').gesture = 'paint';
  await g.sayAs('painter', ['Ooh, it suggests: "Welcome to Legacy Town." And it offers to make it more "engaging".', 'No, thank you, AI. Just the spelling. I am the artist here.']);
  g.fx('flash', 120);
  g.set('signFixed');
  g.actor('painter').gesture = undefined;
  await g.sayAs('painter', ['Magnificent! My sign is perfect. I have nothing left to climb toward.', 'Take the ladder, friend. I shall paint on the ground now, like a modern artist.']);
  g.give('ladder');
  await g.say('A ladder! Things just got... higher.');
}

// The AI module turns on text-to-speech and text-to-music: from here on the game has voices and music.
async function speakAndPlay(g: Game) {
  await g.sayAs('maintainer', [
    'And the AI module does more than chat. Drupal AI has a text-to-speech operation.',
    'You give a provider some text, and it gives you back a voice. Like this. I type a sentence, and the provider turns it into spee-',
  ]);
  g.set('voicesOn');
  await g.sayAs('maintainer', '-eech. ...Hold on. Is that... my VOICE?');
  await g.say('I can HEAR you! And... I can hear ME!');
  await g.sayAs('maintainer', [
    'I have not heard my own voice since the last major version. I sound... distinguished.',
    'Some providers can even compose music from a text prompt. Text-to-music. You simply describe the tune.',
    '"Relaxed island theme. Ukulele. A little steel drum. Slightly cheeky." And the provider plays...',
  ]);
  g.set('musicOn');
  await g.fx('music');
  await g.sayAs('maintainer', '...THAT. Ahh. Much nicer than the hum of a site in maintenance mode.');
  await g.say('Voices AND music. This island just got a lot less quiet.');
  await g.narrate('Tip: speech and music volume are in the menu (top right, or Esc).');
}

export const square: RoomDef = {
  id: 'square',
  name: 'Legacy Town Square',
  width: W,
  paint,
  anim,
  bgKey: (g) => ['aiInstalled', 'signFixed', 'got:ladder'].map((k) => (g.flag(k) ? 1 : 0)).join('') + g.role,
  scale: [98, 0.82, 143, 1],
  walk: [[[0, 106], [118, 102], [124, 96], [140, 96], [146, 102], [418, 102], [424, 100], [452, 100], [458, 104], [480, 106], [480, 143], [0, 143]]],
  start: [438, 112],
  startFace: 'front',
  npcs: [
    { id: 'maintainer', at: [240, 118], face: 'front' },
    { id: 'painter', at: [322, 124], face: 'left' },
  ],
  hotspots: [
    {
      id: 'beachpath', name: 'path to the beach', rect: [0, 100, 20, 44], walkTo: [8, 124],
      exit: { to: 'beach', at: [290, 125], face: 'left' },
      look: 'The sandy path back to the beach.',
    },
    {
      id: 'tavern', name: 'tavern door', rect: [58, 60, 28, 38], walkTo: [72, 104], face: 'back',
      exit: { to: 'tavern', at: [32, 122], face: 'right' },
      roles: { walk: 'authenticated', open: 'authenticated', use: 'authenticated' },
      roleRefusal: 'The door has "403" carved into it. A voice inside growls: "Members only! Log in first!"',
      look: (g) => g.say(g.atLeast('authenticated')
        ? 'The door of the tavern. It used to say 403. Now it just says "PUSH". It means pull.'
        : ['The tavern door. Someone carved "403" into it.', "403 means Forbidden. As in: you're not on the list."]),
      push: 'It says PUSH. It means pull. Classic.',
    },
    {
      id: 'tavernsign', name: 'tavern sign', rect: [84, 44, 32, 20], walkTo: [98, 104], face: 'back',
      look: [
        '"THE DEPRECATED FUNCTION". A tavern.',
        'In code, "deprecated" means "still works, but please stop using it". Exactly how I feel about taverns.',
      ],
    },
    {
      id: 'wanted', name: 'wanted poster', rect: [34, 64, 20, 24], walkTo: [44, 104], face: 'back',
      look: [
        '"WANTED: Junior developer. Ten years of experience in Drupal 12."',
        '"Must know every framework, including ones not invented yet. Salary: exposure."',
      ],
      pickup: "I'll leave it. Some other junior deserves to be confused by it.",
    },
    {
      id: 'alley', name: 'alley to the harbour', rect: [118, 40, 28, 58], walkTo: [132, 98], face: 'back',
      exit: { to: 'harbour', at: [296, 126], face: 'left' },
      look: 'A narrow alley. The anchor sign suggests it leads down to the harbour. Or to anchors.',
    },
    {
      id: 'townhall', name: 'Town Hall', rect: [146, 30, 88, 46], walkTo: [190, 104], face: 'back',
      look: 'The Town Hall. A sign on the door says "BRB". The dust on the sign says otherwise.',
      open: 'Locked. "Closed for maintenance." Of course.',
    },
    {
      id: 'clock', name: 'clock tower', rect: [176, 0, 28, 24], noWalk: true,
      look: ['The clock is stuck at ten past twelve. A small engraving: "Last updated: 2009".', 'Nothing on this island has a working clock. It explains a lot.'],
    },
    {
      id: 'fountain', name: 'fountain', rect: [160, 56, 60, 44], walkTo: [190, 106], face: 'back',
      look: [
        'A fountain with a statue of "Sir Table Layout, founder of Legacy Town".',
        'He is made entirely of nested tables. Back in the day, that\'s how all web pages were built.',
      ],
      use: "I'm not drinking that. The water was last refreshed in 2009.",
      pickup: "I can't pick up a fountain. Not even a small one.",
    },
    {
      id: 'welcome', name: (g) => (g.flag('signFixed') ? 'welcome sign' : 'misspelled welcome sign'), rect: [234, 32, 84, 30], walkTo: [276, 106], face: 'back',
      look: (g) => g.say(g.flag('signFixed')
        ? '"WELCOME TO LEGACY TOWN". Perfectly spelled. The rest of the town looks almost embarrassed.'
        : ['"WELCOM TO LEGASY TOWN".', 'Two typos in four words. That\'s a 50% error rate. It would make a fine AI demo, actually.']),
    },
    {
      id: 'ladder', name: 'ladder', rect: [304, 44, 20, 60], walkTo: [306, 112], face: 'back',
      when: (g) => !g.flag('got:ladder'),
      look: "The sign painter's ladder, leaning against the sign post.",
      pickup: (g) => g.sayAs('painter', 'Hands off my ladder! That is a professional instrument!'),
      pull: (g) => g.sayAs('painter', 'Hands off my ladder! That is a professional instrument!'),
    },
    {
      id: 'maintainer', name: 'Grand Maintainer', actor: 'maintainer',
      look: (g) => g.say(g.flag('sawAdmin')
        ? 'The Grand Maintainer, still wearing his UNDER MAINTENANCE sign. "admin/admin" is still scribbled on the back.'
        : ['An old man in a toga with a sign round his neck: "UNDER MAINTENANCE".', "There's something scribbled on the back of the sign."]),
      talk: maintainerTalk,
      pull: async (g) => {
        await g.say('I flip his sign over. Written on the back: "admin / admin".');
        g.set('sawAdmin');
        await g.sayAs('maintainer', 'Hey! That is classified!');
      },
      pickup: "He's in maintenance mode, not in portable mode.",
      giveItem: {
        verifylink: (g) => g.sayAs('maintainer', 'Not to me! The Harbour Office handles registrations. Forms are their whole... thing.'),
        tokenform: (g) => g.sayAs('maintainer', 'Forms go to the Harbour Office. I only maintain.'),
        readme: (g) => g.sayAs('maintainer', 'A README? I never read those. I just maintain things until they stop working.'),
      },
    },
    {
      id: 'bench', name: 'bench', rect: [220, 94, 40, 22],
      look: 'A bench. The Grand Maintainer has been sitting on it so long it has his shape.',
      use: "It's taken. Since 2009.",
    },
    {
      id: 'painter', name: 'sign painter', actor: 'painter',
      look: (g) => g.say(g.flag('signFixed')
        ? 'The sign painter, beaming with pride at his correctly spelled sign.'
        : 'A sign painter in a beret, admiring his work. His spelling is... experimental.'),
      talk: (g) => g.talk('painter'),
      giveItem: { ckeditor: fixSign },
      useItem: { ckeditor: fixSign },
    },
    {
      id: 'emporium', name: "Wordy's Plugin Emporium", rect: [356, 60, 26, 38], walkTo: [369, 104], face: 'back',
      exit: { to: 'emporium', at: [52, 128], face: 'right' },
      roles: { walk: 'authenticated', open: 'authenticated', use: 'authenticated' },
      roleRefusal: 'A sign on the door: "Customers must have an account! Join our loyalty program!" I need to be logged in.',
      look: "The door to Wordy's Plugin Emporium. A bell, a sign, and the faint smell of upselling.",
    },
    {
      id: 'shopfront', name: 'shop window', rect: [330, 28, 82, 34], walkTo: [370, 104], face: 'back',
      look: ['"WORDY\'S PLUGINS - There\'s a plugin for that!"', 'The window display: a slider plugin, a plugin that disables plugins, and a plugin that adds more windows to the window.'],
    },
    {
      id: 'gate', name: 'jungle gate', rect: [418, 46, 40, 54], walkTo: [438, 104], face: 'back',
      exit: { to: 'map' },
      walk: async (g) => {
        if (!g.flag('aiInstalled')) {
          await g.say(['The gate is padlocked. A note: "Requires module: drupal/ai. Not installed."', 'Even the gate has dependencies.']);
          return;
        }
        await g.goto('map');
      },
      look: (g) => g.say(g.flag('aiInstalled')
        ? 'The jungle gate stands open. The AI module is installed, and the jungle awaits.'
        : 'A gate into the jungle, chained shut. A note: "Requires module: drupal/ai. Not installed."'),
      open: async (g) => {
        if (!g.flag('aiInstalled')) return g.say('Padlocked. The padlock has a little error message: "Missing dependency: drupal/ai".');
        await g.goto('map');
      },
    },
    {
      id: 'bandstandpath', name: 'path to the bandstand', rect: [462, 96, 18, 48], walkTo: [472, 124],
      exit: { to: 'bandstand', at: [24, 126], face: 'right' },
      look: 'A path toward the bandstand. I can hear someone not playing the piano.',
    },
    {
      id: 'pigeons', name: 'pigeons', rect: [144, 126, 22, 10],
      look: "Pigeons. They've been pecking at the same crumb since 2009. Very dedicated QA team.",
      pickup: 'They flutter away, then come straight back. Like regression bugs.',
      talk: 'Coo.',
    },
    {
      id: 'lamppost', name: 'lamp post', rect: [126, 62, 10, 38],
      look: 'A gas lamp. It is lit at noon and dark at night. Somebody configured the timezone wrong.',
    },
  ],
};
