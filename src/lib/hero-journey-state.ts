/** A single reversible scroll coordinate. No elapsed-time or random choreography. */
const clamp = (value: number) => Math.max(0,Math.min(1,value));
const phase = (p: number,start: number,end: number) => {
  const x=clamp((p-start)/(end-start));
  return x*x*(3-2*x);
};

export function heroJourneyState(progress: number) {
  const p=clamp(progress);
  const travel=phase(p,0,.84);
  const incoming=phase(p,.12,.84);
  const settle=phase(p,.32,.82);
  const base=112-124*incoming;
  const edge=Array.from({length:41},(_,i)=>{
    const x=i/40;
    const y=base+Math.sin(x*Math.PI*3.2+p*.65)*3.8+Math.sin(x*Math.PI*9.5)*1.2;
    return `${(x*100).toFixed(2)}% ${y.toFixed(2)}%`;
  });
  const clip=incoming===0?'inset(100% 0 0 0)':incoming===1?'inset(0)':`polygon(${edge.join(',')},100% 100%,0% 100%)`;
  // Feathered overlapping lobes keep the handoff botanical, not a hard divider.
  const mask=incoming===0?'linear-gradient(transparent,transparent)':incoming===1?'linear-gradient(#000,#000)':[
    `linear-gradient(to bottom,transparent ${(base-5).toFixed(2)}%,#000 ${(base+8).toFixed(2)}%)`,
    `radial-gradient(ellipse 45% 11% at 23% ${base.toFixed(2)}%,#000 8%,transparent 88%)`,
    `radial-gradient(ellipse 48% 13% at 76% ${(base+2).toFixed(2)}%,#000 8%,transparent 90%)`,
  ].join(',');
  const veil=Math.sin(Math.PI*phase(p,.08,.9));
  return {
    progress:p, incoming, clip,mask,
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
