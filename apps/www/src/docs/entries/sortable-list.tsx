import { ex, type DocEntry } from "../types";
import SortableTreeDemo from "../examples/sortable-list/demo";
import SortableListExample from "../examples/sortable-list/list";
import SortableGridExample from "../examples/sortable-list/grid";
import SortableTreeCategories from "../examples/sortable-list/category-tree";
import SortableTreeTerritories from "../examples/sortable-list/territories";

const entry: DocEntry = {
  slug: "sortable-list",
  title: "Sortable list / tree",
  group: "Editors & drag-and-drop",
  description:
    "Ready reorderable lists, grids and nested trees: menu builders, category order, onboarding steps, dashboard tiles, territory trees. Every item has a drag handle and a Move menu (up, down, top, bottom, and for trees indent, outdent and move into…), so nothing requires dragging. Trees pick the depth from the horizontal drag offset and enforce a max depth and your own drop rules.",
  source: ["sortable/sortable-tree.tsx", "sortable/sortable-list.tsx", "sortable/core.ts"],
  basedOn: "Sortable (dnd-kit, internal) + Tree view semantics",
  usage: `import { SortableList, SortableGrid, SortableTree, moveTreeNode } from "@vamos-cms/ui/sortable";

<SortableList aria-label="Steps" items={steps} onReorder={setSteps} renderItem={(s) => s.title} />

<SortableTree
  aria-label="Main menu"
  nodes={menu}
  maxDepth={3}
  canDrop={(c) => (c.parentId === "status" ? "Links can't have sub-items" : true)}
  onMove={(e) => setMenu((m) => moveTreeNode(m, e.id, e.parentId, e.index))}
/>`,
  demo: ex("demo", "Menu builder", "sortable-list/demo.tsx", SortableTreeDemo, "A CMS header menu, three levels deep. Drag a row sideways to nest or un-nest it; the indicator line shows the landing depth. External links refuse children."),
  examples: [
    ex("list", "Vertical list", "sortable-list/list.tsx", SortableListExample, "HR onboarding steps in one inset box. Required steps are fixed: no handle, no Move menu, and they keep their slot."),
    ex("grid", "Grid", "sortable-list/grid.tsx", SortableGridExample, "CRM dashboard tiles. The whole tile is the drag activator and arrow keys move it in two dimensions."),
    ex("category-tree", "Compact tree", "sortable-list/category-tree.tsx", SortableTreeCategories, "Shop categories at size sm with a 20px indent and two levels. Only Brewing equipment starts expanded; a collapsed parent still accepts children."),
    ex("territories", "Rules and async saving", "sortable-list/territories.tsx", SortableTreeTerritories, "PRM territories: canDrop keeps regions at the top and territories under a region. onMove returns a promise, so the move shows at once and rolls back with a Retry toast if the server rejects it."),
  ],
  api: [
    { name: "SortableTree", props: [
      { name: "nodes", type: "N[] (N extends { id, children? })", description: "The tree. Rows show label / title / name unless renderItem is set." },
      { name: "onMove", type: "(e: { id, parentId, index, fromParentId, fromIndex }) => void | Promise<void>", description: "Once per drop or menu move. Apply it with moveTreeNode(nodes, id, parentId, index). A promise keeps the move optimistic; a rejection rolls it back." },
      { name: "getLabel", type: "(node) => string", default: "label / title / name", description: "Row text, type-ahead, announcements and the Move menu name." },
      { name: "maxDepth", type: "number", description: "Levels allowed, counting the moved subtree (\"Max depth 3\")." },
      { name: "canDrop", type: "(c: { id, parentId, index, depth, fromParentId, fromIndex }) => true | string", description: "A string blocks the drop: red indicator and reason on the dragged clone, disabled menu items with the reason." },
      { name: "disabled", type: "(node) => boolean", description: "Fixed rows: not draggable, no Move menu. They still accept children." },
      { name: "expanded / defaultExpanded / onExpandedChange", type: "string[]", default: "every parent", description: "Open rows. Moving into a parent opens it." },
      { name: "indent", type: "number", default: "24", description: "px per level; also the horizontal drag distance that changes one level." },
      { name: "guides", type: "boolean", default: "true", description: "Vertical indent guides." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Row height 32 / 36 px." },
      { name: "renderItem", type: "(node, { depth, isDragging, overlay, expanded, childCount }) => ReactNode", description: "Row content (icon, text, badges)." },
      { name: "renderActions", type: "(node) => ReactNode", description: "Trailing buttons before the Move menu." },
      { name: "moveMenu", type: "boolean", default: "true", description: "Move menu on every row (opened with Shift+F10 from the keyboard)." },
      { name: "empty", type: "ReactNode", description: "Shown when nodes is empty." },
      { name: "labels", type: "Partial<SortableTreeLabels>", description: "Built-in strings. Dictionary namespace: sortableTree." },
      { name: "aria-label / aria-labelledby", type: "string", description: "Name of the tree." },
    ] },
    { name: "SortableList / SortableGrid", props: [
      { name: "items / onReorder / renderItem", type: "T[] / (next, e) => void / (item, state) => ReactNode", description: "Items in order, the reordered array on every move, row content." },
      { name: "getId / getLabel / disabled", type: "(item) => string / (item) => string / boolean | (item) => boolean", description: "Stable id, spoken name, fixed items." },
      { name: "variant / size / orientation", type: '"card" | "inset" | "plain" / "sm" | "md" / "vertical" | "horizontal"', default: '"card" / "md" / "vertical"', description: "SortableList only." },
      { name: "minItemWidth", type: "string", default: '"10rem"', description: "SortableGrid only: auto-fill column width." },
      { name: "moveMenu / renderActions / empty / labels", type: "boolean / (item) => ReactNode / ReactNode / Partial<SortableLabels>", description: "See the Sortable page for the full list." },
    ] },
    { name: "Core (React-free)", props: [
      { name: "moveTreeNode(nodes, id, parentId, index)", type: "N[]", description: "Immutable move of a node (and its subtree)." },
      { name: "projectTreeMove(flat, activeId, overId, offsetX, indent, { maxDepth, dir })", type: "{ parentId, depth, index, invalid? } | null", description: "Where a dragged row would land; depth from the horizontal offset (sign flipped in RTL)." },
      { name: "flattenTree / descendantIds / arrayMove", type: "—", description: "Helpers shared with Data Table, Tree view and Line items." },
    ] },
  ],
  notes: [
    "Trees use the Tree view pattern: role=\"tree\", one tab stop, ↑ / ↓ move between rows, → opens or enters, ← closes or goes to the parent, Home / End, * opens siblings, type-ahead by first letter.",
    "Moving from the keyboard: Space or Enter lifts the focused row, ↑ / ↓ move it, ← / → change its level, Space drops, Esc cancels. Without lifting: Alt + ↑ / ↓ moves among siblings, Alt + → indents, Alt + ← outdents (mirrored in RTL), Shift+F10 opens the Move menu.",
    "Announcements say where the row will land (\"About us will move into Services, position 3.\") and the result after a drop or menu move. Focus stays on the moved row.",
    "The dragged clone is an opaque popover without blur, so glass and solid render the same. Reduced motion turns off the shift and drop animations.",
  ],
  covers: ["Sortable list / tree"],
};

export default entry;
