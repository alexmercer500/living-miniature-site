# Asset Generation Workflow

## Generate assets individually
Do not generate a new composite board for implementation. The board is only for visual direction. Use `assets/ASSET_PROMPTS.md` to create:
- Theme 2 desktop hero (1920x1080)
- Theme 2 mobile hero (1080x1920)
- Theme 5 desktop hero (1920x1080)
- Theme 5 mobile hero (1080x1920)
- Entrance and closing scenes
- Invitation objects and transparent decorations
- Five individual event images for each theme

## Naming convention
Use stable filenames, for example:
- `public/images/themes/amber-fort/hero-desktop.webp`
- `public/images/themes/amber-fort/hero-mobile.webp`
- `public/images/themes/amber-fort/entrance.webp`
- `public/images/themes/amber-fort/invitation-envelope.png`
- `public/images/themes/amber-fort/events/haldi.webp`
- `public/images/themes/lake-city/hero-desktop.webp`
- `public/images/themes/lake-city/hero-mobile.webp`
- `public/images/themes/lake-city/entrance.webp`
- `public/images/themes/lake-city/invitation-scroll.png`
- `public/images/themes/lake-city/events/haldi.webp`

## If the IDE LLM has no image-generation tool
Do not ask it to invent raster assets with CSS gradients or primitive SVGs as a substitute for the approved cinematic style. Have it create asset slots, manifests, responsive image wiring, and placeholder states, then generate the images separately and place them at the agreed paths.
