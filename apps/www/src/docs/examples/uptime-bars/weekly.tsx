"use client";

import { UptimeBars, type UptimeBar } from "@vamos-ui/react";

const uptimes = [100, 100, 99.92, 100, 100, 99.4, 100, 100, 100, 99.98, 100, 100];
const bars: UptimeBar[] = uptimes.map((u, i) => ({
  date: new Date(Date.UTC(2026, 7, 24) + i * 7 * 86_400_000).toISOString().slice(0, 10),
  label: `Week ${35 + i}`,
  status: u === 100 ? "operational" : u < 99.5 ? "partial" : "degraded",
  uptime: u,
}));

export default function UptimeBarsWeekly() {
  return (
    <div className="w-full max-w-md">
      <UptimeBars name="File storage" bars={bars} precision={3} startLabel="12 weeks ago" endLabel="This week" />
    </div>
  );
}
