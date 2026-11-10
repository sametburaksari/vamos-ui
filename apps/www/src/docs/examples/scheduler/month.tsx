"use client";

import * as React from "react";
import { Scheduler, type SchedulerEvent } from "@vamos-ui/react/scheduler";

const at = (day: string, time: string) => new Date(`${day}T${time}:00Z`).toISOString();

const events: SchedulerEvent[] = [
  { id: "a", title: "Web Summit Lisbon", start: "2026-11-09", end: "2026-11-12", allDay: true, tone: "chart-3" },
  { id: "b", title: "Ana · annual leave", start: "2026-11-11", end: "2026-11-18", allDay: true, tone: "neutral" },
  { id: "c", title: "Board meeting", start: at("2026-11-12", "09:00"), end: at("2026-11-12", "11:00"), tone: "chart-1" },
  { id: "d", title: "Payroll cut-off", start: "2026-11-12", end: "2026-11-12", allDay: true, tone: "warning" },
  { id: "e", title: "Investor update", start: at("2026-11-12", "16:00"), end: at("2026-11-12", "16:30"), tone: "chart-5" },
  { id: "f", title: "Hiring panel", start: at("2026-11-12", "13:00"), end: at("2026-11-12", "14:00"), tone: "chart-2" },
  { id: "g", title: "Black Friday campaign", start: "2026-11-27", end: "2026-11-30", allDay: true, tone: "danger" },
  { id: "h", title: "Product release 4.2", start: "2026-11-24", end: "2026-11-24", allDay: true, tone: "success" },
  { id: "i", title: "Team dinner", start: at("2026-11-19", "18:30"), end: at("2026-11-19", "21:00"), tone: "chart-4" },
  { id: "j", title: "Security audit", start: "2026-11-02", end: "2026-11-04", allDay: true, tone: "info" },
];

export default function SchedulerMonth() {
  return <Scheduler className="w-full" events={events} defaultDate="2026-11-10" defaultView="month" maxEventsPerDay={3} timeZone="UTC" />;
}
