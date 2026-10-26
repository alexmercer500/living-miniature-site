/** A single reversible scroll coordinate. No elapsed-time or random choreography. */
const clamp = (value: number) => Math.max(0,Math.min(1,value));
const phase = (p: number,start: number,end: number) => {
  const x=clamp((p-start)/(end-start));
  return x*x*(3-2*x);
};

/** Height of the feathered band above the reveal edge, as a fraction of the screen.
 *  The incoming layer is (1 + FEATHER) screens tall and carries a static botanical mask. */
export const WIPE_FEATHER=.25;
const WIPE_LAYER=100*(1+WIPE_FEATHER);

export function heroJourneyState(progress: number) {
  const p=clamp(progress);
  const travel=phase(p,0,.84);
  const incoming=phase(p,.12,.84);
  const settle=phase(p,.32,.82);
  const veil=Math.sin(Math.PI*phase(p,.08,.9));
  return {
    progress:p, incoming,
    // Compositor-only reveal: the masked layer rises (wipe, % of its own height) while
    // its camera moves down by the same distance (counter, % of the screen), so the
    // artwork holds still and no mask or clip-path is regenerated or repainted per frame.
    // The feathered edge travels from 113% of the screen to -12%.
    wipe:1e4/WIPE_LAYER-100*incoming, counter:WIPE_LAYER*incoming-100,
    outgoingScale:1+.11*travel, outgoingX:travel?-1.8*travel:0,
    incomingScale:1.1-.1*incoming, incomingX:3*(1-incoming),
    heroCopyY:-32*phase(p,.02,.5), heroCopyOpacity:1-.75*phase(p,.1,.5),
    heroFootOpacity:1-phase(p,.015,.2),
    journeyCopyY:30*(1-settle), journeyCopyOpacity:.65+.35*settle,
    branchOpacity:veil*.75, branchY:24-95*phase(p,.08,.94),
    branchX:-45+33*Math.sin(Math.PI*p),
    pathOffset:1-phase(p,.28,.96),
  };
}

export function journeyMemoryState(progress: number,index: number) {
  const p=phase(clamp(progress),.10+index*.08,.62+index*.08);
  return {y:56*(1-p),rotation:p===1?0:(index%2?6:-6)*(1-p),opacity:.12+.88*p};
}
