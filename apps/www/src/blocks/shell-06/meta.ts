import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Two-level ERP shell",
  description:
    "A dense back-office sidebar: collapsible module sections with their screens underneath, a “/” filter that jumps to any screen and opens the matching sections, expand or collapse all, and attention counts that move to the section header when it is closed. Shown with an inventory stock-levels screen: warehouse switch, cover in days, reorder-point bars, stock adjustments with undo and a purchase order built from the selection.",
  category: "App shells",
  order: 60,
  tags: ["ops"],
  files: [
    "shell-06/page.tsx",
    "shell-06/components/erp-sidebar.tsx",
    "shell-06/components/stock-page.tsx",
    "shell-06/components/dialogs.tsx",
    "shell-06/data.ts",
  ],
};

export default meta;
