# Royal Heritage Venue — entrance study

Status: portrait approved by owner; desktop companion created and both
integrated. Build and browser verification pass; awaiting owner review.
Date: 2026-10-25.

## Candidate and provenance

- `venue-mobile-v1.png`: portrait 1024×1536 entrance establishing view.
- Generated with the built-in image tool, not CLI/API.
- References: approved wedding vignette at
  `src/assets/royal-heritage/celebrations-wedding-v1.png` and approved
  `journey-desktop-v1.png` beside this document.
- Saved to the project; original generated output remains intact.
- Inspected: carved timber balcony, straight lintels, flat sandstone rooflines,
  open carved wooden doors, marigold/rose/jasmine/mango toran, brass diyas,
  steps, threshold rangoli and inner mandap. No domes, minarets, forbidden
  arches, baked text or interface. Balcony extends beyond the upper edge;
  entrance, approach and distant mandap remain the main focal points.
- Invented thematic artwork, not a likeness of a real venue. Names, addresses
  and directions remain placeholders until the owner provides real details.

## Authorized integration

1. Produce a matching wide desktop establishing composition rather than
   cropping the portrait so severely that the entrance disappears.
2. Integrate responsive optimized AVIF/WebP artwork in `Venue.astro`, retaining
   its existing SVG haveli as an image-error/static fallback.
3. Preserve `content.venue`, EN/Hindi labels, map URL gating, existing actions
   and the venue settle animation. No invented map URL or additional action.
4. Keep the venue card readable HTML, positioned without covering the entrance
   or crowding mobile foreground steps. Do not add a fake interactive 3D tour.
5. Build and test viewport widths, Hindi, reduced motion, no-JS, image failure,
   SVG references, map configuration behavior and console errors. Visually
   inspect screenshots before declaring implementation complete.

Expected files: `src/components/sections/Venue.astro`, production sources in
`src/assets/royal-heritage/`, focused browser tests and documentation. Change
`src/scripts/story.ts` only if the existing venue selectors need compatibility.
No shared symbol changes or other scene redesign is anticipated.

## Production sources

`src/assets/royal-heritage/venue-mobile-v1.png` is copied from the approved
portrait. `src/assets/royal-heritage/venue-desktop-v1.png` is the generated wide
companion, using only that approved portrait as its reference. The built-in
image-generation tool was used; original generated files remain intact.
Both have straight lintels, flat rooflines and no baked text. They depict
thematic architecture, not the real venue. Astro generates responsive AVIF/WebP;
the source PNGs are not production image requests.

The artwork keeps its composition's aspect ratio; HTML details sit below it,
overlapping only the lower paving/shade. Existing SVG scene remains behind it.
The original venue settle timeline now targets the picture when present, with
a restrained 2.5% scale adjustment. Venue data and map configuration are intact.

## Verification

Production build passes for five routes; twelve venue browser cases pass across
seven widths, Hindi, tablet portrait, reduced motion, no-JS and blocked images.
No-JS delivery uses a CSS background which fails transparently to the SVG,
without a native broken-image icon; both no-JS cases were re-tested after this
fix. Desktop/mobile/Hindi/tablet/fallback screenshots were visually inspected.
Six envelope unit tests and six mobile envelope browser phases also pass.
Physical-device Safari and real configured map navigation remain untested;
no real venue URL has been supplied. Closing was not changed.

## Exact desktop generation prompt

Use case: stylized-concept. Asset type: single WIDE landscape 16:9 venue establishing image for an existing luxury Indian Hindu wedding invitation website. Input image is the approved PORTRAIT venue entrance: adapt faithfully into a wide architectural establishing composition, do not stretch or crop away the entrance. Preserve its carved dark teak open double doors, warm carved sandstone piers, floral carved timber balcony above the doorway, flat parapets, straight lintels/brackets, orange marigold/red rose/white jasmine/mango-leaf toran, brass diyas and flower-filled urlis, threshold rangoli, broad sandstone steps and inner courtyard's glowing distant rectangular mandap visible through the doors. Pull camera back slightly to show more of the facade horizontally: traditional flat-roof sandstone haveli veranda wings, bougainvillea and greenery, generous but intimate entrance approach. Center entire doorway and timber balcony, eye-level arrival perspective, warm peach dusk sky, amber practical lamps, believable sandstone/brass/wood textures and optical depth matching original exactly. All important architecture fits inside central 70% of wide frame and top 85% vertically; lower 15% simple stone paving with restrained petal scatter, to allow HTML details BELOW this artwork without hiding entrance. Do not add pools, waterfront, mountains or secondary towers. Invented thematic venue, no real venue claim. Single full-bleed LANDSCAPE 16:9 image. No text, signs, letters, numbers, people, portraits, logos, watermark, map pins, UI, blank panels/cards, borders or collage. Strict no domes of any kind, onion domes, minarets, Taj Mahal, Mughal palace silhouettes, Islamic/Moorish pointed/cusped/horseshoe arches, Islamic geometric ornament, European castle or colonial columns. Traditional Indian trabeated haveli with flat lintels and floral lotus carving only.

## Exact generation prompt

Use case: stylized-concept. Asset type: single full-bleed portrait 2:3 text-free VENUE ESTABLISHING artwork for the existing Royal Heritage Indian Hindu wedding website. Reference image 1 is the approved wedding-mandap vignette, use for sandstone/carved timber/brass/textile/floral material richness and realistic cinematic light. Reference image 2 is the approved journey courtyard, use for coherent architecture and intimate scale. Create a different view: arriving outside the haveli and looking through its grand OPEN double carved dark teak entrance into a welcoming lantern-lit courtyard, with a distant rectangular floral wedding mandap visible through the doorway. Clear recognizable traditional Indian haveli facade: substantial warm sandstone piers, deeply carved lotus floral brackets, straight trabeated lintels, projecting carved timber balcony above doorway, shallow eaves and flat parapet roofline. No arches or roof pavilions. Entrance crowned in dense orange marigold, red rose and jasmine garlands with mango-leaf toran; open carved wooden doors flank central passage. Three broad sandstone entrance steps and a short stone approach lead toward the threshold, brass standing diyas and flower-filled urlis at both sides, discreet rangoli at threshold, bougainvillea and leafy plants against sandstone. Elegant burgundy fabric accents, warm peach dusk sky only uppermost 15%, soft atmospheric glow spilling from inner courtyard, amber practical lamps and subtle polished stone reflections, high detail carved craft and cinematic rendered realism matching references. Eye-level human arrival perspective with architectural depth, centered symmetrical doorway fully visible with balcony above and steps below, foreground not dominated by props, important architecture within central 75% safe crop. This is an invented thematic setting, not a representation of any real named venue. Do not put venue text into image. No people, portraits, signs, names, monograms, letters, words, numbers, UI buttons, pins, maps, blank card, frame, collage, logo or watermark. Strict exclusions: no domes whatsoever, no onion domes, minarets, Taj Mahal, Mughal palaces, Islamic/Moorish pointed/cusped/horseshoe arches, Islamic geometric ornament, European castle or colonial columns. Traditional carved Hindu haveli construction with flat lintels and Indian floral detailing only. Single portrait image, not a website screenshot.
