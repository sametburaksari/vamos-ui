import { ex, type DocEntry } from "../types";
import AccessibilityToolbarDemo from "../examples/accessibility-toolbar/demo";
import AccessibilityToolbarStacked from "../examples/accessibility-toolbar/stacked";

const entry: DocEntry = {
  slug: "accessibility-toolbar",
  title: "Accessibility toolbar",
  group: "Foundations",
  description:
    "Reader-controlled display settings: text size, high contrast, a readable font, underlined links and reduced motion. Every option remaps the kit's own tokens and axes on one target element, so all components follow in light and dark without knowing about it. Optional persistence on the device.",
  source: ["components/accessibility-toolbar.tsx"],
  usage: `import { AccessibilityToolbar } from "@vamos-ui/react";

<AccessibilityToolbar storageKey="display-settings">
  <a href="/accessibility">Accessibility statement</a>
</AccessibilityToolbar>`,
  demo: ex("demo", "Demo (scoped to a target)", "accessibility-toolbar/demo.tsx", AccessibilityToolbarDemo, "target applies the settings to one element; text size is left out because it always scales the whole page."),
  examples: [
    ex("stacked", "In a popover", "accessibility-toolbar/stacked.tsx", AccessibilityToolbarStacked, "layout=\"stacked\" for a popover or sheet; applies to the page while it is open and is remembered under storageKey."),
  ],
  api: [
    { name: "AccessibilityToolbar", props: [
      { name: "value / defaultValue / onValueChange", type: "AccessibilityPreferences", description: "{ textSize: \"default\" | \"large\" | \"larger\", highContrast, readableFont, underlineLinks, reduceMotion }." },
      { name: "features", type: "AccessibilityFeature[]", default: "all five", description: "Which controls to show, in order." },
      { name: "target", type: "HTMLElement | RefObject | () => HTMLElement | null", default: "<html>", description: "Where contrast, font, underline and motion apply." },
      { name: "textScale", type: "[number, number]", default: "[1.15, 1.3]", description: "Root font-size factors for large / larger." },
      { name: "readableFontPreset", type: "string", default: '"system"', description: "data-font preset used by Readable font." },
      { name: "storageKey", type: "string", description: "Persist in localStorage; restored after mount (no hydration mismatch)." },
      { name: "layout", type: '"bar" | "stacked"', default: '"bar"', description: "One wrapping row or a column." },
      { name: "hideTitle", type: "boolean", description: "Hide the title line." },
      { name: "children", type: "ReactNode", description: "Extra content at the end (a statement link)." },
      { name: "labels", type: "Partial<AccessibilityToolbarLabels>", description: 'Dictionary namespace "accessibilityToolbar".' },
    ] },
    { name: "useAccessibilityPreferences(prefs, { target?, textScale?, readableFontPreset? })", props: [
      { name: "prefs", type: "AccessibilityPreferences", description: "Applies the same settings without the toolbar (a settings page) and restores the element on cleanup." },
    ] },
  ],
  notes: [
    "Text size sets the root font size, the way a browser's text-size setting works: the kit's type scale is in rem, so everything grows and reflows.",
    "High contrast maps muted and subtle text to full text colour and hairlines to visible rules (--fg-muted, --line, --field-border …) — no colours of its own, so it works with any accent and theme. Subtrees that redefine those tokens themselves keep their own values.",
    "Readable font sets data-font (default system); Reduce motion sets data-motion=\"off\", which stops the kit's scroll reveals and motion. The OS reduced-motion setting is always respected anyway.",
  ],
  covers: [],
};

export default entry;
