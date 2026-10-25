# Celebrations — first Royal Heritage vignette

Status: owner approved the haldi direction and authorized the two companions
and integration. All three are now integrated; awaiting owner review of the
completed section. The three existing event records remain unchanged.

## Candidate and provenance

- `celebrations-haldi-v1.png`: individual portrait haldi-inspired courtyard.
- Created using the built-in image-generation tool, not CLI/API.
- References: approved `journey-desktop-v1.png` and LEFT Royal Heritage side of
  `wedding-cinematic-two-theme-spec/assets/reference/two-themes-overview-board.png`.
- Inspected: flat canopy/lintels, carved sandstone, yellow textiles, turmeric
  bowls, marigolds, mango leaves, brass urli and diyas; no domes, minarets,
  people, baked text, or UI. This is raster artwork, not a 3D asset.

## Authorized implementation

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

Production sources are `src/assets/royal-heritage/celebrations-{haldi,evening,wedding}-v1.png`.
The evening artwork combines henna trays/bangles, green seating and dhol/string
lights; the wedding artwork includes a traditional mandap, havan kund and a
pair of varmala garlands. Both were inspected for unwanted architecture and
baked text. Their generated sources were copied into the project, leaving
the built-in tool originals intact.

## Exact generation prompt — approved haldi

Use case: stylized-concept. Asset type: one text-free portrait 4:5 cinematic HALDI celebration vignette for an existing luxury Indian wedding website. Input image 1 is our approved Royal Heritage courtyard: match its richly rendered realism, warm sandstone, carved wood, brass, flowers and cinematic lighting. Input image 2 is the two-theme overview board: use ONLY the LEFT Royal Heritage celebrations panel for density and materials, never its right nature theme, never copy its domed architecture or any text. New composition: intimate haldi ceremony corner within that same traditional Hindu haveli. Two low carved wooden ceremonial seats with rich turmeric-yellow woven cushions stand on a small sandstone platform beneath a FLAT rectangular timber canopy covered in dense yellow/orange marigolds, jasmine strands and mango leaves. In foreground, an ornate antique brass urli filled with marigold petals, small brass bowls containing turmeric paste, a low ritual tray, yellow textile folds and rose/marigold petals make haldi recognizable; several warm brass diyas frame the edges. Background sandstone veranda with deeply carved pillars and straight timber lintels/brackets; flat parapet only. Warm amber afternoon transitioning to lamp-lit dusk, soft shafts of light, floral foreground depth, physically plausible finely crafted materials, luxurious but intimate, maroon/gold/ivory highlights and leafy greens. Eye-level slightly raised view, centered balanced ceremony space, focal seats and ritual tray fully visible in central 70% safe crop. Full bleed single portrait image, no border, no blank card, no interface, no words/numbers/lettering, no people or portraits, no logos/watermark. Avoid domes of any kind, onion domes, Taj Mahal, minarets, Mughal palace silhouettes, pointed/cusped/horseshoe/Moorish arches, Islamic geometric ornament. Use traditional trabeated Indian construction and lotus floral carving. This is an individual artwork asset, not a website mockup or collage.

## Exact generation prompt — evening

Use case: stylized-concept. Asset type: single portrait 4:5 text-free MEHNDI / SANGEET evening celebration vignette for the same luxury Indian Hindu wedding website. Supplied reference is the approved haldi vignette; preserve its cinematic rendered realism, sandstone haveli proportions, dense carved details, flowers, warm brass and optical depth, but design a distinct evening courtyard corner rather than recoloring it. Leafy green and deep burgundy embroidered low seating beside a small timber dance platform, henna cones with small brass henna bowls and colorful glass bangles arranged on a low carved table in foreground, a beautifully crafted dhol on the side of the stage, dense rose/marigold/mango-leaf garlands suspended from a flat carved timber pergola and many warm amber string lights overhead. Lush foliage, jasmine, brass diyas at edges. Deep twilight blue sky with warm illuminated carved sandstone veranda and flat roofline, straight timber lintels and Indian carved brackets, no arches. Intimate festive atmosphere, rich emerald textile against maroon roses and antique gold brass, refined warm pools of light, no harsh neon or nightclub look. Eye-level slightly raised camera matching reference, important objects within central 75% safe crop, coherent architectural depth, full bleed single portrait asset. No people, faces, lettering, text, numbers, logos, watermark, UI, card, frame or collage. Strictly no domes, minarets, Taj Mahal/Mughal silhouettes, Islamic/Moorish pointed/cusped/horseshoe arches or geometric ornament. Not a photo of a website. No baked UI or invitation wording.

## Exact generation prompt — wedding

Use case: stylized-concept. Asset type: one portrait 4:5 text-free WEDDING MANDAP and VARMALA vignette for the same luxury Indian Hindu wedding website. Supplied reference is approved haldi vignette: match its rich cinematic realism, sandstone haveli, carved craft detail, warm brass, lush flowers, eye-level slightly raised camera, intimate scale and atmospheric depth. Design a distinct ceremonial focal scene: traditional Hindu four-pillar carved wooden mandap on raised sandstone platform, FLAT rectangular canopy with rich burgundy fabric swags, dense red roses, white jasmine and orange marigolds, mango-leaf toran, hanging flowers. Two elegant ivory-and-burgundy floor-level ceremonial seats in center facing a small square havan kund with restrained sacred flame and carefully arranged brass ritual vessels. A pair of clearly separate rose-and-jasmine varmala garlands laid over a brass tray on a low carved stand in the foreground. Warm glowing brass diyas line short approach, subtle circular floral rangoli on sandstone paving, carved pillars and straight lintels of surrounding haveli veranda, flat parapets and peach dusk visible above. Deep maroon/ivory/antique gold with green foliage, soft amber shafts and luminous practical lamps, physically plausible polished brass and textiles, richly textured but focal objects clear. Entire mandap pillars and foreground tray within central 80% safe crop. Single full-bleed portrait image, no border or framing panel, no invitation card, no UI, no words, letters, dates, logo, watermark or people/portraits. Strictly exclude domes of any kind, onion domes, minarets, Taj Mahal, Mughal palace silhouettes, pointed/cusped/horseshoe/Moorish arches and Islamic geometric ornament. Traditional Indian trabeated construction and lotus floral detailing only. This is a standalone artwork, not a collage or website screenshot.
