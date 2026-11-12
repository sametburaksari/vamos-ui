---
name: vamos-ui
description: Build interfaces with Vamos UI, the token-based design layer and React kit from ui.vamos.ist. Use whenever you build or change any UI, page, screen, panel, admin, dashboard, form, settings page, sign-in page, landing page or website in a project that has a vamos.json file, depends on @vamos-ui/react, imports from "@vamos-ui/react" or the vamos.json importAlias, or when the user mentions Vamos UI or npx vamos-ui. Covers the workflow (init, pick a block, add components, compose with tokens, verify, check every theme axis), the design rules, theming, brand profiles (vamos.brand.json) and the component and block catalogs, and points to the design-system skills for importing, applying, verifying and updating a brand.
---

# Vamos UI

Vamos UI is a framework-neutral design layer: CSS tokens, six theme axes and semantic Tailwind classes, plus a React kit (`@vamos-ui/react`, 150 components) and 150+ blocks (whole screens). Docs: https://ui.vamos.ist. The CLI is `npx vamos-ui`. The MCP server `vamos-ui-mcp` exposes the same registry to agents.

Whole screens come from blocks. Components come from the kit. Colours, spacing, radius, type and z-index come from tokens. You choose content, structure and states.

## Workflow

Follow these steps for every screen you build or change.

### 1. Check the project setup
- If `vamos.json` exists at the project root, read it: `uiDir`, `blocksDir`, `css`, `importAlias` tell you where the kit lives and how to import it. Import from `importAlias` (for example `@/components/vamos`), not from `@vamos-ui/react`.
- If the project depends on `@vamos-ui/react` (package mode), import from `@vamos-ui/react` and its subpaths (`/charts`, `/data-table`, `/blocks`, `/media`, `/editor`, `/business`, `/sortable`, `/scheduler`, `/fonts`, `/format`, `/motion`).
- If neither, run `npx vamos-ui init` (it also writes these rules into AGENTS.md, CLAUDE.md, Copilot and Cursor rule files; `--no-agent` skips that). It detects Next.js, Vite and Tailwind v4, writes `vamos.json`, copies the styles and base libs, and adds `@import ".../styles.css";` to the CSS entry after `@import "tailwindcss";`.
- If `vamos.brand.json` exists, the project has a brand profile: read it (MCP `get_brand`) and follow **vamos-apply-design-system** on top of this workflow. Its accent is `data-accent="brand"`, its voice governs all copy and its logos come from `assets`.
- Make sure the root element carries the axes, e.g. `<html lang="en" class="dark" data-material="solid" data-accent="lime" data-density="comfortable" data-font="editorial">`. `npx vamos-ui theme` sets them in vamos.json and prints the attributes.

### 2. Pick a block to start from
- With MCP: call `plan_screen` with a one-line description ("CRM contacts list with bulk assign"). It returns the block to start from and the components to use.
- Without MCP: `npx vamos-ui search "<what you need>"` and `npx vamos-ui list --type block`, or read [references/blocks.md](references/blocks.md) and [references/patterns.md](references/patterns.md).
- Start from the closest block even if it is only 60% right. Do not compose a whole screen from scratch when a block fits.

### 3. Add what you need
- `npx vamos-ui add <block> <component...>` installs files, their registry dependencies and npm packages (`--dry-run` to preview, `--yes` in non-interactive runs, `--no-install` to skip npm).
- Before using a component you have not used in this session, read its real API: MCP `get_item` (usage, props, examples, guidance) or `npx vamos-ui view <name>`. Never guess props.
- Pick components with the guidance: [references/components.md](references/components.md) lists what each is, when to use it and what to use instead.

### 4. Compose with tokens only
- Adapt the block to the real domain: real-looking names, amounts, dates and statuses, never placeholders.
- Use kit components for every control, overlay, table and chart. Use semantic classes (`bg-surface`, `text-fg-muted`, `border-line`, `bg-accent`, `text-accent-ink`…) for anything custom. No colour literals, no palette classes, no `dark:`, no font names, no `z-[999]`.
- Design the hard states: empty, loading, error, long text, many items.
- Keep accent scarce: one primary action per view.

### 5. Verify and fix
- Run `npx vamos-ui verify <files or dirs>` (or MCP `verify_code` per file). It exits 1 on errors; `--json` for machine output.
- Fix every error. Review warnings and fix them unless there is a real reason not to; then suppress with a `// vamos-ui-ignore <reason>` comment on the line above.
- Rules it checks: `raw-color`, `no-dark-variant`, `no-hardcoded-font`, `icon-button-label`, `img-alt`, `click-events-interactive`, `no-positive-tabindex`, `use-client`, `z-index-token`, `prefer-kit-component`, `placeholder-content`. Without paths it also checks the project: `missing-route` (a link to a page that does not exist) and `site-essentials` (robots, sitemap, metadataBase, canonical, Open Graph, JSON-LD on a website).
- Run the project's own typecheck and tests too.

### 6. Check every axis
Look at the screen (or reason through it when you cannot render) in:
- light and dark (`class="dark"`),
- solid and glass (`data-material`): glass must not lose contrast or stack blur,
- comfortable and compact (`data-density`): nothing clips, no fixed px heights,
- at least one other accent (`data-accent="ocean"`) and font (`data-font="corporate"`): nothing hard-coded leaks through,
- a 375px-wide phone viewport and RTL where the product supports it.

### 7. Websites: before launch
Use it when the project is a public website built from `site-*` / `page-*` blocks.
- New website: start with the plan. `npx vamos-ui new` (MCP: `start_project`) asks about the business, current site, domain, hosting, one page or several, store or booking, forms, measurement and legal, then writes `vamos.project.json` (pages with their components, legal pages, hosting and form setup, measurement with consent mode, compliance, tasks, open questions) and fills `vamos.site.json`. Ask its questions in the user's words, a few at a time; build what the plan lists; ask the open questions instead of inventing answers. With a current site, read it first: `npx vamos-ui site import <url>` (MCP: `import_site`), and keep its addresses.
- `npx vamos-ui add site-…` in a Next.js App Router project also writes `app/robots.ts`, `app/sitemap.ts` and a page for each legal link the block has (`/privacy`, `/kvkk`, `/gizlilik`, `/cookies`, `/terms`, `/accessibility`, `/iade`, `/mesafeli-satis-sozlesmesi`, `/yasal-uyari` …) rendering `legal-01`; it never replaces an existing file. For an existing project run `npx vamos-ui site essentials`.
- Business info goes in `vamos.site.json` (`npx vamos-ui site init` writes it empty): name, contact, address, opening hours, legal ids, analytics ids, AI settings. Every value comes from the business; never invent or reuse one, leave unknown fields empty and ask. With it, `site essentials` also writes `app/llms.txt/route.ts`, `app/site-json-ld.tsx` (render `<SiteJsonLd />` in the root layout), robots that follow `ai.allowAiCrawlers`, and legal pages whose known [fill-in] fields are filled from it.
- The legal presets are template text: replace every [fill-in] field that is left and have the business or a lawyer review them.
- Root metadata: `metadataBase`, `alternates.canonical`, `openGraph`, a 120–160 character description; each page its own title and canonical.
- JSON-LD: the kit `Footer` emits Organization; set the business type (`jsonLd={{ "@type": "Dentist" }}`) or add `<JsonLd>` / `localBusinessJsonLd`.
- Replace every demo phone, email, map link and `href="#"` with the business's real details; `npx vamos-ui verify` lists what is left. Full checklist: rule 11 in [references/rules.md](references/rules.md).

## Design rules (summary)

The full rules are in [references/rules.md](references/rules.md) (the same text MCP `get_rules` returns). Never break these:

1. **Tokens only.** Semantic classes or `var(--token)`. No hex/rgb/hsl/oklch, no `bg-blue-500`, no `dark:`, no font names, z-index from the scale.
2. **Accent is scarce.** It fills one thing per view: the primary action, the active state, or the one data highlight. `<Button>` defaults to secondary; one `variant="primary"` per region.
3. **Glass budget.** Never paint glass (`backdrop-blur`, `bg-white/60`). At most sidebar, top bar and the topmost layer blur. Use kit overlays or `<Layer>` + `usePortalContainer()` for portals.
4. **Density from tokens.** `--control-h`, `--gap`, `--row-h`, `--cell-px`, `--radius`. Compact for data-heavy back office, comfortable for settings, onboarding and websites.
5. **Kit over hand-rolled markup.** Dialog, Sheet, Popover, DropdownMenu, Tooltip, Command, Field + controls, DataTable, charts. Never a hand-made `fixed inset-0` modal or absolutely positioned menu.
6. **Not AI-looking.** No purple gradients, glow blobs, gradient text, emoji icons, sparkles, card walls, centred-everything app screens or Inter. Lists, tables, dividers and whitespace carry structure.
7. **Realistic content and states.** Real names and numbers; empty, loading, error and overflow states; `Intl` formatting; `YYYY-MM-DD` dates, decimal-string money.
8. **Motion from the kit, sparingly.** `@vamos-ui/react/motion` and the `ui-*` classes only; animate what arrives or changes, one expressive moment per screen. Admin: fade or a small rise, no parallax or tilt. Sites: one `SiteShell motion` level. Opacity and transform only; final state under reduced motion.
9. **Accessibility.** Labels on icon-only buttons, `alt` on images, buttons and links for clicks, no positive `tabIndex`, visible focus (`focus-ring`), Field-wired labels and errors, colour never the only signal, reduced motion, logical properties for RTL.

## Theming and brand accents

Six axes on `<html>` or any subtree; components only read variables, so a subtree can differ (`<aside data-density="compact">`, `<section class="light">`).

| Axis | Attribute | Values |
|---|---|---|
| Theme | `class="dark"` | light (no class), `dark` |
| Material | `data-material` | `solid`, `glass` |
| Accent | `data-accent` | `lime`, `ocean`, `ember`, `rose`, `graphite` (or your own) |
| Density | `data-density` | `comfortable`, `compact` |
| Type | `data-font` | `editorial`, `grotesk`, `corporate`, `system` |
| Corners | `data-radius` | default (no attribute), `sharp`, `round` |

Corners work with every accent. Follows the setting: everything on `rounded-ui` / `rounded-ui-sm` / `rounded-ui-lg` or `var(--radius)` — buttons, inputs, selects, checkboxes, cards, dialogs, sheets, popovers, menus, tooltips, toasts, tabs, tables, square badges, calendars, chart tooltips and site blocks. Stays round on purpose: `rounded-full` shapes — pill badges and buttons, avatars, switches, radio dots, slider thumbs and progress bars — and small fixed details such as chart bars and event chips.

A brand colour is a new accent value with four variables, selected with `data-accent="brand"`. `npx vamos-ui brand apply` generates it (contrast-checked) from vamos.brand.json into `<uiDir>/brand.css`; written by hand it looks like this:

```css
[data-accent="brand"] {
  --accent-base: oklch(0.62 0.16 160);       /* fill: primary button, active state */
  --accent-fg: #fff;                          /* text on the fill, >= 4.5:1 */
  --accent-ink-light: oklch(0.48 0.14 160);  /* accent text on light surfaces, >= 4.5:1 */
  --accent-ink-dark: oklch(0.8 0.12 160);    /* accent text on dark surfaces */
}
```

Soft tint, focus ring and chart series 1 are derived. Do not redefine neutral tokens for a brand, and put secondary brand colours in charts or illustrations, not in UI chrome. Details, all semantic classes and the token list: [references/theming.md](references/theming.md).

## Brand and design-system skills

A brand profile (`vamos.brand.json`: accent, fonts, theme defaults, voice, logo assets) sits on top of the kit. `npx vamos-ui brand apply` turns it into `<uiDir>/brand.css` and `data-accent="brand"`. Four skills cover the lifecycle:

| Skill | Use it to |
|---|---|
| [vamos-import-design-system](../vamos-import-design-system/SKILL.md) | Create vamos.brand.json from a URL, brand files or a description, confirmed with the user, logos stored with how-to-use notes. |
| [vamos-apply-design-system](../vamos-apply-design-system/SKILL.md) | Apply the brand to the project and build or change UI with the brand and the kit. |
| [vamos-verify-design-system](../vamos-verify-design-system/SKILL.md) | Run verify and the brand check, screenshot desktop + mobile in light + dark, and report gaps with evidence. |
| [vamos-update-design](../vamos-update-design/SKILL.md) | Bring an existing project in line (dry run first, then update and migrate code to tokens and kit components). |

Brand rules in short: the brand colour is the accent and stays scarce; colour literals live only in vamos.brand.json and the generated brand.css; fonts via `font-sans` / `font-display` / `font-mono`; logos used as their `use` note says, never redrawn or recoloured; copy follows `voice`; missing assets or conflicting rules are reported, never guessed.

## References

- [references/rules.md](references/rules.md): the full design rules.
- [references/theming.md](references/theming.md): axes, semantic classes, tokens, brand accents, fonts.
- [references/components.md](references/components.md): catalog of components with use-when / avoid-when (generated).
- [references/blocks.md](references/blocks.md): catalog of blocks by category (generated).
- [references/patterns.md](references/patterns.md): recipes for CRM lists, record detail, settings, auth, dashboards and landing pages.
- [AGENTS.md](AGENTS.md): compact rules for a project's AGENTS.md / CLAUDE.md.

Regenerate the catalogs after adding components, blocks or guidance: `node skills/vamos-ui/scripts/build-catalog.mjs` (reads `apps/www/public/r` when built, else the source files).

## MCP tools (when the vamos-ui MCP server is connected)

| Tool | Use it to |
|---|---|
| `start_project(answers?)` | Plan a new website: the next questions, then the plan and `vamos.project.json` / `vamos.site.json` |
| `import_site(url)` | Read a current website: details with sources, brand candidates, navigation, texts, images |
| `plan_screen(description)` | Get the block to start from and the components to use |
| `search(query)` | Find items by name, purpose or guidance (English or Turkish) |
| `list_items(type?, group?, category?, tag?)` | Browse the registry |
| `get_item(name, include?)` / `get_block(name)` | Read usage, props, examples, guidance (and files) |
| `get_rules()` / `get_theming()` | Read the rules and theming guide |
| `verify_code(code, filename)` | Lint a file against the rules |
| `install_command(names)` | Get the exact `npx vamos-ui add …` command |
| `get_brand(projectDir?)` | Read vamos.brand.json: accent, fonts, voice, assets and problems |
| `import_design_system(url \| html)` | Draft a brand profile from a website, with evidence and what is missing |
| `propose_accent(colour)` | Turn one colour into the four contrast-checked accent variables |
| `apply_design_system(projectDir, brand?)` | Get the file edits and `npx vamos-ui brand apply` to apply the brand |
| `verify_design(code \| projectDir)` | Lint code and check the brand is applied (brand.css, import, vamos.json, assets) |
| `update_design(projectDir)` | Plan for bringing a project in line (same as `npx vamos-ui update --dry-run`) |

Prompts `build-screen` and `review-ui` run this workflow end to end.
