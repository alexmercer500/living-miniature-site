import { flourishState } from '../lib/camera-flourish-state';
import { round } from './style-writer';

type Set = (el:HTMLElement|SVGElement|null|undefined,key:string,value:string|number)=>void;

/** Drives a bridge's CameraFlourish layers; transform/opacity only. */
export function cameraFlourish(bridge:HTMLElement) {
  const rim=bridge.querySelector<HTMLElement>('.ns-flourish-rim');
  return (progress:number,set:Set)=>{
    const f=flourishState(progress);
    set(rim,'transform',`translate3d(0,${round(f.rim.wipe)}%,0)`);set(rim,'opacity',f.rim.opacity);
  };
}
