"use client";

import * as React from "react";
import { Badge, Countdown } from "@vamos-ui/react";

/** Compact text in a banner; a short target so you can watch it complete. */
export default function CountdownInline() {
  const [to, setTo] = React.useState(() => Date.now() + 12_000);
  const [ended, setEnded] = React.useState(0);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-ui border border-line bg-surface px-4 py-3 text-small">
      <span className="font-medium text-fg">Early-bird price ends in</span>
      <Countdown
        variant="inline"
        units={["hours", "minutes", "seconds"]}
        to={to}
        label="Early-bird price"
        onComplete={() => setEnded((n) => n + 1)}
        completed={<Badge>Ended</Badge>}
      />
      <button type="button" className="focus-ring ms-auto rounded-ui-sm text-fg-muted underline underline-offset-4" onClick={() => setTo(Date.now() + 12_000)}>
        Restart
      </button>
      <span className="sr-only" aria-live="polite">
        {ended ? "The early-bird price has ended." : ""}
      </span>
    </div>
  );
}
