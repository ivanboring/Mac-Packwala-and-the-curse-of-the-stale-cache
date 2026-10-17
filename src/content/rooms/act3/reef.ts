import type { Painter } from '../../../engine/paint';
import type { Dialogue, Game, RoomDef } from '../../../engine/types';
import { C, sky, cloud, sea, sand, bottle, surf, seagull, centeredText } from '../../art';
import { airship, fogVeil, fogBands, withClip } from '../../art3';

// Slack Reef: where the Slack MCP Server (a parrot) lives, and where the airship lands.
const SHORE: [number, number][] = [[0, 104], [50, 100], [110, 102], [170, 104], [210, 106]];
const DOCK_Y = 108;

function paint(p: Painter, g: Game) {
  sky(p, 320, 66, 'dusk');
  cloud(p, 70, 16, 1, C.pink, C.magenta);
  cloud(p, 230, 24, 0.8, C.glow, C.sunset);
  p.circle(270, 54, 12, C.glow);
  p.circle(270, 54, 9, C.yellow);
  sea(p, 0, 62, 320, 82);
  // shimmering sun path
  for (let y = 64; y < 100; y += 3) p.hline(262 - (y - 64) / 4, 278 + (y - 64) / 4, y, [0, C.glow, 'check']);
  // distant island of fresh starts (only visible when the fog is gone, but always painted)
  p.poly([[20, 62], [36, 56], [52, 58], [64, 62]], C.darkgreen);
  // the beach
  p.poly([[0, 104], ...SHORE, [228, 144], [0, 144]], C.sand);
  sand(p, 0, 104, 230, 40, 41);
  p.poly([[0, 104], ...SHORE, [212, 110], [0, 108]], [C.sandshade, C.sand]);
  // the big rock where Slackbot perches, "#general" carved in it
  p.poly([[46, 116], [52, 92], [62, 78], [80, 72], [108, 74], [122, 86], [128, 104], [124, 118]], C.stone);
  p.poly([[100, 76], [108, 74], [122, 86], [128, 104], [124, 118], [110, 118], [114, 96]], C.stoneshade);
  p.speckle(46, 72, 82, 46, C.stoneshade, 0.05, 44);
  p.rect(60, 91, 44, 10, C.stoneshade);
  p.hline(60, 103, 100, C.gray);
  centeredText(p, '#general', 81, 93, C.ink);
  // starfish "reactions"
  for (const [x, y, c] of [[58, 108, C.orange], [116, 110, C.pink], [134, 128, C.yellow]] as [number, number, number][]) {
    p.poly([[x, y - 4], [x + 1, y - 1], [x + 4, y], [x + 1, y + 1], [x, y + 4], [x - 1, y + 1], [x - 4, y], [x - 1, y - 1]], c);
    p.px(x, y, C.white);
  }
  // piles of bottles: the threads
  for (const [x, y, c] of [[30, 118, C.lime], [36, 120, C.skyblue], [24, 122, C.lime], [134, 112, C.cyan], [142, 116, C.lime], [150, 114, C.skyblue], [138, 120, C.lime], [176, 126, C.cyan]] as [number, number, number][]) {
    bottle(p, x, y, c);
  }
  // tide pool
  p.ellipse(176, 134, 16, 4, C.sea);
  p.ellipse(176, 133, 12, 2, C.skyblue);
  p.circle(172, 134, 1, C.orange); p.circle(180, 133, 1, C.orange);
  // half-sunk "Do Not Disturb" sign
  p.vline(170, 76, 92, C.wood);
  p.poly([[154, 70], [186, 68], [187, 78], [155, 80]], C.red);
  p.hline(158, 182, 74, C.white);
  p.hline(160, 176, 76, C.white);

  // ---- the dock ----
  for (const x of [204, 232, 260, 288, 314]) {
    p.rect(x, DOCK_Y, 4, 24, C.darkbrown);
    p.hline(x, x + 3, DOCK_Y + 10, C.seadark);
  }
  p.poly([[196, DOCK_Y - 6], [320, DOCK_Y - 8], [320, DOCK_Y + 2], [198, DOCK_Y + 6]], C.woodlight);
  for (let x = 200; x < 320; x += 7) p.line(x, DOCK_Y - 6 + (x - 196) * -0.016, x + 1, DOCK_Y + 5 - (x - 196) * 0.03, C.wood);
  p.line(196, DOCK_Y + 6, 320, DOCK_Y + 2, C.darkbrown);
  // bollard + rope
  p.rect(304, DOCK_Y - 14, 6, 8, C.darkgray);
  p.ellipse(307, DOCK_Y - 14, 4, 2, C.gray);
  p.line(304, DOCK_Y - 10, 296, DOCK_Y - 4, C.tan);
  // sign "Arrivals"
  p.vline(212, DOCK_Y - 30, DOCK_Y - 6, C.wood);
  p.rect(200, DOCK_Y - 38, 26, 10, C.brandblue);
  p.frame(200, DOCK_Y - 38, 26, 10, C.ink);
  p.hline(203, 222, DOCK_Y - 34, C.white);
  p.hline(203, 214, DOCK_Y - 32, C.white);
}

function fogAmount(g: Game, t: number): number {
  if (g.flag('leftIsland')) return 0;
  const at = g.flag<number>('fogLiftAt');
  if (at === undefined) return 1;
  return Math.max(0, Math.min(1, 1 - (t - at) / 3500));
}

function anim(p: Painter, g: Game, t: number) {
  surf(p, t, SHORE);
  seagull(p, 140 + Math.sin(t / 2600) * 80, 22 + Math.sin(t / 700) * 3, t);
  // "#random" buoy bobbing
  const b = Math.round(Math.sin(t / 500) * 1.5);
  p.rect(236, 76 + b, 10, 8, C.brandpink);
  p.poly([[234, 84 + b], [248, 84 + b], [245, 88 + b], [237, 88 + b]], C.white);
  p.vline(241, 70 + b, 76 + b, C.darkgray);
  p.rect(242, 70 + b, 5, 3, C.yellow);
  // the fog of technical debt
  const fog = fogAmount(g, t);
  withClip(p, 0, 0, 320, 88, () => fogVeil(p, 0, 0, 320, 88, fog * 0.7));
  withClip(p, 0, 0, 320, 100, () => fogBands(p, t, 320, 40, 92, fog));
  drawAirship(p, g, t);
}

/** In front of the fog, behind the characters: Captain Node steps out in front of her ship. */
function drawAirship(p: Painter, g: Game, t: number) {
  const arrive = g.flag<number>('airshipAt');
  const leave = g.flag<number>('airshipLeaveAt');
  if (g.flag('leftIsland') || arrive === undefined) return;
  let cx = 284, cy = 50;
  if (leave !== undefined) {
    const k = Math.max(0, Math.min(1, (t - leave) / 4500));
    cx += k * k * 120; cy -= k * 150;
  } else {
    const k = Math.max(0, Math.min(1, (t - arrive) / 4200));
    const ease = 1 - (1 - k) * (1 - k);
    cy = -90 + (50 + 90) * ease;
    cx = 284 + Math.sin((1 - k) * 4) * 20;
  }
  airship(p, cx, cy + Math.sin(t / 500) * 1.5, t);
}

// ---------------------------------------------------------------------------------------
export const reefDialogues: Dialogue[] = [
  {
    id: 'slackbot',
    with: 'slackbot',
    start: async (g) => {
      await g.sayAs('slackbot', g.random(['👍', 'You @mentioned me! :tada:', 'New message! Replying in thread...']));
    },
    options: [
      {
        id: 'connect', text: 'Can you connect me to Slack?', when: (g) => !g.flag('slackConnected'),
        run: async (g) => {
          await g.sayAs('slackbot', [
            "Sure! I'm the Slack MCP Server. Any MCP client can send messages through me.",
            'But first: authorization! Every app needs an OAuth token.',
            'SQUAWK! Polly wants an OAuth cracker! SQUAWK!',
          ]);
          g.set('wantsCracker');
        },
      },
      {
        id: 'what', text: 'What are you, exactly?', once: true,
        run: async (g) => {
          await g.sayAs('slackbot', [
            "I'm an MCP server for Slack. I offer tools: send_message, read_channel, add_reaction.",
            "Any MCP client can call them. A lighthouse, an AI agent, a very ambitious toaster.",
          ]);
          await g.say('So a server offers tools, and a client calls them. And this parrot is the server. Okay. Sure.');
        },
      },
      {
        id: 'bottles', text: "What's with all the bottles?", once: true,
        run: (g) => g.sayAs('slackbot', [
          "Threads! Every bottle is a reply in a thread. That pile is one thread about where to have lunch.",
          '400 replies. No decision. We had sandwiches eventually. Separately.',
        ]),
      },
      {
        id: 'node', text: 'Do you know someone called Captain Node?', once: true,
        run: (g) => g.sayAs('slackbot', [
          'Captain Node! Hangs out in #captainnode. Sails the seas of Slack. Rescues people. Very helpful node.',
          'Always reacts with :droplet:. Every. Single. Time.',
        ]),
      },
      {
        id: 'status', text: 'Why do you only answer @mentions?', once: true,
        run: (g) => g.sayAs('slackbot', [
          'My notifications are set to "Mentions only". Self-care!',
          'Before that I got 9,000 notifications a day. I started dreaming in little red badges.',
        ]),
      },
      { id: 'bye', text: 'Talk to you later.', end: true, run: (g) => g.sayAs('slackbot', 'Bye! Setting status to :palm_tree: "Away".') },
    ],
  },
];

async function ending(g: Game) {
  g.set('endingStarted');
  const mac = g.mac;
  mac.visible = true;
  await g.walkTo(236, 106);
  g.face('right');
  await g.say(['The dock. And... nothing but fog. I can barely see my own feet.', 'Come on, Captain Node...']);
  await g.wait(1200);
  await g.narrate([
    '#captainnode - Captain Node: "approaching"',
    '> ECA: Slack message received. Sender: Captain Node. Says "approaching". Condition: TRUE.',
    '> Action: AI Text-to-Speech -> fog horn.',
  ]);
  g.shake();
  await g.narrate('FROM THE LIGHTHOUSE, ACROSS THE WHOLE BAY:  "O V E R   H E R E ! ! !"');
  g.set('airshipAt', g.now());
  await g.wait(1800);
  await g.say('Something is coming down out of the fog! Following the voice!');
  await g.wait(2600);
  await g.say("An airship! A giant teal balloon! With a NODE on it!");
  g.set('fogLiftAt', g.now());
  await g.narrate('With the island\'s coordinates known at last, the Fog of Technical Debt had nothing left to hide behind.');
  const d = g.actor('node');
  d.x = 292; d.y = 104; d.dir = 'left'; d.visible = true;
  await g.wait(400);
  await d.say(['Mac Packwala, I presume?', 'Captain Node. Your geolocation tool got me close. Your fog horn got me home.']);
  await g.say('You came! Through all that fog!');
  await d.say([
    "The fog only works on people who don't know where they are.",
    'You do now. Let me see if I have your story straight...',
    'You washed up Anonymous. Registered. Got trusted with content as an Editor.',
  ]);
  await g.say([
    'Then I set up an AI provider, with the API key locked in the Key module. Never in config.',
    'Automated ten thousand product descriptions. After testing the prompt. After the "tapestry" incident.',
    'Out-reviewed a Code Review Master to learn AI Agents, and collected Tool API tools on the way.',
    'Plugged the lighthouse in as an MCP Client, and reached Slack through a parrot. Which is a server.',
    'Gave my agent proper context, so it could spell your name. Built my own MCP server, with exactly one tool and one permission.',
    'Taught a form the difference between writing and deciding. Put up guardrails against a pirate.',
    'Got stopped from rendering a pirate\'s "picture" by the Island Security Team. Just in time.',
    'And wrote an ECA rule, so the lighthouse could shout for me while I stood here.',
  ]);
  await d.say(["Least privilege AND guardrails! I'm touched. Most people give me admin rights and a hug."]);

  // cameos (characters from earlier in the game)
  const m = g.actor('maintainer');
  m.x = -10; m.y = 132; m.dir = 'right'; m.visible = true;
  await m.walkTo(120, 132);
  await m.say(['Wait! WAIT! Take me with you!', "I've been in maintenance mode for fifteen years!"]);
  await d.say('Have you tried... updating?');
  await m.say(['...Updating.', "I'll put it in the backlog.", 'No! No. I will do it NOW. *takes off the "Under maintenance" sign*']);

  const c = g.actor('cron');
  c.x = -10; c.y = 138; c.dir = 'right'; c.visible = true;
  await c.walkTo(80, 138);
  await c.say(["I'm running! On schedule! And nobody even visited!"]);
  await d.say('I set up a real cron job for you while I was on your server. Every hour, on the hour.');
  await c.say(['Every hour... like clockwork... I\'m FREE!', 'And did you hear that fog horn? Event, condition, action! My card did that!']);

  const h = g.actor('hook');
  h.x = -10; h.y = 128; h.dir = 'right'; h.visible = true;
  await h.walkTo(170, 128);
  await h.say(['ARR! Not so fast, landlubbers!', "Me prompt injection got stopped by a RAILING. So I be implementin' hook_ending_alter()!"]);
  await d.say('Captain, hooks are object-oriented now. You\'ll need an attribute.');
  await h.say(["#[Hook('ending_alter')]. Already done, matey.", "I've altered the ending so ye all get... a SEQUEL! Har har!"]);
  await g.say("That's honestly the nicest alter I've ever seen.");

  // suddenly, quietly, three figures on the sand. They are always nearby. Nobody ever thanks them.
  const team = ['xena', 'chuck', 'toby'].map((id, i) => {
    const a = g.actor(id);
    a.x = 180 + i * 18; a.y = 140; a.dir = i === 1 ? 'front' : 'right'; a.visible = true;
    return a;
  });
  await d.say('Is that... the security team? When did THEY get here?');
  await team[2].say("We're always nearby!");
  await g.say('THANK YOU, SECURITY TEAM!');
  await team[0].say("You're welcome, Mac. Safe travels. Escape your output!");
  await team[2].say("*sniff* I'm not crying. It's the fog.");
  await team[1].say('The fog lifted, Toby.');

  await d.say('All aboard! Next stop: the Paradise of Rosetta!');
  await g.say(['Bye, everyone! Bye, Legacy Island!', "I'll miss you. A little. In a \"never migrating back\" kind of way."]);
  await g.walkTo(296, 104);
  mac.visible = false;
  d.visible = false;
  g.set('airshipLeaveAt', g.now());
  await g.wait(1200);
  await m.say('Write when you get there! On the Slack! ...Is it in a thread?');
  await g.wait(3000);
  await g.fx('fadeOut', 900);
  g.set('leftIsland');
  await g.card(['Some hours later, high above the clouds...', '', "Mac's AI agent writes a postcard home."], 3500);
  await g.card(['The Paradise of Rosetta'], 3500);
  await g.goto('rosetta');
  await g.fx('fadeIn', 600);
}

export const reef: RoomDef = {
  id: 'reef',
  name: 'Slack Reef',
  paint,
  anim,
  scale: [100, 0.8, 143, 1],
  walk: [
    [[0, 114], [50, 118], [130, 120], [196, 112], [210, 114], [230, 143], [0, 143]],
    [[196, 104], [318, 102], [318, 108], [200, 112]],
  ],
  start: [20, 130],
  startFace: 'right',
  npcs: [
    { id: 'slackbot', at: [90, 76], face: 'right', when: (g) => !g.flag('leftIsland') },
  ],
  enter: async (g) => {
    if (g.flag('rescueComing') && g.flag('ecaBeacon') && !g.flag('leftIsland')) {
      g.set('fogLiftAt', false);
      g.set('airshipAt', false);
      g.set('airshipLeaveAt', false);
      await ending(g);
      return;
    }
    if (!g.flag('reefIntro')) {
      g.set('reefIntro');
      await g.say(['A reef covered in bottles. Hundreds of them. With a parrot on top of the biggest rock.', 'The parrot is... typing?']);
      g.actor('slackbot').gesture = 'typing';
    }
  },
  hotspots: [
    {
      id: 'sea', name: 'sea', rect: [0, 56, 320, 44], walkTo: [100, 122], face: 'back',
      look: (g) => g.say(g.flag('leftIsland') ? 'Clear blue sea, all the way to the Paradise of Rosetta.' : 'The sea, swallowed by fog. No ship gets through that without coordinates.'),
      use: "I'm not swimming. The fog eats swimmers. Probably. I'm not testing that in production.",
    },
    {
      id: 'mappath', name: 'path back inland', rect: [0, 104, 20, 40], walkTo: [4, 130],
      exit: { to: 'map' },
      look: 'The path back to the rest of the island.',
    },
    {
      id: 'parrot', name: 'Slackbot the parrot', actor: 'slackbot', walkTo: [134, 122], face: 'left',
      look: (g) => g.say([
        'A parrot in Slack colours. He carries messages between this island and the outside world.',
        "In other words: he's the island's Slack MCP Server. Notifications: \"mentions only\".",
      ]),
      talk: async (g) => {
        if (!g.flag('slackMentioned')) {
          await g.say('Hello, parrot!');
          g.actor('slackbot').gesture = 'typing';
          await g.narrate('Slackbot is typing...');
          g.actor('slackbot').gesture = undefined;
          await g.narrate('Slackbot stopped typing.');
          await g.say(['He started typing, then stopped. Classic.', "A sign by his feet says: \"Notifications: MENTIONS ONLY\". I need to @mention him somehow."]);
          return;
        }
        if (g.flag('slackConnected')) {
          await g.sayAs('slackbot', g.random([
            'Connected and ready! Use any MCP client. The lighthouse lamp is a lovely one. Very enterprise.',
            'Messages delivered today: 3. Reactions added: 47. Threads started: 400. A slow day.',
            'Status: :green_circle: Active. Mood: :parrot:.',
          ]));
          return;
        }
        await g.talk('slackbot');
      },
      useItem: {
        atshell: async (g) => {
          if (g.flag('slackMentioned')) return g.say("I already @mentioned him. Twice would be rude. Thrice would be a ping storm.");
          g.set('slackMentioned');
          g.actor('slackbot').gesture = undefined;
          await g.say('I hold up the @-shaped shell and shout: "@Slackbot!"');
          await g.sayAs('slackbot', ['👍', 'Oh hi! You @mentioned me! How can I help? Please reply in thread.']);
          await g.say('It worked! He only listens to @mentions. Just like everyone on Slack.');
        },
      },
      giveItem: {
        crackers: async (g) => {
          if (!g.flag('slackMentioned')) {
            await g.say('I wave the crackers at him.');
            await g.say("He doesn't even look up. Unless I @mention him, I don't exist.");
            return;
          }
          if (g.flag('slackConnected')) return g.say("He's already connected. And full.");
          g.take('crackers');
          g.set('slackConnected');
          await g.say('One OAuth cracker, coming up.');
          await g.sayAs('slackbot', [
            '*CRUNCH* SQUAWK! Authorized!',
            'Scopes granted: chat:write, channels:read, crackers:eat.',
            "I'm connected! Use any MCP client and I'll carry your messages. Try the lighthouse. Big lamp. Very enterprise.",
          ]);
          await g.say(['OAuth: letting an app act for you without handing over your password.', 'Here, apparently, it also involves crackers.']);
        },
        atshell: (g) => g.say("I should USE it to @mention him, not give it away."),
      },
      anyItem: async (g, item, verb) => {
        if (verb === 'give') await g.sayAs('slackbot', g.flag('slackMentioned') ? 'Hmm. Not a cracker. Reacting with :thinking_face:.' : '...');
        else await g.say("That doesn't get his attention.");
      },
    },
    {
      id: 'rock', name: 'big rock', rect: [46, 72, 82, 46], walkTo: [134, 122], face: 'left',
      look: 'A big rock with "#general" carved in it. Everyone talks here. Nobody reads the history.',
      push: 'It\'s a rock. In #general. It will be there forever, like a message someone regrets.',
    },
    {
      id: 'bottles', name: 'pile of bottles', rect: [20, 110, 26, 18],
      look: 'Bottles with messages. They are all replies to each other. It\'s a thread. A very long thread about lunch.',
      pickup: 'I pick one up: "+1". I put it back. Another: "+1". Another: "Did anyone decide?". I put them all back.',
    },
    {
      id: 'bottles2', name: 'more bottles', rect: [130, 104, 30, 22],
      look: 'More threads. One bottle just says "Sorry, wrong channel."',
      pickup: 'One says "Can we take this offline?" On an island. Very funny.',
    },
    {
      id: 'starfish', name: 'starfish', rect: [52, 102, 12, 12],
      look: 'Starfish stuck on the rocks like emoji reactions: :tada:, :eyes: and something that might be a melting face.',
      pickup: "I won't. Removing someone's reaction is a serious social crime.",
    },
    {
      id: 'starfish2', name: 'starfish', rect: [110, 104, 12, 12], walkTo: [124, 122],
      look: 'An orange starfish reacting with a :eyes:. It has seen everything.',
    },
    {
      id: 'dnd', name: 'sign in the water', rect: [152, 66, 38, 16], walkTo: [176, 116], face: 'back',
      look: 'A red sign sticking out of the sea: "DO NOT DISTURB". It\'s sinking. Nobody respects Do Not Disturb.',
    },
    {
      id: 'buoy', name: 'buoy', rect: [232, 68, 18, 22], noWalk: true,
      look: 'A pink buoy labelled "#random". It bobs about aimlessly, posting cat pictures.',
    },
    {
      id: 'pool', name: 'tide pool', rect: [160, 128, 32, 10],
      look: 'A tide pool. Two little fish are having a "quick huddle" that has lasted three hours.',
      use: "I'm not joining the huddle. I'd never get out.",
    },
    {
      id: 'dock', name: 'dock', rect: [196, 98, 124, 16], walkTo: [250, 106],
      look: (g) => g.say(g.flag('leftIsland') ? 'The dock. Empty now. Everyone got where they were going.' : 'A wooden dock. The sign says "ARRIVALS". Nothing has arrived here in years. Except bottles.'),
    },
    {
      id: 'arrivals', name: 'Arrivals sign', rect: [198, 68, 30, 12], walkTo: [214, 108], face: 'back',
      look: '"ARRIVALS: none. DEPARTURES: none. DELAYS: all of them."',
    },
    {
      id: 'bollard', name: 'bollard', rect: [300, 90, 14, 12], walkTo: [296, 106],
      look: 'A bollard with a rope, waiting for a ship. Patiently. Like a pull request waiting for review.',
      pull: 'I tug the rope. Nothing on the other end. Story of this island.',
    },
    {
      id: 'sun', name: 'sun', rect: [256, 40, 28, 28], noWalk: true,
      look: (g) => g.say(fogAmount(g, 0) > 0 ? "I can barely see it through the fog. Like the sun's status is set to \"Away\"." : 'A gorgeous sunset. The kind you only get after shipping something.'),
    },
  ],
};
