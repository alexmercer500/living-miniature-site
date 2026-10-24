/**
 * Procedural SVG primitives for the Living Miniature world.
 * Everything here returns markup strings that are inlined at build time,
 * so the static poster paints immediately with zero runtime JS.
 */
import { seeded } from './random';

const f = (n: number) => Math.round(n * 10) / 10;

/** Stepped carved doorway silhouette in a 100×120 box — normalised for clip paths and frames. */
export const CUSPED_ARCH =
  'M0,120 L0,20 L12,20 L12,8 L88,8 L88,20 L100,20 L100,120 Z';
/**
 * Royal Heritage hero: a trabeated sandstone haveli courtyard with carved wood,
 * a lit mandap, torans and diyas. Deliberately avoids domes and Moorish arch forms.
 * Returned as the inner markup of a reusable symbol.
 */
export function haveliMarkup() {
  const wall = 'url(#lm-sandstone)';
  const wallDark = 'url(#lm-sandstone-dark)';
  const wood = 'url(#lm-wood)';
  const brass = 'url(#lm-brass-deep)';
  const warm = 'url(#lm-mandap-light)';
  const out: string[] = [];

  out.push(`<rect x="0" y="70" width="1000" height="350" fill="${wallDark}"/>`);
  out.push(`<rect x="24" y="104" width="952" height="268" fill="${wall}"/>`);
  out.push(`<path d="M0,104 H1000 V78 H0Z" fill="${wood}" opacity=".92"/>`);
  out.push(`<path d="M0,78 H1000" stroke="#E6C27B" stroke-opacity=".55" stroke-width="3"/>`);

  // Roofline and chhatri-free parapet: carved blocks and low timber brackets.
  for (let x = 24; x < 980; x += 28) out.push(`<rect x="${x}" y="62" width="16" height="16" fill="${wallDark}"/>`);
  for (const x of [72, 196, 804, 928]) {
    out.push(`<rect x="${x}" y="118" width="74" height="246" fill="${wallDark}"/>`);
    out.push(`<rect x="${x + 10}" y="128" width="54" height="226" fill="${wood}" opacity=".7"/>`);
    out.push(`<path d="M${x + 12},150 H${x + 62} M${x + 12},190 H${x + 62} M${x + 12},230 H${x + 62}" stroke="#E6C27B" stroke-opacity=".45" stroke-width="2"/>`);
  }

  // Rectangular jharokha windows with projecting timber balconies.
  for (const x of [126, 246, 674, 794]) {
    out.push(`<rect x="${x}" y="164" width="80" height="112" rx="2" fill="${wood}" stroke="#E6C27B" stroke-opacity=".65" stroke-width="2"/>`);
    out.push(`<rect x="${x + 12}" y="178" width="56" height="72" fill="#2B1717"/>`);
    out.push(`<path d="M${x + 20},178 V250 M${x + 40},178 V250 M${x + 60},178 V250 M${x + 12},202 H${x + 68} M${x + 12},226 H${x + 68}" stroke="#B88945" stroke-opacity=".7" stroke-width="1.5"/>`);
    out.push(`<path d="M${x - 10},276 H${x + 90} L${x + 78},292 H${x + 2}Z" fill="${wood}"/>`);
  }

  // Central mandap: four carved pillars, textile canopy and warm interior.
  out.push(`<rect x="332" y="142" width="336" height="24" fill="${wood}" stroke="#E6C27B" stroke-width="2"/>`);
  out.push(`<path d="M322,166 Q500,206 678,166 L662,214 Q500,246 338,214Z" fill="#7A1F2B"/>`);
  out.push(`<path d="M338,166 Q500,188 662,166" fill="none" stroke="#E6C27B" stroke-width="3"/>`);
  out.push(`<rect x="378" y="196" width="244" height="176" fill="#2B1717" stroke="#B88945" stroke-opacity=".8" stroke-width="2"/>`);
  out.push(`<rect x="404" y="224" width="192" height="148" fill="${warm}" opacity=".55"/>`);
  for (const x of [374, 616]) {
    out.push(`<rect x="${x}" y="178" width="30" height="194" fill="${wood}" stroke="#E6C27B" stroke-opacity=".8" stroke-width="2"/>`);
    out.push(`<path d="M${x + 7},190 V360 M${x + 15},190 V360 M${x + 23},190 V360" stroke="#B88945" stroke-opacity=".65" stroke-width="1.5"/>`);
    out.push(`<rect x="${x - 9}" y="170" width="48" height="12" fill="${brass}"/>`);
    out.push(`<rect x="${x - 9}" y="360" width="48" height="12" fill="${brass}"/>`);
  }
  out.push(`<path d="M438,354 Q500,318 562,354 L548,372 H452Z" fill="#B83A32" opacity=".9"/>`);
  out.push(`<circle cx="500" cy="332" r="22" fill="url(#lm-halo)"/>`);

  // Toran made from mango leaves and marigold beads across the courtyard.
  let toran = `<path d="M38,118 Q500,238 962,118" fill="none" stroke="#40533A" stroke-width="5"/>`;
  for (let i = 0; i < 17; i++) {
    const x = 64 + i * 54;
    const y = 128 + Math.sin((i / 16) * Math.PI) * 86;
    toran += `<path d="M${x},${y} q-14,18 -4,32 q14,-8 16,-28 q-4,-4 -12,-4Z" fill="#40533A"/>`;
    toran += `<circle cx="${x + 13}" cy="${y + 31}" r="7" fill="#F29A2E"/>`;
  }
  out.push(toran);

  // Brass diyas and a restrained rangoli on the reflective courtyard floor.
  for (const x of [86, 186, 302, 698, 814, 914]) {
    out.push(`<circle cx="${x}" cy="364" r="18" fill="url(#lm-halo)" opacity=".8"/>`);
    out.push(`<path d="M${x - 18},365 Q${x},390 ${x + 18},365 Q${x},374 ${x - 18},365Z" fill="${brass}"/>`);
    out.push(`<path d="M${x},344 C${x + 7},354 ${x + 7},360 ${x},365 C${x - 7},360 ${x - 7},354 ${x},344Z" fill="url(#lm-flame)"/>`);
  }
  out.push(`<g transform="translate(500 395)" fill="none" stroke="#E6C27B" stroke-opacity=".8" stroke-width="2"><ellipse rx="126" ry="18"/><ellipse rx="92" ry="12"/><path d="M-28,0 l28,-12 28,12 -28,12Z"/></g>`);

  return `<g class="lm-haveli">${out.join('')}</g>`;
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
