import type { Release } from "@vamos-ui/react";

export const releases: Release[] = [
  {
    version: "3.8.0",
    date: "2026-11-10",
    title: "Saved views",
    summary: "Keep a filtered, sorted list one click away and share it with your workspace.",
    changes: [
      { type: "added", title: "Save any filtered list as a view", description: "Views keep filters, sort order and visible columns." },
      { type: "added", title: "Share a view with the workspace" },
      { type: "changed", title: "Filters moved into a single bar above the list" },
      { type: "fixed", title: "Export kept the previous column order" },
    ],
  },
  {
    version: "3.7.2",
    date: "2026-10-28",
    title: "Reminder fixes",
    changes: [
      { type: "fixed", title: "Reminders used the server time zone instead of yours" },
      { type: "security", title: "Session cookies now expire after 12 hours of inactivity" },
    ],
  },
  {
    version: "3.7.0",
    date: "2026-10-14",
    title: "Bulk edit",
    summary: "Change the owner, status or due date of up to 500 records at once.",
    changes: [
      { type: "added", title: "Bulk edit from the list toolbar" },
      { type: "deprecated", title: "The v1 export endpoint", description: "It keeps working until 2027-03-31; move to /v2/exports." },
      { type: "removed", title: "The legacy print layout" },
    ],
  },
];
