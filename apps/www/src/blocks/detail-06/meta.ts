import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Employee file",
  description:
    "A team lead's HR record: identity card with reporting line and direct reports, role, pay hidden until revealed, equipment; leave balance rings, a year calendar of leave and public holidays, requests you can withdraw and a request dialog that counts working days; documents with expiry and renewal; goals, competency scores and past reviews.",
  category: "Detail pages",
  order: 60,
  tags: ["hr"],
  files: [
    "detail-06/page.tsx",
    "detail-06/components/employee-profile.tsx",
    "detail-06/components/time-off.tsx",
    "detail-06/components/reviews.tsx",
    "detail-06/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
