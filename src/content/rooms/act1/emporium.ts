import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, door, textOn, centeredText, bush } from '../../art';
import { shelf, box, counter } from '../../art1';

function paint(p: Painter, g: Game) {
  // striped wallpaper in brand colours
  p.rect(0, 0, 320, 100, C.brandpaper);
  for (let x = 0; x < 320; x += 12) p.rect(x, 0, 6, 100, [C.brandpaper, C.brandmist, '25']);
  p.rect(0, 0, 320, 8, C.brandblue);
  // checkerboard floor
  for (let y = 100; y < 144; y += 6) for (let x = 0; x < 320; x += 12) {
    const off = (Math.floor((y - 100) / 6) % 2) * 6;
    p.rect(x + off - 6, y, 6, 6, C.brandmist);
    p.rect(x + off, y, 6, 6, C.white);
  }
  p.hline(0, 319, 100, C.brandslate);

  // neon sign
  p.rect(150, 12, 150, 22, C.brandink);
  centeredText(p, "THERE'S A PLUGIN", 225, 14, C.brandpink);
  centeredText(p, 'FOR THAT!', 225, 23, C.brandpink);

  // workplace-safety style board: DAYS WITHOUT A PATCH: 0
  p.rect(196, 37, 78, 25, C.white);
  p.rect(196, 37, 78, 10, C.brandpink);
  p.frame(196, 37, 78, 25, C.brandink);
  centeredText(p, 'DAYS WITHOUT', 235, 38, C.white);
  textOn(p, 'A PATCH:', 201, 50, C.brandink);
  p.rect(252, 49, 16, 11, C.brandink);

  // door back to the square
  door(p, 8, 52, 24, 48, C.brandblue, false);
  p.circle(20, 46, 4, C.gold);

  // shelves full of plugins
  const labels = ['SEO', 'CF7', 'XML', 'ADS', '2FA', 'CDN', 'RSS', 'BAK', 'ZIP', 'POP', 'WYS', '???'];
  const colors = [C.red, C.lime, C.brandblue, C.orange, C.brandink, C.purple, C.teal, C.gold];
  for (let row = 0; row < 3; row++) {
    const y = 40 + row * 20;
    shelf(p, 40, y, 104);
    for (let i = 0; i < 4; i++) {
      const lbl = labels[row * 4 + i];
      const c = colors[(row * 4 + i) % colors.length];
      box(p, 44 + i * 25, y - 15, 22, 15, c, lbl, c === C.lime || c === C.gold || c === C.orange ? C.ink : C.white);
    }
  }
  textOn(p, 'BESTSELLERS', 52, 88, C.brandslate);

  // composer.json on a music stand, with a price tag
  p.line(306, 100, 306, 70, C.darkgray);
  p.line(300, 100, 306, 88, C.darkgray);
  p.line(312, 100, 306, 88, C.darkgray);
  if (!g.flag('got:composerjson')) {
    p.rect(294, 54, 24, 18, C.white);
    for (let i = 0; i < 4; i++) p.hline(296, 315, 57 + i * 4, C.gray);
    p.circle(300, 62, 1, C.ink); p.circle(308, 66, 1, C.ink);
    p.rect(290, 72, 18, 8, C.yellow);
    textOn(p, '1 T', 292, 72, C.ink);
  } else p.rect(294, 54, 24, 18, [C.brandmist, 0]);

  // counter (Wordy stands behind it, waist-up)
  counter(p, 166, 92, 116, 24, C.brandblue, C.brandink);
  for (let i = 0; i < 5; i++) p.rect(176 + i * 22, 100, 14, 10, i % 2 ? C.brandpink : C.brandblue);
  textOn(p, 'PLUGINS!', 196, 101, C.white);
  // cash register
  p.rect(260, 78, 22, 14, C.gold);
  p.rect(262, 72, 18, 7, C.brandink);
  textOn(p, '$$', 265, 72, C.lime);
  // sample basket
  for (let i = 0; i < 3; i++) p.rect(176 + i * 6, 78 - (i % 2) * 2, 5, 6, C.brandpink);
  p.poly([[170, 82], [200, 82], [197, 92], [173, 92]], C.woodlight);
  p.hline(171, 199, 82, C.wood);
  textOn(p, 'FREE', 176, 83, C.red);
  // battery display
  if (!g.flag('got:batteries')) {
    p.rect(238, 82, 14, 10, C.white);
    p.rect(240, 84, 4, 7, C.brandink); p.rect(240, 84, 4, 2, C.gold);
    p.rect(246, 84, 4, 7, C.brandink); p.rect(246, 84, 4, 2, C.gold);
  }

  // cardboard cutout of Wordy
  p.rect(150, 46, 18, 50, C.tan);
  p.circle(159, 52, 6, C.skin);
  p.rect(156, 46, 7, 3, C.gold);
  p.rect(152, 60, 14, 22, C.orange);
  p.rect(146, 38, 26, 8, C.white);
  textOn(p, '5 ★', 150, 38, C.gold);
  // plastic plant
  p.poly([[300, 128], [314, 128], [312, 140], [302, 140]], C.brandpink);
  bush(p, 307, 122, 0.9, C.lime, C.green);
}

function anim(p: Painter, g: Game, t: number) {
  // the patch counter makes it to 1 now and then, for about half a second
  centeredText(p, t % 7000 > 6400 ? '1' : '0', 260, 50, C.lime);
  // neon flicker
  if (Math.floor(t / 90) % 37 === 0) p.rect(150, 12, 150, 22, C.brandink);
  // a popup ad bouncing over the sample basket
  if (!g.flag('got:popup')) {
    const b = Math.round(Math.abs(Math.sin(t / 300)) * 3);
    p.rect(180, 64 - b, 12, 8, C.white);
    p.frame(180, 64 - b, 12, 8, C.brandpink);
    p.px(190, 65 - b, C.black);
  }
}

async function buyComposer(g: Game) {
  if (g.has('composerjson')) return g.sayAs('wordy', 'You already have one! Want a second? I can do two for the price of three!');
  const n = g.flag<number>('tokenCount') ?? 0;
  if (!g.has('tokens') || n < 1) {
    await g.sayAs('wordy', ['composer.json! Sheet music for the Composer. One token!', 'No tokens? The Harbour Office hands them out. Eventually. With forms.']);
    return;
  }
  g.set('tokenCount', n - 1);
  await g.sayAs('wordy', ['One token! SOLD!', 'Version ^1.0. Never pinned. Always surprising.']);
  g.give('composerjson');
  await g.say(`Sheet music for "composer require". ${n - 1} tokens left.`);
}

async function tradeBatteries(g: Game) {
  if (g.has('batteries') || g.flag('got:batteries')) return g.sayAs('wordy', 'One battery pack per customer. They are very popular with ghosts, for some reason.');
  g.take('popup');
  g.set('popupTraded');
  await g.sayAs('wordy', ['A Popup Newsletter plugin! Barely used! Lovely!', 'Here are your batteries. A plugin for a plugin. That\'s the circle of life.']);
  g.give('batteries');
}

export const emporiumDialogues: Dialogue[] = [
  {
    id: 'wordy',
    with: 'wordy',
    start: async (g) => {
      if (!g.flag('metWordy')) {
        g.set('metWordy');
        await g.sayAs('wordy', ["Welcome to Wordy's Plugin Emporium!", "Whatever you need, there's a plugin for that! Whatever 'that' is!"]);
      } else await g.sayAs('wordy', g.random(["There's a plugin for that!", 'Back for more plugins? Everyone comes back for more plugins.', 'Hello again, valued customer!']));
    },
    options: [
      {
        id: 'plugin', text: "What's a plugin, exactly?", once: true,
        run: (g) => g.sayAs('wordy', [
          'A little add-on you install to teach your website a new trick. Sliders! Forms! Spam filters!',
          "In Drupal they're called modules, but between you and me, everything is a plugin if you squint.",
          'They all work together beautifully. Mostly. Usually. On Tuesdays.',
        ]),
      },
      { id: 'composer', text: "I'm looking for composer.json.", when: (g) => !g.flag('got:composerjson'), run: buyComposer },
      {
        id: 'batteries', text: 'Do you sell batteries?', when: (g) => !g.flag('got:batteries'),
        run: async (g) => {
          await g.sayAs('wordy', ['The Batteries plugin! Fresh in!', "Price: one plugin you're not using. I collect them. I have a problem."]);
          if (g.has('popup')) {
            await g.say('How about this Popup Newsletter plugin?');
            await tradeBatteries(g);
          } else await g.sayAs('wordy', 'Got a spare plugin? No? Help yourself to a free sample from the basket!');
        },
      },
      {
        id: 'writing', text: 'Got anything to help me write better?', when: (g) => g.atLeast('editor') && !g.flag('got:ckeditor'),
        run: async (g) => {
          await g.sayAs('wordy', [
            'For an Editor? The AI CKEditor assistant! Fix spelling, change tone, summarise - right in the text editor.',
            "And it's FREE. It's in the core AI module now! Which is terrible for business, honestly.",
          ]);
          g.give('ckeditor');
        },
      },
      {
        id: 'escape', text: 'Do you have a plugin that gets me off this island?',
        run: (g) => g.sayAs('wordy', [
          'The Escape Island Pro plugin! Out of stock. Since forever.',
          'I do have Fog Remover Lite. It removes the fog. And the island. And your site. Not recommended.',
        ]),
      },
      {
        id: 'popular', text: "What's your most popular plugin?", once: true,
        run: (g) => g.sayAs('wordy', [
          'The plugin that disables all the other plugins!',
          'Customers buy it right after buying everything else. Then they come back and buy everything again. I love it.',
        ]),
      },
      {
        id: 'secure', text: 'Are your plugins secure?', once: true,
        run: async (g) => {
          await g.sayAs('wordy', [
            'Secure? They are the most patched plugins on the island! A security update every day. Some days, three!',
            'That is how you know they are safe. Somebody is always fixing them.',
          ]);
          await g.say("And if I don't update?");
          await g.sayAs('wordy', [
            'Then you get a free bonus administrator! Usually from abroad. Very helpful. They redecorate your homepage.',
            'They even add a little link to a pharmacy in the footer. Customer service!',
          ]);
          await g.say(['To be fair, Drupal once had a bug so bad they called it Drupalgeddon.', "So I'm not throwing stones. Just... small, well-reviewed pebbles."]);
        },
      },
      {
        id: 'wordy', text: 'Wordy Pressington. Any relation to a certain other CMS?', once: true,
        run: (g) => g.sayAs('wordy', ['I have no idea what you mean. I am completely unique.', 'Would you like a theme with that? I have eleven thousand.']),
      },
      { id: 'bye', text: "I'll have a look around.", end: true },
    ],
  },
];

export const emporium: RoomDef = {
  id: 'emporium',
  name: "Wordy's Plugin Emporium",
  paint,
  anim,
  bgKey: (g) => ['got:composerjson', 'got:popup', 'popupTraded', 'got:batteries'].map((k) => (g.flag(k) ? 1 : 0)).join(''),
  scale: [104, 0.88, 143, 1.02],
  walk: [[[0, 112], [160, 112], [166, 118], [288, 118], [292, 108], [320, 110], [320, 143], [0, 143]]],
  start: [52, 128],
  startFace: 'right',
  npcs: [{ id: 'wordy', at: [226, 112], face: 'front' }],
  hotspots: [
    {
      id: 'exit', name: 'door to the square', rect: [6, 44, 28, 58], walkTo: [22, 120],
      exit: { to: 'square', at: [369, 104], face: 'front' },
      look: 'The door back out to the square. A bell above it. It rings "cha-ching".',
    },
    {
      id: 'wordy', name: 'Wordy Pressington', actor: 'wordy', walkTo: [226, 126], face: 'back',
      look: ['Wordy Pressington, plugin salesman. Loud jacket, louder smile.', 'He looks like someone who would sell you a plugin to uninstall his other plugins.'],
      talk: (g) => g.talk('wordy'),
      giveItem: {
        popup: async (g) => tradeBatteries(g),
        tokens: buyComposer,
        herring: (g) => g.sayAs('wordy', 'A red herring? I already sell those. "SEO Secrets Revealed". Same thing.'),
        readme: (g) => g.sayAs('wordy', "A README! I'd sell it, but nobody would read it."),
      },
      anyItem: async (g, item) => { await g.sayAs('wordy', g.random(['Nice! Is it a plugin? No? Then I can\'t resell it.', 'I only take plugins and tokens, friend.'])); },
      pickup: 'He is not for sale. Everything else is.',
    },
    {
      id: 'basket', name: 'basket of free samples', rect: [170, 72, 28, 22], walkTo: [184, 124], face: 'back',
      look: 'A basket of free plugin samples. They are all "Popup Newsletter". They pop up at me while I look.',
      pickup: async (g) => {
        if (g.flag('got:popup')) return g.sayAs('wordy', 'One free sample per customer! I am watching you. With analytics.');
        g.give('popup');
        await g.say('I take a free sample. It immediately asks me to subscribe to its newsletter.');
        await g.sayAs('wordy', "Enjoy! It's free! The first one is always free.");
      },
    },
    {
      id: 'composerjson', name: 'composer.json sheet music', rect: [288, 52, 32, 30], walkTo: [298, 120], face: 'back',
      when: (g) => !g.flag('got:composerjson'),
      look: 'Sheet music on a stand: "composer.json - for the discerning Composer". Price tag: 1 token.',
      pickup: buyComposer,
    },
    {
      id: 'batteries', name: 'batteries', rect: [236, 80, 18, 12], walkTo: [244, 124], face: 'back',
      when: (g) => !g.flag('got:batteries'),
      look: 'A display of AA batteries. "Batteries plugin. Price: one plugin you are not using."',
      pickup: (g) => g.sayAs('wordy', 'Ah ah! Those cost one unused plugin. A trade!'),
    },
    {
      id: 'shelves', name: 'shelves of plugins', rect: [40, 20, 106, 66], walkTo: [92, 118], face: 'back',
      look: [
        'Slider plugins, SEO plugins, a contact form plugin called "CF7"...',
        'A CAPTCHA plugin that blocks robots. And humans. Mostly humans.',
        'A box labelled "???". Even Wordy doesn\'t know what that one does. It has five stars.',
      ],
      pickup: (g) => g.sayAs('wordy', 'Hands off the merchandise unless you are buying! Which you should be!'),
    },
    {
      id: 'neon', name: 'neon sign', rect: [150, 12, 150, 22], noWalk: true,
      look: '"THERE\'S A PLUGIN FOR THAT!" In my experience, there are usually twelve. And they conflict.',
    },
    {
      id: 'patchboard', name: 'safety board', rect: [196, 37, 78, 25], walkTo: [236, 124], face: 'back',
      look: ['A safety board: "DAYS WITHOUT A PATCH: 0".', 'The record is one day. Even the hackers were on holiday.'],
      pickup: "It's bolted to the wall. The only thing in this shop that is locked down.",
    },
    {
      id: 'register', name: 'cash register', rect: [258, 70, 26, 22], walkTo: [270, 124], face: 'back',
      look: 'A cash register. The "no sale" key is worn completely smooth. Just kidding, it\'s brand new.',
      open: (g) => g.sayAs('wordy', 'Oi! That is where the tokens go to live!'),
    },
    {
      id: 'cutout', name: 'cardboard cutout', rect: [146, 36, 26, 60], walkTo: [158, 116], face: 'back',
      look: 'A cardboard cutout of Wordy giving himself five stars.',
      talk: "It's more talkative than the bartender, at least.",
    },
    {
      id: 'plant', name: 'plastic plant', rect: [298, 112, 20, 30],
      look: "A plastic plant. Its label: \"Organic Growth Plugin\".",
      pickup: "I don't need fake organic growth. I'm not a startup.",
    },
  ],
};
