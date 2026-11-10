"use client";

import * as React from "react";
import { Select } from "@vamos-cms/ui";

const owners = [
  { value: "leyla", label: "Leyla Aksoy" },
  { value: "daniel", label: "Daniel Okafor" },
  { value: "mina", label: "Mina Kurt" },
  { value: "unassigned", label: "Unassigned" },
];

export default function SelectClearable() {
  const [owner, setOwner] = React.useState<string | null>("daniel");
  const [stage, setStage] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-44">
          <Select aria-label="Owner" variant="pill" size="sm" placeholder="Any owner" clearable items={owners} value={owner} onValueChange={setOwner} />
        </div>
        <div className="w-40">
          <Select
            aria-label="Stage"
            variant="pill"
            size="sm"
            placeholder="Any stage"
            clearable
            value={stage}
            onValueChange={setStage}
            items={[
              { value: "lead", label: "Lead" },
              { value: "qualified", label: "Qualified" },
              { value: "proposal", label: "Proposal" },
              { value: "won", label: "Won" },
              { value: "lost", label: "Lost" },
            ]}
          />
        </div>
      </div>
      <p className="text-xs text-fg-subtle tabular">
        Filter: owner = {owner ?? "any"}, stage = {stage ?? "any"}
      </p>
    </div>
  );
}
