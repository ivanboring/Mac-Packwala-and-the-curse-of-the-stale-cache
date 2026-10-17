import type { Dialogue, DialogueOption, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import type { DuelDef } from '../../../engine/core';
import { C, sky, rock, grassTufts, textOn, centeredText } from '../../art';
import { jungle, fern, vine, conifer } from '../../art2';
import { textWidth } from '../../../engine/font';

export const REVIEWERS = ['nell', 'bob', 'larry'] as const;
export type Reviewer = (typeof REVIEWERS)[number];

export const reviewer = (g: Game): Reviewer => (g.flag('reviewer') as Reviewer) || 'nell';

const NAMES: Record<Reviewer, string> = { nell: 'Nitpick Nell', bob: 'Bikeshed Bianca', larry: 'LGTM Lenny' };

// Each reviewer shows all of their patches (see reviews.ts); a clean review wins.
export const crossroadsDuels: DuelDef[] = REVIEWERS.map((id) => ({ id, opponent: id }));

function arrow(p: Painter, x: number, y: number, label: string, right: boolean, c = C.woodlight) {
  const w = textWidth(label) + 8;
  const x0 = right ? x : x - w;
  const pts: [number, number][] = right
    ? [[x0, y], [x0 + w, y], [x0 + w + 5, y + 5], [x0 + w, y + 10], [x0, y + 10]]
    : [[x0, y], [x0 + w, y], [x0 + w, y + 10], [x0, y + 10], [x0 - 5, y + 5]];
  p.poly(pts, c);
  p.hline(x0, x0 + w, y + 10, C.wood);
  textOn(p, label, x0 + 4, y + 1, C.darkbrown);
}

function paint(p: Painter, g: Game) {
  sky(p, 320, 50, 'day');
  jungle(p, 0, 6, 320, 74, 11);
  // the clearing
  p.gradV(0, 84, 320, 60, [C.green, C.darkgreen]);
  grassTufts(p, 0, 88, 320, 54, 13, C.lime);
  // the crossing dirt paths
  p.poly([[134, 84], [180, 84], [230, 144], [96, 144]], C.sandshade);
  p.poly([[0, 108], [320, 100], [320, 120], [0, 132]], C.sandshade);
  p.speckle(0, 84, 320, 60, [C.sandshade, C.sand, '25'], 0.05, 9);
  p.poly([[140, 84], [176, 84], [214, 144], [110, 144]], [C.sandshade, C.tan, 'check']);
  // the famous signpost
  const sx = 150;
  p.rect(sx - 2, 22, 5, 80, C.wood);
  p.rect(sx - 1, 22, 1, 80, C.woodlight);
  p.poly([[sx - 3, 22], [sx, 18], [sx + 4, 22]], C.wood);
  arrow(p, sx + 3, 24, 'WATERFALL', true);
  arrow(p, sx - 2, 36, 'PROD', false);
  arrow(p, sx + 3, 48, 'STAGING', true, C.tan);
  arrow(p, sx - 2, 60, 'DEV (abandoned)', false, C.sandshade);
  arrow(p, sx + 3, 72, 'TOWN', true);
  arrow(p, sx - 2, 84, 'DRAGONS', false, C.red);
  // the pine tree, oddly Nordic for a tropical island
  conifer(p, 266, 100, 80);
  if (!g.flag('got:pinecone')) for (const [cx, cy] of [[258, 58], [276, 72], [254, 84]]) {
    p.ellipse(cx, cy, 2, 3, C.brown);
    p.px(cx, cy - 1, C.darkbrown);
  }
  // stump with its eternal sign
  p.rect(48, 114, 26, 14, C.brown);
  p.ellipse(61, 114, 13, 4, C.tan);
  p.ellipse(61, 114, 8, 2, C.sandshade);
  p.vline(61, 104, 113, C.wood);
  p.rect(22, 84, 78, 21, C.woodlight);
  p.frame(22, 84, 78, 21, C.wood);
  centeredText(p, 'CODE REVIEW', 61, 85, C.darkbrown);
  centeredText(p, 'IN PROGRESS', 61, 94, C.red);
  rock(p, 300, 120, 18, 10, 4);
  rock(p, 70, 130, 14, 8, 5);
  for (const [x, y, s] of [[8, 140, 1.2], [304, 142, 1.1], [240, 96, 0.8], [110, 98, 0.8]] as const) fern(p, x, y, s);
  for (const [x, len, seed] of [[30, 40, 1], [216, 26, 2], [236, 34, 3], [312, 50, 4]] as const) vine(p, x, 0, len, seed);
}

function front(p: Painter) {
  // foreground leaves framing the scene
  p.ellipse(-4, 140, 22, 12, C.darkgreen);
  p.ellipse(324, 138, 20, 14, C.darkgreen);
  fern(p, 14, 146, 1.4, C.darkgreen);
}

function anim(p: Painter, g: Game, t: number) {
  // monkey swinging from a vine
  const sw = Math.sin(t / 700) * 6;
  const mx = Math.round(70 + sw), my = 26;
  p.line(70, 0, mx, my - 6, C.darkgreen);
  p.circle(mx, my, 4, C.brown);
  p.circle(mx, my - 6, 3, C.brown);
  p.rect(mx - 1, my - 7, 3, 2, C.tan);
  p.px(mx - 1, my - 7, C.ink); p.px(mx + 1, my - 7, C.ink);
  p.line(mx + 3, my + 2, mx + 7, my + 6 + Math.round(sw / 3), C.brown);
  // butterflies
  for (let i = 0; i < 2; i++) {
    const bx = Math.round(60 + i * 160 + Math.sin(t / 900 + i) * 20), by = Math.round(70 + Math.cos(t / 600 + i * 2) * 8);
    const flap = Math.floor(t / 150 + i) % 2;
    p.px(bx, by, C.ink);
    p.px(bx - 1, by - flap, i ? C.yellow : C.brandpink);
    p.px(bx + 1, by - flap, i ? C.yellow : C.brandpink);
  }
}

async function startReview(g: Game) {
  const who = reviewer(g);
  await g.sayAs(who, g.random(['Pull up a stump. Here are my patches.', 'Red pen ready. Let us review some code!', 'Three... two... diff!']));
  await g.duel(who);
  return 'end';
}

const INTROS: Record<Reviewer, string[]> = {
  nell: [
    "I'm Nell. Drupal core committer. Everyone calls me Nitpick Nell.",
    'I find the bug before it finds your users. Then I help you fix it. That part matters more.',
  ],
  bob: ["Bikeshed Bianca. I once discussed a button colour for three weeks.", 'We went with blue. Then I reopened it.'],
  larry: ["LGTM Lenny! I approve everything. Looks Good To Me! Ship it!", 'Except yours. Yours looks bad to me.', "And Nell's. Nell's patches I actually read. For fun."],
};

// What the other reviewers say when you ask about Nell
const ABOUT_NELL: Record<Exclude<Reviewer, 'nell'>, string[]> = {
  bob: [
    "Nell? Nell is a core committer. Drupal CORE. She reviews the code the whole island runs on.",
    'She once found a security hole by reading a comment. A COMMENT.',
    "And she's NICE about it. I've argued about colours for three weeks. She ended a three-YEAR argument with one patch.",
  ],
  larry: [
    "Nell's the best developer on this island. Maybe any island.",
    "Her reviews say what's wrong, why it matters, and how to fix it. Then she says thank you. To ME.",
    "One day I'll write a patch she approves without a single nit. *sigh* One day.",
  ],
};

const reviewerOptions: DialogueOption[] = [
  {
    id: 'duel', text: "Let's do a code review! Right here, right now!",
    run: startReview,
  },
  {
    id: 'who', text: 'Who are you?',
    run: (g) => g.sayAs(reviewer(g), INTROS[reviewer(g)]),
  },
  {
    id: 'how', text: 'How does a code review work around here?',
    run: async (g) => {
      await g.sayAs(reviewer(g), [
        'Simple. I show you a patch. You find what is wrong with it, and say it in one review comment.',
        'Not the colour of a button. Not tabs or spaces. The thing that would actually hurt someone.',
      ]);
      await g.say('And if I miss it?');
      await g.sayAs(reviewer(g), reviewer(g) === 'bob'
        ? ["Then I explain it, and you'll spot it next time. That's how we all learned.", 'Although the colour of the button is ALSO very important.']
        : "Then I explain it, and you'll spot it next time. That's how we all learned.");
    },
  },
  {
    id: 'master', text: 'Who taught you to review like that?',
    when: (g) => !!g.flag('knowsDojo'),
    run: (g) => g.sayAs(reviewer(g), [
      'Master Rebase. Behind the Waterfall. Nobody goes there. Nobody uses the Waterfall anymore.',
      'Her patches were written by AI agents. The same bugs we show you, only better hidden.',
    ]),
  },
  {
    id: 'nell', text: 'Who is this Nell everyone talks about?',
    when: (g) => reviewer(g) !== 'nell' && !!g.flag('met:nell'),
    run: (g) => g.sayAs(reviewer(g), ABOUT_NELL[reviewer(g) as Exclude<Reviewer, 'nell'>]),
  },
  {
    id: 'humble', text: 'Everyone on this island talks about you, you know.', once: true,
    when: (g) => reviewer(g) === 'nell',
    run: async (g) => {
      await g.sayAs('nell', ["They're too kind. I just read every line, and I ask \"what if?\" a lot.", 'And I remember that every patch was written by a person. Usually a tired one.']);
      await g.say('Note to self: be more like Nell.');
    },
  },
  {
    id: 'agents', text: 'Why do pirates do code reviews?', once: true,
    run: (g) => g.sayAs(reviewer(g), "Plundering's gone remote. Now we just raid each other's pull requests."),
  },
  {
    id: 'bye', text: 'I need to sharpen my red pen. Bye.', end: true,
    run: (g) => g.sayAs(reviewer(g), g.random(['Changes requested on that goodbye.', 'Closed. Won\'t fix.', 'Approved. Barely.'])),
  },
];

export const crossroadsDialogues: Dialogue[] = REVIEWERS.map((id) => ({
  id: `reviewer_${id}`,
  with: id,
  start: async (g: Game) => {
    if (!g.flag(`met:${id}`)) {
      g.set(`met:${id}`);
      await g.sayAs(id, id === 'nell' ? 'Hi there! Welcome to the crossroads. Nobody passes without a code review. Don\'t worry, I\'m gentle.' : `Halt! ${NAMES[id]} reviewing! Nobody passes un-reviewed!`);
      await g.say("I'm not passing. I just want to stand here.");
      await g.sayAs(id, id === 'nell' ? 'Standing here is a change! I\'ll review it kindly. Promise.' : 'Standing here is a change. All changes get reviewed.');
    } else if (id === 'nell') await g.sayAs(id, g.random(['Welcome back! Ready for another round?', 'Oh good, it\'s you. Your reviews are getting sharper.', 'Back again? I love a contributor who keeps coming back.']));
    else await g.sayAs(id, g.random(['Back for more red ink?', 'Ready to be reviewed?', 'Your last diff still haunts me.']));
  },
  options: reviewerOptions,
}));

/** Called by the engine after every code review. */
export async function crossroadsAfterDuel(g: Game, duel: DuelDef, won: boolean) {
  if (duel.master) return;
  const who = duel.opponent;
  if (won) {
    g.inc('duelsWon');
    await g.sayAs(who, who === 'nell'
      ? g.random(['Every bug, found. Kindly, too. RTBC: reviewed and tested by the community!', 'A clean review. I learned something today, and I hope you did too.'])
      : g.random(["Argh. You found them all. You've got an eye for it.", 'Fine. Approved. Don\'t let it go to your head.', 'LGTM. And I MEAN it this time.']));
    if (!g.flag('knowsDojo')) {
      g.set('knowsDojo');
      await g.sayAs(who, who === 'nell' ? [
        "You're really good. Want a real challenge? Go and see the Code Review Master.",
        'Master Rebase. She lives in a dojo behind the Waterfall. Nobody goes there. Nobody uses the Waterfall anymore.',
      ] : [
        "You're good, kid. But not THAT good. You'd never beat the Code Review Master.",
        'Master Rebase. Lives in a dojo behind the Waterfall. Nobody goes there. Nobody uses the Waterfall anymore.',
      ]);
      await g.say('Behind the Waterfall. Got it. Wait... a secret cave behind a waterfall? On a pirate island? How original.');
    }
  } else {
    await g.sayAs(who, who === 'nell'
      ? g.random(["Needs work, but you're close! Every bug I explain, you'll spot next time. That's how I learned too.", 'Changes requested. Kindly. Come back after a cup of coffee.'])
      : g.random(['Changes requested! Come back when you can spot a bug.', 'Rejected! Better luck in the next sprint.']));
    await g.say("Note to self: every bug they explain to me, I'll recognise next time.");
  }
}

export const crossroads: RoomDef = {
  id: 'crossroads',
  name: 'Code Review Crossroads',
  width: 320,
  paint,
  front,
  anim,
  bgKey: (g) => (g.flag('got:pinecone') ? 'nocone' : 'cone'),
  scale: [100, 0.86, 143, 1],
  walk: [[[0, 108], [134, 98], [184, 98], [320, 102], [320, 143], [0, 143]]],
  start: [176, 136],
  startFace: 'right',
  npcs: REVIEWERS.map((id) => ({ id, at: [234, 124] as [number, number], face: 'left' as const, when: (g: Game) => reviewer(g) === id })),
  enter: async (g) => {
    if (!g.flag('crossroadsSeen')) {
      g.set('crossroadsSeen');
      await g.say('A crossroads deep in the jungle. And blocking it, inevitably, a pirate with a red pen.');
    }
  },
  hotspots: [
    {
      id: 'cross_path', name: 'path back', rect: [0, 96, 20, 48], walkTo: [8, 128], face: 'left',
      look: 'The way I came. Back to the map.',
      exit: { to: 'map' },
      walk: async (g) => {
        // The reviewers work in shifts. A new one is on duty each time you come back.
        const next = REVIEWERS[(REVIEWERS.indexOf(reviewer(g)) + 1) % REVIEWERS.length];
        g.set('reviewer', next);
        await g.goto('map');
      },
    },
    {
      id: 'signpost', name: 'signpost', rect: [100, 16, 110, 80], walkTo: [150, 112], face: 'back',
      look: [
        'Arrows to WATERFALL, STAGING, TOWN, PROD, DEV (abandoned) and DRAGONS.',
        'PROD and DRAGONS point the same way. That checks out.',
      ],
      pull: "I'm not reorganising the deployment pipeline with my bare hands.",
      pickup: 'It is load-bearing. Several careers depend on it.',
    },
    {
      id: 'pinetree', name: 'pine tree', rect: [236, 18, 60, 84], walkTo: [252, 116], face: 'back',
      look: (g) => g.say(g.flag('got:pinecone')
        ? 'A pine tree. Down one pinecone. It seems relieved.'
        : ['A pine tree. On a tropical island. Someone imported it and never checked the dependencies.', 'It has pinecones.']),
      pickup: async (g) => {
        if (g.flag('got:pinecone')) return g.say("One pinecone is plenty. Nobody needs two pinecones. That's how collections start.");
        g.give('pinecone');
        await g.say(['I pluck a pinecone.', 'Hundreds of tiny scales, all arranged by how similar they are to each other. Sort of like... no, it\'s just a pinecone.']);
      },
      push: 'It does not budge. Pine trees are famously stubborn about where they are deployed.',
      use: 'I hug it. Nothing happens. The tree remains emotionally unavailable.',
    },
    {
      id: 'stump', name: 'tree stump', rect: [20, 82, 82, 48], walkTo: [62, 134], face: 'back',
      look: '"CODE REVIEW IN PROGRESS." Judging by the moss, it has been in progress since this was a tree.',
      use: 'I sit on the stump. My code review does not progress either.',
    },
    {
      id: 'monkey', name: 'monkey', rect: [58, 10, 26, 30],
      look: "A monkey swinging on a vine. Some kind of senior developer, I'd guess - he's above it all.",
      talk: 'He throws a banana peel at me. Fair. That was my ugliest commit.',
      pickup: "He's out of reach. Like most senior developers on a Friday.",
      giveItem: { herring: "He sniffs the herring and hands it back. Even the monkey won't take a red herring." },
    },
    {
      id: 'vines', name: 'vines', rect: [24, 0, 20, 42],
      look: 'Jungle vines. Swinging on them is for monkeys and people who skipped the safety training.',
      pull: "I tug on a vine. Somewhere, a coconut falls on someone else. Good.",
    },
    {
      id: 'jungle', name: 'jungle', rect: [0, 0, 320, 84], noWalk: true,
      look: 'Dense jungle. The kind where you go in for a quick refactor and come out three years later with a beard.',
      walk: 'Off-path? In THAT? Not without a map and a very good reason.',
    },
    {
      id: 'ferns', name: 'ferns', rect: [290, 128, 30, 16],
      look: 'Ferns. Older than dinosaurs, and somehow still not deprecated.',
      pickup: "I'm not taking a fern. Ferns are a lifestyle commitment.",
    },
    {
      id: 'butterflies', name: 'butterfly', rect: [40, 58, 40, 24],
      look: 'A butterfly. If it flaps here, somewhere in production a server falls over. That explains a lot.',
    },
    ...REVIEWERS.map((id) => ({
      id: `rev_${id}`, name: NAMES[id], actor: id,
      when: (g: Game) => reviewer(g) === id,
      look: {
        nell: ['Nitpick Nell, Drupal core committer and the best developer on the island.', 'Red pen behind her ear, and the calmest eyes in the jungle. Every patch she reviews comes out better.'],
        bob: "Bikeshed Bianca. She has strong opinions about the colour of everything. Including, I suspect, me.",
        larry: 'LGTM Lenny. Approves everything without reading it. A legend. A menace.',
      }[id],
      talk: (g: Game) => g.talk(`reviewer_${id}`),
      giveItem: {
        herring: (g: Game) => g.sayAs(id, "A red herring? Nice try. I don't get distracted. I get pedantic."),
      },
      anyItem: (g: Game) => g.sayAs(id, "Bribery? In a code review? I'm flattered. No."),
    })),
  ],
};
