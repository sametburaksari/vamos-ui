import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Data import",
  description:
    "Contact import in four steps: drop a CSV (or load a sample export) and see the raw rows with the detected encoding, delimiter and date format; map columns with suggestions from English and Turkish headers; review a validation table with inline fixes and F8 to the next error; then pick a duplicate strategy and import, with a field guide and recent imports beside it.",
  category: "Onboarding",
  order: 40,
  tags: ["any", "crm"],
  files: [
    "onboarding-04/page.tsx",
    "onboarding-04/components/contact-import.tsx",
    "onboarding-04/components/import-sidebar.tsx",
    "onboarding-04/components/data.ts",
    "detail-04/components/admin-shell.tsx",
  ],
};

export default meta;
