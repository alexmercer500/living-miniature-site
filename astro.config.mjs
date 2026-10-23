// @ts-check
import { defineConfig } from 'astro/config';

// Static-first. React / R3F and GSAP are added in later milestones,
// scoped to the one interactive island that needs them.
export default defineConfig({
  site: 'https://example.com',
  trailingSlash: 'ignore',
});
