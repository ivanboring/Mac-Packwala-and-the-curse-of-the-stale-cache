import type { Game, ItemDef } from '../../engine/types';
import type { Painter } from '../../engine/paint';
import { C } from '../../engine/palette';
import { drawText } from '../../engine/font';

/** Tool API cards share a look: brand card with a symbol. */
function toolIcon(symbol: (p: Painter) => void, accent = C.brandblue) {
  return (p: Painter) => {
    p.rect(3, 1, 22, 17, C.brandpaper);
    p.rect(3, 1, 22, 4, accent);
    p.hline(5, 9, 2, C.white);
    p.frame(3, 1, 22, 17, C.brandink);
    symbol(p);
  };
}

/** What the provider says while AI Metering is missing and the idols have cut Mac off. */
export const SUSPENDED_LINE = 'QUOTA EXCEEDED. PROVIDER SUSPENDED UNTIL YOU CAN COUNT.';

/** True (after saying so) when the provider is suspended and can't be used. */
export async function providerRefuses(g: Game): Promise<boolean> {
  if (!g.flag('providerSuspended')) return false;
  await g.narrate(SUSPENDED_LINE);
  await g.say(g.random([
    "My provider's cut off. I need to show the idols I can count first.",
    'Suspended. Nobody set a budget, so now there is no budget. Somebody who counts everything could help.',
  ]));
  return true;
}

const TOOL_REFUSAL = "Editors can carry Tool API cards, but plugging tools into anything is configuration. That needs the Site Builder role.";

function tool(id: string, name: string, look: string[], symbol: (p: Painter) => void, accent?: number): ItemDef {
  return {
    id, name, tool: true,
    look: [...look, 'Tool API: a tool is a small, well-described action with inputs and outputs that an AI agent can choose to call.'],
    icon: toolIcon(symbol, accent),
    roles: { use: 'sitebuilder' },
    roleRefusal: TOOL_REFUSAL,
    use: "A tool on its own does nothing. Tools get used ON things, or handed to an agent.",
  };
}

export const act2Items: ItemDef[] = [
  {
    id: 'apikey',
    name: 'API key card',
    look: [
      'An API key card: "sk-legacy-4f8a91c0...". An API key is a secret password that lets a site use an AI service.',
      'It also gets you billed. Never paste it into config, and never, ever commit it to git.',
    ],
    icon: (p) => {
      p.rect(3, 4, 22, 12, C.gold);
      p.rect(3, 4, 22, 3, C.yellow);
      drawText(p, 'sk-', 5, 8, C.darkbrown);
      p.rect(19, 9, 4, 4, C.darkbrown);
    },
  },
  {
    id: 'keyentity',
    name: 'Key (stored safely)',
    look: [
      "My API key, now stored as a Key in the Key Keeper's vault. In Drupal, the Key module keeps secrets out of your config.",
      "So exporting or sharing config never leaks them. The config just says \"use the key called cloud_idols\". Very hush-hush.",
    ],
    icon: (p) => {
      p.circle(8, 10, 5, C.gold);
      p.circle(8, 10, 2, C.brandink);
      p.rect(12, 9, 13, 3, C.gold);
      p.rect(20, 12, 2, 3, C.gold); p.rect(24, 12, 2, 4, C.gold);
      p.px(6, 8, C.glow);
    },
  },
  {
    id: 'provider',
    name: (g) => (g.flag('providerSuspended') ? 'AI Provider (suspended)' : g.flag('meteringOn') ? 'AI Provider (metered)' : 'AI Provider (configured)'),
    look: async (g) => {
      await g.say([
        'A configured AI Provider, glowing softly. In plain English: the connection between a site and an AI model.',
        'Configure it once, and every AI feature on the site can use it. Like a phone line to a very well-read parrot.',
      ]);
      if (g.flag('providerSuspended')) await g.say(['Right now the parrot has hung up on me.', `A little red tag on it says: "${SUSPENDED_LINE}"`]);
      else if (g.flag('meteringOn')) await g.say('It has a little brass meter clipped to it now. Every token is counted. The parrot is on a budget.');
    },
    icon: (p) => {
      p.circle(12, 9, 7, C.brandblue);
      p.circle(12, 9, 5, C.brandbluelight);
      p.circle(10, 7, 2, C.white);
      p.line(19, 10, 26, 15, C.darkgray);
      p.rect(24, 14, 3, 3, C.gold);
    },
  },
  {
    id: 'explorer',
    name: 'AI Explorer',
    useAlone: true,
    look: [
      'The AI Explorer: in Drupal AI it is a page where you try prompts against your provider before using them anywhere.',
      "A test kitchen for prompts. Taste first, serve later. (I can just Use it.)",
    ],
    icon: (p) => {
      p.rect(3, 3, 22, 14, C.brandink);
      p.rect(5, 5, 18, 10, C.navy);
      drawText(p, '>_', 6, 6, C.lime);
      p.circle(21, 14, 4, C.tan);
      p.circle(21, 14, 2, C.skyblue);
      p.line(24, 17, 26, 18, C.wood);
    },
    use: async (g: Game) => {
      if (!g.flag('providerReady')) return g.say("The AI Explorer needs a provider to explore with. Right now it's exploring an empty room.");
      if (await providerRefuses(g)) return;
      if (!g.flag('explorerRan')) {
        g.set('explorerRan');
        await g.say('First, the default prompt it shipped with: "Write a product description." Run!');
        await g.sayAs('aiexplorer', '"Delve into this rich tapestry of synergy, where innovation meets excellence in a testament to..."');
        await g.say(["...that's the description of a BUCKET.", 'Vague prompt in, vague mush out. I should try writing a better one. Use it again.']);
        return;
      }
      await g.talk('explorer');
    },
  },
  {
    id: 'prompt',
    name: 'tested prompt card',
    look: [
      '"Describe this product in two sentences for a farmer: what it is and what it is for. No buzzwords."',
      'Tested in the AI Explorer. Certified 100% synergy-free.',
    ],
    icon: (p) => {
      p.rect(4, 2, 20, 16, C.white);
      p.rect(4, 2, 20, 3, C.lime);
      for (let i = 0; i < 4; i++) p.hline(6, 21 - (i % 2) * 4, 8 + i * 2, C.gray);
      p.line(17, 15, 19, 17, C.green); p.line(19, 17, 23, 12, C.green);
    },
  },
  {
    id: 'pinecone',
    name: 'pinecone',
    look: [
      'A pinecone. In the real world, Pinecone is also a vector database:',
      'it stores the meaning of text as long lists of numbers, so you can search by meaning. This one mostly stores seeds.',
    ],
    icon: (p) => {
      p.ellipse(14, 10, 6, 8, C.brown);
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) p.rect(10 + c * 3 + (r % 2), 4 + r * 3, 2, 2, C.woodlight);
      p.rect(13, 0, 2, 3, C.darkgreen);
    },
  },
  {
    id: 'translate',
    name: 'AI Translate',
    look: [
      'AI Translate: a Drupal AI module that translates content using an AI provider.',
      'Includes rare dialects such as Legalese, Marketing, Teenager and 1998 Personal Homepage.',
    ],
    icon: (p) => {
      p.rect(3, 3, 13, 12, C.brandblue);
      drawText(p, 'A', 6, 5, C.white);
      p.rect(12, 6, 13, 12, C.brandpink);
      drawText(p, 'Z', 16, 8, C.white);
      p.line(15, 2, 21, 2, C.ink); p.px(21, 3, C.ink);
    },
  },
  {
    id: 'metering',
    name: 'AI Metering',
    look: [
      "AI Metering, from the Key Keeper: a brass meter that counts every token sent to an AI provider, and estimates what it costs.",
      'You set quotas and budgets per user or per role, and get dashboards plus a log of every single call.',
      'Over budget? The request is blocked, or sent to a local model like Ollama, BEFORE the expensive cloud ever sees it.',
    ],
    icon: (p) => {
      p.rect(4, 3, 20, 14, C.gold);
      p.frame(4, 3, 20, 14, C.darkbrown);
      p.rect(6, 5, 16, 6, C.brandpaper);
      for (let i = 0; i < 4; i++) p.rect(7 + i * 4, 6, 3, 4, i === 3 ? C.brandpink : C.ink);
      p.px(8, 7, C.white); p.px(12, 8, C.white); p.px(16, 7, C.white); p.px(20, 8, C.white);
      p.circle(14, 14, 2, C.darkbrown);
      p.line(14, 14, 17, 12, C.red);
      p.px(7, 14, C.lime); p.px(21, 14, C.red);
    },
  },
  {
    id: 'decision',
    name: 'Decision Model',
    look: [
      'A Decision Model, from Professor Promptington. A shiny black orb, like a magic 8-ball.',
      'Give it a question and a fixed list of answers. It picks ONE, and says how sure it is: "Nautical. 94%."',
      'Unlike the classic 8-ball, it tells you how sure it is. Great for sorting, routing, moderating and scoring. Useless for poetry.',
    ],
    icon: (p) => {
      p.circle(14, 10, 8, C.ink);
      p.circle(14, 10, 7, C.brandink);
      p.circle(11, 6, 2, C.gray);
      p.px(10, 5, C.white);
      p.poly([[11, 9], [18, 9], [14.5, 15]], C.brandblue);
      p.px(14, 10, C.white); p.px(15, 11, C.white);
    },
  },
  {
    id: 'agents',
    name: 'AI Agents scroll',
    look: [
      'The AI Agents scroll, from Master Rebase: "An agent is an AI that gets a goal, then decides step by step which tools to use."',
      '"Without tools, an agent is just a very confident talker." Harsh. Fair.',
    ],
    icon: (p) => {
      p.rect(6, 4, 16, 12, C.sand);
      p.ellipse(6, 10, 2, 6, C.tan);
      p.ellipse(22, 10, 2, 6, C.tan);
      p.hline(8, 19, 7, C.brandpink); p.hline(8, 17, 10, C.gray); p.hline(8, 18, 13, C.gray);
      p.rect(12, 15, 4, 4, C.red);
    },
  },
  {
    id: 'window',
    name: 'stained-glass context window',
    look: [
      'A stained-glass window labelled "CONTEXT WINDOW - 128K PANES".',
      "A model's context window is how much text it can keep in mind at once. This one is surprisingly heavy.",
    ],
    icon: (p) => {
      p.poly([[14, 1], [24, 7], [24, 18], [4, 18], [4, 7]], C.darkgray);
      p.rect(6, 8, 6, 4, C.red); p.rect(13, 8, 9, 4, C.brandblue);
      p.rect(6, 13, 9, 4, C.yellow); p.rect(16, 13, 6, 4, C.green);
      p.poly([[14, 3], [21, 7], [7, 7]], C.brandpink);
    },
  },
  tool('tool_search', 'Tool: Search Content', [
    'A Tool API card: "Search Content". Give it a question, it finds matching content by meaning, not exact words.',
    'It is AI Search on a card: an agent can use it to look things up BEFORE it answers, instead of making things up.',
  ], (p) => { p.circle(12, 10, 4, C.brandblue); p.circle(12, 10, 2, C.brandpaper); p.line(15, 13, 19, 16, C.brandblue); p.line(16, 13, 20, 16, C.brandblue); }),
  tool('tool_create', 'Tool: Create Content', [
    'A Tool API card: "Create Content". Give it a title and some fields, and it creates a page on the site.',
  ], (p) => { p.rect(9, 7, 10, 10, C.white); p.frame(9, 7, 10, 10, C.gray); p.rect(13, 9, 2, 6, C.green); p.rect(11, 11, 6, 2, C.green); }, C.green),
  tool('tool_translate', 'Tool: Translate Text', [
    'A Tool API card: "Translate Text". Give it text and a target language, and it returns the translation.',
  ], (p) => { drawText(p, 'A', 7, 8, C.brandblue); p.line(13, 11, 16, 11, C.ink); p.px(15, 10, C.ink); p.px(15, 12, C.ink); drawText(p, 'Z', 17, 8, C.brandpink); }, C.brandpink),
  {
    ...tool('tool_tts', 'Tool: Text-to-Speech', [
      'A Tool API card: "Text-to-Speech". It turns written text into spoken audio using an AI provider.',
      'The same text-to-speech that gave the island its voices, but as a tool that agents and rules can call.',
    ], (p) => {
      p.rect(7, 9, 4, 5, C.brandink); p.poly([[11, 9], [15, 6], [15, 17], [11, 14]], C.brandink);
      p.line(17, 8, 18, 10, C.brandblue); p.line(18, 13, 17, 15, C.brandblue); p.vline(20, 8, 15, C.brandblue);
    }, C.orange),
  },
];
