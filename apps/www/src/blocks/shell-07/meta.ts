import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Store top-nav shell",
  description:
    "An e-commerce admin with no sidebar: store sections in the top bar with a sales-channel switcher, the active section's views as sub-tabs with live counts, and a breadcrumb on the page. Sections move into a sheet and sub-tabs scroll on phones. Shown with the order queue: today's numbers, search, bulk “mark as fulfilled” with undo, and an order sheet with lines, VAT, fulfilment steps and a carrier form.",
  category: "App shells",
  order: 70,
  tags: ["ops", "site"],
  files: [
    "shell-07/page.tsx",
    "shell-07/components/top-nav.tsx",
    "shell-07/components/orders-page.tsx",
    "shell-07/components/order-sheet.tsx",
    "shell-07/data.ts",
  ],
};

export default meta;
