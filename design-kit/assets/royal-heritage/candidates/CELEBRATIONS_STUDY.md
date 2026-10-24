# Celebrations — first Royal Heritage vignette

Status: first visual candidate, awaiting owner approval. Not integrated.

## Candidate and provenance

- `celebrations-haldi-v1.png`: individual portrait haldi-inspired courtyard.
- Created using the built-in image-generation tool, not CLI/API.
- References: approved `journey-desktop-v1.png` and LEFT Royal Heritage side of
  `wedding-cinematic-two-theme-spec/assets/reference/two-themes-overview-board.png`.
- Inspected: flat canopy/lintels, carved sandstone, yellow textiles, turmeric
  bowls, marigolds, mango leaves, brass urli and diyas; no domes, minarets,
  people, baked text, or UI. This is raster artwork, not a 3D asset.

## Proposed continuation after approval

1. Produce matching evening mehndi/sangeet and wedding-mandap vignettes.
2. Preserve the three existing event records, titles, dates, descriptions and
   calendar behavior. Ceremony-inspired artwork does not establish a real
   ceremony schedule; placeholders remain until the owner supplies details.
3. Integrate through responsive Astro AVIF/WebP images in Celebrations. Keep
   semantic bilingual event details outside artwork and retain SVG fallbacks.
4. Keep the existing entrance choreography, reduced-motion and no-JS behavior;
   do not require hover or animation completion to read event details.
5. Test desktop/mobile/Hindi, calendar behavior, failed images, reduced motion,
   no JavaScript, SVG references, production build and horizontal overflow.

Expected implementation targets: `src/components/sections/Celebrations.astro`,
production source assets under `src/assets/royal-heritage/`, focused browser tests,
`plan.md`, and `IMPLEMENTATION_NOTES.md`. Shared ArchFrame/Vignette primitives and
the other scenes should not need modification.

## Exact generation prompt

Use case: stylized-concept. Asset type: one text-free portrait 4:5 cinematic HALDI celebration vignette for an existing luxury Indian wedding website. Input image 1 is our approved Royal Heritage courtyard: match its richly rendered realism, warm sandstone, carved wood, brass, flowers and cinematic lighting. Input image 2 is the two-theme overview board: use ONLY the LEFT Royal Heritage celebrations panel for density and materials, never its right nature theme, never copy its domed architecture or any text. New composition: intimate haldi ceremony corner within that same traditional Hindu haveli. Two low carved wooden ceremonial seats with rich turmeric-yellow woven cushions stand on a small sandstone platform beneath a FLAT rectangular timber canopy covered in dense yellow/orange marigolds, jasmine strands and mango leaves. In foreground, an ornate antique brass urli filled with marigold petals, small brass bowls containing turmeric paste, a low ritual tray, yellow textile folds and rose/marigold petals make haldi recognizable; several warm brass diyas frame the edges. Background sandstone veranda with deeply carved pillars and straight timber lintels/brackets; flat parapet only. Warm amber afternoon transitioning to lamp-lit dusk, soft shafts of light, floral foreground depth, physically plausible finely crafted materials, luxurious but intimate, maroon/gold/ivory highlights and leafy greens. Eye-level slightly raised view, centered balanced ceremony space, focal seats and ritual tray fully visible in central 70% safe crop. Full bleed single portrait image, no border, no blank card, no interface, no words/numbers/lettering, no people or portraits, no logos/watermark. Avoid domes of any kind, onion domes, Taj Mahal, minarets, Mughal palace silhouettes, pointed/cusped/horseshoe/Moorish arches, Islamic geometric ornament. Use traditional trabeated Indian construction and lotus floral carving. This is an individual artwork asset, not a website mockup or collage.
