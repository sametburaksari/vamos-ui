"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, ToggleGroup, ToggleGroupItem, useFormat } from "@vamos-ui/react";
import { AreaChart } from "@vamos-ui/react/charts";
import { dailyRevenue, revenueConfig } from "./data";

const periods = { "7d": 7, "30d": 30, "90d": 90 } as const;
type Period = keyof typeof periods;

/** Revenue over the chosen period with the previous period dashed behind it. */
export function RevenueCard() {
  const f = useFormat();
  const [period, setPeriod] = React.useState<Period>("30d");
  const rows = dailyRevenue.slice(-periods[period]);
  const total = rows.reduce((s, r) => s + r.revenue, 0);
  const prev = rows.reduce((s, r) => s + r.previous, 0);
  const change = total / prev - 1;

  return (
    <Card className="ui-rise min-w-0 lg:col-span-2" style={{ animationDelay: "120ms" }}>
      <CardHeader
        titleAs="h2"
        title="Revenue"
        description={
          <>
            <span className="font-mono text-fg tabular">{f.currency(total, { currency: "USD" }, { maximumFractionDigits: 0 })}</span>
            {" · "}
            <span className={change >= 0 ? "text-success" : "text-danger"}>{change >= 0 ? "+" : "−"}{f.percent(Math.abs(change))}</span> vs previous period
          </>
        }
        action={
          <ToggleGroup aria-label="Period" size="sm" value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <ToggleGroupItem value="7d">7D</ToggleGroupItem>
            <ToggleGroupItem value="30d">30D</ToggleGroupItem>
            <ToggleGroupItem value="90d">90D</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <CardBody className="pt-1">
        <AreaChart
          title={`Daily revenue, last ${periods[period]} days`}
          data={rows}
          x="day"
          xFormat={{ date: { month: "short", day: "numeric" } }}
          config={revenueConfig}
          compare={{ key: "previous" }}
          height="md"
          tableToggle
        />
      </CardBody>
    </Card>
  );
}
