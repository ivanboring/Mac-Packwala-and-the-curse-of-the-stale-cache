import type { Painter } from '../../../engine/paint';
import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import { C, sky, cloud, sea, sand, palm, seagull, centeredText, textOn, bush } from '../../art';
import { airship } from '../../art3';

// The Paradise of Rosetta: reached only by airship. Customs on the right, the Rosetta Stone on the left.
const SHORE: [number, number][] = [[0, 96], [60, 94], [130, 97], [200, 95], [260, 97], [320, 95]];
const ROPE_X = 208;

function paint(p: Painter, g: Game) {
  sky(p, 320, 62, 'day');
  p.circle(150, 18, 11, C.glow);
  p.circle(150, 18, 8, C.yellow);
  cloud(p, 60, 14, 0.8);
  cloud(p, 214, 10, 0.7);
  sea(p, 0, 56, 320, 44);
  // a turquoise lagoon near the shore
  p.rect(0, 84, 320, 12, [C.sea, C.cyan, '25']);
  // little islands on the horizon
  p.poly([[96, 58], [110, 52], [124, 54], [134, 58]], C.darkgreen);
  p.poly([[176, 58], [184, 55], [194, 58]], C.green);
  // the beach
  p.poly([[0, 96], ...SHORE, [320, 144], [0, 144]], C.sand);
  sand(p, 0, 98, 320, 46, 61);
  p.poly([[0, 96], ...SHORE, [320, 100], [0, 100]], C.foam);

  // ---- the Rosetta Stone monument ----
  p.rect(18, 104, 66, 10, C.stone);
  p.rect(18, 104, 66, 2, C.lightgray);
  p.rect(22, 114, 58, 4, C.stoneshade);
  p.rect(38, 107, 26, 6, C.gold);
  centeredText(p, 'ROSETTA', 51, 106, C.brandink);
  // the slab: dark granite with a broken top corner
  p.poly([[26, 104], [26, 40], [36, 30], [58, 28], [64, 34], [70, 30], [78, 38], [78, 104]], C.darkgray);
  p.poly([[70, 30], [78, 38], [78, 104], [74, 104], [74, 40]], C.ink);
  p.line(26, 40, 36, 30, C.gray);
  p.line(36, 30, 58, 28, C.gray);
  // three bands, same message, three ways
  const bands: [number, string, number][] = [[38, 'EN', C.lightgray], [60, 'JSON', C.cyan], [82, 'MCP', C.brandbluelight]];
  for (const [y, label, c] of bands) {
    p.hline(29, 73, y - 3, C.gray);
    textOn(p, label, 30, y, c);
    for (let i = 0; i < 3; i++) {
      const x0 = label === 'JSON' && i > 0 ? 34 : 30;
      const len = [38, 30, 34][i] - (x0 - 30);
      if (i === 0) p.hline(30 + label.length * 6 + 2, 72, y + 3, c);
      else p.hline(x0, x0 + len, y + 2 + i * 5, c);
    }
  }
  p.hline(29, 73, 101, C.gray);

  // palms
  palm(p, 98, 108, 54, -6, 3);
  palm(p, 6, 112, 46, 8, 5);
  bush(p, 120, 108, 0.8);
  bush(p, 88, 112, 0.6);

  // ---- customs booth ----
  p.rect(142, 62, 52, 46, C.white);
  p.rect(142, 62, 52, 46, [C.white, C.brandmist, '25']);
  p.frame(142, 62, 52, 46, C.lightgray);
  // EU-blue roof with a ring of gold stars
  p.poly([[136, 64], [168, 46], [200, 64]], C.blue);
  p.hline(136, 199, 64, C.navy);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    p.px(168 + Math.round(Math.cos(a) * 6), 56 + Math.round(Math.sin(a) * 5), C.yellow);
  }
  p.rect(146, 66, 44, 10, C.navy);
  centeredText(p, 'CUSTOMS', 168, 67, C.yellow);
  // service window + counter
  p.rect(150, 80, 36, 18, C.skyblue);
  p.rect(150, 80, 36, 18, [C.skyblue, C.white, '25']);
  p.frame(150, 80, 36, 18, C.navy);
  p.rect(146, 98, 44, 4, C.woodlight);
  p.hline(146, 189, 101, C.wood);
  // "declare AI content" notice
  p.rect(186, 84, 6, 10, C.yellow);
  p.hline(187, 191, 86, C.ink); p.hline(187, 190, 88, C.ink); p.hline(187, 191, 90, C.ink);
  p.rect(142, 102, 52, 6, C.lightgray);

  // ---- queue rope ----
  const post = (x: number, y: number) => {
    p.rect(x - 1, y - 14, 3, 14, C.gold);
    p.ellipse(x, y - 15, 2, 1, C.yellow);
    p.ellipse(x, y, 3, 1, C.olive);
  };
  post(ROPE_X - 4, 108);
  if (!g.flag('disclosed')) {
    for (let i = 0; i <= 24; i++) {
      const k = i / 24;
      const x = ROPE_X - 4 + k * 8, y = 93 + k * 34 + Math.sin(k * Math.PI) * 6;
      p.rect(Math.round(x), Math.round(y), 2, 2, k > 0.5 ? C.red : C.darkred);
    }
  }
  post(ROPE_X + 4, 142);
  if (g.flag('disclosed')) {
    // unhooked, hanging from the near post
    p.line(ROPE_X + 4, 126, ROPE_X + 2, 138, C.red);
    p.line(ROPE_X + 5, 126, ROPE_X + 3, 138, C.darkred);
  }

  // ---- Captain Node's airship, parked on the beach ----
  p.line(296, 96, 312, 112, C.tan);
  p.rect(311, 110, 3, 5, C.wood);
  airship(p, 270, 50, 0);
  p.ellipse(270, 99, 26, 3, [0, C.sandshade, 'check']);

  // a welcome mat for the queue
  p.poly([[222, 124], [270, 124], [274, 133], [218, 133]], C.brandpink);
  centeredText(p, 'WELCOME', 246, 125, C.white);
}

function anim(p: Painter, g: Game, t: number) {
  // gentle glints on the lagoon (between the palms and the booth, where the sea shows)
  for (let i = 0; i < 4; i++) {
    const x = 122 + ((i * 37 + Math.floor(t / 900) * 11) % 18), y = 86 + ((i * 5) % 8);
    p.hline(x, x + 2, y, C.foam);
  }
  seagull(p, 210 + Math.sin(t / 2400) * 70, 22 + Math.sin(t / 650) * 3, t);
  // the airship's propeller idles, and the balloon breathes a little
  const k = Math.floor(t / 90) % 2;
  if (k) p.vline(295, 82, 96, C.lightgray); else p.hline(293, 298, 89, C.lightgray);
  // sparkle on the stone's top band, now and then
  if (Math.floor(t / 1700) % 3 === 0) { p.px(46, 36, C.white); p.px(45, 37, C.glow); p.px(47, 37, C.glow); }
}

// ---------------------------------------------------------------------------------------
export async function declare(g: Game) {
  if (g.flag('disclosed')) return g.say("It's already labelled. Labels, like jokes, don't get better the second time.");
  if (g.room.id !== 'rosetta') {
    return g.say(['Stamp my postcard? Not yet.', "I'll do it at customs, where somebody actually checks."]);
  }
  if (!g.has('postcard')) return g.say('I have nothing to declare. Yet.');
  await g.sayAs('officer', ['A declaration! Splendid.', 'How much AI was involved in this postcard? Choose carefully. Customs can tell.']);
  const pick = await g.choose([
    { id: 'byme', text: 'None. Hand-written by me.' },
    { id: 'spelling', text: 'Just a little help with the spelling.' },
    { id: 'unread', text: 'All AI. I never even read it.' },
    { id: 'honest', text: 'AI-generated, reviewed by me.' },
  ]);
  if (pick === 'byme') {
    await g.say('None. I wrote it by hand. With my hands.');
    await g.sayAs('officer', ['Hand-written. I see.', 'Then who is this, at the bottom? "(sent by Mac\'s AI agent)".', 'Your agent signed it.']);
    await g.say('...My agent is more honest than I am. That\'s a new low.');
    return;
  }
  if (pick === 'spelling') {
    await g.say('Just a little help. With the spelling. And... the words.');
    await g.sayAs('officer', ['"A little help." Your agent wrote every word, sir.', '"A little help" is what my nephew calls the homework I do for him.']);
    return;
  }
  if (pick === 'unread') {
    await g.say("All AI. Didn't even read it. I'm very busy and important.");
    await g.sayAs('officer', [
      "Honest! But unread? It's going to your FAMILY.",
      'A human should look at what an AI writes before it goes out into the world.',
    ]);
    await g.say(['Actually, I did read it. Twice. I was trying to sound cool.']);
    await g.sayAs('officer', 'Then declare what really happened. Customs is very literal.');
    return;
  }
  await g.say('AI-generated. My agent wrote it, and I read it and checked it.');
  g.actor('officer').gesture = 'stamp';
  await g.sayAs('officer', 'The truth! How refreshing. Hold still.');
  g.shake();
  await g.narrate('*KA-CHUNK*');
  g.actor('officer').gesture = undefined;
  g.set('disclosed');
  await g.sayAs('officer', [
    'There. Your postcard now carries two labels.',
    'One for people: the little EU icon and a sentence. "AI-generated, reviewed by a human."',
    'One for machines: tags tucked inside, so search engines and other systems can read it too.',
    "That's AI Disclosure. Article 50 of the EU AI Act: if AI made it, people get told.",
    "Mind you, the stamp doesn't decide what needs a label. You do. Or your site does. The stamp records it and shows it.",
    'Welcome to the Paradise of Rosetta! The rope is open.',
  ]);
  g.refresh();
}

export const rosettaDialogues: Dialogue[] = [
  {
    id: 'officer',
    with: 'officer',
    start: async (g) => {
      await g.sayAs('officer', g.flag('disclosed')
        ? g.random(['Enjoy your stay! Label responsibly.', 'Next! Oh, it\'s you. You\'re fine. Labelled and lovely.'])
        : 'Next! Anything to declare?');
    },
    options: [
      {
        id: 'declare', text: 'I have a postcard to declare.', when: (g) => g.has('postcard') && !g.flag('disclosed'),
        run: (g) => g.sayAs('officer', g.has('disclosure')
          ? ['AI-generated content gets a label here. Use your AI Disclosure stamp on it, please.', 'Then tell me, honestly, how it was made.']
          : ['AI-generated content gets a label here. Do you have a disclosure stamp?']),
      },
      {
        id: 'why', text: 'Why do you check AI labels?', once: true,
        run: (g) => g.sayAs('officer', [
          'Article 50 of the EU AI Act. When people read, watch or hear something an AI made, they should be told.',
          'Not to scare them. Just so nobody is fooled. A label is good manners, written down.',
        ]),
      },
      {
        id: 'rosetta', text: 'What is the Paradise of Rosetta?', once: true,
        run: (g) => g.sayAs('officer', [
          'The island where everybody understands everybody. Humans, AI agents, other systems. All of them.',
          'Have a look at the stone. It explains itself. Three times.',
        ]),
      },
      {
        id: 'badge', text: 'Nice badge.', once: true,
        run: (g) => g.sayAs('officer', 'Thank you. Twelve stars. I polish one a month. It keeps me busy between airships.'),
      },
      { id: 'bye', text: 'Thanks, officer.', end: true },
    ],
  },
];

async function finale(g: Game) {
  if (g.flag('rosettaFinale')) return;
  g.set('rosettaFinale');
  const d = g.actor('node');
  await g.walkTo(150, 126);
  g.face('left');
  await d.say(['Labelled and through customs! Welcome to Rosetta, Mac.']);
  await g.say('So what IS this place?');
  await d.say([
    'A place where everything describes what it can do. Once.',
    'In words, for humans. As a schema, for agents. As a tool listing, for other systems.',
    'Describe a capability once, properly, and everyone understands it. Nobody guesses. Nobody gets lost in the fog.',
  ]);
  await g.say([
    'Like my geolocation tool! A plain description, typed inputs and outputs, and my MCP server listing it.',
    'I did the Rosetta thing by accident.',
  ]);
  await d.say([
    'Not by accident. You learned it, one fog bank at a time.',
    'At DrupalCon, people proposed a Rosetta sprint for exactly this: describe what Drupal can do once, so humans, agents and other systems all understand it.',
    'This island is where that idea goes on holiday.',
  ]);
  await g.say(['A paradise where everyone understands each other.', 'And not a single deprecated staircase in sight.']);
  await d.say('Well. One. But it has excellent documentation.');
  await g.wait(800);
  await g.fx('fadeOut', 900);

  await g.card(['THE END', '', '(altered by Captain Hook_alter to:)', '', 'THE BEGINNING'], 5000);
  await g.card(['Mac Packwala and the Curse of the Stale Cache', '', 'Made for workflows-of-ai.com', 'A Workflows of AI adventure'], 5000);
  await g.card(['Mac Packwala will return in:', '', 'THE SECRET OF MIGRATE ISLAND'], 4500);
  await g.card(['Voices coming soon', '', '(the fog horn got there first)'], 4500);
  await g.card(['Thanks for playing!', '', 'No CMS was harmed in the making of this game.', '(Several were deprecated.)'], 5000);
  g.set('rescued');
  await g.fx('fadeIn', 10);
  await g.toTitle();
}

async function blockedByRope(g: Game) {
  await g.sayAs('officer', 'Ah-ah! Customs first, sir. Anything AI-made gets declared.');
}

export const rosetta: RoomDef = {
  id: 'rosetta',
  name: 'The Paradise of Rosetta',
  paint,
  anim,
  bgKey: (g) => (g.flag('disclosed') ? '1' : '0'),
  scale: [104, 0.86, 143, 1],
  walk: (g) => {
    if (!g.flag('disclosed')) return [[[ROPE_X + 6, 108], [318, 106], [318, 143], [ROPE_X + 14, 143]]];
    return [[[2, 120], [20, 118], [90, 116], [140, 110], [318, 106], [318, 143], [2, 143]]];
  },
  start: [250, 130],
  startFace: 'left',
  npcs: [
    { id: 'officer', at: [196, 118], face: 'right' },
    { id: 'node', at: [126, 124], face: 'right' },
  ],
  enter: async (g) => {
    if (g.flag('rosettaIntro')) return;
    g.set('rosettaIntro');
    await g.say(['Sun! Sand! Palm trees! Not a single wisp of fog!', 'And a customs booth. Of course there is a customs booth.']);
    await g.sayAs('node', [
      'Welcome to the Paradise of Rosetta, Mac!',
      "I'll float ahead. Drops have diplomatic passports. You'll have to go through customs, I'm afraid.",
    ]);
    await g.say("Oh! On the flight my agent wrote me a postcard to send home. With all that context, it's actually good.");
    g.give('postcard');
    await g.sayAs('officer', ['Next!', 'Anything to declare? All AI-generated content must be declared at Rosetta customs.']);
  },
  hotspots: [
    {
      id: 'sea', name: 'sea', rect: [0, 56, 320, 38], noWalk: true,
      look: 'A turquoise sea under a blue sky. No fog. I keep checking. Still no fog.',
      use: "I'll swim later. I've earned a swim. I've earned several.",
    },
    {
      id: 'sun', name: 'sun', rect: [138, 6, 24, 24], noWalk: true,
      look: 'The sun! I remember the sun. It looks exactly like the documentation said.',
    },
    {
      id: 'stone', name: 'Rosetta Stone', rect: [24, 26, 56, 92], noWalk: true,
      look: async (g) => {
        g.set('sawStone');
        await g.say('A giant stone tablet. Three bands of writing, all saying the same thing:');
        await g.narrate([
          'TOP (for humans): "Geolocation. Tells you exactly where an island is."',
          'MIDDLE (for agents): { "name": "geolocation", "input": { "type": "object" }, "output": { "latitude": { "type": "string" }, "longitude": { "type": "string" } } }',
          'BOTTOM (for other systems): tools/list -> geolocation: "Returns the exact coordinates of this island."',
        ]);
        await g.say([
          'One capability, described once, three ways. Plain English for people, JSON Schema for AI agents, an MCP tool listing for other systems.',
          "Hey, that's MY geolocation tool! I'm on a monument!",
        ]);
      },
      push: "It's a monument. It has been understood by everyone for centuries. It's not moving for me.",
      pickup: "It's the size of a lighthouse lamp. Made of rock. My backpack has limits.",
      use: 'I run my finger along the JSON band. Perfectly valid. Not even a trailing comma.',
    },
    {
      id: 'booth', name: 'customs booth', rect: [140, 44, 58, 58], walkTo: [220, 128], face: 'left',
      look: 'A tidy customs booth with a blue roof and a ring of gold stars. A notice says: "PLEASE DECLARE ALL AI-GENERATED CONTENT."',
      open: (g) => g.sayAs('officer', 'Staff only, sir. The booth contains forty years of stamps and one very old sandwich.'),
    },
    {
      id: 'officer', name: 'Officer Fiftie', actor: 'officer', walkTo: [222, 124], face: 'left',
      look: 'Officer Fiftie of Rosetta Customs. Peaked cap, twelve-star badge, and a rubber stamp that has seen things.',
      talk: (g) => g.talk('officer'),
      useItem: { disclosure: (g) => declare(g) },
      giveItem: {
        postcard: (g) => g.flag('disclosed')
          ? g.sayAs('officer', 'Already cleared, sir. Post it whenever you like. The seagulls here deliver.')
          : g.sayAs('officer', 'Lovely postcard. Is it labelled? Use your AI Disclosure stamp on it first, then declare how it was made.'),
        disclosure: (g) => g.sayAs('officer', "Keep your stamp, sir. Use it on the postcard. I have my own. I have forty."),
      },
      anyItem: async (g) => { await g.sayAs('officer', 'Nothing to declare there. Customs only cares about AI-made content today.'); },
    },
    {
      id: 'rope', name: (g) => (g.flag('disclosed') ? 'open queue rope' : 'queue rope'), rect: [ROPE_X - 8, 88, 18, 54], walkTo: [ROPE_X + 16, 128], face: 'left',
      look: (g) => g.say(g.flag('disclosed') ? 'The red rope hangs open. Customs cleared. Paradise ahead.' : 'A red velvet queue rope. Beyond it: palm trees, a big stone, and paradise. On this side: me.'),
      open: (g) => (g.flag('disclosed') ? g.say("It's open.") : blockedByRope(g)),
      pull: (g) => (g.flag('disclosed') ? g.say("It's open.") : blockedByRope(g)),
      walk: (g) => (g.flag('disclosed') ? g.walkTo(180, 128) : blockedByRope(g)),
    },
    {
      id: 'airship', name: 'airship', rect: [242, 0, 58, 98], walkTo: [268, 120], face: 'back',
      look: 'Captain Node\'s airship, parked on the sand. A big teal balloon with a node on it. The gondola still smells of fog.',
      use: "I'm not leaving. I just got here. And there's no fog. I want to look at the no-fog a bit longer.",
      walk: "I'm not leaving. I just got here.",
    },
    {
      id: 'mat', name: 'welcome mat', rect: [218, 123, 56, 10],
      look: '"WELCOME". Finally, a welcome that doesn\'t ask me to accept cookies first.',
    },
    {
      id: 'palms', name: 'palm trees', rect: [80, 50, 40, 60], noWalk: true,
      look: 'Palm trees. Real ones. Not deprecated, not in maintenance mode. Just palms, doing palm things.',
      pickup: "Leave the palms alone, Mac. They're thriving. Let something thrive.",
    },
    {
      id: 'paradise', name: 'path into paradise', rect: [0, 112, 16, 32], walkTo: [8, 132],
      when: (g) => !!g.flag('disclosed'),
      look: 'The path into the Paradise of Rosetta. Everyone in there understands everyone. Imagine.',
      walk: (g) => finale(g),
    },
    {
      id: 'node', name: 'Captain Node', actor: 'node',
      look: 'Captain Node, hovering happily in the sunshine. She looks very at home here. She looks at home everywhere.',
      talk: async (g) => {
        if (!g.flag('disclosed')) {
          await g.sayAs('node', g.random([
            "Customs first, Mac! They're strict about labels here. Very friendly, very strict.",
            'I came through with my diplomatic passport. You came through with an AI agent. Declare it!',
            'Did you meet Nell at the crossroads? Core committer. When she reviews my patches, I frame the comments.',
          ]));
          return;
        }
        await finale(g);
      },
      giveItem: {
        postcard: (g) => g.sayAs('node', "For me? Oh, it's for your family. Labelled, too. Very proper."),
      },
    },
  ],
};
