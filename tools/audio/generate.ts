// Pre-renders voice clips (Eleven v3, with audio tags) and missing music tracks with ElevenLabs,
// into public/audio/, then rewrites public/audio/manifest.json. Already-rendered files are skipped,
// so it can be run again and again, a budget at a time.
//
//   npx tsx tools/audio/generate.ts                      dry run: what would be rendered, and the cost
//   ELEVENLABS_API_KEY=... npx tsx tools/audio/generate.ts --go --budget 20000
//   ... --only maintainer,node                           just these speakers
//   ... --except mac                                     everyone but these
//   ... --music                                          also compose missing tracks from src/content/music.ts
//   npx tsx tools/audio/generate.ts --manifest           only rebuild the manifest (after adding files by hand)
//   npx tsx tools/audio/generate.ts --prune              delete clips of lines that are no longer in the game
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { collectLines, type Line } from './lines';
import { VOICES } from '../../src/content/voices';
import { TRACKS } from '../../src/content/music';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, 'public/audio');
const VOICE_DIR = join(OUT, 'voice');
const MUSIC_DIR = join(OUT, 'music');
const API = 'https://api.elevenlabs.io/v1';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };

// ---- direction: Eleven v3 audio tags --------------------------------------------------------
/** A standing direction per character, put in front of every line they say. */
const STYLE: Record<string, string> = {
  speakotron: '[robotic] [monotone]',
  idols: '[booming] [slowly]',
  ollama: '[sleepy] [slowly]',
  ghostblink: '[whispers]',
  ghostgeo: '[excited]',
  ghostflash: '[cheerfully]',
  cron: '[sleepy]',
  master: '[calm]',
  officer: '[formal]',
  modelia: '[warmly]',
  nell: '[warmly]',
};

/** Screen text -> what the voice model reads: stage directions become tags, emoticons go. */
export function direct(speaker: string, text: string): string {
  let t = text
    .replace(/\*([a-z][a-z ,'-]*)\*/gi, (_, w: string) => `[${w.toLowerCase()}]`)   // *sniff* -> [sniff]
    .replace(/\((?:o_o|O_O|\^_\^)\)|:-?[()DP]|~\*~|\*~\*/g, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/:[a-z_]+:/g, '')                                                       // Slack's :tada:
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (speaker === 'ghostgeo') t = t.toLowerCase();   // sPoNgEbOb CaSe confuses the reader
  const style = STYLE[speaker];
  return style ? `${style} ${t}` : t;
}

/** Lines to voice first: the story, then Mac's side of conversations, then his look/use comments. */
function priority(l: Line) {
  if (l.speaker !== 'mac') return 0;
  return l.kind === 'comment' ? 2 : 1;
}

/** Then in story order, so a budget that runs out leaves the end silent, not the start. */
function act(l: Line) {
  const m = /act(\d)/.exec(l.where);
  if (m) return Number(m[1]);
  if (l.kind === 'duel') return 2;
  return l.where.includes('hints.ts') ? 3 : 1;
}

// ---- API ------------------------------------------------------------------------------------
async function post(path: string, body: unknown, attempt = 0): Promise<Buffer> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('Set ELEVENLABS_API_KEY first.');
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify(body),
  });
  if ((r.status === 429 || r.status === 409) && attempt < 6) { await new Promise((res) => setTimeout(res, 2000 * (attempt + 1))); return post(path, body, attempt + 1); }
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

const tts = (voice: string, text: string) => post(`/text-to-speech/${voice}?output_format=mp3_44100_128`, {
  text, model_id: 'eleven_v3', voice_settings: { stability: 0.5, similarity_boost: 0.75 },
});

async function renderLine(l: Line) {
  const voice = VOICES[l.speaker];
  const text = direct(l.speaker, l.text);
  const out = join(VOICE_DIR, `${l.key}.mp3`);
  if (!Array.isArray(voice)) { writeFileSync(out, await tts(voice, text)); return; }
  // several voices in unison (the Cloud Idols): render each, then mix
  const parts = await Promise.all(voice.map(async (v, i) => {
    const p = join(VOICE_DIR, `${l.key}.part${i}.mp3`);
    writeFileSync(p, await tts(v, text));
    return p;
  }));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...parts.flatMap((p) => ['-i', p]),
    '-filter_complex', `amix=inputs=${parts.length}:duration=longest:normalize=0,volume=0.8`, '-b:a', '128k', out]);
  for (const p of parts) rmSync(p);
}

function writeManifest() {
  const list = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => /^[\w-]+\.mp3$/.test(f)).map((f) => f.slice(0, -4)) : []);
  const manifest = { voices: list(VOICE_DIR), music: list(MUSIC_DIR) };
  writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest));
  console.log(`manifest: ${manifest.voices.length} voice clips, music: ${manifest.music.join(', ') || 'none'}`);
}

async function main() {
  mkdirSync(VOICE_DIR, { recursive: true });
  mkdirSync(MUSIC_DIR, { recursive: true });
  if (flag('manifest')) return writeManifest();

  const only = opt('only')?.split(',');
  const except = opt('except')?.split(',') ?? [];
  const budget = Number(opt('budget') ?? Infinity);
  const { lines } = collectLines();
  if (flag('prune')) {
    const keep = new Set(lines.map((l) => l.key));
    const gone = readdirSync(VOICE_DIR).filter((f) => /^[0-9a-f]{8}\.mp3$/.test(f) && !keep.has(f.slice(0, 8)));
    for (const f of gone) rmSync(join(VOICE_DIR, f));
    console.log(`pruned ${gone.length} clips of lines no longer in the game`);
    return writeManifest();
  }
  const todo = lines
    .filter((l) => VOICES[l.speaker] && /[A-Za-z]/.test(direct(l.speaker, l.text).replace(/\[[^\]]*\]/g, '')) && (!only || only.includes(l.speaker)) && !except.includes(l.speaker) && !existsSync(join(VOICE_DIR, `${l.key}.mp3`)))
    .sort((a, b) => priority(a) - priority(b) || act(a) - act(b));
  const noVoice = [...new Set(lines.filter((l) => !VOICES[l.speaker]).map((l) => l.speaker))];

  let chars = 0;
  const batch: Line[] = [];
  for (const l of todo) {
    const cost = direct(l.speaker, l.text).length * (Array.isArray(VOICES[l.speaker]) ? VOICES[l.speaker].length : 1);
    if (chars + cost > budget) break;
    chars += cost;
    batch.push(l);
  }
  const missingTracks = Object.entries(TRACKS).filter(([id]) => !existsSync(join(MUSIC_DIR, `${id}.mp3`)));
  console.log(`${todo.length} voice lines still to render; this run: ${batch.length} lines, about ${chars} characters (credits).`);
  if (noVoice.length) console.log(`No voice yet (stay silent): ${noVoice.join(', ')}`);
  if (flag('music')) console.log(`Music to compose: ${missingTracks.map(([id, t]) => `${id} (${t.seconds}s)`).join(', ') || 'none'}`);
  if (!flag('go')) { console.log('Dry run. Add --go to render.'); return; }

  let done = 0, failed = 0;
  const queue = [...batch];
  await Promise.all(Array.from({ length: 3 }, async () => {
    for (let l = queue.shift(); l; l = queue.shift()) {
      try { await renderLine(l); done++; } catch (e) { failed++; console.error(`\n${l.speaker}: "${l.text}" -> ${(e as Error).message}`); }
      process.stdout.write(`\r${done}/${batch.length} rendered${failed ? `, ${failed} failed` : ''}`);
    }
  }));
  console.log();

  if (flag('music')) for (const [id, t] of missingTracks) {
    console.log(`composing ${id}...`);
    writeFileSync(join(MUSIC_DIR, `${id}.mp3`), await post('/music?output_format=mp3_44100_128', {
      prompt: t.prompt, music_length_ms: t.seconds * 1000, model_id: 'music_v1', force_instrumental: true,
    }));
  }
  writeManifest();
}

main().catch((e) => { console.error(e.message); process.exit(1); });
