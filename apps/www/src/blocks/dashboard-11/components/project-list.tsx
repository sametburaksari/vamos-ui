"use client";

import { ChevronRight } from "lucide-react";
import { Avatar, AvatarGroup, Badge, Card, CardHeader, EmptyState, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { peopleById } from "../../_shared/people";
import { TODAY, burnOf, clientOf, daysBetween, healthLabels, healthTone, nextMilestone, projectStatusLabels, tryCompact, type Health, type Project } from "./data";

export interface ProjectListProps {
  projects: Project[];
  health: Record<string, Health>;
  done: Record<string, boolean>;
  onOpen: (id: string) => void;
}

/** Every project on one line: health, progress against budget, the next milestone. Rows open the project sheet. */
export function ProjectList({ projects, health, done, onOpen }: ProjectListProps) {
  const { f, t, c } = useBlockFormat();
  const pct = (v: number) => f.percent(v, { maximumFractionDigits: 0 });

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "100ms" }}>
      <CardHeader titleAs="h2" title={c("Projects", "Projeler")} description={c("Bar: budget used. Tick: work done. A bar past its tick is spending ahead.", "Çubuk: kullanılan bütçe. Çentik: tamamlanan iş. Çentiği geçen çubuk önden harcıyor.")} />
      <div className="hidden border-y border-line px-(--card-p) py-2 text-xs text-fg-subtle lg:grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.5fr)_1rem] lg:gap-4" aria-hidden>
        <span>{c("Project", "Proje")}</span>
        <span>{c("Health", "Durum")}</span>
        <span>{c("Budget used vs done", "Bütçe ve ilerleme")}</span>
        <span>{c("Next milestone", "Sıradaki kilometre taşı")}</span>
        <span />
      </div>
      {projects.length === 0 ? (
        <EmptyState size="sm" title={c("No projects match", "Eşleşen proje yok")} description={c("Try another health filter.", "Başka bir durum filtresi deneyin.")} />
      ) : (
        <Stagger asChild step={45}>
          <ul className="max-lg:border-t max-lg:border-line">
            {projects.map((p) => {
              const b = burnOf(p);
              const h = health[p.id] ?? p.health;
              const ms = nextMilestone(p, done);
              const days = ms ? daysBetween(TODAY, ms.due) : null;
              const lead = peopleById[p.leadId]!;
              return (
                <li key={p.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onOpen(p.id)}
                    className="focus-ring grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-(--card-p) py-3.5 text-start transition-colors hover:bg-hover lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.5fr)_1rem]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar size="sm" shape="square" name={clientOf(p)?.name ?? p.code} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-fg">{t(p.name)}</span>
                        <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
                          <span className="font-mono">{p.code}</span>
                          <span aria-hidden>·</span>
                          <span className="truncate">{clientOf(p)?.name}</span>
                        </span>
                      </span>
                    </span>

                    <span className="flex flex-col items-end gap-1 lg:items-start">
                      <Badge tone={healthTone[h]}>{t(healthLabels[h])}</Badge>
                      <span className="text-[11px] text-fg-subtle">{t(projectStatusLabels[p.status])}</span>
                    </span>

                    <span className="col-span-2 min-w-0 lg:col-span-1">
                      <span className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="font-mono text-fg tabular">{tryCompact(f, b.spent)} <span className="text-fg-subtle">/ {tryCompact(f, b.budget)}</span></span>
                        <span className={cn("font-mono tabular", b.used > b.progress + 0.05 ? "text-danger" : "text-fg-muted")}>{pct(b.used)}</span>
                      </span>
                      <span className="relative mt-1.5 block h-2 rounded-full bg-track" role="img" aria-label={c(`${pct(b.used)} of budget used, ${pct(b.progress)} of work done`, `Bütçenin %${Math.round(b.used * 100)} kadarı kullanıldı, işin %${p.progress} kadarı bitti`)}>
                        <span className={cn("absolute inset-y-0 start-0 rounded-full transition-[width] duration-500", b.used > 1 ? "bg-danger" : b.used > b.progress + 0.05 ? "bg-warning" : "bg-accent")} style={{ width: `${Math.min(100, b.used * 100)}%` }} />
                        <span aria-hidden className="absolute -inset-y-1 w-0.5 rounded-full bg-fg" style={{ insetInlineStart: `calc(${Math.min(100, p.progress)}% - 1px)` }} />
                      </span>
                    </span>

                    <span className="col-span-2 flex min-w-0 items-center justify-between gap-3 lg:col-span-1">
                      <span className="min-w-0">
                        {ms ? (
                          <>
                            <span className="block truncate text-[13px] text-fg">{t(ms.title)}</span>
                            <span className={cn("text-xs tabular", days! < 0 ? "text-danger" : days! <= 7 ? "text-warning" : "text-fg-subtle")}>
                              {days! < 0 ? c(`${-days!} days late`, `${-days!} gün gecikti`) : days === 0 ? c("Today", "Bugün") : f.date(ms.due, { month: "short", day: "numeric" })}
                              {days! > 0 ? ` · ${c(`in ${days} days`, `${days} gün sonra`)}` : ""}
                            </span>
                          </>
                        ) : (
                          <span className="text-[13px] text-fg-muted">{c("All milestones met", "Tüm hedefler tamam")}</span>
                        )}
                      </span>
                      <AvatarGroup size="xs" max={3} aria-label={c(`Team led by ${lead.name}`, `${lead.name} liderliğindeki ekip`)} className="shrink-0 lg:hidden xl:flex">
                        {p.memberIds.map((id) => (
                          <Avatar key={id} name={peopleById[id]!.name} />
                        ))}
                      </AvatarGroup>
                    </span>
                    <ChevronRight aria-hidden className="size-4 text-fg-subtle max-lg:hidden rtl:rotate-180" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Stagger>
      )}
    </Card>
  );
}
