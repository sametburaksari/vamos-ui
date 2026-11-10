"use client";

import { BlockEditor } from "@vamos-cms/ui/editor";

const sample = `## Spring opening hours

We now open **an hour earlier** on weekdays.

- Monday to Friday: 08:00–19:00
- Saturday: 09:00–14:00

> Bookings made before 1 March keep their time.`;

// Paste Markdown (or a Word / Google Docs selection): it becomes real blocks, not raw text.
export default function PasteConversion() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="rounded-ui border border-line bg-surface-2 p-3">
        <p className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-subtle">Copy this, then paste below</p>
        <pre className="whitespace-pre-wrap font-mono text-xs text-fg-muted">{sample}</pre>
      </div>
      <div className="overflow-hidden rounded-ui-lg border border-line">
        <BlockEditor variant="document" aria-label="Announcement" placeholder="Paste here, or type / to add a block" />
      </div>
    </div>
  );
}
