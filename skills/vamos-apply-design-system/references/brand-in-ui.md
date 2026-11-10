# Brand in UI: patterns

## App header with logo

`dark:` variants are banned and a logo is never recoloured, so pick the file by theme. When dark mode is the `.dark` class (the kit default), choose the file from your theme state:

```tsx
// assets: brand/logo.svg = light backgrounds, brand/logo-white.svg = dark; min height 24px
<header className="surface-bar flex h-[var(--topbar-h)] items-center gap-[var(--gap)] px-4">
  <a href="/" className="focus-ring rounded-ui-sm">
    <img src={isDark ? "/brand/logo-white.svg" : "/brand/logo.svg"} alt="Kuzey Lojistik" className="h-6 w-auto" />
  </a>
</header>
```

When the theme follows the OS setting, `<picture>` does it without state:

```tsx
<picture>
  <source srcSet="/brand/logo-white.svg" media="(prefers-color-scheme: dark)" />
  <img src="/brand/logo.svg" alt="Kuzey Lojistik" className="h-6 w-auto" />
</picture>
```

Never `filter: invert()` a logo.

## Primary action

```tsx
<Button variant="primary">Assign driver</Button>   {/* one per region; the brand colour */}
<Button>Export</Button>                              {/* secondary: neutral */}
```

## Accent text and highlights
- Links and active text: `text-accent-ink` (contrast-safe per theme).
- Quiet highlight: `bg-accent-soft`.
- Chart series 1 follows the accent automatically. Secondary brand colours go to `--chart-2…6` in the app stylesheet, never into components.

## Marketing / site sections
Use the brand more boldly here, but still through tokens: a `hero` block with the display font, one primary CTA, the brand logo strip. No gradient text, no glow blobs, no brand-colour section walls.

## Empty state on brand

```tsx
<EmptyState
  title="No shipments yet"
  description="Create the first shipment from an order. It will show up here with its route and ETA."
  actions={<Button variant="primary">Create shipment</Button>}
/>
```

Copy follows the voice: sentence case, a verb on the button, says what happens next.

## Don't
- Brand hex in className or style (`bg-[#0f766e]`): use `bg-accent`.
- Brand colour on every card border, heading or icon.
- Re-typed logo (the brand name in the display font pretending to be the logo).
- Logo smaller than its minimum size, on a photo when the note forbids it, or recoloured to match the accent.
