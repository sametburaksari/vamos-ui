"use client";

import * as React from "react";
import { ModeToggle } from "@vamos-ui/react";

// The target here is the preview card, so the docs page keeps its own theme. On a site, omit
// `target` and the toggle switches the whole document.
export default function ModeToggleDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="flex w-full max-w-xs items-center justify-between rounded-ui-lg border border-line bg-surface p-4 text-fg">
      <span className="text-sm font-medium">Field notes</span>
      <ModeToggle target={() => ref.current} />
    </div>
  );
}
