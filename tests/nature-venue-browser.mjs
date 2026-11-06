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
  // Each side's venue chapter: its own venues, a map and exact directions for each, all on one
  // screen above the dock, revealed once as the guest arrives.
  const pin='destination=21.238759%2C81.35969';
  for(const view of [
    {name:'amber-desktop',site:'amber-fort',venues:2,width:1440,height:900},
    {name:'amber-mobile',site:'amber-fort',venues:2,width:390,height:844},
    {name:'amber-se',site:'amber-fort',venues:2,width:375,height:667},
    {name:'amber-short-hindi',site:'amber-fort',venues:2,width:320,height:568,hi:true},
    {name:'lake-mobile',site:'lake-city',venues:1,width:390,height:844},
    {name:'lake-reduced-hindi',site:'lake-city',venues:1,width:390,height:844,hi:true,reduced:true},
    {name:'amber-no-js',site:'amber-fort',venues:2,width:390,height:844,noJs:true},
  ]) {
    await command('Emulation.setDeviceMetricsOverride',{width:view.width,height:view.height,deviceScaleFactor:1,mobile:false});
    await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
    await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
    await command('Page.navigate',{url:`http://127.0.0.1:4321/${view.hi?'hi/':''}${view.site}/`});await wait(1700);
    if(!view.reduced&&!view.noJs)assert.ok(await evaluate("Number(getComputedStyle(document.querySelector('.ns-location-card')).opacity)<.2"),'Venue cards wait for the guest to arrive');
    await evaluate("document.getElementById('venue').scrollIntoView({behavior:'instant',block:'start'});true");await wait(2600);await evaluate('document.fonts.ready.then(()=>true)');
    const layout=await evaluate(`(()=>{const s=document.getElementById('venue'),r=s.getBoundingClientRect();return {
      height:r.height,top:r.top,width:document.documentElement.scrollWidth,
      cards:[...s.querySelectorAll('.ns-location-card')].map(c=>{const b=c.getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right,opacity:getComputedStyle(c).opacity};}),
      buttons:[...s.querySelectorAll('.ns-location-actions a')].map(a=>{const b=a.getBoundingClientRect();return {href:a.href,blank:a.target==='_blank',height:b.height,bottom:b.bottom};}),
    };})()`);
    assert.ok(Math.abs(layout.height-view.height)<2&&Math.abs(layout.top)<2,`${view.name}: the venue chapter is one screen (${layout.height})`);
    assert.ok(layout.width<=view.width,`${view.name}: no sideways scroll`);
    assert.equal(layout.cards.length,view.venues,`${view.name}: venue count`);
    for(const card of layout.cards){assert.equal(card.opacity,'1');assert.ok(card.left>=0&&card.right<=view.width,`${view.name}: card fits ${JSON.stringify(card)}`);}
    assert.equal(layout.buttons.length,view.venues*2,`${view.name}: a map and directions per venue`);
    for(const button of layout.buttons){assert.ok(button.blank&&button.height>=44,`${view.name}: button ${JSON.stringify(button)}`);assert.ok(button.bottom<=view.height-65,`${view.name}: buttons stay above the dock ${JSON.stringify(button)}`);}
    assert.equal(layout.buttons[0].href,'https://maps.app.goo.gl/pkGwVhJyaBzrNaZy5','View map opens Dhancha Bhavan');
    assert.ok(layout.buttons[1].href.endsWith(pin),'Directions go to the Dhancha Bhavan pin');
    await shot(`${view.name}-settled`);count++;
  }
  assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
  console.log(`PASS: ${count} venue layout/reveal/map/directions/fallback checks. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
