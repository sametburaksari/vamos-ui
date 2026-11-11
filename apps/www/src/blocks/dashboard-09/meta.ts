import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Cash flow",
  description:
    "Finance cash flow: cash on hand, net burn and runway with an 18-month projection you can switch between scenarios, monthly cash in and out, receivables and payables ageing on one mirrored axis, and invoices due with reminders, payment scheduling and mark-paid that moves cash at once (with undo).",
  category: "Dashboards",
  order: 90,
  tags: ["ops", "any"],
  files: [
    "dashboard-09/page.tsx",
    "dashboard-09/components/cash-dashboard.tsx",
    "dashboard-09/components/runway-card.tsx",
    "dashboard-09/components/flow-ageing.tsx",
    "dashboard-09/components/invoices-due.tsx",
    "dashboard-09/components/data.ts",
    "dashboard-09/components/live-count.tsx",
    "_shared/finance.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
