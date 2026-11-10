"use client";

import * as React from "react";
import { Switch, StatusPicker, toast, Toaster, type StatusDef } from "@vamos-cms/ui";

const stages: StatusDef[] = [
  { value: "lead", label: "Lead", category: "todo", color: "oklch(0.62 0.03 250)" },
  { value: "qualified", label: "Qualified", category: "active", color: "oklch(0.62 0.14 240)" },
  { value: "proposal", label: "Proposal sent", category: "active", color: "oklch(0.68 0.15 75)" },
  { value: "negotiation", label: "Negotiation", category: "active", color: "oklch(0.62 0.17 300)" },
  { value: "won", label: "Won", category: "done", color: "oklch(0.64 0.15 150)" },
  { value: "lost", label: "Lost", category: "cancelled", color: "oklch(0.6 0.16 25)" },
];

export default function StatusPickerAsync() {
  const [stage, setStage] = React.useState("proposal");
  const [failNext, setFailNext] = React.useState(true);

  return (
    <div className="grid w-full max-w-md gap-4">
      {/* One Toaster near the app root (App shell already has it). */}
      <Toaster />
      <div className="flex items-center justify-between gap-4 rounded-ui border border-line bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-medium">Fjord Freight · Fleet tracking</p>
          <p className="text-xs tabular text-fg-muted">$48,000 ARR · closes Dec 15</p>
        </div>
        <StatusPicker
          statuses={stages}
          fieldLabel="Stage"
          value={stage}
          onValueChange={async (next) => {
            await new Promise((r) => setTimeout(r, 900)); // PATCH /deals/DL-2231
            if (failNext) throw new Error("Deal was updated by someone else");
            setStage(next);
          }}
          onError={(error) => toast.danger("Stage not saved", { description: error instanceof Error ? error.message : undefined })}
        />
      </div>
      <Switch label="Make the next save fail" checked={failNext} onCheckedChange={setFailNext} />
    </div>
  );
}
