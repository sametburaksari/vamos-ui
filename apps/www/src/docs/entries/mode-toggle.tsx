import { ex, type DocEntry } from "../types";
import ModeToggleDemo from "../examples/mode-toggle/demo";
import ModeToggleSegmented from "../examples/mode-toggle/segmented";
import ModeToggleControlled from "../examples/mode-toggle/controlled";

const entry: DocEntry = {
  slug: "mode-toggle",
  title: "Mode toggle",
  group: "Navigation",
  description:
    "A light / dark (and optionally system) switch. It toggles the kit's .dark class on the document or any element, can remember the choice in localStorage, follows the OS live in system mode, and ships a head script so a stored choice never flashes on reload.",
  source: ["components/mode-toggle.tsx"],
  basedOn: "Toggle button (aria-pressed) / radio group",
  usage: `import { ModeToggle, modeToggleScript } from "@vamos-ui/react";

// In <head>, before the page paints:
<script dangerouslySetInnerHTML={{ __html: modeToggleScript("site:mode") }} />

<ModeToggle storageKey="site:mode" />
<ModeToggle variant="segmented" modes={["light", "dark", "system"]} showLabel />`,
  demo: ex("demo", "Demo", "mode-toggle/demo.tsx", ModeToggleDemo),
  examples: [
    ex("segmented", "Light, dark and system", "mode-toggle/segmented.tsx", ModeToggleSegmented, "variant=\"segmented\" shows every mode; system follows prefers-color-scheme as it changes."),
    ex("controlled", "Controlled (SiteShell, ThemeScope)", "mode-toggle/controlled.tsx", ModeToggleControlled, "target={null} leaves the DOM alone; pass the mode to SiteShell's theme or a ThemeScope."),
  ],
  api: [
    { name: "ModeToggle", props: [
      { name: "value / defaultValue", type: '"light" | "dark" | "system"', description: "Controlled or initial mode. Uncontrolled default: the stored choice, else what the target already shows." },
      { name: "onValueChange", type: '(mode, resolved: "light" | "dark") => void', description: "The chosen mode and what it resolves to." },
      { name: "modes", type: "ColorMode[]", default: '["light", "dark"]', description: "Modes offered, in order." },
      { name: "variant", type: '"button" | "segmented"', default: '"button"', description: "One icon button (dark-mode toggle with two modes, cycling with three) or one option per mode." },
      { name: "target", type: "HTMLElement | (() => HTMLElement | null) | null", default: "document.documentElement", description: "Where the .dark class goes; null only reports." },
      { name: "storageKey", type: "string", description: "Remember the choice in localStorage." },
      { name: "showLabel", type: "boolean", default: "false", description: "Show the mode name next to the icon." },
      { name: "size", type: '"xs" | "sm" | "md"', default: '"sm"', description: "Control size." },
      { name: "labels", type: "Partial<ModeToggleLabels>", description: 'Dictionary namespace "modeToggle": label, light, dark, system, darkMode, current.' },
    ] },
    { name: "modeToggleScript(storageKey, fallback?)", props: [
      { name: "returns", type: "string", description: "Inline script for <head> that applies the stored mode before first paint. fallback defaults to \"system\"." },
    ] },
  ],
  notes: ["Nothing is written to the target until the stored mode is read, so a class set by the head script is never flipped off during hydration.", "Storage failures (private mode) are ignored; the choice then lasts for the page."],
  covers: [],
};

export default entry;
