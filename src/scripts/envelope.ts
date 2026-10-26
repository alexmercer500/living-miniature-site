import { envelopeLayout, envelopeState, envelopeTimings, envelopeScrollProgress } from '../lib/envelope-state';
import { styleWriter } from './style-writer';

export async function setupEnvelope() {
  const scene = document.querySelector<HTMLElement>('[data-envelope]');
  const button = scene?.querySelector<HTMLButtonElement>('[data-envelope-toggle]');
  const card = scene?.querySelector<HTMLElement>('[data-envelope-card]');
  const label = scene?.querySelector<HTMLElement>('[data-envelope-label]');
  const status = scene?.querySelector<HTMLElement>('[data-envelope-status]');
  const hint = scene?.querySelector<HTMLElement>('[data-envelope-hint]');
  if (!scene || !button || !card || !label || !status || !hint) return;

  // Keep the fully visible static card when motion is reduced or imports fail.
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const nature = scene.classList.contains('envelope-nature');
    let lastState = '';
    let openingByTap = false;
    const driver = { progress: 0 };
    const viewport = scene.firstElementChild as HTMLElement;
    const rig = scene.querySelector<HTMLElement>('.envelope-rig')!;
    // Unchanged values are skipped, so a held pose costs no style work at all.
    const writer = styleWriter();
    const set = (key: string, value: string | number) => writer.set(scene, `--${key}`, value);
    let lastUsable: boolean | undefined;
    let cardHeight = card.offsetHeight;
    let rigHeight = rig.offsetHeight;
    let sealHeight = button.querySelector<HTMLElement>('.wax-seal')!.offsetHeight;
    let footerTop = scene.querySelector<HTMLElement>('.envelope-footer')!.offsetTop;
    let layout = envelopeLayout(viewport.offsetHeight, rig.offsetHeight, cardHeight, 60);
    const measure = () => {
      const header = document.querySelector<HTMLElement>('[data-header], [data-nature-header]');
      cardHeight = card.offsetHeight;
      rigHeight = rig.offsetHeight;
      sealHeight = button.querySelector<HTMLElement>('.wax-seal')!.offsetHeight;
      footerTop = scene.querySelector<HTMLElement>('.envelope-footer')!.offsetTop;
      layout = envelopeLayout(viewport.offsetHeight, rigHeight, cardHeight, header?.offsetHeight ?? 60);
    };
    const render = () => {
      const state = envelopeState(nature ? envelopeScrollProgress(driver.progress) : driver.progress);
      const focusedCard = card.contains(document.activeElement);
      const pose = focusedCard ? envelopeState(1) : state;
      const floatingCenter = layout.restCenter + (layout.floatCenter - layout.restCenter) * pose.liftSpring;
      const extractCenter = floatingCenter + (layout.extractCenter - layout.floatCenter) * pose.card;
      const center = extractCenter + (layout.presentCenter - layout.extractCenter) * pose.presentSpring;
      const extractedY = -cardHeight * 1.08 * pose.card;
      set('seal-opacity', Math.max(1 - pose.seal, pose.present));
      set('seal-lift', `${-pose.seal * 3 * (1 - pose.present)}rem`);
      set('flap-angle', `${-Math.min(1.08, pose.flapSpring) * 180}deg`);
      set('flap-layer', pose.flapLayer);
      set('card-rise', `${extractedY + (layout.frontOffset - extractedY) * pose.presentSpring}px`);
      // Only clip paper below the physical pocket; the red lining must stay
      // behind the visible paper throughout extraction, not cover its face.
      const visibleHeight = Math.min(cardHeight, rigHeight * .95 + cardHeight * 1.08 * pose.card);
      set('card-mask', `${(1 - visibleHeight / cardHeight) * 100}%`);
      set('card-opacity', Math.min(1, pose.flap * 4));
      set('card-layer', pose.cardLayer);
      set('card-scale', .96 + .04 * pose.card + (layout.frontScale - 1) * pose.presentSpring);
      set('card-turn', `${-4 * pose.card * (1 - pose.presentSpring)}deg`);
      set('rig-top', `${center}px`);
      set('rig-scale', .72 + .28 * pose.liftSpring);
      set('rig-angle', `${58 * (1 - pose.liftSpring)}deg`);
      set('rig-roll', `${-8 * (1 - pose.liftSpring)}deg`);
      set('rig-shadow', `${3 + 29 * pose.lift}px`);
      set('table-shadow-opacity', .4 - .26 * pose.lift);
      set('table-shadow-scale', 1 - .45 * pose.lift);
      set('heading-opacity', Math.max(0, 1 - pose.card * 1.5));
      set('aura-opacity', .2 * pose.lift + .3 * pose.present);
      set('sheen-position', `${-140 + 280 * pose.present}%`);
      set('sheen-opacity', Math.sin(Math.PI * pose.present) * .65);
      const finalPaperBottom = layout.presentCenter - rigHeight * .45 + layout.frontOffset + cardHeight * (1 + (layout.frontScale - 1) / 2);
      const finalControlTop = Math.min(finalPaperBottom + 10, footerTop - sealHeight - 6) - (layout.presentCenter - rigHeight / 2);
      set('control-top', `${rigHeight * .4 + (finalControlTop - rigHeight * .4) * pose.present}px`);
      // Never hide focused invitation content when a guest reverses scroll.
      const usable = state.present === 1 || focusedCard;
      // DOM/ARIA writes only on change: rewriting the label text every frame forced
      // layout and document-wide :has() re-matching on each scroll frame.
      if (usable !== lastUsable) {
        lastUsable = usable;
        card.inert = !usable;
        card.setAttribute('aria-hidden', String(!usable));
        button.setAttribute('aria-expanded', String(usable));
        label.textContent = (usable ? button.dataset.labelClose : button.dataset.labelOpen) ?? '';
        button.setAttribute('aria-label', label.textContent);
      }
      const name = usable ? 'open' : state.progress <= .01 ? 'closed' : 'moving';
      if (name !== lastState && name !== 'moving') status.textContent = status.dataset[name] ?? '';
      lastState = name;
      if (usable) openingByTap = false;
    };

    measure();
    render();
    scene.dataset.enhanced = '';
    button.hidden = false;
    hint.hidden = false;
    // Keep the visual stage one viewport tall while scroll drives every pose.
    // Nature's long track and readable end hold replace the entry autoplay.
    const animation = gsap.to(driver, {
      progress: 1, ease: 'none', onUpdate: render,
      scrollTrigger: {
        trigger: scene, start: 'top top',
        end: () => `+=${Math.max(180, scene.offsetHeight - (scene.firstElementChild as HTMLElement).offsetHeight)}`,
        scrub: nature ? 1.8 : 1.4, invalidateOnRefresh: true,
        onRefresh: trigger => {
          measure(); render();
          if (nature) document.documentElement.toggleAttribute('data-envelope-active', trigger.isActive);
        },
        onToggle: trigger => {
          if (nature) document.documentElement.toggleAttribute('data-envelope-active', trigger.isActive);
        },
      },
    });
    let scrollTween: ReturnType<typeof gsap.to> | undefined;
    const cancelScroll = () => scrollTween?.kill();
    const interruptKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape'].includes(event.key)) cancelScroll();
    };
    const toggle = () => {
      const trigger = animation.scrollTrigger;
      if (!trigger) return;
      const close = button.getAttribute('aria-expanded') === 'true' || openingByTap;
      openingByTap = !close;
      cancelScroll();
      const scroll = { y: window.scrollY };
      scrollTween = gsap.to(scroll, {
        y: close ? trigger.start : trigger.end + 1,
        duration: nature ? (close ? 4.5 : 8) : (close ? envelopeTimings.tapClose : envelopeTimings.tapOpen),
        ease: 'power2.inOut', onUpdate: () => window.scrollTo({ top: scroll.y, behavior: 'instant' }),
      });
    };
    button.addEventListener('click', toggle);
    window.addEventListener('wheel', cancelScroll, { passive: true });
    window.addEventListener('touchstart', cancelScroll, { passive: true });
    window.addEventListener('keydown', interruptKey);
    const releaseFocus = () => queueMicrotask(render);
    card.addEventListener('focusout', releaseFocus);
    const resize = new ResizeObserver(() => { measure(); render(); });
    resize.observe(viewport);
    resize.observe(rig);
    resize.observe(card);
    // A keyboard user can follow the card link after opening, or use the
    // always-visible full invitation link without operating the animation.
    ScrollTrigger.refresh();
    return () => {
      button.removeEventListener('click', toggle);
      window.removeEventListener('wheel', cancelScroll);
      window.removeEventListener('touchstart', cancelScroll);
      window.removeEventListener('keydown', interruptKey);
      scrollTween?.kill();
      card.removeEventListener('focusout', releaseFocus);
      resize.disconnect();
      if (nature) document.documentElement.removeAttribute('data-envelope-active');
      animation.scrollTrigger?.kill();
      animation.kill();
      delete scene.dataset.enhanced;
      writer.restore();
      button.hidden = true;
      hint.hidden = true;
      card.inert = false;
      card.removeAttribute('aria-hidden');
      status.textContent = '';
    };
  });
  window.addEventListener('pagehide', () => media.revert(), { once: true });
}
