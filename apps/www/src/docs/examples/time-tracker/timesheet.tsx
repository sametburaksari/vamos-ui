"use client";

import * as React from "react";
import { Timesheet } from "@vamos-cms/ui/scheduler";

const rows = [
  { id: "mobile", label: "Mobile app", meta: "Northwind · billable" },
  { id: "site", label: "Website relaunch", meta: "Lumen Spa · billable" },
  { id: "internal", label: "Internal", meta: "Hiring, admin" },
];

const initial = {
  mobile: { "2026-11-09": 240, "2026-11-10": 300, "2026-11-11": 150 },
  site: { "2026-11-09": 180, "2026-11-10": 90, "2026-11-12": 360 },
  internal: { "2026-11-09": 60, "2026-11-11": 45 },
};

/** Type 1.5, 1:30, 90m or 1h 30m into a cell. Enter saves and moves down. Totals under 8 h turn amber. */
export default function TimeTrackerTimesheet() {
  const [value, setValue] = React.useState<Record<string, Record<string, number>>>(initial);
  return (
    <Timesheet
      className="w-full"
      weekStart="2026-11-09"
      rows={rows}
      value={value}
      dailyTarget={8 * 60}
      onCellChange={(rowId, day, minutes) => setValue((v) => ({ ...v, [rowId]: { ...v[rowId], [day]: minutes } }))}
    />
  );
}
