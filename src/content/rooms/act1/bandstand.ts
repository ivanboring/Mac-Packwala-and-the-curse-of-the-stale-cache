import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, cloud, bush, grassTufts, palm, textOn, centeredText, signpost } from '../../art';
import { pennants, plaque, stool } from '../../art1';

function paint(p: Painter, g: Game) {
  sky(p, 320, 100, 'day');
  cloud(p, 60, 20, 1);
  cloud(p, 250, 14, 0.8);
  // distant jungle and the fog over it
  for (let i = 0; i < 12; i++) bush(p, 10 + i * 28, 86 - (i % 3) * 3, 1.6, C.darkgreen, C.black);
  for (let i = 0; i < 6; i++) p.ellipse(30 + i * 55, 70, 30, 6, [C.fog, C.skyblue]);
  palm(p, 22, 100, 70, -6, 3);
  palm(p, 304, 102, 64, 7, 8);

  // park lawn with a gravel path
  p.gradV(0, 96, 320, 48, [C.lime, C.green, C.darkgreen]);
  grassTufts(p, 0, 100, 320, 42, 21, C.darkgreen);
  p.poly([[0, 116], [120, 112], [300, 112], [320, 116], [320, 143], [0, 143]], C.tan);
  p.poly([[0, 116], [120, 112], [300, 112], [320, 116], [320, 118], [0, 120]], C.sand);
  for (let i = 0; i < 60; i++) p.px((i * 53) % 320, 118 + ((i * 17) % 24), C.stoneshade);

  // the bandstand: octagonal gazebo, roof + columns + raised floor
  const bx = 128, bw = 176;
  p.poly([[bx - 6, 46], [bx + bw / 2, 22], [bx + bw + 6, 46]], C.brandblue);
  p.poly([[bx - 6, 46], [bx + bw / 2, 22], [bx + bw / 2, 46]], [C.brandblue, C.brandink, '25']);
  p.rect(bx - 8, 46, bw + 16, 6, C.white);
  for (let x = bx - 6; x < bx + bw + 6; x += 10) p.poly([[x, 52], [x + 10, 52], [x + 5, 57]], C.brandpink);
  p.rect(bx + bw / 2 - 2, 14, 4, 9, C.gold);
  p.circle(bx + bw / 2, 13, 3, C.gold);
  // back wall shading under the canopy
  p.rect(bx, 57, bw, 44, [C.brandmist, C.brandbluelight, 'check']);
  for (const x of [bx, bx + 58, bx + 116, bx + bw - 6]) {
    p.rect(x, 52, 6, 52, C.white);
    p.vline(x + 5, 52, 103, C.lightgray);
  }
  // railing
  for (let x = bx + 6; x < bx + bw - 6; x += 6) p.vline(x, 92, 103, C.white);
  p.hline(bx, bx + bw - 1, 92, C.white);
  // floor / stage edge
  p.rect(bx - 4, 103, bw + 8, 6, C.woodlight);
  p.rect(bx - 4, 108, bw + 8, 3, C.wood);
  for (let x = bx; x < bx + bw; x += 22) p.rect(x, 108, 10, 3, C.darkbrown);
  pennants(p, [[bx - 4, 58], [bx + 58, 64], [bx + 116, 64], [bx + bw + 4, 58]], [C.brandpink, C.brandblue, C.gold, C.white]);

  // upright piano (the keys are where the cat sits)
  const px = 212;
  p.rect(px, 66, 56, 34, C.darkbrown);
  p.rect(px + 2, 68, 52, 18, C.brown);
  p.rect(px + 18, 70, 20, 10, C.gold); // nameplate
  centeredText(p, 'PHP', px + 28, 71, C.darkbrown);
  p.rect(px - 2, 64, 60, 3, C.black);
  // keyboard ledge
  p.rect(px - 2, 88, 60, 6, C.white);
  for (let k = 0; k < 12; k++) if (k % 7 !== 2 && k % 7 !== 6) p.rect(px + 1 + k * 5, 88, 3, 3, C.black);
  p.rect(px, 94, 56, 10, C.darkbrown);
  p.rect(px + 4, 100, 4, 6, C.black); p.rect(px + 48, 100, 4, 6, C.black);
  // composer.lock padlock on the lid
  p.rect(px + 44, 58, 7, 6, C.gold);
  p.frame(px + 45, 54, 5, 5, C.lightgray);
  // music stand on the piano: empty until composer.json arrives
  p.rect(px + 6, 56, 18, 10, g.flag('aiInstalled') ? C.white : C.tan);
  if (g.flag('aiInstalled')) for (let i = 0; i < 3; i++) p.hline(px + 8, px + 22, 58 + i * 3, C.gray);
  stool(p, px + 28, 112);

  // poster on a column
  p.rect(bx + 10, 64, 42, 24, C.white);
  p.frame(bx + 10, 64, 42, 24, C.brandpink);
  centeredText(p, 'TONIGHT', bx + 31, 65, C.brandpink);
  centeredText(p, 'composer', bx + 31, 73, C.ink);
  centeredText(p, 'update', bx + 31, 80, C.ink);

  // bench and tip jar on the left lawn
  p.rect(36, 104, 46, 3, C.woodlight);
  p.rect(36, 98, 46, 2, C.woodlight);
  p.rect(38, 107, 2, 6, C.ink); p.rect(78, 107, 2, 6, C.ink);
  p.rect(112, 102, 10, 12, [C.skyblue, C.white, 'check']);
  p.frame(112, 102, 10, 12, C.lightgray);
  p.rect(112, 100, 10, 2, C.gold);
  textOn(p, '$', 115, 104, C.darkgreen);
  if (g.flag('aiInstalled')) p.ellipse(117, 111, 3, 1, C.gold);

  // flowerbed with labels
  for (let i = 0; i < 5; i++) {
    p.vline(10 + i * 8, 128, 134, C.darkgreen);
    p.circle(10 + i * 8, 127, 2, [C.red, C.yellow, C.brandpink, C.white, C.orange][i]);
  }
  p.rect(6, 134, 40, 6, C.darkbrown);
  textOn(p, 'vendor/', 8, 133, C.tan);

  // the way back
  signpost(p, 6, 88, 34, ['< TOWN'], 14);
  p.rect(64, 80, 2, 16, C.darkbrown); p.rect(104, 80, 2, 16, C.darkbrown);
  plaque(p, 56, 58, ['NO UPDATES', 'ON SUNDAYS'], C.white, C.ink, C.brandblue);
}

function anim(p: Painter, g: Game, t: number) {
  if (!g.flag('aiInstalled')) return;
  // music notes drift up from the piano once Drupal AI is installed
  for (let i = 0; i < 3; i++) {
    const k = ((t / 30) + i * 33) % 100;
    const x = 230 + i * 12 + Math.round(Math.sin((t / 400) + i) * 4);
    const y = 60 - Math.round(k / 3);
    if (y < 26) continue;
    p.circle(x, y, 1, C.brandink);
    p.vline(x + 1, y - 4, y, C.brandink);
  }
}

async function feedCat(g: Game) {
  if (g.flag('catGone')) return;
  await g.say('Here, kitty. A lovely red herring.');
  await g.sayAs('cat', 'Mrrrow? ^2.0... herring... compatible...');
  g.take('herring');
  const cat = g.actor('cat');
  cat.face('left');
  await cat.walkTo(260, 132);
  await cat.walkTo(340, 132);
  cat.visible = false;
  g.set('catGone');
  await g.say(['The Dependency Cat has been... uninstalled.', 'Red herrings: completely useless, except when they are not.']);
  await g.sayAs('composer', 'The keys! The keys are free! Now if only someone had the sheet music...');
}

async function install(g: Game) {
  if (!g.flag('catGone')) {
    await g.sayAs('composer', [
      'Sheet music! Wonderful! But look - the Dependency Cat is on the keys.',
      'Cat version ^2. My piano requires cat ^3. Your requirements could not be resolved to an installable set of packages.',
    ]);
    return;
  }
  g.take('composerjson');
  await g.sayAs('composer', ['composer.json! At last! Let us see... "require: drupal/ai".', 'A classic! Ahem.']);
  const c = g.actor('composer');
  c.face('right');
  c.gesture = 'conduct';
  await g.sayAs('composer', 'composer require drupal/ai!');
  g.shake();
  await g.narrate(['Loading composer repositories with package information...', 'Updating dependencies... Lock file operations: 1 install, 0 updates, 0 removals']);
  g.fx('flash', 200);
  g.set('aiInstalled');
  await g.narrate('- Installing drupal/ai: the AI module, which lets Drupal talk to AI models.');
  c.gesture = undefined;
  await g.sayAs('composer', [
    'Bravo! The AI module is installed!',
    'That is what Composer does, by the way: it reads the list of packages a site needs and fetches them all.',
  ]);
  await g.say(['Somewhere back in the square, I hear a gate creak open.', 'And somewhere, a Maintainer wakes up from a nap he will deny having.']);
}

export const bandstandDialogues: Dialogue[] = [
  {
    id: 'composer',
    with: 'composer',
    start: async (g) => {
      if (!g.flag('metComposer')) {
        g.set('metComposer');
        await g.sayAs('composer', ['Ah! An audience! I am the Composer. I compose... sites.', 'Every package a Drupal site needs, I fetch it. With music!']);
      } else await g.sayAs('composer', g.flag('aiInstalled') ? 'drupal/ai is in the lock file. Bliss.' : 'Still no music. Still a cat.');
    },
    options: [
      {
        id: 'what', text: 'What is Composer, in plain English?', once: true,
        run: (g) => g.sayAs('composer', [
          'Your website is built from hundreds of little packages written by other people.',
          'You write a wish list - composer.json - and I fetch exactly the right versions so they all fit together.',
          'Then I write composer.lock, so tomorrow you get the exact same versions. No surprises. In theory.',
        ]),
      },
      {
        id: 'play', text: "Why aren't you playing?", when: (g) => !g.flag('catGone'),
        run: (g) => g.sayAs('composer', [
          'Two problems. First: the Dependency Cat is asleep on my keys. It is version ^2. The piano needs ^3.',
          'Second: no sheet music. I need a composer.json that says what to install.',
          'Wordy sells them. For a token. Everything costs a token now.',
        ]),
      },
      {
        id: 'cat', text: 'Can you just move the cat?', when: (g) => !g.flag('catGone'), once: true,
        run: (g) => g.sayAs('composer', [
          'Move it? It is a dependency! If I touch it, three other cats will need upgrading.',
          'It must leave of its own free will. Cats only do that for food.',
        ]),
      },
      {
        id: 'ai', text: 'Can you install the AI module for me?', when: (g) => !g.flag('aiInstalled'),
        run: (g) => g.sayAs('composer', g.has('composerjson')
          ? 'You have the sheet music! Give it to me - but the cat must go first.'
          : 'drupal/ai? Gladly! Bring me composer.json and an empty piano.'),
      },
      {
        id: 'update', text: 'Could you run "composer update"?', once: true,
        run: (g) => g.sayAs('composer', [
          'SHHH! Never say that word on a Sunday!',
          'Last time I updated everything at once, it took three hours and the bandstand became a cathedral.',
        ]),
      },
      {
        id: 'next', text: 'What now?', when: (g) => g.flag('aiInstalled'), once: true,
        run: (g) => g.sayAs('composer', 'Go and tell the Grand Maintainer. Installing a module is the easy part. Using it - that is the trial.'),
      },
      { id: 'bye', text: 'Encore later.', end: true },
    ],
  },
];

export const bandstand: RoomDef = {
  id: 'bandstand',
  name: 'The Bandstand',
  paint,
  anim,
  bgKey: (g) => (g.flag('aiInstalled') ? 'ai' : '') + (g.flag('catGone') ? 'c' : ''),
  scale: [112, 0.9, 143, 1.02],
  walk: [[[0, 118], [120, 114], [300, 114], [320, 118], [320, 143], [0, 143]]],
  start: [24, 126],
  startFace: 'right',
  npcs: [
    { id: 'composer', at: [200, 120], face: 'right' },
    { id: 'cat', at: [244, 92], face: 'left', when: (g) => !g.flag('catGone') },
  ],
  enter: (g) => {
    g.actor('composer').gesture = undefined;
  },
  hotspots: [
    {
      id: 'exit', name: 'path to the town square', rect: [0, 84, 40, 30], walkTo: [8, 126],
      exit: { to: 'square', at: [458, 124], face: 'left' },
      look: 'The path back to the town square.',
    },
    {
      id: 'cat', name: 'Dependency Cat', actor: 'cat', walkTo: [236, 122], face: 'back',
      when: (g) => !g.flag('catGone'),
      look: [
        'A ginger cat asleep on the piano keys. Its collar tag reads "cat: ^2.0".',
        'The piano needs cat ^3.0. In software that is a "dependency conflict": two parts that need different versions.',
      ],
      talk: (g) => g.sayAs('cat', g.random(['Mrrp. ^2.', 'Mew. Not compatible.', 'Purrrr... (it refuses to upgrade)'])),
      pickup: "I tried. It's version-locked to the piano. And it has claws, which are like breaking changes.",
      push: 'I nudge it. It plays a C-sharp minor chord without waking up. Rude, but impressive.',
      pull: 'Pulling a cat by the tail is how you get a 500 Internal Server Error. In me.',
      useItem: {
        herring: feedCat,
        crackers: (g) => g.say("It sniffs the OAuth crackers and looks away. It doesn't want authorisation, it wants fish."),
        f5key: (g) => g.say('Refreshing a cat just makes it the same cat, but more annoyed.'),
        duck: (g) => g.say('The cat stares at the duck. The duck stares at the cat. Nobody debugs anything.'),
      },
      giveItem: { herring: feedCat },
      anyItem: async (g) => { await g.sayAs('cat', 'Mrrow. (Not a fish.)'); },
    },
    {
      id: 'composer', name: 'the Composer', actor: 'composer', walkTo: [176, 124], face: 'right',
      look: ['The Composer. Wild white hair, coat tails, baton.', 'He looks like he could install anything, given the right sheet music.'],
      talk: (g) => g.talk('composer'),
      giveItem: {
        composerjson: install,
        herring: (g) => g.sayAs('composer', 'I am not the one who wants fish, my friend. Try the cat.'),
        tokens: (g) => g.sayAs('composer', 'Keep your tokens. Spend them on composer.json at Wordy\'s.'),
        readme: (g) => g.sayAs('composer', 'A README! I always skip those and run straight to "require".'),
      },
      anyItem: async (g) => { await g.sayAs('composer', 'Lovely, but it is not sheet music.'); },
      pickup: 'He weighs about as much as a node_modules folder. Not happening.',
    },
    {
      id: 'piano', name: 'piano', rect: [210, 56, 60, 52], walkTo: [236, 122], face: 'back',
      look: (g) => g.say(g.flag('catGone')
        ? 'An upright piano labelled "PHP". The keys are free. They still smell slightly of cat.'
        : 'An upright piano labelled "PHP". You can\'t play it with a cat on it. Well, you can. It just sounds like this: "MRAAOW".'),
      use: (g) => g.say(g.flag('aiInstalled')
        ? 'I play "Chopsticks". It installs nothing. Only the Composer can make it do that.'
        : 'Only the Composer plays this piano. It is in the licence.'),
      open: 'The lid is padlocked. The padlock says "composer.lock". Nobody is allowed to change versions here.',
      useItem: {
        composerjson: (g) => g.say('I put the sheet music on the stand. Nothing happens. It needs the Composer.'),
        herring: (g) => g.flag('catGone') ? g.say('No cat to bribe any more.') : feedCat(g),
      },
    },
    {
      id: 'padlock', name: 'composer.lock padlock', rect: [254, 52, 10, 13], walkTo: [254, 122], face: 'back',
      look: [
        'A padlock labelled "composer.lock". It records the exact version of everything installed.',
        'It keeps everyone on the same versions, so "works on my machine" works on yours too.',
      ],
      open: "It's locked. That's its entire personality.",
      pickup: "I'm not taking the lock file. The Composer would have a meltdown.",
    },
    {
      id: 'stand', name: 'music stand', rect: [216, 54, 22, 13], walkTo: [226, 122], face: 'back',
      look: (g) => g.say(g.flag('aiInstalled') ? 'The composer.json sheet music. "require: drupal/ai". It has been played.' : 'An empty music stand. Waiting for a composer.json.'),
    },
    {
      id: 'bandstand', name: 'bandstand', rect: [120, 14, 192, 44], noWalk: true,
      look: 'A pretty bandstand in brand blue and pink. The bunting says "Welcome" in seven different string encodings.',
    },
    {
      id: 'poster', name: 'poster', rect: [138, 64, 42, 24], walkTo: [158, 120], face: 'back',
      look: ['"TONIGHT: composer update". Underneath, in smaller print: "Estimated finish: next Tuesday."', 'Someone has added "bring snacks".'],
      pickup: 'It is nailed to the column. With version-pinned nails.',
    },
    {
      id: 'sign', name: 'sign', rect: [56, 58, 56, 38], walkTo: [86, 118], face: 'back',
      look: '"NO UPDATES ON SUNDAYS." Very wise. Updating everything at once is how weekends disappear.',
    },
    {
      id: 'bench', name: 'park bench', rect: [34, 96, 50, 18], walkTo: [60, 120], face: 'back',
      look: 'A park bench with a plaque: "In memory of all the sites that ran composer update on a Friday."',
      use: 'I sit for a moment and contemplate dependency trees. I feel older.',
    },
    {
      id: 'tipjar', name: 'tip jar', rect: [108, 96, 18, 20], walkTo: [116, 120], face: 'back',
      look: (g) => g.say(g.flag('aiInstalled') ? 'A tip jar with one shiny coin in it. I feel like that was me, emotionally.' : 'An empty tip jar. "TIPS: please pin your versions."'),
      pickup: "I'm not stealing from a musician. They already get paid in 'exposure'.",
    },
    {
      id: 'flowers', name: 'flowerbed', rect: [4, 122, 44, 20], walkTo: [36, 128], face: 'left',
      look: 'A flowerbed labelled "vendor/". Never edit anything in here - it all gets replaced next time Composer runs.',
      pickup: "I'd better not. Anything I change in vendor/ gets overwritten anyway.",
    },
    {
      id: 'trees', name: 'distant jungle', rect: [40, 60, 80, 30], noWalk: true,
      look: (g) => g.say(g.flag('aiInstalled')
        ? 'The jungle beyond town. With the AI module installed, the gate in the square should be open.'
        : 'Thick jungle, wrapped in fog. Nobody gets in without the right module, apparently.'),
    },
  ],
};
