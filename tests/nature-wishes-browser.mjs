// Production preview :4321 and isolated headless Chrome CDP :9333. No packages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='.astro/wishes-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
let count=0;
try {
  await command('Page.enable');await command('Runtime.enable');await command('Network.enable');await command('Page.bringToFront');
  for(const view of [
    {name:'desktop',width:1440,height:900},{name:'wide',width:1920,height:1080},
    {name:'tablet',width:768,height:1024,hi:true},{name:'mobile',width:390,height:844},
    {name:'short-hindi',width:320,height:568,hi:true},{name:'landscape',width:844,height:390},
    {name:'reduced',width:390,height:844,hi:true,reduced:true},
    {name:'no-js',width:390,height:844,noJs:true},{name:'failed-art',width:390,height:844,failed:true},
  ]) {
    if(process.argv[2]&&!view.name.includes(process.argv[2])) continue;
    await command('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
    await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
    await command('Network.setBlockedURLs',{urls:view.failed?['*wishes-*.avif','*wishes-*.webp']:[]});
    await command('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}`});await wait(1700);
    if(!view.noJs&&!view.reduced)assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('[data-wish-arrival]')).opacity)<.2"),'Tags wait for arrival');
    await evaluate("window.scrollTo({top:document.getElementById('wishes').offsetTop-innerHeight*.65,behavior:'instant'});true");await wait(1200);
    if(!view.noJs&&!view.reduced){
      const opacity=await evaluate("[...document.querySelectorAll('[data-wish-arrival]')].map(e=>Number(getComputedStyle(e).opacity))");
      assert.ok(opacity[0]>opacity[5],'Staggered reveal');assert.ok(opacity[0]>.08&&opacity[0]<1,'Slow intermediate entrance');await shot(`${view.name}-entering`);
    }
    await evaluate("document.getElementById('wishes').scrollIntoView({behavior:'instant',block:'start'});true");await wait(1200);await evaluate('document.fonts.ready.then(()=>true)');
    const layout=await evaluate(`(()=>{const s=document.getElementById('wishes'),h=s.querySelector('header').getBoundingClientRect();return {
      height:s.getBoundingClientRect().height,top:s.getBoundingClientRect().top,width:document.documentElement.scrollWidth,headingTop:h.top,
      tags:[...s.querySelectorAll('[data-wish-tag]')].map(e=>{const r=e.getBoundingClientRect(),m=e.querySelector('.ns-wish-message').getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,text:e.textContent.trim(),disabled:e.disabled,messageInside:m.top>=r.top+24&&m.bottom<=r.bottom-7,opacity:getComputedStyle(e.closest('[data-wish-arrival]')).opacity};}),
      demo:s.querySelector('#ns-wishes-hint').textContent,demoBottom:s.querySelector('#ns-wishes-hint').getBoundingClientRect().bottom,
      wind:[...s.querySelectorAll('.ns-wish-wind')].map(e=>({name:getComputedStyle(e).animationName,duration:getComputedStyle(e).animationDuration,state:getComputedStyle(e).animationPlayState,rotate:getComputedStyle(e).rotate})),
      forms:[...s.querySelectorAll('form')].filter(f=>f.hasAttribute('action')).length,rsvp:!!s.querySelector('#rsvp'),rsvpBottom:s.querySelector('#rsvp')?.getBoundingClientRect().bottom??0,ready:s.querySelector('img').naturalWidth>0,
      cols:getComputedStyle(s.querySelector('.ns-wish-garland')).gridTemplateColumns.split(' ').length,overflow:getComputedStyle(s).overflowY
    };})()`);
    await shot(`${view.name}-settled`);
    assert.equal(layout.height,view.height);assert.ok(Math.abs(layout.top)<2);assert.ok(layout.width<=view.width);assert.ok(layout.headingTop>=64);assert.equal(layout.overflow,'clip');assert.equal(layout.tags.length,6);
    assert.equal(layout.cols,view.width<768||(view.width<=1024&&view.width<=view.height)?3:6);assert.equal(layout.forms,0,'No form submits anywhere');assert.equal(layout.rsvp,true);assert.ok(layout.rsvpBottom<=view.height-65,'RSVP clears the dock');assert.ok(layout.demo);assert.ok(layout.demoBottom<view.height-65);
    for(const tag of layout.tags){assert.equal(tag.opacity,'1');assert.equal(tag.disabled,Boolean(view.noJs));assert.ok(tag.height>=44&&tag.top>=64&&tag.bottom<=view.height-65,`${view.name}: tag vertical bounds ${JSON.stringify(tag)}`);assert.ok(tag.left>=0&&tag.right<=view.width,`${view.name}: tag horizontal bounds ${JSON.stringify(tag)}`);assert.ok(tag.messageInside,`${view.name}: message fits tag ${tag.text}`);}
    if(!view.noJs&&!view.failed)assert.ok(layout.ready);
    if(view.noJs||view.reduced)assert.ok(layout.wind.every(w=>w.name==='none'));
    else assert.ok(layout.wind.every(w=>w.name==='ns-wish-wind'&&parseFloat(w.duration)>=7&&parseFloat(w.duration)<=11));
    count++;
    if(view.noJs)continue;
    // Layout-only fixture: future configured countdown/RSVP must also fit.
    // Never changes content files or sends guest data anywhere.
    if(view.name==='mobile'||view.name==='short-hindi'||view.name==='landscape') {
      const details=await evaluate(`(()=>{const s=document.getElementById('wishes'),e=s.querySelector('#rsvp'),c=document.createElement('div');c.className='ns-countdown';c.dataset.qaDetails='';c.innerHTML=['Days','Hours','Minutes','Seconds'].map(u=>'<div><strong>24</strong><span>'+u+'</span></div>').join('');e.prepend(c);const tags=[...s.querySelectorAll('[data-wish-tag]')].map(t=>{const r=t.getBoundingClientRect(),m=t.querySelector('.ns-wish-message').getBoundingClientRect();return {top:r.top,bottom:r.bottom,message:m.bottom<=r.bottom-5};}),b=e.getBoundingClientRect();return {tags,top:b.top,bottom:b.bottom};})()`);
      await shot(`${view.name}-configured-layout`);
      assert.ok(details.bottom<=view.height-65,`${view.name}: configured actions clear dock ${JSON.stringify(details)}`);
      assert.ok(details.tags.every(t=>t.top>=64&&(t.bottom<details.top||t.top>details.bottom)&&t.message),`${view.name}: configured tags never overlap the RSVP row ${JSON.stringify(details)}`);
      await evaluate("document.querySelector('[data-qa-details]').remove();true");
    }
    await evaluate("document.querySelector('[data-wish-tag]').focus({preventScroll:true});true");
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(120);
    const tap=await evaluate("(()=>{const t=document.querySelector('[data-wish-tag]'),g=t.closest('.ns-wish-gesture');return {warm:t.hasAttribute('data-warmed'),focus:document.activeElement===t,count:g.getAnimations().length,duration:g.getAnimations()[0]?.effect.getTiming().duration};})()");
    assert.ok(tap.warm&&tap.focus);assert.equal(tap.count,view.reduced?0:1);if(!view.reduced)assert.equal(tap.duration,1800);
    if(!view.reduced){
      const continuous=await evaluate("(()=>{const t=document.querySelector('[data-wish-tag]'),g=t.closest('.ns-wish-gesture');g.getAnimations().forEach(a=>a.pause());const before=getComputedStyle(g).transform;t.click();g.getAnimations().forEach(a=>a.pause());const after=getComputedStyle(g).transform;g.getAnimations().forEach(a=>a.play());return before===after;})()");
      assert.ok(continuous,'Repeated taps continue from current pose');
    }
    await wait(1950);assert.equal(await evaluate("document.querySelector('[data-wish-tag]').hasAttribute('data-warmed')"),false);
    await evaluate("document.getElementById('welcome').scrollIntoView({behavior:'instant'});true");await wait(250);
    if(!view.reduced)assert.equal(await evaluate("getComputedStyle(document.querySelector('.ns-wish-wind')).animationPlayState"),'paused');
    count++;
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${count} wishes layout/reveal/keyboard/flutter/fallback checks. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
