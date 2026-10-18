// Rubber duck debugging as a hint system: Mac explains his problem to the duck,
// and the first unsolved step in this list becomes the hint.
import type { Game } from '../engine/types';

/** `id` names the milestone for analytics (how far players get); `step` names the help #ai-contrib
 *  gives for it (see HELP below). */
type Hint = { id: string; done: (g: Game) => boolean; lines: string[]; step?: string };

const f = (name: string) => (g: Game) => !!g.flag(name);
const got = (item: string) => (g: Game) => !!g.flag(`got:${item}`);

const HINTS: Hint[] = [
  { id: 'cron_awake', done: f('cronAwake'), lines: ['So, duck: the README says Cron lives on the cliff. But he only wakes up when someone "visits"...', '...and I have a box of keyboard parts I can\'t open. Maybe something in the wreck could pry it?'] },
  { id: 'cookies_done', done: f('cookiesDone'), lines: ['That cookie guard blocks the way to town. There must be a "Reject all" somewhere. There always is. It\'s just hidden.', 'Or I could accept everything and... refresh him if he gets stuck?'] },
  { id: 'registered', done: (g) => g.atLeast('authenticated'), lines: ['Everyone keeps saying I need to register. The registration desk is at the harbour.', 'If the clerk sends me an email... where IS my inbox on this island? Something keeps washing up on the beach.'] },
  { id: 'trials_given', done: f('trialsGiven'), lines: ["I'm logged in now. The Grand Maintainer in the square might finally talk to me."] },
  { id: 'tokens', done: got('tokens'), lines: ['I need tokens. The Token Request Form can never pass validation - it requires a field it doesn\'t have.', 'Someone who alters forms could fix that. A pirate in the tavern alters things... but his alterations keep getting overridden. Something heavier, to run later?'] },
  { id: 'ai_installed', done: f('aiInstalled'), lines: ['To install the AI module, the Composer needs sheet music - composer.json - and a cat-free piano.', 'Cats like fish. Even red ones. Even ones that are supposedly useless.'] },
  { id: 'editor', done: (g) => g.atLeast('editor'), lines: ['The AI module is installed! I should tell the Grand Maintainer.'] },
  { id: 'provider_ready', done: f('providerReady'), lines: ['Trial one: configure a provider. The idols in the temple want an API key, and tokens go in the slot.', 'But a key must be stored safely. The Key Keeper only trusts people who never commit secrets... like someone with a .gitignore.'] },
  { id: 'automator_done', done: f('automatorDone'), lines: ['Trial two: the mill. The Automator needs a provider and a good prompt.', "A prompt that's been tested first - Professor Abrahams's AI Explorer is for exactly that. He'd trade it for something nobody reads."] },
  { id: 'provider_restored', done: (g) => !g.flag('providerSuspended'), lines: ['The idols cut off my provider over the token bill. I need to count my tokens - and a cheaper plan B.', "The Key Keeper counts everything. And Ollama the llama keeps saying he's local and free..."] },
  { id: 'master_beaten', done: f('masterBeaten'), lines: ['Trial three: beat the Code Review Master. Her patches hide the same bugs the reviewers at the crossroads show me.', "Every bug I miss, they explain. Every bug they explain, I'll spot next time. The Master lives behind the Waterfall. Nobody uses the Waterfall anymore."] },
  { id: 'site_builder', done: (g) => g.atLeast('sitebuilder'), lines: ['All three trials are done. Back to the Grand Maintainer!'] },
  { id: 'window_fixed', done: f('windowFixed'), lines: ['The lighthouse lamp is an MCP Client - but the stairs are broken and the lamp\'s context window is shattered.', 'The sign painter in town might lend a ladder if I fix his spelling. And the temple has a lovely stained-glass window.'] },
  { id: 'slack_connected', done: f('slackConnected'), lines: ['The Slack server out on the reef is a parrot that only answers when @mentioned.', 'And parrots want crackers. OAuth ones, ideally.'] },
  { id: 'context_ready', step: 'contextReady', done: f('contextReady'), lines: ['My agent wrote pure mush to "Captain Noodle". It knows nothing about me, or this island.', 'Agents need context. Modelia keeps Kristen\'s Context Control Center down in the lighthouse.'] },
  { id: 'search_ready', done: (g) => !!g.flag('searchReady') || !!g.flag('geoClue'), lines: ['The GeoCities ghost knows where we are, but I need a translator. The Librarian has one, but her search only finds exact words.', 'He needs an index sorted by similarity. Like the scales on a pinecone, from the jungle crossroads. And a provider.'] },
  { id: 'flow_built', done: (g) => !!g.flag('flowBuilt') || !!g.flag('geoClue'), lines: ["The Librarian's FlowDrop board: trigger, shelf, summary, review, index.", 'But the LLM writes an essay every time it picks a shelf. I need a model that just CHOOSES. Professor Abrahams might know one.'] },
  { id: 'geo_clue', done: f('geoClue'), lines: ['AI Translate could make sense of the GeoCities ghost in the graveyard.'] },
  { id: 'mcp_serving', step: 'mcpServing', done: f('mcpServing'), lines: ['Captain Node wants the coordinates via a tool call. I need an MCP server, and a geolocation tool on it.', 'The ghost said Old Cron logs everything, and he watches the stars on schedule. A blank Tool API card could become a tool.'] },
  { id: 'spam_fixed', step: 'spamFixed', done: (g) => !!g.flag('spamFixed') || !!g.flag('permGranted'), lines: ['Formsworth is buried in spam. His AI Validations need a model that answers TRUE or FALSE.', 'Not an essay. I know just the model.'] },
  { id: 'perm_granted', step: 'permGranted', done: f('permGranted'), lines: ["Captain Node is Anonymous on my server, like I once was. She needs a permission. On a page with 3,000 checkboxes.", 'If only I had a tool that could search...'] },
  { id: 'hook_injected', step: 'hookInjected', done: f('hookInjected'), lines: ["Permission granted. I should message Captain Node from the lighthouse lamp again."] },
  { id: 'guardrails_on', step: 'guardrailsOn', done: f('guardrailsOn'), lines: ['Captain Hook hijacked my agent with "ignore previous instructions". I need guardrails: checks before and after every AI request.', 'The lamp room balcony has a railing. Literally a guard rail.'] },
  { id: 'need_beacon', step: 'needBeacon', done: f('needBeacon'), lines: ['Guardrails are up. Time to call Captain Node again.'] },
  { id: 'security_reviewed', step: 'securityReviewed', done: f('securityReviewed'), lines: ['Captain Node promised a chart of the reef approach. I should check Slack at the lamp.', 'And if something looks too easy - like flipping one switch to "Full HTML" - maybe count to three first.'] },
  { id: 'eca_beacon', step: 'ecaBeacon', done: f('ecaBeacon'), lines: ["Captain Node can't find the dock in the fog, and I can't be at the lamp and the dock at the same time.", "Old Cron's ECA card: WHEN something happens, IF it's true, THEN do something. A fog horn that talks would need my text-to-speech tool."] },
  { id: 'disclosed', done: f('disclosed'), lines: ['Customs wants to know if my postcard is AI-generated. Formsworth gave me an AI Disclosure stamp.', 'Honesty is probably the policy. It usually is at customs.'] },
  { id: 'rescued', done: f('rescued'), lines: ['I made it to the Paradise of Rosetta! Captain Node is waiting past the rope.'] },
];

/** The puzzle chain in order, for analytics: a player has reached every leading step that is done. */
export const MILESTONES = HINTS.map(({ id, done }) => ({ id, done }));

export async function duckHint(g: Game) {
  const h = HINTS.find((x) => !x.done(g));
  await g.say('Okay, duck. Let me explain where I\'m stuck...');
  if (!h) { await g.say("Actually... I'm not stuck. Thanks, duck. You're a great listener."); return; }
  await g.say(h.lines);
  await g.sayAs('duck', 'Squeak.');
  await g.say(g.random(['Thanks, duck. Talking it through helps.', 'You\'re right, duck. As always.', 'Squeak indeed.']));
}

// #ai-contrib on Slack: where the people who build Drupal's AI modules answer questions.
// Stronger than the duck: Mac posts the same problem, and someone tells him the next step.
type Help = { when?: (g: Game) => boolean; who: string; from: string; lines: string[] };

const HELP: Record<string, Help[]> = {
  contextReady: [
    { when: (g) => !g.flag('needContext'), who: 'nell', from: 'Nitpick Nell', lines: ['Go ahead and message Captain Node in #captainnode first. Let your agent write it.', "If it comes out weird, that's not the model's fault. It's what the model knows. Then come back!"] },
    { who: 'modelia', from: 'Modelia Contexta', lines: [
      "Come down to my filing cabinet, dear. The Context Control Center.",
      'Write your agent some context items: who you are, where you are, how to spell Captain Node, and a tone of voice.',
      'I approve each one, then you subscribe your agent to them. And please do NOT always-include the entire legacy manual. My window has been through enough.',
    ] },
  ],
  mcpServing: [
    { when: (g) => !g.flag('nodeContacted'), who: 'nell', from: 'Nitpick Nell', lines: ['Your agent has context now? Then message Captain Node again in #captainnode. Same agent, much better message.'] },
    { when: (g) => !!g.flag('toolRegistered'), who: 'nell', from: 'Nitpick Nell', lines: ['Server built, tool registered. Last step: plug the MCP server into your lighthouse lamp.', 'Then anyone with permission can call your tools. Client asks, server answers!'] },
    { when: (g) => g.has('tool_geo'), who: 'nell', from: 'Nitpick Nell', lines: ["You've made a geolocation tool. Now register it on your MCP server: use the tool on the server relic.", 'Tool API tools describe their inputs and outputs, so the MCP Server can offer them to anyone. No extra code.'] },
    { when: (g) => g.has('coords'), who: 'nell', from: 'Nitpick Nell', lines: ['Real coordinates AND a blank Tool API card? Put the coordinates on the card.', 'A tool is just: what it takes, what it gives back, and the code in between. Agents call it instead of guessing.'] },
    { when: (g) => g.has('starlog'), who: 'cron', from: 'Old Cron', lines: ["Zzz... You've got my star log. Read it, youngster. Use it. The coordinates are in there.", '...Zzz.'] },
    { when: (g) => !g.has('mcpserver'), who: 'maintainer', from: 'The Grand Maintainer', lines: ['An MCP server of your own? I have kept a relic of one in the town square for years. Come and ask me for it.'] },
    { who: 'cron', from: 'Old Cron', lines: ['Zzz... Coordinates come from the stars. I log them every night. On schedule.', "I'm on the lookout. Asleep. I only run when somebody visits. Or presses F5 at me. ...Zzz."] },
  ],
  spamFixed: [
    { when: (g) => !g.flag('accessDenied'), who: 'nell', from: 'Nitpick Nell', lines: ['Your MCP server is up? Tell Captain Node in #captainnode, and let her try calling your tool!'] },
    { who: 'promptington', from: 'Professor Abrahams', lines: [
      "Formsworth's AI Validations need a model that answers TRUE or FALSE. An LLM gives you a lecture on the philosophy of spam.",
      'Use the Decision Model I gave you on his spam pile. It picks one answer from a fixed list, and tells you how sure it is.',
    ] },
  ],
  permGranted: [
    { when: (g) => !g.has('permform') && !g.has('permform2'), who: 'formsworth', from: 'Clerk Formsworth', lines: ['Clerk Formsworth here. My inbox is clean, thanks to you!', 'Come to the harbour and ask me again for that permissions form. In triplicate.'] },
    { when: (g) => g.has('permform2'), who: 'maintainer', from: 'The Grand Maintainer', lines: ['You found the one checkbox? Then hand that form to your MCP server up in the lamp room. Only that tool. Only that role.'] },
    { who: 'maintainer', from: 'The Grand Maintainer', lines: ["Ah, the permissions page. 3,000 checkboxes. I've wept over that page.", "Don't scroll, Mac. SEARCH. Use your search tool on the form."] },
  ],
  hookInjected: [{ who: 'nell', from: 'Nitpick Nell', lines: ['Permission granted? Then go tell Captain Node in #captainnode.', 'And keep an eye on who else is in that channel. Not everyone in there is a captain you want.'] }],
  guardrailsOn: [{ who: 'nell', from: 'Nitpick Nell', lines: [
    "Prompt injection. It happens to everyone. Even core.",
    'Pick up the railing on your balcony. That is your guardrail set. Then use it on the lamp.',
    'Before the request: block the attack phrase with a regexp AND restrict the topic. After the answer: never grant roles, never reveal keys. You need all four.',
  ] }],
  needBeacon: [{ who: 'nell', from: 'Nitpick Nell', lines: ['Guardrails on? Then try your call in #captainnode again. Hook will bounce right off.'] }],
  securityReviewed: [{ who: 'nell', from: 'Nitpick Nell', lines: ["Captain Node said she'd post a chart in #captainnode. Go and read it.", "And Mac? If anything asks you to switch AI output to Full HTML... count to three first. Trust me."] }],
  ecaBeacon: [
    { when: (g) => !g.has('tool_tts'), who: 'nell', from: 'Nitpick Nell', lines: ["For a fog horn that talks, you'll need a text-to-speech tool. The Speak-o-Tron in the graveyard has one, if he has the power to give it."] },
    { who: 'cron', from: 'Old Cron', lines: [
      "Zzz... I'm only the WHEN. ECA is the whole sentence. Use my ECA card on the lamp's control panel.",
      'WHEN a Slack message arrives. IF it is Captain Node, saying "approaching". THEN AI Text-to-Speech, through the fog horn. ...Zzz.',
    ] },
  ],
};
const FALLBACK: Help = { who: 'nell', from: 'Nitpick Nell', lines: ["Hmm, I'm not sure that one is an AI question! But you've got this.", 'Have you tried explaining it to a rubber duck? Works on core bugs too.'] };

export async function aiContribHelp(g: Game) {
  const h = HINTS.find((x) => !x.done(g));
  if (!h) {
    await g.say('I post: "Not stuck! Just wanted to say thanks, everyone."');
    await g.narrate('#ai-contrib - Nitpick Nell is typing...');
    await g.sayAs('nell', "Aww. That's what this channel is for. Go get rescued, Mac! :blue_heart:");
    return;
  }
  await g.say(['I post: "Hi all! Stranded on Legacy Island, and stuck. Here\'s where I am:"', ...h.lines]);
  const options = (h.step && HELP[h.step]) || [];
  const help = options.find((x) => !x.when || x.when(g)) ?? FALLBACK;
  await g.narrate(`#ai-contrib - ${help.from} is typing...`);
  await g.sayAs(help.who, help.lines);
  if (help.who === 'nell' && !g.flag('nellHelped')) {
    g.set('nellHelped');
    await g.say(['That was NELL. Nitpick Nell, from the core team. She answered ME.', 'In four minutes. I am framing this thread.']);
  } else {
    await g.say(g.random(['I post: "Thank you!!" Three people react with :drupal_heart:.', 'Answered in minutes. By the people who BUILD the thing.', 'I post: "That worked!" ...well, it will. I post it early. Optimism.']));
  }
}
