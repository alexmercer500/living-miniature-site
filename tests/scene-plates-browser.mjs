// Chapter handoffs (ScenePlate.astro): isolated headless Chrome on port 9333, production
// preview on :4321. No packages are required.
// Checks, per viewport: every painting holds still through its handoff, nothing of the next
// chapter shows at either rest, the band crosses the screen in between, deep links land on
// finished poses, and reduced motion falls back to plain scrolling chapters.
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

// Scroll to `y`, wait two frames, then report every plate's geometry (viewport px).
const sample = `async y => {
  scrollTo({ top: y, behavior: 'instant' });
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  return [...document.querySelectorAll('.ns-home > section')].map(s => ({
    id: s.id,
    top: s.getBoundingClientRect().top,
    bottom: s.getBoundingClientRect().bottom,
    camera: s.querySelector('.ns-plate-camera').getBoundingClientRect().top,
    wipe: s.querySelector('.ns-plate-wipe').getBoundingClientRect().top,
  }));
}`;

try {
  for (const view of [
    { name: 'mobile', width: 390, height: 844, mobile: true, path: '/' },
    { name: 'desktop', width: 1440, height: 900, mobile: false, path: '/' },
    { name: 'small-hindi', width: 320, height: 568, mobile: true, path: '/hi/' },
    { name: 'reduced', width: 390, height: 844, mobile: true, path: '/', reduced: true },
  ]) {
    if (process.argv[2] && view.name !== process.argv[2]) continue;
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: view.mobile });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    await command('Page.navigate', { url: `http://127.0.0.1:4321${view.path}` });
    await wait(2500);
    await evaluate('document.fonts.ready.then(() => true)');
    await wait(800);
    const H = await evaluate('innerHeight');
    const sections = await evaluate(`[...document.querySelectorAll('.ns-home > section')].map(s => ({ id: s.id, top: s.offsetTop, height: s.offsetHeight }))`);
    const probe = y => evaluate(`(${sample})(${y})`);

    if (view.reduced) {
      const rows = await probe(sections[2].top - H / 2);
      const own = rows[2];
      assert.ok(Math.abs(own.camera - own.top) < 1.5, `${view.name}: reduced motion scrolls each painting with its chapter`);
      assert.equal(await evaluate("document.getAnimations().filter(a => a.timeline !== document.timeline).length"), 0, `${view.name}: no scroll-driven animation`);
      console.log(`${view.name}: plain chapters`);
      continue;
    }

    const band = await evaluate("parseFloat(getComputedStyle(document.querySelector('.ns-home')).getPropertyValue('--ns-band')) || innerHeight * .25");
    for (let i = 1; i < sections.length; i++) {
      const next = sections[i], id = next.id;
      const rest = next.top - H; // the moment the outgoing chapter last fills the screen
      // At the outgoing rest, the incoming band is still wholly below the screen.
      let rows = await probe(rest);
      assert.ok(rows[i].wipe >= H - 1, `${view.name} ${id}: band hidden at the previous rest (${rows[i].wipe})`);
      // Through the handoff both paintings hold still and the band climbs monotonically.
      let last = Infinity;
      for (const k of [.2, .4, .6, .8]) {
        rows = await probe(rest + H * k);
        assert.ok(Math.abs(rows[i].camera) < 1.5, `${view.name} ${id} @${k}: incoming painting holds still (${rows[i].camera})`);
        assert.ok(Math.abs(rows[i - 1].camera) < 1.5, `${view.name} ${id} @${k}: outgoing painting holds still (${rows[i - 1].camera})`);
        assert.ok(rows[i].wipe < last, `${view.name} ${id} @${k}: band rises with the scroll`);
        assert.ok(rows[i].wipe > -band - 1 && rows[i].wipe < H, `${view.name} ${id} @${k}: band on screen mid-handoff`);
        last = rows[i].wipe;
      }
      // At the incoming rest, the band has left through the top.
      rows = await probe(next.top);
      assert.ok(rows[i].wipe <= -band * .8, `${view.name} ${id}: band gone at its own rest (${rows[i].wipe})`);
    }
    assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `${view.name}: no horizontal overflow`);

    // A deep link lands on the finished pose of its chapter.
    await command('Page.navigate', { url: `http://127.0.0.1:4321${view.path}#wishes` });
    await wait(3000);
    const deep = await evaluate(`(() => { const s = document.getElementById('wishes'); return { top: s.getBoundingClientRect().top, opacity: getComputedStyle(s.querySelector('[data-wish-arrival]')).opacity, wipe: s.querySelector('.ns-plate-wipe').getBoundingClientRect().top }; })()`);
    assert.ok(Math.abs(deep.top) < 2 && deep.opacity === '1' && deep.wipe <= -band * .8, `${view.name}: deep link settles (${JSON.stringify(deep)})`);
    console.log(`${view.name}: ${sections.length - 1} handoffs ok`);
  }
  assert.deepEqual(errors, []);
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`).catch(() => {});
}
