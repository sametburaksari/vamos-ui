"use client";

import { BarChart, type ChartConfig } from "@vamos-ui/react/charts";
import { copyFor, latency, TODAY, type SiteLocale } from "./content";

/** p95 latency of the REST API for the last 14 days; today (the EU incident) stays in full colour. */
export function LatencyChart({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const config = {
    p95: { label: t({ en: "p95 latency", tr: "p95 gecikme" }), color: "chart-2", format: (v: unknown) => `${v} ms` },
  } satisfies ChartConfig;
  return (
    <BarChart
      title={t({ en: "REST API p95 latency, last 14 days, in milliseconds", tr: "REST API p95 gecikmesi, son 14 gün, milisaniye" })}
      data={latency}
      x="date"
      xLabel={t({ en: "Day", tr: "Gün" })}
      xFormat={{ date: { month: "short", day: "numeric" } }}
      config={config}
      height="sm"
      radius={2}
      highlight={(row) => row.date === TODAY}
      reference={[{ y: 250, label: t({ en: "Target 250 ms", tr: "Hedef 250 ms" }) }]}
      tableToggle
    />
  );
}
