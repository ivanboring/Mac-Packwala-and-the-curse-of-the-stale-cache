# Mac Packwala and the Curse of the Stale Cache

A LucasArts-style point-and-click adventure for [workflows-of-ai.com](https://workflows-of-ai.com/).
Mac Packwala, a Drupal site builder, is stranded on an island of stale CMSs and has to learn
the Drupal AI ecosystem to escape: providers, automators, agents, Tool API tools, an MCP client,
a Slack MCP server, and finally an MCP server with a geolocation tool so Captain Node can rescue him.

No external assets: all art, the font and the UI are drawn in code onto a 320×200 canvas.

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

## Structure

- `src/engine/` — the engine. `core.ts` holds the game logic (verbs, roles, dialogue, duels) and is shared by the browser presenter (`game.ts`) and the headless test presenter (`headless.ts`). Also the pixel painter, font, walking/pathfinding, puppets and saves.
- `src/content/` — the game: rooms per act, characters, items, hints (the rubber duck), code review patches.
- `docs/DESIGN.md` — the puzzle chain, ids and flags.

## Voices (later)

Dialogue is text-only for now. Every line is spoken through `say`/`sayAs` with a speaker id, so a
later build step can extract `{speaker, text}` pairs, pre-render them with ElevenLabs, and have
the presenter play the clip whenever the player has collected the Text-to-Speech tool.
