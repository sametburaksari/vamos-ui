---
name: vamos-apply-design-system
description: Build or change UI that follows the project's brand profile (vamos.brand.json) with the Vamos UI kit. Use when a project has vamos.brand.json and you build or edit screens, pages, components, emails-in-app copy or marketing sections, or when the user asks to apply the brand, switch the theme to the brand, or make a screen "on brand". Covers applying the brand (brand.css, data-accent="brand", fonts), using accent, fonts, logos and voice correctly, and verifying the result.
---

# Apply the design system

A brand in Vamos UI is data, not new styles: `vamos.brand.json` becomes `<uiDir>/brand.css` (`[data-accent="brand"]` + font variables), selected by `data-accent="brand"` on `<html>`. Components keep using the same semantic classes. Your job is to wire that up once, then build screens that use the brand the way the kit intends. The general workflow (blocks, kit components, tokens, verify) is in the **vamos-ui** skill. This skill adds the brand layer.

## 1. Read the brand
- MCP `get_brand({ projectDir })`, or read `vamos.brand.json`. Note the accent, fonts, theme defaults, voice (tone, rules, examples) and assets (with their `use` notes).
- No `vamos.brand.json`? Stop and use **vamos-import-design-system** first. Do not invent a brand.
- `get_brand` lists problems (missing logo files, no voice, failing contrast). Tell the user about the errors before you build.

## 2. Apply it to the project (once, and after every brand change)
- Run `npx vamos-ui brand apply` from the project root. It writes `<uiDir>/brand.css`, imports it after the kit styles, and sets `"theme": { "accent": "brand", … }` in vamos.json.
- Without a shell: MCP `apply_design_system({ projectDir })` returns the exact file contents and edits; make them yourself, or pass `write: true` to let it write inside the project.
- Set the root attributes it prints, e.g. `<html lang="tr" data-accent="brand" data-material="solid" data-density="compact" data-font="…">`.
- Load the brand fonts with the framework's loader (`next/font/google`, a `<link>` to Google Fonts). brand.css only points the font variables at the family names.
- Never hand-edit brand.css. Change vamos.brand.json and re-run the command.

## 3. Build with the brand
Follow the vamos-ui workflow (plan_screen → block → kit components → tokens → verify), plus these rules. Patterns are in [references/brand-in-ui.md](references/brand-in-ui.md).

**Colour.** The brand colour is the accent, so it stays scarce: one primary action per region, the active nav item, the selected state, chart series 1. Use `bg-accent text-accent-fg`, `text-accent-ink`, `bg-accent-soft`. Never write the brand hex in a component. A brand-coloured header bar, brand-coloured headings or a brand gradient is still wrong.

**Type.** `font-display` for headings, `font-sans` for UI, `font-mono` for IDs and code. Never name the brand family in a className.

**Logos.** Use the files in `assets` exactly as their `use` note says: the light-background logo on light surfaces, the white one in dark mode (switch with the `.dark` class or `<picture>` with `prefers-color-scheme`, not a CSS filter), at or above the minimum size, with `alt="<brand name>"`. Never redraw, recolour, crop, stretch or retype a logo. If the asset you need is missing, use the brand name in text and report the gap.

**Voice.** Every string follows `voice.tone` and `voice.rules`, and matches the `do` side of `voice.examples`: button labels, page titles, empty states, errors, toasts, confirmations, placeholders. See [references/voice.md](references/voice.md). With no voice in the profile, write plain, specific copy and say that the voice is unconfirmed.

**Theme defaults.** `theme.dark`, `material` and `density` are defaults for the whole app. A subtree can still differ (`<aside data-density="compact">`). Check both light and dark even when the brand defaults to one.

## 4. Verify
- `verify_code` on each file you wrote (or `npx vamos-ui verify <files>`); fix every error.
- MCP `verify_design({ projectDir })` before you finish. It also checks that brand.css, the import, vamos.json and the root attributes match the profile, and that the asset files exist.
- For a visual check (screenshots, light/dark, mobile) use **vamos-verify-design-system**.

## Conflicts
If the brand profile and the kit rules disagree (a voice rule wants ALL CAPS buttons, the accent fails contrast, a logo note asks for a size that does not fit a 375px header), do not pick one silently. Follow the accessibility rule, then tell the user what conflicted and what you did.
