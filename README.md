<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="apps/www/public/brand/vamos-ui-logo-dark.svg" />
    <img src="apps/www/public/brand/vamos-ui-logo-light.svg" height="56" alt="vamos UI" />
  </picture>
</p>

<p align="center">
  One component kit for every admin panel — CMS, CRM, HR, partner portals — and the websites around them.<br />
  <a href="https://ui.vamos.ist">ui.vamos.ist</a> · <a href="https://ui.vamos.ist/docs">Docs</a> · <a href="https://ui.vamos.ist/blocks">Blocks</a> · <a href="https://ui.vamos.ist/docs/changelog">Changelog</a>
</p>

<p align="center">
  <a href="https://github.com/sametburaksari/vamos-ui/actions/workflows/ci.yml"><img src="https://github.com/sametburaksari/vamos-ui/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
  <a href="https://www.npmjs.com/package/@vamos-ui/react"><img src="https://img.shields.io/npm/v/@vamos-ui/react?label=%40vamos-ui%2Freact" alt="npm version of @vamos-ui/react" /></a>
  <a href="LICENSE-MIT"><img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT" /></a>
</p>

> **Preview (0.x).** Components are being built in the open. APIs can still change until v1; see the [changelog](https://ui.vamos.ist/docs/changelog/) for the current version.

## Why

Most admin panels look the same, and most component kits stop at buttons and dialogs. Vamos UI covers the whole surface a business app needs — data tables, pickers, calendars, kanban, line items, approval flows, media, a block editor — plus site blocks and full-screen blocks, all styled by tokens.

- **Six theme axes.** Mode, material (solid or Liquid Glass), accent, density, font and corners are attributes on `<html>` or any section. Components never use `dark:`.
- **Grouped by what a component is.** A calendar is the same calendar in a CRM, an HR tool or a CMS. Domain screens ship as blocks.
- **Install or own.** One npm package, or copy single components with the `vamos-ui` CLI and keep receiving fixes.
- **English first, locales built in.** Built-in strings come from a locale dictionary; numbers, money and dates go through `Intl`. Turkish is the first extra locale.
- **Accessible.** WAI-ARIA patterns, keyboard support, reduced motion, RTL via logical properties.

## Quick start

```bash
pnpm add @vamos-ui/react
```

```css
/* globals.css */
@import "tailwindcss";
@import "@vamos-ui/react/styles.css";
```

```tsx
<html class="dark" data-material="glass" data-accent="lime" data-density="comfortable" data-font="editorial">
```

```tsx
import { Button } from "@vamos-ui/react";

<Button variant="primary">Publish</Button>
```

Full guide: [ui.vamos.ist/docs/installation](https://ui.vamos.ist/docs/installation).

## Theming

Six independent axes, each an attribute on `<html>` or on any subtree (a section can differ from the page):

| Axis | Attribute | Values |
|---|---|---|
| Mode | `class` | light (none) · `dark` |
| Material | `data-material` | `solid` · `glass` |
| Accent | `data-accent` | `lime` · `ocean` · `ember` · `rose` · `graphite` (or your own) |
| Density | `data-density` | `comfortable` · `compact` |
| Font | `data-font` | `editorial` · `grotesk` · `corporate` · `system` |
| Corners | `data-radius` | default (no attribute) · `sharp` · `round` |

**Corners** scale `--radius`: default 14px (compact 10px), sharp 6px (4px), round 20px (14px). It works with every accent, material and density.

- Follows the setting: everything on `rounded-ui` / `rounded-ui-sm` / `rounded-ui-lg` or `var(--radius)` — buttons, inputs, selects, checkboxes, cards, dialogs, sheets, popovers, menus, tooltips, toasts, tabs, tables, square badges, calendars, chart tooltips and site blocks.
- Stays round on purpose: `rounded-full` shapes — pill badges and buttons, avatars, switches, radio dots, slider thumbs and progress bars — and small fixed details such as chart bars and event chips.

Pick them visually at [ui.vamos.ist/themes](https://ui.vamos.ist/themes) or with `npx vamos-ui theme`. Guide: [ui.vamos.ist/docs/theming](https://ui.vamos.ist/docs/theming).

## Repository

| Path | What | License |
|---|---|---|
| `packages/ui` | The component kit (`@vamos-ui/react`) | MIT |
| `apps/www` | Docs site, examples and blocks (ui.vamos.ist) | MIT |
| `apps/admin` | Multi-app panel demo (Site/CMS, CRM, People, Work) | FSL-1.1-ALv2 |

See [LICENSE.md](LICENSE.md) and [TRADEMARKS.md](TRADEMARKS.md). "Vamos", "Vamos UI" and the logo are trademarks — forks must rename.

## Development

```bash
pnpm install
pnpm --filter @vamos-ui/www dev     # docs on http://localhost:3200
pnpm --filter @vamos-ui/admin dev   # panel demo on http://localhost:3100
pnpm --filter @vamos-ui/react test     # unit + a11y tests
node scripts/gen.mjs                 # regenerate indexes after adding components or blocks
```

Contributions are welcome — read [CONTRIBUTING.md](CONTRIBUTING.md) (DCO sign-off required).

Security issues: see [SECURITY.md](SECURITY.md) — please report privately, not in a public issue.
