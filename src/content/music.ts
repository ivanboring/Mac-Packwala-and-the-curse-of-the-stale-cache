// Background music per area. The tracks in public/audio/music/ are Marcus's own pieces (originals in
// music/): island = calypso-1, rosetta = calypso-2, jungle = bombastic, tavern = shanty,
// graveyard = ghosty, dojo = dojo-music, fog = foggy_mysterious. The prompts are only used to compose
// a missing track with text-to-music (tools/audio/generate.ts --music).

export interface Track { prompt: string; seconds: number; rooms: string[] }

export const TRACKS: Record<string, Track> = {
  island: {
    prompt: 'Relaxed Caribbean island adventure theme for a 1990s point-and-click game. Ukulele, steel drum, light marimba, soft hand percussion, warm and a little cheeky. Seamless loop, instrumental.',
    seconds: 90,
    rooms: ['beach', 'square', 'harbour', 'bandstand', 'emporium', 'lookout', 'map'],
  },
  tavern: {
    prompt: 'Rowdy pirate tavern shanty, accordion and fiddle, stomping feet, clinking mugs, mid tempo, playful. Seamless loop, instrumental.',
    seconds: 75,
    rooms: ['tavern'],
  },
  jungle: {
    prompt: 'Mysterious jungle exploration music for a retro adventure game. Marimba, wooden flutes, bongos, gentle synth pads, curious and upbeat. Seamless loop, instrumental.',
    seconds: 90,
    rooms: ['keyhut', 'temple', 'mill', 'crossroads', 'waterfall', 'library'],
  },
  dojo: {
    prompt: 'Calm but tense martial arts dojo theme, koto and shakuhachi over a slow taiko pulse, focused and dignified with a wink of humour. Seamless loop, instrumental.',
    seconds: 60,
    rooms: ['dojo'],
  },
  graveyard: {
    prompt: 'Comedic spooky graveyard music, harpsichord and theremin, pizzicato strings, old 8-bit computer bleeps, more silly than scary. Seamless loop, instrumental.',
    seconds: 60,
    rooms: ['graveyard'],
  },
  fog: {
    prompt: 'Foggy lighthouse at sea, melancholic but hopeful, celesta and soft strings, distant fog horn, slow waves, a quiet heroic theme building. Seamless loop, instrumental.',
    seconds: 90,
    rooms: ['lighthouse', 'lamproom', 'reef'],
  },
  rosetta: {
    prompt: 'Triumphant sunny paradise finale for an adventure game, steel drums, brass, warm strings, joyful and celebratory, island festival feel. Seamless loop, instrumental.',
    seconds: 75,
    rooms: ['rosetta'],
  },
};

/** room id -> track id */
export const MUSIC: Record<string, string> = Object.fromEntries(
  Object.entries(TRACKS).flatMap(([id, t]) => t.rooms.map((r) => [r, id])),
);
