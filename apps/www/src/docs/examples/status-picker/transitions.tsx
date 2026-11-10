"use client";

import * as React from "react";
import { StatusPicker, type StatusDef } from "@vamos-cms/ui";

const content: StatusDef[] = [
  { value: "draft", label: "Draft", category: "todo", description: "Only editors can see it" },
  { value: "review", label: "In review", category: "active", tone: "warning", description: "Waiting for an editor" },
  { value: "scheduled", label: "Scheduled", category: "active", tone: "info", description: "Goes live at the set time" },
  { value: "published", label: "Published", category: "done", description: "Live on the site" },
  { value: "archived", label: "Archived", category: "cancelled", description: "Hidden, URL redirects" },
];

// Editorial workflow: a draft can't jump straight to Published.
const transitions = {
  draft: ["review", "archived"],
  review: ["draft", "scheduled", "published"],
  scheduled: ["review", "published"],
  published: ["archived"],
  archived: ["draft"],
};

export default function StatusPickerTransitions() {
  const [status, setStatus] = React.useState("draft");
  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-ui border border-line bg-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">A field guide to GDPR consent banners</p>
        <p className="text-xs text-fg-muted">Last edited by Priya Raman · 12 min ago</p>
      </div>
      <StatusPicker statuses={content} transitions={transitions} value={status} onValueChange={setStatus} />
    </div>
  );
}
