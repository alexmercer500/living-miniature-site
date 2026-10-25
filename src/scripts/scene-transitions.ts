import { sceneTransitionState,sceneEntryState,scenePhase,sceneHandoffRange } from '../lib/scene-transition-state';

/** Normal-flow cameras for all later handoffs. Envelope mechanics stay independent. */
export function setupSceneTransitions(root:HTMLElement,gsap:typeof import('gsap').gsap) {
  const elements=[...root.querySelectorAll<HTMLElement>('[data-scene-bridge]')];
  if(!elements.length)return ()=>{};
  const originalStyles=new Map<HTMLElement|SVGElement,Map<string,string>>();
  const set=(el:HTMLElement|SVGElement|null,key:string,value:string|number)=>{
    if(!el)return;
    if(!originalStyles.has(el))originalStyles.set(el,new Map());
    const saved=originalStyles.get(el)!;
    if(!saved.has(key))saved.set(key,el.style.getPropertyValue(key));
    el.style.setProperty(key,String(value));
  };
  let disposed=false,frame=0;
  let selected:HTMLElement|undefined;
  const affected=new Set<HTMLElement>();
  const sessions=elements.flatMap(bridge=>{
    const source=root.querySelector<HTMLElement>(`#${bridge.dataset.from}`);
    const target=root.querySelector<HTMLElement>(`#${bridge.dataset.to}`);
    if(!source||!target)return [];
    affected.add(source);affected.add(target);
    const viewport=source.querySelector<HTMLElement>('.envelope-viewport')??source;
    const images=[...bridge.querySelectorAll<HTMLImageElement>('img')];
    const attributes=images.map(img=>({img,loading:img.loading,priority:img.getAttribute('fetchpriority')}));
    const driver={progress:0};
    let prepared=false,ready=false,lastProgress=-1,lastFocused=false;
    let tween:ReturnType<typeof gsap.to>|undefined;
    const range=()=>sceneHandoffRange(target.offsetTop,viewport.offsetHeight);
    const raw=()=>{
      const r=tween?.scrollTrigger??range();
      return (scrollY-r.start)/Math.max(1,r.end-r.start);
    };
    const pose=()=>{const p=raw();return p<=0?0:p>=1?1:driver.progress;};
    const selector=target.id==='celebrations'?'.ns-event':target.id==='venue'?'[data-venue-sign]':target.id==='wishes'?'[data-wish-arrival]':target.id==='closing'?'[data-note-arrival]':'';
    const groups=selector?[...target.querySelectorAll<HTMLElement>(selector)]:[];
    const kind=target.id==='venue'?'sign':target.id==='wishes'?'wish':target.id==='closing'?'note':'card';
    const header=target.querySelector<HTMLElement>('.ns-celebrations-head,.ns-venue-head,.ns-wishes-head,.ns-note-head');
    const post=target.querySelector<HTMLElement>('.ns-signpost');
    const venueCopy=target.querySelector<HTMLElement>('.ns-venue-card');
    const glint=target.querySelector<SVGElement>('.ns-note-glint');
    const render=()=>{
      if(disposed)return;
      const p=pose(),focused=target.contains(document.activeElement);
      if(p===lastProgress&&focused===lastFocused)return;
      lastProgress=p;lastFocused=focused;
      const s=sceneTransitionState(p,target.id==='closing');
      bridge.dataset.progress=p.toFixed(4);
      set(bridge,'--camera-out-scale',s.outgoingScale);set(bridge,'--camera-out-x',`${s.outgoingX}%`);
      set(bridge,'--camera-in-scale',s.incomingScale);set(bridge,'--camera-in-x',`${s.incomingX}%`);
      set(bridge,'--camera-clip',s.clip);set(bridge,'--camera-mask',s.mask);
      set(bridge,'--camera-leaf-opacity',s.branchOpacity);set(bridge,'--camera-leaf-y',`${s.branchY}%`);set(bridge,'--camera-leaf-x',`${s.branchX}%`);
      // Native focus always wins over choreography, including modal openers.
      const contentProgress=focused?1:p;
      groups.forEach((el,i)=>{
        const e=sceneEntryState(contentProgress,i,kind);
        set(el,'transform',`perspective(1200px) translate3d(0,${e.y}px,0) rotateX(${e.tilt}deg) rotate(${e.rotation}deg) scale(${e.scale})`);
        set(el,'opacity',e.opacity);
        const image=el.querySelector<HTMLElement>('.ns-event-art .ns-art');
        if(image)set(image,'transform',`scale(${e.imageScale})`);
      });
      const h=scenePhase(contentProgress,.22,.8);
      set(header,'transform',`translate3d(0,${16*(1-h)}px,0)`);set(header,'opacity',.75+.25*h);
      set(venueCopy,'transform',`translate3d(0,${18*(1-h)}px,0)`);set(venueCopy,'opacity',.65+.35*h);
      set(post,'transform',`scaleY(${.7+.3*scenePhase(contentProgress,.1,.65)})`);
      const g=scenePhase(contentProgress,.2,.9);
      set(glint,'stroke-dashoffset',1-2*g);set(glint,'opacity',g===0||g===1?0:Math.sin(Math.PI*g)*.8);
      updateScope();
    };
    const check=()=>{
      if(disposed)return;
      ready=prepared&&CSS.supports('clip-path','polygon(0 0,100% 0,100% 100%,0 100%)')&&images.every(img=>img.complete&&img.naturalWidth>0);
      render();updateScope();
    };
    const prepare=()=>{
      if(prepared)return;
      prepared=true;bridge.dataset.prepared='';images.forEach(img=>{img.loading='eager';img.fetchPriority='low';});check();
    };
    images.forEach(img=>{img.addEventListener('load',check);img.addEventListener('error',check);});
    return [{bridge,source,target,driver,range:()=>tween?.scrollTrigger??range(),raw,render,prepare,get ready(){return ready;},
      start:()=>{tween=gsap.to(driver,{progress:1,ease:'none',onUpdate:render,scrollTrigger:{start:()=>range().start,end:()=>range().end,scrub:.85,invalidateOnRefresh:true,onUpdate:render,onRefresh:()=>schedule()}});},
      clear:()=>{tween?.kill();images.forEach(img=>{img.removeEventListener('load',check);img.removeEventListener('error',check);});attributes.forEach(({img,loading,priority})=>{img.loading=loading;if(priority===null)img.removeAttribute('fetchpriority');else img.setAttribute('fetchpriority',priority);});delete bridge.dataset.progress;delete bridge.dataset.active;delete bridge.dataset.prepared;},
    }];
  });
  function updateScope() {
    if(disposed)return;
    const active=sessions.find(s=>s.ready&&s.raw()>0&&s.raw()<1);
    if(selected!==active?.bridge){
      affected.forEach(el=>{el.classList.remove('ns-transition-source','ns-transition-target');});
      elements.forEach(el=>delete el.dataset.active);
      selected=active?.bridge;
      if(active){active.source.classList.add('ns-transition-source');active.target.classList.add('ns-transition-target');active.bridge.dataset.active='';}
    }
    root.toggleAttribute('data-scenes-ready',sessions.some(s=>s.ready));
    document.documentElement.toggleAttribute('data-scenes-scroll',sessions.some(s=>s.ready&&s.raw()>=0&&s.raw()<1));
  }
  function update() {
    frame=0;if(disposed)return;
    sessions.forEach(s=>{const {start,end}=s.range();if(scrollY>=start-innerHeight*1.25&&scrollY<=end+innerHeight*.5)s.prepare();s.render();});
    updateScope();
  }
  function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(update);}
  sessions.forEach(s=>s.start());update();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  root.addEventListener('focusin',schedule);root.addEventListener('focusout',schedule);
  return ()=>{
    disposed=true;cancelAnimationFrame(frame);
    window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
    root.removeEventListener('focusin',schedule);root.removeEventListener('focusout',schedule);
    sessions.forEach(s=>s.clear());
    affected.forEach(el=>{el.classList.remove('ns-transition-source','ns-transition-target');});
    originalStyles.forEach((properties,el)=>properties.forEach((value,key)=>{if(value)el.style.setProperty(key,value);else el.style.removeProperty(key);}));
    delete root.dataset.scenesReady;delete document.documentElement.dataset.scenesScroll;
  };
}
