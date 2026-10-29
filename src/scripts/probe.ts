/** On-device frame probe, only with `?probe` in the address (never for guests). It records every
 *  frame that took too long while you scroll, what the main thread was doing in it (if
 *  anything: a long frame with no main-thread work is the GPU or raster), the chapter and
 *  scroll position, viewport resizes (the browser bars) and the 3D keepsake's setup steps.
 *  A pill at the bottom left counts stalls; tap it for the list and a Copy button. */
type Entry = { t: number; kind: string; text: string };

export function setupProbe() {
  const entries: Entry[] = [];
  const t0 = performance.now();
  const at = () => {
    const mid = innerHeight / 2;
    const chapter = [...document.querySelectorAll<HTMLElement>('.ns-home > section[id]')].find(s => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
    return `${chapter?.id ?? '?'} @${(scrollY / innerHeight).toFixed(2)}scr`;
  };
  const add = (kind: string, text: string) => { entries.push({ t: Math.round(performance.now() - t0), kind, text }); dirty = true; };
  (window as unknown as { __nsProbe: (text: string) => void }).__nsProbe = text => add('event', `${text} (${at()})`);

  // Long animation frames: what the main thread did.
  const loafs: { start: number; end: number }[] = [];
  try {
    new PerformanceObserver(list => {
      for (const e of list.getEntries() as PerformanceEntry[] & { blockingDuration?: number; renderStart?: number; styleAndLayoutStart?: number; scripts?: { invoker: string; sourceURL: string; sourceFunctionName: string; duration: number }[] }[]) {
        if (e.duration < 50) continue;
        loafs.push({ start: e.startTime, end: e.startTime + e.duration });
        const end = e.startTime + e.duration;
        const style = e.styleAndLayoutStart ? Math.round(end - e.styleAndLayoutStart) : 0;
        const render = e.renderStart ? Math.round(end - e.renderStart) : 0;
        const scripts = (e.scripts ?? []).filter(s => s.duration > 4).map(s => `${s.invoker.slice(0, 40)}${s.sourceFunctionName ? ` ${s.sourceFunctionName}` : ''} ${(s.sourceURL || '').split('/').pop()?.split('?')[0]} ${Math.round(s.duration)}ms`).join('; ');
        add('main', `${Math.round(e.duration)}ms (render ${render}, style+layout ${style}) ${scripts || 'no script'} — ${at()}`);
      }
    }).observe({ type: 'long-animation-frame', buffered: false });
  } catch { add('note', 'long-animation-frame not supported'); }

  // Frame gaps as the page sees them; ones with no long main-thread frame are GPU/raster.
  let last = 0;
  const frame = (now: number) => {
    const gap = last ? now - last : 0;
    last = now;
    if (gap > 45 && !document.hidden) {
      const gapStart = now - gap;
      setTimeout(() => {
        const main = loafs.some(l => l.end > gapStart && l.start < now);
        // A ~1 s beat is the browser throttling a page it thinks is out of sight, not a stall.
        if (!main && Math.abs(gap - 1000) < 25) { add('note', `throttled frame (${Math.round(gap)}ms): page not in view?`); return; }
        add(main ? 'gap' : 'gap-gpu', `${Math.round(gap)}ms frame${main ? '' : ' with no main-thread work (GPU/raster/decode)'} — ${at()}`);
      }, 200);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  let height = innerHeight;
  addEventListener('resize', () => { add('event', `resize ${height}→${innerHeight}px — ${at()}`); height = innerHeight; });
  document.addEventListener('visibilitychange', () => { last = 0; });

  // Device.
  const gl = document.createElement('canvas').getContext('webgl');
  const info = gl?.getExtension('WEBGL_debug_renderer_info');
  const device = navigator as Navigator & { deviceMemory?: number };
  const header = `${navigator.userAgent}\ncores ${navigator.hardwareConcurrency}, memory ${device.deviceMemory ?? '?'} GB, dpr ${devicePixelRatio}, ${innerWidth}×${innerHeight}, GPU ${info ? gl!.getParameter(info.UNMASKED_RENDERER_WEBGL) : '?'}`;
  gl?.getExtension('WEBGL_lose_context')?.loseContext();

  // The pill and the list.
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.style.cssText = 'position:fixed;left:8px;bottom:84px;z-index:9999;padding:6px 10px;border:0;border-radius:14px;font:600 12px/1.2 system-ui;color:#fff;background:#000c;';
  const panel = document.createElement('div');
  panel.hidden = true;
  panel.style.cssText = 'position:fixed;inset:70px 8px 130px;z-index:9999;overflow:auto;padding:10px;border-radius:10px;font:11px/1.35 ui-monospace,monospace;white-space:pre-wrap;color:#fff;background:#000e;';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy';
  copy.style.cssText = 'position:sticky;top:0;float:right;padding:6px 12px;border:0;border-radius:8px;font:600 12px system-ui;background:#fff;color:#000;';
  const list = document.createElement('div');
  panel.append(copy, list);
  document.body.append(pill, panel);
  const text = () => `${header}\n\n${entries.map(e => `${(e.t / 1000).toFixed(2)}s ${e.kind}: ${e.text}`).join('\n')}`;
  pill.addEventListener('click', () => { panel.hidden = !panel.hidden; if (!panel.hidden) list.textContent = text(); });
  copy.addEventListener('click', () => { navigator.clipboard?.writeText(text()).then(() => { copy.textContent = 'Copied'; }, () => { copy.textContent = 'Select the text'; }); });
  let dirty = true;
  setInterval(() => {
    if (!dirty) return;
    dirty = false;
    const stalls = entries.filter(e => e.kind.startsWith('gap')).length;
    pill.textContent = `probe: ${stalls} slow frame${stalls === 1 ? '' : 's'}`;
  }, 500);
}
