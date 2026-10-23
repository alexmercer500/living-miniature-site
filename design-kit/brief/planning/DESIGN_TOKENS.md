# Design Tokens — Living Miniature

These are starting values. Adjust only to improve contrast, consistency, and responsive composition.

## Color
```css
:root {
  --color-midnight: #17172C;
  --color-indigo: #252744;
  --color-plum: #4B243E;
  --color-dusk-rose: #A95860;
  --color-sunset: #EAA17E;
  --color-ivory: #FFF3E2;
  --color-parchment: #EAD6B7;
  --color-antique-gold: #C49A55;
  --color-gold-highlight: #F2D59A;
  --color-vermilion: #9C3540;
  --color-garden: #314B3E;
  --color-text-light: #FFF7EC;
  --color-text-dark: #3A2630;
}
```

## Typography
- Display: elegant editorial serif, ideally with a graceful ampersand.
- Interface: readable neutral sans-serif.
- Hindi: a Devanagari font with proper shaping and enough weight range.
- Use WOFF2; subset and load only necessary weights.
- Avoid ultra-thin text over moving backgrounds.

## Layout
- Mobile-first; portrait composition is a first-class design, not a cropped desktop layout.
- Use `min-height: 100svh` with fallbacks where useful.
- Keep core actions inside safe areas on mobile.
- Use responsive type with `clamp()`.
- Reserve negative space behind the names and main CTA.
- Use CSS variables for scene spacing and content widths.

## Motion
- Ambient loops: subtle, slow, low-amplitude.
- UI transitions: short and purposeful.
- Scroll choreography: camera / scene transition should map predictably to scroll progress.
- Never require animation completion before the guest can continue.
- Respect `prefers-reduced-motion`.
- Pause expensive loops when offscreen or tab-hidden.

## Shape and ornament
- Use fine ornamental borders, carved arch silhouettes, and restrained floral framing.
- Avoid stacking cards within cards.
- Avoid multiple competing gradients behind text.
- Use gold for borders, small highlights, and icons; not for small body copy on light backgrounds.
