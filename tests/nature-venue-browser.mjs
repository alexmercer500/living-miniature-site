// Production preview :4321; isolated headless Chrome CDP :9333. No packages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[],failures=[];
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Network.responseReceived'&&m.params.response.status>=400)failures.push(m.params.response.url);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='.astro/venue-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
let count=0;
try {
  await command('Page.enable');await command('Runtime.enable');await command('Network.enable');await command('Page.bringToFront');
  for(const view of [
    {name:'desktop',width:1440,height:900}, {name:'wide',width:1920,height:1080},
    {name:'mobile',width:390,height:844}, {name:'short-hindi',width:320,height:568,hi:true},
    {name:'landscape',width:844,height:390}, {name:'reduced',width:390,height:844,hi:true,reduced:true},
    {name:'no-js',width:390,height:844,noJs:true},
  ]) {
    await command('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
    await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
    await command('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}`});await wait(1700);
    if(!view.reduced&&!view.noJs)assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('[data-venue-sign]')).opacity)<.2"),'Waits for scroll entry');
    await evaluate("window.scrollTo({top:document.getElementById('venue').offsetTop-innerHeight*.65,behavior:'instant'});true");await wait(1200);
    if(!view.reduced&&!view.noJs){
      const opacity=await evaluate("[...document.querySelectorAll('[data-venue-sign]')].map(e=>Number(getComputedStyle(e).opacity))");
      assert.ok(opacity[0]>opacity[2],'Sign entrances are staggered');assert.ok(opacity[0]>.08&&opacity[0]<1,'Intermediate entrance exists');
      await shot(`${view.name}-entering`);
    }
    await evaluate("document.getElementById('venue').scrollIntoView({behavior:'instant',block:'start'});true");await wait(1200);await evaluate('document.fonts.ready.then(()=>true)');
    const layout=await evaluate(`(()=>{const s=document.getElementById('venue'),h=s.querySelector('header').getBoundingClientRect();return {
      height:s.getBoundingClientRect().height,top:s.getBoundingClientRect().top,width:document.documentElement.scrollWidth,headTop:h.top,
      boards:[...s.querySelectorAll('.ns-wood-sign')].map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height};}),
      info:s.querySelector('address').getBoundingClientRect().bottom,
      disabled:s.querySelectorAll('button:disabled').length,external:s.querySelectorAll('a[target="_blank"]').length,
      preview:s.querySelector('[data-venue-explore]').getAttribute('href'),note:s.querySelector('#ns-venue-map-note').textContent,
      opacities:[...s.querySelectorAll('[data-venue-sign]')].map(e=>getComputedStyle(e).opacity),
      loaded:s.querySelector('.ns-plate img').naturalWidth>0,
      address:s.querySelector('address').textContent
    };})()`);
    assert.equal(layout.height,view.height);assert.ok(Math.abs(layout.top)<1);assert.ok(layout.width<=view.width);assert.ok(layout.headTop>=64);
    assert.equal(layout.disabled,2);assert.equal(layout.external,0);assert.ok(layout.preview.endsWith('/invitation#ns-invite-venue'));assert.ok(layout.note);
    assert.equal(layout.address,'Full venue address placeholder');assert.deepEqual(layout.opacities,['1','1','1']);if(!view.noJs)assert.ok(layout.loaded);
    for(const board of layout.boards){assert.ok(board.height>=44);assert.ok(board.top>=64&&board.bottom<=view.height-65,`${view.name}: board fits ${JSON.stringify(board)}`);assert.ok(board.left>=0&&board.right<=view.width);}
    await shot(`${view.name}-settled`);assert.ok(layout.info<=view.height-65,`${view.name}: venue address remains above the dock (${layout.info})`);count++;
    if(view.noJs){assert.equal(await evaluate("document.querySelector('[data-venue-explore]').hasAttribute('aria-haspopup')"),false);continue;}
    await evaluate("document.querySelector('[data-venue-explore]').click();true");await wait(150);
    assert.equal(await evaluate("document.querySelector('.ns-venue-dialog').open"),true);
    if(!view.reduced)assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('.ns-venue-preview')).opacity)<1"));
    await wait(950);await shot(`${view.name}-preview`);
    const modal=await evaluate("(()=>{const d=document.querySelector('.ns-venue-dialog'),r=d.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,lock:document.documentElement.hasAttribute('data-venue-open'),focus:d.contains(document.activeElement),opacity:getComputedStyle(d.querySelector('article')).opacity,note:d.querySelector('#ns-venue-preview-note').textContent,animations:d.getAnimations({subtree:true}).length};})()");
    assert.ok(modal.top>=0&&modal.bottom<=view.height&&modal.left>=0&&modal.right<=view.width);assert.ok(modal.lock&&modal.focus&&modal.note);assert.equal(modal.opacity,'1');if(view.reduced)assert.equal(modal.animations,0);
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait(450);
    assert.equal(await evaluate("!document.querySelector('.ns-venue-dialog').open&&!document.documentElement.hasAttribute('data-venue-open')&&document.activeElement.matches('[data-venue-explore]')"),true);
    // A close during opening must continue from the current visual pose.
    if(!view.reduced){
      await evaluate("document.querySelector('[data-venue-explore]').click();true");await wait(110);
      const continuity=await evaluate("(()=>{const f=document.querySelector('.ns-venue-preview');f.getAnimations().forEach(a=>a.pause());const before=getComputedStyle(f).transform;document.querySelector('.ns-venue-close').click();f.getAnimations().forEach(a=>a.pause());return {before,after:getComputedStyle(f).transform};})()");
      assert.equal(continuity.before,continuity.after,'No full-size jump on interrupted close');
      await evaluate("document.querySelector('.ns-venue-preview').getAnimations().forEach(a=>a.finish());true");await wait(60);
      assert.equal(await evaluate("document.querySelector('.ns-venue-dialog').open"),false);
    }
    count++;
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  console.log(`PASS: ${count} venue layout/reveal/map-gating/modal/fallback checks. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
