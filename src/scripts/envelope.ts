import { envelopeLayout, envelopeState, envelopeTimings, envelopeScrollProgress } from '../lib/envelope-state';
import { styleWriter } from './style-writer';
import { sealHaptic } from './haptics';
import { gateQuiet, quiet } from './quiet';
import type { KeepsakeModel } from './keepsake-3d';

/** Run `start` once: when `target` comes within two screens, or once the loaded page is idle.
 *  On touch devices only once `target` is on screen: a phone's GPU can be busy for a good part
 *  of a second compiling the model's shaders, and no frame (not even a scroll) is drawn
 *  meanwhile, so that must not happen on the welcome, where a guest is about to scroll away. */
function whenNear(target: Element, start: () => void) {
  const touch = matchMedia('(pointer: coarse)').matches;
  let started = false;
  const go = () => { if (started) return; started = true; observer.disconnect(); start(); };
  const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) go(); }, { rootMargin: touch ? '0px' : '200% 0px' });
  observer.observe(target);
  if (touch) return;
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
  // its photo layers play the same stages. Its setup is slow, one-off main-thread work, so each
  // step waits for the guest to pause scrolling (`quiet`): never mid-handoff.
  let model: KeepsakeModel | undefined;
  let shown = envelopeState(1);
  const show = (pose: ReturnType<typeof envelopeState>) => { shown = pose; model?.update(pose); };
  const modelRig = scene.querySelector<HTMLElement>('.envelope-rig[data-model]');
  // Low-end phones (little memory or few cores, or data saver on) keep the photo keepsake: even
  // between gestures, creating the WebGL renderer alone is a few hundred milliseconds there.
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const lowEnd = (device.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4 || Boolean(device.connection?.saveData);
  // On phones each setup step also waits until the chapter fills the screen (see whenNear).
  if (modelRig && matchMedia('(pointer: coarse)').matches) gateQuiet(() => { const r = scene.getBoundingClientRect(); return r.top <= 1 && r.bottom >= innerHeight - 1; });
  if (modelRig && !lowEnd) whenNear(scene, () => quiet().then(() => JSON.parse(modelRig.dataset.model!))
    .then(spec => spec.kind === 'scroll'
      ? import('./scroll-model').then(m => m.mountScrollModel(modelRig, spec))
      : import('./envelope-model').then(m => m.mountEnvelopeModel(modelRig, spec)))
    .then(mounted => { if (mounted) { model = mounted; mounted.update(shown); (window as { __nsProbe?: (text: string) => void }).__nsProbe?.('3D keepsake ready'); } })
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
    // Unchanged values are skipped, so a held pose costs no style work at all. Written on the
    // stage, not the chapter: the chapter also holds its painting and plate effects, which
    // would otherwise be restyled on every frame of the opening.
    const writer = styleWriter();
    const set = (key: string, value: string | number) => writer.set(viewport, `--${key}`, value);
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
    // A tap on a phone plays the opening (or closing) by time instead (see `play`); meanwhile
    // the scroll position does not drive the pose.
    let played = 0;
    const follow = () => {
      document.documentElement.toggleAttribute('data-envelope-active', window.scrollY >= start && window.scrollY <= end);
      if (played) return;
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
    // Wider screens: tapping the seal scrolls the same track, so tap and scroll always agree.
    // Phones: a tap brings the letter to the middle of the screen and opens it there, by time, so
    // a guest need not scroll the whole track. When it lands, the page moves to the scroll
    // position of that pose (the stage is pinned there, so nothing on screen moves) and
    // scrolling carries on from it. A touch mid-way hands over the same way.
    const phone = matchMedia('(max-width: 767px)');
    const OPENED_AT = .84; // the track position where the pose is fully open (envelopeScrollProgress)
    const LEAD_MS = 700; // bringing the chapter fully on screen, at the start of an opening
    let tween = 0;
    const settle = () => {
      cancelAnimationFrame(played);
      played = 0;
      if (window.scrollY >= start - 1) window.scrollTo({ top: start + driver.progress * (end - start), behavior: 'instant' });
      follow();
    };
    const cancelScroll = () => { cancelAnimationFrame(tween); tween = 0; if (played) settle(); };
    const play = (close: boolean) => {
      cancelScroll();
      cancelAnimationFrame(frame);
      frame = 0; last = 0;
      const from = driver.progress, to = close ? 0 : OPENED_AT;
      const scrollFrom = window.scrollY, lead = close ? 0 : Math.max(0, start - scrollFrom);
      const duration = Math.max(400, (close ? envelopeTimings.playClose : envelopeTimings.playOpen) * 1000 * Math.abs(to - from) / OPENED_AT);
      const began = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - began) / duration);
        if (lead) window.scrollTo({ top: scrollFrom + lead * (1 - (1 - Math.min(1, (now - began) / LEAD_MS)) ** 3), behavior: 'instant' });
        driver.progress = from + (to - from) * (k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2);
        render();
        if (k < 1) played = requestAnimationFrame(step); else settle();
      };
      played = requestAnimationFrame(step);
    };
    const interruptKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape'].includes(event.key)) cancelScroll();
    };
    const toggle = () => {
      const close = button.getAttribute('aria-expanded') === 'true' || openingByTap;
      openingByTap = !close;
      if (phone.matches) { play(close); return; }
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
    // On a phone the whole closed keepsake is the target, not only its seal.
    const tapRig = (event: MouseEvent) => {
      if (!phone.matches || button.getAttribute('aria-expanded') === 'true' || openingByTap) return;
      if ((event.target as Element).closest('a, button')) return;
      toggle();
    };
    rig.addEventListener('click', tapRig);
    window.addEventListener('wheel', cancelScroll, { passive: true });
    window.addEventListener('touchstart', cancelScroll, { passive: true });
    window.addEventListener('keydown', interruptKey);
    const releaseFocus = () => queueMicrotask(render);
    card.addEventListener('focusout', releaseFocus);
    const relayout = () => { measure(); range(); if (!played) driver.progress = target(); render(); follow(); };
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
      cancelAnimationFrame(played);
      played = 0;
      cancelScroll();
      window.removeEventListener('scroll', follow);
      window.removeEventListener('resize', relayout);
      button.removeEventListener('click', toggle);
      rig.removeEventListener('click', tapRig);
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
