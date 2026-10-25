# Nature & Stories — complete second theme

Owner authorization (2026-10-25): independently plan, generate assets, implement
the entire second theme and verify it without intermediate approval gates.
This supersedes the per-scene approval gates for this theme only. Royal Heritage
and its routes remain intact; no existing source art or data is replaced.

## Routes and architecture

- `/nature/`, `/hi/nature/`: complete English/Hindi experience.
- `/nature/invitation/`, `/hi/nature/invitation/`: printable invitation.
- Existing `/`, `/hi/`, and invitation routes remain Royal Heritage.
- Isolated Nature components, styles and GSAP controller. Existing Astro,
  fonts, icons, calendar utility, music player and shared content are reused.
- No new dependencies, WebGL requirement, backend or invented personal data.

## Visual source

Use RIGHT Nature & Stories / A Journey Together side of both boards under
`wedding-cinematic-two-theme-spec/assets/reference/`. Match rich garden depth,
flowering tree, peach sunset, river/hills, lanterns, textiles, keepsake frames,
paper letter and emotional closing. Recreate real UI in HTML, never use a board
as a background. Exclude forbidden domed/Mughal/Moorish architecture even where
the references contain it. Never invent personal photos or biography.

## Execution

1. Establish paired portrait/landscape hero artwork and Nature palette.
2. Generate matching journey garden, blank invitation tabletop, venue garden
   and closing terrace artwork, each portrait/landscape. Three event artworks.
3. Build reusable art-directed optimized picture with readable CSS fallback.
4. Build hero, symbolic keepsake journey, interactive unfurling letter,
   celebrations, venue, conditional RSVP/countdown, decorative wishes and closing.
5. Add mobile menu, locale-preserving navigation, discreet theme comparison,
   opt-in audio, keyboard-accessible interactions and printable invitation.
6. Implement GSAP camera drift, restrained spring letter motion, scroll-linked
   path, focusable keepsakes, tappable lantern glow, petals and progress rail.
   No scroll trapping; essential copy never depends on animation completion.
7. Build, verify routes/assets/references, test widths 320–1440, EN/Hindi,
   keyboard, touch, reverse scroll, reduced motion, no JS and blocked images.
   Inspect screenshots; document limitations and hand off both theme URLs.

## Acceptance

- Complete independent theme from opening to closing, visually coherent with
  the right side of the boards on mobile and desktop.
- No modification to Royal Heritage scenes, shared content or deployment config.
- Real semantic copy and functional navigation; conditional integrations remain
  honest: no fake RSVP submission, guest wishes, dates, directions or photos.
- Production images optimized by Astro; below-fold art lazy loaded.
- Static and reduced-motion guests receive full readable content.

## Status

Latest owner revision: replace the Nature paper scroll with the first theme's
layered envelope and its existing animation. Implemented by reusing Envelope
with a Nature backdrop slot, Nature invitation links, `#invitation` anchor and
`#celebrations` continuation. Removed the scroll markup, controller and styles.
The envelope controller, gold-paper material, pulsing seal, spring lift, flap
and slow card extraction are shared; names are preprinted, with no timed text
reveal. Royal defaults are unchanged. Verification passes: nine-route production
build, 20 Nature envelope phase checks (desktop/mobile/Hindi/reduced-motion/no-JS),
6 Royal mobile envelope regression checks, 7 Nature mobile scene/layout checks
plus interactions/locale/invitation checks, and all 16 unit/static tests.

All thirteen source artworks generated and integrated. Four new EN/Hindi home
and invitation routes implemented. Royal Heritage scenes/content/routes retained.
Full scene sequence, native navigation, locale links, audio opt-in, letter,
keepsakes, lantern/petal controls, event cards, venue, conditional countdown/RSVP,
decorative wishes and closing implemented. Production build succeeds (9 routes).

Final verification complete: production build passes for all nine routes.
`node tests/nature-browser.mjs` passes 91 scene checks across 13 viewport/fallback
cases, plus keyboard letter open/close, card/action/header clearance, native
menu/Escape, keepsake selection, lantern keyboard/touch activation, canonical/
locale/invitation routes and print CSS. Coverage includes 320/360/390/430/768/
1024/1440px, portrait tablet, short 320×568 Hindi, reduced motion, no JS and
blocked artwork with/without JS. No runtime exceptions or horizontal overflow.
`node tests/envelope-browser.mjs mobile` passes six Royal Heritage phases.
`node --test tests/nature-static.test.mjs tests/envelope-state.test.mjs` passes
16 tests. `git diff --check` passes. No dependencies installed or deployment run.

Screenshots: ignored `.astro/nature-qa/`. Desktop and mobile opening, story,
letter, event, wishes, closing, Hindi, static image-error and print layouts have
been inspected. This is a close visual recreation with generated artwork and
HTML/CSS layers, not a pixel-identical copy, personal-photo album or real 3D tour.

Production Nature AVIF variants range about 52–227 KB each. Only responsive
selected variants are requested; lower scenes are lazy loaded. The full source
PNG library is preserved for future refinement and exact prompts are recorded.

## Files / ownership

- `src/components/nature/{Home,Header,Art,Invitation}.astro`.
- `src/lib/nature-{content,assets}.ts`, `src/scripts/nature.ts`, `src/styles/nature.css`.
- `src/pages/nature/*`, `src/pages/hi/nature/*`.
- `src/assets/nature-stories/`: thirteen PNG sources and exact-prompt README.
- `src/layouts/Base.astro`: optional theme/canonical-path inputs, preserving defaults.
- `tests/nature-{browser.mjs,static.test.mjs}` and this plan.

## Known configuration / review items

- All real names, dates, venue, RSVP and download endpoints remain existing
  placeholders. Map/calendar/RSVP/countdown controls are correctly gated.
- Keepsakes are symbolic illustrations; no personal photos or biography invented.
- Wishes are decorative labels, not a functioning guest-submission service.
- Swing/peacock are illustrated environment details. Letter, lantern, petals,
  keepsakes and navigation are real interactions; no WebGL/3D runtime added.
- Real-device Safari/Android, audio hardware, real map/RSVP navigation and a
  printer require human/device review. No deployment or package installation.
- Model suggestion verified against official OpenAI documentation: GPT-6.1 Sol
  for long-running coding; Astra for the hardest end-to-end review, if available.
