# Extraction checklist

Write down where every value came from. You will show it to the user.

## Colour
1. Brand guidelines colour page (exact values, primary first).
2. `<meta name="theme-color">`, CSS custom properties named like `--brand`, `--primary`, `--color-primary`.
3. The colour of the main call-to-action button and links.
4. Most-used non-neutral colour in the stylesheets (weakest signal: it is often a hover state or an illustration).

A site with several strong colours still gets one accent. Ask which one the primary action uses. Very light colours (yellow, lime) and very dark ones (navy) work, and `propose_accent` adjusts fg/ink for contrast, but tell the user about the adjustment.

## Fonts
1. Guidelines typography page.
2. Google Fonts `<link>` / `@import` URLs (`family=` parameters).
3. `font-family` on `body`, `h1`–`h3` and buttons. Skip generic stacks (`system-ui`, `sans-serif`).
4. `@font-face` with self-hosted files: probably a commercial font. Ask, and suggest a catalog stand-in.

## Voice
- "Tone of voice" pages, the about page, the product's own error and empty-state copy, the `<title>` and meta description.
- Write rules as instructions an agent can follow ("Verbs on buttons"), not adjectives only.
- Take examples from real copy. If you only have marketing copy, say the voice for product UI is unconfirmed.

## Assets
- `<link rel="icon">`, `apple-touch-icon`, `og:image`, the header `<img>`/inline `<svg>` logo, `/logo.svg`, press or brand-kit pages.
- Download the original (SVG > PNG > JPG). Name files by role: `logo.svg`, `logo-white.svg`, `mark.svg`.

## Description-only briefs
Turn adjectives into options, then let the user pick:
- "deep teal, calm" → `#0f766e`, `#115e59`, `#0e7490` (run `propose_accent` on each, show the results side by side).
- "modern, friendly" → body `Hanken Grotesk` / `Onest` / `DM Sans`, display `Bricolage Grotesque` / `Instrument Serif`.
Never save a choice the user did not make.

## Conflicts to report (never resolve silently)
- Guidelines and live site disagree on a colour or font.
- Two different logos in use.
- A voice rule contradicts the kit rules (e.g. "all caps buttons"). Kit accessibility rules win; explain why.
