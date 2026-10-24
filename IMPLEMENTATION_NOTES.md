# Implementation Notes — Phase 1 Visual Reconstruction

## Journey courtyard integration — 2026-10-24

Owner-approved courtyard studies are now integrated in `Journey.astro`.
Built-in image generation removed the baked swing from portrait/landscape
backgrounds and produced a transparent carved jhoola. All three source PNGs
are in `src/assets/royal-heritage/`; its README records exact prompts and
provenance. Astro generates responsive AVIF/WebP backgrounds (about 68–217 KB
AVIF) and an alpha-preserving WebP swing (179 KB). No packages were installed.

The picture and interaction layers share the source compositions' aspect
ratios. The new swing uses the existing damped pendulum, bounded to nine degrees,
with a native localized button over the seat. Horizontal dragging is optional;
`touch-action: pan-y` preserves vertical scrolling. Keyboard/assistive activation
works; reduced-motion guests see the still composition. The title is real
localized HTML and never waits for a reveal. Sequential glow accents follow
the courtyard paths. Existing SVG courtyard and choreography remain as the
image-error fallback, without changing shared scene symbols or other artwork.

Verification: production build passes for all five routes; six existing
envelope state tests and six mobile envelope browser phases pass. Journey
browser coverage in `tests/journey-browser.mjs` checks desktop, mobile, 320px
Hindi, reduced motion, no JavaScript, loaded optimized assets, SVG references,
overflow, heading visibility, swing controls, and simulated image-error recovery.
Screenshots are in ignored `.astro/journey-qa/` and have been visually inspected.
Real-device Safari and physical touchscreen testing remain owner review items.
No later scene was redesigned. This is layered raster/CSS/SVG, not 3D.

## Envelope interaction implementation update

Current behavior supersedes the earlier reveal notes: the owner requested
permanent card copy after fast scrolling could bypass the name animation.
Removed the independent text timeline, reveal helper, text opacity/blur/lift,
and card mist/sparkle layers. Both localized names and wedding details now
remain printed on the paper throughout extraction and reverse scroll. The
card becomes interactive when it settles, with no text-animation delay.
Envelope pacing, spring motion, paper layering, glow, and seal controls remain.

Latest owner revision: explicit lining z-index 1 / paper z-index 2 keeps the
paper in front of burgundy. Extraction clipping now follows the physical
pocket height instead of clipping all paper inside the envelope. The visible
Open/Close label is removed; a 2.8-second red seal glow signals activation,
with localized aria-labels, keyboard control, and a visible focus ring.

The scene has 2000–3400 px of scroll travel and 1.4-second scrub smoothing.
Programmatic opening is six seconds; closing is 3.5 seconds. User wheel,
touch, or navigation keys cancel that automated scroll. After presentation
settles, an independent 3.8-second text timeline reveals the names and details
with mist/sparkles. Reversing below the reveal gate cancels and resets it;
focused card content remains readable. Final seal placement uses measured
paper/footer bounds, with a compact card scale on short screens.

Pacing revision verification: build and seven state/layout tests pass. Twenty-
three browser phase/fallback checks pass across desktop, mobile, short-screen
Hindi, reduced motion, and no JavaScript. Checks cover paper/lining stacking,
pulsing-seal cue, hidden visual label, blank settled card before names, delayed
name reveal, final seal/footer clearance, reverse scrolling, and keyboard
opening/closing. Screenshots of the extraction and final card were inspected.
Run browser cases sequentially: concurrent inactive tabs can throttle GSAP's
clock and produce false timing failures; the harness brings its tab forward.

Latest polish: the owner's screenshot exposed a top-edge anchor placing the
resting envelope below the usable table area. The rig is now anchored by its
center. `envelopeLayout` measures viewport, rig, paper, and header dimensions
to keep extraction below the header and the foreground card above actions.
Responsive resize/font changes remeasure the layout.

Owner-requested spring and atmosphere effects use deterministic damped
overshoot, GSAP scroll smoothing, a warm aura and paper light sweep. Names
stay concealed until foreground presentation has settled, then appear as whole
language-shaped spans with staggered blur/lift, three mist layers, and fourteen
sparkles. Effects follow progress in both directions, settle completely, and
remain disabled in static/reduced-motion modes. No dependency was added.

An isolated headless Chrome session now supports actual screenshot/geometry
regression checks. `tests/envelope-browser.mjs` checks resting/open bounds,
forward/reverse phases, runtime errors, and keyboard toggling, plus reduced
motion and JavaScript-disabled fallbacks. `tests/envelope-state.test.mjs`
contains seven passing sequencing, spring, geometry, and reversal tests.

Final polish verification: production build and all seven unit tests pass.
Twenty browser phase/fallback checks pass at 1440×900, 390×844, and 320×568,
including Hindi, keyboard opening/closing, reverse scrolling, reduced motion,
and JavaScript disabled. Screenshots were visually inspected. No runtime
exceptions were recorded. Close-control/paper/footer clearance is asserted;
the static heading is hidden to prevent overlap with the foreground card.
This is headless Chrome coverage, not an iOS Safari or physical touch-device
performance certification.

Owner-requested revision: the envelope now rests at a foreshortened angle on
the table, rises upright, and only then releases the seal and flap. The paper
clears the pocket before switching to a foreground layer and settling in front
of the envelope. Contact shadow, tilt, scale, vertical position, and extraction
are driven by the same progress value. A longer native scroll interval gives
the stages room. The heading fades during extraction to keep the card clear.
Static/reduced-motion defaults now show the final foreground card. Four state
tests cover endpoints, lift-before-opening, clear-before-foreground stacking,
and reverse-scroll consistency. Production build passes; visual browser review
is still pending.

The owner authorized the layered envelope sequence after approving its artwork.
`Envelope.astro` is inserted after the existing gateway, preserving the previous
hero/reveal/journey order around it. Separate CSS layers use generated embossed
paper and an empty-table backdrop. The seal is a CSS wax treatment with the
existing LotusMark SVG. The flap uses a perspective hinge; the card contains
real localized HTML names, date fallback, venue placeholder, and invitation link.

`envelope-state.ts` maps one progress value to seal, flap, and card phases.
`envelope.ts` uses GSAP/ScrollTrigger to drive that value. Tapping the seal scrolls
to the same trigger endpoint; reversing scroll reverses the sequence. The scene
uses a short sticky interval and native scrolling. The static default is open
and readable; reduced-motion mode uses that default. Hidden card links are inert
during opening and focused card content stays visible during reverse scrolling.

No WebGL runtime or GLB was added. This is the specification's CSS perspective
alternative. The original real-time 3D branch remains deferred in plan.md.
Automated state tests cover endpoints, sequencing, and reverse-scroll geometry;
browser visual, keyboard, and touch verification remain pending.

## Milestone 1 implementation update

The owner approved the mobile and desktop hero artwork. `Hero.astro` imports
the source PNGs and builds AVIF/WebP variants with Astro's existing image
service. Phones and portrait tablets use portrait art; wider screens use the
landscape composition. Images load eagerly with high fetch priority. Essential
copy and navigation remain HTML, and the existing inline SVG scene stays
underneath the poster as a fallback.

`story.ts` animates the poster wrapper with a restrained scroll zoom while
preserving the gateway and remaining scene timelines. Reduced motion retains
the static composition through the existing motion preference handling.

The production build generates five routes. AVIF variants are approximately
69–216 KB, depending on width; WebP alternatives are approximately 104–337 KB.
Source PNGs are not served as the hero download.

Browser preview automation is unavailable in this session. Actual typography,
crop, focus behavior, image-failure fallback, and mobile scrolling require
owner browser review before the milestone's visual acceptance gate passes.

## Status

Phase 1 / Milestone 0 is complete as a planning and feasibility pass.

No page behavior, route, dependency, or visual component was changed during
this phase.

## Current application foundation

- Framework: Astro 7.4.2.
- Styling: global CSS plus component-local Astro styles and design tokens.
- Motion: GSAP 3.15.0 with ScrollTrigger.
- Artwork: procedural inline SVG generated by `src/lib/art.ts` and reused
  through `src/components/scene/SceneDefs.astro`.
- Content: bilingual data in `src/data/site-content.json` with English and
  Hindi routes.
- Existing scene sections: hero, journey, reveal, celebrations, venue, RSVP,
  and closing.
- Existing interaction controller: `src/scripts/story.ts`.
- Existing fallbacks: semantic HTML content, inline SVG artwork, reduced-motion
  handling, and no-JavaScript-readable content.
- Current 3D runtime: none.
- Current production visual assets: no GLB/GLTF models or hero raster assets in
  `public/`; the reference boards are direction-only assets under the spec pack.

## Reference reconstruction brief

Reference:

`wedding-cinematic-two-theme-spec/assets/reference/two-themes-overview-board.png`

Target the Royal Heritage side of the board as a close visual recreation. Do
not use the board itself as a background and do not copy its embedded text.

### Composition

1. Full-bleed dusk atmosphere and dark carved wood frame.
2. Foreground door edges, carved pillars, hanging toran, floral clusters, and
   brass diyas create a close intimate frame.
3. Middle ground is a sandstone courtyard with a central mandap and warm
   practical lights.
4. Background is a flat-roofed Indian haveli roofline and warm twilight. No
   dome skyline.
5. Center remains calm enough for real HTML couple names and invitation copy.
6. The scene should have foreground, middle-ground, background, and subtle
   atmospheric separation on desktop.
7. Mobile keeps the doorway, mandap, and text focal point visible while
   simplifying edge ornament and reducing fine detail.

### Material language

- Carved dark wood: entrance doors, pillars, plinths, and framing.
- Warm sandstone: courtyard walls, steps, and architectural planes.
- Antique brass: diyas, lamps, and restrained ornamental highlights.
- Maroon textiles: mandap canopy, cushions, and selective ceremony accents.
- Ivory handmade paper: invitation surface and text panels.
- Marigold, rose, mango leaves, rangoli, and woven textile details.

### Palette

| Purpose | Token / value |
|---|---|
| Night umber | `#21140F` |
| Wedding maroon | `#4B1020` |
| Vermilion | `#B83A32` |
| Sandstone | `#B87950` |
| Antique gold | `#B88945` |
| Warm brass highlight | `#E6C27B` |
| Ivory paper | `#FFF1D8` |
| Leaf green | `#40533A` |

Gold is an accent and light catch, not the default body-text color.

### Lighting and motion

- Warm amber practical light from diyas and mandap lamps.
- Darker corners and edges to create depth around the central text area.
- Soft haze or glow used sparingly; avoid constant bloom or flicker.
- Scroll movement should feel like a slow camera push-in.
- Existing GSAP choreography remains the motion foundation.
- Direct interactions use restrained ceremonial easing rather than elastic UI
  motion.
- Reduced-motion mode receives a calm static/fade treatment.

## Scene implementation decision

The initial architecture is hybrid:

### Static-first layer — available now

- Existing procedural SVG haveli artwork.
- Semantic Astro HTML for names, dates, navigation, and event details.
- CSS depth, gradients, shadows, and responsive framing.
- Existing GSAP parallax and section choreography.
- Static fallback for no JavaScript, reduced motion, and WebGL failure.

### 2.5D image layer — required before the polished opening

- `theme-a-hero-poster-mobile.avif`
- `theme-a-hero-poster-desktop.avif`
- Optional transparent foreground flower/toran layer.
- Optional courtyard and atmosphere layers.

These are the first assets to generate and approve because they establish the
board-level visual quality without requiring a 3D runtime.

### Real-time 3D layer — deferred

Use real 3D only for objects whose interaction benefits from it:

- carved doors;
- envelope and paper fold;
- wax seal;
- diya glow state;
- selected mandap depth.

Do not model every flower, stone, pillar, or architectural ornament in 3D.
Do not add model references until the files exist and have been inspected.

## Asset inventory and status

| Asset | Intended path | Phase 1 status | Next action |
|---|---|---|---|
| Hero poster, mobile | `public/assets/theme-a/hero-poster-mobile.avif` | Missing | Generate portrait candidate |
| Hero poster, desktop | `public/assets/theme-a/hero-poster-desktop.avif` | Missing | Generate wide candidate |
| Foreground floral layer | `public/assets/theme-a/hero-foreground-flowers.webp` | Missing | Generate only if poster needs depth |
| Courtyard layer | `public/assets/theme-a/hero-midground-courtyard.webp` | Missing | Generate only if layered 2.5D is approved |
| Sky / atmosphere | `public/assets/theme-a/hero-background-sky-landscape.webp` | Missing | Generate only if needed |
| Envelope | `public/assets/invitation-envelope.glb` or layered artwork | Missing | Produce after opening style is approved |
| Wax seal | `public/assets/wax-seal.svg` | Missing | Design after envelope direction is approved |
| Diya | `public/assets/theme-a/diya-brass.glb` or image layer | Missing | Use existing SVG fallback initially |
| Haveli entrance GLB | `public/assets/theme-a/haveli-entrance.glb` | Missing | Defer until a 3D asset is available |
| Door pair | `public/assets/theme-a/carved-door-left.glb` and right | Missing | Defer until a 3D asset is available |
| Mandap GLB | `public/assets/theme-a/mandap-courtyard.glb` | Missing | Defer until a 3D asset is available |
| Reference boards | `wedding-cinematic-two-theme-spec/assets/reference/` | Available | Use for visual comparison only |

## Existing code areas for the next milestone

- `src/components/sections/Hero.astro`: opening composition and responsive
  layout.
- `src/lib/art.ts`: procedural haveli and decorative SVG primitives.
- `src/components/scene/SceneDefs.astro`: shared gradients and SVG symbols.
- `src/components/scene/Garland.astro`: toran / hanging floral treatment.
- `src/components/scene/Diya.astro`: diya and flame states.
- `src/components/scene/Gate.astro`: gateway interaction structure.
- `src/scripts/story.ts`: scroll choreography and gateway behavior.
- `src/styles/tokens.css`: palette and motion tokens.
- `src/styles/global.css`: shared interaction and accessibility styles.

## Phase 1 acceptance result

- Existing routes and functionality are identified.
- Existing Royal Heritage fallback architecture is identified.
- The opening composition is specified layer by layer.
- Production assets and missing assets are separated.
- No application behavior was changed.
- No fake asset path was added.

## Next user action

Select **GPT-6.1 Sol, medium reasoning** for the next step and approve the
first asset batch:

1. mobile hero poster;
2. desktop hero poster;
3. one close haveli entrance establishing image;
4. one envelope / invitation concept;
5. one brass diya concept.

After approval, the next phase will generate or prepare those assets and build
the static cinematic opening. Do not generate the full asset library yet.

## Preserved project history

The following notes were already part of this file before the Phase 1 brief was
added and are preserved here for continuity.

### Stack decisions (verified 2026-10-23)

| Package | Version | Why |
|---|---|---|
| astro | 7.4.x | Static-first shell; Node ≥ 22.23 required (we run 24.14). |
| @fontsource/* | 5.3.x | Self-hosted WOFF2, per-weight/per-subset imports. Browser only downloads faces actually used. |
| gsap | 3.15 | ScrollTrigger scroll choreography; dynamically imported, skipped entirely under reduced motion. |
| @astrojs/react + @react-three/fiber + three | 7.1 / 9.8 / 0.186 — *Milestone 3* | `@astrojs/react` peers accept React 19, which R3F 9 requires. Installed only when the 3D island lands. |

Deliberately **no** UI framework, CSS framework or icon package.

### Existing architecture notes

- Locales are routes: `/` and `/hi/`, plus `/invitation` and
  `/hi/invitation`. The site works with zero JS and the language toggle keeps
  the current section hash.
- Content lives in `src/data/site-content.json`, with typed helpers in
  `src/lib/content.ts`.
- Procedural inline SVG is generated at build time in `src/lib/art.ts`. Shared
  symbols provide the permanent static/no-WebGL fallback.
- Hero layers use `data-layer="sky|sun|hills|palace|water|foreground|frame"`
  so parallax can be driven without restructuring.
- Map, countdown, and RSVP actions render only when configured with valid data.
- CSS ambient loops are gated by `prefers-reduced-motion: no-preference`.
- The menu uses native `popover` behavior and therefore works without JS.

### Existing asset-loading strategy

1. SVG poster paints first.
2. Generated hero art in AVIF can replace individual layers without changing
   the layout.
3. A future 3D island can be dynamically imported after first paint while SVG
   remains the fallback.

### Existing project rules

- Private project: no content, assets, or screenshots leave this machine unless
  the owner asks.
- No CDNs, analytics, embeds, or cloud generation should be added implicitly.
- The owner decides formal QA milestones.

### Existing progress record

- Static shell, tokens, fonts, EN/Hindi routes, menu, hero, reveal,
  celebrations, venue, conditional countdown/RSVP, closing, printable
  invitation, and action bar are implemented.
- Scroll story includes hero camera glide, gateway doors, petal burst,
  two-beat names, journey paths, staggered celebrations, venue settle, and
  closing sun.
- Diyas, closing peacock, journey jhoola, opt-in music, calendar generation,
  and vignette preview are implemented.
- Real names/dates/venue and monogram remain placeholders.
- Painted art layers, the 3D island, and tap-to-call contacts remain optional.

### Existing performance record

Measured 2026-10-23 on a 390×844 phone with 4× CPU slowdown and fast 4G:

| Metric | Before | After |
|---|---:|---:|
| Scroll smoothness | ~10 fps, 99% janky frames | 60 fps, 0% janky, worst frame 17 ms |
| Main thread while idle | ~97% busy | ~9% |
| English page transfer | 393 KB | 215 KB |
| First paint | 1.8 s | 1.5–1.7 s |
| DOM / transformed SVG nodes | 3,834 / 1,469 | ~1,900 / 77 |

Keep the existing performance rules: avoid mass transformed SVG nodes, define
heavy art once as symbols, animate wrappers instead of SVG internals, pause
off-screen loops, and load only the necessary font subsets.
