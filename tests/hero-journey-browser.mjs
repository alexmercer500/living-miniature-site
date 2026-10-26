// Production preview :4321, isolated headless Chrome CDP :9333. No packages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='.astro/hero-journey-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
const state=()=>evaluate(`(()=>{const r=document.querySelector('[data-nature-root]'),b=document.querySelector('[data-journey-bridge]'),j=document.getElementById('journey');return {
  ready:r.hasAttribute('data-journey-ready'),active:r.hasAttribute('data-journey-transition'),progress:Number(b.dataset.progress),clip:getComputedStyle(b.querySelector('.ns-bridge-incoming')).clipPath,mask:getComputedStyle(b.querySelector('.ns-bridge-incoming')).maskImage,
  outgoing:getComputedStyle(b.querySelector('.ns-bridge-outgoing')).transform,incoming:getComputedStyle(b.querySelector('.ns-bridge-incoming-camera')).transform,
  visible:getComputedStyle(b).visibility,display:getComputedStyle(b).display,width:document.documentElement.scrollWidth,scroll:scrollY,snap:getComputedStyle(document.documentElement).scrollSnapType,free:document.documentElement.hasAttribute('data-journey-scroll'),
  height:innerHeight,heroHeight:document.getElementById('welcome').getBoundingClientRect().height,journeyHeight:j.getBoundingClientRect().height,journeyTop:j.offsetTop,
  envelopeTop:document.querySelector('[data-envelope]').offsetTop,copyOpacity:getComputedStyle(j.querySelector('.ns-story-copy')).opacity,
  memories:[...j.querySelectorAll('[data-memory-hanger]')].map(e=>({opacity:getComputedStyle(e).opacity,transform:e.style.transform})),
  originalHero:getComputedStyle(document.querySelector('.ns-hero>.ns-art')).opacity,originalJourney:getComputedStyle(j.querySelector('.ns-story-landscape>.ns-art')).opacity,
  sectionCount:document.querySelectorAll('.ns-home>section').length,inert:b.inert,hidden:b.getAttribute('aria-hidden')
};})()`);
let count=0;
try {
  await command('Page.enable');await command('Runtime.enable');await command('Network.enable');await command('Page.bringToFront');
  for(const view of [
    {name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844},
    {name:'short-hindi',width:320,height:568,hi:true},{name:'tablet',width:768,height:1024,hi:true},
    {name:'reduced',width:390,height:844,reduced:true},{name:'no-js',width:390,height:844,noJs:true},
    {name:'failed-art',width:390,height:844,failed:true},
  ]) {
    if(process.argv[2]&&!view.name.includes(process.argv[2]))continue;
    await command('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
    await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
    await command('Network.setBlockedURLs',{urls:view.failed?['*hero-mobile.*','*hero-desktop.*','*journey-mobile.*','*journey-desktop.*']:[]});
    await command('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}`});await wait(2400);
    const initial=await state();assert.equal(initial.width<=view.width,true);assert.equal(initial.heroHeight,view.height);assert.equal(initial.journeyHeight,view.height);assert.equal(initial.journeyTop,view.height);assert.equal(initial.envelopeTop,2*view.height);assert.equal(initial.sectionCount,7);assert.ok(initial.inert&&initial.hidden==='true');
    const enhanced=!view.noJs&&!view.reduced&&!view.failed;
    assert.equal(initial.ready,enhanced);assert.equal(initial.originalHero,'1');
    await shot(`${view.name}-hero`);
    if(enhanced){
      const snapshots=new Map();
      for(const p of [.15,.4,.6,.85]){
        await evaluate(`window.scrollTo({top:innerHeight*${p},behavior:'instant'});true`);await wait(1200);
        const s=await state();assert.ok(s.active&&s.visible==='visible');assert.equal(s.snap,'none');assert.ok(Math.abs(s.progress-p)<.003);assert.ok(s.width<=view.width);assert.equal(s.originalHero,'0');assert.equal(s.originalJourney,'0');
        if(p===.4||p===.6)assert.ok(s.clip.startsWith('polygon(')||s.mask.includes('radial-gradient('));
        if(p===.85){assert.equal(s.copyOpacity,'1');assert.ok(s.memories.every(m=>m.opacity==='1'));}
        snapshots.set(p,s);await shot(`${view.name}-${p}`);count++;
      }
      await wait(700);const held=await state();assert.equal(held.clip,snapshots.get(.85).clip);assert.equal(held.mask,snapshots.get(.85).mask);assert.equal(held.scroll,snapshots.get(.85).scroll,'No scroll trapping/autoplay');
      for(const p of [.6,.4,.15]){
        await evaluate(`window.scrollTo({top:innerHeight*${p},behavior:'instant'});true`);await wait(1200);
        const s=await state(),original=snapshots.get(p);assert.equal(s.clip,original.clip,'Reverse reproduces the same edge');assert.equal(s.mask,original.mask);assert.equal(s.incoming,original.incoming);assert.deepEqual(s.memories,original.memories);
      }
      count++;
      // A jump finishes the camera's short glide (GLIDE_SECONDS) and lands fully readable.
      await evaluate("document.getElementById('journey').scrollIntoView({behavior:'instant'});true");await wait(1000);
      const landed=await state();assert.equal(landed.active,false);assert.equal(landed.free,false,'Handoff returns snap ownership to later chapters');assert.equal(landed.originalJourney,'1');assert.equal(landed.copyOpacity,'1');assert.ok(landed.memories.every(m=>m.opacity==='1'));
      await shot(`${view.name}-journey`);count++;
      if(view.name==='desktop'){
        await evaluate("window.scrollTo({top:innerHeight*.5,behavior:'instant'});true");await wait(1000);
        await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(250);
        const reduced=await state();assert.equal(reduced.ready,false);assert.equal(reduced.display,'none');assert.equal(reduced.originalHero,'1');assert.ok(reduced.memories.every(m=>m.opacity==='1'));
        assert.equal(await evaluate("[...document.querySelector('[data-nature-root]').style].filter(n=>n.startsWith('--bridge-')).length"),0,'Motion cleanup restores original scene');
        await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await wait(1200);assert.equal((await state()).ready,true);count++;
      }
    }else{
      assert.equal(initial.display,'none');await evaluate("document.getElementById('journey').scrollIntoView({behavior:'instant'});true");await wait(1200);
      const s=await state();assert.equal(s.ready,false);assert.equal(s.originalJourney,'1');assert.ok(s.memories.every(m=>m.opacity==='1'));await shot(`${view.name}-journey`);count++;
    }
    await evaluate("document.getElementById('closing').scrollIntoView({behavior:'instant'});true");await wait(150);const end=await state();assert.ok(end.display==='none'||end.visible==='hidden');
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${count} Hero→Journey scroll/reverse/hold/anchor/fallback checks. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
