import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import type { Painter } from '../../../engine/paint';
import { C, sky, cloud, sea, surf, seagull, planks, textOn, centeredText, crate, barrel } from '../../art';
import { drawText } from '../../../engine/font';

function paint(p: Painter, g: Game) {
  sky(p, 320, 64, 'day');
  cloud(p, 120, 14, 0.8);
  cloud(p, 250, 8, 1);
  // fog + distant lighthouse on its rock
  for (let i = 0; i < 10; i++) p.ellipse(130 + i * 22, 58 - (i % 3) * 2, 18, 7, [C.fog, C.lightgray]);
  p.poly([[268, 60], [300, 60], [294, 52], [274, 52]], C.stoneshade);
  p.poly([[280, 52], [290, 52], [288, 24], [282, 24]], C.white);
  for (let y = 30; y < 52; y += 8) p.hline(281, 289, y, C.red);
  p.rect(280, 18, 10, 6, C.darkgray);
  p.poly([[279, 18], [291, 18], [285, 13]], C.red);
  sea(p, 0, 60, 320, 46);

  // the half-built ship "The Inevitable Rewrite", on scaffolding
  p.poly([[150, 96], [160, 70], [290, 66], [300, 96]], [C.seadark, C.sea, '25']);
  for (let i = 0; i < 9; i++) {
    const x = 166 + i * 14;
    p.line(x, 98, x - 4, 64 - (i % 2) * 3, C.woodlight);
    p.line(x + 1, 98, x - 3, 64 - (i % 2) * 3, C.wood);
  }
  p.line(160, 96, 296, 96, C.wood);
  p.line(158, 78, 294, 74, C.wood);
  // half the planking
  p.poly([[160, 78], [214, 77], [214, 96], [156, 96]], C.wood);
  for (let y = 80; y < 96; y += 4) p.hline(158, 213, y, C.woodlight);
  // keel
  p.line(150, 96, 300, 96, C.darkbrown);
  // scaffolding
  for (const x of [176, 236, 286]) { p.vline(x, 34, 100, C.darkgray); p.vline(x + 1, 34, 100, C.gray); }
  p.hline(176, 287, 46, C.gray);
  p.hline(176, 287, 60, C.gray);
  p.line(176, 46, 236, 60, C.darkgray);
  p.line(236, 46, 286, 60, C.darkgray);
  // the sign
  p.rect(200, 22, 74, 28, C.white);
  p.frame(200, 22, 74, 28, C.ink);
  centeredText(p, 'REWRITE DONE', 237, 24, C.ink);
  centeredText(p, 'IN: 2 WEEKS', 237, 33, C.red);
  for (let i = 0; i < 20; i++) p.vline(204 + i * 3, 43, 47, i % 5 === 4 ? C.red : C.gray);

  // dock
  planks(p, 0, 104, 320, 40, false, C.wood, C.woodlight, 7);
  p.hline(0, 319, 104, C.darkbrown);
  for (let x = 0; x < 320; x += 40) { p.rect(x + 2, 100, 6, 8, C.darkbrown); p.ellipse(x + 5, 100, 3, 1, C.wood); }

  // booth: Harbour Office
  p.rect(18, 34, 96, 72, C.sea);
  planks(p, 18, 34, 96, 72, true, C.teal, C.sea, 3);
  p.poly([[10, 36], [64, 18], [122, 36]], C.red);
  p.hline(10, 121, 36, C.darkred);
  p.rect(26, 22, 80, 12, C.white);
  p.frame(26, 22, 80, 12, C.ink);
  centeredText(p, 'HARBOUR OFFICE', 66, 24, C.ink);
  // the service window (Formsworth stands inside)
  p.rect(40, 46, 52, 46, C.darkbrown);
  p.gradV(42, 48, 48, 44, [C.brown, C.darkbrown]);
  // back-room shelves full of forms
  for (let i = 0; i < 3; i++) {
    p.hline(42, 89, 56 + i * 10, C.wood);
    for (let k = 0; k < 9; k++) p.rect(44 + k * 5, 52 + i * 10, 4, 4, k % 3 ? C.white : C.brandmist);
  }
  // little signs beside the window
  p.rect(96, 52, 16, 22, C.white);
  drawText(p, '#', 101, 54, C.brandblue);
  drawText(p, '#', 101, 63, C.brandpink);
  p.rect(20, 52, 16, 24, C.yellow);
  textOn(p, 'NO', 22, 55, C.ink);
  textOn(p, '#?', 22, 64, C.red);

  booth(p);
  if (spamming(g)) spamPile(p);

  // right: crates, net, bollard, bell, rope
  crate(p, 112, 110, 16, 12);
  crate(p, 118, 98, 12, 10);
  barrel(p, 134, 104, 12, 18, C.wood);
  p.rect(296, 82, 3, 24, C.darkbrown);
  for (let i = 0; i < 5; i++) p.line(296 - i * 6, 82 + i, 300, 104, C.tan);
  for (let i = 0; i < 4; i++) p.line(270, 84 + i * 5, 298, 84 + i * 5, C.tan);
  // rope coil
  for (let r = 2; r < 9; r += 2) p.ellipseOutline(250, 128, r + 2, r / 2 + 1, C.tan);
  // bollard
  p.rect(214, 110, 10, 12, C.darkgray);
  p.ellipse(219, 110, 6, 2, C.gray);
  // ship's bell on a post
  p.rect(160, 88, 3, 24, C.wood);
  p.hline(158, 172, 88, C.wood);
  p.poly([[166, 90], [172, 90], [174, 98], [164, 98]], C.gold);
  p.px(169, 99, C.darkbrown);
  // path to town
  p.poly([[300, 104], [320, 102], [320, 144], [306, 144]], [C.stone, C.wood, '25']);
}

function booth(p: Painter) {
  // the counter and lower wall of the booth (Formsworth is drawn waist-up)
  planks(p, 18, 92, 96, 26, true, C.teal, C.sea, 3);
  p.poly([[34, 90], [98, 90], [94, 95], [38, 95]], C.woodlight);
  // stamp, inkpad and a stack of forms on the counter
  p.rect(80, 86, 6, 4, C.darkred);
  p.rect(82, 82, 2, 4, C.wood);
  p.rect(42, 84, 12, 6, C.white);
  p.hline(42, 53, 86, C.brandmist);
  p.hline(42, 53, 88, C.brandmist);
  p.rect(18, 116, 96, 2, C.darkbrown);
}

const spamming = (g: Game) => !!g.flag('accessDenied') && !g.flag('spamFixed');

/** Contact-form spam: a heap of submissions spilling out of the window onto the dock. */
function spamPile(p: Painter) {
  // sheets sliding off the counter
  for (const [x, y, a] of [[60, 86, 0], [72, 84, 1], [86, 88, 0], [94, 92, 1]] as const) {
    p.poly([[x, y], [x + 9, y - 1 + a], [x + 10, y + 5], [x + 1, y + 6]], C.white);
    p.hline(x + 2, x + 7, y + 2, C.lightgray);
  }
  // the heap on the dock
  p.poly([[72, 126], [78, 112], [88, 104], [100, 102], [110, 108], [114, 126]], C.brandmist);
  p.poly([[76, 126], [82, 114], [92, 108], [104, 108], [110, 116], [112, 126]], C.white);
  for (let i = 0; i < 9; i++) {
    const x = 78 + ((i * 13) % 30), y = 108 + ((i * 7) % 16);
    p.rect(x, y, 8, 5, i % 3 ? C.white : C.brandpaper);
    p.hline(x + 1, x + 6, y + 2, i % 2 ? C.lightgray : C.pink);
  }
  // a few headlines you can read
  p.rect(84, 117, 22, 7, C.yellow);
  textOn(p, 'WIN!', 86, 117, C.red);
}

function spamGull(p: Painter, x: number, y: number, t: number, phase: number) {
  const peck = Math.floor((t + phase) / 300) % 4 === 0 ? 2 : 0;
  p.ellipse(x, y, 5, 3, C.white);
  p.hline(x - 4, x + 1, y + 1, C.lightgray);
  p.circle(x + 4, y - 3 + peck, 2, C.white);
  p.px(x + 6, y - 3 + peck, C.orange); p.px(x + 7, y - 2 + peck, C.orange);
  p.px(x + 4, y - 4 + peck, C.black);
  p.vline(x - 1, y + 3, y + 5, C.orange); p.vline(x + 1, y + 3, y + 5, C.orange);
  // tiny laptop: they are bots, after all
  p.rect(x + 6, y + 2, 6, 3, C.darkgray);
  p.hline(x + 7, x + 10, y + 1, C.cyan);
}

function anim(p: Painter, g: Game, t: number) {
  if (spamming(g)) {
    spamGull(p, 92, 98, t, 0);
    spamGull(p, 104, 106, t, 700);
    // fresh submissions fluttering in through the window
    for (let i = 0; i < 3; i++) {
      const k = ((t / 1600) + i / 3) % 1;
      const x = Math.round(60 + Math.sin((k + i) * 6) * 14), y = Math.round(54 + k * 34);
      p.rect(x, y, 5, 4, C.white);
      p.hline(x + 1, x + 3, y + 1, C.lightgray);
    }
  }
  surf(p, t, [[118, 101], [200, 102], [320, 101]], 1);
  seagull(p, 100 + Math.sin(t / 2600) * 40, 20 + Math.sin(t / 800) * 3, t);
  // seagull sitting on the bollard
  const h = Math.floor(t / 900) % 5 === 0 ? 1 : 0;
  p.ellipse(219, 104, 4, 3, C.white);
  p.circle(222, 100 - h, 2, C.white);
  p.px(224, 100 - h, C.orange);
  p.px(222, 99 - h, C.black);
  p.hline(216, 219, 105, C.lightgray);
}

// --------------------------------------------------------------- registration (Form API joke)
type Q = { q: string[]; opts: { id: string; text: string; ok: boolean; reply: string }[] };
const QUESTIONS: Q[] = [
  {
    q: ["#title: 'Username'. #required: TRUE."],
    opts: [
      { id: 'u1', text: 'Mac Packwala', ok: false, reply: "No hash. Validation error." },
      { id: 'u2', text: '#Mac #Packwala', ok: true, reply: 'Hash. Lovely. Very well-formed.' },
      { id: 'u3', text: '@mac', ok: false, reply: 'This is a form, not social media. Validation error.' },
      { id: 'u4', text: 'Mac Packwala#', ok: false, reply: 'The hash goes at the FRONT. Like a hat. Validation error.' },
    ],
  },
  {
    q: ["#title: 'E-mail address'. #type: 'email'."],
    opts: [
      { id: 'e1', text: 'mac@packwala.dev', ok: false, reply: 'Where is the hash? Validation error.' },
      { id: 'e2', text: 'Just put it in a bottle, please.', ok: false, reply: 'We do not accept bottles as input. Only as output. Validation error.' },
      { id: 'e3', text: '#mac@packwala.dev', ok: true, reply: 'A hashed e-mail. Delightful.' },
    ],
  },
  {
    q: ["#title: 'Password'. #description: 'Must start with a hash. Must not be admin.'"],
    opts: [
      { id: 'p1', text: 'hunter2', ok: false, reply: 'All I see is *******. And no hash. Validation error.' },
      { id: 'p2', text: '#correct #horse #battery #staple', ok: true, reply: 'Strong. Memorable. Hashed. You have done this before.' },
      { id: 'p3', text: '#admin', ok: true, reply: 'Hashed, technically. Terrible, morally. Accepted.' },
      { id: 'p4', text: 'password123', ok: false, reply: 'No. Just... no. Validation error.' },
    ],
  },
];

async function register(g: Game) {
  if (g.flag('regSent')) {
    await g.sayAs('formsworth', ['Your registration is complete. The verification e-mail was sent to your inbox.', 'The beach. Bottles. Where else would an inbox be?']);
    return;
  }
  await g.sayAs('formsworth', [
    'Registration! Splendid. One rule: on this island every answer begins with a hash sign. #.',
    'It is tradition. Nobody remembers why. Shall we?',
  ]);
  for (const step of QUESTIONS) {
    await g.sayAs('formsworth', step.q);
    const pick = await g.choose(step.opts.map((o) => ({ id: o.id, text: o.text })));
    const opt = step.opts.find((o) => o.id === pick)!;
    await g.say(opt.text);
    await g.sayAs('formsworth', opt.reply);
    if (!opt.ok) {
      await g.sayAs('formsworth', 'The form has been rebuilt. Please start again from the beginning.');
      return;
    }
  }
  if (!g.flag('regPass')) {
    g.set('regPass', 1);
    await g.sayAs('formsworth', ['Thank you! Submitting...', '...', 'Your form has been rebuilt. Please fill it in again.']);
    await g.say('WHAT? I filled everything in correctly!');
    await g.sayAs('formsworth', ['Yes. And then it was rebuilt. That is what forms do. Something changed somewhere.', 'Do not take it personally. Nobody knows why. Ask me again.']);
    return;
  }
  g.set('regPass', 2);
  g.set('regSent');
  await g.sayAs('formsworth', [
    'Thank you! Submitting... ...accepted!',
    'A verification e-mail has been sent to your inbox. Bring me the one-time login link.',
  ]);
  await g.say('My inbox? I don\'t have an inbox. I have a backpack and a rubber duck.');
  await g.sayAs('formsworth', 'Everyone\'s inbox is on the beach. Where the bottles wash up. Honestly, where do YOU keep your e-mail?');
}

async function spamTrouble(g: Game) {
  g.set('spamSeen');
  await g.sayAs('formsworth', [
    'Permissions? I would LOVE to. But look at this!',
    'Contact form spam. Thousands of submissions. "WIN A FREE FISH." "Hot singles in your harbour."',
    'Those seagulls are spam-bots. They have little laptops. I do not know where they got little laptops.',
    'I have AI Validations on the contact form: an add-on for Field Validation that asks an AI whether each submission is spam.',
    'But it needs a model that answers TRUE or FALSE. Just TRUE or FALSE! Then the spam bounces.',
    'Sort out my spam, and I will find your form. It is somewhere under all this.',
  ]);
}

async function stampTalk(g: Game, sayIt = true) {
  if (sayIt) await g.say('Thanks! If this works, Captain Node is taking me to the Paradise of Rosetta.');
  await g.sayAs('formsworth', [
    'Rosetta? Ooh. They check AI labels at customs there. Article 50!',
    'The EU AI Act says: if AI made it, people must be told. Take my AI Disclosure stamp. You will need it.',
  ]);
  g.give('disclosure');
}

async function llmValidate(g: Game) {
  g.set('triedLlmValidation');
  await g.say('I plug my AI provider into the validator. A big, clever language model. What could go wrong?');
  await g.narrate([
    '> AI Validation: "Is this submission spam? Answer TRUE or FALSE."',
    '> Model: "Is this spam? Well, that depends on how we define spam. Historically, the word comes from a tinned meat..."',
    '> Model: "...in conclusion, spam is a social construct. Would you like a bulleted summary?"',
    '> Validator: expected TRUE or FALSE. Received 1,400 words. Validator has stopped responding.',
  ]);
  g.shake();
  await g.sayAs('formsworth', ['It wrote an ESSAY! The validator choked on it.', 'I asked a yes-or-no question and got a TED talk.']);
  await g.say(g.has('decision')
    ? ['An LLM writes. That is its whole personality.', 'For a validator I need a model that CHOOSES. Like the Decision Model Promptington gave me.']
    : ['An LLM writes. That is its whole personality.', 'For a validator I need a model that just... chooses. Somebody on this island must have one.']);
}

async function decisionValidate(g: Game) {
  g.set('spamFixed');
  await g.say('I plug the Decision Model into the validator instead.');
  await g.narrate([
    '> AI Validation: "Is this submission spam?" Allowed answers: TRUE, FALSE.',
    '> "WIN A FREE FISH" -> TRUE (98% sure). BOUNCED.',
    '> "Hot singles in your harbour" -> TRUE (99% sure). BOUNCED.',
    '> "Lost umbrella, blue, please call" -> FALSE (91% sure). Accepted.',
  ]);
  g.shake();
  await g.narrate('The spam flies back out of the window. The seagulls close their little laptops and leave in a huff.');
  await g.sayAs('formsworth', ['TRUE. TRUE. FALSE. Crisp as a cracker!', 'My desk! I can see my desk! It is mahogany. I had forgotten.']);
  await g.say([
    'An LLM writes. A decision model picks one answer from a fixed list, and says how sure it is.',
    'Perfect for classifying, routing, moderating... and validating forms.',
  ]);
  g.refresh();
}

export const harbourDialogues: Dialogue[] = [
  {
    id: 'formsworth',
    with: 'formsworth',
    start: async (g) => {
      if (!g.flag('metForms')) {
        g.set('metForms');
        await g.sayAs('formsworth', ['Next!', 'Harbour Office. Registrations, forms, permits, and forms for permits to fill in forms.']);
      } else await g.sayAs('formsworth', g.random(['Next!', 'Yes? Do you have a form?', 'Welcome back. Form?']));
    },
    options: [
      { id: 'register', text: "I'd like to register an account.", when: (g) => g.role === 'anonymous', run: register },
      {
        id: 'hash', text: "What's with all the hash signs?", once: true,
        run: (g) => g.sayAs('formsworth', [
          'Ah! In Drupal\'s Form API, every form is a big array, and every property starts with a hash.',
          '#type. #title. #required. #default_value. #ajax. #states. #after_build. #pre_render...',
          'Here on the island we just put a hash on everything. To be safe. Hash-safe.',
        ]),
      },
      {
        id: 'nested', text: 'Why are your forms so complicated?', once: true,
        run: (g) => g.sayAs('formsworth', [
          'Complicated? This one is only nested seven levels deep. A render array inside a fieldset inside a details element inside a container...',
          'It is beautiful, if you squint. And rebuild it. Twice.',
        ]),
      },
      {
        id: 'tokens', text: "I'd like some tokens, please.", when: (g) => g.atLeast('authenticated') && !g.flag('got:tokenform'),
        run: async (g) => {
          await g.sayAs('formsworth', ['Tokens! Certainly. Fill in the Token Request Form and submit it.', 'Here you go.']);
          g.give('tokenform');
          await g.say('Thanks!');
        },
      },
      {
        id: 'tokenhelp', text: "This Token Request Form can't be submitted.", when: (g) => g.has('tokenform'),
        run: (g) => g.sayAs('formsworth', [
          'Nonsense. It is required to have a Purpose. It does not have a Purpose field. Therefore it fails validation.',
          'Perfectly logical. Someone would have to alter the form. And form alterations are a pirate\'s business.',
        ]),
      },
      {
        id: 'perm', text: 'I need to change a permission on my server.', when: (g) => !!g.flag('accessDenied') && !g.flag('got:permform'),
        run: async (g) => {
          if (!g.flag('spamFixed')) return spamTrouble(g);
          await g.sayAs('formsworth', ['Permissions! My favourite form. Three thousand checkboxes. Rows of permissions, columns of roles.', 'Here. Do not tick everything. People who tick everything end up on islands like this one.']);
          g.give('permform');
          await stampTalk(g);
        },
      },
      {
        id: 'validation', text: 'How does your spam filter work again?', when: (g) => spamming(g) && !!g.flag('spamSeen'),
        run: (g) => g.sayAs('formsworth', [
          'AI Validations. It adds AI rules to Field Validation: before a form is accepted, an AI checks it.',
          'My rule asks: "Is this submission spam?" The model must answer TRUE or FALSE. Nothing else.',
          'TRUE: bounced. FALSE: accepted. It can even check images, if you ask it to. I only have seagulls.',
        ]),
      },
      {
        id: 'rosetta', text: 'Captain Node is taking me to the Paradise of Rosetta.',
        when: (g) => !!g.flag('got:permform') && !g.flag('got:disclosure'),
        run: (g) => stampTalk(g, false),
      },
      {
        id: 'boat', text: "What's that ship being built?", once: true,
        run: (g) => g.sayAs('formsworth', [
          'The Inevitable Rewrite. We are rebuilding the town\'s ship from scratch. Much better than the old one.',
          'Done in two weeks. It has been two weeks for eleven years.',
        ]),
      },
      { id: 'bye', text: 'That will be all.', end: true },
    ],
  },
];

export const harbour: RoomDef = {
  id: 'harbour',
  name: 'The Harbour',
  paint,
  anim,
  bgKey: (g) => (spamming(g) ? 'spam' : ''),
  scale: [106, 0.86, 143, 1],
  walk: [[[0, 124], [112, 124], [116, 112], [140, 110], [320, 110], [320, 143], [0, 143]]],
  start: [296, 126],
  startFace: 'left',
  npcs: [{ id: 'formsworth', at: [66, 112], face: 'front' }],
  hotspots: [
    {
      id: 'townpath', name: 'path to town', rect: [300, 100, 20, 44], walkTo: [310, 126],
      exit: { to: 'square', at: [132, 102], face: 'front' },
      look: 'The alley back up to the town square.',
    },
    {
      id: 'formsworth', name: 'Clerk Formsworth', actor: 'formsworth', walkTo: [70, 130], face: 'back',
      look: 'Clerk Formsworth. Green visor, bow tie, and the patient smile of a man who has rebuilt ten thousand forms.',
      talk: (g) => g.talk('formsworth'),
      giveItem: {
        verifylink: async (g) => {
          g.take('verifylink');
          await g.sayAs('formsworth', ['A one-time login link! Let me just... click it.', '*CLICK*', 'Verified! Welcome to Legacy Island, user/2.']);
          await g.say('User 2? Who is user 1?');
          await g.sayAs('formsworth', 'We do not talk about user 1. User 1 can do anything. User 1 is... a legend.');
          await g.grantRole('authenticated');
        },
        tokenform: (g) => g.sayAs('formsworth', [
          'Submitting... Validation error: field "Purpose" is required.',
          'Field "Purpose" does not exist. Please correct and resubmit.',
        ]),
        tokenform2: async (g) => {
          g.take('tokenform2');
          await g.sayAs('formsworth', ['Submitting... Purpose: "ESCAPE THIS ISLAND". Field present. Field filled.', 'Validation... passed?! Approved!']);
          g.set('tokenCount', 10);
          g.set('tokensGranted');
          g.give('tokens');
          await g.sayAs('formsworth', 'Ten LLM tokens. Spend them wisely. They disappear faster than you think.');
        },
        permform2: (g) => g.sayAs('formsworth', 'Ticked already? Then it is not my form any more. Apply it to your server.'),
        readme: (g) => g.sayAs('formsworth', 'A README? That is not a form. I do not process things without fields.'),
        provider: (g) => g.sayAs('formsworth', spamming(g) ? 'Not to me! Plug it into the validator. It is under the spam. Everything is under the spam.' : 'A language model? I prefer forms. Forms do not improvise.'),
        decision: (g) => g.sayAs('formsworth', spamming(g) ? 'Lovely orb! Use it on the spam, please. The validator is under there somewhere.' : 'It already sorted my spam. It may keep its opinions.'),
      },
      anyItem: async (g) => { await g.sayAs('formsworth', 'Is that a form? No? Then I cannot accept it.'); },
    },
    {
      id: 'spam', name: 'pile of spam', rect: [72, 98, 40, 28], walkTo: [96, 130], face: 'back',
      when: spamming,
      look: [
        'Contact form submissions. Thousands. "WIN A FREE FISH!" "Your ship\'s warranty is expiring!" "Hot singles in your harbour!"',
        'Two seagulls are standing on top, typing more on tiny laptops. Spam-bots. Literal ones.',
      ],
      pickup: "I grab a handful. Three more land on the pile while I'm holding it. That's not a pile, it's a process.",
      push: 'I shove the pile. A seagull submits a complaint about it. Through the contact form.',
      talk: async (g) => {
        await g.say('Shoo! Go spam someone else!');
        await g.narrate('Seagull: "SQUAWK! Congratulations, you have been selected!"');
      },
      useItem: {
        provider: llmValidate,
        decision: decisionValidate,
      },
      anyItem: async (g) => { await g.say("That won't stop the spam. Formsworth's validator needs a model that answers TRUE or FALSE."); },
    },
    {
      id: 'window', name: 'service window', rect: [40, 46, 52, 40], walkTo: [66, 130], face: 'back',
      look: "The Harbour Office window. Behind Formsworth: shelves and shelves of forms. Forms for forms. A form to request the forms shelf.",
    },
    {
      id: 'forms', name: 'stack of forms', rect: [40, 80, 16, 10], walkTo: [56, 130], face: 'back',
      look: 'A stack of blank forms. Each one requires two other forms to be filled in first.',
      pickup: (g) => g.sayAs('formsworth', 'Ah ah ah! You need a Form Request Form to take a form.'),
    },
    {
      id: 'stamp', name: 'rubber stamp', rect: [78, 78, 10, 12], walkTo: [80, 130], face: 'back',
      look: 'A rubber stamp. It says "REBUILT".',
      pickup: (g) => g.sayAs('formsworth', 'That is official stamping equipment. Hands where I can see them.'),
    },
    {
      id: 'hashsign', name: 'signs', rect: [18, 50, 18, 28], walkTo: [30, 130], face: 'back',
      look: ['One sign says "NO #? NO SERVICE".', 'The other one just has two hash signs. Decoratively.'],
    },
    {
      id: 'ship', name: 'The Inevitable Rewrite', rect: [148, 62, 154, 38], walkTo: [230, 116], face: 'back',
      look: [
        "A half-built ship: The Inevitable Rewrite. They're rebuilding the old ship from scratch.",
        "That's what every team says about its old codebase. Then the old one still sails while the new one... doesn't.",
      ],
      use: "It doesn't float yet. It's a ship in the sense that a wireframe is a website.",
      push: "It's propped on scaffolding. One push and it's back to the planning phase.",
    },
    {
      id: 'rewritesign', name: 'sign', rect: [200, 22, 74, 28], walkTo: [236, 116], face: 'back',
      look: ['"REWRITE DONE IN: 2 WEEKS."', 'Below that, a lot of tally marks. Each one is a week.'],
    },
    {
      id: 'lighthouse', name: 'lighthouse', rect: [272, 12, 24, 48], noWalk: true,
      look: (g) => g.say(g.flag('fogTwist')
        ? 'The lighthouse. The Grand Maintainer says its lamp can talk to servers beyond the fog.'
        : 'A lighthouse on a rock, out in the fog. Its lamp is dark.'),
    },
    {
      id: 'seagull', name: 'seagull', rect: [212, 96, 16, 12], walkTo: [210, 126], face: 'right',
      look: 'A seagull, sitting on a bollard. It stares at me like an analytics script.',
      talk: async (g) => { await g.say('Hello, seagull.'); await g.say('It tilts its head. I think I have just been tracked.'); },
      pickup: 'It hops one bollard further. Data collectors are hard to catch.',
    },
    {
      id: 'bell', name: "ship's bell", rect: [158, 86, 18, 14], walkTo: [168, 116], face: 'back',
      look: "A ship's bell. Engraved: \"Ring for deploy.\"",
      use: async (g) => { g.shake(); await g.say(['DONG!', 'Nothing deploys. But the seagull looks at me with new respect.']); },
      pull: async (g) => { g.shake(); await g.say(['DONG!', 'Nobody comes. Deploys on this island are manual and rare.']); },
    },
    {
      id: 'crates', name: 'crates', rect: [110, 96, 40, 28],
      look: 'Crates labelled "LEGACY CODE - DO NOT OPEN". One has a note: "We will migrate this later."',
      open: "I'm not opening those. Nobody knows what's in there. Nobody wants to know.",
    },
    {
      id: 'net', name: 'fishing net', rect: [268, 80, 32, 26],
      look: 'A fishing net. It catches everything except exceptions.',
      pickup: "It's tangled. Like a dependency tree.",
    },
    {
      id: 'rope', name: 'coil of rope', rect: [238, 120, 24, 14],
      look: 'A neatly coiled rope. The only tidy thing on this island.',
      pickup: "I'd better not. I'll just tangle it, and then it's a net.",
    },
    {
      id: 'sea', name: 'sea', rect: [0, 62, 148, 38], walkTo: [100, 116], face: 'back',
      look: 'The harbour water. No boats. Nobody has sailed out in years. The fog sees to that.',
    },
  ],
};

// "Use X with Formsworth" behaves like "Give X to Formsworth".
const fw = harbour.hotspots.find((h) => h.id === 'formsworth')!;
fw.useItem = fw.giveItem;
