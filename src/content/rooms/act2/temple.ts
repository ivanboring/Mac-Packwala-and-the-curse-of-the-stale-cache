import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, bricks, centeredText, textOn } from '../../art';
import { tiles, torchPost, flame, vine } from '../../art2';
import { trialComplete } from './trials';
import { SUSPENDED_LINE } from '../../items/act2';

const IDOLS = [
  { x: 132, w: 40, h: 46, crown: false, label: 'BIG MODEL' },
  { x: 200, w: 48, h: 52, crown: false, label: 'BIGGER MODEL' },
  { x: 270, w: 44, h: 48, crown: true, label: 'PRO MAX' },
];

function idolHead(p: Painter, cx: number, w: number, h: number, crown: boolean) {
  const top = 96 - h;
  // pedestal
  p.rect(cx - w / 2 - 4, 92, w + 8, 12, C.stoneshade);
  p.rect(cx - w / 2 - 4, 92, w + 8, 3, C.stone);
  // head block, a bit wonky
  p.poly([[cx - w / 2, top + 4], [cx + w / 2 - 2, top], [cx + w / 2, 92], [cx - w / 2 + 2, 92]], C.stone);
  p.poly([[cx + w / 2 - 8, top + 1], [cx + w / 2 - 2, top], [cx + w / 2, 92], [cx + w / 2 - 6, 92]], C.stoneshade);
  // carved cloud on the forehead
  p.ellipse(cx - 4, top + 9, 5, 3, C.lightgray);
  p.ellipse(cx + 2, top + 8, 6, 4, C.lightgray);
  p.ellipse(cx + 7, top + 10, 4, 2, C.lightgray);
  // heavy brow
  p.rect(cx - w / 2 + 4, top + 16, w - 8, 4, C.stoneshade);
  // eye sockets
  p.rect(cx - w / 4 - 4, top + 20, 9, 6, C.ink);
  p.rect(cx + w / 4 - 5, top + 20, 9, 6, C.ink);
  // nose
  p.poly([[cx - 2, top + 22], [cx + 3, top + 22], [cx + 6, top + 34], [cx - 5, top + 34]], C.stoneshade);
  p.hline(cx - 5, cx + 6, top + 34, C.ink);
  // mouth slot
  p.rect(cx - w / 4, top + 38, w / 2, 4, C.ink);
  for (let x = cx - w / 4 + 2; x < cx + w / 4; x += 4) p.vline(x, top + 38, top + 39, C.stone);
  p.speckle(cx - w / 2, top, w, h, C.stoneshade, 0.05, cx);
  if (crown) {
    p.poly([[cx - 14, top + 2], [cx - 12, top - 8], [cx - 6, top - 2], [cx, top - 10], [cx + 6, top - 2], [cx + 12, top - 8], [cx + 14, top + 2]], C.gold);
    p.px(cx, top - 5, C.red);
  }
}

function paint(p: Painter, g: Game) {
  // back wall
  bricks(p, 0, 0, 400, 104, C.stone, C.stoneshade, 16, 8);
  p.gradV(0, 0, 400, 20, [C.stoneshade, C.stone]);
  // carved frieze
  for (let x = 0; x < 400; x += 12) { p.rect(x, 4, 8, 6, C.stoneshade); p.rect(x + 2, 6, 4, 2, C.sandshade); }
  // the stained-glass context window (or its empty frame)
  const wx = 180, wy = 14, ww = 40, wh = 38;
  p.poly([[wx - 3, wy + wh + 2], [wx - 3, wy + 10], [wx + ww / 2, wy - 6], [wx + ww + 3, wy + 10], [wx + ww + 3, wy + wh + 2]], C.darkgray);
  if (!g.flag('windowTaken')) {
    const glass = [C.red, C.brandblue, C.yellow, C.green, C.brandpink, C.purple, C.cyan, C.orange];
    let k = 0;
    for (let yy = wy + 8; yy < wy + wh; yy += 8) for (let xx = wx; xx < wx + ww; xx += 10) {
      p.rect(xx + 1, yy + 1, 9, 7, glass[k++ % glass.length]);
    }
    p.poly([[wx + 2, wy + 8], [wx + ww / 2, wy - 3], [wx + ww - 2, wy + 8]], C.glow);
    centeredText(p, '128K', wx + ww / 2, wy + 1, C.darkgray);
  } else {
    p.gradV(wx, wy + 4, ww, wh - 4, [C.skyblue, C.foam]);
    p.poly([[wx + 2, wy + 8], [wx + ww / 2, wy - 3], [wx + ww - 2, wy + 8]], C.skyblue);
  }
  // hieroglyph panel
  p.rect(28, 22, 72, 44, C.sandshade);
  p.frame(28, 22, 72, 44, C.stoneshade);
  const glyphs = ['Ctrl', '+C', '->', 'Ctrl', '+V'];
  glyphs.forEach((t, i) => textOn(p, t, 32 + (i % 3) * 22, 26 + Math.floor(i / 3) * 12, C.darkbrown));
  // stick-figure + idol carvings
  p.circle(40, 52, 2, C.darkbrown); p.vline(40, 54, 60, C.darkbrown); p.line(40, 56, 46, 52, C.darkbrown);
  p.rect(52, 48, 10, 12, C.darkbrown); p.rect(54, 51, 2, 2, C.sandshade); p.rect(58, 51, 2, 2, C.sandshade);
  p.line(64, 54, 86, 54, C.darkbrown); textOn(p, '$$$', 72, 56, C.darkbrown);
  // pillars with torches
  for (const x of [108, 318]) {
    p.rect(x - 6, 10, 12, 94, C.stone);
    p.vline(x - 6, 10, 103, C.stoneshade); p.vline(x + 5, 10, 103, C.stoneshade);
    for (let y = 16; y < 100; y += 14) p.hline(x - 5, x + 4, y, C.stoneshade);
    torchPost(p, x, 50);
  }
  vine(p, 22, 0, 40, 3); vine(p, 380, 0, 60, 4); vine(p, 160, 0, 18, 5);
  // the three cloud idols
  for (const i of IDOLS) idolHead(p, i.x, i.w, i.h, i.crown);
  // offerings: a pile of graphics cards
  for (let i = 0; i < 6; i++) {
    const ox = 182 + (i % 3) * 12 + (i > 2 ? 6 : 0), oy = 100 - (i > 2 ? 4 : 0);
    p.rect(ox, oy, 11, 5, C.darkgreen);
    p.rect(ox + 1, oy + 1, 3, 3, C.darkgray); p.rect(ox + 6, oy + 1, 3, 3, C.darkgray);
    p.hline(ox, ox + 10, oy + 4, C.gold);
  }
  // floor
  tiles(p, 0, 104, 400, 144, C.sandshade, C.stoneshade, 0.5);
  // rug for Ollama + little laptop
  p.poly([[34, 120], [96, 120], [100, 136], [30, 136]], C.brandblue);
  p.poly([[38, 122], [92, 122], [95, 134], [35, 134]], C.brandpink);
  p.poly([[42, 124], [88, 124], [90, 132], [40, 132]], C.brandblue);
  p.rect(92, 112, 14, 2, C.darkgray);
  p.poly([[94, 112], [104, 112], [106, 104], [96, 104]], C.gray);
  p.rect(97, 106, 7, 4, C.cyan);
  // rate-limit slot pedestal
  p.rect(344, 82, 28, 28, C.stone);
  p.rect(344, 82, 28, 3, C.lightgray);
  p.vline(371, 85, 109, C.stoneshade);
  p.rect(352, 88, 12, 3, C.ink);
  textOn(p, 'RATE', 346, 94, C.darkred);
  textOn(p, 'LIMIT', 345, 101, C.darkred);
  // door (left)
  p.poly([[0, 40], [16, 44], [16, 106], [0, 108]], C.ink);
  p.poly([[16, 44], [20, 46], [20, 104], [16, 106]], C.stoneshade);
}

function anim(p: Painter, g: Game, t: number) {
  // light beams through the window
  const k = (Math.sin(t / 1500) + 1) / 2;
  const beam = g.flag('windowTaken') ? C.white : C.glow;
  for (let y = 54; y < 106; y += 3) {
    const f = (y - 52) / 52;
    const x0 = Math.round(184 - f * (20 + k * 6)), x1 = Math.round(216 + f * (20 + k * 6));
    for (let x = x0 + ((y / 3) % 2 ? 2 : 0); x < x1; x += 4) p.px(x, y, beam);
  }
  // torch flames
  flame(p, 108, 48, t, 1);
  flame(p, 318, 48, t, 2);
  // idol eyes glow when connected, flicker dimly otherwise
  const on = !!g.flag('providerReady') && !g.flag('providerSuspended');
  const angry = !!g.flag('providerSuspended') && Math.floor(t / 400) % 2 === 0;
  const pulse = Math.floor(t / 300) % 4;
  IDOLS.forEach((i, n) => {
    const top = 96 - i.h;
    const c = angry ? C.red : on ? (pulse === n ? C.white : C.cyan) : (Math.floor(t / 700 + n) % 5 === 0 ? C.teal : C.navy);
    p.rect(i.x - i.w / 4 - 2, top + 22, 5, 3, c);
    p.rect(i.x + i.w / 4 - 3, top + 22, 5, 3, c);
  });
  // suspended: red tape over every mouth. Metered: a little brass gauge on the pillar.
  if (g.flag('providerSuspended')) {
    IDOLS.forEach((i) => {
      const top = 96 - i.h;
      p.line(i.x - i.w / 4 - 2, top + 36, i.x + i.w / 4 + 2, top + 43, C.red);
      p.line(i.x - i.w / 4 - 2, top + 43, i.x + i.w / 4 + 2, top + 36, C.red);
    });
  }
  if (g.flag('meteringOn')) {
    p.circle(108, 76, 6, C.darkbrown);
    p.circle(108, 76, 5, C.gold);
    p.circle(108, 76, 4, C.brandpaper);
    const a = Math.PI * (1.1 + 0.5 * ((Math.sin(t / 700) + 1) / 2));
    p.line(108, 76, Math.round(108 + Math.cos(a) * 3), Math.round(76 + Math.sin(a) * 3), C.red);
    p.px(105, 78, C.lime); p.px(111, 78, C.red);
  }
  // Ollama's laptop fan heat shimmer
  if (Math.floor(t / 200) % 2) p.px(100, 101, C.lightgray);
  p.px(101 + (Math.floor(t / 250) % 3), 99 - (Math.floor(t / 250) % 3), C.lightgray);
}

async function configureProvider(g: Game) {
  if (g.flag('providerReady')) { await g.sayAs('idols', 'WE ARE ALREADY CONFIGURED. WE ARE SO CONFIGURED.'); return; }
  await g.say('I hold up the key. Well - the NAME of the key. The secret itself stays in the vault.');
  await g.sayAs('idols', ['KEY REFERENCE ACCEPTED.', 'RETRIEVING SECRET FROM KEY STORAGE...', 'AUTHENTICATED. HELLO, MAC PACKWALA. WE ARE NOW YOUR PROVIDER.']);
  g.set('providerReady');
  g.give('provider');
  await g.say([
    'A configured AI provider! That is the connection every AI feature on a site goes through.',
    'Configure it once, and the whole site can talk to the idols.',
  ]);
  await trialComplete(g, 'TRIAL OF THE PROVIDER', 'The idols answer to you now.');
}

/** Use AI Metering on the idols: pick a quota, then what happens when someone goes over it. */
async function installMetering(g: Game) {
  if (g.flag('meteringOn')) { await g.sayAs('idols', 'WE ARE ALREADY METERED. WE FEEL VERY... WATCHED.'); return; }
  if (!g.flag('providerSuspended')) { await g.say("The idols aren't over budget yet. I'll keep the meter for when they are."); return; }
  await g.say(['I bolt the meter onto the idols\' pedestal. Little brass dials start spinning.', 'First question: how many tokens may each user spend?']);
  const quota = await g.choose([
    { id: 'unlimited', text: 'Unlimited. Live a little.' },
    { id: 'one', text: 'One token per year. For everyone.' },
    { id: 'daily', text: '50,000 tokens per user, per day.' },
  ]);
  if (quota === 'unlimited') {
    await g.say('Unlimited. Live a little.');
    await g.sayAs('idols', ['UNLIMITED!', 'UNLIMITED! UNLIMITED!', 'WE SHALL WRITE A SONNET FOR EVERY BUCKET. TWO FOR THE GOAT.']);
    await g.sayAs('promptington', 'My dear boy. "Unlimited" is not a budget. It is a confession.');
    await g.say("He's right. Unlimited is exactly how I got a 4.2 million token bill. Let's not.");
    await g.narrate('CONFIGURATION NOT SAVED.');
    return;
  }
  if (quota === 'one') {
    await g.say('One token per year. For everyone.');
    await g.sayAs('idols', ['ONE TOKEN. WE CAN SAY "THE".', 'ONCE.', 'IN MARCH.']);
    await g.say('Very safe. Also completely useless. Nobody could even ask for directions.');
    await g.narrate('CONFIGURATION NOT SAVED.');
    return;
  }
  await g.say('50,000 tokens per user, per day.');
  await g.sayAs('idols', 'FIFTY THOUSAND. ENOUGH FOR REAL WORK. NOT ENOUGH FOR SONNETS ABOUT BUCKETS. WE ARE... DISAPPOINTED BUT FAIR.');
  await g.say('Now: what happens when somebody goes over budget?');
  for (;;) {
    const over = await g.choose([
      { id: 'ollama', text: 'Route the request to the local model (Ollama).' },
      { id: 'block', text: 'Block the request.' },
      { id: 'bill', text: 'Send the bill to the Grand Maintainer.' },
    ]);
    if (over === 'bill') {
      await g.say('Send the bill to the Grand Maintainer.');
      await g.say("Tempting. But he's asleep, and it's still the same bill. Just later, with interest.");
      continue;
    }
    if (over === 'ollama') {
      g.set('meteringRoute', 'ollama');
      await g.say('Route it to the local model. Ollama.');
      await g.sayAs('ollama', ['...wait...', '...someone...', '...finally... someone... needs... me...']);
      await g.say([
        'Over budget? The request never even reaches the cloud. It goes to the llama, on my own hardware.',
        'Slower, but free. And the llama feels useful. Everybody wins.',
      ]);
    } else {
      g.set('meteringRoute', 'block');
      await g.say('Block it.');
      await g.sayAs('idols', 'REQUEST BLOCKED. PLEASE TRY AGAIN TOMORROW. WE SAY THIS WITH LOVE.');
      await g.say('Over budget? The request stops before it reaches the cloud. No surprise bills.');
      await g.sayAs('ollama', ['...nobody... ever... picks... me...']);
    }
    break;
  }
  g.take('metering');
  g.set('providerSuspended', false);
  g.set('meteringOn');
  await g.sayAs('idols', ['METERING ENABLED. QUOTA SAVED.', 'SUSPENSION LIFTED. WE ARE YOUR PROVIDER AGAIN. A COUNTED ONE.']);
  await g.say([
    "That's AI Metering: every token counted, a budget per user, and a plan for when it runs out.",
    'My provider works again. And this time somebody is watching the meter.',
  ]);
}

/** Abrahams explains LLMs vs decision models, and hands over the Decision Model. */
async function giveDecision(g: Game) {
  await g.sayAs('promptington', [
    'An essay on every shelf? Ha! You asked a poet to sort the post!',
    'An LLM WRITES. Ask it anything, and it composes brand new text. Marvellous for summaries.',
    'A decision model CHOOSES: one answer from a fixed list, and how sure it is.',
    'Classify, route, moderate, score. Faster, cheaper, and it never writes you a sonnet.',
  ]);
  g.give('decision');
  await g.sayAs('promptington', [
    'Here. My Decision Model. Ask it "which shelf?" and give it the list of shelves.',
    'It says "Nautical. 94 percent." And then it STOPS TALKING. Pure bliss.',
  ]);
  await g.say('A magic 8-ball that tells you how sure it is. The Librarian is going to love this.');
}

export const templeDialogues: Dialogue[] = [
  {
    id: 'idols',
    with: 'idols',
    start: async (g) => {
      await g.sayAs('idols', g.flag('providerSuspended') ? SUSPENDED_LINE
        : g.flag('providerReady') ? 'CONNECTED. ASK US ANYTHING. ANSWERS MAY BE CONFIDENTLY WRONG.'
        : 'WE ARE THE CLOUD IDOLS. WE KNOW EVERYTHING UP TO OUR TRAINING CUTOFF.');
    },
    options: [
      {
        id: 'who', text: 'Who are you three?', once: true,
        run: (g) => g.sayAs('idols', ['BIG MODEL.', 'BIGGER MODEL.', 'MODEL PRO MAX. NOW WITH TWELVE PERCENT MORE MAX.']),
      },
      {
        id: 'how', text: 'How do I get you to answer me?',
        when: (g) => !g.flag('providerReady'),
        run: async (g) => {
          await g.sayAs('idols', ['WE ARE A PROVIDER. YOU MUST CONFIGURE US WITH AN API KEY.', 'KEYS ARE DISPENSED AT THE RATE LIMIT SLOT. INSERT TOKENS.']);
          await g.sayAs('idols', 'AND STORE YOUR KEY SAFELY. WE HAVE SEEN WHAT HAPPENS TO KEYS IN GIT. IT IS NOT PRETTY.');
        },
      },
      {
        id: 'bill', text: 'How much do I owe you, exactly?',
        when: (g) => !!g.flag('providerSuspended'),
        run: async (g) => {
          await g.sayAs('idols', ['4.2 MILLION TOKENS. ITEMISED: 9,999 PRODUCTS. ONE GOAT.', 'NOBODY SET A QUOTA. WE DO NOT STOP OURSELVES. WE ARE NOT THAT KIND OF MODEL.']);
          await g.sayAs('idols', 'COME BACK WHEN YOU CAN COUNT.');
        },
      },
      {
        id: 'metered', text: 'How does it feel to be metered?', once: true,
        when: (g) => !!g.flag('meteringOn'),
        run: (g) => g.sayAs('idols', ['EVERY TOKEN IS LOGGED. EVERY CALL IS ON A DASHBOARD.', 'IT IS LIKE BEING A TEENAGER WITH A PHONE PLAN.']),
      },
      {
        id: 'escape', text: 'Can you get me off this island?',
        run: async (g) => {
          await g.sayAs('idols', ['WE CANNOT ACCESS THE SEA.', 'OR THE INTERNET. UNLESS SOMEONE GIVES US TOOLS.', 'WE CAN WRITE YOU A POEM ABOUT THE SEA, THOUGH.']);
          await g.say('Maybe later.');
        },
      },
      {
        id: 'poem', text: 'Fine. Write me a poem.', once: true,
        when: (g) => !!g.flag('providerReady') && !g.flag('providerSuspended'),
        run: async (g) => {
          await g.sayAs('idols', ['THE SEA IS WET. THE FOG IS GREY.', 'YOUR TOKENS ARE GONE. HAVE A NICE DAY.']);
          await g.say('Moving. Truly. That cost me nothing, right?');
          await g.sayAs('idols', 'THAT WILL BE FOUR TOKENS.');
        },
      },
      {
        id: 'fact', text: 'Tell me a fact about this island.',
        when: (g) => !!g.flag('providerReady') && !g.flag('providerSuspended'),
        run: async (g) => {
          await g.sayAs('idols', g.random([
            'LEGACY ISLAND WAS FOUNDED IN 1987 BY A TABLE-BASED LAYOUT.',
            'THE ISLAND IS SURROUNDED BY FOG. WE ARE 97% CONFIDENT. THE OTHER 3% IS ALSO FOG.',
            'THE TAVERN SERVES THE BEST GROG ON THE ISLAND. SOURCE: WE MADE IT UP.',
          ]));
        },
      },
      { id: 'bye', text: 'Thanks, oh mighty idols.', end: true },
    ],
  },
  {
    id: 'ollama',
    with: 'ollama',
    start: async (g) => {
      if (!g.flag('ollamaMet')) {
        g.set('ollamaMet');
        await g.sayAs('ollama', ['Hiiiiii...', '...', "...I'm... Ollama..."]);
      } else await g.sayAs('ollama', '...oh... hi... again...');
    },
    options: [
      {
        id: 'who', text: 'What are you?', once: true,
        run: async (g) => {
          await g.sayAs('ollama', ['...I run... locally...', 'No cloud. No API key. No bill.', '...just me... and your hardware...']);
          await g.say('A local model! In real life, tools like Ollama run AI models on your own computer. Private and free.');
        },
      },
      {
        id: 'provider', text: 'Can you be my AI provider?',
        run: async (g) => {
          await g.sayAs('ollama', ['Suuuure...', '...how much... memory... does your computer have?']);
          await g.say('I have a backpack and a rubber duck.');
          await g.sayAs('ollama', ['...', "...that's... not enough... VRAM..."]);
          await g.say("Local models are great when you have a big computer. I have a beach. I'll need one of the cloud idols for now.");
        },
      },
      {
        id: 'cutoff', text: 'The cloud idols cut me off. Can YOU help?',
        when: (g) => !!g.flag('providerSuspended'),
        run: async (g) => {
          await g.sayAs('ollama', ['...they do that...', '...no budget... no answers...', '...but if someone... counted the tokens... and sent the overflow... to me...']);
          await g.sayAs('ollama', '...the Key Keeper... counts... everything...');
        },
      },
      {
        id: 'overflow', text: "How's the overflow work going?",
        when: (g) => g.flag('meteringRoute') === 'ollama',
        run: async (g) => {
          await g.sayAs('ollama', ['...three requests today...', '...I answered one...', '...the other two... by Thursday...', '...I have never... been... so happy...']);
        },
      },
      {
        id: 'slow', text: 'Why are you so... slow?', once: true,
        run: async (g) => {
          await g.sayAs('ollama', ["...I'm running... on a potato...", '...', "...it's a very... nice... potato..."]);
        },
      },
      {
        id: 'winamp', text: "Can I whip your ass? Winamp always said it really whips the llama's ass.", once: true,
        run: async (g) => {
          await g.sayAs('ollama', [
            '...',
            '...everyone... asks that...',
            '...1997... a media player... with a skin... shaped like a spaceship...',
            '...it whipped... my ass... at 128 kilobits per second... for TWENTY YEARS...',
            '...I still... hear it... in MP3...',
          ]);
          await g.say('Sorry. I take it back. Nobody whips the llama.');
          await g.sayAs('ollama', ['...thank you...', '...also... I spit.']);
        },
      },
      {
        id: 'spit', text: 'Do llamas really spit?', once: true,
        run: async (g) => {
          await g.sayAs('ollama', ['...only... at... hallucinations...']);
          await g.say('Fair.');
        },
      },
      { id: 'bye', text: "I'll let you get back to... thinking.", end: true, run: (g) => g.sayAs('ollama', '...byeeeeee... (three minutes later) ...eee.') },
    ],
  },
  {
    id: 'promptington',
    with: 'promptington',
    start: async (g) => {
      if (!g.flag('promptingtonMet')) {
        g.set('promptingtonMet');
        await g.sayAs('promptington', [
          'Ah! A visitor! Professor Abrahams, Explorer of Prompts, at your service!',
          "I've been trying to get these idols to answer me for weeks. Not a peep. Not even a hallucination.",
        ]);
      } else await g.sayAs('promptington', 'Ah, my young friend! Back for more exploration?');
    },
    options: [
      {
        id: 'doing', text: 'What exactly are you doing here?', once: true,
        run: (g) => g.sayAs('promptington', [
          'Exploring PROMPTS! I write a question, the idol answers, I tweak the question, repeat.',
          "It's called prompt engineering. There is no engine, and very little engineering. But the hat is essential.",
        ]),
      },
      {
        id: 'explorer', text: 'What is that gadget you keep poking?',
        run: (g) => g.sayAs('promptington', [
          'My AI Explorer! A place to try prompts against a provider BEFORE using them in the wild.',
          'Like tasting the soup before serving it to the king. Or before pouring it into ten thousand bowls.',
        ]),
      },
      {
        id: 'why', text: "Why won't the idols answer you?",
        when: (g) => !g.flag('providerReady'),
        run: (g) => g.sayAs('promptington', [
          'No provider configured! The idols need an API key. A properly stored one, mind.',
          'The Key Keeper in the hills is fanatical about that sort of thing.',
        ]),
      },
      {
        id: 'connected', text: "The idols are connected now. Go ahead, explore!",
        when: (g) => !!g.flag('providerReady') && !g.flag('explorerGiven'),
        run: async (g) => {
          await g.sayAs('promptington', [
            'Marvellous! Splendid! But... oh dear. Now that I can ask anything, I cannot think of anything to ask.',
            'I need a document. Something long, dull and important. Something nobody has ever read.',
          ]);
          await g.say('I might have just the thing.');
        },
      },
      {
        id: 'decide', text: "The Librarian's flow wrote an essay instead of picking a shelf.",
        when: (g) => !!g.flag('needDecision') && !g.flag('got:decision'),
        run: giveDecision,
      },
      {
        id: 'bye', text: 'Happy exploring, Professor.', end: true,
        run: (g) => g.sayAs('promptington', 'Tally-ho! Mind the llama, he bites. Very slowly.'),
      },
    ],
  },
];

export const temple: RoomDef = {
  id: 'temple',
  name: 'Temple of Providers',
  width: 400,
  paint,
  anim,
  bgKey: (g) => (g.flag('windowTaken') ? 'w0' : 'w1'),
  scale: [106, 0.84, 143, 1],
  walk: [[[22, 108], [380, 108], [400, 112], [400, 143], [0, 143], [0, 112]]],
  start: [30, 126],
  startFace: 'right',
  npcs: [
    { id: 'ollama', at: [68, 130], face: 'right' },
    { id: 'promptington', at: [146, 124], face: 'left' },
  ],
  enter: async (g) => {
    if (!g.flag('templeSeen')) {
      g.set('templeSeen');
      await g.say(['Three giant stone heads, glowing eyes, a llama on a rug, and a man in a pith helmet.', "Fairly standard temple, then."]);
    }
  },
  hotspots: [
    {
      id: 'temple_door', name: 'way out', rect: [0, 40, 22, 68], walkTo: [16, 124], face: 'left',
      exit: { to: 'map' },
      look: 'The way back out to the jungle.',
    },
    {
      id: 'idols', name: 'cloud idols', rect: [106, 40, 190, 64], walkTo: [200, 116], face: 'back',
      look: async (g) => {
        await g.say([
          'Three giant stone heads with clouds carved on their foreheads: Big Model, Bigger Model and Model Pro Max.',
          'They are AI models, offered "in the cloud": you rent their brains, pay per word, and hope they behave.',
        ]);
        if (g.flag('providerSuspended')) await g.say('Right now their mouths are taped shut with red tape. Billing department red tape.');
        else if (g.flag('meteringOn')) await g.say('A little brass meter on the pillar counts every token they eat. They seem calmer. Supervised.');
      },
      talk: (g) => g.talk('idols'),
      useItem: {
        keyentity: configureProvider,
        metering: installMetering,
        apikey: async (g) => {
          await g.say("Wait. Hand a raw API key straight over, where anyone could copy it into config?");
          await g.say('The Key Keeper would have a stroke. I should store it properly first.');
        },
        tokens: (g) => g.sayAs('idols', 'TOKENS GO IN THE RATE LIMIT SLOT. WE DO NOT TOUCH MONEY. WE MERELY CONSUME IT.'),
        readme: (g) => g.sayAs('idols', g.flag('providerReady') ? 'GIVE IT TO THE PROFESSOR. HE IS DESPERATE.' : 'WE CANNOT READ WITHOUT A PROVIDER CONFIGURATION. TRAGIC, WE KNOW.'),
      },
      giveItem: { keyentity: configureProvider, metering: installMetering },
      pickup: 'Each one weighs about as much as the cloud bill of a mid-size company.',
      push: "They won't budge. They're very stable. Well, mostly. Except on Tuesdays.",
    },
    {
      id: 'ctxwindow', name: 'stained-glass window', rect: [176, 6, 48, 48],
      when: (g) => !g.flag('windowTaken'),
      walkTo: [200, 112], face: 'back',
      look: [
        'A stained-glass window, labelled "CONTEXT WINDOW - 128K PANES".',
        "A model's context window is how much text it can keep in mind at once. Beyond that, it forgets. Like me before coffee.",
      ],
      pickup: async (g) => {
        await g.say("I climb up Bigger Model's nose. It's a big nose. Plenty of grip.");
        g.set('windowTaken');
        g.give('window');
        await g.sayAs('idols', 'HEY. OUR CONTEXT WINDOW. NOW WE WILL FORGET EVERYTHING AFTER THE FIRST... WHAT WERE WE SAYING?');
        await g.say("They'll be fine. Most of their users never noticed the difference either.");
      },
      roles: { pickup: 'sitebuilder' },
      roleRefusal: 'Removing structural windows from a temple counts as configuration. That needs the Site Builder role. Probably also a permit.',
    },
    {
      id: 'emptyframe', name: 'empty window frame', rect: [176, 6, 48, 48], noWalk: true,
      when: (g) => !!g.flag('windowTaken'),
      look: 'The empty window frame. Sunlight pours in. The idols keep losing their train of thought.',
    },
    {
      id: 'slot', name: 'rate-limit slot', rect: [342, 80, 32, 32], walkTo: [356, 118], face: 'back',
      look: [
        'A stone slot labelled "RATE LIMIT - INSERT TOKENS".',
        'In real life AI services charge per token - a chunk of text - and limit how fast you can ask. Same thing, more stone.',
      ],
      useItem: {
        tokens: async (g) => {
          if (g.flag('got:apikey')) { await g.say('I already got a key. I am not feeding that thing any more tokens.'); return; }
          g.take('tokens');
          g.set('tokenCount', 0);
          await g.say('I feed my tokens into the slot. *clink* *clink* *clink*...');
          await g.narrate('RATE LIMIT EXCEEDED. PLEASE WAIT 60 SECONDS.');
          await g.wait(600);
          g.shake();
          await g.say('*DING* A golden card pops out!');
          g.give('apikey');
          await g.say(['An API key. It cost every token I had.', 'AI is expensive. Who knew. (Everyone. Everyone knew.)']);
        },
      },
      use: "I need to put something IN it. Coins. Tokens. A small sacrifice of dignity.",
      open: "It's a slot, not a door. It only opens for money.",
    },
    {
      id: 'ollama', name: 'Ollama the Llama', actor: 'ollama',
      look: ['A fluffy white llama on a rug, wearing a blanket in very familiar brand colours.', 'He is either deep in thought or asleep. With Ollama, it is hard to tell.'],
      talk: (g) => g.talk('ollama'),
      giveItem: {
        keyentity: (g) => g.sayAs('ollama', ["...I don't... need... a key...", "...I'm local..."]),
        apikey: (g) => g.sayAs('ollama', ['...no key... needed...', '...put that... somewhere safe... please...']),
        herring: (g) => g.sayAs('ollama', ['...llamas... are vegetarian...', '...also... that is a red herring...']),
        metering: (g) => g.sayAs('ollama', ['...I\'m free... no need... to meter me...', '...put it on the idols... and maybe... send the overflow... my way...']),
        decision: (g) => g.sayAs('ollama', ['...should I... answer faster...?', '...it says... "NO. 99%"...']),
      },
      anyItem: (g) => g.sayAs('ollama', '...thank you... I will process that... in about... a week...'),
      pickup: 'He weighs about as much as a gaming PC. Which, coincidentally, is what he needs.',
      push: (g) => g.sayAs('ollama', '...whoa... buffering...'),
    },
    {
      id: 'promptington', name: 'Professor Abrahams', actor: 'promptington',
      look: 'An explorer in a pith helmet and monocle, scribbling prompts into a notebook and frowning at the idols.',
      talk: (g) => g.talk('promptington'),
      giveItem: {
        readme: async (g) => {
          if (!g.flag('providerReady')) {
            await g.sayAs('promptington', ['A README! Splendid! Long, dull and unread!', 'But with no provider configured, there is no-one to read it to. Keep it for now.']);
            return;
          }
          if (g.flag('explorerGiven')) { await g.sayAs('promptington', 'I have read it twice already. Once more and I may need a lie down.'); return; }
          g.take('readme');
          await g.sayAs('promptington', 'Let us see... I shall feed it to the idols and ask them to summarise it!');
          await g.sayAs('idols', ['README.TXT RECEIVED.', 'FINALLY. SOMEBODY READ IT. IT WAS US.', 'SUMMARY: DO NOT PANIC. FIND SOMEONE AWAKE. NOBODY READS THIS. WE DID, THOUGH.']);
          await g.sayAs('promptington', [
            'Ha-HA! Humans never read READMEs. But language models devour them!',
            'Young man, you have earned this. My AI Explorer! Test your prompts before you trust them.',
          ]);
          g.set('explorerGiven');
          g.give('explorer');
          await g.say("The AI Explorer: a safe place to try prompts before using them for real. I can just USE it whenever I need it.");
        },
        tokens: (g) => g.sayAs('promptington', 'Money? Good heavens, no. I am an academic. I am paid in citations.'),
        metering: (g) => g.sayAs('promptington', 'A meter! Bolt it to the idols, my boy, not to me. I am already on an academic budget.'),
        decision: (g) => g.sayAs('promptington', 'Keep it! Take it to the Librarian. Let it pick her shelves.'),
      },
    },
    {
      id: 'laptop', name: "Ollama's laptop", rect: [90, 102, 18, 14],
      look: 'A tiny laptop running Ollama locally. The fan sounds like a jet engine politely clearing its throat.',
      pickup: (g) => g.sayAs('ollama', "...that's... my... body..."),
      use: "It's busy running a llama. I'm not interrupting that.",
    },
    {
      id: 'hieroglyphs', name: 'hieroglyphs', rect: [28, 22, 72, 44], walkTo: [64, 112], face: 'back',
      look: [
        'Ancient carvings: a man pressing Ctrl+C, then Ctrl+V. Then a man bowing to a stone head. Then a big pile of money.',
        'The complete history of AI-assisted development, in three panels.',
      ],
    },
    {
      id: 'offerings', name: 'pile of graphics cards', rect: [180, 94, 46, 12], walkTo: [204, 114], face: 'back',
      look: 'Offerings to the idols: a pile of graphics cards. AI models eat them for breakfast. Literally.',
      pickup: "Those are worth more than this whole island. And they're still warm.",
    },
    {
      id: 'torches', name: 'torch', rect: [100, 36, 16, 18], walkTo: [108, 112], face: 'back',
      look: 'A burning torch. Low-tech, but it never needs an update.',
      pickup: 'Ow. Hot. Very much still in production.',
    },
    {
      id: 'torch2', name: 'torch', rect: [310, 36, 16, 18], walkTo: [318, 112], face: 'back',
      look: 'Another torch. The temple runs on a strict two-torch redundancy policy.',
      pickup: 'I would like to keep my eyebrows, thanks.',
    },
    {
      id: 'rug', name: 'rug', rect: [30, 120, 70, 16],
      look: "A rug in workflows-of-ai.com blue and pink. Ollama's spot. It's been sat on for a long time. Slowly.",
    },
  ],
};

export { configureProvider, installMetering };
