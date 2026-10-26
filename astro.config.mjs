// @ts-check
import { defineConfig } from 'astro/config';

// Static-first; GSAP is loaded only by the home page's scroll scenes.
export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'ignore',
});
