// Production preview :4321; isolated headless Chrome CDP :9333. No packages.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data));if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const out='.astro/final-note-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
const enter=async()=>{await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});};
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
    await command('Network.setBlockedURLs',{urls:view.failed?['*closing-*.avif','*closing-*.webp']:[]});
    await command('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}`});await wait(1700);
    if(!view.noJs&&!view.reduced)assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('[data-note-arrival]')).opacity)<.2"),'Note waits for section entry');
    await evaluate("window.scrollTo({top:document.getElementById('closing').offsetTop-innerHeight*.65,behavior:'instant'});true");await wait(1200);
    const early=await evaluate("(()=>{const n=document.getElementById('ns-note-names');return {opacity:getComputedStyle(n).opacity,animations:n.getAnimations().length,text:n.textContent,parent:Number(getComputedStyle(document.querySelector('[data-note-arrival]')).opacity)};})()");
    assert.equal(early.opacity,'1');assert.equal(early.animations,0);assert.ok(early.text,'Names are printed, not revealed separately');
    if(!view.noJs&&!view.reduced){assert.ok(early.parent>.08&&early.parent<1,'Slow intermediate card reveal');await shot(`${view.name}-entering`);}
    await evaluate("document.getElementById('closing').scrollIntoView({behavior:'instant',block:'start'});true");await wait(1200);await evaluate('document.fonts.ready.then(()=>true)');
    const layout=await evaluate(`(()=>{const s=document.getElementById('closing'),card=s.querySelector('.ns-note-card'),r=card.getBoundingClientRect(),h=s.querySelector('header').getBoundingClientRect();return {
      height:s.getBoundingClientRect().height,top:s.getBoundingClientRect().top,width:document.documentElement.scrollWidth,headingTop:h.top,
      card:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},
      names:s.querySelector('#ns-note-names').textContent,message:s.querySelector('.ns-note-message').textContent,
      copy:[...s.querySelector('.ns-note-copy').children].map(e=>{const b=e.getBoundingClientRect();return {text:e.textContent,top:b.top,bottom:b.bottom,left:b.left,right:b.right};}),
      actions:[...s.querySelectorAll('.ns-note-actions a')].map(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,height:b.height,left:b.left,right:b.right,href:e.getAttribute('href')};}),
      opacity:getComputedStyle(s.querySelector('[data-note-arrival]')).opacity,float:getComputedStyle(s.querySelector('[data-note-arrival]')).animationName,
      glint:getComputedStyle(s.querySelector('.ns-note-glint')).opacity,ready:s.querySelector('img').naturalWidth>0,src:s.querySelector('img').currentSrc,
      floral:s.querySelectorAll('.ns-note-floral').length,overflow:getComputedStyle(s).overflowY,
      refs:[...s.querySelectorAll('*')].flatMap(e=>[...e.attributes].flatMap(a=>[...a.value.matchAll(/url\\(#([^)]*)\\)/g)].map(m=>m[1]).concat(a.name==='href'&&a.value.startsWith('#')?[a.value.slice(1)]:[]))).filter(id=>!document.getElementById(id))
    };})()`);
    await shot(`${view.name}-settled`);
    assert.equal(layout.height,view.height);assert.ok(Math.abs(layout.top)<2);assert.ok(layout.width<=view.width);assert.ok(layout.headingTop>=64);assert.equal(layout.overflow,'clip');assert.equal(layout.opacity,'1');assert.equal(layout.floral,2);assert.deepEqual(layout.refs,[]);
    assert.equal(layout.names,view.hi?'साथी एक एवं साथी दो':'Partner One & Partner Two');assert.ok(layout.message);
    assert.ok(layout.card.top>=64&&layout.card.bottom<=view.height-65&&layout.card.left>=0&&layout.card.right<=view.width,`${view.name}: card fits ${JSON.stringify(layout.card)}`);
    for(const copy of layout.copy)assert.ok(copy.top>=layout.card.top&&copy.bottom<=layout.card.bottom&&copy.left>=layout.card.left&&copy.right<=layout.card.right,`${view.name}: copy fits paper ${JSON.stringify(copy)}`);
    for(const action of layout.actions)assert.ok(action.top>=64&&action.bottom<=view.height-65&&action.height>=44&&action.left>=0&&action.right<=view.width,`${view.name}: link fits ${JSON.stringify(action)}`);
    assert.equal(layout.actions[0].href,`${view.hi?'/hi':''}/invitation`);assert.equal(layout.actions[1].href,'#welcome');
    if(!view.noJs&&!view.failed){assert.ok(layout.ready);assert.ok(layout.src.includes(view.width>=768&&view.width>=view.height?'closing-desktop.':'closing-mobile.'));}
    assert.equal(layout.float,view.noJs||view.reduced?'none':'ns-note-breathe');assert.equal(layout.glint,'0');count++;
    // Ordinary keyboard links remain real navigation, including the no-JS path.
    if(view.name==='mobile'||view.name==='short-hindi'||view.reduced||view.noJs){
      await evaluate("document.querySelector('.ns-note-back').focus({preventScroll:true});true");await enter();await wait(2300);
      assert.ok(Math.abs(await evaluate("document.getElementById('welcome').getBoundingClientRect().top"))<2,'Back-to-beginning works');
      await evaluate("document.getElementById('closing').scrollIntoView({behavior:'instant'});document.querySelector('.ns-note-actions .ns-button').focus({preventScroll:true});true");await enter();await wait(1100);
      assert.ok(await evaluate("location.pathname.endsWith('/invitation')||location.pathname.endsWith('/invitation/')"));count++;
    }
  }
  assert.deepEqual(errors,[]);console.log(`PASS: ${count} final-note composition/reveal/names/links/fallback checks. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
