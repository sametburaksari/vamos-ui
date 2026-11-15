"use client";

import * as React from "react";
import { ReadingProgress } from "@vamos-ui/react";

const paragraphs = [
  "The first draft of a field guide is always too long. Every observation feels essential while you are standing in the marsh with wet boots and a notebook.",
  "Editing is where the guide becomes useful. You keep the details that help someone recognise a heron at a distance, and drop the ones that only remind you of the morning.",
  "A good entry answers three questions quickly: what it looks like, where you will find it, and what it is easily confused with.",
  "Photographs help, but a short sentence about posture or movement often does more. Birds are identified by behaviour as much as by colour.",
  "The last pass is for rhythm. Entries that read the same way are easier to scan, so the reader's eye always knows where to look next.",
];

// Scroll the page: the bar follows the article, with minutes left in its announced value.
export default function ReadingProgressDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div className="w-full max-w-xl rounded-ui-lg border border-line bg-surface">
      <div className="sticky top-0 z-10 rounded-t-ui-lg bg-surface px-5 pt-4 pb-3">
        <p className="mb-2 text-sm font-medium text-fg">Writing a field guide</p>
        <ReadingProgress target={ref} minutes={4} position="inline" offset={0.5} />
      </div>
      <div ref={ref} className="flex flex-col gap-4 px-5 pb-6 text-fg-muted">
        {paragraphs.map((p) => (
          <p key={p} className="m-0 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
