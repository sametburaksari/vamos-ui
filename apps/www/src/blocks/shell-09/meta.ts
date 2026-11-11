import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Field service mobile shell",
  description:
    "Phone-first app for technicians: a bottom tab bar (Today, Jobs, Map, Dispatch) with a More sheet for everything else, a shift timeline and route, job sheets that move a job from scheduled to done with checklist and customer signature, and a live map of jobs and vans. From tablet width the tab bar becomes a side rail.",
  category: "App shells",
  order: 90,
  tags: ["ops"],
  files: [
    "shell-09/page.tsx",
    "shell-09/components/field-app.tsx",
    "shell-09/components/views.tsx",
    "shell-09/components/job-sheet.tsx",
    "shell-09/components/job-parts.tsx",
    "shell-09/components/data.ts",
  ],
};

export default meta;
