import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import type { DuelDef } from '../../../engine/core';
import { C, centeredText, textOn } from '../../art';
import { flame } from '../../art2';
import { trialComplete } from './trials';

// Five of her patches, written by AI agents, the stale cache last. One miss is forgiven.
export const masterDuel: DuelDef = { id: 'master', opponent: 'master', master: true, mistakes: 1 };

function scroll(p: Painter, x: number, y: number, lines: string[]) {
  const w = 52, h = lines.length * 9 + 8;
  p.rect(x - 2, y - 2, w + 4, 3, C.darkbrown);
  p.rect(x, y, w, h, C.brandpaper);
  p.vline(x, y, y + h - 1, C.brandmist);
  p.rect(x - 2, y + h, w + 4, 3, C.darkbrown);
  lines.forEach((l, i) => centeredText(p, l, x + w / 2, y + 4 + i * 9, i === 0 ? C.red : C.brandink));
  p.line(x + w / 2, y - 2, x + w / 2 - 8, y - 8, C.darkbrown);
  p.line(x + w / 2, y - 2, x + w / 2 + 8, y - 8, C.darkbrown);
}

function paint(p: Painter, g: Game) {
  // paper walls with dark timber frames
  p.rect(0, 0, 320, 98, C.brandpaper);
  for (let x = 0; x < 320; x += 40) p.rect(x, 0, 4, 98, C.darkbrown);
  p.rect(0, 0, 320, 6, C.darkbrown);
  p.rect(0, 40, 320, 3, C.darkbrown);
  for (let x = 4; x < 320; x += 40) for (let xx = x + 12; xx < x + 40; xx += 12) p.vline(xx, 6, 39, C.brandmist);
  p.rect(0, 92, 320, 6, C.darkbrown);
  // tatami floor
  p.gradV(0, 98, 320, 46, [C.sand, C.sandshade]);
  for (const [x, y, w, h] of [[0, 98, 90, 18], [90, 98, 70, 18], [160, 98, 100, 18], [260, 98, 60, 18], [0, 116, 120, 28], [120, 116, 110, 28], [230, 116, 90, 28]]) {
    p.frame(x, y, w, h, C.darkgreen);
    for (let yy = y + 3; yy < y + h; yy += 3) p.hline(x + 2, x + w - 3, yy, [C.sand, C.sandshade, 'h']);
  }
  // the water-curtain doorway back out (animated in anim)
  p.rect(6, 34, 34, 64, C.navy);
  p.frame(4, 32, 38, 66, C.darkbrown);
  // wall scrolls of wisdom
  scroll(p, 60, 12, ['LGTM', 'IS NOT A', 'REVIEW']);
  scroll(p, 130, 12, ['NIT:', 'BE KIND']);
  scroll(p, 248, 12, ['REBASE', 'IS NOT', 'A CRIME']);
  // the gong
  p.rect(196, 46, 3, 46, C.darkbrown);
  p.rect(232, 46, 3, 46, C.darkbrown);
  p.rect(192, 44, 47, 4, C.darkbrown);
  p.circle(215, 66, 14, C.gold);
  p.circle(215, 66, 11, C.yellow);
  p.circle(215, 66, 4, C.gold);
  p.line(208, 48, 210, 53, C.darkgray); p.line(222, 48, 220, 53, C.darkgray);
  // rack of giant red pens
  p.rect(262, 58, 50, 4, C.darkbrown);
  p.rect(262, 80, 50, 4, C.darkbrown);
  p.rect(264, 58, 3, 36, C.darkbrown); p.rect(307, 58, 3, 36, C.darkbrown);
  for (let i = 0; i < 4; i++) {
    const x = 270 + i * 10;
    p.rect(x, 50, 3, 40, C.red);
    p.poly([[x, 50], [x + 1, 44], [x + 3, 50]], C.white);
    p.px(x + 1, 44, C.ink);
    p.rect(x - 1, 86, 5, 4, C.darkgray);
  }
  // the bonsai dependency tree on a low table
  p.rect(70, 82, 50, 4, C.darkbrown);
  p.rect(74, 86, 3, 8, C.darkbrown); p.rect(113, 86, 3, 8, C.darkbrown);
  p.rect(84, 76, 22, 6, C.darkred);
  p.line(95, 76, 92, 66, C.brown); p.line(92, 66, 84, 60, C.brown); p.line(92, 66, 102, 58, C.brown);
  p.line(84, 60, 80, 54, C.brown); p.line(102, 58, 108, 52, C.brown); p.line(102, 58, 98, 50, C.brown);
  for (const [x, y] of [[84, 58], [80, 52], [102, 56], [108, 50], [98, 48]]) p.ellipse(x, y, 5, 3, C.green);
  for (const [x, y] of [[80, 52], [108, 50], [98, 48], [84, 58]]) p.px(x, y, C.yellow);
  // meditation cushion
  p.ellipse(160, 122, 14, 4, C.brandblue);
  p.ellipse(160, 121, 12, 3, C.brandbluelight);
  // the straw man
  p.rect(146, 54, 2, 40, C.wood);
  p.ellipse(147, 58, 6, 6, C.yellow);
  p.rect(140, 64, 14, 18, C.yellow);
  p.line(138, 68, 156, 68, C.wood);
  p.px(145, 57, C.ink); p.px(149, 57, C.ink);
  p.hline(145, 149, 61, C.darkbrown);
  textOn(p, 'ARG', 140, 70, C.darkbrown);
  // candles
  p.rect(164, 92, 28, 3, C.darkbrown);
  p.rect(166, 95, 2, 4, C.darkbrown); p.rect(188, 95, 2, 4, C.darkbrown);
  for (const x of [170, 182]) { p.rect(x, 82, 4, 10, C.glow); p.vline(x + 3, 82, 91, C.sandshade); p.rect(x - 2, 90, 8, 2, C.gold); }
  if (g.flag('masterBeaten')) { p.circle(302, 50, 3, C.gold); p.px(302, 50, C.yellow); } // a medal on the rack for the champion
}

function anim(p: Painter, _g: Game, t: number) {
  // the falling water curtain at the doorway
  for (let x = 8; x < 40; x += 2) {
    const off = Math.floor((t / 35 + x * 5) % 10);
    for (let y = 34 + off; y < 98; y += 10) p.vline(x, y, Math.min(97, y + 5), (x / 2) % 2 ? C.sea : C.foam);
  }
  flame(p, 172, 82, t, 1);
  flame(p, 184, 82, t, 2);
  // incense smoke from the bonsai table
  for (let i = 0; i < 4; i++) {
    const k = ((t / 40 + i * 12) % 48);
    p.px(Math.round(117 + Math.sin((t / 300) + i + k / 8) * 2), Math.round(80 - k), C.lightgray);
  }
}

async function explainAgents(g: Game) {
  await g.sayAs('master', [
    'An AI Agent is an AI that does not just answer. It ACTS.',
    'It reads a goal, picks a tool, looks at what happened, and decides the next step. Again and again until done.',
    'In Drupal, agents use the tools of the Tool API: create content, search, translate, change settings.',
    'But an agent may only use the tools YOU give it, with the permissions YOU allow. Trust, but review.',
  ]);
}

/** The last step of the review: Mac describes his own pull request. In his own words. */
async function pullRequest(g: Game) {
  await g.sayAs('master', ['One more thing. Every change needs a pull request. Open yours.', 'Describe it. What did you do?']);
  for (;;) {
    const pick = await g.choose([
      { id: 'agent', text: "I'll let my agent write it. It's great with words." },
      { id: 'short', text: 'Fixed stuff. :)' },
      { id: 'own', text: 'In my own words: I learned eight kinds of bug. By getting each one wrong first.' },
    ]);
    if (pick === 'agent') {
      await g.say("I'll let my agent write it. It's great with words.");
      await g.narrate('> Agent: "This pull request delves into a comprehensive, robust journey of seamless code review excellence."');
      await g.sayAs('master', ['Rejected.', 'I asked what YOU did. The agent was not there. It did not get anything wrong. You did. That is the valuable part.']);
    } else if (pick === 'short') {
      await g.say('Fixed stuff. :)');
      await g.sayAs('master', 'Your own words, yes. But too few of them. What changed? Why?');
    } else {
      await g.say(['In my own words: I learned eight kinds of bug. By getting each one wrong first.', 'Lenny, Bianca and Nell explained every one of them. And today I found them in your patches.']);
      await g.sayAs('master', [
        'Approved.',
        'An agent may help you write the code. But the pull request is you, talking to the people who review it.',
        'Your words. Your name. Your responsibility. Never let a machine speak for you there.',
      ]);
      return;
    }
  }
}

async function challenge(g: Game) {
  await g.sayAs('master', [
    'Very well. My patches were written by AI agents. Agents write fast, and they make the mistakes you have seen at the crossroads.',
    'Better hidden. Find what is wrong. One miss, I forgive. Two, I do not.',
  ]);
  const won = await g.duel('master');
  if (won) {
    g.set('masterBeaten');
    await g.sayAs('master', ['...', 'No comments. I have not said that since 2009.']);
    await pullRequest(g);
    await g.sayAs('master', 'You are ready. Take this scroll.');
    g.give('agents');
    await g.say('Master Rebase hands me a scroll: "AI AGENTS".');
    await explainAgents(g);
    await trialComplete(g, 'TRIAL OF THE AGENTS', 'You out-reviewed the reviewer.');
  } else {
    await g.sayAs('master', [
      'Changes requested. Many changes.',
      'Go back to the crossroads. Let the reviewers show you every bug you missed. Then return.',
    ]);
  }
  return 'end';
}

export const dojoDialogues: Dialogue[] = [
  {
    id: 'master',
    with: 'master',
    start: async (g) => {
      if (!g.flag('masterMet')) {
        g.set('masterMet');
        await g.sayAs('master', [
          'So. Someone walked through the Waterfall.',
          'Nobody uses the Waterfall anymore. That is why I live here. Excellent for concentration.',
          'I am Master Rebase. I review the reviewers.',
        ]);
      } else if (g.flag('masterBeaten')) await g.sayAs('master', 'The student returns. Your diffs are looking clean.');
      else await g.sayAs('master', 'You are dripping on my tatami. Speak.');
    },
    options: [
      {
        id: 'teach', text: 'Teach me about AI Agents!',
        when: (g) => !g.flag('masterBeaten'),
        run: (g) => g.sayAs('master', [
          'Agents? Hmph. An agent acts on its own judgement. Do I trust YOUR judgement? Not yet.',
          'Review my patches. Find what is wrong with them. Then I will teach you.',
        ]),
      },
      {
        id: 'duel', text: 'I challenge you to a Code Review!',
        when: (g) => !g.flag('masterBeaten'),
        run: challenge,
      },
      {
        id: 'again', text: 'Tell me about agents again.',
        when: (g) => !!g.flag('masterBeaten'),
        run: explainAgents,
      },
      {
        id: 'rebase', text: "Why 'Rebase'?", once: true,
        run: async (g) => {
          await g.sayAs('master', 'Because I rewrite history.');
          await g.say("Isn't that dangerous?");
          await g.sayAs('master', 'Only for everyone who pulled before me.');
        },
      },
      {
        id: 'nell', text: 'Do you know Nitpick Nell?', once: true, when: (g) => !!g.flag('met:nell'),
        run: (g) => g.sayAs('master', [
          'Nell. My finest student. She surpassed me years ago.',
          'I rewrite history. Nell writes the kind of code that never needs rewriting.',
          'She stays at the crossroads because that is where the newcomers are. That is the difference between a master and a great one.',
        ]),
      },
      {
        id: 'pens', text: 'Nice pens.', once: true,
        run: (g) => g.sayAs('master', 'Each one belonged to a reviewer I defeated. That one wrote "nit" four thousand times.'),
      },
      {
        id: 'bye', text: 'I must go. My people need me.', end: true,
        run: (g) => g.sayAs('master', g.flag('masterBeaten') ? 'Go. Merge with confidence.' : 'They need someone who can spot a bug. Go and learn.'),
      },
    ],
  },
];

export const dojo: RoomDef = {
  id: 'dojo',
  name: 'Dojo of the Code Review Master',
  width: 320,
  paint,
  anim,
  bgKey: (g) => (g.flag('masterBeaten') ? 'won' : 'open'),
  scale: [100, 0.9, 143, 1.04],
  walk: [[[10, 102], [310, 102], [318, 143], [2, 143]]],
  start: [34, 124],
  startFace: 'right',
  npcs: [{ id: 'master', at: [248, 126], face: 'left' }],
  enter: async (g) => {
    if (!g.flag('dojoSeen')) {
      g.set('dojoSeen');
      await g.say(['A dojo! Behind the Waterfall! Paper walls, tatami, and an alarming number of red pens.', 'Somewhere a gong is waiting to be hit.']);
    }
  },
  hotspots: [
    {
      id: 'curtain', name: 'water curtain', rect: [4, 32, 38, 66], walkTo: [22, 108], face: 'left',
      look: 'The back of the Waterfall. From in here it looks almost peaceful. Like a spec you have not read yet.',
      exit: { to: 'waterfall' },
    },
    {
      id: 'scroll1', name: 'scroll', rect: [56, 4, 60, 40],
      look: '"LGTM IS NOT A REVIEW." Underneath, in tiny letters: "Neither is a thumbs-up emoji."',
    },
    {
      id: 'scroll2', name: 'scroll', rect: [126, 4, 60, 30],
      look: '"NIT: BE KIND." Review the code, not the person. Unless the person is the code. Then be extra kind.',
    },
    {
      id: 'scroll3', name: 'scroll', rect: [244, 4, 60, 40],
      look: '"REBASE IS NOT A CRIME." Someone has added "...in most jurisdictions."',
    },
    {
      id: 'gong', name: 'gong', rect: [192, 44, 46, 50], walkTo: [214, 108], face: 'back',
      look: 'A big brass gong. For announcing merges, release days and the occasional lunch.',
      push: async (g) => {
        g.shake();
        await g.say('*BWONNNNG*');
        await g.sayAs('master', g.flag('masterBeaten') ? 'Ah. A merge. Congratulations.' : 'Hitting the gong does not merge your pull request. I have checked.');
      },
      use: async (g) => {
        g.shake();
        await g.say('*BWONNNNG*');
        await g.sayAs('master', 'Please. Only on release days.');
      },
    },
    {
      id: 'penrack', name: 'rack of red pens', rect: [260, 40, 52, 56], walkTo: [282, 108], face: 'back',
      look: 'Giant red pens, racked like swords. The reviewer\'s weapon. Mightier than the sword, and much more passive-aggressive.',
      pickup: (g) => g.sayAs('master', 'Those are earned, not borrowed. Like commit access.'),
    },
    {
      id: 'bonsai', name: 'bonsai dependency tree', rect: [68, 44, 54, 50], walkTo: [94, 108], face: 'back',
      look: [
        'A bonsai "dependency tree". Every branch depends on another branch.',
        'Prune one leaf, and three others turn yellow. Very realistic.',
      ],
      pickup: 'Moving it would break the dependencies. All of them. Forever.',
      use: "I'm not touching it. That's how you end up with 'left-pad' all over again.",
    },
    {
      id: 'strawman', name: 'straw man', rect: [136, 50, 22, 44], walkTo: [148, 108], face: 'back',
      look: 'A straw man. Easy to knock down, which is the whole point of straw men. Popular in comment sections.',
      push: 'I push it over. Victory! It changes nothing about the actual argument.',
      talk: 'I argue with the straw man. I win. I feel strangely empty.',
    },
    {
      id: 'cushion', name: 'meditation cushion', rect: [144, 116, 32, 10],
      look: 'A meditation cushion on the tatami. The mats are aligned perfectly. The Master runs a linter on the floor.',
      use: 'I sit, close my eyes and think about nothing. My brain immediately thinks about merge conflicts.',
    },
    {
      id: 'candles', name: 'candles', rect: [166, 70, 24, 26],
      look: 'Two candles. The Master burns them at both ends, like a release week.',
      pickup: "They're lit. My fingers are not in the mood.",
    },
    {
      id: 'master', name: 'Master Rebase', actor: 'master',
      look: (g) => g.say(g.flag('masterBeaten')
        ? 'Master Rebase. She nods at me like a fellow maintainer. I feel taller.'
        : 'Master Rebase: the Code Review Master. Calm, deadly, with a red pen the length of a sword.'),
      talk: (g) => g.talk('master'),
      giveItem: {
        herring: (g) => g.sayAs('master', 'A red herring. Distracting the reviewer. Classic. Rejected.'),
      },
      anyItem: (g) => g.sayAs('master', 'No gifts. Only diffs.'),
    },
  ],
};
