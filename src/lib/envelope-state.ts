/** One normalized scroll value drives every part; tapping moves that same scroll. */
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const phase = (progress: number, start: number, end: number) => {
  const x = clamp((progress - start) / (end - start));
  return x * x * (3 - 2 * x);
};

/** Small damped overshoot, sampled from scroll so reversing stays deterministic. */
const spring = (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x);

/** Seconds. `follow` is how closely the paper trails the scroll (time constant): enough
 *  weight to feel like paper, short enough that it never reads as lagging behind the finger. */
export const envelopeTimings = { tapOpen: 8, tapClose: 4.5, follow: .12 };

/** A short closed beat and a generous readable hold before unpinning. */
export const envelopeScrollProgress = (progress: number) => clamp((progress - .04) / .8);

export function envelopeLayout(viewHeight: number, rigHeight: number, cardHeight: number, headerHeight: number) {
  const safeTop = headerHeight + 28;
  const safeBottom = viewHeight - (viewHeight < 650 ? 220 : 124);
  const cardCenter = Math.max(safeTop + cardHeight / 2, Math.min(viewHeight * .5, safeBottom - cardHeight / 2));
  const floatCenter = viewHeight * .56;
  const presentCenter = floatCenter + rigHeight * .12;
  return {
    restCenter: viewHeight * .67,
    floatCenter,
    // The paper must clear the pocket without crossing under the fixed header.
    extractCenter: Math.max(floatCenter, safeTop + cardHeight * 1.08 + rigHeight * .45),
    presentCenter,
    frontOffset: cardCenter - cardHeight / 2 - presentCenter + rigHeight * .45,
    frontScale: viewHeight < 650 ? 1 : 1.05,
  };
}

export function envelopeState(value: number) {
  const progress = clamp(value);
  const lift = phase(progress, 0, .25);
  const seal = phase(progress, .26, .36);
  const flap = phase(progress, .32, .5);
  const card = phase(progress, .46, .78);
  const present = phase(progress, .79, .9);
  return {
    progress, lift, seal, flap, card, present,
    liftSpring: spring(lift), flapSpring: spring(flap), presentSpring: spring(present),
    flapLayer: flap < .5 ? 4 : 1,
    // Change stacking only after the paper clears the pocket, in both directions.
    cardLayer: card === 1 && present > 0 ? 6 : 2,
    opened: progress >= .999,
  };
}
