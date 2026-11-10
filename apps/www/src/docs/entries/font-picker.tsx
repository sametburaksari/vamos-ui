import { ex, type DocEntry } from "../types";
import FontPickerDemo from "../examples/font-picker/demo";
import FontPickerCategories from "../examples/font-picker/categories";
import FontPickerStates from "../examples/font-picker/states";
import FontPickerInline from "../examples/font-picker/inline-list";
import FontPairings from "../examples/font-picker/pairings";
import BrandTypography from "../examples/font-picker/brand-settings";
import FontProviderScoped from "../examples/font-picker/provider";

const entry: DocEntry = {
  slug: "font-picker",
  title: "Font picker",
  group: "Forms & inputs",
  description:
    "Choose a typeface from a curated catalog of 59 Google Fonts families — searchable, grouped by category, every row previewed in its own face — or one of 16 type pairings. Ships with a deduped Google Fonts loader and a provider that applies a pairing to a page or a single section.",
  source: ["fonts/font-picker.tsx", "fonts/pairing-picker.tsx", "fonts/provider.tsx", "fonts/pairings.ts", "fonts/loader.ts", "fonts/catalog.ts"],
  basedOn: "Radix Popover · WAI-ARIA combobox + listbox · radio group",
  usage: `import { FontPicker, FontPairingPicker, FontProvider } from "@vamos-ui/react/fonts";

<Field label="Heading font">
  <FontPicker value={family} onValueChange={setFamily} />
</Field>`,
  demo: ex("demo", "Demo", "font-picker/demo.tsx", FontPickerDemo),
  examples: [
    ex("categories", "Restrict categories", "font-picker/categories.tsx", FontPickerCategories, "categories narrows the list — mono for code and invoice numbers, serif for article text. The chips only show categories that remain."),
    ex("states", "Empty, invalid and disabled", "font-picker/states.tsx", FontPickerStates, "Inside a Field the trigger picks up the label, hint, error and disabled state."),
    ex("inline", "Inline list", "font-picker/inline-list.tsx", FontPickerInline, "FontPickerList is the panel without the popover, for settings pages. Type to filter; ↑/↓ and PageUp/PageDown move, Enter selects. The specimen strip shows the active row large."),
    ex("pairings", "Pairing picker", "font-picker/pairings.tsx", FontPairings, "Sixteen curated heading + body + mono pairings, each with its own display weight, tracking, <em> style and scale. A radio group: arrows move and select."),
    ex("brand-settings", "CMS brand settings", "font-picker/brand-settings.tsx", BrandTypography, "Three pickers build a custom pairing with createFontPairing; FontProvider applies it to the preview only, so the panel around it keeps the admin fonts."),
    ex("provider", "Scoped provider", "font-picker/provider.tsx", FontProviderScoped, "useFontPairing() reads and sets the pairing of the nearest FontProvider. scope=\"document\" applies it to <html> instead."),
  ],
  api: [
    { name: "FontPicker", props: [
      { name: "value", type: "string | null", description: "Selected family name (controlled). null = nothing selected." },
      { name: "defaultValue", type: "string | null", description: "Initial family (uncontrolled)." },
      { name: "onValueChange", type: "(family: string, font: GoogleFont) => void", description: "Called on selection; the popover then closes and focus returns to the trigger." },
      { name: "fonts", type: "GoogleFont[]", default: "googleFonts", description: "Families to offer. Default: the 59-family catalog." },
      { name: "categories", type: "FontCategory[]", description: '"sans" | "serif" | "display" | "rounded" | "condensed" | "mono" | "handwriting".' },
      { name: "previewText", type: "string", default: '"Hamburgefonstiv — Ağaç işçiliği"', description: "Sample line under each family." },
      { name: "loadPreviews", type: "boolean", default: "true", description: "Load glyph-subset previews (a few KB per visible family) from Google Fonts. Turn off when you self-host." },
      { name: "specimen", type: "boolean", default: "true", description: "Large specimen of the active row at the bottom of the panel." },
      { name: "listHeight", type: "string", default: '"18rem"', description: "Max height of the scrolling list." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Trigger height; md follows --control-h." },
      { name: "placeholder", type: "string", default: '"Choose a font"', description: "Trigger text when empty." },
      { name: "showCategory", type: "boolean", default: "true", description: "Show the group (\"Serif · Display\") beside the family in the trigger." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Popover state, controlled or not." },
      { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Popover alignment against the trigger." },
      { name: "name / required", type: "string / boolean", description: "Adds a hidden input for native form posts." },
      { name: "disabled", type: "boolean", default: "false", description: "Also read from the surrounding Field." },
      { name: "contentClassName", type: "string", description: "Class for the popover panel." },
      { name: "labels", type: "Partial<FontPickerLabels>", description: "Built-in strings (namespace fontPicker): placeholder, search, searchPlaceholder, categories, all, list, empty, results, variable, italic, weights." },
    ] },
    { name: "FontPickerList", props: [
      { name: "value / defaultValue / onValueChange", type: "string | null / string | null / (family, font) => void", description: "Same as FontPicker." },
      { name: "fonts · categories · previewText · loadPreviews · specimen · listHeight · labels", type: "—", description: "Same as FontPicker." },
      { name: "autoFocus", type: "boolean", default: "false", description: "Focus the search field on mount." },
    ] },
    { name: "FontPairingPicker", props: [
      { name: "value / defaultValue", type: "string | null", description: "Selected pairing id." },
      { name: "onValueChange", type: "(id: string, pairing: FontPairing) => void", description: "Called when a pairing is chosen (click, arrows, Home/End)." },
      { name: "pairings", type: "FontPairing[]", default: "fontPairings", description: "The 16 built-ins, or your own." },
      { name: "layout", type: '"grid" | "list"', default: '"grid"', description: "Specimen cards, or compact rows for popovers." },
      { name: "showDescription", type: "boolean", default: "grid: true · list: false", description: "Show the one-line description." },
      { name: "loadPreviews", type: "boolean", default: "true", description: "Load preview glyphs from Google Fonts." },
      { name: "disabled", type: "boolean", default: "false", description: "Disables every option." },
      { name: "labels", type: "Partial<FontPairingPickerLabels>", description: "Namespace fontPairingPicker: label." },
    ] },
    { name: "FontProvider", props: [
      { name: "pairing / defaultPairing", type: "FontPairing | string", default: '"editorial"', description: "Pairing object or preset id." },
      { name: "onPairingChange", type: "(pairing: FontPairing) => void", description: "Called by useFontPairing().setPairing." },
      { name: "scope", type: '"element" | "document"', default: '"element"', description: "element: wraps children in a <div> carrying the tokens. document: applies to <html>, restored on unmount." },
      { name: "load", type: "boolean", default: "true", description: "Load the families from Google Fonts." },
      { name: "pairings", type: "FontPairing[]", default: "fontPairings", description: "Presets resolvable by id." },
      { name: "className", type: "string", description: "Class of the wrapper (element scope)." },
    ] },
    { name: "Helpers", props: [
      { name: "loadGoogleFonts(families, options?)", type: "Promise<void>", description: "Injects one <link rel=stylesheet> (plus preconnect) for the families not loaded yet. Options: display (default \"swap\"), text, opticalSize, renderBlocking, document." },
      { name: "googleFontsUrl(families, options?)", type: "string", description: "The css2 URL — use it in a server-rendered <link>." },
      { name: "applyFontPairing(el, pairing, options?)", type: "Promise<void>", description: "Sets data-font, --font-ui / --font-heading / --font-code and the four --display-* tokens; loads the fonts." },
      { name: "createFontPairing({ heading, body, mono })", type: "FontPairing", description: "Custom pairing; display tokens follow the heading family." },
      { name: "serializeFontPairing / parseFontPairing", type: "StoredFontPairing ⇄ FontPairing", description: "Store a pairing (with its URL and tokens) in localStorage or a cookie." },
      { name: "fontBootScript(storageKey?, field?)", type: "string", description: "Inline <head> script that applies a stored pairing before first paint." },
    ] },
  ],
  notes: [
    "Privacy: loading from fonts.googleapis.com sends the visitor's IP address to Google. For GDPR / KVKK-sensitive sites, self-host the files (see /docs/fonts) and pass loadPreviews={false} / load={false}.",
    "Every catalog family supports latin-ext, so Turkish ğ ş ı İ ç ö ü render in the chosen face.",
    "Previews download glyph subsets (only the characters of the family names and the sample line), and only for rows that scroll into view.",
  ],
  covers: ["Font picker"],
};

export default entry;
