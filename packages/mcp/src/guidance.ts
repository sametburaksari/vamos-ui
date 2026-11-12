import type { Axis, Token } from "./types.js";

/** Design rules every agent must follow when building with Vamos UI. Served by get_rules and vamos://rules. */
export const RULES = `# Vamos UI — design rules for agents

Follow these on every screen you build or edit. \`verify_code\` checks the mechanical ones; the rest are on you.

## 1. Tokens only
- Colours come from semantic classes or variables, never literals. Use \`bg-scene\` (page), \`bg-surface\` / the \`surface\` utility (cards), \`surface-2\` (inset areas), \`surface-popover\` (floating layers), \`surface-nav\` (sidebar), \`surface-bar\` (top bar); text \`text-fg\`, \`text-fg-muted\`, \`text-fg-subtle\`; borders \`border-line\`, \`border-surface-border\`, \`border-field-border\`; states \`bg-hover\`, \`bg-selected\`; status \`text-success|warning|danger|info\`; charts \`chart-1…chart-6\`, \`chart-seq-0…4\`.
- No hex/rgb/hsl/oklch in className or style, no Tailwind palette classes (\`bg-blue-500\`, \`text-zinc-900\`, \`border-gray-200\`).
- No \`dark:\` variants. Dark mode is the \`.dark\` class switching token values; components never branch on theme.
- No hard-coded fonts (no Inter, Arial, font-family literals). Use \`font-sans\` (UI), \`font-display\` (headings, with the \`font-display\` weight/tracking class), \`font-mono\` (code, numbers in tables if needed).
- Radius from \`rounded-ui\`, \`rounded-ui-sm\`, \`rounded-ui-lg\`; z-index from the scale (\`--z-sticky\` 20, \`--z-nav\` 30, \`--z-overlay\` 50, \`--z-popover\` 60, \`--z-toast\` 70, \`--z-tooltip\` 80) — never \`z-[999]\`.
- Type scale: \`text-display-2xl|xl|l|m\` for marketing/hero headings, \`text-h3\`, \`text-lead\`, \`text-body\`, \`text-small\`, \`text-eyebrow\`. App screens rarely need display sizes above \`text-display-m\`.

## 2. Accent is scarce
- The accent fills exactly one thing per view: the primary action (one \`<Button variant="primary">\` per screen region), the active/selected state (current nav item, selected tab, checked control), or the one data highlight (chart series 1, the KPI that matters).
- Everything else is neutral: \`<Button>\` defaults to \`variant="secondary"\`; use \`ghost\` for toolbars, \`solid\` for a decisive typographic step ("Publish"), \`soft\` for a quiet accent, \`danger\` / \`danger-ghost\` for destructive actions (\`--danger-solid\`).
- \`text-accent-ink\` is for accent-coloured text/icons on neutral surfaces (it is contrast-safe per theme); \`bg-accent\` always pairs with \`text-accent-fg\`; \`bg-accent-soft\` for quiet highlights.
- Two primary buttons side by side, accent-coloured headings, accent borders on every card = wrong.

## 3. Material & the glass budget
- Glass is a theme axis (\`data-material="glass"\`), not something you paint. Never add \`backdrop-blur\`, translucent \`bg-white/60\` or your own gradients — the surface utilities already switch to glass.
- Budget: at most the sidebar, the top bar and the single topmost layer blur at once. Layers nested inside another layer (a popover in a dialog, a submenu) never blur — the kit handles this when you use its overlays (\`Dialog\`, \`Sheet\`, \`Popover\`, \`DropdownMenu\`) and \`<Layer>\` + \`usePortalContainer()\` for custom portals.
- Do not stack \`surface\` inside \`surface\` repeatedly; inside a card use \`surface-2\` or plain dividers (\`border-line\`).

## 4. Density
- Size from tokens so \`data-density="compact"\` works: controls use \`h-[var(--control-h)]\` (kit components already do), gaps \`gap-[var(--gap)]\`, table rows \`--row-h\` / \`--cell-px\`, app shell \`--sidebar-w\`, \`--topbar-h\`.
- Don't fix heights in px on controls or rows. Pick compact for data-heavy back-office screens (tables, CRM, ops); comfortable for settings, onboarding, websites.

## 5. Use the kit, not hand-rolled markup
- Overlays: \`Dialog\`, \`Sheet\`, \`AlertDialog\`, \`Popover\`, \`DropdownMenu\`, \`ContextMenu\`, \`Tooltip\`, \`Command\` — never a hand-made \`fixed inset-0\` modal or an absolutely positioned div menu (focus trap, Escape, scroll lock and the glass budget come for free).
- Forms: \`Field\` + the control (\`Input\`, \`Select\`, \`Combobox\`, \`DatePicker\`, …) so labels, descriptions, errors and \`aria-describedby\` are wired.
- Data: \`DataTable\` from \`@vamos-ui/react/data-table\` for real tables (sorting, selection, pagination, density), charts from \`@vamos-ui/react/charts\` (they read \`--chart-*\`).
- Start whole screens from a block (\`plan_screen\` → \`get_block\`) instead of composing from scratch.

## 6. Doesn't look AI-generated
- No purple/blue gradients, no glowing blobs, no gradient text, no emoji as icons or bullet points, no sparkle icons on everything.
- No generic card walls: not every piece of content needs a card. Use lists, tables, dividers, whitespace, and one clear hierarchy (page title → section → content).
- No Inter. No centred everything; app screens are left-aligned with a clear reading order.
- Icons from \`lucide-react\`, 16px in dense UI, \`text-fg-muted\` unless they carry meaning.
- Restraint: one heading font, one accent, consistent radii, aligned edges.

## 6b. Motion
- Motion comes from the kit: overlay classes (\`ui-*\`) and \`@vamos-ui/react/motion\` (\`Reveal\`, \`Stagger\`, \`CountUp\`, \`Ticker\`, \`TextReveal\`, \`Parallax\`, \`Tilt\`, \`Magnetic\`, \`PageTransition\`, \`SkeletonSwap\`, \`useScrollShrink\`, \`vm-press\` / \`vm-lift\` / \`vm-underline\` / \`vm-nudge\`). No motion libraries, no hand-written keyframes or \`transition: all\`.
- Motion explains, it does not decorate: animate what changes or arrives (a page, a list, a number, loaded content) and leave settled UI still. One expressive moment per screen.
- Admin screens: \`fade\` or a 6–8 px \`rise\` at most (\`Stagger\` on a list or KPI row, \`SkeletonSwap\` for loaded data, \`CountUp\` on the one KPI that matters). No parallax, tilt, magnetic buttons or text reveals in an app; tables and forms never animate on scroll.
- Websites: set the level once on \`SiteShell\` (\`motion="subtle"\` default, \`"full"\` only when motion is part of the brand, \`"off"\` for sober sites). Never above-the-fold scroll reveals; the hero enters with CSS on first paint.
- Opacity and transform only, never width, height, top or margin, so layout never shifts (CLS 0). Never hide server-rendered content that is already in view.
- Keep entrances under a second and exits shorter than entrances; durations come from the level and density tokens, not literals.
- Reduced motion and \`data-motion="off"\` show the final state everywhere; a \`CountUp\` value is the real number for screen readers.

## 7. Realistic content
- Real-looking names, companies, amounts, dates and statuses ("Ayşe Demir — Invoice INV-2041 — ₺18,450.00 — Overdue 3 days"), never "Lorem ipsum", "Item 1", "John Doe", "Test".
- Show the hard states: empty (with one clear next action), loading (\`Skeleton\` matching the final layout), error (what happened + how to fix), long text (truncate with title/tooltip), many items (pagination/virtualisation).
- Numbers, dates and money through \`Intl\` / the kit's \`useFormat()\`; date-only values as \`YYYY-MM-DD\` strings, money as decimal strings.

## 8. Accessibility (non-negotiable)
- Every icon-only button has \`aria-label\` (kit: \`<Button size="icon" aria-label="Delete invoice">\`).
- Every \`<img>\`/\`<Image>\` has \`alt\` (\`alt=""\` for decorative).
- Clickable things are \`<button>\` or \`<a>\`. A \`div\` with \`onClick\` needs \`role\`, \`tabIndex={0}\` and key handling — prefer a button.
- Never positive \`tabIndex\`. Keep DOM order = visual order.
- Visible focus: kit components use the \`focus-ring\` utility; use it on custom interactive elements.
- Form inputs have visible labels (\`Field\`/\`Label\`), errors are announced (\`aria-invalid\` + \`aria-describedby\`, the kit wires this).
- Colour is never the only signal: pair status colours with text or an icon.
- Respect \`prefers-reduced-motion\`: use the kit overlay motion classes (\`ui-pop\`, \`ui-fade\`, \`ui-dialog\`, \`ui-sheet-*\`, \`ui-collapse\`) and the motion subpath, which render the final state under reduced motion. Moving content (a ticker, autoplay) always has a pause control.
- RTL-safe: logical properties (\`ps-*\`, \`pe-*\`, \`ms-*\`, \`me-*\`, \`start-*\`, \`end-*\`, \`text-start\`).

## 9. Framework notes
- Next.js App Router: files under \`app/\` that use hooks or event handlers need \`"use client"\`; keep static display components server-compatible. Server components must not pass function props into client parts.
- Import from \`@vamos-ui/react\` (package mode) or the alias in vamos.json (copy mode, e.g. \`@/components/vamos\`).

## 10. Brand profile and voice
- If the project has \`vamos.brand.json\`, call \`get_brand\` before writing UI. The brand is applied as \`data-accent="brand"\` from \`<uiDir>/brand.css\`; components still use the same semantic classes (\`bg-accent\`, \`text-accent-ink\`), never the brand hex.
- Colour literals live only in vamos.brand.json and the generated brand.css. Change the brand there and re-run \`npx vamos-ui brand apply\`; never hand-edit brand.css.
- Brand fonts come through \`font-sans\` / \`font-display\` / \`font-mono\`; brand.css points the variables at the families and the app loads the files.
- The brand still gets one accent and the accent stays scarce. \`colors.neutralTint\` tints neutrals slightly; it is not a second accent. Secondary brand colours go into charts or illustrations.
- Voice: every label, button, empty state, error and toast follows \`voice.tone\` and \`voice.rules\`; match the \`voice.examples\` (do, not dont). Without a voice, write plain, specific copy and ask before inventing taglines.
- Assets: use the logo files listed in \`assets\` exactly as their \`use\` note says (which file on light or dark, minimum size). Never redraw, recolour, stretch or retype a logo, and never invent one. Missing logo or conflicting rules → say so and ask.
- Contrast is non-negotiable: if \`propose_accent\` reports a pair below 4.5:1, do not use that variable for text.

## 11. Websites: launch checklist
Use it when the screen is a public website (\`site-*\`, \`page-*\`, \`legal-01\` blocks), before it goes live. \`npx vamos-ui site essentials\` writes the files; \`verify_design({ projectDir })\` / \`npx vamos-ui verify\` reports what is still missing.
- Legal pages: a page for every footer and consent link (\`/privacy\` or \`/gizlilik\`, \`/kvkk\`, \`/cookies\` or \`/cerez-politikasi\`, \`/terms\` or \`/kullanim-kosullari\`, \`/accessibility\`; for a shop \`/returns\` or \`/iade\`, \`/mesafeli-satis-sozlesmesi\`, \`/on-bilgilendirme-formu\`; \`/legal-notice\` or \`/yasal-uyari\`) from the \`legal-01\` presets; replace every [fill-in] field and have the business or a lawyer review the text. No internal link without a page (404).
- \`robots.txt\` and \`sitemap.xml\` (\`app/robots.ts\`, \`app/sitemap.ts\`) listing every public route.
- Metadata: \`metadataBase\`, \`alternates.canonical\` on every page, \`openGraph\` (siteName, locale, image), a unique title (under 60 characters) and a 120–160 character description per page; verify flags titles over 60 and descriptions outside 70–160.
- JSON-LD: the kit \`Footer\` emits Organization; give it the business type (\`jsonLd={{ "@type": "Restaurant" }}\`) or add \`<JsonLd>\` / \`localBusinessJsonLd\` with address, phone and opening hours.
- Real contact details: no placeholder phones (\`000 00 00\`, \`555 55 55\`, \`wa.me/90500…\`), no example.com or \`.example\` emails and links, no \`href="#"\`, no invented \`maps.app.goo.gl\` / \`g.page\` links (copy the share link from the business's Maps listing, or use \`directionsUrl()\`).
- Working links: phone as \`tel:\`, email as \`mailto:\`, the map link opens the real listing.
- Images: \`sizes\` matches the rendered width, so phones do not download images 2–3× larger than shown; files in \`public/\` under 300 KB (WebP/AVIF), verify flags heavier ones. Tap targets at least 24px (kit links already are).

## Workflow
1. \`get_brand\` when there is a vamos.brand.json; \`plan_screen\` with the screen description → pick the suggested block.
2. \`get_block\` / \`get_item\` for source, props and examples; \`install_command\` for the exact \`npx vamos-ui add …\`.
3. Build with tokens and kit components; adapt content to the real domain.
4. \`verify_code\` on every file you wrote; fix all errors, review warnings. Before you finish, \`verify_design({ projectDir })\` for the project and brand.
`;

const CLASS_GROUPS: { title: string; classes: string[] }[] = [
  { title: "Page & surfaces", classes: ["bg-scene", "surface", "surface-2", "surface-popover", "surface-nav", "surface-bar", "bg-surface", "bg-surface-2"] },
  { title: "Text", classes: ["text-fg", "text-fg-muted", "text-fg-subtle", "text-accent-ink", "text-accent-fg"] },
  { title: "Lines & fields", classes: ["border-line", "border-surface-border", "bg-field", "border-field-border"] },
  { title: "States", classes: ["bg-hover", "bg-selected", "bg-accent", "bg-accent-soft", "ring-ring", "focus-ring"] },
  { title: "Status", classes: ["text-success", "text-warning", "text-danger", "bg-danger-solid", "text-info"] },
  { title: "Charts", classes: ["chart-1 … chart-6 (categorical)", "chart-seq-0 … chart-seq-4 (sequential)", "chart-grid", "chart-axis"] },
  { title: "Shape & type", classes: ["rounded-ui", "rounded-ui-sm", "rounded-ui-lg", "font-sans", "font-display", "font-mono", "text-display-m", "text-h3", "text-body", "text-small", "text-eyebrow"] },
];

function htmlFor(axes: Axis[]): string {
  const attrs = axes
    .filter((axis) => axis.attribute !== "class")
    .map((axis) => `${axis.attribute}="${axis.default}"`)
    .join(" ");
  return `<html lang="en" class="dark" ${attrs}>`;
}

export interface ThemingOptions {
  includeTokens?: boolean;
}

/** Markdown theming guide: axes, semantic classes, tokens, brand accents. */
export function buildTheming(axes: Axis[], tokens: Token[], options: ThemingOptions = {}): string {
  const lines: string[] = [];
  lines.push("# Vamos UI — theming");
  lines.push("");
  lines.push(
    "Vamos UI is themed by five independent axes, set as attributes on `<html>` or on any element (a subtree can differ from the page). Components only read CSS variables, so switching an axis is one attribute — no rebuild, no `dark:` classes.",
  );
  lines.push("");
  lines.push("## Axes");
  lines.push("");
  lines.push("| Axis | Attribute | Values (default first) | What it changes |");
  lines.push("|---|---|---|---|");
  for (const axis of axes) {
    const values = [axis.default, ...axis.values.filter((v) => v !== axis.default)].map((v) => `\`${v}\``).join(", ");
    const attr = axis.attribute === "class" ? '`class="dark"`' : `\`${axis.attribute}\``;
    lines.push(`| ${axis.name} | ${attr} | ${values} | ${axis.description ?? ""} |`);
  }
  lines.push("");
  lines.push("Example root element:");
  lines.push("");
  lines.push("```html");
  lines.push(htmlFor(axes));
  lines.push("```");
  lines.push("");
  lines.push(
    'Subtrees: `<section class="light">` inside a dark page, `<aside data-density="compact">`, `<div data-accent="ocean">` for a preview. In copy mode, `npx vamos-ui theme` writes the axes to vamos.json and prints these attributes.',
  );
  lines.push("");
  lines.push("## Setup");
  lines.push("");
  lines.push("```css");
  lines.push('/* app stylesheet — after Tailwind v4 */');
  lines.push('@import "tailwindcss";');
  lines.push('@import "@vamos-ui/react/styles.css";   /* copy mode: @import "<uiDir>/styles.css"; */');
  lines.push("```");
  lines.push("");
  lines.push(
    "Fonts: the app loads the font files and provides `--ff-*` variables (e.g. `--ff-onest`, `--ff-instrument`, `--ff-jetbrains` for `editorial`); `@vamos-ui/react/fonts` has the font catalog, pairings and a provider. `data-font=\"system\"` needs no font files.",
  );
  lines.push("");
  lines.push("## Semantic classes (use these, never palette colours)");
  lines.push("");
  for (const group of CLASS_GROUPS) {
    lines.push(`- **${group.title}:** ${group.classes.map((c) => `\`${c}\``).join(", ")}`);
  }
  lines.push("");
  lines.push("## Brand accents");
  lines.push("");
  lines.push(
    "The accent is one source colour; fill, soft tint, ink (accent-coloured text), focus ring and chart series 1 are derived. To use a brand colour, define a new accent value with four variables and set `data-accent` to it:",
  );
  lines.push("");
  lines.push("```css");
  lines.push('[data-accent="brand"] {');
  lines.push("  --accent-base: oklch(0.62 0.16 160);      /* the fill (primary button, active state) */");
  lines.push("  --accent-fg: #fff;                         /* text on the fill: >= 4.5:1 against --accent-base */");
  lines.push("  --accent-ink-light: oklch(0.48 0.14 160); /* accent text/icons on light surfaces: >= 4.5:1 on --surface */");
  lines.push("  --accent-ink-dark: oklch(0.8 0.12 160);   /* accent text/icons on dark surfaces */");
  lines.push("}");
  lines.push("```");
  lines.push("");
  lines.push("```html");
  lines.push('<html data-accent="brand">');
  lines.push("```");
  lines.push("");
  lines.push("Rules for brand accents:");
  lines.push("- Check contrast: `--accent-fg` on `--accent-base` and `--accent-ink-*` on `--surface` must reach 4.5:1 (3:1 for large text and focus rings).");
  lines.push("- Very light brand colours (yellow, lime) take a dark `--accent-fg`; dark brand colours (navy, graphite) need a lighter `--accent-ink-dark` for dark mode.");
  lines.push("- Prefer `oklch()` so ink variants keep the hue while changing lightness. Colour literals belong in this accent definition only — never in components.");
  lines.push("- Don't redefine neutral tokens (`--surface`, `--fg`, …) for a brand. If you must, override them for both `:root` and `.dark` and keep the glass values (`[data-material=\"glass\"]`) translucent.");
  lines.push("- A brand still gets one accent. Secondary brand colours go into charts (`--chart-2…6`) or illustrations, not UI chrome.");
  lines.push("");
  lines.push("## Brand profile (vamos.brand.json)");
  lines.push("");
  lines.push(
    "A project can describe its brand in `vamos.brand.json` at the root: `name`, `colors` (`accent`, optional `accentDark`, `neutralTint`), `fonts` (`display`, `body`, `mono` — Google Fonts families), `theme` (`dark`, `material`, `density`, `radius`), `voice` (`tone`, `rules`, `examples` of do/don't copy) and `assets` (logo files with a `use` note). `npx vamos-ui brand apply` generates `<uiDir>/brand.css` with `[data-accent=\"brand\"]` and the font variables, imports it after the kit styles and sets `\"theme\": { \"accent\": \"brand\" }` in vamos.json.",
  );
  lines.push("");
  lines.push("```json");
  lines.push('{');
  lines.push('  "$schema": "https://ui.vamos.ist/r/brand-schema.json",');
  lines.push('  "name": "Kuzey Lojistik",');
  lines.push('  "colors": { "accent": "#0f766e" },');
  lines.push('  "fonts": { "display": "Bricolage Grotesque", "body": "Hanken Grotesk" },');
  lines.push('  "theme": { "material": "solid", "density": "compact" },');
  lines.push('  "voice": { "tone": "Direct and calm", "rules": ["Verbs on buttons", "No exclamation marks"], "examples": [{ "do": "Shipment delayed by 2 days", "dont": "Oops! Something went wrong" }] },');
  lines.push('  "assets": [{ "path": "brand/logo.svg", "use": "Header on light backgrounds, min 96px wide" }]');
  lines.push('}');
  lines.push("```");
  lines.push("");
  lines.push("MCP tools: `get_brand` (read it), `import_design_system` (draft one from a website), `propose_accent` (one colour → contrast-checked accent), `apply_design_system` (edits + command), `verify_design` (code + brand checks), `update_design` (plan for an existing project). Voice and assets are rules too: copy follows `voice`, logos are used as their `use` note says and never redrawn.");
  lines.push("");
  lines.push("## Material");
  lines.push("");
  lines.push(
    "`data-material=\"glass\"` makes surfaces translucent with blur over a soft colour scene; the same classes are used, so component code does not change. Glass budget: sidebar + top bar + one topmost layer may blur; nested layers use `--popover-nested` (opaque). `data-glass-quality=\"low\"` turns blur off on low-power devices; blur is also off while dragging.",
  );
  lines.push("");
  lines.push("## Density");
  lines.push("");
  lines.push(
    "`data-density=\"compact\"` shrinks `--control-h` (2.5rem → 2.125rem), `--radius` (14px → 10px), `--gap`, `--row-h`, `--cell-px` and `--topbar-h`. Size custom elements from these variables so they follow.",
  );

  if (options.includeTokens !== false) {
    lines.push("");
    lines.push("## Tokens");
    lines.push("");
    if (!tokens.length) {
      lines.push("_The registry has no tokens.json; see packages/ui/src/styles.css for the full list._");
    } else {
      lines.push("| Token | Light | Dark | Notes |");
      lines.push("|---|---|---|---|");
      for (const token of tokens) {
        const cell = (v?: string) => (v ? `\`${v.replace(/\|/g, "\\|")}\`` : "—");
        lines.push(`| \`${token.name}\` | ${cell(token.light)} | ${cell(token.dark ?? (token.light ? "same" : undefined))} | ${token.description ?? ""} |`);
      }
    }
  }
  lines.push("");
  return lines.join("\n");
}
