# Living Miniature — Project Guide

The complete reference for this project: what it is, how to run it, how it works, and how to change it.

> **Private project for Ratnesh.** Content, assets and screenshots stay on your own machines unless you decide otherwise. The site makes **no external requests**: fonts are self-hosted, art is drawn in code, music is generated in the browser. There are no analytics, trackers or embeds.

---

## 1. What this is

A mobile-first, bilingual (**English / हिंदी**) Indian wedding invitation website that feels like scrolling through a *living miniature painting*: a dusk palace on a lotus lake, carved gateways, a charbagh garden, lantern-lit celebrations and a closing sunrise with a peacock.

- **Scroll drives the story**; taps add small delights (diyas, doors, swing, peacock).
- **Content is sparse on purpose.** Family names, rituals and hosts live on a separate, printable **invitation page**.
- **All names, dates and venues are placeholders** (`Partner One & Partner Two`, `YYYY-MM-DD`, etc.). Nothing real has been filled in.

---

## 2. Quick start (home system)

### Requirements
| Tool | Version |
|---|---|
| **Node.js** | **22.23.4 or newer** (developed on 24.14). Check with `node -v`. |
| npm | 9.6.5+ (comes with Node) |
| OS | Windows, macOS or Linux |

If your Node is older, install the current LTS from nodejs.org, or with a version manager run `nvm use` (the project has an `.nvmrc` set to 24).

### Install and run
```bash
# 1. extract the zip, then open a terminal in the extracted folder
cd living-miniature-site

# 2. install exact, locked dependencies (uses package-lock.json)
npm ci            # or: npm install

# 3. start the dev server
npm run dev       # → http://localhost:4321
```

### All commands
| Command | What it does |
|---|---|
| `npm run dev` | Dev server with live reload at `http://localhost:4321`. Shows dev-only hints for unconfigured content. |
| `npm run build` | Builds the static site into `dist/`. |
| `npm run preview` | Serves the built `dist/` locally to check the production version. |

To see the site on your phone over Wi-Fi: `npm run dev -- --host`, then open the "Network" URL it prints.

---

## 3. Pages

| URL | Page |
|---|---|
| `/` | The cinematic journey, in English |
| `/hi/` | The same journey, in Hindi |
| `/invitation` · `/hi/invitation` | The full, printable invitation card (family names, schedule, venue, hosts) |
| `/preview/vignettes` | **Dev only.** Gallery of all event illustrations, to choose a `visualKey` per event. Redirects home in a production build. |

The **EN | हिंदी** toggle switches routes and keeps your place (it carries the current section as `#hash`).

---

## 4. The experience, scene by scene

| # | Scene | What happens | Interaction |
|---|---|---|---|
| — | **Intro card** | "Open with music / Open quietly". Shown once per browser session; skipped on deep links. | Choosing music starts it; Esc or "quietly" closes. |
| 1 | **Landing** | Dusk palace on a lotus lake, bougainvillea, lanterns, light strings, floating diyas, drifting petals. On scroll the "camera" glides forward: palace grows, flowers part, names drift away. | Tap a diya: it flares. "Skip intro" jumps to Celebrations. |
| 2 | **Gateway** | Vermilion lacquer doors with brass studs and jaali panels over an ivory arch, under a marigold toran. | Opens with scroll, or **tap** ("Tap to open") with a petal burst. |
| 3 | **Names** | Names arrive in two beats behind the doors, then the date line and "View full invitation". | — |
| 4 | **Two paths, one celebration** | A charbagh garden: two light trails rise from the corners, lamps kindle one by one, the paths meet at a lotus pool; the pavilion lights up, the fountain appears. A garlanded **jhoola** hangs from a neem tree. | **Drag / tap / Enter** the swing. It gets a gentle push when the paths meet. |
| 5 | **Celebrations** | Each event is a jharokha window onto its own little scene, with date, title and a short line. | **Add to calendar** (only when the event has a real date). |
| 6 | **Venue** | The palace at twilight with lanterns; venue name and address card. | View map / Get directions (only when `venue.mapUrl` is set). |
| 7 | **Countdown & RSVP** | Days / hours / minutes / seconds and an RSVP button. | Shown only when a real wedding date / RSVP link is configured. |
| 8 | **Closing** | The sun rises over the lake; thank-you line, monogram, invitation button. A **peacock** rests at the water's edge. | **Tap / Enter** the peacock: its train fans and it turns its head. |

Always available: header (monogram, language toggle, music button, menu), a bottom **action bar** (Venue · Invitation · RSVP) after the landing, and a "Skip to content" link for keyboards.

**Reduced motion** (OS setting) and **no-JavaScript** visitors see every scene in its finished state, with no scroll animation.

---

## 5. Editing content: one file

Everything a guest reads comes from **`src/data/site-content.json`**. Edit it, save, and the dev server reloads.
Every visible string has an `en` and `hi` version.

| Field | Purpose | Turns on… |
|---|---|---|
| `site.title`, `site.description` | Browser title and link-preview text (English) | — |
| `site.weddingDate` | `YYYY-MM-DD` | **Countdown** (only for a real date) |
| `site.weddingDateLabel` | Text shown while the date is unknown | — |
| `couple.partnerOne`, `couple.partnerTwo` | First letters build the **monogram** | — |
| `couple.displayName` | Names as displayed. **Keep ` & ` (EN) and ` एवं ` (HI) between the two names**: the layout splits on them. | — |
| `couple.tagline` | Welcome line on the landing | — |
| `journey.title` | Scene 4 heading | — |
| `venue.name`, `venue.address` | Venue card | — |
| `venue.mapUrl` | An `https://` map link | **View map / Get directions** |
| `rsvp.enabled` + `rsvp.url` | `true` + an `https:`, `mailto:` or `tel:` link | **RSVP** button, menu item, action-bar button, RSVP section |
| `invitation.downloadUrl` | Path/URL of a PDF or image card | **Download invitation** button |
| `invitation.placeholders.*` | Invocation, blessings, family lines, hosts on the invitation page | — |
| `events[]` | `id`, `date` (`YYYY-MM-DD`), `time` (`HH:MM`, optional), `title`, `shortDescription`, `visualKey`, `venueName` | **Add to calendar** per event with a real date |
| `closing.line` | Thank-you line in the closing scene | — |
| `music.enabled` | Show the intro card and the music button | — |
| `music.src` | Empty = music generated in the browser. Or put an audio file in `public/` (e.g. `public/shehnai.mp3`) and set `"/shehnai.mp3"`. | — |
| `ui.en` / `ui.hi` | Every button, label and accessibility string | — |

**Event illustrations (`visualKey`):** `floral-courtyard` · `lantern-garden` · `mandap-courtyard` · `haldi` · `mehndi` · `sangeet` · `baraat` · `reception`. Preview them at `/preview/vignettes`.

**While running `npm run dev`**, a dashed note marks where an unconfigured action (map, countdown, RSVP) will appear. These notes never appear in the built site.

### Placeholder copy written for you (change freely)
- Journey title: "Two families, one beautiful union" / "दो परिवार, एक सुंदर संगम"
- Closing line, invitation placeholder lines, and the extra UI labels (EN + HI). The Hindi UI strings are worth a native speaker's read.

---

## 6. How it's built

### Stack (exact versions are pinned)
| Package | Version | Role |
|---|---|---|
| astro | 7.4.2 | Static site generator. Pages render to plain HTML at build time. |
| gsap | 3.15.0 | Scroll choreography (ScrollTrigger). Loaded on demand, skipped under reduced motion. |
| @fontsource/cormorant-garamond | 5.3.0 | English display serif (names, headings) |
| @fontsource/mukta | 5.3.0 | Interface font, Latin + Devanagari |
| @fontsource/tiro-devanagari-hindi | 5.3.0 | Hindi display serif |

No UI framework, CSS framework, icon library, React or 3D engine.

### Folder map
```
living-miniature-site/
├─ PROJECT_GUIDE.md          ← this file
├─ README.md                 short setup + content notes
├─ IMPLEMENTATION_NOTES.md   decisions, progress, performance record
├─ package.json / package-lock.json / .nvmrc
├─ astro.config.mjs          set `site` to your real domain before deploying
├─ public/favicon.svg
├─ design-kit/
│  ├─ brief/                 the original Living Miniature brief (requirements, story, tokens, concept boards)
│  └─ other-theme-concepts/  the alternative theme write-ups and shared feature ideas
└─ src/
   ├─ data/site-content.json     ← ALL guest-facing content (EN + HI)
   ├─ lib/
   │  ├─ content.ts              typed content helpers: t(), loc(), href(), formatDate(), feature checks
   │  ├─ art.ts                  procedural SVG: palace, domes, arches, foliage, merged-path helpers
   │  └─ random.ts               seeded random, so art renders identically every build
   ├─ layouts/Base.astro         <html>, meta tags, fonts, shared SVG defs
   ├─ pages/                     routes: index, invitation, hi/*, preview/vignettes
   ├─ components/
   │  ├─ Home.astro              assembles the journey
   │  ├─ Invitation.astro        printable invitation card
   │  ├─ Header, ActionBar, Intro, CalendarButton, Icon, Monogram, LotusMark
   │  ├─ sections/               Hero, Reveal, Journey, Celebrations, Venue, Rsvp, Closing
   │  └─ scene/                  reusable art: SceneDefs, Diya, Lantern, Lotus, Foliage, Garland,
   │                             ArchFrame, Gate, Vignette, Peacock
   ├─ scripts/
   │  ├─ story.ts                scroll story, petal bursts, diya taps, peacock, swing, off-screen pausing
   │  ├─ music.ts                opt-in music: file player or Web Audio synth
   │  └─ calendar.ts             builds .ics files on the device
   └─ styles/tokens.css, global.css   design tokens and shared styles
```

### Art system
All illustration is **SVG drawn in code at build time**: no image files.
- `SceneDefs.astro` defines shared gradients, glows and **symbols** once per page: the palace (`#lm-palace`), two bougainvillea variants (`#lm-foliage-a`, `#lm-foliage-b`), door lacquer, vignette skies.
- The palace is reused by the landing, its water reflection, the venue, the closing and the baraat vignette.
- `Vignette.astro` holds the eight event scenes; `Journey.astro` draws the garden.
- **Colours** live in `src/styles/tokens.css` (midnight, indigo, plum, dusk rose, sunset, ivory, parchment, antique gold, vermilion, garden green, bloom pink).
- Each hero layer carries `data-layer` (sky, sun, hills, palace, water, foreground, frame), so any one can later be swapped for painted artwork without touching layout.

### Animation system
- CSS handles small ambient loops (lantern sway, diya flicker, petals, ripples), all gated by `prefers-reduced-motion`.
- `story.ts` loads GSAP only when motion is allowed and drives every scroll scene. Markup always ships in its **final** state; the script rewinds and plays it.
- Sections scrolled off-screen pause their CSS loops (`data-offscreen`).

### Music
- Never autoplays; starts only from the intro button or the header speaker button, with a visible mute.
- With `music.src` empty, `music.ts` synthesises a tanpura drone (Pa–Sa–Sa–Sa) and a reed voice playing slow **Raag Bhupali** phrases with reverb.
- Pauses when the tab is hidden.

### Languages
- Routes: `/` (EN) and `/hi/` (HI). Hindi pages switch display fonts and line-heights via `:lang(hi)`.
- Add or change any label in `ui.en` / `ui.hi`; components read them with `t(lang, 'key')`.
- To add a third language you'd add the locale to `content.ts`, strings to the JSON, and `src/pages/<code>/` routes mirroring `hi/`.

---

## 7. Performance

Measured on the production build, emulating a mid-range phone (4× slower CPU, fast 4G):

| | Result |
|---|---|
| Scrolling | **60 fps**, 0% janky frames, worst frame 17 ms |
| Main thread while idle | ~9% (real speed) |
| English page download | ~215 KB total (HTML 68 KB compressed, fonts, scripts) |
| Hindi page download | ~517 KB (Devanagari fonts are larger; they swap in without blocking) |
| First paint | ~1.5–1.7 s throttled |
| Layout shift | 0 |

**Keep these rules when adding art or motion** (they're what made it fast):
1. Don't create hundreds of small transformed SVG elements; merge repeated motifs into one `<path>` per colour (`Buckets`, `bloomPath`, `leafPath`, `dot` in `src/lib/art.ts`).
2. Define heavy art once as a `<symbol>` in `SceneDefs.astro` and `<use>` it.
3. Animate only `transform` and `opacity`, on HTML wrappers, not inside SVGs or on `<svg>` roots, and never `background-position`.
4. Import fonts with the per-weight fontsource files (e.g. `@fontsource/mukta/400.css`), not per-subset files.

---

## 8. Accessibility

- Semantic headings, landmarks and real buttons and links. Every interactive item is keyboard-reachable with a visible focus ring. Touch targets are at least 44px.
- Language toggle is a labelled nav with `aria-current`. The menu uses the native `popover` (works without JS, closes with Esc).
- Reduced-motion users get static scenes. All art is decorative (`aria-hidden`) except the peacock and swing, which are labelled buttons.
- Countdown and RSVP never show half-configured.

---

## 9. Publishing (only if and when you choose)

The build is a plain static folder (`dist/`) that any static host can serve.
1. Set `site` in `astro.config.mjs` to the final URL (it's used for canonical and language links).
2. `npm run build`, then upload the **contents** of `dist/`.
3. If the site lives in a sub-folder (e.g. `example.com/wedding/`), also add `base: '/wedding'` to `astro.config.mjs`.

Not yet done: a social preview image for WhatsApp link previews (see Roadmap).

---

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| `npm ci` / `npm run dev` complains about the Node version | Install Node 22.23.4+ (LTS 24 recommended), then reinstall. |
| "Another astro dev server is already running" | Close the other terminal, or run `npx astro dev --force`. |
| Port 4321 is busy | `npm run dev -- --port 4400` |
| Odd build errors after moving folders | Delete `node_modules`, `.astro` and `dist`, then `npm ci`. |
| Intro card doesn't appear | It shows once per browser session and not on links with `#section`. Open a new tab or a private window. |
| Music silent | Phones need the tap (that's by design). Check the phone's silent switch and the header speaker button. |
| "Add to calendar" / countdown / map / RSVP missing | They appear only once real values are set (see section 5). In `npm run dev` a dashed note shows where. |
| Changes to the JSON don't show | Save the file; if the dev server was stopped, run `npm run dev` again. |

---

## 11. Roadmap / ideas not built yet

- **Real details**: names, dates, events, venue, map link, RSVP method, family lines, monogram.
- **Quick Info mode** for elders: one large-text screen with every event, venue and call buttons.
- **Personalised guest links** (`/?to=sharma-parivar`) that greet the family and show only their events.
- **WhatsApp preview image** (1200×630) drawn from the same art.
- **"Today" mode** highlighting the current or next event on the wedding days.
- **Hidden names in the mehendi** easter egg; **colour world per ceremony** with a gulal burst; **offline support** for patchy venue networks.
- Optional: a third language (e.g. Chhattisgarhi), story moments ("how we met"), painted art for scene layers, tap-to-call contacts.

More background on these ideas: `design-kit/other-theme-concepts/00-README-start-here.md`.
