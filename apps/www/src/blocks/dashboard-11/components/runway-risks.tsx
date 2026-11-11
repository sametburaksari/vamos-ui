"use client";

import { Check } from "lucide-react";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Tooltip, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { peopleById } from "../../_shared/people";
import { day } from "../../_shared/time";
import { TODAY, daysBetween, impactLabels, impactRank, projects as allProjects, type Project, type Risk } from "./data";

const FROM = -14;
const TO = 49;
const span = TO - FROM;
const at = (d: string) => ((daysBetween(TODAY, d) - FROM) / span) * 100;

/** Milestones from two weeks back to seven weeks ahead, one lane per project. */
export function MilestoneRunway({ projects, done, onOpen }: { projects: Project[]; done: Record<string, boolean>; onOpen: (id: string) => void }) {
  const { f, t, c } = useBlockFormat();
  const weeks = Array.from({ length: Math.floor(span / 7) }, (_, i) => FROM + i * 7);
  const lanes = projects.filter((p) => p.status !== "completed");

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "180ms" }}>
      <CardHeader titleAs="h2" title={c("Milestone runway", "Kilometre taşı takvimi")} description={c("Hollow: still open. Red: open and past due.", "İçi boş: açık. Kırmızı: açık ve tarihi geçmiş.")} />
      <div className="px-(--card-p) pb-(--card-p)">
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3">
          <span />
          <div aria-hidden className="relative h-5 text-[11px] text-fg-subtle tabular">
            {weeks.map((w, i) => (
              <span key={w} className={cn("absolute whitespace-nowrap", i % 2 === 1 && "max-sm:hidden")} style={{ insetInlineStart: `${((w - FROM) / span) * 100}%` }}>
                {f.date(day(w), { month: "short", day: "numeric" })}
              </span>
            ))}
          </div>
          {lanes.map((p) => (
            <div key={p.id} className="contents">
              <button type="button" onClick={() => onOpen(p.id)} className="focus-ring self-center truncate rounded-ui-sm py-1 text-start font-mono text-xs text-fg-muted hover:text-fg">
                {p.code}
                <span className="sr-only"> {t(p.name)}</span>
              </button>
              <div className="relative h-9 border-t border-line">
                {weeks.map((w) => (
                  <span key={w} aria-hidden className="absolute inset-y-0 w-px bg-line/70" style={{ insetInlineStart: `${((w - FROM) / span) * 100}%` }} />
                ))}
                <span aria-hidden className="absolute inset-y-0 w-0.5 bg-accent" style={{ insetInlineStart: `${((0 - FROM) / span) * 100}%` }} />
                <span aria-hidden className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-fg-subtle/25" style={{ insetInlineStart: `${Math.max(0, at(p.start))}%`, insetInlineEnd: `${Math.max(0, 100 - at(p.due))}%` }} />
                <ul aria-label={c(`${p.code} milestones`, `${p.code} kilometre taşları`)}>
                  {p.milestones
                    .filter((m) => {
                      const d = daysBetween(TODAY, m.due);
                      return d >= FROM && d <= TO;
                    })
                    .map((m) => {
                      const isDone = done[`${p.id}:${m.id}`] ?? m.done;
                      const late = !isDone && daysBetween(m.due, TODAY) > 0;
                      const label = `${t(m.title)} · ${f.date(m.due, { month: "long", day: "numeric" })} · ${isDone ? c("done", "tamam") : late ? c("late", "gecikti") : c("open", "açık")}`;
                      return (
                        <li key={m.id} className="absolute top-1/2" style={{ insetInlineStart: `${at(m.due)}%` }}>
                          <Tooltip content={label}>
                            <span
                              tabIndex={0}
                              role="img"
                              aria-label={label}
                              className={cn(
                                "focus-ring absolute block size-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border-2 rtl:translate-x-1/2",
                                isDone ? "border-fg-muted bg-fg-muted" : late ? "border-danger bg-danger" : "border-fg bg-surface",
                              )}
                            />
                          </Tooltip>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 ms-[5.25rem] text-[11px] text-accent-ink">{c("Today", "Bugün")} · {f.date(TODAY, { month: "short", day: "numeric" })}</p>
      </div>
    </Card>
  );
}

/** Open risks across the portfolio, highest impact first, resolvable in place. */
export function RiskRegister({ risks, onResolve, onOpen }: { risks: Risk[]; onResolve: (r: Risk) => void; onOpen: (id: string) => void }) {
  const { t, c } = useBlockFormat();
  const sorted = [...risks].sort((a, b) => impactRank[a.impact] - impactRank[b.impact]);
  const high = risks.filter((r) => r.impact === "high").length;
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "240ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Risk register", "Risk kaydı")}
        description={high ? c(`${high} high-impact risks need a decision this week`, `${high} yüksek etkili risk bu hafta karar bekliyor`) : c("No high-impact risks open", "Açık yüksek etkili risk yok")}
      />
      {sorted.length === 0 ? (
        <EmptyState size="sm" title={c("Nothing open", "Açık risk yok")} description={c("New risks logged on a project show up here.", "Projelere eklenen riskler burada görünür.")} />
      ) : (
        <Stagger asChild step={40}>
          <ul className="border-t border-line">
            {sorted.map((r) => {
              const p = allProjects.find((x) => x.id === r.projectId)!;
              const owner = peopleById[r.ownerId]!;
              return (
                <li key={r.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-line px-(--card-p) py-3 last:border-b-0">
                  <Badge size="sm" shape="square" className="mt-0.5 w-16 justify-center" tone={r.impact === "high" ? "danger" : r.impact === "medium" ? "warning" : "neutral"}>
                    {t(impactLabels[r.impact])}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-[13px] text-fg">{t(r.title)}</p>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-fg-subtle">
                      <button type="button" onClick={() => onOpen(p.id)} className="focus-ring shrink-0 rounded-ui-sm font-mono whitespace-nowrap hover:text-fg">
                        {p.code}
                      </button>
                      <span aria-hidden>·</span>
                      <Avatar size="xs" name={owner.name} />
                      <span className="truncate">{owner.name}</span>
                    </p>
                  </div>
                  <Button size="xs" variant="ghost" onClick={() => onResolve(r)}>
                    <Check aria-hidden />
                    {c("Resolve", "Kapat")}
                    <span className="sr-only">: {t(r.title)}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </Stagger>
      )}
    </Card>
  );
}
