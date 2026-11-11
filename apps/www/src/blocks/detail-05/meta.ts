import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Order detail",
  description:
    "A delivered web order: fulfilment steps with timestamps, line items with VAT and totals, the payment ledger, a refund dialog that picks units per line and updates the ledger optimistically, the customer's message, and the printed carrier label with barcode, QR and scan history.",
  category: "Detail pages",
  order: 50,
  tags: ["ops", "site"],
  files: [
    "detail-05/page.tsx",
    "detail-05/components/order-detail.tsx",
    "detail-05/components/refund-dialog.tsx",
    "detail-05/components/shipping-label.tsx",
    "detail-05/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
