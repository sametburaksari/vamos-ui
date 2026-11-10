---
title: Design system
description: Give Vamos UI your brand once (colour, fonts, theme, voice, logos) and every component, block and AI agent follows it.
---

# Design system

Vamos UI ships with five accents and four font pairings. Your product has its own brand. A **brand profile** is one file, `vamos.brand.json`, that tells the kit, the CLI and your AI agents what that brand is. Components do not change. The brand becomes one more accent (`data-accent="brand"`) plus font variables, so everything built with the kit picks it up, including the blocks you add later.

## What a brand profile holds

| Part | What it does |
|---|---|
| `name` | The brand name, as it appears in copy and logo `alt` text. |
| `colors.accent` | Your one brand colour. It becomes the primary button, the active state and chart series 1. Text colours on it and around it are derived and checked for contrast. |
| `colors.accentDark`, `colors.neutralTint` | Optional: a separate fill for dark mode, and a faint tint for the page backdrop. |
| `fonts.display`, `fonts.body`, `fonts.mono` | Google Fonts families for headings, UI text and code. Families from the kit's font catalog cover Turkish and every Latin-extended language. |
| `theme` | Defaults: `dark`, `material` (`solid` / `glass`), `density` (`comfortable` / `compact`), `radius` (`sharp` / `default` / `round`). |
| `voice` | How the product speaks: a `tone`, hard `rules` ("Verbs on buttons") and `examples` of do / don't copy. Agents follow it in every label, empty state and error. |
| `assets` | Logo files and brand documents in your project, each with a `use` note: where it goes, which background, minimum size. |
| `source` | Where the profile came from and when. |

```json
{
  "$schema": "https://ui.vamos.ist/r/brand-schema.json",
  "name": "Kuzey Lojistik",
  "colors": { "accent": "#0f766e" },
  "fonts": { "display": "Bricolage Grotesque", "body": "Hanken Grotesk" },
  "theme": { "material": "solid", "density": "compact" },
  "voice": {
    "tone": "Direct and calm",
    "rules": ["Sentence case", "Verbs on buttons", "No exclamation marks"],
    "examples": [{ "do": "Shipment KZ-2041 is 2 days late", "dont": "Oops! Something went wrong" }]
  },
  "assets": [
    { "path": "brand/logo.svg", "use": "Primary logo on light backgrounds; min height 24px" },
    { "path": "brand/logo-white.svg", "use": "Dark backgrounds and dark theme only" }
  ]
}
```

Only `name` and `colors.accent` are required. A missing voice or logo is fine, and the tools will tell you it is missing. They do not make one up.

## How it is applied

```sh
npx vamos-ui brand apply
```

This reads `vamos.brand.json` and:

1. writes `<uiDir>/brand.css` with `[data-accent="brand"] { --accent-base; --accent-fg; --accent-ink-light; --accent-ink-dark }` and the font variables,
2. imports it in your CSS entry right after the kit styles,
3. sets `"theme": { "accent": "brand", … }` in `vamos.json`,
4. prints the `<html>` attributes and the font links to add.

The accent is computed in OKLCH. If your colour is too light or too dark for text to be readable on it (WCAG 4.5:1), the lightness of the text variants is adjusted and the command tells you what it changed. Your brand colour itself stays as the fill.

Change the brand by editing `vamos.brand.json` and running the command again. Do not edit `brand.css` by hand.

## Commands

| Command | What it does |
|---|---|
| `npx vamos-ui brand apply` | Generates brand.css and wires it into the project (above). |
| `npx vamos-ui brand check` | Validates the profile: required fields, contrast, fonts, asset files on disk. |
| `npx vamos-ui update --dry-run` | Shows the diff of the safe fixes that bring your code in line: palette classes and raw colours to tokens, mirrored `dark:` variants removed, hard-coded fonts to font tokens, a stale brand.css. Lists what is left for a person. |
| `npx vamos-ui update --fix` | Applies those fixes. Without `--fix`, `update` only reports. |
| `npx vamos-ui upgrade` | Updates kit files that changed upstream. Files you edited are kept unless you pass `--overwrite`. |
| `npx vamos-ui verify` | Lints your code for raw colours, `dark:` variants, hard-coded fonts and accessibility issues. |

## MCP tools

With the Vamos UI MCP server connected (`claude mcp add vamos-ui -- npx -y @vamos-ui/mcp`), agents get:

| Tool | What it returns |
|---|---|
| `get_brand(projectDir?)` | The profile, the generated accent, the voice rules and any problems. |
| `import_design_system(url \| html)` | A draft profile from a website: colour from `theme-color`, CSS variables and the most-used colours; fonts from `font-family` and Google Fonts links; logo candidates; voice hints from the page title and description. Every value comes with its evidence, and there is a list of what is missing. Nothing is written. |
| `propose_accent(colour)` | The four accent variables for a colour, with the contrast of each pair. |
| `apply_design_system(projectDir, brand?)` | The exact file edits and the `npx vamos-ui brand apply` command. It writes only when asked, and only inside the project. |
| `verify_design(code \| projectDir)` | Rule violations in your code, plus whether the brand is actually applied (brand.css up to date, import order, vamos.json, `<html>`, asset files). |
| `update_design(projectDir)` | The update plan, with violations grouped by rule and file. |

`get_rules` and `get_theming` also cover brand accents and voice, so an agent that reads the rules knows the brand colour stays scarce and logos are never redrawn.

## Agent skills

Four skills (Agent Skills format, for Claude Code and compatible agents) cover the lifecycle. They sit next to the main `vamos-ui` skill in `skills/`.

| Skill | Use it when |
|---|---|
| `vamos-import-design-system` | You want a profile from your website, brand files or a description. The agent extracts, shows you the draft with its sources, and saves only what you confirm. Logos are saved into the project with a "how to use" note. |
| `vamos-apply-design-system` | You build or change screens. The agent applies the brand, then uses the accent, fonts, logos and voice the way the kit intends. |
| `vamos-verify-design-system` | Before a release or handover. The agent runs verify and the brand check, takes desktop and mobile screenshots in light and dark, and reports gaps with evidence: missing logo variants, off-brand copy, conflicts between the profile and the kit rules. |
| `vamos-update-design` | You bring an existing project in line: a rebrand, a migration from hand-rolled styles, or a changed profile. The agent starts with a dry run and waits for your go-ahead. |

## Examples

**Import from your site**

> Use our website kuzey-lojistik.example as the design system for this app.

The agent calls `import_design_system`, shows you the accent with its contrast check, the fonts, the logo files it found and what is missing (usually voice). It saves `vamos.brand.json` and `brand/logo.svg` after you confirm, then runs `npx vamos-ui brand apply`.

**Start from one colour**

> Our brand colour is #0f766e. Set it up.

The agent calls `propose_accent("#0f766e")`, writes a minimal profile (`name`, `colors.accent`), applies it, and asks about fonts, voice and logos.

**Check a screen**

> Is the shipments page on brand?

The agent runs `verify_design`, screenshots the page at 1440px and 375px in light and dark, and reports, for example: "Header uses `logo.svg` on the dark bar (asset note says dark backgrounds use `logo-white.svg`)" or "Empty state says 'Nothing here!' (voice rule: no exclamation marks)".

**Rebrand an existing app**

> We changed our brand colour and font. Update the app.

The agent edits `vamos.brand.json`, shows `npx vamos-ui update --dry-run`, applies it after you agree, migrates any raw colours it finds to tokens, and verifies.

## Rules that do not change with a brand

- One accent, used for the primary action, the active state and one data highlight.
- Colour literals live only in `vamos.brand.json` and the generated `brand.css`, never in components.
- Fonts go through `font-sans`, `font-display` and `font-mono`.
- Contrast of 4.5:1 for text, in light and dark.
- Logos are used as their note says. They are never redrawn, recoloured or invented.
