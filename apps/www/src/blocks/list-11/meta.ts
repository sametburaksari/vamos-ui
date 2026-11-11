import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Activity feed",
  description:
    "A workspace-wide event stream: live updates that queue behind a “new events” pill instead of shifting the page, pause / resume, older pages that load as you scroll (with a button fallback and a clear end), day headings, topic filters, follow a record with a star, hide an actor with undo, and a side rail with today's count, an hourly pulse, a per-topic breakdown and who is active now.",
  category: "List pages",
  order: 110,
  tags: ["any", "ops", "crm"],
  files: [
    "list-11/page.tsx",
    "list-11/components/activity-feed.tsx",
    "list-11/components/feed-item.tsx",
    "list-11/components/feed-data.ts",
    "_shared/events.ts",
    "shell-01/page.tsx",
  ],
};

export default meta;
