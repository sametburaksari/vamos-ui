"use client";

import * as React from "react";
import { UptimeBars, type UptimeBar } from "@vamos-ui/react";
import { history } from "./data";

const bars: UptimeBar[] = history(30, {
  2: { status: "major", uptime: 98.9, note: "1 incident" },
  11: { status: "degraded", uptime: 99.8, note: "1 incident" },
}).map((b) => ({
  ...b,
  selectable: b.status === "major" || b.status === "degraded",
  details: b.status === "major" ? "Login requests failed for 16 minutes." : b.status === "degraded" ? "File uploads were slow." : undefined,
}));

export default function UptimeBarsSelectable() {
  const [picked, setPicked] = React.useState<UptimeBar | null>(null);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <UptimeBars name="Sign-in" bars={bars} onBarSelect={(b) => setPicked(b)} />
      <p className="m-0 text-sm text-fg-muted" aria-live="polite">
        {picked ? `Opened the incident of ${picked.date}.` : "Days with an incident open it — try the red bar."}
      </p>
    </div>
  );
}
