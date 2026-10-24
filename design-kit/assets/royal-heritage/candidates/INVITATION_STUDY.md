# Invitation envelope — asset study 1

## Status

Portrait and landscape concept artwork generated using the built-in image tool.
Awaiting owner visual review. These files are not referenced by the application.

- `invitation-mobile-v1.png`: portrait composition.
- `invitation-desktop-v1.png`: landscape composition.

The owner approved the integrated opening hero before this asset study.
This study contributes to plan.md Milestone 2 (asset production). Milestone 2
is still incomplete: no new GLB models have been produced or verified.
Milestone 4 (envelope interaction) has not started.

## Visual decisions

Match the Royal Heritage invitation panel and approved hero: handmade ivory
paper, lotus/floral embossing, antique gold details, burgundy wax seal and
tassel, carved teak table, brass diyas, flowers, and warm courtyard lighting.
Seal is blank so a real approved monogram can be added later. No personal data
or generated lettering is embedded in these images.

## Inspection

Both candidates show a closed envelope with visible flap seams, a plain seal,
an intact silhouette, warm material detail, flowers, and lamp framing.
They are still artworks with baked lighting, perspective, shadows, and objects.
They cannot supply independent flap rotation, a movable seal, paper extraction,
or a camera orbit. They should guide production assets and optional static
fallbacks.

The mobile image positions the envelope across the middle/lower area; desktop
places it near the center of a wider tabletop. Browser crop, typography, and
seal hit-area placement have not been tested. Artwork alone does not satisfy
the interaction acceptance criteria.

## Required asset handoff for the later interaction

Planned model: `public/assets/invitation-envelope.glb`. File does not exist;
do not reference it from code.

A Blender/GLB deliverable should contain separate named objects:

| Object | Requirements |
|---|---|
| Envelope body | Clean UVs, ivory material and floral detail; coherent proportions |
| Flap | Separate mesh; pivot along upper long-edge fold |
| Wax seal | Separate object at flap tip; blank center; removable without shattering |
| Tassel | Separate or grouped with seal; avoids obstructing flap hinge |
| Invitation paper | Blank surface; separate mesh movable out of body |

Use meters with documented object dimensions and applied transforms. Supply
the editable Blender source, optimized GLB, used texture maps, and provenance.
Use PBR materials compatible with glTF, bake floral relief into normal maps
where appropriate, and minimize texture sets. Aim for a compact object
download; measure final bytes on export rather than assume compliance.

Opening and closing must be driven from one normalized progress value so scroll
and tap can synchronize. All invitation copy and controls remain HTML.
Reduced motion uses a calm reveal; a direct invitation route remains available.

If a layered CSS approach is chosen instead, prepare separate aligned body,
flap, seal, and blank-paper assets. It requires an explicit plan update before
implementation because plan.md currently gates the model-based milestones.
Do not simulate opening by attaching an unrelated button to these stills.

## Next review

Approve the paper, embossing, seal, tassel, table, and lighting before producing
the remaining separable assets or implementing the envelope interaction.

## Exact prompts

### Portrait

Use case: stylized-concept. Asset type: single premium invitation-envelope visual development artwork, portrait 2:3. Image 1 is the supplied board: closely match ONLY the LEFT Royal Heritage '02 Invitation Reveal' panel's envelope, paper embossing, burgundy seal, warm intimate light, density of decorative detail, and cinematic quality. Do not use right-hand Journey Together scroll design or the collage layout. Image 2 is our approved hero and is the material/lighting reference for the same haveli world. Scene: intimate three-quarter overhead close-up of one luxurious CLOSED landscape-format handmade warm ivory wedding envelope resting on a low dark carved teak table, within the same haveli. Envelope centered and dominant, fills roughly 70% width and middle 50% height, entire silhouette and all corners visible, tilted only slightly clockwise. Clear SINGLE triangular hinged flap from the upper long edge, flap tip near center, coherent manufacturable envelope folds. Intricate restrained embossed Indian lotus and marigold floral vines with fine antique gold detailing follow the paper edges and triangular flap perimeter. Visible fibrous paper grain and realistic bevel/thickness; clean border ornament, no random marks. Large deep burgundy wax seal at flap tip, soft irregular natural wax rim, plain empty recessed circular center suitable for a later real monogram. Refined burgundy cord and small tassel can rest below the seal without obstructing flap seams. Surround with a few rose petals, marigold blossoms, a short mango leaf sprig, brass diyas near edges and burgundy textile at one corner. Rich dark carved timber under envelope with Indian floral/l lotus carving. Upper background gives an out-of-focus hint of the same sandstone courtyard and warm lamp bokeh; bottom foreground has discreet candle bokeh and scattered petals. Match approved hero's dark wood, warm amber oil-lamp lighting, rich maroon roses, orange marigolds and aged brass. Physically plausible luxurious rendered-art quality and dimensional shadows, crisp paper and seal, depth of field at scene edges. Leave a small calm dark region above the envelope for later HTML heading; no painted text. No writing, no letters, no names, no initials, no monogram, no typography, no logos, no watermark, no UI. No people, no hands, no extra envelopes, no collage. No Taj Mahal, Mughal palace, domes, minarets, Islamic/Moorish ornament, no European castle. This is a concept still and fallback reference, not an interactive model. One portrait image only.

### Desktop

Use case: stylized-concept. Asset type: WIDE 16:9 landscape website invitation-envelope scene candidate. Input image 1 is the envelope portrait reference: preserve its EXACT design family, handmade ivory paper, gold lotus vine embossing, singular triangular flap, plain burgundy wax seal with blank circular center, burgundy cord/tassel, carved dark teak table, rose/marigold flowers and warm brass lighting. Input image 2 is the approved Royal Heritage desktop hero; maintain the same haveli and warm amber lighting. Expand portrait composition horizontally into one coherent WIDE landscape view, do not crop its envelope or stretch it. Envelope lies in three-quarter overhead view on low carved timber table in the central lower half, takes about 50% frame width, entire silhouette visible. Seal located near image center and clearly identifiable. Show elegant engraved wood surface, restrained petals, marigold clusters and brass diyas along side edges. Background softly blurred sandstone flat-roof courtyard with garlands and mandap lights. Dark calm upper center reserved for later HTML heading, no lettering. Rich luminous ivory paper contrasts dark wood, physically plausible material depth, soft lamp bokeh, premium cinematic rendered visual quality closely matching Royal Heritage invitation panel, coherent practical lighting and shadows. One closed envelope, no card sheet, no hands or people. No text, initials, monogram, letters, logos, watermark, UI, collage, contact sheet. No domes, onion domes, minarets, Taj Mahal, Mughal palace, Islamic/Moorish decorative architecture or European castle. This is a still concept/fallback artwork, not an interactive model.

