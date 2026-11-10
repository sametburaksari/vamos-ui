"use client";

import * as React from "react";
import { Calendar, rangeLength, type CalendarMarker, type IsoDateRange } from "@vamos-ui/react";

// Time-off request: the team's existing absences under each day.
const absences: Record<string, CalendarMarker[]> = {
  "2026-12-14": [{ label: "Ayşe Kaya — annual leave", tone: "info" }],
  "2026-12-15": [{ label: "Ayşe Kaya — annual leave", tone: "info" }],
  "2026-12-16": [{ label: "Ayşe Kaya — annual leave", tone: "info" }, { label: "Marco Rossi — sick leave", tone: "danger" }],
  "2026-12-22": [{ label: "Daniel Park — annual leave", tone: "info" }],
  "2026-12-23": [{ label: "Daniel Park — annual leave", tone: "info" }, { label: "Elif Demir — parental leave", tone: "warning" }],
  "2026-12-24": [{ label: "Daniel Park — annual leave", tone: "info" }, { label: "Elif Demir — parental leave", tone: "warning" }],
  "2026-12-28": [{ label: "Elif Demir — parental leave", tone: "warning" }],
};

export default function CalendarRangeWithAbsences() {
  const [request, setRequest] = React.useState<IsoDateRange | null>({ from: "2026-12-21", to: "2026-12-24" });
  return (
    <div className="grid w-full gap-3">
      <Calendar
        mode="range"
        months={2}
        variant="card"
        defaultMonth="2026-12"
        value={request}
        onValueChange={setRequest}
        markers={absences}
        legend={[
          { label: "Annual leave", tone: "info" },
          { label: "Sick leave", tone: "danger" },
          { label: "Parental leave", tone: "warning" },
        ]}
      />
      <p className="text-[13px] text-fg-muted">
        {request?.to ? (
          <>
            Requesting <span className="font-medium text-fg tabular">{rangeLength(request)} days</span> · 2 teammates are already out on Dec 23–24.
          </>
        ) : (
          "Pick the last day of your leave."
        )}
      </p>
    </div>
  );
}
