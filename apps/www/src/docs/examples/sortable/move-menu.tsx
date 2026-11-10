"use client";

import * as React from "react";
import { SortableList } from "@vamos-cms/ui/sortable";

interface Stage {
  id: string;
  name: string;
  probability: number;
  tone: string;
}

const initial: Stage[] = [
  { id: "lead", name: "New lead", probability: 10, tone: "var(--chart-1)" },
  { id: "qualified", name: "Qualified", probability: 25, tone: "var(--chart-2)" },
  { id: "demo", name: "Demo booked", probability: 40, tone: "var(--chart-3)" },
  { id: "proposal", name: "Proposal sent", probability: 60, tone: "var(--chart-4)" },
  { id: "negotiation", name: "Negotiation", probability: 80, tone: "var(--chart-5)" },
];

export default function SortableMoveMenuExample() {
  const [stages, setStages] = React.useState(initial);
  return (
    <div className="w-full max-w-md">
      <h3 id="pipeline-stages" className="mb-1 text-sm font-semibold">
        Pipeline stages
      </h3>
      <p className="mb-2.5 text-xs text-fg-muted">Every row has a Move menu, so reordering never requires dragging.</p>
      <SortableList
        aria-labelledby="pipeline-stages"
        items={stages}
        getLabel={(s) => s.name}
        onReorder={setStages}
        renderItem={(s) => (
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.tone }} />
            <span className="font-medium">{s.name}</span>
            <span className="tabular ms-auto text-xs text-fg-muted">{s.probability}% win rate</span>
          </div>
        )}
      />
    </div>
  );
}
