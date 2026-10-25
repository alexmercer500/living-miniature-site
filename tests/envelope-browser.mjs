// Optional visual QA using an isolated local headless Chrome on port 9333.
// Launch Chrome with a dedicated test profile; no packages are required.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

const target = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
let nextId = 0;
const pending = new Map();
const errors = [];
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
const evaluate = async (expression) => {
  const result = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const settle = () => new Promise(resolve => setTimeout(resolve, process.argv.includes('--nature') ? 2200 : 1400));
const waitFor = async (expression, timeout = 14000) => {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    if (await evaluate(expression)) return;
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  throw new Error(`Timed out waiting for: ${expression}`);
};
const nature = process.argv.includes('--nature');
const output = nature ? '.astro/nature-envelope-qa' : '.astro/envelope-qa';
await fs.mkdir(output, { recursive: true });
await command('Runtime.enable');
await command('Page.enable');
await command('Page.bringToFront');
await command('Page.addScriptToEvaluateOnNewDocument', { source: "sessionStorage.setItem('lm-intro','1')" });
const records = [];
try {
  for (const view of [
    { name: 'desktop', width: 1440, height: 900, path: '/' },
    { name: 'mobile', width: 390, height: 844, path: '/' },
    { name: 'small-hindi', width: 320, height: 568, path: '/hi/' },
    { name: 'reduced-hindi', width: 320, height: 568, path: '/hi/', reduced: true },
    { name: 'no-js-mobile', width: 390, height: 844, path: '/', noJs: true },
  ]) {
    if (process.argv[2] && process.argv[2] !== '--nature' && view.name !== process.argv[2]) continue;
    await command('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: false });
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: view.reduced ? 'reduce' : 'no-preference' }] });
    await command('Emulation.setScriptExecutionDisabled', { value: Boolean(view.noJs) });
    const path = nature ? view.path : (view.path === '/hi/' ? '/hi/royal/' : '/royal/');
    await command('Page.navigate', { url: `http://127.0.0.1:4321${path}` });
    await settle();
    await evaluate('document.fonts.ready.then(() => true)');
    await settle();
    const fallback = view.reduced || view.noJs;
    if (nature) {
      assert.equal(await evaluate("document.querySelector('.ns-scroll-rig')"), null, 'Old scroll letter is removed');
      assert.equal(await evaluate("document.querySelector('.card-link').getAttribute('href')"), `${path.replace(/\/$/, '')}/invitation`);
      assert.equal(await evaluate("document.querySelector('.envelope-footer a:last-child').getAttribute('href')"), '#celebrations');
    }
    assert.equal(await evaluate("document.querySelector('[data-envelope]').hasAttribute('data-enhanced')"), !fallback, 'Enhancement must respect static fallback');
    for (const [name, progress] of fallback ? [['static', 0]] : [['rest', 0], ['float', .25], ['paper', .62], ['settled', .9], ['open', 1], ['reverse', 0]]) {
      await evaluate(`(() => { const s=document.querySelector('[data-envelope]'); window.scrollTo({top:scrollY+s.getBoundingClientRect().top+${progress}*(s.offsetHeight-s.firstElementChild.offsetHeight),behavior:'instant'}); return true; })()`);
      await settle();
      if (nature && !fallback) {
        const stage=await evaluate("(()=>{const s=document.querySelector('[data-envelope]'),v=s.firstElementChild,r=v.getBoundingClientRect();return {top:r.top,height:r.height,travel:s.offsetHeight-v.offsetHeight,snap:getComputedStyle(document.documentElement).scrollSnapType}})()");
        assert.ok(Math.abs(stage.top)<2 && Math.abs(stage.height-view.height)<2,'Stage stays pinned at exactly one viewport');
        assert.ok(stage.travel>=2800,'Slow reveal has sufficient scroll distance');
        if(progress>0&&progress<1) assert.equal(stage.snap,'none','Page snapping cannot skip animation poses');
        if(name==='rest') {
          const angle=await evaluate("document.querySelector('[data-envelope]').style.getPropertyValue('--rig-angle')");
          await settle();
          assert.equal(await evaluate("document.querySelector('[data-envelope]').style.getPropertyValue('--rig-angle')"),angle,'Stationary scrolling must not autoplay the envelope');
        }
      }
      if (name === 'open') await waitFor("document.querySelector('[data-envelope-toggle]').getAttribute('aria-expanded') === 'true'");
      if (name === 'reverse') await waitFor("parseFloat(document.querySelector('[data-envelope]').style.getPropertyValue('--rig-angle')) > 57.99");
      const state = await evaluate(`(() => {
        const s=document.querySelector('[data-envelope]'), card=s.querySelector('[data-envelope-card]');
        const bounds=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}};
        return {rig:bounds(s.querySelector('.envelope-rig')),card:bounds(card),control:bounds(s.querySelector('.seal-control')),footer:bounds(s.querySelector('.envelope-footer')),bodyWidth:document.documentElement.scrollWidth,
          expanded:s.querySelector('button').getAttribute('aria-expanded'), nameOpacity:getComputedStyle(s.querySelector('.name-one')).opacity,
          secondNameOpacity:getComputedStyle(s.querySelector('.name-two')).opacity, detailsOpacity:getComputedStyle(s.querySelector('.card-date')).opacity,
          cardLayer:Number(getComputedStyle(card).zIndex), liningLayer:Number(getComputedStyle(s.querySelector('.envelope-lining')).zIndex),
          pulsing:getComputedStyle(s.querySelector('.wax-seal'),'::after').animationName.includes('seal-beacon'),
          hiddenLabel:s.querySelector('[data-envelope-label]').classList.contains('visually-hidden'),
          revealEffects:s.querySelectorAll('.card-mist,.card-sparkles').length, heading:bounds(s.querySelector('header'))};
      })()`);
      records.push({ view: view.name, phase: name, ...state });
      assert.ok(state.bodyWidth <= view.width + 1, `${view.name}: horizontal overflow`);
      if (name === 'rest' || name === 'reverse') {
        assert.ok(state.rig.y > 60 && state.rig.bottom < view.height - 80, `${view.name}: resting envelope outside usable table area`);
        assert.equal(state.expanded, 'false');
        assert.ok(state.pulsing, 'Seal must indicate interaction with a glow');
        assert.ok(state.hiddenLabel, 'Open label must not appear on the artwork');
      }
      if (name === 'paper') assert.ok(state.cardLayer > state.liningLayer, 'Paper must be in front of the red lining');
      assert.equal(state.nameOpacity, '1', 'First name must be printed from the start');
      assert.equal(state.secondNameOpacity, '1', 'Second name must be printed from the start');
      assert.equal(state.detailsOpacity, '1', 'Details must not wait for an animation');
      assert.equal(state.revealEffects, 0, 'Reveal effects must not obscure the text');
      if (name === 'open' || name === 'static') {
        assert.ok(state.card.y >= 65 && state.card.bottom < view.height - 100, `${view.name}: foreground card outside usable viewport`);
        assert.equal(state.expanded, 'true');
        assert.equal(state.nameOpacity, '1');
        if (!fallback) {
          assert.ok(state.control.y >= state.card.bottom, `${view.name}: close control obscured by paper`);
          assert.ok(state.control.bottom <= state.footer.y, `${view.name}: close control overlaps footer`);
        }
      }
      const shot = await command('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(`${output}/${view.name}-${name}.png`, Buffer.from(shot.data, 'base64'));
    }
    if (!fallback) {
      await evaluate("document.querySelector('[data-envelope-toggle]').focus(); true");
      for (const expected of ['true', 'false']) {
        await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
        await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        await waitFor(`document.querySelector('[data-envelope-toggle]').getAttribute('aria-expanded') === '${expected}'`);
        const actual = await evaluate("document.querySelector('[data-envelope-toggle]').getAttribute('aria-expanded')");
        if (actual !== expected) console.log(await evaluate("({scroll:scrollY,focus:document.activeElement?.outerHTML,style:document.querySelector('[data-envelope]').getAttribute('style')})"));
        assert.equal(actual, expected, `${view.name}: keyboard toggle`);
      }
    }
  }
  assert.deepEqual(errors, [], 'Browser runtime exceptions');
  await fs.writeFile(`${output}/results.json`, JSON.stringify(records, null, 2));
  console.log(`Passed ${records.length} browser phase checks. Screenshots: ${output}`);
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`).catch(() => {});
}
