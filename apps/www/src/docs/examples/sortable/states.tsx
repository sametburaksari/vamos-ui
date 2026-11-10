"use client";

import * as React from "react";
import { ListOrdered } from "lucide-react";
import { Button, EmptyState } from "@vamos-cms/ui";
import { SortableList } from "@vamos-cms/ui/sortable";

interface Step {
  id: string;
  title: string;
  owner: string;
  required?: boolean;
}

const steps: Step[] = [
  { id: "contract", title: "Sign employment contract", owner: "HR", required: true },
  { id: "laptop", title: "Collect laptop and badge", owner: "IT" },
  { id: "buddy", title: "Meet your onboarding buddy", owner: "Team lead" },
  { id: "security", title: "Complete security training", owner: "IT", required: true },
];

export default function SortableStates() {
  const [items, setItems] = React.useState(steps);
  const [empty, setEmpty] = React.useState<Step[]>([]);
  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <div className="min-w-0">
        <h3 id="onboarding-steps" className="mb-2 text-sm font-semibold">
          Onboarding steps
        </h3>
        <SortableList
          aria-labelledby="onboarding-steps"
          items={items}
          getLabel={(s) => s.title}
          disabled={(s) => !!s.required}
          onReorder={setItems}
          renderItem={(s, { disabled }) => (
            <div className="min-w-0">
              <span className="block truncate">{s.title}</span>
              <span className="text-xs text-fg-muted">
                {s.owner}
                {disabled && " · Required, fixed position"}
              </span>
            </div>
          )}
        />
      </div>
      <div className="min-w-0">
        <h3 id="custom-steps" className="mb-2 text-sm font-semibold">
          Custom steps
        </h3>
        <SortableList
          aria-labelledby="custom-steps"
          items={empty}
          getLabel={(s) => s.title}
          onReorder={setEmpty}
          renderItem={(s) => s.title}
          empty={
            <EmptyState
              size="sm"
              icon={<ListOrdered />}
              title="No custom steps"
              description="Add steps that only apply to this department."
              framed
              actions={
                <Button size="sm" onClick={() => setEmpty([{ id: "welcome", title: "Team welcome lunch", owner: "Team lead" }])}>
                  Add step
                </Button>
              }
            />
          }
        />
      </div>
    </div>
  );
}
