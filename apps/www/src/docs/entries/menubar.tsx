import { ex, type DocEntry } from "../types";
import MenubarDemo from "../examples/menubar/demo";
import MenubarDataDriven from "../examples/menubar/data-driven";
import MenubarAppWindow from "../examples/menubar/app-window";
import MenubarCmsToolbar from "../examples/menubar/cms-toolbar";

const entry: DocEntry = {
  slug: "menubar",
  title: "Menubar",
  group: "Navigation",
  description:
    "A desktop-app menu bar — File, Edit, View — for editors, back-office tools and anything that runs like an application. One tab stop, arrow keys between menus, submenus, checkbox and radio items, keycap shortcuts. Same item parts and MenuEntry model as Dropdown Menu and Context Menu.",
  source: ["components/menubar.tsx", "lib/menu.tsx"],
  basedOn: "Radix Menubar",
  usage: `import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@vamos-ui/react";

<Menubar aria-label="Document">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem shortcut="mod+s" onSelect={save}>Save</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>

// or from data
<Menubar aria-label="Invoices" menus={[{ id: "file", label: "File", items: entries }]} />`,
  demo: ex("demo", "Demo", "menubar/demo.tsx", MenubarDemo),
  examples: [
    ex("data-driven", "From data (billing)", "menubar/data-driven.tsx", MenubarDataDriven, "menus takes the shared MenuEntry model: items, submenus, checkbox and radio entries, separators. A menu with a failing permission is hidden."),
    ex("app-window", "Inside a window header", "menubar/app-window.tsx", MenubarAppWindow, "variant=\"ghost\" drops the strip; size=\"sm\" narrows every panel. A disabled trigger is skipped by the arrow keys."),
    ex("cms-toolbar", "Post editor toolbar (CMS)", "menubar/cms-toolbar.tsx", MenubarCmsToolbar, "Menus on the start side, status and the one primary action on the end. Shortcuts are display only — bind them with useHotkeys."),
  ],
  api: [
    { name: "Menubar", props: [
      { name: "menus", type: "MenubarMenuEntry[]", description: "Data-driven menus: { id, label, items: MenuEntry[], disabled?, permission? }. Rendered before children." },
      { name: "variant", type: '"bar" | "ghost"', default: '"bar"', description: "bar is a hairline surface strip; ghost has no chrome (inside a Top bar or window header)." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Minimum width and item size of every panel (180 / 220px). MenubarContent size overrides it per menu." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "The open menu (its MenubarMenu value). Empty string = closed." },
      { name: "loop", type: "boolean", default: "true", description: "Arrow keys wrap from the last menu to the first." },
      { name: "dir", type: '"ltr" | "rtl"', description: "Reading direction; ← → swap in RTL." },
      { name: "aria-label", type: "string", description: "Name of the bar (\"Document\", \"Invoices\")." },
    ] },
    { name: "MenubarMenu / MenubarTrigger", props: [
      { name: "value", type: "string", description: "MenubarMenu: id for a controlled bar." },
      { name: "disabled", type: "boolean", description: "MenubarTrigger: greyed out and skipped by the arrow keys." },
    ] },
    { name: "MenubarContent / MenubarSubContent", props: [
      { name: "size", type: '"sm" | "md"', default: "bar size", description: "Panel width and item size." },
      { name: "align / sideOffset / alignOffset", type: "…", default: '"start" / 6 / -4', description: "Placement under the trigger. Collides with the viewport (12px padding)." },
    ] },
    { name: "MenubarItem", props: [
      { name: "onSelect", type: "(event) => void", description: "Click, Enter or Space; the menu closes. event.preventDefault() keeps it open." },
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "shortcut", type: "string | string[]", description: "Keycap hint, e.g. \"mod+shift+z\" (⌘ on Mac, Ctrl elsewhere)." },
      { name: "description / badge", type: "ReactNode", description: "Second line / trailing count." },
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "danger for destructive commands." },
      { name: "inset", type: "boolean", description: "Reserve the indicator gutter so labels align with checkbox/radio items." },
      { name: "disabled", type: "boolean", description: "Not selectable, skipped by the arrow keys." },
    ] },
    { name: "MenubarCheckboxItem / MenubarRadioGroup / MenubarRadioItem", props: [
      { name: "checked / onCheckedChange", type: "boolean", description: "CheckboxItem state (menuitemcheckbox)." },
      { name: "value / onValueChange", type: "string", description: "RadioGroup selection; each RadioItem has a value (menuitemradio)." },
      { name: "shortcut / description", type: "…", description: "As on MenubarItem." },
    ] },
    { name: "Other parts", props: [
      { name: "MenubarSub / MenubarSubTrigger", type: "…", description: "A submenu; opens on hover, Enter, Space or →." },
      { name: "MenubarLabel / MenubarSeparator / MenubarGroup", type: "…", description: "Section heading (inset aligns it), divider, group." },
      { name: "MenubarShortcut", type: "span", description: "Plain-text shortcut hint, when you don't want keycaps." },
      { name: "MenubarEntries / MenubarMenus", type: "{ items } / { menus }", description: "Render MenuEntry[] inside your own MenubarContent, or MenubarMenuEntry[] inside your own Menubar." },
    ] },
  ],
  notes: [
    "Keyboard: Tab reaches the bar once; ← → move between triggers (and keep a menu open while moving); ↓, Enter or Space open; Esc closes and returns focus; typing jumps to an item.",
    "For a single menu behind a button use Dropdown Menu; for site navigation use Navigation Menu. A menubar is for commands.",
    "Panels portal into the nearest ThemeScope. Only the first layer is glass; submenus are opaque.",
  ],
  covers: ["Menubar"],
};

export default entry;
