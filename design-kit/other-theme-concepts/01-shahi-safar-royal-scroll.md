# Theme 1: Shahi Safar (शाही सफ़र), The Royal Scroll

> *"A royal proclamation, carried by a parrot, through a palace of celebrations."*

**Feel:** A Rajasthani / Mughal **miniature painting** that comes alive as you scroll. Flat jewel colours, gold borders, arches, elephants, peacocks, lotus ponds. Grand, warm and timeless. Grandparents will love it and friends will screenshot it.

---

## The story idea

In old Indian paintings, the **parrot (shuka)** is the messenger of love. It carries letters between lovers and whispers news into palace windows.

Our narrator is a parrot called **Mitthu**. The two families have entrusted Mitthu with a royal *farmaan* (proclamation): *two houses are about to become one.* Mitthu flies the guest through the palace. Each **gate and courtyard** is a chapter, and each ceremony is a celebration happening in a different part of the palace. At the end, Mitthu carries the guest's reply (RSVP) back to the families.

**Story arc:** Seal → Blessing → Proclamation → How two kingdoms met (love story) → The royal families → Walk through the palace courtyards (events) → The royal procession (Baraat) → The sacred fire (Pheras) → Night of a thousand lamps (Reception) → Mitthu flies home with your reply.

---

## Visual direction

**Palette** (miniature painting pigments):

| Role | Colour | Hex |
|---|---|---|
| Paper / background | Ivory wasli paper | `#FBF3E4` |
| Primary | Rani pink | `#D6246E` |
| Secondary | Marigold | `#F4A300` |
| Accent | Peacock teal | `#0F6E74` |
| Wedding | Sindoor red | `#B3121C` |
| Night | Royal indigo | `#1F2A5A` |
| Borders & details | Antique gold | `#C9A24A` |
| Leaves | Mughal green | `#3F7D3A` |

**Typography (Google Fonts):**
- Display: **Rozha One** (bold, Devanagari-flavoured serif) for names and headings
- Body: **Cormorant Garamond** (elegant; use the italic for poetic lines)
- Hindi / Sanskrit: **Tiro Devanagari Hindi**

**Art style:** Flat colour fills, figures in side profile, thick decorative **borders on every panel** (like a painting's frame), gold-dot patterns, scalloped arches (*jharokhas*), stylised trees and clouds. Add a subtle paper-grain texture over everything (the site you liked used a "grain" layer; same trick).

**Sound:** Soft **shehnai** opening, then a gentle santoor loop. A small "dhol hit" when the Baraat section starts.

---

## Scroll flow, scene by scene

### Scene 0: The Royal Seal (gate screen)
- **See:** A rolled scroll tied with red mauli thread and a gold wax seal stamped with your initials. Dark rani-pink background with a faint damask pattern.
- **Interaction:** *"Tap to break the seal"*, with two buttons: **Open with shehnai 🎵** / **Open quietly**. On tap, the seal cracks (small crack animation, plus a short vibration on Android), the thread falls away and the scroll unrolls downward to fill the screen.
- **Behind the scenes:** this is the loading screen; the first images load while the guest admires the seal.

### Scene 1: Shubh Aarambh (the blessing)
- **See:** Ganesh ji in miniature style inside a gold arch, flanked by two diyas and a toran of mango leaves and marigold.
- **Animation:** The arch draws itself in gold lines as you scroll (SVG stroke animation). The diya flames flicker gently. Marigold petals drift down.
- **Copy:**
  > ॥ श्री गणेशाय नमः ॥
  > *वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।*
  > *निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥*

### Scene 2: The Proclamation
- **See:** Huge carved palace doors, closed. Scroll and they **swing open** (each door rotates on its hinge as you scroll). Golden light spills out, and Mitthu the parrot flies out toward the guest.
- **Animation:** Doors open with the scroll position (scrubbed, so they follow the thumb). Mitthu flaps (Lottie) and lands on a scroll banner.
- **Copy (Mitthu speaks, in a speech scroll):**
  > *"Suniye, suniye! Hear ye, hear ye!*
  > *By the order of two loving families, it is proclaimed across all kingdoms…"*
  >
  > **[Bride]** & **[Groom]**
  > *are to be wed.*

### Scene 3: Ek Tha Raja, Ek Thi Rani (the love story)
- **See:** Four miniature-painting panels, like pages from an old illustrated manuscript, each with a gold frame and a short caption at the bottom.
- **Animation (mobile):** Each panel is pinned and *paints itself in*: first the outline, then the flat colours fill in one by one, then the gold border shimmers. Then the next panel slides up.
- **Panels (fill with your real story):**
  1. **Two Kingdoms**: Two palaces on opposite sides of a river (your two cities). *"In the kingdom of [City A] lived a [Bride] who [quirk]. Far away in [City B], a [Groom] who [quirk]."*
  2. **The First Meeting**: The two figures in a garden / market / office courtyard / phone screen glowing like a lamp. *"Destiny arranged a meeting at [place]. Neither of them knew it yet."*
  3. **Letters & Messages**: Mitthu flying back and forth between the two palaces carrying letters (or chat bubbles in miniature style; it's funny when the old art style meets modern phones). *"Many messages were exchanged. Mitthu was very tired."*
  4. **The Families Meet**: Two family groups seated on a carpet, with tea and sweets in the middle. *"The elders met, the tea was approved, and the laddoos were distributed."*

### Scene 4: The Royal Families
- **See:** A palace facade with two **jharokha windows** (the ornate balcony windows), one per family.
- **Animation:** Each window's lattice shutters open as you scroll, revealing the parents' portraits (illustrated, or just names in gold).
- **Copy:**
  > *With the heavenly blessings of*
  > **Late Shri [Grandfather] & Late Smt. [Grandmother]**
  >
  > **[Bride]**, daughter of Smt. [Mother] & Shri [Father], [City]
  > **[Groom]**, son of Smt. [Mother] & Shri [Father], [City]
  >
  > *request the honour of your presence*

### Scene 5: Walk Through the Palace (the events)
The camera "walks" forward through a series of **arched gateways**. Each arch frames a courtyard in a new colour world, and passing through an arch is the transition (the arch zooms toward you until you pass through it). Each courtyard ends with an **event card**: a small framed miniature card with date, time, venue, dress code (shown as a colour swatch), **📍 Directions** and **📅 Add to calendar**.

| Courtyard | Colour world | What animates | Card line |
|---|---|---|---|
| **Haldi Aangan** (turmeric courtyard) | Turmeric yellow, marigold | Marigold petals rain from the top; a brass bowl of haldi; yellow handprints appear on the arch as you scroll | *"Come stained in yellow, leave covered in blessings."* · Dress: yellow |
| **Mehendi Bagh** (henna garden) | Leaf green, terracotta | Mehendi patterns **draw themselves** across a hand (SVG line animation). **Easter egg:** both names hidden in the pattern, tap to find | *"Find our names in the mehendi, if you can."* · Dress: green / pastel |
| **Sangeet Mahal** (music hall) | Magenta, purple, gold | Musicians in miniature style; the dholak and sitar *bounce to scroll*; chandeliers swing; dancing figures twirl | *"Bring your dancing shoes and your best uncle-moves."* · Dress: Indo-western / glam |
| **Baraat** (the procession) | Saffron, red, gold | **Signature moment:** a long royal procession (elephant, decorated horse, drummers, dancing baraatis, fireworks) moves **across the screen** as you scroll down. On mobile it's a wide strip that slides sideways while you scroll down, so it feels like watching a parade pass | *"The groom's side arrives. The neighbours have been warned."* |
| **Vivah Mandap** (the wedding) | Sindoor red & gold | The mandap with the sacred fire at the centre. As you scroll, a gold thread circles the fire **seven times** (7 pheras), and each circle reveals one of the seven vows in a single line | **Shubh Vivah** · Muhurat: [time] · Dress: traditional |
| **Deepon ki Raat** (night of lamps, reception) | Royal indigo, silver, gold | The palace at night; thousands of diyas light up one by one across the facade as you scroll; fireworks at the top | *"Dinner, music and the newlyweds' first entry."* · Dress: formal |

> **Transition between courtyards:** a soft **gulal burst** in the next courtyard's colour, so yellow powder blows in before Haldi, green before Mehendi, and so on.

### Scene 6: The Royal Countdown
- **See:** A palace clock tower, or an ornate brass water-clock (*ghati*).
- **Copy:** *"The auspicious muhurat arrives in **42 days · 6 hours · 13 minutes**."*

### Scene 7: Send Your Reply with Mitthu (RSVP)
- **See:** Mitthu perched on a windowsill holding a blank scroll.
- **Form (simple, thumb-friendly):** Name · Number of guests (– / + buttons) · Which events (pre-selected for personalised links) · A blessing for the couple (optional).
- **Animation on submit:** The scroll rolls itself up, Mitthu grabs it and **flies off screen**, then a message appears: *"Mitthu has delivered your reply. The families are delighted!"*

### Scene 8: Travel & Stay
- Styled like an old **royal map** (a hand-drawn map of the city with little icons for the venue, hotel, station and airport). Tap an icon to open Google Maps.
- Contact cards: *"For anything at all, call [Name] (bride's side) / [Name] (groom's side)"*, with one-tap **Call** and **WhatsApp** buttons.

### Scene 9: The Finale
- **See:** The whole palace, two elephants raising trunks in an arch, fireworks over the sky, Mitthu on top.
- **Copy:**
  > *आपकी उपस्थिति प्रार्थनीय है*
  > *Your presence is our greatest blessing.*
  >
  > **Swagatotsuk:** [Uncles, aunts, family names]
  > *Nanhe mehmaan:* "Mere didi ki shaadi mein zaroor aana!" (cousins' names)
  >
  > #[YourHashtag]
- Button: **↑ Read the farmaan again**

---

## Signature interactions (what people will remember)

1. **Breaking the wax seal** to open the invitation
2. **Palace doors swinging open** with your scroll
3. **The Baraat parade** passing across the screen
4. **Seven gold circles around the fire**, one vow per circle
5. **Mitthu flying off with your RSVP**

## Mobile notes
- The Baraat strip is the only sideways moment. On phones, keep it **scroll-driven** (it moves as you scroll down; no swiping needed).
- Miniature art is detailed, so **crop each scene vertically** for phones (portrait versions of the illustrations) rather than shrinking the wide desktop art.
- Event cards should stack fully on one phone screen: no tiny text, buttons at the bottom.

## Illustrations needed (about 14–16)
1. Wax-sealed scroll · 2. Ganesh in arch · 3. Palace doors (2 layers: door left, door right) · 4. Mitthu the parrot (+ flying animation) · 5–8. Four love-story panels · 9. Palace facade with 2 jharokhas · 10. Haldi courtyard · 11. Mehendi hand pattern (SVG lines) · 12. Sangeet hall + musicians · 13. Baraat procession strip (long horizontal) · 14. Mandap with fire · 15. Palace at night · 16. Map of the city

**Effort:** High on illustration, medium on code. The most "classic" of the three.
