# User Flow & Cinematic Storyboard

## Narrative concept
The guest enters a small, living Indian miniature world. The website unfolds like a wedding film: the environment reveals the couple, then the shared journey, celebrations, venue, and invitation actions. Scroll advances the story; touch lets guests briefly interact with details.

The scene should be calm, richly art-directed, and emotionally warm. Do not overwhelm guests with long paragraphs or repeated family names.

## Scene 0 — First paint / graceful loading
**Visual:** Static poster / lightweight layered illustration of a palace courtyard at sunset, with a few glowing diyas and flower framing.

**Behavior:**
- Render immediately from optimized image/CSS.
- Load the interactive scene in the background.
- If WebGL is unsupported or loading fails, the static version remains.
- No mandatory loading screen longer than necessary.

## Scene 1 — Landing: “A little world, a beautiful beginning”
**Visual:** Miniature palace beside a lotus lake at sunset; lanterns glow; flowers frame the upper edges; subtle water movement.

**On-screen copy:** Placeholder couple names and one short welcome line only.

**Interaction:**
- Scroll cue at bottom.
- EN | हिंदी toggle in the top area.
- Optional tap on one diya for a glow response.
- Skip intro / Jump to details link.

**Transition:** As the guest scrolls, the camera glides forward toward a carved archway.

## Scene 2 — The invitation gateway
**Visual:** Ornate door / arch / folded invitation element within the miniature scene. A subtle gold edge catches the light.

**Interaction:**
- Tap to open the gateway, or simply scroll past it.
- Opening triggers a short petal drift and warm light change.
- Never block the user behind a required click.

**Transition:** The arch opens to a bright ivory and rose-gold reveal.

## Scene 3 — Couple-name reveal
**Visual:** Names appear on an elegant ivory panel framed by carved architecture, floral garlands, and soft sky. The text is real HTML/CSS, not part of the image.

**Copy:** `Partner One & Partner Two`; optional neutral auspicious line only if approved.

**Motion:** Names reveal in two beats with gentle opacity / mask movement; restrained petals pass behind text.

**Transition:** The two sides of the scene move toward a shared central courtyard.

## Scene 4 — “Two paths, one celebration”
**Visual:** Two garden paths / architectural wings meet at a central palace courtyard. Avoid implying specific personal biography; it is a symbolic visual transition.

**Interaction:**
- Tap a flower cluster to release a short, low-count petal animation.
- Optional hanging swing / ornament responds to a small drag without preventing scroll.
- Use short animation durations and clear touch boundaries.

**Transition:** The courtyard lights illuminate, revealing event vignettes.

## Scene 5 — Celebration vignettes
**Visual:** Up to 3–4 small scenes: floral courtyard, mehndi-inspired green corner, procession lights, and the main wedding mandap. These should feel like rooms or windows into the same miniature world, not four unrelated cards.

**Content:** Each event shows only a short title, date, and optional time. Full rituals and family details live in the separate invitation.

**Interaction:**
- Tap a vignette to focus / expand it or reveal its short details.
- The user can also continue scrolling past all events.
- Avoid horizontal carousels that hide events unless a clear alternative is provided.

**Transition:** A line of lanterns guides the camera toward the venue.

## Scene 6 — Venue reveal
**Visual:** The miniature palace / venue is shown in a clear, beautiful wide composition with a map pin motif.

**Content:** Venue name, concise address, `View map` / `Get directions`.

**Interaction:** Buttons open configured map URLs in a safe, expected way. The venue details remain visible outside the canvas for accessibility and reliability.

## Scene 7 — Countdown & RSVP
**Visual:** Twilight sky, glowing lamps, palace silhouette, restrained floating lanterns.

**Content:** Countdown only when a valid date is configured; RSVP button only when an RSVP destination is configured.

**Interaction:**
- Countdown updates accessibly and does not dominate the scene.
- RSVP is a real link/button, not a decorative element.
- If no RSVP endpoint is configured, hide the action rather than invent one.

## Scene 8 — Closing note
**Visual:** Sunset returns; a peacock or small garden detail rests at the edge of the water; a few lamps float on the lake.

**Content:** Short thank-you / warm welcome line and couple names.

**Actions:** `View full invitation`, `Venue directions`, optional `Back to beginning`.

## Separate full invitation view
This is a distinct route, modal, or printable card view. It can contain all approved family names, complete ceremony details, host information, and longer cultural wording. It must not be a prerequisite for the main experience.

## Interaction map
| Element | Input | Result | Fallback |
|---|---|---|---|
| Language toggle | Tap / keyboard | Switch all interface strings | Default language remains readable |
| Scroll narrative | Scroll / keyboard | Advance through story scenes | Normal document sections |
| Diya | Tap / click / keyboard | Glow intensifies briefly | CSS glow on static illustration |
| Petals | Tap / brush | Short petal drift | Simple CSS animation |
| Swing / hanging detail | Drag (optional) | Small, bounded sway | Gentle looping / static detail |
| Event vignette | Tap / click / keyboard | Reveal event essentials | Direct visible event details |
| Map button | Tap / click | Open configured map | Display address text |
| RSVP button | Tap / click | Open configured RSVP | Hide if unconfigured |
| Skip intro | Tap / click / keyboard | Jump to essentials | Always available |
