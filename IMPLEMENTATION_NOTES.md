# Implementation Notes — Living Miniature

Source brief: `design-kit/brief/` (MASTER_REQUIREMENTS is the source of truth).

## Stack decisions (verified 2026-10-23)
| Package | Version | Why |
|---|---|---|
| astro | 7.4.x | Static-first shell; Node ≥ 22.23 required (we run 24.14). |
| @fontsource/* | 5.3.x | Self-hosted WOFF2, per-weight/per-subset imports. Browser only downloads faces actually used. |
| gsap | 3.15 | ScrollTrigger scroll choreography; dynamically imported, skipped entirely under reduced motion. |
| @astrojs/react + @react-three/fiber + three | 7.1 / 9.8 / 0.186 — *Milestone 3* | `@astrojs/react` peers accept React 19, which R3F 9 requires. Installed only when the 3D island lands. |

Deliberately **no** UI framework, CSS framework or icon package.

## Architecture
- **Locales as routes**: `/` (EN) and `/hi/` (HI), plus `/invitation` and `/hi/invitation`. Works with zero JS, is shareable and screen-reader friendly. The toggle carries the section in view as a `#hash` so guests keep their place.
- **Content**: `src/data/site-content.json` (kit JSON + extra UI strings + clearly marked invitation placeholders). Typed helpers in `src/lib/content.ts`.
- **Art**: procedural inline SVG generated at build time (`src/lib/art.ts`). One `<symbol id="lm-palace">` is reused by hero, water reflection, venue and closing. Zero image requests and ~34 KB gzip for the whole home page, so it doubles as the permanent **static / no-WebGL fallback**.
- **Layers**: hero layers carry `data-layer="sky|sun|hills|palace|water|foreground|frame"` so Milestone 2 can drive parallax without restructuring.
- **Conditional actions**: map buttons render only when `venue.mapUrl` is an http(s) URL; countdown only for a real `YYYY-MM-DD`; RSVP only when `rsvp.enabled` + URL. Unconfigured slots show a dashed **dev-only** note that is stripped from production builds.
- **Motion**: CSS-only ambient loops (lantern sway, diya flicker, petals, ripples), all inside `prefers-reduced-motion: no-preference`.
- **Menu**: native `popover` — opens/closes without JS, Esc and light-dismiss for free.

## Asset-loading strategy (for later milestones)
1. SVG poster paints first (today).
2. Painted / generated hero art (AVIF, ≤250 KB) can replace individual layers without touching layout.
3. The 3D island is dynamically imported after first paint, only on capable devices, never blocking scroll; SVG stays as fallback.

## Project rules (from owner)
- Private project for Ratnesh: no content, assets or screenshots leave this machine unless the owner asks. No CDNs, analytics, embeds or cloud generation.
- Personal project: no formal QA milestones; the owner decides.

## Progress
- [x] Static shell: tokens, fonts, EN/हिंदी routes, menu, hero, reveal, celebrations, venue, conditional countdown/RSVP, closing, printable invitation, action bar.
- [x] Scroll story (`src/scripts/story.ts`): hero camera glide, gateway doors (scroll or tap) + petal burst, two-beat names, Scene 4 charbagh with lamps lighting and paths meeting, staggered celebrations, venue settle, rising closing sun.
- [x] Tap any diya to make it flare.
- [x] Closing peacock (tap/Enter: train fans, head turns) and Scene 4 jhoola (drag, tap or Enter; damped pendulum; pushed when the paths meet).
- [x] Opt-in intro "Open with music / Open quietly" + header mute. With `music.src` empty the music is synthesised on-device (`src/scripts/music.ts`: tanpura drone + reed voice in Raag Bhupali, convolution reverb). Never autoplays; pauses when the tab is hidden.
- [x] Add to calendar (`.ics` built on-device) on celebrations and the invitation — only for events with a real date.
- [x] Vignettes: floral-courtyard, lantern-garden, mandap-courtyard, haldi, mehndi, sangeet, baraat, reception. Dev preview at `/preview/vignettes`.
- [ ] Real names/dates/venue; monogram.
- [ ] Optional: painted art for layers, 3D island, tap-to-call contacts.

## Placeholder copy to confirm
- Journey title: "Two families, one beautiful union" / "दो परिवार, एक सुंदर संगम".
- Closing line, invitation placeholder lines, UI labels (EN + HI).

## Performance (measured 2026-10-23, production build, 390×844 phone, 4× CPU slowdown, fast 4G)
| | Before | After |
|---|---|---|
| Scroll smoothness | ~10 fps, 99% janky frames | 60 fps, 0% janky, worst frame 17 ms |
| Main thread while idle (real speed) | ~97% busy | ~9% |
| English page transfer | 393 KB | 215 KB |
| First paint (throttled) | 1.8 s | 1.5–1.7 s |
| DOM elements / transformed SVG nodes | 3,834 / 1,469 | ~1,900 / 77 |

What fixed it — keep these rules when adding art:
- **No mass `<use transform>` / per-dot elements.** Repeated motifs (petals, leaves, beads) are baked into one `<path>` per colour (`Buckets`, `bloomPath`, `leafPath`, `dot` in `src/lib/art.ts`). Thousands of transformed nodes made Chrome re-layerize the whole page every animated frame.
- **Heavy art is defined once** as `<symbol>` in `SceneDefs` (palace, two foliage variants) and reused.
- **Animate HTML wrappers, not SVG internals or SVG roots.** Diya = 3 stacked SVG layers (halo/flame/bowl); lanterns sit in a `<span>`. Only `transform`/`opacity` animate; ripples move by `transform`, never `background-position`.
- **Off-screen sections pause their CSS loops** (`data-offscreen`, set in `scripts/story.ts`).
- **Fonts via per-weight fontsource files** (they carry `unicode-range`); per-subset files claim every character and make English pages download Devanagari.
