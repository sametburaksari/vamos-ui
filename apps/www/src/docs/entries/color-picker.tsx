import { ex, type DocEntry } from "../types";
import ColorPickerDemo from "../examples/color-picker/demo";
import ColorPickerSwatches from "../examples/color-picker/swatches";
import ColorPickerAlpha from "../examples/color-picker/alpha";
import ColorPickerContrast from "../examples/color-picker/contrast";
import ColorPickerInline from "../examples/color-picker/inline";
import ColorPickerStates from "../examples/color-picker/states";

const entry: DocEntry = {
  slug: "color-picker",
  title: "Color picker",
  group: "Forms & inputs",
  description:
    "Choose a colour — website brand colour, label colours, campaign or chart series colour. A saturation/brightness area and hue strip (keyboard sliders), an optional opacity strip, a value field that accepts hex, rgb() and oklch(), swatches as a radio group, the screen eyedropper where supported, and a WCAG contrast hint. The value is always hex.",
  source: ["components/color-picker.tsx", "lib/color.ts", "components/radio-group.tsx", "components/popover.tsx", "styles/forms.css"],
  basedOn: "react-colorful + Radix Popover / Radio Group",
  usage: `import { ColorPicker, ColorSwatchPicker, Field } from "@vamos-cms/ui";

<Field label="Brand color">
  <ColorPicker name="brand" defaultValue="#2f6fd6" contrastAgainst="#ffffff" />
</Field>

<ColorSwatchPicker swatches={[{ value: "#1a9c8c", name: "Teal" }, …]} />`,
  demo: ex("demo", "Demo", "color-picker/demo.tsx", ColorPickerDemo),
  examples: [
    ex("swatches", "Swatches only (labels)", "color-picker/swatches.tsx", ColorPickerSwatches, "ColorSwatchPicker is a radio group: one tab stop, arrow keys move and select, each swatch is named (“Teal, #1a9c8c”)."),
    ex("alpha", "With opacity (site overlay)", "color-picker/alpha.tsx", ColorPickerAlpha, "alpha adds an opacity strip; the value becomes #rrggbbaa when not fully opaque. Previews sit on an opaque checkerboard, never on blurred glass."),
    ex("contrast", "Contrast hint (website button)", "color-picker/contrast.tsx", ColorPickerContrast, 'contrastAgainst shows the WCAG ratio and AA/AAA rating for text in that colour. swatches="tokens" offers the theme palette.'),
    ex("inline", "Inline (theme settings)", "color-picker/inline.tsx", ColorPickerInline, 'variant="inline" renders the panel in place. The format switch edits in HEX, RGB or OKLCH; the stored value stays hex.'),
    ex("states", "Sizes & states", "color-picker/states.tsx", ColorPickerStates, "sm / md / lg, read-only (doesn't open), disabled, Field error, and transparent."),
  ],
  api: [
    {
      name: "ColorPicker",
      props: [
        { name: "value / defaultValue", type: "string", default: '"#000000"', description: '"#rrggbb", or "#rrggbbaa" with alpha.' },
        { name: "onValueChange", type: "(hex: string) => void", description: "Called with lowercase hex." },
        { name: "alpha", type: "boolean", default: "false", description: "Opacity strip." },
        { name: "swatches", type: '{ value, name? }[] | "tokens"', description: 'Presets under the picker; "tokens" resolves the theme palette in the browser.' },
        { name: "format / defaultFormat / onFormatChange", type: '"hex" | "rgb" | "oklch"', default: '"hex"', description: "Display and input format (value stays hex)." },
        { name: "showFormats", type: "boolean", default: "true", description: "Show the HEX / RGB / OKLCH switch." },
        { name: "contrastAgainst", type: "string", description: "Colour to compare with (e.g. the text colour); shows the WCAG ratio." },
        { name: "eyeDropper", type: "boolean", default: "true", description: "Screen picker button where the EyeDropper API exists." },
        { name: "variant", type: '"popover" | "inline"', default: '"popover"', description: "Swatch button + floating panel, or the panel in place." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Trigger height." },
        { name: "name", type: "string", description: "Hidden input with the hex value." },
        { name: "disabled / readOnly / invalid", type: "boolean", description: "Also inherited from Field." },
        { name: "open / defaultOpen / onOpenChange", type: "boolean / (open) => void", description: "Control the popover." },
        { name: "labels", type: "Partial<ColorPickerLabels>", description: "dialog, area, hue, alpha, input, format, swatches, swatch, eyeDropper, invalid, contrast, ratio, aaa, aa, aaLarge, fail, transparent." },
      ],
    },
    {
      name: "ColorSwatchPicker",
      props: [
        { name: "swatches", type: '{ value, name? }[] | "tokens"', description: "Required." },
        { name: "value / defaultValue / onValueChange", type: "string | null / (hex) => void", description: "Selected swatch." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "20 / 28 px swatches." },
        { name: "name / disabled", type: "string / boolean", description: "Form submission; inherited from Field." },
      ],
    },
    {
      name: "ColorPickerPanel",
      props: [
        { name: "value / onValueChange", type: "string / (hex) => void", description: "Required. The picker body for your own popover or sheet." },
        { name: "alpha / swatches / format / contrastAgainst / eyeDropper / disabled", type: "as ColorPicker", description: "Same meaning as on ColorPicker." },
      ],
    },
    {
      name: "lib/color helpers",
      props: [
        { name: "parseColor(input)", type: "→ { r, g, b, a } | null", description: "hex (with or without #), rgb()/rgba(), oklch()." },
        { name: "toHex(input) / formatColor(hex, format)", type: "→ string", description: "Normalise to hex · format as hex, rgb() or oklch()." },
        { name: "contrastRatio(a, b) / contrastLevel(ratio) / readableOn(bg)", type: "→ number · AAA|AA|AA-large|fail · #000/#fff", description: "WCAG 2 contrast." },
      ],
    },
  ],
  notes: [
    "The area and strips are role=slider with dictionary names (“Saturation and brightness”, “Hue”, “Opacity”) and work with arrow keys.",
    "Typing a hex value applies it as soon as it has 6 or 8 digits; rgb() and oklch() apply when they parse. Invalid text shows an error on blur and leaves the colour unchanged.",
  ],
  covers: ["Color picker"],
};

export default entry;
