"use client";

import { Hourglass } from "lucide-react";
import { Avatar, Card, CardHeader, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { STALL_DAYS, companyName, openStages, toTry, type Deal, type DealStage, tryCompact } from "./data";

/**
 * Open pipeline per stage: value, probability-weighted value, age and the largest deals.
 * Each lane is a toggle that filters the deal list below.
 */
export function StageLanes({ deals, active, onToggle, scopeLabel }: { deals: Deal[]; active: DealStage | null; onToggle: (s: DealStage) => void; scopeLabel: string }) {
  const { f, t, c } = useBlockFormat();
  const compact = (v: number) => tryCompact(f, v);
  const lanes = openStages.map((s) => {
    const rows = deals.filter((d) => d.stage === s.key).sort((a, b) => toTry(b.amount) - toTry(a.amount));
    const value = rows.reduce((sum, d) => sum + toTry(d.amount), 0);
    const age = rows.length ? Math.round(rows.reduce((sum, d) => sum + d.stageAge, 0) / rows.length) : 0;
    return { ...s, rows, value, weighted: (value * s.probability) / 100, age, stalled: rows.filter((d) => d.stageAge > STALL_DAYS).length };
  });
  const max = Math.max(1, ...lanes.map((l) => l.value));

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "120ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Open pipeline by stage", "Aşamaya göre açık fırsatlar")}
        eyebrow={scopeLabel}
        description={c(`Select a stage to filter the deal list. Deals idle for more than ${STALL_DAYS} days are flagged.`, `Listeyi süzmek için bir aşama seçin. ${STALL_DAYS} günden uzun bekleyen fırsatlar işaretlenir.`)}
      />
      <Stagger className="grid gap-px border-t border-line bg-line sm:grid-cols-2 xl:grid-cols-4" step={70}>
        {lanes.map((l) => {
          const on = active === l.key;
          return (
            <button
              key={l.key}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(l.key)}
              className={cn(
                "group flex min-w-0 flex-col gap-3 bg-surface p-(--card-p) text-start transition-colors focus-ring hover:bg-hover",
                on && "bg-selected hover:bg-selected",
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-medium text-fg">{t(l.label)}</span>
                <span className="font-mono text-xs text-fg-subtle tabular">{l.probability}%</span>
              </span>
              <span>
                <span className="block font-mono text-xl font-medium text-fg tabular">{compact(l.value)}</span>
                <span className="text-xs text-fg-muted">
                  {c("Weighted", "Ağırlıklı")} <span className="font-mono tabular">{compact(l.weighted)}</span>
                </span>
              </span>
              <span aria-hidden className="block h-1 overflow-hidden rounded-full bg-track">
                <span className={cn("block h-full rounded-full transition-[width] duration-500", on ? "bg-accent" : "bg-chart-2")} style={{ width: `${(l.value / max) * 100}%` }} />
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
                <span className="tabular">{c(`${l.rows.length} deals`, `${l.rows.length} fırsat`)}</span>
                <span className="tabular">{c(`avg ${l.age} d in stage`, `ort. ${l.age} gün`)}</span>
                {l.stalled ? (
                  <span className="inline-flex items-center gap-1 text-warning tabular">
                    <Hourglass className="size-3" aria-hidden />
                    {c(`${l.stalled} stalled`, `${l.stalled} bekliyor`)}
                  </span>
                ) : null}
              </span>
              <span className="mt-auto flex flex-col gap-1.5 border-t border-line pt-3">
                {l.rows.slice(0, 3).map((d) => (
                  <span key={d.id} className="flex min-w-0 items-center gap-2 text-xs">
                    <Avatar name={person(d.ownerId).name} size="xs" aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-fg-muted">{companyName(d)}</span>
                    {d.stageAge > STALL_DAYS ? <Hourglass className="size-3 shrink-0 text-warning" aria-label={c("Stalled", "Bekliyor")} /> : null}
                    <span className="shrink-0 font-mono text-fg tabular">{compact(toTry(d.amount))}</span>
                  </span>
                ))}
                {l.rows.length === 0 ? <span className="text-xs text-fg-subtle">{c("No deals in this stage", "Bu aşamada fırsat yok")}</span> : null}
              </span>
            </button>
          );
        })}
      </Stagger>
    </Card>
  );
}
