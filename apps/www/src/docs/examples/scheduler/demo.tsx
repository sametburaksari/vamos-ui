"use client";

import * as React from "react";
import { Scheduler, type SchedulerEvent } from "@vamos-cms/ui/scheduler";

// Local wall-clock time in Istanbul (UTC+3) → UTC ISO instant.
const at = (day: string, time: string) => new Date(`${day}T${time}:00+03:00`).toISOString();

const initial: SchedulerEvent[] = [
  { id: "1", title: "Pipeline review", start: at("2026-11-09", "09:30"), end: at("2026-11-09", "10:30"), tone: "chart-1", location: "Room Bosphorus" },
  { id: "2", title: "Discovery call · Northwind", start: at("2026-11-09", "11:00"), end: at("2026-11-09", "11:45"), tone: "chart-2" },
  { id: "3", title: "Demo · Lumen Spa", start: at("2026-11-10", "10:00"), end: at("2026-11-10", "11:00"), tone: "chart-3", location: "Google Meet" },
  { id: "4", title: "Renewal: Atlas Logistics", start: at("2026-11-10", "10:30"), end: at("2026-11-10", "11:15"), tone: "chart-4", status: "tentative" },
  { id: "5", title: "Lunch with Defne", start: at("2026-11-10", "12:30"), end: at("2026-11-10", "13:30"), tone: "neutral" },
  { id: "6", title: "Proposal workshop", start: at("2026-11-11", "14:00"), end: at("2026-11-11", "16:30"), tone: "chart-1" },
  { id: "7", title: "Weekly forecast", start: at("2026-11-12", "09:00"), end: at("2026-11-12", "09:30"), tone: "chart-5" },
  { id: "8", title: "Contract signing · Kuzey Hotels", start: at("2026-11-12", "15:00"), end: at("2026-11-12", "16:00"), tone: "success" },
  { id: "9", title: "Sales kickoff", start: "2026-11-13", end: "2026-11-13", allDay: true, tone: "chart-2" },
  { id: "10", title: "Quarterly review (canceled)", start: at("2026-11-13", "11:00"), end: at("2026-11-13", "12:00"), status: "canceled" },
];

export default function SchedulerDemo() {
  const [events, setEvents] = React.useState(initial);
  return (
    <Scheduler
      className="w-full"
      events={events}
      defaultDate="2026-11-10"
      defaultView="week"
      timeZone="Europe/Istanbul"
      workCalendar={{ workDays: [1, 2, 3, 4, 5], businessHours: [{ start: "09:00", end: "18:00" }] }}
      height="30rem"
      onEventChange={(c) => setEvents((list) => list.map((e) => (e.id === c.id ? { ...e, start: c.start, end: c.end } : e)))}
      onCreate={(r) => setEvents((list) => [...list, { id: crypto.randomUUID(), title: "New meeting", ...r, tone: "accent" }])}
    />
  );
}
