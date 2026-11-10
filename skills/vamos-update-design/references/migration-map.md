# Migration map

Pick the token by role, not by the old colour's value.

## Colours

| Before | After | Note |
|---|---|---|
| `bg-white`, `bg-gray-50` page | `bg-scene` | page backdrop |
| `bg-white` card, `bg-gray-900` card | `surface` / `bg-surface` | one level; inside a card use `surface-2` |
| `bg-gray-100` inset, table header | `surface-2` / `bg-surface-2` | |
| `text-gray-900`, `text-black` | `text-fg` | |
| `text-gray-500/600` | `text-fg-muted` | secondary text |
| `text-gray-400` | `text-fg-subtle` | hints, disabled |
| `border-gray-200` | `border-line` | dividers; card edge `border-surface-border` |
| `bg-blue-600 text-white` primary button | `<Button variant="primary">` | only one per region |
| `text-blue-600` link | `text-accent-ink` | |
| brand hex `#0f766e` anywhere | `bg-accent` / `text-accent-ink` / `bg-accent-soft` | the hex lives only in vamos.brand.json |
| `text-red-600`, `bg-red-600` | `text-danger`, `<Button variant="danger">` | |
| `text-green-600` / `text-amber-600` | `text-success` / `text-warning` | pair with text or an icon |
| `hover:bg-gray-100` | `hover:bg-hover` | selected: `bg-selected` |
| `dark:…` anything | delete it | tokens switch under `.dark` |
| `backdrop-blur`, `bg-white/70` | delete; `data-material="glass"` does it | glass budget |

## Type, shape, layers

| Before | After |
|---|---|
| `font-['Inter']`, `fontFamily: "…"` | `font-sans` / `font-display` / `font-mono` |
| `rounded-lg`, `rounded-md` | `rounded-ui` / `rounded-ui-sm` / `rounded-ui-lg` |
| `h-10` on inputs/buttons | kit components or `h-[var(--control-h)]` |
| `z-50`, `z-[999]` | kit overlays, or `z-[var(--z-overlay)]` etc. |
| `pl-4`, `mr-2`, `left-0` | `ps-4`, `me-2`, `start-0` (RTL-safe) |

## Components

| Hand-rolled | Kit |
|---|---|
| `fixed inset-0` overlay + box | `Dialog`, `Sheet`, `AlertDialog` (confirm) |
| absolutely positioned menu | `DropdownMenu`, `ContextMenu` |
| hover title div | `Tooltip` |
| native `<select>` | `Select` (≤ 10 options), `Combobox` (more) |
| `<table>` with sorting/selection | `DataTable` |
| label + input + error markup | `Field` + `Input`/`Select`/… |
| spinner div | `Spinner`, `Skeleton` for loading layouts |
| custom toast | `toast` |

Install with `npx vamos-ui add <names…>` and read each API with `npx vamos-ui view <name>` before swapping.
