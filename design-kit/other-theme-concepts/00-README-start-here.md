# Wedding Invitation Website: Theme Concepts

Three story-driven themes for a scrolling Indian wedding invitation. Each one is a complete story with a beginning, middle and end, so guests feel they are *reading* your wedding rather than just looking at a card.

| File | Theme | Feels like | Best if your family is… |
|---|---|---|---|
| `01-shahi-safar-royal-scroll.md` | **Shahi Safar**: The Royal Scroll | A Rajasthani miniature painting come alive | Traditional, loves grandeur, lots of elders on the guest list |
| `02-do-patang-two-kites.md` | **Do Patang**: Two Kites, One Sky | A poetic, colourful animated short film | Romantic, modern, wants the most "wow" on mobile |
| `03-picture-abhi-baaki-hai-bollywood.md` | **Picture Abhi Baaki Hai**: The Bollywood Blockbuster | A 90s hand-painted film poster and a trailer | Fun, filmy, lots of cousins and friends; built to be shared on WhatsApp |
| `04-anjor-chhattisgarhi-sahu-bihav.md` | **Anjor** (अंजोर): Tel, Baati aur Bihav | A walk through a Chhattisgarhi village wedding, nengs in order, ending in a village lit with diyas | A Chhattisgarhi Sahu family that wants its own traditions (Chulmati, Tel-Haldi, Bhanwar, Kankan-Maur) at the centre |

**My recommendation:** **Do Patang** is the most mobile-native of the three. The sky is vertical, so scrolling up a phone screen *is* the story. **Shahi Safar** is the safest crowd-pleaser across generations. **Bollywood** is the one people will forward to others "just to show them".

Ideas can also be mixed. For example, the Bollywood "censor certificate" opening works in front of any theme, and the mehendi "find the hidden name" game (below) fits all three.

---

## 1. What every theme must contain (the "invitation checklist")

Indian invitations carry a lot of information. Every theme below places each of these somewhere in its story:

- [ ] **Invocation**: ॥ श्री गणेशाय नमः ॥ (or your family deity / Ik Onkar / Bismillah, etc.) with a shloka line
- [ ] **Couple's names** (full names, and nicknames if you like)
- [ ] **Parents' names**: "Son of / Daughter of", and grandparents if your family expects it
- [ ] **"With the blessings of"**: late grandparents and elders
- [ ] **Events**, each with: name, date, day, time, venue, map link, dress code / colour theme, "Add to calendar"
  - Typical set (keep only what applies): Ganesh Sthapana / Mandap Muhurat · Haldi / Pithi · Mehendi · Sangeet / Garba night · Baraat · Varmala · Pheras / Saptapadi · Reception
- [ ] **Countdown** to the wedding day
- [ ] **RSVP**: number of guests and which events
- [ ] **Travel & stay**: hotel, nearest station or airport, pickup contact
- [ ] **Contacts**: one person from each side, with tap-to-call / WhatsApp buttons
- [ ] **"Swagatotsuk / Darshanabhilashi"**: the family members who are "eager to welcome you"
- [ ] **The kids' line**: *"Mere bhaiya ki shaadi mein zaroor aana!"* (guests love it)
- [ ] **Wedding hashtag** and an optional live-stream link for relatives abroad

## 2. Features shared by all three themes

These are the clever ideas borrowed from the site you liked, adapted for a wedding:

1. **An opening "gate" screen.** The site you liked had "Enter with sound / Enter in silence". Here it becomes *"Open with shehnai 🎵 / Open quietly"*. The tap also unlocks audio, which phones block until the user touches the screen. It also hides loading time behind a pretty moment.
2. **"Quick Info" mode (for Dadi & Nana).** The site you liked had a "Recruiter mode" button. This is the same idea: a toggle at the top that skips the story and shows one plain screen in big text: names, every event, venue buttons, call buttons. Elders will thank you.
3. **Personalised guest links.** `yoursite.com/?to=sharma-parivar` opens with *"Dear Sharma Parivar"* and **shows only the events that family is invited to**. In Indian weddings not every guest attends every function, which makes this one of the most useful features. It's just a small list in a file; no login needed.
4. **WhatsApp preview.** 90% of guests will first see the link preview inside WhatsApp. Design a beautiful 1200×630 preview image plus title ("Diya & Aarav · 12–14 Feb 2027 · You're invited"). This is your real first impression.
5. **Colour transitions between events.** Each ceremony gets its own colour world (Haldi = turmeric yellow, Mehendi = leaf green, Sangeet = magenta/purple, Wedding = sindoor red & gold, Reception = midnight blue & silver). Moving between them uses a **gulal (colour powder) burst** wipe, the festive version of the ink wipe on the site you liked.
6. **Easter egg: find the name in the mehendi.** A real tradition: the groom's name is hidden in the bride's mehendi. Hide both names in a mehendi illustration; guests who find them (tap) get confetti and a cute message.
7. **Language toggle.** English / हिंदी / your regional language (e.g. ગુજરાતી, मराठी, ਪੰਜਾਬੀ), at least for the invocation and the elders' lines.
8. **Music control.** Always visible, always mutable. Music never auto-plays before the first tap.

## 3. Mobile-first rules (most guests will be on a phone)

- Design at **390 × 844** first, then scale up to desktop.
- Every scene must work **one-handed with a thumb**: buttons at the bottom half, at least 48px tall.
- Avoid sideways scrolling sections on phones unless they're clearly swipeable (show a "swipe →" hint).
- **Weight budget:** first screen under ~1 MB, whole site under ~5–6 MB. Guests may be on patchy 4G at a relative's house. Use WebP/AVIF images and load them only as the guest scrolls near them (the site you liked did exactly this).
- Respect **"reduce motion"** (some older guests get dizzy): animations become simple fades.
- Test on a cheap Android phone, not just an iPhone.
- Venue buttons open **Google Maps directly**; contact buttons open **WhatsApp / call directly**.

## 4. Suggested tech (so the animations are achievable)

- **Astro** (same as the site you liked) or plain HTML/Vite: a fast, static site.
- **GSAP + ScrollTrigger** for scroll animations (now free, including all plugins), **Lenis** for smooth scrolling.
- **SVG** for line-drawing effects (mehendi lines, kite strings, rangoli). They're tiny files and look sharp.
- **Lottie** (optional) for small character animations (parrot flapping, dhol beating).
- Avoid heavy 3D/WebGL; it drains phone batteries and stutters on budget Android phones.
- **RSVP storage:** Google Sheets via a Google Form or Apps Script (free and easy), or Supabase if you want a live "wishes wall".
- **Hosting:** Netlify / Vercel / GitHub Pages (free) plus a custom domain like `diya-weds-aarav.in` (about ₹500–800/year).
- **Illustrations:** the biggest effort. Either commission an illustrator, or generate with AI and have one person clean them up so the style stays **consistent**. Each theme file lists exactly which illustrations are needed.

## 5. Fill this in, and the story becomes yours

The themes use placeholders like **[Bride]**, **[Groom]**, **[City A]**. The story parts become much stronger with real details. Answer these and drop them into whichever theme you pick:

1. Where are each of you from (city / hometown / family roots)?
2. How did you first meet? Where exactly, and what was the first thing either of you said?
3. One funny or awkward moment from the early days.
4. What did each of you think of the other at first? (The honest version is usually the best.)
5. The moment you knew.
6. How did the proposal or the family meeting happen? Was it arranged, love, or "love-cum-arranged"?
7. One quirk each: what is [Bride] famous for at home, and what is [Groom] famous for?
8. Your "song".
9. A food / place / inside joke that means something to you both.
10. Which ceremonies are you having, and on which dates?

Even 3–4 real details (the café where you met, his terrible first joke, her habit of being late) will make guests say *"this is SO them"*.
