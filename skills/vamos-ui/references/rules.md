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
- Respect `prefers-reduced-motion`; use the kit motion classes (`ui-pop`, `ui-fade`, `ui-dialog`, `ui-sheet-*`, `ui-collapse`).
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

## Suppressing a finding
Only with a reason, on the line above: `// vamos-ui-ignore brand logo SVG needs its own fill`. `vamos-ui-ignore-file` skips a whole file (generated code only).

## Checklist before you finish
- [ ] Started from a block; every control, overlay, table and chart is a kit component.
- [ ] `npx vamos-ui verify` passes with no errors; with a brand profile, MCP `verify_design` reports it as applied.
- [ ] Copy follows the brand voice; logos are the files from `assets`, used as noted.
- [ ] One primary action per view; accent used only for primary, active and highlight.
- [ ] Empty, loading and error states exist and use real copy.
- [ ] Checked light/dark × solid/glass × comfortable/compact, another accent and font, and a phone width.
- [ ] Keyboard path works end to end; icon buttons, images and fields are labelled.
