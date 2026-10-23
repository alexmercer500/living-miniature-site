# Living Miniature — Wedding Website

A mobile-first, bilingual (English / हिंदी) Indian wedding invitation site built with Astro.
Design brief: `design-kit/brief/`.

**Full documentation: [PROJECT_GUIDE.md](PROJECT_GUIDE.md)**: setup, scenes, content editing, architecture, performance, troubleshooting, roadmap.

## Setup
```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the build
```
Requires Node 22.23+.

## Routes
| Path | Content |
|---|---|
| `/`, `/hi/` | Cinematic journey (EN / HI) |
| `/invitation`, `/hi/invitation` | Full printable invitation (family names, schedule, hosts) |

## Replacing placeholder data
Edit **only** `src/data/site-content.json`:
- `couple.*` — names (the `displayName` must keep ` & ` / ` एवं ` between partners).
- `site.weddingDate` — real `YYYY-MM-DD` turns on the countdown.
- `venue.mapUrl` — an `https://` link turns on *View map / Get directions*.
- `rsvp.enabled` + `rsvp.url` — turns on the RSVP button (section, menu and action bar).
- `events[]` — `date`, `time` (`HH:MM`), `title`, `shortDescription`, `visualKey`: `floral-courtyard` | `lantern-garden` | `mandap-courtyard` | `haldi` | `mehndi` | `sangeet` | `baraat` | `reception` (preview them at `/preview/vignettes` while running `npm run dev`). A real date also adds an *Add to calendar* button.
- `music.enabled` — shows the *Open with music / Open quietly* intro and a mute button. `music.src` empty = music generated in the browser; or put an audio file in `public/` and set its path.
- `journey.title` — the Scene 4 heading.
- `invitation.placeholders.*` — replace with approved family / invocation / host text.
- `invitation.downloadUrl` — adds a download button on the invitation page.

Unconfigured actions are hidden in production; in `npm run dev` a dashed note shows where they will appear.

## Structure
```
src/
  data/site-content.json     content model (bilingual)
  lib/content.ts             typed content + i18n helpers
  lib/art.ts                 procedural SVG (palace, domes, arches, foliage)
  components/scene/          reusable art: SceneDefs, Lantern, Diya, Lotus, Foliage, Garland, ArchFrame, Vignette
  components/sections/       Hero, Reveal, Celebrations, Venue, Rsvp, Closing
  components/                Header, ActionBar, Home, Invitation, icons
  styles/                    tokens.css, global.css
```
See `IMPLEMENTATION_NOTES.md` for architecture decisions and milestone status.
