import { describe, expect, it } from 'vitest';
import { act, go, newGame } from './helpers';

type H = ReturnType<typeof newGame>;

/** Beach intro: puzzles 1-6 (sail, duck, crate, seaweed, bottle, Cron, cookie guard). */
async function beachAndLookout(h: H) {
  const { core } = h;
  await core.goto('beach');
  await act(h, 'pull', 'sail');
  await act(h, 'pickup', 'duck');
  await act(h, 'pickup', 'plank');
  await act(h, 'use', 'plank', 'crate');
  await act(h, 'pickup', 'seaweed');
  await act(h, 'pickup', 'bottle');
  await act(h, 'open', 'bottle');
  // 5. Old Cron
  await go(h, 'cliffpath');
  expect(core.state.room).toBe('lookout');
  await act(h, 'use', 'f5key', 'cron', ['bye']);
  expect(core.flag('cronAwake')).toBe(true);
  await go(h, 'downpath');
  expect(core.state.room).toBe('beach');
  // 6. cookie guard
  await go(h, 'townpath', ['accept']);
  await act(h, 'use', 'f5key', 'guard');
  expect(core.flag('cookiesDone')).toBe(true);
  await go(h, 'townpath');
  expect(core.state.room).toBe('square');
}

/** Puzzles 7-17: anonymous -> authenticated -> editor. */
async function town(h: H) {
  const { core } = h;
  // 7. Maintainer, admin/admin
  await act(h, 'talk', 'maintainer', undefined, ['back', 'admin', 'bye']);
  // tavern and emporium are closed to anonymous users
  await go(h, 'tavern');
  expect(core.state.room).toBe('square');
  await go(h, 'emporium');
  expect(core.state.room).toBe('square');
  // jungle gate needs drupal/ai
  await go(h, 'gate');
  expect(core.state.room).toBe('square');

  // 8. registration: twice
  await go(h, 'alley');
  expect(core.state.room).toBe('harbour');
  await act(h, 'talk', 'formsworth', undefined, ['register', 'u2', 'e3', 'p2', 'bye']);
  expect(core.flag('regSent')).toBeFalsy();
  expect(core.flag('regPass')).toBe(1);
  // a wrong answer restarts the form without progress
  await act(h, 'talk', 'formsworth', undefined, ['register', 'u1', 'bye']);
  expect(core.flag('regSent')).toBeFalsy();
  await act(h, 'talk', 'formsworth', undefined, ['register', 'u2', 'e3', 'p3', 'bye']);
  expect(core.flag('regSent')).toBe(true);

  // 9. the verification bottle on the beach
  await go(h, 'townpath');
  await go(h, 'beachpath');
  expect(core.state.room).toBe('beach');
  await act(h, 'pickup', 'bottle2');
  expect(core.has('verifylink')).toBe(true);
  await go(h, 'townpath');
  await go(h, 'alley');
  await act(h, 'give', 'verifylink', 'formsworth');
  expect(core.state.role).toBe('authenticated');

  // 11. token request form (can't be submitted)
  await act(h, 'talk', 'formsworth', undefined, ['tokens', 'bye']);
  expect(core.has('tokenform')).toBe(true);
  await act(h, 'give', 'tokenform', 'formsworth');
  expect(core.has('tokens')).toBe(false);

  // 10. the Three Trials
  await go(h, 'townpath');
  await act(h, 'talk', 'maintainer');
  expect(core.flag('trialsGiven')).toBe(true);

  // 12/13/15. tavern
  await go(h, 'tavern');
  expect(core.state.room).toBe('tavern');
  await act(h, 'talk', 'hook', undefined, ['name', 'alter', 'bye']);
  await act(h, 'give', 'weight', 'hook');
  expect(core.flag('hookWeighted')).toBe(true);
  expect(core.has('tokenform2')).toBe(true);
  expect(core.has('tokenform')).toBe(false);
  await act(h, 'pickup', 'coaster');
  expect(core.has('gitignore')).toBe(true);
  await act(h, 'pickup', 'crackers');
  await act(h, 'pickup', 'herring');
  expect(core.has('herring')).toBe(true);
  await go(h, 'exit');
  expect(core.state.room).toBe('square');

  // 12b. tokens
  await go(h, 'alley');
  await act(h, 'give', 'tokenform2', 'formsworth');
  expect(core.has('tokens')).toBe(true);
  expect(core.flag('tokenCount')).toBe(10);
  expect(core.flag('tokensGranted')).toBe(true);
  await go(h, 'townpath');

  // 14. Wordy
  await go(h, 'emporium');
  expect(core.state.room).toBe('emporium');
  await act(h, 'talk', 'wordy', undefined, ['plugin', 'composer', 'bye']);
  expect(core.has('composerjson')).toBe(true);
  expect(core.flag('tokenCount')).toBe(9);
  await act(h, 'pickup', 'basket');
  expect(core.has('popup')).toBe(true);
  // no ckeditor for mere authenticated users
  await act(h, 'talk', 'wordy', undefined, ['bye']);
  expect(core.has('ckeditor')).toBe(false);
  await go(h, 'exit');
  expect(core.state.room).toBe('square');

  // 16. bandstand
  await go(h, 'bandstandpath');
  expect(core.state.room).toBe('bandstand');
  await act(h, 'give', 'composerjson', 'composer');
  expect(core.flag('aiInstalled')).toBeFalsy(); // the cat is still on the keys
  expect(core.has('composerjson')).toBe(true);
  await act(h, 'use', 'herring', 'cat');
  expect(core.flag('catGone')).toBe(true);
  expect(core.hotspot('cat')!.when!(core)).toBe(false);
  await act(h, 'give', 'composerjson', 'composer');
  expect(core.flag('aiInstalled')).toBe(true);
  expect(core.has('composerjson')).toBe(false);
  await go(h, 'exit');
  expect(core.state.room).toBe('square');

  // 17. editor
  await act(h, 'talk', 'maintainer');
  expect(core.state.role).toBe('editor');
}

describe('act 1', () => {
  it('plays puzzles 1-17: anonymous to editor, jungle gate opens', async () => {
    const h = newGame();
    const { core } = h;
    await beachAndLookout(h);
    await town(h);
    await go(h, 'gate');
    expect(core.state.room).toBe('map');
  });

  it('editor extras: batteries for the popup, ckeditor fixes the sign, ladder', async () => {
    const h = newGame();
    const { core } = h;
    await beachAndLookout(h);
    await town(h);
    await go(h, 'emporium');
    await act(h, 'talk', 'wordy', undefined, ['batteries', 'writing', 'bye']);
    expect(core.has('batteries')).toBe(true);
    expect(core.has('popup')).toBe(false);
    expect(core.has('ckeditor')).toBe(true);
    await go(h, 'exit');
    await act(h, 'give', 'ckeditor', 'painter');
    expect(core.flag('signFixed')).toBe(true);
    expect(core.has('ladder')).toBe(true);
    expect(core.hotspot('ladder')!.when!(core)).toBe(false);
  });

  it('later acts: site builder, MCP server, star log and permissions', async () => {
    const h = newGame();
    const { core } = h;
    await core.goto('square');
    core.state.role = 'editor';
    core.state.flags.trialsGiven = true;
    core.state.flags.aiInstalled = true;
    // not yet: trials unfinished
    await act(h, 'talk', 'maintainer', undefined, ['bye']);
    expect(core.state.role).toBe('editor');
    core.state.flags.providerReady = true;
    core.state.flags.automatorDone = true;
    core.state.flags.masterBeaten = true;
    await act(h, 'talk', 'maintainer');
    expect(core.state.role).toBe('sitebuilder');
    expect(core.has('blankcard')).toBe(true);
    expect(core.flag('fogTwist')).toBe(true);

    // Captain Node replied: the MCP server relic
    core.state.flags.nodeContacted = true;
    await act(h, 'talk', 'maintainer');
    expect(core.has('mcpserver')).toBe(true);
    expect(core.flag('mcpServerGiven')).toBe(true);

    // Cron's star log -> coordinates
    core.state.inv.push('f5key');
    core.state.flags.cronAwake = true;
    await core.goto('lookout');
    await act(h, 'use', 'f5key', 'cron');
    expect(core.has('starlog')).toBe(true);
    await act(h, 'use', 'starlog');
    expect(core.has('starlog')).toBe(true); // needs the geo clue first
    core.state.flags.geoClue = true;
    await act(h, 'use', 'starlog');
    expect(core.has('starlog')).toBe(false);
    expect(core.has('coords')).toBe(true);

    // permissions form
    await core.goto('harbour');
    core.state.flags.accessDenied = true;
    core.state.flags.spamFixed = true; // the spam puzzle itself is covered in act3.test.ts
    await act(h, 'talk', 'formsworth', undefined, ['perm', 'bye']);
    expect(core.has('permform')).toBe(true);
    core.state.inv.push('tool_search');
    await act(h, 'use', 'permform', 'tool_search');
    expect(core.has('permform2')).toBe(true);
    expect(core.has('permform')).toBe(false);
  });

  it('every Act 1 room has at least 8 hotspots and a way out', async () => {
    const h = newGame();
    const { core } = h;
    for (const id of ['beach', 'lookout', 'square', 'harbour', 'tavern', 'emporium', 'bandstand']) {
      await core.goto(id);
      const hs = core.room.hotspots;
      expect(hs.length, id).toBeGreaterThanOrEqual(8);
      expect(hs.some((x) => x.exit), id).toBe(true);
    }
  });
});
