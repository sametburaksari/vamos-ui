"use client";

import * as React from "react";
import { BarChart, type ChartConfig } from "@vamos-cms/ui/charts";

const leave = [
  { team: "Engineering", annual: 142, sick: 38, parental: 60 },
  { team: "Sales", annual: 96, sick: 22, parental: 14 },
  { team: "Support", annual: 88, sick: 41, parental: 20 },
  { team: "Marketing", annual: 54, sick: 12, parental: 30 },
  { team: "Finance", annual: 37, sick: 9, parental: 0 },
];

const config = {
  annual: { label: "Annual leave" },
  sick: { label: "Sick leave" },
  parental: { label: "Parental leave" },
} satisfies ChartConfig;

export default function ChartLegendToggle() {
  // Controlled: keep the hidden series in the URL or user settings.
  const [hidden, setHidden] = React.useState<string[]>(["parental"]);
  return (
    <div className="grid w-full gap-2">
      <BarChart title="Leave days by team, 2026" data={leave} x="team" config={config} stack="stacked" height="md" hiddenSeries={hidden} onHiddenSeriesChange={setHidden} />
      <p className="font-mono text-[11.5px] text-fg-subtle">hidden: {hidden.length ? hidden.join(", ") : "none"}</p>
    </div>
  );
}
