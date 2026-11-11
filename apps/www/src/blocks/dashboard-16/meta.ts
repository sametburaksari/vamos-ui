import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Dispatch console",
  description:
    "Full-screen field-service dispatch: today's jobs in Queue / Active / Done lanes with time windows and SLA bars, a city map of jobs and vans where a pin and a list row are the same selection, and the crew with their load and last GPS ping. Assign a job to the best-matching technician (ranked by skill and drive time), text a late customer, or put a job back in the queue, all with undo.",
  category: "Dashboards",
  order: 160,
  tags: ["ops"],
  files: [
    "dashboard-16/page.tsx",
    "dashboard-16/components/dispatch-console.tsx",
    "dashboard-16/components/job-queue.tsx",
    "dashboard-16/components/crew-list.tsx",
    "dashboard-16/components/assign-dialog.tsx",
    "dashboard-16/components/data.ts",
    "_shared/geo.ts",
  ],
};

export default meta;
