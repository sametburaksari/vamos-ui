"use client";

import * as React from "react";
import { Calendar, type CalendarMarker } from "@vamos-ui/react";

// Editorial calendar: scheduled posts per day.
const scheduled: Record<string, CalendarMarker[]> = {
  "2026-11-03": [{ label: "Product update: Q4 roadmap", tone: "accent" }],
  "2026-11-05": [{ label: "Case study: Lumen Dental", tone: "accent" }, { label: "Newsletter #48", tone: "info" }],
  "2026-11-12": [{ label: "Black Friday teaser", tone: "warning" }],
  "2026-11-17": [{ label: "Hiring: Senior designer", tone: "success" }],
  "2026-11-24": [{ label: "Black Friday launch", tone: "warning" }, { label: "Landing page refresh", tone: "accent" }, { label: "Newsletter #49", tone: "info" }],
  "2026-11-27": [{ label: "Cyber Monday reminder", tone: "danger" }],
};

export default function CalendarDemo() {
  const [day, setDay] = React.useState<string | null>("2026-11-24");
  const posts = day ? (scheduled[day] ?? []) : [];
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-[auto_1fr]">
      <Calendar
        variant="card"
        defaultMonth="2026-11"
        value={day}
        onValueChange={setDay}
        markers={scheduled}
        legend={[
          { label: "Article", tone: "accent" },
          { label: "Newsletter", tone: "info" },
          { label: "Campaign", tone: "warning" },
        ]}
      />
      <div className="grid content-start gap-2">
        <h4 className="text-[13px] font-semibold text-fg">{posts.length ? `${posts.length} scheduled` : "Nothing scheduled"}</h4>
        <ul className="grid gap-1.5">
          {posts.map((p) => (
            <li key={p.label} className="rounded-ui border border-line bg-surface-2 px-3 py-2 text-[13px] text-fg">
              {p.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
