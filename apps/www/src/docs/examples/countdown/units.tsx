"use client";

import { Countdown } from "@vamos-ui/react";

const NOW = Date.parse("2026-11-18T10:00:00Z");

/** A fixed `now` for screenshots and tests; units and caption style are configurable. */
export default function CountdownUnits() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <Countdown now={NOW} to="2026-11-20T14:30:00Z" units={["days", "hours", "minutes"]} label="Maintenance window" />
      <Countdown now={NOW} to="2026-11-20T14:30:00Z" units={["hours", "minutes"]} unitDisplay="short" label="Maintenance window" />
    </div>
  );
}
