"use client";

import * as React from "react";
import { Badge } from "@vamos-ui/react";
import { ResourceCalendar, type ResourceBlock } from "@vamos-ui/react/scheduler";

const team = [
  { id: "a", title: "Defne Aydın", meta: "12 days left" },
  { id: "b", title: "James O’Neill", meta: "4 days left" },
  { id: "c", title: "Selin Arslan", meta: "18 days left" },
  { id: "d", title: "Tomás Rivera", meta: "9 days left" },
  { id: "e", title: "Hana Sato", meta: "15 days left" },
];

const leave = (id: string, resourceId: string, start: string, end: string, label: string, status: ResourceBlock["status"], tone: ResourceBlock["tone"] = "chart-2"): ResourceBlock => ({ id, resourceId, start, end, label, status, tone, kind: "leave" });

const blocks: ResourceBlock[] = [
  leave("1", "a", "2026-11-02", "2026-11-06", "Annual leave", "approved"),
  leave("2", "b", "2026-11-11", "2026-11-13", "Annual leave", "pending"),
  leave("3", "c", "2026-11-16", "2026-11-16", "Sick", "approved", "danger"),
  leave("4", "d", "2026-11-23", "2026-11-27", "Parental leave", "approved", "chart-3"),
  leave("5", "e", "2026-11-19", "2026-11-20", "Annual leave", "pending"),
  leave("6", "e", "2026-11-09", "2026-11-09", "Unpaid leave", "rejected", "neutral"),
  { id: "7", resourceId: "a", start: "2026-11-25", end: "2026-11-25", label: "Doctor", halfDay: "pm", status: "approved", tone: "chart-5", kind: "leave" },
];

export default function ResourceCalendarAbsences() {
  const [showRejected, setShowRejected] = React.useState(false);
  return (
    <ResourceCalendar
      className="w-full"
      resources={team}
      blocks={blocks}
      range={{ start: "2026-11-01", end: "2026-11-30" }}
      showRejected={showRejected}
      summary={(_, list) => (list.length ? list.length : "")}
      cellActions={[{ id: "request", label: "Request time off…" }]}
      onCellAction={(a) => console.log(a)}
      toolbar={
        <div className="flex items-center gap-2 text-[12px] text-fg-muted">
          <Badge tone="warning" size="sm">Striped = pending</Badge>
          <label className="inline-flex items-center gap-1.5">
            <input type="checkbox" checked={showRejected} onChange={(e) => setShowRejected(e.target.checked)} />
            Show rejected
          </label>
        </div>
      }
    />
  );
}
