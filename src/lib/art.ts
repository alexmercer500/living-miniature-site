/**
 * Procedural SVG primitives for the Living Miniature world.
 * Everything here returns markup strings that are inlined at build time,
 * so the static poster paints immediately with zero runtime JS.
 */
import { seeded } from './random';

const f = (n: number) => Math.round(n * 10) / 10;

/** Onion dome. `base` is the y of the dome's foot, `h` its height. */
export const onion = (cx: number, base: number, w: number, h: number) =>
  `M${f(cx - 0.42 * w)},${f(base)} C${f(cx - 0.64 * w)},${f(base - 0.32 * h)} ${f(cx - 0.4 * w)},${f(base - 0.66 * h)} ${f(cx)},${f(base - h)} ` +
  `C${f(cx + 0.4 * w)},${f(base - 0.66 * h)} ${f(cx + 0.64 * w)},${f(base - 0.32 * h)} ${f(cx + 0.42 * w)},${f(base)} Z`;

/** Pointed arch opening. `y` is the apex. */
export const arch = (x: number, y: number, w: number, h: number) =>
  `M${f(x)},${f(y + h)} V${f(y + w * 0.55)} Q${f(x)},${f(y + w * 0.12)} ${f(x + w / 2)},${f(y)} ` +
  `Q${f(x + w)},${f(y + w * 0.12)} ${f(x + w)},${f(y + w * 0.55)} V${f(y + h)} Z`;

/** Multifoil (cusped) arch in a 100×120 box — normalised for clip paths and frames. */
export const CUSPED_ARCH =
  'M0,120 V50 Q0,44 6,40 Q4,30 14,26 Q16,16 28,14 Q34,4 50,0 Q66,4 72,14 Q84,16 86,26 Q96,30 94,40 Q100,44 100,50 V120 Z';

const rect = (x: number, y: number, w: number, h: number, fill: string) =>
  `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}"/>`;

const path = (d: string, fill: string, extra = '') => `<path d="${d}" fill="${fill}"${extra}/>`;

const STONE = 'url(#lm-stone)';
const STONE_DARK = 'url(#lm-stone-dark)';
const DOME = 'url(#lm-dome)';
const WINDOW_DARK = '#4B243E';
const LIT = 'url(#lm-lit)';
const GOLD = '#F2D59A';

function finial(cx: number, tip: number, len = 10) {
  return `<line x1="${f(cx)}" y1="${f(tip)}" x2="${f(cx)}" y2="${f(tip - len)}" stroke="${GOLD}" stroke-width="1.4"/>` +
    `<circle cx="${f(cx)}" cy="${f(tip - len * 0.45)}" r="${f(len * 0.2)}" fill="${GOLD}"/>`;
}

function merlons(x1: number, x2: number, y: number, step = 14) {
  let out = '';
  for (let x = x1 + 2; x + 8 <= x2; x += step) out += rect(x, y, 8, 7, STONE);
  return out;
}

/** Open pavilion with pillars and a small dome — the signature Rajput rooftop element. */
function chhatri(cx: number, base: number, w: number) {
  const ph = w * 0.62;
  const pw = Math.max(3, w * 0.13);
  const top = base - 5 - ph;
  const domeH = w * 0.85;
  return [
    rect(cx - w / 2 - 4, base - 5, w + 8, 5, STONE_DARK),
    rect(cx - w / 2, top, pw, ph, STONE),
    rect(cx - pw / 2, top, pw, ph, STONE),
    rect(cx + w / 2 - pw, top, pw, ph, STONE),
    path(`M${f(cx - w / 2 - 6)},${f(top)} L${f(cx + w / 2 + 6)},${f(top)} L${f(cx + w / 2 + 2)},${f(top - 5)} L${f(cx - w / 2 - 2)},${f(top - 5)} Z`, STONE_DARK),
    path(onion(cx, top - 5, w * 0.92, domeH), DOME),
    finial(cx, top - 5 - domeH, 9),
  ].join('');
}

const cypress = (cx: number, base: number, w: number, h: number) =>
  `M${f(cx)},${f(base - h)} C${f(cx + w * 0.62)},${f(base - h * 0.68)} ${f(cx + w * 0.55)},${f(base - h * 0.18)} ${f(cx + w * 0.28)},${f(base)} ` +
  `L${f(cx - w * 0.28)},${f(base)} C${f(cx - w * 0.55)},${f(base - h * 0.18)} ${f(cx - w * 0.62)},${f(base - h * 0.68)} ${f(cx)},${f(base - h)} Z`;

/** Dots along a sagging quadratic — the strings of wedding lights draped from the dome. */
function lightString(x1: number, y1: number, x2: number, y2: number, sag: number, spacing = 11) {
  const cx = (x1 + x2) / 2;
  const cy = Math.max(y1, y2) + sag;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const n = Math.max(4, Math.round(len / spacing));
  let dots = '';
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t ** 2 * x2;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t ** 2 * y2;
    dots += `<circle cx="${f(x)}" cy="${f(y)}" r="1.6"/>`;
  }
  return {
    wire: `<path d="M${f(x1)},${f(y1)} Q${f(cx)},${f(cy)} ${f(x2)},${f(y2)}" fill="none" stroke="#F2D59A" stroke-opacity=".25" stroke-width=".6"/>`,
    dots,
  };
}

/**
 * The palace, drawn in a 1000×420 box with its plinth resting on y=420 (the waterline).
 * Returned as the inner markup of a <symbol>.
 */
export function palaceMarkup() {
  const back: string[] = [];
  const body: string[] = [];
  const dark: string[] = [];
  const lit: string[] = [];
  const lights: string[] = [];
  const wires: string[] = [];

  // Garden canopy behind the side wings.
  const r = seeded(7);
  for (const [cx, cy, rad] of [
    [18, 300, 52], [74, 270, 44], [128, 300, 40], [196, 252, 34],
    [982, 300, 52], [926, 270, 44], [872, 300, 40], [804, 252, 34],
  ]) {
    back.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#22352C"/>`);
    back.push(`<circle cx="${cx - rad * 0.3}" cy="${cy - rad * 0.35}" r="${rad * 0.55}" fill="#2D4538" opacity="${f(0.7 + r() * 0.3)}"/>`);
  }

  // End towers.
  for (const x of [60, 876]) {
    body.push(rect(x, 226, 64, 146, STONE));
    body.push(rect(x - 5, 220, 74, 6, STONE_DARK));
    body.push(path(onion(x + 32, 220, 70, 60), DOME));
    body.push(finial(x + 32, 160, 11));
    lit.push(path(arch(x + 22, 246, 20, 34), LIT));
    dark.push(path(arch(x + 21, 302, 22, 44), WINDOW_DARK));
  }

  // Side wings with crenellated parapets, two window storeys and rooftop chhatris.
  for (const [x, mirror] of [[124, false], [670, true]] as const) {
    body.push(rect(x, 266, 206, 106, STONE));
    body.push(rect(x - 4, 260, 214, 6, STONE_DARK));
    body.push(merlons(x, x + 206, 253));
    body.push(rect(x, 312, 206, 4, STONE_DARK));
    const upper = mirror ? [0, 1, 0, 1, 1, 0, 1] : [1, 0, 1, 1, 0, 1, 0];
    upper.forEach((on, i) => (on ? lit : dark).push(path(arch(x + 12 + i * 28, 280, 16, 28), on ? LIT : WINDOW_DARK)));
    const lower = mirror ? [1, 0, 1, 1, 0] : [0, 1, 1, 0, 1];
    lower.forEach((on, i) => (on ? lit : dark).push(path(arch(x + 12 + i * 38, 324, 26, 48), on ? LIT : WINDOW_DARK)));
    body.push(chhatri(x + 48, 253, 36));
    body.push(chhatri(x + 158, 253, 36));
  }

  // Main block.
  body.push(rect(320, 188, 360, 184, STONE));
  body.push(rect(314, 182, 372, 6, STONE_DARK));
  body.push(merlons(320, 680, 175));
  body.push(rect(316, 252, 368, 5, STONE_DARK));
  [340, 372, 404, 576, 608, 640].forEach((x, i) => {
    const on = [1, 1, 0, 0, 1, 1][i];
    (on ? lit : dark).push(path(arch(x - 10, 204, 20, 36), on ? LIT : WINDOW_DARK));
  });
  // Jharokha balconies: a canopy dome over the window and a ledge beneath.
  for (const cx of [372, 608]) {
    body.push(path(onion(cx, 202, 34, 20), DOME));
    body.push(rect(cx - 17, 200, 34, 3, STONE_DARK));
    body.push(rect(cx - 15, 240, 30, 5, STONE_DARK));
    body.push(rect(cx - 12, 245, 24, 3, STONE_DARK));
  }
  // Grand gateway with an outlined frame, flanked by tall arches.
  body.push(path(arch(450, 254, 100, 118), STONE_DARK));
  lit.push(path(arch(460, 266, 80, 106), 'url(#lm-lit-bright)'));
  lit.push(path(arch(386, 282, 40, 90), LIT));
  lit.push(path(arch(574, 282, 40, 90), LIT));
  dark.push(path(arch(334, 298, 28, 74), WINDOW_DARK));
  dark.push(path(arch(638, 298, 28, 74), WINDOW_DARK));
  body.push(chhatri(346, 175, 42));
  body.push(chhatri(654, 175, 42));

  // Drum and central dome.
  body.push(rect(428, 150, 144, 32, STONE));
  for (let x = 440; x <= 548; x += 18) dark.push(path(arch(x, 156, 12, 20), WINDOW_DARK));
  body.push(path(`M418,150 L582,150 L576,143 L424,143 Z`, STONE_DARK));
  body.push(path(onion(500, 143, 196, 126), DOME));
  body.push(`<path d="M${f(500 - 0.42 * 196)},143 Q500,128 ${f(500 + 0.42 * 196)},143" fill="none" stroke="${GOLD}" stroke-opacity=".55" stroke-width="1.2"/>`);
  body.push(finial(500, 17, 15));

  // Ghat steps down to the water.
  body.push(rect(28, 372, 944, 48, STONE_DARK));
  for (const y of [384, 396, 408]) body.push(`<line x1="28" y1="${y}" x2="972" y2="${y}" stroke="#F3CBAE" stroke-opacity=".16" stroke-width="1"/>`);

  // Cypress sentinels framing the palace.
  for (const [cx, h] of [[24, 176], [976, 176], [146, 120], [854, 120]]) {
    body.push(path(cypress(cx, 372, 30, h), '#1E2F27'));
    body.push(path(cypress(cx - 3, 372, 16, h * 0.86), '#2B4337', ' opacity=".8"'));
  }

  // Strings of lights draped from the finial to the wings, and along the parapets.
  for (const [x2, y2, sag] of [[160, 253, 40], [840, 253, 40], [92, 220, 70], [908, 220, 70]] as const) {
    const s = lightString(500, 22, x2, y2, sag);
    wires.push(s.wire);
    lights.push(s.dots);
  }
  for (const [x1, x2, y] of [[322, 678, 186], [126, 328, 264], [672, 874, 264]] as const) {
    const s = lightString(x1, y, x2, y, 7, 12);
    wires.push(s.wire);
    lights.push(s.dots);
  }

  return `
    <g class="lm-back">${back.join('')}</g>
    <g class="lm-body">${body.join('')}</g>
    <g class="lm-dark">${dark.join('')}</g>
    <g class="lm-lit" filter="url(#lm-glow)">${lit.join('')}</g>
    <g class="lm-wires">${wires.join('')}</g>
    <g class="lm-lights" fill="#FFE7AE" filter="url(#lm-glow-small)">${lights.join('')}</g>`;
}

type Pt = [number, number];
const bez = (p: Pt[], t: number): Pt => {
  const u = 1 - t;
  return [
    u ** 3 * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t ** 3 * p[3][0],
    u ** 3 * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t ** 3 * p[3][1],
  ];
};

/*
 * Merged-path drawing. Hundreds of individually transformed <use> elements make Chrome
 * re-layerize the page on every animated frame, so small repeated motifs (petals, leaves,
 * beads) are baked into one path per colour at build time instead.
 */
type Shape = [string, number[]][];
const BRACT: Shape = [['M', [0, 0]], ['C', [-7, -3, -9, -12, 0, -15]], ['C', [9, -12, 7, -3, 0, 0]], ['Z', []]];
const LEAF: Shape = [['M', [0, 0]], ['C', [6, -6, 18, -6, 24, 0]], ['C', [18, 6, 6, 6, 0, 0]], ['Z', []]];

/** Shape placed with translate → rotate → scale, as path data. */
function place(shape: Shape, tx: number, ty: number, deg: number, sc: number) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a) * sc;
  const sn = Math.sin(a) * sc;
  return shape
    .map(([k, p]) => {
      const pts: string[] = [];
      for (let i = 0; i < p.length; i += 2) pts.push(`${f(tx + p[i] * c - p[i + 1] * sn)},${f(ty + p[i] * sn + p[i + 1] * c)}`);
      return k + pts.join(' ');
    })
    .join('');
}

/** A filled circle as path data, so many dots can share one element. */
export const dot = (x: number, y: number, r: number) =>
  `M${f(x - r)},${f(y)}a${r},${r} 0 1,0 ${f(2 * r)},0a${r},${r} 0 1,0 ${f(-2 * r)},0`;

/** Bougainvillea bloom: three bracts around a cream centre. Returns petal and centre path data. */
export const bloomPath = (x: number, y: number, deg: number, sc: number) => ({
  petals: [0, 120, 240].map((d) => place(BRACT, x, y, deg + d, sc)).join(''),
  centre: dot(x, y, f(1.8 * sc)),
});
export const leafPath = (x: number, y: number, deg: number, sc: number) => place(LEAF, x, y, deg, sc);

/** Collects path data per fill colour and emits one <path> per colour, in first-seen order. */
export class Buckets {
  private map = new Map<string, string[]>();
  add(colour: string, d: string) {
    const list = this.map.get(colour) ?? [];
    list.push(d);
    this.map.set(colour, list);
  }
  toString() {
    return [...this.map].map(([c, ds]) => `<path fill="${c}" d="${ds.join('')}"/>`).join('');
  }
}

const BLOOM_BACK = ['#7A1F40', '#8E2348', '#9C3540'];
const BLOOM_FRONT = ['#C42E5E', '#D9406F', '#E8648C', '#B8285A', '#E05A7E'];
const LEAVES = ['#24382D', '#2E4A3A', '#3D5F49'];

/**
 * Bougainvillea cascade for a top-left corner, in a 420×380 box.
 * Mirror it with CSS for the right corner.
 */
export function foliageMarkup(seed = 3) {
  const r = seeded(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const branches: Pt[][] = [
    [[-10, 18], [120, 4], [250, 46], [372, 22]],
    [[-12, 60], [52, 92], [104, 176], [80, 300]],
    [[20, 8], [118, 64], [186, 118], [232, 182]],
    [[150, 30], [176, 90], [168, 150], [176, 236]],
  ];
  const stems: string[] = [];
  const leaves = new Buckets();
  const backBlooms = new Buckets();
  const frontBlooms = new Buckets();
  const centres: Record<'back' | 'front', string[]> = { back: [], front: [] };

  branches.forEach((b, bi) => {
    stems.push(`<path d="M${b[0]} C${b[1]} ${b[2]} ${b[3]}" fill="none" stroke="#3B2A2C" stroke-width="${bi === 0 ? 4 : 2.6}" stroke-linecap="round"/>`);
    const samples = bi === 3 ? 9 : 16;
    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      const [x, y] = bez(b, t);
      const spread = (1 - t * 0.6) * (bi === 3 ? 16 : 30);
      for (let k = 0; k < 2; k++) {
        const lx = x + (r() - 0.5) * spread * 1.6;
        const ly = y + (r() - 0.5) * spread;
        const colour = pick(LEAVES);
        const deg = r() * 360;
        leaves.add(colour, leafPath(lx, ly, deg, 0.7 + r() * 0.6));
      }
      const count = bi === 3 ? 1 : 2 + Math.round(r() * 2);
      for (let k = 0; k < count; k++) {
        const bx = x + (r() - 0.5) * spread * 1.8;
        const by = y + (r() - 0.5) * spread * 1.2 + 4;
        const s = 0.55 + r() * 0.6 * (1 - t * 0.4);
        const front = r() > 0.38;
        const colour = pick(front ? BLOOM_FRONT : BLOOM_BACK);
        const bloom = bloomPath(bx, by, r() * 120, s);
        (front ? frontBlooms : backBlooms).add(colour, bloom.petals);
        centres[front ? 'front' : 'back'].push(bloom.centre);
      }
    }
  });

  const centre = (d: string[]) => `<path fill="#FFF3E2" d="${d.join('')}"/>`;
  return `${stems.join('')}${leaves}${backBlooms}${centre(centres.back)}${frontBlooms}${centre(centres.front)}`;
}
