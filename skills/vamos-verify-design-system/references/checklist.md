# Per-screenshot checklist

Mark each item pass / fail / not checked. A fail needs evidence (screenshot name + what is wrong).

## Brand applied
- [ ] `<html data-accent="brand">` (or the screen's root) and brand.css loaded: the primary button uses the brand colour.
- [ ] Brand fonts actually render (computed `font-family`), not the fallback.
- [ ] Theme defaults from `theme` (dark, material, density) are what the app starts with.

## Accent scarcity
- [ ] One primary (accent-filled) action per region.
- [ ] Accent elsewhere only for the active/selected state and one data highlight.
- [ ] No brand-coloured headings, card borders, section backgrounds or gradients.

## Contrast and theme
- [ ] Text on the accent fill is readable in light and dark.
- [ ] Accent text/links readable on both themes.
- [ ] Dark mode: no white surfaces, invisible text, light-only logos or images with white boxes.

## Logo and assets
- [ ] Correct file for the background (per `use` note).
- [ ] At or above minimum size on mobile; clear space respected; not stretched, cropped or recoloured.
- [ ] `alt` is the brand name; favicon/app icon uses the mark if the profile has one.

## Voice
- [ ] Buttons, titles, empty states, errors and toasts follow `voice.rules` (quote any that do not).
- [ ] No copy that matches a `dont` example.

## Layout
- [ ] 375px: no horizontal scroll, nothing clipped, tap targets ≥ 40px, navigation reachable.
- [ ] 1440px: content width sensible, no stretched forms.
- [ ] Glass (if used): text over blur readable; no stacked blur.
