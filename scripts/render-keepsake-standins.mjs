// Renders each Rajasthan keepsake's stand-in from its own 3D model, so the guest sees the same
// envelope / scroll before the model is drawn (and on devices that never draw it). The parts land
// in `object/` as PNG layers + geometry.json, where scripts/cut-invitation-objects.mjs used to put
// photo cut-outs; Envelope.astro plays its CSS stages on them.
//   npm run dev   (in another terminal; this uses the dev-only `?standin` hook in the models)
//   chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp> about:blank
//   node scripts/render-keepsake-standins.mjs [http://localhost:4321]
import fs from 'node:fs/promises';
import sharp from 'sharp';

const base = process.argv[2] ?? 'http://localhost:4321';
const root = 'src/assets/rajasthan';
const WIDTH = { 'amber-fort': 1396, 'lake-city': 1519 }; // layer pixels per rig width

const target = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => socket.addEventListener('open', r, { once: true }));
let id = 0, loaded = () => {}; const pending = new Map();
socket.addEventListener('message', ({ data }) => { const m = JSON.parse(String(data)); if (m.method === 'Page.loadEventFired') loaded(); const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
const command = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async expression => { const r = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
const png = dataUrl => Buffer.from(dataUrl.split(',')[1], 'base64');

/** Open a theme with its model drawn (wide screen, so the model loads on idle). */
async function open(theme) {
  await command('Page.enable'); await command('Page.bringToFront');
  await command('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const load = new Promise(resolve => { loaded = resolve; });
  await command('Page.navigate', { url: `${base}/${theme}/?standin` });
  await load;
  await waitForModel();
  // The dev server may reload the page once (e.g. after optimizing a dependency): settle first.
  await new Promise(r => setTimeout(r, 3000));
  if (!(await evaluate('typeof window.__standIn === "function"'))) { console.warn(theme, 'reloaded; waiting again', await evaluate('location.href')); await waitForModel(); }
}
async function waitForModel() {
  await evaluate(`new Promise((resolve, reject) => { const t = Date.now(); (function wait() { if (window.__standIn && document.querySelector('.envelope-rig.object-3d, .envelope-rig canvas')) resolve(true); else if (Date.now() - t > 60000) reject(new Error('model not drawn')); else setTimeout(wait, 250); })(); })`);
}

/** The flap's outline (layer pixels) from its alpha: each row's outermost opaque pixels, down one
 *  side and up the other (the flap is one scalloped piece, widest at the hinge). */
async function outline(file) {
  const { data, info } = await sharp(file).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const left = [], right = [];
  for (let y = 0; y < info.height; y += 4) {
    let x0 = -1, x1 = -1;
    for (let x = 0; x < info.width; x++) if (data[y * info.width + x] > 127) { if (x0 < 0) x0 = x; x1 = x; }
    if (x0 >= 0) { left.push([x0, y]); right.push([x1 + 1, y]); }
  }
  return [...left, ...right.reverse()];
}

// Amber Fort: lining + pocket (the body), the flap, the wax seal with its tassel.
{
  const theme = 'amber-fort', out = `${root}/${theme}/object`, width = WIDTH[theme];
  await open(theme);
  // Every part is drawn before any is written: a new file under src/ reloads the dev page.
  const images = {};
  for (const [file, parts] of [['body', ['lining', 'pocket']], ['flap', ['flap']], ['seal', ['seal']]]) images[file] = await evaluate(`window.__standIn(${JSON.stringify(parts)}, ${width})`);
  const spec = await evaluate(`JSON.parse(document.querySelector('.envelope-rig').dataset.model).geometry`);
  for (const [file, image] of Object.entries(images)) await fs.writeFile(`${out}/${file}.png`, png(image));
  const { height } = await sharp(`${out}/body.png`).metadata();
  const flap = await outline(`${out}/flap.png`);
  const tip = flap.reduce((a, b) => (b[1] > a[1] ? b : a));
  const geometry = {
    width, height, flap,
    hinge: [[0, 0], [width, 0]], tip,
    seal: { x: +(spec.seal.center[0] * width).toFixed(1), y: +(spec.seal.center[1] * width).toFixed(1), r: +(spec.seal.radius * width).toFixed(1) },
  };
  await fs.writeFile(`${out}/geometry.json`, JSON.stringify(geometry, null, 1));
  console.log(theme, width, height, 'flap points', flap.length, 'tip', tip);
}

// Lake City: the roll (paper and finials) and the ribbon (bow, band and medallion).
{
  // Lifted to full size the roll and the bow's tails reach past the rig: the layers' frame is PAD
  // rig widths larger on every side (`rig` is the rig's box inside it).
  const theme = 'lake-city', out = `${root}/${theme}/object`, width = WIDTH[theme], PAD = .3;
  await open(theme);
  const roll = await evaluate(`window.__standIn('roll', ${width}, ${PAD})`);
  const ribbon = await evaluate(`window.__standIn('ribbon', ${width}, ${PAD})`);
  const paper = (await evaluate(`JSON.parse(document.querySelector('.envelope-rig').dataset.model).geometry.paper`)) * width;
  await fs.writeFile(`${out}/roll.png`, png(roll.image));
  await fs.writeFile(`${out}/ribbon.png`, png(ribbon.image));
  const { width: frameW, height } = await sharp(`${out}/roll.png`).metadata();
  const rig = [width, Math.round(height - 2 * PAD * width)];
  // Nothing may reach the frame's edge (the stages show the layers unclipped, frame-sized).
  for (const file of ['roll', 'ribbon']) {
    const { data, info } = await sharp(`${out}/${file}.png`).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    const edge = [...Array(info.width).keys()].some(x => data[x] > 8 || data[(info.height - 1) * info.width + x] > 8)
      || [...Array(info.height).keys()].some(y => data[y * info.width] > 8 || data[y * info.width + info.width - 1] > 8);
    if (edge) console.warn(`${file} touches the frame's edge`);
  }
  const [[x0, y0], [x1, y1]] = roll.ends;
  const geometry = {
    width: frameW, height, rig,
    angle: +(Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI).toFixed(2),
    axis: roll.ends.map(p => p.map(v => +v.toFixed(1))),
    thickness: +roll.thickness.toFixed(1),
    // The unrolled sheet is drawn paperLength × 1.06 wide (Envelope.astro): this keeps it as wide
    // as the model's paper.
    paperLength: +(paper / 1.06).toFixed(1),
    knot: ribbon.knot.map(v => +v.toFixed(1)),
  };
  await fs.writeFile(`${out}/geometry.json`, JSON.stringify(geometry, null, 1));
  // The model maps its knot into the roll layer's box by the axis' centre there, and the box's pad.
  const model = JSON.parse(await fs.readFile(`${root}/${theme}/model/geometry.json`, 'utf8'));
  model.axis = [+(((x0 + x1) / 2) / frameW).toFixed(4), +(((y0 + y1) / 2) / height).toFixed(4)];
  model.pad = PAD;
  await fs.writeFile(`${root}/${theme}/model/geometry.json`, JSON.stringify(model, null, 1));
  console.log(theme, geometry);
}
socket.close();
