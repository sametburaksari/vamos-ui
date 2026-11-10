"use client";

import * as React from "react";
import { TimeEntryList, TimerButton, createLocalTimerAdapter, type TimeEntry } from "@vamos-ui/react/scheduler";

const projects = [
  { id: "mobile", label: "Mobile app", meta: "Northwind" },
  { id: "site", label: "Website relaunch", meta: "Lumen Spa" },
  { id: "support", label: "Partner support", meta: "Atlas Logistics" },
];

const earlier: TimeEntry[] = [
  { id: "e1", start: "2026-11-10T06:30:00Z", end: "2026-11-10T08:10:00Z", projectId: "mobile", projectLabel: "Mobile app", note: "Checkout flow review", billable: true },
  { id: "e2", start: "2026-11-09T12:00:00Z", end: "2026-11-09T13:15:00Z", projectId: "site", projectLabel: "Website relaunch", note: "Booking widget QA", billable: true },
  { id: "e3", start: "2026-11-09T08:00:00Z", end: "2026-11-09T08:45:00Z", projectId: "support", projectLabel: "Partner support", note: "Weekly call" },
];

export default function TimeTrackerTimer() {
  const [entries, setEntries] = React.useState(earlier);
  // One timer for all tabs: open this page twice and start it in one.
  const adapter = React.useMemo(() => createLocalTimerAdapter({ key: "vamos-docs:timer", onStop: (e) => setEntries((l) => [e, ...l]) }), []);
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <div className="flex items-center justify-between gap-3 rounded-ui-lg border border-line bg-surface-2 px-3 py-2">
        <span className="text-[13px] font-medium text-fg">Top bar</span>
        <TimerButton adapter={adapter} projects={projects} defaultProjectId="mobile" />
      </div>
      <div className="surface rounded-ui-lg p-4">
        <TimerButton variant="full" adapter={adapter} projects={projects} defaultProjectId="mobile" />
      </div>
      <div className="surface rounded-ui-lg">
        <TimeEntryList entries={entries} />
      </div>
    </div>
  );
}
