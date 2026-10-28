import { envelopeLayout, envelopeState, envelopeTimings, envelopeScrollProgress } from '../lib/envelope-state';
import { styleWriter } from './style-writer';
import { sealHaptic } from './haptics';
import type { KeepsakeModel } from './keepsake-3d';

/** Run `start` once: when `target` comes within two screens, or once the loaded page is idle. */
function whenNear(target: Element, start: () => void) {
  let started = false;
  const go = () => { if (started) return; started = true; observer.disconnect(); start(); };
  const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) go(); }, { rootMargin: '200% 0px' });
  observer.observe(target);
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 1500));
  if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });
}

export async function setupEnvelope() {
  const scene = document.querySelector<HTMLElement>('[data-envelope]');
  const button = scene?.querySelector<HTMLButtonElement>('[data-envelope-toggle]');
  const card = scene?.querySelector<HTMLElement>('[data-envelope-card]');
  const label = scene?.querySelector<HTMLElement>('[data-envelope-label]');
  const status = scene?.querySelector<HTMLElement>('[data-envelope-status]');
  const hint = scene?.querySelector<HTMLElement>('[data-envelope-hint]');
  if (!scene || !button || !card || !label || !status || !hint) return;

  // A keepsake with a 3D model (the Amber Fort envelope, the Lake City scroll) loads it once the
  // chapter is near or the page is idle, then draws every pose; until then (or without WebGL)
  // its photo layers play the same stages.
  let model: KeepsakeModel | undefined;
  let shown = envelopeState(1);
  const show = (pose: ReturnType<typeof envelopeState>) => { shown = pose; model?.update(pose); };
  const modelRig = scene.querySelector<HTMLElement>('.envelope-rig[data-model]');
  if (modelRig) whenNear(scene, () => Promise.resolve(JSON.parse(modelRig.dataset.model!))
    .then(spec => spec.kind === 'scroll'
      ? import('./scroll-model').then(m => m.mountScrollModel(modelRig, spec))
      : import('./envelope-model').then(m => m.mountEnvelopeModel(modelRig, spec)))
    .then(mounted => { if (mounted) { model = mounted; mounted.update(shown); } })
    .catch(error => console.warn('3D keepsake unavailable; the photo keepsake remains.', error)));

  // Keep the fully visible static card when motion is reduced (and drop the motion if the
  // guest turns reduced motion on mid-visit).
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const enhance = () => {
    let lastState = '';
    let openingByTap = false;
    const driver = { progress: 0 };
    const viewport = scene.querySelector<HTMLElement>('.envelope-viewport')!;
    const rig = scene.querySelector<HTMLElement>('.envelope-rig')!;
    // Unchanged values are skipped, so a held pose costs no style work at all.
    const writer = styleWriter();
    const set = (key: string, value: string | number) => writer.set(scene, `--${key}`, value);
    let lastUsable: boolean | undefined;
    let lastSeal: number | undefined;
    let cardHeight = card.offsetHeight;
    let rigHeight = rig.offsetHeight;
    let sealHeight = button.querySelector<HTMLElement>('.wax-seal')!.offsetHeight;
    let footerTop = scene.querySelector<HTMLElement>('.envelope-footer')!.offsetTop;
    let layout = envelopeLayout(viewport.offsetHeight, rig.offsetHeight, cardHeight, 60);
    const measure = () => {
      const header = document.querySelector<HTMLElement>('[data-nature-header]');
      cardHeight = card.offsetHeight;
      rigHeight = rig.offsetHeight;
      sealHeight = button.querySelector<HTMLElement>('.wax-seal')!.offsetHeight;
      footerTop = scene.querySelector<HTMLElement>('.envelope-footer')!.offsetTop;
      layout = envelopeLayout(viewport.offsetHeight, rigHeight, cardHeight, header?.offsetHeight ?? 60);
    };
    const render = () => {
      const state = envelopeState(envelopeScrollProgress(driver.progress));
      // The wax seal cracks: a short haptic, only while opening (never on the way back).
      if (lastSeal !== undefined && lastSeal < .5 && state.seal >= .5) sealHaptic();
      lastSeal = state.seal;
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
      // Stages for the theme objects (Amber Fort envelope, Lake City scroll); the paper envelope ignores them.
      set('obj-seal', pose.seal);
      set('obj-swing', Math.min(1.08, pose.flapSpring));
      set('obj-card', pose.card);
      set('obj-present', pose.present);
      show(pose);
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

    // The track: from the stage pinning to the end of its readable hold.
    let start = 0, end = 1;
    const range = () => {
      start = scene.getBoundingClientRect().top + window.scrollY;
      end = start + Math.max(180, scene.offsetHeight - viewport.offsetHeight);
    };
    const target = () => Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
    // A light follow gives the paper some weight without trailing the guest's finger; it runs
    // only while the pose is catching up, so a resting page costs nothing.
    let frame = 0, last = 0;
    const tick = (time: number) => {
      frame = 0;
      const dt = last ? Math.min(.1, (time - last) / 1000) : 1 / 60;
      last = time;
      const goal = target();
      driver.progress += (goal - driver.progress) * (1 - Math.exp(-dt / envelopeTimings.follow));
      if (Math.abs(goal - driver.progress) < 5e-4) driver.progress = goal;
      render();
      if (driver.progress !== goal) frame = requestAnimationFrame(tick); else last = 0;
    };
    const follow = () => {
      document.documentElement.toggleAttribute('data-envelope-active', window.scrollY >= start && window.scrollY <= end);
      // Off screen (a dock or header jump) the pose lands at once instead of animating unseen.
      const top = start - window.scrollY;
      if (top > innerHeight || top + scene.offsetHeight < 0) { driver.progress = target(); render(); return; }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    measure();
    scene.dataset.enhanced = '';
    range();
    driver.progress = target();
    render();
    button.hidden = false;
    hint.hidden = false;
    window.addEventListener('scroll', follow, { passive: true });
    // Tapping the seal scrolls the same track, so tap and scroll always agree.
    let tween = 0;
    const cancelScroll = () => { cancelAnimationFrame(tween); tween = 0; };
    const interruptKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape'].includes(event.key)) cancelScroll();
    };
    const toggle = () => {
      const close = button.getAttribute('aria-expanded') === 'true' || openingByTap;
      openingByTap = !close;
      cancelScroll();
      const from = window.scrollY, to = close ? start : end + 1;
      const duration = (close ? envelopeTimings.tapClose : envelopeTimings.tapOpen) * 1000;
      const began = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - began) / duration);
        const eased = k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2;
        window.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
        tween = k < 1 ? requestAnimationFrame(step) : 0;
      };
      tween = requestAnimationFrame(step);
    };
    button.addEventListener('click', toggle);
    window.addEventListener('wheel', cancelScroll, { passive: true });
    window.addEventListener('touchstart', cancelScroll, { passive: true });
    window.addEventListener('keydown', interruptKey);
    const releaseFocus = () => queueMicrotask(render);
    card.addEventListener('focusout', releaseFocus);
    const relayout = () => { measure(); range(); driver.progress = target(); render(); follow(); };
    const resize = new ResizeObserver(relayout);
    resize.observe(scene);
    resize.observe(viewport);
    resize.observe(rig);
    resize.observe(card);
    // Earlier chapters can change height (fonts, images); re-measure the track then too.
    window.addEventListener('resize', relayout);
    document.fonts?.ready.then(() => { if (scene.dataset.enhanced !== undefined) relayout(); });
    // A keyboard user can follow the card link after opening, or use the
    // always-visible full invitation link without operating the animation.
    return () => {
      cancelAnimationFrame(frame);
      cancelScroll();
      window.removeEventListener('scroll', follow);
      window.removeEventListener('resize', relayout);
      button.removeEventListener('click', toggle);
      window.removeEventListener('wheel', cancelScroll);
      window.removeEventListener('touchstart', cancelScroll);
      window.removeEventListener('keydown', interruptKey);
      card.removeEventListener('focusout', releaseFocus);
      resize.disconnect();
      document.documentElement.removeAttribute('data-envelope-active');
      delete scene.dataset.enhanced;
      writer.restore();
      button.hidden = true;
      hint.hidden = true;
      card.inert = false;
      card.removeAttribute('aria-hidden');
      status.textContent = '';
    };
  };
  let teardown: (() => void) | undefined;
  const apply = () => {
    teardown?.();
    teardown = preference.matches ? undefined : enhance();
    if (!teardown) show(envelopeState(1)); // the static pose: opened
  };
  apply();
  preference.addEventListener('change', apply);
  window.addEventListener('pagehide', () => { preference.removeEventListener('change', apply); teardown?.(); }, { once: true });
}
