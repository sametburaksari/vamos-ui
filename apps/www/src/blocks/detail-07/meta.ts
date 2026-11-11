import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Product information",
  description:
    "A PIM product editor: English and Turkish copy, a sortable image gallery with alt-text checks, size variants with price and stock, channel prices with live margin after VAT and fees, search listing with length meters and preview, stock by warehouse with the incoming PO, and a completeness checklist beside status and channel publishing.",
  category: "Detail pages",
  order: 70,
  tags: ["ops", "site", "cms"],
  files: [
    "detail-07/page.tsx",
    "detail-07/components/product-editor.tsx",
    "detail-07/components/pim-sections.tsx",
    "detail-07/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
