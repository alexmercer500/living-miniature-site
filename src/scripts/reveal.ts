/** First-pass scroll reveals (styles: "First-pass reveals" in nature.css). Each chapter's
 *  heading, cards and keepsakes rise in once, the first time they come on screen, then are left
 *  alone. A row of cards reveals together when the row arrives (so a sideways phone row is
 *  settled before it is swiped), each a beat after the one before. Content already on screen
 *  when the page starts is never hidden, and nothing is marked with reduced motion. */
const GROUPS: [container: string, items: string][] = [
  ['.ns-story-copy,.ns-section-head,.ns-venue-head,.ns-wishes-head,.ns-note-head', ':scope > :not(div),:scope > div > *'],
  ['.ns-keepsakes', '[data-memory-hanger]'],
  ['.ns-events', '.ns-event'],
  ['.ns-venue-locations', '.ns-location-card'],
  ['.ns-wish-garland', '[data-wish-arrival]'],
  ['.ns-note-actions', ':scope > *'],
  ['.ns-path,.ns-keepsake-hint,.ns-note-arrival,.ns-wishes-foot', ':scope'],
];
const STEP = .09, GROUP_STEP = .15, MAX_DELAY = .8, SETTLE_MS = 2600;

export function setupReveal(root: HTMLElement, motion: MediaQueryList) {
  if (motion.matches) return () => {};
  const items = new Map<Element, HTMLElement[]>();
  for (const [container, item] of GROUPS) {
    root.querySelectorAll<HTMLElement>(container).forEach(group => {
      // Anything the guest can already see stays as it is.
      if (group.getBoundingClientRect().top < innerHeight) return;
      const members = item === ':scope' ? [group] : [...group.querySelectorAll<HTMLElement>(item)];
      members.forEach(el => el.setAttribute('data-reveal', ''));
      items.set(group, members);
    });
  }
  if (!items.size) return () => {};

  const timers = new Set<number>();
  const reveal = (el: HTMLElement, delay: number) => {
    el.style.setProperty('--reveal-delay', `${delay}s`);
    el.removeAttribute('data-reveal');
    el.setAttribute('data-revealed', '');
    // Once settled, drop the reveal styles so the element's own transitions are its own again.
    const t = window.setTimeout(() => { timers.delete(t); el.removeAttribute('data-revealed'); el.style.removeProperty('--reveal-delay'); }, SETTLE_MS + delay * 1000);
    timers.add(t);
  };
  // Whatever arrives together (a heading and its cards on a quick scroll or a menu jump) staggers in
  // reading order: each group a beat after the one before, its own pieces a beat apart, so the
  // cards never queue behind every line of the heading.
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting)
      .sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
      .forEach(({ target }, group) => {
        io.unobserve(target);
        items.get(target)?.forEach((el, i) => reveal(el, Math.min(group * GROUP_STEP + i * STEP, MAX_DELAY)));
        items.delete(target);
      });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach((_, group) => io.observe(group));
  return () => {
    io.disconnect();
    timers.forEach(clearTimeout);
    root.querySelectorAll('[data-reveal],[data-revealed]').forEach(el => { el.removeAttribute('data-reveal'); el.removeAttribute('data-revealed'); });
  };
}
