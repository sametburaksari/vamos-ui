"use client";

import * as React from "react";
import { DateRangePicker, rangeLength, type IsoDateRange } from "@vamos-cms/ui";

export default function DateRangePickerDemo() {
  const [range, setRange] = React.useState<IsoDateRange | null>({ from: "2026-11-01", to: "2026-11-10" });
  return (
    <div className="grid justify-items-start gap-3">
      <DateRangePicker aria-label="Report period" presets value={range} onValueChange={setRange} clearable />
      <p className="font-mono text-xs text-fg-subtle">
        {range ? `${range.from} → ${range.to ?? "…"} (${rangeLength(range)} days)` : "null"}
      </p>
    </div>
  );
}
