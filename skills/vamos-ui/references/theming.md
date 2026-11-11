# Vamos UI — theming

Vamos UI is themed by five independent axes, set as attributes on `<html>` or on any element; a subtree can differ from the page. Components only read CSS variables, so switching an axis is one attribute: no rebuild and no `dark:` classes. The live token list is `https://ui.vamos.ist/r/tokens.json` (MCP: `get_theming`); the axes are in `r/axes.json`.

## Axes

| Axis | Attribute | Values (default first) | What it changes |
|---|---|---|---|
| Theme | `class="dark"` | light (no class), `dark` | Every colour token: scene, surfaces, text, lines, status, charts |
| Material | `data-material` | `solid`, `glass` | Surfaces become translucent with blur over a soft colour scene |
| Accent | `data-accent` | `lime`, `ocean`, `ember`, `rose`, `graphite` | The one accent colour and everything derived from it |
| Density | `data-density` | `comfortable`, `compact` | Control height, radius, gaps, row height, cell padding, top bar |
| Type | `data-font` | `editorial`, `grotesk`, `corporate`, `system` | UI, heading and code font families plus display weight, tracking and scale |

```html
<html lang="en" class="dark" data-material="solid" data-accent="lime" data-density="comfortable" data-font="editorial">
```

Subtrees: `<section class="light">` inside a dark page, `<aside data-density="compact">`, `<div data-accent="ocean">` for a preview. In copy mode `npx vamos-ui theme` writes the axes to vamos.json and prints these attributes. Components use `ThemeScope` for live previews (see settings-02).

## Setup

```css
/* app stylesheet: after Tailwind v4 */
@import "tailwindcss";
@import "@vamos-ui/react/styles.css";   /* copy mode: @import "<uiDir>/styles.css"; (init adds it) */
```

## Fonts

The app loads the font files and provides `--ff-*` variables; the `data-font` axis maps them to `--font-ui`, `--font-heading` and `--font-code`. `data-font="system"` needs no font files. `@vamos-ui/react/fonts` has the catalog, pairings, `FontProvider` and pickers.

| `data-font` | UI | Headings | Code | Variables to provide |
|---|---|---|---|---|
| `editorial` | Onest | Instrument Serif (italic `em`) | JetBrains Mono | `--ff-onest`, `--ff-instrument`, `--ff-jetbrains` |
| `grotesk` | Hanken Grotesk | Bricolage Grotesque | Geist Mono | `--ff-hanken`, `--ff-bricolage`, `--ff-geist-mono` |
| `corporate` | IBM Plex Sans | IBM Plex Sans | IBM Plex Mono | `--ff-plex`, `--ff-plex-mono` |
| `system` | system UI | system UI | system mono | none |

Use `font-sans`, `font-display` (headings; pairs with the `font-display` weight/tracking rules) and `font-mono`. Never name a font in a component.

## Semantic classes

Use these, never palette colours.

- **Page and surfaces:** `bg-scene` (page), `surface` / `bg-surface` (card), `surface-2` / `bg-surface-2` (inset), `surface-popover` (floating layers), `surface-nav` (sidebar), `surface-bar` (top bar).
- **Text:** `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-accent-ink` (accent text on neutral surfaces), `text-accent-fg` (text on `bg-accent`).
- **Lines and fields:** `border-line` (hairlines), `border-surface-border`, `bg-field`, `border-field-border`, `border-field-border-hover`.
- **States:** `bg-hover`, `bg-selected`, `bg-accent`, `bg-accent-soft`, `ring-ring`, `focus-ring` (utility), `bg-skeleton`, `bg-track`.
- **Status:** `text-success`, `text-warning`, `text-danger`, `text-info`, `bg-danger-solid`; tone utilities `tone-neutral | accent | success | warning | danger | info` set `--tone` for components that tint by tone.
- **Navigation (dark in both themes):** `bg-nav`, `text-nav-fg`, `text-nav-fg-strong`, `bg-nav-hover`, `bg-nav-active`, `border-nav-line`.
- **Charts:** `chart-1 … chart-6` (categorical; `chart-1` is the accent ink), `chart-seq-0 … chart-seq-4` (sequential, derived from `chart-1`), `chart-grid`, `chart-axis`, `chart-cursor`, `chart-tooltip`.
- **Shape and type:** `rounded-ui`, `rounded-ui-sm`, `rounded-ui-lg`; `font-sans`, `font-display`, `font-mono`; `text-display-2xl | xl | l | m`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-eyebrow`; `tabular` for tabular digits.
- **Motion:** `ui-pop`, `ui-fade`, `ui-dialog`, `ui-sheet-*`, `ui-collapse` (all respect reduced motion).

## Token summary

Colour tokens (light → dark; glass overrides surfaces with translucent values):

| Token | Light | Dark | Role |
|---|---|---|---|
| `--scene` | `#eef0ea` | `#0c0e0a` | Page background |
| `--fg` / `--fg-muted` / `--fg-subtle` | `#12150f` / `#5a6053` / `#8a9083` | `#f1f3ec` / `#a7ad9c` / `#767c6d` | Text levels |
| `--surface` / `--surface-2` | `#ffffff` / `#f6f7f3` | `#15180f` / `#1b1e15` | Card / inset |
| `--surface-border`, `--line` | 9% / 7.5% ink | 8% / 6.5% white | Card edge, hairlines |
| `--field`, `--field-border` | white, 15% ink | 4% white, 13% white | Inputs |
| `--hover`, `--selected` | 5% / 7.5% ink | 5.5% / 8.5% white | Row and item states |
| `--popover`, `--overlay` | white, 42% scrim | `#1a1d14`, 60% scrim | Floating layers, modal backdrop |
| `--nav` | `#14170f` | `#0f110c` | Sidebar (dark in both themes) |
| `--success` / `--warning` / `--danger` / `--info` | `#0f8a5f` / `#c26a00` / `#d0303c` / `#2563eb` | `#3ccf91` / `#f2b23e` / `#f2717a` / `#7cb0ff` | Status |
| `--accent`, `--accent-fg`, `--accent-soft`, `--accent-ink`, `--ring` | derived from `--accent-base` | derived, ink switches to `--accent-ink-dark` | Accent family |
| `--chart-1 … --chart-6` | accent ink, blue, orange, violet, teal, pink | lighter variants | Chart series |

Accent presets (`--accent-base`): `lime` oklch(0.89 0.21 122) with dark text, `ocean` oklch(0.55 0.17 245), `ember` oklch(0.7 0.19 45) with dark text, `rose` oklch(0.58 0.21 10), `graphite` oklch(0.25 0.01 120) (near white in dark mode).

Layout and density tokens:

| Token | Comfortable | Compact | Use |
|---|---|---|---|
| `--control-h` | 2.5rem | 2.125rem | Height of buttons, inputs, selects |
| `--radius` | 14px | 10px | Base radius (`rounded-ui`; `-sm` = −4px, `-lg` = +6px) |
| `--gap` | 1.25rem | 0.875rem | Card padding and stack gaps |
| `--row-h` / `--cell-px` | 3.25rem / 1rem | 2.5rem / 0.75rem | Table and list rows |
| `--topbar-h` | 3.5rem | 3rem | App top bar |
| `--sidebar-w` / `--sidebar-w-rail` | 15.5rem / 3.75rem | same | App sidebar |
| `--z-sticky … --z-tooltip` | 20, 30, 50, 60, 70, 80 | same | sticky, nav, overlay, popover, toast, tooltip |
| `--container` / `--container-wide` / `--prose` / `--measure` | 76rem / 90rem / 42rem / 64ch | same | Website layout widths |
| `--gutter`, `--section-y` | fluid clamp() | `--section-y` × 0.8 | Website side gutter and section spacing |

Size custom elements from these variables (`h-[var(--control-h)]`, `gap-[var(--gap)]`, `z-[var(--z-popover)]`) so density and layering follow.

## Brand accents

The accent is one source colour. Fill, soft tint, ink (accent-coloured text), focus ring and chart series 1 are derived. To use a brand colour, define a new accent value with four variables and select it with `data-accent`:

```css
[data-accent="brand"] {
  --accent-base: oklch(0.62 0.16 160);       /* the fill (primary button, active state) */
  --accent-fg: #fff;                          /* text on the fill: >= 4.5:1 against --accent-base */
  --accent-ink-light: oklch(0.48 0.14 160);  /* accent text/icons on light surfaces: >= 4.5:1 on --surface */
  --accent-ink-dark: oklch(0.8 0.12 160);    /* accent text/icons on dark surfaces */
}
```

```html
<html data-accent="brand">
```

Rules:
- Check contrast: `--accent-fg` on `--accent-base`, and `--accent-ink-*` on `--surface`, must reach 4.5:1 (3:1 for large text and focus rings) in both themes.
- Very light brand colours (yellow, lime) take a dark `--accent-fg`. Dark brand colours (navy, graphite) need a lighter `--accent-ink-dark` for dark mode.
- Prefer `oklch()` so the ink variants keep the hue while changing lightness. Colour literals belong in this accent definition only, never in components.
- Do not redefine neutral tokens (`--surface`, `--fg`…) for a brand. If you must, override them for both `:root` and `.dark` and keep the glass values (`[data-material="glass"]`) translucent.
- A brand still gets one accent. Secondary brand colours go into charts (`--chart-2 … 6`) or illustrations, not UI chrome.

### Brand profile (vamos.brand.json)
Instead of writing the block above by hand, describe the brand once in `vamos.brand.json` (name, `colors.accent`, optional `accentDark` / `neutralTint`, `fonts.display|body|mono`, `theme` defaults, `voice`, `assets`) and run `npx vamos-ui brand apply`. It writes `<uiDir>/brand.css` with the contrast-checked accent and font variables, imports it after the kit styles and sets `"theme": { "accent": "brand" }` in vamos.json. MCP: `propose_accent` previews the accent, `apply_design_system` returns the edits, `verify_design` checks they are in place. Field reference: [../../vamos-import-design-system/references/brand-schema.md](../../vamos-import-design-system/references/brand-schema.md).

## Material

`data-material="glass"` makes surfaces translucent with blur over a soft colour scene. The same classes are used, so component code does not change. Glass budget: sidebar, top bar and one topmost layer may blur; nested layers use `--popover-nested` (opaque). `data-glass-quality="low"` turns blur off on low-power devices; blur is also off while dragging. Never add `backdrop-blur` or translucent white yourself. Some site blocks (Announcement bar) stay solid on purpose.

## Checking a screen

Render it, or reason through it, in light and dark × solid and glass × comfortable and compact, with a second accent (`ocean`) and font (`corporate`), at 375px width and in RTL if supported. Anything that does not change when an axis changes is hard-coded; anything that breaks is sized in px.
