"use client";

import { GoalMeter } from "@vamos-ui/react";

export default function GoalMeterDemo() {
  return (
    <div className="w-full max-w-md rounded-ui-lg border border-line p-5">
      <GoalMeter
        label="Reading rooms for every district"
        value={182400}
        goal={250000}
        backers={612}
        deadline="2026-12-31"
        footer="Every gift is itemised in the yearly report."
      />
    </div>
  );
}
