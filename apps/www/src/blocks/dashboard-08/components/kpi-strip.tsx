"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, Sparkline, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { periodStats } from "./data";
import { LiveCount } from "./live-count";

type Stats = ReturnType<typeof periodStats>;

/** Four store KPIs with a count-up, change vs the previous period and a daily trend line. */
export function KpiStrip({ stats }: { stats: Stats }) {
  const { f, c } = useBlockFormat();
  const money = { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 } as const;
  const tiles = [
    { key: "revenue", label: c("Revenue", "Ciro"), value: Math.round(stats.revenue), format: money, delta: stats.delta?.revenue, trend: stats.rows.map((r) => Number(r.revenue)) },
    { key: "orders", label: c("Orders", "Sipariş"), value: stats.orders, format: undefined, delta: stats.delta?.orders, trend: stats.rows.map((r) => r.orders) },
    { key: "aov", label: c("Average order", "Ortalama sepet"), value: Math.round(stats.aov), format: money, delta: stats.delta?.aov, trend: stats.rows.map((r) => Number(r.revenue) / r.orders) },
    {
      key: "conversion",
      label: c("Conversion", "Dönüşüm"),
      value: Math.round(stats.conversion * 10000) / 10000,
      format: { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 } as const,
      delta: stats.delta?.conversion,
      trend: null,
    },
  ];

  return (
    <Card className="ui-rise grid min-w-0 grid-cols-2 overflow-hidden lg:grid-cols-4">
      {tiles.map((k, i) => (
        <div key={k.key} className={cn("flex min-w-0 flex-col gap-2 border-line p-(--card-p)", i % 2 === 1 && "border-s", i >= 2 && "max-lg:border-t lg:border-s")}>
          <span className="text-[13px] text-fg-muted">{k.label}</span>
          <span className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-none text-fg">
            <LiveCount value={k.value} format={k.format} />
          </span>
          <span className="flex min-h-6 items-end justify-between gap-2">
            {k.delta === undefined || k.delta === null ? (
              <span className="text-xs text-fg-subtle">{c("No earlier data", "Önceki veri yok")}</span>
            ) : (
              <span className={cn("inline-flex items-center gap-0.5 font-mono text-xs tabular", k.delta >= 0 ? "text-success" : "text-danger")}>
                {k.delta >= 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
                {f.percent(Math.abs(k.delta), { maximumFractionDigits: 1 })}
                <span className="sr-only">{k.delta >= 0 ? c("up vs previous period", "önceki döneme göre artış") : c("down vs previous period", "önceki döneme göre düşüş")}</span>
              </span>
            )}
            {k.trend ? <Sparkline values={k.trend} size="xs" color="fg-muted" className="max-sm:hidden" label={c(`${k.label}, daily`, `${k.label}, günlük`)} /> : null}
          </span>
        </div>
      ))}
    </Card>
  );
}
