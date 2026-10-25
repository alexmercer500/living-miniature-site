import { heroJourneyState,journeyMemoryState } from '../lib/hero-journey-state';

/** One short, unpinned camera handoff. Existing 100dvh sections remain in flow. */
export function setupHeroJourney(root: HTMLElement,gsap: typeof import('gsap').gsap) {
  const hero=root.querySelector<HTMLElement>('#welcome');
  const journey=root.querySelector<HTMLElement>('#journey');
  const bridge=root.querySelector<HTMLElement>('[data-journey-bridge]');
  if(!hero||!journey||!bridge) return ()=>{};
  const images=[...bridge.querySelectorAll<HTMLImageElement>('img')];
  const imageAttributes=images.map(img=>({img,loading:img.loading,priority:img.getAttribute('fetchpriority')}));
  // Only no-preference clients request this decorative camera ahead of time.
  // Identical approved URLs share the browser cache with the original artwork.
  images.forEach(img=>{img.loading='eager';img.fetchPriority='low';});
  const hangers=[...journey.querySelectorAll<HTMLElement>('[data-memory-hanger]')];
  const path=journey.querySelector<SVGPathElement>('.ns-path path');
  const originals=hangers.map(el=>({el,transform:el.style.transform,opacity:el.style.opacity}));
  const oldPath=path?.style.strokeDashoffset??'';
  const driver={progress:0};
  const properties=new Set<string>();
  let ready=false,disposed=false;
  const property=(name: string,value: string|number)=>{
    const key=`--bridge-${name}`;properties.add(key);root.style.setProperty(key,String(value));
  };
  const render=()=>{
    const trigger=tween?.scrollTrigger;
    const raw=trigger?(scrollY-trigger.start)/Math.max(1,trigger.end-trigger.start):0;
    // Anchors/fast jumps must land fully readable, never at a stale scrub pose.
    const p=raw<=0?0:raw>=1?1:driver.progress;
    const s=heroJourneyState(p);
    const active=ready&&raw>0&&raw<1;
    root.toggleAttribute('data-journey-transition',active);
    document.documentElement.toggleAttribute('data-journey-scroll',ready&&raw>=0&&raw<1);
    bridge.dataset.progress=s.progress.toFixed(4);
    property('outgoing-scale',s.outgoingScale);property('outgoing-x',`${s.outgoingX}%`);
    property('incoming-scale',s.incomingScale);property('incoming-x',`${s.incomingX}%`);
    property('reveal',s.clip);property('mask',s.mask);property('hero-y',`${s.heroCopyY}px`);property('hero-opacity',s.heroCopyOpacity);
    property('foot-opacity',s.heroFootOpacity);property('story-y',`${s.journeyCopyY}px`);property('story-opacity',s.journeyCopyOpacity);
    property('branch-opacity',s.branchOpacity);property('branch-y',`${s.branchY}%`);property('branch-x',`${s.branchX}%`);
    hangers.forEach((el,i)=>{const m=journeyMemoryState(p,i);el.style.transform=`translate3d(0,${m.y}px,0) rotate(${m.rotation}deg)`;el.style.opacity=String(m.opacity);});
    if(path)path.style.strokeDashoffset=String(s.pathOffset);
  };
  let tween: ReturnType<typeof gsap.to>|undefined;
  tween=gsap.to(driver,{progress:1,ease:'none',onUpdate:render,scrollTrigger:{
    trigger:hero,start:'top top',endTrigger:journey,end:'top top',scrub:.85,invalidateOnRefresh:true,
    onUpdate:render,onRefresh:render,
  }});
  const checkImages=()=>{
    if(disposed)return;
    // A loading/failed decorative image must never replace a usable original.
    ready=CSS.supports('clip-path','polygon(0 0,100% 0,100% 100%,0 100%)')&&images.every(img=>img.complete&&img.naturalWidth>0);
    root.toggleAttribute('data-journey-ready',ready);
    render();
  };
  images.forEach(img=>{img.addEventListener('load',checkImages);img.addEventListener('error',checkImages);});
  checkImages();render();
  return ()=>{
    disposed=true;tween?.kill();
    images.forEach(img=>{img.removeEventListener('load',checkImages);img.removeEventListener('error',checkImages);});
    imageAttributes.forEach(({img,loading,priority})=>{img.loading=loading;if(priority===null)img.removeAttribute('fetchpriority');else img.setAttribute('fetchpriority',priority);});
    delete root.dataset.journeyReady;delete root.dataset.journeyTransition;delete document.documentElement.dataset.journeyScroll;
    delete bridge.dataset.progress;
    properties.forEach(key=>root.style.removeProperty(key));
    originals.forEach(({el,transform,opacity})=>{el.style.transform=transform;el.style.opacity=opacity;});
    if(path)path.style.strokeDashoffset=oldPath;
  };
}
