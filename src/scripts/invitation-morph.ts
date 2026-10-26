/** Cross-document view transition into the full invitation (opted in by nature.css).
 *  The card a guest is looking at, the opened envelope card or the Final Note, morphs
 *  into the invitation page's card and its names glide into the title. Any other route
 *  there (dock, menu) keeps the default cross-fade. Browsers without support navigate
 *  normally. */
const CARD='ns-invitation',NAMES='ns-invitation-names';

const onScreen=(el:Element)=>{
  const r=el.getBoundingClientRect(),visible=Math.min(r.bottom,innerHeight)-Math.max(r.top,0);
  return r.height>0&&visible>r.height*.5&&Number(getComputedStyle(el).opacity)>.5;
};

export function setupInvitationMorph(root:HTMLElement) {
  if(!('onpageswap' in window))return ()=>{};
  const sources=[
    {card:root.querySelector<HTMLElement>('[data-envelope-card]'),names:root.querySelector<HTMLElement>('#invitation-card-title')},
    {card:root.querySelector<HTMLElement>('.ns-note-card'),names:root.querySelector<HTMLElement>('#ns-note-names')},
  ];
  let target='';
  // Older engines lack NavigationActivation; remember the link that started the navigation.
  const click=(event:MouseEvent)=>{target=(event.target as Element|null)?.closest('a')?.href??'';};
  const swap=(event:Event)=>{
    const {viewTransition,activation}=event as Event&{viewTransition?:ViewTransition,activation?:{entry?:{url?:string}}};
    if(!viewTransition)return;
    const url=new URL(activation?.entry?.url||target||location.href,location.href);
    if(!/\/invitation\/?$/.test(url.pathname))return;
    const source=sources.find(s=>s.card&&!s.card.inert&&onScreen(s.card));
    if(!source?.card)return;
    source.card.style.viewTransitionName=CARD;
    if(source.names)source.names.style.viewTransitionName=NAMES;
    // A restored (back/forward cached) page must not keep the names.
    const clear=()=>{source.card!.style.removeProperty('view-transition-name');source.names?.style.removeProperty('view-transition-name');};
    viewTransition.finished.then(clear,clear);
    addEventListener('pageshow',clear,{once:true});
  };
  document.addEventListener('click',click,true);
  addEventListener('pageswap',swap);
  return ()=>{document.removeEventListener('click',click,true);removeEventListener('pageswap',swap);};
}
