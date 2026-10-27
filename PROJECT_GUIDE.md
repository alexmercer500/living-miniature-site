# Living Miniature — Project Guide

The complete reference for this project: what it is, how to run it, how it works, and how to change it.

> **Private project for Ratnesh.** Content, assets and screenshots stay on your own machines unless you decide otherwise. The site makes **no external requests**: fonts and painted art are self-hosted, music is generated in the browser. There are no analytics, trackers or embeds.

---

## 1. What this is

A mobile-first, bilingual (**English / हिंदी**) Indian wedding invitation website, **Nature & Stories**: a scroll-driven journey through painted garden scenes (a sunset terrace, two paths meeting, a letter on the table, the celebrations, the venue, a wishing garden and a final note), joined by cinematic camera moves.

- **Scroll drives the story**; taps add small delights (the lantern, petals, keepsakes, the wax seal, the wishing tags).
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
| `npm run dev` | Dev server with live reload at `http://localhost:4321`. |
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
| `/invite-links` | **For you only** (not linked, not indexed). Paste family names, get a personal link for each, ready to copy or send on WhatsApp. |
| `/royal`, `/nature` (and their `/invitation`, `/hi/…` forms) | Old links from earlier theme previews. They forward to the pages above, keeping any `#section`. |

The **EN | हिंदी** toggle switches routes and keeps your place (it carries the current section as `#hash`).

---

## 4. The experience, scene by scene

| # | Scene (`#id`) | What happens | Interaction |
|---|---|---|---|
| — | **Opening veil** | The welcome painting, out of focus at dusk, with drifting lantern light; the gold lotus draws itself and the monogram appears. When the painting and fonts are ready (a few seconds at most; skipped on revisits in the same tab) the dusk clears and the camera pulls focus into the sharp scene. | — |
| 1 | **Welcome** (`#welcome`) | A sunset garden terrace under a flowering tree; the names arrive line by line. | Tap the hanging lantern to warm it; tap ✿ for a petal burst. Tilt the phone (or move the mouse) for depth. |
| 2 | **Our journey** (`#journey`) | The camera glides from the terrace onto two paths that meet under a pergola. Three hanging keepsakes. | Tap a keepsake to open its little story. |
| 3 | **The letter** (`#invitation`) | An envelope on the garden table. Scrolling breaks the wax seal, opens the flap and raises the card. | Tap the seal to open or close it; "View full invitation". |
| 4 | **Celebrations** (`#celebrations`) | One painted card per event, with date, time and a short line. | **Add to calendar** (only when the event has a real date). |
| 5 | **Venue** (`#venue`) | A lantern-lit garden approach with three signs: the venue, directions and a preview. | Map / directions (only when `venue.mapUrl` is set). |
| 6 | **Wishes** (`#wishes`) | Six decorative blessing tags in a lantern garden, a countdown, and RSVP. | Touch a tag to make it flutter. Countdown and RSVP show only once configured. |
| 7 | **A final note** (`#closing`) | Ivory stationery on the closing terrace with the thank-you line. | Back to the beginning, or the full invitation. |

Between chapters a fixed "camera" carries you from one painting into the next (zoom, a leafy reveal edge with a gold rim, drifting petals, a sweep of late light, out-of-focus bougainvillea passing the lens).

Always available: header (monogram, language toggle, music button, menu), a bottom dock (Our journey · Venue · Invitation), a reading-progress line, and a "Skip to content" link for keyboards.

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
| `couple.tagline` | Line under the names on the invitation page | — |
| `venue.name`, `venue.address` | Venue card | — |
| `venue.mapUrl` | An `https://` map link (the venue is confirmed) | **View map**, plus **Get directions** built from the venue name and address |
| `venue.notes` | Short lines (parking, entrance, landmark) per language | Shown in the **Explore venue** preview |
| `rsvp.enabled` | `true` | **RSVP** button and form in the Wishes chapter. The form writes a WhatsApp message for the guest; nothing is stored. |
| `rsvp.whatsapp` | The number replies go to, with country code (`919812345678`). Empty = WhatsApp asks the guest which chat to use. | — |
| `rsvp.deadline` | `YYYY-MM-DD` | "Kindly reply by …" in the RSVP form |
| `rsvp.url` | Optional external form (Google Form etc.) | Replaces the WhatsApp form with a link to it |
| `contacts[]` | `name`, `role` (EN/HI), `phone`, `whatsapp` | **Call / WhatsApp** buttons in the RSVP form and on the invitation page, once a real number is set |
| `photos.albumUrl` | A shared album link (Google Photos, Drive) | **Share your photos** on the final note |
| `invitation.downloadUrl` | Path/URL of a PDF or image card | **Download invitation** button |
| `invitation.placeholders.*` | Invocation, blessings, family lines, hosts on the invitation page | — |
| `events[]` | `id`, `date` (`YYYY-MM-DD`), `time` (`HH:MM`, optional), `title`, `shortDescription`, `visualKey`, `venueName` | **Add to calendar** per event with a real date |
| `closing.line` | Thank-you line in the final note | — |
| `music.enabled` | Show the music button in the header | — |
| `music.src` | Empty = music generated in the browser. Or put an audio file in `public/` (e.g. `public/shehnai.mp3`) and set `"/shehnai.mp3"`. | — |
| `ui.en` / `ui.hi` | Every button, label and accessibility string | — |

**Event paintings (`visualKey`):** `haldi` / `floral-courtyard` (haldi canopy) · `mehndi` / `sangeet` / `lantern-garden` (evening garden) · `varmala` / `mandap-courtyard` (wedding mandap). Any other key shows the mandap.

### Placeholder copy written for you (change freely)
- Chapter copy lives in `src/lib/nature-content.ts` (EN + HI): headings, keepsakes, wishes, hints.
- Closing line, invitation placeholder lines, and the extra UI labels (EN + HI). The Hindi UI strings are worth a native speaker's read.

---

## 6. How it's built

### Stack (exact versions are pinned)
| Package | Version | Role |
|---|---|---|
| astro | 7.4.2 | Static site generator. Pages render to plain HTML at build time. |
| gsap | 3.15.0 | Scroll choreography (ScrollTrigger). Loaded on demand, skipped under reduced motion. |
| @fontsource-variable/fraunces | 5.3.0 | English headings (soft, warm serif; "soft" axis file) |
| @fontsource-variable/jost | 5.3.0 | English text, buttons and spaced capital labels |
| @fontsource/great-vibes | 5.3.0 | Script accents: "One journey." and the couple's names |
| @fontsource/mukta | 5.3.0 | Hindi text (Devanagari) |
| @fontsource/tiro-devanagari-hindi | 5.3.0 | Hindi headings |
| sharp | 0.35.5 | Build-time blurred previews of the paintings |

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
│  └─ other-theme-concepts/  alternative theme write-ups and shared feature ideas
├─ tests/                    unit tests (`node --test tests/*.test.mjs`) and browser checks (`tests/*-browser.mjs`)
└─ src/
   ├─ data/site-content.json     ← ALL guest-facing content (EN + HI)
   ├─ assets/nature-stories/     the painted scenes (PNG sources; the build emits AVIF/WebP) + prompts
   ├─ lib/
   │  ├─ content.ts              typed content helpers: t(), loc(), href(), formatDate(), feature checks
   │  ├─ nature-content.ts       chapter copy (EN + HI)
   │  ├─ nature-assets.ts        which painting each scene and event uses
   │  ├─ *-state.ts              pure maths for every scroll pose (unit-tested)
   │  └─ art.ts, random.ts       procedural bougainvillea, seeded so it renders identically every build
   ├─ layouts/Base.astro         <html>, meta tags, fonts, shared SVG defs
   ├─ pages/                     routes: index, invitation, hi/*, and [...retired] forwards for old links
   ├─ components/
   │  ├─ nature/                 Home, Invitation, Header and every chapter (Envelope, Keepsakes, Celebrations,
   │  │                          Venue, Wishes, FinalNote), Art (responsive paintings), ScenePlate (each
   │  │                          chapter's painting and its handoff)
   │  ├─ scene/                  SceneDefs (shared gradients + foliage symbols), Foliage
   │  └─ CalendarButton, Icon, Monogram, LotusMark
   ├─ scripts/
   │  ├─ nature.ts               wires the home page: chapters, sound, countdown
   │  ├─ envelope.ts             the letter; keepsakes.ts, venue.ts, wishes.ts   chapter interactions
   │  ├─ music.ts                opt-in music: file player or Web Audio synth, with a mood per chapter
   │  └─ calendar.ts, haptics.ts, tilt-parallax.ts, invitation-morph.ts
   └─ styles/tokens.css, global.css, nature.css   design tokens, shared base, the Nature theme
```

### Typography
- Fonts are set once in `src/styles/tokens.css` (`--font-display`, `--font-ui`, `--font-script`). Hindi pages put the Devanagari fonts first.
- Script is only for large romantic accents (hero "One journey.", the names on the envelope card, Final Note and invitation page); never for small labels.
- Text never sits bare on a busy part of a painting: dark text gets a soft warm haze behind it, light text a soft dusk shade (end of `nature.css`).

### Art system
- Each scene is a **painted image** in `src/assets/nature-stories/`, with a portrait (mobile) and landscape (desktop) version. `Art.astro` turns each into responsive AVIF/WebP; only the first scene loads eagerly.
- Names, dates, buttons and every word are real HTML on top of the paintings, never baked into them.
- **Loading:** every painting first paints as an inline, ~1.5 KB blurred preview of itself (`src/lib/art-preview.ts`, built with sharp), so a slow connection shows a soft version of the real scene, never a placeholder design. If a painting fails to load, its preview stays.
- Small living details are drawn in code: the lantern, petals, festoon bulbs, the wax seal, the bougainvillea fronds (`SceneDefs.astro` symbols).

### Animation system
- CSS handles small ambient loops (lantern sway, candle flicker, drifting petals), all gated by `prefers-reduced-motion`.
- **Chapter handoffs need no script.** Each chapter's painting sits in a `ScenePlate`: a sticky camera that holds the painting still while its chapter is on screen, so the chapter's own top edge reveals it over the one before. The browser does this on its scrolling thread, so a handoff can never lag behind the finger, show the next chapter early or snap in late (the previous script-driven cameras did all three on phones).
- On top of that, CSS scroll-driven animations (`animation-timeline: --scene`) add the feathered leafy band, gold rim, petals, light sweep, the settle/push-in of the paintings and the arrival of each chapter's cards and copy. Browsers without scroll timelines get a clean hard-edged reveal and still content. Write those rules with longhands (`animation-name`, `animation-timeline`, …): the CSS minifier folds a longhand timeline into the `animation` shorthand, which browsers reject; `nature-static.test.mjs` guards this.
- The envelope is the one scroll scene still driven by script (`envelope.ts`, a light follow of the scroll position, idle when not scrolling). GSAP is only fetched as a fallback for the reading-progress line in browsers without scroll timelines.
- Markup always ships in its **final**, readable state; scripts add motion on top. Chapters scrolled off-screen pause their loops (`data-offscreen`).

### Music
- Never autoplays; starts only from the header speaker button, with a visible mute.
- With `music.src` empty, `music.ts` synthesises a tanpura drone (Pa–Sa–Sa–Sa) and a reed voice playing slow **Raag Bhupali** phrases with reverb. Each chapter shifts the mood (tabla for celebrations, wind-chime bells for wishes, a brighter tone at the end).
- Pauses when the tab is hidden.

### Languages
- Routes: `/` (EN) and `/hi/` (HI). Hindi pages switch display fonts and line-heights via `:lang(hi)`.
- Add or change any label in `ui.en` / `ui.hi`; components read them with `t(lang, 'key')`.
- To add a third language you'd add the locale to `content.ts`, strings to the JSON, and `src/pages/<code>/` routes mirroring `hi/`.

---

## 7. Performance

Measured on the production build, emulating a mid-range phone (4× slower CPU), the camera moves run at a 16.7 ms median frame on most transitions. See `IMPLEMENTATION_NOTES.md` for the full record. Check on real phones before launch.

**Keep these rules when adding art or motion** (they're what made it fast):
1. Animate only `transform` and `opacity`, written directly on the layer that moves. Never change masks, filters, gradients or CSS variables inherited by large subtrees every frame.
2. Give paintings explicit `width`/`height` (Art.astro does) and keep below-the-fold art lazy.
3. Define repeated SVG art once as a `<symbol>` in `SceneDefs.astro` and `<use>` it.
4. Import fonts with the per-weight fontsource files (e.g. `@fontsource/mukta/400.css`), not per-subset files.

---

## 8. Accessibility

- Semantic headings, landmarks and real buttons and links. Every interactive item is keyboard-reachable with a visible focus ring. Touch targets are at least 44px.
- Language toggle is a labelled nav with `aria-current`. The menu is a native `<details>` (works without JS, closes with Esc).
- Reduced-motion users get static scenes. All art is decorative (`aria-hidden`); the lantern, petals, keepsakes, seal and wishing tags are labelled buttons.
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
| Music silent | Phones need the tap (that's by design). Check the phone's silent switch and the header speaker button. |
| "Add to calendar" / countdown / map / RSVP missing | They appear only once real values are set (see section 5). |
| Changes to the JSON don't show | Save the file; if the dev server was stopped, run `npm run dev` again. |

---

## 11. Roadmap / ideas not built yet

- **Real details**: names, dates, events, venue, map link, RSVP method, family lines, monogram.
- **Quick Info mode** for elders: one large-text screen with every event, venue and call buttons.
- **Personalised guest links** (`/?to=sharma-parivar`) that greet the family and show only their events.
- **WhatsApp preview image** (1200×630) drawn from the same art.
- **"Today" mode** highlighting the current or next event on the wedding days.
- **Hidden names in the mehendi** easter egg; **colour world per ceremony** with a gulal burst; **offline support** for patchy venue networks.
- Optional: a third language (e.g. Chhattisgarhi), story moments ("how we met") in the keepsakes, tap-to-call contacts.

More background on these ideas: `design-kit/other-theme-concepts/00-README-start-here.md`.
