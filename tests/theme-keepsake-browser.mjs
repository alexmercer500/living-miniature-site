// Theme keepsakes (Envelope.astro, scripts/cut-invitation-objects.mjs): the Amber Fort envelope
// and the Lake City scroll on the invitation chapter's scroll stages. Isolated headless Chrome on
// port 9333, production preview on :4321; no packages required.
// Per theme and viewport: closed at rest (seal or ribbon on, card hidden), opening part-way
// (seal or ribbon gone, flap swung or roll levelled), presented at the end (card usable and on
// screen, the roll riding the paper's lower edge), and the static pose under reduced motion.
// Both keepsakes are drawn as 3D models (scripts/envelope-model.ts, scroll-model.ts) once loaded;
// without WebGL they keep the photo layers on the same stages.
import assert from 'node:assert/strict';

const target = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let nextId = 0;
const pending = new Map(), errors = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(String(data));
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
  }
});
const command = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await command('Runtime.enable');
await command('Page.enable');
await command('Page.bringToFront');

// Scroll to a point on the invitation track, let the paper's follow settle (frames are slow
// under software GL), and report the pose.
const stage = k => evaluate(`(async () => {
  const s = document.querySelector('[data-envelope]'), v = s.querySelector('.envelope-viewport');
  scrollTo({ top: s.getBoundingClientRect().top + scrollY + ${k} * (s.offsetHeight - v.offsetHeight), behavior: 'instant' });
  const rig = s.querySelector('.envelope-rig');
  // The 3D model loads lazily: give it a moment the first time.
  for (let t = 0; t < 100 && rig.dataset.model && !rig.classList.contains('object-3d') && !window.__noWebgl; t++) await new Promise(r => setTimeout(r, 100));
  let last = '';
  // Settled once whole frames pass with no change (each poll waits for real frames, so one slow
  // frame never passes for a settled pose).
  const frames = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (let t = 0, steady = 0; t < 120 && steady < 3; t++) { await frames(); await new Promise(r => setTimeout(r, 150)); await frames(); const now = s.getAttribute('style') + rig.getAttribute('style'); steady = now === last ? steady + 1 : 0; last = now; }
  const card = s.querySelector('[data-envelope-card]'), c = card.getBoundingClientRect();
  const op = sel => { const el = s.querySelector(sel); return el ? +getComputedStyle(el).opacity : null; };
  const roll = s.querySelector('.obj-roll img')?.closest('.obj-roll');
  return {
    kind: rig.className.match(/object-(envelope|scroll)/)?.[1] ?? null,
    three: rig.classList.contains('object-3d'), canvases: rig.querySelectorAll('canvas.obj-canvas').length,
    photoShown: getComputedStyle(rig.querySelector('.obj-layer') ?? rig).display !== 'none',
    images: [...rig.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0),
    seal: op('.obj-seal'), ribbon: op('.obj-ribbon'),
    flap: parseFloat(s.style.getPropertyValue('--flap-angle')) || 0,
    clip: getComputedStyle(card).clipPath,
    card: { top: c.top, bottom: c.bottom, left: c.left, right: c.right },
    inert: card.inert,
    // The roll's axis is pinned to its top: its distance down the sheet against the sheet height.
    rollAt: roll ? roll.offsetTop : null, sheet: roll ? roll.parentElement.offsetHeight : null,
    width: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight,
  };
})()`);

try {
  for (const view of [
    { name: 'amber-mobile', theme: 'amber-fort', kind: 'envelope', width: 390, height: 844, mobile: true },
    { name: 'amber-desktop', theme: 'amber-fort', kind: 'envelope', width: 1440, height: 900, mobile: false },
    { name: 'lake-mobile', theme: 'lake-city', kind: 'scroll', width: 390, height: 844, mobile: true },
    { name: 'lake-desktop', theme: 'lake-city', kind: 'scroll', width: 1440, height: 900, mobile: false },
    { name: 'amber-reduced', theme: 'amber-fort', kind: 'envelope', width: 390, height: 844, mobile: true, reduced: true },
    { name: 'amber-no-webgl', theme: 'amber-fort', kind: 'envelope', width: 390, height: 844, mobile: true, noWebgl: true },
    { name: 'lake-reduced', theme: 'lake-city', kind: 'scroll', width: 390, height: 844, mobile: true, reduced: true },
    { name: 'lake-no-webgl', theme: 'lake-city', kind: 'scroll', width: 390, height: 844, mobile: true, noWebgl: true },
  ]) {
    if (process.argv[2] && !view.name.includes(process.argv[2])) continue;
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: view.mobile });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    // Without WebGL the model declines to load and the photo layers stay.
    const blocker = view.noWebgl ? await command('Page.addScriptToEvaluateOnNewDocument', { source: "window.__noWebgl = true; const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...rest) { return /webgl/.test(type) ? null : get.call(this, type, ...rest); };" }) : null;
    await command('Page.navigate', { url: `http://127.0.0.1:4321/${view.theme}/` });
    if (blocker) await command('Page.removeScriptToEvaluateOnNewDocument', { identifier: blocker.identifier });
    await wait(2500);
    await evaluate('document.fonts.ready.then(() => true)');

    if (view.reduced) {
      const pose = await stage(0);
      assert.equal(pose.kind, view.kind, `${view.name}: theme keepsake rendered`);
      assert.ok(pose.three && pose.canvases === (view.kind === 'envelope' ? 2 : 1), `${view.name}: static 3D ${view.kind} drawn`);
      assert.equal(pose.inert, false, `${view.name}: card readable without motion`);
      assert.ok(view.kind === 'envelope' ? pose.seal === 0 : pose.ribbon === 0, `${view.name}: static pose is opened`);
      assert.ok(pose.card.bottom - pose.card.top > 200 && pose.card.top >= 0 && pose.card.bottom <= pose.vh, `${view.name}: card on screen (${JSON.stringify(pose.card)})`);
      console.log(`${view.name}: static keepsake ok`);
      continue;
    }

    const closed = await stage(0);
    assert.equal(closed.kind, view.kind, `${view.name}: theme keepsake rendered`);
    {
      // The envelope draws behind and in front of its card (two canvases), the scroll over it (one).
      const want = !view.noWebgl;
      assert.equal(closed.three, want, `${view.name}: 3D ${view.kind} ${want ? 'drawn' : 'declined'}`);
      assert.equal(closed.canvases, want ? (view.kind === 'envelope' ? 2 : 1) : 0, `${view.name}: ${want ? 'its' : 'no'} model canvases`);
      assert.equal(closed.photoShown, !want, `${view.name}: photo layers ${want ? 'replaced' : 'kept'}`);
    }
    assert.ok(closed.images, `${view.name}: every layer decoded`);
    assert.equal(closed.inert, true, `${view.name}: card not operable while sealed`);
    if (view.kind === 'envelope') {
      assert.equal(closed.seal, 1, `${view.name}: wax seal on`);
      assert.ok(Math.abs(closed.flap) < 1, `${view.name}: flap closed (${closed.flap})`);
    } else {
      assert.equal(closed.ribbon, 1, `${view.name}: ribbon tied`);
      assert.ok(/inset\(0px 0px 100%|inset\(0px 0px 99\./.test(closed.clip), `${view.name}: paper still rolled (${closed.clip})`);
    }

    const opening = await stage(.5);
    if (view.kind === 'envelope') {
      assert.equal(opening.seal, 0, `${view.name}: seal lifted away before the flap opens`);
      assert.ok(opening.flap < -150, `${view.name}: flap swung open (${opening.flap})`);
    } else {
      assert.equal(opening.ribbon, 0, `${view.name}: ribbon untied`);
    }

    const open = await stage(1);
    assert.equal(open.inert, false, `${view.name}: card operable once presented`);
    assert.ok(open.card.top >= 56 && open.card.bottom <= open.vh, `${view.name}: presented card fully on screen (${JSON.stringify(open.card)})`);
    assert.ok(open.card.left >= 0 && open.card.right <= open.vw && open.width <= open.vw, `${view.name}: no horizontal overflow`);
    if (view.kind === 'scroll') assert.ok(Math.abs(open.rollAt - open.sheet) < 2, `${view.name}: roll rides the paper's lower edge (${open.rollAt} vs ${open.sheet})`);

    const back = await stage(0);
    assert.equal(back.inert, true, `${view.name}: scrolling back reseals`);
    assert.ok(view.kind === 'envelope' ? back.seal === 1 : back.ribbon === 1, `${view.name}: reversible`);
    console.log(`${view.name}: closed, opening, presented and reversed ok`);
  }
  assert.deepEqual(errors, []);
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`).catch(() => {});
}
