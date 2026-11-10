"use client";

import * as React from "react";
import { Funnel, type FunnelStep } from "@vamos-cms/ui/charts";

const hiring: FunnelStep[] = [
  { key: "applied", label: "Applied", value: 486 },
  { key: "screen", label: "Phone screen", value: 142 },
  { key: "interview", label: "Interview", value: 61 },
  { key: "offer", label: "Offer", value: 14 },
  { key: "hired", label: "Hired", value: 11 },
];

export default function FunnelVertical() {
  const [stage, setStage] = React.useState<FunnelStep | null>(null);
  return (
    <div className="grid w-full max-w-md gap-3">
      <Funnel title="Senior Product Designer — candidates" steps={hiring} orientation="vertical" size="sm" color="chart-5" onStepClick={setStage} />
      <p className="text-[12.5px] text-fg-muted">{stage ? `Showing ${stage.value} candidates in “${stage.label}”.` : "Pick a stage to filter the candidate list."}</p>
    </div>
  );
}
