import type { Painter } from '../../../engine/paint';
import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import { C, sky, sea, rock, signpost, barrel, bush, grassTufts, planks, windowPane, centeredText } from '../../art';
import { fogBands, stripedColumn, ladder, withClip } from '../../art3';

// A DOTT-style cutaway: rocky headland on the left, the lighthouse sliced open on the right.
const WALL_L = 176, WALL_R = 306, FLOOR_Y = 110;

function paint(p: Painter, g: Game) {
  sky(p, 320, 70, 'fog');
  p.gradV(0, 30, 176, 40, [C.fog, C.lavender, C.fog]);
  sea(p, 0, 58, 176, 30);
  p.rect(0, 58, 176, 30, [0, C.fog, '25']);
  // headland
  p.poly([[0, 86], [40, 80], [100, 84], [150, 88], [176, 92], [176, 144], [0, 144]], C.stoneshade);
  p.polyGradV([[0, 98], [60, 94], [120, 98], [176, 100], [176, 144], [0, 144]], [C.olive, C.darkgreen, C.darkgreen]);
  p.speckle(0, 98, 176, 46, C.green, 0.04, 21);
  grassTufts(p, 0, 100, 170, 40, 8, C.lime);
  // footpath from the map
  p.poly([[0, 116], [60, 114], [130, 118], [176, 122], [176, 134], [120, 136], [40, 140], [0, 138]], [C.tan, C.sandshade]);
  rock(p, 6, 100, 30, 12, 31, C.stone, C.stoneshade);
  rock(p, 120, 98, 22, 8, 32, C.stone, C.stoneshade);
  bush(p, 150, 104, 0.9);

  // ---- the lighthouse, sliced open ----
  // the tower continues up out of frame: outer walls in brand stripes
  stripedColumn(p, WALL_L - 10, WALL_L, 0, 128, 12, C.white, C.brandpink);
  p.rect(WALL_R, 0, 320 - WALL_R, 144, C.stoneshade);
  stripedColumn(p, WALL_R, 320, 0, 128, 12, C.white, C.brandpink);
  p.vline(WALL_L - 10, 0, 127, C.ink); p.vline(WALL_R, 0, 127, C.ink);
  // curved inner back wall (shaded like a cylinder)
  p.gradH(WALL_L, 0, (WALL_R - WALL_L) / 2, FLOOR_Y, [C.stoneshade, C.stone]);
  p.gradH(WALL_L + (WALL_R - WALL_L) / 2, 0, (WALL_R - WALL_L) / 2, FLOOR_Y, [C.stone, C.stoneshade]);
  for (let y = 14; y < FLOOR_Y; y += 8) {
    const sag = 2;
    p.line(WALL_L, y, (WALL_L + WALL_R) / 2, y + sag, C.stoneshade);
    p.line((WALL_L + WALL_R) / 2, y + sag, WALL_R, y, C.stoneshade);
    for (let x = WALL_L + ((y / 8) % 2) * 9; x < WALL_R; x += 18) p.vline(x, y + 1, y + 7, C.stoneshade);
  }
  // ceiling beams + hatch
  planks(p, WALL_L, 0, WALL_R - WALL_L, 12, false, C.wood, C.woodlight, 7);
  p.hline(WALL_L, WALL_R - 1, 12, C.darkbrown);
  if (g.flag('hatchOpen')) {
    p.rect(234, 1, 32, 11, C.glow);
    p.rect(236, 3, 28, 9, [C.glow, C.yellow]);
  } else {
    p.rect(234, 1, 32, 11, C.darkbrown);
    p.frame(234, 1, 32, 11, C.ink);
    p.rect(236, 3, 28, 7, C.wood);
    p.circle(262, 7, 1, C.gold);
  }
  // floor (wooden planks in perspective)
  p.poly([[WALL_L, FLOOR_Y], [WALL_R, FLOOR_Y], [WALL_R, 144], [WALL_L, 144]], C.woodlight);
  for (let i = 0; i < 9; i++) {
    const x = WALL_L + 6 + i * 15;
    p.line(x, FLOOR_Y, x + (x - 241) * 0.35, 143, C.wood);
  }
  p.hline(WALL_L, WALL_R - 1, FLOOR_Y, C.darkbrown);
  // round rug
  p.ellipse(236, 128, 34, 7, C.brandblue);
  p.ellipse(236, 128, 28, 5, C.navy);
  p.ellipse(236, 128, 14, 2, C.brandbluelight);

  // the deprecated spiral stairs (broken off half way)
  for (let i = 0; i < 9; i++) {
    const y = FLOOR_Y - 6 - i * 9;
    const x = 286 - Math.sin(i * 0.9) * 10;
    if (i === 4 || i === 6) continue; // missing steps
    p.poly([[x - 10, y], [x + 8, y - 2], [x + 10, y + 2], [x - 8, y + 4]], C.wood);
    p.hline(x - 8, x + 8, y + 3, C.darkbrown);
  }
  p.vline(290, 14, FLOOR_Y, C.darkgray);
  p.vline(291, 14, FLOOR_Y, C.gray);
  // pile of fallen steps + DEPRECATED sign
  p.poly([[270, 128], [296, 126], [302, 134], [268, 136]], C.wood);
  p.line(272, 129, 298, 131, C.darkbrown);
  p.line(262, 58, 274, 50, C.darkgray); p.line(288, 58, 276, 50, C.darkgray);
  p.rect(243, 58, 62, 13, C.yellow);
  p.frame(243, 58, 62, 13, C.ink);
  centeredText(p, 'DEPRECATED', 274, 61, C.ink);

  // stove with kettle
  p.rect(186, 84, 18, 26, C.darkgray);
  p.rect(188, 90, 14, 8, C.black);
  p.rect(190, 92, 10, 4, C.orange);
  p.vline(193, 20, 84, C.darkgray);
  p.ellipse(195, 82, 6, 4, C.brandpink);
  p.rect(200, 79, 4, 2, C.brandpink);
  // Kristen's Context Control Center: a filing cabinet against the wall, behind the table
  contextCabinet(p, g);
  // table with the logbook and a pink mug
  p.rect(218, 98, 30, 3, C.wood);
  p.vline(221, 101, 116, C.darkbrown); p.vline(245, 101, 116, C.darkbrown);
  p.rect(224, 93, 12, 5, C.navy); p.hline(225, 234, 94, C.white);
  p.rect(239, 92, 5, 6, C.mug); p.px(244, 94, C.mug);
  // porthole window on the back wall (fog outside)
  windowPane(p, 222, 34, 18, 18, C.fog, C.gold);
  // barometer
  p.circle(206, 50, 7, C.gold);
  p.circle(206, 50, 5, C.white);
  p.line(206, 50, 203, 46, C.red);
  p.px(206, 50, C.ink);
  // portrait of Kristen, who founded the Context Control Center: long red hair
  p.rect(246, 30, 18, 24, C.gold);
  p.rect(248, 32, 14, 20, C.navy);
  p.ellipse(255, 40, 6, 6, C.darkred);          // hair falling behind
  p.rect(249, 40, 13, 8, C.darkred);
  p.rect(251, 44, 8, 8, C.brandblue);           // top
  p.circle(255, 40, 4, C.skin);
  p.ellipse(255, 36, 5, 2, C.red);              // fringe
  p.rect(250, 37, 2, 9, C.red); p.rect(259, 37, 2, 9, C.red);
  p.px(254, 40, C.ink); p.px(256, 40, C.ink); p.hline(254, 256, 42, C.pink);
  // spare context windows rack (empty)
  p.rect(186, 62, 26, 2, C.wood);
  p.rect(186, 56, 26, 1, C.wood);

  // the door in the left wall
  if (g.flag('lhDoorOpen')) {
    p.poly([[WALL_L - 10, 80], [WALL_L + 4, 80], [WALL_L + 4, 124], [WALL_L - 10, 124]], C.darkbrown);
    p.poly([[WALL_L - 10, 80], [WALL_L - 22, 84], [WALL_L - 22, 126], [WALL_L - 10, 124]], C.wood);
    p.vline(WALL_L - 16, 86, 122, C.darkbrown);
  } else {
    p.poly([[WALL_L - 10, 80], [WALL_L + 4, 80], [WALL_L + 4, 124], [WALL_L - 10, 124]], C.wood);
    p.vline(WALL_L - 4, 81, 123, C.darkbrown);
    p.vline(WALL_L + 1, 81, 123, C.darkbrown);
    p.circle(WALL_L - 7, 104, 1, C.gold);
    // "Site Builders only" plaque
    p.rect(WALL_L - 9, 88, 12, 6, C.brandpink);
    p.hline(WALL_L - 7, WALL_L + 1, 90, C.white);
    p.hline(WALL_L - 7, WALL_L - 1, 92, C.white);
  }
  p.rect(WALL_L - 10, 124, 20, 4, C.stoneshade);

  // outside props: lifebuoy, oil barrel, sign, swept fog pile, mailbox
  p.circle(WALL_L - 22, 46, 6, C.white);
  p.circle(WALL_L - 22, 46, 3, C.stoneshade);
  for (const a of [0, 1, 2, 3]) {
    const ang = (a / 4) * Math.PI * 2 + 0.4;
    p.rect(WALL_L - 23 + Math.round(Math.cos(ang) * 5), 45 + Math.round(Math.sin(ang) * 5), 2, 2, C.red);
  }
  barrel(p, 112, 108, 12, 16, C.darkred);
  signpost(p, 18, 64, 72, ['The Lighthouse', 'at the End of', 'the Context'], 16);
  // the swept-up heap of fog
  p.ellipse(86, 126, 14, 6, C.fog);
  p.ellipse(82, 122, 8, 5, C.white);
  p.ellipse(91, 123, 6, 4, C.fog);
  // mailbox
  p.rect(104, 88, 3, 16, C.darkgray);
  p.rect(98, 82, 14, 8, C.brandblue);
  p.ellipse(105, 82, 7, 2, C.brandblue);
  p.rect(111, 80, 1, 5, C.red);
}

const CAB: [number, number, number, number] = [213, 63, 25, 47];

function contextCabinet(p: Painter, g: Game) {
  const [x, y, w, h] = CAB;
  p.rect(x, y, w, h, C.brandslate);
  p.rect(x + w - 3, y, 3, h, C.darkgray);
  p.rect(x - 1, y - 3, w + 2, 4, C.brandink);
  // brass label plate on top: "CONTEXT"
  p.rect(x + 3, y - 8, w - 6, 5, C.gold);
  p.hline(x + 5, x + w - 6, y - 6, C.brandink);
  
  // four drawers: WHO, WHERE, WORDS, TONE. Lit green tabs once the context is approved.
  const ready = !!g.flag('contextReady');
  for (let i = 0; i < 4; i++) {
    const dy = y + 3 + i * 9;
    p.rect(x + 2, dy, w - 6, 7, C.gray);
    p.frame(x + 2, dy, w - 6, 7, C.darkgray);
    p.rect(x + 6, dy + 2, 8, 3, C.brandpaper);
    p.rect(x + 16, dy + 3, 3, 1, C.gold);
    p.px(x + w - 6, dy + 1, ready ? C.lime : C.brandpink);
  }
}

function anim(p: Painter, g: Game, t: number) {
  // fog rolling across the sea and the headland
  withClip(p, 94, 50, WALL_L - 104, 40, () => fogBands(p, t, WALL_L, 58, 84, 0.4));
  withClip(p, 0, 50, 18, 40, () => fogBands(p, t + 900, WALL_L, 58, 84, 0.4));
  // stove flicker
  if (Math.floor(t / 150) % 3) p.rect(191, 93, 8, 2, C.yellow);
  // steam from the kettle
  const s = Math.floor(t / 250) % 4;
  p.px(204 + s, 76 - s * 2, C.white);
  p.px(203 + s, 72 - s * 2, C.foam);
  // light leaking down through the open hatch
  if (g.flag('hatchOpen')) {
    for (let y = 13; y < FLOOR_Y; y += 3) {
      const w = 14 + (y - 13) * 0.25;
      p.hline(250 - w, 250 + w, y, [0, C.glow, '25']);
    }
  }
}

function front(p: Painter, g: Game) {
  if (g.flag('hatchOpen')) ladder(p, 250, 136, 250, 8);
}

export const lighthouseDialogues: Dialogue[] = [
  {
    id: 'modelia',
    with: 'modelia',
    start: async (g) => {
      if (!g.flag('metModelia')) {
        g.set('metModelia');
        await g.sayAs('modelia', [
          'Oh! A visitor. Mind the fog, dear, I just swept it.',
          "I'm Modelia Contexta. I keep the lighthouse. And everybody's context, if they let me.",
        ]);
      } else {
        await g.sayAs('modelia', g.random(['Back again, dear?', 'Still here? The fog is too.', 'Have a cup of tea. Or a question.']));
      }
    },
    options: [
      {
        id: 'place', text: 'What is this place?', once: true,
        run: (g) => g.sayAs('modelia', [
          'The Lighthouse at the End of the Context.',
          "Its lamp is the only thing on this island that can reach past the fog - out to servers far, far away.",
        ]),
      },
      {
        id: 'sweep', text: 'Why are you sweeping fog?', once: true,
        run: async (g) => {
          await g.sayAs('modelia', [
            "It's the Fog of Technical Debt, dear. Every shortcut anyone ever took on this island, evaporated.",
            'I sweep it into a heap every morning. It comes back every night. Like technical debt.',
          ]);
          await g.say("That's... actually the most realistic job description I've heard all week.");
        },
      },
      {
        id: 'client', text: "What's an MCP Client?",
        run: async (g) => {
          await g.sayAs('modelia', [
            'MCP: the Model Context Protocol. A standard plug that lets an AI use tools and data on other servers.',
            "Think of it like USB, but for AI. Any gadget that speaks USB plugs into any computer. Same idea.",
            'My lamp is an MCP CLIENT. It connects to MCP servers, over the web (HTTP) or to programs on the same machine (STDIO).',
            "It keeps each server's API key safely in the Key module, and hands the servers' tools to your AI agents.",
          ]);
          g.set('knowsClient');
        },
      },
      {
        id: 'server', text: 'And an MCP Server?', when: (g) => !!g.flag('knowsClient'),
        run: (g) => g.sayAs('modelia', [
          'The other end of the beam. A server OFFERS tools: "get the weather", "order a pizza", "send a Slack message".',
          'A client asks a server what tools it has, then calls them. Your Drupal site can be either.',
          "Drupal's MCP Server offers your Tool API tools to AI clients outside your site. Permissions decide who may call them.",
          'Or be both, if you are feeling greedy.',
        ]),
      },
      {
        id: 'in', text: 'Can I go inside?',
        run: async (g) => {
          if (g.atLeast('sitebuilder')) {
            await g.sayAs('modelia', ["You're a Site Builder? Then of course, dear. Lighthouse configuration is your department now."]);
            if (!g.flag('lhDoorOpen')) await openDoor(g);
          } else if (g.atLeast('editor')) {
            await g.sayAs('modelia', [
              'Ooh, an Editor. Lovely. You can write the captions for my postcards.',
              'But the lamp is configuration, dear. Configuration is for Site Builders. Insurance reasons.',
            ]);
          } else {
            await g.sayAs('modelia', ['Inside? Dear, I don\'t even know who you are. Log in first. Then grow up a bit.']);
          }
        },
      },
      {
        id: 'stairs', text: 'How do you get up to the lamp?', when: (g) => !!g.flag('lhDoorOpen') && !g.flag('hatchOpen'),
        run: (g) => g.sayAs('modelia', [
          'Oh, the stairs were deprecated years ago. "Will be removed in the next major version."',
          'They were. Mostly. I use a ladder. Well, I DID use a ladder, until I lent it to the sign painter in town.',
        ]),
      },
      {
        id: 'window', text: 'Do you have a spare window for the lamp?', when: (g) => !!g.flag('sawBrokenPane') && !g.flag('windowFixed'),
        run: (g) => g.sayAs('modelia', [
          'The spare context windows are on the rack. All zero of them.',
          'The temple of the Providers has a gorgeous stained-glass window, though. Very... large context.',
        ]),
      },
      {
        id: 'context', text: 'My AI agent writes nonsense. "Captain Noodle"!', when: (g) => !!g.flag('needContext') && !g.flag('contextReady'),
        run: async (g) => {
          g.set('knowsCCC');
          await g.sayAs('modelia', [
            'Of course it does, dear. An agent without context is a very fast intern on their first day.',
            "It doesn't know who you are, where you are, or what anything is called. So it guesses. Confidently.",
            "That's what Kristen's Context Control Center is for. The filing cabinet, by the wall.",
            'You write context items: who you are, where you are, what things are called, how you like to sound.',
            "Each item is content, like an article: you draft it, I approve it, and it keeps its revisions. You can even schedule them.",
            'Then you subscribe your agent to the items it needs. It gets exactly that context. No more, no less.',
          ]);
        },
      },
      {
        id: 'ccc', text: 'How did the context thing work again?', when: (g) => !!g.flag('knowsCCC') && !g.flag('contextReady'),
        run: (g) => g.sayAs('modelia', [
          'Draft your context items in the cabinet. Only what helps the job, dear. Then I approve them.',
          'Then subscribe your agent. Some items you can mark "always include". Some "never include". Choose wisely.',
        ]),
      },
      { id: 'bye', text: 'I should get going.', end: true, run: (g) => g.sayAs('modelia', 'Mind the fog, dear.') },
    ],
  },
];

// ---- Kristen's Context Control Center: draft, approve, subscribe ---------------------------------------
const CONTEXT_ITEMS = [
  { id: 'who', text: 'Who I am: "Mac Packwala, stranded site builder."', good: true },
  { id: 'where', text: 'Where I am: "Legacy Island. Foggy. Not on any map."', good: true },
  { id: 'glossary', text: 'Glossary: "It\'s CAPTAIN NODE. Not Captain Noodle."', good: true },
  { id: 'tone', text: 'Tone of voice: "Short and clear. No synergy."', good: true },
  { id: 'manual', text: 'Always include: the entire 400-page legacy manual', good: false },
  { id: 'pizza', text: 'My favourite pizza toppings', good: false },
];

const MISSING: Record<string, string> = {
  who: "my agent still doesn't know who it's writing for",
  where: "nobody will know WHICH island. There are 400",
  glossary: "it'll call her Captain Noodle again",
  tone: "it'll still say \"leverage synergies\"",
};

async function buildContext(g: Game) {
  if (g.flag('contextReady')) return g.say('My context is drafted, approved and subscribed. The cabinet hums contentedly.');
  if (!g.flag('needContext')) {
    return g.say(["Kristen's Context Control Center. Drawers of context, waiting for someone to fill them.", "My AI agent hasn't needed any context yet. Famous last words."]);
  }
  await g.say("Right. Context items for my agent. I'll draft them, Modelia approves them.");
  const drafted = new Set<string>();
  for (;;) {
    const opts = CONTEXT_ITEMS.filter((o) => !drafted.has(o.id)).map((o) => ({ id: o.id, text: o.text }));
    opts.push({ id: 'done', text: 'Send my drafts to Modelia for approval.' }, { id: 'later', text: 'Close the drawer for now.' });
    const pick = await g.choose(opts);
    if (pick === 'later') return g.say("I'll come back to it. The fog isn't going anywhere. That's the problem.");
    if (pick === 'manual') {
      await g.say('I stuff all 400 pages of the legacy manual into the WHERE drawer.');
      g.shake();
      await g.narrate('The drawer won\'t close. The cabinet rattles. Upstairs, the context window creaks ominously.');
      await g.sayAs('modelia', [
        "Dear! The context window is big, not bottomless. Stuff everything in and the important bits drown.",
        "That manual goes on the NEVER-include list.",
      ]);
      continue;
    }
    if (pick !== 'done') {
      drafted.add(pick);
      await g.say(pick === 'pizza' ? 'Draft saved: "Pineapple. Fight me."' : 'Draft saved.');
      continue;
    }
    const missing = CONTEXT_ITEMS.filter((o) => o.good && !drafted.has(o.id));
    if (missing.length) {
      const label = missing[0].text.split(':')[0];
      await g.say([`Wait. Without a "${label}" item, ${MISSING[missing[0].id]}.`, 'I need more drafts first.']);
      continue;
    }
    break;
  }
  // approval: context items are content, so they go through moderation
  await g.sayAs('modelia', "Drafts for review? Let's see, dear.");
  await g.narrate([
    '> Who I am: draft -> approved.',
    '> Where I am: draft -> approved.',
    '> Glossary: draft -> approved.',
    '> Tone of voice: draft -> approved.',
  ]);
  if (drafted.has('pizza')) {
    await g.narrate('> My favourite pizza toppings: draft -> REJECTED.');
    await g.sayAs('modelia', 'Pineapple? Rejected, dear. Context should help the job. Your job is getting rescued, not lunch.');
  }
  await g.say('Approved. Context items work like any content: drafts, approvals, revisions.');
  for (;;) {
    const pick = await g.choose([
      { id: 'agent', text: 'Subscribe my AI agent to these items.' },
      { id: 'everyone', text: 'Subscribe every agent on the island to everything.' },
    ]);
    if (pick === 'everyone') {
      await g.sayAs('modelia', [
        'Then the pizza robot learns your life story, and the weather station starts signing off "short and clear".',
        'Scope, dear. Each agent subscribes to the context it needs.',
      ]);
      continue;
    }
    break;
  }
  g.set('contextReady');
  g.refresh();
  await g.narrate('> Kristen\'s Context Control Center: 4 items subscribed to "Mac\'s agent".');
  await g.say(['Done. Now my agent knows who I am, where I am, what things are called, and how to sound like a person.', 'Back up to the lamp. Second attempt at a first impression.']);
}

async function openDoor(g: Game) {
  g.set('lhDoorOpen');
  await g.say(['The door creaks open.', 'A plaque on it says "SITE BUILDERS ONLY". For once, that\'s me.']);
}

export const lighthouse: RoomDef = {
  id: 'lighthouse',
  name: 'The Lighthouse',
  paint,
  anim,
  front,
  bgKey: (g) => ['lhDoorOpen', 'hatchOpen', 'contextReady'].map((k) => (g.flag(k) ? 1 : 0)).join(''),
  scale: [100, 0.82, 143, 1],
  walk: (g) => {
    const outside: [number, number][] = [[0, 114], [60, 112], [120, 114], [150, 112], [170, 116], [170, 143], [0, 143]];
    if (!g.flag('lhDoorOpen')) return [outside];
    return [
      outside,
      [[160, 116], [190, 116], [190, 132], [160, 132]],
      [[184, 116], [300, 116], [300, 143], [184, 143]],
    ];
  },
  start: [24, 128],
  startFace: 'right',
  npcs: [{ id: 'modelia', at: [140, 122], face: 'left' }],
  enter: async (g, from) => {
    if (from === 'lamproom') return;
    if (!g.flag('lhIntro')) {
      g.set('lhIntro');
      await g.say(['A lighthouse! Striped in pink and white, like a very determined candy cane.', 'And somebody is out here sweeping... fog?']);
    }
  },
  hotspots: [
    {
      id: 'sea', name: 'foggy sea', rect: [0, 56, 172, 30], noWalk: true,
      look: 'Grey sea, grey fog, grey sky. Somewhere out there are servers. And pizza. And people with automatic updates.',
    },
    {
      id: 'mappath', name: 'path back inland', rect: [0, 100, 18, 44], walkTo: [6, 128],
      exit: { to: 'map' },
      look: 'The path back to the rest of the island.',
    },
    {
      id: 'tower', name: 'lighthouse', rect: [WALL_L - 10, 0, 10, 78], walkTo: [150, 128], face: 'right',
      look: [
        'A lighthouse in pink and white stripes. The tower disappears up into the fog.',
        'Somewhere up there is the lamp. The only thing on this island that can talk past the fog.',
      ],
      push: "It's a lighthouse. It's not moving. That's sort of its whole thing.",
    },
    {
      id: 'door', name: (g) => (g.flag('lhDoorOpen') ? 'open door' : 'lighthouse door'), rect: [WALL_L - 22, 80, 28, 46],
      walkTo: [160, 126], face: 'right',
      look: (g) => g.say(g.flag('lhDoorOpen')
        ? 'The lighthouse door, open. Inside: cosy, round, and slightly deprecated.'
        : 'A sturdy door with a pink plaque: "SITE BUILDERS ONLY. Editors: please write a nice caption instead."'),
      open: async (g) => {
        if (g.flag('lhDoorOpen')) return g.say("It's already open.");
        if (g.atLeast('sitebuilder')) return openDoor(g);
        if (g.atLeast('editor')) {
          await g.say('I give the handle a good Editor-level tug...');
          await g.sayAs('modelia', 'Ah-ah, dear! Configuration is for Site Builders. You may edit the doormat, if you like.');
          await g.say('"Editors edit. Builders build." Even the doors here know the permission system.');
          return;
        }
        await g.say('Locked. And the plaque says "SITE BUILDERS ONLY". I\'m not even close.');
      },
      close: "Modelia likes it open now. \"Let the context in,\" she says.",
      walk: async (g) => {
        if (!g.flag('lhDoorOpen')) return g.say("The door is closed. Doors usually need opening first. That's the whole door API.");
        await g.walkTo(232, 128);
      },
    },
    {
      id: 'modelia', name: 'Modelia Contexta', actor: 'modelia',
      look: 'The lighthouse keeper. Yellow sou\'wester, sensible knitwear, and a broom she uses to sweep fog into neat little heaps.',
      talk: (g) => g.talk('modelia'),
      giveItem: {
        crackers: (g) => g.sayAs('modelia', "No thank you, dear. Crackers are for parrots. There's one out on the reef."),
        window: (g) => g.sayAs('modelia', "Lovely glass! It goes in the lamp, dear, not in my hands. Upstairs."),
        ladder: (g) => g.sayAs('modelia', 'Ah, my old ladder! Keep it. Put it to the hatch - I\'m too old for climbing and too young for elevators.'),
      },
    },
    {
      id: 'fogpile', name: 'heap of swept fog', rect: [72, 116, 28, 14],
      look: 'A neat heap of fog. Swept, compacted, and ignored. Like technical debt in a backlog.',
      pickup: 'I try to pick up the fog. My hands go right through it. Just like trying to estimate technical debt.',
      push: 'I push the fog. It moves, sulks, and drifts right back.',
    },
    {
      id: 'mailbox', name: 'mailbox', rect: [96, 78, 18, 26], walkTo: [104, 116], face: 'back',
      look: 'A mailbox, painted brand blue. It\'s labelled "Letters to the Keeper - response time: next tide".',
      open: "Inside: one postcard, \"Wish you were here\" - from the lighthouse. Addressed to the lighthouse.",
      use: "I don't have anything to post. And the postman can't find the island anyway.",
    },
    {
      id: 'sign', name: 'sign', rect: [18, 62, 74, 48], walkTo: [54, 118], face: 'back',
      look: '"The Lighthouse at the End of the Context." Poetic. Also slightly ominous.',
    },
    {
      id: 'barrel', name: 'barrel of lamp oil', rect: [110, 106, 16, 20], walkTo: [118, 130], face: 'back',
      look: '"LAMP OIL - DEPRECATED. The lamp now runs on protocol." What does protocol smell like? Hopefully not oil.',
      open: "I'd rather not. It's been deprecated, not emptied.",
      pickup: "It's full and heavy. I'll leave it for the next major version.",
    },
    {
      id: 'lifebuoy', name: 'lifebuoy', rect: [WALL_L - 30, 38, 16, 16], walkTo: [150, 120], face: 'right',
      look: 'A lifebuoy. In case of emergency, throw it at the problem. Works about as well as most emergency fixes.',
      pickup: "It's bolted to the wall. Safety first, apparently. Or at least safety bolted.",
    },
    // ---- inside ----
    {
      id: 'hatch', name: (g) => (g.flag('hatchOpen') ? 'hatch to the lamp room' : 'hatch in the ceiling'),
      rect: [232, 0, 36, 14], walkTo: [250, 132], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: (g) => g.say(g.flag('hatchOpen')
        ? 'The hatch is open. Light pours down from the lamp room.'
        : 'A hatch in the ceiling, leading up to the lamp room. Way out of reach.'),
      open: (g) => g.say(g.flag('hatchOpen') ? "It's open." : "I can't reach it. And the stairs that used to reach it are deprecated."),
      use: async (g) => {
        if (!g.flag('hatchOpen')) return g.say("I can't reach it. I need something to climb.");
        await climbUp(g);
      },
      walk: async (g) => {
        if (!g.flag('hatchOpen')) return g.say("I can't reach it. I need something to climb.");
        await climbUp(g);
      },
      useItem: {
        ladder: async (g) => {
          g.take('ladder');
          g.set('hatchOpen');
          await g.say(['I lean the ladder against the hatch and push it open.', 'Ladder: the original, non-deprecated staircase.']);
        },
      },
    },
    {
      id: 'ladderUp', name: 'ladder', rect: [240, 14, 22, 120], walkTo: [250, 132], face: 'back',
      when: (g) => !!g.flag('hatchOpen'),
      look: "The sign painter's ladder, now doing honest work.",
      use: (g) => climbUp(g),
      walk: (g) => climbUp(g),
      pickup: "I'll leave it here. I don't want to be stuck in the lamp room. That would be a very bright prison.",
    },
    {
      id: 'stairs', name: 'deprecated spiral stairs', rect: [268, 14, 34, 44], walkTo: [282, 134], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: [
        'A spiral staircase with a big yellow sign: DEPRECATED.',
        '"Will be removed in the next major version." Judging by the missing steps, the next major version has started.',
      ],
      use: 'I put my foot on step three. Step three returns a 404.',
      walk: 'I put my foot on step three. Step three returns a 404.',
      pull: "I'm not pulling on a deprecated staircase. That's how you end up maintaining it.",
    },
    {
      id: 'fallen', name: 'pile of fallen steps', rect: [266, 124, 38, 14], walkTo: [284, 120],
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'The steps that were removed in the last major version. Someone labelled them "backwards compatibility layer".',
      pickup: 'They are heavy, splintery, and deprecated. Three strikes.',
    },
    {
      id: 'depsign', name: 'DEPRECATED sign', rect: [243, 58, 62, 13], walkTo: [274, 128], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: '"DEPRECATED. Will be removed in the next major version. Please migrate to: Ladder 1.0."',
      pickup: "It's the only thing holding the stairs together. Emotionally.",
    },
    {
      id: 'stove', name: 'stove', rect: [184, 76, 22, 34], walkTo: [196, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'A cast-iron stove with a pink kettle steaming away. The kettle whistles in perfect sync with the foghorn.',
      use: "I'd make tea, but I'm on a deadline. I'm always on a deadline.",
      pickup: "Hot. Very hot. Burnt-fingers-hot.",
    },
    {
      id: 'logbook', name: "keeper's logbook", rect: [222, 90, 16, 8], walkTo: [230, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: '"Day 5,113: Fog. Swept fog. Fog returned. Lamp still dark. A stranger in a backpack walked in. Fog."',
      pickup: "It's Modelia's log. Reading it was already rude enough.",
      open: 'The last page has a doodle of a round teal airship and the words "if only someone had coordinates".',
    },
    {
      id: 'mug', name: 'pink mug', rect: [238, 90, 8, 8], walkTo: [240, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'A hot pink mug. It says "World\'s Okayest Keeper".',
      pickup: "It's still warm. And it's not mine. Two good reasons.",
    },
    {
      id: 'porthole', name: 'porthole', rect: [220, 32, 22, 22], walkTo: [230, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'Through the porthole: fog. If I squint: more fog. If I really squint: a seagull, also lost.',
      open: 'It\'s painted shut. Probably to keep the fog out. It is not working.',
    },
    {
      id: 'barometer', name: 'barometer', rect: [198, 42, 16, 16], walkTo: [208, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'The barometer has three settings: FOG, MORE FOG, and "DEPRECATED". The needle points at FOG.',
      push: 'I tap the glass. The needle wobbles to MORE FOG. I tap it back. Better not to know.',
    },
    {
      id: 'portrait', name: 'portrait of Kristen', rect: [244, 28, 22, 28], walkTo: [255, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: ['A portrait. The brass plate says: "Kristen. Founder, Context Control Center."', 'Red hair, a kind smile, and the calm of someone who knows exactly what every agent on this island is allowed to know.'],
    },
    {
      id: 'cabinet', name: "Kristen's Context Control Center", rect: [213, 55, 25, 35], walkTo: [226, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: (g) => g.say(g.flag('contextReady')
        ? ["Kristen's Context Control Center. Four drawers, four approved context items, all subscribed to my agent.", 'Who I am. Where I am. How to spell Captain Node. How to sound like a person.']
        : ['A filing cabinet with a brass plate: "CONTEXT CONTROL CENTER". Drawers: WHO, WHERE, WORDS, TONE.', 'Modelia keeps everybody\'s context in here. If they let her.']),
      open: (g) => buildContext(g),
      use: (g) => buildContext(g),
      pickup: "It's a filing cabinet full of context. Heavier than it looks. Context always is.",
    },
    {
      id: 'rack', name: 'rack of spare context windows', rect: [184, 52, 30, 14], walkTo: [198, 124], face: 'back',
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'A rack labelled "SPARE CONTEXT WINDOWS". It holds exactly zero of them. Someone used them all up.',
    },
    {
      id: 'rug', name: 'rug', rect: [202, 122, 68, 12],
      when: (g) => !!g.flag('lhDoorOpen'),
      look: 'A round blue rug. It really ties the lighthouse together.',
      pull: 'I lift the rug. Underneath: dust, a lost button, and a sticky note saying "TODO: fix stairs". From 2009.',
    },
  ],
};

async function climbUp(g: Game) {
  await g.say('Up I go!');
  await g.goto('lamproom', [76, 132], 'right');
}
