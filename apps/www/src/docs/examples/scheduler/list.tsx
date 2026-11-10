"use client";

import * as React from "react";
import { Scheduler, type SchedulerEvent } from "@vamos-cms/ui/scheduler";

const at = (day: string, time: string) => new Date(`${day}T${time}:00Z`).toISOString();

const events: SchedulerEvent[] = [
  { id: "1", title: "Onboarding · Sara Lindqvist", start: at("2026-11-09", "09:00"), end: at("2026-11-09", "10:30"), tone: "chart-2", location: "HQ, floor 3" },
  { id: "2", title: "1:1 with Omar", start: at("2026-11-09", "14:00"), end: at("2026-11-09", "14:30"), tone: "chart-1" },
  { id: "3", title: "Benefits enrolment closes", start: "2026-11-10", end: "2026-11-10", allDay: true, tone: "warning" },
  { id: "4", title: "Interview · backend engineer", start: at("2026-11-11", "11:00"), end: at("2026-11-11", "12:00"), tone: "chart-3", status: "tentative" },
  { id: "5", title: "Payroll run", start: at("2026-11-13", "08:00"), end: at("2026-11-13", "09:00"), tone: "chart-5" },
];

/** The list view is the screen-reader-first view: a heading per day, one button per event. */
export default function SchedulerList() {
  return <Scheduler className="w-full max-w-2xl" events={events} defaultDate="2026-11-10" defaultView="list" views={["list", "week"]} timeZone="UTC" onEventOpen={(id) => console.log("open", id)} />;
}
