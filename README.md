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

> **Early preview (v0.1).** Components are being built in the open. APIs will change until v1.

## Why

Most admin panels look the same, and most component kits stop at buttons and dialogs. Vamos UI covers the whole surface a business app needs — data tables, pickers, calendars, kanban, line items, approval flows, media, a block editor — plus site blocks and full-screen blocks, all styled by tokens.

- **Five theme axes.** Theme, material (solid or Liquid Glass), accent, density and font are attributes on `<html>` or any section. Components never use `dark:`.
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
