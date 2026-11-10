"use client";

import * as React from "react";
import { Toaster } from "@vamos-ui/react";
import { Scheduler, type SchedulerEvent } from "@vamos-ui/react/scheduler";

const at = (day: string, time: string) => new Date(`${day}T${time}:00Z`).toISOString();

const initial: SchedulerEvent[] = [
  { id: "1", title: "Interview · Mert Aksoy", start: at("2026-11-10", "10:00"), end: at("2026-11-10", "11:00"), tone: "chart-2" },
  { id: "2", title: "Interview · Priya Nair", start: at("2026-11-11", "14:00"), end: at("2026-11-11", "15:00"), tone: "chart-2" },
  { id: "3", title: "Debrief (locked)", start: at("2026-11-12", "16:00"), end: at("2026-11-12", "16:30"), tone: "neutral", editable: false },
];

// A fake API that refuses anything after 17:00 so you can see the rollback.
async function save(change: { start: string }) {
  await new Promise((r) => setTimeout(r, 500));
  if (new Date(change.start).getUTCHours() >= 17) throw new Error("Outside interview hours");
}

export default function SchedulerDrag() {
  const [events, setEvents] = React.useState(initial);
  return (
    <div className="grid w-full gap-2">
      <p className="text-[13px] text-fg-muted">
        Drag on empty time to create, drag an event to move it, pull its bottom edge to resize. Keyboard: Alt + ↑/↓ moves by 15 min, Alt + Shift + ↑/↓ resizes, Alt + ←/→ changes the day. Right-click for “Change time…”.
      </p>
      <Scheduler
        events={events}
        defaultDate="2026-11-10"
        defaultView="week"
        views={["day", "week"]}
        timeZone="UTC"
        snapMinutes={15}
        height="26rem"
        scrollToTime="09:00"
        onCreate={(r) => setEvents((l) => [...l, { id: crypto.randomUUID(), title: "Interview slot", ...r, tone: "accent" }])}
        onEventChange={async (c) => {
          await save(c);
          setEvents((l) => l.map((e) => (e.id === c.id ? { ...e, start: c.start, end: c.end } : e)));
        }}
      />
      <Toaster />
    </div>
  );
}
