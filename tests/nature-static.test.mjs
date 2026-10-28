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
  const data=JSON.parse(fs.readFileSync('src/data/site-content.json','utf8'));
  const names=route.startsWith('/hi/')?data.couple.displayName.hi.split(' एवं '):[data.couple.partnerOne,data.couple.partnerTwo];
  for (const name of names) assert.ok(html.includes(name), `${name} (from site-content.json) appears on ${route}`);
  // While the placeholder notice is in the data, no real names may leak into the build.
  if (data._placeholderNotice) assert.ok(!html.includes('RATNESH') && !html.includes('PALLAVI'));
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

test('Rajasthan theme routes keep bilingual routing and theme-specific scene assets', () => {
  const data = JSON.parse(fs.readFileSync('src/data/site-content.json', 'utf8'));
  const events = [
    ['The Turmeric Affair', 'हल्दी की सुनहरी महफ़िल'],
    ['The Henna &amp; Harmony Soirée', 'मेहंदी और सुरों की शाम'],
    ['The Vow &amp; Wonder Chapter', 'सात फेरों का नया अध्याय'],
  ];
  for (const { route, theme, lang } of [
    { route: '/amber-fort/', theme: 'amber-fort', lang: 'en' },
    { route: '/hi/amber-fort/', theme: 'amber-fort', lang: 'hi' },
    { route: '/lake-city/', theme: 'lake-city', lang: 'en' },
    { route: '/hi/lake-city/', theme: 'lake-city', lang: 'hi' },
  ]) {
    const html = fs.readFileSync(`dist${route}index.html`, 'utf8');
    assert.ok(html.includes(`data-theme="${theme}"`), `${route} carries its theme`);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    assert.ok(canonical);
    assert.equal(new URL(canonical[1]).pathname.replace(/\/$/, ''), route.replace(/\/$/, ''));
    assert.ok(html.includes('hero-desktop.') && html.includes('journey-desktop.'));
    assert.ok(html.includes('venue-desktop.') && html.includes('closing-desktop.'));
    assert.ok(html.includes('wishes-desktop.') && html.includes('wishes-mobile.'));
    // The theme opens its own keepsake (cut layers) in place of the paper envelope.
    const keepsake = theme === 'amber-fort' ? { kind: 'object-envelope', layers: ['flap.', 'body.', 'seal.'] } : { kind: 'object-scroll', layers: ['roll.', 'ribbon.'] };
    assert.ok(html.includes(keepsake.kind), `${route} opens its ${keepsake.kind}`);
    for (const layer of keepsake.layers) assert.ok(html.includes(`/_astro/${layer}`), `${route} serves its ${layer.slice(0, -1)} layer`);
    assert.ok(!html.includes('envelope-flap'), `${route} does not render the paper envelope`);
    assert.equal([...html.matchAll(/class="ns-event"/g)].length, 3);
    for (const title of events.map(pair => pair[lang === 'hi' ? 1 : 0])) assert.ok(html.includes(title), `${title} appears on ${route}`);
    for (const match of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
      const path = match[1];
      assert.ok(fs.existsSync(`dist${path}`) || fs.existsSync(`dist${path.replace(/\/$/, '')}/index.html`), `Broken internal route ${path} from ${route}`);
    }
  }
  for (const theme of ['amber-fort', 'lake-city']) {
    for (const asset of ['hero-desktop.png', 'hero-mobile.png', 'journey-desktop.png', 'journey-mobile.png', 'venue-desktop.png', 'venue-mobile.png', 'wishes-desktop.png', 'wishes-mobile.png', 'closing-desktop.png', 'closing-mobile.png', 'invitation-object.png', 'object/geometry.json', ...(theme === 'amber-fort' ? ['object/flap.png', 'object/body.png', 'object/seal.png'] : ['object/roll.png', 'object/ribbon.png'])]) {
      assert.ok(fs.existsSync(`src/assets/rajasthan/${theme}/${asset}`), `${theme}/${asset} exists`);
    }
  }
  assert.equal(data.events[0].title.en, 'The Turmeric Affair');
  assert.equal(data.events[1].title.en, 'The Henna & Harmony Soirée');
  assert.equal(data.events[2].title.en, 'The Vow & Wonder Chapter');
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

test('Nature wishes: six blessings (one the guest writes), RSVP by WhatsApp, nothing sent to a server', () => {
  for(const route of ['/','/hi/']) {
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    const scene=html.match(/<section id="wishes"[\s\S]*?<\/section>/)?.[0];
    assert.ok(scene);
    assert.equal([...scene.matchAll(/data-wish-tag(?=[\s=>])/g)].length,6);
    assert.equal([...scene.matchAll(/data-wish-arrival(?=[\s=>])/g)].length,6);
    assert.equal([...scene.matchAll(/data-wish-own(?=[\s=>])/g)].length,1,'Exactly one writable tag');
    assert.ok(scene.includes('aria-describedby="ns-wishes-hint"')&&scene.includes('id="ns-wishes-hint"'));
    assert.ok(!scene.includes('not guest submissions')&&!scene.includes('अतिथियों के संदेश नहीं'),'No disclaimer');
    assert.ok(!/<form[^>]*\saction=/.test(scene),'No form posts anywhere');
    assert.ok(scene.includes('data-rsvp-open')&&scene.includes('href="https://wa.me/'),'RSVP falls back to a WhatsApp link');
    assert.ok(scene.includes('id="ns-rsvp"')&&scene.includes('id="ns-blessing"'));
    assert.ok(scene.includes('wishes-mobile-v1.')&&scene.includes('wishes-desktop-v1.'));
  }
});

test('personal links, contacts, directions and link previews', () => {
  const data=JSON.parse(fs.readFileSync('src/data/site-content.json','utf8'));
  for(const route of ['/','/hi/']) {
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    assert.ok(html.includes("get('to')")&&html.includes('class="ns-greeting"'),'Greeting reads ?to= before paint');
    assert.match(html,/property="og:image" content="https:\/\/[^"]+\.jpg"/);
    assert.ok(!html.includes('Nature &amp; Stories')&&!html.includes('प्रकृति और कहानियाँ'),'Internal theme name never shown to guests');
    if(!data.contacts.some(c=>/\d{8}/.test(c.phone+c.whatsapp))) assert.ok(!html.includes('ns-contacts"'),'Placeholder contacts stay hidden');
    if(/^https?:/.test(data.venue.mapUrl)) assert.ok(html.includes('google.com/maps/dir/'),'Directions differ from the map link');
  }
  const links=fs.readFileSync('dist/invite-links/index.html','utf8');
  assert.ok(links.includes('noindex'));
  for(const route of ['/','/hi/','/invitation/','/hi/invitation/']) assert.ok(!fs.readFileSync(`dist${route}index.html`,'utf8').includes('invite-links'),'Link maker is not linked from guest pages');
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

test('every chapter carries one decorative scene plate; the sections stay semantic',()=>{
  const ids=['welcome','journey','invitation','celebrations','venue','wishes','closing'];
  for(const route of ['/','/hi/']){
    const html=fs.readFileSync(`dist${route}index.html`,'utf8');
    const plates=[...html.matchAll(/<div class="ns-plate"[^>]*>/g)].map(m=>m[0]);
    assert.equal(plates.length,ids.length);
    assert.ok(plates.every(tag=>tag.includes('aria-hidden="true"')),'Plates are decorative');
    // Only the opening chapter has nothing to reveal it from.
    assert.equal(plates.filter(tag=>tag.includes('data-entry')).length,ids.length-1);
    assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length,1);
    for(const id of ids)assert.equal([...html.matchAll(new RegExp(`<section id="${id}"`,'g'))].length,1);
    for(let i=1;i<ids.length;i++)assert.ok(html.indexOf(`id="${ids[i-1]}"`)<html.indexOf(`id="${ids[i]}"`));
    for(const id of ['lm-foliage-a','lm-foliage-b'])assert.ok(html.includes(`id="${id}"`),'Fronds use existing, valid SVG symbols');
    assert.ok(!/data-(?:journey|scene)-bridge/.test(html),'The script-driven cameras are gone');
  }
  for(const route of ['/invitation/','/hi/invitation/'])assert.ok(!fs.readFileSync(`dist${route}index.html`,'utf8').includes('ns-plate'));
});

test('scroll-driven animations survive minification',()=>{
  // A timeline folded into the `animation` shorthand is rejected by browsers, which then drop
  // the whole declaration: the handoffs would silently stop animating.
  const css=fs.readdirSync('dist/_astro').filter(f=>f.endsWith('.css')).map(f=>fs.readFileSync(`dist/_astro/${f}`,'utf8')).join('');
  assert.ok(css.includes('view-timeline:--scene'),'Chapters name their view timeline');
  for(const decl of css.match(/(?<![\w-])animation:[^;}]*/g)??[])assert.ok(!/--scene|scroll\(/.test(decl),`Timeline inside the animation shorthand: ${decl}`);
  assert.ok(/animation-timeline:--scene/.test(css));
});
