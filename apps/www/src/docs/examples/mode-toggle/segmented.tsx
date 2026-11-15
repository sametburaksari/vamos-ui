"use client";

import * as React from "react";
import { ModeToggle } from "@vamos-ui/react";

// Three modes with names; "system" follows the OS setting live.
export default function ModeToggleSegmented() {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="grid w-full max-w-sm gap-3 rounded-ui-lg border border-line bg-surface p-4 text-fg">
      <span className="text-sm text-fg-muted">Appearance</span>
      <ModeToggle variant="segmented" modes={["light", "dark", "system"]} defaultValue="system" showLabel target={() => ref.current} />
    </div>
  );
}
