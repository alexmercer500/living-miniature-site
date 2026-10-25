// Production preview :4321, isolated Chrome CDP :9333; no external dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const key=async (name,code)=>{await command('Input.dispatchKeyEvent',{type:'keyDown',key:name,code:name,windowsVirtualKeyCode:code,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await command('Input.dispatchKeyEvent',{type:'keyUp',key:name,code:name,windowsVirtualKeyCode:code});};
const output='.astro/keepsakes-qa';await fs.mkdir(output,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${name}.png`,Buffer.from(r.data,'base64'));};
let count=0;
try {
  await command('Page.enable');await command('Runtime.enable');await command('Page.bringToFront');
  for(const view of [
    {name:'desktop',width:1440,height:900,path:'/'},
    {name:'mobile',width:390,height:844,path:'/'},
    {name:'short-hindi',width:320,height:568,path:'/hi/'},
    {name:'reduced',width:390,height:844,path:'/hi/',reduced:true},
    {name:'no-js',width:390,height:844,path:'/',noJs:true},
  ]) {
    await command('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
    await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
    await command('Page.navigate',{url:`http://127.0.0.1:4321${view.path}#journey`});await wait(1800);
    await evaluate('document.fonts.ready.then(()=>true)');await wait(700);
    const state=await evaluate("(()=>{const s=document.querySelector('#journey'),b=document.querySelector('[data-keepsake]'),r=b.getBoundingClientRect(),w=document.querySelector('.ns-keepsake-wind');return {height:s.getBoundingClientRect().height,top:r.top,bottom:r.bottom,disabled:b.disabled,wind:getComputedStyle(w).animationName,rotation:getComputedStyle(w).rotate,rope:getComputedStyle(w,'::before').height,width:document.documentElement.scrollWidth}})()");
    assert.equal(state.height,view.height);assert.ok(state.width<=view.width);
    assert.ok(state.top>=64&&state.bottom<view.height-70,`${view.name}: card fits (${state.top},${state.bottom})`);
    assert.notEqual(state.rope,'0px');
    if(view.noJs){assert.ok(state.disabled);await shot(`${view.name}-journey`);count++;continue;}
    assert.equal(state.disabled,false);
    if(view.reduced)assert.equal(state.wind,'none');else {
      assert.equal(state.wind,'ns-keepsake-wind');await wait(350);
      assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.ns-keepsake-wind')).rotate"),state.rotation,'Cards sway slowly in place');
    }
    await shot(`${view.name}-journey`);
    if(view.name==='desktop') {
      await evaluate("document.documentElement.style.scrollSnapType='none';window.scrollTo({top:innerHeight*.2,behavior:'instant'});true");await wait(1500);
      const partial=await evaluate("Number(getComputedStyle(document.querySelector('[data-memory-hanger]')).opacity)");
      assert.ok(partial>.12&&partial<.99,'Scroll position drives an intermediate reveal, not just autoplay');
      await shot('desktop-scroll-reveal');
      await evaluate("window.scrollTo({top:innerHeight,behavior:'instant'});true");await wait(1500);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-memory-hanger]')).opacity"),'1');
      await evaluate("document.documentElement.style.removeProperty('scroll-snap-type');true");
      const point=await evaluate("(()=>{const r=document.querySelector('[data-keepsake]').getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()");
      await command('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await wait(700);
      assert.notEqual(await evaluate("getComputedStyle(document.querySelector('[data-keepsake]')).translate"),'none','Hover shifts the card');
      await shot('desktop-hover');
      await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});await wait(700);count+=2;
    }
    for(let i=0;i<3;i++) {
      await evaluate(`(()=>{const row=document.querySelector('.ns-keepsakes'),b=document.querySelectorAll('[data-keepsake]')[${i}];row.scrollLeft=b.closest('[data-memory-hanger]').offsetLeft-row.offsetLeft;b.focus({preventScroll:true});return true})()`);await wait(200);
      const scroll=await evaluate('scrollY');
      await key('Enter',13);await wait(view.reduced?100:850);
      const modal=await evaluate(`(()=>{const d=document.getElementById('ns-memory-${i}'),r=d.getBoundingClientRect(),f=d.querySelector('.ns-memory-frame').getBoundingClientRect();return {open:d.open,focus:d.contains(document.activeElement),top:r.top,bottom:r.bottom,left:r.left,right:r.right,scroll:scrollY,locked:getComputedStyle(document.documentElement).overflowY,title:d.querySelector('h2').textContent,image:d.querySelector('img').naturalWidth,animations:d.querySelector('.ns-memory-frame').getAnimations().length}})()`);
      assert.ok(modal.open&&modal.focus);assert.equal(modal.locked,'hidden');assert.ok(Math.abs(modal.scroll-scroll)<2,'Background does not jump');
      assert.ok(modal.top>=0&&modal.bottom<=view.height&&modal.left>=0&&modal.right<=view.width,'Modal fits viewport');
      assert.ok(modal.title.length>0&&modal.image>0);if(view.reduced)assert.equal(modal.animations,0);
      await evaluate("document.querySelector('.ns-header a').focus();true");
      assert.equal(await evaluate(`document.getElementById('ns-memory-${i}').contains(document.activeElement)`),true,'Native modal makes background inert');
      await shot(`${view.name}-memory-${i}`);
      if(i===1) await evaluate(`document.querySelector('#ns-memory-${i} .ns-memory-close').click();true`);
      else if(i===2) {await command('Input.dispatchMouseEvent',{type:'mousePressed',x:2,y:2,button:'left',clickCount:1});await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:2,y:2,button:'left',clickCount:1});}
      else await key('Escape',27);
      await wait(600);
      assert.equal(await evaluate(`document.getElementById('ns-memory-${i}').open`),false);
      assert.equal(await evaluate(`document.activeElement===document.querySelectorAll('[data-keepsake]')[${i}]`),true,'Focus returns to opener');
      assert.equal(await evaluate("document.documentElement.hasAttribute('data-memory-open')"),false);
      count++;
    }
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${count} keepsake/modal/fallback checks. Screenshots: ${output}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
