import { ex, type DocEntry } from "../types";
import ContextMenuDemo from "../examples/context-menu/demo";
import ContextMenuGrid from "../examples/context-menu/grid";
import ContextMenuSharedActions from "../examples/context-menu/shared-actions";

const entry: DocEntry = {
  slug: "context-menu",
  title: "Context Menu",
  group: "Overlays & feedback",
  description:
    "A right-click (or long-press) menu for files, kanban cards, chart nodes and table rows. Same parts and the same MenuEntry[] data as Dropdown Menu, so one model can drive both.",
  source: ["components/context-menu.tsx", "lib/menu.tsx", "lib/variants.ts"],
  basedOn: "Radix Context Menu",
  usage: `import { ContextMenu } from "@vamos-ui/react";

<ContextMenu items={fileActions}>
  <FileTile file={file} />
</ContextMenu>`,
  demo: ex("demo", "Demo", "context-menu/demo.tsx", ContextMenuDemo),
  examples: [
    ex("grid", "Media library grid", "context-menu/grid.tsx", ContextMenuGrid, "File actions in a CMS media grid: a label, shortcuts, a checkbox entry, a submenu and a danger entry — all from data."),
    ex("shared-actions", "Shared with the row menu", "context-menu/shared-actions.tsx", ContextMenuSharedActions, 'One MenuEntry[] drives both the right-click menu and the "⋯" ActionMenu, so keyboard and touch users reach every action.'),
  ],
  api: [
    { name: "ContextMenu", props: [
      { name: "items", type: "MenuEntry[]", description: "Data-driven mode: children become the right-click area. Without items, ContextMenu is the compound root." },
      { name: "children", type: "ReactNode", description: "With items: a single element (rendered with asChild). Without: ContextMenuTrigger + ContextMenuContent." },
      { name: "disabled", type: "boolean", default: "false", description: "Let the native browser menu through." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Content size in data-driven mode." },
      { name: "contentProps", type: "ContextMenuContentProps", description: "Extra props for the content in data-driven mode." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when it opens or closes (select the row/tile here)." },
      { name: "modal", type: "boolean", default: "true", description: "Block outside interaction while open." },
    ] },
    { name: "ContextMenuTrigger", props: [
      { name: "asChild", type: "boolean", default: "false", description: "Merge onto your own element." },
      { name: "disabled", type: "boolean", default: "false", description: "Native menu instead." },
    ] },
    { name: "ContextMenuContent", props: [
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Min width 180 / 220 px." },
      { name: "loop", type: "boolean", default: "false", description: "Arrow keys wrap around." },
      { name: "collisionPadding", type: "number", default: "12", description: "Distance kept from the viewport edge." },
    ] },
    { name: "Items", props: [
      { name: "ContextMenuItem", type: "icon · description · shortcut · badge · tone · inset · onSelect · asChild", description: "Same API as DropdownMenuItem." },
      { name: "ContextMenuCheckboxItem", type: "checked · onCheckedChange · shortcut", description: "menuitemcheckbox." },
      { name: "ContextMenuRadioGroup / ContextMenuRadioItem", type: "value · onValueChange / value", description: "menuitemradio." },
      { name: "ContextMenuSub / SubTrigger / SubContent", type: "icon · size", description: "Submenus; one layer deeper." },
      { name: "ContextMenuLabel / Separator / Group", type: "inset", description: "Structure." },
      { name: "ContextMenuEntries", type: "{ items: MenuEntry[] }", description: "Render MenuEntry[] inside your own ContextMenuContent." },
    ] },
  ],
  notes: [
    "Right-click can't be the only way in. Give every action a keyboard and touch path too — usually the row's ActionMenu with the same entries.",
    "Opens with right-click, Shift+F10 or the Menu key on the focused trigger, and long-press on touch.",
    "Keyboard inside the menu works like Dropdown Menu: arrows, Home/End, typeahead, → for submenus, Escape to close.",
  ],
  covers: ["Context Menu"],
};

export default entry;
