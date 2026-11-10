import { ex, type DocEntry } from "../types";
import TreeSelectDemo from "../examples/tree-select/demo";
import TreeSelectMultiple from "../examples/tree-select/multiple";
import TreeSelectLazy from "../examples/tree-select/lazy";
import TreeSelectSearch from "../examples/tree-select/search";
import TreeSelectInline from "../examples/tree-select/inline";

const entry: DocEntry = {
  slug: "tree-select",
  title: "Tree select",
  group: "Pickers",
  description:
    "Pick from hierarchical data — product categories, departments, locations and warehouses, folder destinations, a chart of accounts. A searchable tree in a popover (or inline), single or multi with tri-state cascade, lazy branches, search that keeps ancestors, leaf-only selection and “Add category”. Built on the same useTree model as Tree view.",
  source: ["components/tree-select.tsx", "components/tree-view.tsx", "lib/use-tree.ts"],
  basedOn: "Radix Popover + WAI-ARIA treeview",
  usage: `import { Field, TreeSelect, type TreeNode } from "@vamos-ui/react";

<Field label="Category">
  <TreeSelect nodes={categories} value={categoryId} onValueChange={setCategoryId} />
</Field>`,
  demo: ex("demo", "Demo", "tree-select/demo.tsx", TreeSelectDemo),
  examples: [
    ex("multiple", "Multiple with cascade", "tree-select/multiple.tsx", TreeSelectMultiple, 'Checking a parent checks its descendants; a partly checked parent shows a dash (aria-checked="mixed"). valueMode picks what the value lists: all, the topmost checked (parent) or leaves.'),
    ex("lazy", "Lazy branches", "tree-select/lazy.tsx", TreeSelectLazy, "Nodes with hasChildren load through loadChildren on first open (spinner in the row, retry on error)."),
    ex("search", "Search & leaf-only", "tree-select/search.tsx", TreeSelectSearch, 'Search folds case and accents (also keywords and description), keeps ancestors and opens them. selectable="leaf" lets parents only expand. Enter in the search picks the first match.'),
    ex("inline", "Inline with “Add”", "tree-select/inline.tsx", TreeSelectInline, 'mode="inline" for an editor side panel. onCreate adds under the focused node; add the returned node to nodes yourself.'),
  ],
  api: [
    {
      name: "TreeSelect",
      props: [
        { name: "nodes", type: "TreeNode[]", description: "The hierarchy: { id, label, children?, hasChildren?, disabled?, icon?, description?, keywords? }." },
        { name: "multiple", type: "boolean", default: "false", description: "Checkboxes; value becomes string[]." },
        { name: "value / defaultValue", type: "string | null  ·  string[]", description: "Controlled / initial id(s)." },
        { name: "onValueChange", type: "(id, node) => void  ·  (ids) => void", description: "Called with the new value." },
        { name: "cascade", type: "boolean", default: "true", description: "Multi: parent checks descendants (tri-state)." },
        { name: "valueMode", type: '"all" | "parent" | "leaf"', default: '"all"', description: "Multi + cascade: what a fully checked branch yields." },
        { name: "selectable", type: '"any" | "leaf"', default: '"any"', description: "Can parents be chosen?" },
        { name: "loadChildren", type: "(node, signal) => Promise<TreeNode[]>", description: "Lazy children for nodes with hasChildren." },
        { name: "showPath", type: "boolean", default: "true", description: "Trigger shows “Electronics › Phones” (› mirrors in RTL)." },
        { name: "defaultExpanded", type: 'string[] | "selected"', default: '"selected"', description: "Initially open branches." },
        { name: "onCreate", type: "(parentId, label) => TreeNode | Promise<TreeNode>", description: "Adds an “Add” footer that creates under the focused node." },
        { name: "searchable", type: "boolean", default: "true", description: "Show the search box." },
        { name: "mode", type: '"popover" | "inline"', default: '"popover"', description: "inline renders the tree in place." },
        { name: "height", type: "number", default: "288", description: "Max tree height in px." },
        { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Trigger and row size." },
        { name: "placeholder / searchPlaceholder", type: "string", description: "Trigger and search texts." },
        { name: "name", type: "string", description: "Hidden input(s) for form posts." },
        { name: "disabled / readOnly / invalid / required", type: "boolean", description: "Also read from the surrounding Field." },
        { name: "labels", type: "Partial<TreeSelectLabels>", description: "Built-in strings (namespace treeSelect)." },
      ],
    },
  ],
  covers: ["Tree select"],
};

export default entry;
