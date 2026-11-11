import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Campaign wizard",
  description:
    "Four-step campaign builder: pick a segment and cities with exclusions and a live match count; write email, SMS (segment counter, Turkish 70-character rule) or push with merge tags; send now, at a set time with quiet-hours handling, or at each person's best hour; then review with edit links, pre-send checks, reach, opens and cost, a test send and a confirm. A sticky preview shows the message at desktop or phone width as you type.",
  category: "Settings & forms",
  order: 45,
  tags: ["crm", "site"],
  files: [
    "form-02/page.tsx",
    "form-02/components/campaign-wizard.tsx",
    "form-02/components/steps.tsx",
    "form-02/components/message-preview.tsx",
    "form-02/components/reach.ts",
    "form-02/components/data.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
