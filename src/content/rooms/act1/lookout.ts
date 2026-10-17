import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, cloud, sea, rock, bush, grassTufts, signpost, seagull, windowPane, textOn } from '../../art';
import { plaque } from '../../art1';

function paint(p: Painter, g: Game) {
  sky(p, 320, 96, 'day');
  cloud(p, 70, 18, 1.1);
  cloud(p, 230, 30, 0.9);
  // the sea far below, with the fog bank
  sea(p, 120, 70, 200, 30);
  for (let i = 0; i < 9; i++) p.ellipse(150 + i * 20, 70 - (i % 3) * 2, 18, 8, [C.fog, C.lightgray]);
  // distant beach & wreck mast
  p.poly([[230, 100], [320, 92], [320, 102], [230, 104]], C.sand);
  p.vline(262, 80, 98, C.darkbrown);

  // cliff plateau, bending toward the edge on the right
  p.poly([[0, 88], [60, 84], [140, 90], [220, 96], [270, 100], [300, 104], [320, 108], [320, 144], [0, 144]], C.green);
  p.gradV(0, 100, 320, 44, [C.green, C.darkgreen]);
  p.poly([[0, 88], [60, 84], [140, 90], [220, 96], [270, 100], [300, 104], [320, 108], [320, 112], [0, 100]], C.lime);
  grassTufts(p, 0, 100, 320, 42, 12, C.darkgreen);
  // cliff face on the far right, path down
  p.poly([[296, 112], [320, 110], [320, 144], [300, 144]], C.stone);
  p.poly([[286, 120], [320, 122], [320, 140], [292, 142]], [C.sand, C.tan, '25']);
  rock(p, 268, 112, 20, 9, 4);

  // Cron's log cabin (literally a cabin made of logs. /var/log.)
  p.poly([[0, 34], [48, 30], [58, 42], [0, 46]], C.darkbrown);
  for (let y = 46; y < 100; y += 6) {
    p.rect(0, y, 54, 6, (y / 6) % 2 ? C.wood : C.woodlight);
    p.circle(54, y + 3, 3, C.tan);
    p.circle(54, y + 3, 1, C.wood);
  }
  windowPane(p, 14, 58, 18, 14, C.skyblue, C.darkbrown);
  p.rect(36, 74, 14, 26, C.darkbrown);
  plaque(p, 4, 48, ['/var/log'], C.darkbrown, C.sand, C.wood);

  // crontab standing stone
  rock(p, 66, 104, 26, 30, 21, C.stone, C.stoneshade);
  textOn(p, '* * *', 69, 82, C.ink);
  textOn(p, '* *', 73, 91, C.ink);

  // rocking chair (Cron sits in front of it)
  p.rect(100, 92, 3, 34, C.wood);
  p.rect(121, 92, 3, 34, C.wood);
  for (let i = 0; i < 4; i++) p.hline(101, 123, 95 + i * 6, C.woodlight);
  p.poly([[94, 130], [130, 130], [134, 127], [131, 131], [93, 132], [90, 128]], C.wood);

  // side table with a broken alarm clock
  p.rect(140, 112, 18, 3, C.woodlight);
  p.rect(142, 115, 2, 12, C.wood);
  p.rect(154, 115, 2, 12, C.wood);
  p.circle(149, 107, 5, C.red);
  p.circle(149, 107, 3, C.white);
  p.line(149, 107, 149, 105, C.ink);
  p.line(149, 107, 151, 108, C.ink);
  p.circle(145, 102, 2, C.gold); p.circle(153, 102, 2, C.gold);

  // sundial
  p.rect(198, 112, 10, 14, C.stone);
  p.ellipse(203, 112, 10, 3, C.lightgray);
  p.poly([[203, 112], [209, 105], [209, 112]], C.darkgray);

  // telescope on a tripod, pointing out to sea
  p.line(232, 124, 238, 104, C.darkbrown);
  p.line(246, 124, 239, 104, C.darkbrown);
  p.line(239, 126, 239, 104, C.wood);
  p.poly([[226, 102], [252, 92], [254, 97], [228, 106]], C.gold);
  p.poly([[252, 92], [258, 90], [259, 96], [254, 97]], C.brown);
  p.hline(232, 246, 100, C.olive);

  // sign
  signpost(p, 150, 58, 74, ['CRON RUNS:', 'every hour*', '*if visited'], 18, C.woodlight, C.darkbrown);
  bush(p, 300, 96, 1);
  bush(p, 168, 92, 0.7);
  // flowers
  for (const [x, y, c] of [[170, 134, C.brandpink], [182, 139, C.yellow], [214, 136, C.brandpink], [30, 132, C.yellow], [44, 138, C.lavender]] as const) {
    p.vline(x, y, y + 4, C.darkgreen);
    p.circle(x, y, 1.5, c);
  }
}

function anim(p: Painter, g: Game, t: number) {
  seagull(p, 190 + Math.sin(t / 2800) * 50, 40 + Math.sin(t / 700) * 3, t);
  // Zzz while Cron sleeps
  if (!g.flag('cronUp')) {
    const k = (t / 1400) % 1;
    const n = Math.floor(t / 1400) % 3;
    const z = ['z', 'Z', 'z'][n];
    textOn(p, z, 124 + Math.round(k * 10), 80 - Math.round(k * 16), C.white);
    textOn(p, 'z', 120 + Math.round(((k + 0.5) % 1) * 8), 86 - Math.round(((k + 0.5) % 1) * 12), C.lightgray);
  }
}

async function wakeCron(g: Game) {
  g.set('cronUp');
  g.actor('cron').gesture = undefined;
  g.face('left');
}

async function sleepCron(g: Game, line = 'Cron run completed in 0.3 seconds. Zzzz...') {
  await g.sayAs('cron', line);
  g.set('cronUp', false);
  g.actor('cron').gesture = 'sleep';
}

async function refreshCron(g: Game) {
  await g.say('I press F5 right next to his ear.');
  g.shake();
  await wakeCron(g);
  if (!g.flag('cronAwake')) {
    g.set('cronAwake');
    await g.sayAs('cron', ['HUH? WHO REFRESHED ME?', 'Oh! A visitor! I only run when somebody visits. Poor man\'s cron, they call me.', "I'm not poor. I'm... frugal with my CPU."]);
    await g.say("I'm Mac. Mac Packwala. Drupal site builder. Recently shipwrecked.");
    await g.sayAs('cron', [
      'Shipwrecked! Then you know where you are? No. Nobody knows where they are.',
      'This is Legacy Island. Home of every content system that was never upgraded.',
      'Around it lies the Fog of Technical Debt. Every year it grows a little thicker.',
      'No ship can find the island. Not without exact coordinates.',
    ]);
    await g.say('So how does anyone get off?');
    await g.sayAs('cron', [
      'Legend speaks of Captain Node: an airship captain, round as a node, who sails the seas of Slack.',
      'She rescues stranded site builders. But only if they speak the right protocol.',
      'Go to town. The Grand Maintainer knows the old ways. If he is awake. He usually is not.',
    ]);
    await g.talk('cron');
    await sleepCron(g);
    return;
  }
  if (g.flag('nodeContacted') && !g.flag('got:starlog')) {
    await g.sayAs('cron', ['A visit! Ah, and it is the top of the hour! Somewhere. Time for my scheduled job:', 'STAR SIGHTING. Every hour, on the hour, when visited.']);
    g.fx('flash', 150);
    await g.sayAs('cron', 'Star one... star two... star three. Logged!');
    g.give('starlog');
    await g.sayAs('cron', ['Here, take a copy of the log. I log everything. It\'s a cabin made of logs, after all.', 'But stars alone are just angles. You will need reference digits from somewhere.']);
    await giveEca(g);
    await sleepCron(g);
    return;
  }
  if (g.flag('got:starlog') && !g.flag('got:eca')) {
    await g.sayAs('cron', 'A visit! Ah, it\'s you. I forgot to give you something last time. I forget everything between runs.');
    await giveEca(g);
    await sleepCron(g);
    return;
  }
  await g.sayAs('cron', g.random(['Whuh? A visitor! Running scheduled tasks...', 'Page load detected! Cron starting...']));
  await g.talk('cron');
  await sleepCron(g);
}

async function giveEca(g: Game) {
  await g.sayAs('cron', [
    'And take this. An ECA rule card. Every scheduler should carry one.',
    "You see, I'm only the WHEN. \"Every hour.\" That's all I know.",
    'ECA is the whole sentence: WHEN this happens, IF that is true, THEN do this. Event, Condition, Action.',
  ]);
  g.give('eca');
  await g.say("A rule card. It looks like it could make things happen while I'm somewhere else. I like that in a card.");
}

export const lookoutDialogues: Dialogue[] = [
  {
    id: 'cron',
    with: 'cron',
    options: [
      {
        id: 'what', text: "What is a cron, anyway?", once: true,
        run: (g) => g.sayAs('cron', [
          'Cron runs scheduled jobs: clearing caches, sending emails, importing feeds, tidying up.',
          'A real cron runs on a timer. A poor man\'s cron only runs when somebody visits the website.',
          'So on a quiet site, nothing happens for weeks. Very restful.',
        ]),
      },
      {
        id: 'node', text: 'Tell me more about Captain Node.',
        run: (g) => g.sayAs('cron', [
          "Captain Node! Round as a node in a graph. Captain's cap, pilot goggles, and arms like little edges. Always smiling.",
          'She answers anyone who reaches her the proper way. Through a protocol, a server, a... Model Context something.',
        ]),
      },
      {
        id: 'fog', text: 'Why is the fog called technical debt?',
        run: (g) => g.sayAs('cron', [
          'Every shortcut taken on this island turned into a little cloud.',
          '"We\'ll fix it later." Puff. "Just this once." Puff. "Nobody will notice." Puff puff puff.',
        ]),
      },
      {
        id: 'clock', text: 'Your alarm clock is broken.', once: true,
        run: (g) => g.sayAs('cron', ['Of course it is. If it worked, I\'d be a real cron.', 'And then who would I be?']),
      },
      {
        id: 'stars', text: 'What do you look at with that telescope?', when: (g) => g.flag('cronAwake'),
        run: (g) => g.sayAs('cron', ['Stars. I log their positions on schedule. Well. On visit.', 'Stars never miss a deadline. Very inspiring. I find it exhausting.']),
      },
      { id: 'bye', text: 'Go back to sleep, Cron.', end: true },
    ],
  },
];

export const lookout: RoomDef = {
  id: 'lookout',
  name: "Old Cron's Lookout",
  paint,
  anim,
  scale: [100, 0.82, 143, 1],
  walk: [[[0, 108], [60, 106], [140, 108], [220, 110], [280, 116], [306, 120], [320, 124], [320, 143], [0, 143]]],
  start: [290, 126],
  startFace: 'left',
  npcs: [{ id: 'cron', at: [112, 128], face: 'right' }],
  enter: (g) => {
    g.set('cronUp', false);
    g.actor('cron').gesture = 'sleep';
  },
  hotspots: [
    {
      id: 'downpath', name: 'path down to the beach', rect: [288, 112, 32, 32], walkTo: [306, 132],
      exit: { to: 'beach', at: [22, 112], face: 'right' },
      look: 'The path winds back down to the beach.',
    },
    {
      id: 'cron', name: 'Old Cron', actor: 'cron',
      look: (g) => g.say(g.flag('cronAwake')
        ? ['Old Cron, asleep again. He runs only when visited. Apparently I don\'t count unless I reload.']
        : ['An old man in a nightcap, fast asleep in a rocking chair.', 'A sign says he runs "every hour". It doesn\'t say every hour of what.']),
      talk: async (g) => {
        await g.say(g.random(['Hello? Mister Cron?', 'Wake up! Visitor!', 'Excuse me, sir?']));
        await g.sayAs('cron', g.random([
          'Zzz... only run... when someone visits... zzz...',
          'Mmm... five more minutes... or until the next page load...',
          'Zzz... cache... cleared... zzz...',
        ]));
        await g.say(g.random(["I AM visiting! I guess I'm not the right kind of visit.", 'Maybe he needs an actual page load. A refresh.']));
      },
      useItem: { f5key: refreshCron },
      push: "I give him a gentle push. He rocks back and forth and mumbles 'cache rebuild complete'.",
      pull: "Pulling his beard seems rude. Even for an adventure game.",
      pickup: "He's not going in my backpack. Although he'd probably sleep through it.",
      giveItem: {
        duck: "He doesn't need a rubber duck. He needs an alarm clock that works.",
      },
    },
    {
      id: 'chair', name: 'rocking chair', rect: [94, 90, 34, 14],
      look: 'A rocking chair worn smooth by years of not running on schedule.',
      push: 'Rocking it just sends him deeper into sleep. Like a lullaby for daemons.',
    },
    {
      id: 'telescope', name: 'telescope', rect: [224, 88, 38, 38], walkTo: [222, 128], face: 'right',
      look: 'A brass telescope pointed out to sea. Engraved: "Property of Cron. Scheduled use only."',
      use: async (g) => {
        await g.say(['I look through the telescope...', 'Fog. Fog. More fog. A seagull. Fog.', 'Somewhere out there is the real world, with version numbers that start with a 1 or higher.']);
      },
      pickup: "It's bolted to the tripod. Cron really doesn't like changes.",
      push: "Then it would point at the ground. I've seen enough ground.",
    },
    {
      id: 'cabin', name: 'log cabin', rect: [0, 30, 58, 70], walkTo: [40, 112], face: 'back',
      look: ["Cron's log cabin. It's made entirely of logs. A plaque says /var/log.", 'Every log has a timestamp carved into it.'],
      open: 'Locked. A note on the door: "Gone sleeping. Back at next page load."',
      use: 'Locked. A note on the door: "Gone sleeping. Back at next page load."',
    },
    {
      id: 'crontab', name: 'crontab stone', rect: [64, 72, 30, 34], walkTo: [80, 114], face: 'back',
      look: [
        'An ancient standing stone carved with asterisks: "* * * * *".',
        'In cron language that means "every minute". Ambitious, for a man who sleeps all day.',
      ],
      push: 'It has been here for centuries. Like most crontab entries nobody dares to delete.',
      pickup: "It's a standing stone. It's very committed to standing.",
    },
    {
      id: 'clock', name: 'broken alarm clock', rect: [140, 98, 20, 30], walkTo: [148, 132], face: 'back',
      look: 'An alarm clock. Both hands point to "whenever". The bells have been removed. Carefully.',
      pickup: "It's broken. I already have a giant F5 key, I'm good on wake-up devices.",
      use: "I wind it up. It ticks once, then gives up. Like a side project.",
    },
    {
      id: 'sundial', name: 'sundial', rect: [192, 102, 20, 24], walkTo: [202, 130], face: 'back',
      look: ['A sundial. It says 00:00, 1 January 1970.', 'The Unix epoch. The moment computers think time began. Apparently it also stopped here.'],
      push: "It doesn't turn. Time is frozen here. Like a code freeze, but forever.",
    },
    {
      id: 'sign', name: 'sign', rect: [148, 56, 78, 34], walkTo: [186, 114], face: 'back',
      look: ['"CRON RUNS: every hour*"', '"*when visited."', "The small print always gets you."],
    },
    {
      id: 'fog', name: 'fog bank', rect: [140, 56, 180, 22], noWalk: true,
      look: ['The Fog of Technical Debt, from up here. It surrounds the whole island.', 'It moves slowly, like a refactoring project.'],
    },
    {
      id: 'sea', name: 'sea', rect: [120, 78, 200, 18], noWalk: true,
      look: 'The sea, far below. The shipwreck is down there, still sulking.',
    },
    {
      id: 'flowers', name: 'flowers', rect: [166, 128, 52, 14],
      look: "Wild flowers. They bloom on schedule. Cron finds this deeply annoying.",
      pickup: "I'll leave them. They're the only things on this island that run on time.",
    },
  ],
};
