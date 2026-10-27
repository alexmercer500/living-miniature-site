# IDE LLM Implementation Prompt — Read Fully Before Editing

You are working inside an existing Astro wedding invitation website. Your task is to add two new visual theme routes using the supplied references and specifications, while preserving the existing nature-themed website at the root route.

## Product intent
There are three experiences in the site:
1. `/` — keep the existing nature theme as it currently works.
2. `/amber-fort/` — new **Theme 2: Amber Fort Romance**, intended as one independently shareable wedding invitation experience.
3. `/lake-city/` — new **Theme 5: Lake City Elegance**, intended as the other independently shareable experience.

The boy and girl will share different theme links with their respective friends. Both themes must display the same wedding facts and shared invitation content, but have distinct visual assets and art direction. Confirm exact route naming against the existing repository and bilingual route conventions before implementation; do not break existing routes.

## Main requirement: visual replacement, not a rewrite
The existing site already has its own animation system, transitions, scroll choreography, scene components, and interactions. Reuse those patterns wherever possible. The goal is to replace the visual asset sets and theme-specific scene compositions for the two new routes—not to rebuild the app from scratch and not to replace the current nature theme on `/`.

Keep:
- Astro static-first architecture.
- Existing language support and English/Hindi routes.
- Existing wedding content data model where practical.
- Scroll-triggered animations and transitions.
- Invitation, event, venue, closing, calendar, RSVP, and navigation behaviors.
- Accessibility, keyboard navigation, reduced-motion support, and no-JavaScript/static fallback.
- Current nature theme at `/` unchanged.
- Existing build scripts and dependency setup unless a specific need is established.

## Mandatory design references
Read:
- `references/approved-theme-2-and-5-layout.png` — primary layout/art-direction reference.
- `references/original-five-theme-showcase.png` — original five-theme board, useful for identifying Themes 2 and 5.

Read the detailed visual specs:
- `specs/VISUAL_SPEC_THEME_2_AMBER_FORT.md`
- `specs/VISUAL_SPEC_THEME_5_LAKE_CITY.md`
- `specs/ROUTE_AND_CONTENT_PLAN.md`
- `specs/ASSET_MANIFEST.md`
- `assets/ASSET_PROMPTS.md`

## Theme 2 — Amber Fort Romance
The illuminated Rajasthan hill fort is the hero focal point. It must be large, clearly visible, and unobstructed against a dramatic sunset. Foreground decoration must be sparse. Do not fill the scene with flowers, furniture, rugs, lanterns, or props. Use only restrained architectural framing at the outer edges. Desktop and mobile need separate compositions.

## Theme 5 — Lake City Elegance
The broad lake, palace across the water, and reflections are the hero focal points. Keep the water and palace unobstructed and visually dominant. Use a serene sunset-to-blue-hour palette. Foreground decoration must be sparse and only frame the outer edges. Desktop and mobile need separate compositions.

## Asset handling
The supplied boards are visual references, not complete production assets. Never set an entire composite board as the page background. Do not crop tiny objects out of the board and treat them as production-ready assets. Use individual generated assets described in `assets/ASSET_PROMPTS.md`; until those exist, clearly identify missing assets and use an intentional temporary fallback rather than broken paths.

All text (names, dates, event details, descriptions, CTA labels) must remain real HTML/content data—not baked into images. Do not invent real couple photos or venue facts. Use the current placeholders until supplied.

## Technical implementation
1. Inspect the actual repository, current route files, asset locations, component structure, animation code, and package scripts.
2. Check the git status/diff first; preserve existing user changes and do not reset or overwrite them.
3. Report the current route map and the smallest implementation plan before modifying files.
4. Implement new theme routes using shared content and reusable components. Prefer theme configuration/tokens over duplicate page implementations.
5. Reuse the existing GSAP/ScrollTrigger choreography and interaction patterns. Adjust only the scene-specific timings/selectors where necessary.
6. Keep root route visually unchanged.
7. Use responsive `<picture>`/`srcset` or equivalent for desktop/mobile assets and ensure proper `object-position`/focal points.
8. For below-the-fold images, lazy-load. Hero images should be appropriately prioritized and responsive.
9. Do not add Three.js or React merely to make the page sound 3D. Use real-time 3D only if an actual model and meaningful interactive requirement justify it. A rendered image is not a 3D model.
10. If a real model is absent, implement a high-quality static/art-directed fallback while keeping the interaction accessible and documenting the limitation.
11. Keep reduced-motion and no-WebGL fallback behavior. Do not autoplay audio or hijack scrolling.
12. Do not add dependencies without explaining why and checking compatibility.

## Work in milestones
Do not attempt the whole redesign in one giant pass.

### Milestone 0 — audit only
Read this prompt and all listed references/specs. Inspect the app and report:
- existing routes and which route must remain unchanged,
- reusable scene components and animation timelines,
- current content data source,
- exact assets needed,
- exact files you propose to add/change,
- route and bilingual strategy.
Do not change files in this milestone.

### Milestone 1 — route scaffolding and theme configuration
Create the two new routes using shared components/data and theme tokens, with the correct theme-specific asset slots. Keep `/` unchanged. Run the available build and report results.

### Milestone 2 — hero art
Integrate the separate approved desktop and mobile hero assets. Make the fort and lake/palace/reflections the primary focal points, with minimal edge decoration. Keep text in HTML. Review screenshots at desktop and 360px mobile width before continuing.

### Milestone 3 — invitation and entrance scenes
Apply theme-specific envelope/scroll/entrance visuals while reusing existing interaction and animation patterns. Preserve keyboard/touch behavior and reduced-motion support.

### Milestone 4 — story, celebrations, venue, closing
Integrate individual scene assets for each section. Use one image per event rather than a single composite grid. Keep event labels in HTML and use the shared content source.

### Milestone 5 — QA
Test every route, English/Hindi behavior, mobile layouts, scroll animations, invitation interactions, calendar/RSVP/venue conditional states, reduced motion, and static fallback. Run the production build. Provide screenshots and a changed-file summary.

## Acceptance criteria
- `/` still shows the existing nature theme.
- The two new routes are independently shareable and clearly distinct.
- Both themes use shared wedding content, not duplicated hard-coded facts.
- The fort dominates Theme 2's hero.
- The lake, palace, and reflections dominate Theme 5's hero.
- Desktop and mobile compositions are purpose-designed, not simple crops.
- Existing animation/transition behavior is preserved or intentionally adapted.
- No broken asset references or fake functionality.
- Build passes or any pre-existing failure is clearly identified.
- Accessibility, reduced-motion, and fallback paths remain functional.

Start with Milestone 0 only. Do not edit files until you have presented the audit and plan.
