# vamos.brand.json reference

Schema: `https://ui.vamos.ist/r/brand-schema.json`. Lives at the project root next to `vamos.json`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Brand or product name as written in UI copy. |
| `colors.accent` | CSS colour | yes | The one brand colour. Becomes `--accent-base`; fg and ink variants are derived and contrast-checked. |
| `colors.accentDark` | CSS colour | no | Separate fill for dark mode, only if the brand defines one. |
| `colors.neutralTint` | CSS colour | no | Very subtle hue for the page backdrop. Not a second accent. |
| `fonts.display` | Google Fonts family | no | Headings (`font-display`). |
| `fonts.body` | Google Fonts family | no | UI and body text (`font-sans`). |
| `fonts.mono` | Google Fonts family | no | Code, IDs, tabular numbers (`font-mono`). |
| `theme.dark` | boolean | no | Default to dark mode. |
| `theme.material` | `"solid"` \| `"glass"` | no | Default `data-material`. |
| `theme.density` | `"comfortable"` \| `"compact"` | no | Default `data-density`. |
| `theme.radius` | `"sharp"` \| `"default"` \| `"round"` | no | Corner style. `brand apply` saves it as `theme.radius` in vamos.json (`data-radius` on `<html>`), not in brand.css. |
| `voice.tone` | string | no | A few words: "Direct, calm, no jargon". |
| `voice.rules` | string[] | no | Copy rules: "Sentence case", "Verbs on buttons", "No exclamation marks". |
| `voice.examples` | `{ do, dont? }[]` | no | Real before/after pairs. |
| `assets` | `{ path, use }[]` | no | Local files (logos, marks, guideline PDFs) with a how-to-use note. |
| `source` | `{ url?, importedAt? }` | no | Where the profile came from and when (ISO date). |

## Example

```json
{
  "$schema": "https://ui.vamos.ist/r/brand-schema.json",
  "name": "Kuzey Lojistik",
  "colors": { "accent": "#0f766e", "neutralTint": "#0f766e" },
  "fonts": { "display": "Bricolage Grotesque", "body": "Hanken Grotesk", "mono": "JetBrains Mono" },
  "theme": { "dark": false, "material": "solid", "density": "compact", "radius": "default" },
  "voice": {
    "tone": "Direct and calm; logistics people, not marketers",
    "rules": ["Sentence case everywhere", "Verbs on buttons (Assign driver, not OK)", "Numbers before adjectives", "No exclamation marks"],
    "examples": [
      { "do": "Shipment KZ-2041 is 2 days late", "dont": "Oops! Something went wrong with your shipment" },
      { "do": "No shipments yet. Create the first one from an order.", "dont": "Nothing to see here!" }
    ]
  },
  "assets": [
    { "path": "brand/logo.svg", "use": "Primary logo on light backgrounds; min height 24px; clear space = height of the K" },
    { "path": "brand/logo-white.svg", "use": "On dark backgrounds and the dark theme only" },
    { "path": "brand/mark.svg", "use": "Favicon, app icon, avatar fallback; never next to the full logo" },
    { "path": "brand/guidelines.pdf", "use": "Source of truth; page 6 = logo misuse" }
  ],
  "source": { "url": "https://kuzey.example", "importedAt": "2026-11-10T09:00:00Z" }
}
```
