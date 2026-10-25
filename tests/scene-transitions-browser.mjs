// Production preview :4321, isolated Chrome CDP :9333. No packages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const tab=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const cmd=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
const ev=async expression=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='.astro/scene-transitions-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await cmd('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
const names=['invitation','celebrations','venue','wishes','closing'];
const sample=to=>ev(`(()=>{const b=document.querySelector('[data-scene-bridge][data-to="${to}"]'),t=document.getElementById('${to}'),from=document.getElementById(b.dataset.from),v=from.querySelector('.envelope-viewport')||from;
 const controls=[...t.querySelectorAll('.ns-event,[data-venue-sign],[data-wish-arrival],[data-note-arrival]')];
 return {progress:Number(b.dataset.progress),visible:getComputedStyle(b).visibility,display:getComputedStyle(b).display,inert:b.inert,hidden:b.getAttribute('aria-hidden'),pointer:getComputedStyle(b).pointerEvents,
 active:document.querySelectorAll('[data-scene-bridge][data-active]').length,mask:getComputedStyle(b.querySelector('.ns-camera-incoming')).maskImage,clip:getComputedStyle(b.querySelector('.ns-camera-incoming')).clipPath,
 camera:getComputedStyle(b.querySelector('.ns-camera-arrival')).transform,controls:controls.map(e=>({opacity:getComputedStyle(e).opacity,transform:e.style.transform})),
 scroll:scrollY,start:t.offsetTop-v.offsetHeight,end:t.offsetTop,sourceTop:from.offsetTop,sourceHeight:from.offsetHeight,height:innerHeight,width:document.documentElement.scrollWidth,
 snap:getComputedStyle(document.documentElement).scrollSnapType,ready:document.querySelector('[data-nature-root]').hasAttribute('data-scenes-ready'),flag:document.documentElement.hasAttribute('data-scenes-scroll'),
 originalOpacity:getComputedStyle(t.querySelector('.envelope-backdrop,.ns-venue-landscape,.ns-wishes-landscape,.ns-art')).opacity,
 targetClass:t.classList.contains('ns-transition-target'),sections:document.querySelectorAll('.ns-home>section').length,
 noteNames:getComputedStyle(document.getElementById('ns-note-names')).opacity};})()`);
let count=0;
try{
 await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Network.enable');await cmd('Page.bringToFront');
 for(const view of [
  {name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844},
  {name:'short-hindi',width:320,height:568,hi:true},{name:'tablet',width:768,height:1024,hi:true},
  {name:'reduced',width:390,height:844,reduced:true},{name:'no-js',width:390,height:844,noJs:true},
  {name:'failed-art',width:390,height:844,failed:true},
 ]){
  if(process.argv[2]&&!process.argv[2].split(',').some(name=>view.name.includes(name)))continue;
  await cmd('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
  await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
  await cmd('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
  await cmd('Network.setBlockedURLs',{urls:view.failed?['*/_astro/*.avif','*/_astro/*.webp']:[]});
  await cmd('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}`});await wait(2400);
  const enhanced=!view.noJs&&!view.reduced&&!view.failed;
  assert.equal(await ev("document.querySelectorAll('[data-scene-bridge]').length"),5);
  if(enhanced)assert.deepEqual(await ev("[...document.querySelectorAll('[data-scene-bridge]')].map(e=>e.hasAttribute('data-prepared'))"),[true,false,false,false,false],'Only the nearby camera pair is prepared at the top');
  for(const to of names){
   // Start one viewport before the real target, including AFTER the envelope's track.
   await ev(`(()=>{const b=document.querySelector('[data-to="${to}"]'),t=document.getElementById('${to}'),s=document.getElementById(b.dataset.from),h=(s.querySelector('.envelope-viewport')||s).offsetHeight;window.scrollTo({top:t.offsetTop-h,behavior:'instant'});})()`);await wait(500);
   const begin=await sample(to);assert.equal(begin.sections,7);assert.ok(begin.inert&&begin.hidden==='true'&&begin.pointer==='none');assert.ok(begin.width<=view.width);
   if(to==='celebrations'&&enhanced){assert.ok(begin.start>begin.sourceTop+view.height*2,'Camera exit follows, never overlaps, the envelope opening');assert.equal(begin.sourceHeight,begin.end-begin.sourceTop);}
   if(enhanced){
    assert.ok(begin.ready,`${view.name}/${to}: nearby art ready`);
    let middle;
    for(const p of [.35,.6,.85]){
     await ev(`window.scrollTo({top:${begin.start}+( ${begin.end}-${begin.start})*${p},behavior:'instant'});true`);await wait(1200);
     const s=await sample(to);assert.equal(s.visible,'visible',`${view.name}/${to}/${p}`);assert.equal(s.active,1);assert.equal(s.snap,'none');assert.ok(s.flag&&s.targetClass);assert.ok(Math.abs(s.progress-p)<.004);assert.equal(s.originalOpacity,'0');assert.ok(s.width<=view.width);
     if(p===.6){middle=s;await shot(`${view.name}-${to}-middle`);}
     if(p===.85)assert.ok(s.controls.every(c=>c.opacity==='1'),'Readable hold before anchor');
     count++;
    }
    await ev(`window.scrollTo({top:${begin.start}+( ${begin.end}-${begin.start})*.6,behavior:'instant'});true`);await wait(1200);
    const reversed=await sample(to);assert.equal(reversed.mask,middle.mask);assert.equal(reversed.camera,middle.camera);assert.deepEqual(reversed.controls,middle.controls);
    await wait(900);const held=await sample(to);assert.equal(held.mask,reversed.mask);assert.equal(held.scroll,reversed.scroll,'No autoplay or scroll trapping');count++;
    if(to==='venue'){
     await ev("document.querySelector('[data-venue-explore]').focus({preventScroll:true});true");await wait(100);
     assert.ok((await sample(to)).controls.every(c=>c.opacity==='1'),'Keyboard focus overrides arrival');await ev('document.activeElement.blur();true');
    }
   }else{assert.equal(begin.display,'none');assert.equal(begin.ready,false);count++;}
   await ev(`document.getElementById('${to}').scrollIntoView({behavior:'instant',block:'start'});true`);await wait(180);
   const landed=await sample(to);assert.equal(landed.targetClass,false);assert.equal(landed.originalOpacity,'1');assert.ok(landed.controls.every(c=>c.opacity==='1'),'Fast jumps keep content readable');assert.equal(landed.noteNames,'1');
   assert.ok(landed.display==='none'||landed.visible==='hidden');await shot(`${view.name}-${to}-settled`);count++;
  }
  if(view.name==='desktop'){
   await ev("window.scrollTo({top:document.getElementById('venue').offsetTop-innerHeight*.5,behavior:'instant'});true");await wait(1100);
   await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await wait(200);
   const s=await sample('venue');assert.equal(s.display,'none');assert.equal(s.ready,false);assert.equal(s.flag,false);assert.equal(s.originalOpacity,'1');assert.ok(s.controls.every(c=>c.opacity==='1'));
   assert.equal(await ev("[...document.querySelectorAll('[data-scene-bridge]')].some(e=>e.hasAttribute('data-active')||e.hasAttribute('data-prepared')||e.style.length>0)"),false,'Preference switch restores all bridge styles');count++;
  }
 }
 assert.deepEqual(errors,[]);console.log(`PASS: ${count} later-scene scroll/reverse/hold/fast-jump/focus/fallback checks. Screenshots: ${out}`);
}finally{ws.close();await fetch(`http://127.0.0.1:9333/json/close/${tab.id}`);}
