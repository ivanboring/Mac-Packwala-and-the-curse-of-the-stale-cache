# Mac Packwala and the Curse of the Stale Cache

A classic point-and-click adventure for [workflows-of-ai.com](https://workflows-of-ai.com/).
Mac Packwala, a Drupal site builder, is stranded on an island of stale CMSs and has to learn
the Drupal AI ecosystem to escape: providers, automators, agents, Tool API tools, an MCP client,
a Slack MCP server, and finally an MCP server with a geolocation tool so Captain Node can rescue him.

No external assets: all art, the font and the UI are drawn in code onto a 320×200 canvas.

**AI disclosure:** this game was vibe coded with AI. Its music and voices were generated with [ElevenLabs](https://elevenlabs.io/).

## Develop

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # engine tests + headless walkthrough of the whole game
npm run typecheck
```

Debug: open with `?debug` and press `d` to toggle walk areas and hotspot outlines.
`window.mz` exposes the running game in the console (`mz.core.state`, `mz.core.goto('square')`).

Preview art without a browser:

```bash
npx tsx tools/preview-room.ts square out.png '{"aiInstalled":true}' editor debug
npx tsx tools/preview-chars.ts chars.png mac,cron
```

## Build & deploy

```bash
npm run build        # outputs dist/
```

`dist/` is fully static, with relative paths, so it can live in any subfolder.
For example, upload it to `/island/` on the site. To embed it in a Drupal page:

```html
<iframe src="/island/index.html" title="Mac Packwala and the Curse of the Stale Cache"
        style="width:100%;aspect-ratio:16/10;border:0" allow="fullscreen"></iframe>
```

Saves use `localStorage` (autosave plus 3 slots) and the game works without it.

### Analytics (optional, web only)

Off by default. To count plays with Google Analytics, copy `env.example.json` to `public/env.json`
(git ignores it) and fill in your GA4 measurement id, then build. Or drop an `env.json` next to
`index.html` on the server; the game reads it at startup, so no rebuild is needed.

```json
{
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "operator": "Workflows of AI",
  "contact": "privacy@example.com",
  "dataRetentionMonths": 2
}
```

`operator` and `contact` go into the in-game privacy policy (contact can be an email address or a
URL; it defaults to the repo's issues page). Set `dataRetentionMonths` to match the retention you
choose in the GA admin (2 or 14).

- With no `env.json`, or an empty id, the game starts straight away and loads nothing from Google.
- With an id, the web version opens on a start page: a big "Accept the privacy policy and play"
  button (the policy is readable in the game), download buttons for the desktop app for players
  who don't want to be tracked, and a link to set it up with npm from this repo. Google's script
  only loads after the accept. Players can read the policy again and withdraw consent from
  menu, About, Privacy policy, which deletes the `_ga` cookies and returns to the start page.
- The desktop app never uses analytics: it doesn't read `env.json` (and doesn't package it).
- Events: `game_start`, `game_continue`, `room_enter`, `item_gained`, `role_granted`, `game_complete`,
  and `milestone` for how far players get. The milestones are the puzzle chain the rubber duck
  hints follow (`src/content/hints.ts`, 28 steps from `cron_awake` to `rescued`); each event has
  `milestone` (the id), `milestone_number` and `milestone_total`. To chart them, register
  `milestone` and `milestone_number` as custom dimensions in the GA admin, then build a funnel
  exploration on the `milestone` event, or a bar chart of users by `milestone_number`.
- Ad features are off (Google Signals, ad personalisation, ad storage), and the `_ga` cookies last
  13 months. In the GA admin, also accept the data-processing terms.

The menu's About page (web and desktop) has the version, the AI disclosure, the download links,
privacy, and the source code.

## Desktop app (Windows, macOS, Linux)

The same game in an Electron window (`electron/main.cjs`), packaged with electron-builder.

```bash
npm run app          # build and run it locally
npm run app:dist     # installers for this OS in release/
```

GitHub builds all three when you push a version tag, and attaches them to a GitHub Release
(`.github/workflows/desktop.yml`):

```bash
git tag v0.2.0 && git push origin v0.2.0
```

File names carry no version, so these links always point at the newest release:

- Windows: https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache/releases/latest/download/Mac-Packwala-windows-setup.exe
- Windows, no install: https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache/releases/latest/download/Mac-Packwala-windows-portable.exe
- macOS: https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache/releases/latest/download/Mac-Packwala-mac-universal.dmg
- Linux: https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache/releases/latest/download/Mac-Packwala-linux-x86_64.AppImage

The tag sets the version. The apps are not signed with an Apple or Microsoft certificate, so
Windows SmartScreen and macOS Gatekeeper warn on first launch; the release notes explain how to
open them. Each release carries `SHA256SUMS.txt` and a GitHub build-provenance attestation
(`gh attestation verify <file> --repo <owner>/<repo>`) so players can check a download came
from this workflow. Signing for real needs an Apple Developer ID and a Windows code-signing
certificate, added as secrets to the build job only.

On Linux the AppImage keeps Chromium's sandbox on. Only on systems that block unprivileged
user namespaces (Ubuntu 23.10+ without an AppArmor profile) does its launcher
(`electron/after-pack.cjs`) start it with `--no-sandbox`, since Electron won't start there otherwise.
`npx tsx tools/make-icon.ts` redraws the app icon (`build/icon.png`).

## Structure

- `src/engine/` — the engine. `core.ts` holds the game logic (verbs, roles, dialogue, duels) and is shared by the browser presenter (`game.ts`) and the headless test presenter (`headless.ts`). Also the pixel painter, font, walking/pathfinding, puppets and saves.
- `src/content/` — the game: rooms per act, characters, items, hints (the rubber duck), code review patches.
- `docs/DESIGN.md` — the puzzle chain, ids and flags.
