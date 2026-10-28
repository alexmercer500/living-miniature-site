// Cuts each Rajasthan theme's invitation object (a single photo-real PNG) into the parts the
// envelope chapter animates, and records their geometry. Run after replacing either object:
//   node scripts/cut-invitation-objects.mjs [debugDir]
// Amber Fort (envelope): flap, body (pocket) and wax seal + tassel, with the paper hidden under
// the seal and tassel repainted and the flap's gold border lines carried to its tip.
// Lake City (scroll): ribbon, and the rolled scroll with the paper under the ribbon repainted.
// Outputs land next to each source in `object/` (PNG layers + geometry.json, in layer pixels).
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { load, svgMask, pts, snapToShadow, dilate, erode, fillHoles, largest, feather, writeLayer } from './object-cut-lib.mjs';

const debug = process.argv[2];
const root = 'src/assets/rajasthan';

const hsv = (r, g, b) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return { v: mx, s: mx ? (mx - mn) / mx : 0 }; };
const sub = (a, b) => a.map((v, i) => Math.max(0, v - b[i]));
const and = (a, b) => a.map((v, i) => Math.min(v, b[i]));
const alphaOf = img => { const m = new Uint8ClampedArray(img.w * img.h); for (let i = 0; i < m.length; i++) m[i] = img.data[i * 4 + 3]; return m; };
const bboxOf = (m, w, h, pad = 0) => {
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x] > 8) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { left: Math.max(0, x0 - pad), top: Math.max(0, y0 - pad), width: Math.min(w, x1 + pad + 1) - Math.max(0, x0 - pad), height: Math.min(h, y1 + pad + 1) - Math.max(0, y0 - pad) };
};
const lineAt = ([x0, y0], [x1, y1]) => x => y0 + (y1 - y0) * (x - x0) / (x1 - x0);

/** Repaint `hole` pixels as plain paper: a smooth (harmonic) fill diffused in from the paper
 *  around the hole, so it follows the surrounding shading, plus the grain of a clean patch.
 *  Only paper-like pixels inside `region` count as the boundary: ornament never bleeds in. */
function paintPaper(img, hole, region, patch) {
  const { w, h, data } = img;
  const bb = bboxOf(hole, w, h, 3);
  const x0 = bb.left, y0 = bb.top, bw = bb.width, bh = bb.height;
  const paperLike = i => { const s = hsv(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]); return region[i] > 200 && s.v > 110 && s.s < .3; };
  // state: 0 = ignore, 1 = fixed boundary, 2 = unknown (solved)
  const state = new Uint8Array(bw * bh), val = new Float32Array(bw * bh * 3);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const i = (y0 + y) * w + x0 + x, k = y * bw + x;
    if (hole[i] > 0) state[k] = 2; else if (paperLike(i)) { state[k] = 1; for (let c = 0; c < 3; c++) val[k * 3 + c] = data[i * 4 + c]; }
  }
  // Seed unknowns with the boundary mean, then relax (Gauss-Seidel) towards Laplace's equation.
  const seed = [0, 0, 0]; let n = 0;
  for (let k = 0; k < bw * bh; k++) if (state[k] === 1) { for (let c = 0; c < 3; c++) seed[c] += val[k * 3 + c]; n++; }
  for (let k = 0; k < bw * bh; k++) if (state[k] === 2) for (let c = 0; c < 3; c++) val[k * 3 + c] = seed[c] / Math.max(1, n);
  for (let it = 0; it < 900; it++) for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const k = y * bw + x; if (state[k] !== 2) continue;
    let s0 = 0, s1 = 0, s2 = 0, m = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= bw || yy >= bh) continue; const j = yy * bw + xx; if (!state[j]) continue; s0 += val[j * 3]; s1 += val[j * 3 + 1]; s2 += val[j * 3 + 2]; m++; }
    if (m) { val[k * 3] = s0 / m; val[k * 3 + 1] = s1 / m; val[k * 3 + 2] = s2 / m; }
  }
  const mean = (px, py) => { let sum = 0, cnt = 0; for (let k = -3; k <= 3; k++) for (let j = -3; j <= 3; j++) { const i = ((py + k) * w + px + j) * 4; sum += data[i] + data[i + 1] + data[i + 2]; cnt += 3; } return sum / cnt; };
  const soft = feather(hole, w, h, 3);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    const i = (y0 + y) * w + x0 + x, k = y * bw + x; if (!soft[i] || state[k] !== 2) continue;
    const px = patch.left + (x % patch.width), py = patch.top + (y % patch.height), pi = (py * w + px) * 4;
    const g = (data[pi] + data[pi + 1] + data[pi + 2]) / 3 - mean(px, py), a = soft[i] / 255;
    for (let c = 0; c < 3; c++) data[i * 4 + c] = data[i * 4 + c] * (1 - a) + Math.max(0, Math.min(255, val[k * 3 + c] + g)) * a;
  }
}

async function amberFort() {
  const dir = `${root}/amber-fort`;
  const img = await load(`${dir}/invitation-object.png`);
  const { w, h } = img, alpha = alphaOf(img);
  // Flap outline: the corner and right lobes traced by hand on zoomed crops; the scalloped
  // left lobes and long left edge snapped to the shadow the flap casts; the two straight edges
  // meet at the flap's tip under the seal.
  // Snapped, then averaged along the curve: a paper edge is smooth, the snap is not quite.
  const snapped = snapToShadow(img, [[790, 530], [750, 530], [550, 488], [383, 415], [347, 392], [321, 361], [303, 330], [270, 331], [218, 315], [192, 289]], { side: -1 });
  const lobes = snapped.map((p, i) => { const win = snapped.slice(Math.max(0, i - 5), i + 6); return [win.reduce((s, q) => s + q[0], 0) / win.length, win.reduce((s, q) => s + q[1], 0) / win.length]; }).filter((_, i) => i % 2 === 0);
  const left = lineAt([550, 488.3], [750, 530.5]), right = lineAt([1331, 302], [1012, 507.5]);
  const tipX = (302 + .645 * 1331 - 488.3 + .2125 * 550) / (.645 + .2125), tip = [tipX, left(tipX)];
  const flap = [
    [137, 186], [1380, 72], [1420, 92], [1422, 160], // top edge and right side lie on the silhouette
    [1407, 161], [1403, 188], [1396, 206], [1384, 218], [1366, 230], [1353, 243], [1340, 262], [1326, 282], [1318, 297],
    [1331, 302], tip, ...lobes.filter(([x]) => x < 790 && x >= 192),
    [180, 288], [170, 276], [162, 258], [156.7, 239.3], [147.3, 220.7], [136.7, 200.7],
  ];
  const flapMask = and(await svgMask(w, h, `<polygon points="${pts(flap)}"/>`), alpha);
  // Wax seal and tassel: deep red, plus the gold bead and cap on the tassel's axis.
  const red = new Uint8ClampedArray(w * h);
  for (let y = 380; y < 950; y++) for (let x = 740; x < 1060; x++) {
    const i = y * w + x, r = img.data[i * 4], g = img.data[i * 4 + 1], b = img.data[i * 4 + 2], s = hsv(r, g, b);
    // Wax and threads are crimson: green well under half of red (gilt ornament is ~0.6–0.75).
    const isRed = r > 40 && g < r * .5 && b < r * .62 && s.s > .4;
    const isTrim = x > 884 && x < 932 && y > 592 && y < 722 && s.s > .42;
    if (isRed || isTrim) red[i] = 255;
  }
  // Fill the emblem (fully ringed by wax) before dilating, so ornament merely touching the wax stays on the flap.
  const seal = feather(dilate(fillHoles(largest(red, w, h, 4), w, h), w, h, 2), w, h, 1);
  // The repaint reaches a little past the seal and tassel to take their cast shadow with them.
  // The light comes from the upper right, so the tassel's shadow falls left and down of it.
  const shadowed = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!seal[i]) continue; for (let d = 0; d <= 48; d += 4) { const j = (Math.min(h - 1, y + (d >> 2))) * w + Math.max(0, x - d); shadowed[j] = Math.max(shadowed[j], seal[i]); } }
  const sealOnFlap = and(dilate(seal, w, h, 5), flapMask), sealOnBody = sub(and(dilate(shadowed, w, h, 12), alpha), flapMask);
  // Repaint what the seal hid on the flap, then carry the flap's double gold border to its tip.
  paintPaper(img, sealOnFlap, flapMask, { left: 560, top: 165, width: 110, height: 60 });
  const goldLines = [];
  for (const [a, b] of [[[550, 488.3], [750, 530.5]], [[1331, 302], [1012, 507.5]]]) {
    // Inward normal (towards the flap) and the two printed rules found along it.
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    let nx = dy / len, ny = -dx / len; if (ny > 0) { nx = -nx; ny = -ny; }
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], prof = [];
    for (let t = 0; t < 45; t++) { const i = (Math.round(mid[1] + ny * t) * w + Math.round(mid[0] + nx * t)) * 4; prof.push(img.data[i] + img.data[i + 1] - 2 * img.data[i + 2]); }
    const peaks = prof.map((v, t) => [v, t]).filter(([v, t]) => t > 2 && t < 44 && v >= prof[t - 1] && v >= prof[t + 1]).sort((p, q) => q[0] - p[0]).slice(0, 2).map(([, t]) => t).sort((p, q) => p - q);
    goldLines.push(peaks.map(t => [[a[0] + nx * t, a[1] + ny * t], [b[0] + nx * t, b[1] + ny * t]]));
  }
  const meet = (p, q) => { const [[x1, y1], [x2, y2]] = p, [[x3, y3], [x4, y4]] = q, d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4), t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d; return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]; };
  const strokes = goldLines[0].map((l, k) => { const m = meet(l, goldLines[1][k]); return `<polyline points="${pts([l[0], m, goldLines[1][k][0]])}" fill="none" stroke="#b07f37" stroke-width="2.4" stroke-linejoin="miter"/>`; }).join('');
  const lineLayer = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${strokes}</svg>`)).ensureAlpha().raw().toBuffer();
  const lineMask = feather(sealOnFlap, w, h, 2);
  for (let i = 0; i < w * h; i++) { const a = lineLayer[i * 4 + 3] / 255 * lineMask[i] / 255 * .9; if (a) for (let k = 0; k < 3; k++) img.data[i * 4 + k] = img.data[i * 4 + k] * (1 - a) + lineLayer[i * 4 + k] * a; }
  // Repaint the body under the seal's lower half and the tassel. The tassel hung past the
  // envelope's bottom edge: below that edge (measured either side of it) is background.
  paintPaper(img, sealOnBody, sub(alpha, flapMask), { left: 1010, top: 640, width: 120, height: 120 });
  const bottomAt = x => { let y = h - 1; while (y > 0 && alpha[y * w + x] < 128) y--; return y; };
  const floor = lineAt([760, bottomAt(760)], [1060, bottomAt(1060)]);
  for (let y = 0; y < h; y++) for (let x = 760; x < 1060; x++) { const i = y * w + x, d = y - floor(x); if (d > -1 && sealOnBody[i]) alpha[i] = Math.round(alpha[i] * Math.max(0, Math.min(1, .5 - d))); }

  const crop = bboxOf(alpha, w, h, 2);
  const out = `${dir}/object`;
  await fs.mkdir(out, { recursive: true });
  const original = await load(`${dir}/invitation-object.png`);
  await writeLayer(img, flapMask, `${out}/flap.png`, crop);
  await writeLayer(img, sub(alpha, flapMask), `${out}/body.png`, crop);
  await writeLayer(original, seal, `${out}/seal.png`, crop);
  const local = ([x, y]) => [+(x - crop.left).toFixed(1), +(y - crop.top).toFixed(1)];
  // The wax disc alone (the tassel hangs below y≈612): its centre is where the seal button sits.
  const disc = seal.map((v, i) => (i / w | 0) < 612 ? v : 0), sealBox = bboxOf(disc, w, h);
  const geometry = {
    width: crop.width, height: crop.height,
    flap: flap.map(local), hinge: [local([137, 197]), local([1380, 91])], tip: local(tip),
    seal: { x: +(sealBox.left - crop.left + sealBox.width / 2).toFixed(1), y: +(sealBox.top - crop.top + sealBox.height / 2).toFixed(1), r: +(Math.max(sealBox.width, sealBox.height) / 2).toFixed(1) },
  };
  await fs.writeFile(`${out}/geometry.json`, JSON.stringify(geometry, null, 1) + '\n');
  if (debug) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><polygon points="${pts(flap)}" fill="#00f2" stroke="#0ff" stroke-width="1.5"/></svg>`;
    await sharp(await sharp(img.data, { raw: { width: w, height: h, channels: 4 } }).flatten({ background: '#333' }).composite([{ input: Buffer.from(svg) }]).png().toBuffer()).resize(1400).jpeg({ quality: 82 }).toFile(`${debug}/amber-cut.jpg`);
  }
  console.log('amber-fort', crop, 'tip', tip.map(Math.round), 'gold rules', goldLines.map(g => g.length));
}

async function lakeCity() {
  const dir = `${root}/lake-city`;
  const img = await load(`${dir}/invitation-object.png`);
  const { w, h, data } = img, alpha = alphaOf(img);
  // Ribbon: salmon pink keeps blue close to green; the gilt piping and caps do not. The knot's
  // medallion is ringed by pink, so filling holes takes it along.
  const pink = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], s = hsv(r, g, b);
    const x = i % w, y = i / w | 0; // the bow, band and tails all lie in this box
    if (x > 540 && x < 1240 && y > 170 && y < 960 && data[i * 4 + 3] > 128 && r > 70 && r > g * 1.22 && b > g * .74 && s.s > .19) pink[i] = 255;
  }
  // Pink plus its gilt piping, with small gaps closed (not every enclosed hole: the loops frame
  // patches of printed scroll), and the knot's gold medallion added as a disc.
  const piped = dilate(largest(pink, w, h, 12), w, h, 4);
  const knotDisc = await svgMask(w, h, '<circle cx="834" cy="420" r="60"/>');
  const closed = erode(dilate(piped, w, h, 7), w, h, 7).map((v, i) => Math.max(v, knotDisc[i]));
  const ribbon = feather(largest(closed, w, h, 6), w, h, 1);
  // The rolled paper's silhouette, measured on columns clear of the ribbon and the end caps.
  const span = x => { let t = 0, b = h - 1; while (t < h && alpha[t * w + x] < 128) t++; while (b > 0 && alpha[b * w + x] < 128) b--; return [t, b]; };
  // (Every column right of the bow is crossed by a hanging tail, so both come from the left.)
  const [t1, b1] = span(300), [t2, b2] = span(550);
  const top = lineAt([300, t1], [550, t2]), bottom = lineAt([300, b1], [550, b2]);
  // Cross-section profile (colour by position across the roll): per slice, the bright end of
  // the samples, so the darker printed vines never leak into the plain paper.
  const BINS = 200, prof = Array.from({ length: BINS }, () => [[], [], []]);
  for (const x of [...Array(260).keys()].map(k => 330 + k).concat([...Array(160).keys()].map(k => 960 + k))) {
    const yt = top(x), yb = bottom(x);
    for (let y = Math.ceil(yt); y <= yb; y++) { const i = y * w + x; if (ribbon[i]) continue; const k = Math.min(BINS - 1, Math.floor((y - yt) / (yb - yt) * BINS)); for (let c = 0; c < 3; c++) prof[k][c].push(data[i * 4 + c]); }
  }
  const profile = prof.map(([r, g, b]) => { const order = r.map((_, k) => k).sort((p, q) => (r[p] + g[p] + b[p]) - (r[q] + g[q] + b[q])); const k = order[Math.floor(order.length * .75)] ?? 0; return [r[k] ?? 0, g[k] ?? 0, b[k] ?? 0]; });
  // Repaint the roll where the ribbon covered it; elsewhere under the ribbon is background.
  const capL = 210, capR = 1235; // the paper runs between the gilt end caps
  // A wide, soft repaint edge: printed vines fade out under where the ribbon was.
  // (Reaching 12 px past the ribbon also takes the shadow its band casts on the paper.)
  const soft = feather(dilate(ribbon, w, h, 12), w, h, 6);
  const out = Buffer.from(data), outAlpha = new Uint8ClampedArray(alpha);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (!soft[i]) continue;
    const a = soft[i] / 255, yt = top(x), yb = bottom(x), f = (y - yt) / (yb - yt);
    const inside = x > capL && x < capR ? Math.max(0, Math.min(1, Math.min(y - yt, yb - y) + .5)) : 0;
    if (inside > 0) {
      const c = profile[Math.max(0, Math.min(BINS - 1, Math.floor(f * BINS)))];
      for (let k = 0; k < 3; k++) out[i * 4 + k] = data[i * 4 + k] * (1 - a) + Math.max(0, Math.min(255, c[k])) * a; // satin-smooth paper: no grain
    }
    outAlpha[i] = Math.round(alpha[i] * (1 - a) + 255 * inside * a);
  }
  // Between the end caps the roll is exactly its band: whatever the ribbon left outside it (the
  // tails' gilt piping over the background) goes.
  for (let y = 0; y < h; y++) for (let x = capL; x < capR; x++) { const i = y * w + x; outAlpha[i] = Math.round(outAlpha[i] * Math.max(0, Math.min(1, Math.min(y - top(x), bottom(x) - y) + .5))); }
  // Past the right cap a tail's tip still hangs below the roll.
  for (let y = 0; y < h; y++) for (let x = capR; x < w; x++) if (y > bottom(x) + 40) outAlpha[y * w + x] = 0;
  // Seamless blend: the profile is right on average but not where the photo's lighting drifts
  // along the roll. Diffuse the photo-minus-profile difference from the repaint's edge inwards.
  {
    const region = soft.map((v, i) => { const x = i % w, y = i / w | 0; return v > 0 && x > capL && x < capR && y > top(x) + 2 && y < bottom(x) - 2 ? 1 : 0; });
    const bb = bboxOf(region.map(v => v * 255), w, h, 2), bw = bb.width, bh = bb.height;
    const state = new Uint8Array(bw * bh), diff = new Float32Array(bw * bh * 3);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const X = bb.left + x, Y = bb.top + y, i = Y * w + X, k = y * bw + x;
      if (X <= capL || X >= capR || Y <= top(X) + 2 || Y >= bottom(X) - 2) continue;
      if (soft[i] > 250) state[k] = 2;
      else if (!soft[i] && !ribbon[i]) { state[k] = 1; const f = (Y - top(X)) / (bottom(X) - top(X)), c = profile[Math.max(0, Math.min(BINS - 1, Math.floor(f * BINS)))]; for (let ch = 0; ch < 3; ch++) diff[k * 3 + ch] = data[i * 4 + ch] - c[ch]; }
    }
    for (let it = 0; it < 1200; it++) for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const k = y * bw + x; if (state[k] !== 2) continue;
      let a0 = 0, a1 = 0, a2 = 0, m = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= bw || yy >= bh) continue; const j = yy * bw + xx; if (!state[j]) continue; a0 += diff[j * 3]; a1 += diff[j * 3 + 1]; a2 += diff[j * 3 + 2]; m++; }
      if (m) { diff[k * 3] = a0 / m; diff[k * 3 + 1] = a1 / m; diff[k * 3 + 2] = a2 / m; }
    }
    // Clamp the correction: it only evens out lighting, it never paints print back in.
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const k = y * bw + x; if (state[k] !== 2) continue; const i = (bb.top + y) * w + bb.left + x;
      for (let ch = 0; ch < 3; ch++) out[i * 4 + ch] = Math.max(0, Math.min(255, out[i * 4 + ch] + Math.max(-28, Math.min(28, diff[k * 3 + ch]))));
    }
  }
  const roll = { data: out, w, h };
  const both = alpha.map((v, i) => Math.max(v, outAlpha[i]));
  const crop = bboxOf(both, w, h, 2);
  const dest = `${dir}/object`;
  await fs.mkdir(dest, { recursive: true });
  await writeLayer({ data: (() => { const d = Buffer.from(out); for (let i = 0; i < w * h; i++) d[i * 4 + 3] = 255; return d; })(), w, h }, outAlpha, `${dest}/roll.png`, crop);
  await writeLayer(img, ribbon, `${dest}/ribbon.png`, crop);
  const local = ([x, y]) => [+(x - crop.left).toFixed(1), +(y - crop.top).toFixed(1)];
  const angle = Math.atan2((t2 + b2) - (t1 + b1), 500) * 180 / Math.PI; // of the axis
  const geometry = {
    width: crop.width, height: crop.height, angle: +angle.toFixed(2),
    // Axis of the roll (centre line between its top and bottom silhouette), end to end.
    axis: [local([150, (top(150) + bottom(150)) / 2]), local([1460, (top(1460) + bottom(1460)) / 2])],
    thickness: +((b1 - t1) * Math.cos(angle * Math.PI / 180)).toFixed(1),
    // Length of the paper between the end caps, measured along the axis (its width once unrolled).
    paperLength: +((capR - capL) / Math.cos(angle * Math.PI / 180)).toFixed(1),
    knot: local([834, 420]), // the medallion at the bow's centre
  };
  await fs.writeFile(`${dest}/geometry.json`, JSON.stringify(geometry, null, 1) + '\n');
  console.log('lake-city', crop, geometry);
}

await amberFort();
await lakeCity();
