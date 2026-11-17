# @vamos-ui/mcp

Release notes for the Vamos UI MCP server (local stdio and the hosted server at https://mcp.vamos.ist/mcp).

The format follows [Keep a Changelog](https://keepachangelog.com/) and [semantic versioning](https://semver.org/) (0.x: minor versions may change tools).

## 0.3.5 — 2026-11-17

### Patch Changes

- 3dd1840: The server instructions and `get_theming` describe all seven theme axes, including scene (`data-scene`).
- Updated dependencies [3dd1840]
  - vamos-ui@0.8.1

## 0.3.4 — 2026-11-16

### Patch Changes

- 43e31f3: Website guidance covers the Spacefast host, the `edge` contact form sender (`functions/api/contact.ts`, `action="/api/contact"`), Cloudflare Turnstile, the Vercel Hobby limit and `site deploy --publish`, which agents run only after the user says yes.
- Updated dependencies [43e31f3]
  - vamos-ui@0.8.0

## 0.3.3 — 2026-11-16

### Patch Changes

- Updated dependencies [6e47e31]
  - vamos-ui@0.7.1

## 0.3.2 — 2026-11-15

### Patch Changes

- d78c5ab: Five new website components for code samples, app mockups, store links, video lists and file downloads, and the site recipes now use them.
  
  - `CodeBlock` and `CodeTabs`: highlighted code with a file name, line numbers, marked lines and a copy button that falls back where the clipboard is blocked. The language picked in one `CodeTabs` switches every other block on the page and can be remembered per browser (`useCodeLanguage` lets an install line or SDK table follow it). A small built-in highlighter colours with tokens; Shiki or Prism output plugs in through `highlight` or `html`.
  - `DeviceFrame` and `DeviceScreens`: a phone, tablet or desktop browser drawn from tokens whose screen lays content out at the device's real width and scales to fit; swap screens from feature tabs or scroll.
  - `StoreBadges`: App Store and Google Play links drawn as plain text with a generic icon (no store artwork), more stores, and an optional QR code on wide screens.
  - `VideoPlaylist` (`@vamos-ui/react/media`): one player and a list that swaps the video; YouTube and Vimeo stay behind the click-to-load facade.
  - `DownloadKit`: files with format and size, downloaded one by one or ticked and saved as one ZIP built in the browser (`createZip`, no dependency); files that fail to fetch are listed inside the archive.
  - Labels for all of them in English, Turkish, German, French, Spanish and Arabic.
  - Recipes: developer-tool and publication use `code-block`; mobile-app uses `device-frame` and `store-badges`; musician and game use `video-playlist` and `download-kit`; digital-products uses `device-frame` and `download-kit`.
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
- Updated dependencies [d78c5ab]
- Updated dependencies [60f0774]
- Updated dependencies [28b8641]
  - vamos-ui@0.7.0

## 0.3.1 — 2026-11-15

### Patch Changes

- 3396525: plan_screen: a website description that also mentions a form ("a podcast website with a guest form") now gets its site recipe instead of a form block.

## 0.3.0 — 2026-11-15

### Minor Changes

- c169788: `plan_screen` answers a website description with the matching site recipe (pages, sections, kit components with alternatives, the facts to supply, looks and pitfalls) and adds the recipe's components to the install command; example websites (`site-*`) are never offered as a starting point. The rules say websites follow the plan's recipe instead of copying an example site.
- 769e70b: New tools `start_project` (the website project interview: the next questions, then the plan and the contents of `vamos.project.json` and `vamos.site.json`) and `import_site` (reads a current website: details with sources, brand candidates, navigation, texts, images). On the hosted server `import_site` reads public sites only, up to 4 linked pages.
- b326068: The website process: an orchestrator and nine specialists. The plan's tasks now carry their order (brand and content first, the build after the brand, legal / SEO / forms / measurement after the build, QA after everything, deploy last) and the plan carries a requirement pack per site type on top of a shared baseline (local business, corporate, shop, booking, portfolio, blog, SaaS, nonprofit, event), each item owned by one specialist and, where a tool can tell, checked by a command. `npx vamos-ui task` lists the tasks, `task next` the ones that can start, `task brief <id>` the brief for the specialist (plan context, steps, requirements, checks, report format), `task done|block|reset <id>` updates `vamos.project.json`; rebuilding the plan keeps task status. `npx vamos-ui agents` (also run by `new`) writes the orchestrator skill `.claude/skills/vamos-site` and the subagents `.claude/agents/vamos-*` for Claude Code; `AGENTS.md` describes the same process for other clients. `npx vamos-ui site deploy` writes the host's config (cPanel `.htaccess`, `vercel.json`, `_headers` / `_redirects`, nginx + pm2) for http → https, one host name, security headers and cache, and prints the publishing steps and the checks after launch.
  
  The MCP server adds `next_task`: the same process on a `vamos.project.json` the client passes in.
  
  `audit` counts a footer link for every legal page it stands for, so "Gizlilik ve KVKK Aydınlatma Metni" on `/gizlilik-politikasi` is both the privacy policy and the KVKK notice. The cPanel `.htaccess` limits its redirects and headers to the site's own domain, because subdomain folders inside `public_html` inherit it.

### Patch Changes

- 39cf137: The website process follows the business's country and markets, not only "Turkish or not". `vamos-ui new` asks the country (ISO code) and the markets (optional: empty, they come from the domain's ccTLD, then the site language, so old `vamos.project.json` files keep loading and a Turkish-language site stays a business in Türkiye). The plan records a `jurisdiction` with its legal regimes (TR, EU/EEA, DE, AT, FR, UK, US, US-CA, other US states, CA, CA-QC, BR, AE, SA, AU, CH) and adds a requirement pack per regime: every item names its `source` (law or regulator page), and items that depend on thresholds, transposition or scope are marked `counsel` ("verify with counsel" in the briefs). The EU ODR link is no longer asked for (the platform closed on 20 July 2025); the EU online withdrawal function (from 19 June 2026) is. Turkish rules (KVKK, MERSİS, ETBİS, KEP) appear only for Türkiye.
  
  Legal pages per country, in the site's language where a preset exists: `/impressum`, `/datenschutz`, `/cookie-richtlinie`, `/agb`, `/widerrufsbelehrung` (Germany, Austria), `/mentions-legales`, `/politique-de-confidentialite`, `/gestion-des-cookies` (France), `/withdrawal` or `/cancellation-rights` for EU/UK shops, `/do-not-sell-or-share` for California with ad tags. `legal-01` gains German and French presets, the `withdrawal` kind (EU model text and form, EGBGB Anlage 1/2) and the `do-not-sell` kind; the French privacy, cookie and CGV pages and the German AGB are structure only. `site essentials` writes every required legal page of the plan (without a plan: the imprint in DE/AT/FR, a privacy policy when the site collects data) and lists the ones nothing links yet. `vamos.site.json` gains `legal.vatId` and `legal.representative`; MERSİS and ETBİS are only asked of shops in Türkiye.
  
  `audit` and `site check` take `--country` (default: `vamos.site.json`, the ccTLD, the `<html lang>` region) and add country checks: no Impressum / mentions légales in DE, AT, FR (error), US ad tags without a "Do Not Sell or Share" link (warning), EU/UK trackers that load before consent (warning), a leftover EU ODR link (info). The MCP guidance lists the per-country legal pages.
- 2ca636f: Forms and measurement for websites. `@vamos-ui/react/blocks` adds `Analytics`: GA4, Google Tag Manager, Google Ads and the Meta pixel load only after the visitor's consent in `ConsentBanner` (analytics → GA4 / GTM, marketing → Ads / Meta; `mode="advanced"` loads the Google tag at once under Consent Mode), and phone, WhatsApp, email, directions and booking clicks plus contact form leads become events (`generate_lead`, `click_call`…, the Google Ads conversion per event, Meta `Lead` / `Contact`). `trackEvent()` sends one yourself. `ContactForm` with a URL `action` (a PHP mailer on static hosting) now submits with fetch once hydrated and shows the server's field errors; without JS it still posts and comes back with `?vb_sent=<form>`. A successful submit fires `vb:lead`.
  
  `npx vamos-ui site form` writes the sender: `public/contact.php` for static exports on shared hosting, or a Next.js server action with Resend or SMTP (nodemailer), plus one field list shared by the page and the sender; honeypot, time trap, rate limit, cross-site posts refused, no visitor input in mail headers. `verify` reports `raw-tracking-script` for tags loaded by hand. The website plan's form and measurement tasks point to these.
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
- Updated dependencies [49f9354]
- Updated dependencies [39cf137]
- Updated dependencies [9bc8d8e]
- Updated dependencies [2b8e5b9]
- Updated dependencies [13ccb4c]
- Updated dependencies [2ca636f]
- Updated dependencies [b326068]
- Updated dependencies [a29bc76]
- Updated dependencies [b88b39b]
- Updated dependencies [6cc002e]
  - vamos-ui@0.6.0

## 0.2.12 — 2026-11-12

### Patch Changes

- e5f3dd6: The package includes its CHANGELOG.md, and is published from GitHub Actions with npm provenance.
- Updated dependencies [e5f3dd6]
  - vamos-ui@0.5.1

## 0.2.11 — 2026-11-12

### Fixed

- The hosted `audit_site` decodes gzip, deflate and br responses. 0.2.9 read compressed pages as raw bytes and reported a missing title, description and sitemap on sites that have them.
- 0.2.10 contained the same fix but was packed with an unresolved `workspace:*` dependency and cannot be installed. Use 0.2.11.

## 0.2.10 — 2026-11-12

Broken package (cannot be installed). Use 0.2.11.

## 0.2.9 — 2026-11-12

### Added

- `audit_site`: checks a live website (redirects, title and description length, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt and AI crawler policy, placeholder contact details, legal pages, broken links, heavy images). On the hosted server it only reaches public addresses: every request and redirect is checked at connect time, so loopback, private, link-local and cloud metadata addresses and DNS rebinding are refused; pages, time and response size are capped.
- Guidance for `vamos.site.json`, the corner axis (`data-radius`) and the AI assistant rule files written by `vamos-ui init`.

## 0.2.8 — 2026-11-12

### Added

- A website launch checklist in `get_rules`; `plan_screen` adds it for website screens.
- `verify_design` with `projectDir` (local server) runs the project checks: placeholder contact details, broken routes, robots, sitemap, metadata, JSON-LD, title and description length, heavy images.

## 0.2.7 — 2026-11-12

### Added

- Anonymous OAuth for the hosted server, for clients that require an authorization flow before connecting.

## 0.2.6 — 2026-11-12

### Changed

- Every tool declares `readOnlyHint`, `destructiveHint` and `openWorldHint` explicitly. On the hosted server `verify_design` and `import_design_system` only take inputs that work without file access.
- The server declares its title, website and icons in `serverInfo`.

## 0.2.5 — 2026-11-12

### Changed

- Tool descriptions say what each tool does instead of instructing the model.

## 0.2.4 — 2026-11-12

### Changed

- Each tool has a `title` inside its annotations, for directory listings.

## 0.2.3 — 2026-11-12

### Added

- Tools and guidance for the 0.4.0 kit: theme presets, the open registry and commerce blocks.

## 0.2.2 — 2026-11-11

### Added

- Guidance and registry data for the 0.3.0 kit: example websites, motion and the new admin blocks.

## 0.2.1 — 2026-11-11

### Added

- Streamable HTTP mode (`--http`, `--port`, `--host`) for hosted use, with setup docs for each MCP client.

## 0.2.0 — 2026-11-10

### Added

- First release: design rules, theming guide, registry search, items and blocks, screen planning, code and design verification, install commands, design system import and accent proposals.
