# vamos-ui

Release notes for the `vamos-ui` command line tool.

The format follows [Keep a Changelog](https://keepachangelog.com/) and [semantic versioning](https://semver.org/) (0.x: minor versions may change commands).

## 0.7.0 — 2026-11-15

### Minor Changes

- d78c5ab: Five new website components for code samples, app mockups, store links, video lists and file downloads, and the site recipes now use them.
  
  - `CodeBlock` and `CodeTabs`: highlighted code with a file name, line numbers, marked lines and a copy button that falls back where the clipboard is blocked. The language picked in one `CodeTabs` switches every other block on the page and can be remembered per browser (`useCodeLanguage` lets an install line or SDK table follow it). A small built-in highlighter colours with tokens; Shiki or Prism output plugs in through `highlight` or `html`.
  - `DeviceFrame` and `DeviceScreens`: a phone, tablet or desktop browser drawn from tokens whose screen lays content out at the device's real width and scales to fit; swap screens from feature tabs or scroll.
  - `StoreBadges`: App Store and Google Play links drawn as plain text with a generic icon (no store artwork), more stores, and an optional QR code on wide screens.
  - `VideoPlaylist` (`@vamos-ui/react/media`): one player and a list that swaps the video; YouTube and Vimeo stay behind the click-to-load facade.
  - `DownloadKit`: files with format and size, downloaded one by one or ticked and saved as one ZIP built in the browser (`createZip`, no dependency); files that fail to fetch are listed inside the archive.
  - Labels for all of them in English, Turkish, German, French, Spanish and Arabic.
  - Recipes: developer-tool and publication use `code-block`; mobile-app uses `device-frame` and `store-badges`; musician and game use `video-playlist` and `download-kit`; digital-products uses `device-frame` and `download-kit`.

### Patch Changes

- 60f0774: New components for signups, following and community pages, generic and documented, with built-in labels in all six locales:
  
  - `ReferralPanel`: place in line, a personal invite link to copy or send through the device's share sheet, and referral progress toward a reward.
  - `EmailCapture`: a compact newsletter or waitlist signup (inline or stacked) with validation, success and error states, and the privacy link or KVKK checkbox. It posts to a URL, a server action or `onSubmit`, with the same fields as `ContactForm`.
  - `SubscribeLinks`: "listen on / follow on" links from your own list (no bundled logos), with a Copy RSS feed button.
  - `TopicList` and `TopicRow`: forum topics with tags, reply and view counts, the latest post, and pinned, solved, locked and unread states.
  - `PrintButton` with `PrintStyles` / `printStyles()`: opens the print dialog with a suggested PDF file name, plus a print stylesheet that hides the site chrome and prints link addresses.
  - The launch-waitlist, newsletter-writer, publication, podcast, community-forum and personal-cv recipes now use these components; a few other recipes list them as alternatives.
  - Registry guidance (when to use, when not to, accessibility) for `ad-slot`, `billing-details`, `news-ticker`, `news-widgets`, `post-card` and `post-tabs`.
- 28b8641: New pricing and giving components, generic and documented, with English, Turkish, German, French, Spanish and Arabic labels:
  
  - `Estimator`: a live calculator. Declarative inputs (number, slider, select, toggle, option cards, add-on checkboxes) feed a pure formula; the summary panel shows the total or a range, line items, facts, notes and a CTA that hands the selection on (callback, link or hidden form field). Sticky on wide containers, a bottom bar on narrow ones.
  - `ChoiceGrid`: a two-axis option grid (size × frequency) as one radio group, arrow keys in both axes, a price per cell, unavailable cells and form posting.
  - `TierPricing`: quantity breaks as a table or a ladder, with the active tier, unit price, total and the next break ("8 more for $45.00 per case"). `tierQuote()` gives the same numbers for order lines.
  - `AmountPicker`: preset amounts with an impact line, an own amount with bounds and a one-off / monthly switch.
  - `GoalMeter`: raised against a goal with backers and days left, or stock left of a run. Built on `Progress`.
  - The site recipes (professional firm, home services, software product, developer tool, portfolio studio, subscription box, B2B supplier, nonprofit, online store, mobile app, agency, venue, real estate) now name these components where they describe calculators, price grids, quantity tiers, donations and meters.

## 0.6.0 — 2026-11-15

### Minor Changes

- 39cf137: The website process follows the business's country and markets, not only "Turkish or not". `vamos-ui new` asks the country (ISO code) and the markets (optional: empty, they come from the domain's ccTLD, then the site language, so old `vamos.project.json` files keep loading and a Turkish-language site stays a business in Türkiye). The plan records a `jurisdiction` with its legal regimes (TR, EU/EEA, DE, AT, FR, UK, US, US-CA, other US states, CA, CA-QC, BR, AE, SA, AU, CH) and adds a requirement pack per regime: every item names its `source` (law or regulator page), and items that depend on thresholds, transposition or scope are marked `counsel` ("verify with counsel" in the briefs). The EU ODR link is no longer asked for (the platform closed on 20 July 2025); the EU online withdrawal function (from 19 June 2026) is. Turkish rules (KVKK, MERSİS, ETBİS, KEP) appear only for Türkiye.
  
  Legal pages per country, in the site's language where a preset exists: `/impressum`, `/datenschutz`, `/cookie-richtlinie`, `/agb`, `/widerrufsbelehrung` (Germany, Austria), `/mentions-legales`, `/politique-de-confidentialite`, `/gestion-des-cookies` (France), `/withdrawal` or `/cancellation-rights` for EU/UK shops, `/do-not-sell-or-share` for California with ad tags. `legal-01` gains German and French presets, the `withdrawal` kind (EU model text and form, EGBGB Anlage 1/2) and the `do-not-sell` kind; the French privacy, cookie and CGV pages and the German AGB are structure only. `site essentials` writes every required legal page of the plan (without a plan: the imprint in DE/AT/FR, a privacy policy when the site collects data) and lists the ones nothing links yet. `vamos.site.json` gains `legal.vatId` and `legal.representative`; MERSİS and ETBİS are only asked of shops in Türkiye.
  
  `audit` and `site check` take `--country` (default: `vamos.site.json`, the ccTLD, the `<html lang>` region) and add country checks: no Impressum / mentions légales in DE, AT, FR (error), US ad tags without a "Do Not Sell or Share" link (warning), EU/UK trackers that load before consent (warning), a leftover EU ODR link (info). The MCP guidance lists the per-country legal pages.
- 9bc8d8e: The CLI works without network access. The package now carries a copy of the whole Vamos UI registry (`snapshot/registry.json.br`, about 2.5 MB, built with the CLI), and `add`, `list`, `search`, `view`, `init`, `create`, `diff` and `upgrade` use it when `https://ui.vamos.ist/r` cannot be reached: no answer within 5 s (`VAMOS_REGISTRY_TIMEOUT`, ms), a failed connection, or a proxy answering instead. One line says which copy was used (`using the bundled registry (v0.4.3, built 2026-11-15)`; on stderr with `--json`). `--offline` or `VAMOS_OFFLINE=1` skips the network for the registry entirely and refuses items from URLs and `github:`. An explicit `--registry`, `VAMOS_REGISTRY` or a non-default `registry` in `vamos.json` is used as before and never falls back. `vamos-ui registry export <dir>` writes the bundled copy (the same files the site serves) to a folder for a team to host or vendor, and `vamos-ui registry info` prints its version and build date.
- 2b8e5b9: `npx vamos-ui site check [url]` closes the loop after the user publishes, without publishing anything: it runs the audit on the live URL plus the deploy checks (http → https 301, one host name with the www / non-www twin redirected, the security headers `site deploy` writes, a real 404 for an unknown path, robots.txt and sitemap.xml that answer and parse). The URL defaults to `url` in `vamos.site.json`, else the plan's domain. Exits 1 below `--min-score` (default 90), on an audit error or a failed check, so it can gate CI; `--ci` prints a GitHub Actions workflow that runs it after each production deploy; `--json`, `--lang tr|en`. A pass in a planned project suggests `npx vamos-ui task done deploy`. `site deploy` now ends with the check command, and the deploy specialist's brief uses it. The library entry `vamos-ui/audit` adds `runDeployChecks`, `siteCheckVerdict` and `siteCheckWorkflow`.
  
  The audit now pairs `www.ornek.com.tr` with `ornek.com.tr` (second-level suffixes such as `.com.tr` and `.co.uk`), so the www / non-www check also runs on those domains.
- 13ccb4c: First-run polish for websites built with `create` + `site essentials`:
  
  - `site essentials` fills in the root layout while it is still the one `create` wrote (detected by a marker line and the exact template; the title, `lang` and theme attributes may differ): `<html lang>` from `locale` in `vamos.site.json`, metadata from `app/site.ts` (`metadataBase`, canonical, `og:url`, Open Graph, Twitter card) and `<SiteJsonLd />` once in `<body>`. A layout the user edited is never touched; the snippets are printed as before. `--dry-run` shows the diff. `create --locale <tag>` sets `<html lang>` (default `en`).
  - `site essentials` writes `app/icon.svg` (the business name's first letter on a flat tile in the theme or brand accent) and `app/opengraph-image.tsx` (a 1200×630 `next/og` image with the name and description in the site colours), never over an existing favicon or og image. It also warns when `vamos.site.json` has no description.
  - A Turkish site (`locale` `tr-*`) with a contact form or newsletter gets the KVKK aydınlatma metni page (`/kvkk-aydinlatma-metni`, `legal-01`) when nothing links one yet, with the snippet to link it from the footer and the contact form. Legal pages also set `og:url`. A warning when the kit `Footer` would repeat the JSON-LD.
  - `audit` on a local preview (`localhost`, `127.0.0.1`, `::1`, `*.localhost`, `*.test`) reports plain http, the security headers and canonical / sitemap URLs on the live host as info with "Local preview — checked again after deploy (`vamos-ui site check`)", so the local score reflects the site rather than the dev server. Live URLs are unchanged, and `site check` always uses the live rules. `vamos-ui/audit` exports `isLocalPreviewHost`, `LOCAL_PREVIEW_NOTE`, the `localPreview` option and `report.localPreview`.
- 2ca636f: Forms and measurement for websites. `@vamos-ui/react/blocks` adds `Analytics`: GA4, Google Tag Manager, Google Ads and the Meta pixel load only after the visitor's consent in `ConsentBanner` (analytics → GA4 / GTM, marketing → Ads / Meta; `mode="advanced"` loads the Google tag at once under Consent Mode), and phone, WhatsApp, email, directions and booking clicks plus contact form leads become events (`generate_lead`, `click_call`…, the Google Ads conversion per event, Meta `Lead` / `Contact`). `trackEvent()` sends one yourself. `ContactForm` with a URL `action` (a PHP mailer on static hosting) now submits with fetch once hydrated and shows the server's field errors; without JS it still posts and comes back with `?vb_sent=<form>`. A successful submit fires `vb:lead`.
  
  `npx vamos-ui site form` writes the sender: `public/contact.php` for static exports on shared hosting, or a Next.js server action with Resend or SMTP (nodemailer), plus one field list shared by the page and the sender; honeypot, time trap, rate limit, cross-site posts refused, no visitor input in mail headers. `verify` reports `raw-tracking-script` for tags loaded by hand. The website plan's form and measurement tasks point to these.
- b326068: The website process: an orchestrator and nine specialists. The plan's tasks now carry their order (brand and content first, the build after the brand, legal / SEO / forms / measurement after the build, QA after everything, deploy last) and the plan carries a requirement pack per site type on top of a shared baseline (local business, corporate, shop, booking, portfolio, blog, SaaS, nonprofit, event), each item owned by one specialist and, where a tool can tell, checked by a command. `npx vamos-ui task` lists the tasks, `task next` the ones that can start, `task brief <id>` the brief for the specialist (plan context, steps, requirements, checks, report format), `task done|block|reset <id>` updates `vamos.project.json`; rebuilding the plan keeps task status. `npx vamos-ui agents` (also run by `new`) writes the orchestrator skill `.claude/skills/vamos-site` and the subagents `.claude/agents/vamos-*` for Claude Code; `AGENTS.md` describes the same process for other clients. `npx vamos-ui site deploy` writes the host's config (cPanel `.htaccess`, `vercel.json`, `_headers` / `_redirects`, nginx + pm2) for http → https, one host name, security headers and cache, and prints the publishing steps and the checks after launch.
  
  The MCP server adds `next_task`: the same process on a `vamos.project.json` the client passes in.
  
  `audit` counts a footer link for every legal page it stands for, so "Gizlilik ve KVKK Aydınlatma Metni" on `/gizlilik-politikasi` is both the privacy policy and the KVKK notice. The cPanel `.htaccess` limits its redirects and headers to the site's own domain, because subdomain folders inside `public_html` inherit it.
- a29bc76: Site recipes. A recipe describes one kind of website as data: when it applies (site type, words in the name and description in English and Turkish, features, markets), its pages and, per page, the ordered section patterns (purpose, kit components with alternatives, the facts the business supplies, optional and conditional sections keyed to the interview: booking, shop, newsletter, several languages …), what the business must supply, looks that suit it (theme axes) and pitfalls. 34 recipes ship in `vamos-ui/project` (`RECIPES`, `pickRecipe`, `resolveRecipe`, `matchRecipes`). `vamos-ui new` picks one from the answers, keeps the sections that apply (`plan.blueprint`) and writes their components into the pages; the brand, content and build briefs carry the looks, the fields per section and the full blueprint. Plans no longer list starting templates (`plan.templates` is deprecated).
  
  ### Removed
  
  The example websites are no longer in the registry; websites are built from kit components following a recipe. `vamos-ui add <name>` for one of them explains this and names the recipe. Removed: `site-accounting-01`, `site-agency-02`, `site-ai-01`, `site-app-01`, `site-app-02`, `site-artist-01`, `site-autoservice-01`, `site-blog-01`, `site-blog-02`, `site-careers-01`, `site-changelog-01`, `site-clinic-01`, `site-clinic-02`, `site-club-01`, `site-community-01`, `site-construction-01`, `site-course-01`, `site-cv-01`, `site-department-01`, `site-devtool-01`, `site-dietitian-01`, `site-digital-01`, `site-driving-01`, `site-estate-02`, `site-event-01`, `site-factory-01`, `site-florist-01`, `site-game-01`, `site-help-01`, `site-law-01`, `site-market-01`, `site-movers-01`, `site-newsletter-01`, `site-nonprofit-01`, `site-physio-01`, `site-podcast-01`, `site-portfolio-01`, `site-portfolio-02`, `site-preschool-01`, `site-public-01`, `site-restaurant-01`, `site-saas-02`, `site-spa-01`, `site-status-01`, `site-store-02`, `site-studio-01`, `site-subbox-01`, `site-therapy-01`, `site-venue-01`, `site-vet-01`, `site-waitlist-01`, `site-wedding-01`, `site-wholesale-01` (53). The showcases `site-store-01`, `site-estate-01`, `site-saas-01` and `site-agency-01` stay.
- b88b39b: The theme can now express twelve style families (portal, tabloid, editorial serif, broadsheet, dark neon, gradient glass, SaaS, soft pastel, luxury, earthy, playful agency, minimal commerce) plus Arabic RTL, each as one preset code.
  
  `@vamos-ui/react`
  
  - Fonts: every catalog family records its licence (`license`, `fontLicenses`; all SIL OFL 1.1). New families: Anton, Silkscreen, Sacramento and the Arabic IBM Plex Sans Arabic, Noto Naskh Arabic, Noto Kufi Arabic, Readex Pro and Amiri (`fontSubsets()` adds `arabic` for next/font). Eight new pairings: `portal`, `tabloid`, `neon`, `grove`, `retail`, `arcade`, `naskh` and `kufi` (24 in all). A pairing can carry an accent face (`accent` → `--font-accent`, the `font-accent` class) and a heading case (`display.case` / `caseTracking` → `--display-case`, `--display-case-tracking`, read by `.font-display`). Every pairing now has a `[data-font]` block in styles.css; `pairingCss()` writes it and `fontVar()` names the next/font variable it reads (`--ff-<catalog id>`, the classic four keep their short names).
  - Corners: `data-radius="none"` (0, large radius too) and `"pill"` (pill controls, default cards). Button and the shared control box (Input, Select and picker triggers) use the new `rounded-control` / `rounded-control-sm`, which read `--control-radius` and fall back to `--radius`; multi-line fields keep card corners.
  - `data-density="spacious"` is now a page density (taller controls, larger gaps and sections, 16px corners); on Table and DataTable it still changes rows and cells only.
  - `data-scene="paper|warm|ink"` retints the backdrop, solid surfaces and neutral text together (text keeps 4.5:1). `ThemeScope` / `themeAttributes` take `scene` and the new radius values.
  - Colour: `--accent-2`, `--accent-2-ink` and `--accent-gradient` (`bg-accent-gradient`) for every accent; category colours `--cat-1…6` with `--cat-fg` and text-safe inks (`bg-cat-N`, `text-cat-N`), contrast-checked for every scene, light and dark.
  
  `vamos-ui`
  
  - Preset codes gain a letter for every font pairing, density `p` (spacious), corners `n` (none) and `p` (pill), and an optional seventh scene letter (`n|p|w|i`). Still `v1`: every existing code decodes to the same preset; an older CLI rejects a code with a new letter instead of guessing.
  - `npx vamos-ui theme --family <id>` applies a named style family (preset, second accent, `dir="rtl"` for Arabic, a motion hint and the font loading snippet); `--families` lists them; `--scene` sets the scene. `PRESET_FAMILIES` and `getPresetFamily()` in `vamos-ui/preset`.
  - Brand: `colors.accent2` and `fonts.accent`; brand.css writes `--accent-2-*` (derived from the accent when `accent2` is absent) and `--font-accent`. `theme.radius` and `theme.density` accept the new values. next/font snippets ask for the arabic subset where a family has it.
  
  `@vamos-ui/mcp`
  
  - `get_theming` documents the seventh axis, the new radius and density values, the style families with their codes, category colours, the second accent and `rounded-control`.
- 6cc002e: `vamos-ui new` plans a website by asking a few questions (business, site type, languages, current site, domain, hosting, one page or several, sections, store or booking needs, contact channels and form delivery, measurement, who runs the site) and writes `vamos.project.json` with the plan: pages and the components on them, legal pages, hosting and build output, forms with spam protection, measurement with consent mode, compliance notes for Turkey (KVKK, ETBİS, distance sales), domain ideas, tasks per specialist and open questions. It fills only the empty fields of `vamos.site.json`. `vamos-ui site import <url>` reads a current website (business details with their sources, navigation, texts, images) and warns about mismatches such as two phone numbers. Both are also a library: `vamos-ui/project`. `vamos.site.json` takes `analytics.metaPixel`.

### Patch Changes

- 49f9354: `add` no longer writes an index that re-exports a package the project does not have (`export { z } from "zod"` after adding only site blocks broke `next build`). npm re-exports are kept when package.json declares the package or the same `add` installs it.

## 0.5.1 — 2026-11-12

### Patch Changes

- e5f3dd6: The package includes its CHANGELOG.md, and is published from GitHub Actions with npm provenance.

## 0.5.0 — 2026-11-12

### Added

- `vamos-ui audit <url>`: checks a live website over HTTP (redirects, title and description length, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt and AI crawler policy, placeholder contact details, legal pages, broken internal links, heavy images). Score, `--max-pages`, `--external`, `--strict`, `--json` and exit codes for CI. Also importable as `vamos-ui/audit`.
- `vamos-ui site init` writes an empty `vamos.site.json` (business details, legal ids, analytics ids, AI settings). `site essentials` reads it for robots (AI crawlers allowed, blocked or listed), llms.txt, LocalBusiness / FAQ JSON-LD and the legal pages. Nothing defaults to anyone's real data.
- `verify` rule `site-info` lists the empty fields in `vamos.site.json`.
- `vamos-ui theme --radius sharp|round` and `theme.radius` in vamos.json.
- `init` writes AGENTS.md, CLAUDE.md, .github/copilot-instructions.md and .cursor/rules/vamos-ui.mdc by default (existing content kept; `--no-agent` skips them).

### Changed

- Preset codes map the corner letter to `data-radius`; `brand apply` saves `brand.theme.radius` in vamos.json instead of writing `--radius` into brand.css.

## 0.4.0 — 2026-11-12

### Added

- `vamos-ui site essentials`: robots, sitemap and a page for every legal link in the footer; runs after `add site-…` in a Next.js App Router project (`--no-essentials` skips it).
- Legal page presets (legal-01) in English and Turkish, including returns, distance sales, pre-contract information and legal notice.
- `verify` checks for websites: placeholder contact details, links to routes with no page, missing robots / sitemap / metadataBase / canonical / Open Graph / JSON-LD, title and meta description length, images in public/ over 300 KB.

### Changed

- The registry version follows the kit version.

## 0.3.0 — 2026-11-12

### Added

- `vamos-ui create` (Next.js or Vite), preset codes (`init --preset`, `theme --preset`, `preset`), an open registry (`add` from a URL, `github:owner/repo/item` or `@namespace/item`), `registry build` for third-party registries, and `mcp add` for Claude Code, Cursor, VS Code, Windsurf, Gemini CLI and Codex.

## 0.2.0 — 2026-11-10

### Added

- First release: `init`, `add`, `list`, `search`, `view`, `diff`, `upgrade`, `theme`, `verify`, `brand` and `update`.
