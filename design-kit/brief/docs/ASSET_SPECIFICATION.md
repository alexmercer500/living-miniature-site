# Asset Specification

## Principle
Create a coherent miniature world from a small set of reusable assets. Prefer layered scenes and modular objects over one enormous, uneditable background image. All interface text must be rendered in HTML/CSS so English and Hindi can switch correctly.

The included reference boards are mood and composition references only; do not use them as full-page backgrounds or crop their baked-in text into the site.

## Asset groups

### A. Hero environment
- Palace / haveli silhouette with carved arches and domes.
- Lotus lake or reflective water foreground.
- Garden edges with foliage and flowers.
- Sunset sky gradient / distant hills.
- Warm lamps / lanterns as separate emissive objects where practical.
- A clean static hero poster for immediate first paint and fallback.

### B. Reusable architectural pieces
- Jharokha / carved archway.
- Door or gateway.
- Palace columns / balcony / dome silhouettes.
- Small courtyard / mandap environment.
- Venue establishing view.

### C. Garden / ritual-inspired objects
- Marigold and rose garland clusters.
- Loose petals.
- Diyas with separate flame / glow layer.
- Lotus flowers / leaves.
- Hanging lanterns.
- Swing or hanging ornament (optional).
- Peacock detail (optional).
- Rangoli-inspired ornamental decals used sparingly.

### D. UI assets
- Wordmark / monogram built as vector or CSS (placeholder initials only).
- Small line icons: map pin, calendar, arrow, language, invitation.
- Invitation-card border / decorative frame.
- Favicon and social share image.
- Avoid icons with baked-in labels.

## Suggested production formats
| Asset | Format | Notes |
|---|---|---|
| Static hero / fallback | AVIF or WebP, plus fallback if needed | Target mobile-friendly size; art should work without motion |
| Decorative transparent layers | WebP with alpha or optimized PNG | Use sparingly; test alpha edge quality |
| Vector motifs / icons | SVG | Sanitize; avoid huge embedded raster data |
| Interactive 3D models | GLB / glTF | Compress geometry and textures; test on target phones |
| Environment textures | KTX2 / Basis where pipeline supports it | Use sensible dimensions and mipmaps |
| Fonts | WOFF2 | Only required weights / subsets |
| Optional ambient audio | compressed audio | Off by default, user-initiated only |

## Asset naming
Use descriptive kebab-case names:
- `hero-palace-sunset.avif`
- `hero-palace-fallback.webp`
- `archway-carved-gold.glb`
- `diya-small.glb`
- `petal-rose.webp`
- `lotus-cluster.glb`
- `mandap-courtyard.glb`
- `venue-establishing.webp`
- `invitation-frame.svg`
- `social-preview.webp`

Do not put personal names or addresses in asset filenames.

## Art direction prompts
Detailed prompts are in `assets/prompts/ASSET_GENERATION_PROMPTS.md`.

## Asset production rules
- No readable words, dates, initials, logos, or UI text in generated environment art.
- Avoid inconsistent lighting / architecture between scenes; all scenes belong to the same world.
- Use the same palette, material language, and camera height throughout.
- Use transparent background for individual objects only when it is useful.
- Ask for a clean silhouette and clear focal point at portrait crop.
- For hero art, leave a low-detail negative-space region for real overlay text.
- Avoid over-detailed tiny ornaments that turn into visual noise on mobile.
- Verify asset licenses and usage rights for anything sourced externally.

## Performance budgets (initial targets)
These are targets to measure and refine, not guarantees:
- Initial hero poster: ideally <= 250 KB compressed.
- Individual decorative image: ideally <= 100 KB compressed.
- First-load interactive island JS: aim <= 250 KB compressed before scene-specific chunks, where practical.
- 3D environment and models: lazy-load; aim to keep first interactive scene payload modest and avoid downloading all scenes at once.
- Do not load more than one major 3D environment at initial page load.
- Cap renderer pixel ratio on mobile and reduce shadows / particle count on lower-power devices.
