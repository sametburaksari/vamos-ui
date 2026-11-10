"use client";

import * as React from "react";
import { Toaster } from "@vamos-cms/ui";
import { Gantt, type GanttLink, type GanttTask, type GanttTaskChange } from "@vamos-cms/ui/scheduler";

const people = {
  ada: { id: "ada", name: "Ada Kaplan" },
  ben: { id: "ben", name: "Ben Ortiz" },
  ece: { id: "ece", name: "Ece Tunç" },
  raj: { id: "raj", name: "Raj Malhotra" },
};

const initial: GanttTask[] = [
  { id: "p", title: "Website relaunch · Lumen Spa", start: "2026-10-26", end: "2026-10-26" },
  { id: "d", parentId: "p", title: "Discovery", start: "2026-10-26", end: "2026-10-26" },
  { id: "d1", parentId: "d", title: "Stakeholder interviews", start: "2026-10-26", end: "2026-10-30", progress: 1, assignees: [people.ada], tone: "chart-1" },
  { id: "d2", parentId: "d", title: "Content audit", start: "2026-11-02", end: "2026-11-04", progress: 1, assignees: [people.ece], tone: "chart-1" },
  { id: "s", parentId: "p", title: "Design", start: "2026-11-05", end: "2026-11-05" },
  { id: "s1", parentId: "s", title: "Wireframes", start: "2026-11-05", end: "2026-11-11", progress: 0.7, assignees: [people.ben], tone: "chart-3" },
  { id: "s2", parentId: "s", title: "Visual design", start: "2026-11-12", end: "2026-11-20", progress: 0.1, assignees: [people.ben, people.ece], tone: "chart-3" },
  { id: "b", parentId: "p", title: "Build", start: "2026-11-23", end: "2026-11-23" },
  { id: "b1", parentId: "b", title: "Booking flow", start: "2026-11-23", end: "2026-12-04", assignees: [people.raj], tone: "chart-2" },
  { id: "b2", parentId: "b", title: "CMS integration", start: "2026-11-30", end: "2026-12-09", assignees: [people.raj, people.ada], tone: "chart-2" },
  { id: "l", title: "Launch", start: "2026-12-11", end: "2026-12-11", type: "milestone" },
];
const links: GanttLink[] = [
  { id: "1", from: "d1", to: "d2" },
  { id: "2", from: "d2", to: "s1" },
  { id: "3", from: "s1", to: "s2" },
  { id: "4", from: "s2", to: "b1" },
  { id: "5", from: "b2", to: "l" },
];

export default function GanttDemo() {
  const [tasks, setTasks] = React.useState(initial);
  const [deps, setDeps] = React.useState(links);
  const apply = (batch: GanttTaskChange[]) => setTasks((list) => list.map((t) => ({ ...t, ...batch.find((c) => c.id === t.id) })));
  return (
    <>
      <Gantt
        className="w-full"
        tasks={tasks}
        links={deps}
        defaultScale="week"
        columns={["title", "assignees", "start", "end", "duration", "progress"]}
        workCalendar={{ workDays: [1, 2, 3, 4, 5] }}
        today="2026-11-10"
        onTaskChange={apply}
        onLinkCreate={(l) => setDeps((d) => [...d, { ...l, id: crypto.randomUUID() }])}
        onLinkDelete={(id) => setDeps((d) => d.filter((l) => l.id !== id))}
      />
      <Toaster />
    </>
  );
}
