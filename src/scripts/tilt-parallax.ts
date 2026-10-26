/** Hero depth: phone tilt (or the pointer on desktop) shifts the lantern, the drifting
 *  petals and, faintly the other way, the title. Uses the individual `translate`
 *  property, so scroll choreography and ambient animations keep their transforms. */
const LAYERS:[string,number][]=[['.ns-lantern-touch',16],['.ns-atmosphere',10],['.ns-hero-copy',-4]];
const SMOOTH=.12,RECENTRE=3,RANGE=22;

type OrientationPermission={requestPermission?:()=>Promise<'granted'|'denied'>};

export function setupTiltParallax(hero:HTMLElement) {
  const layers=LAYERS.map(([s,depth])=>({el:hero.querySelector<HTMLElement>(s),depth})).filter(l=>l.el);
  if(!layers.length)return ()=>{};
  let target={x:0,y:0},pose={x:0,y:0},base:{beta:number,gamma:number}|undefined;
  let frame=0,last=0,visible=true,disposed=false;
  const clamp=(v:number)=>Math.max(-1,Math.min(1,v));
  const tick=(time:number)=>{
    frame=0;if(disposed)return;
    const dt=Math.min(.1,last?(time-last)/1000:.016);last=time;
    const k=1-Math.exp(-dt/SMOOTH);
    pose={x:pose.x+(target.x-pose.x)*k,y:pose.y+(target.y-pose.y)*k};
    for(const {el,depth} of layers)el!.style.translate=`${(pose.x*depth).toFixed(2)}px ${(pose.y*depth*.6).toFixed(2)}px`;
    if(Math.abs(target.x-pose.x)+Math.abs(target.y-pose.y)>.002)frame=requestAnimationFrame(tick);else last=0;
  };
  const aim=(x:number,y:number)=>{target={x,y};if(visible&&!frame)frame=requestAnimationFrame(tick);};
  // Tilt is measured from a slowly re-centring baseline: how the phone is held is neutral.
  const orientation=(event:DeviceOrientationEvent)=>{
    if(event.beta===null||event.gamma===null)return;
    const now={beta:event.beta,gamma:event.gamma};
    if(!base)base=now;
    const k=Math.min(1,.016/RECENTRE);
    base={beta:base.beta+(now.beta-base.beta)*k,gamma:base.gamma+(now.gamma-base.gamma)*k};
    aim(clamp((now.gamma-base.gamma)/RANGE),clamp((now.beta-base.beta)/RANGE));
  };
  const pointer=(event:PointerEvent)=>{
    if(event.pointerType!=='mouse')return;
    const r=hero.getBoundingClientRect();
    aim(clamp((event.clientX-r.left)/r.width*2-1),clamp((event.clientY-r.top)/r.height*2-1));
  };
  const leave=()=>aim(0,0);
  addEventListener('deviceorientation',orientation);
  // Where motion access needs permission, ask quietly first (Chrome grants it); iOS only
  // allows asking from a tap, so lighting the lantern becomes that tap.
  const permission=(globalThis.DeviceOrientationEvent as unknown as OrientationPermission|undefined)?.requestPermission;
  const lantern=hero.querySelector<HTMLElement>('[data-nature-lantern]');
  const ask=()=>{permission?.call(DeviceOrientationEvent).catch(()=>{});};
  const askOnTap=()=>{if(!disposed)lantern?.addEventListener('click',ask,{once:true});};
  permission?.call(DeviceOrientationEvent).then(state=>{if(state!=='granted')askOnTap();},askOnTap);
  hero.addEventListener('pointermove',pointer);hero.addEventListener('pointerleave',leave);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}});
  io.observe(hero);
  return ()=>{
    disposed=true;cancelAnimationFrame(frame);io.disconnect();
    removeEventListener('deviceorientation',orientation);lantern?.removeEventListener('click',ask);
    hero.removeEventListener('pointermove',pointer);hero.removeEventListener('pointerleave',leave);
    for(const {el} of layers)el!.style.removeProperty('translate');
  };
}
