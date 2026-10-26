import { sceneTransitionState,sceneEntryState,scenePhase,sceneHandoffRange } from '../lib/scene-transition-state';
import { styleWriter,decodedImages,round } from './style-writer';
import { type Glide,glideProgress } from './scroll-glide';

type ScrollTriggerType = typeof import('gsap/ScrollTrigger').ScrollTrigger;

/** Normal-flow cameras for all later handoffs. Envelope mechanics stay independent.
 *  Every pair reads the same glide coordinate, so at most one camera is mid-flight
 *  and its end pose always equals the original section it hands over to. */
export function setupSceneTransitions(root:HTMLElement,ScrollTrigger:ScrollTriggerType,glide:Glide) {
  const elements=[...root.querySelectorAll<HTMLElement>('[data-scene-bridge]')];
  if(!elements.length)return ()=>{};
  const {set,restore}=styleWriter();
  let disposed=false;
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
    let prepared=false,ready=false,lastProgress=-1,lastFocused=false;
    const range=()=>sceneHandoffRange(target.offsetTop,viewport.offsetHeight);
    const selector=target.id==='celebrations'?'.ns-event':target.id==='venue'?'[data-venue-sign]':target.id==='wishes'?'[data-wish-arrival]':target.id==='closing'?'[data-note-arrival]':'';
    const groups=(selector?[...target.querySelectorAll<HTMLElement>(selector)]:[]).map(el=>({el,image:el.querySelector<HTMLElement>('.ns-event-art .ns-art')}));
    const kind=target.id==='venue'?'sign':target.id==='wishes'?'wish':target.id==='closing'?'note':'card';
    const header=target.querySelector<HTMLElement>('.ns-celebrations-head,.ns-venue-head,.ns-wishes-head,.ns-note-head');
    const post=target.querySelector<HTMLElement>('.ns-signpost');
    const venueCopy=target.querySelector<HTMLElement>('.ns-venue-card');
    const glint=target.querySelector<SVGElement>('.ns-note-glint');
    const art=decodedImages(images,()=>check());
    // Plain transform/opacity per layer: custom properties on the bridge would be inherited
    // by (and restyle) every node of both foliage <use> clones each frame.
    const layer=(s:string)=>bridge.querySelector<HTMLElement>(s);
    const outgoing=layer('.ns-camera-outgoing'),incoming=layer('.ns-camera-incoming'),arrival=layer('.ns-camera-arrival');
    const glow=layer('.ns-camera-glow'),boughLeft=layer('.ns-camera-bough.left'),boughRight=layer('.ns-camera-bough.right');
    let camera:ReturnType<typeof ScrollTrigger.create>|undefined;
    const raw=()=>camera?(glide.scroll-camera.start)/Math.max(1,camera.end-camera.start):-1;
    const pose=()=>camera?glideProgress(glide,camera):0;
    const render=()=>{
      if(disposed)return;
      const p=pose(),focused=target.contains(document.activeElement);
      if(p===lastProgress&&focused===lastFocused)return;
      lastProgress=p;lastFocused=focused;
      const s=sceneTransitionState(p,target.id==='closing');
      bridge.dataset.progress=p.toFixed(4);
      set(outgoing,'transform',`translate3d(${round(s.outgoingX)}%,0,0) scale(${round(s.outgoingScale)})`);
      set(incoming,'transform',`translate3d(0,${round(s.wipe)}%,0)`);
      set(arrival,'transform',`translate3d(${round(s.incomingX)}%,${round(s.counter)}%,0) scale(${round(s.incomingScale)})`);
      set(glow,'opacity',s.branchOpacity);
      set(boughLeft,'transform',`translate3d(${round(s.branchX)}%,${round(s.branchY)}%,0) rotate(-12deg)`);
      set(boughRight,'transform',`translate3d(${round(-s.branchX)}%,${round(s.branchY)}%,0) rotate(12deg)`);
      set(boughLeft,'opacity',s.branchOpacity*.4);set(boughRight,'opacity',s.branchOpacity*.4);
      // Native focus always wins over choreography, including modal openers.
      const contentProgress=focused?1:p;
      groups.forEach(({el,image},i)=>{
        const e=sceneEntryState(contentProgress,i,kind);
        set(el,'transform',`perspective(1200px) translate3d(0,${round(e.y)}px,0) rotateX(${round(e.tilt)}deg) rotate(${round(e.rotation)}deg) scale(${round(e.scale)})`);
        set(el,'opacity',e.opacity);
        set(image,'transform',`scale(${round(e.imageScale)})`);
      });
      const h=scenePhase(contentProgress,.22,.8);
      set(header,'transform',`translate3d(0,${round(16*(1-h))}px,0)`);set(header,'opacity',.75+.25*h);
      set(venueCopy,'transform',`translate3d(0,${round(18*(1-h))}px,0)`);set(venueCopy,'opacity',.65+.35*h);
      set(post,'transform',`scaleY(${round(.7+.3*scenePhase(contentProgress,.1,.65))})`);
      const g=scenePhase(contentProgress,.2,.9);
      set(glint,'stroke-dashoffset',1-2*g);set(glint,'opacity',g===0||g===1?0:Math.sin(Math.PI*g)*.8);
      updateScope();
    };
    const check=()=>{
      if(disposed||!prepared)return;
      art.check();ready=art.ready;
      lastProgress=-1;render();updateScope();
    };
    const prepare=()=>{
      if(prepared)return;
      prepared=true;bridge.dataset.prepared='';images.forEach(img=>{img.loading='eager';img.fetchPriority='low';});check();
    };
    images.forEach(img=>{img.addEventListener('load',check);img.addEventListener('error',check);});
    return [{bridge,source,target,raw,render,
      get ready(){return ready;},get progress(){return pose();},
      start:()=>{
        // ScrollTrigger only measures the range (and re-measures on resize); the glide drives it.
        camera=ScrollTrigger.create({start:()=>range().start,end:()=>range().end,invalidateOnRefresh:true,onRefresh:()=>{lastProgress=-1;render();}});
        // Decode nearby art well before its camera is needed; never all five at once.
        const warm=(self:{isActive:boolean})=>{if(self.isActive)prepare();};
        const nearby=ScrollTrigger.create({start:()=>range().start-innerHeight*1.25,end:()=>range().end+innerHeight*.5,invalidateOnRefresh:true,onToggle:warm,onRefresh:warm});
        warm(nearby);
        return [camera,nearby];
      },
      clear:()=>{images.forEach(img=>{img.removeEventListener('load',check);img.removeEventListener('error',check);});attributes.forEach(({img,loading,priority})=>{img.loading=loading;if(priority===null)img.removeAttribute('fetchpriority');else img.setAttribute('fetchpriority',priority);});delete bridge.dataset.progress;delete bridge.dataset.active;delete bridge.dataset.prepared;},
    }];
  });
  function updateScope() {
    if(disposed)return;
    const active=sessions.find(s=>s.ready&&s.progress>0&&s.progress<1);
    if(selected!==active?.bridge){
      affected.forEach(el=>{el.classList.remove('ns-transition-source','ns-transition-target');});
      elements.forEach(el=>delete el.dataset.active);
      selected=active?.bridge;
      if(active){active.source.classList.add('ns-transition-source');active.target.classList.add('ns-transition-target');active.bridge.dataset.active='';}
    }
    root.toggleAttribute('data-scenes-ready',sessions.some(s=>s.ready));
    // Snap ownership depends only on position, never on image readiness, so a late
    // image can never switch native snapping on mid-gesture.
    document.documentElement.toggleAttribute('data-scenes-scroll',sessions.some(s=>{const r=s.raw();return r>=0&&r<1;}));
  }
  const rerender=()=>{if(disposed)return;sessions.forEach(s=>s.render());updateScope();};
  const triggers=sessions.flatMap(s=>s.start());
  const unsubscribe=glide.subscribe(rerender);
  rerender();updateScope();
  root.addEventListener('focusin',rerender);root.addEventListener('focusout',rerender);
  return ()=>{
    disposed=true;
    triggers.forEach(t=>t.kill());unsubscribe();
    root.removeEventListener('focusin',rerender);root.removeEventListener('focusout',rerender);
    sessions.forEach(s=>s.clear());
    affected.forEach(el=>{el.classList.remove('ns-transition-source','ns-transition-target');});
    restore();
    delete root.dataset.scenesReady;delete document.documentElement.dataset.scenesScroll;
  };
}
