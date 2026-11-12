# vamos-ui

The command line for [Vamos UI](https://ui.vamos.ist): add components, blocks and themes to your project as source you own, keep them up to date, and lint your UI against the design rules.

```sh
npx vamos-ui create my-app            # new Next.js or Vite app with the kit
npx vamos-ui init                     # or add it to an existing app
npx vamos-ui add button dialog data-table
```

Requires Node 20+, Tailwind CSS v4 and React 19.

## How it works

Components are copied into your project (`uiDir`, default `src/components/vamos`) with the same folder structure as the kit, so relative imports keep working. Blocks (whole screens) go to `blocksDir/<name>/`. Imports of `@vamos-ui/react` and `@vamos-ui/react/<subpath>` are rewritten to your alias (`@/components/vamos`, `@/components/vamos/charts` …). The CLI maintains `<uiDir>/index.ts` and the subpath index files, and adds `@import "…/styles.css"` to your CSS entry right after `@import "tailwindcss"`.

Every file the CLI writes is recorded with its sha256 in `<uiDir>/.vamos-lock.json`. That is how `diff` and `upgrade` tell your edits apart from registry changes. Commit the lock file.

## Commands

| Command | What it does |
| --- | --- |
| `create <dir>` | Writes a minimal Next.js App Router (`--template next`, default) or Vite + React (`--template vite`) app with Tailwind CSS v4, installs it with the package manager you ran it with, runs `init` (with `--preset`, if given) and adds a starter screen (`button`, `card`, `badge`). `--no-install` writes files only; the folder must be new or empty. |
| `init` | Detects Next.js / Vite / Tailwind v4 and your package manager, writes `vamos.json`, installs the styles and the base library, and prints the `<html>` attributes. `--agent` also writes Vamos UI rules into `AGENTS.md` and `CLAUDE.md` and installs the agent skill in `.claude/skills/vamos-ui`. `--preset <code>` applies a preset code. |
| `add <items...>` | An item is a registry name, a URL to an item JSON, `github:owner/repo[/path][#ref]/item` or `@ns/item` (see [Open registry](#open-registry)). Resolves dependencies, shows each file it will create or update, installs npm packages with your package manager, and writes the files. Files you edited are kept unless you pass `--overwrite`. |
| `list` | Lists the registry. Filters: `--type component\|block\|lib\|style`, `--group`, `--category`, `--tag`. |
| `search <query>` | Ranked search over names, titles, descriptions and tags (Turkish-insensitive). |
| `view <name>` | Usage, props, guidance, dependencies and files. `--files` prints the source, `--json` gives the raw item. |
| `diff [names...]` | Unified diff of your installed copy against the registry. `--summary` lists files only, `--check` exits 1 when anything differs (for CI). |
| `upgrade [names...]` | Files you never touched are replaced. For files you edited that also changed upstream, it shows the diff and asks (non-interactive runs keep your version unless you pass `--overwrite`). Installs new dependencies. |
| `theme` | Picks the five axes (`--theme`, `--material`, `--accent`, `--density`, `--font`, or `--preset <code>`), saves them in `vamos.json` and prints the `<html>` attributes. |
| `preset [code]` | Prints the project's shareable preset code, or explains a code. See [Preset codes](#preset-codes). |
| `registry build [dir]` | Builds a third-party registry (`<item>.json` + `index.json`) from `components/`, `lib/` and `blocks/<name>/`, with an optional `registry.json`. `--out` (default `<dir>/r`), `--homepage`, `--name`, `--dry-run`, `--strict`. |
| `mcp add` | Writes the MCP server config for `--client claude\|cursor\|vscode\|windsurf\|codex\|gemini` (detected when left out; Claude Code as fallback). Idempotent; `--print` shows the config without writing. |
| `verify [paths...]` | Lints for design-rule and accessibility issues and exits 1 on errors. By default it checks `src/`, `app/`, `components/`, `pages/` and `lib/`, skips the kit folder, and also runs the project checks (`missing-route`, `site-essentials`). `--json`, `--quiet`. |
| `site essentials` | For a Next.js App Router website: writes `app/site.ts`, `app/robots.ts`, `app/sitemap.ts` and a page per legal link the `site-*` blocks have (`/privacy`, `/kvkk`, `/gizlilik`, `/cookies`, `/cerez-politikasi`, `/terms`, `/kullanim-kosullari`, `/accessibility`, `/iade`, `/mesafeli-satis-sozlesmesi`, `/on-bilgilendirme-formu`, `/yasal-uyari`, `/imprint` …) rendering `legal-01`. Never replaces a file. Prints the root metadata to add and the links that still have no page. `add site-…` runs it too (`--no-essentials` to skip). |
| `brand init` | Creates `vamos.brand.json` step by step: name, accent (with a live palette and contrast preview), fonts from the kit catalog (searchable, or a curated pairing), theme defaults and voice. Without a terminal, pass `--name`, `--accent`, `--display`, `--body`, `--mono`, `--radius`, `--tone`. |
| `brand import <url\|path>` | Proposes a brand from a website (page + up to 8 same-site or CDN stylesheets), a folder of brand files (SVG/PNG logos, CSS, Markdown/text/PDF guidelines) or a single logo, with the evidence for every value. `--yes` accepts, `--no-download` keeps remote logo URLs instead of saving them to `brand/`. |
| `brand apply` | Writes `<uiDir>/brand.css`, imports it once after the kit styles, sets `theme.accent`/`theme.font` to `brand` in `vamos.json`, and prints the `<html>` attributes plus the `next/font` or Google Fonts setup. |
| `brand check` | Contrast and consistency report for the brand file and the applied `brand.css` (including hand edits). Exits 1 on errors. |
| `update [paths...]` | Runs verify and lists what can be fixed automatically; `--fix` applies the safe fixes (palette classes and raw colours to tokens, mirrored `dark:` variants removed, hard-coded fonts to font tokens) and regenerates a stale `brand.css`; `--dry-run` prints the diff. Remaining items are listed for a person. |

Common flags: `-y/--yes` (no prompts), `--dry-run`, `--no-install`, `--json`, `--cwd <dir>`, `-r/--registry <url|dir>`.

## Configuration: `vamos.json`

```json
{
  "$schema": "https://ui.vamos.ist/r/config-schema.json",
  "registry": "https://ui.vamos.ist/r",
  "uiDir": "src/components/vamos",
  "blocksDir": "src/components/blocks",
  "css": "src/app/globals.css",
  "importAlias": "@/components/vamos",
  "tsx": true
}
```

The registry location is resolved in this order: `--registry`, then `VAMOS_REGISTRY`, then `vamos.json`, then the default. A value that is not an `http(s)` URL is treated as a local directory, such as `apps/www/public/r` in the monorepo.

## Open registry

`add`, `view`, `diff` and `upgrade` take items from anywhere:

| Spec | Fetched from |
| --- | --- |
| `button` | the project registry (`registry` in `vamos.json`) |
| `https://acme.dev/r/stat-card.json` | that URL (https; http only for localhost) |
| `github:acme/ui/stat-card` | `raw.githubusercontent.com/acme/ui/HEAD/r/stat-card.json` |
| `github:acme/ui/public/r#v1.2.0/stat-card` | `raw.githubusercontent.com/acme/ui/v1.2.0/public/r/stat-card.json` |
| `@acme/stat-card` | `"registries": { "@acme": "https://acme.dev/r/{name}.json" }` in `vamos.json` |
| `./r/stat-card.json` | a local item file |

Third-party items are validated against the registry item schema (`registryDependencies` may also use `./sibling`, `@ns/item`, `github:` and URLs; npm specs must be plain ranges). The CLI shows the source host before writing, never executes anything from an item, installs npm packages that only third-party items need with `--ignore-scripts`, and never lets a third-party item replace a file another item installed. Lock entries are keyed by the spec (`@acme/stat-card`) and record the source URL. Guide for publishers: https://ui.vamos.ist/docs/publish-a-registry

## Preset codes

A preset code holds the theme axes in a short string: `v1` + one letter per axis (theme `l|d`, material `s|g`, accent `l|o|e|r|g` or `x` + 6 hex digits, density `c|k`, font `s|e|g|c`, then optionally radius `s|r`). `v1dgokg` is dark, glass, ocean, compact, grotesk; `v1lsx4f46e5ce` is a custom `#4f46e5` accent. A custom accent or radius is applied through `vamos.brand.json` and `brand.css`.

```ts
import { encodePreset, decodePreset, presetAttributes } from "vamos-ui/preset";

encodePreset({ theme: "dark", material: "glass", accent: "ocean", density: "compact", font: "grotesk" }); // "v1dgokg"
decodePreset("v1lsx4f46e5ces"); // { theme: "light", …, accent: "#4f46e5", radius: "sharp" }
```

Pure, no dependencies; throws `PresetError` with the position that is wrong.

## Theming

Five attributes on `<html>` (or any element) control the look:

```html
<html class="dark" data-material="glass" data-accent="ocean" data-density="compact" data-font="grotesk">
```

| Axis | Values |
| --- | --- |
| theme | `class="dark"` or nothing |
| `data-material` | `solid`, `glass` |
| `data-accent` | `lime`, `ocean`, `ember`, `rose`, `graphite`, or `brand` after `vamos-ui brand apply` |
| `data-density` | `comfortable`, `compact` |
| `data-font` | `system`, `editorial`, `grotesk`, `corporate`, or `brand` when the brand defines fonts |

## Brand: `vamos.brand.json`

```json
{
  "$schema": "https://ui.vamos.ist/r/brand-schema.json",
  "name": "Lumen",
  "colors": { "accent": "#4f46e5", "accentDark": "#818cf8" },
  "fonts": { "display": "Sora", "body": "Plus Jakarta Sans", "mono": "JetBrains Mono" },
  "theme": { "dark": false, "material": "solid", "density": "comfortable", "radius": "default" },
  "voice": { "tone": "Plain and confident", "rules": ["Lead with the answer."], "examples": [{ "do": "Save changes", "dont": "Submit" }] },
  "assets": [{ "path": "brand/logo.svg", "use": "Primary logo on light backgrounds, min 24px high" }]
}
```

One colour becomes the four accent variables. The fill keeps the brand colour where it can; text on it is white or a dark ink, whichever reaches 4.5:1. Ink shades for light and dark surfaces are derived in OKLCH (same hue) until they reach 4.5:1 against the hardest surface of each theme. When the brand colour itself cannot carry text (a mid-tone), or would vanish on white or dark surfaces (near-white, navy, black), the lightness is adjusted and the reason is reported. `neutralTint` gives the page backdrop a faint hue; `radius` sets sharp or round corners.

```css
/* <uiDir>/brand.css (generated) */
[data-accent="brand"] {
  --accent-base: oklch(0.511 0.23 277);
  --accent-fg: #fff;
  --accent-ink-light: oklch(0.511 0.23 277);
  --accent-ink-dark: oklch(0.7 0.158 277);
}
[data-font="brand"] {
  --font-ui: var(--ff-brand-body, "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif);
  --font-heading: var(--ff-brand-display, "Sora", ui-sans-serif, system-ui, sans-serif);
}
```

`--ff-brand-*` are the `next/font` variables printed by `brand apply`; without them the named Google Fonts family (from the printed `<link>`) is used.

### Library use

```ts
import { generateAccent, brandCss, extractBrandFromHtml, checkBrand, fixSource } from "vamos-ui/brand";

generateAccent("#ffd400");
// { base, fg, inkLight, inkDark, dark?, contrast: { fgOnBase, inkLightOnLight, inkDarkOnDark }, warnings }
extractBrandFromHtml(html, [css], "https://example.com"); // { brand, evidence, colours, fonts }
```

Like `vamos-ui/verify`, `vamos-ui/brand` has no dependencies and no Node built-ins.

## verify rules

| Rule | Severity | Catches |
| --- | --- | --- |
| `raw-color` | error | hex/rgb/hsl/oklch literals in `className`/`style`, palette classes such as `bg-blue-500` (`text-white`/`bg-black` are warnings) |
| `no-dark-variant` | error | `dark:` classes (tokens already switch under `.dark`) |
| `no-hardcoded-font` | error | inline `fontFamily`, `font-['Inter']`, `next/font/google` families (warning) |
| `icon-button-label` | error | icon-only `<Button>`/`<button>` without `aria-label`, `<IconButton>` without `label` |
| `img-alt` | error | `<img>`/`<Image>` without `alt` |
| `click-events-interactive` | error | `onClick` on `div`/`span`/`li`… without `role` and `tabIndex` |
| `no-positive-tabindex` | error | `tabIndex` greater than 0 |
| `use-client` | error | React hooks in a file under `app/` without `"use client"` |
| `z-index-token` | warning | `z-[999]`, `z-50`, `zIndex: 1000` instead of the z tokens |
| `prefer-kit-component` | warning | hand-rolled dialog/menu/listbox/tooltip markup, native `<select>` |
| `placeholder-content` | warning | demo phones (`000 00 00`, `555 55 55`, `wa.me/90500…`), example.com / `.example` emails and URLs, `href="#"`, invented `maps.app.goo.gl` / `g.page` links, `[fill-in]` fields |
| `missing-route` | warning | project mode: an internal link to a route with no page in `app/` / `pages/` (or file in `public/`) |
| `site-essentials` | warning | project mode, website projects: no robots, sitemap, `metadataBase`, canonical, Open Graph or JSON-LD |

To silence a finding, put a comment containing `vamos-ui-ignore` on the same line or the line above. `vamos-ui-ignore-file` anywhere in a file skips the whole file. CSS files are checked for raw colours, fonts and z-index too.

### Library use

```ts
import { verifyProject, verifySource, VERIFY_RULES, type VerifyIssue } from "vamos-ui/verify";

const issues: VerifyIssue[] = verifySource(code, "src/app/page.tsx");
// { rule, severity: "error" | "warning", message, line, column, fix? }[]

// Project checks: pass every project path and the sources to scan.
const projectIssues = verifyProject({ paths, sources: [{ path: "src/app/page.tsx", content: code }] });
// { file, rule, severity, message, line, column, fix? }[]
```

`vamos-ui/verify` has no dependencies and no Node built-ins. It works on regexes and tokens, so it runs anywhere and is fast: about 0.4 s for the whole kit.

## Development

```sh
pnpm --filter vamos-ui build      # tsup → dist/index.js (bin) + dist/verify.js + dist/brand.js + dist/preset.js (+ .d.ts)
pnpm --filter vamos-ui test       # vitest
pnpm --filter vamos-ui typecheck
```

The integration tests run `init`, `add` and `create` against a fixture registry in a temp folder; `create` templates live in `templates/`. If `apps/www/public/r/index.json` exists, they also run against the built registry.

License: MIT
