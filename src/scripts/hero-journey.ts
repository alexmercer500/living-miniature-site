import { heroJourneyState,journeyMemoryState } from '../lib/hero-journey-state';
import { styleWriter,decodedImages,round } from './style-writer';
import { type Glide,glideProgress } from './scroll-glide';
import { cameraFlourish } from './camera-flourish';

type ScrollTriggerType = typeof import('gsap/ScrollTrigger').ScrollTrigger;

/** One short, unpinned camera handoff. Existing 100svh sections remain in flow.
 *  The pose follows the shared glide coordinate and each frame only changes
 *  transform/opacity (no mask, clip-path or page-wide variable is rewritten). */
export function setupHeroJourney(root: HTMLElement,ScrollTrigger: ScrollTriggerType,glide: Glide) {
  const hero=root.querySelector<HTMLElement>('#welcome');
  const journey=root.querySelector<HTMLElement>('#journey');
  const bridge=root.querySelector<HTMLElement>('[data-journey-bridge]');
  if(!hero||!journey||!bridge) return ()=>{};
  const images=[...bridge.querySelectorAll<HTMLImageElement>('img')];
  const imageAttributes=images.map(img=>({img,loading:img.loading,priority:img.getAttribute('fetchpriority')}));
  // Only no-preference clients request this decorative camera ahead of time. These are the
  // images that gate the handoff, so they are pulled above ordinary below-the-fold art; the
  // identical approved URLs still share the browser cache with the original artwork.
  images.forEach(img=>{img.loading='eager';img.fetchPriority='high';});
  const hangers=[...journey.querySelectorAll<HTMLElement>('[data-memory-hanger]')];
  const path=journey.querySelector<SVGPathElement>('.ns-path path');
  // Variables live on the few elements that read them: writing them on <main> would
  // restyle the whole page every frame.
  const heroCopy=hero.querySelector<HTMLElement>('.ns-hero-copy');
  const heroFoot=hero.querySelector<HTMLElement>('.ns-hero-foot');
  const storyCopy=journey.querySelector<HTMLElement>('.ns-story-copy');
  // Camera layers get plain transform/opacity: custom properties on the bridge would be
  // inherited by (and restyle) every node of both foliage <use> clones each frame.
  const layer=(s:string)=>bridge.querySelector<HTMLElement>(s);
  const outgoing=layer('.ns-bridge-outgoing'),incoming=layer('.ns-bridge-incoming'),camera=layer('.ns-bridge-incoming-camera');
  const glow=layer('.ns-bridge-shade'),boughLeft=layer('.ns-bridge-bough.left'),boughRight=layer('.ns-bridge-bough.right');
  const flourish=cameraFlourish(bridge);
  const {set,restore}=styleWriter();
  let ready=false,disposed=false;
  let trigger:ReturnType<typeof ScrollTrigger.create>|undefined;
  const render=()=>{
    if(disposed||!trigger)return;
    const p=glideProgress(glide,trigger);
    const s=heroJourneyState(p);
    root.toggleAttribute('data-journey-transition',ready&&p>0&&p<1);
    document.documentElement.toggleAttribute('data-journey-scroll',glideProgress(glide,trigger,glide.scroll)<1);
    bridge.dataset.progress=s.progress.toFixed(4);
    set(outgoing,'transform',`translate3d(${round(s.outgoingX)}%,0,0) scale(${round(s.outgoingScale)})`);
    set(incoming,'transform',`translate3d(0,${round(s.wipe)}%,0)`);
    set(camera,'transform',`translate3d(${round(s.incomingX)}%,${round(s.counter)}%,0) scale(${round(s.incomingScale)})`);
    set(glow,'opacity',s.branchOpacity);
    set(boughLeft,'transform',`translate3d(${round(s.branchX)}%,${round(s.branchY)}%,0) rotate(-12deg)`);
    set(boughRight,'transform',`translate3d(${round(-s.branchX)}%,${round(s.branchY)}%,0) rotate(12deg)`);
    set(boughLeft,'opacity',s.branchOpacity*.4);set(boughRight,'opacity',s.branchOpacity*.4);
    flourish(p,set);
    set(heroCopy,'--bridge-hero-y',`${round(s.heroCopyY)}px`);set(heroCopy,'--bridge-hero-opacity',s.heroCopyOpacity);
    set(heroFoot,'--bridge-foot-opacity',s.heroFootOpacity);
    set(storyCopy,'--bridge-story-y',`${round(s.journeyCopyY)}px`);set(storyCopy,'--bridge-story-opacity',s.journeyCopyOpacity);
    hangers.forEach((el,i)=>{const m=journeyMemoryState(p,i);set(el,'transform',`translate3d(0,${round(m.y)}px,0) rotate(${round(m.rotation)}deg)`);set(el,'opacity',m.opacity);});
    set(path,'stroke-dashoffset',s.pathOffset);
  };
  // ScrollTrigger only measures the range (and re-measures on resize); the glide drives it.
  trigger=ScrollTrigger.create({trigger:hero,start:'top top',endTrigger:journey,end:'top top',invalidateOnRefresh:true,onRefresh:()=>render()});
  const unsubscribe=glide.subscribe(render);
  const art=decodedImages(images,()=>checkImages());
  const checkImages=()=>{
    if(disposed)return;
    // A loading/failed decorative image must never replace a usable original.
    art.check();ready=art.ready;
    root.toggleAttribute('data-journey-ready',ready);
    render();
  };
  images.forEach(img=>{img.addEventListener('load',checkImages);img.addEventListener('error',checkImages);});
  checkImages();
  return ()=>{
    disposed=true;trigger?.kill();unsubscribe();
    images.forEach(img=>{img.removeEventListener('load',checkImages);img.removeEventListener('error',checkImages);});
    imageAttributes.forEach(({img,loading,priority})=>{img.loading=loading;if(priority===null)img.removeAttribute('fetchpriority');else img.setAttribute('fetchpriority',priority);});
    delete root.dataset.journeyReady;delete root.dataset.journeyTransition;delete document.documentElement.dataset.journeyScroll;
    delete bridge.dataset.progress;
    restore();
  };
}
