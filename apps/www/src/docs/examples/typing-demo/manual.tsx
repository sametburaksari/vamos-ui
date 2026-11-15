"use client";

import { TypingDemo } from "@vamos-ui/react";

// autoPlay={false}: the final text shows until the reader presses Replay.
export default function TypingDemoManual() {
  return (
    <TypingDemo
      autoPlay={false}
      as="pre"
      className="w-full max-w-md rounded-ui border border-line bg-surface-2 p-4"
      textClassName="font-mono text-sm text-fg"
      steps={["npm install @vamos-ui/react", { type: "pause", duration: 500 }, { type: "set", text: "npm install @vamos-ui/react\n+ added 1 package" }]}
    />
  );
}
