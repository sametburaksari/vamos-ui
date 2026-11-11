"use client";

import { Card, CardBody, CardHeader } from "@vamos-ui/react";
import { AreaChart, Funnel, type ChartConfig } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import { checkoutFunnel, tryAxis, tryCompact, tryTooltip, type periodStats } from "./data";

type Stats = ReturnType<typeof periodStats>;

/** Daily revenue for the selected range with the period average as a reference line. */
export function RevenueCard({ stats, range }: { stats: Stats; range: number }) {
  const { f, c } = useBlockFormat();
  const rows = stats.rows.map((r) => ({ date: r.date, revenue: Number(r.revenue) }));
  const avg = stats.revenue / rows.length;
  const best = rows.reduce((a, b) => (b.revenue > a.revenue ? b : a));
  const config: ChartConfig = { revenue: { label: c("Revenue", "Ciro"), color: "chart-2", format: tryTooltip } };

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "120ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Revenue by day", "Günlük ciro")}
        description={c(
          `Best day ${f.date(best.date, { weekday: "long", month: "short", day: "numeric" })} · ${tryCompact(f, best.revenue)}`,
          `En iyi gün ${f.date(best.date, { weekday: "long", month: "short", day: "numeric" })} · ${tryCompact(f, best.revenue)}`,
        )}
      />
      <CardBody className="pt-1">
        <AreaChart
          title={c(`Daily revenue, last ${range} days`, `Son ${range} günün günlük cirosu`)}
          data={rows}
          x="date"
          xFormat={{ date: { month: "short", day: "numeric" } }}
          yFormat={tryAxis}
          config={config}
          reference={[{ y: Math.round(avg), label: c("Average", "Ortalama"), color: "fg-subtle", labelPosition: "above" }]}
          height="md"
          tableToggle
        />
      </CardBody>
    </Card>
  );
}

/** Session → purchase funnel for the last 30 days. */
export function ConversionCard() {
  const { t, c } = useBlockFormat();
  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "180ms" }}>
      <CardHeader titleAs="h2" title={c("Checkout funnel", "Ödeme hunisi")} description={c("Last 30 days, all channels", "Son 30 gün, tüm kanallar")} />
      <CardBody className="flex-1 pt-1">
        <Funnel
          title={c("Checkout funnel, last 30 days", "Ödeme hunisi, son 30 gün")}
          orientation="vertical"
          steps={checkoutFunnel.map((s) => ({ key: s.key, label: t(s.label), value: s.value }))}
          show={["conversion"]}
          color="chart-2"
          size="sm"
          className="w-full"
        />
      </CardBody>
    </Card>
  );
}
