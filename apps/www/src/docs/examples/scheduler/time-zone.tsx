"use client";

import * as React from "react";
import { Scheduler, type SchedulerEvent } from "@vamos-cms/ui/scheduler";

// Stored once, in UTC. Each scheduler shows them in its own explicit zone.
const events: SchedulerEvent[] = [
  { id: "1", title: "Partner sync · Istanbul × New York", start: "2026-11-10T14:00:00Z", end: "2026-11-10T15:00:00Z", tone: "chart-1" },
  { id: "2", title: "Enablement session", start: "2026-11-10T17:30:00Z", end: "2026-11-10T19:00:00Z", tone: "chart-3" },
];

export default function SchedulerTimeZone() {
  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {["Europe/Istanbul", "America/New_York"].map((tz) => (
        <div key={tz} className="grid gap-1.5">
          <p className="text-[12px] font-medium text-fg-muted">{tz}</p>
          <Scheduler events={events} defaultDate="2026-11-10" defaultView="day" views={["day"]} timeZone={tz} scrollToTime="08:00" height="20rem" />
        </div>
      ))}
    </div>
  );
}
