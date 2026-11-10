import { ex, type DocEntry } from "../types";
import ItemDemo from "../examples/item/demo";
import ItemLeadingExample from "../examples/item/leading";
import ItemActionsExample from "../examples/item/actions";
import ItemSelectable from "../examples/item/selectable";
import ItemLinkRows from "../examples/item/link-rows";
import ItemStates from "../examples/item/states";

const entry: DocEntry = {
  slug: "item",
  title: "Item",
  group: "Data display",
  description:
    "The generic row of a non-tabular list: leading visual, title and description, meta and actions. Recent posts, contacts in a side panel, notifications, search results. Hover-revealed actions stay reachable on focus and touch; with selectable the list becomes a keyboard listbox.",
  source: ["components/item.tsx", "lib/data-islands.tsx"],
  basedOn: "Radix Slot",
  usage: `import { Item, ItemContent, ItemDescription, ItemList, ItemMeta, ItemTitle } from "@vamos-cms/ui";

<ItemList>
  <Item>
    <ItemContent>
      <ItemTitle>Local SEO checklist for 2026</ItemTitle>
      <ItemDescription>Samet · Edited yesterday</ItemDescription>
    </ItemContent>
    <ItemMeta>Draft</ItemMeta>
  </Item>
</ItemList>`,
  demo: ex("demo", "Recent posts (CMS)", "item/demo.tsx", ItemDemo),
  examples: [
    ex("leading", "Leading visuals", "item/leading.tsx", ItemLeadingExample, "Avatar, icon tile (variant=\"icon\"), thumbnail (variant=\"thumbnail\") or a checkbox."),
    ex("actions", "Hover actions (CRM)", "item/actions.tsx", ItemActionsExample, "reveal=\"hover\" hides actions until hover — they still show on focus-within and always on touch screens."),
    ex("selectable", "Selectable list (HR)", "item/selectable.tsx", ItemSelectable, "selectable=\"single\" | \"multiple\": listbox with ↑ ↓ Home End, Space/Enter toggles, Shift+↓ extends, Ctrl/⌘+A selects all. Disabled rows are skipped."),
    ex("link-rows", "Rows as links (search)", "item/link-rows.tsx", ItemLinkRows, "asChild merges the row styles onto your Link. Keep actions out of link rows (one interactive element)."),
    ex("states", "Loading and empty", "item/states.tsx", ItemStates, "ItemSkeleton for loading rows; ItemList empty for the no-rows message."),
  ],
  api: [
    { name: "ItemList", props: [
      { name: "divided", type: "boolean", default: "true", description: "Hairlines between rows." },
      { name: "inset", type: "boolean", default: "false", description: "Small side padding and rounded hover — for a list inside a padded CardBody." },
      { name: "selectable", type: '"single" | "multiple"', description: "Listbox behaviour; Item children need a value." },
      { name: "value / defaultValue", type: "string[]", description: "Selected values (controlled / uncontrolled)." },
      { name: "onValueChange", type: "(value: string[]) => void", description: "Selection change." },
      { name: "as", type: '"ul" | "ol" | "div"', default: '"ul"', description: "List element." },
      { name: "empty", type: "ReactNode", description: "Shown when there are no children." },
    ] },
    { name: "Item", props: [
      { name: "value", type: "string", description: "Option value in a selectable list." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Row height from --row-h (−0.5rem / base / +1rem)." },
      { name: "align", type: '"center" | "start"', default: '"center"', description: "Vertical alignment of the parts." },
      { name: "interactive", type: "boolean", description: "Hover tint and pointer (default on for asChild and options)." },
      { name: "disabled", type: "boolean", default: "false", description: "Dimmed, aria-disabled, skipped by the keyboard." },
      { name: "asChild", type: "boolean", default: "false", description: "Merge the row onto the child (a link)." },
      { name: "as", type: '"li" | "div"', default: '"li"', description: "Row wrapper element." },
    ] },
    { name: "ItemLeading", props: [{ name: "variant", type: '"plain" | "icon" | "thumbnail"', default: '"plain"', description: "Icon tile or 56×40 thumbnail frame." }] },
    { name: "ItemTitle", props: [
      { name: "truncate", type: "boolean", default: "true", description: "One line; string titles get a title tooltip." },
      { name: "asChild", type: "boolean", default: "false", description: "Render as a heading or link." },
    ] },
    { name: "ItemActions", props: [{ name: "reveal", type: '"always" | "hover"', default: '"always"', description: "hover: visible on hover, focus-within and touch." }] },
    { name: "ItemSkeleton", props: [
      { name: "count", type: "number", default: "3", description: "Placeholder rows." },
      { name: "leading", type: "boolean", default: "true", description: "Include an avatar circle." },
    ] },
    { name: "ItemContent / ItemDescription / ItemMeta", props: [{ name: "...props", type: "HTMLAttributes", description: "Layout parts." }] },
  ],
  covers: ["Item / list row"],
};

export default entry;
