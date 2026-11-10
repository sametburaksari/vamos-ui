import { ex, type DocEntry } from "../types";
import KbdDemo from "../examples/kbd/demo";
import KbdPlatform from "../examples/kbd/platform";
import KbdSizes from "../examples/kbd/sizes";
import KbdInMenu from "../examples/kbd/in-menu";
import KbdSearchHint from "../examples/kbd/search-hint";
import KbdHelpSheet from "../examples/kbd/help-sheet";

const entry: DocEntry = {
  slug: "kbd",
  title: "Kbd",
  group: "Foundations",
  description:
    "Shows keyboard keys and shortcuts. Platform-aware: mod renders as ⌘ on Apple devices and Ctrl elsewhere, with spoken key names for screen readers.",
  source: ["components/kbd.tsx", "lib/use-hotkeys.ts"],
  usage: `import { Kbd, KbdGroup } from "@vamos-cms/ui";

<Kbd>Esc</Kbd>
<KbdGroup keys="mod+k" />`,
  demo: ex("demo", "Demo", "kbd/demo.tsx", KbdDemo),
  examples: [
    ex("platform", "Platform-aware shortcuts", "kbd/platform.tsx", KbdPlatform, "mod is ⌘ on macOS/iOS and Ctrl elsewhere; modifiers follow platform order (⌃ ⌥ ⇧ ⌘). The server renders the Ctrl form, the client upgrades without a hydration mismatch."),
    ex("sizes", "Sizes & variants", "kbd/sizes.tsx", KbdSizes, "sm for menus and inputs, md for prose. ghost is border-only; nav sits on the dark sidebar."),
    ex("in-menu", "In a menu", "kbd/in-menu.tsx", KbdInMenu, "Menu items share itemVariants with Dropdown, Command and Select; the shortcut goes at the end."),
    ex("search-hint", "Search field hint", "kbd/search-hint.tsx", KbdSearchHint, "A trailing hint inside an Input, as in the top bar."),
    ex("help-sheet", "Shortcut help (CMS editor)", "kbd/help-sheet.tsx", KbdHelpSheet, "Sequences use an array of keys and a visible separator such as \"then\"."),
  ],
  api: [
    { name: "Kbd", props: [
      { name: "keyName", type: "KeyName", description: "Render a key token platform-aware: mod, ctrl, meta, alt, shift, enter, esc, tab, space, backspace, delete, up/down/left/right, or any character." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Keycap height (18 / 24 px)." },
      { name: "variant", type: '"default" | "ghost" | "nav"', default: '"default"', description: "Inset keycap, border only, or for the dark sidebar." },
      { name: "labels", type: "Partial<KbdLabels>", description: "Spoken key names (kbd namespace): command, control, option, shift, enter, backspace…" },
      { name: "children", type: "ReactNode", description: "Free text when keyName is not set." },
    ] },
    { name: "KbdGroup", props: [
      { name: "keys", type: 'string | KeyName[]', description: 'A shortcut string ("mod+shift+k") or a list of keys (["g", "p"]).' },
      { name: "separator", type: "ReactNode", description: 'Visible text between keycaps ("then", "+"). Default none.' },
      { name: "size / variant / labels", type: "—", description: "Passed to every Kbd." },
    ] },
    { name: "Helpers (lib/use-hotkeys)", props: [
      { name: "formatShortcut(s, { isMac })", type: "string", description: '"mod+k" → "⌘K" / "Ctrl+K".' },
      { name: "shortcutKeys(s, isMac)", type: "string[]", description: "Canonical key tokens in platform order." },
      { name: "useHotkeys(s, handler, options)", type: "void", description: "Register shortcuts. Plain keys are ignored while typing; modifier shortcuts are not (enableOnFormFields)." },
      { name: "useIsMac()", type: "boolean", description: "SSR-safe platform check (false on the server)." },
    ] },
  ],
  notes: ["The kit itself only registers mod+k, mod+\\ and opt-in layout shortcuts; everything else belongs to the app."],
  covers: ["Kbd"],
};

export default entry;
