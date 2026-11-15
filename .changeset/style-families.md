---
"@vamos-ui/react": minor
"vamos-ui": minor
"@vamos-ui/mcp": patch
---

The theme can now express twelve style families (portal, tabloid, editorial serif, broadsheet, dark neon, gradient glass, SaaS, soft pastel, luxury, earthy, playful agency, minimal commerce) plus Arabic RTL, each as one preset code.

`@vamos-ui/react`

- Fonts: every catalog family records its licence (`license`, `fontLicenses`; all SIL OFL 1.1). New families: Anton, Silkscreen, Sacramento and the Arabic IBM Plex Sans Arabic, Noto Naskh Arabic, Noto Kufi Arabic, Readex Pro and Amiri (`fontSubsets()` adds `arabic` for next/font). Eight new pairings: `portal`, `tabloid`, `neon`, `grove`, `retail`, `arcade`, `naskh` and `kufi` (24 in all). A pairing can carry an accent face (`accent` → `--font-accent`, the `font-accent` class) and a heading case (`display.case` / `caseTracking` → `--display-case`, `--display-case-tracking`, read by `.font-display`). Every pairing now has a `[data-font]` block in styles.css; `pairingCss()` writes it and `fontVar()` names the next/font variable it reads (`--ff-<catalog id>`, the classic four keep their short names).
- Corners: `data-radius="none"` (0, large radius too) and `"pill"` (pill controls, default cards). Button and the shared control box (Input, Select and picker triggers) use the new `rounded-control` / `rounded-control-sm`, which read `--control-radius` and fall back to `--radius`; multi-line fields keep card corners.
- `data-density="spacious"` is now a page density (taller controls, larger gaps and sections, 16px corners); on Table and DataTable it still changes rows and cells only.
- `data-scene="paper|warm|ink"` retints the backdrop, solid surfaces and neutral text together (text keeps 4.5:1). `ThemeScope` / `themeAttributes` take `scene` and the new radius values.
- Colour: `--accent-2`, `--accent-2-ink` and `--accent-gradient` (`bg-accent-gradient`) for every accent; category colours `--cat-1…6` with `--cat-fg` and text-safe inks (`bg-cat-N`, `text-cat-N`), contrast-checked for every scene, light and dark.

`vamos-ui`

- Preset codes gain a letter for every font pairing, density `p` (spacious), corners `n` (none) and `p` (pill), and an optional seventh scene letter (`n|p|w|i`). Still `v1`: every existing code decodes to the same preset; an older CLI rejects a code with a new letter instead of guessing.
- `npx vamos-ui theme --family <id>` applies a named style family (preset, second accent, `dir="rtl"` for Arabic, a motion hint and the font loading snippet); `--families` lists them; `--scene` sets the scene. `PRESET_FAMILIES` and `getPresetFamily()` in `vamos-ui/preset`.
- Brand: `colors.accent2` and `fonts.accent`; brand.css writes `--accent-2-*` (derived from the accent when `accent2` is absent) and `--font-accent`. `theme.radius` and `theme.density` accept the new values. next/font snippets ask for the arabic subset where a family has it.

`@vamos-ui/mcp`

- `get_theming` documents the seventh axis, the new radius and density values, the style families with their codes, category colours, the second accent and `rounded-control`.
