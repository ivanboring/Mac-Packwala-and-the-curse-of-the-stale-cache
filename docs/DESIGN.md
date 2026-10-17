# Mac Packwala and the Curse of the Stale Cache — design contract

This file is the source of truth for room ids, item ids, characters, flags and
the puzzle chain. Content files must use these ids.

## Tone
LucasArts doofy. Universal jokes first (bureaucracy, cookie banners, READMEs,
F5, rubber ducks, hit counters, @mentions, popups), Drupal jokes as the second
layer. Every Drupal thing's "Look at" explains in plain English what it really
is. No deaths, no dead ends. Text only until the AI module is installed; then the Grand Maintainer demonstrates text-to-speech and text-to-music, and the game has ElevenLabs voices and music (pre-rendered, `npm run audio`).

## Roles
anonymous → authenticated (Formsworth registration) → editor (after Composer
installs drupal/ai) → sitebuilder (after the three trials). Gate with
`roles: { verb: 'role' }` on hotspots/items.

## Rooms
| id | name | act | notes |
|---|---|---|---|
| beach | Shipwreck Beach | 1 | start; exits: lookout (left path), square (right, Cookie guard) |
| lookout | Old Cron's Lookout | 1 | Cron, telescope |
| square | Legacy Town Square (480 wide) | 1 | Maintainer, sign painter, doors: tavern, emporium; paths: harbour, bandstand, beach; jungle gate → map |
| harbour | The Harbour | 1 | Formsworth's booth (outdoor window), half-built ship "The Inevitable Rewrite" |
| tavern | The Deprecated Function (tavern) | 1 | authenticated+ to enter; Hook_alter, bartender, red herring barrel, OAuth crackers |
| emporium | Wordy's Plugin Emporium | 1 | authenticated+ to enter; Wordy |
| bandstand | The Bandstand | 1 | Composer, Dependency Cat on piano |
| map | Island Map | 2 | noMac; location hotspots |
| keyhut | The Key Keeper's Hut | 2 | Key Keeper, vault |
| temple | Temple of Providers | 2 | cloud idols, Ollama the llama, Promptington, rate-limit slot, stained-glass context window |
| mill | Automator Mill | 2 | Fieldsworth, the Automator machine, field of empty product boxes |
| library | Library of Unindexed Knowledge | 2 | Librarian |
| graveyard | Graveyard of Dead Web Tech | 2 | ghosts: flash, blink, geocities (hit counter tombstone), speakotron |
| crossroads | Code Review Crossroads | 2 | rotating pirate reviewer; pine tree (pinecone) |
| waterfall | The Waterfall | 2 | "Nobody uses the Waterfall anymore"; cave → dojo |
| dojo | Dojo of the Code Review Master | 2 | Master Rebase |
| lighthouse | Lighthouse | 3 | Modelia Contexta; hatch to lamproom (needs ladder) |
| lamproom | Lamp Room | 3 | MCP Client lamp, broken context window |
| reef | Slack Reef | 3 | Slackbot the parrot; airship departure |
| rosetta | The Paradise of Rosetta | 3 | final room (airship only, no map entry): customs, Rosetta Stone |

## Characters (ids)
mac, cron, guard, maintainer, painter, formsworth, hook, bartender, wordy,
composer, cat, keykeeper, ollama, promptington, fieldsworth, librarian,
ghostflash, ghostgeo, ghostblink, speakotron, nell, bob, larry, master,
modelia, slackbot, node (Captain Node), crab, officer (Officer Fiftie, Rosetta customs),
xena, chuck, toby (the Island Security Team: Captain Xena Filter, Chuck Plain, Toby Token)

## Items (ids)  — `tool: true` = Tool API Belt card
Act 1: duck, plank, bottle, readme, f5key, weight, atshell, verifylink,
tokenform, tokenform2 (altered), tokens (count in flag `tokenCount`),
composerjson, popup, herring, crackers, gitignore
Act 2: apikey, keyentity, provider, explorer, prompt (tested prompt card),
pinecone, translate, batteries, ckeditor, ladder, agents, blankcard,
metering (AI Metering), decision (Decision Model)
Tools: tool_search, tool_create, tool_translate, tool_tts, tool_geo
Act 3: window (stained glass context window), mcpserver, starlog, coords,
permform, permform2 (checked), eca (ECA rule card), guardrails,
disclosure (AI Disclosure stamp), postcard

## Puzzle chain
### Act 1 — Anonymous on the beach
1. Intro: Mac under a sail. PULL sail (any other verb: muffled hint).
2. Bottle in the surf → open → README.txt ("Nobody reads this").
3. Rubber duck in the sand → hint system (Talk to duck).
   Once Slack is connected, the lamp can also switch to **#ai-contrib**, where the people who build Drupal AI (Nell, Modelia, Promptington, Cron, the Maintainer, Formsworth) give a direct tip for the current step: stronger than the duck (`aiContribHelp` in `hints.ts`).
4. Plank + nailed crate → f5key, weight. Seaweed → atshell.
5. Old Cron asleep (poor man's cron: only runs when someone visits) → use f5key → legend of the Fog, Captain Node, sends Mac to town.
6. Cookie Consent guard blocks the town path. "Accept all" → he freezes "loading 847 partners" → use f5key on him; or "Manage preferences" → page through silly toggles → hidden "Reject all" on last page. Either way: flag `cookiesDone`.
7. Grand Maintainer (square), sign "Under maintenance"; look under sign: admin/admin → "stopped working in 2009. Register at the harbour."
8. Formsworth registration: every answer must start with `#`. First complete pass → "Your form has been rebuilt. Please fill it in again." Second → verification email "sent to your inbox" = new bottle on the beach (`regSent`).
9. Beach bottle → verifylink → give to Formsworth → **authenticated**.
10. Maintainer (authenticated) sets the Three Trials; "Trials are for Editors."
11. Formsworth gives tokenform (Purpose field required but missing → always fails).
12. Tavern: Captain Hook_alter alters forms but his hook runs first and gets overridden; give weight (module weight) → he alters tokenform → tokenform2 → Formsworth → tokens (10).
13. Bartender ignores everything (he's a .gitignore); his coaster is a .gitignore — pick it up, he ignores that too.
14. Wordy: buy composerjson (1 token). Free sample: popup.
15. Herring barrel ("Red herrings — not useful, honest") → herring.
16. Composer can't play: Dependency Cat (cat ^2, needs ^3) on the keys. Give/use herring on cat → cat leaves. Give composerjson → `composer require drupal/ai` → `aiInstalled`, jungle gate opens. Back at the Maintainer (Editor promotion) he explains text-to-speech, his voice cuts in mid-word (`voicesOn`), then text-to-music starts the area music (`musicOn`).
17. Maintainer → **editor**. Chapter card: Part II.

### Act 2 — Editor: the Three Trials
Trial PROVIDE
18. Temple: Promptington can't get answers. Cloud idols need a key; Ollama the llama is local, needs no key, but is very slow (gag). Insert tokens in rate-limit slot → apikey.
19. Key Keeper refuses secrets unless you won't commit them: show gitignore → vault. Use apikey on vault → keyentity.
20. Use keyentity on cloud idol → provider (`providerReady`, trial 1 ✔).
21. Give readme to Promptington (nobody reads READMEs, LLMs do) → explorer (AI Explorer).
Trial AUTOMATE
22. Mill: Fieldsworth has 10,000 products with empty descriptions. Automator machine needs provider (hopper) + a prompt.
23. Use explorer → test a prompt; first run spews "Delve into this rich tapestry of synergy"; use explorer again (dialogue: pick the good prompt) → prompt card; use prompt on machine, pull lever (save) → descriptions written → tool_create, trial 2 ✔.
23b. **AI Metering**: the Automator's bill (4.2M tokens) suspends the provider (`providerSuspended`). Key Keeper option `meter` → metering. Use metering on idols: quota (`unlimited`/`one` rejected, `daily` ok) + over-budget action (`ollama` local fallback or `block`) → `meteringOn`.
Trial AGENTS
24. Crossroads: rotating reviewer pirates (nell, bob = Bianca, larry = Lenny); talk → code review (`src/engine/codeReview.ts`, patches in `src/content/reviews.ts`). Each reviewer shows their patches, one real bug each (Lenny: |raw XSS, API key in code, AI-written PR description; Bianca: missing access check, an AI call per item on page load; Nell: SQL injection, missing cache tags, an agent with every tool). Mac can only write the right comment for a bug once a reviewer has explained it (`bug:<id>` flags), so you learn by missing. Decoys are bikeshedding, rubber stamps and nits. A clean review reveals the Master is "behind the Waterfall" (`knowsDojo`).
25. Waterfall: Mac refuses the Waterfall ("we're agile now") until knowsDojo; then walk in → dojo.
26. Beat Master Rebase: five patches written by AI agents (four random bugs in disguise, then the stale cache from 2009, the curse of the title), one miss allowed. Then Mac describes his pull request in his own words; the agent-written description is rejected ("Your words. Your name. Your responsibility."). → agents (AI Agents scroll), trial 3 ✔.
27. Maintainer → **sitebuilder**; gives blankcard (Tool API starter card) and reveals the Fog twist: only the Lighthouse reaches past it.
Ecosystem side quests (any order, editor)
28. Pine tree at crossroads → pinecone. Librarian: give pinecone (vector DB) + use provider (embeddings) → AI Search (Search API index, RAG for agents) → tool_search.
28b. **FlowDrop + LLM vs Decision Models**: Librarian wants new books sorted, with himself as human in the loop. Use `flowboard` → 5-slot node builder (trigger, shelf, summary, review, index; joke nodes social/seagull). LLM on the shelf node writes essays → `needDecision`. Promptington option `decide` → decision (Decision Model). Rebuild with decision → `flowBuilt`; he gives translate (AI Translate) → tool_translate.
29. Graveyard: use translate on GeoCities ghost → hit counter tombstone holds the coordinates, but the counter was faked; "Cron logs everything".
30. Speak-o-Tron needs batteries: Wordy trades batteries for the popup. → tool_tts (text-to-speech as a tool agents and rules can call; gag: its own new voice pack is still in code review).
31. Wordy gives ckeditor (AI CKEditor) free to Editors. Give to sign painter → fixes "Welcom to Legasy Town" → ladder.

### Act 3 — Site Builder: MCP
32. Lighthouse door needs sitebuilder. Modelia: lamp = MCP Client. Stairs deprecated: use ladder on hatch.
33. Lamp's context window is broken: take the stained-glass window from the temple (sitebuilder) → fit it → MCP Client works. Use lamp → servers: Weather MCP (fog), Pizza MCP (400 pizzas, can't deliver: no coordinates), Slack MCP (offline).
34. Reef: Slackbot only answers @mentions → use atshell. "Polly wants an OAuth cracker" → crackers → `slackConnected`.
34b. **Kristen's Context Control Center**: first Slack call, Mac's agent writes mush to "Captain Noodle" → `needContext`. Modelia option `context`; use `cabinet` → create context items (who/where/glossary/tone; manual and pizza are distractors), Modelia approves, subscribe to the agent → `contextReady`.
35. Lamp → Slack → Captain Node: "Send coordinates. I'm an agent; I only take them via a tool call from an MCP server." She mentions the Paradise of Rosetta.
36. Maintainer → mcpserver relic.
37. Old Cron again (f5key): runs his star-sighting job → starlog, plus the eca rule card (ECA: when / if / then). Combine starlog + (hit counter clue flag) → coords. Combine coords + blankcard → tool_geo.
38. Use tool_geo on mcpserver; use mcpserver on lamp → `mcpServing`. Captain Node: Access denied — she's anonymous on your server, like you were.
38b. **AI Validations**: Formsworth is buried in seagull contact-form spam (`spamSeen`). Use provider on `spam` → LLM essay, validator chokes. Use decision on `spam` → TRUE/FALSE → `spamFixed`.
39. Formsworth gives permform (3,000 checkboxes) + disclosure (AI Disclosure stamp, for Rosetta customs). Use tool_search on permform → permform2. Use permform2 on lamp/mcpserver → permission granted.
39b. **Guardrails**: the next call is prompt-injected by Captain Hook_alter → `hookInjected`. Pick up `railing` → guardrails; use on lamp → pre-generation (regexp, topic) + post-generation (roles, keys) → `guardrailsOn`. Next call: 200 OK, but Captain Node can't find the dock in fog → `needBeacon`.
39c. **The Exfiltrawler (AI output is untrusted input)**: next Slack call after `needBeacon` → "Captain N0de" posts a "reef chart" and asks the agent to show the picture; Mac reaches for "Display AI output as: Full HTML". The Island Security Team (Captain Xena Filter, Chuck Plain, Toby Token) bursts in through the hatch and stops him: the agent's markdown image URL carries Mac's key and session to Captain Hook's data trawler, the Exfiltrawler, and the browser would fetch it with no click (`trawlerSeen`). Security review, one question each, wrong answers get a kind retry: escape/filter AI output like user input (Twig autoescape, no |raw, restricted text format) → Content Security Policy (images only from trusted hosts) → secrets stay in the Key module, never in prompts → `trawlerGone`, `securityReviewed`. The ECA beacon is gated on `securityReviewed`. The team cameos in the reef ending.
40. **AI ECA Integration**: use eca on panel → event `slackmsg`, condition `approaching`, action `tts` (needs tool_tts) → `ecaBeacon`, `rescueComing`. Reef: fog horn guides the airship; cameos; departure → `leftIsland` → room `rosetta`.
41. **Paradise of Rosetta**: Mac gets a postcard his agent wrote. Use disclosure on postcard → `honest` ("AI-generated, reviewed by me") → `disclosed`. Rosetta Stone: one capability described once for humans (EN), agents (JSON Schema) and other systems (MCP). Talk to Captain Node → end cards, `rescued`, title.

## Key flags
sailOff, crateOpen, cronAwake, cookiesDone, cookieLoading, regPass (0/1/2), regSent,
trialsGiven, tokensGranted, hookWeighted, catGone, aiInstalled, voicesOn, musicOn, gitignoreShown,
vaultOpen, providerReady, explorerGiven, promptGood, automatorDone, duelsWon, knowsDojo,
masterBeaten, searchReady, geoClue, ttsOn, signFixed, fogTwist, hatchOpen, windowFixed,
slackMentioned, slackConnected, nodeContacted, mcpServerGiven, toolRegistered, mcpServing,
permGranted, rescued.
Added with the ecosystem update: providerSuspended, meteringOn, meteringRoute, needDecision,
flowBuilt, needContext, knowsCCC, contextReady, spamSeen, triedLlmValidation, spamFixed,
hookInjected, guardrailsOn, needBeacon, trawlerSeen, trawlerLeaveAt, trawlerGone, securityReviewed, ecaBeacon, leftIsland, rosettaIntro, disclosed,
sawStone, rosettaFinale
