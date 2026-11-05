# Final Vercel setup

## Recommended structure

Use one Vercel project and one custom domain. The two public invitation experiences are:

- `https://YOUR_DOMAIN/amber-fort/`
- `https://YOUR_DOMAIN/lake-view/`

Hindi versions are available at `/hi/amber-fort/` and `/hi/lake-view/`. The old `/lake-city/` paths permanently redirect to `/lake-view/`.

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

Each theme now has its own title, description, and hero-based 1200×630 Open Graph image. The canonical and alternate-language URLs are route-aware, so these links preview as the correct theme:

```text
https://YOUR_DOMAIN/amber-fort/
https://YOUR_DOMAIN/lake-view/
```

After changing metadata or the image, send a new URL when testing. WhatsApp, Gmail, Facebook, and similar crawlers may cache an older preview for a while.

## Optional separate-root deployment

The code still supports deploying each theme as its own Vercel project or subdomain. Set `SITE_THEME=amber-fort` or `SITE_THEME=lake-city`; that theme then renders at `/` and `/invitation`. Set a different `SITE_URL` for each project. Use this only if you want separate roots rather than `/amber-fort` and `/lake-view` paths.
