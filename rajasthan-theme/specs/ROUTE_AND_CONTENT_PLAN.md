# Route, Content, and Preservation Plan

## Routes
- Preserve `/` and the existing nature-themed experience.
- Add a dedicated Amber Fort Romance route.
- Add a dedicated Lake City Elegance route.
- Keep the existing invitation/printable invitation route(s) working.
- Keep English/Hindi route behavior consistent with the current project. Inspect actual routing before choosing exact slugs.

## Shared data
Use one source of truth for couple names, wedding date, event schedule, venue, family details, invitation copy, RSVP links, map links, and language strings. Do not copy-paste the whole website into two disconnected implementations.

## Theme-specific configuration
Each theme may define:
- palette/design tokens
- hero and section background assets
- decorative asset set
- image focal points and crop settings
- scene composition and theme-specific invitation object
- theme-specific visual transitions, while reusing the established animation engine

## Preservation rules
- Keep the existing main nature route visually unchanged unless a bug fix is essential.
- Preserve current working animations, scroll transitions, interactive behavior, bilingual content, accessibility, reduced-motion behavior, calendar generation, venue/RSVP conditions, and static fallback.
- Do not delete old SVG assets or old scene components unless proven unused and approved.
- Do not make RSVP, map, directions, or guestbook appear functional unless the current app has working configuration/back-end.
