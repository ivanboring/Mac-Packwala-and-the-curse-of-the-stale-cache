import type { Game, ItemDef } from '../../engine/types';
import { C } from '../../engine/palette';
import { drawText } from '../../engine/font';
import { declare } from '../rooms/act3/rosetta';

async function makeGeoTool(g: Game) {
  if (!g.atLeast('sitebuilder')) {
    await g.say(['Turning coordinates into a tool is configuration. Defining tools needs the Site Builder role.', 'Editors edit. Builders build.']);
    return;
  }
  g.take('coords');
  g.take('blankcard');
  await g.say([
    'Tool API time. A tool is a function with a good label, so an AI knows when to use it.',
    'Name: "geolocation". Description: "Returns the exact coordinates of this island."',
    'Inputs: none. Outputs: latitude (text) and longitude (text). Every tool declares its inputs and outputs, with types.',
  ]);
  g.give('tool_geo');
  await g.say([
    'Tool API can export that as JSON Schema: the format AI models read when they decide which tool to call.',
    'So AI agents, ECA rules, FlowDrop workflows and the MCP Server can all call the same tool. Write it once.',
    'And clear names matter. Nobody calls "tool_final_v2".',
  ]);
}

async function registerTool(g: Game) {
  if (!g.atLeast('sitebuilder')) return g.say('Registering tools on a server is Site Builder work.');
  if (g.flag('toolRegistered')) return g.say('The geolocation tool is already registered on the MCP server.');
  g.set('toolRegistered');
  await g.say([
    'I register the geolocation tool on my MCP server.',
    'The MCP Server takes my Tool API tools and offers them to AI clients outside my site.',
    'Any client that connects can ask "what tools do you have?" and get back: geolocation. Menu of one. Very exclusive.',
    'Who may actually CALL it is up to permissions. Like everything else on a Drupal site.',
  ]);
}

export const act3Items: ItemDef[] = [
  {
    id: 'coords',
    name: 'island coordinates',
    look: [
      'Coordinates, finally: 13.37 North, 42.00 West. Worked out from the stars and a very dishonest hit counter.',
      "Captain Node won't take them typed into chat, though. She wants them from a tool she can call.",
    ],
    icon: (p) => {
      p.rect(4, 2, 20, 16, C.sand);
      p.rect(5, 3, 18, 14, C.white);
      drawText(p, '13N', 6, 3, C.ink);
      drawText(p, '42W', 6, 10, C.ink);
      p.circle(22, 14, 3, C.red);
      p.px(22, 14, C.white);
    },
    combine: { blankcard: makeGeoTool },
  },
  {
    id: 'tool_geo',
    tool: true,
    name: (g) => (g.flag('toolRegistered') ? 'geolocation tool (registered)' : 'geolocation tool'),
    look: (g) => g.say([
      'My own Tool API tool card: "geolocation - Returns the exact coordinates of this island."',
      'A tool declares typed inputs and outputs, exportable as JSON Schema. Agents, ECA, FlowDrop and the MCP Server can all call it.',
      g.flag('toolRegistered') ? "It's registered on my MCP server. Ready to be called." : 'Now it needs a server to live on.',
    ]),
    icon: (p) => {
      p.rect(3, 2, 22, 16, C.brandblue);
      p.rect(5, 4, 18, 12, C.brandpaper);
      // map pin
      p.circle(14, 8, 4, C.brandpink);
      p.poly([[10, 9], [18, 9], [14, 15]], C.brandpink);
      p.circle(14, 8, 1, C.white);
    },
    roles: { use: 'sitebuilder', give: 'sitebuilder' },
    roleRefusal: 'Tools are configuration. I need the Site Builder role to set them up.',
    use: (g) => g.say([
      'I call the geolocation tool myself. It returns: "13.37 N, 42.00 W". I already knew that. I wrote it.',
      'The point is letting CAPTAIN NODE call it. From an MCP server.',
    ]),
    combine: { mcpserver: registerTool },
  },
  {
    id: 'eca',
    name: 'ECA rule card',
    look: [
      'Old Cron\'s ECA rule card. Three boxes: EVENT, CONDITION, ACTION. "When this happens, if that is true, then do this."',
      'ECA is a Drupal module for building rules like that by clicking, not coding.',
      'The AI ECA Integration adds AI operations as actions: chat, moderation, text-to-speech. So a rule can ask an AI to do the "then".',
    ],
    icon: (p) => {
      p.rect(3, 2, 22, 16, C.navy);
      p.frame(3, 2, 22, 16, C.gold);
      p.rect(5, 5, 5, 5, C.brandpink); p.rect(11, 5, 5, 5, C.yellow); p.rect(17, 5, 5, 5, C.lime);
      p.px(10, 7, C.white); p.px(16, 7, C.white);
      p.hline(5, 21, 13, C.brandbluelight); p.hline(5, 15, 15, C.brandbluelight);
    },
  },
  {
    id: 'guardrails',
    name: 'guardrail',
    look: [
      'A section of the lighthouse railing. It stops things going over the edge.',
      'In the Drupal AI module, guardrails are checks that run before each AI request and after each response.',
      'Each check can let it pass, stop it, or rewrite it. Built-in checks: Regexp, Restrict to topic, Input length limit, Moderation.',
    ],
    icon: (p) => {
      p.rect(5, 3, 3, 15, C.gold); p.rect(20, 3, 3, 15, C.gold);
      p.rect(3, 3, 22, 3, C.yellow); p.hline(3, 24, 5, C.gold);
      p.rect(5, 11, 18, 2, C.gold);
      p.poly([[11, 7], [17, 7], [17, 11], [14, 14], [11, 11]], C.brandblue);
      p.px(14, 9, C.white);
    },
  },
  {
    id: 'disclosure',
    name: 'AI Disclosure stamp',
    look: [
      'Formsworth\'s AI Disclosure stamp: a little EU icon and the words "Made with AI".',
      'The real AI Disclosure module labels AI-generated content, for Article 50 of the EU AI Act.',
      'Editors record how much AI was involved. Readers see an icon and a sentence. Machines get tags they can read.',
      'It doesn\'t decide what needs a label. The site decides. The stamp just records it and shows it.',
    ],
    icon: (p) => {
      p.rect(11, 1, 6, 7, C.wood);
      p.ellipse(14, 2, 4, 2, C.woodlight);
      p.rect(7, 8, 14, 3, C.darkbrown);
      p.rect(6, 11, 16, 6, C.blue);
      for (const [x, y] of [[14, 12], [17, 13], [17, 15], [14, 16], [11, 15], [11, 13]]) p.px(x, y, C.yellow);
    },
    combine: { postcard: (g) => declare(g) },
  },
  {
    id: 'postcard',
    name: (g) => (g.flag('disclosed') ? 'labelled postcard' : 'postcard'),
    look: (g) => g.say(g.flag('disclosed')
      ? ['My postcard home, stamped: "AI-generated, reviewed by a human." Honest, and readable by people and machines.']
      : [
        'A postcard my AI agent wrote on the flight: "Dear all. Rescued at last. The fog is gone, the sun is out, and I spelled Captain Node right."',
        '"Wish you were here! - Mac." And underneath, in tiny letters: "(sent by Mac\'s AI agent)".',
        'I read it twice. It\'s good. Annoyingly good. All that context paid off.',
      ]),
    icon: (p, g) => {
      p.rect(2, 3, 24, 15, C.white);
      p.frame(2, 3, 24, 15, C.sandshade);
      p.rect(4, 5, 11, 11, C.skyblue);
      p.rect(4, 12, 11, 4, C.sand);
      p.circle(12, 7, 2, C.yellow);
      p.vline(7, 8, 13, C.wood); p.hline(5, 9, 8, C.green);
      p.vline(16, 5, 15, C.lightgray);
      p.hline(18, 24, 10, C.gray); p.hline(18, 24, 13, C.gray);
      if (g?.flag('disclosed')) {
        p.circle(21, 6, 2, C.blue);
        p.px(21, 6, C.yellow);
      } else p.rect(20, 5, 4, 3, C.brandpink);
    },
    combine: { disclosure: (g) => declare(g) },
  },
];
