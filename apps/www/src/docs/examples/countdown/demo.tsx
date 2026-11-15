"use client";

import * as React from "react";
import { Countdown } from "@vamos-ui/react";

export default function CountdownDemo() {
  // Three days and a bit from whenever the page opens.
  const [to] = React.useState(() => Date.now() + ((3 * 24 + 5) * 3600 + 17 * 60) * 1000);
  return (
    <div className="w-full max-w-md">
      <p className="mb-2 text-small text-fg-muted">Registration opens in</p>
      <Countdown to={to} label="Registration opens" highlightLast />
    </div>
  );
}
