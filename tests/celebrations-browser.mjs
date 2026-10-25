// Production preview on :4321; isolated headless Chrome debugging on :9333.
// No external test packages. Screenshots/results go to ignored .astro/celebrations-qa/.
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
const output = '.astro/celebrations-qa';
await fs.mkdir(output, { recursive: true });
await command('Page.enable');
await command('Runtime.enable');
await command('Network.enable');
await command('Network.setCacheDisabled', { cacheDisabled: true });
await command('Page.bringToFront');
await command('Page.addScriptToEvaluateOnNewDocument', { source: "sessionStorage.setItem('lm-intro','1')" });
const results = [];
const scrollTo = async selector => {
  await evaluate(`window.scrollTo({top:scrollY+document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top-82,behavior:'instant'}); true`);
  await wait(1400);
};
const screenshot = async name => {
  const shot = await command('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(`${output}/${name}.png`, Buffer.from(shot.data, 'base64'));
};
try {
  for (const view of [
    ...[320, 360, 390, 430, 768, 1024, 1440].map(width => ({ name: `width-${width}`, width, height: width >= 768 ? 900 : 844, lang: width === 320 ? 'hi' : 'en' })),
    { name: 'reduced-hindi', width: 390, height: 844, lang: 'hi', reduced: true },
    { name: 'no-js', width: 390, height: 844, lang: 'en', noJs: true },
    { name: 'failed-image', width: 390, height: 844, lang: 'en', failed: true },
    { name: 'no-js-failed', width: 390, height: 844, lang: 'en', failed: true, noJs: true },
  ]) {
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: false });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    await command('Emulation.setScriptExecutionDisabled', { value: Boolean(view.noJs) });
    await command('Network.setBlockedURLs', { urls: view.failed ? ['*celebrations-haldi*'] : [] });
    await command('Page.navigate', { url: `http://127.0.0.1:4321${view.lang === 'hi' ? '/hi/' : '/'}` });
    await wait(1300);
    await evaluate('document.fonts.ready.then(()=>true)');
    await scrollTo('#celebrations');
    for (let i = 0; i < data.events.length; i++) {
      await scrollTo(`#celebrations .event:nth-child(${i + 1})`);
      const state = await evaluate(`(() => {
        const event=document.querySelectorAll('#celebrations .event')[${i}], img=event.querySelector('img'), r=event.getBoundingClientRect();
        const h=event.querySelector('h3').getBoundingClientRect(), p=event.querySelector('.event-copy').getBoundingClientRect();
        return {id:event.dataset.eventId,title:event.querySelector('h3').textContent,description:event.querySelector('.event-desc').textContent,
          date:event.querySelector('.event-date').textContent.trim(),opacity:getComputedStyle(event).opacity,
          width:document.documentElement.scrollWidth,left:r.left,right:r.right,headingLeft:h.left,headingRight:h.right,
          copyHeight:p.height,copyScrollHeight:event.querySelector('.event-copy').scrollHeight,
          ready:img.complete&&img.naturalWidth>0,source:img.currentSrc,calendar:event.querySelectorAll('[data-ics]').length,
          fallbackVisible:getComputedStyle(event.querySelector('.vignette')).visibility,
          pictureDisplay:getComputedStyle(event.querySelector('picture')).display};
      })()`);
      const expected = data.events[i];
      assert.equal(state.id, expected.id);
      assert.equal(state.title, expected.title[view.lang]);
      assert.equal(state.description, expected.shortDescription[view.lang]);
      assert.equal(state.date, data.ui[view.lang].dateTbc);
      assert.equal(state.calendar, 0, 'Placeholder dates do not create misleading calendar controls');
      assert.equal(state.opacity, '1', `${view.name}: event entrance finishes`);
      assert.ok(state.width <= view.width + 1, `${view.name}: horizontal overflow`);
      assert.ok(state.left >= -1 && state.right <= view.width + 1);
      assert.ok(state.headingLeft >= -1 && state.headingRight <= view.width + 1);
      assert.ok(state.copyScrollHeight <= state.copyHeight + 2, 'Copy is not clipped');
      if (view.failed && i === 0) {
        assert.equal(state.ready, false);
        assert.equal(state.fallbackVisible, 'visible');
        if (!view.noJs) assert.equal(state.pictureDisplay, 'none');
      } else {
        assert.ok(state.ready, `${view.name}: image ${i} loaded`);
        assert.match(state.source, /\.(avif|webp)$/);
      }
      results.push({ view: view.name, ...state });
      if ([320,390,1440].includes(view.width) || view.failed || view.noJs || view.reduced) await screenshot(`${view.name}-event-${i + 1}`);
    }
    assert.deepEqual(await evaluate(`(()=>{const s=document.querySelector('#celebrations');return [...s.querySelectorAll('*')].flatMap(e=>[...e.attributes].flatMap(a=>[...a.value.matchAll(/url\\(#([^)]*)\\)/g)].map(m=>m[1]))).filter(id=>!document.getElementById(id))})()`), [], 'SVG references resolve');
    if (view.width === 1440) { await scrollTo('#celebrations'); await screenshot('desktop-overview'); }
  }
  assert.deepEqual(errors, [], 'No runtime exceptions');
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} event checks across 11 viewport/fallback cases, bilingual copy, calendar placeholders, SVG references, no overflow/runtime exceptions`);
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);
}
