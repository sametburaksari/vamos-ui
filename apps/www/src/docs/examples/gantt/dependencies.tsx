"use client";

import * as React from "react";
import { Switch } from "@vamos-ui/react";
import { Gantt, type GanttLink, type GanttTask } from "@vamos-ui/react/scheduler";
import { trWorkCalendar } from "@vamos-ui/react/locale-data";

const initial: GanttTask[] = [
  { id: "a", title: "Partner contract signed", start: "2026-10-23", end: "2026-10-23", type: "milestone", progress: 1 },
  { id: "b", title: "Onboarding workshop", start: "2026-10-26", end: "2026-10-28", tone: "chart-1" },
  { id: "c", title: "Co-branded landing page", start: "2026-10-29", end: "2026-11-06", tone: "chart-3" },
  { id: "d", title: "Sales enablement", start: "2026-11-09", end: "2026-11-13", tone: "chart-2" },
  { id: "e", title: "Joint launch", start: "2026-11-16", end: "2026-11-16", type: "milestone" },
];
const links: GanttLink[] = [
  { id: "1", from: "a", to: "b" },
  { id: "2", from: "b", to: "c" },
  { id: "3", from: "c", to: "d" },
  { id: "4", from: "d", to: "e" },
];

/** Move “Onboarding workshop”: successors shift, skipping weekends and 29 Oct (Republic Day). */
export default function GanttDependencies() {
  const [tasks, setTasks] = React.useState(initial);
  const [auto, setAuto] = React.useState(true);
  return (
    <div className="grid w-full gap-3">
      <label className="inline-flex items-center gap-2 text-[13px]">
        <Switch checked={auto} onCheckedChange={setAuto} /> Auto-schedule successors
      </label>
      <Gantt
        tasks={tasks}
        links={links}
        defaultScale="day"
        scales={["day", "week"]}
        columns={["title", "start", "end", "duration", "predecessors"]}
        workCalendar={trWorkCalendar}
        autoSchedule={auto}
        today="2026-10-27"
        onTaskChange={(batch) => setTasks((l) => l.map((t) => ({ ...t, ...batch.find((c) => c.id === t.id) })))}
      />
    </div>
  );
}
