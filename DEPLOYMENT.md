# Final Vercel setup

## Recommended structure

Use one Vercel project and one custom domain. The two public invitation experiences are:

- `https://YOUR_DOMAIN/amber-fort/`
- `https://YOUR_DOMAIN/lake-city/`

Hindi versions are available at `/hi/amber-fort/` and `/hi/lake-city/`. Links using the interim `/lake-view/` address permanently redirect to `/lake-city/`.

The bare domain (`https://YOUR_DOMAIN/`, and `/hi/`) is a landing page for both sides. It shows the welcome painting, the couple and the countdown, then two doors: "Groom's side · Ratnesh's family" leads to `/amber-fort`, and "Bride's side · Pallavi's family" leads to `/lake-city`. A `?to=` personal link carries through either door.

These are the only guest pages. The earlier garden story (`/garden`, `/nature`, `/royal`) is retired: `vercel.json` sends those old links to the landing page. The old root `/invitation` does the same.

This is the most reliable way to use path routes on Vercel. Two separate Vercel projects should use two subdomains instead, such as `amber.YOUR_DOMAIN` and `lake.YOUR_DOMAIN`.

## Vercel project settings

Connect this repository to one Vercel project and keep the default unified build. Do not set `SITE_THEME` for this project.

Set this environment variable for Production, Preview, and Development:

```text
SITE_URL=https://YOUR_DOMAIN
```

The build uses `SITE_URL` for canonical URLs, `og:url`, and the absolute `og:image` URL that WhatsApp, email clients, and social crawlers fetch.

Vercel will use the checked-in `vercel.json` and run `npm run build`, publishing `dist/`.

## Social preview behavior

Each theme and language has its own preview. The bride's site (`/lake-city`) writes Pallavi's name first.

- **Title:** for example, "Ratnesh & Pallavi — Wedding Invitation".
- **Description:** "You are cordially invited to celebrate the wedding of … · dates".
- **Image:** a 1200×630 invitation card, the welcome painting with the names and dates on an arched panel.

The cards are pre-rendered into `src/assets/og/<theme>-<lang>.jpg` by `node scripts/render-og-cards.mjs`, which needs headless Chrome on port 9333. Re-run the script whenever the names or dates change.

Pages carry `noindex,nofollow`, so search engines leave out the family's addresses and names. Link previews are unaffected. Do not add a `robots.txt` that disallows crawling: WhatsApp's and Facebook's crawlers honour it and would stop showing the preview.

The canonical and alternate-language URLs follow each theme's route, so these links preview as the correct theme:

```text
https://YOUR_DOMAIN/amber-fort/
https://YOUR_DOMAIN/lake-city/
```

After changing metadata or the image, send a new URL when testing. WhatsApp, Gmail, Facebook, and similar crawlers may cache an older preview for a while.

## Optional separate-root deployment

The code still supports deploying each theme as its own Vercel project or subdomain. Set `SITE_THEME=amber-fort` or `SITE_THEME=lake-city`; that theme then renders at `/` and `/invitation`. Set a different `SITE_URL` for each project. Use this only if you want separate roots rather than `/amber-fort` and `/lake-city` paths.
