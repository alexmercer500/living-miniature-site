// Production preview :4321; isolated Chrome CDP :9333. No dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='.astro/celebrations-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
let count=0;
try {
  await command('Page.enable');await command('Runtime.enable');await command('Page.bringToFront');
  for(const view of [
    {name:'desktop',width:1440,height:900}, {name:'wide',width:1920,height:1080},
    {name:'mobile',width:390,height:844}, {name:'short-hindi',width:320,height:568,hi:true},
    {name:'reduced',width:390,height:844,hi:true,reduced:true}, {name:'no-js',width:390,height:844,noJs:true},
  ]) {
    await command('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
    await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
    await command('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}`});await wait(1700);
    if(!view.reduced&&!view.noJs) assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('.ns-event')).opacity)<.2"),'Cards wait for scroll entry');
    await evaluate("window.scrollTo({top:document.getElementById('celebrations').offsetTop-innerHeight*.65,behavior:'instant'});true");
    if(!view.reduced&&!view.noJs) {
      await wait(1200);
      const opacities=await evaluate("[...document.querySelectorAll('.ns-event')].map(e=>Number(getComputedStyle(e).opacity))");
      assert.ok(opacities.some(v=>v>.08&&v<1),'Smooth intermediate reveal');
      if(view.width>=768) assert.ok(opacities[0]>opacities[2]+.01,'Desktop entrances are staggered');
      await shot(`${view.name}-entering`);
    }
    await evaluate("document.getElementById('celebrations').scrollIntoView({behavior:'instant',block:'start'});true");
    await wait(1200);await evaluate('document.fonts.ready.then(()=>true)');
    const scene=await evaluate("(()=>{const s=document.getElementById('celebrations');return {height:s.getBoundingClientRect().height,width:document.documentElement.scrollWidth,bg:getComputedStyle(s).backgroundColor,count:s.querySelectorAll('.ns-event').length}})()");
    assert.equal(scene.height,view.height);assert.ok(scene.width<=view.width);assert.equal(scene.count,3);assert.equal(scene.bg,await evaluate("CSS.supports('animation-timeline: view()')&&matchMedia('(prefers-reduced-motion: no-preference)').matches")?'rgba(0, 0, 0, 0)':'rgb(16, 33, 36)');
    for(let i=0;i<3;i++) {
      await evaluate(`(()=>{const row=document.querySelector('.ns-events');row.scrollLeft=row.children[${i}].offsetLeft-row.offsetLeft;return true})()`);await wait(1750);
      const state=await evaluate(`(()=>{const c=document.querySelectorAll('.ns-event')[${i}],r=c.getBoundingClientRect(),copy=c.querySelector('.ns-event-copy').getBoundingClientRect();return {top:r.top,bottom:r.bottom,opacity:getComputedStyle(c).opacity,radius:getComputedStyle(c).borderTopLeftRadius,title:c.querySelector('h3').textContent,date:c.querySelector('.ns-event-date').textContent,copyBottom:copy.bottom,mark:!!c.querySelector('.ns-event-mark'),scallop:!!c.querySelector('.ns-event-scallop'),animations:c.getAnimations().length};})()`);
      assert.ok(state.top>=64&&state.bottom<=view.height-65,`${view.name}: entire card fits (${state.top},${state.bottom})`);
      assert.equal(state.opacity,'1');assert.equal(state.radius,'22px');assert.ok(state.title&&state.date&&state.mark&&state.scallop);assert.ok(state.copyBottom<=state.bottom+1);
      if(view.reduced)assert.equal(state.animations,0);
      count++;
    }
    await evaluate("document.querySelector('.ns-events').scrollLeft=0;true");await wait(250);await shot(`${view.name}-settled`);
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${count} celebration card/reveal/layout/fallback checks. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
