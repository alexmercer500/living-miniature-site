/** Native dialogs provide focus trapping/inert background; motion is progressive. */
export function setupKeepsakes(root: HTMLElement, motion: MediaQueryList) {
  if (typeof HTMLDialogElement === 'undefined' || !HTMLDialogElement.prototype.showModal) return () => {};
  const cleanups: (() => void)[] = [];
  for (const opener of root.querySelectorAll<HTMLButtonElement>('[data-keepsake]')) {
    const dialog = document.getElementById(opener.getAttribute('aria-controls') ?? '') as HTMLDialogElement | null;
    const frame = dialog?.querySelector<HTMLElement>('.ns-memory-frame');
    if (!dialog || !frame) continue;
    opener.disabled = false;
    let animation: Animation | undefined;
    let closing = false;
    let backdropFrame = 0;
    const pose = (from = opener.getBoundingClientRect()) => {
      // Measure the untransformed destination; the opener may still be hovering
      // or swaying. Opening uses a snapshot taken before focus/scroll-lock changes.
      const to=dialog.getBoundingClientRect();
      return `translate(${from.x+from.width/2-to.x-to.width/2}px,${from.y+from.height/2-to.y-to.height/2}px) scale(${Math.min(.92,from.width/to.width)}) rotate(${opener.dataset.memoryTilt ?? 0}deg)`;
    };
    const unlock = () => {
      delete dialog.dataset.closing;
      delete dialog.dataset.visible;
      delete document.documentElement.dataset.memoryOpen;
      delete opener.dataset.selected;
      delete opener.dataset.modalSource;
      closing = false;
      opener.focus({preventScroll:true});
    };
    const open = () => {
      if (root.querySelector('.ns-memory-dialog[open]')) return;
      const source = opener.getBoundingClientRect();
      document.documentElement.dataset.memoryOpen = '';
      opener.dataset.selected = '';
      opener.dataset.modalSource = '';
      dialog.showModal();
      frame.scrollTop = 0;
      // Prime the backdrop's initial style before changing its transition state.
      getComputedStyle(dialog, '::backdrop').opacity;
      if (motion.matches) dialog.dataset.visible = '';
      else backdropFrame = requestAnimationFrame(() => { if (dialog.open && !closing) dialog.dataset.visible = ''; });
      if (!motion.matches) {
        animation = frame.animate([
          {transform:pose(source),opacity:.98},
          {transform:'translateY(-3px) scale(1.015) rotate(.2deg)',opacity:1,offset:.8},
          {transform:'none',opacity:1},
        ],{duration:760,easing:'cubic-bezier(.18,.72,.2,1)'});
      }
    };
    const close = () => {
      if (closing || !dialog.open) return;
      closing = true;
      cancelAnimationFrame(backdropFrame);
      const current = getComputedStyle(frame);
      const start = { transform: current.transform, opacity: current.opacity };
      animation?.cancel();
      if (motion.matches) { dialog.close(); return; }
      dialog.dataset.closing = '';
      animation = frame.animate([start,{transform:pose(),opacity:0}],{duration:400,easing:'cubic-bezier(.4,0,.8,.3)',fill:'forwards'});
      animation.finished.then(() => { dialog.close(); animation?.cancel(); }).catch(() => { if (dialog.open) dialog.close(); });
    };
    const cancel = (event: Event) => { event.preventDefault(); close(); };
    const outside = (event: MouseEvent) => {
      const r=frame.getBoundingClientRect();
      if (event.target===dialog && (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)) close();
    };
    opener.addEventListener('click',open);
    dialog.addEventListener('cancel',cancel);
    dialog.addEventListener('submit',cancel);
    dialog.addEventListener('click',outside);
    dialog.addEventListener('close',unlock);
    cleanups.push(() => {
      animation?.cancel();
      cancelAnimationFrame(backdropFrame);
      if (dialog.open) dialog.close();
      opener.removeEventListener('click',open);
      dialog.removeEventListener('cancel',cancel);
      dialog.removeEventListener('submit',cancel);
      dialog.removeEventListener('click',outside);
      dialog.removeEventListener('close',unlock);
      delete document.documentElement.dataset.memoryOpen;
      delete opener.dataset.modalSource;
    });
  }
  return () => cleanups.forEach(clean => clean());
}
