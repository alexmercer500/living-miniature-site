/**
 * Opt-in ambient music. Never starts without a guest's tap.
 * With `music.src` set, a local recording loops; otherwise a small Web Audio
 * ensemble is synthesised on the device: a tanpura drone (Pa–Sa–Sa–Sa) and a
 * reed voice playing slow Raag Bhupali phrases (Sa Re Ga Pa Dha), through a soft reverb.
 */

export interface Player {
  play(): Promise<void>;
  stop(): void;
  readonly playing: boolean;
}

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
  let playing = false;
  let timers: number[] = [];

  function setup() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    bus = ctx.createGain();
    const verb = ctx.createConvolver();
    verb.buffer = impulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = 0.38;
    bus.connect(master);
    bus.connect(verb).connect(wet).connect(master);
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
    mix.connect(bp).connect(lp).connect(env).connect(bus);

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
  document.addEventListener('visibilitychange', () => {
    if (!audio.paused && document.hidden) audio.pause();
    else if (playing && !document.hidden) audio.play();
  });
  let playing = false;
  return {
    get playing() { return playing; },
    async play() { playing = true; await audio.play(); },
    stop() { playing = false; audio.pause(); },
  };
}

let player: Player | null = null;
export function getPlayer(src: string) {
  player ??= src ? filePlayer(src) : synthPlayer();
  return player;
}
