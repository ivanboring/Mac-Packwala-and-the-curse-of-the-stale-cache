// The whole game, start to finish, through the real rooms — proves there are no gaps between acts.
import { describe, expect, it } from 'vitest';
import { act, go, newGame } from './helpers';
import { content } from '../src/content/index';
import type { GameCore } from '../src/engine/core';

/** Plays code review as well as Mac can: the right comment once he has learned the bug,
 *  otherwise a decoy (and so he learns it). Tries an AI-written pull request once, then his own words. */
function duelist(options: { id: string; text: string }[], core: GameCore): string | undefined {
  const ids = options.map((o) => o.id);
  if (ids.includes('nothing')) return ids.find((i) => i.startsWith('bug:')) ?? 'decoy:0';
  if (ids.includes('own')) return core.log.some((l) => l.includes('This pull request delves')) ? 'own' : 'agent';
  return undefined;
}

describe('walkthrough', () => {
  it('plays the whole game from the beach to the rescue', async () => {
    const h = newGame();
    const { core, pres } = h;
    const room = (id: string) => expect(core.state.room).toBe(id);
    await core.goto('beach');

    // ===== ACT 1: Anonymous =====
    await act(h, 'look', 'crate'); // muffled: still under the sail
    await act(h, 'pull', 'sail');
    await act(h, 'pickup', 'duck');
    await act(h, 'talk', 'duck');
    await act(h, 'pickup', 'plank');
    await act(h, 'use', 'plank', 'crate');
    await act(h, 'pickup', 'seaweed');
    await act(h, 'pickup', 'bottle');
    await act(h, 'open', 'bottle');
    await go(h, 'cliffpath'); room('lookout');
    await act(h, 'use', 'f5key', 'cron', ['bye']);
    expect(core.flag('cronAwake')).toBe(true);
    await go(h, 'downpath'); room('beach');
    await go(h, 'townpath', ['accept']);
    await act(h, 'use', 'f5key', 'guard');
    await go(h, 'townpath'); room('square');
    await act(h, 'talk', 'maintainer', undefined, ['back', 'admin', 'bye']);

    // Registration (Form API: everything starts with #, and the form gets rebuilt)
    await go(h, 'alley'); room('harbour');
    await act(h, 'talk', 'formsworth', undefined, ['register', 'u2', 'e3', 'p2', 'bye']);
    await act(h, 'talk', 'formsworth', undefined, ['register', 'u2', 'e3', 'p3', 'bye']);
    expect(core.flag('regSent')).toBe(true);
    await go(h, 'townpath');
    await go(h, 'beachpath'); room('beach');
    await act(h, 'pickup', 'bottle2');
    await go(h, 'townpath');
    await go(h, 'alley');
    await act(h, 'give', 'verifylink', 'formsworth');
    expect(core.role).toBe('authenticated');

    // ===== Authenticated =====
    await act(h, 'talk', 'formsworth', undefined, ['tokens', 'bye']);
    await go(h, 'townpath');
    await act(h, 'talk', 'maintainer');
    expect(core.flag('trialsGiven')).toBe(true);
    await go(h, 'tavern'); room('tavern');
    await act(h, 'talk', 'hook', undefined, ['name', 'alter', 'bye']);
    await act(h, 'give', 'weight', 'hook');
    expect(core.has('tokenform2')).toBe(true);
    await act(h, 'pickup', 'coaster');
    await act(h, 'pickup', 'crackers');
    await act(h, 'pickup', 'herring');
    await go(h, 'exit');
    await go(h, 'alley');
    await act(h, 'give', 'tokenform2', 'formsworth');
    expect(core.flag('tokenCount')).toBe(10);
    await go(h, 'townpath');
    await go(h, 'emporium');
    await act(h, 'talk', 'wordy', undefined, ['plugin', 'composer', 'bye']);
    await act(h, 'pickup', 'basket');
    await go(h, 'exit');
    await go(h, 'bandstandpath'); room('bandstand');
    await act(h, 'use', 'herring', 'cat');
    await act(h, 'give', 'composerjson', 'composer');
    expect(core.flag('aiInstalled')).toBe(true);
    await go(h, 'exit');
    await act(h, 'talk', 'maintainer');
    expect(core.role).toBe('editor');
    // text-to-speech and text-to-music arrive with the AI module: the Maintainer's voice cuts in mid-word
    expect(core.flag('voicesOn') && core.flag('musicOn')).toBe(true);
    expect(core.log).toContain('maintainer: -eech. ...Hold on. Is that... my VOICE?');

    // ===== Editor: side quests in town =====
    await go(h, 'emporium');
    await act(h, 'talk', 'wordy', undefined, ['batteries', 'writing', 'bye']);
    expect(core.has('batteries') && core.has('ckeditor')).toBe(true);
    await go(h, 'exit');
    await act(h, 'give', 'ckeditor', 'painter');
    expect(core.has('ladder')).toBe(true);

    // ===== ACT 2: the Three Trials =====
    await go(h, 'gate'); room('map');
    await go(h, 'loc_temple');
    await act(h, 'use', 'tokens', 'slot');
    expect(core.has('apikey')).toBe(true);
    await go(h, 'temple_door');
    await go(h, 'loc_keyhut');
    await act(h, 'give', 'gitignore', 'keykeeper');
    await act(h, 'use', 'apikey', 'vault');
    expect(core.has('keyentity')).toBe(true);
    await go(h, 'keyhut_door');
    await go(h, 'loc_temple');
    await act(h, 'use', 'keyentity', 'idols');
    expect(core.flag('providerReady')).toBe(true);
    await act(h, 'give', 'readme', 'promptington');
    expect(core.has('explorer')).toBe(true);
    await go(h, 'temple_door');
    await go(h, 'loc_mill');
    await act(h, 'use', 'provider', 'hopper');
    await act(h, 'pull', 'lever');
    await act(h, 'use', 'explorer');
    await act(h, 'use', 'explorer', undefined, ['epic', 'pirate', 'good']);
    await act(h, 'use', 'prompt', 'automator');
    await act(h, 'pull', 'lever');
    expect(core.flag('automatorDone')).toBe(true);
    expect(core.flag('providerSuspended')).toBe(true); // the token bill

    // AI Metering: a quota, and a local model for when the budget runs out
    await go(h, 'mill_path');
    await go(h, 'loc_keyhut');
    await act(h, 'talk', 'keykeeper', undefined, ['meter', 'bye']);
    await go(h, 'keyhut_door');
    await go(h, 'loc_temple');
    await act(h, 'use', 'metering', 'idols', ['unlimited']); // not a budget, a confession
    await act(h, 'use', 'metering', 'idols', ['daily', 'ollama']);
    expect(core.flag('meteringOn')).toBe(true);
    expect(core.flag('providerSuspended')).toBeFalsy();
    await go(h, 'temple_door');

    await go(h, 'loc_crossroads');
    await act(h, 'pickup', 'pinetree');
    await go(h, 'cross_path');
    pres.chooser = duelist;
    for (let fights = 0; fights < 60 && !(core.flag('knowsDojo') && content.bugs.every((b) => core.flag(`bug:${b.id}`))); fights++) {
      await go(h, 'loc_crossroads');
      const who = (core.flag<string>('reviewer') || 'nell') as string;
      await act(h, 'talk', `rev_${who}`, undefined, ['duel']);
      await go(h, 'cross_path');
    }
    expect(core.flag('knowsDojo')).toBe(true);
    await go(h, 'loc_waterfall');
    await go(h, 'cave'); room('dojo');
    for (let tries = 0; !core.flag('masterBeaten') && tries < 10; tries++) await act(h, 'talk', 'master', undefined, ['duel']);
    expect(core.flag('masterBeaten')).toBe(true);
    pres.chooser = undefined;
    await go(h, 'curtain');
    await go(h, 'wf_path');

    await go(h, 'loc_library');
    await act(h, 'give', 'pinecone', 'librarian');
    await act(h, 'use', 'provider', 'terminal');
    expect(core.has('tool_search')).toBe(true);

    // FlowDrop: an LLM can't pick a shelf without writing an essay; a decision model can
    await act(h, 'use', 'flowboard', undefined, ['trigger', 'shelf', 'llm', 'summary', 'review', 'index']);
    expect(core.flag('needDecision')).toBe(true);
    await go(h, 'lib_door');
    await go(h, 'loc_temple');
    await act(h, 'talk', 'promptington', undefined, ['decide', 'bye']);
    expect(core.has('decision')).toBe(true);
    await go(h, 'temple_door');
    await go(h, 'loc_library');
    await act(h, 'use', 'flowboard', undefined, ['trigger', 'shelf', 'decision', 'summary', 'review', 'index']);
    expect(core.flag('flowBuilt') && core.has('translate')).toBe(true);
    await go(h, 'lib_door');
    await go(h, 'loc_graveyard');
    await act(h, 'use', 'translate', 'ghostgeo');
    expect(core.flag('geoClue')).toBe(true);
    await act(h, 'give', 'batteries', 'speakotron');
    expect(core.flag('ttsOn')).toBe(true);

    // Back to the Grand Maintainer: Site Builder
    await go(h, 'gy_gate'); room('map');
    await go(h, 'loc_town'); room('square');
    await act(h, 'talk', 'maintainer');
    expect(core.role).toBe('sitebuilder');
    expect(core.has('blankcard')).toBe(true);

    // ===== ACT 3: MCP =====
    await go(h, 'gate'); room('map');
    await go(h, 'loc_temple');
    await act(h, 'pickup', 'ctxwindow');
    expect(core.has('window')).toBe(true);
    await go(h, 'temple_door');
    await go(h, 'loc_lighthouse'); room('lighthouse');
    await act(h, 'talk', 'modelia', undefined, ['client', 'server', 'in', 'stairs', 'bye']);
    expect(core.flag('lhDoorOpen')).toBe(true);
    await act(h, 'use', 'ladder', 'hatch');
    await act(h, 'walk', 'hatch'); room('lamproom');
    await act(h, 'use', 'window', 'pane');
    expect(core.flag('windowFixed')).toBe(true);
    await act(h, 'use', 'lamp', undefined, ['weather', 'pizza', 'slack', 'off']);
    await act(h, 'walk', 'hatchDown'); room('lighthouse');
    await go(h, 'mappath'); room('map');
    await go(h, 'loc_reef'); room('reef');
    await act(h, 'use', 'atshell', 'parrot');
    await act(h, 'give', 'crackers', 'parrot');
    expect(core.flag('slackConnected')).toBe(true);
    await go(h, 'mappath');
    await go(h, 'loc_lighthouse');
    await act(h, 'walk', 'hatch'); room('lamproom');

    // #ai-contrib has a specific answer for every Act 3 step (never the generic fallback)
    const { aiContribHelp } = await import('../src/content/hints');
    const askContrib = async () => {
      const from = core.log.length;
      await aiContribHelp(core);
      expect(core.log.slice(from).join('\n')).not.toContain('rubber duck');
    };
    await askContrib();

    // Kristen's Context Control Center: without context, the agent writes mush to "Captain Noodle"
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('needContext')).toBe(true);
    await askContrib();
    await act(h, 'walk', 'hatchDown'); room('lighthouse');
    await act(h, 'talk', 'modelia', undefined, ['context', 'bye']);
    await act(h, 'use', 'cabinet', undefined, ['who', 'where', 'glossary', 'tone', 'done', 'agent']);
    expect(core.flag('contextReady')).toBe(true);
    await act(h, 'walk', 'hatch'); room('lamproom');
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('nodeContacted')).toBe(true);
    await askContrib();

    // The MCP server relic, Cron's star log (and ECA), the geolocation tool
    await act(h, 'walk', 'hatchDown');
    await go(h, 'mappath');
    await go(h, 'loc_town');
    await act(h, 'talk', 'maintainer');
    expect(core.has('mcpserver')).toBe(true);
    await go(h, 'beachpath');
    await go(h, 'cliffpath'); room('lookout');
    await act(h, 'use', 'f5key', 'cron');
    expect(core.has('starlog') && core.has('eca')).toBe(true);
    await askContrib();
    await act(h, 'use', 'starlog');
    expect(core.has('coords')).toBe(true);
    await askContrib();
    await act(h, 'use', 'coords', 'blankcard');
    expect(core.has('tool_geo')).toBe(true);
    await askContrib();
    await act(h, 'use', 'tool_geo', 'mcpserver');
    expect(core.flag('toolRegistered')).toBe(true);
    await askContrib();

    await go(h, 'downpath');
    await go(h, 'townpath');
    await go(h, 'gate');
    await go(h, 'loc_lighthouse');
    await act(h, 'walk', 'hatch');
    await act(h, 'use', 'mcpserver', 'lamp');
    expect(core.flag('mcpServing')).toBe(true);
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('accessDenied')).toBe(true);
    await askContrib();

    // AI Validations: Formsworth is drowning in spam; an LLM can't say TRUE or FALSE, a decision model can
    await act(h, 'walk', 'hatchDown');
    await go(h, 'mappath');
    await go(h, 'loc_town');
    await go(h, 'alley'); room('harbour');
    await act(h, 'talk', 'formsworth', undefined, ['perm', 'bye']);
    expect(core.has('permform')).toBe(false);
    await act(h, 'use', 'provider', 'spam');
    expect(core.flag('spamFixed')).toBeFalsy();
    await act(h, 'use', 'decision', 'spam');
    expect(core.flag('spamFixed')).toBe(true);
    await act(h, 'talk', 'formsworth', undefined, ['perm', 'bye']);
    expect(core.has('permform') && core.has('disclosure')).toBe(true);
    await askContrib();

    // Permissions: 3,000 checkboxes, found with the search tool
    await act(h, 'use', 'tool_search', 'permform');
    expect(core.has('permform2')).toBe(true);
    await askContrib();
    await go(h, 'townpath');
    await go(h, 'gate');
    await go(h, 'loc_lighthouse');
    await act(h, 'walk', 'hatch');
    await act(h, 'use', 'permform2', 'server');
    expect(core.flag('permGranted')).toBe(true);
    await askContrib();

    // Guardrails: Captain Hook_alter prompt-injects the call
    await act(h, 'use', 'lamp', undefined, ['slack']);
    expect(core.flag('hookInjected')).toBe(true);
    await askContrib();
    await act(h, 'pickup', 'railing');
    await act(h, 'use', 'guardrails', 'lamp', ['regexp', 'topic', 'next', 'roles', 'keys', 'next']);
    expect(core.flag('guardrailsOn')).toBe(true);
    await askContrib();
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('needBeacon')).toBe(true);
    await askContrib();

    // The Island Security Team stops Mac rendering a pirate's "picture" (data exfiltration)
    await act(h, 'use', 'lamp', undefined, ['slack', 'escape', 'csp', 'keys']);
    expect(core.flag('securityReviewed')).toBe(true);
    await askContrib();

    // ECA: when Captain Node says she's approaching, the fog horn shouts (AI text-to-speech)
    await act(h, 'use', 'eca', 'panel', ['slackmsg', 'approaching', 'tts']);
    expect(core.flag('ecaBeacon')).toBe(true);

    // The Paradise of Rosetta: declare the AI-written postcard honestly
    room('rosetta');
    expect(core.has('postcard')).toBe(true);
    await act(h, 'use', 'disclosure', 'postcard', ['honest']);
    expect(core.flag('disclosed')).toBe(true);
    await act(h, 'look', 'stone');
    await act(h, 'talk', 'node');
    expect(core.flag('rescued')).toBe(true);
    expect(core.flag('gameOver')).toBe(true);

    // Every hint step was reachable and resolved
    const { duckHint } = await import('../src/content/hints');
    core.log.length = 0;
    await duckHint(core);
    expect(core.log.join('\n')).toContain("I'm not stuck");
  });
});
