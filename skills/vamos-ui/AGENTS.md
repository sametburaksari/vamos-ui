<!-- vamos-ui:start -->
## Vamos UI

This project builds its interface with Vamos UI (https://ui.vamos.ist). `vamos.json` at the root says where the kit lives (`uiDir`, `blocksDir`) and how to import it (`importAlias`). Import kit code from that alias, never from a hand-written copy.

### Workflow for every screen
1. **Start from a block.** Find the closest whole screen: MCP `plan_screen` / `search`, or `npx vamos-ui search "<need>"` and `npx vamos-ui list --type block`. Install with `npx vamos-ui add <block>`.
2. **Add components** with `npx vamos-ui add <name...>`. Before using one you have not used yet, read its API with MCP `get_item` or `npx vamos-ui view <name>`; do not guess props.
3. **Compose with tokens only** and real content (realistic names, amounts, dates; empty, loading and error states).
4. **Verify:** `npx vamos-ui verify <changed files>` must report no errors. Fix warnings or suppress them with `// vamos-ui-ignore <reason>`.
5. **Check the axes:** light/dark (`class="dark"`), `data-material="solid|glass"`, `data-density="comfortable|compact"`, another `data-accent` and `data-font`, and a 375px phone width.

### Rules
- **Tokens only.** Semantic classes (`bg-scene`, `bg-surface`, `surface-2`, `text-fg`, `text-fg-muted`, `border-line`, `bg-hover`, `bg-accent` + `text-accent-fg`, `text-accent-ink`, `text-success|warning|danger|info`, `chart-1…6`) or `var(--token)`. No hex/rgb/hsl/oklch literals, no palette classes (`bg-blue-500`), no `dark:` variants, no font names (no Inter/Arial), no `z-[999]` (use `--z-sticky|nav|overlay|popover|toast|tooltip`), radius from `rounded-ui*`.
- **Accent is scarce.** One `variant="primary"` button per view; accent also marks the active state and the one data highlight. Everything else is neutral.
- **Glass is an axis, not paint.** Never add `backdrop-blur` or translucent white. Only sidebar, top bar and the topmost layer blur; use kit overlays or `<Layer>` + `usePortalContainer()` for portals.
- **Density from tokens.** `--control-h`, `--gap`, `--row-h`, `--cell-px`, `--radius`; no fixed px heights on controls or rows.
- **Kit over hand-rolled markup.** Dialog, Sheet, AlertDialog, Popover, DropdownMenu, Tooltip, Command; `Field` + Input/Select/Combobox/DatePicker; DataTable for real tables; charts from the charts subpath. Pick by option count: ≤ 5 RadioGroup, 6–10 Select, > 10 Combobox, records RecordPicker/UserPicker.
- **Not AI-looking.** No purple gradients, glow blobs, gradient text, emoji icons, sparkles, card walls or centred-everything app screens. Icons from lucide-react.
- **Data values.** Dates as `YYYY-MM-DD` strings (never `toISOString()`), money as decimal strings, formatting through `Intl` / `useFormat()`.
- **Motion from the kit.** `@vamos-ui/react/motion` (`Reveal`, `Stagger`, `CountUp`, `SkeletonSwap`…) and the `ui-*` overlay classes; no motion libraries or hand-written keyframes. Animate what arrives or changes, one expressive moment per screen; admin screens fade or rise a few px at most (no parallax, tilt or text reveals); sites set one `SiteShell motion` level. Opacity and transform only.
- **Accessibility.** `aria-label` on icon-only buttons, `alt` on images, buttons/links for clicks (no clickable divs), no positive `tabIndex`, visible focus (`focus-ring`), labelled fields with announced errors, colour never the only signal, one h1 per page, logical properties (`ps-`, `me-`, `start-`) for RTL, reduced motion respected.
- **Websites before launch.** A page for every footer legal link (`npx vamos-ui site essentials` writes robots, sitemap and `legal-01` pages), `metadataBase` + canonical + Open Graph, JSON-LD (the kit `Footer` emits Organization), and the business's real phone, email and map links instead of the demo ones. `npx vamos-ui verify` reports what is missing.
- **Next.js.** Files under `app/` that use hooks or handlers need `"use client"`; server components never pass functions into client parts.

Full rules: https://ui.vamos.ist/docs · Components and blocks: `npx vamos-ui list` · Theming and brand accents: `npx vamos-ui theme`, MCP `get_theming`.
<!-- vamos-ui:end -->
