import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Customer 360",
  description:
    "One account on one screen: health score with its drivers, MRR, weighted pipeline, open tickets with SLA and outstanding balance; deals you move by stage, support tickets in a side sheet, invoices with ageing and payment reminders, contacts, pinned notes and a merged history you can filter.",
  category: "Detail pages",
  order: 40,
  tags: ["crm"],
  files: [
    "detail-04/page.tsx",
    "detail-04/components/customer-360.tsx",
    "detail-04/components/account-header.tsx",
    "detail-04/components/account-work.tsx",
    "detail-04/components/account-timeline.tsx",
    "detail-04/components/account-dialogs.tsx",
    "detail-04/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
