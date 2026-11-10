import { ex, type DocEntry } from "../types";
import CommandDemo from "../examples/command/demo";
import CommandDialogExample from "../examples/command/dialog";
import CommandRegister from "../examples/command/register";
import CommandAsyncSource from "../examples/command/async-source";
import CommandNestedPages from "../examples/command/nested-pages";
import CommandLocaleSearch from "../examples/command/locale-search";

const entry: DocEntry = {
  slug: "command",
  title: "Command (⌘K)",
  group: "Overlays & feedback",
  description:
    "Keyboard navigation, actions and record search from anywhere. Three layers: list primitives, a top-anchored CommandDialog, and a ready-made CommandPalette wired to a registry that pages, apps and the App shell's nav all contribute to.",
  source: ["components/command.tsx", "styles/navigation.css"],
  basedOn: "cmdk, Radix Dialog",
  usage: `import { CommandProvider, CommandPalette, useRegisterCommands } from "@vamos-ui/react";

// App shell mounts these for you.
<CommandProvider actions={[{ id: "cms.post.new", title: "New post", shortcut: "mod+shift+n", global: true, perform: newPost }]}>
  <App />
  <CommandPalette />
</CommandProvider>

// Inside a page: commands that exist only while it is mounted.
useRegisterCommands([{ id: "cms.post.publish", title: "Publish post", group: "This post", perform: publish }]);`,
  demo: ex("demo", "Demo", "command/demo.tsx", CommandDemo),
  examples: [
    ex("dialog", "Command dialog", "command/dialog.tsx", CommandDialogExample, "CommandDialog is anchored near the top and fills the screen on phones. Focus starts in the input; Esc closes and returns focus."),
    ex("register", "Page commands", "command/register.tsx", CommandRegister, "useRegisterCommands adds commands while the page is mounted and always calls the latest closure. A perform that returns a promise keeps the palette open with a spinner on the item."),
    ex("async-source", "Record search", "command/async-source.tsx", CommandAsyncSource, "A CommandSource is debounced, aborted on every keystroke and shown in its own group with a thin progress bar while it loads. A failing source shows one line while other groups keep working."),
    ex("nested-pages", "Sub-pages", "command/nested-pages.tsx", CommandNestedPages, "An action with children opens a sub-page (a chip in the input); Backspace on an empty input goes back. Children can load lazily. open(\"id\") jumps straight to a sub-page."),
    ex("locale-search", "Locale-aware matching", "command/locale-search.tsx", CommandLocaleSearch, "Matching folds text for the current locale: in Turkish “istanbul” finds “İstanbul”, “isik” finds “Işık”. Strings come from the dictionary."),
  ],
  api: [
    { name: "Command", props: [
      { name: "filter", type: "(value, search, keywords) => number", default: "cmdkFilter(locale)", description: "Score 0–1. The default folds text for the locale: exact > prefix > word start > contains > keyword." },
      { name: "shouldFilter", type: "boolean", default: "true", description: "false: render only the items you want (async results)." },
      { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around." },
      { name: "label", type: "string", default: '"Command palette"', description: "Accessible name of the listbox (command.label)." },
      { name: "value / onValueChange", type: "string", description: "Controlled highlighted item." },
    ] },
    { name: "CommandInput", props: [
      { name: "placeholder", type: "string", default: '"Type a command or search…"', description: "From the dictionary (command.placeholder)." },
      { name: "chip", type: "ReactNode", description: "Breadcrumb chip before the input (current sub-page)." },
      { name: "end", type: "ReactNode", description: "Trailing slot (spinner, filter)." },
      { name: "value / onValueChange", type: "string", description: "Controlled query." },
    ] },
    { name: "CommandItem", props: [
      { name: "value", type: "string", description: "Stable unique value; inferred from text when omitted." },
      { name: "keywords", type: "string[]", description: "Synonyms used for matching." },
      { name: "onSelect", type: "(value: string) => void", description: "Click or Enter." },
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "description", type: "ReactNode", description: "Second line." },
      { name: "shortcut", type: 'string | string[]', description: 'Display only: "mod+shift+n".' },
      { name: "badge", type: "ReactNode", description: "Trailing meta, e.g. an app badge." },
      { name: "chevron", type: "boolean", description: "Trailing chevron (opens a sub-page)." },
      { name: "loading", type: "boolean", description: "Spinner in place of the icon, aria-busy." },
      { name: "disabled", type: "boolean", description: "Skipped by the keyboard." },
    ] },
    { name: "CommandGroup · CommandEmpty · CommandLoading · CommandSeparator · CommandShortcut", props: [
      { name: "heading", type: "ReactNode", description: "CommandGroup title (also its accessible name)." },
      { name: "children", type: "ReactNode", default: '"No results found."', description: "CommandEmpty / CommandLoading content; defaults from the dictionary." },
      { name: "keys", type: "string | string[]", description: "CommandShortcut keys, platform-aware (⌘ / Ctrl)." },
    ] },
    { name: "CommandDialog", props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Dialog state." },
      { name: "size", type: '"md" | "lg"', default: '"lg"', description: "560 / 680 px. Fullscreen below 640px." },
      { name: "title", type: "string", default: '"Command palette"', description: "Hidden dialog title." },
      { name: "commandProps", type: "CommandProps", description: "Props for the inner Command (filter, shouldFilter…)." },
    ] },
    { name: "CommandProvider", props: [
      { name: "actions", type: "CommandAction[]", description: "Static commands for the provider's lifetime." },
      { name: "sources", type: "CommandSource[]", description: "Async record search." },
      { name: "registry", type: "CommandRegistry", description: "Use an existing registry (createCommandRegistry)." },
      { name: "shortcut", type: "string | false", default: '"mod+k"', description: "Toggle shortcut. Inside inputs only shortcuts with mod fire." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Palette state." },
    ] },
    { name: "CommandPalette", props: [
      { name: "size", type: '"md" | "lg"', default: '"lg"', description: "Dialog width." },
      { name: "placeholder", type: "string", description: "Input placeholder." },
      { name: "recents", type: "boolean", default: "true", description: "Recently used commands first (localStorage ui-cmd-recent, 8 ids)." },
      { name: "footer", type: "boolean", default: "true", description: "Hint bar: ↑↓ navigate · ↵ select · ⌫ back · esc close." },
      { name: "groupOrder", type: "string[]", description: "Group order for the empty query." },
      { name: "labels", type: "Partial<CommandLabels>", description: "Override built-in strings." },
    ] },
    { name: "CommandAction", props: [
      { name: "id", type: "string", description: 'Module-prefixed and unique: "cms.post.new".' },
      { name: "title / subtitle", type: "string", description: "Row text; both are searched." },
      { name: "group", type: "string", default: '"Actions"', description: '"Go to", "Posts"…' },
      { name: "icon", type: "LucideIcon | ReactNode", description: "Leading icon." },
      { name: "keywords", type: "string[]", description: "Synonyms." },
      { name: "shortcut", type: "string | string[]", description: "With global: true it works while the palette is closed." },
      { name: "href", type: "string", description: "Navigates through the app router." },
      { name: "perform", type: "(ctx) => void | Promise", description: "Runs the action; a promise keeps the palette open until it settles." },
      { name: "children", type: "CommandAction[] | () => Promise<CommandAction[]>", description: "Opens a sub-page." },
      { name: "permission", type: "string | string[]", description: "Hidden unless can(permission)." },
      { name: "when", type: "(ctx) => boolean", description: "Contextual visibility." },
      { name: "priority", type: "number", description: "Higher first among equal matches." },
      { name: "app", type: "string", description: "App badge in multi-app shells." },
    ] },
    { name: "Hooks", props: [
      { name: "useRegisterCommands(actions, deps?)", type: "void", description: "Adds commands while mounted; ref-counted and StrictMode-safe." },
      { name: "useCommandSource(source)", type: "void", description: "Adds an async source while mounted." },
      { name: "useCommandPalette()", type: "{ open(pageId?), close, toggle, isOpen, available }", description: "Control the palette from anywhere." },
      { name: "createCommandRegistry({ actions, sources })", type: "CommandRegistry", description: "A store (useSyncExternalStore) to share between providers." },
    ] },
  ],
  notes: [
    "The kit only binds mod+k (palette) and mod+\\ (sidebar rail). It never binds mod+b, mod+i or other editor shortcuts.",
    "With a CommandSource active the palette ranks local commands itself (shouldFilter={false}), so local and remote results never fight over order.",
  ],
  covers: ["Command (⌘K)"],
};

export default entry;
