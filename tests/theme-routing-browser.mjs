// Production preview on :4321; isolated Chrome CDP on :9333. No dependencies.
import assert from 'node:assert/strict';
const target=await (await fetch('http://127.0.0.1:9333/json/new?about:blank',{method:'PUT'})).json();
const socket=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
let id=0;
const pending=new Map();
socket.addEventListener('message',({data})=>{
  const message=JSON.parse(String(data)), request=pending.get(message.id);
  if(request) {pending.delete(message.id);message.error?request.reject(new Error(JSON.stringify(message.error))):request.resolve(message.result);}
});
const command=(method,params={})=>new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});
const evaluate=async expression=>{
  const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let count=0;
try {
  await command('Page.enable');await command('Runtime.enable');await command('Page.bringToFront');
  for(const width of [390,1440]) {
    const height=width===390?844:900;
    await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    for(const view of [
      ...['/#venue','/hi/#journey','/#closing','/hi/#celebrations'].map(path=>({path})),
      {path:'/#venue',noJs:true}, {path:'/hi/#venue',reduced:true},
    ]) {
      const {path}=view;
      await command('Emulation.setScriptExecutionDisabled',{value:Boolean(view.noJs)});
      await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:view.reduced?'reduce':'no-preference'}]});
      await command('Page.navigate',{url:`http://127.0.0.1:4321${path}`});
      await wait(1600);
      await evaluate('document.fonts.ready.then(()=>true)');await wait(600);
      const state=await evaluate(`(()=>{const r=document.querySelector(location.hash).getBoundingClientRect();return {top:r.top,bottom:r.bottom,theme:document.documentElement.dataset.theme,royal:document.querySelectorAll('a[href*="royal"]').length,locale:document.querySelector('.ns-locales a[lang="hi"]').getAttribute('href')}})()`);
      assert.equal(state.theme,'nature');
      assert.ok(Math.abs(state.top)<2&&Math.abs(state.bottom-height)<2,`${width}/${path}: direct hash fills viewport ${JSON.stringify(state)}`);
      assert.equal(state.royal,0,'No links to the retired Royal theme');
      assert.equal(state.locale,'/hi/');
      count++;
    }
  }
  await command('Emulation.setScriptExecutionDisabled',{value:false});
  // Retired theme URLs land on the live Nature page, section hash included.
  for(const [from,to] of [['/royal/','/'],['/hi/royal/#venue','/hi/#venue'],['/royal/invitation/','/invitation'],['/nature/#closing','/#closing'],['/hi/nature/invitation/','/hi/invitation']]) {
    await command('Page.navigate',{url:`http://127.0.0.1:4321${from}`});await wait(1500);
    const state=await evaluate("({theme:document.documentElement.dataset.theme,path:location.pathname,hash:location.hash})");
    assert.equal(state.theme,'nature');
    assert.equal(state.path+state.hash,to,`${from} forwards to ${to}`);
    count++;
  }
  console.log(`PASS: ${count} deep-link, locale and retired-URL checks.`);
} finally {socket.close();await fetch(`http://127.0.0.1:9333/json/close/${target.id}`);}
