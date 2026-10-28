// Small raster helpers for cutting the theme invitation objects into animatable parts
// (scripts/cut-invitation-objects.mjs). Everything works on raw RGBA buffers from sharp.
import sharp from 'sharp';

export async function load(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

export const lum = (img, x, y) => {
  x = Math.max(0, Math.min(img.w - 1, Math.round(x))); y = Math.max(0, Math.min(img.h - 1, Math.round(y)));
  const i = (y * img.w + x) * 4;
  return .2126 * img.data[i] + .7152 * img.data[i + 1] + .0722 * img.data[i + 2];
};

/** Rasterise SVG shapes (in image pixels) into a 0–255 alpha mask. */
export async function svgMask(w, h, shapes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${shapes}</svg>`;
  const { data } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const m = new Uint8ClampedArray(w * h);
  for (let i = 0; i < m.length; i++) m[i] = data[i * 4 + 3];
  return m;
}

export const pts = list => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/** Resample a polyline every `step` px. */
export function resample(line, step = 3) {
  const out = [];
  for (let i = 0; i < line.length - 1; i++) {
    const [x0, y0] = line[i], [x1, y1] = line[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 0; k < n; k++) out.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]);
  }
  out.push(line.at(-1));
  return out;
}

/** Snap a polyline outward onto the shadow a raised edge casts: along each outward normal,
 *  find the darkest point of the shadow, then the steepest drop just before it. */
export function snapToShadow(img, line, { side = 1, from = -6, to = 40, keep = () => false } = {}) {
  const dense = resample(line);
  const offsets = dense.map((p, i) => {
    if (keep(p)) return null;
    const a = dense[Math.max(0, i - 2)], b = dense[Math.min(dense.length - 1, i + 2)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const len = Math.hypot(nx, ny) || 1; nx = nx / len * side; ny = ny / len * side;
    const prof = [];
    for (let t = from; t <= to; t++) prof.push((lum(img, p[0] + nx * (t - 1), p[1] + ny * (t - 1)) + lum(img, p[0] + nx * t, p[1] + ny * t) * 2 + lum(img, p[0] + nx * (t + 1), p[1] + ny * (t + 1))) / 4);
    let dark = 4; for (let k = 4; k < prof.length; k++) if (prof[k] < prof[dark]) dark = k;
    let edge = Math.max(1, dark - 14), best = 0;
    for (let k = Math.max(1, dark - 14); k <= dark; k++) { const d = prof[k] - prof[k - 1]; if (d < best) { best = d; edge = k; } }
    return { nx, ny, t: edge + from };
  });
  // Median-smooth the offsets so a stray ornament never pulls the edge.
  const ts = offsets.map(o => o?.t);
  return dense.map((p, i) => {
    const o = offsets[i];
    if (!o) return p;
    const win = ts.slice(Math.max(0, i - 4), i + 5).filter(v => v !== undefined).sort((x, y) => x - y);
    const t = win[win.length >> 1];
    return [p[0] + o.nx * t, p[1] + o.ny * t];
  });
}

/** Binary dilation (square radius r) of a 0–255 mask. */
export function dilate(m, w, h, r) {
  const tmp = new Uint8ClampedArray(m.length), out = new Uint8ClampedArray(m.length);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const xx = x + k; if (xx >= 0 && xx < w && m[y * w + xx] > 127) v = 255; } tmp[y * w + x] = v; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0; for (let k = -r; k <= r && !v; k++) { const yy = y + k; if (yy >= 0 && yy < h && tmp[yy * w + x] > 127) v = 255; } out[y * w + x] = v; }
  return out;
}

/** Binary erosion (square radius r). */
export function erode(m, w, h, r) {
  return dilate(m.map(v => 255 - v), w, h, r).map(v => 255 - v);
}

/** Fill holes: everything not reachable from the border through unmasked pixels. */
export function fillHoles(m, w, h) {
  const seen = new Uint8Array(m.length), q = [];
  const push = (x, y) => { const i = y * w + x; if (x < 0 || y < 0 || x >= w || y >= h || seen[i] || m[i] > 127) return; seen[i] = 1; q.push(i); };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (q.length) { const i = q.pop(), x = i % w, y = (i / w) | 0; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
  const out = new Uint8ClampedArray(m.length);
  for (let i = 0; i < m.length; i++) out[i] = seen[i] ? 0 : 255;
  return out;
}

/** Largest connected component of a mask (drops stray specks of matching colour). */
export function largest(m, w, h, count = 1) {
  const label = new Int32Array(m.length), sizes = [0];
  for (let s = 0; s < m.length; s++) {
    if (m[s] < 128 || label[s]) continue;
    const id = sizes.length, q = [s]; label[s] = id; let n = 0;
    while (q.length) {
      const i = q.pop(); n++; const x = i % w, y = (i / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy, j = yy * w + xx; if (xx >= 0 && yy >= 0 && xx < w && yy < h && m[j] > 127 && !label[j]) { label[j] = id; q.push(j); } }
    }
    sizes.push(n);
  }
  // The `count` largest components, ignoring specks under 400 px.
  const keep = new Set(sizes.map((n, i) => [n, i]).slice(1).filter(([n], k) => n >= 400 || count === 1).sort((a, b) => b[0] - a[0]).slice(0, count).map(([, i]) => i));
  const out = new Uint8ClampedArray(m.length);
  for (let i = 0; i < m.length; i++) out[i] = keep.has(label[i]) ? 255 : 0;
  return out;
}

/** Box-blur a mask into a soft alpha edge. */
export function feather(m, w, h, r) {
  if (r < 1) return m;
  const pass = (src, horiz) => {
    const out = new Uint8ClampedArray(src.length);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let s = 0, n = 0;
      for (let k = -r; k <= r; k++) { const xx = horiz ? x + k : x, yy = horiz ? y : y + k; if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += src[yy * w + xx]; n++; } }
      out[y * w + x] = s / n;
    }
    return out;
  };
  return pass(pass(m, true), false);
}

/** Write an RGBA buffer, keeping only `alpha` (multiplied into the source alpha). */
export async function writeLayer(img, alpha, path, crop) {
  const out = Buffer.from(img.data);
  // Colour under fully transparent pixels is zeroed so the source PNGs compress.
  for (let i = 0; i < img.w * img.h; i++) { const a = Math.round(out[i * 4 + 3] * alpha[i] / 255); out[i * 4 + 3] = a; if (!a) out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 0; }
  let s = sharp(out, { raw: { width: img.w, height: img.h, channels: 4 } });
  if (crop) s = sharp(await s.png().toBuffer()).extract(crop);
  await s.png({ compressionLevel: 9 }).toFile(path);
}

/** Resample the quad `[TL, TR, BR, BL]` of `img` onto a flat W × H image (a homography). */
export function unwarp(img, [[x0, y0], [x1, y1], [x2, y2], [x3, y3]], W, H) {
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1, g = (sx * dy2 - dx2 * sy) / det, h = (dx1 * sy - sx * dy1) / det;
  const m = [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h];
  const data = Buffer.alloc(W * H * 4);
  const at = (x, y, c) => img.data[(Math.min(img.h - 1, Math.max(0, y)) * img.w + Math.min(img.w - 1, Math.max(0, x))) * 4 + c];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const u = (i + .5) / W, v = (j + .5) / H, z = m[6] * u + m[7] * v + 1;
    const x = (m[0] * u + m[1] * v + m[2]) / z - .5, y = (m[3] * u + m[4] * v + m[5]) / z - .5;
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    for (let c = 0; c < 4; c++) data[(j * W + i) * 4 + c] = (at(xi, yi, c) * (1 - fx) + at(xi + 1, yi, c) * fx) * (1 - fy) + (at(xi, yi + 1, c) * (1 - fx) + at(xi + 1, yi + 1, c) * fx) * fy;
  }
  return { data, w: W, h: H };
}

/** Three box-blur passes (≈ Gaussian) of a float field; `weight` (0–1) makes it a normalised
 *  convolution, so only weighted samples count (e.g. paper but not ornament). */
export function blurField(f, w, h, r, weight) {
  const box = (src, horiz) => {
    const out = new Float32Array(src.length);
    for (let a = 0; a < (horiz ? h : w); a++) {
      let s = 0; const n = horiz ? w : h, idx = k => horiz ? a * w + k : k * w + a;
      for (let k = -r; k <= r; k++) s += src[idx(Math.min(n - 1, Math.max(0, k)))];
      for (let k = 0; k < n; k++) { out[idx(k)] = s / (2 * r + 1); s += src[idx(Math.min(n - 1, k + r + 1))] - src[idx(Math.max(0, k - r))]; }
    }
    return out;
  };
  const run = src => { let g = src; for (let p = 0; p < 3; p++) g = box(box(g, true), false); return g; };
  if (!weight) return run(f);
  const num = run(f.map((v, i) => v * weight[i])), den = run(weight);
  return num.map((v, i) => den[i] > 1e-4 ? v / den[i] : 0);
}
