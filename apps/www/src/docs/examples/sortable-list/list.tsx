"use client";

import * as React from "react";
import { Badge } from "@vamos-ui/react";
import { SortableList } from "@vamos-ui/react/sortable";

interface Step {
  id: string;
  title: string;
  owner: string;
  day: string;
  required?: boolean;
}

const initial: Step[] = [
  { id: "contract", title: "Sign employment contract", owner: "People team", day: "Before day 1", required: true },
  { id: "laptop", title: "Laptop and accounts ready", owner: "IT", day: "Day 1" },
  { id: "buddy", title: "Meet your onboarding buddy", owner: "Manager", day: "Day 1" },
  { id: "security", title: "Security awareness training", owner: "IT", day: "Week 1" },
  { id: "goals", title: "Set 30/60/90-day goals", owner: "Manager", day: "Week 2" },
  { id: "review", title: "Probation check-in", owner: "Manager", day: "Month 3", required: true },
];

export default function SortableListExample() {
  const [steps, setSteps] = React.useState(initial);
  return (
    <div className="w-full max-w-lg">
      <h3 id="onboarding-steps" className="mb-2 text-sm font-semibold">
        Onboarding checklist — Engineering
      </h3>
      <SortableList
        aria-labelledby="onboarding-steps"
        variant="inset"
        items={steps}
        getLabel={(s) => s.title}
        disabled={(s) => !!s.required}
        onReorder={setSteps}
        renderItem={(s, { index }) => (
          <div className="flex min-w-0 items-center gap-3">
            <span className="tabular w-5 shrink-0 text-end text-xs text-fg-subtle">{index + 1}</span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{s.title}</span>
              <span className="truncate text-xs text-fg-muted">
                {s.owner} · {s.day}
              </span>
            </span>
            {s.required ? <Badge className="ms-auto">Fixed</Badge> : null}
          </div>
        )}
      />
    </div>
  );
}
