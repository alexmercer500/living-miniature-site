/** Inline-style writes for per-frame choreography: unchanged values are skipped
 *  (no style invalidation while idle) and every touched property can be restored. */
export function styleWriter() {
  const original=new Map<HTMLElement|SVGElement,Map<string,string>>();
  const current=new Map<HTMLElement|SVGElement,Map<string,string>>();
  const set=(el:HTMLElement|SVGElement|null|undefined,key:string,value:string|number)=>{
    if(!el)return;
    const text=typeof value==='number'?String(round(value)):value;
    let saved=original.get(el),seen=current.get(el);
    if(!saved){saved=new Map();original.set(el,saved);}
    if(!seen){seen=new Map();current.set(el,seen);}
    if(!saved.has(key))saved.set(key,el.style.getPropertyValue(key));
    if(seen.get(key)===text)return;
    seen.set(key,text);el.style.setProperty(key,text);
  };
  const restore=()=>{
    original.forEach((properties,el)=>properties.forEach((value,key)=>{if(value)el.style.setProperty(key,value);else el.style.removeProperty(key);}));
    original.clear();current.clear();
  };
  return {set,restore};
}

/** Four decimals is below a device pixel at any scale used here. */
export const round=(value:number)=>Math.round(value*1e4)/1e4;

/** Resolves once every image has pixels decoded for its current source, so a camera
 *  layer never becomes visible on an empty frame. Failed images never resolve ready. */
export function decodedImages(images:HTMLImageElement[],changed:()=>void) {
  const decoded=new Map<HTMLImageElement,string>(),decoding=new Map<HTMLImageElement,string>();
  const usable=(img:HTMLImageElement)=>img.complete&&img.naturalWidth>0;
  const check=()=>{
    for(const img of images){
      const src=img.currentSrc||img.src;
      if(!usable(img)||decoded.get(img)===src||decoding.get(img)===src)continue;
      decoding.set(img,src);
      // decode() can reject for an already-usable image (e.g. cache eviction); it still paints.
      img.decode().catch(()=>{}).then(()=>{if(decoding.get(img)!==src)return;decoding.delete(img);decoded.set(img,src);changed();});
    }
  };
  return {
    check,
    get ready(){return images.every(img=>usable(img)&&decoded.get(img)===(img.currentSrc||img.src));},
  };
}
