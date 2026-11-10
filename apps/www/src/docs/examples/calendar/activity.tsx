"use client";

import * as React from "react";
import { Calendar, type CalendarMarker } from "@vamos-ui/react";

// CRM: a month of activity on one account, in large cells.
const activity: Record<string, CalendarMarker[]> = {
  "2026-11-02": [{ label: "Discovery call", tone: "accent" }],
  "2026-11-04": [{ label: "Proposal sent · $48k", tone: "success" }],
  "2026-11-09": [{ label: "Security review", tone: "info" }, { label: "Follow-up email", tone: "neutral" }],
  "2026-11-11": [{ label: "Pricing objection", tone: "warning" }],
  "2026-11-16": [{ label: "Exec sponsor demo", tone: "accent" }, { label: "Legal redlines", tone: "info" }, { label: "Champion check-in", tone: "neutral" }],
  "2026-11-19": [{ label: "Contract signed", tone: "success" }],
  "2026-11-25": [{ label: "Kickoff", tone: "accent" }],
};

export default function CalendarActivity() {
  const [day, setDay] = React.useState<string | null>(null);
  return (
    <div className="w-full">
      <Calendar size="lg" defaultMonth="2026-11" value={day} onValueChange={setDay} markers={activity} headerAction={<span className="text-xs text-fg-muted">Northwind Logistics · 10 activities</span>} />
    </div>
  );
}
