---
name: vamos-import-design-system
description: Create or update a project's brand profile (vamos.brand.json) for Vamos UI from a website URL, brand files (logos, guidelines, CSS) or a written description. Use when the user wants the UI to match their brand, gives a brand colour, logo, style guide or website to copy the look from, or says "import our design system", "use our brand", "make it look like our site". Produces a confirmed vamos.brand.json and local logo files with how-to-use notes; it does not change UI code.
---

# Import a design system into vamos.brand.json

The brand profile is one JSON file at the project root. It holds the brand accent, fonts, theme defaults, voice and assets. Everything else in Vamos UI (tokens, components, blocks) stays the same; `npx vamos-ui brand apply` turns the profile into `<uiDir>/brand.css` and `data-accent="brand"`. The field reference is in [references/brand-schema.md](references/brand-schema.md).

The output must be facts the user confirmed. Extraction guesses, so never save a value the user has not seen.

## Workflow

### 1. Find out what you have
Ask, or read from the conversation:
- a **URL** of a site that already has the brand,
- **files**: logo files (SVG preferred), brand guidelines (PDF, Figma export, slides), an existing stylesheet or tailwind config,
- a **description** ("deep teal, calm, for logistics companies").

Several sources can be combined; files and guidelines beat a scraped site, and the user beats both.

### 2. Extract
- **URL:** MCP `import_design_system({ url })`. It reads the page and its stylesheets and returns a draft, the evidence for each value, a contrast-checked accent and a "Missing" list. If the site blocks bots or needs a login, get the page source another way (browser tool, the user) and call `import_design_system({ html, css?, base_url })`.
- **Files:** read them yourself. Take colours from the guidelines' colour page or the stylesheet's custom properties, fonts from the typography page or `font-family` rules, voice from any "tone of voice" or copy section. Note the page or line you took each value from.
- **Description only:** write the values the user stated. For anything they did not state (usually the exact colour and fonts), propose two or three options and let them pick. See [references/extraction-checklist.md](references/extraction-checklist.md).

### 3. Check the accent
Call MCP `propose_accent({ colour })` with the chosen brand colour (plus `dark` if the brand has a separate dark-mode colour). It returns the four accent variables and the WCAG contrast of each text pair. If a pair is below 4.5:1, tell the user what was adjusted and why. Do not quietly pick a different colour.

### 4. Map fonts to the catalog
Use Google Fonts family names exactly as Google spells them (`"Bricolage Grotesque"`, `"IBM Plex Sans"`). Prefer families in the kit catalog (`@vamos-ui/react/fonts`, every one covers Turkish). If the brand uses a commercial font, say so and suggest the closest catalog family as a stand-in. Only use it once the user agrees, and record the real font in a voice rule or asset note.

### 5. Collect assets
- Save each logo and mark into the project, e.g. `brand/logo.svg`, `brand/logo-white.svg`, `brand/mark.svg`. Keep the original file, and do not redraw, trace or recolour it.
- Give every asset a `use` note: where it goes, which background (light/dark), minimum size, clear space, what not to do. Example: `"Primary logo on light backgrounds; min height 24px; never on photos"`.
- Brand guideline PDFs can be assets too (`"use": "Source of truth for colours and tone; page 4 = logo rules"`).
- If there is no usable logo, write that in the Missing list and ask for one. Do not make one.

### 6. Write the draft and confirm
Show the user one compact table: name, accent (with the contrast result), fonts, theme defaults, voice (tone + rules + examples), assets, and the Missing list. Ask them to confirm or correct it. Repeat until they confirm.

Conflicts (the site uses one teal, the PDF another; two different logos) are questions for the user. Report both values and where each came from.

### 7. Save
- Write `vamos.brand.json` at the project root with `"$schema": "https://ui.vamos.ist/r/brand-schema.json"` and `source: { url?, importedAt }`.
- Run MCP `get_brand({ projectDir })` (or `npx vamos-ui brand check`) and fix every error it reports.
- Hand over: "Brand saved. Apply it with `npx vamos-ui brand apply`", then continue with the **vamos-apply-design-system** skill if the user wants UI changes.

## Never
- Save values the user has not confirmed, or fill gaps with "plausible" brand colours, fonts, taglines or logos.
- Put a second brand colour into `colors.accent`. One accent; `neutralTint` is a subtle tint for the page backdrop, not a second accent.
- Hotlink remote logos as assets. Store a local copy.
- Copy a third party's brand into a project that is not theirs. Importing a site is for the user's own brand or one they are licensed to use.
