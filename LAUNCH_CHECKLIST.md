# Launch checklist

Everything still to do before the invitation goes out: placeholder text, images and
configuration. Work top to bottom; tick items off as you go.

Most of it is one file: **`src/data/site-content.json`**. Every text there has an `en` and an
`hi` version. Fill in both. Run `npm run dev` and open http://localhost:4321 (and `/hi/`) to see each
change as you make it.

---

## 1. Must do before sharing any link

These break or mislead guests if they are left as they are.

- [ ] **Real web address.** In `astro.config.mjs`, change `site: 'https://example.com'` to the real
      domain (e.g. `https://priya-and-arjun.in`). The WhatsApp link preview, the language
      links and search tags all use it.
- [ ] **RSVP number.** `rsvp.whatsapp` is the number RSVPs and blessings go to. Use the full number
      with country code, e.g. `919812345678` (`+91 98123 45678` also works). If it stays empty,
      WhatsApp asks each guest which chat to send to.
- [ ] **Couple names.** See section 2.
- [ ] **Dates, times and venue.** See section 2.
- [ ] **Delete** the `"_placeholderNotice"` line at the bottom of `site-content.json`.

---

## 2. Text in `src/data/site-content.json`

### Couple
- [ ] `couple.partnerOne`, `couple.partnerTwo`: first names. Their first letters make the
      monogram in the header and on the opening veil.
- [ ] `couple.displayName.en` and `.hi`. Keep ` & ` (EN) and ` एवं ` (HI) between the two names;
      the layout splits the names there.
- [ ] `couple.tagline`: the line under the names on the invitation page. It is also the Hindi
      link-preview text.

### Site and wedding date
- [ ] `site.description`: the English link-preview text. The tab and preview title is made
      from `couple.displayName` + "Wedding Invitation", so it updates with the names. Update
      `site.title` to match anyway.
- [ ] `site.weddingDate`: as `YYYY-MM-DD`. A real date turns on the countdown in the RSVP
      section and shows the date in the footer and on the envelope card.
- [ ] `site.weddingDateLabel`: **this is the date line under the names on the opening screen**, and
      it is shown exactly as written. Change it from "to be confirmed" to the date as you want it
      read, e.g. `"14 February 2027 · Udaipur"`.

### Venue (one venue for all events)
- [ ] `venue.name`, `venue.address`: the full address. **Get directions** is built from these
      two, so the address must be exact enough for Google Maps to find it.
- [ ] `venue.mapUrl`: the Google Maps share link of the venue. **View map** and **Get directions**
      stay hidden until this is set.
- [ ] `venue.notes.en` / `.hi`: short lines shown under **Explore venue**, such as parking,
      entrance gate or a landmark. Replace the bracketed lines, or set to `[]` to show none.

### Events (the Celebrations section)
For each of the three events:
- [ ] `date`: as `YYYY-MM-DD`. A real date adds the **Add to calendar** button and shows a
      **Today** badge on that day.
- [ ] `time`: 24-hour `HH:MM`, e.g. `"19:00"`, which shows as "7:00 pm". Anything else, like
      `"After sunset"`, is shown exactly as typed.
- [ ] `title`, `shortDescription`: e.g. Haldi, Mehndi & Sangeet, Wedding.
- [ ] `venueName`: keep it the **same as `venue.name`**. If it differs, the card shows it as a
      separate place line.
- [ ] `visualKey` picks the painting: `haldi` (yellow canopy), `mehndi` / `sangeet` (evening lights)
      or `varmala` (mandap). The current keys already map correctly.

The section is designed for three events. If you add or remove one, check the layout on a phone.

### RSVP
- [ ] `rsvp.whatsapp`: see section 1.
- [ ] `rsvp.deadline`: as `YYYY-MM-DD`. Adds "Kindly reply by …" to the form; leave empty for none.
- [ ] `rsvp.url` (optional): only if you would rather use a Google Form. It replaces the WhatsApp
      form with a link to that form.

### Family contacts
- [ ] `contacts[]`: two placeholder entries. For each one, fill in `name`, `role`, `phone`
      (for the **Call** button) and `whatsapp` (for the **WhatsApp** button), with country code.
      A contact appears only once it has a real number. Delete an entry you don't need, or copy
      one to add another.

### Full invitation page (`/invitation`)
- [ ] `invitation.placeholders.invocation`: the opening blessing line (e.g. श्री गणेशाय नमः).
- [ ] `invitation.placeholders.blessings`: "With the blessings of …".
- [ ] `invitation.placeholders.familyOne` / `familyTwo`: the family names on each side.
- [ ] `invitation.placeholders.hosts`: hosts, plus any RSVP line for print.
- [ ] Once these hold real text, ask for the placeholder styling to be removed. They are drawn
      as tinted italic boxes (`.ns-placeholder` in `src/components/nature/Invitation.astro`), so
      they look unfinished even with real text.
- [ ] `invitation.downloadUrl` (optional): a printed-card PDF. Put the file in `public/`
      (e.g. `public/invitation.pdf`) and set this to `"/invitation.pdf"`; a **Download** button
      appears.

### Closing and extras
- [ ] `closing.line`: the message on the final note card.
- [ ] `photos.albumUrl` (optional): a shared Google Photos or Drive album. Adds **Share your
      photos** to the final note. You can also add it after the wedding.
- [ ] `music.src` (optional): leave empty to keep the soft tanpura tune made in the browser.
      To use a recording instead, put an `.mp3` in `public/` (e.g. `public/music/theme.mp3`) and
      set `"/music/theme.mp3"`. Music never plays until a guest taps the sound button.

---

## 3. Story text in `src/lib/nature-content.ts` (optional)

These are written to work as they are, but they are the place to make the site personal. Each
key has an `en` and a `hi` version.

| Where on the page | Keys |
|---|---|
| Opening screen headline | `heroOne`, `heroTwo` ("Two paths." / "One journey.") |
| Our journey | `storyTitle`, `storyIntro` |
| The three keepsake cards | `roots`/`rootsBody`, `paths`/`pathsBody`, `tomorrow`/`tomorrowBody`. A short line about how you met fits well here. |
| Letter / envelope | `letterLine`, `dear` |
| Wishes garland tags | `wishOne` … `wishSix` |
| Wishes intro | `wishes`, `wishesBody` |
| Closing | `closingOne`, `closingTwo`, `finalNoteIntro` |
| Venue notes | `mapSoon` (shown until `mapUrl` is set), `venuePreviewNote` |

`venuePreviewNote` says "An illustrated setting. Final venue details will be shared here."
Reword it once the venue is final, e.g. "See you here!".

---

## 4. Images

All paintings are in `src/assets/nature-stories/`. They are generated artwork with no real
people or real venue. Replacing them is optional; the site is complete with them.

**To replace one:** save the new image over the old file, using **the same file name and the
same shape**. The build makes the AVIF/WebP sizes, the blurred loading preview and the link
preview by itself. If the file type changes (e.g. `.png` to `.jpg`), update the import in
`src/lib/nature-assets.ts`.

| File | Shape | Size now | Keep clear (text sits here) |
|---|---|---|---|
| `hero-mobile.png` | portrait 2:3 | 1024×1536 | sky in the middle, about 22–48% down: the names |
| `hero-desktop.png` | landscape 16:9 | 1672×941 | centre-right sky: the names. Also becomes the WhatsApp link preview. |
| `journey-mobile.png` / `-desktop.png` | 2:3 / 16:9 | as above | upper middle: heading and keepsake cards |
| `letter-mobile.png` / `-desktop.png` | 2:3 / 16:9 | as above | centre tabletop: the envelope; top middle: heading |
| `venue-mobile.png` / `-desktop.png` | 2:3 / 16:9 | as above | top-left: heading |
| `wishes-mobile-v1.png` / `-desktop-v1.png` | 2:3 / 16:9 | as above | the middle: six garland tags |
| `closing-mobile.png` / `-desktop.png` | 2:3 / 16:9 | as above | upper middle sky: the final note |
| `event-haldi.png`, `event-evening.png`, `event-wedding.png` | portrait 4:5 | 1122×1402 | important details inside the central 80% |
| `ivory-floral-paper-v1.png` | 3:2 | 1536×1024 | blank centre: paper texture for the cards |

- [ ] **Keepsake cards with real photos (optional).** The three journey cards show crops of the
      paintings. To use photos of the two of you, drop `1.jpg`, `2.jpg` and `3.jpg` into
      `src/assets/keepsakes/`; no code change is needed. A missing number keeps its painting.
      Tips are in `src/assets/keepsakes/README.md`.
- [ ] **Favicon (optional).** `public/favicon.svg` is a gold lotus on Nature green. Replace the
      file if you want your own icon.

The prompts used to make every painting are in `src/assets/nature-stories/README.md`. Use them
to generate a matching replacement.

---

## 5. Hindi check

All Hindi text was written without a native speaker's review. Have someone read:
- [ ] every `hi` value in `src/data/site-content.json`, especially the RSVP, blessing and contact
      lines and `guestGreeting` (प्रिय {name},);
- [ ] every `hi` value in `src/lib/nature-content.ts`;
- [ ] the Hindi WhatsApp message in `src/pages/invite-links.astro` (the `defaults.hi` line).

The quickest way is to open `/hi/`, scroll through, then open the RSVP form and the blessing tag.

---

## 6. Before you go live

- [ ] Run the checks:
      ```bash
      npm run build
      node --test tests/*.test.mjs
      ```
      The tests read the couple's names from `site-content.json`, so they keep passing after you
      fill them in. One check blocks real names from appearing in the build while
      `_placeholderNotice` is still in the data (a guard against an early leak). Deleting that
      line, as section 1 says, turns the guard off.
- [ ] Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub
      Pages). No server or database is needed.
- [ ] On a real phone, open `/`, `/hi/`, `/invitation` and `/hi/invitation`. Check every section,
      send a test RSVP to yourself and tap **Get directions**.
- [ ] Send the site link to yourself on WhatsApp and check the preview image and title. WhatsApp
      caches previews, so test after the final domain is live.
- [ ] Open `/invite-links` to make a personal link for each family. That page is not linked from
      the site and is hidden from search engines; keep its address to yourself.

---

## Already handled; nothing to do

- Loading screen, blurred previews and image sizes are generated on every build.
- The countdown, map, directions, calendar buttons, contacts and photo button stay hidden until
  their data is real. Half-filled data never shows a broken button.
- Old `/royal` and `/nature` links forward to the current pages.
