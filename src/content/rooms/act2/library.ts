import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, windowPane, door, planks, textOn, centeredText } from '../../art';
import { bookshelf, plaque } from '../../art2';
import { providerRefuses } from '../../items/act2';

// ------------------------------------------------------------------ the FlowDrop board
const BOARD = { x: 120, y: 6, w: 56, h: 50 };
/** Card slots on the board, in flow order (a zigzag down the cork). */
const SLOTS: [number, number][] = [[124, 17], [151, 23], [124, 30], [151, 37], [124, 44]];
/** Node card colours, in the order of the correct flow: trigger, shelf, summary, review, index. */
const CARD_COLORS = [C.brandpink, C.orange, C.brandblue, C.green, C.purple];

function nodeCard(p: Painter, x: number, y: number, i: number) {
  p.rect(x + 1, y + 1, 21, 9, C.darkbrown);
  p.rect(x, y, 21, 9, C.brandpaper);
  p.rect(x, y, 21, 2, CARD_COLORS[i]);
  p.frame(x, y, 21, 9, C.brandink);
  // tiny glyphs: bottle, shelf, text lines, thumbs up, magnifier
  const gx = x + 3, gy = y + 3;
  if (i === 0) { p.rect(gx, gy + 1, 5, 3, C.green); p.rect(gx + 5, gy + 2, 2, 1, C.green); p.px(gx + 1, gy + 2, C.white); }
  if (i === 1) { p.hline(gx, gx + 6, gy + 4, C.wood); p.rect(gx + 1, gy, 1, 4, C.red); p.rect(gx + 3, gy + 1, 1, 3, C.navy); p.rect(gx + 5, gy, 1, 4, C.gold); }
  if (i === 2) { p.hline(gx, gx + 6, gy, C.gray); p.hline(gx, gx + 4, gy + 2, C.gray); p.hline(gx, gx + 5, gy + 4, C.gray); }
  if (i === 3) { p.circle(gx + 2, gy + 1, 1, C.tan); p.rect(gx + 1, gy + 3, 3, 2, C.purple); p.line(gx + 5, gy + 3, gx + 6, gy + 4, C.green); p.line(gx + 6, gy + 4, gx + 8, gy + 1, C.green); }
  if (i === 4) { p.circle(gx + 2, gy + 2, 2, C.brandblue); p.px(gx + 2, gy + 2, C.brandpaper); p.line(gx + 4, gy + 4, gx + 6, gy + 5, C.brandblue); }
  for (let k = 0; k < 2; k++) p.hline(x + 12, x + 18 - k * 2, y + 4 + k * 2, C.brandslate);
  p.px(x + 10, y, C.red); // the pin
}

function flowBoard(p: Painter, g: Game) {
  const { x, y, w, h } = BOARD;
  p.rect(x - 1, y - 1, w + 2, h + 2, C.darkbrown);
  p.rect(x, y, w, h, C.tan);
  p.speckle(x, y, w, h, C.sandshade, 0.12, 9);
  p.frame(x, y, w, h, C.wood);
  p.rect(x + 2, y + 2, w - 4, 9, C.brandink);
  centeredText(p, 'FLOWDROP', x + w / 2, y + 2, C.white);
  if (g.flag('flowBuilt')) {
    // the finished flow, strung together in order
    for (let i = 0; i < SLOTS.length - 1; i++) {
      const [ax, ay] = SLOTS[i], [bx, by] = SLOTS[i + 1];
      const right = ax < bx;
      p.line(right ? ax + 21 : ax, ay + 5, right ? bx : bx + 21, by + 5, C.red);
    }
    SLOTS.forEach(([sx, sy], i) => nodeCard(p, sx, sy, i));
  } else if (g.flag('searchReady')) {
    // the Librarian's loose cards, pinned anywhere, nothing connected
    const loose: [number, number][] = [[126, 40], [146, 16], [131, 25], [152, 44], [150, 29]];
    loose.forEach(([sx, sy], i) => nodeCard(p, sx, sy, i));
    p.line(170, 22, 173, 46, C.red); // a dangling string
  } else {
    // empty cork: a lonely sticky note
    p.rect(138, 26, 18, 14, C.yellow);
    p.hline(140, 152, 30, C.gray); p.hline(140, 149, 33, C.gray);
    p.px(147, 26, C.red);
  }
}

function paint(p: Painter, g: Game) {
  // wood-panelled walls
  p.gradV(0, 0, 320, 100, [C.darkbrown, C.brown]);
  for (let x = 0; x < 320; x += 16) p.vline(x, 0, 99, C.darkbrown);
  // towering shelves
  bookshelf(p, 4, 6, 70, 92, 3);
  bookshelf(p, 236, 6, 80, 92, 7);
  flowBoard(p, g);
  // the rolling ladder on its rail
  p.hline(4, 74, 8, C.gold);
  p.line(56, 9, 68, 98, C.woodlight);
  p.line(62, 9, 74, 98, C.woodlight);
  for (let y = 16; y < 98; y += 8) p.line(56 + (y - 9) * 12 / 89, y, 62 + (y - 9) * 12 / 89, y, C.woodlight);
  p.circle(69, 98, 2, C.darkgray); p.circle(75, 98, 2, C.darkgray);
  // window with a moonlit sea
  windowPane(p, 88, 14, 26, 30, C.navy, C.woodlight);
  p.px(96, 20, C.glow); p.px(105, 30, C.white);
  // door back out
  door(p, 182, 34, 26, 64, C.wood);
  p.rect(203, 66, 2, 3, C.gold);
  // SILENCE sign
  plaque(p, 120, 58, ['SILENCE', '(and exact', 'matches', 'only)'], C.brandpaper, C.brandink, C.brandink);
  // floor
  planks(p, 0, 100, 320, 44, false, C.brown, C.wood, 6);
  p.ellipse(130, 126, 84, 11, C.darkred);
  p.ellipse(130, 126, 78, 9, C.red);
  p.ellipse(130, 126, 70, 7, C.darkred);
  // card catalogue
  p.rect(84, 66, 30, 32, C.wood);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    p.rect(86 + c * 9, 68 + r * 7, 8, 6, C.woodlight);
    p.px(90 + c * 9, 71 + r * 7, C.gold);
  }
  // the globe
  p.rect(300, 120, 2, 14, C.darkbrown);
  p.rect(294, 132, 14, 3, C.darkbrown);
  p.circle(301, 112, 9, C.sea);
  p.ellipse(298, 110, 4, 3, C.green); p.ellipse(305, 116, 3, 2, C.green);
  p.circle(301, 112, 10, [C.gold, C.gold, 'check']);
  p.circle(301, 112, 9, C.sea);
  p.ellipse(298, 110, 4, 3, C.green); p.ellipse(305, 116, 3, 2, C.green);
  // reading table with book stacks
  p.rect(16, 116, 54, 5, C.woodlight);
  p.rect(20, 121, 3, 16, C.wood); p.rect(63, 121, 3, 16, C.wood);
  const stack = [C.red, C.navy, C.green, C.gold, C.purple, C.brandblue];
  stack.forEach((c, i) => p.rect(22 + (i % 2), 110 - i * 3, 16 - (i % 3), 3, c));
  stack.slice(0, 4).forEach((c, i) => p.rect(48 - (i % 2), 112 - i * 3, 14, 3, c));
}

function front(p: Painter, g: Game) {
  // the librarian's desk, in front of the librarian
  p.rect(190, 108, 92, 26, C.darkbrown);
  p.rect(188, 104, 96, 5, C.woodlight);
  p.rect(194, 112, 84, 18, C.wood);
  for (let x = 200; x < 278; x += 26) p.frame(x, 114, 22, 14, C.darkbrown);
  // the search terminal
  p.rect(196, 84, 30, 22, C.lightgray);
  p.rect(198, 86, 26, 16, C.ink);
  p.rect(204, 104, 18, 2, C.gray);
  if (g.flag('searchReady')) {
    textOn(p, '37', 200, 87, C.lime);
    p.hline(200, 221, 97, C.lime); p.hline(200, 214, 100, C.lime);
  } else {
    textOn(p, '0', 200, 87, C.lime);
    p.hline(208, 220, 91, C.lime);
  }
  // the bell
  p.ellipse(266, 103, 6, 3, C.gold);
  p.circle(266, 99, 4, C.gold);
  p.px(266, 95, C.yellow);
  // nameplate
  p.rect(234, 116, 30, 7, C.gold);
  centeredText(p, 'SHH', 249, 116, C.darkbrown);
}

function anim(p: Painter, g: Game, t: number) {
  // terminal cursor blinks; the window's moon twinkles
  if (Math.floor(t / 500) % 2) p.rect(g.flag('searchReady') ? 214 : 206, 88, 3, 6, C.lime);
  if (Math.floor(t / 900) % 3 === 0) p.px(108, 22, C.white);
  // once the flow is built, a little bead of work runs along the strings
  if (g.flag('flowBuilt')) {
    const k = (t / 900) % (SLOTS.length - 1), i = Math.floor(k), f = k - i;
    const [ax, ay] = SLOTS[i], [bx, by] = SLOTS[i + 1];
    const right = ax < bx;
    const x0 = right ? ax + 21 : ax, x1 = right ? bx : bx + 21;
    p.rect(Math.round(x0 + (x1 - x0) * f) - 1, Math.round(ay + 5 + (by - ay) * f) - 1, 2, 2, C.yellow);
  }
  // a lonely dust mote in the lamp light
  const dx = Math.round(150 + Math.sin(t / 1300) * 30), dy = Math.round(80 + Math.cos(t / 1700) * 12);
  p.px(dx, dy, C.glow);
}

async function setUpSearch(g: Game) {
  if (g.flag('searchReady')) {
    await g.sayAs('librarian', 'The search already understands meaning. Keep your provider, dear. I only needed to borrow its brain.');
    return;
  }
  if (!g.flag('pineconeGiven')) {
    await g.sayAs('librarian', [
      'An AI provider! It can turn text into "embeddings": long lists of numbers that capture what the text MEANS.',
      'But I would need somewhere to keep all those numbers. An index sorted by similarity, not by alphabet.',
      'Something with lots of little scales, arranged by how alike they are...',
    ]);
    return;
  }
  if (await providerRefuses(g)) return;
  g.set('searchReady');
  await g.say('I connect the provider to the terminal. The pinecone glows on the desk. Something hums.');
  await g.sayAs('librarian', ['Now then. Search: "boat".', '...', '37 results! Ship. Raft. Canoe. Pedalo. "Seafaring for Beginners". Not a single goat!']);
  await g.say([
    "That's AI Search. The library catalogue becomes a Search API index, with an AI twist:",
    'the provider turns every book into embeddings: numbers that capture its meaning. A meaning-fingerprint.',
    'Those go into a vector database, the pinecone, which files them by how alike they are.',
    'So "boat" lands right next to "ship". Search by meaning, not by spelling.',
  ]);
  await g.sayAs('librarian', [
    'And the best bit: AI agents can use it too. They look things up here BEFORE they answer.',
    'Retrieval-augmented generation, the young people call it. RAG. I call it "checking the book first".',
  ]);
  await g.say('An AI that checks its sources. On this island, that counts as science fiction.');
  g.give('tool_search');
  await g.sayAs('librarian', 'The machine printed a card for you. "Search". One of those Tool API thingies, I believe.');
  await booksComplaint(g);
}

async function booksComplaint(g: Game) {
  await g.sayAs('librarian', [
    'Now, if only the NEW books would sort themselves.',
    'They arrive every day. By bottle. Soggy, unsorted, and in a hurry.',
    'Someone must pick a shelf, write a summary card, and index it. Someone is me. Every. Single. Day.',
  ]);
  await g.say('Sounds like a job for a workflow.');
  await g.sayAs('librarian', [
    'Automate it? Ooh. But I approve every book before it goes on my shelves. Nothing gets indexed without me.',
    'There is a FlowDrop board on the wall. Pin the steps in order and it runs by itself. Mostly.',
  ]);
}

// ------------------------------------------------------------------ building the flow
const NODES = [
  { id: 'trigger', text: 'Trigger: a new book arrives' },
  { id: 'shelf', text: 'Pick a shelf' },
  { id: 'summary', text: 'Write a summary (LLM)' },
  { id: 'review', text: 'Human review: the Librarian approves' },
  { id: 'index', text: 'Index it in AI Search' },
  { id: 'social', text: 'Post it on social media' },
  { id: 'seagull', text: 'Ask the seagull' },
];

async function buildFlow(g: Game) {
  if (!g.flag('searchReady')) {
    await g.sayAs('librarian', 'The FlowDrop board? One miracle at a time, dear. First make my search work.');
    return;
  }
  if (g.flag('flowBuilt')) {
    await g.say('The flow runs every morning now. The board even shows what happened to each book, step by step.');
    return;
  }
  if (await providerRefuses(g)) return;
  await g.say(['Five empty slots, a pile of node cards, and a lot of red string.', 'Pin them in order, top to bottom.']);
  const picks: string[] = [];
  let model = '';
  for (let slot = 1; slot <= 5; slot++) {
    const left = NODES.filter((n) => !picks.includes(n.id));
    const id = await g.choose(left.map((n) => ({ id: n.id, text: `${slot}. ${n.text}` })));
    picks.push(id);
    if (id === 'shelf') {
      await g.say('Which model picks the shelf?');
      model = await g.choose([
        { id: 'llm', text: 'My AI provider (an LLM)' },
        ...(g.has('decision') ? [{ id: 'decision', text: 'The Decision Model' }] : []),
        { id: 'dice', text: 'Roll a dice' },
      ]);
    }
  }
  await g.say('Flow drawn. Run it!');
  await g.narrate('A bottle washes up on the beach. Inside: a soggy book called "Rafts for Beginners".');
  const at = (n: string) => picks.indexOf(n);
  const fail = async (lines: string[], mac?: string) => {
    await g.sayAs('librarian', lines);
    await g.say(mac ?? 'Back to the drawing board. Literally.');
  };
  if (picks.includes('seagull')) {
    await g.narrate('ASK THE SEAGULL: the seagull takes the book. And flies away.');
    return fail(['The seagull is now our head of acquisitions. He has acquired one book. Ours.'], 'Seagulls are not a workflow step. And I left out a real step to make room for it.');
  }
  if (picks.includes('social')) {
    await g.narrate('POST ON SOCIAL MEDIA: "NEW BOOK JUST DROPPED!!! #books #library #blessed". 900 bots liked it.');
    return fail(['We are a LIBRARY. We do not do hashtags.', 'And the book is still lying on my desk, unsorted.'], 'Right. I swapped a real step for that. Back to the board.');
  }
  if (at('trigger') !== 0) {
    await g.narrate('Nothing happens. The book lies there. The flow waits for... something.');
    return fail(['A flow has to START with something happening, dear. A book arriving, say.'], 'Without a trigger first, a flow is just a nice drawing of a flow.');
  }
  if (at('review') < at('summary') || at('review') < at('shelf')) {
    await g.narrate('HUMAN REVIEW: waiting for the Librarian... to approve a summary that does not exist yet.');
    return fail(['I approved it. I approved NOTHING. It was very relaxing, but it was not my job.'], 'The review has to come AFTER the work it reviews.');
  }
  if (at('index') < at('review')) {
    await g.narrate('INDEXED IN AI SEARCH. Then, later: HUMAN REVIEW.');
    return fail([
      'It went into the search before I even saw it!',
      'Now searching "romance" finds "Tax Law, Volume 9". With a summary that says "spicy".',
    ], 'The human has to approve BEFORE anything goes live. Otherwise the human is just a spectator.');
  }
  if (model === 'dice') {
    await g.narrate('PICK A SHELF: the dice says 4. Shelf 4: Cookery.');
    return fail(['"Rafts for Beginners" in Cookery?', 'Random is not a decision, dear. I want the RIGHT shelf, from my list.'], 'Rolling dice is not a strategy. Usually.');
  }
  if (model === 'llm') {
    g.set('needDecision');
    await g.narrate('PICK A SHELF (LLM): ...');
    await g.sayAs('librarian', [
      '"This book belongs on many shelves, spiritually. Nautical, yes. But also Romance, for the sea is a lover...',
      '...and Philosophy, for what IS a shelf, really?" Four paragraphs! No shelf!',
    ]);
    await g.say("The LLM wrote an ESSAY. I wanted ONE word, from a list.");
    await g.sayAs('librarian', [
      'Picking a shelf means PICKING. My shelves are a fixed list. I need a yes-or-Nautical sort of answer.',
      'That professor in the temple knows every kind of model. Ask him for one that chooses instead of chatting.',
    ]);
    return;
  }
  // the correct flow
  await g.narrate(['TRIGGER: new book arrived.', 'DECISION MODEL: "Shelf: Nautical. Confidence: 94%."']);
  await g.narrate(['LLM SUMMARY: "A beginner\'s guide to building rafts. Practical, short, slightly damp."', 'HUMAN REVIEW: paused. Waiting for the Librarian...']);
  await g.sayAs('librarian', 'Nautical. A sensible summary. APPROVED.');
  await g.narrate('INDEXED IN AI SEARCH. "boat" now finds 38 results.');
  g.set('flowBuilt');
  await g.sayAs('librarian', [
    'It works! And I didn\'t have to touch the book. Well, apart from approving it. Which is the fun part.',
    'That is FlowDrop: a visual workflow builder. Boxes and strings. No code.',
    'The drawing IS the plan. It IS what runs. And afterwards it IS the record of what happened, step by step.',
    'It can pause and wait for a human, like me. And a box can even be a whole AI agent, or a bundle of context.',
  ]);
  await g.say('So the flowchart from the meeting actually does the work now. Revolutionary.');
  await g.sayAs('librarian', 'You have earned this, young man. For services to librarianship.');
  g.give('translate');
  g.give('tool_translate');
  await g.sayAs('librarian', [
    'AI Translate. It uses your provider to translate anything into any language.',
    'Even the terrible ones. I hear the ghosts in the graveyard speak pure GeoCities.',
  ]);
}

export const libraryDialogues: Dialogue[] = [
  {
    id: 'librarian',
    with: 'librarian',
    start: async (g) => {
      if (!g.flag('librarianMet')) {
        g.set('librarianMet');
        await g.sayAs('librarian', ['Shhh!', '...Oh, a visitor. Welcome to the Library of Unindexed Knowledge. How may I fail to help you?']);
      } else await g.sayAs('librarian', g.flag('searchReady') ? 'Welcome back! Ask me anything. I may even find it.' : 'Shhh! Oh, it is you. Hello. Quietly.');
    },
    options: [
      {
        id: 'boats', text: 'Do you have any books about boats?',
        when: (g) => !g.flag('searchReady'),
        run: async (g) => {
          g.set('askedBoats');
          await g.sayAs('librarian', 'Let me search... *clack clack clack*');
          await g.sayAs('librarian', ['0 results for "boat". Did you mean "goat"?', 'We have 412 books about goats.']);
          await g.say("I don't want goats. I want to get OFF this island.");
        },
      },
      {
        id: 'ships', text: 'What about "ships"? Or "rafts"?',
        when: (g) => !!g.flag('askedBoats') && !g.flag('searchReady'),
        run: async (g) => {
          await g.sayAs('librarian', ['"Ships": 1 result. "Ships Ahoy: A History of Cookie Consent Banners".', '"Rafts": 0 results. Did you mean "drafts"? We have 9,000 unpublished drafts.']);
          await g.say('This search engine is a menace.');
        },
      },
      {
        id: 'exact', text: 'Why is your search so bad?',
        when: (g) => !g.flag('searchReady'),
        run: (g) => (g.set('askedExact'), g.sayAs('librarian', [
          'It only finds EXACT words. Type "boat" and a book called "Ships" is invisible, though it means the same.',
          'If only the catalogue understood what words MEAN, not just how they are spelled.',
          'I would need something that understands language. And an index sorted by meaning. I have neither.',
        ])),
      },
      {
        id: 'vector', text: 'What is a vector database, in plain English?',
        when: (g) => !!g.flag('pineconeGiven') || !!g.flag('askedExact'),
        run: (g) => g.sayAs('librarian', [
          'Imagine a library where books are shelved by what they are ABOUT. Boats next to ships, next to rafts.',
          'A vector database does that with numbers. Find one book, and all its neighbours mean something similar.',
        ]),
      },
      {
        id: 'demo', text: 'Show me that search again!',
        when: (g) => !!g.flag('searchReady'),
        run: async (g) => {
          await g.sayAs('librarian', ['Search: "how to leave an island".', '"Raft Building for Dummies", "Swimming, Advanced", and "Calling for Help: A Guide".']);
          await g.say('Calling for help. Interesting. If only I could reach somebody past the Fog.');
        },
      },
      {
        id: 'books', text: 'You said new books arrive every day?',
        when: (g) => !!g.flag('searchReady') && !g.flag('flowBuilt'),
        run: booksComplaint,
      },
      {
        id: 'flow', text: "Let's automate your new books.", end: true,
        when: (g) => !!g.flag('searchReady') && !g.flag('flowBuilt'),
        run: async (g) => {
          await g.sayAs('librarian', 'Splendid! The FlowDrop board is on the wall. Pin the steps in order. And remember: nothing is indexed without me.');
          await buildFlow(g);
        },
      },
      {
        id: 'flowdrop', text: 'What is FlowDrop, again?',
        when: (g) => !!g.flag('flowBuilt'),
        run: (g) => g.sayAs('librarian', [
          'A workflow you draw instead of code. Each box is a step: a trigger, an AI call, a person, a search index.',
          'The drawing is the spec, the drawing is what runs, and the drawing remembers what it did. No more "who changed the cron job?"',
        ]),
      },
      {
        id: 'island', text: 'How do I get off this island?', once: true,
        run: (g) => g.sayAs('librarian', ['We have a book about that. Somewhere. It is filed under "I" for "Impossible".', 'Or "F" for "Fog". Or "D" for "Doomed". The index is very old.']),
      },
      {
        id: 'bye', text: 'Thanks. Shhh.', end: true,
        run: (g) => g.sayAs('librarian', 'Shhh yourself.'),
      },
    ],
  },
];

export const library: RoomDef = {
  id: 'library',
  name: 'Library of Unindexed Knowledge',
  width: 320,
  paint,
  front,
  anim,
  bgKey: (g) => (g.flag('flowBuilt') ? 'flow' : g.flag('searchReady') ? 'search' : 'exact'),
  scale: [102, 0.88, 143, 1.02],
  walk: [[[0, 104], [186, 104], [186, 136], [290, 136], [292, 104], [320, 104], [320, 143], [0, 143]]],
  start: [160, 132],
  startFace: 'left',
  npcs: [{ id: 'librarian', at: [244, 118], face: 'left' }],
  enter: async (g) => {
    if (!g.flag('librarySeen')) {
      g.set('librarySeen');
      await g.say('A library. Floor-to-ceiling books, and a terminal that has clearly never found anything.');
      await g.sayAs('librarian', 'SHHH!');
      await g.say("I didn't say anything!");
      await g.sayAs('librarian', 'You were THINKING loudly.');
    }
  },
  hotspots: [
    {
      id: 'lib_door', name: 'door', rect: [180, 32, 30, 66], walkTo: [176, 108], face: 'back',
      look: 'The door back outside. Its hinges were oiled in total silence.',
      exit: { to: 'map' },
    },
    {
      id: 'shelves', name: 'bookshelves', rect: [4, 6, 70, 92], walkTo: [40, 110], face: 'back',
      look: (g) => g.say(g.flag('searchReady')
        ? 'Thousands of books. And now the terminal can find them by what they mean, not just by title.'
        : 'Thousands of books, all filed by exact title. Somewhere in here is the answer to everything. Good luck finding it.'),
      pickup: 'I take a random book. "Goats: The Definitive Guide, Volume 7". I put it back.',
    },
    {
      id: 'shelves2', name: 'bookshelves', rect: [236, 6, 80, 76], walkTo: [300, 110], face: 'back',
      look: 'One shelf is all "Untitled Draft (copy) (2) FINAL". The Library\'s unpublished content section.',
      pickup: 'I pick up "The Joy of Caching". The pages are blank. Someone forgot to clear the cache.',
    },
    {
      id: 'ladder', name: 'rolling ladder', rect: [54, 8, 24, 92], walkTo: [64, 110], face: 'back',
      look: 'A rolling library ladder. Rolling ladders are the best thing about libraries, and I will not hear otherwise.',
      use: "I ride the ladder along the shelf. Wheee! The Librarian's glare could stop a database migration.",
      pickup: 'It is attached to the rail. Also, the Librarian is watching.',
      push: "I give it a shove. It rolls a metre and stops. Like most projects.",
    },
    {
      id: 'catalogue', name: 'card catalogue', rect: [84, 64, 30, 34], walkTo: [100, 108], face: 'back',
      look: 'A card catalogue. Alphabetical. If you know the exact title, it is wonderful. If you don\'t, it is a wall.',
      open: "I open a drawer: 'BOA to BOAT'. The card for BOAT says: 'see GOAT'.",
    },
    {
      id: 'terminal', name: 'search terminal', rect: [194, 82, 34, 24], walkTo: [186, 120], face: 'right',
      look: (g) => g.say(g.flag('searchReady')
        ? 'The terminal says: "37 results for \'boat\': ship, raft, canoe, pedalo..." Search by meaning! Lovely.'
        : 'The terminal says: "0 results for \'boat\'. Did you mean \'goat\'?" Exact-match search at its finest.'),
      use: (g) => g.say(g.flag('searchReady') ? 'I search "rescue". It finds "help", "lifeboat" and "Grand Maintainer (asleep)".' : 'I type "escape". It suggests "escape key". Thanks.'),
      useItem: { provider: setUpSearch, pinecone: (g) => g.sayAs('librarian', 'Not in the keyboard, dear! Give it to me.') },
    },
    {
      id: 'bell', name: 'bell', rect: [258, 92, 14, 14], walkTo: [286, 132], face: 'left',
      look: 'A brass service bell. Ring for attention.',
      use: async (g) => { await g.say('*DING*'); await g.sayAs('librarian', 'SHHHHHH!'); },
      push: async (g) => { await g.say('*DING*'); await g.sayAs('librarian', 'Ringing a bell in a library. Bold. Stupid, but bold.'); },
    },
    {
      id: 'books', name: 'stack of books', rect: [16, 96, 54, 24], walkTo: [44, 134], face: 'back',
      look: 'Books waiting to be shelved: "Terms and Conditions, Unabridged", "50 Shades of Grey Buttons", "LOREM IPSUM: the novel".',
      pickup: "I'd rather not. It's a stack of books, not a stack of answers.",
    },
    {
      id: 'globe', name: 'globe', rect: [290, 100, 22, 36],
      look: 'A globe. Legacy Island is not on it. Neither is anything past the Fog. Cartographers hate fog.',
      push: 'I spin the globe. It stops on "Here Be Dragons". Typical.',
      use: 'I spin the globe. It stops on "Here Be Dragons". Typical.',
    },
    {
      id: 'lib_window', name: 'window', rect: [86, 12, 30, 34],
      look: 'Outside, the Fog presses against the glass. It looks like it wants to borrow a book.',
      open: "It's painted shut. The Library prefers its air quiet and old.",
    },
    {
      id: 'flowboard', name: 'FlowDrop board', rect: [BOARD.x, BOARD.y, BOARD.w, BOARD.h], walkTo: [148, 108], face: 'back',
      look: (g) => g.say(g.flag('flowBuilt')
        ? ['The FlowDrop board: trigger, shelf, summary, human review, index. All strung together.', 'The drawing is the plan, the drawing runs, and it remembers every book it handled.']
        : g.flag('searchReady')
          ? ['A cork board labelled FLOWDROP, covered in node cards that aren\'t connected to anything.', 'FlowDrop is a visual workflow builder: you pin up the steps and string them together, and that IS the program.']
          : 'A cork board labelled FLOWDROP. Empty, apart from a sticky note: "TODO: automate everything. Later."'),
      use: buildFlow,
      push: buildFlow,
      useItem: {
        decision: buildFlow,
        provider: buildFlow,
      },
      pickup: (g) => g.sayAs('librarian', 'That board is load-bearing, dear. Workflows rest on it.'),
    },
    {
      id: 'silencesign', name: 'sign', rect: [118, 56, 62, 44],
      look: '"SILENCE (and exact matches only)". It seems to apply to the search engine too.',
    },
    {
      id: 'librarian', name: 'Librarian', actor: 'librarian',
      look: (g) => g.say(g.flag('searchReady')
        ? 'The Librarian, beaming quietly. That is a librarian\'s version of a victory dance.'
        : 'The Librarian. Pencil in the bun, glasses on the nose, finger permanently ready to go "shh".'),
      talk: (g) => g.talk('librarian'),
      giveItem: {
        pinecone: async (g) => {
          g.take('pinecone');
          g.set('pineconeGiven');
          await g.sayAs('librarian', [
            'A pinecone? How thoughtful... wait. Look at these scales! Each one placed beside the ones most like it.',
            "It's an index sorted by SIMILARITY. A vector database! A real Pinecone!",
          ]);
          if (!g.flag('searchReady')) await g.sayAs('librarian', 'Now all I need is something to turn words into meanings. Something with a brain. Any AI provider would do.');
        },
        provider: setUpSearch,
        herring: (g) => g.sayAs('librarian', 'A red herring! No fish in the library. Especially not misleading ones.'),
        decision: (g) => g.sayAs('librarian', g.flag('flowBuilt') ? 'It already picks my shelves, dear. Every morning.' : 'A model that just PICKS? Marvellous! Pin it on the FlowDrop board, on the shelf step.'),
      },
      useItem: { provider: setUpSearch },
      anyItem: (g) => g.sayAs('librarian', "That's not a book. I only accept books. And, apparently, pinecones."),
    },
  ],
};
