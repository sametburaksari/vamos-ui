"use client";

import * as React from "react";
import { Calendar, type CalendarMarker } from "@vamos-ui/react";

// Support tickets closed per day (deterministic sample data).
function density(year: number): Record<string, CalendarMarker[]> {
  const out: Record<string, CalendarMarker[]> = {};
  for (let m = 0; m < 12; m++)
    for (let d = 1; d <= 28; d++) {
      const n = (d * 7 + m * 13) % 11;
      if (n < 5) continue;
      const iso = `${year}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const tone = n > 9 ? "danger" : n > 7 ? "warning" : "accent";
      out[iso] = [{ label: `${n * 6} tickets closed`, tone, count: n * 6 }];
    }
  return out;
}

export default function CalendarYear() {
  const markers = React.useMemo(() => density(2026), []);
  return (
    <div className="w-full">
      <Calendar
        months={12}
        mode="none"
        defaultMonth="2026-01"
        markers={markers}
        legend={[
          { label: "30–47 tickets", tone: "accent" },
          { label: "48–59", tone: "warning" },
          { label: "60+", tone: "danger" },
        ]}
      />
    </div>
  );
}
