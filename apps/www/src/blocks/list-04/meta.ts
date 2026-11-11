import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Grouped orders",
  description:
    "Orders grouped by customer, status or channel in one table: groups and orders expand in place, every group carries its own subtotal, units and open count with a revenue bar, and a grand total closes the table. Search across orders, customers and products, filter by status and sort the groups.",
  category: "List pages",
  order: 40,
  tags: ["ops", "crm"],
  files: [
    "list-04/page.tsx",
    "list-04/components/grouped-orders.tsx",
    "list-04/components/group-rows.tsx",
    "list-04/components/grouped-orders-data.ts",
    "_shared/orders.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
