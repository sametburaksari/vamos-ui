"use client";

import { TypingDemo, type TypingStep } from "@vamos-ui/react";

// A scripted rewrite: a hesitant draft is typed, held for a beat, then rewritten.
const steps: TypingStep[] = [
  "Hi all, I was sort of wondering if maybe we could possibly move the review",
  { type: "pause", duration: 900 },
  { type: "replace", text: "Can we move the review to Thursday at 10:00? I'll send the notes by Wednesday." },
];

export default function TypingDemoDemo() {
  return (
    <div className="w-full max-w-lg rounded-ui-lg border border-line bg-surface p-5">
      <p className="mb-3 text-xs font-medium tracking-[0.08em] text-fg-subtle uppercase">Rewrite</p>
      <TypingDemo steps={steps} textClassName="text-lg leading-snug text-fg" />
    </div>
  );
}
