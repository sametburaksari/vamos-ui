"use client";

import { TypingDemo } from "@vamos-ui/react";

// A looping hero line. Keep the pause control (WCAG 2.2.2) whenever it loops.
export default function TypingDemoLoop() {
  return (
    <div className="flex w-full max-w-lg items-baseline gap-2 text-2xl font-semibold text-fg">
      <span className="shrink-0">Plan your</span>
      <TypingDemo
        loop
        speed={55}
        className="min-w-0 flex-1"
        as="span"
        textClassName="text-accent-ink"
        steps={[
          "week",
          { type: "pause", duration: 1200 },
          { type: "replace", text: "launch" },
          { type: "pause", duration: 1200 },
          { type: "replace", text: "next trip" },
        ]}
      />
    </div>
  );
}
