import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Command palette shell",
  description:
    "Developer console with almost no chrome: a one-line header, the page and a status line. Navigation, actions, environment switching, docs and request lookup all live in ⌘K (or /), with g-then-key jumps. Pages: overview with counters, a live-tailing request log with status filters and request detail, API keys with create-once secrets and undoable revoke, and webhooks with retry.",
  category: "App shells",
  order: 100,
  tags: ["any"],
  files: [
    "shell-10/page.tsx",
    "shell-10/components/console.tsx",
    "shell-10/components/palette.tsx",
    "shell-10/components/pages.tsx",
    "shell-10/components/data.ts",
  ],
};

export default meta;
