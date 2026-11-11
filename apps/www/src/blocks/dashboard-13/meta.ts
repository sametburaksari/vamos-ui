import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Warehouse inventory",
  description:
    "Warehouse stock: value at cost, SKUs at their reorder point, out-of-stock count and median days of cover with a cover histogram, a reorder queue that suggests quantities from sales rate and supplier lead time and turns the selection into one purchase order per supplier, today's movements with a validated record dialog that updates stock at once, and a sortable stock table with reorder-point marks — all per warehouse, with undo.",
  category: "Dashboards",
  order: 130,
  tags: ["ops"],
  files: [
    "dashboard-13/page.tsx",
    "dashboard-13/components/inventory-dashboard.tsx",
    "dashboard-13/components/position-card.tsx",
    "dashboard-13/components/reorder-queue.tsx",
    "dashboard-13/components/movements-card.tsx",
    "dashboard-13/components/stock-table.tsx",
    "dashboard-13/components/data.ts",
    "_shared/products.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
