"use client";

import * as React from "react";
import { DateRangePicker, Stat, type IsoDateRange } from "@vamos-ui/react";

export default function DateRangePickerApply() {
  const [range, setRange] = React.useState<IsoDateRange | null>({ from: "2026-10-01", to: "2026-10-31" });
  const [queries, setQueries] = React.useState(1);
  return (
    <div className="grid w-full max-w-lg gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-fg">Revenue by channel</h4>
        <DateRangePicker
          size="sm"
          aria-label="Report period"
          presets
          commit="apply"
          value={range}
          onValueChange={(r) => {
            setRange(r);
            setQueries((n) => n + 1);
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Gross revenue" value="$84,210" />
        <Stat label="Report queries run" value={String(queries)} />
      </div>
    </div>
  );
}
