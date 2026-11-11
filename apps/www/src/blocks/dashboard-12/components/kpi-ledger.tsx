"use client";

import { Card, Sparkline, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { totals, windowOf, type ChannelKey, type DailyRow, type Range } from "./data";

const tl = { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 } as const;

/** Five numbers on one ledger line: spend, conversions, CPA, revenue and ROAS, each against the previous period. */
export function KpiLedger({ range, only }: { range: Range; only: ChannelKey[] }) {
  const { f, c } = useBlockFormat();
  const w = windowOf(range);
  const now = totals(w.now, only);
  const prev = totals(w.prev, only);
  const perDay = (fn: (r: DailyRow) => number) => w.now.map(fn);
  const sumOf = (r: DailyRow, k: "Spend" | "Conv" | "Rev") => only.reduce((s, ch) => s + r[`${ch}${k}`], 0);

  const tiles = [
    { key: "spend", label: c("Spend", "Harcama"), value: Math.round(now.spend), prev: prev.spend, format: { ...tl, notation: "compact", maximumFractionDigits: 1 } as Intl.NumberFormatOptions, good: "neutral", trend: perDay((r) => sumOf(r, "Spend")) },
    { key: "conv", label: c("Conversions", "Dönüşüm"), value: now.conv, prev: prev.conv, format: undefined, good: "up", trend: perDay((r) => sumOf(r, "Conv")) },
    { key: "cpa", label: c("Cost per acquisition", "Edinme başı maliyet"), value: Math.round(now.cpa), prev: prev.cpa, format: tl as Intl.NumberFormatOptions, good: "down", trend: perDay((r) => sumOf(r, "Spend") / Math.max(1, sumOf(r, "Conv"))) },
    { key: "rev", label: c("Attributed revenue", "Atfedilen ciro"), value: Math.round(now.rev), prev: prev.rev, format: { ...tl, notation: "compact", maximumFractionDigits: 1 } as Intl.NumberFormatOptions, good: "up", trend: perDay((r) => sumOf(r, "Rev")) },
    { key: "roas", label: c("Return on ad spend", "Reklam getirisi (ROAS)"), value: Math.round(now.roas * 100) / 100, prev: prev.roas, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 }, suffix: "×", good: "up", trend: perDay((r) => sumOf(r, "Rev") / Math.max(1, sumOf(r, "Spend"))) },
  ] as const;

  return (
    <Card className="ui-rise grid min-w-0 grid-cols-2 overflow-hidden md:grid-cols-3 xl:grid-cols-5">
      {tiles.map((k, i) => {
        const delta = k.prev ? k.value / k.prev - 1 : 0;
        const better = k.good === "neutral" ? null : k.good === "up" ? delta >= 0 : delta <= 0;
        return (
          <div
            key={k.key}
            className={cn(
              "flex min-w-0 flex-col gap-2 border-line p-(--card-p)",
              "max-md:[&:nth-child(2n)]:border-s max-md:[&:nth-child(n+3)]:border-t",
              "md:max-xl:[&:not(:nth-child(3n+1))]:border-s md:max-xl:[&:nth-child(n+4)]:border-t",
              "xl:[&:not(:first-child)]:border-s",
              i === 4 && "max-md:col-span-2",
            )}
          >
            <span className="text-[13px] text-fg-muted">{k.label}</span>
            <span className="font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-none text-fg">
              <CountUp value={k.value} format={k.format} />
              {"suffix" in k ? <span className="text-fg-subtle">{k.suffix}</span> : null}
            </span>
            <span className="flex min-h-6 items-end justify-between gap-2">
              <span className={cn("font-mono text-xs tabular", better === null ? "text-fg-muted" : better ? "text-success" : "text-danger")}>
                {delta >= 0 ? "+" : "−"}
                {f.percent(Math.abs(delta), { maximumFractionDigits: 1 })}
                <span className="sr-only"> {c("vs previous period", "önceki döneme göre")}</span>
              </span>
              <Sparkline values={k.trend} size="xs" color="fg-muted" className="max-sm:hidden" label={c(`${k.label}, daily`, `${k.label}, günlük`)} />
            </span>
          </div>
        );
      })}
    </Card>
  );
}
