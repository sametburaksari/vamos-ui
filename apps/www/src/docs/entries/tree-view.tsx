import { ex, type DocEntry } from "../types";
import TreeViewDemo from "../examples/tree-view/demo";
import TreeViewCheckbox from "../examples/tree-view/checkbox";
import TreeViewLazy from "../examples/tree-view/lazy";
import TreeViewFilter from "../examples/tree-view/filter";
import TreeViewVirtual from "../examples/tree-view/virtual";
import TreeViewSidebar from "../examples/tree-view/sidebar";

const entry: DocEntry = {
  slug: "tree-view",
  title: "Tree view",
  group: "Data display",
  description:
    "Display and navigate hierarchies — a CMS page tree, category tree, media folders, a department tree, file explorer panes. A flat WAI-ARIA tree (level, set size and position on every row) with single, multiple or tri-state checkbox selection, lazy children with retry, filtering that keeps ancestors, hover actions, indent guides and virtualisation for thousands of nodes. The useTree hook underneath is exported for custom trees.",
  source: ["components/tree-view.tsx", "lib/use-tree.ts"],
  basedOn: "WAI-ARIA treeview + @tanstack/react-virtual",
  usage: `import { TreeView, type TreeNode } from "@vamos-cms/ui";

<TreeView aria-label="Pages" data={pages} defaultExpanded={["company"]} onAction={(node) => openPage(node.id)} />`,
  demo: ex("demo", "Page hierarchy", "tree-view/demo.tsx", TreeViewDemo),
  examples: [
    ex("checkbox", "Tri-state checkboxes", "tree-view/checkbox.tsx", TreeViewCheckbox, 'selectionMode="checkbox" cascades to descendants and shows mixed parents. checkValueMode="leaf" keeps only leaf ids (permission keys). Disabled nodes keep their state.'),
    ex("lazy", "Lazy folders", "tree-view/lazy.tsx", TreeViewLazy, "hasChildren + loadChildren: a spinner replaces the chevron while loading (aria-busy). A failed load shows Retry in the row."),
    ex("filter", "Filter keeps ancestors", "tree-view/filter.tsx", TreeViewFilter, "filter keeps matches and their ancestors, opens the path and highlights the match. The match count is announced."),
    ex("virtual", "5,550 nodes (virtual)", "tree-view/virtual.tsx", TreeViewVirtual, "virtual renders only the rows in view; keyboard focus scrolls rows into view first. Set a height."),
    ex("sidebar", "File explorer (sidebar variant)", "tree-view/sidebar.tsx", TreeViewSidebar, 'variant="sidebar" marks the current row with the accent. isSelectable makes folders expand-only.'),
  ],
  api: [
    {
      name: "TreeView",
      props: [
        { name: "data", type: "TreeNode[]", description: "{ id, label, children?, hasChildren?, disabled?, icon?, badge?, description?, keywords? }." },
        { name: "aria-label", type: "string", description: "Accessible name of the tree (required unless labelled by a heading)." },
        { name: "selectionMode", type: '"none" | "single" | "multiple" | "checkbox"', default: '"single"', description: "checkbox = tri-state checks." },
        { name: "selected / defaultSelected", type: "string[]", description: "Selected ids (checked ids in checkbox mode)." },
        { name: "onSelectedChange", type: "(ids) => void", description: "Called with the new selection." },
        { name: "expanded / defaultExpanded", type: "string[]", description: "Open branches (controlled / initial)." },
        { name: "onExpandedChange", type: "(ids) => void", description: "Called when a branch opens or closes." },
        { name: "cascade", type: "boolean", default: "true", description: "Checkbox mode: parents check descendants." },
        { name: "checkValueMode", type: '"all" | "parent" | "leaf"', default: '"all"', description: "Checkbox mode: shape of the value." },
        { name: "isSelectable", type: "(node, hasChildren) => boolean", description: "Which rows can be selected." },
        { name: "loadChildren", type: "(node, signal) => Promise<TreeNode[]>", description: "Lazy children." },
        { name: "filter", type: "string", description: "Locale-folded filter; keeps ancestors." },
        { name: "onAction", type: "(node) => void", description: "Enter or double click." },
        { name: "renderActions", type: "(node) => ReactNode", description: "Trailing buttons, revealed on hover and focus." },
        { name: "renderLabel", type: "(item) => ReactNode", description: "Replace a row's label." },
        { name: "virtual", type: "boolean", default: "false", description: "Render only visible rows." },
        { name: "height", type: "number | string", default: "360 when virtual", description: "Scroll height." },
        { name: "indent", type: "number", default: "16", description: "Indent per level (px, logical start)." },
        { name: "guides", type: "boolean", default: "true", description: "Indent guide lines." },
        { name: "variant", type: '"default" | "sidebar"', default: '"default"', description: "sidebar: accent current row." },
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "Row height (follows density)." },
        { name: "emptyState", type: "ReactNode", description: "Shown when data is empty." },
        { name: "labels", type: "Partial<TreeViewLabels>", description: "Built-in strings (namespace treeView)." },
      ],
    },
    {
      name: "useTree(options)",
      props: [
        { name: "returns items", type: "TreeItemState[]", description: "Flattened visible rows with level, posinset, setsize, expanded, checked, loading, error, guides." },
        { name: "getTreeProps / getItemProps", type: "() => props", description: "Spread on the tree element and each row: roles, roving tabindex, ARIA state, full keyboard." },
        { name: "toggleExpanded / toggleChecked / select / focusItem / reload", type: "(id) => void", description: "Imperative helpers." },
        { name: "getPath / getNode / getChildren", type: "…", description: "Lookups (paths for breadcrumbs and triggers)." },
      ],
    },
  ],
  notes: [
    "Keyboard: ↑ ↓ move, → opens or enters a branch, ← closes or goes to the parent (swapped in RTL), Home / End, * opens all siblings, type-ahead (folded: “ist” finds “İstanbul”), Space toggles the check or selection, Enter runs onAction.",
    "Drag-to-move comes from Sortable tree (Editors & drag-and-drop), which reuses useTree.",
  ],
  covers: ["Tree view"],
};

export default entry;
