import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Orders desk",
  description:
    "E-commerce orders: revenue, orders, average order and conversion for 7/14/30 days with count-ups, daily revenue against its average, the checkout funnel, a four-lane fulfilment queue with bulk actions and an order sheet (optimistic, with undo), best sellers with stock cover and reorder, and return reasons.",
  category: "Dashboards",
  order: 80,
  tags: ["site", "ops"],
  files: [
    "dashboard-08/page.tsx",
    "dashboard-08/components/orders-dashboard.tsx",
    "dashboard-08/components/kpi-strip.tsx",
    "dashboard-08/components/sales-charts.tsx",
    "dashboard-08/components/fulfilment-desk.tsx",
    "dashboard-08/components/products-returns.tsx",
    "dashboard-08/components/data.ts",
    "dashboard-08/components/live-count.tsx",
    "_shared/orders.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
