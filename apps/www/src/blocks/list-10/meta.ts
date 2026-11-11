import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Bulk price & stock editor",
  description:
    'Spreadsheet-style grid for product prices and stock: arrow-key navigation, type-to-edit, Enter / Tab to commit, "+10%" in price cells, changed-cell marks, below-cost warnings, live margin and stock cover, ⌘Z undo / redo, bulk adjust by percentage or amount with ,90 rounding, a changed-only filter, and a review dialog that publishes every change to all channels at once.',
  category: "List pages",
  order: 100,
  tags: ["ops", "site"],
  files: [
    "list-10/page.tsx",
    "list-10/components/bulk-editor.tsx",
    "list-10/components/price-grid.tsx",
    "list-10/components/adjust-popover.tsx",
    "list-10/components/use-grid-edits.ts",
    "list-10/components/grid-data.ts",
    "_shared/products.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
