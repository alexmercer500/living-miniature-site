// Renders the link-preview cards (og:image) a guest sees when the invitation is shared on
// WhatsApp, Messages or social: each theme's welcome painting with an arched invitation panel
// that says who is inviting them, and when. Chrome draws them so the site's own faces are used
// (Great Vibes / Fraunces / Jost, Tiro Devanagari / Mukta for Hindi). They land in
// src/assets/og/<theme>-<lang>.jpg, which Base.astro serves at 1200×630.
//   chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp> about:blank
//   node scripts/render-og-cards.mjs
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import sharp from 'sharp';

const file = path => pathToFileURL(resolve(path)).href;
const fonts = 'node_modules/@fontsource';
const content = JSON.parse(await fs.readFile('src/data/site-content.json', 'utf8'));
const join = { en: ' & ', hi: ' एवं ' };

// Painting, panel tint and the date line each site shows (theme.ts dateLine). The nature root is
// the landing page for both sides, so it carries both sides' dates together.
const THEMES = {
  nature: { painting: 'src/assets/nature-stories/hero-desktop.png', tint: '#213b32', date: { en: '23–26 November 2026', hi: '23–26 नवम्बर 2026' }, brideFirst: false },
  'amber-fort': { painting: 'src/assets/rajasthan/amber-fort/hero-desktop.png', tint: '#5a1f2a', date: { en: '23–26 November 2026', hi: '23–26 नवम्बर 2026' }, brideFirst: false },
  'lake-city': { painting: 'src/assets/rajasthan/lake-city/hero-desktop.png', tint: '#142f40', date: { en: '23–25 November 2026', hi: '23–25 नवम्बर 2026' }, brideFirst: true },
};
const COPY = {
  en: { kicker: 'You are cordially invited', lead: 'to celebrate the wedding of', fallback: 'Wedding Invitation' },
  hi: { kicker: 'आप सादर आमंत्रित हैं', lead: 'शुभ विवाह', fallback: 'शुभ विवाह निमंत्रण' },
};

const page = ({ painting, tint }, lang, names, foot) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Great Vibes'; src: url(${file(`${fonts}/great-vibes/files/great-vibes-latin-400-normal.woff2`)}); }
@font-face { font-family: Fraunces; font-style: italic; src: url(${file(`${fonts}-variable/fraunces/files/fraunces-latin-soft-italic.woff2`)}); }
@font-face { font-family: Fraunces; src: url(${file(`${fonts}-variable/fraunces/files/fraunces-latin-soft-normal.woff2`)}); }
@font-face { font-family: Jost; font-weight: 100 900; src: url(${file(`${fonts}-variable/jost/files/jost-latin-wght-normal.woff2`)}); }
@font-face { font-family: Tiro; src: url(${file(`${fonts}/tiro-devanagari-hindi/files/tiro-devanagari-hindi-devanagari-400-normal.woff2`)}); }
@font-face { font-family: Tiro; src: url(${file(`${fonts}/tiro-devanagari-hindi/files/tiro-devanagari-hindi-latin-400-normal.woff2`)}); unicode-range: U+0000-00FF, U+2013; }
@font-face { font-family: Mukta; font-weight: 500; src: url(${file(`${fonts}/mukta/files/mukta-devanagari-500-normal.woff2`)}); }
@font-face { font-family: Mukta; font-weight: 500; src: url(${file(`${fonts}/mukta/files/mukta-latin-500-normal.woff2`)}); unicode-range: U+0000-00FF, U+2013; }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; background: #111 url(${file(painting)}) center / cover; }
body::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 58% 80% at 50% 52%, #0000, #0006); }
.card { position: absolute; left: 50%; top: 52%; translate: -50% -50%; width: 620px; height: 470px; padding: 58px 40px 30px;
  display: grid; align-content: center; justify-items: center; gap: 12px; text-align: center; color: #fff4e0;
  background: color-mix(in srgb, ${tint} 80%, transparent); backdrop-filter: blur(4px);
  border: 1.5px solid #d6b06a; border-radius: 310px 310px 16px 16px / 150px 150px 16px 16px; box-shadow: 0 24px 70px #0008; }
.card::after { content: ''; position: absolute; inset: 9px; border: 1px solid #e9c98777; border-radius: 300px 300px 10px 10px / 142px 142px 10px 10px; }
.kicker { font: 600 17px/1.2 Jost; letter-spacing: .3em; text-transform: uppercase; color: #e9c987; }
.lead { font: italic 300 27px/1.2 Fraunces; color: #f6e6c8; }
.names { font: 400 92px/1.05 'Great Vibes'; white-space: nowrap; color: #fff6e4; text-shadow: 0 2px 14px #0007; margin: 4px 0 2px; }
.rule { display: flex; align-items: center; gap: 14px; color: #d6b06a; }
.rule::before, .rule::after { content: ''; width: 92px; height: 1px; background: linear-gradient(90deg, #d6b06a00, #d6b06a); }
.rule::after { scale: -1 1; }
.rule i { width: 9px; height: 9px; rotate: 45deg; border: 1px solid currentColor; }
.foot { font: 400 31px/1.2 Fraunces; letter-spacing: .01em; color: #f3dcae; }
:lang(hi) .kicker { font: 500 25px/1.3 Mukta; letter-spacing: .02em; text-transform: none; }
:lang(hi) .lead { font: 400 32px/1.3 Tiro; font-style: normal; }
:lang(hi) .names { font: 400 78px/1.35 Tiro; }
:lang(hi) .foot { font: 500 30px/1.3 Mukta; }
</style></head><body><div class="card">
<p class="kicker">${COPY[lang].kicker}</p><p class="lead">${COPY[lang].lead}</p>
<p class="names">${names}</p><p class="rule"><i></i></p><p class="foot">${foot}</p>
</div></body></html>`;

const landingPage = (lang, names) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
@font-face { font-family: 'Great Vibes'; src: url(${file(`${fonts}/great-vibes/files/great-vibes-latin-400-normal.woff2`)}); }
@font-face { font-family: Fraunces; font-style: italic; src: url(${file(`${fonts}-variable/fraunces/files/fraunces-latin-soft-italic.woff2`)}); }
@font-face { font-family: Fraunces; src: url(${file(`${fonts}-variable/fraunces/files/fraunces-latin-soft-normal.woff2`)}); }
@font-face { font-family: Jost; font-weight: 100 900; src: url(${file(`${fonts}-variable/jost/files/jost-latin-wght-normal.woff2`)}); }
@font-face { font-family: Tiro; src: url(${file(`${fonts}/tiro-devanagari-hindi/files/tiro-devanagari-hindi-devanagari-400-normal.woff2`)}); }
@font-face { font-family: Mukta; font-weight: 500; src: url(${file(`${fonts}/mukta/files/mukta-devanagari-500-normal.woff2`)}); }
* { box-sizing: border-box; margin: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { position: relative; padding: 38px 84px 34px; color: #fff4e0; text-align: center; background: #213b32 url(${file('src/assets/nature-stories/hero-desktop.png')}) center / cover; }
body::before { content: ''; position: absolute; inset: 0; background: linear-gradient(#10201a99, #10201a4d 35%, #10201acc), radial-gradient(ellipse 60% 80% at 50% 48%, #0000, #0007); }
.panel { position: relative; height: 558px; padding: 25px 33px 28px; border: 1.5px solid #d6b06a; border-radius: 42px 42px 18px 18px; background: #18352de6; box-shadow: 0 24px 70px #0009; }
.panel::after { content: ''; position: absolute; inset: 9px; border: 1px solid #e9c98766; border-radius: 34px 34px 11px 11px; pointer-events: none; }
.kicker { position: relative; z-index: 1; font: 600 16px/1.2 Jost; letter-spacing: .27em; text-transform: uppercase; color: #e9c987; }
.names { position: relative; z-index: 1; margin-top: 4px; font: 400 54px/1 'Great Vibes'; color: #fff6e4; text-shadow: 0 2px 12px #0008; }
.prompt { position: relative; z-index: 1; margin-top: 8px; font: italic 300 22px/1.2 Fraunces; color: #f6e6c8; }
.doors { position: relative; z-index: 1; display: flex; justify-content: center; gap: 25px; margin-top: 19px; }
.door { position: relative; width: 430px; height: 364px; overflow: hidden; padding: 0 20px 21px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; border: 1.5px solid #d6b06a; border-radius: 215px 215px 15px 15px / 110px 110px 15px 15px; background-position: center; background-size: cover; box-shadow: 0 16px 35px #0008; }
.door::before { content: ''; position: absolute; inset: 0; background: linear-gradient(#0000 18%, #10201a33 40%, #10201ad9 100%); }
.door::after { content: ''; position: absolute; inset: 7px; border: 1px solid #e9c98777; border-radius: 208px 208px 10px 10px / 104px 104px 10px 10px; }
.door > * { position: relative; z-index: 1; }
.side { font: 600 15px/1.2 Jost; letter-spacing: .2em; text-transform: uppercase; color: #e9c987; }
.invite { margin-top: 5px; font: 400 28px/1.1 Fraunces; color: #fff6e4; }
.route { margin-top: 6px; font: 400 17px/1.2 Fraunces; color: #f3dcae; }
:lang(hi) .kicker { font: 500 23px/1.2 Mukta; letter-spacing: .02em; text-transform: none; }
:lang(hi) .names { font: 400 47px/1.25 Tiro; }
:lang(hi) .prompt { font: 400 25px/1.25 Tiro; font-style: normal; }
:lang(hi) .side { font: 500 22px/1.2 Mukta; letter-spacing: .02em; text-transform: none; }
:lang(hi) .invite { font: 500 27px/1.2 Mukta; }
:lang(hi) .route { font: 500 20px/1.2 Mukta; }
</style></head><body><div class="panel">
<p class="kicker">${lang === 'hi' ? '\u0906\u092a \u0938\u093e\u0926\u0930 \u0906\u092e\u0902\u0924\u094d\u0930\u093f\u0924 \u0939\u0948\u0902' : 'You are cordially invited'}</p>
<p class="names">${names}</p>
<p class="prompt">${lang === 'hi' ? '\u0905\u092a\u0928\u093e \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923 \u091a\u0941\u0928\u0947\u0902' : 'Choose your invitation'}</p>
<div class="doors">
  <div class="door" style="background-image:url(${file('src/assets/rajasthan/amber-fort/hero-desktop.png')})"><p class="side">${lang === 'hi' ? '\u0935\u0930 \u092a\u0915\u094d\u0937' : "Groom's side"}</p><p class="invite">${lang === 'hi' ? '\u0930\u0924\u094d\u0928\u0947\u0936 \u0915\u093e \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923' : "Ratnesh's invitation"}</p><p class="route">Amber Fort</p></div>
  <div class="door" style="background-image:url(${file('src/assets/rajasthan/lake-city/hero-desktop.png')})"><p class="side">${lang === 'hi' ? '\u0935\u0927\u0942 \u092a\u0915\u094d\u0937' : "Bride's side"}</p><p class="invite">${lang === 'hi' ? '\u092a\u0932\u094d\u0932\u0935\u0940 \u0915\u093e \u0928\u093f\u092e\u0902\u0924\u094d\u0930\u0923' : "Pallavi's invitation"}</p><p class="route">Lake City</p></div>
</div></div></body></html>`;

const target = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => socket.addEventListener('open', r, { once: true }));
let id = 0, loaded = () => {}; const pending = new Map();
socket.addEventListener('message', ({ data }) => { const m = JSON.parse(String(data)); if (m.method === 'Page.loadEventFired') loaded(); const p = pending.get(m.id); if (p) { pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } });
const command = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })); });
const evaluate = async expression => { const r = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };

await command('Page.enable');
await command('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
await fs.mkdir('.astro/og-cards', { recursive: true });
await fs.mkdir('src/assets/og', { recursive: true });
try {
  for (const [theme, config] of Object.entries(THEMES)) for (const lang of ['en', 'hi']) {
    const [one, two] = content.couple.displayName[lang].split(join[lang]);
    const names = (config.brideFirst ? [two, one] : [one, two]).join(join[lang]);
    const html = `.astro/og-cards/${theme}-${lang}.html`;
    await fs.writeFile(html, page(config, lang, names, config.date?.[lang] ?? COPY[lang].fallback));
    const load = new Promise(r => { loaded = r; });
    await command('Page.navigate', { url: file(html) }); await load;
    // Every face is in before the shot, and a long pair of names steps down to fit the arch.
    await evaluate(`document.fonts.ready.then(() => { const n = document.querySelector('.names'); let size = parseFloat(getComputedStyle(n).fontSize); while (n.scrollWidth > 540 && size > 40) n.style.fontSize = (size -= 2) + 'px'; return true; })`);
    const { data } = await command('Page.captureScreenshot', { format: 'png' });
    const out = `src/assets/og/${theme}-${lang}.jpg`;
    await sharp(Buffer.from(data, 'base64')).jpeg({ quality: 90, mozjpeg: true }).toFile(out);
    console.log(out);
  }
  for (const lang of ['en', 'hi']) {
    const [one, two] = content.couple.displayName[lang].split(join[lang]);
    const names = [one, two].join(join[lang]);
    const html = `.astro/og-cards/landing-${lang}.html`;
    await fs.writeFile(html, landingPage(lang, names));
    const load = new Promise(r => { loaded = r; });
    await command('Page.navigate', { url: file(html) }); await load;
    await evaluate('document.fonts.ready');
    const { data } = await command('Page.captureScreenshot', { format: 'png' });
    const out = `src/assets/og/landing-${lang}.jpg`;
    await sharp(Buffer.from(data, 'base64')).jpeg({ quality: 90, mozjpeg: true }).toFile(out);
    console.log(out);
  }
} finally {
  socket.close();
  await fetch(`http://127.0.0.1:9333/json/close/${target.id}`).catch(() => {});
}
