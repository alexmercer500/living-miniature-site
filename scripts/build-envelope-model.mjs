// Builds the textures for the Amber Fort envelope's 3D model (scripts/envelope-model.ts) from the
// theme's invitation photo. Run after replacing the photo:
//   node scripts/build-envelope-model.mjs [debugDir]
// The photo's front face is unwarped flat and mirrored about the flap's centre line (the left half
// is the better lit), then cut into the flap and the pocket. What the flap, wax seal and tassel
// hid is repainted by copying paper along the folds, so fold lines and gold borders run on
// unbroken. The gold is separated from the paper so it renders as metal. Each part gets a colour
// texture (alpha = its outline) and a detail texture: R = bump height, G = roughness, B = metalness.
// The lining and the wax seal are made the same way; geometry.json records the outlines.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { load, unwarp, svgMask, pts, snapToShadow, dilate, erode, feather, blurField } from './object-cut-lib.mjs';

const dir = 'src/assets/rajasthan/amber-fort';
const out = `${dir}/model`;
const debug = process.argv[2];

// The photo's front face, flap corners first: TL, TR, BR, BL.
const QUAD = [[165, 205], [1395, 95], [1472, 765], [240, 942]];
const FW = 1600, H = 1000;
const AXIS = 814; // the flap's centre line in the flat face
const W = 2 * AXIS;
const OUT_W = 1280; // texture width (the face is at most 35rem wide, so ~1100 px at 2x)
const PAPER = 226; // flattened paper luminance

const clamp = v => Math.max(0, Math.min(255, v));
const lumOf = (d, i) => .2126 * d[i * 4] + .7152 * d[i * 4 + 1] + .0722 * d[i * 4 + 2];
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const photo = await load(`${dir}/invitation-object.png`);
const flat = unwarp(photo, QUAD, FW, H);
const sym = { data: Buffer.alloc(W * H * 4), w: W, h: H };
const mirror = img => { for (let y = 0; y < H; y++) for (let x = AXIS; x < W; x++) img.data.copy(img.data, (y * W + x) * 4, (y * W + W - 1 - x) * 4, (y * W + W - x) * 4); };
for (let y = 0; y < H; y++) for (let x = 0; x < AXIS; x++) flat.data.copy(sym.data, (y * W + x) * 4, (y * FW + x) * 4, (y * FW + x) * 4 + 4);
mirror(sym);

// Flap edge (left half): the cusped lobes snapped to the shadow the flap casts, averaged along
// the curve, then the long straight edge fitted and carried under the seal to the tip.
const rough = [[0, 8], [14, 70], [40, 125], [80, 160], [125, 186], [133, 214], [160, 260], [205, 292], [238, 305], [245, 326], [280, 358], [330, 392], [380, 430], [500, 468], [620, 505], [720, 537]];
const snapped = snapToShadow(sym, rough, { side: 1, from: -10, to: 26 });
const edge = snapped.map((p, i) => { const win = snapped.slice(Math.max(0, i - 2), i + 3); return [win.reduce((s, q) => s + q[0], 0) / win.length, win.reduce((s, q) => s + q[1], 0) / win.length]; });
const tail = edge.filter(([x]) => x > 450), mx = tail.reduce((s, p) => s + p[0], 0) / tail.length, my = tail.reduce((s, p) => s + p[1], 0) / tail.length;
const slope = tail.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / tail.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
const straight = x => my + slope * (x - mx);
const left = [...edge.filter(([x]) => x <= 450), ...Array.from({ length: 19 }, (_, k) => { const x = 460 + k * (AXIS - 8 - 460) / 18; return [x, straight(x)]; })];
const tip = [AXIS, straight(AXIS) + 2];
const flapPoly = [[0, -2], ...left, tip, ...[...left].reverse().map(([x, y]) => [W - x, y]), [W, -2]];
const flapMask = await svgMask(W, H, `<polygon points="${pts(flapPoly)}"/>`);

// Pocket: the side flaps' edges run from the top corners to meet the bottom flap, whose apex
// (traced along its fold from the bottom-left corner) rises a little between them.
const fold = x => 990 + (526 - 990) / (650 - 20) * (x - 20);
const vee = x => x * 500 / AXIS;
const meet = (990 + 20 * (526 - 990) / (650 - 20) * -1) / (500 / AXIS - (526 - 990) / (650 - 20));
const pocketPoly = [[0, 0], [meet, vee(meet)], [AXIS, fold(AXIS)], [W - meet, vee(meet)], [W, 0], [W, H], [0, H]];
const pocketMask = await svgMask(W, H, `<polygon points="${pts(pocketPoly)}"/>`);

/** Fill `hole` (left half) with a translated copy of the paper further along `dir`: every line
 *  parallel to `dir` shifts by one distance (enough to clear the hole on that line), smoothed
 *  across lines. A copy taken along a fold or border keeps that line unbroken. */
function shiftFill(img, hole, [dx, dy]) {
  const nx = -dy, ny = dx, Q = Math.ceil(Math.hypot(W, H)), tmin = new Float32Array(2 * Q).fill(Infinity), tmax = new Float32Array(2 * Q).fill(-Infinity);
  for (let y = 0; y < H; y++) for (let x = 0; x < AXIS; x++) if (hole[y * W + x]) { const q = Math.round(x * nx + y * ny) + Q, t = x * dx + y * dy; tmin[q] = Math.min(tmin[q], t); tmax[q] = Math.max(tmax[q], t); }
  const need = Array.from(tmin, (v, q) => v === Infinity ? 0 : tmax[q] - v + 12), R = 40;
  const peak = need.map((_, q) => Math.max(...need.slice(Math.max(0, q - R), q + R + 1)));
  const D = peak.map((_, q) => { const win = peak.slice(Math.max(0, q - R), q + R + 1); return win.reduce((a, b) => a + b, 0) / win.length; });
  // Filled a little beyond the hole too, so applyFill can match the fill to the paper around it.
  const fill = Buffer.from(img.data), reach = dilate(hole, W, H, 8);
  const at = (x, y, c) => img.data[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(AXIS - 1, Math.max(0, x))) * 4 + c];
  for (let y = 0; y < H; y++) for (let x = 0; x < AXIS; x++) {
    if (!reach[y * W + x]) continue;
    const d = D[Math.round(x * nx + y * ny) + Q], sx = x + dx * d, sy = y + dy * d, xi = Math.floor(sx), yi = Math.floor(sy), fx = sx - xi, fy = sy - yi;
    for (let c = 0; c < 4; c++) fill[(y * W + x) * 4 + c] = (at(xi, yi, c) * (1 - fx) + at(xi + 1, yi, c) * fx) * (1 - fy) + (at(xi, yi + 1, c) * (1 - fx) + at(xi + 1, yi + 1, c) * fx) * fy;
  }
  return fill;
}
/** Blend a fill into `img` over the hole (feathered a few pixels out), then mirror. The fill is
 *  first offset by the smoothly interpolated difference from the part's paper around the hole, so
 *  its tone meets the surroundings without a seam (a cheap seamless clone). */
function applyFill(img, hole, fill, region) {
  const goldA = goldOf(img), goldB = goldOf({ data: fill });
  const ring = Float32Array.from(dilate(hole, W, H, 8), (v, i) => v && !hole[i] && region[i] > 250 ? (1 - goldA[i]) * (1 - goldB[i]) : 0), inside = dilate(hole, W, H, 4);
  for (let c = 0; c < 3; c++) {
    const diff = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) if (ring[i]) diff[i] = img.data[i * 4 + c] - fill[i * 4 + c];
    const corr = blurField(diff, W, H, 18, ring);
    for (let i = 0; i < W * H; i++) if (inside[i]) fill[i * 4 + c] = clamp(fill[i * 4 + c] + corr[i]);
  }
  const soft = feather(dilate(hole, W, H, 3), W, H, 3);
  for (let i = 0; i < W * H; i++) { const a = Math.max(soft[i], hole[i]) / 255; for (let c = 0; c < 4; c++) img.data[i * 4 + c] = img.data[i * 4 + c] * (1 - a) + fill[i * 4 + c] * a; }
  mirror(img);
}

// Body: repaint everything the flap covered (plus the shadow band it cast) and the seal and
// tassel. Left of the fold's reach, copy straight down; nearer the centre, along the fold.
const BAND = 70;
const flapBottom = new Int32Array(W);
for (let x = 0; x < W; x++) { let b = -1; for (let y = 0; y < H; y++) if (flapMask[y * W + x] > 127) b = y; flapBottom[x] = b; }
const bodyHole = new Uint8ClampedArray(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < AXIS; x++) {
  // The seal with the shadow and red glow around it, and the tassel, which fans out as it falls.
  const under = y <= flapBottom[x] + BAND, seal = ((x - AXIS) / 150) ** 2 + ((y - 530) / 195) ** 2 < 1, tassel = y >= 600 && AXIS - x < 50 + (y - 600) * .24;
  if ((under || seal || tassel) && pocketMask[y * W + x]) bodyHole[y * W + x] = 255;
}
/** Divide out the photo's broad lighting, measured on `region`'s paper (holes and gold excluded),
 *  so a patch copied from elsewhere matches its new surroundings. */
function flatten(img, region, hole) {
  const gold = goldOf(img), L = new Float32Array(W * H), weight = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) { L[i] = lumOf(img.data, i); weight[i] = (region[i] / 255) * (1 - hole[i] / 255) * (1 - gold[i]); }
  const light = blurField(L, W, H, 24, weight);
  for (let i = 0; i < W * H; i++) { const k = PAPER / Math.max(60, light[i] || PAPER); for (let c = 0; c < 3; c++) img.data[i * 4 + c] = clamp(img.data[i * 4 + c] * k); }
}

const body = { data: Buffer.from(sym.data), w: W, h: H };
const foldDir = [-.806, .592];
flatten(body, pocketMask, bodyHole);
{
  // Straight down at the sides (the fold is far below there), along the fold nearer the centre,
  // and sideways under the tassel, where the fold direction would run off the bottom edge.
  const a = shiftFill(body, bodyHole, [0, 1]), b = shiftFill(body, bodyHole, foldDir), l = shiftFill(body, bodyHole, [-1, 0]), mixed = Buffer.from(a);
  for (let i = 0; i < W * H; i++) {
    const k = smooth(260, 320, i % W), side = smooth(600, 660, (i / W) | 0) * smooth(520, 580, i % W);
    for (let c = 0; c < 4; c++) mixed[i * 4 + c] = (a[i * 4 + c] * (1 - k) + b[i * 4 + c] * k) * (1 - side) + l[i * 4 + c] * side;
  }
  applyFill(body, bodyHole, mixed, pocketMask);
}

// Flap: repaint under the seal by copying along the flap's straight edge, so the double gold
// border reaches the tip.
const flapHole = new Uint8ClampedArray(W * H);
for (let y = 360; y < H; y++) for (let x = AXIS - 118; x < AXIS; x++) if (flapMask[y * W + x] > 0) flapHole[y * W + x] = 255;
const flapImg = { data: Buffer.from(sym.data), w: W, h: H };
flatten(flapImg, erode(flapMask, W, H, 4), flapHole);
const edgeDir = (() => { const l = Math.hypot(1, slope); return [-1 / l, -slope / l]; })();
applyFill(flapImg, flapHole, shiftFill(flapImg, flapHole, edgeDir), erode(flapMask, W, H, 4));

/** Gold leaf: warm, saturated pixels (the red wax is excluded by hue). */
function goldOf(img) {
  const g = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = img.data[i * 4], gg = img.data[i * 4 + 1], b = img.data[i * 4 + 2], mxv = Math.max(r, gg, b), s = mxv ? (mxv - Math.min(r, gg, b)) / mxv : 0;
    g[i] = r >= gg && gg > b && (r - gg) < (gg - b) * 1.6 ? smooth(.24, .42, s) : 0;
  }
  return g;
}

/** Colour (alpha = mask) and detail maps for one part, with the photo's lighting divided out. */
async function bake(name, img, mask, crop) {
  const gold = goldOf(img), L = new Float32Array(W * H), weight = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) { L[i] = lumOf(img.data, i); weight[i] = (mask[i] / 255) * (1 - gold[i]); }
  const light = blurField(L, W, H, 14, weight);
  const color = Buffer.alloc(W * H * 4), detail = Buffer.alloc(W * H * 3);
  const flatL = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) { const k = PAPER / Math.max(60, light[i] || PAPER); flatL[i] = L[i] * k; }
  const fine = blurField(flatL, W, H, 1), mid = blurField(flatL, W, H, 4), emboss = blurField(gold, W, H, 1);
  for (let i = 0; i < W * H; i++) {
    const k = PAPER / Math.max(60, light[i] || PAPER), g = gold[i];
    for (let c = 0; c < 3; c++) color[i * 4 + c] = clamp(img.data[i * 4 + c] * k * (1 - g * .6) + [238, 190, 108][c] * g * .6);
    color[i * 4 + 3] = mask[i];
    detail[i * 3] = clamp(128 + (flatL[i] - fine[i]) * 1.6 + (flatL[i] - mid[i]) * 1.1 + emboss[i] * 46);
    detail[i * 3 + 1] = clamp(212 - 128 * g);
    detail[i * 3 + 2] = clamp(255 * g);
  }
  const h = crop ?? H, outH = Math.round(OUT_W * h / W);
  const write = (buf, channels, file, opts) => sharp(buf, { raw: { width: W, height: H, channels } }).extract({ left: 0, top: 0, width: W, height: h }).resize(OUT_W, outH).webp(opts).toFile(`${out}/${file}`);
  await write(color, 4, `${name}-color.webp`, { quality: 86, alphaQuality: 100, smartSubsample: true });
  await write(detail, 3, `${name}-detail.webp`, { quality: 80 });
  if (debug) await sharp(color, { raw: { width: W, height: H, channels: 4 } }).png().toFile(`${debug}/${name}-color.png`);
}

await fs.mkdir(out, { recursive: true });
// Inset the flap's alpha a pixel so no cast shadow rides along its edge.
const flapAlpha = feather(erode(flapMask, W, H, 1), W, H, 1);
const flapCrop = Math.ceil(tip[1] + 6);
await bake('flap', flapImg, flapAlpha, flapCrop);
await bake('body', body, pocketMask);

// Lining: deep red paper with a small gold buti on a staggered grid; the flap's inside also gets
// a double gold rule along its edge, like the outside.
const buti = `<pattern id="b" width="104" height="120" patternUnits="userSpaceOnUse"><g fill="#fff">
  ${[[52, 30], [0, 90], [104, 90]].map(([cx, cy]) => `<g transform="translate(${cx} ${cy})">${Array.from({ length: 8 }, (_, k) => `<ellipse rx="2.6" ry="7" cy="-7.6" transform="rotate(${k * 45})"/>`).join('')}<circle r="3"/></g>`).join('')}</g></pattern>`;
const butiMask = await svgMask(W, H, `<defs>${buti}</defs><rect width="${W}" height="${H}" fill="url(#b)"/>`);
// Grain from the pocket's paper (its lower half, mirrored up: above the pocket is still flap).
const paperGrain = (() => {
  const L = new Float32Array(W * H), gold = goldOf(body);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const j = (y < H / 2 ? H - 1 - y : y) * W + x; L[y * W + x] = lumOf(body.data, j) * (1 - gold[j]) + PAPER * gold[j]; }
  const b = blurField(L, W, H, 3); return L.map((v, i) => v - b[i]);
})();
async function lining(name, mask, rules, crop) {
  const color = Buffer.alloc(W * H * 4), detail = Buffer.alloc(W * H * 3);
  const ring = (a, b) => { const o = erode(mask, W, H, a), n = erode(mask, W, H, b); return o.map((v, i) => Math.max(0, v - n[i])); };
  const rule = rules ? [ring(15, 18), ring(23, 24)].reduce((m, r) => m.map((v, i) => Math.max(v, r[i]))) : new Uint8ClampedArray(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, g = Math.max(butiMask[i] * .55, rule[i] * .9) / 255, n = paperGrain[i] * .55, shade = 1 - .18 * (y / H);
    const base = [104 * shade + n, 30 * shade + n * .4, 44 * shade + n * .45];
    for (let c = 0; c < 3; c++) color[i * 4 + c] = clamp(base[c] * (1 - g) + [214, 164, 92][c] * g);
    color[i * 4 + 3] = mask[i];
    detail[i * 3] = clamp(128 + paperGrain[i] * 2.2 + g * 40);
    detail[i * 3 + 1] = clamp(190 - 110 * g);
    detail[i * 3 + 2] = clamp(255 * g);
  }
  const h = crop ?? H, outH = Math.round(OUT_W * .6 * h / W);
  const write = (buf, channels, file, opts) => sharp(buf, { raw: { width: W, height: H, channels } }).extract({ left: 0, top: 0, width: W, height: h }).resize(Math.round(OUT_W * .6), outH).webp(opts).toFile(`${out}/${file}`);
  await write(color, 4, `${name}-color.webp`, { quality: 84, alphaQuality: 100 });
  await write(detail, 3, `${name}-detail.webp`, { quality: 78 });
}
await lining('flap-inside', flapAlpha, true, flapCrop);
await lining('lining', new Uint8ClampedArray(W * H).fill(255), false);

// Wax seal: the photo's own seal (in the unmirrored face), squared up to round. Its centre and
// radii come from the embossed inner ring (radius .74 of the wax), measured on a zoomed crop. The
// model draws the lobed outline itself, so past .8 of the radius the wax is carried outwards and
// no paper from behind the seal is ever sampled.
const SEAL = { cx: 862.5, cy: 527.3, rx: 126, ry: 144.6 };
{
  const S = 512, color = Buffer.alloc(S * S * 3), detail = Buffer.alloc(S * S * 3);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const u = ((i + .5) / S * 2 - 1) * 1.08, v = ((j + .5) / S * 2 - 1) * 1.08, k = Math.min(1, .8 / Math.max(1e-6, Math.hypot(u, v)));
    const xi = Math.round(SEAL.cx + u * k * SEAL.rx), yi = Math.round(SEAL.cy + v * k * SEAL.ry), p = (yi * FW + xi) * 4, o = j * S + i;
    const r = flat.data[p], g = flat.data[p + 1], b = flat.data[p + 2], gold = g > b * 1.15 && r > 120 && g > 70 ? smooth(.3, .55, (g - b) / Math.max(1, r)) : 0;
    for (let c = 0; c < 3; c++) color[o * 3 + c] = flat.data[p + c];
    detail[o * 3] = clamp(lumOf(flat.data, yi * FW + xi) * .7 + 30);
    detail[o * 3 + 1] = clamp(110 - 40 * gold);
    detail[o * 3 + 2] = clamp(255 * gold);
  }
  await sharp(color, { raw: { width: S, height: S, channels: 3 } }).webp({ quality: 88 }).toFile(`${out}/seal-color.webp`);
  await sharp(detail, { raw: { width: S, height: S, channels: 3 } }).webp({ quality: 88 }).toFile(`${out}/seal-detail.webp`);
}

// Face units: the face is 1 wide; y runs down from the flap's hinge.
const u = v => +(v / W).toFixed(4);
await fs.writeFile(`${out}/geometry.json`, JSON.stringify({
  height: u(H),
  flap: { tip: u(tip[1]), crop: u(flapCrop) },
  pocket: pocketPoly.map(([x, y]) => [u(x), u(y)]),
  // The texture spans 1.08 radii each way from the centre.
  seal: { center: [.5, u(tip[1] - 46)], radius: u(SEAL.rx) },
}, null, 1));
if (debug) {
  await sharp(sym.data, { raw: { width: W, height: H, channels: 4 } }).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><polygon points="${pts(flapPoly)}" fill="none" stroke="#f00" stroke-width="1.5"/><polygon points="${pts(pocketPoly)}" fill="none" stroke="#00f" stroke-width="1.5"/></svg>`) }]).png().toFile(`${debug}/outlines.png`);
}
console.log('envelope model textures written to', out, { slope: slope.toFixed(3), tip: tip.map(v => v.toFixed(1)) });
