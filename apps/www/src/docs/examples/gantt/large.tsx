"use client";

import * as React from "react";
import { Gantt, type GanttTask } from "@vamos-cms/ui/scheduler";

const phases = ["Plan", "Design", "Build", "Test", "Ship"];
const add = (d: string, n: number) => new Date(Date.parse(`${d}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

// 400 work packages × 5 phases = 2,000 rows (plus summaries), virtualized.
const tasks: GanttTask[] = Array.from({ length: 400 }, (_, i) => {
  const start = add("2026-09-01", (i * 3) % 120);
  return [
    { id: `wp${i}`, title: `Work package ${String(i + 1).padStart(3, "0")}`, start, end: start },
    ...phases.map((p, j) => ({ id: `wp${i}-${j}`, parentId: `wp${i}`, title: p, start: add(start, j * 6), end: add(start, j * 6 + 4), progress: j < 2 ? 1 : j === 2 ? 0.4 : 0, tone: `chart-${(j % 6) + 1}` as GanttTask["tone"] })),
  ];
}).flat();

export default function GanttLarge() {
  return <Gantt className="w-full" tasks={tasks} defaultScale="month" today="2026-11-10" readOnly height="24rem" />;
}
