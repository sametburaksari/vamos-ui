"use client";

import * as React from "react";
import { Download, Plus } from "lucide-react";
import {
  ActivityTimeline,
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  PageHeader,
  Progress,
  Stat,
  StatGroup,
  ToggleGroup,
  ToggleGroupItem,
} from "@vamos-ui/react";
import { BarList, Funnel } from "@vamos-ui/react/charts";
import { DealsTable } from "./deals-table";
import { NOW, activity, lastQuarter, pipeline, reps } from "./data";

/** Whole thousands read "$412K", not "$412.0K". */
const usdCompact = { type: "compact-currency", currency: "USD", options: { minimumFractionDigits: 0 } } as const;

const repRows = reps.map((r) => ({ ...r, icon: <Avatar name={r.textLabel ?? r.key} size="xs" aria-hidden /> }));

export function SalesDashboard() {
  const [compare, setCompare] = React.useState("compare");

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="Q4 2026 · Week 46"
        title={<>Sales <em>pipeline</em></>}
        description="Where every open deal stands, who is moving them and what closes before the month ends."
        actions={
          <>
            <Button variant="secondary"><Download aria-hidden />Export</Button>
            <Button variant="primary"><Plus aria-hidden />New deal</Button>
          </>
        }
      />

      <StatGroup columns={4} variant="plain" className="ui-rise">
        <Stat variant="plain" label="Open pipeline" value={1_840_000} format={usdCompact} delta={0.142} comparison="vs last quarter" trend={[1.21, 1.34, 1.29, 1.45, 1.52, 1.61, 1.58, 1.73, 1.84]} />
        <Stat variant="plain" label="Won this quarter" value={412_000} format={usdCompact} delta={0.27} comparison="vs last quarter" target={{ value: 600_000, label: "Q4 target" }} />
        <Stat variant="plain" label="Win rate" value={0.31} format="percent" delta={0.107} comparison="vs last quarter" trend={[24, 26, 25, 27, 29, 28, 30, 31]} />
        <Stat variant="plain" label="Avg. sales cycle" value="38 days" delta={-0.09} intent="lower-is-better" comparison="vs last quarter" trend={[46, 44, 45, 42, 41, 40, 39, 38]} />
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <Card className="ui-rise min-w-0 lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <CardHeader titleAs="h2"
            title="Pipeline by stage"
            description="Deals and value entering each stage this quarter"
            action={
              <ToggleGroup aria-label="Comparison" size="sm" value={compare} onValueChange={setCompare}>
                <ToggleGroupItem value="none">This quarter</ToggleGroupItem>
                <ToggleGroupItem value="compare">vs Q3</ToggleGroupItem>
              </ToggleGroup>
            }
          />
          <CardBody className="pt-1">
            <Funnel
              title="Sales pipeline by stage, Q4 2026"
              steps={pipeline}
              compareTo={compare === "compare" ? lastQuarter : undefined}
              amountFormat={{ currency: "USD", compact: true }}
              show={["conversion", "dropoff"]}
              className="w-full"
            />
          </CardBody>
        </Card>

        <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "180ms" }}>
          <CardHeader titleAs="h2" title="Leaderboard" description="Closed-won revenue, quarter to date" action={<Button variant="link" size="sm">All reps</Button>} />
          <CardBody className="flex-1 pt-1">
            <BarList aria-label="Closed-won revenue by rep" data={repRows} format={{ currency: "USD", compact: true }} variant="track" />
          </CardBody>
          <CardFooter className="block border-t border-line">
            <Progress value={412_000} max={600_000} label="Team quota" hint="$412,000 of $600,000 · 51 days left in the quarter" showValue />
          </CardFooter>
        </Card>
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <DealsTable />
        </div>

        <Card className="ui-rise min-w-0" style={{ animationDelay: "360ms" }}>
          <CardHeader titleAs="h2" title="Team activity" action={<Button variant="link" size="sm">View all</Button>} />
          <CardBody className="pt-1">
            <ActivityTimeline items={activity} groupBy="day" now={NOW} timeZone="Europe/Istanbul" aria-label="Sales team activity" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
