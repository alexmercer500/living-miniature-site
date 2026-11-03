/** The jharokha countdowns (Countdown.astro). One clock, ticking on the second and only while a
 *  countdown is on screen; each changed digit turns over (CSS, transform/opacity), the seconds
 *  window's edge fills as the minute runs out, and a bigger unit's window catches a glint. */
export function setupCountdowns(root: HTMLElement, motion: MediaQueryList) {
  const counters = [...root.querySelectorAll<HTMLElement>('[data-nature-countdown]')];
  if (!counters.length) return () => {};
  const target = new Date(counters[0].dataset.natureCountdown!).getTime();

  const digit = (ch: string) => { const i = document.createElement('i'); i.textContent = ch; return i; };
  const turn = (value: HTMLElement, text: string, animate: boolean) => {
    if (value.children.length !== text.length) {
      value.replaceChildren(...[...text].map(ch => { const slot = document.createElement('span'); slot.className = 'ns-count-digit'; slot.append(digit(ch)); return slot; }));
      return;
    }
    [...text].forEach((ch, i) => {
      const slot = value.children[i] as HTMLElement;
      const current = slot.lastElementChild as HTMLElement | null;
      if (current?.textContent === ch) return;
      const next = digit(ch);
      if (!animate || !current) { slot.replaceChildren(next); return; }
      // The old digit tips away upwards as the new one swings down into the window.
      slot.querySelectorAll('[data-out]').forEach(old => old.remove());
      current.dataset.out = ''; next.dataset.in = '';
      slot.append(next);
      setTimeout(() => current.remove(), 700);
    });
  };
  const glint = (cell: HTMLElement) => cell.querySelector('.ns-count-glint > i')?.animate(
    [{ transform: 'translate3d(-140%,0,0) skewX(-16deg)', opacity: 0 }, { opacity: 1, offset: .45 }, { transform: 'translate3d(140%,0,0) skewX(-16deg)', opacity: 0 }],
    { duration: 1300, easing: 'cubic-bezier(.45,0,.3,1)' },
  );

  const render = (counter: HTMLElement, animate: boolean) => {
    const ms = Math.max(0, target - Date.now());
    const parts = { days: Math.floor(ms / 864e5), hours: Math.floor(ms / 36e5) % 24, minutes: Math.floor(ms / 6e4) % 60, seconds: Math.floor(ms / 1e3) % 60 };
    for (const [unit, n] of Object.entries(parts)) {
      const cell = counter.querySelector<HTMLElement>(`[data-count='${unit}']`);
      if (!cell) continue;
      const text = String(n).padStart(2, '0');
      if (unit === 'seconds') cell.style.setProperty('--s', String(n));
      if (cell.dataset.value === text) continue;
      const rolled = cell.dataset.value !== undefined;
      cell.dataset.value = text;
      turn(cell.querySelector<HTMLElement>('[data-count-value]')!, text, animate);
      const label = cell.querySelector<HTMLElement>('[data-count-text]')!;
      label.textContent = `${n} ${label.dataset.label}`;
      if (animate && rolled && unit !== 'seconds') glint(cell);
    }
  };

  const visible = new Set<HTMLElement>();
  let timer = 0;
  const tick = () => {
    visible.forEach(counter => render(counter, !motion.matches));
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5); // on the second, not drifting off it
  };
  const update = () => {
    clearTimeout(timer); timer = 0;
    if (visible.size && !document.hidden) tick();
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const counter = e.target as HTMLElement;
      if (e.isIntersecting) { visible.add(counter); render(counter, false); } else visible.delete(counter);
    });
    update();
  });
  counters.forEach(counter => { render(counter, false); io.observe(counter); });
  document.addEventListener('visibilitychange', update);
  return () => { clearTimeout(timer); io.disconnect(); document.removeEventListener('visibilitychange', update); };
}
