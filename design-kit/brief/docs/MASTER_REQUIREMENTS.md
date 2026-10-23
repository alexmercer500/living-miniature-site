# Master Requirements — Living Miniature Wedding Website

## 1. Product vision
Create a premium, visually memorable Indian wedding invitation website that feels like exploring a living miniature palace garden. It should combine the craft and warmth of Indian miniature art with cinematic lighting, subtle 3D depth, elegant modern typography, and tactile micro-interactions.

The site should feel like a short interactive wedding film—not a long, content-heavy invitation page.

### Experience direction
- **Theme:** Living Miniature.
- **Visual treatment:** Hybrid — handcrafted / illustrated miniature art combined with cinematic 3D lighting, realistic materials, depth, particles, and restrained interface elements.
- **Interaction model:** Scroll-controlled film with optional direct interaction in the environment.
- **Primary device:** Mobile phones.
- **Secondary device:** Desktop and tablet.
- **Language:** English / हिंदी toggle.
- **Framework direction:** Astro for static-first delivery and low baseline JavaScript, with a contained interactive island for complex motion / 3D.

## 2. Core design principles
1. **Visual-first, not text-first.** Large scenes and clear focal points should carry the experience.
2. **Sparse content.** On the main journey, show only the couple’s names, a short welcoming line, date, essential venue information, RSVP, and a clear path to the full invitation.
3. **Invitation details stay separate.** Full family names, long lists of relatives, and detailed ritual schedules belong in a separate invitation-card panel or downloadable image/PDF. Do not repeat all of this throughout the cinematic site.
4. **Culturally Indian without cliché overload.** Use carved jharokhas, palace courtyards, marigold / rose garlands, diyas, lotus water, rangoli-inspired geometry, peacocks, textiles, and wedding procession details with restraint.
5. **Premium, not busy.** Use negative space, deliberate framing, fine borders, subtle gold accents, and consistent typography.
6. **Interactions are delightful but optional.** Guests must be able to reach the venue, RSVP, and invitation without discovering hidden controls.
7. **Motion must serve storytelling.** Avoid motion for motion’s sake and avoid scroll-jacking.
8. **Fast first impression.** The opening screen must appear quickly, even while the richer scene loads.

## 3. Visual art direction
### World
An ornate miniature palace-garden at dusk, transitioning from sunset peach and dusty rose to indigo twilight. Water reflects palace lights. Small lamps and lanterns create warm points of light. Flowers and foliage frame the scene like a hand-crafted diorama.

### Style blend
- Hand-painted / miniature-illustration detail for architecture, plants, textiles, and decorative motifs.
- Cinematic 3D depth, soft volumetric light, reflective water, atmospheric perspective, and restrained particle motion.
- UI is crisp, readable, and built with real HTML/CSS—not baked into art.
- Avoid photorealistic stock-photo collage as the main look.
- Avoid flat generic wedding templates, excessive cards, clip-art kites, or an overabundance of floating ornaments.

### Suggested palette
Use tokens in `planning/DESIGN_TOKENS.md`. Core colors: midnight indigo, dusk plum, sunset peach, warm ivory, antique gold, deep vermilion / rose, and garden green. Gold should be an accent, not body-text color for small text.

### Typography
Use a high-quality display serif for names and major headings, paired with a readable sans-serif for interface text. Use a Devanagari font with proper shaping for Hindi. Load only necessary weights and subset fonts if practical. Do not render Hindi text inside images.

## 4. Main content hierarchy
### Main cinematic experience
- A subtle auspicious opening / motif, optional.
- Placeholder couple names: `Partner One & Partner Two`.
- One short welcome line.
- Wedding date / date range (placeholder).
- Minimal event highlights (up to 3–4).
- Venue name and address (placeholder).
- Map / directions action.
- RSVP action, if configured.
- English / हिंदी toggle.
- Link to `View full invitation`.
- A clear skip / jump-to-details path.

### Separate full invitation
A distinct panel, modal, or dedicated page for:
- Full family names and greetings.
- Complete ceremony schedule.
- Detailed venue and host information.
- Printable / downloadable invitation card.
- Any additional ceremonial text.

Do not invent actual family names, dates, addresses, phone numbers, RSVP deadlines, or religious copy. Use placeholders and leave optional fields blank where unknown.

## 5. Experience sequence
The intended story is defined in `docs/USER_FLOW_AND_STORY.md`. At a high level:
1. Living miniature landing scene.
2. Gentle invitation / gateway reveal.
3. Couple-name reveal.
4. A visual “two paths become one” story moment.
5. A small set of event vignettes.
6. Venue reveal with map / directions.
7. Countdown and RSVP.
8. Warm closing scene.

The story should feel cohesive and continuous, with scene transitions driven by scroll position. Do not force users to scroll through a long pinned sequence if it becomes uncomfortable on mobile. Provide clear section landmarks and jump links.

## 6. Interactive environment
Implement a small number of polished, purposeful interactions:
- Tap a diya to light it or intensify its glow.
- Tap / brush through petals to trigger a short petal drift.
- Optional swing / hanging ornament that responds to drag or gentle pointer movement.
- Optional peacock or garden detail that reacts subtly to tap.
- Optional lanterns that glow when tapped.
- Optional drag / orbit in a dedicated venue exploration area, if performance and usability justify it.

### Interaction constraints
- Touch targets should be at least 44×44 CSS pixels where applicable.
- Interactions must not obstruct text or critical controls.
- No required hover-only behaviors.
- Avoid uncontrolled particle effects and high-cost physics.
- Avoid making the entire scene draggable if it conflicts with normal scrolling.
- Use touch-action and gesture boundaries deliberately.
- Add a visible hint only for discoverable interactions; remove it after first use or keep it unobtrusive.
- If the 3D scene fails or is unsupported, show a beautiful static illustration with equivalent content.

## 7. English / Hindi toggle
- Provide a clear `EN | हिंदी` toggle in the header or a compact menu.
- Toggle must update all user-facing interface strings, event labels, buttons, helper text, and accessibility labels.
- Persist the choice for the current session or use a URL locale route if that is simpler and robust.
- Keep the selected language visible and keyboard accessible.
- Avoid machine-translated or invented ceremonial copy; use neutral placeholders until approved content is provided.
- Ensure Hindi typography, line height, wrapping, and button widths are tested on mobile.
- Do not duplicate two languages in the main viewport at once.

## 8. Mobile-first responsive requirements
Design and test at minimum:
- 320–360 px narrow phones.
- 375–430 px typical phones.
- 768 px tablet.
- 1024 px small desktop.
- 1440 px wide desktop.

### Mobile behavior
- First meaningful visual should appear without a long wait.
- The opening scene must crop intentionally at portrait aspect ratios; the couple names and key action must remain visible.
- Use touch-first interaction and avoid tiny targets.
- Do not require precision dragging to progress.
- Prefer short, meaningful scenes over a single extremely long pinned scroll animation.
- Reduce particle count, shadow quality, texture resolution, and model complexity on low-power devices.
- Consider a static / CSS-animated fallback for low-power or reduced-motion settings.
- Provide `Skip animation` or `Skip intro`.
- Essential venue, RSVP, and invitation links should remain accessible in a compact sticky or well-placed action area.
- Avoid horizontal overflow and avoid text over high-detail image regions without a contrast layer.

## 9. Performance requirements
Treat these as project targets, not guarantees; measure on real devices:
- Fast initial HTML and CSS; do not block first paint on 3D.
- Aim for a small baseline JS bundle before the interactive island loads.
- Lazy-load the 3D scene and large assets when appropriate.
- Use compressed textures and optimized models (e.g. glTF / GLB); consider KTX2 / Basis textures if the pipeline supports them.
- Use WebP / AVIF for raster art where supported, with sensible fallbacks.
- Avoid loading several large videos or 4K textures.
- Cap device pixel ratio for the 3D renderer, especially on mobile.
- Pause or reduce animation when the tab is hidden.
- Avoid continuous rendering when the scene is idle; use demand rendering where practical.
- Use code splitting and dynamic imports for the interactive island.
- Check bundle size and browser console errors after each milestone.
- Provide a poster image / static fallback while 3D assets load.

## 10. Accessibility and comfort
- Respect `prefers-reduced-motion`.
- Provide a reduced-motion mode that replaces scroll-linked camera motion with simple fades or discrete scene changes.
- Do not autoplay audio. Music, if added, must be user initiated and have a visible mute / stop control.
- All essential actions must be keyboard reachable with visible focus.
- Use semantic headings, links, buttons, and landmarks.
- Maintain readable contrast for small text.
- Supply descriptive alt text for meaningful imagery; decorative assets should have empty alt text.
- Announce state changes appropriately when needed.
- Ensure the language toggle works with screen readers.
- The site must remain usable when WebGL is unavailable.

## 11. Technical architecture guidance
Preferred approach:
- Astro for static-first page shell and content.
- TypeScript for application logic.
- A single, contained interactive island for the scene (React + React Three Fiber if that is the chosen integration).
- GSAP ScrollTrigger for scroll-linked animation and scene transitions, used sparingly and tested on touch devices.
- CSS for simpler reveals and UI motion.
- A lightweight content model, such as `data/site-content.example.json`, to keep copy out of components.
- Avoid unnecessary UI frameworks and duplicated state.
- Keep venue / RSVP / invitation functionality independent from the 3D canvas.

The coding model should verify the current compatibility of Astro, the selected renderer integration, GSAP, and the project's chosen versions before installation. Do not assume a specific package version from this document.

## 12. Content/data requirements
Use `data/site-content.example.json` as the starter content model. Replace values only with approved data. Keep all content bilingual where it appears in the interface.

Potential fields:
- couple display names
- short tagline
- wedding date and optional date range
- venue name, address, map URL
- RSVP URL / contact (optional)
- events with date, short title, time, venue, and optional visual key
- invitation card URL or page route
- social preview title / description
- locale labels
- optional music URL (disabled by default)

## 13. SEO and sharing
- Set title and description from the content model.
- Add Open Graph / social preview metadata.
- Use a custom social preview image created without baked-in tiny text.
- Add favicon and theme color.
- Keep URL stable and shareable.
- Ensure the site still communicates the event essentials when opened directly on a deep link.

## 14. Analytics and privacy
- Do not add analytics, trackers, or third-party embeds unless explicitly approved.
- Do not collect RSVP information unless the user configures a destination or service.
- Do not put personal data into source code or public asset filenames unnecessarily.

## 15. Acceptance criteria
The site is not complete until:
- [ ] `npm run dev` works with no critical console errors.
- [ ] The landing screen feels premium and clearly matches the Living Miniature direction.
- [ ] The first viewport is useful and legible on a phone.
- [ ] EN / हिंदी toggle works across the site.
- [ ] Scroll reveals work with mouse, touch, and reduced-motion settings.
- [ ] At least two environment interactions work on touch devices.
- [ ] Users can skip the intro and reach event details immediately.
- [ ] Venue / directions and RSVP actions work when configured.
- [ ] Full invitation is separate from the main visual story.
- [ ] 3D failure / WebGL disabled shows a graceful fallback.
- [ ] No horizontal overflow at target widths.
- [ ] Images, fonts, models, and scripts are optimized and lazy-loaded where sensible.
- [ ] Placeholder data is clearly marked and no real details have been fabricated.
- [ ] README documents setup, scripts, architecture, and how to replace placeholder data.
