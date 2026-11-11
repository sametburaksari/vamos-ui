import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Audit log timeline",
  description:
    "Who changed what, when and from where: a day-grouped timeline with actor, target, source, IP and an inline before → after preview; actor, target, source and severity filters, a 7-day density strip that filters by day, an inspector with the full field diff and raw record (sheet on small screens), revert with confirmation and undo, and a CSV / XLSX / JSON export that asks for a reason when IPs are included.",
  category: "List pages",
  order: 90,
  tags: ["any", "ops"],
  files: [
    "list-09/page.tsx",
    "list-09/components/audit-view.tsx",
    "list-09/components/audit-timeline.tsx",
    "list-09/components/audit-inspector.tsx",
    "list-09/components/audit-data.ts",
    "_shared/events.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
