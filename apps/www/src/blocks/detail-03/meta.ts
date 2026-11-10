import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Invoice detail",
  description: "Invoice created from a quote: parties, read-only line items with discounts, VAT and balance due, payments, activity, collection progress and attachments.",
  category: "Detail pages",
  order: 30,
  tags: ["crm", "ops"],
  files: ["detail-03/page.tsx", "detail-03/components/invoice-detail.tsx", "detail-03/components/data.ts", "detail-01/components/workspace-shell.tsx"],
};

export default meta;
