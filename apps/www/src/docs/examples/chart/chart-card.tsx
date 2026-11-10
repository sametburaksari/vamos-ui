"use client";

import * as React from "react";
import { Button, Card, CardBody, CardHeader } from "@vamos-cms/ui";
import { AreaChart, type ChartConfig } from "@vamos-cms/ui/charts";

const ranges = { "7D": 7, "30D": 30, "90D": 90 } as const;
type Range = keyof typeof ranges;

// Pipeline value per day; generated here, fetched in your app.
const all = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 7, 12 + i));
  const iso = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return { date: iso, pipeline: Math.round(410_000 + i * 2_900 + Math.sin(i / 5) * 38_000), won: Math.round(120_000 + i * 1_400 + Math.cos(i / 6) * 21_000) };
});

const config = {
  pipeline: { label: "Open pipeline", format: "currency" },
  won: { label: "Closed won", format: "currency" },
} satisfies ChartConfig;

export default function ChartCard() {
  const [range, setRange] = React.useState<Range>("30D");
  const data = all.slice(-ranges[range]);
  return (
    <Card className="w-full">
      <CardHeader
        eyebrow="CRM · Sales"
        title="Pipeline value"
        description="Open and closed-won deals, daily"
        action={
          <div role="group" aria-label="Range" className="flex rounded-ui-sm border border-line p-0.5">
            {(Object.keys(ranges) as Range[]).map((r) => (
              <Button key={r} size="xs" variant={r === range ? "soft" : "ghost"} aria-pressed={r === range} onClick={() => setRange(r)}>
                {r}
              </Button>
            ))}
          </div>
        }
      />
      <CardBody>
        <AreaChart title={`Pipeline value, last ${ranges[range]} days`} data={data} x="date" config={config} height="md" />
      </CardBody>
    </Card>
  );
}
