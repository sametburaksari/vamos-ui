"use client";

import * as React from "react";
import { Gantt, type GanttTask } from "@vamos-cms/ui/scheduler";

const tasks: GanttTask[] = [
  { id: "q1", title: "Hiring plan approved", start: "2026-01-15", end: "2026-01-15", type: "milestone", progress: 1 },
  { id: "r", title: "Recruiting · engineering", start: "2026-02-02", end: "2026-05-29", progress: 0.8, tone: "chart-1" },
  { id: "s", title: "Recruiting · sales", start: "2026-03-02", end: "2026-07-31", progress: 0.6, tone: "chart-2" },
  { id: "o", title: "Onboarding cohort 1", start: "2026-06-01", end: "2026-06-26", progress: 1, tone: "chart-3" },
  { id: "o2", title: "Onboarding cohort 2", start: "2026-09-07", end: "2026-10-02", progress: 0.5, tone: "chart-3" },
  { id: "rv", title: "Year-end reviews", start: "2026-11-16", end: "2026-12-18", tone: "chart-4" },
];

/** Day, week, month and quarter zoom with locale week numbers (W46) and quarter labels. */
export default function GanttScales() {
  return <Gantt className="w-full" tasks={tasks} defaultScale="month" columns={["title", "start", "end"]} today="2026-11-10" readOnly />;
}
