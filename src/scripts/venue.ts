/** Progressive enhancement: the original link remains a printable-details fallback. */
export function setupVenue(root: HTMLElement, motion: MediaQueryList) {
  const opener = root.querySelector<HTMLAnchorElement>('[data-venue-explore]');
  const dialog = root.querySelector<HTMLDialogElement>('.ns-venue-dialog');
  const frame = dialog?.querySelector<HTMLElement>('.ns-venue-preview');
  if (!opener || !dialog || !frame || typeof dialog.showModal !== 'function') return () => {};
  opener.setAttribute('aria-haspopup','dialog');
  opener.setAttribute('aria-controls',dialog.id);
  let animation: Animation | undefined;
  let closing = false;
  let backdropFrame = 0;
  const unlock = () => {
    animation?.cancel();
    closing = false;
    delete dialog.dataset.visible;
    delete dialog.dataset.closing;
    delete document.documentElement.dataset.venueOpen;
    opener.focus({preventScroll:true});
  };
  const open = (event: MouseEvent) => {
    // Retain open-in-new-tab and other ordinary link gestures.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (dialog.open) return;
    document.documentElement.dataset.venueOpen = '';
    dialog.showModal();
    frame.scrollTop = 0;
    getComputedStyle(dialog,'::backdrop').opacity;
    if (motion.matches) dialog.dataset.visible = '';
    else {
      backdropFrame = requestAnimationFrame(() => { if (dialog.open && !closing) dialog.dataset.visible = ''; });
      animation = frame.animate([
        {opacity:0,transform:'translateY(40px) scale(.94) rotate(-.7deg)'},
        {opacity:1,transform:'translateY(-3px) scale(1.006) rotate(.1deg)',offset:.8},
        {opacity:1,transform:'none'},
      ],{duration:900,easing:'cubic-bezier(.18,.72,.2,1)'});
    }
  };
  const close = () => {
    if (!dialog.open || closing) return;
    closing = true;
    cancelAnimationFrame(backdropFrame);
    const style = getComputedStyle(frame);
    const start = {opacity:style.opacity,transform:style.transform};
    animation?.cancel();
    if (motion.matches) { dialog.close(); return; }
    dialog.dataset.closing = '';
    animation = frame.animate([start,{opacity:0,transform:'translateY(18px) scale(.97)'}],{duration:320,easing:'ease-in',fill:'forwards'});
    animation.finished.then(() => dialog.close()).catch(() => { if (dialog.open) dialog.close(); });
  };
  const cancel = (event: Event) => { event.preventDefault(); close(); };
  const outside = (event: MouseEvent) => {
    const r=frame.getBoundingClientRect();
    if(event.target===dialog && (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) close();
  };
  opener.addEventListener('click',open);
  dialog.addEventListener('cancel',cancel);
  dialog.addEventListener('submit',cancel);
  dialog.addEventListener('click',outside);
  dialog.addEventListener('close',unlock);
  return () => {
    cancelAnimationFrame(backdropFrame);
    animation?.cancel();
    if(dialog.open) dialog.close();
    opener.removeEventListener('click',open);
    dialog.removeEventListener('cancel',cancel);
    dialog.removeEventListener('submit',cancel);
    dialog.removeEventListener('click',outside);
    dialog.removeEventListener('close',unlock);
    delete document.documentElement.dataset.venueOpen;
  };
}
