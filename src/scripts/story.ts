/**
 * Scroll story + small touch delights.
 * Markup always ships in its finished state; this script only rewinds and choreographs it,
 * so no-JS and reduced-motion guests see every scene fully formed.
 */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A short, low-count burst of petals from a viewport point. */
export function petalBurst(x: number, y: number, count = 16) {
  if (reduceMotion) return;
  const layer = document.createElement('div');
  layer.className = 'petal-burst';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    layer.append(p);
    const a = Math.random() * Math.PI * 2;
    const d = 50 + Math.random() * 120;
    const dx = Math.cos(a) * d;
    const dy = Math.sin(a) * d * 0.6 - 40;
    p.animate(
      [
        { transform: 'translate(-50%, -50%) rotate(0deg) scale(.5)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 360}deg) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.3}px, ${dy + 170}px) rotate(${Math.random() * 720}deg) scale(.9)`, opacity: 0 },
      ],
      { duration: 1400 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
    );
  }
  setTimeout(() => layer.remove(), 2400);
}

/** Ambient CSS loops only run while their section is (nearly) on screen. */
function pauseOffscreen() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
    { rootMargin: '120px 0px' },
  );
  document.querySelectorAll('main > section').forEach((s) => io.observe(s));
}

/** Tap any diya to make it flare. */
function tappableDiyas() {
  document.querySelectorAll<SVGSVGElement>('.float-diya, .sill-diya, .c-diya').forEach((d) => {
    d.classList.add('is-tappable');
    d.addEventListener('click', () => {
      d.classList.remove('is-bright');
      void d.getBoundingClientRect();
      d.classList.add('is-bright');
      d.addEventListener('animationend', () => d.classList.remove('is-bright'), { once: true });
      const r = d.getBoundingClientRect();
      petalBurst(r.left + r.width / 2, r.top + r.height * 0.3, 7);
    });
  });
}

/** Tap (or Enter) the peacock: the train fans up and the head turns, then it settles. */
function dancingPeacock() {
  const bird = document.querySelector<SVGSVGElement>('.c-peacock');
  if (!bird) return;
  bird.classList.add('is-tappable');
  bird.removeAttribute('aria-hidden');
  bird.setAttribute('role', 'button');
  bird.setAttribute('tabindex', '0');
  bird.setAttribute('aria-label', document.querySelector('[data-peacock-label]')?.textContent ?? '');
  let timer = 0;
  const dance = () => {
    bird.classList.add('is-fanned');
    clearTimeout(timer);
    timer = window.setTimeout(() => bird.classList.remove('is-fanned'), 3200);
    const r = bird.getBoundingClientRect();
    petalBurst(r.left + r.width * 0.45, r.top + r.height * 0.35, 6);
  };
  bird.addEventListener('click', dance);
  bird.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dance(); }
  });
}

/** Jhoola: drag to swing, tap or Enter to push. A damped pendulum, so it always settles. */
function jhoola() {
  const pushes = [...document.querySelectorAll<SVGGElement | HTMLButtonElement>('[data-swing]')].map(setupSwing);
  return (velocity?: number) => pushes.forEach((push) => push?.(velocity));
}

function setupSwing(el: SVGGElement | HTMLButtonElement) {
  const imageSwing = el.hasAttribute('data-image-swing');
  const arm = imageSwing ? el.closest<HTMLElement>('[data-courtyard-arm]') : el.querySelector<SVGGElement>('.swing-arm');
  if (!arm) return;
  const MAX = imageSwing ? 9 : 38;
  let angle = 0;
  let vel = 0;
  let raf = 0;
  let prev = 0;
  let dragging = false;
  let moved = false;
  let startX = 0;
  let startAngle = 0;
  let lastMove = 0;
  const render = () => {
    if (arm instanceof HTMLElement) arm.style.transform = `rotate(${angle.toFixed(2)}deg)`;
    else arm.setAttribute('transform', `rotate(${angle.toFixed(2)})`);
  };
  const tick = (now: number) => {
    const dt = Math.min(0.033, (now - prev) / 1000);
    prev = now;
    if (!dragging) {
      const acc = -9 * Math.sin((angle * Math.PI) / 180) * (180 / Math.PI) - 0.55 * vel;
      vel += acc * dt;
      angle = Math.max(-MAX, Math.min(MAX, angle + vel * dt));
      if (Math.abs(angle) < 0.05 && Math.abs(vel) < 0.5) { angle = 0; vel = 0; render(); raf = 0; return; }
    }
    render();
    raf = requestAnimationFrame(tick);
  };
  const run = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(tick); } };
  const push = (v = 75) => {
    if (reduceMotion || !el.getClientRects().length || getComputedStyle(el).visibility === 'hidden' || (el instanceof HTMLButtonElement && el.disabled)) return;
    vel += (angle > 0 ? -v : v) * (imageSwing ? 0.3 : 1);
    run();
  };
  el.addEventListener('pointerdown', (e) => {
    if (reduceMotion) return;
    dragging = true;
    moved = false;
    startX = e.clientX;
    startAngle = angle;
    lastMove = performance.now();
    vel = 0;
    el.setPointerCapture(e.pointerId);
    if (!reduceMotion) run();
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    const now = performance.now();
    const next = Math.max(-MAX, Math.min(MAX, startAngle - dx * 0.35));
    vel = ((next - angle) / Math.max(1, now - lastMove)) * 1000;
    lastMove = now;
    angle = next;
    render();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    if (reduceMotion) { angle = 0; render(); return; }
    vel = Math.max(-90, Math.min(90, vel));
    if (!moved) push();
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', () => { dragging = false; vel = 0; });
  el.addEventListener('lostpointercapture', release);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); push(); }
  });
  // Assistive technology can activate the native image-swing button without pointer events.
  if (el instanceof HTMLButtonElement) el.addEventListener('click', (e) => { if (e.detail === 0) push(); });
  return push;
}

async function story(pushSwing?: (v?: number) => void) {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
  const $$ = (sel: string, root: ParentNode = document) => [...root.querySelectorAll<HTMLElement>(sel)];

  // Scene 1 — camera glides forward: palace grows, frame parts, copy drifts away.
  const hero = $('.hero');
  if (hero) {
    const heroTimeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 } });
    const poster = $('[data-layer="poster"]', hero);
    if (poster) {
      heroTimeline.to(poster, { scale: 1.07, yPercent: 3, transformOrigin: '50% 45%' }, 0);
    } else {
      heroTimeline
      .to($('[data-layer="sky"]', hero), { yPercent: 12 }, 0)
      .to($('.sun', hero), { yPercent: 70 }, 0)
      .to($('[data-layer="hills"]', hero), { yPercent: 22 }, 0)
      .to($('[data-layer="palace"]', hero), { scale: 1.22, yPercent: 10, transformOrigin: '50% 100%' }, 0)
      .to($$('.foliage', hero), { xPercent: -32, yPercent: -14, scale: 1.18 }, 0)
      .to($$('.lantern.hang', hero), { yPercent: -50 }, 0);
    }
    heroTimeline.to($('.hero-copy', hero), { yPercent: -40, autoAlpha: 0, ease: 'power1.in' }, 0)
      .to($('.hero-foot', hero), { autoAlpha: 0, duration: 0.25 }, 0);
  }

  // Scenes 2 + 3 — gateway doors open with scroll (or a tap), then names arrive in two beats.
  const gate = $('[data-gate]');
  const panel = gate?.closest<HTMLElement>('.panel');
  const copy = $('[data-reveal-copy]');
  if (copy && panel) {
    const names = $$('.names > span', copy);
    const namesTl = gsap.timeline({ scrollTrigger: { trigger: panel, start: 'top 30%', toggleActions: 'play none none none' } })
      .from($('.mark', copy), { autoAlpha: 0, y: 10, duration: 0.5 })
      .from(names[0], { autoAlpha: 0, y: 26, duration: 0.8, ease: 'power3.out' })
      .from(names[1], { autoAlpha: 0, scale: 0.5, duration: 0.5, ease: 'back.out(2)' }, '-=0.25')
      .from(names[2], { autoAlpha: 0, y: 26, duration: 0.8, ease: 'power3.out' }, '+=0.05')
      .from($$('.ornament, .date, .btn', copy), { autoAlpha: 0, y: 12, stagger: 0.12, duration: 0.5 });

    if (gate) {
      gate.hidden = false;
      const [left, right] = [$('.leaf--l', gate), $('.leaf--r', gate)];
      const burst = () => {
        const r = panel.getBoundingClientRect();
        petalBurst(r.left + r.width / 2, r.top + r.height * 0.45, 22);
      };
      const doors = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut', duration: 1 } })
        .to($('.gate-hint', gate), { autoAlpha: 0, duration: 0.15 }, 0)
        .fromTo(left, { rotateY: 0, filter: 'brightness(1)' }, { rotateY: 84, filter: 'brightness(.72)' }, 0)
        .fromTo(right, { rotateY: 0, filter: 'brightness(1)' }, { rotateY: -84, filter: 'brightness(.72)' }, 0)
        .to([left, right], { autoAlpha: 0, duration: 0.25 }, 0.75)
        .set(gate, { autoAlpha: 0 });
      let burstDone = false;
      const st = ScrollTrigger.create({
        trigger: panel,
        start: 'top 55%',
        end: 'top 8%',
        scrub: 0.5,
        animation: doors,
        onUpdate: (s) => {
          gate.inert = s.progress > 0.5;
          if (s.progress > 0.92 && !burstDone) { burstDone = true; burst(); }
        },
      });
      $('[data-gate-open]', gate)?.addEventListener('click', () => {
        st.kill();
        gate.inert = true;
        doors.play();
        namesTl.scrollTrigger?.kill();
        namesTl.play();
        if (!burstDone) { burstDone = true; burst(); }
      });
    }
  }

  // Scene 4 — two light trails rise from the corners, lamps kindle, and the paths meet.
  const journey = $('#journey');
  if (journey) {
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: journey, start: 'top 65%', end: 'bottom 85%', scrub: 0.6 } })
      .fromTo($$('.trail', journey), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.58 }, 0.05);
    for (let step = 0; step < 8; step++) {
      tl.fromTo($$(`.lamp[data-step="${step}"] .lamp-light`, journey), { opacity: 0.1 }, { opacity: 1, duration: 0.07 }, 0.06 + step * 0.07);
      tl.fromTo($$(`[data-courtyard-step="${step}"]`, journey), { opacity: 0.15 }, { opacity: 1, duration: 0.1 }, 0.06 + step * 0.07);
    }
    tl.fromTo($('.meet', journey), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1.5, opacity: 1, duration: 0.1 }, 0.62)
      .to($('.meet', journey), { scale: 1, duration: 0.1 }, 0.72)
      .fromTo($('.pav-lit', journey), { opacity: 0.2 }, { opacity: 1, duration: 0.2 }, 0.68)
      .fromTo($('.fountain', journey), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.74)
      .call(() => pushSwing?.(60), undefined, 0.78);
    tl.fromTo($$('.courtyard-meet', journey), { opacity: 0.2 }, { opacity: 1, duration: 0.2 }, 0.62);
  }

  // Scene 5 — windows rise in as they arrive.
  const events = $$('.event');
  if (events.length) {
    gsap.set(events, { autoAlpha: 0, y: 50 });
    ScrollTrigger.batch(events, {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.9, ease: 'power3.out' }),
    });
  }

  // Scene 6 — venue settles in.
  const venue = $('#venue');
  if (venue) {
    const venuePoster = $('[data-venue-poster]', venue);
    gsap.fromTo(venuePoster ?? $('.v-palace', venue), { scale: venuePoster ? 1.025 : 1.08, transformOrigin: '50% 65%' }, { scale: 1, ease: 'none', scrollTrigger: { trigger: venue, start: 'top bottom', end: 'center center', scrub: 0.5 } });
    gsap.from($('.venue-card', venue), { autoAlpha: 0, y: 40, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: $('.venue-card', venue), start: 'top 88%' } });
  }

  // Scene 8 — the sun rises as the guest arrives.
  const closing = $('#closing');
  if (closing) {
    gsap.fromTo($('.c-sun', closing), { yPercent: 90 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: closing, start: 'top bottom', end: 'center center', scrub: 0.6 } });
  }

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

pauseOffscreen();
tappableDiyas();
dancingPeacock();
const pushSwing = jhoola();
if (!reduceMotion) story(pushSwing);
