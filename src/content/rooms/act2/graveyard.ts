import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, stars, grassTufts, textOn } from '../../art';
import { moon, deadTree, tombstone, plaque } from '../../art2';
import { textWidth } from '../../../engine/font';

const COUNTER = '00593184';
const MQ = 352;
const gxMid = 162 + 30; // middle of the GeoCities stone // x of the <marquee> stone

function stone(p: Painter, x: number, y: number, lines: string[], tilt = 0, h?: number, far = false) {
  const w = Math.max(...lines.map(textWidth)) + 10;
  tombstone(p, x, y, w, h ?? lines.length * 9 + 10, lines, far ? C.lightgray : C.stone, far ? C.gray : C.stoneshade, tilt);
  return w;
}

function paint(p: Painter, g: Game) {
  sky(p, 448, 90, 'night');
  stars(p, 448, 60, 8);
  moon(p, 380, 24, 12);
  // distant hill with the church ruin
  p.poly([[0, 82], [90, 66], [200, 74], [320, 62], [448, 76], [448, 96], [0, 96]], C.navy);
  p.rect(300, 48, 16, 18, C.night);
  p.poly([[298, 48], [308, 38], [318, 48]], C.night);
  p.rect(306, 30, 2, 8, C.night); p.hline(304, 309, 32, C.night);
  // ground
  p.gradV(0, 90, 448, 54, [C.night, C.darkgreen, C.darkgreen]);
  grassTufts(p, 0, 94, 448, 48, 17, C.teal);
  // back fence with spikes
  for (let x = 30; x < 448; x += 7) {
    p.vline(x, 76, 94, C.darkgray);
    p.poly([[x - 1, 77], [x, 73], [x + 1, 77]], C.darkgray);
  }
  p.hline(30, 447, 80, C.darkgray); p.hline(30, 447, 90, C.darkgray);
  deadTree(p, 128, 96, 56);
  // back row of tombstones (peeking over the front row)
  stone(p, 46, 62, ['IE6', 'FINALLY.'], 1, undefined, true);
  stone(p, 160, 58, ['CLIPPY', 'NEED HELP?'], -1, undefined, true);
  stone(p, 262, 64, ['WEB 2.0', 'STILL BETA'], 1, undefined, true);
  stone(p, 356, 62, ['VINE', '6 SECONDS'], -1, undefined, true);
  // front row
  stone(p, 44, 90, ['FLASH', '1996-2020'], -1, 32);
  // GeoCities, with the famous hit counter
  const gx = 162, gw = stone(p, gx, 88, ['GEOCITIES', '1994-2009', 'VISITORS:'], 0, 46);
  p.rect(gx + gw / 2 - 26, 121, 52, 10, C.black);
  p.frame(gx + gw / 2 - 26, 121, 52, 10, C.gray);
  for (let i = 0; i < COUNTER.length; i++) {
    p.rect(gx + gw / 2 - 24 + i * 6, 122, 5, 8, C.night);
    textOn(p, COUNTER[i], gx + gw / 2 - 24 + i * 6, 122, C.lime);
  }
  stone(p, 268, 94, ['<BLINK>', 'R.I.P.'], 2);
  // the <marquee> stone: its text scrolls in anim
  const mx = MQ;
  p.poly([[mx, 104], [mx + 2, 96], [mx + 32, 94], [mx + 60, 96], [mx + 62, 104], [mx + 62, 128], [mx, 128]], C.stone);
  p.rect(mx + 4, 104, 54, 10, C.stoneshade);
  p.rect(mx - 2, 127, 66, 2, C.darkgreen);
  textOn(p, 'MARQUEE', mx + 9, 116, C.ink);
  // gate posts
  p.rect(2, 66, 8, 44, C.stoneshade);
  p.rect(30, 66, 8, 44, C.stoneshade);
  p.rect(0, 62, 12, 5, C.stone); p.rect(28, 62, 12, 5, C.stone);
  // the iron gate, swung open
  for (let i = 0; i < 4; i++) p.vline(12 + i * 4, 72 - i, 108 - i, C.darkgray);
  p.line(12, 74, 24, 71, C.darkgray); p.line(12, 100, 24, 97, C.darkgray);
  plaque(p, 100, 4, ['GRAVEYARD OF', 'DEAD WEB TECH'], C.night, C.ghost, C.ghostshade);
  }

function anim(p: Painter, g: Game, t: number) {
  // <marquee> text scrolling in its little window, forever
  const msg = 'WELCOME TO MY HOMEPAGE!!! ';
  const w = textWidth(msg);
  const off = Math.floor(t / 60) % w;
  for (let k = -1; k < 2; k++) {
    const x = MQ + 4 + 54 - off + k * w;
    // draw only the letters that sit inside the window
    for (let i = 0; i < msg.length; i++) {
      const cx = x + textWidth(msg.slice(0, i));
      if (cx >= MQ + 4 && cx + 5 <= MQ + 58) textOn(p, msg[i], cx, 105, C.lime);
    }
  }
  // fog wisps rolling along the ground
  for (let i = 0; i < 7; i++) {
    const fx = Math.round(((t / 70 + i * 80) % 520) - 40), fy = 120 + (i % 3) * 7;
    p.hline(fx, fx + 22, fy, [C.ghostshade, C.night, 'check']);
    p.hline(fx + 4, fx + 16, fy - 1, [C.ghostshade, C.night, 'check']);
  }
  // crows on the dead tree, one occasionally ruffling
  for (const [x, y, i] of [[110, 48, 0], [146, 44, 1], [136, 56, 2]] as const) {
    const ruffle = Math.floor(t / 900 + i * 3) % 7 === 0;
    p.ellipse(x, y, 3, 2, C.black);
    p.px(x + 3, y - 2, C.black);
    p.px(x + 4, y - 2, C.orange);
    if (ruffle) { p.px(x - 3, y - 3, C.black); p.px(x + 1, y - 3, C.black); }
  }
  // the hit counter digit flickers, like it's trying to count something
  if (Math.floor(t / 1300) % 5 === 0) p.px(gxMid + 20, 129, C.lime);
}

async function translateGeo(g: Game) {
  if (g.flag('geoClue')) {
    await g.say('Already translated. Any more and I start speaking GeoCities myself.');
    return;
  }
  g.set('geoTranslated');
  await g.say('I point AI Translate at the ghost. Source language: 1998 Personal Homepage. Target: English.');
  await g.sayAs('ghostgeo', '~*~ wElCoMe 2 mY PaGe!!! U r VISITOR #00593184!!! ~*~');
  await g.narrate('TRANSLATION: "Hello."');
  await g.sayAs('ghostgeo', 'dIs iZ mY hIt CoUnTeR!!1 It iZ da SECRET NuMbErS of dis IsLaNd!!! (o_o)');
  await g.narrate('TRANSLATION: "My hit counter shows the secret numbers of this island. Its coordinates."');
  await g.say('The coordinates of the island! If Captain Node had those, someone could find me!');
  await g.sayAs('ghostgeo', 'buT... i FaKeD iT. i aDdeD 590,000 so I LoOkEd PoPuLaR. :-( sOrRy!!');
  await g.narrate('TRANSLATION: "But the counter is fake. I padded it to look popular. The real numbers are lost."');
  await g.sayAs('ghostgeo', 'oLd CrOn LoGz EvErYtHiNg. AsK hIm!!! *glitter*');
  await g.narrate('TRANSLATION: "Old Cron logs everything. Ask him."');
  g.set('geoClue');
  await g.say(['Old Cron. The guy at the lookout who only runs when someone visits.', 'Somewhere in his logs are the real coordinates. Noted.']);
}

async function powerSpeakotron(g: Game) {
  if (g.flag('ttsOn')) { await g.sayAs('speakotron', 'I. ALREADY. HAVE. BATTERIES. THANK. YOU.'); return; }
  g.take('batteries');
  g.set('ttsOn');
  await g.say('I pop the AA batteries into the back of the Speak-o-Tron. *click*');
  await g.sayAs('speakotron', ['BEEP. HELLO. I. AM. SPEAK-O-TRON.', 'I. TURN. WRITTEN. WORDS. INTO. SPEECH.']);
  await g.say("Text-to-speech! In plain English: the computer reads text out loud, with a voice.");
  await g.sayAs('speakotron', 'PLEASE. ACCEPT. THIS. TOOL. CARD.');
  g.give('tool_tts');
  await g.say(['Text-to-speech as a TOOL. The same trick that gave the Grand Maintainer his voice.', 'But as a tool card, agents and automation rules can make things talk too.']);
  await g.say('Why do you still sound like a toaster, though?');
  await g.sayAs('speakotron', ['MY. NEW. VOICE. PACK. IS. STILL. IN. CODE. REVIEW.']);
  await g.say('When will it be done?');
  await g.sayAs('speakotron', 'SOON. MY. FAVOURITE. UNIT. OF. TIME.');
}

export const graveyardDialogues: Dialogue[] = [
  {
    id: 'ghostflash',
    with: 'ghostflash',
    start: async (g) => {
      await g.sayAs('ghostflash', g.flag('flashMet') ? 'Loading... 99%... Oh, it is you!' : ['LOADING... 12%... 47%... 99%... 99%... 99%...', 'Welcome! Skip intro?']);
      g.set('flashMet');
    },
    options: [
      {
        id: 'skip', text: 'Yes! Skip intro!', once: true,
        run: (g) => g.sayAs('ghostflash', ['Skipping intro...', 'Intro skipped! Now playing: the main intro.']),
      },
      {
        id: 'who', text: 'Who are you?',
        run: (g) => g.sayAs('ghostflash', [
          'I am the Ghost of Flash! I made the web DANCE! Spinning logos! Games! Intros with techno music!',
          'In plain English: I was a plugin for animations and games in web pages. Everyone loved me. Then nobody did.',
        ]),
      },
      {
        id: 'died', text: 'What happened to you?',
        run: (g) => g.sayAs('ghostflash', ['Security holes. Battery drain. Crashes.', 'And then one day a man in a black turtleneck wrote a very long letter about me.']),
      },
      {
        id: 'others', text: 'Who else haunts this place?', once: true,
        run: (g) => g.sayAs('ghostflash', [
          'The <blink> ghost. Lovely chap. Can never finish a sentence.',
          'The GeoCities ghost. Speaks only in glitter. You would need a translator.',
          "And the Speak-o-Tron over there. It's not dead, just out of batteries. Same thing in tech.",
        ]),
      },
      {
        id: 'bye', text: 'Bye, Flash.', end: true,
        run: (g) => g.sayAs('ghostflash', 'Please upgrade your plugin to continue... goodbye!'),
      },
    ],
  },
];

export const graveyard: RoomDef = {
  id: 'graveyard',
  name: 'Graveyard of Dead Web Tech',
  width: 448,
  paint,
  anim,
    scale: [108, 0.86, 143, 1],
  walk: [[[0, 112], [448, 112], [448, 143], [0, 143]]],
  start: [22, 130],
  startFace: 'right',
  npcs: [
    { id: 'ghostflash', at: [116, 124], face: 'left' },
    { id: 'ghostgeo', at: [242, 122], face: 'left' },
    { id: 'ghostblink', at: [334, 118], face: 'left' },
    { id: 'speakotron', at: [430, 126], face: 'left' },
  ],
  enter: async (g) => {
    if (!g.flag('graveyardSeen')) {
      g.set('graveyardSeen');
      await g.say(['The Graveyard of Dead Web Tech. Where good technologies go to rest.', 'And bad ones. Mostly bad ones. Okay, some were great. RIP.']);
    }
  },
  hotspots: [
    {
      id: 'gy_gate', name: 'gate', rect: [0, 62, 40, 50], walkTo: [16, 124], face: 'left',
      look: 'The cemetery gate. Wide open. Nobody ever leaves a graveyard of dead tech. They just get deprecated.',
      exit: { to: 'map' },
    },
    {
      id: 'gy_title', name: 'sign', rect: [98, 2, 110, 28],
      look: '"GRAVEYARD OF DEAD WEB TECH". Under it, smaller: "Visiting hours: until your browser stops supporting it."',
    },
    {
      id: 'tomb_ie6', name: "IE6's grave", rect: [44, 58, 54, 30],
      look: '"IE6. 2001-2022. FINALLY." Someone has left flowers. Someone else has left a party hat.',
    },
    {
      id: 'tomb_web2', name: 'Web 2.0 grave', rect: [260, 60, 68, 32],
      look: '"WEB 2.0 - STILL BETA." Rounded corners, a glossy reflection, and a "Digg this" button.',
    },
    {
      id: 'tomb_vine', name: "Vine's grave", rect: [354, 58, 64, 32],
      look: '"VINE. 6 SECONDS OF FAME." That was the whole funeral, too.',
    },
    {
      id: 'tomb_clippy', name: "Clippy's grave", rect: [158, 54, 70, 32],
      look: 'A paperclip on the tombstone. "It looks like you are dead. Would you like help with that?"',
      talk: "Hello, Clippy. ...No answer. For once, it doesn't want to help.",
    },
    {
      id: 'tomb_flash', name: "Flash's grave", rect: [42, 86, 62, 36],
      look: '"FLASH. 1996-2020." Below, in small letters: "Skip intro?" The epitaph has a loading bar, stuck at 99%.',
    },
    {
      id: 'counter', name: 'hit counter', rect: [160, 86, 62, 44], walkTo: [192, 134], face: 'back',
      look: (g) => g.say(g.flag('geoClue')
        ? `"${COUNTER}". The island's coordinates - padded by a vain ghost. The real numbers are in Old Cron's logs.`
        : `A GeoCities tombstone with a hit counter: ${COUNTER} visitors. Impressive. Suspiciously impressive.`),
      use: "I try to click the counter up by one. It doesn't count me. Story of my life.",
    },
    {
      id: 'tomb_blink', name: '<blink> grave', rect: [266, 90, 52, 32],
      look: '"<BLINK> R.I.P." The R.I.P. part keeps flickering. Or maybe that is just my eyes.',
    },
    {
      id: 'marquee', name: '<marquee> grave', rect: [350, 92, 66, 36],
      look: 'A tombstone with scrolling text: "WELCOME TO MY HOMEPAGE!!!" It has been scrolling since 1997. It will never stop.',
      push: 'I push the stone. The text scrolls the other way for a moment, then gives up.',
    },
    {
      id: 'deadtree', name: 'dead tree', rect: [106, 36, 46, 60],
      look: 'A dead tree with crows. The crows are former "Like" buttons.',
      pickup: "I'd need a very big pocket, and a very big reason.",
    },
    {
      id: 'crows', name: 'crows', rect: [104, 40, 48, 20],
      look: 'Crows. They caw whenever someone says "the cloud". So it is very loud on this island.',
      talk: 'Caw. CAW. "Cloud!" CAW CAW CAW.',
    },
    {
      id: 'moon', name: 'moon', rect: [364, 8, 32, 32],
      look: 'A full moon. Possibly the only thing on this island with 100% uptime.',
    },
    {
      id: 'ruin', name: 'ruin', rect: [294, 26, 30, 40],
      look: 'A ruined chapel. The Church of Tables-For-Layout. Its last members still believe in spacer GIFs.',
    },
    {
      id: 'ghostflash', name: 'Ghost of Flash', actor: 'ghostflash',
      look: 'The Ghost of Flash. A wobbly spectre with a red badge and a loading bar where its heart should be.',
      talk: (g) => g.talk('ghostflash'),
      giveItem: { batteries: (g) => g.sayAs('ghostflash', 'Batteries! I used to drain those. Ooh, give them to the Speak-o-Tron, it needs them more.') },
      anyItem: (g) => g.sayAs('ghostflash', 'I would take it, but I need a plugin to hold things. Nobody installs those anymore.'),
    },
    {
      id: 'ghostgeo', name: 'Ghost of GeoCities', actor: 'ghostgeo',
      look: (g) => g.say(g.flag('geoTranslated')
        ? 'The Ghost of GeoCities. Translated, he turns out to be quite sweet. A bit vain about his visitor count.'
        : 'The Ghost of GeoCities. Hard hat, glitter, and an "UNDER CONSTRUCTION" sign that has never been taken down.'),
      talk: async (g) => {
        if (g.flag('geoClue')) {
          await g.sayAs('ghostgeo', 'aSk OlD cRoN!!! hE lOgZ eVeRyThInG!!! *glitter*');
          await g.say("I didn't even need the translator that time.");
          return;
        }
        await g.sayAs('ghostgeo', g.random([
          '~*~WeLcOmE 2 mY HoMePaGe~*~ !!!1 SiGn My GuEsTbOoK!!!',
          'UnDeR CoNsTrUcTiOn!!! *dancing hamster* *dancing hamster* bEsT vIeWeD iN 800x600',
          'U r ViSiToR #00593184!!! WeBrInG ->> nExT SiTe ->>',
        ]));
        await g.say(g.flag('got:translate')
          ? "I understand none of that. Maybe if I use AI Translate on him..."
          : 'I understand none of that. And somehow, all of it. I need a translator.');
      },
      useItem: { translate: translateGeo, tool_translate: translateGeo },
      giveItem: { translate: translateGeo },
      anyItem: (g) => g.sayAs('ghostgeo', 'kEwL!!! bUt NoT aS kEwL aS mY gUeStBoOk!!!'),
    },
    {
      id: 'ghostblink', name: 'Ghost of <blink>', actor: 'ghostblink',
      look: 'The Ghost of <blink>. Now you see him. Now you don\'t. Now you do. Please stop.',
      talk: async (g) => {
        await g.say('Hello?');
        await g.sayAs('ghostblink', ['I... am... the gh-', '...', '-ost of <blink>. I was... very... im-', '...', '-portant. Once.']);
        await g.say('Everyone thought you were annoying.');
        await g.sayAs('ghostblink', 'They... were... rig-');
      },
      anyItem: (g) => g.say("I try to hand it over, but he blinks out just as I reach him. Twice."),
    },
    {
      id: 'speakotron', name: 'Speak-o-Tron', actor: 'speakotron',
      look: (g) => g.say(g.flag('ttsOn')
        ? 'The Speak-o-Tron, a talking toy computer. Batteries in, it reads anything out loud. Except its own voice pack.'
        : 'A ghostly toy computer: Speak-o-Tron. The display reads "LOW BATT". It is not dead - just out of power.'),
      talk: async (g) => {
        if (!g.flag('ttsOn')) {
          await g.say('Hello, Speak-o-Tron?');
          await g.narrate('The display flickers: "LOW BATT". A sad little *beeeeoooo* comes out.');
          await g.say('It needs batteries. Two AA ones, judging by the slot.');
          return;
        }
        await g.sayAs('speakotron', g.random(['HELLO. MAC. PACKWALA.', 'SAY. IT. WITH. ME: TEXT. TO. SPEECH.', 'VOICE. PACK. STATUS: NEEDS. WORK.']));
      },
      useItem: { batteries: powerSpeakotron },
      giveItem: { batteries: powerSpeakotron },
      anyItem: (g) => g.sayAs('speakotron', g.flag('ttsOn') ? 'ERROR. NOT. A. BATTERY.' : '*beeeoooo* (LOW BATT)'),
    },
  ],
};
