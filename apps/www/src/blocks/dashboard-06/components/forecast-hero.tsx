"use client";

import { Badge, Card, Tooltip } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { QUARTER, categoryLabels, daysLeftInQuarter, type ForecastCategory, tryCompact, tryWhole } from "./data";
import { LiveCount } from "./live-count";

export interface ForecastTotals {
  won: number;
  commit: number;
  best: number;
  pipeline: number;
  counts: Record<ForecastCategory, number>;
}

/** How each category is painted. Accent only for what is already booked. */
const fill: Record<ForecastCategory, React.CSSProperties> = {
  won: { background: "var(--color-accent)" },
  commit: { background: "var(--color-chart-2)" },
  best: { background: "color-mix(in oklab, var(--color-chart-2) 45%, transparent)" },
  pipeline: {
    background:
      "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-fg-subtle) 38%, transparent) 0 2px, transparent 2px 7px)",
  },
};

const order: ForecastCategory[] = ["won", "commit", "best", "pipeline"];

/** The quarter at a glance: one bar from booked to hopeful, with the quota as a tick. */
export function ForecastHero({ totals, quota, scopeLabel }: { totals: ForecastTotals; quota: number; scopeLabel: string }) {
  const { f, t, c } = useBlockFormat();
  const forecast = totals.won + totals.commit;
  const gap = quota - forecast;
  const scale = Math.max(quota * 1.12, totals.won + totals.commit + totals.best + totals.pipeline);
  const pct = (v: number) => `${(v / scale) * 100}%`;
  const tryFmt = { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 } as const;
  const compact = (v: number) => tryCompact(f, v);

  return (
    <Card className="ui-rise min-w-0 overflow-hidden">
      <div className="grid gap-6 p-(--card-p) lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-eyebrow text-fg-subtle">
            {c("Forecast", "Tahmin")} · {QUARTER.label} · {scopeLabel}
          </p>
          <p className="mt-2 font-display text-display-l leading-none text-fg">
            <LiveCount value={Math.round(forecast)} format={tryFmt} />
          </p>
          <p className="mt-2 max-w-[52ch] text-fg-muted">
            {c("Closed won plus commit, against a quota of", "Kazanılan artı kesin; kota")}{" "}
            <span className="font-mono text-fg tabular">{tryWhole(f, quota)}</span>.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-ui border border-line bg-line text-sm sm:min-w-[420px]">
          {[
            { k: c("Attainment", "Gerçekleşme"), v: f.percent(forecast / quota, { maximumFractionDigits: 0 }) },
            {
              k: gap > 0 ? c("Gap to quota", "Kotaya kalan") : c("Over quota", "Kota üstü"),
              v: compact(Math.abs(gap)),
              tone: gap > 0 ? "text-warning" : "text-success",
            },
            { k: c("Days left", "Kalan gün"), v: f.number(daysLeftInQuarter) },
          ].map((s) => (
            <div key={s.k} className="bg-surface px-3 py-2.5">
              <dt className="text-xs text-fg-subtle">{s.k}</dt>
              <dd className={`mt-0.5 font-mono text-[15px] font-medium tabular ${s.tone ?? "text-fg"}`}>{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The bar */}
      <div className="px-(--card-p) pb-2">
        <div className="relative pt-6">
          <div
            role="img"
            aria-label={order.map((k) => `${t(categoryLabels[k])} ${compact(totals[k])}`).join(", ") + `. ${c("Quota", "Kota")} ${compact(quota)}`}
            className="flex h-9 overflow-hidden rounded-ui-sm bg-track"
          >
            {order.map((k) =>
              totals[k] > 0 ? (
                <Tooltip key={k} content={`${t(categoryLabels[k])} · ${compact(totals[k])}`}>
                  <span
                    className="h-full border-e border-surface transition-[width] duration-500 ease-out last:border-e-0"
                    style={{ ...fill[k], width: pct(totals[k]) }}
                  />
                </Tooltip>
              ) : null,
            )}
          </div>
          <div className="pointer-events-none absolute inset-y-0" style={{ insetInlineStart: pct(quota) }} aria-hidden>
            <span className="absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-ui-sm border border-line bg-popover px-1.5 py-0.5 font-mono text-[11px] text-fg tabular rtl:translate-x-1/2">
              {c("Quota", "Kota")} {compact(quota)}
            </span>
            <span className="absolute top-5 bottom-0 w-px -translate-x-1/2 bg-fg rtl:translate-x-1/2" />
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-line xl:grid-cols-4">
        {order.map((k, i) => (
          <div key={k} className={`min-w-0 border-line px-(--card-p) py-3.5 ${i % 2 ? "border-s" : ""} ${i >= 2 ? "max-xl:border-t xl:border-s" : ""}`}>
            <dt className="flex items-center gap-2 text-[13px] text-fg-muted">
              <span aria-hidden className="size-2.5 shrink-0 rounded-[3px] border border-line" style={fill[k]} />
              {t(categoryLabels[k])}
              <Badge size="sm" className="ms-auto tabular">{totals.counts[k]}</Badge>
            </dt>
            <dd className="mt-1">
              <span className="font-mono text-[17px] font-medium text-fg tabular">
                <LiveCount value={Math.round(totals[k])} format={{ ...tryFmt, notation: "compact", maximumFractionDigits: 1 }} />
              </span>
              <span className="block truncate text-xs text-fg-subtle">{t(categoryLabels[k].hint)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
