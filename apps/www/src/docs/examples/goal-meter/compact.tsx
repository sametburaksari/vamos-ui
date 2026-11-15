"use client";

import { GoalMeter } from "@vamos-ui/react";

export default function GoalMeterCompact() {
  return (
    <div className="grid w-full max-w-sm gap-6">
      <GoalMeter size="compact" value={38} goal={50} format="number" label="Pre-orders until production starts" backers={38} labels={{ backers: "{count, plural, one {# order} other {# orders}}", of: "of {goal} needed", valueText: "{value} of {goal} pre-orders, {percent}" }} />
      <GoalMeter size="compact" value={268} goal={250} format={(n) => `${n} members`} label="Membership drive" deadline="2026-03-01" now="2026-03-04" />
    </div>
  );
}
