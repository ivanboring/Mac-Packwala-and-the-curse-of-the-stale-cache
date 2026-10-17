import { describe, expect, it } from 'vitest';
import { act, go, newGame } from './helpers';
import { content } from '../src/content/index';
import { textWidth } from '../src/engine/font';
import type { GameCore } from '../src/engine/core';
import type { ItemDef } from '../src/engine/types';

// Items owned by other acts. Stub any that aren't defined yet so Act 2 can be tested alone.
for (const id of ['readme', 'gitignore', 'tokens', 'popup', 'batteries', 'herring']) {
  if (!content.items[id]) content.items[id] = { id, name: id, look: id, icon: () => {} } as ItemDef;
}

function setup(role: 'authenticated' | 'editor' | 'sitebuilder' = 'editor', extraFlags: Record<string, any> = {}) {
  const h = newGame();
  h.core.state.role = role;
  h.core.state.inv = ['readme', 'gitignore', 'tokens', 'popup', 'batteries'];
  Object.assign(h.core.state.flags, { aiInstalled: true, tokenCount: 3, ...extraFlags });
  return h;
}

/** Plays code review as well as Mac can: the right comment once he has learned the bug,
 *  otherwise a decoy (and so he learns it). Tries an AI-written pull request once, then his own words. */
function duelist(options: { id: string; text: string }[], core: GameCore): string | undefined {
  const ids = options.map((o) => o.id);
  if (ids.includes('nothing')) return ids.find((i) => i.startsWith('bug:')) ?? 'decoy:0';
  if (ids.includes('own')) return core.log.some((l) => l.includes('This pull request delves')) ? 'own' : 'agent';
  return undefined;
}

describe('Act 2: the Three Trials', () => {
  it('only editors may visit Act 2 locations', async () => {
    const h = setup('authenticated');
    await h.core.goto('map');
    await go(h, 'loc_temple');
    expect(h.core.state.room).toBe('map');
  });

  it('every bug is taught at the crossroads and hidden in a Master patch, and the code fits on screen', () => {
    const bugIds = new Set(content.bugs.map((b) => b.id));
    expect(bugIds.size).toBe(content.bugs.length);
    for (const p of content.patches) {
      expect(bugIds.has(p.bug)).toBe(true);
      expect(p.decoys.length).toBeGreaterThanOrEqual(2);
      for (const l of [p.title, ...p.code]) expect(textWidth(l), l).toBeLessThanOrEqual(290);
    }
    for (const b of content.bugs) {
      expect(content.patches.some((p) => p.bug === b.id && p.who !== 'master'), b.id).toBe(true);
      expect(content.patches.some((p) => p.bug === b.id && p.who === 'master'), b.id).toBe(true);
      expect(textWidth(b.comment), b.comment).toBeLessThanOrEqual(300);
    }
    for (const id of ['nell', 'bob', 'larry', 'master']) expect(content.duels[id]).toBeTruthy();
  });

  it('plays puzzles 18-31, with AI Metering, FlowDrop and the Decision Model', async () => {
    const h = setup();
    const { core, pres } = h;
    await core.goto('map');

    // 18: rate-limit slot -> API key
    await go(h, 'loc_temple');
    expect(core.state.room).toBe('temple');
    await act(h, 'use', 'tokens', 'slot');
    expect(core.has('apikey')).toBe(true);
    expect(core.has('tokens')).toBe(false);
    await act(h, 'talk', 'ollama', undefined, ['who', 'provider', 'bye']);
    // the context window is for site builders only
    await act(h, 'pickup', 'ctxwindow');
    expect(core.has('window')).toBe(false);

    // 19: Key Keeper wants proof you don't commit secrets
    await go(h, 'temple_door');
    await go(h, 'loc_keyhut');
    await act(h, 'use', 'apikey', 'vault');
    expect(core.has('keyentity')).toBe(false);
    await act(h, 'give', 'gitignore', 'keykeeper');
    expect(core.flag('vaultOpen')).toBe(true);
    expect(core.flag('gitignoreShown')).toBe(true);
    await act(h, 'use', 'apikey', 'vault');
    expect(core.has('keyentity')).toBe(true);
    expect(core.has('apikey')).toBe(false);

    // 20: key entity on a cloud idol -> provider
    await go(h, 'keyhut_door');
    await go(h, 'loc_temple');
    await act(h, 'use', 'keyentity', 'idols');
    expect(core.flag('providerReady')).toBe(true);
    expect(core.has('provider')).toBe(true);

    // 21: nobody reads READMEs; LLMs do
    await act(h, 'give', 'readme', 'promptington');
    expect(core.has('explorer')).toBe(true);
    expect(core.flag('explorerGiven')).toBe(true);

    // 22-23: the Automator
    await go(h, 'temple_door');
    await go(h, 'loc_mill');
    await act(h, 'talk', 'fieldsworth', undefined, ['problem', 'machine', 'bye']);
    await act(h, 'pull', 'lever');
    expect(core.flag('badRun')).toBeFalsy(); // no provider yet: clunk
    await act(h, 'use', 'provider', 'hopper');
    expect(core.flag('hopperProvider')).toBe(true);
    expect(core.has('provider')).toBe(true);
    await act(h, 'pull', 'lever');
    expect(core.flag('badRun')).toBe(true);
    expect(core.flag('automatorDone')).toBeFalsy();
    await act(h, 'use', 'explorer'); // first run: the rich tapestry of synergy
    expect(core.log.some((l) => l.includes('rich tapestry'))).toBe(true);
    expect(core.has('prompt')).toBe(false);
    await act(h, 'use', 'explorer', undefined, ['epic', 'pirate', 'good']);
    expect(core.has('prompt')).toBe(true);
    expect(core.flag('promptGood')).toBe(true);
    await act(h, 'use', 'prompt', 'automator');
    expect(core.flag('promptLoaded')).toBe(true);
    await act(h, 'pull', 'lever');
    expect(core.flag('automatorDone')).toBe(true);
    expect(core.has('tool_create')).toBe(true);

    // AI Metering: 10,000 descriptions cost 4.2 million tokens, and the idols suspend the provider
    expect(core.flag('providerSuspended')).toBe(true);
    expect(core.log.some((l) => l.includes('4.2 million tokens'))).toBe(true);
    const providerName = () => content.items.provider.name as (g: unknown) => string;
    expect(providerName()(core)).toContain('suspended');
    core.log.length = 0;
    await act(h, 'use', 'provider', 'hopper');
    expect(core.log.some((l) => l.includes('QUOTA EXCEEDED'))).toBe(true);
    await act(h, 'use', 'explorer');
    await act(h, 'talk', 'fieldsworth', undefined, ['bill', 'bye']);
    await go(h, 'mill_path');
    await go(h, 'loc_keyhut');
    await act(h, 'talk', 'keykeeper', undefined, ['meter', 'bye']);
    expect(core.has('metering')).toBe(true);
    await go(h, 'keyhut_door');
    await go(h, 'loc_temple');
    await act(h, 'talk', 'idols', undefined, ['bill', 'bye']);
    await act(h, 'talk', 'ollama', undefined, ['cutoff', 'bye']);
    // "Unlimited" makes the idols very happy and is not saved
    await act(h, 'use', 'metering', 'idols', ['unlimited']);
    expect(core.flag('meteringOn')).toBeFalsy();
    expect(core.flag('providerSuspended')).toBe(true);
    expect(core.has('metering')).toBe(true);
    await act(h, 'use', 'metering', 'idols', ['one']);
    expect(core.flag('meteringOn')).toBeFalsy();
    // a sensible daily quota, and over-budget requests go to the local llama
    await act(h, 'use', 'metering', 'idols', ['daily', 'bill', 'ollama']);
    expect(core.flag('meteringOn')).toBe(true);
    expect(core.flag('providerSuspended')).toBeFalsy();
    expect(core.flag('meteringRoute')).toBe('ollama');
    expect(core.has('metering')).toBe(false);
    expect(core.log.some((l) => l.includes('finally... someone... needs... me'))).toBe(true);
    expect(providerName()(core)).toContain('metered');
    await act(h, 'talk', 'ollama', undefined, ['overflow', 'bye']);
    await go(h, 'temple_door');

    // 24: code review at the crossroads (reviewers rotate between visits)
    await go(h, 'loc_crossroads');
    await act(h, 'pickup', 'pinetree');
    expect(core.has('pinecone')).toBe(true);
    await go(h, 'cross_path');
    await go(h, 'loc_waterfall');
    await act(h, 'walk', 'cave'); // "We're agile now."
    expect(core.state.room).toBe('waterfall');
    await go(h, 'wf_path');

    pres.chooser = duelist;
    const seen = new Set<string>();
    let fights = 0;
    // Lose and learn until Mac knows every bug and has won at least once.
    while (fights < 60 && !(core.flag('knowsDojo') && content.bugs.every((b) => core.flag(`bug:${b.id}`)))) {
      await go(h, 'loc_crossroads');
      const who = (core.flag<string>('reviewer') || 'nell') as string;
      seen.add(who);
      await act(h, 'talk', `rev_${who}`, undefined, ['duel']);
      fights++;
      await go(h, 'cross_path');
    }
    expect(core.flag('knowsDojo')).toBe(true);
    expect(core.flag<number>('duelsWon')).toBeGreaterThan(0);
    expect(seen.size).toBe(3);

    // 25-26: through the Waterfall to Master Rebase
    await go(h, 'loc_waterfall');
    await go(h, 'cave');
    expect(core.state.room).toBe('dojo');
    let tries = 0;
    while (!core.flag('masterBeaten') && tries++ < 10) await act(h, 'talk', 'master', undefined, ['duel']);
    expect(core.flag('masterBeaten')).toBe(true);
    expect(core.has('agents')).toBe(true);
    expect(core.log.join('\n')).toContain('Your words. Your name. Your responsibility.');
    expect(core.log.some((l) => l.startsWith('mac: That was the third trial'))).toBe(true);
    pres.chooser = undefined;
    await go(h, 'curtain');
    expect(core.state.room).toBe('waterfall');

    // 28: AI Search at the library
    await go(h, 'wf_path');
    await go(h, 'loc_library');
    await act(h, 'talk', 'librarian', undefined, ['boats', 'ships', 'exact', 'bye']);
    await act(h, 'use', 'provider', 'terminal');
    expect(core.flag('searchReady')).toBeFalsy(); // no index yet
    await act(h, 'give', 'pinecone', 'librarian');
    expect(core.flag('pineconeGiven')).toBe(true);
    await act(h, 'use', 'provider', 'terminal');
    expect(core.flag('searchReady')).toBe(true);
    for (const id of ['tool_search', 'provider']) expect(core.has(id)).toBe(true);
    expect(core.has('translate')).toBe(false);
    expect(core.log.some((l) => l.includes('RAG'))).toBe(true);

    // FlowDrop: wrong flows fail with their own gags
    await act(h, 'talk', 'librarian', undefined, ['books', 'bye']);
    await act(h, 'use', 'flowboard', undefined, ['shelf', 'llm', 'trigger', 'summary', 'review', 'index']);
    expect(core.flag('needDecision')).toBeFalsy(); // no trigger first
    await act(h, 'use', 'flowboard', undefined, ['trigger', 'shelf', 'dice', 'summary', 'index', 'review']);
    expect(core.log.some((l) => l.includes('Tax Law'))).toBe(true); // indexed before review
    await act(h, 'use', 'flowboard', undefined, ['trigger', 'seagull', 'shelf', 'llm', 'summary', 'review']);
    expect(core.flag('flowBuilt')).toBeFalsy();
    // the right order, but an LLM picking shelves writes essays
    await act(h, 'use', 'flowboard', undefined, ['trigger', 'shelf', 'llm', 'summary', 'review', 'index']);
    expect(core.flag('needDecision')).toBe(true);
    expect(core.log.some((l) => l.includes('many shelves, spiritually'))).toBe(true);
    expect(core.has('translate')).toBe(false);

    // Professor Abrahams: LLMs write, decision models choose
    await go(h, 'lib_door');
    await go(h, 'loc_temple');
    await act(h, 'talk', 'promptington', undefined, ['decide', 'bye']);
    expect(core.has('decision')).toBe(true);
    await go(h, 'temple_door');
    await go(h, 'loc_library');
    await act(h, 'talk', 'librarian', undefined, ['flow', 'trigger', 'shelf', 'decision', 'summary', 'review', 'index']);
    expect(core.flag('flowBuilt')).toBe(true);
    for (const id of ['translate', 'tool_translate', 'decision']) expect(core.has(id)).toBe(true);
    await act(h, 'use', 'flowboard'); // already running

    // 29-30: the graveyard
    await go(h, 'lib_door');
    await go(h, 'loc_graveyard');
    await act(h, 'talk', 'ghostgeo');
    expect(core.flag('geoClue')).toBeFalsy();
    await act(h, 'talk', 'ghostflash', undefined, ['skip', 'who', 'others', 'bye']);
    await act(h, 'use', 'translate', 'ghostgeo');
    expect(core.flag('geoClue')).toBe(true);
    await act(h, 'talk', 'speakotron');
    expect(core.flag('ttsOn')).toBeFalsy();
    await act(h, 'give', 'batteries', 'speakotron');
    expect(core.flag('ttsOn')).toBe(true);
    expect(core.has('tool_tts')).toBe(true);
    expect(core.log.some((l) => l.includes('CODE. REVIEW'))).toBe(true);

    // Tool cards are for site builders
    await act(h, 'use', 'tool_search');
    expect(core.state.role).toBe('editor');
    expect(core.has('tool_search')).toBe(true);
  });

  it('the window can be taken as a site builder', async () => {
    const h = setup('sitebuilder');
    await h.core.goto('temple');
    await act(h, 'pickup', 'ctxwindow');
    expect(h.core.has('window')).toBe(true);
    expect(h.core.flag('windowTaken')).toBe(true);
  });

  it('every Act 2 hotspot has a look line', () => {
    for (const id of ['map', 'keyhut', 'temple', 'mill', 'crossroads', 'waterfall', 'dojo', 'library', 'graveyard']) {
      const room = content.rooms[id];
      expect(room, id).toBeTruthy();
      expect(room.hotspots.length, id).toBeGreaterThanOrEqual(8);
      for (const hs of room.hotspots) expect(hs.look, `${id}/${hs.id}`).toBeTruthy();
    }
  });

  it('Nell is a kind core committer, and the others speak of her in awe', async () => {
    const h = setup('editor');
    const { core } = h;
    await core.goto('map');
    await go(h, 'loc_crossroads');
    expect(core.flag('reviewer') || 'nell').toBe('nell');
    await act(h, 'talk', 'rev_nell', undefined, ['who', 'humble', 'bye']);
    expect(core.log).toContain('nell: I\'m Nell. Drupal core committer. Everyone calls me Nitpick Nell.');
    expect(core.log).toContain('mac: Note to self: be more like Nell.');
    for (const who of ['bob', 'larry']) {
      await go(h, 'cross_path');
      await go(h, 'loc_crossroads');
      expect(core.flag('reviewer')).toBe(who);
      await act(h, 'talk', `rev_${who}`, undefined, ['nell', 'bye']);
    }
    expect(core.log.some((l) => l.startsWith('bob: Nell? Nell is a core committer.'))).toBe(true);
    expect(core.log.some((l) => l.startsWith("larry: Nell's the best developer on this island."))).toBe(true);
  });
});
