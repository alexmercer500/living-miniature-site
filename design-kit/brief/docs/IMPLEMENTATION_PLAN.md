# Implementation Plan — Milestone-Based

## Milestone 0: Repository and feasibility
- Inspect repository and existing package configuration.
- Read this entire kit.
- Check current Astro integration compatibility for React / React Three Fiber / GSAP before installing.
- Propose the architecture and asset-loading strategy in a concise `IMPLEMENTATION_NOTES.md`.
- Do not install unnecessary UI frameworks.

**Done when:** Architecture is documented and project starts cleanly.

## Milestone 1: Static-first visual shell
- Build Astro layout, global design tokens, responsive typography, navigation, EN / हिंदी toggle, hero poster, and skip-to-details action.
- Use placeholder content only.
- Use reference board for palette/composition, not as the rendered page itself.
- Build the event and venue essentials in semantic HTML.
- Keep a static fallback from day one.

**Done when:** Looks premium at 360 px and 1440 px, language toggle works, no horizontal overflow, core links are accessible.

## Milestone 2: Scroll narrative without heavy 3D
- Build the sequence with layered images / CSS and GSAP ScrollTrigger.
- Add reduced-motion behavior and normal document-scroll fallback.
- Make scene progress work on touch devices and with keyboard scrolling.
- Avoid scroll hijacking and excessive pinned sections.

**Done when:** Every scene can be reached, transitions feel smooth, reduced motion is usable.

## Milestone 3: First interactive miniature
- Add one small interactive island for the environment.
- Start with one scene and no more than two interactions (e.g. diya glow and petal drift).
- Keep all critical text and actions outside the canvas.
- Add fallback for failed WebGL / low-power settings.

**Done when:** Interactions work on phone touch and desktop pointer, do not break scrolling, and fallback works.

## Milestone 4: Expand environment and event vignettes
- Add reusable architectural and garden assets.
- Add 3–4 event vignettes, venue scene, and closing scene.
- Use lazy loading and scene-specific chunks.
- Do not add optional swing / peacock interactions until the core story is stable.

**Done when:** Visual continuity is strong and mobile performance remains acceptable.

## Milestone 5: Content, invitation, and practical actions
- Wire data from `data/site-content.example.json` or a typed content module.
- Implement full invitation as a separate page / modal.
- Add configured map and RSVP links only.
- Add metadata and social preview.

**Done when:** No invented details, all actions work, language toggle covers all UI.

## Milestone 6: QA and polish
- Test 320, 360, 390, 430, 768, 1024, and 1440 px widths.
- Test iOS Safari and Android Chrome where possible.
- Test reduced motion, keyboard navigation, slow network, no WebGL, and failed asset loading.
- Inspect performance, bundle sizes, image sizes, and console errors.
- Fix layout shifts, unreadable text, and interaction conflicts.

**Done when:** Acceptance checklist in `docs/MASTER_REQUIREMENTS.md` is satisfied.

## Coding agent response format
At the end of each milestone, report:
1. What changed.
2. Files created / changed.
3. Commands run and results.
4. What remains.
5. Any assumptions requiring approval.

Do not proceed to the next milestone if the current one fails its done criteria.
