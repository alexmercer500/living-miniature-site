/** Small, bounded tag flutter. Blessings are decorative, never guest submissions. */
export function setupWishes(root: HTMLElement, motion: MediaQueryList) {
  const section = root.querySelector<HTMLElement>('.ns-wishes');
  if (!section) return () => {};
  const cleanups: (() => void)[] = [];
  const hint = section.querySelector<HTMLElement>('[data-wish-hint]');
  if (hint) hint.hidden = false;
  section.querySelectorAll<HTMLButtonElement>('[data-wish-tag]').forEach((tag,i) => {
    const gesture = tag.closest<HTMLElement>('.ns-wish-gesture');
    if (!gesture) return;
    tag.disabled = false;
    let animation: Animation | undefined;
    let timer = 0;
    const warm = () => {
      clearTimeout(timer);
      tag.dataset.warmed = '';
      timer = window.setTimeout(() => delete tag.dataset.warmed,1800);
      if (motion.matches) return;
      const current = getComputedStyle(gesture).transform;
      animation?.cancel();
      const direction = i%2 ? -1 : 1;
      animation = gesture.animate([
        {transform:current},
        {transform:`rotate(${direction*5}deg)`,offset:.18},
        {transform:`rotate(${direction*-3}deg)`,offset:.43},
        {transform:`rotate(${direction*1.3}deg)`,offset:.7},
        {transform:'rotate(0deg)'},
      ],{duration:1800,easing:'ease-in-out'});
    };
    const stop = () => { animation?.cancel(); };
    const changed = () => { if (motion.matches) stop(); };
    tag.addEventListener('click',warm);
    motion.addEventListener('change',changed);
    cleanups.push(() => { stop(); clearTimeout(timer); delete tag.dataset.warmed; tag.disabled=true; tag.removeEventListener('click',warm); motion.removeEventListener('change',changed); });
  });
  return () => { cleanups.forEach(clean=>clean()); if(hint) hint.hidden=true; };
}
