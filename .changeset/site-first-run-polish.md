---
"vamos-ui": minor
---

First-run polish for websites built with `create` + `site essentials`:

- `site essentials` fills in the root layout while it is still the one `create` wrote (detected by a marker line and the exact template; the title, `lang` and theme attributes may differ): `<html lang>` from `locale` in `vamos.site.json`, metadata from `app/site.ts` (`metadataBase`, canonical, `og:url`, Open Graph, Twitter card) and `<SiteJsonLd />` once in `<body>`. A layout the user edited is never touched; the snippets are printed as before. `--dry-run` shows the diff. `create --locale <tag>` sets `<html lang>` (default `en`).
- `site essentials` writes `app/icon.svg` (the business name's first letter on a flat tile in the theme or brand accent) and `app/opengraph-image.tsx` (a 1200×630 `next/og` image with the name and description in the site colours), never over an existing favicon or og image. It also warns when `vamos.site.json` has no description.
- A Turkish site (`locale` `tr-*`) with a contact form or newsletter gets the KVKK aydınlatma metni page (`/kvkk-aydinlatma-metni`, `legal-01`) when nothing links one yet, with the snippet to link it from the footer and the contact form. Legal pages also set `og:url`. A warning when the kit `Footer` would repeat the JSON-LD.
- `audit` on a local preview (`localhost`, `127.0.0.1`, `::1`, `*.localhost`, `*.test`) reports plain http, the security headers and canonical / sitemap URLs on the live host as info with "Local preview — checked again after deploy (`vamos-ui site check`)", so the local score reflects the site rather than the dev server. Live URLs are unchanged, and `site check` always uses the live rules. `vamos-ui/audit` exports `isLocalPreviewHost`, `LOCAL_PREVIEW_NOTE`, the `localPreview` option and `report.localPreview`.
