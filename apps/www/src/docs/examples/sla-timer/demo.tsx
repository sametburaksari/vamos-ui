"use client";

import { SlaTimer } from "@vamos-ui/react";

// Live: the clock started 40 minutes ago and the first reply is due in 20.
const start = Date.now() - 40 * 60_000;
const due = Date.now() + 20 * 60_000;

export default function SlaTimerDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <SlaTimer label="First response" start={start} due={due} />
      <SlaTimer label="First response" start={start} due={due} variant="inline" />
    </div>
  );
}
