import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const routes = ['/', '/hi/', '/invitation/', '/hi/invitation/'];
for (const route of routes) test(`built route ${route} is Nature with local assets`, () => {
  const file = `dist${route}index.html`;
  const html = fs.readFileSync(file, 'utf8');
  assert.ok(html.includes('data-theme="nature"'));
  const canonical=html.match(/<link rel="canonical" href="([^"]+)"/);
  assert.ok(canonical, 'Canonical URL exists');
  assert.equal(new URL(canonical[1]).pathname.replace(/\/$/, ''), route.replace(/\/$/, ''));
  for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const path=match[1];
    assert.ok(fs.existsSync(`dist${path}`) || fs.existsSync(`dist${path.replace(/\/$/,'')}/index.html`), `Broken internal route ${path} from ${route}`);
  }
  if (route === '/') { assert.ok(html.includes('data-envelope')); assert.ok(html.includes('data-nature-root')); }
  assert.ok(!/royal/i.test(html), 'No Royal Heritage links or assets remain');
  assert.ok(html.includes('Partner One') || html.includes('साथी एक'));
  assert.ok(!html.includes('RATNESH') && !html.includes('PALLAVI'));
  assert.ok(!html.includes('src/assets/nature-stories/'));
  for (const m of html.matchAll(/(?:src|href)="(\/_astro\/[^"?#]+)"/g)) assert.ok(fs.existsSync(`dist${m[1]}`), `Missing ${m[1]}`);
  for (const m of html.matchAll(/(\/_astro\/[^\s,"()]+\.(?:avif|webp))/g)) assert.ok(fs.existsSync(`dist${m[1]}`), `Missing image ${m[1]}`);
});
test('first paint shows each painting as its own blurred preview, under the opening veil', () => {
  for (const route of ['/', '/hi/']) {
    const html = fs.readFileSync(`dist${route}index.html`, 'utf8');
    assert.ok(!html.includes('ns-fallback'), 'The old flat SVG placeholder is gone');
    const art = [...html.matchAll(/<div class="ns-art[^"]*"[^>]*>/g)].map(m => m[0]);
    const scenes = art.filter(tag => tag.includes('--preview: url(&quot;data:image/svg+xml,') || tag.includes("--preview: url(\"data:image/svg+xml,"));
    assert.ok(scenes.length >= 10, `Visible scenes carry an inline preview (${scenes.length}/${art.length})`);
    assert.equal([...html.matchAll(/class="ns-veil"/g)].length, 1);
    assert.ok(html.indexOf('class="ns-veil"') < html.indexOf('id="welcome"'), 'Veil paints before the hero');
    for (const font of route === '/' ? ['fraunces-latin-soft-normal', 'jost-latin-wght-normal', 'great-vibes-latin-400-normal'] : ['tiro-devanagari-hindi-devanagari-400-normal'])
      assert.match(html, new RegExp(`rel="preload" href="/_astro/${font}\.[^"]+\.woff2" as="font"`));
  }
  assert.ok(!fs.readFileSync('dist/invitation/index.html', 'utf8').includes('ns-veil'), 'Only the home page has a veil');
});
test('retired theme URLs forward to the Nature pages, keeping the hash', () => {
  for (const [from, to] of [['/royal/', '/'], ['/nature/', '/'], ['/royal/invitation/', '/invitation'], ['/hi/royal/', '/hi/'], ['/hi/nature/invitation/', '/hi/invitation']]) {
    const html = fs.readFileSync(`dist${from}index.html`, 'utf8');
    assert.ok(html.includes(`content="0;url=${to}"`), `${from} refreshes to ${to}`);
    assert.ok(html.includes('location.hash'), `${from} keeps the section hash`);
    assert.ok(html.includes('noindex'));
  }
});
test('Nature assets and entrypoints exist', () => {
  const sources = fs.readdirSync('src/assets/nature-stories').filter(n => n.endsWith('.png'));
  assert.equal(sources.length, 16);
  assert.ok(sources.includes('ivory-floral-paper-v1.png'));
  for(const orientation of ['mobile','desktop']) assert.ok(sources.includes(`wishes-${orientation}-v1.png`));
  for (const scene of ['hero','journey','letter','venue','closing']) for (const orientation of ['mobile','desktop']) assert.ok(sources.includes(`${scene}-${orientation}.png`));
  assert.ok(fs.existsSync('src/components/nature/Home.astro'));
  assert.ok(fs.existsSync('src/assets/nature-stories/README.md'));
});

test('Nature venue has three semantic signs, gated maps and a printable fallback', () => {
  const data=JSON.parse(fs.readFileSync('src/data/site-content.json','utf8'));
  const hasMap=/^https?:\/\//.test(data.venue.mapUrl);
  for(const route of ['/','/hi/']) {
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    const scene=html.match(/<section id="venue"[\s\S]*?<\/section>/)?.[0];
    assert.ok(scene);
    assert.equal([...scene.matchAll(/data-venue-sign(?=[\s=>])/g)].length,3);
    assert.equal([...scene.matchAll(/target="_blank"/g)].length,hasMap?2:0);
    assert.equal([...scene.matchAll(/<button[^>]*\sdisabled(?=[\s=>])/g)].length,hasMap?0:2);
    assert.ok(scene.includes('id="ns-venue-preview"'));
    const print=scene.match(/data-venue-explore href="([^"]+)"/)[1];
    assert.equal(print,`${route.startsWith('/hi/')?'/hi':''}/invitation#ns-invite-venue`);
    for(const match of scene.matchAll(/(?:url\(#([^)]*)\)|href="#([^"]+)")/g)) {
      assert.ok(html.includes(`id="${match[1]??match[2]}"`),'Local SVG/anchor target exists');
    }
  }
});

test('Nature wishes are six decorative blessings, with no fake submission service', () => {
  for(const route of ['/','/hi/']) {
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    const scene=html.match(/<section id="wishes"[\s\S]*?<\/section>/)?.[0];
    assert.ok(scene);
    assert.equal([...scene.matchAll(/data-wish-tag(?=[\s=>])/g)].length,6);
    assert.equal([...scene.matchAll(/data-wish-arrival(?=[\s=>])/g)].length,6);
    assert.ok(scene.includes('aria-describedby="ns-wishes-demo"'));
    assert.ok(!scene.includes('<form')&&!scene.includes('id="rsvp"'));
    assert.ok(scene.includes(route.startsWith('/hi/')?'अतिथियों के संदेश नहीं':'not guest submissions'));
    assert.ok(scene.includes('wishes-mobile-v1.')&&scene.includes('wishes-desktop-v1.'));
  }
});

test('Nature final note retains its landscape, real names, message and locale links', () => {
  const data=JSON.parse(fs.readFileSync('src/data/site-content.json','utf8'));
  for(const route of ['/','/hi/']) {
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    const scene=html.match(/<section id="closing"[\s\S]*?<\/section>/)?.[0];
    const lang=route.startsWith('/hi/')?'hi':'en';
    assert.ok(scene);
    assert.ok(scene.includes('closing-mobile.')&&scene.includes('closing-desktop.'));
    assert.ok(scene.includes('ivory-floral-paper-v1.'));
    assert.ok(scene.includes(data.couple.displayName[lang].replaceAll('&','&amp;')));
    assert.ok(scene.includes(data.closing.line[lang]));
    assert.ok(scene.includes(`href="${lang==='hi'?'/hi':''}/invitation"`));
    assert.ok(scene.includes('href="#welcome"'));
    assert.equal([...scene.matchAll(/data-note-arrival(?=[\s=>])/g)].length,1);
    assert.equal([...scene.matchAll(/class="ns-note-floral [ab]"/g)].length,2);
    assert.ok(!scene.includes('RATNESH')&&!scene.includes('PALLAVI'));
    for(const match of scene.matchAll(/(?:url\(#([^)]*)\)|href="#([^"]+)")/g))assert.ok(html.includes(`id="${match[1]??match[2]}"`));
  }
});

test('Hero/Journey bridge is decorative and preserves original sections and routes',()=>{
  for(const route of ['/','/hi/']){
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    assert.equal([...html.matchAll(/data-journey-bridge(?=[\s=>])/g)].length,1);
    assert.ok(html.includes('data-journey-bridge aria-hidden="true" inert'));
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1);
    assert.ok(html.indexOf('id="welcome"')<html.indexOf('id="journey"'));
    assert.ok(html.indexOf('id="journey"')<html.indexOf('id="invitation"'));
    assert.ok(!html.includes('data-journey-ready')&&!html.includes('data-journey-transition'),'Enhancement flags must not be server-rendered');
    for(const id of ['lm-foliage-a','lm-foliage-b'])assert.ok(html.includes(`id="${id}"`),'Bridge uses existing, valid SVG symbols');
  }
});

test('five later bridges reuse Nature art without replacing semantic sections',()=>{
  const targets=['invitation','celebrations','venue','wishes','closing'];
  for(const route of ['/','/hi/']){
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    assert.equal([...html.matchAll(/data-scene-bridge(?=[\s=>])/g)].length,5);
    assert.deepEqual([...html.matchAll(/data-scene-bridge data-from="[^"]+" data-to="([^"]+)" aria-hidden="true" inert/g)].map(m=>m[1]),targets);
    for(const id of ['welcome','journey',...targets])assert.equal([...html.matchAll(new RegExp(`<section id="${id}"`,'g'))].length,1);
    assert.ok(!html.includes('data-scenes-ready')&&!html.includes('data-scenes-scroll'),'Static rendering never depends on animation');
  }
  for(const route of ['/invitation/','/hi/invitation/'])assert.ok(!fs.readFileSync(`dist${route}index.html`,'utf8').includes('data-scene-bridge'));
});
