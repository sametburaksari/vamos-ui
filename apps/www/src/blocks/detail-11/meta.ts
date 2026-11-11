import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Contract",
  description:
    "Customer agreement record: a term ruler with the notice deadline, clause text with an outline, counterparty proposals shown as word diffs to accept or reject (with undo), flags for legal, version comparison of key terms, sequential signers with reminders, and renewal reminders with an auto-renewal switch that asks before sending a non-renewal notice.",
  category: "Detail pages",
  order: 110,
  tags: ["crm", "ops"],
  files: [
    "detail-11/page.tsx",
    "detail-11/components/contract-view.tsx",
    "detail-11/components/clause-document.tsx",
    "detail-11/components/term-ribbon.tsx",
    "detail-11/components/contract-aside.tsx",
    "detail-11/components/reminder-dialog.tsx",
    "detail-11/components/contract-data.ts",
    "_shared/companies.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
