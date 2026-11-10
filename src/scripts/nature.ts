import { setupKeepsakes } from './keepsakes';
import { setupVenue } from './venue';
import { setupWishes } from './wishes';
import { setupInvitationMorph } from './invitation-morph';
import { setupTiltParallax } from './tilt-parallax';
import { setupCountdowns } from './countdown';
import { setupReveal } from './reveal';
import { setupBlessing } from './blessing';
import { getPlayer, type Player } from './music';
/** Nature & Stories only. Static HTML remains the complete fallback. */
export async function setupNature() {
  const root = document.querySelector<HTMLElement>('[data-nature-root]');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const all = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];
  const cleanups: (() => void)[] = [];
  cleanups.push(setupReveal(root, motion)); // first, so below-the-fold content is marked before it can paint

  const header = document.querySelector<HTMLElement>('[data-nature-header]');
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    e.target.toggleAttribute('data-offscreen', !e.isIntersecting);
    if (e.target.id === 'welcome') {
      header?.toggleAttribute('data-solid', !e.isIntersecting);
      // A guest who scrolls away should never return to half-hidden intro text.
      if (!e.isIntersecting) (e.target as HTMLElement).dataset.introComplete = '';
    }
    if (e.target.classList.contains('envelope-viewport')) document.querySelector('.ns-dock')?.toggleAttribute('data-invitation-active', e.isIntersecting);
  }), { rootMargin: '80px 0px' });
  all('.ns-scene').forEach(scene => observer.observe(scene));
  cleanups.push(() => observer.disconnect());
  const pauseAmbient = () => root.toggleAttribute('data-ambient-paused', document.hidden);
  pauseAmbient();
  document.addEventListener('visibilitychange', pauseAmbient);
  cleanups.push(() => document.removeEventListener('visibilitychange', pauseAmbient));
  all<HTMLButtonElement>('[data-nature-lantern],[data-nature-petals]').forEach(button => { button.disabled = false; });
  cleanups.push(setupKeepsakes(root, motion));
  cleanups.push(setupVenue(root, motion));
  cleanups.push(setupWishes(root, motion));
  cleanups.push(setupInvitationMorph(root));
  cleanups.push(setupCountdowns(root, motion));
  cleanups.push(setupBlessing(root));

  // Decode each chapter's painting while the chapter before it is still on screen, so a handoff
  // never waits on a decode (on slower phones that shows as the new scene hitching in).
  const decoder = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    decoder.unobserve(e.target);
    e.target.querySelectorAll<HTMLImageElement>('.ns-plate [data-nature-image]').forEach(image => image.decode().catch(() => {}));
  }), { rootMargin: '100% 0px' });
  all(':scope > section').forEach(section => decoder.observe(section));
  cleanups.push(() => decoder.disconnect());

  // On a celebration's own day its card says "Today" (local date, so it is right in India).
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  all('[data-event-date]').forEach(card => {
    const badge = card.querySelector<HTMLElement>('[data-event-today]');
    if (badge) badge.hidden = card.dataset.eventDate !== today;
  });

  document.querySelectorAll<HTMLAnchorElement>('[data-nature-locale]').forEach(link => {
    link.addEventListener('click', () => {
      const current = all('section[id]').find(section => {
        const r = section.getBoundingClientRect();
        return r.top <= innerHeight / 2 && r.bottom >= innerHeight / 2;
      });
      if (current) link.hash = current.id;
    });
  });

  const lantern = q<HTMLButtonElement>('[data-nature-lantern]');
  lantern?.addEventListener('click', () => lantern.setAttribute('aria-pressed', String(lantern.getAttribute('aria-pressed') !== 'true')));
  q('[data-nature-petals]')?.addEventListener('click', event => {
    if (motion.matches) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const layer = document.createElement('div'); layer.className = 'ns-burst'; layer.setAttribute('aria-hidden', 'true'); document.body.append(layer);
    for (let i = 0; i < 12; i++) {
      const petal = document.createElement('i'); petal.style.left = `${rect.x + rect.width / 2}px`; petal.style.top = `${rect.y + rect.height / 2}px`; layer.append(petal);
      const x = (Math.random() - .5) * 220, y = -45 - Math.random() * 80;
      petal.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity: 0 }, { transform: `translate(${x}px,${y}px) rotate(100deg)`, opacity: 1, offset: .3 }, { transform: `translate(${x * 1.5}px,160px) rotate(300deg)`, opacity: 0 }], { duration: 1800 + i * 40, easing: 'cubic-bezier(.2,.6,.4,1)' });
    }
    setTimeout(() => layer.remove(), 2500);
  });

  const sound = document.querySelector<HTMLButtonElement>('[data-nature-sound]');
  if (sound) {
    sound.hidden = false;
    const player: Player = getPlayer(sound.dataset.src ?? '');
    // The chapter crossing the middle of the screen sets the music's mood.
    let chapter = 'welcome';
    const chapters = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      chapter = e.target.id;
      player?.setChapter(chapter);
    }), { rootMargin: '-50% 0px -49% 0px' });
    all(':scope > section[id]').forEach(section => chapters.observe(section));
    cleanups.push(() => chapters.disconnect());
    const syncSound = () => {
      const playing = player.playing;
      sound.setAttribute('aria-pressed', String(playing));
      sound.setAttribute('aria-label', (playing ? sound.dataset.on : sound.dataset.off) ?? '');
    };
    const play = async () => {
      player.setChapter(chapter);
      if (!player.playing) await player.play();
      syncSound();
    };
    const autoplayEvents = ['pointerdown', 'touchstart', 'keydown', 'wheel'] as const;
    const removeAutoplayListeners = () => autoplayEvents.forEach(type => document.removeEventListener(type, startOnFirstInteraction));
    const startOnFirstInteraction = (event: Event) => {
      if ((event.target as Element | null)?.closest?.('[data-nature-sound]')) return;
      void play().then(removeAutoplayListeners).catch(syncSound);
    };
    if (sound.hasAttribute('data-autoplay')) {
      autoplayEvents.forEach(type => document.addEventListener(type, startOnFirstInteraction, { passive: true, once: false }));
      // This succeeds for browsers/users that already allow autoplay. Otherwise the first
      // interaction above starts the same soundtrack without requiring a second sound-button tap.
      void play().then(removeAutoplayListeners).catch(syncSound);
    }
    sound.addEventListener('click', async () => {
      sound.disabled = true;
      try {
        player.setChapter(chapter);
        if (player.playing) player.stop(); else await player.play();
        removeAutoplayListeners();
        syncSound();
      } catch { player.stop(); syncSound(); }
      finally { sound.disabled = false; }
    });
    const stop = () => { if (document.hidden) { player.stop(); sound.setAttribute('aria-pressed', 'false'); sound.setAttribute('aria-label', sound.dataset.off ?? ''); } };
    document.addEventListener('visibilitychange', stop);
    cleanups.push(() => { removeAutoplayListeners(); player.stop(); document.removeEventListener('visibilitychange', stop); });
  }

  // Chapter handoffs are native scrolling plus CSS scroll-driven animations (ScenePlate.astro),
  // so nothing here runs per scroll frame. Only browsers without scroll timelines still need
  // a script for the reading-progress line.
  const hero = q('#welcome');
  const tilt = matchMedia('(prefers-reduced-motion: no-preference)');
  let clearTilt = () => {};
  const applyTilt = () => { clearTilt(); clearTilt = tilt.matches && hero ? setupTiltParallax(hero) : () => {}; };
  applyTilt();
  tilt.addEventListener('change', applyTilt);
  cleanups.push(() => { tilt.removeEventListener('change', applyTilt); clearTilt(); });
  if (!CSS.supports('animation-timeline: scroll()')) {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(document.querySelector('[data-nature-progress]'), { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: .25 } });
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    });
    cleanups.push(() => media.revert());
  }
  window.addEventListener('pagehide', () => cleanups.forEach(clean => clean()), { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => cleanups.forEach(clean => clean()));
}
