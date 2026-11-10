"use client";

import * as React from "react";
import { Gantt, type GanttTask } from "@vamos-cms/ui/scheduler";

const tasks: GanttTask[] = [
  { id: "1", title: "Brand strategy", start: "2026-10-05", end: "2026-10-16", progress: 1, tone: "chart-1" },
  { id: "2", title: "Logo & identity", start: "2026-10-19", end: "2026-11-06", progress: 1, tone: "chart-1" },
  { id: "3", title: "Packaging design", start: "2026-11-02", end: "2026-11-20", progress: 0.55, tone: "chart-3" },
  { id: "4", title: "Print proofs", start: "2026-11-23", end: "2026-11-27", tone: "chart-3" },
  { id: "5", title: "Hand-over", start: "2026-11-30", end: "2026-11-30", type: "milestone" },
];

/** A client portal view: no editing, no zoom switch, just progress and dates. */
export default function GanttReadOnly() {
  return <Gantt className="w-full" tasks={tasks} links={[{ id: "a", from: "3", to: "4" }, { id: "b", from: "4", to: "5" }]} scale="week" scales={[]} columns={["title", "end", "progress"]} today="2026-11-10" readOnly height="18rem" />;
}
