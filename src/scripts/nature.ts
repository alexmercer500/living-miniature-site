import { setupKeepsakes } from './keepsakes';
import { setupVenue } from './venue';
import { setupWishes } from './wishes';
import { setupHeroJourney } from './hero-journey';
import { setupSceneTransitions } from './scene-transitions';
import { scrollGlide } from './scroll-glide';
import { setupInvitationMorph } from './invitation-morph';
import { setupTiltParallax } from './tilt-parallax';
/** Nature & Stories only. Static HTML remains the complete fallback. */
export async function setupNature() {
  const root = document.querySelector<HTMLElement>('[data-nature-root]');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s);
  const all = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];
  const cleanups: (() => void)[] = [];

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
    let player: import('./music').Player | undefined;
    // The chapter crossing the middle of the screen sets the music's mood.
    let chapter = 'welcome';
    const chapters = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      chapter = e.target.id;
      player?.setChapter(chapter);
    }), { rootMargin: '-50% 0px -49% 0px' });
    all(':scope > section[id]').forEach(section => chapters.observe(section));
    cleanups.push(() => chapters.disconnect());
    sound.addEventListener('click', async () => {
      sound.disabled = true;
      try {
        player ??= (await import('./music')).getPlayer(sound.dataset.src ?? '');
        player.setChapter(chapter);
        if (player.playing) player.stop(); else await player.play();
        sound.setAttribute('aria-pressed', String(player.playing));
        sound.setAttribute('aria-label', (player.playing ? sound.dataset.on : sound.dataset.off) ?? '');
      } catch { player?.stop(); sound.setAttribute('aria-pressed', 'false'); sound.setAttribute('aria-label', sound.dataset.off ?? ''); }
      finally { sound.disabled = false; }
    });
    const stop = () => { if (document.hidden) { player?.stop(); sound.setAttribute('aria-pressed', 'false'); sound.setAttribute('aria-label', sound.dataset.off ?? ''); } };
    document.addEventListener('visibilitychange', stop);
    cleanups.push(() => { player?.stop(); document.removeEventListener('visibilitychange', stop); });
  }

  const counter = q<HTMLElement>('[data-nature-countdown]');
  if (counter) {
    const target = new Date(counter.dataset.natureCountdown!).getTime();
    const tick = () => {
      const ms = Math.max(0, target - Date.now());
      const parts = { days: Math.floor(ms / 864e5), hours: Math.floor(ms / 36e5) % 24, minutes: Math.floor(ms / 6e4) % 60, seconds: Math.floor(ms / 1e3) % 60 };
      for (const [unit, value] of Object.entries(parts)) { const node = counter.querySelector(`[data-nature-unit='${unit}']`); if (node) node.textContent = String(value).padStart(2, '0'); }
    };
    tick(); let interval = 0;
    const stop = () => { clearInterval(interval); interval = 0; };
    let visible = false;
    const update = () => { stop(); if (visible && !document.hidden) { tick(); interval = window.setInterval(tick, 1000); } };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }); io.observe(counter);
    document.addEventListener('visibilitychange', update);
    cleanups.push(() => { stop(); io.disconnect(); document.removeEventListener('visibilitychange', update); });
  }

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    let clearHeroJourney=()=>{};
    let clearScenes=()=>{};
    const glide=scrollGlide(gsap);
    const hero=q('#welcome');
    const clearTilt=hero?setupTiltParallax(hero):()=>{};
    const context = gsap.context(() => {
      clearHeroJourney=setupHeroJourney(root,ScrollTrigger,glide);
      clearScenes=setupSceneTransitions(root,ScrollTrigger,glide);
      gsap.to(document.querySelector('[data-nature-progress]'), { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: .25 } });
    }, root);

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => { context.revert(); clearHeroJourney(); clearScenes(); glide.dispose(); clearTilt(); };
  });
  cleanups.push(() => media.revert());
  window.addEventListener('pagehide', () => cleanups.forEach(clean => clean()), { once: true });
  if (import.meta.hot) import.meta.hot.dispose(() => cleanups.forEach(clean => clean()));
}
