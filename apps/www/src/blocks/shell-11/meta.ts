import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Support inbox shell",
  description:
    "Three-pane help desk: views and queues with live counts, a ticket list with SLA clocks, bulk assign and solve, and a conversation with reply / internal-note composer and macros. A customer context column on very wide screens; views fold into a sheet on tablets and phones show one pane at a time.",
  category: "App shells",
  order: 110,
  tags: ["crm", "ops"],
  files: [
    "shell-11/page.tsx",
    "shell-11/components/support-desk.tsx",
    "shell-11/components/ticket-list.tsx",
    "shell-11/components/conversation.tsx",
    "shell-11/components/queue-rail.tsx",
    "shell-11/components/customer-panel.tsx",
    "shell-11/components/data.ts",
  ],
};

export default meta;
