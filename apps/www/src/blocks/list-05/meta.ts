import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Saved views",
  description:
    "CRM contacts driven by saved views: a views rail split into yours, shared with you and team, with live counts; edits show an unsaved strip with save, save as new and discard; a share dialog sets who can open the view and copies a link with or without your changes, previewing the filters and columns they will get. Filter bar, column chooser, CSV and bulk assign.",
  category: "List pages",
  order: 50,
  tags: ["crm"],
  files: [
    "list-05/page.tsx",
    "list-05/components/contacts-views.tsx",
    "list-05/components/views-rail.tsx",
    "list-05/components/share-view-dialog.tsx",
    "list-05/components/views-data.ts",
    "list-05/components/contacts-data.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
