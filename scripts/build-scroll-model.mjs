// Builds the paper texture for the Lake City scroll's 3D model (scripts/scroll-model.ts) from the
// theme's cut roll layer (object/roll.png, ribbon already repainted). Run after re-cutting it:
//   node scripts/build-scroll-model.mjs
// The roll's visible half is unwrapped off the photo's cylinder (each texture row is one angle
// around the roll, sampled across its silhouette), from the left end cap to the middle; the right
// half mirrors it, so both ends carry the gold border and vines. The photo's lighting across the
// roll is divided out row by row. Outputs: scroll-color.webp and scroll-detail.webp (R bump,
// G roughness, B metalness: the gold is metal, the blue lotuses are not) and geometry.json.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { load, blurField } from './object-cut-lib.mjs';

const dir = 'src/assets/rajasthan/lake-city';
const out = `${dir}/model`;
const layer = await load(`${dir}/object/roll.png`);
const g = JSON.parse(await fs.readFile(`${dir}/object/geometry.json`, 'utf8'));
const W = 1024, H = 256;
const clamp = v => Math.max(0, Math.min(255, v));
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// The roll's axis (layer pixels), its unit direction and the perpendicular pointing down-screen.
const [[ax, ay], [bx, by]] = g.axis, len = Math.hypot(bx - ax, by - ay);
const d = [(bx - ax) / len, (by - ay) / len], n = [-d[1], d[0]];
const R = g.thickness / 2;
// The paper runs between the gilt end caps (photo x 210 and 1235; the layer is cropped 9 px in).
// The paper's ends curve under the caps' collars: start a little inside them.
const s0 = (210 - 9 - ax) / d[0] + 26, s1 = (1235 - 9 - ax) / d[0] - 26;

const at = (x, y, c) => {
  const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const p = (xx, yy) => layer.data[(Math.min(layer.h - 1, Math.max(0, yy)) * layer.w + Math.min(layer.w - 1, Math.max(0, xx))) * 4 + c];
  return (p(xi, yi) * (1 - fx) + p(xi + 1, yi) * fx) * (1 - fy) + (p(xi, yi + 1) * (1 - fx) + p(xi + 1, yi + 1) * fx) * fy;
};
const rgb = new Float32Array(W * H * 3);
for (let j = 0; j < H; j++) {
  // Rows run around the visible half, top of the roll to bottom; the rims are skipped (too
  // foreshortened to read, and the photo's perspective shifts them off the axis line).
  const phi = (-.5 + (j + .5) / H) * Math.PI * .7, t = Math.sin(phi) * R;
  for (let i = 0; i < W; i++) {
    const a = (i + .5) / W, half = a < .5 ? a : 1 - a, s = s0 + half * 2 * ((s0 + s1) / 2 - s0);
    const x = ax + d[0] * s + n[0] * t, y = ay + d[1] * s + n[1] * t;
    for (let c = 0; c < 3; c++) rgb[(j * W + i) * 3 + c] = at(x, y, c);
  }
}
// Gold (warm, saturated) and the blue lotuses; everything else is paper.
const gold = new Float32Array(W * H), ink = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const r = rgb[i * 3], gg = rgb[i * 3 + 1], b = rgb[i * 3 + 2], mx = Math.max(r, gg, b), s = mx ? (mx - Math.min(r, gg, b)) / mx : 0;
  gold[i] = r >= gg && gg > b ? smooth(.22, .4, s) : 0;
  ink[i] = b > r ? smooth(.12, .3, s) : 0;
}
// Divide out the lighting across the roll: each row's own paper brightness (print excluded),
// averaged along that row only, so rows never borrow light from their neighbours.
const L = Float32Array.from({ length: W * H }, (_, i) => .2126 * rgb[i * 3] + .7152 * rgb[i * 3 + 1] + .0722 * rgb[i * 3 + 2]);
// Per colour channel, so the pink the satin reflected onto the paper goes too.
const TONE = [240, 229, 207]; // the photo's clean paper
const light = new Float32Array(W * H * 3);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const sum = [0, 0, 0]; let wsum = 0;
  for (let k = Math.max(0, i - 90); k < Math.min(W, i + 91); k += 3) { const q = j * W + k, wq = (1 - gold[q]) * (1 - ink[q]); for (let c = 0; c < 3; c++) sum[c] += rgb[q * 3 + c] * wq; wsum += wq; }
  for (let c = 0; c < 3; c++) light[(j * W + i) * 3 + c] = wsum > 1 ? sum[c] / wsum : TONE[c];
}
const gain = (i, c) => TONE[c] / Math.max(40, light[i * 3 + c]);
const flatL = L.map((v, i) => v * gain(i, 1));
const fine = blurField(flatL, W, H, 1), emboss = blurField(gold, W, H, 1);
const color = Buffer.alloc(W * H * 3), detail = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const gv = gold[i];
  for (let c = 0; c < 3; c++) color[i * 3 + c] = clamp(rgb[i * 3 + c] * gain(i, c) * (1 - gv * .5) + [236, 188, 106][c] * gv * .5);
  detail[i * 3] = clamp(128 + (flatL[i] - fine[i]) * 1.4 + emboss[i] * 40);
  detail[i * 3 + 1] = clamp(205 - 125 * gv);
  detail[i * 3 + 2] = clamp(255 * gv);
}
await fs.mkdir(out, { recursive: true });
await sharp(color, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 86 }).toFile(`${out}/scroll-color.webp`);
await sharp(detail, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 82 }).toFile(`${out}/scroll-detail.webp`);

// Model geometry in rig widths (the rig is the photo layer's box): the paper's radius and length
// (as wide as the unrolled sheet the page draws), and the bow's knot on the roll's front.
const centre = (s0 + s1) / 2, knot = [g.knot[0] - (ax + d[0] * centre), g.knot[1] - (ay + d[1] * centre)];
const u = v => +(v / g.width).toFixed(4);
await fs.writeFile(`${out}/geometry.json`, JSON.stringify({
  radius: u(R), paper: u(g.paperLength * 1.06), tilt: g.angle,
  // Where the page anchors the photo roll's box: its axis midpoint, as fractions of the box.
  axis: [+((ax + bx) / 2 / g.width).toFixed(4), +((ay + by) / 2 / g.height).toFixed(4)],
  knot: { along: u(knot[0] * d[0] + knot[1] * d[1]), up: +(-(knot[0] * n[0] + knot[1] * n[1]) / R).toFixed(3) },
}, null, 1) + '\n');
console.log('scroll model texture written to', out);
