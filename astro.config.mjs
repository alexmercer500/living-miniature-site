// @ts-check
import { defineConfig } from 'astro/config';

// Static-first; GSAP is loaded only by the home page's scroll scenes.
export default defineConfig({
  // Each deployment sets SITE_URL to its own domain, so the canonical link, the og:url and the
  // og:image are absolute and reachable by WhatsApp's crawler.
  site: process.env.SITE_URL || 'https://example.com',
  trailingSlash: 'ignore',
});
