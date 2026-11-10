"use client";

import * as React from "react";
import { SortableList } from "@vamos-cms/ui/sortable";

const initial = [
  { id: "mine", label: "My open deals", count: 18 },
  { id: "closing", label: "Closing this month", count: 7 },
  { id: "stalled", label: "No activity 14 days", count: 5 },
  { id: "enterprise", label: "Enterprise", count: 11 },
];

export default function SortableHorizontal() {
  const [views, setViews] = React.useState(initial);
  return (
    <SortableList
      aria-label="Saved views"
      orientation="horizontal"
      size="sm"
      items={views}
      onReorder={setViews}
      renderItem={(v) => (
        <span className="flex items-center gap-2 whitespace-nowrap pe-0.5 text-[13px]">
          {v.label}
          <span className="tabular rounded-full bg-surface-2 px-1.5 text-[11px] text-fg-muted">{v.count}</span>
        </span>
      )}
    />
  );
}
