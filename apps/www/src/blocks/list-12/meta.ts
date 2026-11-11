import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Tree list",
  description:
    "Store categories and company departments as one reorderable tree: drag to reorder or nest (or Alt + arrow keys and a move menu), a drop rule for hidden branches, three-level limit, counts that roll up to every parent, find-in-tree that expands and highlights matches, a side panel (a sheet on small screens) to rename, change the slug and visibility, add a child or delete with the contents moving up, and undo on every move.",
  category: "List pages",
  order: 120,
  tags: ["cms", "hr", "ops"],
  files: [
    "list-12/page.tsx",
    "list-12/components/tree-manager.tsx",
    "list-12/components/node-panel.tsx",
    "list-12/components/tree-data.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
