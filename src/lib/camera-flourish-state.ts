import { heroJourneyState } from './hero-journey-state.ts';
import { scenePhase } from './scene-transition-state.ts';

// [lane (% of width), start below/above the edge (screens), extra lift, sway (% width), sway cycles, spin turns, phase]
const PETALS:[number,number,number,number,number,number,number][]=[
  [7,-.05,.16,4,1.1,1.2,0],[18,.03,.24,5,.8,-.9,1.7],[29,-.01,.20,3,1.3,1.4,3.1],[41,.06,.30,6,.9,-1.1,4.4],
  [52,-.04,.18,4,1.2,.8,.9],[63,.04,.27,5,.7,-1.3,2.6],[74,0,.22,3,1.0,1.1,5.2],[86,.07,.33,6,1.4,-.7,.4],
  [94,-.04,.17,3,.9,1.0,3.8],[35,.09,.38,4,1.1,-.9,2.2],[57,.08,.35,5,.8,.6,5.9],[80,.02,.25,4,1.2,-1.2,1.3],
];
export const PETAL_COUNT=PETALS.length;

/** Decorative extras that ride every camera handoff. All are invisible at both
 *  endpoints, so a camera still hands over to its original section pixel-for-pixel. */
export function flourishState(progress:number) {
  const s=heroJourneyState(progress);
  const glow=Math.sin(Math.PI*s.incoming);
  // Screen position (fraction of the camera height) of the reveal's half-opacity edge.
  const edge=1.13-1.25*s.incoming;
  // Petals ride up with the edge, lifted a little faster than it, so they cross it and
  // leave through the top; every value is a pure function of progress (reversible).
  const petals=PETALS.map(([lane,start,lift,sway,cycles,spin,phase])=>{
    const y=edge-start-lift*s.incoming;
    const turn=phase+Math.PI*2*cycles*s.incoming;
    return {
      x:lane+sway*Math.sin(turn),y,
      rotate:(phase*57+spin*360*s.incoming)%360,flip:Math.cos(turn*1.3),
      opacity:y<-.08||y>1.08?0:Math.min(1,glow*1.7),
    };
  });
  // A warm band of light glides across the new scene while it settles.
  const settle=scenePhase(s.progress,.5,.97);
  return {
    sweep:{x:-75+150*settle,opacity:Math.sin(Math.PI*settle)*.9},
    petals,
    // The rim rides the wipe layer itself; it traces the edge's half-opacity contour.
    rim:{wipe:s.wipe,opacity:s.incoming===0||s.incoming===1?0:glow**.5*.95},
  };
}
