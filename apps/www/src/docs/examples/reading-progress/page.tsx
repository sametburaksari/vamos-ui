"use client";

import { ReadingProgress } from "@vamos-ui/react";

// No target: progress through the whole page. On a real site use position="top" (the default),
// which pins the bar to the top of the window; inline here so it stays inside the preview.
export default function ReadingProgressPage() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <ReadingProgress position="inline" labels={{ label: "Page progress" }} />
      <p className="m-0 text-xs text-fg-subtle">Scroll this documentation page to move the bar.</p>
    </div>
  );
}
