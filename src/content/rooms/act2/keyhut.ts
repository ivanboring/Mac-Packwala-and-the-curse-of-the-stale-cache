import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, planks, windowPane, door, barrel, textOn, centeredText } from '../../art';
import { rope } from '../../art2';
import { rng } from '../../../engine/rng';

function key(p: Painter, x: number, y: number, c = C.gold) {
  p.circle(x, y, 2, c);
  p.px(x, y, C.darkbrown);
  p.vline(x, y + 2, y + 8, c);
  p.px(x + 1, y + 6, c); p.px(x + 1, y + 8, c);
}

function padlock(p: Painter, x: number, y: number) {
  p.rect(x, y + 2, 5, 4, C.gold);
  p.rect(x + 1, y, 3, 1, C.lightgray); p.px(x, y + 1, C.lightgray); p.px(x + 4, y + 1, C.lightgray);
  p.px(x + 2, y + 3, C.darkbrown);
}

function paint(p: Painter, g: Game) {
  // walls: dark planks, low ceiling beams
  planks(p, 0, 0, 320, 104, true, C.wood, C.brown, 12);
  p.rect(0, 0, 320, 8, C.darkbrown);
  for (let x = 10; x < 320; x += 70) p.rect(x, 8, 6, 96, C.darkbrown);
  // floor
  planks(p, 0, 104, 320, 40, false, C.woodlight, C.wood, 13);
  p.hline(0, 319, 104, C.darkbrown);
  // the door on the left, with seven padlocks
  door(p, 12, 44, 26, 60, C.brown);
  for (let i = 0; i < 7; i++) padlock(p, 30 + (i % 2) * 4, 50 + i * 7);
  // window with bars
  windowPane(p, 120, 26, 34, 26, C.skyblue, C.darkbrown);
  for (let i = 0; i < 5; i++) p.vline(122 + i * 7, 26, 51, C.darkgray);
  // the sign of rules
  p.rect(166, 18, 76, 40, C.sand);
  p.frame(166, 18, 76, 40, C.darkbrown);
  centeredText(p, 'SECRETS GO IN', 204, 21, C.darkred);
  centeredText(p, 'THE VAULT.', 204, 30, C.darkred);
  centeredText(p, 'NOT IN CONFIG.', 204, 39, C.darkbrown);
  centeredText(p, 'NOT IN GIT.', 204, 48, C.darkbrown);
  // post-it notes, ironically
  const notes: [number, number, number][] = [[246, 22, C.yellow], [256, 30, C.pink], [248, 40, C.lime], [260, 44, C.yellow]];
  for (const [x, y, c] of notes) { p.rect(x, y, 10, 9, c); p.hline(x + 1, x + 7, y + 3, C.gray); p.hline(x + 1, x + 5, y + 5, C.gray); }
  // pegboard of keys
  p.rect(60, 30, 50, 34, C.tan);
  p.frame(60, 30, 50, 34, C.darkbrown);
  const r = rng(5);
  for (let i = 0; i < 12; i++) key(p, 65 + (i % 6) * 8, 34 + Math.floor(i / 6) * 14, r.pick([C.gold, C.lightgray, C.yellow, C.orange]));
  // the vault
  const vx = 236, vy = 58;
  p.rect(vx + 4, vy + 4, 62, 60, C.darkbrown);
  p.rect(vx, vy, 62, 58, C.gray);
  p.frame(vx, vy, 62, 58, C.darkgray);
  p.rect(vx + 4, vy + 4, 54, 50, g.flag('vaultOpen') ? C.darkgray : C.lightgray);
  if (g.flag('vaultOpen')) {
    // open: tiny labelled drawers inside, door swung out
    for (let r2 = 0; r2 < 4; r2++) for (let c2 = 0; c2 < 4; c2++) {
      p.rect(vx + 7 + c2 * 13, vy + 7 + r2 * 12, 11, 9, C.stone);
      p.rect(vx + 11 + c2 * 13, vy + 10 + r2 * 12, 3, 2, C.gold);
    }
    p.poly([[vx + 58, vy], [vx + 76, vy + 6], [vx + 76, vy + 52], [vx + 58, vy + 58]], C.gray);
  } else {
    p.circle(vx + 31, vy + 27, 12, C.gray);
    p.circle(vx + 31, vy + 27, 9, C.darkgray);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      p.px(vx + 31 + Math.round(Math.cos(a) * 10), vy + 27 + Math.round(Math.sin(a) * 10), C.white);
    }
    p.rect(vx + 29, vy + 18, 4, 7, C.lightgray);
    p.rect(vx + 46, vy + 24, 8, 3, C.darkgray);
    textOn(p, 'VAULT', vx + 18, vy + 44, C.darkgray);
  }
  // cot with a padlocked pillow
  p.rect(84, 96, 52, 14, C.darkbrown);
  p.rect(86, 92, 48, 6, C.brandblue);
  p.rect(88, 89, 12, 5, C.white);
  padlock(p, 92, 86);
  // table with padlocked teapot
  p.rect(150, 92, 34, 4, C.woodlight);
  p.rect(152, 96, 3, 14, C.wood); p.rect(179, 96, 3, 14, C.wood);
  p.ellipse(166, 87, 6, 5, C.white);
  p.rect(171, 84, 4, 2, C.white);
  padlock(p, 160, 80);
  // barrel of spare keys
  barrel(p, 296, 104, 16, 22);
  for (let i = 0; i < 5; i++) key(p, 299 + i * 3, 98 + (i % 2) * 2);
  // door mat
  p.poly([[14, 115], [58, 115], [62, 125], [10, 125]], C.red);
  textOn(p, 'GO AWAY', 16, 117, C.white);
}

function anim(p: Painter, _g: Game, t: number) {
  // keys hanging from the ceiling, swaying in the draft
  const r = rng(77);
  for (let i = 0; i < 16; i++) {
    const x = 20 + i * 19 + r.int(-4, 4);
    const rl = r.int(6, 22);
    const len = x > 158 && x < 280 ? Math.min(rl, 6) : x > 112 && x < 160 ? Math.min(rl, 14) : rl;
    const sway = Math.round(Math.sin(t / 900 + i) * 1.5);
    rope(p, x, 8, 8 + len);
    key(p, x + sway, 8 + len, r.pick([C.gold, C.lightgray, C.yellow]));
  }
}

async function storeKey(g: Game) {
  if (!g.flag('vaultOpen')) {
    await g.sayAs('keykeeper', ["AAARGH! Don't wave a raw secret around in here!", 'Put it AWAY. Prove you are not the committing kind first.']);
    return;
  }
  g.take('apikey');
  g.give('keyentity');
  g.set('keyStored');
  await g.sayAs('keykeeper', [
    'Into the vault it goes. Drawer 7B. Labelled "cloud_idols".',
    'Now your config only says "use the key called cloud_idols". Never the secret itself.',
    'Export your config, share it, shout it from the lighthouse. Nobody learns a thing.',
  ]);
  await g.say("So the Key module is basically a very paranoid coat check. I like it.");
}

async function giveMetering(g: Game) {
  await g.sayAs('keykeeper', [
    "Count? COUNT? I count everything! Keys: 4,112. Padlocks: 311. Times you have said \"um\" since you came in: 6.",
    'Let me guess. You let a machine call the idols ten thousand times, and nobody was counting.',
  ]);
  await g.say('...It was for buckets.');
  await g.sayAs('keykeeper', [
    'Every call to the idols costs tokens, and tokens cost money. Here. Take this. AI Metering.',
    'It counts every token on every call through the AI module, and works out roughly what it costs.',
    'You set a quota: so many tokens per user, or per role. A budget. And it keeps a log of every single call.',
    'Dashboards, too. Who spent what, and when. I check mine hourly. Recreationally.',
    'And here is the best part: when someone goes over budget, the meter stops the request BEFORE it reaches the cloud.',
    'Block it. Or send it to a local model instead, like that slow llama in the temple. No surprise bills. Ever.',
  ]);
  g.give('metering');
  await g.say("A paranoid accountant for AI. Fit it to the idols, set a sensible budget, and they should let me back in.");
  await g.sayAs('keykeeper', 'SENSIBLE, mind. If you write "unlimited" I will hear about it. I hear about everything.');
}

export const keyhutDialogues: Dialogue[] = [
  {
    id: 'keykeeper',
    with: 'keykeeper',
    start: async (g) => {
      if (!g.flag('keykeeperMet')) {
        g.set('keykeeperMet');
        await g.sayAs('keykeeper', ['Who goes there?! State your business!', "And DON'T tell me your password. Never tell anyone your password!"]);
      } else {
        await g.sayAs('keykeeper', g.random(['You again. Did you wipe your feet? Feet can carry secrets.', 'Speak quickly. Walls have ears. I padlocked most of them.']));
      }
    },
    options: [
      {
        id: 'who', text: 'Who are you?', once: true,
        run: (g) => g.sayAs('keykeeper', [
          'I am the Key Keeper. I keep keys. Secret ones.',
          'API keys. Passwords. Tokens. Outside of config, outside of git, outside the reach of interns.',
        ]),
      },
      {
        id: 'why', text: 'Why not just put secrets in the site config?',
        run: (g) => g.sayAs('keykeeper', [
          'Config gets EXPORTED. Shared. Committed. Pushed to a public repository by a sleepy developer at 2 AM!',
          'Then a bot finds it in four seconds and you get a bill the size of this island.',
          'So: the secret lives in my vault. The config just holds its name. That is what the Key module does.',
        ]),
      },
      {
        id: 'store', text: 'Can you store an API key for me?',
        when: (g) => !g.flag('vaultOpen'),
        run: async (g) => {
          await g.sayAs('keykeeper', ['Ha! Anyone can SAY they keep secrets safe.', "Prove you're not the committing kind. Show me you know how to properly IGNORE things."]);
          g.set('keykeeperAsked');
        },
      },
      {
        id: 'store2', text: 'About that vault...',
        when: (g) => !!g.flag('vaultOpen') && !g.flag('keyStored'),
        run: (g) => g.sayAs('keykeeper', g.has('apikey') ? 'Well? Hand over the key. Slowly. No sudden commits.' : 'Bring me an API key and I will lock it up proper. The cloud idols hand them out for tokens.'),
      },
      {
        id: 'meter', text: 'The cloud idols cut me off. They say I "can\'t count".',
        when: (g) => !!g.flag('providerSuspended') && !g.flag('got:metering'),
        run: giveMetering,
      },
      {
        id: 'notes', text: 'Why are there passwords on post-it notes on your wall?', once: true,
        run: async (g) => {
          await g.sayAs('keykeeper', ['Decoys.', '...', 'Mostly decoys.', 'Stop looking at them.']);
        },
      },
      {
        id: 'keys', text: 'So many keys! Do you have one for the island?', once: true,
        run: (g) => g.sayAs('keykeeper', [
          'The island has no lock. It has FOG. You cannot unlock fog.',
          "Though if someone outside knew exactly where we were... Bah. Nobody knows where we are. That's how I like it.",
        ]),
      },
      { id: 'bye', text: 'I should go. My secrets are getting nervous.', end: true },
    ],
  },
];

export const keyhut: RoomDef = {
  id: 'keyhut',
  name: "Key Keeper's Hut",
  paint,
  anim,
  bgKey: (g) => (g.flag('vaultOpen') ? 'open' : 'shut'),
  scale: [104, 0.86, 143, 1],
  walk: [[[20, 108], [292, 108], [318, 143], [2, 143]]],
  start: [46, 128],
  startFace: 'right',
  npcs: [{ id: 'keykeeper', at: [206, 124], face: 'left' }],
  enter: async (g) => {
    if (!g.flag('keyhutSeen')) {
      g.set('keyhutSeen');
      await g.say('Wow. Keys hanging from the ceiling, locks on everything. Someone here has trust issues.');
    }
  },
  hotspots: [
    {
      id: 'keyhut_door', name: 'door', rect: [10, 44, 30, 62], walkTo: [36, 118], face: 'left',
      exit: { to: 'map' },
      look: 'The door. It has seven padlocks. On the inside.',
    },
    {
      id: 'keykeeper', name: 'Key Keeper', actor: 'keykeeper',
      look: 'An old hermit with long grey locs, a beard like a steel wool explosion and a necklace made entirely of keys.',
      talk: (g) => g.talk('keykeeper'),
      giveItem: {
        gitignore: async (g) => {
          g.take('gitignore');
          g.set('vaultOpen');
          g.set('gitignoreShown');
          await g.sayAs('keykeeper', [
            'A .gitignore! Where did you... from the tavern? Hmph. Ignatius ignores everything. Even this.',
            'A .gitignore lists the files that must NEVER be committed. Secrets go on it. You DO understand!',
            'Very well. My vault is open to you.',
          ]);
          await g.say('He hangs the coaster on his necklace like a medal.');
        },
        apikey: storeKey,
        tokens: (g) => g.sayAs('keykeeper', 'Tokens? I keep secrets, not money. Spend those at the temple.'),
        readme: (g) => g.sayAs('keykeeper', 'A README. Hm. "Nobody reads this." Good. I approve of documents nobody reads.'),
        provider: (g) => g.sayAs('keykeeper', g.flag('providerSuspended') ? 'Suspended, is it? Talk to me. I know a thing or two about counting.' : 'Keep your provider. I keep the KEY to it. That is the arrangement.'),
        keyentity: (g) => g.sayAs('keykeeper', "That's already in my vault. Well - the name is with you, the secret is with me. As it should be."),
      },
      useItem: { apikey: storeKey },
    },
    {
      id: 'vault', name: 'vault', rect: [236, 56, 64, 62], walkTo: [252, 124], face: 'right',
      look: (g) => g.say(g.flag('vaultOpen')
        ? ["The vault is open. Rows of tiny drawers: API keys, passwords, tokens. Each with a label, none with the secret showing.", "In Drupal, that's the Key module: secrets stored safely, config only points to them."]
        : ['A massive vault with a combination dial. Probably the safest object on the island.', "I'd bet the combination isn't on one of those post-it notes. ...I'd lose that bet, wouldn't I?"]),
      open: async (g) => {
        if (!g.flag('vaultOpen')) {
          await g.sayAs('keykeeper', 'HANDS OFF MY VAULT!');
          return;
        }
        await g.say("It's open. Tiny drawers everywhere. I'm not going to rummage through other people's secrets.");
      },
      close: 'The Key Keeper will close it himself. Twice. Then check it three times.',
      useItem: { apikey: storeKey },
      anyItem: (g) => g.sayAs('keykeeper', 'Only SECRETS go in the vault! That is not a secret. That is clutter.'),
    },
    {
      id: 'ceilingkeys', name: 'hanging keys', rect: [10, 8, 300, 24], noWalk: true,
      look: ['Hundreds of keys dangling from the ceiling. Keys for doors, chests, servers, and one labelled "do not use".', "Nobody knows what most of them open. Like a company's shared password spreadsheet."],
      pickup: (g) => g.sayAs('keykeeper', 'Touch one key and I change ALL the locks!'),
    },
    {
      id: 'rulesign', name: 'sign', rect: [166, 18, 76, 40], walkTo: [204, 112], face: 'back',
      look: ['"SECRETS GO IN THE VAULT. NOT IN CONFIG. NOT IN GIT."', 'Honestly, solid advice. I have seen things in git repositories that would make a pirate blush.'],
    },
    {
      id: 'postits', name: 'post-it notes', rect: [244, 20, 28, 34], walkTo: [258, 112], face: 'back',
      look: ['Post-it notes. "vault pin: 1234". "wifi: hunter2". "DO NOT WRITE PASSWORDS ON POST-ITS".', 'The last one is the most ironic post-it I have ever seen.'],
      pickup: "I'm not taking someone's passwords. That's how you end up in a security awareness training video.",
    },
    {
      id: 'pegboard', name: 'pegboard of keys', rect: [60, 30, 50, 34], walkTo: [86, 112], face: 'back',
      look: 'A pegboard of neatly labelled keys. "Front door", "Back door", "Backdoor (do not tell anyone)".',
      pickup: (g) => g.sayAs('keykeeper', 'Those are ORGANISED. Do not disorganise them.'),
    },
    {
      id: 'keyhut_window', name: 'barred window', rect: [118, 24, 38, 30], walkTo: [136, 112], face: 'back',
      look: 'A window with bars. To keep secrets in, or the world out. Both, probably.',
      open: 'It is padlocked. Of course it is padlocked.',
    },
    {
      id: 'cot', name: 'cot', rect: [84, 86, 52, 24],
      look: 'A narrow cot. The pillow is padlocked. Possibly to stop dreams from leaking.',
      use: "I'm not napping here. He'd lock me in.",
    },
    {
      id: 'teapot', name: 'padlocked teapot', rect: [150, 78, 34, 32],
      look: "A teapot with a padlock on the lid. Even his tea is a secret.",
      pickup: "It's padlocked to the table. And the table is probably padlocked to the floor.",
      open: "Padlocked. I'll never know what kind of tea it is. Earl Grey, I bet. He seems like an Earl Grey guy.",
    },
    {
      id: 'keybarrel', name: 'barrel of spare keys', rect: [294, 96, 22, 32],
      look: 'A barrel full of spare keys. Spare keys for the spare keys, by the look of it.',
      pickup: "No. With my luck I'd pick the one that locks me in here forever.",
    },
    {
      id: 'mat', name: 'door mat', rect: [10, 114, 52, 12],
      look: 'A door mat that says "GO AWAY". Warm and welcoming.',
      pickup: "I'll leave it. It's doing important work.",
    },
  ],
};
