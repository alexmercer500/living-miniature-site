// No external dependencies. Production preview :4321, isolated Chrome CDP :9333.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const data = JSON.parse(await fs.readFile('src/data/site-content.json', 'utf8'));
const target = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let id = 0;
const pending = new Map(), errors = [];
socket.addEventListener('message', ({ data }) => {
  const m = JSON.parse(String(data));
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails);
  if (pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); }
});
const command = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })); });
const evaluate = async expression => {
  const r = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const waitFor = async expression => { for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await wait(120); } throw new Error(`Timeout: ${expression}`); };
const out = '.astro/nature-qa';
await fs.mkdir(out, { recursive: true });
for (const domain of ['Page', 'Runtime', 'Network']) await command(`${domain}.enable`);
await command('Network.setCacheDisabled', { cacheDisabled: true });
await command('Page.bringToFront');
const records = [];
const shot = async name => { const r = await command('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(`${out}/${name}.png`, Buffer.from(r.data, 'base64')); };
const scroll = async selector => { await evaluate(`window.scrollTo({top:scrollY+document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top-75,behavior:'instant'}); true`); await wait(650); };
const enter = async () => { await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' }); await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); };
try {
  for (const view of [
    ...[320,360,390,430,768,1024,1440].map(width => ({ name: `width-${width}`, width, height: width >= 768 ? 900 : 844, lang: width === 320 ? 'hi' : 'en' })),
    { name: 'tablet-portrait', width: 768, height: 1024, lang: 'hi' },
    { name: 'short-hindi', width: 320, height: 568, lang: 'hi' },
    { name: 'reduced-hindi', width: 390, height: 844, lang: 'hi', reduced: true },
    { name: 'no-js', width: 390, height: 844, lang: 'en', noJs: true },
    { name: 'failed-art', width: 390, height: 844, lang: 'en', failed: true },
    { name: 'no-js-failed', width: 390, height: 844, lang: 'en', noJs: true, failed: true },
  ]) {
    if (process.argv[2] && !view.name.includes(process.argv[2])) continue;
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: false });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    await command('Emulation.setScriptExecutionDisabled', { value: Boolean(view.noJs) });
    await command('Network.setBlockedURLs', { urls: view.failed ? ['*hero-mobile.*','*hero-desktop.*','*journey-mobile.*','*journey-desktop.*','*letter-mobile.*','*letter-desktop.*','*venue-mobile.*','*venue-desktop.*','*closing-mobile.*','*closing-desktop.*','*event-haldi.*','*event-evening.*','*event-wedding.*'] : [] });
    const base = `${view.lang === 'hi' ? '/hi' : ''}/nature`;
    await command('Page.navigate', { url: `http://127.0.0.1:4321${base}/` }); await wait(1500);
    await evaluate('document.fonts.ready.then(()=>true)');
    assert.equal(await evaluate("document.documentElement.dataset.theme"), 'nature');
    assert.ok((await evaluate("document.querySelector('link[rel=canonical]').href")).endsWith(base));
    assert.equal(await evaluate("document.querySelector('[data-nature-sound]')?.getAttribute('aria-pressed')"), 'false');
    for (const section of ['welcome','journey','invitation','celebrations','venue','wishes','closing']) {
      await scroll(`#${section}`);
      const state = await evaluate(`(() => {
        const s=document.getElementById('${section}'), b=s.getBoundingClientRect();
        return {width:document.documentElement.scrollWidth,left:b.left,right:b.right,
          headings:[...s.querySelectorAll('h1,h2,h3')].map(h=>{const r=h.getBoundingClientRect();return {text:h.textContent,opacity:getComputedStyle(h).opacity,left:r.left,right:r.right}}),
          images:[...s.querySelectorAll('img')].map(i=>({ready:i.complete&&i.naturalWidth>0,src:i.currentSrc})),
          refs:[...s.querySelectorAll('*')].flatMap(e=>[...e.attributes].flatMap(a=>[...a.value.matchAll(/url\\(#([^)]*)\\)/g)].map(m=>m[1]).concat(a.name==='href'&&a.value.startsWith('#')?[a.value.slice(1)]:[]))).filter(id=>!document.getElementById(id))};
      })()`);
      assert.ok(state.width <= view.width + 1, `${view.name}/${section}: page overflow ${state.width}`);
      assert.ok(state.left >= -1 && state.right <= view.width + 1);
      for (const h of state.headings) { assert.equal(h.opacity, '1', 'Copy never waits for animation'); assert.ok(h.left >= -2 && h.right <= view.width + 2, `${view.name}: heading out of frame ${h.text}`); }
      assert.deepEqual(state.refs, []);
      if (!view.failed) {
        for (const image of state.images) {
          // Lazy keepsake images below the current viewport are checked after scrolling their cards.
          if (section !== 'journey') { assert.ok(image.ready, `${view.name}/${section}: image loaded`); assert.match(image.src, /\.(avif|webp)$/); }
        }
      }
      records.push({ view: view.name, section, ...state });
      if ([390,1440].includes(view.width) || view.lang === 'hi' && view.width === 320) await shot(`${view.name}-${section}`);
    }
    const details = await evaluate("({titles:[...document.querySelectorAll('.ns-event-copy h3')].map(e=>e.textContent),address:document.querySelector('.ns-venue-card address').textContent,calendar:document.querySelectorAll('[data-ics]').length,maps:document.querySelectorAll('.ns-venue-card .ns-actions a').length,rsvp:!!document.getElementById('rsvp')})");
    assert.deepEqual(details.titles, data.events.map(e => e.title[view.lang])); assert.equal(details.address, data.venue.address);
    assert.equal(details.calendar, 0); assert.equal(details.maps, 0); assert.equal(details.rsvp, false);
    if (view.reduced || view.noJs) assert.equal(await evaluate("document.querySelector('[data-envelope]').hasAttribute('data-enhanced')"), false);
    if (view.name === 'width-390' || view.name === 'width-1440') {
      await scroll('#welcome');
      await evaluate("document.querySelector('[data-nature-lantern]').focus(); true"); await enter();
      assert.equal(await evaluate("document.querySelector('[data-nature-lantern]').getAttribute('aria-pressed')"), 'true');
      await scroll('.ns-keepsakes');
      await evaluate("document.querySelectorAll('[data-keepsake]')[1].focus(); true"); await enter();
      assert.equal(await evaluate("document.querySelectorAll('[data-keepsake]')[1].getAttribute('aria-pressed')"), 'true');
      await scroll('#invitation');
      await wait(1200);
      await evaluate("document.querySelector('[data-envelope-toggle]').focus({preventScroll:true}); true");
      await enter();
      await waitFor("document.querySelector('[data-envelope-toggle]').getAttribute('aria-expanded')==='true'");
      await shot(`${view.name}-envelope-open`);
      const bounds = await evaluate("(()=>{const r=document.querySelector('[data-envelope-card]').getBoundingClientRect(),f=document.querySelector('.envelope-footer').getBoundingClientRect();return {paper:{top:r.top,bottom:r.bottom},footer:{top:f.top,bottom:f.bottom}}})()");
      assert.ok(bounds.paper.top >= 64, 'Invitation card clears fixed navigation');
      assert.ok(bounds.paper.bottom < bounds.footer.top, 'Paper does not obscure actions');
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.ns-dock')).visibility"), 'hidden');
      await enter(); await waitFor("document.querySelector('[data-envelope-toggle]').getAttribute('aria-expanded')==='false'");
      await wait(5000);
      await shot(`${view.name}-envelope-closed`);
      await evaluate("document.querySelector('.ns-menu summary').focus(); true"); await enter();
      assert.equal(await evaluate("document.querySelector('.ns-menu').open"), true);
      await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
      assert.equal(await evaluate("document.querySelector('.ns-menu').open"), false);
      if (view.width === 390) {
        await scroll('#welcome');
        await command('Emulation.setTouchEmulationEnabled', { enabled: true });
        const point = await evaluate("(()=>{const r=document.querySelector('[data-nature-lantern]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
        await command('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{...point,id:0}] });
        await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await wait(100);
        assert.equal(await evaluate("document.querySelector('[data-nature-lantern]').getAttribute('aria-pressed')"), 'false', 'Touch toggles lantern');
        await command('Emulation.setTouchEmulationEnabled', { enabled: false });
      }
    }
    await command('Page.navigate', { url: `http://127.0.0.1:4321${base}/invitation/` }); await wait(900);
    assert.ok((await evaluate("document.querySelector('link[rel=canonical]').href")).endsWith(`${base}/invitation`));
    assert.equal(await evaluate("document.querySelector('h1').textContent"), data.couple.displayName[view.lang]);
    assert.ok(await evaluate(`document.querySelector('.ns-invite-actions a:last-child').getAttribute('href') === '${base}'`));
    if (view.width === 390 && !view.failed && !view.noJs) { await command('Emulation.setEmulatedMedia', { media: 'print' }); assert.equal(await evaluate("getComputedStyle(document.querySelector('.ns-header')).display"), 'none'); await shot(`${view.name}-print`); await command('Emulation.setEmulatedMedia', { media: '' }); }
  }
  assert.deepEqual(errors, [], 'No runtime exceptions');
  await fs.writeFile(`${out}/results${process.argv[2] ? '-'+process.argv[2] : ''}.json`, JSON.stringify(records, null, 2));
  console.log(`PASS: ${records.length} scene/layout checks plus interaction/locale/invitation checks. Screenshots: ${out}`);
} finally { socket.close(); await fetch(`http://127.0.0.1:9333/json/close/${target.id}`); }
