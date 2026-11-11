"use client";

import * as React from "react";
import { Avatar, Card, CardHeader, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { repQuota } from "../../_shared/deals";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { QUARTER, inQuarter, reps, toTry, type Deal, tryCompact } from "./data";

type Rank = "attainment" | "pipeline";

/** Reps ranked by quota attainment (won + commit against their quarterly quota) or by open pipeline. */
export function Leaderboard({ deals, selected, onSelect }: { deals: Deal[]; selected: string | null; onSelect: (id: string | null) => void }) {
  const { f, t, c } = useBlockFormat();
  const [rank, setRank] = React.useState<Rank>("attainment");
  const compact = (v: number) => tryCompact(f, v);

  const rows = reps
    .map((id) => {
      const mine = deals.filter((d) => d.ownerId === id);
      const won = mine.filter((d) => d.stage === "won" && d.closeDate >= QUARTER.start).reduce((s, d) => s + toTry(d.amount), 0);
      const commit = mine.filter((d) => d.stage === "negotiation" && inQuarter(d)).reduce((s, d) => s + toTry(d.amount), 0);
      const open = mine.filter((d) => d.stage !== "won" && d.stage !== "lost");
      const pipeline = open.reduce((s, d) => s + toTry(d.amount), 0);
      const closed = mine.filter((d) => (d.stage === "won" || d.stage === "lost") && d.closeDate >= QUARTER.start);
      const quota = Number(repQuota[id]);
      return { id, p: person(id), won, commit, pipeline, open: open.length, quota, rate: closed.length ? closed.filter((d) => d.stage === "won").length / closed.length : null };
    })
    .sort((a, b) => (rank === "attainment" ? b.won / b.quota - a.won / a.quota : b.pipeline - a.pipeline));
  const maxPipe = Math.max(1, ...rows.map((r) => r.pipeline));

  return (
    <Card className="ui-rise min-w-0 lg:self-start" style={{ animationDelay: "300ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Rep leaderboard", "Temsilci sıralaması")}
        description={c("Select a rep to scope the whole page", "Tüm sayfayı süzmek için bir temsilci seçin")}
        action={
          <ToggleGroup aria-label={c("Rank by", "Sıralama")} size="sm" value={rank} onValueChange={(v) => v && setRank(v as Rank)}>
            <ToggleGroupItem value="attainment">{c("Quota", "Kota")}</ToggleGroupItem>
            <ToggleGroupItem value="pipeline">{c("Pipeline", "Havuz")}</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <Stagger asChild step={60}>
        <ol className="border-t border-line">
          {rows.map((r, i) => {
            const on = selected === r.id;
            const wonPct = Math.min(100, (r.won / r.quota) * 100);
            const commitPct = Math.min(100 - wonPct, (r.commit / r.quota) * 100);
            return (
              <li key={r.id} className="border-b border-line last:border-b-0">
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onSelect(on ? null : r.id)}
                  className={cn("grid w-full grid-cols-[1.25rem_auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-(--card-p) py-3 text-start transition-colors focus-ring hover:bg-hover", on && "bg-selected hover:bg-selected")}
                >
                  <span className="font-mono text-xs text-fg-subtle tabular">{i + 1}</span>
                  <Avatar name={r.p.name} size="sm" status={r.p.status} aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-fg">{r.p.name}</span>
                    <span className="block truncate text-xs text-fg-subtle">
                      {t(r.p.title)} · {r.rate === null ? c("no closed deals", "kapanan yok") : c(`${f.percent(r.rate, { maximumFractionDigits: 0 })} win rate`, `kazanma ${f.percent(r.rate, { maximumFractionDigits: 0 })}`)}
                    </span>
                  </span>
                  <span className="text-end">
                    <span className="block font-mono text-[13px] font-medium text-fg tabular">
                      {rank === "attainment" ? f.percent(r.won / r.quota, { maximumFractionDigits: 0 }) : compact(r.pipeline)}
                    </span>
                    <span className="block text-xs text-fg-subtle tabular">
                      {rank === "attainment" ? `${compact(r.won)} / ${compact(r.quota)}` : c(`${r.open} open`, `${r.open} açık`)}
                    </span>
                  </span>
                  <span aria-hidden className="col-span-2 col-start-3 flex h-1.5 overflow-hidden rounded-full bg-track">
                    {rank === "attainment" ? (
                      <>
                        <span className="h-full bg-accent transition-[width] duration-500" style={{ width: `${wonPct}%` }} />
                        <span className="h-full bg-chart-2 opacity-70 transition-[width] duration-500" style={{ width: `${commitPct}%` }} />
                      </>
                    ) : (
                      <span className="h-full bg-chart-2 transition-[width] duration-500" style={{ width: `${(r.pipeline / maxPipe) * 100}%` }} />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Stagger>
      {rank === "attainment" ? (
        <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-(--card-p) py-2.5 text-xs text-fg-subtle">
          <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-accent" />{c("Won", "Kazanılan")}</span>
          <span className="inline-flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-chart-2 opacity-70" />{c("Commit", "Kesin")}</span>
          <span>{c("Bar ends at 100% of quota", "Çubuk kotanın %100'ünde biter")}</span>
        </p>
      ) : null}
    </Card>
  );
}
