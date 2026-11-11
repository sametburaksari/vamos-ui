"use client";

import * as React from "react";
import { Badge, Card, CardBody, CardHeader, Progress, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { cycle, overageCost, projected, usage } from "./billing-data";

type View = "now" | "projected";

/**
 * Usage this cycle. Each meter shows what is used, a dashed tick where the month is heading
 * (straight-line projection) and the included limit. Over the limit the bar keeps going past
 * the limit line, so overage reads at a glance.
 */
export function UsageMeters({ limits }: { limits: Record<string, number> }) {
  const { c, f, t } = useBlockFormat();
  const [view, setView] = React.useState<View>("now");

  const fmt = (v: number, unit: "count" | "bytes") => (unit === "bytes" ? f.bytes(v) : v >= 100_000 ? f.number(v, { notation: "compact", maximumFractionDigits: 2 }) : f.number(v));

  return (
    <Card>
      <CardHeader
        titleAs="h2"
        title={c("Usage this cycle", "Bu dönemki kullanım")}
        description={c(
          `Day ${cycle.elapsed} of ${cycle.length} · resets ${f.date(cycle.end, { month: "short", day: "numeric" })}`,
          `${cycle.length} günün ${cycle.elapsed}. günü · ${f.date(cycle.end, { month: "short", day: "numeric" })} tarihinde sıfırlanır`,
        )}
        action={
          <ToggleGroup aria-label={c("Show", "Göster")} size="sm" value={view} onValueChange={(v) => v && setView(v as View)}>
            <ToggleGroupItem value="now">{c("Today", "Bugün")}</ToggleGroupItem>
            <ToggleGroupItem value="projected">{c("Month end", "Ay sonu")}</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <CardBody className="pt-1">
        <Stagger asChild step={70}>
          <ul className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {usage.map((u) => {
              const limit = limits[u.key] ?? u.limit;
              const proj = u.key === "seats" || u.key === "storage" ? u.used : projected(u.used);
              const shown = view === "now" ? u.used : proj;
              const scale = Math.max(limit, proj, u.used) * 1.04;
              const ratio = shown / limit;
              const tone = ratio >= 1 ? "danger" : ratio > 0.8 ? "warning" : "accent";
              const cost = overageCost(u.key, shown, limit);
              const labelId = `meter-${u.key}`;
              return (
                <li key={u.key} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span id={labelId} className="truncate text-[13px] font-medium text-fg">
                      {t(u.label)}
                    </span>
                    {ratio >= 1 ? (
                      <Badge tone="danger">{c(`${f.percent(ratio, { maximumFractionDigits: 0 })} of limit`, `limitin ${f.percent(ratio, { maximumFractionDigits: 0 })}`)}</Badge>
                    ) : ratio > 0.8 ? (
                      <Badge tone="warning">{c("Close to limit", "Limite yakın")}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 flex items-baseline gap-1.5 font-mono tabular">
                    <span className="text-[1.35rem] leading-none font-medium text-fg">
                      {u.unit === "count" && view === "now" ? <CountUp value={u.used} format={u.used >= 100_000 ? { notation: "compact", maximumFractionDigits: 2 } : undefined} /> : fmt(shown, u.unit)}
                    </span>
                    <span className="text-xs text-fg-subtle">/ {fmt(limit, u.unit)}</span>
                  </p>
                  <div className="relative mt-2.5">
                    <Progress
                      aria-labelledby={labelId}
                      value={shown}
                      max={scale}
                      tone={tone}
                      size="md"
                      valueText={c(`${fmt(shown, u.unit)} of ${fmt(limit, u.unit)} included`, `${fmt(limit, u.unit)} dahilin ${fmt(shown, u.unit)} kadarı`)}
                    />
                    {/* Limit line */}
                    <span aria-hidden className="absolute -top-1 -bottom-1 w-px bg-fg" style={{ insetInlineStart: `${(limit / scale) * 100}%` }} />
                    {/* Month-end projection */}
                    {view === "now" && proj > u.used ? (
                      <span aria-hidden className="absolute -top-1.5 -bottom-1.5 w-0 border-s border-dashed border-fg-muted" style={{ insetInlineStart: `${(proj / scale) * 100}%` }} />
                    ) : null}
                  </div>
                  <p className={cn("mt-2 text-xs text-pretty", cost ? "text-danger" : "text-fg-muted")}>
                    {cost
                      ? c(`≈ ${f.currency(cost, { currency: "USD" })} extra ${view === "now" ? "so far" : "by month end"} · ${t(u.overage!)}`, `≈ ${f.currency(cost, { currency: "USD" })} ek ücret ${view === "now" ? "şu ana kadar" : "ay sonunda"} · ${t(u.overage!)}`)
                      : proj > limit && view === "now"
                        ? c(`On pace for ${fmt(proj, u.unit)} by month end.`, `Ay sonunda ${fmt(proj, u.unit)} olması bekleniyor.`)
                        : u.key === "seats"
                          ? c(`${limit - u.used} ${limit - u.used === 1 ? "seat" : "seats"} left. Extra seats are $12 each.`, `${limit - u.used} koltuk kaldı. Ek koltuk 12 $.`)
                          : c(`${fmt(limit - shown, u.unit)} left`, `${fmt(limit - shown, u.unit)} kaldı`)}
                  </p>
                </li>
              );
            })}
          </ul>
        </Stagger>
        <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-3 text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-px bg-fg" /> {c("Included in plan", "Plana dahil")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-3 w-0 border-s border-dashed border-fg-muted" /> {c("Projected at today's pace", "Bugünkü hızla tahmin")}
          </span>
        </p>
      </CardBody>
    </Card>
  );
}
