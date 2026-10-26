type GsapType = typeof import('gsap').gsap;

/** How long the smoothed coordinate takes to catch the real scroll. This is the whole "weight"
 *  of every camera move: raise it for a slower, softer glide. It is plain exponential smoothing,
 *  so the pose is always continuous — nothing is ever clamped or cut mid-scroll. */
export const GLIDE_SECONDS=.7;
const TAU=GLIDE_SECONDS/(10*Math.LN2);

export type Glide = ReturnType<typeof scrollGlide>;

export function scrollGlide(gsap:GsapType) {
  let y=scrollY,scroll=y,running=false,resting=true,disposed=false;
  const listeners=new Set<()=>void>();
  const notify=()=>listeners.forEach(fn=>fn());
  // Runs first in GSAP's frame (before tweens write styles), so reading scrollY is free.
  const tick=(_time:number,deltaMs:number)=>{
    scroll=scrollY;
    const gap=scroll-y;
    const fromRest=resting;resting=false;
    // A hash link or a scripted jump lands at once — but only when it arrives while the glide is
    // at rest. A fast flick opens a wide gap too, and that one has to glide: cutting it is exactly
    // the "snap" the eye reads as a broken animation. Mid-flight only an absurd gap lands at once.
    if(Math.abs(gap)<.5||Math.abs(gap)>innerHeight*(fromRest?1.5:4)){y=scroll;stop();}
    else y+=gap*(1-Math.exp(-Math.min(deltaMs,100)/1000/TAU));
    notify();
  };
  const stop=()=>{if(running){running=false;resting=true;gsap.ticker.remove(tick);}};
  const wake=()=>{if(!disposed&&!running){running=true;gsap.ticker.add(tick,false,true);}};
  window.addEventListener('scroll',wake,{passive:true});
  return {
    /** Smoothed position that drives every camera pose. */
    get y(){return y;},
    /** Last real scroll position, for decisions that must follow the page (snap ownership). */
    get scroll(){return scroll;},
    subscribe(fn:()=>void){listeners.add(fn);return ()=>{listeners.delete(fn);};},
    /** Re-read after layout changes without animating through them. */
    sync(){y=scroll=scrollY;notify();},
    dispose(){disposed=true;stop();window.removeEventListener('scroll',wake);listeners.clear();},
  };
}

export const glideProgress=(glide:Glide,trigger:{start:number,end:number},position=glide.y)=>
  Math.max(0,Math.min(1,(position-trigger.start)/Math.max(1,trigger.end-trigger.start)));
