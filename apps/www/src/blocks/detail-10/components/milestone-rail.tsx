"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Card, CardHeader, Checkbox, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { Milestone, Project } from "../../_shared/projects";
import { TODAY, daysBetween } from "../../_shared/time";
import { schedule } from "./data";

/**
 * The schedule as one line: start → today → due, milestones numbered on it, and a card per
 * milestone underneath (the cards carry the text, so nothing on the line has to fit a label).
 */
export function MilestoneRail({ project, milestones, onToggle }: { project: Project; milestones: Milestone[]; onToggle: (id: string, done: boolean) => void }) {
  const { f, t, c } = useBlockFormat();
  const s = schedule(project);
  const pos = (date: string) => Math.min(100, Math.max(0, (daysBetween(project.start, date) / s.total) * 100));
  const doneCount = milestones.filter((m) => m.done).length;
  const late = (m: Milestone) => !m.done && m.due < TODAY;

  return (
    <Card as="section" aria-labelledby="ms-title" className="overflow-hidden">
      <CardHeader
        titleId="ms-title"
        titleAs="h2"
        title={c("Schedule", "Takvim")}
        description={c(`${doneCount} of ${milestones.length} milestones done · ${Math.round(s.timePct)}% of the time used`, `${milestones.length} kilometre taşından ${doneCount} tamam · sürenin %${Math.round(s.timePct)} kullanıldı`)}
      />
      <div className="px-(--card-p) pb-2">
        <div className="relative mx-3 h-12" aria-hidden>
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-track" />
          <div className="absolute start-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-fg-subtle/60" style={{ width: `${s.timePct}%` }} />
          {/* today */}
          {s.timePct > 0 && s.timePct < 100 ? (
            <div className="absolute top-0 bottom-0 w-px bg-accent-ink" style={{ insetInlineStart: `${s.timePct}%` }}>
              <span className="absolute -top-0.5 start-1.5 text-[10px] font-medium whitespace-nowrap text-accent-ink">{c("Today", "Bugün")}</span>
            </div>
          ) : null}
          {milestones.map((m, i) => (
            <span
              key={m.id}
              className={cn(
                "absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 font-mono text-[10px] transition-colors rtl:translate-x-1/2",
                m.done ? "border-success bg-success text-surface" : late(m) ? "border-danger bg-surface text-danger" : "border-fg-subtle bg-surface text-fg-muted",
              )}
              style={{ insetInlineStart: `${pos(m.due)}%` }}
            >
              {m.done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
            </span>
          ))}
        </div>
        <div className="mx-3 flex justify-between text-[11px] text-fg-subtle tabular">
          <span>{f.date(project.start, "medium")}</span>
          <span className={cn(s.left < 0 && project.progress < 100 && "font-medium text-danger")}>{f.date(project.due, "medium")}</span>
        </div>
      </div>
      <ol className={cn("grid gap-px border-t border-line bg-line", milestones.length === 2 ? "sm:grid-cols-2" : milestones.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {milestones.map((m, i) => {
          const days = daysBetween(TODAY, m.due);
          return (
            <li key={m.id} className="grid content-start gap-2 bg-surface px-(--card-p) py-3.5">
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-fg-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("text-sm font-medium", m.done ? "text-fg-muted line-through decoration-fg-subtle/60" : "text-fg")}>{t(m.title)}</span>
              </p>
              <p className={cn("text-xs", late(m) ? "text-danger" : "text-fg-subtle")}>
                {f.date(m.due, "medium")} ·{" "}
                {m.done ? c("done", "tamam") : days === 0 ? c("due today", "bugün") : days > 0 ? c(`in ${days} days`, `${days} gün sonra`) : c(`${-days} days late`, `${-days} gün gecikti`)}
              </p>
              <Checkbox size="sm" checked={m.done} onCheckedChange={(v) => onToggle(m.id, v === true)} label={<span className="text-xs text-fg-muted">{c("Done", "Tamamlandı")}</span>} aria-label={c(`Mark “${t(m.title)}” done`, `“${t(m.title)}” tamamlandı`)} />
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
