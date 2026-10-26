/**
 * Opt-in ambient music. Never starts without a guest's tap.
 * With `music.src` set, a local recording loops; otherwise a small Web Audio
 * ensemble is synthesised on the device: a tanpura drone (Pa–Sa–Sa–Sa) and a
 * reed voice playing slow Raag Bhupali phrases (Sa Re Ga Pa Dha), through a soft reverb.
 * `setChapter()` cross-fades a mood per story chapter: a festive tabla for the
 * celebrations, wind-chime bells for wishes, a brighter tone for the sunrise.
 */

export interface Player {
  play(): Promise<void>;
  stop(): void;
  /** Cross-fade to a chapter's mood (a section id); unknown ids keep the current mood. */
  setChapter(chapter: string): void;
  readonly playing: boolean;
}

/** melody/pulse/chimes: layer levels; tone: master low-pass (Hz); wet: reverb send. */
interface Mood { melody: number; pulse: number; chimes: number; tone: number; wet: number }
const MOODS: Record<string, Mood> = {
  welcome: { melody: 1, pulse: 0, chimes: 0, tone: 9000, wet: .38 },
  journey: { melody: 1, pulse: 0, chimes: .45, tone: 9000, wet: .4 },
  invitation: { melody: .55, pulse: 0, chimes: .8, tone: 2600, wet: .58 },
  celebrations: { melody: 1, pulse: 1, chimes: .25, tone: 9000, wet: .32 },
  venue: { melody: .85, pulse: .4, chimes: .2, tone: 6000, wet: .42 },
  wishes: { melody: .7, pulse: 0, chimes: 1, tone: 7000, wet: .5 },
  closing: { melody: 1, pulse: 0, chimes: .55, tone: 16000, wet: .46 },
};
const MOOD_FADE = .55; // time constant (s): a chapter change settles in ~1.5s

const SA = 261.63; // C4
const hz = (semitones: number) => SA * 2 ** (semitones / 12);

// [semitones from Sa, beats, glide-into-note]
type Note = [number, number, boolean?];
const PHRASES: Note[][] = [
  [[4, 1.2], [2, 0.6], [0, 1.4], [-3, 1.8, true]],
  [[0, 0.8], [2, 0.8], [4, 1.6], [7, 1.2], [4, 0.8], [2, 2.2, true]],
  [[7, 1], [9, 1], [12, 2.2, true], [9, 0.8], [7, 1.2], [4, 1.6]],
  [[4, 0.8], [7, 0.8], [9, 1.4], [7, 0.8], [4, 0.8], [2, 1], [0, 2.6, true]],
];
const BEAT = 0.62;

function impulse(ctx: AudioContext, seconds = 2.8) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  return buf;
}

function synthPlayer(): Player {
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let bus: GainNode;
  let wet: GainNode;
  let tone: BiquadFilterNode;
  let melodyBus: GainNode, pulseBus: GainNode, chimeBus: GainNode;
  let noise: AudioBuffer;
  let mood = MOODS.welcome;
  let playing = false;
  let timers: number[] = [];

  function setup() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.Q.value = 0.5;
    tone.frequency.value = mood.tone;
    tone.connect(master);
    bus = ctx.createGain();
    const verb = ctx.createConvolver();
    verb.buffer = impulse(ctx);
    wet = ctx.createGain();
    wet.gain.value = mood.wet;
    bus.connect(tone);
    bus.connect(verb).connect(wet).connect(tone);
    const layer = (level: number) => { const g = ctx!.createGain(); g.gain.value = level; g.connect(bus); return g; };
    melodyBus = layer(mood.melody);
    pulseBus = layer(mood.pulse);
    chimeBus = layer(mood.chimes);
    noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .05), ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    document.addEventListener('visibilitychange', () => {
      if (!ctx || !playing) return;
      document.hidden ? ctx.suspend() : ctx.resume();
    });
  }

  /** One tanpura pluck: bright attack that mellows and decays. */
  function pluck(freq: number, at: number) {
    const c = ctx!;
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, at);
    lp.frequency.exponentialRampToValueAtTime(500, at + 2.4);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.05, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 3.2);
    osc.connect(lp).connect(g).connect(bus);
    osc.start(at);
    osc.stop(at + 3.3);
  }

  function droneLoop() {
    if (!playing || !ctx) return;
    const t0 = ctx.currentTime + 0.05;
    [hz(-5), hz(0), hz(0), hz(-12)].forEach((f, i) => pluck(f, t0 + i * 0.75));
    timers.push(window.setTimeout(droneLoop, 3000));
  }

  /** A legato reed voice for one phrase: two detuned oscillators, vibrato, nasal band-pass. */
  function phrase(notes: Note[], t0: number) {
    const c = ctx!;
    const a = c.createOscillator();
    const b = c.createOscillator();
    a.type = 'sawtooth';
    b.type = 'square';
    b.detune.value = 6;
    const vib = c.createOscillator();
    vib.frequency.value = 5.2;
    const vibDepth = c.createGain();
    vibDepth.gain.value = 14;
    vib.connect(vibDepth);
    vibDepth.connect(a.detune);
    vibDepth.connect(b.detune);
    const mix = c.createGain();
    mix.gain.value = 0.5;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1350;
    bp.Q.value = 0.9;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 3400;
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    a.connect(mix);
    b.connect(mix);
    mix.connect(bp).connect(lp).connect(env).connect(melodyBus);

    let t = t0;
    notes.forEach(([semi, beats, glide], i) => {
      const f = hz(semi);
      for (const osc of [a, b]) {
        if (i === 0) osc.frequency.setValueAtTime(f, t);
        else osc.frequency.setTargetAtTime(f, t, glide ? 0.12 : 0.025);
      }
      env.gain.setTargetAtTime(i === 0 ? 0.11 : 0.085, t, 0.06);
      env.gain.setTargetAtTime(0.1, t + 0.12, 0.2);
      t += beats * BEAT;
    });
    env.gain.setTargetAtTime(0.0001, t - 0.15, 0.18);
    for (const o of [a, b, vib]) { o.start(t0); o.stop(t + 1); }
    return t;
  }

  /** Tabla, synthesised: the bayan's gliding bass and the dayan's ringing treble. */
  function bayan(at: number, level: number) {
    const c = ctx!;
    const osc = c.createOscillator();
    osc.frequency.setValueAtTime(98, at);
    osc.frequency.exponentialRampToValueAtTime(64, at + 0.3);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level, at + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
    osc.connect(g).connect(pulseBus);
    osc.start(at);
    osc.stop(at + 0.55);
  }
  function dayan(at: number, level: number, open: boolean) {
    const c = ctx!;
    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = hz(12);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level, at + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, at + (open ? 0.42 : 0.12));
    osc.connect(g).connect(pulseBus);
    osc.start(at);
    osc.stop(at + 0.45);
    const click = c.createBufferSource();
    click.buffer = noise;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 3200;
    const cg = c.createGain();
    cg.gain.setValueAtTime(level * 0.6, at);
    cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
    click.connect(bp).connect(cg).connect(pulseBus);
    click.start(at);
  }
  // Keherwa, 8 matras: Dha Ge Na Ti | Na Ka Dhi Na  ([bayan, dayan, dayan rings open])
  const MATRA = BEAT / 2;
  const KEHERWA: [boolean, boolean, boolean][] = [
    [true, true, true], [true, false, false], [false, true, true], [false, true, false],
    [false, true, true], [true, false, false], [true, true, true], [false, true, true],
  ];
  function pulseLoop() {
    if (!playing || !ctx) return;
    // Quiet chapters schedule nothing; the cycle keeps time for when the tabla returns.
    if (mood.pulse > 0) {
      const t0 = ctx.currentTime + 0.05;
      KEHERWA.forEach(([low, high, open], i) => {
        const at = t0 + i * MATRA;
        const accent = i === 0 ? 1 : 0.75;
        if (low) bayan(at, 0.16 * accent);
        if (high) dayan(at, 0.07 * accent, open);
      });
    }
    timers.push(window.setTimeout(pulseLoop, KEHERWA.length * MATRA * 1000));
  }

  /** Wind-chime bells on Bhupali notes, two octaves up, with an inharmonic shimmer. */
  const BELLS = [24, 26, 28, 31, 33, 36];
  function bell(at: number) {
    const c = ctx!;
    const f = hz(BELLS[Math.floor(Math.random() * BELLS.length)]);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.03, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 3.6);
    g.connect(chimeBus);
    for (const [ratio, level] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
      const osc = c.createOscillator();
      osc.frequency.value = f * ratio;
      const partial = c.createGain();
      partial.gain.value = level;
      osc.connect(partial).connect(g);
      osc.start(at);
      osc.stop(at + 3.7);
    }
  }
  function chimeLoop() {
    if (!playing || !ctx) return;
    if (mood.chimes > 0) bell(ctx.currentTime + 0.05);
    timers.push(window.setTimeout(chimeLoop, 1400 + Math.random() * 2200));
  }

  function applyMood() {
    if (!ctx) return;
    const t = ctx.currentTime;
    melodyBus.gain.setTargetAtTime(mood.melody, t, MOOD_FADE);
    pulseBus.gain.setTargetAtTime(mood.pulse, t, MOOD_FADE);
    chimeBus.gain.setTargetAtTime(mood.chimes, t, MOOD_FADE);
    tone.frequency.setTargetAtTime(mood.tone, t, MOOD_FADE);
    wet.gain.setTargetAtTime(mood.wet, t, MOOD_FADE);
  }

  let next = 0;
  function melodyLoop() {
    if (!playing || !ctx) return;
    const end = phrase(PHRASES[next % PHRASES.length], ctx.currentTime + 0.1);
    next++;
    const rest = 1.4 + Math.random() * 1.2;
    timers.push(window.setTimeout(melodyLoop, (end - ctx.currentTime + rest) * 1000));
  }

  return {
    get playing() { return playing; },
    async play() {
      if (!ctx) setup();
      await ctx!.resume();
      playing = true;
      master.gain.cancelScheduledValues(ctx!.currentTime);
      master.gain.setTargetAtTime(0.9, ctx!.currentTime, 0.8);
      droneLoop();
      timers.push(window.setTimeout(melodyLoop, 2200));
      timers.push(window.setTimeout(pulseLoop, 1200));
      timers.push(window.setTimeout(chimeLoop, 1800));
    },
    setChapter(chapter) {
      const next = MOODS[chapter];
      if (!next || next === mood) return;
      mood = next;
      applyMood();
    },
    stop() {
      if (!ctx) return;
      playing = false;
      timers.forEach(clearTimeout);
      timers = [];
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      window.setTimeout(() => { if (!playing) ctx?.suspend(); }, 1200);
    },
  };
}

function filePlayer(src: string): Player {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.6;
  // A recording cannot change its arrangement, so chapters shape its tone and level.
  let mood = MOODS.welcome;
  let graph: { ctx: AudioContext; lp: BiquadFilterNode; gain: GainNode } | undefined;
  const applyMood = () => {
    if (!graph) return;
    const t = graph.ctx.currentTime;
    graph.lp.frequency.setTargetAtTime(mood.tone, t, MOOD_FADE);
    graph.gain.gain.setTargetAtTime(0.7 + 0.3 * mood.melody, t, MOOD_FADE);
  };
  document.addEventListener('visibilitychange', () => {
    if (!audio.paused && document.hidden) audio.pause();
    else if (playing && !document.hidden) audio.play();
  });
  let playing = false;
  return {
    get playing() { return playing; },
    async play() {
      playing = true;
      if (!graph && typeof AudioContext === 'function') {
        const ctx = new AudioContext();
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        const gain = ctx.createGain();
        ctx.createMediaElementSource(audio).connect(lp).connect(gain).connect(ctx.destination);
        graph = { ctx, lp, gain };
        applyMood();
      }
      await graph?.ctx.resume();
      await audio.play();
    },
    stop() { playing = false; audio.pause(); },
    setChapter(chapter) {
      const next = MOODS[chapter];
      if (!next || next === mood) return;
      mood = next;
      applyMood();
    },
  };
}

let player: Player | null = null;
export function getPlayer(src: string) {
  player ??= src ? filePlayer(src) : synthPlayer();
  return player;
}
