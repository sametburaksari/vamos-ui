# Vamos UI — design rules

Follow these on every screen you build or edit. `npx vamos-ui verify` (MCP: `verify_code`) checks the mechanical ones; the rest are on you. This is the same rule set the MCP tool `get_rules` returns.

## 1. Tokens only
- Colours come from semantic classes or variables, never literals. Page `bg-scene`; cards `bg-surface` or the `surface` utility; inset areas `surface-2`; floating layers `surface-popover`; sidebar `surface-nav`; top bar `surface-bar`. Text `text-fg`, `text-fg-muted`, `text-fg-subtle`. Borders `border-line`, `border-surface-border`, `border-field-border`. States `bg-hover`, `bg-selected`. Status `text-success | warning | danger | info`. Charts `chart-1 … chart-6`, `chart-seq-0 … chart-seq-4`.
- No hex/rgb/hsl/oklch in `className` or `style`, no Tailwind palette classes (`bg-blue-500`, `text-zinc-900`, `border-gray-200`). Rule: `raw-color`.
- No `dark:` variants. Dark mode is the `.dark` class switching token values; components never branch on theme. Rule: `no-dark-variant`.
- No hard-coded fonts (no Inter, Arial, `font-family` literals). Use `font-sans` (UI), `font-display` (headings), `font-mono` (code). Rule: `no-hardcoded-font`.
- Radius from `rounded-ui`, `rounded-ui-sm`, `rounded-ui-lg`. z-index from the scale: `--z-sticky` 20, `--z-nav` 30, `--z-overlay` 50, `--z-popover` 60, `--z-toast` 70, `--z-tooltip` 80. Never `z-[999]`. Rule: `z-index-token`.
- Type scale: `text-display-2xl | xl | l | m` for marketing and hero headings, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-eyebrow`. App screens rarely need display sizes above `text-display-m`.

## 2. Accent is scarce
- The accent fills exactly one thing per view: the primary action (one `<Button variant="primary">` per screen region), the active/selected state (current nav item, selected tab, checked control), or the one data highlight (chart series 1, the KPI that matters).
- Everything else is neutral. `<Button>` defaults to `variant="secondary"`; use `ghost` for toolbars, `solid` for a decisive typographic step (Publish), `soft` for a quiet accent, `danger` / `danger-ghost` for destructive actions.
- `text-accent-ink` is for accent-coloured text and icons on neutral surfaces (contrast-safe per theme). `bg-accent` always pairs with `text-accent-fg`. `bg-accent-soft` for quiet highlights.
- Wrong: two primary buttons side by side, accent-coloured headings, accent borders on every card.

## 3. Material and the glass budget
- Glass is a theme axis (`data-material="glass"`), not something you paint. Never add `backdrop-blur`, translucent `bg-white/60` or your own gradients; the surface utilities already switch to glass.
- Budget: at most the sidebar, the top bar and the single topmost layer blur at once. Layers nested inside another layer (a popover in a dialog, a submenu), tooltips, table rows and sticky headers never blur. The kit handles this when you use its overlays (`Dialog`, `Sheet`, `Popover`, `DropdownMenu`) and `<Layer asChild>` + `usePortalContainer()` for custom portals. Blur turns off while dragging.
- Do not stack `surface` inside `surface`. Inside a card use `surface-2` or plain dividers (`border-line`).

## 4. Density
- Size from tokens so `data-density="compact"` works: controls `h-[var(--control-h)]` (kit components already do), gaps `gap-[var(--gap)]`, table rows `--row-h` / `--cell-px`, app shell `--sidebar-w`, `--topbar-h`.
- No fixed px heights on controls or rows.
- Compact for data-heavy back-office screens (tables, CRM, ops). Comfortable for settings, onboarding and websites.

## 5. Use the kit, not hand-rolled markup
- Overlays: `Dialog`, `Sheet`, `AlertDialog`, `Popover`, `DropdownMenu`, `ContextMenu`, `Tooltip`, `Command`. Never a hand-made `fixed inset-0` modal or an absolutely positioned div menu; focus trap, Escape, scroll lock and the glass budget come free. Rule: `prefer-kit-component`.
- Forms: `Field` + the control (`Input`, `Select`, `Combobox`, `DatePicker`…) so labels, descriptions, errors and `aria-describedby` are wired.
- Data: `DataTable` from the data-table subpath for real tables (sorting, selection, pagination, density); `Table` only for small static data. Charts from the charts subpath (they read `--chart-*`).
- Start whole screens from a block (`plan_screen`, or `npx vamos-ui search`) instead of composing from scratch.

## 6. Does not look AI-generated
- No purple or blue gradients, no glowing blobs, no gradient text, no emoji as icons or bullets, no sparkle icons on everything.
- No generic card walls. Not every piece of content needs a card. Use lists, tables, dividers, whitespace and one clear hierarchy (page title → section → content).
- No Inter. No centred-everything app screens; app screens are left-aligned with a clear reading order.
- Icons from `lucide-react`, 16px in dense UI, `text-fg-muted` unless they carry meaning.
- Restraint: one heading font, one accent, consistent radii, aligned edges.

## 6b. Motion
- Motion comes from the kit: overlay classes (`ui-*`) and `@vamos-ui/react/motion` (`Reveal`, `Stagger`, `CountUp`, `Ticker`, `TextReveal`, `Parallax`, `Tilt`, `Magnetic`, `PageTransition`, `SkeletonSwap`, `useScrollShrink`, `vm-press` / `vm-lift` / `vm-underline` / `vm-nudge`). No motion libraries, no hand-written keyframes or `transition: all`.
- Motion explains, it does not decorate: animate what changes or arrives (a page, a list, a number, loaded content) and leave settled UI still. One expressive moment per screen.
- Admin screens: `fade` or a 6–8 px `rise` at most (`Stagger` on a list or KPI row, `SkeletonSwap` for loaded data, `CountUp` on the one KPI that matters). No parallax, tilt, magnetic buttons or text reveals in an app; tables and forms never animate on scroll.
- Websites: set the level once on `SiteShell` (`motion="subtle"` default, `"full"` only when motion is part of the brand, `"off"` for sober sites). Never above-the-fold scroll reveals; the hero enters with CSS on first paint.
- Opacity and transform only, never width, height, top or margin, so layout never shifts (CLS 0). Never hide server-rendered content that is already in view.
- Keep entrances under a second and exits shorter than entrances; durations come from the level and density tokens, not literals.
- Reduced motion and `data-motion="off"` show the final state everywhere; a `CountUp` value is the real number for screen readers.

## 7. Realistic content
- Real-looking names, companies, amounts, dates and statuses ("Ayşe Demir · Invoice INV-2041 · ₺18,450.00 · Overdue 3 days"). Never "Lorem ipsum", "Item 1", "John Doe" or "Test".
- Show the hard states: empty (one clear next action, `EmptyState`), loading (`Skeleton` matching the final layout), error (what happened and how to fix it), long text (truncate with a title or tooltip), many items (pagination or virtualisation).
- Numbers, dates and money through `Intl` / the kit's `useFormat()`. Date-only values are `YYYY-MM-DD` strings (never `toISOString()`); money is a decimal string, never a float; time zones are explicit.

## 8. Accessibility (non-negotiable)
- Every icon-only button has `aria-label` (`<IconButton aria-label="Delete invoice">`) and a `Tooltip`. Rule: `icon-button-label`.
- Every `<img>` / `<Image>` has `alt` (`alt=""` for decorative). Rule: `img-alt`.
- Clickable things are `<button>` or `<a>`. A `div` with `onClick` needs `role`, `tabIndex={0}` and key handling; prefer a button. Rule: `click-events-interactive`.
- Never a positive `tabIndex`. DOM order equals visual order. Rule: `no-positive-tabindex`.
- Visible focus: kit components use the `focus-ring` utility; use it on custom interactive elements.
- Form inputs have visible labels (`Field`); errors are announced (`aria-invalid` + `aria-describedby`, the kit wires this). Placeholders are not labels.
- Colour is never the only signal: pair status colours with text or an icon.
- One `h1` per page, heading levels in order.
- Respect `prefers-reduced-motion`: use the kit overlay motion classes (`ui-pop`, `ui-fade`, `ui-dialog`, `ui-sheet-*`, `ui-collapse`) and the motion subpath, which render the final state under reduced motion. Moving content (a ticker, autoplay) always has a pause control.
- RTL-safe: logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `text-start`).

## 9. Framework notes
- Next.js App Router: files under `app/` that use hooks or event handlers need `"use client"` (rule: `use-client`). Keep static display components server-compatible. A server component must never pass a function prop (handler, render function) into a client part; move that wiring into a `"use client"` file.
- Import from `@vamos-ui/react` (package mode) or the `importAlias` in vamos.json (copy mode, e.g. `@/components/vamos`).
- Wrap the app in `VamosProvider` / `LocaleProvider` for locale, router `Link` and framework `Image`.

## 10. Brand profile and voice
- If the project has `vamos.brand.json`, read it first (MCP `get_brand`). The brand is applied as `data-accent="brand"` from `<uiDir>/brand.css`; components still use the same semantic classes (`bg-accent`, `text-accent-ink`), never the brand hex.
- Colour literals live only in vamos.brand.json and the generated brand.css. Change the brand there and re-run `npx vamos-ui brand apply`; never hand-edit brand.css.
- Brand fonts come through `font-sans` / `font-display` / `font-mono`; the app loads the font files.
- One accent, still scarce. `colors.neutralTint` is a subtle backdrop tint, not a second accent; secondary brand colours go into charts or illustrations.
- Voice: every label, button, empty state, error and toast follows `voice.tone` and `voice.rules` and matches the `do` side of `voice.examples`. Without a voice, write plain, specific copy and ask before inventing taglines.
- Assets: use the logo files in `assets` as their `use` note says. Never redraw, recolour, stretch or invent a logo. Missing logo or conflicting rules: say so and ask.

## 11. Websites: launch checklist
Use it when the screen is a public website (`site-*`, `page-*`, `legal-01` blocks), before it goes live. `npx vamos-ui site essentials` writes the files; `verify_design({ projectDir })` / `npx vamos-ui verify` reports what is still missing.
- Business info lives in one file: `vamos.site.json` at the project root (`npx vamos-ui site init` writes it empty; schema https://ui.vamos.ist/r/site-schema.json). Every value comes from the business: never invent a name, phone, address, email, tax id, MERSİS/ETBİS number or analytics id, and never reuse one from another project. Empty fields stay empty and verify (`site-info`) lists them; ask the user for them. Read contact details in code from `site` in `app/site.ts` instead of retyping them.
- With `vamos.site.json`, `site essentials` also writes `app/llms.txt/route.ts` (llms.txt) and `app/site-json-ld.tsx` (render `<SiteJsonLd />` once in the root layout; then pass the kit `Footer` `jsonLd={false}`), robots follows `ai.allowAiCrawlers` (true / false / list of AI bots), and the legal pages get `values` so known [fill-in] fields are filled.
- Legal pages: a page for every footer and consent link (`/privacy` or `/gizlilik`, `/kvkk`, `/cookies` or `/cerez-politikasi`, `/terms` or `/kullanim-kosullari`, `/accessibility`; for a shop `/returns` or `/iade`, `/mesafeli-satis-sozlesmesi`, `/on-bilgilendirme-formu`; `/legal-notice` or `/yasal-uyari`) from the `legal-01` presets; replace every [fill-in] field and have the business or a lawyer review the text. No internal link without a page (404).
- `robots.txt` and `sitemap.xml` (`app/robots.ts`, `app/sitemap.ts`) listing every public route.
- Metadata: `metadataBase`, `alternates.canonical` on every page, `openGraph` (siteName, locale, image), a unique title (under 60 characters) and a 120–160 character description per page; verify flags titles over 60 and descriptions outside 70–160.
- JSON-LD: the kit `Footer` emits Organization; give it the business type (`jsonLd={{ "@type": "Restaurant" }}`) or add `<JsonLd>` / `localBusinessJsonLd` with address, phone and opening hours.
- Real contact details: no placeholder phones (`000 00 00`, `555 55 55`, `wa.me/90500…`), no example.com or `.example` emails and links, no `href="#"`, no invented `maps.app.goo.gl` / `g.page` links (copy the share link from the business's Maps listing, or use `directionsUrl()`).
- Working links: phone as `tel:`, email as `mailto:`, the map link opens the real listing.
- Images: `sizes` matches the rendered width, so phones do not download images 2–3× larger than shown; files in `public/` under 300 KB (WebP/AVIF), verify flags heavier ones. Tap targets at least 24px (kit links already are).

## Suppressing a finding
Only with a reason, on the line above: `// vamos-ui-ignore brand logo SVG needs its own fill`. `vamos-ui-ignore-file` skips a whole file (generated code only).

## Checklist before you finish
- [ ] Started from a block; every control, overlay, table and chart is a kit component.
- [ ] `npx vamos-ui verify` passes with no errors; with a brand profile, MCP `verify_design` reports it as applied.
- [ ] Copy follows the brand voice; logos are the files from `assets`, used as noted.
- [ ] One primary action per view; accent used only for primary, active and highlight.
- [ ] Motion only from the kit, one expressive moment per screen, final state under reduced motion.
- [ ] Empty, loading and error states exist and use real copy.
- [ ] Checked light/dark × solid/glass × comfortable/compact, another accent and font, and a phone width.
- [ ] Keyboard path works end to end; icon buttons, images and fields are labelled.
