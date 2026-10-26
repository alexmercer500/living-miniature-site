type GsapType = typeof import('gsap').gsap;

/** The cameras' original glide: ScrollTrigger `scrub: .85` (expo-out over .85s) expressed
 *  as exponential smoothing. One coordinate is shared by every camera, so neighbouring
 *  handoffs always agree and none can snap to its end pose while another is mid-flight. */
export const GLIDE_SECONDS=.85;
const TAU=GLIDE_SECONDS/(10*Math.LN2);

export type Glide = ReturnType<typeof scrollGlide>;

export function scrollGlide(gsap:GsapType) {
  let y=scrollY,scroll=y,running=false,disposed=false;
  const listeners=new Set<()=>void>();
  const notify=()=>listeners.forEach(fn=>fn());
  // Runs first in GSAP's frame (before tweens write styles), so reading scrollY is free.
  const tick=(_time:number,deltaMs:number)=>{
    scroll=scrollY;
    const gap=scroll-y;
    // Hash links/scripted jumps of more than a screen and a half land immediately.
    if(Math.abs(gap)<.5||Math.abs(gap)>innerHeight*1.5){y=scroll;stop();}
    else y+=gap*(1-Math.exp(-Math.min(deltaMs,100)/1000/TAU));
    notify();
  };
  const stop=()=>{if(running){running=false;gsap.ticker.remove(tick);}};
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
