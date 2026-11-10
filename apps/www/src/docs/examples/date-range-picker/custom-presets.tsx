"use client";

import * as React from "react";
import { DateRangePicker, type DateRangePreset, type IsoDateRange } from "@vamos-cms/ui";

// Fiscal year starting in April (FY2026 = Apr 2026 – Mar 2027).
const fiscalQuarters: DateRangePreset[] = [
  { id: "q1", label: "Q1 FY26 (Apr–Jun)", range: () => ({ from: "2026-04-01", to: "2026-06-30" }) },
  { id: "q2", label: "Q2 FY26 (Jul–Sep)", range: () => ({ from: "2026-07-01", to: "2026-09-30" }) },
  { id: "q3", label: "Q3 FY26 (Oct–Dec)", range: () => ({ from: "2026-10-01", to: "2026-12-31" }) },
  { id: "q4", label: "Q4 FY26 (Jan–Mar)", range: () => ({ from: "2027-01-01", to: "2027-03-31" }) },
  { id: "fy", label: "Full FY26", range: () => ({ from: "2026-04-01", to: "2027-03-31" }) },
];

export default function DateRangePickerCustomPresets() {
  const [range, setRange] = React.useState<IsoDateRange | null>({ from: "2026-07-01", to: "2026-09-30" });
  return <DateRangePicker aria-label="Fiscal period" presets={fiscalQuarters} value={range} onValueChange={setRange} />;
}
