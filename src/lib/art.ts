/**
 * Procedural SVG bougainvillea, inlined at build time as reusable symbols
 * (scene/SceneDefs.astro) for the camera moves' foreground fronds.
 */
import { seeded } from './random';

const f = (n: number) => Math.round(n * 10) / 10;

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
const dot = (x: number, y: number, r: number) =>
  `M${f(x - r)},${f(y)}a${r},${r} 0 1,0 ${f(2 * r)},0a${r},${r} 0 1,0 ${f(-2 * r)},0`;

/** Bougainvillea bloom: three bracts around a cream centre. Returns petal and centre path data. */
const bloomPath = (x: number, y: number, deg: number, sc: number) => ({
  petals: [0, 120, 240].map((d) => place(BRACT, x, y, deg + d, sc)).join(''),
  centre: dot(x, y, f(1.8 * sc)),
});
const leafPath = (x: number, y: number, deg: number, sc: number) => place(LEAF, x, y, deg, sc);

/** Collects path data per fill colour and emits one <path> per colour, in first-seen order. */
class Buckets {
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
