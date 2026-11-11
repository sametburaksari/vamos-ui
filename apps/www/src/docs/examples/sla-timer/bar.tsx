"use client";

import { SlaTimer } from "@vamos-ui/react";

const NOW = Date.parse("2026-11-18T10:24:00+03:00");
const at = (minutes: number) => NOW + minutes * 60_000;

export default function SlaTimerBar() {
  return (
    <div className="grid w-full max-w-xs gap-4 rounded-ui-lg border border-line bg-surface p-4">
      <p className="text-[11px] font-medium tracking-[0.08em] text-fg-subtle uppercase">SLA · Urgent</p>
      <SlaTimer variant="bar" now={NOW} label="First response" start={at(-38)} due={at(-8)} completedAt={at(-26)} />
      <SlaTimer variant="bar" now={NOW} label="Resolution" start={at(-38)} due={at(202)} />
      <SlaTimer variant="bar" now={NOW} label="Next update" start={at(-38)} due={at(7)} />
    </div>
  );
}
