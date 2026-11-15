"use client";

import { UptimeBars, UptimeLegend } from "@vamos-ui/react";
import { history } from "./data";

const services = [
  { name: "Public API", bars: history(60, { 3: { status: "major", uptime: 98.4, note: "Elevated error rates, 23 min" }, 41: { status: "degraded", uptime: 99.7, note: "Slow responses in one region" } }) },
  { name: "Webhooks", bars: history(60, { 0: { status: "degraded", uptime: 99.6, note: "Delayed deliveries" }, 17: { status: "maintenance", note: "Queue upgrade, 02:00–03:00" } }) },
  { name: "Dashboard", bars: history(60, { 29: { status: "partial", uptime: 99.1, note: "Search unavailable" } }, 44) },
];

export default function UptimeBarsDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-4 rounded-ui-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="m-0 text-sm font-semibold text-fg">Last 60 days</p>
        <UptimeLegend statuses={["operational", "degraded", "partial", "major", "maintenance", "none"]} />
      </div>
      <ul className="m-0 grid list-none gap-5 p-0">
        {services.map((s) => (
          <li key={s.name} className="grid gap-2">
            <span className="text-sm font-medium text-fg">{s.name}</span>
            <UptimeBars name={s.name} bars={s.bars} />
          </li>
        ))}
      </ul>
    </div>
  );
}
