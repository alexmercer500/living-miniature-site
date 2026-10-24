# Journey courtyard — visual study 1

## Status

Portrait and desktop source artwork generated using the built-in image tool.
Awaiting owner visual review before production integration.

- `journey-mobile-v1.png`: 1024 × 1536 portrait.
- `journey-desktop-v1.png`: 1672 × 941 landscape.

These are still artworks, not 3D models or interactive scenes.
They are not yet referenced by the application. Source PNGs will be optimized
to AVIF/WebP when integrated through Astro's existing image service.

## Art direction

Continue the approved Royal Heritage hero's architecture, warm light, carved
stone/wood, marigold and rose garlands, mango leaves, brass lamps, and textiles.
Use the LEFT Royal Heritage board family, not the alternate mountain/garden
Journey Together theme.

Keep the existing symbolic bilingual line from `content.journey.title`:
two families joining in one celebration. Do not invent personal history,
milestone dates, photographs, or family members.

The studies show a decorated courtyard, lamp-lined garden paths, floral
rangoli, a carved jhoola, and a flat-canopy mandap. The wide version opens out
the courtyard wings; the portrait emphasizes path depth and the swing.
No text is baked into either asset.

## Inspection and remaining work

Main architecture is flat-roofed, with carved pillars and straight lintels.
Both studies have strong visual continuity with the approved opening. They
are richly lit images and will require a controlled scrim for HTML heading
contrast. Top-center sky is available for the existing title.

The swing, lamps, and rangoli are currently baked into the stills. Do not claim
they are independently animated. Before production integration:

1. Remove the baked swing from the environment and create a matching
   transparent rope/seat layer, preserving its actual suspension position.
2. Keep the existing SVG courtyard as the static fallback.
3. Preserve the existing swing drag/tap/keyboard behavior in `story.ts`.
4. Align the two light trails and lamp-light sequence with the new paving;
   avoid painting flat SVG architecture over the realistic poster.
5. Use separate portrait and landscape compositions; test that mobile framing
   retains both the main path and usable swing hit area.
6. Keep real HTML text visible without waiting for a timed reveal.

## Intended integration files

- `src/components/sections/Journey.astro`: responsive image layers, heading,
  interactive swing artwork, and fallback.
- `src/scripts/story.ts`: only small journey alignment/animation adjustments,
  retaining the existing pendulum and other scene controllers.
- `src/assets/royal-heritage/`: production source images and swing layers,
  once artwork is selected.
- `plan.md` and `IMPLEMENTATION_NOTES.md`: scene status and verification.

No other scene needs redesign during this step. No package is required.

## Exact portrait prompt

Use case: stylized-concept. Asset type: text-free portrait 2:3 mobile wedding website JOURNEY scene visual study. Input image 1 is the reference board: use ONLY its LEFT Royal Heritage visual family for luxury carved haveli details, marigolds, brass lamps, dark wood and warm ceremony lighting; do NOT use its right-hand Journey Together landscape theme, do not include board panels or words. Input image 2 is our approved Royal Heritage hero and is the primary material/lighting reference. Scene: a richly crafted traditional sandstone haveli garden courtyard at warm dusk, as though we have walked deeper into the same venue after opening the invitation. Eye-level intimate cinematic view with slightly elevated visibility of the paving. Two gently curving sandstone pathways start at bottom-left and bottom-right, join at a beautifully arranged small floral rangoli in the lower middle, and continue toward a distant flat textile-canopy Hindu wedding mandap in the center. Path edges lined with small antique brass diyas, petals and low rose/marigold flower borders; substantial warm carved sandstone terrace architecture and straight timber lintels around the courtyard, carved brackets, flat parapets and balconies. Mature leafy neem tree and bougainvillea at one side, an elegant dark carved wooden jhoola hanging on two brass chain pairs, marigold-decorated ropes, deep burgundy embroidered seat cushions, integrated as a secondary focal point near lower-left/mid-left without blocking paths. Mango leaf torans and dense marigold/rose garlands frame top corners. Beautiful foreground flower depth and warm amber lamp bokeh at side edges, clear central path. Top central 25 percent calm warm twilight and softly shaded distant sandstone wall reserved for real HTML title. Same warm umber, gold, burgundy, ivory sandstone, green foliage as approved opening, physically plausible rich rendered materials, delicate carving, realistic flowers, cinematic atmospheric depth and handcrafted luxury, not flat vector art. Garden is intimate Indian haveli courtyard, not vast palace waterfront or a mountain landscape. No people, photographs, portraits, memory frames, dates, names, writing, lettering, logos, watermark, UI or collage. Strict exclusions: no domes of any kind, onion domes, minarets, Taj Mahal, Mughal palace, Islamic/Moorish cusped/pointed/horseshoe arches, Islamic geometric ornament, European castle. Use straight lintels, carved brackets, traditional Indian lotus floral carving and flat canopy mandap. Entire scene designed for portrait composition; show both merging paths and jhoola clearly. Single image only, still artwork not a 3D model.

## Exact desktop prompt

Use case: stylized-concept. Asset type: one text-free WIDE 16:9 desktop wedding website journey scene visual study. Input image 1 is the portrait journey composition we are adapting: preserve its exact design family, warm light, carved sandstone courtyard, marigold torans, tree, burgundy-cushioned jhoola, antique brass lamps, floral rangoli and flat canopy mandap. Input image 2 is our approved desktop hero for architectural scale, material quality and color consistency. Expand the portrait environment horizontally rather than stretching or cropping it. Eye-level with slightly raised view of paving. Two gently curving lamp-lined sandstone pathways visibly enter from bottom-left and bottom-right, merge at a small rose/marigold floral rangoli in lower-middle and continue to the glowing central Hindu wedding mandap. Surround with flower borders and haveli veranda wings: straight carved timber lintels, carved brackets, warm sandstone pillars, balconies and flat parapets only. On the left a mature leafy neem tree shelters a rich dark carved wooden jhoola with burgundy/gold cushions and brass chains wrapped with marigolds; swing clearly visible but secondary to the central path and mandap. Dense toran and mango leaves along upper frame with flowers at side edges, warm brass lamps in foreground and receding down paths. Keep the upper central sky and distant sandstone wall quiet for real HTML title. Cinematic dusk peach sky, amber practical lights, physically plausible wood/stone/brass/textiles, rich luxury miniature-inspired rendered realism, optical depth, same maroon/gold/ivory/green palette as approved hero. Grand but intimate Indian haveli courtyard, not the board's alternate mountain/riverside Journey Together theme. No people, portraits, photographs or family photos, no text or monograms, no lettering, logos, UI, watermark, collage. No domes, minarets, Taj Mahal, Mughal palace silhouettes, Islamic/Moorish cusped pointed or horseshoe arches or Islamic geometric ornament. Use trabeated construction and Indian lotus carving. SINGLE full-bleed landscape image, still artwork not a 3D asset.

