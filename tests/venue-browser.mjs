// Requires production preview :4321 and isolated headless Chrome CDP :9333.
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
const output = '.astro/venue-qa';
await fs.mkdir(output, { recursive: true });
for (const domain of ['Page', 'Runtime', 'Network']) await command(`${domain}.enable`);
await command('Network.setCacheDisabled', { cacheDisabled: true });
await command('Page.bringToFront');
await command('Page.addScriptToEvaluateOnNewDocument', { source: "sessionStorage.setItem('lm-intro','1')" });
const results = [];
const scrollTo = async selector => {
  await evaluate(`window.scrollTo({top:scrollY+document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top-82,behavior:'instant'}); true`);
  await wait(1300);
};
const screenshot = async name => {
  const shot = await command('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(`${output}/${name}.png`, Buffer.from(shot.data, 'base64'));
};
try {
  for (const view of [
    ...[320, 360, 390, 430, 768, 1024, 1440].map(width => ({ name: `width-${width}`, width, height: width >= 768 ? 900 : 844, lang: width === 320 ? 'hi' : 'en' })),
    { name: 'tablet-portrait', width: 768, height: 1024, lang: 'en' },
    { name: 'reduced-hindi', width: 390, height: 844, lang: 'hi', reduced: true },
    { name: 'no-js', width: 390, height: 844, lang: 'en', noJs: true },
    { name: 'failed-desktop', width: 1440, height: 900, lang: 'en', failed: true },
    { name: 'no-js-failed', width: 390, height: 844, lang: 'en', failed: true, noJs: true },
  ]) {
    if (process.argv[2] && !view.name.includes(process.argv[2])) continue;
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: false });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    await command('Emulation.setScriptExecutionDisabled', { value: Boolean(view.noJs) });
    await command('Network.setBlockedURLs', { urls: view.failed ? ['*venue-mobile-v1*', '*venue-desktop-v1*'] : [] });
    await command('Page.navigate', { url: `http://127.0.0.1:4321${view.lang === 'hi' ? '/hi/' : '/'}` });
    await wait(1300);
    await evaluate('document.fonts.ready.then(()=>true)');
    await scrollTo('#venue');
    if (view.noJs) {
      assert.notEqual(await evaluate("getComputedStyle(document.querySelector('#venue .venue-static')).backgroundImage"), 'none', 'No-JS uses CSS image with transparent failure fallback');
      assert.ok(await evaluate("document.querySelector('#venue .venue-static').getBoundingClientRect().height > 400"), 'No-JS picture fills the art frame');
    }
    await screenshot(`${view.name}-entrance`);
    await scrollTo('#venue .venue-card');
    const state = await evaluate(`(() => {
      const s=document.querySelector('#venue'), img=s.querySelector('img'), card=s.querySelector('.venue-card'), r=card.getBoundingClientRect();
      return {title:s.querySelector('h2').textContent,address:s.querySelector('address').textContent,label:s.querySelector('.eyebrow').textContent,
        ready:img.complete&&img.naturalWidth>0,source:img.currentSrc,pictureDisplay:getComputedStyle(s.querySelector('picture')).display,
        width:document.documentElement.scrollWidth,card:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height,scrollHeight:card.scrollHeight},
        opacity:getComputedStyle(card).opacity,devNotes:s.querySelectorAll('.dev-note').length,
        links:[...s.querySelectorAll('.actions a')].map(a=>({href:a.getAttribute('href'),target:a.target,rel:a.rel,text:a.textContent.trim(),height:a.getBoundingClientRect().height})),
        refs:[...s.querySelectorAll('*')].flatMap(e=>[...e.attributes].flatMap(a=>[...a.value.matchAll(/url\\(#([^)]*)\\)/g)].map(m=>m[1]).concat(a.name==='href'&&a.value.startsWith('#')?[a.value.slice(1)]:[]))).filter(id=>!document.getElementById(id)),
        fallback:getComputedStyle(s.querySelector('.v-haveli')).visibility};
    })()`);
    assert.equal(state.title, data.venue.name); assert.equal(state.address, data.venue.address);
    assert.equal(state.label, data.ui[view.lang].venueHeading);
    assert.equal(state.opacity, '1'); assert.equal(state.devNotes, 0);
    assert.ok(state.width <= view.width + 1, `${view.name}: horizontal overflow`);
    assert.ok(state.card.left >= -1 && state.card.right <= view.width + 1);
    assert.ok(state.card.scrollHeight <= state.card.height + 2, 'Card content not clipped');
    assert.deepEqual(state.refs, []);
    const hasMap = /^https?:\/\//.test(data.venue.mapUrl);
    assert.equal(state.links.length, hasMap ? 2 : 0, 'Map actions honor current configuration');
    for (const link of state.links) { assert.equal(link.href, data.venue.mapUrl); assert.equal(link.target, '_blank'); assert.match(link.rel, /noopener/); assert.ok(link.height >= 44); }
    if (view.failed) {
      assert.equal(state.ready, false); assert.equal(state.fallback, 'visible');
      if (!view.noJs) assert.equal(state.pictureDisplay, 'none');
    } else {
      assert.ok(state.ready); assert.match(state.source, /\.(avif|webp)$/);
      assert.ok(state.source.includes(view.width >= 768 && view.width >= view.height ? 'venue-desktop' : 'venue-mobile'));
    }
    await screenshot(`${view.name}-details`);
    // Reverse scrolling must leave the card recoverable on re-entry.
    if (!view.reduced && !view.noJs) { await scrollTo('#celebrations'); await scrollTo('#venue .venue-card'); assert.equal(await evaluate("getComputedStyle(document.querySelector('#venue .venue-card')).opacity"), '1'); }
    results.push({ view: view.name, ...state });
  }
  assert.deepEqual(errors, [], 'No runtime exceptions');
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} venue layouts/fallbacks, EN/Hindi placeholders, map gating, SVG references, reverse scroll and no runtime exceptions`);
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);
}
