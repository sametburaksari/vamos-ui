# @vamos-ui/react

Release notes for the component kit. Until 0.4.2 this file also covered the CLI (`vamos-ui`) and the MCP server (`@vamos-ui/mcp`); they now have their own CHANGELOG.md.

The format follows [Keep a Changelog](https://keepachangelog.com/) and the kit uses [semantic versioning](https://semver.org/) (0.x: minor versions may change APIs).

## 0.9.0 — 2026-11-17

### Minor Changes

- 996164c: New `@vamos-ui/react/commerce`: a working store checkout without a store platform. `priceCart` prices a cart from one catalog (VAT-inclusive minor units, variants, shipping with a free threshold, VAT by rate); `createCheckout` gives Web-standard `start` / `callback` handlers that price on the server, start an iyzico Checkout Form, keep the order in a signed HttpOnly cookie instead of a database, check iyzico's signed result against it and run `notify` once per paid order; `resendNotifier` emails the business and a receipt to the buyer, `webhookNotifier` posts each paid order as signed JSON. `@vamos-ui/react/commerce/cart` adds `CartProvider` / `useCart` (localStorage, synced across tabs, `checkout({ buyer })`).

## 0.8.1 — 2026-11-17

### Patch Changes

- 3dd1840: `FontProvider` (element scope) now keeps dialogs, menus and popovers opened inside it in its type pairing: overlays portal into its wrapper, like `ThemeScope`. Pass `portal={false}` for the old behaviour. The footer example uses a fictional company name.

## 0.8.0 — 2026-11-16

### Minor Changes

- 43e31f3: `ContactForm` takes an optional `turnstileSiteKey`. With it, the Cloudflare Turnstile script loads once per page and each form renders the widget, whose `cf-turnstile-response` token is posted for the sender to verify; without it nothing from Cloudflare loads. URL actions such as `"/api/contact"` (the new edge sender) work as before.

## 0.7.0 — 2026-11-16

### Minor Changes

- 4b37d18: Block definitions for the news and commerce blocks (`blocks/site/registry-news.ts`): `news-masthead`, `featured-posts`, `post-card`, `post-block`, `post-tabs`, `news-ticker`, `ad-slot`, `news-columns` (main / sidebar slots), `popular-posts`, `recent-comments`, `category-counts`, `follow-counts`, `product-grid` and `review-score`. Each has a zod schema, previews, block lint and JSON-LD through the renderer, so a news front page or a shop grid can be stored and rendered as JSON. Combine with the other site registries: `createRegistry([...siteBlocks1, ...siteBlocks2, ...newsBlocks])`.

### Patch Changes

- d478a07: News blocks: the `AuthDialog` title size is set on the dialog header's own title element, so the header's title style no longer shrinks it; a `NewsHeader` section with a mega menu now shows the accent underline when it is the current page (it only got `aria-current`).
- 52707c5: `tierQuote`, `estimatorDefaults`, `effectiveEstimatorValues`, `daysUntil`, `impactFor`, `choiceGridStep`, `highlightCode`, `parseLineRanges` and `deviceFrameSize` (with `deviceViewports`) now live in server-safe modules, so server components can call them (they used to fail with "Attempted to call … from the server"). Imports from `@vamos-ui/react` and the component modules are unchanged.

## 0.6.0 — 2026-11-15

### Minor Changes

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

### Patch Changes

- e125976: `printStyles()` and `PrintStyles` now live in a server-safe module, so a server component can call `printStyles()` (it used to fail with "Attempted to call printStyles() from the server"). Imports from `@vamos-ui/react` are unchanged.

## 0.5.0 — 2026-11-15

### Minor Changes

- 4b8d819: Commerce and review parts in `@vamos-ui/react/blocks`.
  
  - **StarRating / StarRatingInput.** Read-only stars as one `role="img"` ("Rated 4.5 out of 5") with half or tenth fills, average and review count (optionally a link). The input is a native radio group in a fieldset: one tab stop, arrow keys, half steps with `allowHalf`, posts with the form; hover and checked fills are CSS.
  - **ReviewScore.** Review summary box: score as points, percent or stars, criteria bars, pros and cons, verdict, reviewer and readers' rating, with schema.org `Review` JSON-LD (`reviewRating`, `positiveNotes` / `negativeNotes`, the item's `aggregateRating`). `reviewJsonLd` builds the node on its own.
  - **ProductCard / ProductGrid.** Product tile with hover photo or one photo per colour swatch (native radios, CSS swap), sale price with the regular price struck through, price ranges, sale / new / sold-out badges, star rating, and slots for quick add and wishlist (no cart logic inside). ProductGrid lays them out in 2–5 responsive columns or as a list, with header, "Shop all", empty state and optional `ItemList` JSON-LD; `bare` renders only the list. `productJsonLd` builds a `Product` with `Offer` / `AggregateOffer` and `AggregateRating`.
  - Strings in `commerceLabels` plus Turkish, German, French, Spanish and Arabic sets; styles in `styles/commerce.css`.
- a29bc76: New components promoted from the example websites, generic and documented: `ReadingProgress` (progress through an article, with minutes left), `ModeToggle` (light / dark / system, persisted, with a no-flash head script), `SectionNav` (sticky in-page navigation that follows scroll), `TypingDemo` (scripted typing and rewrite demo; screen readers get the final text), `AudioPlayer` (chapters, skip, rate, transcript and download links, Media Session), `Countdown` (segments or inline, localized units, SSR-safe), `ImageHotspots` (selectable points on a picture: single or multiple, roving focus), `UptimeBars` (per-day status bars with legend and uptime %), `ReleaseNotes` (changelog with a version / date rail, change types and anchors), `FeedbackPrompt` ("Was this helpful?" with reasons and a comment), `FixtureList` and `StandingsTable` + `FormGuide` (fixtures, results and rankings for any head-to-head competition), `CapacityFinder` (options that fit a head count per arrangement) and `AccessibilityToolbar` (text size, token-safe high contrast, readable font, underlined links, reduced motion). `ActivityTimeline` gains an incident-updates example.
- fcaae56: News and magazine blocks in `@vamos-ui/react/blocks`: `PostCard` (overlay, stack, row, list and text cards with section badge, author, date, comment count and reading time), `FeaturedPosts` (the lead grid, optional slider arrows), `PostBlock` (category modules in seven layouts with pager arrows or numbered `NewsPagination` — "Page 1 of 17"), `PostTabs` (a tabbed category module whose extra tabs fold into a measured "More" menu, panels from props or a `load` callback), `NewsTicker` (one headline at a time or a crawl; pauses on hover, focus, a hidden tab and its pause button, never autoplays under reduced motion), `AdSlot` (labelled, size-reserved ad box that renders the ad and calls `onReady` only after marketing consent), sidebar widgets `FollowCounts`, `PopularPosts`, `RecentComments`, `CategoryCounts` and `NewsColumns` with a sticky sidebar tail, `NewsTopBar` (date, weather with a `loadWeather` adapter, sign in / join, social links), `NewsHeader` (masthead with mega menus that preview each section's latest stories on hover or focus, a "More" menu, inline search and a mobile drawer) and `AuthDialog` (reader sign-in with a password-recovery view). `newsArticleJsonLd` and `newsItemListJsonLd` build structured data; strings ship in English and Turkish (`newsLabelsTr`).
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
- 326a058: Turkish kit for websites and panels.
  
  - **Neighbourhoods.** `AddressDataSource` gains an optional `neighbourhoods(province, district)` level. `@vamos-ui/react/locale-data/tr-neighbourhoods` exports `trAddressWithNeighbourhoods`: 32 279 neighbourhoods and 18 183 villages (TÜİK MEDAS names, PTT official postal codes, via the MIT-licensed turkiye-api datasets) in 81 province files, each loaded as its own chunk the first time that province is picked. `trNeighbourhoodsFromUrl` serves the same files from the app (`@vamos-ui/react/locale-data/tr/neighbourhoods/*.json`); `createTrNeighbourhoodLoader` takes any origin. `AddressField` / `RegionSelect` show a neighbourhood picker for such a source, fill the postal code from it unless the visitor typed one, and `formatAddress` puts the neighbourhood in front of the street for Türkiye. `trAddress` itself is unchanged.
  - **KVKK consent records.** `@vamos-ui/react/compliance`: `recordConsent(store, input)` builds a hash-chained record of the notice version and text hash shown, each consent granted or refused, the time, and the IP / user agent only when passed, and appends it to a store the app implements; `verifyConsentRecord` / `verifyConsentChain` check them. `ContactForm`'s `privacyLink.version` is posted as `_notice`, `validateContactForm` returns `noticeVersion` and `formId`, and `contactConsentInput` maps the result to a record. New docs page: KVKK consent records.
  - **Payments.** `@vamos-ui/react/payments`: iyzico Checkout Form (`createIyzicoClient` — initialize and retrieve with signature checks, sandbox by default; `verifyIyzicoWebhook` for `X-IYZ-SIGNATURE-V3`) and the PayTR iFrame API (`createPaytrIframeToken`, `verifyPaytrCallback`, test mode by default). Web Crypto and fetch only; keys only from the config you pass. New docs page: Payments.
  - **Billing details.** `@vamos-ui/react/business` adds `BillingDetailsFields` (individual / company, TCKN or VKN + tax office + title, e-mail, phone, address) with `validateBillingDetails`, `billingDetailsFromFormData` and `billingErrorMessages`; Turkish labels in the `tr` dictionary.
- 2ec5921: City suggestions for 246 countries: `cities={citiesFromUrl()}` on AddressField adds a suggestion list to the city field (the places of the country with 5 000+ inhabitants or an administrative seat, most populous first, narrowed to the chosen state; any other place can still be typed). One file per country loads on first focus from https://ui.vamos.ist/data/cities/{cc}.json, or from your own copy with `citiesFromUrl("/data/cities/{cc}.json")`; without a `cities` loader nothing is requested. The data is not in the npm package. City data © GeoNames, CC BY 4.0: show the attribution where you use it. `parseCities`, `createCityLoader` and `DEFAULT_CITIES_URL` are in `@vamos-ui/react/locale-data`.
- 833dc14: AddressField and `formatAddress` follow each country's address format, for every country: the parts it uses and their order (Germany: street, postal code, city, no state; US: street, city, state, ZIP code; Japan: postal code, prefecture, street; the Emirates: no postal code), what they are called (State, Prefecture, Emirate, County, ZIP code, PIN code, Eircode…), and the postal code pattern, with an example as placeholder, a hint when a code does not fit and upper-casing on blur ("ec1y 8sy" → "EC1Y 8SY"). `required="auto"` uses the country's required parts. `formatAddress` gains `format`, `postal` (capitals where the country wants them) and `latin` (Latin-script order for Japan, China, Korea…), and `@vamos-ui/react/locale-data` exports `loadAddressFormat`, `checkPostalCode` and `validateAddress` for the same rules on the server. The data (Google's address metadata, CC BY 4.0) loads as one 5.5 kB gzip chunk on first use. Countries with a cascading source (Türkiye) keep their province → district pickers; a `fields` list you pass is used as before. Countries without a state line (Germany, France, UK…) no longer show a free-text State / Province field unless `fields` asks for it.
- 9620e75: AddressField picks the state, province, prefecture or emirate from a list for 202 countries (one small file per country, loaded when it is picked; a text field stays for countries without one or with `subdivisions={false}`). Values are what the address writes: US `"CA"` shown as California, Brazil `"SP"`, Japan `"東京都"` in Japanese and `"Tokyo"` in other languages, Germany `"Bayern"` shown as Bavaria in English. `RegionSelect country="US"` lists a country's subdivisions on its own, accepts a stored name or ISO code ("California", "US-CA"), and reports the ISO 3166-2 code with `onOptionChange`. Lists come from Google's address data where it has one (CC BY 4.0) and from Unicode CLDR level-1 subdivisions elsewhere (Unicode License); `@vamos-ui/react/locale-data/world-subdivisions` exports the bundled loader, `subdivisionsFromUrl` serves the same files from your app.

### Patch Changes

- 097f2cd: TaskList: the add input stays focused while a task is saved (read-only instead of disabled, a second Enter is ignored), and closing the title editor no longer pulls focus back once you have clicked somewhere else, which used to close a freshly opened "Add subtask" or edit box.

## 0.4.3 — 2026-11-12

### Patch Changes

- e5f3dd6: The package includes its CHANGELOG.md, and is published from GitHub Actions with npm provenance.

## 0.4.2 — 2026-11-12

### Added

- `npx vamos-ui audit <url>` audits a live website over HTTP: redirects, title and description length, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt and AI crawler policy, placeholder contact details, legal pages, broken internal links and heavy images. Score, `--json` and exit codes for CI. The MCP server has the same check as `audit_site` (public sites only on the hosted server).
- `vamos.site.json`: one file for a website's business details, legal ids, analytics ids and AI settings (`npx vamos-ui site init`). `site essentials` builds robots (AI crawlers allowed, blocked or listed), llms.txt, LocalBusiness / FAQ JSON-LD and the legal pages from it, with known [fill-in] fields filled. Nothing defaults to anyone's real data; verify lists the empty fields.
- `vamos-ui init` writes the AI assistant rules by default: AGENTS.md, CLAUDE.md, .github/copilot-instructions.md and .cursor/rules/vamos-ui.mdc (existing content kept; `--no-agent` skips them).
- ui.vamos.ist/llms.txt, llms-full.txt and a Markdown version of every docs page, component and block.
- Corners are a sixth theme axis: `data-radius="sharp"` or `"round"` on `<html>` or any subtree (absent = default) scales `--radius` (default 14px / compact 10px, sharp 6px / 4px, round 20px / 14px) and works with every accent, material and density. Everything on `rounded-ui*` or `var(--radius)` follows it (buttons, inputs, selects, cards, dialogs, popovers, menus, tables, square badges, calendars, chart tooltips, site blocks); `rounded-full` pills, avatars, switches, radio dots, slider thumbs and progress bars stay round. ThemeScope and `themeAttributes` take `radius`.

### Changed

- Preset codes keep the corner letter but map it to `data-radius` instead of the generated brand accent, so sharp or round corners combine with a named accent (`v1dgokgs` is dark · glass · ocean · compact · grotesk · sharp) and `theme --preset` works without a project. `vamos-ui theme --radius`, `theme.radius` in vamos.json, and `brand apply` saves `brand.theme.radius` there instead of writing `--radius` into brand.css.
- The /themes editor's corner control is independent of the accent; the generated brand accent is only used for a custom colour.

## 0.4.1 — 2026-11-12

### Added

- Website launch essentials: `npx vamos-ui site essentials` writes robots, sitemap and a page for every legal link in the footer, and runs by itself after `add site-…` in a Next.js App Router project.
- Legal page block (legal-01) with template text in English and Turkish: privacy policy, KVKK aydınlatma metni, cookie policy, terms of use, accessibility statement, return and refund policy, distance sales agreement (mesafeli satış sözleşmesi), pre-contract information form (ön bilgilendirme formu) and legal notice (yasal uyarı).
- The kit Footer emits Organization JSON-LD (`jsonLd` prop, `footerJsonLd` helper).
- Verify: placeholder contact details (000 00 00 phones, wa.me/90500…, .example emails, href="#", invented map links), links to routes with no page, missing robots / sitemap / metadataBase / canonical / Open Graph / JSON-LD, title and meta description length, and images in public/ over 300 KB.
- MCP: a website launch checklist in the rules; plan_screen adds it for website screens; verify_design with projectDir runs the project checks.
- Block and website labels in German, French, Spanish and Arabic.

### Changed

- @vamos-ui/react is tree-shakeable: importing Button ships about 12 KB gzipped instead of the whole kit. Bundle budgets run in CI.
- The registry version follows the kit version.

## 0.4.0 — 2026-11-12

### Added

- Components: Menubar, Collapsible, AspectRatio and PlaceholderArt (tasteful image placeholders from a seed, for blocks without photos).
- Commerce blocks: product detail, cart with mini-cart, one-page checkout (Turkish address fields, card / bank transfer / pay at the door) and order confirmation.
- Live theme editor at /themes: every theme axis plus a custom accent with contrast checks, a live preview, a shareable preset code and the matching CLI commands.
- CLI: `vamos-ui create` (Next.js or Vite), preset codes (`init --preset`, `theme --preset`, `preset`), an open registry (`add` from a URL, `github:owner/repo/item` or `@namespace/item`), `registry build` for third-party registries, and `mcp add` for Claude Code, Cursor, VS Code, Windsurf, Gemini CLI and Codex.
- UI strings in German, French, Spanish and Arabic (RTL), in addition to English and Turkish.
- Docs: install guides for Next.js, Vite and React Router; migration guide; accessibility, security, privacy and terms pages; MCP server page; publishing a registry; a full restaurant menu page example.
- CI on GitHub (types, unit tests with coverage, registry tests) and badges in the README.

### Changed

- /websites lists the example sites; /blocks lists app screens only and drops the domain filter.
- Each block preview is its own route, so a preview only loads its own code; the docs server sends compressed files.
- Opening hours read naturally in every state ("Closing soon · open until 01:00"); headings split over lines keep a real space between lines.
- Site blocks pass responsive image sizes, give icon-only links accessible names and meet touch target sizes.
- Ocean and rose accents are darker so white button text passes 4.5:1; status colours have text-safe ink variants.

### Fixed

- Section rhythm (tight / loose / none) had no effect.
- A navbar logo could render at its full image size.
- The page container shrank to its content inside flex columns, collapsing grid galleries.
- The rich-text editor's image margin leaked onto every kit Image.
- Compact currency rendered differently on server and client (hydration error).
- Marquee: pause control, and the duplicate track is no longer focusable.
- ComboChart ticks around zero; bar series get square legend swatches.
- Media library tile names; nav-rail badges in light mode.

## 0.3.0 — 2026-11-11

### Added

- 53 example websites built only from kit components and site blocks, each with a home page and one to five inner pages, English and Turkish, and its own accent, font, material and density. Open any of them at /view/<name> or add it with `npx vamos-ui add <name>`.
- Most searched: online store, photography portfolio, editorial blog, mobile app, medical clinic, real estate agency, conference, online course, personal site and CV, law firm.
- Software and tech: AI product, developer tool, changelog, status page, waitlist, help centre.
- Community and culture: non-profit, podcast, musician, wedding.
- Local and professional services: car service, veterinary clinic, preschool, driving school, removals, florist, photo studio, event venue, therapist, dietitian, physiotherapy, accounting firm.
- Commerce, B2B and digital products: manufacturer, packaging wholesaler, construction company, careers site, template shop, coffee subscription box, makers' marketplace, writer's newsletter.
- Institutions, education, sport and games: municipality services, university department, sports club, community forum, indie game.
- Second design variants for store, portfolio, blog, mobile app, clinic, real estate, SaaS and agency.
- SiteShell: one wrapper for a whole website — scoped brand accent (a preset or one colour, contrast-checked), material, density and font, EN / TR switch and inner pages switched with `?page=`.
- End-to-end tests for every example site: a smoke pass over all of its pages at 1440 and 390 px plus one test of its signature interaction and the language switch.
- Motion kit at `@vamos-ui/react/motion` (`npx vamos-ui add motion`): Reveal and Stagger (fade, rise, blur, scale, clip), CountUp, Ticker, TextReveal, Parallax and ScrollProgress, Tilt and Magnetic, PageTransition (View Transitions with a fade fallback), SkeletonSwap, useScrollShrink, MotionScope and the vm-press, vm-lift, vm-underline and vm-nudge micro-interactions. CSS-first, opacity and transform only, no motion library.
- Motion never hides server-rendered content that is already on screen, keeps layout shift at zero, follows density for its durations and renders the final state under reduced motion or `data-motion="off"`.
- SiteShell `motion` levels (subtle by default, full, off) with page and language switches that transition; the site blocks (Hero, Feature grid, Stats band, Pricing table, Testimonials, FAQ, CTA, Media + text, Steps, Gallery section, Logo strip) and every example site now use them.
- App shell blocks: Rail & flyout, Two-level ERP, Store top-nav, Multi-workspace, Field service mobile, Command palette, Support inbox and Page builder shells.
- Dashboard blocks: Sales forecast, Team pulse, Orders desk, Cash flow, Support SLA, Project portfolio, Marketing campaigns, Warehouse inventory, SaaS metrics, Realtime analytics and Dispatch console.
- Authentication blocks: Two-step verification setup, Passkey sign-in, Single sign-on lookup, Accept team invite, Account locked, Session expired and Sign in with product story.
- List blocks: Locations map, Audit log timeline, Bulk price & stock editor, Activity feed, Tree list and Tasks (list, board, calendar).
- Detail blocks: Customer 360, Order detail, Employee file, Product information, Quote builder, Support ticket, Project overview, Contract, Partner and Side-by-side compare.
- Settings, form and empty-state blocks: Plan & billing, API keys & webhooks, Notification preferences, Integrations marketplace, Security & sessions, Campaign wizard and First run with templates.
- Motion rules in the design rules (CLI agent skill, MCP `get_rules`) and motion guidance in the registry.
- End-to-end tests for motion (reveal, count-up, page switch, reduced motion, layout shift) and for the new admin blocks.

## 0.2.0 — 2026-11-10

### Added

- Full component inventory: all 143 planned items across 13 groups now have docs pages, live examples and props tables.
- Foundations: Avatar & avatar group, Button Group & Toggle Group, Kbd, Separator, Skeleton, Spinner, Typography.
- Forms & inputs: Select, Combobox, Checkbox, Radio Group, Switch, Slider, Input OTP, Tag input, Color picker, Slug input, Formatted inputs (currency, phone, IBAN, ID), Address field, Line items, File upload, Signature pad, Font picker.
- Pickers: Date Picker, Date range picker, Time picker, Record picker, User picker, Status picker, Tree select.
- Overlays & feedback: Dialog, Alert Dialog, Sheet / Drawer, Popover, Tooltip, Hover Card, Dropdown Menu, Context Menu, Command (⌘K), Toast, Alert, Progress, Empty state, Notification center.
- Navigation: Sidebar, Top bar, Tabs, Breadcrumb, Pagination, Navigation Menu, Accordion, Stepper.
- Page layouts: App shell, Page header, List layout, Record detail layout, Editor layout, Settings layout, Resizable, Scroll Area.
- Data display: Stat / KPI, Table, Data Table, Filter bar, Saved views, Item, Entity card, Description list, Activity timeline, Comment thread & mentions, Attachment list, Task list, Tree view, Version history & diff, Audit log.
- Charts: Chart frame, Area, Bar & Bar list, Line, Donut / Pie, Combo (bar + line), Funnel, Gauge & Progress ring, Sparkline, Heatmap.
- Calendar & time: Calendar, Agenda / scheduler, Resource calendar, Gantt, Time tracker.
- Editors & drag-and-drop: Kanban, Sortable list / tree, Hierarchy chart, Rich text / block editor, Image cropper, Permission matrix.
- Flows & wizards: Multi-step form, Approval flow, Import wizard, Export, Setup checklist.
- Media: Image, Carousel, Gallery grid, Lightbox, Media library, Media picker, Image field (select, crop, focal point), Video player, Link previews.
- Site blocks: Navbar, Hero (5 variants), Feature grid, Logo strip, Stats band, Pricing table, Comparison table, Testimonials, Team, FAQ, Process / steps, CTA, Blog list, Article layout, Page intro, Rich text section, Media + text, Contact form, Map & opening hours, Menu / price list, Gallery section, Announcement bar, Cookie / consent banner, Contact dock, Footer, 404 — plus the Blocks API.
- App shell blocks: Icon rail shell, Top navigation shell, Two-level sidebar shell.
- Authentication blocks: Sign in with SSO, Sign up with password strength, Forgot & reset password, Magic link sent, Two-step verification, Workspace & app chooser.
- Dashboard blocks: Sales, People, Projects & billing and Store dashboards.
- List and detail blocks: Posts list, Contacts list, Employee directory, Deals pipeline, CRM contact, Employee profile, Invoice detail, Post editor.
- Settings, form and onboarding blocks: Workspace settings, Language, formats & appearance, Users & roles, Leave request, Setup checklist, Welcome wizard.
- Empty and error state blocks: No posts yet, Search with no results, Not found in the app, Server error, No permission, Scheduled maintenance.
- Marketing and website blocks: Marketing sections, Pricing page, Contact page, and full Restaurant, Spa, Agency and SaaS websites.
- Blocks browser with category filters and lazily loaded previews.
- Component registry at /r/, the `vamos-ui` CLI and an MCP server for adding components and blocks to a project.

## 0.1.0 — 2026-11-10

### Added

- Design tokens with five axes: theme, material (glass/solid), accent, density and font.
- Components: Button, IconButton, Badge, Input, Textarea, Field, Card (with Header, Body, Footer, Inset).
- LocaleProvider, useMessages and useFormat with the built-in English dictionary.
- Docs site with live preview, code from the real example files, installation tabs and props tables.
- Multi-app admin shell demo: Site, CRM, People and Work share one sidebar and top bar.
- Plan for ~142 components across 13 groups.

### Fixed

- A light section inside a dark page now gets the light accent values and keeps the glass material.
