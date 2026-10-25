# Cinematic Luxury Indian Wedding Invitation

## Source of truth

2026-10-25 update: owner authorized a complete, independent Nature & Stories
second theme, including asset generation and implementation without approval
pauses. Its execution record is `nature-plan.md`. Royal Heritage remains at
the existing URLs; Nature is at `/nature/` and `/hi/nature/` with its own
invitation routes. This change does not authorize replacing Royal Heritage.
Nature implementation is complete and locally verified: nine production routes,
91 Nature scene checks, 16 unit/static tests and six Royal envelope browser
phases pass. See `nature-plan.md` for detailed coverage and remaining real-device
and configured-service review items. No deployment was performed.

This document is the execution plan for the existing Astro wedding website.
We will follow it milestone by milestone and stop at every approval gate.

The reference target is:

`wedding-cinematic-two-theme-spec/assets/reference/two-themes-overview-board.png`

The Royal Heritage Haveli side of the board is the primary visual target for
the first release. The board is visual direction, not an image to place behind
the website. We will recreate its composition, lighting, materials, density,
framing, and atmosphere as responsive website artwork.

## Non-negotiable constraints

- Continue using the existing Astro project.
- Preserve the existing English and Hindi routes and content placeholders.
- Preserve invitation, RSVP, venue, printable-invitation, navigation, and SEO behavior.
- Preserve keyboard accessibility, reduced-motion support, static fallbacks, and no-JavaScript usability.
- Do not rebuild the application from scratch.
- Do not introduce React, React Three Fiber, or Three.js until the 3D asset plan and first scene are approved.
- Do not add fake `.glb`, `.gltf`, texture, or image paths for assets that do not exist.
- Do not use the reference board itself as a page background or crop its text into the UI.
- Do not use Taj Mahal imagery, Mughal palace silhouettes, onion domes, minarets, Islamic/Moorish arches, or Islamic geometric ornament.
- Do not install packages without an explicit implementation need and approval.
- Do not proceed to the next milestone when the current milestone fails its acceptance criteria.

## Visual target

The final experience should feel as close as practical to the Royal Heritage
visual board while remaining an interactive, accessible website:

- dark carved wooden entrance framing the composition;
- warm carved sandstone haveli courtyard;
- central Hindu wedding mandap and invitation focal point;
- dense marigold garlands and mango-leaf torans;
- brass diyas with warm amber light;
- deep maroon, antique gold, sandstone, and shadow-black palette;
- layered architectural depth rather than isolated flat illustrations;
- cinematic dusk lighting, glow, haze, and controlled contrast;
- premium serif typography with Hindi support;
- responsive desktop and mobile compositions rather than a single cropped poster.

## Model and tool policy

### Coding, planning, and repository work

Recommended default: **GPT-6.1 Sol** when available, using medium reasoning
for normal implementation and high or extra-high reasoning for architectural
decisions, visual-system reviews, and difficult debugging.

Use **GPT-6 Astra** for the hardest planning, cross-file architectural
decisions, or final quality audits when maximum reasoning quality matters more
than latency or cost.

If these models are not available in the current ChatGPT/Codex workspace, use
the strongest available reasoning or Codex model and keep the same milestone
discipline.

### Image generation

Use **GPT Image** for visual assets such as:

- desktop and mobile hero posters;
- haveli entrance concept renders;
- carved wood, sandstone, brass, textile, and floral material references;
- marigold, toran, diya, rangoli, envelope, and wax-seal artwork;
- transparent decorative layers and fallback artwork.

Image generation does not replace the need for inspected, optimized 3D GLB
assets. GPT may help write Blender scripts and asset specifications, but every
interactive model must be exported, inspected, licensed, and tested before it
is referenced by the site.

## Roles and approval process

### User responsibilities

- Approve the visual direction and generated asset candidates.
- Provide final couple names, dates, venue, and wording when ready.
- Review each milestone before the next one begins.
- Approve or provide any externally created 3D assets.

### Implementation responsibilities

- Maintain the existing Astro architecture and routes.
- Generate or prepare visual assets according to this plan.
- Implement only the current milestone.
- Validate desktop, mobile, accessibility, reduced motion, and fallback behavior.
- Report changed files, commands, results, remaining issues, and assumptions.

### Approval gate

At the end of every milestone, stop and report:

1. What changed.
2. Files created or changed.
3. Validation commands and results.
4. Visual limitations or known issues.
5. What requires approval before continuing.

## Milestone 0 — Baseline and visual reconstruction brief

### Objective

Record the current project structure and translate the reference board into a
precise opening-scene brief before generating or integrating assets.

### Work

- Inspect the existing Astro routes, scene components, SVG primitives, styles,
  GSAP controllers, content data, and deployment configuration.
- Read the complete specification pack and relevant design-kit brief files.
- Document the board reconstruction: framing, palette, lighting, architecture,
  material language, focal points, typography, and mobile behavior.
- Inventory all existing assets and identify missing production assets.
- Create or update implementation notes only when they describe an approved
  architecture; do not add placeholder asset paths.

### Acceptance

- Existing routes and functionality are understood.
- The opening scene has an agreed layer-by-layer visual brief.
- Required assets have owners, formats, paths, and status.
- No application behavior has been changed.

### Approval gate

Approve the opening-scene reconstruction brief and asset list.

## Milestone 1 — Static cinematic opening

### Objective

Create the first close visual recreation of the Royal Heritage board using
responsive image layers, existing SVG artwork, CSS, and semantic Astro HTML.

### Work

- Create or approve the desktop hero poster.
- Create or approve the mobile hero poster/composition.
- Build the haveli entrance frame, carved doors, courtyard depth, mandap,
  garlands, mango leaves, diyas, and invitation focal area.
- Integrate the composition into the existing hero without removing routes or
  accessibility behavior.
- Keep the existing static SVG fallback available.

### Acceptance

- The scene reads immediately as the Royal Heritage Haveli board direction.
- The visual hierarchy and density are close to the reference board.
- It works at mobile and desktop widths without horizontal overflow.
- First paint does not depend on WebGL.
- English/Hindi content and existing actions remain accessible.

### Approval gate

Approve the opening scene before adding real-time 3D or envelope interaction.

## Approved envelope implementation adjustment

After reviewing the envelope studies, the owner authorized the seal/flap/card
opening sequence described in the conversation. Use the specification's layered
CSS option for this sequence: generated paper material and an empty tabletop
background, separate envelope body, flap, seal, and HTML card, animated by one
normalized GSAP/ScrollTrigger progress value. This is perspective CSS artwork,
not a GLB environment. No runtime dependency is required.

The layered asset work is the current Milestone 2 branch, followed by the
authorized Milestone 4 envelope prototype. Milestone 3 (real-time WebGL opening)
and model production remain deferred and must not be marked complete. Their
original asset and approval requirements still apply if that branch is pursued.

## Milestone 2 — Asset production and 3D feasibility

### Objective

Prepare only the real-time assets that materially improve the opening scene.

### Required assets

- `public/assets/theme-a/haveli-entrance.glb`
- `public/assets/theme-a/carved-door-left.glb`
- `public/assets/theme-a/carved-door-right.glb`
- `public/assets/theme-a/mandap-courtyard.glb`
- `public/assets/theme-a/diya-brass.glb`
- `public/assets/invitation-envelope.glb`
- `public/assets/wax-seal.svg` or an approved equivalent
- optimized materials/textures with documented licenses or ownership

### Work

- Source or create the models in Blender or through an approved 3D artist.
- Reject assets that introduce excluded architectural motifs.
- Optimize geometry, materials, texture sizes, and file size for mobile web.
- Verify every model in a viewer before integrating it.
- Record source, license, dimensions, animations, and intended use.

### Acceptance

- No asset path points to a missing file.
- Models have appropriate names and interaction anchors.
- The scene can degrade to the approved static opening.
- Asset licenses and provenance are recorded.

### Approval gate

Approve the actual asset set before adding a 3D runtime dependency.

## Milestone 3 — First real-time opening scene

### Objective

Add one progressive-enhancement 3D island to the opening scene.

### Work

- Add the minimum required 3D dependency only after Milestone 2 approval.
- Load the haveli entrance and selected objects on demand.
- Add limited camera/parallax movement.
- Add no more than two initial interactions, such as diya glow and door depth.
- Keep all text, names, details, and actions outside the canvas.
- Pause rendering when offscreen.
- Respect reduced motion and low-power fallback behavior.

### Acceptance

- The 3D scene is genuinely model-based, not boxes or decorative CSS called 3D.
- Touch scrolling remains natural.
- WebGL failure displays the static scene.
- Reduced motion disables or simplifies camera movement.
- Mobile performance is acceptable.

### Approval gate

Approve the first real-time scene before expanding 3D to other scenes.

## Milestone 4 — Envelope and invitation sequence

### Objective

Build the interactive gateway, envelope, seal, and invitation reveal.

### Work

- Implement the gateway interaction using the existing interaction model.
- Add the envelope and wax-seal reveal.
- Provide keyboard and touch controls.
- Provide reduced-motion and static alternatives.
- Keep invitation content in semantic HTML.

### Acceptance

- The interaction is understandable without animation.
- It does not trap keyboard focus or block scrolling.
- The invitation is usable with JavaScript disabled through the fallback.

### Approval gate

Approve the complete opening-to-invitation flow.

## Milestone 5 — Full-page visual continuity

### Objective

Bring all existing scenes into the same board-level Royal Heritage world.

### Work

- Align journey, celebrations, venue, and closing scenes.
- Preserve event data and bilingual routes.
- Use haveli courtyards, mandap structures, torans, diyas, rangoli, textiles,
  foliage, and warm cinematic lighting consistently.
- Keep static scene fallbacks for every enhanced scene.

### Acceptance

- No remaining generic palace or onion-dome visual language.
- All scenes feel like one coherent wedding world.
- Existing links, RSVP, venue, printable invitation, and content remain intact.

### Approval gate

Approve the full-page visual direction before final polish.

## Milestone 6 — Scroll choreography and polish

### Objective

Refine the cinematic storytelling without sacrificing usability.

### Work

- Tune GSAP/ScrollTrigger transitions and parallax.
- Add controlled diya, petal, garland, and atmospheric motion.
- Avoid scroll hijacking and excessive pinned sections.
- Tune typography, contrast, spacing, and loading transitions.

### Acceptance

- Every scene is reachable by normal document scrolling.
- Touch scrolling remains reliable.
- Reduced motion remains calm and complete.
- No layout shifts or unreadable text.

## Milestone 7 — Final QA and release readiness

### Required checks

- Build succeeds without installing packages during validation.
- `git diff --check` passes.
- Test widths: 320, 360, 390, 430, 768, 1024, and 1440 pixels.
- Test English and Hindi routes.
- Test keyboard navigation and focus order.
- Test reduced motion.
- Test no JavaScript and no WebGL fallback behavior.
- Test slow loading and failed asset loading.
- Check for broken SVG references and missing asset paths.
- Inspect browser console for critical errors.
- Review asset sizes and loading behavior.

### Release acceptance

- The opening is visually close to the approved board direction.
- The full invitation remains functional and accessible.
- No prohibited architecture is present.
- No unlicensed production asset is included.
- All known limitations are documented and approved.

## Current status

Active scene: Venue (Milestone 5, one scene at a time).
The owner requested the next phase after Celebrations. First portrait entrance
candidate is saved at `design-kit/assets/royal-heritage/candidates/venue-mobile-v1.png`.
See `VENUE_STUDY.md` beside it for provenance, exact prompt and integration plan.
The owner approved implementation. Portrait and wide artwork are now integrated
in Venue through responsive AVIF/WebP with the retained SVG fallback. The
details card sits below the entrance; existing placeholders, bilingual labels,
map gating and scroll-settle behavior are preserved. Production build and 12
venue browser cases pass (seven widths, tablet portrait, Hindi, reduced motion,
no-JS, blocked images, reverse scrolling, SVG references and console errors).
Desktop/mobile/Hindi/static fallback screenshots were inspected. Six envelope
state tests pass. Owner review of the integrated Venue is next; Closing remains
outside this step and must not begin automatically.

Completed Celebrations integration:
The owner requested continuation after the integrated journey courtyard.
The owner approved the haldi direction and authorized companion artwork and
integration. The first haldi-inspired visual candidate remains saved at
`design-kit/assets/royal-heritage/candidates/celebrations-haldi-v1.png`.
See `CELEBRATIONS_STUDY.md` beside it for the prompt and next steps.
All three vignettes are now integrated: haldi-inspired courtyard, evening
mehndi/sangeet setting, and wedding mandap with varmala. Existing event records,
bilingual copy, date placeholders and calendar gating are unchanged. Responsive
AVIF/WebP artwork overlays the retained procedural SVG fallbacks; shared
ArchFrame/Vignette components and other scenes were not changed.

Verification: production build (five routes), 33 event browser checks across
seven widths plus reduced-motion/no-JS/blocked-image cases, six envelope state
tests, and `git diff --check` pass. Desktop, mobile, Hindi and fallback screenshots
were captured and visually inspected in `.astro/celebrations-qa/`.
The owner requested continuation to Venue. Celebrations source and its verified
behavior are preserved while the Venue visual is prepared.

Completed journey integration:
The owner approved the opening/envelope and requested the next part. Portrait
and desktop courtyard studies are saved in
`design-kit/assets/royal-heritage/candidates/journey-{mobile,desktop}-v1.png`.
See `JOURNEY_STUDY.md` beside those files for prompts, inspection, and the
interactive swing/lamp integration plan. The owner approved integration.
The courtyard is now integrated with optimized portrait/landscape backgrounds,
a separate transparent interactive jhoola, and scroll-lit pathway highlights.
Desktop, mobile, small Hindi, reduced-motion, no-JavaScript, and SVG image-error
fallback checks pass in isolated headless Chrome. The owner requested the next
scene. Venue and closing are outside the current Celebrations step.

Latest owner change: remove the delayed name/detail reveal. Both names and all
card copy are printed from the outset, with no blur, mist, sparkle, or text
timer. Envelope movement, slow extraction, light sweep, and seal glow remain.
This supersedes the earlier name-reveal directions below.

- Existing Astro application: available.
- Bilingual routes and invitation content: preserved.
- Royal Heritage SVG direction: partially implemented.
- Production 3D models: not available yet.
- Hero posters: approved source PNGs are integrated through Astro image
  optimization, generating responsive AVIF/WebP variants during the build.
- Three.js: not installed and not to be added before Milestone 2 approval.
- Milestone 0 reconstruction brief: recorded in `IMPLEMENTATION_NOTES.md`.
- Milestone 1 artwork: portrait and desktop sources in
  `design-kit/assets/royal-heritage/candidates/` were approved by the owner.
- Milestone 1 implementation: integrated into the bilingual hero with HTML
  typography, image priority, gentle scroll zoom, and the underlying SVG fallback.
- Opening visual direction: owner reviewed the integrated hero and approved
  proceeding. Automated browser QA remains unavailable in this session.
- Milestone 2 asset studies: portrait/desktop invitation-envelope concepts saved
  beside the approved hero sources; approved by the owner. See
  `design-kit/assets/royal-heritage/candidates/INVITATION_STUDY.md` for the
  prompts and required model handoff. These are still artworks, not GLB models.
- Layered envelope assets: empty carved-table backdrop and embossed ivory paper
  generated in `src/assets/royal-heritage/`, optimized by Astro at build time.
- Milestone 4 layered prototype: implemented after the preserved gateway, with
  seal lift, hinged flap, card extraction, synchronized tap/scroll, keyboard
  control, and readable reduced-motion/no-JavaScript fallback. Awaiting browser
  visual and interaction acceptance. Milestone 3 remains deferred.
- Next action: owner reviews opening/closing, reverse scrolling, keyboard focus,
  and card readability in both languages and at mobile/desktop widths.
- Envelope choreography revision requested by owner: envelope begins tilted and
  scaled down on the table, floats upright, releases its seal and flap, then
  extracts the card fully before bringing it forward over the envelope. The
  raised card settles near the center. All stages share reversible progress;
  motion-free visitors see the final readable foreground card.
- Envelope polish revision: owner requested spring motion, glow, and a delayed
  mist/sparkle name reveal. These override the earlier restrained-only motion
  direction for this scene. Position is now measured from the envelope's center
  and card dimensions, with header/action clearance. Existing GSAP handles
  damped lift/settle, light sweep, fourteen sparkles, and three bounded mist
  layers; no dependency or 3D asset was needed.
- Browser QA is now available through isolated headless Chrome. The screenshot
  regression harness is `tests/envelope-browser.mjs`; artifacts are written to
  ignored `.astro/envelope-qa/`. State and layout coverage is in
  `tests/envelope-state.test.mjs`.
- Envelope pacing revision: paper stays in front of the explicit red-lining
  layer and is clipped only below the physical pocket. Scroll travel is now
  2000–3400 px with 1.4-second smoothing; seal-click opening takes six seconds.
  Once the paper has fully emerged and settled, names reveal over a separate
  3.8-second timeline, so fast scroll cannot flash the text instantly. The
  visible Open/Close caption is replaced by a pulsing red seal with localized
  accessible labels. Wheel, touch, and navigation keys can interrupt automated
  scrolling. Reduced-motion/static visitors still receive the readable card.
