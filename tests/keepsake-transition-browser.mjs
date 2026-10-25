// Freeze native animation frames to inspect clipping and interruption continuity.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const target=await(await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let id=0;const pending=new Map();
socket.addEventListener('message',({data})=>{const m=JSON.parse(String(data)),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const out='.astro/keepsake-transition-qa';await fs.mkdir(out,{recursive:true});
const shot=async name=>{const r=await command('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
try {
  await command('Page.enable');await command('Runtime.enable');await command('Page.bringToFront');
  for(const width of [1440,390]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    await command('Page.navigate',{url:'http://127.0.0.1:4321/#journey'});await wait(2600);
    const diagnosis=await evaluate(`(()=>{const b=document.querySelector('[data-keepsake]');b.click();const d=document.querySelector('.ns-memory-dialog[open]'),f=d.querySelector('.ns-memory-frame'),a=f.getAnimations()[0];a.pause();a.currentTime=80;const r=f.getBoundingClientRect(),box=d.getBoundingClientRect();return {overflow:getComputedStyle(d).overflow,frame:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},dialog:{left:box.left,right:box.right,top:box.top,bottom:box.bottom}}})()`);
    await shot(`${width}-opening-80ms`);
    console.log(`${width} early opening: ${JSON.stringify(diagnosis)}`);
    assert.equal(diagnosis.overflow,'visible','Incoming frame must not be clipped by the centered dialog box');
    for(const time of [200,420,700]) {await evaluate(`document.querySelector('.ns-memory-dialog[open] .ns-memory-frame').getAnimations()[0].currentTime=${time};true`);await shot(`${width}-opening-${time}ms`);}
    const interruption=await evaluate(`(()=>{const d=document.querySelector('.ns-memory-dialog[open]'),f=d.querySelector('.ns-memory-frame'),a=f.getAnimations()[0];a.currentTime=190;const before=getComputedStyle(f).transform;d.dispatchEvent(new Event('cancel',{cancelable:true}));const closing=f.getAnimations()[0];closing.pause();closing.currentTime=0;return {before,after:getComputedStyle(f).transform};})()`);
    assert.equal(interruption.before,interruption.after,'Closing mid-open begins from the current pose, without a jump');
    await evaluate("document.querySelector('.ns-memory-dialog[open] .ns-memory-frame').getAnimations()[0].finish();true");await wait(150);
    assert.equal(await evaluate("!!document.querySelector('.ns-memory-dialog[open]')"),false);
  }
  console.log(`PASS: opening frames and interrupted-close continuity. Screenshots: ${out}`);
}finally{socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
