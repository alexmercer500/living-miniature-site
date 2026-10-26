import { heroJourneyState } from './hero-journey-state.ts';

/** Decorative extras that ride every camera handoff. All are invisible at both
 *  endpoints, so a camera still hands over to its original section pixel-for-pixel. */
export function flourishState(progress:number) {
  const s=heroJourneyState(progress);
  const glow=Math.sin(Math.PI*s.incoming);
  return {
    // The rim rides the wipe layer itself; it traces the edge's half-opacity contour.
    rim:{wipe:s.wipe,opacity:s.incoming===0||s.incoming===1?0:glow**.5*.95},
  };
}
