import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const routes = ['/', '/hi/', '/invitation/', '/hi/invitation/', '/nature/', '/hi/nature/', '/nature/invitation/', '/hi/nature/invitation/', '/preview/vignettes/'];
for (const route of routes) test(`built route ${route} retains its theme and local assets`, () => {
  const file = `dist${route}index.html`;
  const html = fs.readFileSync(file, 'utf8');
  const nature = route.includes('/nature/');
  assert.equal(html.includes('data-theme="nature"'), nature);
  if (route === '/') { assert.ok(html.includes('data-envelope')); assert.ok(!html.includes('data-nature-root')); }
  if (nature) {
    assert.ok(html.includes('Partner One') || html.includes('साथी एक'));
    assert.ok(!html.includes('RATNESH') && !html.includes('PALLAVI'));
    assert.ok(!html.includes('src/assets/nature-stories/'));
    assert.ok(html.includes('rel="canonical"'));
  }
  for (const m of html.matchAll(/(?:src|href)="(\/_astro\/[^"?#]+)"/g)) assert.ok(fs.existsSync(`dist${m[1]}`), `Missing ${m[1]}`);
  for (const m of html.matchAll(/(\/_astro\/[^\s,"()]+\.(?:avif|webp))/g)) assert.ok(fs.existsSync(`dist${m[1]}`), `Missing image ${m[1]}`);
});
test('Nature assets and theme entrypoints exist without replacing Royal Heritage', () => {
  const sources = fs.readdirSync('src/assets/nature-stories').filter(n => n.endsWith('.png'));
  assert.equal(sources.length, 13);
  for (const scene of ['hero','journey','letter','venue','closing']) for (const orientation of ['mobile','desktop']) assert.ok(sources.includes(`${scene}-${orientation}.png`));
  assert.ok(fs.existsSync('src/components/sections/Hero.astro'));
  assert.ok(fs.existsSync('src/components/nature/Home.astro'));
  assert.ok(fs.existsSync('src/assets/nature-stories/README.md'));
});
