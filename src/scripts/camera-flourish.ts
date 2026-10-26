import { flourishState } from '../lib/camera-flourish-state';
import { round } from './style-writer';

type Set = (el:HTMLElement|SVGElement|null|undefined,key:string,value:string|number)=>void;

/** Drives a bridge's CameraFlourish layers; transform/opacity only. */
export function cameraFlourish(bridge:HTMLElement) {
  const rim=bridge.querySelector<HTMLElement>('.ns-flourish-rim');
  const petals=[...bridge.querySelectorAll<HTMLElement>('.ns-flourish-petal')];
  // Camera-height unit, matching the bridge's own lvh height.
  const unit=CSS.supports('height','1lvh')?'lvh':'vh';
  return (progress:number,set:Set)=>{
    const f=flourishState(progress);
    set(rim,'transform',`translate3d(0,${round(f.rim.wipe)}%,0)`);set(rim,'opacity',f.rim.opacity);
    petals.forEach((el,i)=>{
      const p=f.petals[i];
      if(!p)return;
      set(el,'opacity',p.opacity);
      // Hidden petals keep their last pose: no style work while off screen.
      if(p.opacity>0)set(el,'transform',`translate3d(${round(p.x)}vw,${round(p.y*100)}${unit},0) rotate(${round(p.rotate)}deg) scaleX(${round(p.flip)})`);
    });
  };
}
