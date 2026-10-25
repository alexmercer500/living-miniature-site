import { heroJourneyState } from './hero-journey-state.ts';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
export function scenePhase(progress:number,start:number,end:number) {
  const p=clamp((progress-start)/(end-start));
  return p*p*(3-2*p);
}

/** Match the approved first handoff, with a gentler final sunset arrival. */
export function sceneTransitionState(progress:number,closing=false) {
  const state=heroJourneyState(progress);
  return {...state,outgoingScale:1+(state.outgoingScale-1)*(closing ? .65 : 1)};
}

export function sceneEntryState(progress:number,index=0,kind:'card'|'sign'|'wish'|'note'='card') {
  const start=kind==='wish' ? .08+index*.06 : .10+index*.08;
  const end=kind==='wish' ? .48+index*.06 : .62+index*.08;
  const p=scenePhase(progress,start,end);
  const remaining=1-p;
  return {
    y:(kind==='wish'?22:kind==='sign'?32:kind==='note'?36:44)*remaining,
    rotation:(index%2?-1:1)*(kind==='wish'?8:kind==='sign'?4:kind==='note'?-.7:1.4)*remaining,
    scale:1-(kind==='note' ? .045 : kind==='card' ? .04 : 0)*remaining,
    opacity:.12+.88*p,
    imageScale:1+.065*remaining,
    tilt:kind==='note' ? 5*remaining : 0,
  };
}

/** The envelope owns its long track; its camera exit begins only after unpinning. */
export function sceneHandoffRange(targetTop:number,sourceViewportHeight:number) {
  return {start:Math.max(0,targetTop-sourceViewportHeight),end:targetTop};
}
