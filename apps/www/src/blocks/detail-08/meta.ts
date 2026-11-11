import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Quote builder",
  description:
    "A proposal laid out like the document it becomes: customer letterhead, validity and payment terms, line items picked from a service catalogue with row and document discounts and KDV. A deal desk beside it shows the total, recurring vs one-off value, effective discount against approval bands and gross margin, routes the quote to the right approver, then sends it for sequential e-signature with reminders, revisions and a full history.",
  category: "Detail pages",
  order: 80,
  tags: ["crm"],
  files: [
    "detail-08/page.tsx",
    "detail-08/components/quote-builder.tsx",
    "detail-08/components/deal-desk.tsx",
    "detail-08/components/send-dialog.tsx",
    "detail-08/components/data.ts",
    "_shared/companies.ts",
    "_shared/people.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
