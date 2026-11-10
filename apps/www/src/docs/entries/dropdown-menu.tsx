import { ex, type DocEntry } from "../types";
import DropdownMenuDemo from "../examples/dropdown-menu/demo";
import DropdownMenuRowActions from "../examples/dropdown-menu/row-actions";
import DropdownMenuCheckboxRadio from "../examples/dropdown-menu/checkbox-radio";
import DropdownMenuSubmenu from "../examples/dropdown-menu/submenu";
import DropdownMenuUserMenu from "../examples/dropdown-menu/user-menu";
import DropdownMenuActionMenu from "../examples/dropdown-menu/action-menu";
import DropdownMenuAsyncItem from "../examples/dropdown-menu/async-item";

const entry: DocEntry = {
  slug: "dropdown-menu",
  title: "Dropdown Menu",
  group: "Overlays & feedback",
  description:
    "A list of actions attached to a button: the row \"⋯\" menu, \"New ▾\", the user menu, column visibility. Icons, shortcuts, descriptions, checkbox and radio items, submenus and destructive items — plus ActionMenu, a one-line menu built from data.",
  source: ["components/dropdown-menu.tsx", "lib/menu.tsx", "lib/variants.ts"],
  basedOn: "Radix Dropdown Menu",
  usage: `import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, ActionMenu } from "@vamos-ui/react";

<DropdownMenu>
  <DropdownMenuTrigger asChild><Button>New</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem icon={<Newspaper />} shortcut="mod+alt+n">Post</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// from data
<ActionMenu items={[{ id: "edit", label: "Edit", onSelect: edit }, { type: "separator" }, …]} />`,
  demo: ex("demo", "Demo", "dropdown-menu/demo.tsx", DropdownMenuDemo),
  examples: [
    ex("row-actions", "Row actions", "dropdown-menu/row-actions.tsx", DropdownMenuRowActions, 'The "⋯" menu on a CRM deal row: shortcuts, a link item (asChild), a disabled item and a danger item.'),
    ex("checkbox-radio", "Checkbox and radio items", "dropdown-menu/checkbox-radio.tsx", DropdownMenuCheckboxRadio, "Column visibility and sorting for an HR people table. preventDefault in onSelect keeps the menu open."),
    ex("submenu", "Submenus", "dropdown-menu/submenu.tsx", DropdownMenuSubmenu, "→ opens a submenu (← in RTL). Submenus are one layer deeper, so they turn opaque in glass mode."),
    ex("user-menu", "User menu", "dropdown-menu/user-menu.tsx", DropdownMenuUserMenu, "Account card trigger, grouped items, a theme radio submenu and sign out."),
    ex("action-menu", "ActionMenu from data", "dropdown-menu/action-menu.tsx", DropdownMenuActionMenu, "One MenuEntry[] per row. Entries whose permission fails the VamosProvider can() check are hidden, and dangling separators are dropped."),
    ex("async-item", "Async item", "dropdown-menu/async-item.tsx", DropdownMenuAsyncItem, "event.preventDefault() keeps the menu open while a spinner runs; the other items are disabled meanwhile."),
  ],
  api: [
    { name: "DropdownMenu", props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled or uncontrolled." },
      { name: "modal", type: "boolean", default: "true", description: "Block outside interaction while open." },
      { name: "dir", type: '"ltr" | "rtl"', description: "Reading direction (inherits from the Direction provider)." },
    ] },
    { name: "DropdownMenuContent", props: [
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Min width 180 / 220 px; items follow the size." },
      { name: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Alignment against the trigger." },
      { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side; flips on collision." },
      { name: "sideOffset", type: "number", default: "6", description: "Gap to the trigger in px." },
      { name: "loop", type: "boolean", default: "false", description: "Arrow keys wrap around." },
    ] },
    { name: "DropdownMenuItem", props: [
      { name: "icon", type: "ReactNode", description: "Leading icon." },
      { name: "description", type: "ReactNode", description: "Second line under the label." },
      { name: "shortcut", type: "string | string[]", description: 'Shortcut hint as Kbd ("mod+d"). Display only — bind it with useHotkeys.' },
      { name: "badge", type: "ReactNode", description: "Trailing count or badge." },
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "danger for destructive actions." },
      { name: "inset", type: "boolean", default: "false", description: "Align with checkbox/radio labels." },
      { name: "onSelect", type: "(event: Event) => void", description: "Click, Enter or Space. preventDefault keeps the menu open." },
      { name: "disabled", type: "boolean", default: "false", description: "Skipped by keyboard navigation." },
      { name: "textValue", type: "string", description: "Typeahead text when the label isn't plain text." },
      { name: "asChild", type: "boolean", default: "false", description: "Render your link as the item (put icon and text inside it)." },
    ] },
    { name: "DropdownMenuCheckboxItem · DropdownMenuRadioGroup · DropdownMenuRadioItem", props: [
      { name: "checked / onCheckedChange", type: "boolean | \"indeterminate\" / (checked) => void", description: "Checkbox item state (menuitemcheckbox)." },
      { name: "value / onValueChange", type: "string / (value) => void", description: "Radio group state." },
      { name: "value", type: "string", description: "Radio item value (menuitemradio)." },
      { name: "shortcut · description", type: "string · ReactNode", description: "Same as on items." },
    ] },
    { name: "DropdownMenuSub · DropdownMenuSubTrigger · DropdownMenuSubContent", props: [
      { name: "SubTrigger icon", type: "ReactNode", description: "Leading icon; a chevron is added (mirrored in RTL)." },
      { name: "SubContent size", type: '"sm" | "md"', default: "parent size", description: "Width of the submenu." },
      { name: "Sub open / onOpenChange", type: "boolean / (open) => void", description: "Control the submenu." },
    ] },
    { name: "DropdownMenuLabel · DropdownMenuSeparator · DropdownMenuGroup · DropdownMenuShortcut", props: [
      { name: "inset", type: "boolean", default: "false", description: "Label aligned with checkbox/radio labels." },
      { name: "DropdownMenuShortcut", type: "span props", description: "Plain-text trailing hint when keycaps are too much." },
    ] },
    { name: "ActionMenu", props: [
      { name: "items", type: "MenuEntry[]", description: "item · checkbox · radio · submenu · group · label · separator. Shared with Context Menu and Command." },
      { name: "trigger", type: "ReactElement", description: 'Custom trigger. Default: a "⋯" IconButton.' },
      { name: "triggerLabel", type: "string", default: '"More actions"', description: "Accessible name of the default trigger (actionMenu.trigger)." },
      { name: "triggerSize", type: '"xs" | "sm" | "md"', default: '"sm"', description: "Size of the default trigger." },
      { name: "size / align / side", type: "DropdownMenuContent props", default: 'align "end"', description: "Passed to the content." },
      { name: "open / defaultOpen / onOpenChange / modal", type: "Root props", description: "Passed to the root." },
      { name: "labels", type: "{ trigger?: string }", description: "Built-in string overrides." },
    ] },
    { name: "MenuEntry (item)", props: [
      { name: "id · label", type: "string · ReactNode", description: "Stable key and label." },
      { name: "icon · description · shortcut · badge · tone", type: "as on DropdownMenuItem", description: "Item look." },
      { name: "onSelect / href", type: "() => void / string", description: "Action, or a link rendered with the app's Link." },
      { name: "permission", type: "string", description: "Hidden unless can(permission) is true. Hiding is not security." },
      { name: "disabled · textValue", type: "boolean · string", description: "Disabled state and typeahead text." },
    ] },
  ],
  notes: [
    "Keyboard: Enter, Space or ↓ opens; ↑ ↓ Home End move; typing jumps to an item; → opens a submenu (← in RTL); Escape closes and returns focus to the trigger.",
    "Content portals into the nearest ThemeScope. The root menu is layer depth 1 (blurred in glass mode); submenus are deeper and opaque.",
    "Shortcut keycaps are hints only. Register the real shortcut with useHotkeys.",
  ],
  covers: ["Dropdown Menu"],
};

export default entry;
