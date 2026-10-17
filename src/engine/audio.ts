// Pre-rendered voice clips and looping music. Web Audio rather than <audio> elements, because
// iOS ignores the volume of media elements. Every clip is optional: a line without a clip is
// simply shown as text, and a game without public/audio/ is the silent game it always was.

/** The file name of a voice clip: a hash of who says it and exactly what they say. */
export function voiceKey(speaker: string, text: string): string {
  let h = 0x811c9dc5;
  const s = `${speaker}\u0000${text}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export interface AudioManifest { voices: string[]; music: string[] }

const FADE = 1.2;   // seconds, music crossfade between areas
const TAIL = 1;     // seconds, each loop fades down over its last second, then starts again
const DUCK = 0.55;  // music level while someone speaks

export class GameAudio {
  private ctx: AudioContext | null = null;
  private voiceGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private voices = new Set<string>();
  private tracks = new Set<string>();
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private voice: AudioBufferSourceNode | null = null;
  private music: { id: string; el: HTMLAudioElement; gain: GainNode; timer: ReturnType<typeof setInterval>; fading: boolean } | null = null;
  private wantedTrack: string | null = null;
  private speech = 0.9;
  private musicLevel = 0.5;

  constructor(private base = 'audio/') {
    fetch(`${base}manifest.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((m: AudioManifest | null) => {
        if (!m) return;
        this.voices = new Set(m.voices);
        this.tracks = new Set(m.music);
        if (this.wantedTrack) this.setMusic(this.wantedTrack, true);
      })
      .catch(() => { /* no audio shipped */ });
  }

  /** Browsers only allow sound after a user gesture: call this from pointer/key handlers. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.voiceGain = this.ctx.createGain();
      this.voiceGain.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.connect(this.ctx.destination);
      this.applyVolumes();
      if (this.wantedTrack) this.setMusic(this.wantedTrack, true);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  setVolumes(speech: number, music: number) {
    this.speech = speech;
    this.musicLevel = music;
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.ctx) return;
    this.voiceGain!.gain.value = this.speech;
    this.musicBus!.gain.setTargetAtTime(this.musicLevel * (this.voice ? DUCK : 1), this.ctx.currentTime, 0.1);
  }

  hasVoice(key: string) { return this.voices.has(key); }

  private load(path: string): Promise<AudioBuffer | null> {
    let b = this.buffers.get(path);
    if (!b) {
      b = fetch(this.base + path)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
        .then((data) => this.ctx!.decodeAudioData(data))
        .catch(() => null);
      this.buffers.set(path, b);
    }
    return b;
  }

  /** Starts a voice clip and resolves with its length in ms, or null if there is no clip to play.
   *  `wanted` is asked again once the clip has loaded, so a line skipped meanwhile stays silent. */
  async playVoice(key: string, wanted: () => boolean = () => true): Promise<number | null> {
    if (!this.voices.has(key) || !this.ctx || this.speech <= 0) return null;
    const buf = await this.load(`voice/${key}.mp3`);
    if (!buf || !wanted()) return null;
    this.stopVoice();
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.voiceGain!);
    src.onended = () => { if (this.voice === src) { this.voice = null; this.applyVolumes(); } };
    src.start();
    this.voice = src;
    this.applyVolumes();
    return buf.duration * 1000;
  }

  stopVoice() {
    if (!this.voice) return;
    const v = this.voice;
    this.voice = null;
    try { v.stop(); } catch { /* already ended */ }
    this.applyVolumes();
  }

  /** Crossfades to a looping track (null = silence). Unknown tracks keep the current one playing.
   *  Music streams through an <audio> element: decoding a four-minute track up front would
   *  take ~85 MB per track, too much for a phone. Its gain still goes through Web Audio. */
  setMusic(id: string | null, force = false) {
    if (id && !this.tracks.has(id)) { this.wantedTrack = id; return; }
    if (!force && this.music?.id === id) return;
    this.wantedTrack = id;
    if (!this.ctx) return;
    const ctx = this.ctx;
    if (this.music) {
      const old = this.music;
      old.gain.gain.setTargetAtTime(0, ctx.currentTime, FADE / 3);
      clearInterval(old.timer);
      setTimeout(() => { old.el.pause(); old.el.removeAttribute('src'); old.gain.disconnect(); }, FADE * 1500);
      this.music = null;
    }
    if (!id) return;
    const el = new Audio(`${this.base}music/${id}.mp3`);
    el.preload = 'auto';
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain);
    gain.connect(this.musicBus!);
    const track = { id, el, gain, timer: 0 as unknown as ReturnType<typeof setInterval>, fading: false };
    this.music = track;
    // fade down over the last second, then start again from the top
    track.timer = setInterval(() => {
      if (track.fading || !el.duration || el.currentTime < el.duration - TAIL) return;
      track.fading = true;
      gain.gain.setTargetAtTime(0, ctx.currentTime, TAIL / 4);
    }, 100);
    el.addEventListener('ended', () => {
      if (this.music !== track) return;
      track.fading = false;
      el.currentTime = 0;
      el.play().catch(() => {});
      gain.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
    });
    el.play().then(() => gain.gain.setTargetAtTime(1, ctx.currentTime, FADE / 3)).catch(() => {});
  }
}
