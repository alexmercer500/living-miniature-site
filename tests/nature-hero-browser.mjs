// Preview :4321, isolated Chrome CDP :9333. No external packages.
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
const output='.astro/nature-hero-qa';await fs.mkdir(output,{recursive:true});
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
    await command('Page.navigate',{url:`http://127.0.0.1:4321${view.path}`});
    await wait(250);
    const entrance=await evaluate("({name:getComputedStyle(document.querySelector('.ns-couple')).animationName,particles:document.querySelectorAll('.ns-drift').length,lantern:getComputedStyle(document.querySelector('.ns-lantern-swing')).animationName})");
    assert.equal(entrance.particles,24,'Bounded particle count');
    if(!view.reduced&&!view.noJs) {assert.equal(entrance.name,'ns-hero-arrive');assert.equal(entrance.lantern,'ns-lantern-sway');await shot(`${view.name}-entering`);}
    if(view.reduced) {assert.equal(entrance.name,'none');assert.equal(entrance.lantern,'none');}
    await wait(2600);await evaluate('document.fonts.ready.then(()=>true)');
    const state=await evaluate(`(()=>{
      const hero=document.querySelector('.ns-hero'),copy=document.querySelector('.ns-hero-copy'),lantern=document.querySelector('[data-nature-lantern]'),r=lantern.getBoundingClientRect();
      return {height:hero.getBoundingClientRect().height,width:document.documentElement.scrollWidth,lantern:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},text:[...copy.querySelectorAll('h1 > *, .ns-couple, .ns-date')].map(e=>({text:e.textContent,opacity:getComputedStyle(e).opacity,filter:getComputedStyle(e).filter})),particles:{pointer:getComputedStyle(document.querySelector('.ns-atmosphere')).pointerEvents,hidden:getComputedStyle(document.querySelector('.ns-atmosphere')).display==='none',visible:[...document.querySelectorAll('.ns-drift')].filter(e=>getComputedStyle(e).display!=='none'&&Number(getComputedStyle(e).opacity)>.05).length},refs:[...hero.querySelectorAll('*')].flatMap(e=>[...e.attributes].flatMap(a=>[...a.value.matchAll(/url\\(#([^)]*)\\)/g)].map(m=>m[1]))).filter(id=>!document.getElementById(id))};})()`);
    assert.equal(state.height,view.height);assert.ok(state.width<=view.width);
    assert.ok(state.lantern.left>=0&&state.lantern.right<=view.width&&state.lantern.top>=60&&state.lantern.bottom<view.height,`${view.name}: lantern fits ${JSON.stringify(state.lantern)}`);
    assert.deepEqual(state.refs,[],'No broken SVG gradients');
    for(const text of state.text){assert.equal(text.opacity,'1');assert.ok(text.filter==='none'||text.filter==='blur(0px)');assert.ok(text.text.length>0);}
    assert.equal(state.particles.pointer,'none','Particles cannot intercept navigation');
    if(view.reduced)assert.ok(state.particles.hidden);else if(!view.noJs)assert.ok(state.particles.visible>0&&state.particles.visible<=24);
    await shot(`${view.name}-settled`);
    if(!view.reduced&&!view.noJs){
      const before=await evaluate("getComputedStyle(document.querySelector('.ns-lantern-swing')).transform");await wait(450);
      assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.ns-lantern-swing')).transform"),before,'Lantern actually sways');
      await evaluate("window.scrollTo({top:innerHeight*2,behavior:'instant'});true");await wait(400);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.ns-lantern-swing')).animationPlayState"),'paused','Offscreen loops pause');
      await evaluate("window.scrollTo({top:0,behavior:'instant'});true");await wait(400);
      assert.equal(await evaluate("getComputedStyle(document.querySelector('.ns-couple')).opacity"),'1','Returning never re-hides names');
    }
    count++;
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${count} hero viewport/motion/fallback cases. Screenshots: ${output}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
