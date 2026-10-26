# Nature & Stories — complete second theme

> **2026-10-26: Royal Heritage retired.** Nature & Stories is now the only theme, at
> `/` and `/hi/`. The Royal pages, components, scripts, art and tests were removed
> (they remain in git history, last present in commit 4abfe05). Old `/royal/…` and
> `/nature/…` links forward to the matching Nature page. References below to Royal routes and regression checks are historical.

Owner authorization (2026-10-25): independently plan, generate assets, implement
the entire second theme and verify it without intermediate approval gates.
This supersedes the per-scene approval gates for this theme only. Royal Heritage
and its routes remain intact; no existing source art or data is replaced.

## Routes and architecture

- `/`, `/hi/`: primary Nature & Stories English/Hindi experience.
- `/invitation/`, `/hi/invitation/`: Nature printable invitation.
- `/royal/`, `/hi/royal/`: secondary Royal Heritage experience, with matching
  `/royal/invitation/` and `/hi/royal/invitation/` print pages.
- Legacy `/nature/` and `/hi/nature/` home/invitation routes still render Nature;
  their canonical, language and navigation links now target the primary URLs.
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

Latest all-chapter flow (2026-10-26): extend the approved first handoff through
Journey -> Invitation -> Celebrations -> Venue -> Wishes -> Final Note.
`SceneBridges.astro` and `scene-transitions.ts` add five inert, behind-content
cameras using the same approved artwork, soft feathered mask, restrained edge
foliage and 0.85s scrub. The first Hero/Journey implementation is preserved.
Each later camera spans the last viewport before the target anchor, with no
new pin, track or scroll interception. The Invitation exit begins only after
the envelope's long opening track has finished. Scene headings, celebration
cards, venue signs, wishes and final card now follow the same reversible scroll
coordinate instead of independent timed entrance observers. Inner wind, hover,
tap, keyboard and modal owners remain independent. Fast jumps and native focus
force readable poses; names never have an independent reveal.
Shared background grading/shade variables keep actual art and camera copies
consistent at endpoints. Original backgrounds return at exact anchors. Only
nearby decorative pairs are promoted from lazy to low-priority eager loading;
failed art, no JS and reduced motion retain original sections. Preference/HMR
cleanup restores styles, image attributes, listeners and snap-scope flags.
No source images, personal content, Royal behavior, routes, dependencies or
deployment configuration change. One shared Envelope CSS variable is scoped
to Nature and retains its previous gradient fallback.

Verification for this extension: production build succeeds for 13 routes;
33 unit/static checks; 131 later-scene camera/reverse/hold/fast-jump/focus/
fallback checks; 28 original Hero/Journey checks; 61 existing celebration,
venue/modal, wishes/flutter and closing-card checks; full seven-scene mobile
smoke with touch/keyboard/locale/print interactions; 16 route/deep-link checks;
and 20 Nature envelope phase checks all pass. Desktop/mobile transition and
resting screenshots were inspected in Chrome, including short Hindi/tablet
coverage and reduced-motion/no-JS/blocked-art variants. `git diff --check`
passes. Real-device Safari/Android performance remains a device review item.
Screenshots: ignored `.astro/scene-transitions-qa/` plus existing scene QA folders.

Files for this extension: new `src/components/nature/SceneBridges.astro`,
`src/scripts/scene-transitions.ts`, `src/lib/scene-transition-state.ts`;
updates to Nature Home, controller, stylesheet and the Nature-only shared
Envelope shade. New state/browser tests plus updated static and four existing
scene entrance tests reflect scroll-driven arrivals. This plan and
`IMPLEMENTATION_NOTES.md` record the implementation; earlier uncommitted work
is preserved.

Previous Hero → Journey pilot: one reversible GSAP scroll coordinate now controls
the first handoff, replacing the independent hero camera, Journey camera/path
and keepsake entrance controllers. `HeroJourneyBridge.astro` is an inert,
decorative fixed camera only; both actual sections remain in normal flow at
exactly one dynamic viewport each. Original artwork, names, story copy, routes,
skip links, hover/wind and native keepsake dialogs are retained. The hero camera
pushes gently forward while the garden appears through a feathered botanical
mask, with a polygon-mask fallback and restrained edge foliage. Heading, path
and keepsakes settle into a calm end pose; reversing scroll recreates each pose.
Scrub catch-up is 0.85s, no pin, added scroll track or wheel/touch interception.
Proximity snapping is suspended only before Journey arrives, then relinquished
at its exact anchor. Fast anchor/deep-link jumps render a fully readable endpoint
immediately, without waiting for the scrub. New `hero-journey-state.ts` is pure
and unit tested. The camera enables only after both approved images load; only
motion-enabled clients prefetch the decorative pair at low priority, sharing
the existing asset URLs/cache. Reduced-motion, no-JS and failed-art retain the
original sections, with explicit observer/style/listener/attribute cleanup.
Build passes all 13 routes; 29 unit/static checks and 28 focused transition
checks pass, including intermediate/held/reverse poses, direct jumps, 320px Hindi,
tablet/mobile/desktop and preference-switch cleanup. Native keepsake regression
suite passes 15 checks. Desktop/mobile intermediate and resting screenshots
reviewed. Full mobile smoke (seven scenes plus envelope/navigation/touch/print
interactions) also passes with the intentional free-scroll assertion. This is
the Hero → Journey pilot only. All 16 primary/secondary/legacy route, direct-hash
and locale checks pass. Later scenes, Royal, packages,
source art, site data and deployment configuration are unchanged.

Latest Final Note revision: `nature/FinalNote.astro` keeps the original Nature
closing terrace, chairs, river, sunset and peacock artwork unchanged, with a
Royal-reference-inspired ivory stationery card over the sky. The frame has
clipped corners, double gold rules, restrained rose/botanical corner accents,
small gold pins and the existing Royal paper material cropped to its blank
fiber centre. Real EN/Hindi names, with-love line, closing message and Nature
epilogue remain HTML. Invitation/back-to-beginning links remain real links.
The card arrives as one object (1.8s soft perspective/spring settle), with a
single gold-edge shimmer; names never have a separate hidden/reveal state.
A 9s, 5px-range idle float and six sparse petals/motes pause offscreen/hidden.
All motion is omitted for reduced-motion/no-JS guests. The scene remains one
dynamic viewport, including portrait/landscape/short Hindi layouts. No new
assets, packages, Royal source or deployment changes. Build: 13 routes;
24 unit/static checks and 13 focused Final Note composition/reveal/printed-name/
keyboard-link/fallback checks pass. Desktop, wide, tablet, mobile, short Hindi,
landscape, reduced-motion, no-JS and blocked-art views checked.
Seven-section mobile smoke and all 16 theme/locale/deep-link checks also pass.

Latest Wishes revision: replaced the three plain cards with an isolated
`nature/Wishes.astro` lantern-garden scene. Two new text-free, built-in-generated
desktop/mobile backgrounds are saved as `wishes-{desktop,mobile}-v1.png`;
exact prompts/provenance are in the artwork README. Six live parchment tags
have clipped corners, punched eyelets, individual cords and an overhead rope.
Original three blessings are preserved, with three additional generic EN/Hindi
blessings; no guest identities or submissions are fabricated. Tags arrive in
180ms steps with 1.6s pendulum/spring settles, then sway independently over
7.7–10.6s. Hover gently lifts; keyboard/tap adds a bounded 1.8s flutter and warm
highlight. Repeated taps retain the current pose; reduced motion cancels flutter.
Ambient lantern glow and six sparse drifting petals/motes pause offscreen or
when the document is hidden. Mobile/portrait tablets use two rows of three; desktop uses six
across, all in one dynamic viewport. Optional RSVP/countdown gating is retained,
with compact short-screen layouts tested using browser-only fixtures; no service
or real form was added. Reduced-motion, no-JS and blocked-art fallbacks verified.
Build: 13 routes; 23 unit/static checks and 17 focused wishes browser checks pass.
The seven-section mobile layout smoke check and 16 theme/locale/deep-link checks
also pass.
Desktop, tablet, mobile, short Hindi, landscape and configured-layout screenshots
visually reviewed. Broad 390/1440 smoke tests reproduced the previously documented
envelope-active/snap assertion after jumping from closing to hero; the unrelated
envelope controller is unchanged and this issue remains open.

Latest Venue revision: extracted `nature/Venue.astro` and replaced the floating
ivory panel with a full-screen garden arrival, compact chapter heading, visible
venue name/address and three chipped-edge, wood-grained HTML wayfinding signs.
The existing compliant sandstone garden artwork is retained; no domes or new
assets/packages. Signs enter in 200ms steps over a 1.6s soft spring settle,
with restrained hover lift and the existing scroll-linked background drift.
Explore opens a gold/ivory framed native dialog (900ms entrance, 320ms exit),
with Escape/backdrop dismissal, focus return, scroll lock and interruption-safe
closing. Without JS the link opens the printable venue details. Both map signs
remain disabled with an EN/Hindi explanation until `venue.mapUrl` is configured.
One-viewport desktop/mobile, short Hindi and phone-landscape layouts verified;
reduced-motion and no-JS stay static/readable. Build passes all 13 routes;
22 unit/static tests and 13 dedicated venue checks pass. Desktop, mobile,
short-Hindi, landscape and framed-preview screenshots visually reviewed.
Both desktop/mobile general smoke checks (14 scenes plus interactions) and
16 primary/secondary/legacy deep-link and locale checks pass.
The broad mobile interaction smoke test passed on rerun after an intermittent,
pre-existing envelope-active/scroll-snap timing assertion; no envelope changes
were made in this venue-only revision.

Latest Celebrations revision: replaced the pale arch-topped layout with a
reference-led dark garden/festoon composition and compact gold-rimmed portrait
cards. Small rounded corners, inset gold lines, curved parchment captions and a
four-diamond ornament match the board's card treatment. Existing event artwork
is retained, with the existing closing garden art reused under dusk grading.
The three configured events, bilingual labels/descriptions, date placeholders
and conditional calendar actions are unchanged; no fourth event/date invented.
Complete cards enter with a 1.35s rise/soft turn/fade, 160ms desktop stagger and
1.7s image settle. Per-card visibility handles horizontal mobile entry. Reduced
motion/no-JS remain readable and static. The scene stays one viewport tall.
Verification: 13-route build, all 21 unit/static tests, 18 dedicated ceremony
card/reveal/layout/fallback checks, desktop/mobile/short-Hindi scene checks and
16 deep-link/locale checks pass. Desktop/mobile and short-Hindi screenshots reviewed.

Latest spacing/transition refinement: Journey cards now use a wider responsive
layout (up to 1480px), capped 300px mounts, larger gaps and varied cord lengths.
Mobile keeps swipeable cards with more separation. Frame-by-frame QA reproduced
the modal hitch: the centered dialog's overflow:auto clipped the travelling
frame (about 52px at the early desktop sample). Overflow is now visible on the
dialog; tall content scrolls inside the moving frame instead. Opening snapshots
the source before focus/scroll-lock changes, keeps the moving paper opaque and
hides its inline duplicate. The backdrop fades in, and interrupted closing starts
at the current visual pose rather than snapping to the fully-open pose.
Verification passes: 13-route build, 21 unit/static tests, 15 keepsake checks,
desktop/mobile frozen-frame and interruption tests, and a mobile scene regression.

Latest Journey revision: three existing symbolic keepsakes now hang from curved
rope segments with individual cords, wooden clips, varied heights and tilted
ivory photo mounts. Independent 8.5–10s wind pivots stay separate from the GSAP
scroll reveal (lifted/rotated stagger, 1.1s scrub). Hover lifts and straightens a
card. Mobile retains native horizontal swipe and a one-screen composition.
Click/keyboard opens a native modal in an ivory/gold frame, animated from the
source card over 760ms and returned over 400ms. Escape, close button and backdrop
dismissal restore focus; background scroll is locked. Reduced motion is instant,
and no-JS keeps inline content. Existing images/content retained; no invented
personal photos or biography. Optional Art.sizes supports sharper modal images.
Verification: 13-route build, 21 unit/static tests, 15 dedicated keepsake checks,
14 desktop/mobile scene/layout checks plus interactions, and 16 direct-link/
locale checks pass. Reviewed desktop/mobile/short-Hindi card and modal images.

Latest hero polish: a separate brass/glass SVG lantern sways gently (7.5s cycle)
with candle flicker and the existing keyboard/touch light control. Background
lanterns are baked into the original raster and remain intact. First-paint CSS
stages the lotus, kicker, whole headline lines, names, ornament and date over
about 2.45s, with soft blur/lift and a restrained settle. Whole lines preserve
Hindi shaping and accessible text. Leaving the hero completes the intro so a
return never leaves names half-hidden. No-JS/reduced motion show readable copy.
24 bounded petal/blossom/mote elements (12 on mobile) drift near the perimeter,
with a quiet central text corridor, no pointer events and no canvas/WebGL.
Offscreen/hidden-tab ambient loops pause. Reduced motion disables the atmosphere
and sway. All existing scenes, routes and the scroll-driven envelope are retained.
Timing inspiration: https://motion.dev/examples/js-stagger-from-edges and
https://motion.dev/examples/vue-hero-stagger (public description, no paid source
copied). No packages installed. Hero-specific viewport/motion/fallback checks
pass for desktop, mobile, short Hindi, reduced motion and no-JS.

Latest envelope revision supersedes the entry-autoplay decision below: the owner
requested a slow, scroll-driven reveal that cannot leave the scene during a
normal scroll gesture. Nature's invitation is now a deliberate long-track
exception to the one-screen document height: its visual viewport stays exactly
one screen tall and sticky throughout 2,800–4,400px of travel. Every pose is
scrubbed (1.8s smoothing), with the existing damped springs, glow and sheen.
The first 4% holds the closed envelope; the final 16% holds the readable card.
Names stay preprinted. Tap/keyboard follows the same scroll path over 8s open /
4.5s close and remains interruptible. Root proximity snapping is suspended only
within the active reveal, preventing it from jumping between animation poses.
Reduced motion and no-JS still show the open static card without extra travel.
Other chapters and Royal remain unchanged. Verification passes: 13-route build,
21 unit/static tests, 20 Nature envelope phase checks, 6 Royal mobile regressions,
16 direct-link/locale checks and 7 mobile scene/layout plus interaction checks.
The mobile wheel test verifies a 1,000px fast gesture advances the lift while
keeping the stage pinned and cannot finish the entire reveal in one gesture.
Desktop/mobile extraction and resting screenshots were visually reviewed.

Latest route/boundary revision: Nature is primary and Royal secondary, as mapped
above. Scaled parallax artwork is clipped to its chapter, fixing the apparent
bottom-height gap without increasing any section beyond one viewport. Nature
uses zero root scroll padding and proximity snapping. Snapping is enabled only
after fonts/animation initialization; the original hash is restored once if the
guest has not already interacted. This prevents direct `/#venue` links from
being reset to the hero. No-JS navigation retains native fragment scrolling.
Verification: 13-route production build, 20 unit/static tests (including all
internal hrefs and canonical URLs), 91 scene/layout checks, 16 direct-load/theme/
locale checks, and 6 Royal mobile envelope regression checks pass. A final mobile
scene/interaction run passes after startup alignment changes. Reviewed desktop
and mobile screenshots show no neighboring artwork strip at the bottom edge.

Latest layout revision: each of the seven Nature home chapters is one dynamic
viewport (`100dvh`, with `100vh` fallback), including the invitation. Story and
event collections pan horizontally on mobile with keyboard-focusable native
scroll containers. Venue details are overlaid within the artwork. Reduced
spacing/type scales support short screens without removing content. Wishes and
venue details allow internal overflow where required. Printable routes and Royal
Heritage retain their existing layouts. Nature's envelope plays its six-second
sequence on entry, pauses out of view, and supports keyboard/tap open and close
in place; only Royal retains the extended scroll-driven track. The names remain
preprinted. Production build and 91 viewport/scene checks pass, with all 16
unit/static tests, 20 Nature envelope phase checks and 6 Royal mobile envelope
regression checks passing. Desktop/mobile and short Hindi screenshots reviewed.

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
