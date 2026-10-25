# Royal Heritage scene materials

## Venue artwork

- `venue-mobile-v1.png`: owner-approved portrait entrance, copied from
  `design-kit/assets/royal-heritage/candidates/venue-mobile-v1.png`.
- `venue-desktop-v1.png`: wide companion generated using the portrait as the
  reference with the built-in image tool. Exact prompts/provenance are in
  `design-kit/assets/royal-heritage/candidates/VENUE_STUDY.md`.

These are invented thematic haveli views, not a real venue likeness or 3D tour.
`Venue.astro` outputs mobile 480/768/1024px and desktop 1280/1672px AVIF/WebP.
AVIFs range approximately 69–225 KB; production does not request source PNGs.
The existing SVG remains beneath the image for loading/static/error delivery.
Venue names, addresses and navigation stay real HTML outside the artwork.

## Celebrations artwork

Production sources: `celebrations-haldi-v1.png`, `celebrations-evening-v1.png`,
and `celebrations-wedding-v1.png` in this directory. The haldi source is copied
from the owner-approved candidate; the two companions were created with the
built-in image-generation tool using that candidate as their reference.
These are text-free still artworks, not 3D models or screenshots of event UI.
The exact prompts are recorded in
`design-kit/assets/royal-heritage/candidates/CELEBRATIONS_STUDY.md`.

`Celebrations.astro` imports them and generates 360/640/900px AVIF/WebP variants.
AVIF outputs are approximately 39–179 KB each. No source PNG is requested by
the production page. Existing visual keys map to the appropriate image, with
unknown keys retaining the existing SVG. Each SVG remains behind the picture
for loading/error fallbacks; all dates, titles and descriptions stay in HTML.

Generated with the built-in image generation tool from owner-approved
invitation reference artwork. These are raster materials, not GLB models.

- `invitation-table-v1.png`: edited empty table scene; no baked envelope, seal,
  or card. Used as an optimized lazy-loaded scene background.
- `ivory-floral-paper-v1.png`: flat embossed ivory paper with a clear center.
  Used as an optimized WebP material for independent envelope and card layers.

The source PNGs are imported through Astro's existing image service. No original
multi-megabyte source PNG is requested by the envelope component in production.
The wax seal is CSS with the existing vector LotusMark rather than a raster.

## Journey integration assets

Generated using the built-in image tool, not CLI/API. Source references are the
owner-approved `design-kit/assets/royal-heritage/candidates/journey-{desktop,mobile}-v1.png`.
The original approved studies are preserved. Production imports are:

- `journey-desktop-clean-v1.png`: landscape courtyard without baked swing.
- `journey-mobile-clean-v1.png`: portrait courtyard without baked swing.
- `journey-swing-v1.png`: transparent, independently animated carved jhoola.

Astro outputs responsive AVIF/WebP backgrounds and an alpha-preserving WebP swing.
The source PNGs are not requested by the production page. The swing is a raster
layer driven by the existing damped-pendulum controller, not a 3D model.

### Exact prompt: clean desktop courtyard

Use case: precise-object-edit. Edit target: supplied approved landscape Royal Heritage courtyard. Remove ONLY the hanging swing on the left: its wooden seat, red cushions, suspension chains and flower strands attached to the swing. Reconstruct the small courtyard/steps/plants behind it naturally. Keep the large neem tree, its branches, tree lanterns and all other flowers, architecture, mandap, sunset, rangoli, paving, lamps, colors, framing and camera absolutely unchanged. Maintain landscape 1672:941 composition. No text, no new objects, no domes.

### Exact prompt: clean mobile courtyard

Use the exact clean desktop prompt above, with both occurrences of `landscape`
replaced by `portrait`, and `1672:941` replaced by `1024:1536`.

### Exact prompt: transparent swing

Use case: background-extraction. Create a genuinely transparent cutout asset containing ONLY the carved wooden Indian jhoola swing from the left side of this reference: ornate gold-brown wooden bench, red/burgundy embroidered cushions and bolsters, two long vertical brass suspension chains dressed with marigold/jasmine flowers. Match reference realistic cinematic warm sunset material, three-quarter front perspective. Include full length suspension chains from top of canvas down to seat at bottom, chains attach at the top left/right of bench. Swing centered horizontally, entire silhouette fits snugly canvas, tall portrait canvas approximately 1:2. No tree, branch, leaves, ground, lanterns, background, scene, text, frame, drop shadow or other objects. Actual transparent alpha outside the chains and seat, including between chains above bench. Preserve fine carved details. Intended to composite back into the supplied courtyard.

## Prompt: empty table

Use case: precise-object-edit. Input image is the edit target, our approved Royal Heritage invitation scene. Remove ONLY the entire ivory envelope, burgundy wax seal, hanging tassel and their cast shadow from the center. Fill the removed area with an uninterrupted clean dark carved teak tabletop surface, matching the surrounding existing tabletop, its floral carving, wood grain, perspective, and warm lighting seamlessly. Keep the rest: exact haveli courtyard, flat-roof sandstone architecture, flowers, brass diyas, scattered petals, mandap, sunset, camera, dimensions and layout. The central 65% of the table must be empty for a separately animated envelope object. Retain ornament near table edges, keep central tabletop relatively calm dark wood with subtle grain. No envelope, no card, no seal, no paper, no lettering or UI. No new objects. Do not change the framing. Single wide landscape image.

## Prompt: paper material

Use case: product-mockup. Asset type: flat orthographic material artwork for a real HTML/CSS animated wedding envelope and invitation card. Use input reference ONLY for its handmade ivory paper and antique gold lotus embossing treatment, not the scene composition. Produce one LANDSCAPE 3:2 rectangle of warm ivory handmade paper filling the canvas edge-to-edge. Perfectly front-facing flat scan, no perspective, no rotation, no cast shadow, no table, no props, no envelope folds, no wax seal, no text. Very fine real paper fibers, restrained warm gold embossed Indian lotus and marigold floral vine ornament, dense detail concentrated in the outermost 10% border and small corner clusters. Thin double gold rule inset 4%, elegant repeating tiny beads at edge. Center 75% clean blank ivory paper for readable HTML typography. Realistic embossed relief with tiny soft shadows from upper left, subtler than ornate jewelry, premium stationery finish. Match reference ivory/gold hue. No writing, marks, signatures, letters, watermark, religious symbols, Islamic/Moorish geometry. Entire image is flat rectangular paper material, no background margin.

