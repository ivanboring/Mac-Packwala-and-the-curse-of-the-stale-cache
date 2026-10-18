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
