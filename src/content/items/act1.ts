import type { ItemDef } from '../../engine/types';
import { C } from '../../engine/palette';
import { drawText } from '../../engine/font';
import { duckHint } from '../hints';

export const act1Items: ItemDef[] = [
  {
    id: 'duck',
    name: 'rubber duck',
    look: "A rubber duck. Every developer's best listener. Talk to it when I'm stuck - explaining a problem out loud usually solves it.",
    icon: (p) => {
      p.ellipse(15, 12, 8, 5, C.yellow);
      p.circle(10, 7, 4, C.yellow);
      p.rect(4, 7, 3, 2, C.orange);
      p.px(9, 6, C.black);
      p.hline(13, 20, 11, C.gold);
    },
    talk: duckHint,
  },
  {
    id: 'plank',
    name: 'driftwood plank',
    look: 'A sturdy plank from the wreck. Perfect for prying things open. Or walking off, pirate-style.',
    icon: (p) => {
      p.poly([[2, 12], [24, 4], [26, 8], [4, 16]], C.woodlight);
      p.line(5, 13, 23, 6, C.wood);
      p.px(8, 12, C.darkbrown); p.px(20, 8, C.darkbrown);
    },
  },
  {
    id: 'bottle',
    name: 'message in a bottle',
    look: "A message in a bottle. There's a rolled-up paper inside.",
    icon: (p) => {
      p.poly([[4, 13], [18, 7], [21, 12], [7, 17]], C.lime);
      p.poly([[18, 7], [24, 5], [25, 8], [21, 12]], C.lime);
      p.rect(24, 5, 2, 3, C.wood);
      p.line(8, 13, 17, 9, C.white);
    },
    open: (g) => {
      g.take('bottle');
      g.give('readme');
      return g.say("I pop the cork. Inside: a file called README.txt. Let's see if anybody ever read it.");
    },
    use: (g) => g.say('I should open it first.'),
  },
  {
    id: 'readme',
    name: 'README.txt',
    look: [
      'README.txt. "1. Do not panic. 2. Find someone who is awake. 3. Cron lives on the cliff. 4. Nobody reads this."',
      "Point 4 checks out. The paper is in mint condition. Not a single fingerprint.",
    ],
    icon: (p) => {
      p.rect(6, 2, 16, 16, C.white);
      p.poly([[18, 2], [22, 6], [18, 6]], C.lightgray);
      for (let i = 0; i < 4; i++) p.hline(8, 18 - (i % 2) * 3, 8 + i * 2, C.gray);
      drawText(p, 'MD', 8, 2, C.brandblue);
    },
  },
  {
    id: 'f5key',
    name: 'giant F5 key',
    look: "A giant F5 key. In my world, F5 refreshes things. Pages, apps, and occasionally a developer's will to live.",
    icon: (p) => {
      p.poly([[4, 4], [24, 4], [26, 15], [2, 15]], C.lightgray);
      p.rect(6, 5, 16, 8, C.white);
      drawText(p, 'F5', 9, 6, C.ink);
      p.hline(3, 25, 15, C.gray);
    },
  },
  {
    id: 'weight',
    name: 'lead fishing weight',
    look: "A heavy lead fishing weight. Heavier things sink further down. Or, in some systems, run later.",
    icon: (p) => {
      p.ellipse(14, 12, 6, 5, C.gray);
      p.ellipse(13, 11, 3, 2, C.lightgray);
      p.rect(13, 3, 2, 5, C.darkgray);
      p.circle(14, 3, 2, C.darkgray);
    },
  },
  {
    id: 'atshell',
    name: '@-shaped snail shell',
    look: "A snail shell curled exactly like an @ sign. It's very social. Probably mentioned in a lot of threads.",
    icon: (p) => {
      p.circle(14, 10, 8, C.tan);
      p.circle(14, 10, 6, C.sand);
      p.circle(14, 10, 3, C.tan);
      p.circle(15, 10, 1, C.wood);
      p.rect(20, 10, 3, 6, C.tan);
    },
  },
  {
    id: 'verifylink',
    name: 'one-time login link',
    look: '"Click here to verify your account. This one-time link expires in 24 hours. Or when used. Whichever comes first." It\'s written on a scroll. A scroll with a URL on it.',
    icon: (p) => {
      p.rect(4, 5, 20, 10, C.white);
      p.ellipse(4, 10, 2, 5, C.sand);
      p.ellipse(24, 10, 2, 5, C.sand);
      p.hline(7, 21, 9, C.brandblue);
      p.hline(7, 16, 11, C.brandblue);
    },
  },
  {
    id: 'tokenform',
    name: 'Token Request Form',
    look: [
      'The Token Request Form. Field "Purpose" is marked REQUIRED. But the form has no "Purpose" field.',
      "So it can never be submitted. It's a perfect form. Perfectly useless.",
    ],
    icon: (p) => formIcon(p, C.white, false),
  },
  {
    id: 'tokenform2',
    name: 'altered Token Request Form',
    look: 'The Token Request Form, altered by Captain Hook_alter. It now has a "Purpose" field, filled in with "ESCAPE THIS ISLAND". Plus a skull doodle.',
    icon: (p) => formIcon(p, C.white, true),
  },
  {
    id: 'tokens',
    name: (g) => `${g.flag<number>('tokenCount') ?? 0} LLM tokens`,
    look: (g) => g.say([
      `${g.flag<number>('tokenCount') ?? 0} shiny LLM tokens. In the real world, AI models charge per "token" - roughly a word-piece of text.`,
      "Here they're gold doubloons. Same thing really: expensive and they disappear fast.",
    ]),
    icon: (p) => {
      for (const [x, y] of [[8, 11], [14, 8], [19, 12], [12, 14]]) {
        p.ellipse(x, y, 5, 3, C.gold);
        p.ellipse(x, y - 1, 4, 2, C.yellow);
      }
    },
  },
  {
    id: 'composerjson',
    name: 'composer.json sheet music',
    look: 'Sheet music titled "composer.json". It lists what a Composer should play - in my world, Composer is the tool that installs PHP packages for Drupal. This sheet says: require drupal/ai.',
    icon: (p) => {
      p.rect(5, 2, 18, 16, C.white);
      for (let i = 0; i < 4; i++) p.hline(6, 21, 5 + i * 3, C.gray);
      p.circle(9, 10, 1, C.ink); p.vline(10, 5, 10, C.ink);
      p.circle(16, 13, 1, C.ink); p.vline(17, 8, 13, C.ink);
      p.hline(10, 17, 5, C.ink);
    },
  },
  {
    id: 'popup',
    name: 'Popup Newsletter plugin',
    look: '"SUBSCRIBE TO OUR NEWSLETTER!" A free plugin sample that pops up a newsletter signup over everything. Annoying. Possibly weaponisable.',
    icon: (p) => {
      p.rect(3, 3, 22, 14, C.brandpink);
      p.rect(5, 6, 18, 8, C.white);
      p.hline(7, 20, 8, C.brandpink);
      p.hline(7, 15, 11, C.gray);
      p.rect(21, 3, 4, 3, C.white); p.px(23, 4, C.black);
    },
  },
  {
    id: 'herring',
    name: 'red herring',
    look: "A red herring. In an adventure game. It's clearly a distraction that serves no purpose whatsoever. I'll keep it forever.",
    icon: (p) => {
      p.ellipse(13, 10, 9, 4, C.red);
      p.poly([[21, 10], [26, 5], [26, 15]], C.darkred);
      p.px(7, 9, C.white); p.px(7, 9, C.black);
      p.hline(9, 18, 11, C.darkred);
    },
  },
  {
    id: 'crackers',
    name: 'OAuth crackers',
    look: 'A box of crackers labelled "OAuth - Open Authorization". OAuth is how apps let you log in without sharing your password. These are just crackers, though. Probably.',
    icon: (p) => {
      p.rect(5, 4, 18, 13, C.orange);
      p.rect(7, 6, 14, 5, C.white);
      drawText(p, 'OA', 9, 5, C.red);
      p.rect(8, 13, 4, 3, C.gold); p.rect(14, 13, 4, 3, C.gold);
    },
  },
  {
    id: 'gitignore',
    name: '.gitignore coaster',
    look: 'A beer coaster printed with ".gitignore". In my world, a .gitignore lists files that must never be committed to a repository - like passwords. Whatever you put on it gets ignored.',
    icon: (p) => {
      p.circle(14, 10, 8, C.tan);
      p.circle(14, 10, 6, C.woodlight);
      drawText(p, '.git', 7, 7, C.darkbrown);
    },
  },
  {
    id: 'batteries',
    name: 'AA batteries',
    look: 'Two AA batteries in a box labelled "Batteries plugin v1.0 - requires 1.5 volts". Fresh. Ish.',
    icon: (p) => {
      for (const x of [6, 15]) {
        p.rect(x, 5, 7, 12, C.brandink);
        p.rect(x, 5, 7, 4, C.gold);
        p.rect(x + 2, 3, 3, 2, C.lightgray);
        p.hline(x + 1, x + 5, 13, C.brandslate);
      }
    },
  },
  {
    id: 'ckeditor',
    name: 'AI CKEditor assistant',
    look: [
      'The AI CKEditor assistant. CKEditor is the text editor you type content into in Drupal.',
      'With AI it can fix spelling, change tone, summarise or translate - right where you write. Spellcheck with ambition.',
    ],
    roles: { use: 'editor', give: 'editor' },
    icon: (p) => {
      p.rect(3, 3, 22, 14, C.white);
      p.rect(3, 3, 22, 4, C.brandmist);
      for (let i = 0; i < 4; i++) p.rect(5 + i * 4, 4, 3, 2, C.brandslate);
      p.hline(6, 19, 10, C.gray);
      p.hline(6, 15, 13, C.gray);
      p.circle(21, 13, 3, C.brandpink);
      p.px(21, 13, C.white);
    },
  },
  {
    id: 'ladder',
    name: 'ladder',
    look: 'A paint-spattered ladder. For reaching things that are just out of reach. Like the Next sprint.',
    icon: (p) => {
      p.line(6, 18, 12, 1, C.woodlight);
      p.line(14, 18, 20, 1, C.woodlight);
      for (let i = 0; i < 5; i++) p.hline(8 + i, 16 + i, 15 - i * 3, C.wood);
      p.px(10, 9, C.brandblue); p.px(17, 5, C.red);
    },
  },
  {
    id: 'starlog',
    name: "Cron's star log",
    useAlone: true,
    look: "Old Cron's star-sighting log: the angles of three stars at exactly the top of the hour. Well - the top of whenever I visited.",
    use: async (g) => {
      if (!g.flag('geoClue')) {
        await g.say(['Star angles. Lovely. But I need reference digits to turn them into a position.', 'Without them it is basically astrology with a spreadsheet.']);
        return;
      }
      g.take('starlog');
      await g.say(['I line up the star angles with the digits from the GeoCities hit counter...', 'Fake counter, real stars. Together: actual coordinates!']);
      g.give('coords');
    },
    icon: (p) => {
      p.rect(4, 2, 20, 16, C.navy);
      p.frame(4, 2, 20, 16, C.gold);
      for (const [x, y] of [[8, 6], [15, 5], [20, 9], [11, 12], [18, 14]]) p.px(x, y, C.glow);
      p.line(8, 6, 15, 5, C.brandbluelight); p.line(15, 5, 20, 9, C.brandbluelight);
    },
  },
  {
    id: 'mcpserver',
    name: 'MCP Server relic',
    look: [
      'The MCP Server relic. MCP is the Model Context Protocol: a standard way for AI assistants to discover and use tools.',
      'An MCP server offers tools. This one turns my Drupal site into one: it shares my Tool API tools with AI clients outside the site.',
      'And permissions decide who may call which tool. Permissions are the whole point.',
    ],
    roles: { use: 'sitebuilder' },
    icon: (p) => {
      p.rect(8, 2, 13, 16, C.brandink);
      p.frame(8, 2, 13, 16, C.brandblue);
      for (let i = 0; i < 3; i++) { p.hline(10, 18, 5 + i * 4, C.brandslate); p.px(17, 5 + i * 4, i === 1 ? C.lime : C.brandpink); }
      p.circle(14, 17, 1, C.brandbluelight);
    },
  },
  {
    id: 'blankcard',
    name: 'blank Tool API card',
    look: [
      'A blank Tool API card. Tool API is the Drupal way to define a "tool": a name, a description, typed inputs and outputs, and code that does one job.',
      'Because the inputs and outputs are typed, the tool can describe itself as JSON Schema.',
      'So AI agents, ECA, FlowDrop and the MCP Server can all call the same tool. Write it once, use it everywhere.',
    ],
    roles: { use: 'sitebuilder' },
    icon: (p) => {
      p.rect(5, 2, 18, 16, C.brandpaper);
      p.frame(5, 2, 18, 16, C.brandblue);
      p.rect(7, 4, 14, 3, C.brandblue);
      p.hline(7, 18, 10, C.brandmist);
      p.hline(7, 15, 13, C.brandmist);
    },
  },
  {
    id: 'permform',
    name: 'permissions form',
    look: [
      'The island permissions form. 3,000 checkboxes. Rows of permissions, columns of roles.',
      'Somewhere in here is "use geolocation tool". Finding it by eye would take until Drupal 15.',
    ],
    combine: {
      tool_search: async (g) => {
        if (!g.atLeast('sitebuilder')) { await g.say('Searching config needs the Site Builder role.'); return; }
        g.take('permform');
        await g.say(['I point the Search tool at the form: "permission that lets an agent use the geolocation tool".', 'Semantic search finds it: row 2,817, "Use geolocation tool". I tick it for Captain Node\'s role.']);
        g.give('permform2');
      },
    },
    icon: (p) => permIcon(p, false),
  },
  {
    id: 'permform2',
    name: 'ticked permissions form',
    look: 'The permissions form, with exactly one meaningful tick: "Use geolocation tool", for the role Captain Node\'s agent uses. Least privilege!',
    icon: (p) => permIcon(p, true),
  },
];

function permIcon(p: import('../../engine/paint').Painter, ticked: boolean) {
  p.rect(4, 1, 20, 18, C.white);
  for (let y = 3; y < 18; y += 3) for (let x = 6; x < 23; x += 3) p.px(x, y, C.lightgray);
  if (ticked) { p.line(14, 11, 16, 13, C.green); p.line(16, 13, 20, 7, C.green); }
}

function formIcon(p: import('../../engine/paint').Painter, c: number, altered: boolean) {
  p.rect(6, 1, 16, 18, c);
  p.rect(8, 3, 12, 2, C.brandblue);
  for (let i = 0; i < 4; i++) { p.rect(8, 7 + i * 3, 3, 2, C.lightgray); p.hline(12, 19, 8 + i * 3, C.gray); }
  if (altered) {
    p.rect(8, 16, 11, 2, C.red);
    p.circle(18, 4, 2, C.white); p.px(17, 4, C.black); p.px(19, 4, C.black);
  }
}
