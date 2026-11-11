import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Support ticket",
  description:
    "One ticket as a full page: live first-response and resolution SLA clocks that pause while you wait on the customer, an email-style thread with internal notes, @mentions, attachments and ticket events, and a composer that switches between reply and internal note, inserts macros and sets the next status. A properties column (status, priority with SLA policy, queue, assignee, tags), the requester and their account health and older tickets from the same account; it moves into a sheet below 1280px.",
  category: "Detail pages",
  order: 90,
  tags: ["crm", "ops"],
  files: [
    "detail-09/page.tsx",
    "detail-09/components/ticket-view.tsx",
    "detail-09/components/thread.tsx",
    "detail-09/components/composer.tsx",
    "detail-09/components/side-panel.tsx",
    "detail-09/components/data.ts",
    "_shared/tickets.ts",
    "_shared/companies.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
