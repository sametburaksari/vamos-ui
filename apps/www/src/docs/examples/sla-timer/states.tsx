"use client";

import { SlaTimer } from "@vamos-ui/react";

// A fixed `now` keeps the example identical in screenshots.
const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const at = (minutes: number) => NOW + minutes * 60_000;

const rows = [
  { label: "On track", props: { start: at(-30), due: at(210) } },
  { label: "At risk (under 25% left)", props: { start: at(-200), due: at(40) } },
  { label: "Breached", props: { due: at(-95) } },
  { label: "Paused (waiting on customer)", props: { start: at(-60), due: at(180), pausedAt: at(-20) } },
  { label: "Met", props: { due: at(30), completedAt: at(-10) } },
  { label: "Missed", props: { due: at(-60), completedAt: at(-12) } },
];

export default function SlaTimerStates() {
  return (
    <dl className="grid w-full max-w-sm gap-2.5 text-[13px]">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4">
          <dt className="text-fg-muted">{r.label}</dt>
          <dd>
            <SlaTimer now={NOW} label={r.label} {...r.props} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
