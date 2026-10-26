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
| `/`, `/hi/` | Nature & Stories: the scroll journey (EN / HI) |
| `/invitation`, `/hi/invitation` | Full printable invitation (family names, schedule, hosts) |
| `/invite-links` | For you: make personal links (`/?to=Sharma Parivar`) that greet each family by name |
| `/royal`, `/nature` (+ `/invitation`, `/hi/…`) | Old preview links; they forward to the pages above |

## Replacing placeholder data
**Step-by-step list of everything left to fill in: [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)**

Edit **only** `src/data/site-content.json`:
- `couple.*` — names (the `displayName` must keep ` & ` / ` एवं ` between partners).
- `site.weddingDate` — real `YYYY-MM-DD` turns on the countdown.
- `venue.mapUrl` — an `https://` link turns on the map and directions.
- `rsvp.whatsapp` — the number RSVPs and blessings are sent to (with country code). The RSVP form writes the WhatsApp message for the guest; `rsvp.deadline` adds "Kindly reply by…".
- `contacts[]` — family contacts; Call / WhatsApp buttons appear once a real number is set.
- `photos.albumUrl` — a shared album link adds "Share your photos" to the final note.
- `venue.notes` — parking / entrance lines for the venue preview.
- `events[]` — `date`, `time` (`HH:MM`), `title`, `shortDescription`, `visualKey` (`haldi`, `mehndi`, `sangeet`, `varmala`, …; see PROJECT_GUIDE §5). A real date also adds an *Add to calendar* button.
- `music.enabled` — shows the header music button. `music.src` empty = music generated in the browser; or put an audio file in `public/` and set its path.
- `invitation.placeholders.*` — replace with approved family / invocation / host text.
- `invitation.downloadUrl` — adds a download button on the invitation page.

Chapter copy (headings, keepsakes, wishes) is in `src/lib/nature-content.ts`. Unconfigured actions stay hidden.

## Structure
```
src/
  data/site-content.json     content model (bilingual)
  assets/nature-stories/     painted scenes (the build emits AVIF/WebP)
  lib/                       content helpers, chapter copy, scroll-pose maths
  components/nature/         Home, Invitation, Header, every chapter, camera bridges
  components/scene/          shared SVG defs and bougainvillea
  scripts/                   scroll scenes, envelope, music, interactions
  styles/                    tokens.css, global.css, nature.css
```
See `IMPLEMENTATION_NOTES.md` for architecture decisions and milestone status.
