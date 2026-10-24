// Optional production-preview QA. Uses an isolated headless Chrome on port 9333.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
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
const output = '.astro/journey-qa';
await fs.mkdir(output, { recursive: true });
await command('Page.enable');
await command('Runtime.enable');
await command('Page.bringToFront');
await command('Page.addScriptToEvaluateOnNewDocument', { source: "sessionStorage.setItem('lm-intro','1')" });
const results = [];
try {
  for (const view of [
    { name: 'desktop', width: 1440, height: 900, path: '/' },
    { name: 'mobile', width: 390, height: 844, path: '/' },
    { name: 'hindi-small', width: 320, height: 568, path: '/hi/' },
    { name: 'reduced', width: 390, height: 844, path: '/', reduced: true },
    { name: 'no-js', width: 390, height: 844, path: '/', noJs: true },
  ]) {
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: false });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    await command('Emulation.setScriptExecutionDisabled', { value: Boolean(view.noJs) });
    await command('Page.navigate', { url: `http://127.0.0.1:4321${view.path}` });
    await wait(1600);
    await evaluate("document.fonts.ready.then(()=>true)");
    await evaluate("window.scrollTo({top:scrollY+document.querySelector('#journey').getBoundingClientRect().top-75,behavior:'instant'}); true");
    await wait(2000);
    const state = await evaluate(`(() => {
      const s=document.querySelector('#journey'), image=s.querySelector('[data-courtyard-image]'), b=s.querySelector('[data-image-swing]');
      const r=b.getBoundingClientRect(), h=s.querySelector('h2').getBoundingClientRect();
      return {ready:image.complete&&image.naturalWidth>0, enhanced:s.classList.contains('has-courtyard-art'), source:image.currentSrc,
        width:document.documentElement.scrollWidth, titleOpacity:getComputedStyle(s.querySelector('h2')).opacity,
        swing:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right}, title:{x:h.x,right:h.right},
        broken:[...s.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).length,
        refs:[...s.querySelectorAll('[fill],[filter],[stroke],use')].flatMap(e=>[...e.attributes].flatMap(a=>[...a.value.matchAll(/url\\(#([^)]*)\\)/g)].map(m=>m[1]).concat(a.name==='href'&&a.value.startsWith('#')?[a.value.slice(1)]:[]))).filter(id=>!document.getElementById(id))};
    })()`);
    assert.ok(state.ready); assert.equal(state.broken, 0); assert.deepEqual(state.refs, []);
    assert.ok(state.width <= view.width + 1, 'No horizontal overflow');
    assert.equal(state.titleOpacity, '1', 'Title is visible immediately');
    assert.ok(state.title.x >= 0 && state.title.right <= view.width + 1);
    assert.ok(state.swing.width >= 44 && state.swing.height >= 44);
    assert.ok(state.swing.x >= -1 && state.swing.right <= view.width + 1);
    if (!view.noJs) assert.ok(state.enhanced);
    const arm = "document.querySelector('[data-courtyard-arm]')";
    if (!view.noJs) {
      await evaluate("document.querySelector('[data-image-swing]').focus(); true");
      const before = await evaluate(`${arm}.style.transform`);
      await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
      await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
      await wait(180);
      const after = await evaluate(`${arm}.style.transform`);
      if (view.reduced) assert.equal(after, before, 'Reduced motion stays still');
      else assert.notEqual(after, before, 'Keyboard pushes swing');
      if (!view.reduced) {
        const point = await evaluate("(()=>{const r=document.querySelector('[data-image-swing]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
        await command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
        await command('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x + 24, y: point.y, button: 'left', buttons: 1 });
        await command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x + 24, y: point.y, button: 'left', clickCount: 1 });
        await wait(100);
        assert.match(await evaluate(`${arm}.style.transform`), /rotate/);
        if (view.name === 'mobile') {
          await command('Emulation.setTouchEmulationEnabled', { enabled: true });
          const touchPoint = await evaluate("(()=>{const r=document.querySelector('[data-image-swing]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
          await command('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...touchPoint, id: 0 }] });
          const touchBefore = await evaluate(`${arm}.style.transform`);
          await command('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touchPoint.x - 20, y: touchPoint.y, id: 0 }] });
          await wait(60);
          const touchAfter = await evaluate(`${arm}.style.transform`);
          await command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
          assert.notEqual(touchAfter, touchBefore, 'Horizontal touch drag moves swing');
          await command('Emulation.setTouchEmulationEnabled', { enabled: false });
        }
      }
    }
    if (!view.noJs) await evaluate('document.activeElement?.blur(); true');
    const shot = await command('Page.captureScreenshot', { format: 'png' });
    await fs.writeFile(`${output}/${view.name}.png`, Buffer.from(shot.data, 'base64'));
    if (!view.noJs) {
      await evaluate("document.querySelector('[data-courtyard-image]').dispatchEvent(new Event('error')); true");
      await wait(100);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('#journey .garden')).visibility"), 'visible');
      assert.equal(await evaluate("document.querySelector('[data-fallback-swing]').getAttribute('tabindex')"), '0');
    }
    results.push({ view: view.name, ...state });
  }
  assert.deepEqual(errors, [], 'No runtime errors');
  await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} layouts; image loading, SVG references, keyboard/drag, reduced motion, no-JS, and error fallback`);
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);
}
