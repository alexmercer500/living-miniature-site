# Implementation Notes — Phase 1 Visual Reconstruction

> **2026-10-26: Royal Heritage retired.** Nature & Stories is now the only theme, at
> `/` and `/hi/`. The Royal pages, components, scripts, art and tests were removed
> (they remain in git history, last present in commit 4abfe05). Old `/royal/…` and
> `/nature/…` links forward to the matching Nature page. Earlier sections describe the Royal build and are kept for history.

## Nature & Stories — independent second theme (2026-10-25)

Fancier handoffs (2026-10-26, `development`), all scroll-driven, reversible and
invisible at both camera endpoints (`camera-flourish-state.ts`, `CameraFlourish.astro`):
candle-gold rim tracing the reveal edge (static SVG contour XOR-masks, flicker via
wrapper opacity only), petals and sparks lifting off the edge, a late-sun light
sweep, and near-foreground bougainvillea that pass the camera for depth (code-only;
true layered art would need segmented paintings). Elsewhere: the visible
envelope/Final Note card morphs into the invitation page (cross-document View
Transitions, `invitation-morph.ts`); hero tilt/pointer parallax (`tilt-parallax.ts`,
iOS asks on the lantern tap); a short seal-crack haptic (`haptics.ts`); and
per-chapter music moods incl. synthesised keherwa tabla and chimes (`music.ts`).
Rule kept: per-frame changes only on composited wrappers; never inside masked or
filtered layers (that re-rasterises them every frame).

Transition smoothness pass (2026-10-26, `development`): same poses, cheaper frames.
- Reveal: the feathered edge is a static mask on a 125%-tall layer that moves by
  transform while its camera counter-moves (`wipe`/`counter` in
  `hero-journey-state.ts`); no mask/clip-path string is regenerated per frame.
- Cameras write `transform`/`opacity` on each layer, never inherited custom
  properties on `<main>` or the bridge (those restyled both foliage `<use>`
  clones every frame). `style-writer.ts` skips unchanged writes and restores.
- One shared glide (`scroll-glide.ts`, the former `scrub: .85` expo-out as
  exponential smoothing) drives every camera, so neighbouring handoffs can't
  overlap or snap at boundaries; jumps over 1.5 screens land at once.
- Bridge art is `decode()`d before use; `will-change` only while a camera is active.
- Envelope: ARIA/label text written only on change (was every frame, forcing
  layout and `html:has()` re-matching); variables skip unchanged values.
- Chapters use `svh` (stable while mobile browser bars hide/show; `dvh` resized
  every chapter mid-gesture and left scroll ranges stale). Full-bleed art,
  shades and fixed cameras use `lvh` so their crops match exactly.
- Lantern flame and festoon bulbs animate as whole `<svg>` boxes (compositor),
  not SVG children; the final-note shadow sits inside its breathing wrapper.
- Header/dock backdrop blur removed (≥90% opaque, re-blurred the scene per frame).
- Mobile `.ns-events` no longer has vertical overflow capturing page swipes.
Measured, 390×844, 4× CPU slowdown, wheel gestures: handoff median frame time
33–117 ms → 16.7 ms on the first five handoffs. Mid-transition screenshots match
the previous build (mean pixel difference ≈1/255). Real-device check still needed.

All-chapter scroll flow (2026-10-26): the approved Hero/Journey camera is retained
and five later unpinned cameras reuse its feathered reveal and timing, through
the Final Note. `SceneBridges.astro` contains only inert decorative Art/Foliage;
`scene-transitions.ts` coordinates a single active background pair and isolated
incoming UI transforms. `scene-transition-state.ts` shares the first camera's
pure state math and defines restrained staggered arrivals. The envelope exit
range is its last viewport, after the existing opening track. No new pins,
scroll distance, wheel/touch interception or independent couple-name reveal.
The old timed entrance observers and competing later background parallax were
removed from `nature.ts`; wind/hover/tap/modal controllers are unchanged.
`nature.css` shares original/bridge scene grades and shades, hides only actual
backgrounds while a pair is active, and restores them at endpoints. Nearby-only
low-priority decorative prefetch uses the existing URLs/cache. No-JS/reduced/
failed-art fallback, fast-jump and focus readability, explicit teardown and
single-owner snap scope are retained. The Nature-only Envelope shade reads a
variable with its previous gradient as fallback; its shared animation controller
and Royal behavior are unchanged. Tests now sample intermediate scroll positions
before asserting fully readable anchor states, instead of waiting for autoplay.
Validation: 13-route production build, 33 unit/static checks, 131 later handoff
checks, 28 original first-handoff checks, 61 scene-specific checks, full mobile
smoke (seven scenes plus touch/keyboard/locale/print), 16 route/deep-link checks
and 20 Nature envelope phase checks all pass. Desktop/mobile intermediate and
resting screenshots inspected; short Hindi, tablet, reduced motion, no JS,
blocked art and runtime preference cleanup covered. Only the nearby camera is
prepared at the top; unprepared copies stay display:none so their viewport
placement cannot cause premature native lazy loading. No runtime exceptions,
broken SVG targets or horizontal overflow found in these checks. Real-device
Safari/Android smoothness remains unverified. Temporary preview/Chrome are
closed after QA; use `npm run dev` for local review.

Hero → Journey cinematic-flow pilot: new `hero-journey-state.ts` defines pure,
bounded camera/mask/heading/path/keepsake poses, sampled from one scroll value.
`scripts/hero-journey.ts` owns one unpinned ScrollTrigger across the first viewport
with 0.85s scrub. The existing first two 100dvh sections, all real copy and anchor
positions stay in document flow. `HeroJourneyBridge.astro` adds only an inert,
pointer-transparent, behind-content decorative camera that reuses approved Art
URLs. A soft three-gradient botanical reveal is preferred, with an organic
polygon fallback; subtle pre-existing foliage symbols are reused unchanged.
The bridge is visible only during the handoff, and original background layers
return at both endpoints. Fast jumps force completed content poses immediately.
Proximity snap is disabled only for this continuous segment and released exactly
at Journey's anchor, not left active across subsequent scenes. The old hero/
Journey camera/path and memory entrance tweens were removed to avoid competing
transform owners. Keepsake wind, hover and modal interaction controllers remain.
Loading is lazy in SSR; only motion-enabled clients promote decorative images
to eager/low-priority loading. Enhancement is gated by image readiness and CSS
support, and cleanups restore image attributes, inline memory styles, root vars,
path style and scroll-scope flags. Reduced-motion/no-JS/failed-image cases keep
the original readable sections; no wheel/touch scroll hijacking or added track.
Mobile hides decorative carousel chrome and disallows nested vertical scrolling
while retaining horizontal swipe and keyboard focus. No source art, Royal,
content data, routes, packages or deployment changes. Build: 13 routes; 29 unit/
static tests and 28 focused transition checks pass; existing keepsake/modal suite
passes 15. Reverse/hold/fast-jump, initial/resting/intermediate desktop/mobile,
short Hindi, tablet and preference-switch cleanup verified. Generic smoke test's
former "small wheel must snap back" assertion now checks intentional continuous
Hero/Journey scroll, rather than fighting the new scroll-driven choreography.
The complete mobile smoke passes: seven scenes, envelope open/close, touch,
navigation, locale and printable invitation. The prior envelope controller and
its separate snap-state implementation were not changed by this pilot.
All 16 primary/secondary/legacy route, direct-hash and locale checks also pass.

Final Note hybrid revision: new `nature/FinalNote.astro` replaces the Nature
inline closing copy while retaining the exact original closing desktop/mobile
art. Royal's reference card guides the clipped ivory silhouette, double antique
gold frame, rose/botanical corner accents, centred with-love/names and diamond
ornament. Reuses the existing Royal `ivory-floral-paper-v1.png` at the same
optimized WebP URL as the envelope, cropping away the embossed outer border to
retain subtle paper fibres. No source art or shared Royal component was changed.
All semantic names, bilingual approved closing text and Nature epilogue remain
real HTML. Full-invitation and back-to-beginning links preserve locale/targets.
Nature GSAP reveals the whole note over 1.8s with restrained perspective/back
easing; a single 2.4s travelling border glint fades out. No per-name/text reveal
or delayed lettering. Independent 9s CSS float and six sparse particles pause
offscreen/hidden; reduced-motion/no-JS are complete static compositions. Short
landscape places header beside the note so both links fit above the dock.
Build passes 13 routes; 24 unit/static tests and 13 focused Final Note checks
pass. Checks include intermediate entry, names printed from outset, SVG/anchor
references, EN/Hindi, 320px/short/landscape/tablet/wide layouts, native keyboard
navigation, reduced-motion, no-JS and blocked-art fallback. Desktop, mobile,
short Hindi and landscape screenshots visually reviewed. No packages, personal
data, endpoints or deployment changes.
Seven-section mobile smoke and all 16 theme/locale/deep-link checks pass as well.

Wishes reference redesign: `nature/Wishes.astro` replaces Home's inline wishes
section. Added paired `wishes-desktop-v1.png` / `wishes-mobile-v1.png` environment
art through built-in image generation, with exact prompts/provenance recorded in
`src/assets/nature-stories/README.md`. Existing Art component emits responsive
AVIF/WebP. All six tag faces, text, eyelets, cords and ropes are live HTML/SVG/CSS,
not baked artwork. Three existing blessings plus three generic bilingual wishes;
visible decorative-not-guest-submissions label. No new personal details, backend,
packages or data changes. Existing RSVP/date configuration remains authoritative.
Nature GSAP reveals whole tag/cord assemblies over 1.6s with 180ms stagger and
gentle back easing. Independent 7.7–10.6s CSS wind pivots and a bounded 1.8s WAAPI
tap/keyboard flutter avoid transform conflicts. Repeated taps snapshot the current
pose. Motion-query change cancels tap motion; root/offscreen/visibility handling
pauses ambient work. All observers/listeners/timers/animations are cleaned up.
Desktop six-across and mobile/portrait-tablet two-by-three layouts fit one viewport, including
short Hindi and landscape. Browser-only configured-RSVP/countdown fixtures caught
and fixed an overlap on short phones; no fixture data is shipped in the page.
Build passes 13 routes; 23 unit/static checks and 17 focused wishes checks pass,
including stagger, intermediate frames, keyboard/tap, continuity, wind, reduced
motion, no-JS, blocked art and configured-layout fixtures. Screenshots reviewed.
Seven-section mobile layout smoke and all 16 theme/locale/deep-link checks pass.
Broad desktop/mobile scripts still hit the known envelope-active/snap assertion
after a synthetic jump from closing to hero. This pre-existing issue was not
changed as part of the Wishes scene and remains open.

Venue reference redesign: new `nature/Venue.astro` uses the existing traditional
garden/pavilion artwork behind an editorial chapter header and visible venue
details. Three actual HTML signs have chipped/arrow ends, layered wood grain,
etched borders, nail details and a shared timber post. Their GSAP entry is
scroll-visibility-triggered, softly spring-settled over 1.6s with 200ms stagger;
background drift and fine-pointer hover lift stay subtle. A native framed
illustration preview is enhanced by `scripts/venue.ts`: 900ms soft entrance,
320ms exit from the current pose, Escape/backdrop dismissal, focus restoration
and scroll lock. The original printable-details link remains the no-JS or
unsupported-dialog fallback. Real map/directions links are gated by the existing
map configuration; empty maps show two disabled signs and a localized note.
Placeholders, bilingual routes, Royal and all other sections are unchanged.
CSS handles single-screen portrait and short landscape separately. Removed
the old Venue panel rules rather than stacking another panel override. The
13-route build, 22 unit/static checks and 13 focused venue checks pass. Browser
screenshots reviewed on desktop, mobile, short Hindi, landscape and preview;
reduced-motion/no-JS verified. General QA now ignores lazy images inside closed
dialogs and checks map gating in the new sign navigation. The broad mobile
interaction test passed on rerun after an existing intermittent scroll-snap
timing failure (stale envelope-active during a synthetic jump back to hero).
This unrelated envelope behavior was not changed. Desktop/mobile smoke checks
(14 scenes plus interactions) and 16 theme/legacy/deep-link/locale checks pass.

Celebrations reference redesign: new `nature/Celebrations.astro` replaces the
Home inline section. Uses a dark, dusk-graded existing garden backdrop, warm
festoon lights, compact chapter heading and portrait ceremony cards with 22px
corners, fine gold/inset rims, curved SVG parchment edges and a four-diamond
ornament. Parchment caption heights align on desktop while short screens remain
content-adaptive. Existing three event records/artwork, English/Hindi text,
placeholder dates and conditional calendar buttons are preserved. No additional
events/dates, packages or fabricated personal data. Nature GSAP now reveals the
entire card (rise/soft rotation/fade, 1.35s, desktop 160ms stagger), with a 1.7s
image settle and visibility-triggered mobile slides. Observers disconnect on
motion-query cleanup; reduced-motion/no-JS have readable static cards. Scene
remains one viewport tall. Build passes 13 routes; all 21 unit/static tests and
18 dedicated ceremony checks pass, including actual stagger/intermediate frames,
mobile, wide desktop, short Hindi, reduced-motion and no-JS. General page and
deep-link regressions pass; screenshots visually reviewed.

Journey spacing/transition refinement: widened the hanging layout to a responsive
1480px maximum with 300px mounts, larger gaps and varied cord lengths; mobile
retains horizontal swipe with increased separation. Frozen 80ms opening frames
reproduced clipping from dialog overflow:auto. The dialog now allows the moving
frame outside its centered bounds, with content overflow handled inside the
frame. Source geometry is captured before focus/scroll-lock changes; the inline
source hides during expansion, the moving paper stays opaque and the backdrop
fades in. Interrupted closing snapshots the current transform/opacity before
cancelling the opening animation, eliminating a full-size jump. Added
`tests/keepsake-transition-browser.mjs` to freeze opening frames and verify exact
interruption continuity on desktop/mobile. Build, all 21 unit/static tests,
15 keepsake/modal checks and a mobile scene regression pass. Screenshots reviewed.

Journey keepsakes revision: existing symbolic items moved to
`nature/Keepsakes.astro`. Cards have curved rope segments, individual cords,
wooden clips, varied heights, tilted photo mounts and independent wind pivots.
GSAP scrubs a staggered hanger reveal; hover lifts/straightens the card without
competing with sway or reveal transforms. Mobile retains horizontal swipe and
the chapter remains one viewport tall. `scripts/keepsakes.ts` adds native modal
dialogs with card-origin opening/return animations, focus containment, background
inertness/scroll lock and close/Escape/backdrop dismissal with focus restoration.
Reduced motion is instant; no-JS content remains readable inline. Modal photos
reuse current art with an optional Art.sizes override for appropriate resolution.
No packages, invented biography or personal photos were added. Verification:
13-route build, 21 unit/static tests, 15 dedicated keepsake/modal/fallback checks,
14 desktop/mobile scene/layout checks plus interactions, and 16 direct-link/
locale checks pass. Reviewed desktop/mobile/short-Hindi card and modal screenshots.

Hero motion polish: `HeroLantern.astro` adds independent foreground SVG artwork
using the existing shared brass/glass/flame gradients; baked-in image lanterns
are unchanged. Native CSS animates a gentle 7.5s pivot and low-amplitude flicker.
The existing lantern toggle/ARIA/keyboard/touch interaction remains. Hero text
uses a first-paint, whole-line stagger (soft rise, short blur and subtle settle),
lasting about 2.45s. This avoids bundle-gated invisible content and preserves
Hindi shaping. Scrolling away marks the intro complete instead of re-hiding it.
`HeroAtmosphere.astro` supplies 24 bounded petals/blossoms/motes, halved on mobile,
with a masked quiet copy corridor and no pointer interaction. Ambient loops
pause offscreen and on tab visibility changes; reduced motion is static. No-JS
copy and decorative lantern remain visible without interactive/looping effects.
Motion's public stagger example and hero description informed timing only:
https://motion.dev/examples/js-stagger-from-edges and
https://motion.dev/examples/vue-hero-stagger. No Motion package or paid source is
used. `tests/nature-hero-browser.mjs` verifies five viewport/fallback cases,
settled copy, actual sway, offscreen pause, bounded particles and SVG references.
Verification passes: 13-route production build, 21 unit/static tests, five hero
browser cases, seven mobile scene/layout plus interaction checks, and 16 direct
link/locale regressions. Desktop/mobile/short-Hindi screenshots visually reviewed.

Latest envelope revision: owner requested scroll control instead of autoplay.
Nature now shares the deterministic scroll controller with Royal, using a longer
2,800–4,400px track while keeping its sticky visual stage at one viewport. This
is the sole intentional exception to the one-screen section document height.
The 1.8s scrub and existing damped lift/flap/presentation springs provide smooth
reversible motion. Closed/rest and readable end holds reserve 4% / 16% of travel.
No names are animated or delayed. Tap/keyboard follows the same scroll path at
8s open / 4.5s close; wheel/touch/navigation keys can interrupt it. Proximity snap
is disabled inside this chapter's active scroll range and restored outside it.
Reduced-motion/no-JS keep one-screen open-card fallbacks, with no long track.
Earlier entry-autoplay notes below are historical and superseded by this change.
Verification: 13-route production build, 21 unit/static tests, 20 Nature envelope
phase checks, 6 Royal mobile regressions, 16 direct-link/locale checks and 7 mobile
scene/layout plus interaction checks pass. A 1,000px wheel gesture stays pinned,
advances the lift and does not skip the entire reveal. Reviewed desktop/mobile
screenshots for resting, lifted and extracting poses; names remain preprinted.

Primary-route revision: Nature is now `/` and `/hi/`, with Nature invitations at
`/invitation` and `/hi/invitation`. Royal is preserved at `/royal` and `/hi/royal`,
with its own `/royal/invitation` and `/hi/royal/invitation`. Explicit `royalHref`
keeps Royal menus, locale switches, actions, envelope and print return links in
their own theme. Nature comparison links point to Royal. The old `/nature` URLs
remain compatible rendering aliases with primary canonical/alternate URLs.
Nature overrides the shared 60px root scroll-padding with zero and uses gentle
vertical proximity snapping, so native anchors and small scroll gestures settle
on the full viewport rather than exposing the neighboring chapter. This applies
only to Nature home pages, not printable pages or Royal's sticky sequences.
Screenshot review also identified the visible bottom strip as the following
scene's scaled parallax artwork overflowing its own section. Nature sections
now clip at their viewport boundaries, while Wishes retains internal scrolling.
Direct-load tests reproduced the screenshot's stale `#venue`/hero mismatch.
Nature now waits for fonts and animation initialization, resolves the original
hash once (unless the guest has already interacted), then enables proximity
snapping. No-JS pages keep native fragment navigation without snap initialization.
This preserves scroll/touch control during startup and does not change Royal.
Verification: production build passes all 13 routes; 20 unit/static tests,
91 scene/layout checks, 16 primary/secondary/legacy direct-link and locale checks,
6 Royal mobile envelope checks, and a final 7-scene mobile interaction run pass.
Internal href targets and canonical URLs are validated across both themes.

Single-screen revision: all seven Nature home sections now use `100dvh` (fallback
`100vh`), with header/dock safe spacing, shorter-screen typography, mobile native
horizontal keepsake/event collections, an overlaid venue card and internal
overflow for wishes/venue details. Printable invitations and Royal are unchanged.
The Nature envelope no longer allocates a multi-screen sticky scroll track:
its same poses run slowly in place on entry, pause when offscreen, and reverse
with tap/keyboard. Royal's existing scroll controller path remains intact.
The browser harness now verifies every section's height and heading bounds,
visits every horizontal slide, and exercises in-place opening/closing. All 91
scene/layout cases, 20 Nature envelope phase checks, 6 Royal mobile envelope
regressions and 16 unit/static tests passed; production builds nine routes.

Latest revision supersedes the scroll-letter description below: the owner
requested the first theme's envelope and animation instead. Nature now reuses
`sections/Envelope.astro` with optional Nature variant, backdrop slot, section
ID and destination links. Royal Heritage defaults remain unchanged. The Nature
garden tabletop is retained, along with its responsive image/error fallbacks.
The old Nature scroll markup, animation controller and paper/rod styles were
removed. The shared envelope uses its established spring lift, glowing seal,
hinged flap, slow card extraction and foreground presentation. Names are printed
from the outset. Header measurement now supports either theme's header selector.
Nature shortcuts hide while the envelope is in view, and Continue leads forward
to Celebrations rather than back to Journey. Tests were updated for the envelope.

Envelope revision verification: production build passes for all nine routes;
20 Nature envelope phase checks and 6 Royal mobile regression checks pass.
Nature mobile passes 7 scene/layout checks plus interaction/locale/invitation
checks, and all 16 unit/static tests pass. Desktop, mobile and short Hindi
screenshots were visually reviewed, including extraction and open-card layering.

Owner explicitly authorized the full second theme, asset generation through
implementation, without intermediate approvals. `nature-plan.md` records the
plan, scope, files and test status. Royal Heritage and its existing routes,
source artwork, scene components and shared content were preserved.

New URLs: `/nature/`, `/hi/nature/`, `/nature/invitation/`, and
`/hi/nature/invitation/`. Original home/invitation routes remain Royal Heritage.
The only shared shell change is optional theme/canonical-path inputs in Base,
whose defaults preserve the original rendering and metadata.

Thirteen text-free artworks were generated using the built-in image tool from
the RIGHT Nature & Stories / A Journey Together panels of the two supplied
boards. Five paired environments (hero, symbolic journey, empty letter table,
venue garden and closing terrace) plus three ceremony vignettes are stored in
`src/assets/nature-stories/`, with exact prompts/provenance in its README.
Visuals share flowering tree, Indian garden, peach sunset, river valley, brass
lanterns, traditional textiles and dimensional cinematic treatment. Forbidden
domed/Mughal/Moorish imagery was excluded. No board screenshot, personal photos,
invented biography, real-venue likeness or fake 3D model is used.

The isolated components/style/controller build an entire scene sequence:
opening and lamp/petal interactions; scroll-following path and selectable
illustrated keepsakes; CSS paper scroll with separately moving rods and ribbon;
three event cards using existing content/calendar gating; venue/map gating;
decorative hanging wishes and conditional RSVP/countdown; sunset closing.
Letter interaction synchronizes scroll and keyboard/native click; automatic
travel cancels on wheel/touch/navigation and remains reversible. Essential
headings/names/details have no delayed text reveal. Natural document scrolling
is retained, with one bounded sticky letter section. Reduced-motion/no-JS
delivery renders a fully unfurled readable invitation. Script-only controls
are disabled/hidden until available. No new dependencies or WebGL were added.

Nature header has native no-JS menu, locale links that retain the scene,
theme-comparison link, opt-in existing audio player and 44px controls. Floating
shortcuts hide during the letter to avoid overlap. Nature printable invitation
retains all family/host/date placeholders, event calendar behavior, conditional
directions/download links, separate print styling and localized back links.
No fake RSVP/wish submission is implemented; wishes are labelled decorative.

Production images use Astro responsive AVIF/WebP and lazy loading below the
eager hero; source PNGs are not production requests. Inline SVG landscape
fallbacks remain behind each picture. No-JS CSS backgrounds fail transparently
without broken-image glyphs. GSAP animation is theme-local, honors live motion
preference, and cleans up timelines/listeners on page exit/hot disposal.

Build: all nine routes pass. Static route/assets and existing envelope state
tests pass. Browser coverage lives in `tests/nature-browser.mjs`, with ignored
screenshots/results under `.astro/nature-qa/`. Desktop/mobile/Hindi scenes,
letter states, decorative wishes, image failures and print layouts were visually
inspected. `nature-plan.md` records the final expanded QA results.

Limitations: content, venue/maps, wedding date and RSVP remain existing
placeholders; live external workflows cannot be exercised until configured.
Keepsakes are symbolic until approved personal photos are supplied. Swing and
peacock remain illustrated scene details. Physical iOS/Android, audio hardware,
real printer and network-throttled performance still need device review.
Nothing was deployed and no dependency was installed.

## Venue integration — 2026-10-25

Owner approved the portrait entrance and requested implementation. Added a wide
companion with the built-in image tool, referencing only the approved portrait.
Both production source PNGs are in `src/assets/royal-heritage/venue-{mobile,desktop}-v1.png`.
Exact prompts, provenance and visual inspection are in the candidate
`VENUE_STUDY.md`. These depict an invented haveli, not an actual venue likeness.

`Venue.astro` renders art-directed 2:3 portrait / 1672:941 wide AVIF/WebP sources,
lazy loading and explicit dimensions. AVIF variants range about 69–225 KB.
The source PNGs are not requested by production pages. Original SVG architecture,
lanterns and reflection remain underneath as loading/error fallback; failed
pictures hide when JavaScript is available. Without JavaScript, a noscript CSS
background supplies the still artwork and fails transparently to the SVG,
avoiding the native broken-image icon. The maroon HTML venue card overlaps only lower paving/shade,
leaving the entrance clear. Names/address and map configuration are untouched.
No new map URL or fake 3D tour was added.

The only story-controller change points the existing venue settle animation
at the picture when present, with restrained 2.5% scale and the same ScrollTrigger
timing. The venue card entrance remains unchanged. No shared symbols, other
scene source files, dependencies or deployment settings were changed this step.

Verification: production build passes (five routes), six envelope state tests
pass, and `git diff --check` passes. `tests/venue-browser.mjs` passes 12 cases:
320/360/390/430/768/1024/1440px, portrait tablet, Hindi, reduced motion, no JS,
and blocked venue images with/without JS. Checks include responsive source
selection, semantic content, current map gating, no clipped copy/overflow,
resolved SVG references, card re-entry after reverse scroll, and no runtime
exceptions. Desktop/mobile/Hindi/tablet/no-JS fallback screenshots inspected
under ignored `.astro/venue-qa/`.

Limitations: real venue data and map URL remain placeholders; configured-map
navigation was not exercised because no URL is configured. Physical-device
Safari testing remains outstanding. Owner reviews the implemented Venue before
work moves to Closing.

## Celebrations integration — 2026-10-24

The owner approved the haldi sample and authorized the matching evening and
wedding-mandap art plus integration. Built-in image generation produced two
companion sources using the approved haldi as reference; exact prompts and
provenance are in `design-kit/assets/royal-heritage/candidates/CELEBRATIONS_STUDY.md`.
Production sources are `src/assets/royal-heritage/celebrations-{haldi,evening,wedding}-v1.png`.

`Celebrations.astro` maps existing visual keys to responsive 360/640/900px
AVIF/WebP images, with lazy loading, explicit dimensions and empty decorative
alt text. Unknown visual keys retain their existing SVG. All procedural art
remains under the raster layer for loading/error fallbacks; failed pictures
are hidden when JavaScript is available. No-JS blocked-image fallback was
also visually verified. The native image error glyph does not obscure the SVG.

Three stepped haveli frames sit in a desktop row and stack on phones. Event
details remain semantic, localized HTML in warm maroon panels. Existing event
records and calendar components/scripts are unchanged; placeholder dates still
do not produce calendar controls. No ceremony dates or titles were invented.
The existing GSAP event entrance and reduced-motion behavior remain intact.
ArchFrame, Vignette, shared symbols, story controller and all other scene source
files were left unchanged. No dependencies or 3D runtime were added.

Validation: production build passes for five routes; `git diff --check` passes.
`node tests/celebrations-browser.mjs` passes 33 event checks across 320, 360,
390, 430, 768, 1024 and 1440px, Hindi, reduced motion, no JavaScript and actual
blocked images with/without JavaScript. Checks cover loaded optimized artwork,
preserved titles/descriptions/date placeholders, calendar gating, completed
entrances, copy bounds, horizontal overflow, resolving SVG references and zero
runtime exceptions. Desktop/mobile/Hindi/fallback screenshots were inspected
in ignored `.astro/celebrations-qa/`. Six envelope state tests still pass.
Physical-device Safari testing remains outstanding. Valid-date calendar download
behavior was not re-exercised because the current data has no configured dates.

Next: owner reviews the integrated Celebrations section. Venue and Closing are
not part of this implementation and must await the next approval.

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
