import { describe, expect, it } from 'vitest';
import { act, newGame } from './helpers';
import { content } from '../src/content/index';
import type { ItemDef } from '../src/engine/types';

// Items owned by other acts. If they aren't defined yet, stub them so Act 3 can be tested alone.
for (const id of ['ladder', 'window', 'mcpserver', 'blankcard', 'permform', 'permform2', 'starlog', 'atshell', 'crackers', 'decision', 'provider', 'tool_tts', 'tool_search', 'f5key']) {
  if (!content.items[id]) {
    content.items[id] = { id, name: id, look: id, icon: () => {} } as ItemDef;
  }
}

function setup(role: 'editor' | 'sitebuilder', inv: string[], flags: Record<string, any> = {}) {
  const h = newGame();
  h.core.state.role = role;
  h.core.state.inv = [...inv];
  Object.assign(h.core.state.flags, flags);
  return h;
}

describe('Act 3: MCP and the fog', () => {
  it('editors cannot get into the lighthouse or configure tools', async () => {
    const h = setup('editor', ['tool_geo', 'mcpserver', 'coords', 'blankcard']);
    const { core } = h;
    await core.goto('lighthouse');
    await act(h, 'open', 'door');
    expect(core.flag('lhDoorOpen')).toBeFalsy();
    await act(h, 'talk', 'modelia', undefined, ['client', 'server', 'in', 'bye']);
    expect(core.flag('lhDoorOpen')).toBeFalsy();
    await act(h, 'use', 'tool_geo', 'mcpserver');
    expect(core.flag('toolRegistered')).toBeFalsy();
    await act(h, 'use', 'coords', 'blankcard');
    expect(core.has('tool_geo')).toBe(true);
    expect(core.has('coords')).toBe(true);
  });

  it('#ai-contrib on Slack helps with whatever step Mac is stuck on', async () => {
    const h = setup('sitebuilder', ['coords', 'blankcard', 'mcpserver'], {
      // everything before Act 3 is done
      cronAwake: true, cookiesDone: true, trialsGiven: true, 'got:tokens': true, aiInstalled: true, providerReady: true,
      automatorDone: true, masterBeaten: true, geoClue: true, windowFixed: true, hatchOpen: true, lhDoorOpen: true,
      slackConnected: true, needContext: true,
    });
    const { core } = h;
    await core.goto('lamproom');
    const said = () => core.log.join('\n');
    await act(h, 'use', 'lamp', undefined, ['aicontrib', 'off']);
    expect(core.flag('aiContribJoined')).toBe(true);
    expect(said()).toContain('Context Control Center');
    core.log.length = 0;
    Object.assign(core.state.flags, { contextReady: true, nodeContacted: true });
    await act(h, 'use', 'lamp', undefined, ['aicontrib', 'off']);
    expect(said()).toContain('Put the coordinates on the card');
    expect(core.flag('nellHelped')).toBe(true);
    // not before Slack is connected
    const h2 = setup('sitebuilder', [], { windowFixed: true });
    await h2.core.goto('lamproom');
    await expect(act(h2, 'use', 'lamp', undefined, ['aicontrib'])).rejects.toThrow();
  });

  it('plays puzzles 32-40, the new AI-ecosystem steps, and the Rosetta ending', async () => {
    const h = setup('sitebuilder', ['ladder', 'window', 'atshell', 'crackers', 'mcpserver', 'blankcard', 'coords', 'f5key', 'provider', 'decision', 'tool_tts', 'tool_search'], { cronAwake: true });
    const { core } = h;
    await core.goto('lighthouse');
    // 32: in through the door, ladder to the hatch
    await act(h, 'talk', 'modelia', undefined, ['place', 'sweep', 'client', 'server', 'in', 'stairs', 'bye']);
    expect(core.flag('lhDoorOpen')).toBe(true);
    await act(h, 'use', 'cabinet');
    expect(core.flag('contextReady')).toBeFalsy(); // no problem yet, nothing to build
    await act(h, 'walk', 'hatch');
    expect(core.state.room).toBe('lighthouse');
    await act(h, 'use', 'ladder', 'hatch');
    expect(core.flag('hatchOpen')).toBe(true);
    expect(core.has('ladder')).toBe(false);
    await act(h, 'walk', 'hatch');
    expect(core.state.room).toBe('lamproom');

    // 33: fix the context window, try the servers
    await act(h, 'use', 'lamp');
    expect(core.flag('sawBrokenPane')).toBe(true);
    await act(h, 'use', 'window', 'pane');
    expect(core.flag('windowFixed')).toBe(true);
    await act(h, 'use', 'lamp', undefined, ['how', 'weather', 'pizza', 'slack', 'off']);
    expect(core.flag('pizzaOrdered')).toBe(true);
    expect(core.flag('slackConnected')).toBeFalsy();

    // 34: the parrot on the reef
    await core.goto('reef');
    await act(h, 'give', 'crackers', 'parrot');
    expect(core.flag('slackConnected')).toBeFalsy();
    await act(h, 'talk', 'parrot');
    expect(core.flag('slackMentioned')).toBeFalsy();
    await act(h, 'use', 'atshell', 'parrot');
    expect(core.flag('slackMentioned')).toBe(true);
    await act(h, 'talk', 'parrot', undefined, ['what', 'bottles', 'connect', 'bye']);
    await act(h, 'give', 'crackers', 'parrot');
    expect(core.flag('slackConnected')).toBe(true);

    // 35a: without context, Mac's agent writes synergy mush to "Captain Noodle"
    await core.goto('lamproom');
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('needContext')).toBe(true);
    expect(core.flag('nodeContacted')).toBeFalsy();
    expect(core.log.join('\n')).toContain('Captain Noodle');
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('nodeContacted')).toBeFalsy();

    // 35b: Kristen's Context Control Center: draft, overflow gag, approval, subscription
    await act(h, 'walk', 'hatchDown');
    expect(core.state.room).toBe('lighthouse');
    await act(h, 'talk', 'modelia', undefined, ['context', 'bye']);
    expect(core.flag('knowsCCC')).toBe(true);
    await act(h, 'use', 'cabinet', undefined, ['manual', 'pizza', 'who', 'done', 'later']);
    expect(core.flag('contextReady')).toBeFalsy();
    await act(h, 'open', 'cabinet', undefined, ['who', 'where', 'glossary', 'tone', 'pizza', 'done', 'everyone', 'agent']);
    expect(core.flag('contextReady')).toBe(true);
    expect(core.log.join('\n')).toContain('REJECTED');

    // 35c: first contact, with the Rosetta mention
    await act(h, 'walk', 'hatch');
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('nodeContacted')).toBe(true);
    expect(core.log.join('\n')).toContain('Paradise of Rosetta');

    // 36-37: Cron hands over the star log AND the ECA rule card
    await core.goto('lookout');
    await act(h, 'use', 'f5key', 'cron');
    expect(core.has('starlog')).toBe(true);
    expect(core.has('eca')).toBe(true);

    // 37-38: build the tool, register it, serve it
    await core.goto('lamproom');
    await act(h, 'use', 'mcpserver', 'lamp');
    expect(core.flag('mcpServing')).toBeFalsy(); // no tool yet
    await act(h, 'use', 'coords', 'blankcard');
    expect(core.has('tool_geo')).toBe(true);
    expect(core.has('coords') || core.has('blankcard')).toBe(false);
    await act(h, 'use', 'tool_geo', 'mcpserver');
    expect(core.flag('toolRegistered')).toBe(true);
    await act(h, 'use', 'mcpserver', 'lamp');
    expect(core.flag('mcpServing')).toBe(true);
    expect(core.has('mcpserver')).toBe(false);

    // Captain Node is Anonymous on our server
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('accessDenied')).toBe(true);
    expect(core.flag('rescueComing')).toBeFalsy();

    // 39a: Formsworth is buried in seagull spam. An LLM writes essays; a decision model decides.
    await core.goto('harbour');
    await act(h, 'talk', 'formsworth', undefined, ['perm', 'validation', 'bye']);
    expect(core.flag('spamSeen')).toBe(true);
    expect(core.has('permform')).toBe(false);
    await act(h, 'use', 'provider', 'spam');
    expect(core.flag('triedLlmValidation')).toBe(true);
    expect(core.flag('spamFixed')).toBeFalsy();
    await act(h, 'use', 'decision', 'spam');
    expect(core.flag('spamFixed')).toBe(true);
    expect(core.hotspot('spam')!.when!(core)).toBe(false);
    await act(h, 'talk', 'formsworth', undefined, ['perm', 'bye']);
    expect(core.has('permform')).toBe(true);
    expect(core.has('disclosure')).toBe(true);
    await act(h, 'use', 'tool_search', 'permform');
    expect(core.has('permform2')).toBe(true);

    // 39b: grant the permission
    await core.goto('lamproom');
    await act(h, 'pickup', 'railing');
    expect(core.has('guardrails')).toBe(false); // nothing to guard against yet
    await act(h, 'use', 'permform2', 'server');
    expect(core.flag('permGranted')).toBe(true);

    // 40a: Captain Hook_alter prompt-injects the call. Mac pulls the plug.
    await act(h, 'use', 'lamp', undefined, ['slack']);
    expect(core.flag('hookInjected')).toBe(true);
    expect(core.flag('rescueComing')).toBeFalsy();
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('needBeacon')).toBeFalsy();

    // 40b: guardrails (wrong sets first)
    await act(h, 'pickup', 'railing');
    expect(core.has('guardrails')).toBe(true);
    await act(h, 'use', 'guardrails', 'lamp', ['pirates', 'next', 'roles', 'keys', 'next']);
    expect(core.flag('guardrailsOn')).toBeFalsy();
    await act(h, 'use', 'guardrails', 'lamp', ['regexp', 'topic', 'length', 'next', 'roles', 'keys', 'next']);
    expect(core.flag('guardrailsOn')).toBeFalsy();
    await act(h, 'use', 'guardrails', 'panel', ['regexp', 'next', 'roles', 'keys', 'next']);
    expect(core.flag('guardrailsOn')).toBeFalsy();
    await act(h, 'use', 'guardrails', 'lamp', ['regexp', 'topic', 'next', 'keys', 'next']);
    expect(core.flag('guardrailsOn')).toBeFalsy();
    await act(h, 'use', 'guardrails', 'lamp', ['regexp', 'topic', 'next', 'roles', 'keys', 'shanty', 'next']);
    expect(core.flag('guardrailsOn')).toBeFalsy();
    await act(h, 'use', 'guardrails', 'lamp', ['regexp', 'topic', 'pirates', 'pirates', 'next', 'roles', 'keys', 'next']);
    expect(core.flag('guardrailsOn')).toBe(true);
    expect(core.has('guardrails')).toBe(false);

    // 40c: the guarded call works, but the dock is lost in fog
    await act(h, 'use', 'lamp', undefined, ['slack', 'off']);
    expect(core.flag('needBeacon')).toBe(true);
    expect(core.flag('rescueComing')).toBeFalsy();

    // 40c+: the Exfiltrawler. The beacon waits until Mac has checked Slack.
    await act(h, 'use', 'eca', 'panel', []);
    expect(core.flag('ecaBeacon')).toBeFalsy();
    // the security team stops the Full HTML switch; wrong answers get a kind second chance
    await act(h, 'use', 'lamp', undefined, ['slack', 'trust', 'hide', 'escape', 'small', 'ask', 'csp', 'context', 'feelings', 'keys']);
    expect(core.flag('securityReviewed')).toBe(true);
    expect(core.flag('trawlerGone')).toBe(true);
    expect(core.log.some((l) => l.startsWith('xena:'))).toBe(true);
    expect(core.log.some((l) => l.startsWith('chuck:'))).toBe(true);
    expect(core.log.some((l) => l.startsWith('toby:'))).toBe(true);

    // 40d: an ECA rule (wrong rules first)
    await act(h, 'use', 'eca', 'panel', ['hourly', 'approaching', 'tts']);
    await act(h, 'use', 'eca', 'panel', ['slackmsg', 'always', 'tts']);
    await act(h, 'use', 'eca', 'panel', ['slackmsg', 'tuesday', 'tts']);
    await act(h, 'use', 'eca', 'lamp', ['slackmsg', 'approaching', 'poem']);
    await act(h, 'use', 'eca', 'panel', ['pizza', 'approaching', 'order']);
    expect(core.flag('ecaBeacon')).toBeFalsy();
    expect(core.state.room).toBe('lamproom');
    await act(h, 'use', 'eca', 'panel', ['slackmsg', 'approaching', 'tts']);
    expect(core.flag('ecaBeacon')).toBe(true);
    expect(core.flag('rescueComing')).toBe(true);

    // The reef ending flows straight on to the Paradise of Rosetta
    expect(core.state.room).toBe('rosetta');
    expect(core.flag('rescued')).toBeFalsy();
    let log = core.log.join('\n');
    expect(log).toContain('node: Mac Packwala, I presume?');
    expect(log).toContain('hook: ');
    expect(log).toContain('O V E R');
    expect(core.has('postcard')).toBe(true);

    // Rosetta customs: dishonest declarations bounce
    await act(h, 'walk', 'rope');
    expect(core.flag('disclosed')).toBeFalsy();
    await act(h, 'talk', 'node');
    expect(core.flag('rescued')).toBeFalsy();
    await act(h, 'use', 'disclosure', 'postcard', ['byme']);
    expect(core.flag('disclosed')).toBeFalsy();
    expect(core.log.join('\n')).toContain('Your agent signed it.');
    await act(h, 'use', 'disclosure', 'officer', ['spelling']);
    await act(h, 'use', 'disclosure', 'postcard', ['unread']);
    expect(core.flag('disclosed')).toBeFalsy();
    await act(h, 'use', 'disclosure', 'postcard', ['honest']);
    expect(core.flag('disclosed')).toBe(true);
    await act(h, 'look', 'stone');
    expect(core.flag('sawStone')).toBe(true);

    // The end
    await act(h, 'talk', 'node');
    expect(core.flag('rescued')).toBe(true);
    expect(core.flag('gameOver')).toBe(true);
    log = core.log.join('\n');
    expect(log).toContain('Article 50');
  });

  it('the disclosure stamp only works at customs', async () => {
    const h = setup('sitebuilder', ['disclosure', 'postcard']);
    const { core } = h;
    await core.goto('lighthouse');
    await act(h, 'use', 'disclosure', 'postcard');
    expect(core.flag('disclosed')).toBeFalsy();
  });

  it('every Act 3 hotspot responds to look without throwing', async () => {
    const h = setup('sitebuilder', [], { lhDoorOpen: true, hatchOpen: true, windowFixed: true, mcpServing: true, rosettaIntro: true, accessDenied: true });
    const { core } = h;
    for (const room of ['lighthouse', 'lamproom', 'reef', 'rosetta', 'harbour']) {
      await core.goto(room);
      for (const hs of core.visibleHotspots()) {
        await core.perform('look', { kind: 'hotspot', id: hs.id });
      }
    }
    expect(core.log.filter((l) => l.startsWith('> look')).length).toBeGreaterThan(30);
  });
});
