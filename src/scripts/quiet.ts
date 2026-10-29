/** Resolves once the guest has stopped scrolling for a moment and the browser is idle: the slot
 *  for one piece of heavy one-off work (the 3D keepsakes' GPU setup), so it never lands on a
 *  frame of a moving scroll or chapter handoff. A guest who keeps scrolling only defers it.
 *  A gate (`gateQuiet`) can also require a place: on phones, only while the chapter that needs
 *  the work is on screen, so a slot never opens on the welcome or on a later handoff. */
const STILL_MS = 260;
let lastInput = 0;
let listening = false;
let gate: () => boolean = () => true;
const mark = () => { lastInput = performance.now(); };

export function gateQuiet(where: () => boolean) { gate = where; }

export function quiet(): Promise<void> {
  if (!listening) {
    listening = true;
    lastInput = performance.now();
    for (const type of ['scroll', 'wheel', 'touchmove', 'keydown'] as const) addEventListener(type, mark, { passive: true, capture: true });
  }
  return new Promise(resolve => {
    const check = () => {
      if (!gate()) { setTimeout(check, 500); return; }
      const wait = lastInput + STILL_MS - performance.now();
      if (wait > 0) { setTimeout(check, wait); return; }
      const idle = () => {
        if (performance.now() - lastInput < STILL_MS || !gate()) { check(); return; }
        (window as { __nsProbe?: (text: string) => void }).__nsProbe?.('3D setup step');
        resolve();
      };
      if ('requestIdleCallback' in window) requestIdleCallback(idle, { timeout: 1500 }); else setTimeout(idle, 50);
    };
    check();
  });
}
