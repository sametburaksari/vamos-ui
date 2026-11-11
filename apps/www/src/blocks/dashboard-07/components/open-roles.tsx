"use client";

import * as React from "react";
import { ChevronRight, Users } from "lucide-react";
import { Avatar, Button, Card, CardHeader, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person, teamLabels } from "../../_shared/people";
import { daysBetween } from "../../_shared/time";
import { TODAY, roleStages, type OpenRole } from "./data";

/** Open positions as a hiring board: stage track, applicants, days open, one action to move forward. */
export function OpenRoles({ roles, onAdvance, action }: { roles: OpenRole[]; onAdvance: (id: string) => void; action?: React.ReactNode }) {
  const { t, c } = useBlockFormat();
  const applicants = roles.reduce((s, r) => s + r.applicants, 0);

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "300ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Open roles", "Açık pozisyonlar")}
        description={c(`${roles.length} roles · ${applicants} applicants in the pipeline`, `${roles.length} pozisyon · süreçte ${applicants} aday`)}
        action={action}
      />
      <Stagger asChild step={70}>
        <ul className="grid gap-px border-t border-line bg-line md:grid-cols-2 md:[&>li:last-child:nth-child(odd)]:col-span-2">
          {roles.map((r) => {
            const idx = roleStages.findIndex((s) => s.key === r.stage);
            const open = daysBetween(r.openedDate, TODAY);
            const manager = person(r.hiringManagerId);
            const last = idx === roleStages.length - 1;
            return (
              <li key={r.id} className="flex min-w-0 flex-col gap-4 bg-surface p-(--card-p)">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-medium text-fg">{t(r.title)}</h3>
                    <p className="mt-0.5 truncate text-xs text-fg-muted">
                      {t(teamLabels[r.department])} · {r.location}
                    </p>
                  </div>
                  <span className={cn("shrink-0 rounded-ui-sm px-1.5 py-0.5 font-mono text-[11px] tabular", open > 40 ? "bg-surface-2 text-warning" : "bg-surface-2 text-fg-muted")}>
                    {c(`${open} d open`, `${open} gündür açık`)}
                  </span>
                </div>

                <ol className="grid grid-cols-3 gap-1" aria-label={c("Hiring stage", "İşe alım aşaması")}>
                  {roleStages.map((s, i) => (
                    <li key={s.key} aria-current={i === idx ? "step" : undefined} className="min-w-0">
                      <span aria-hidden className={cn("block h-1 rounded-full", i < idx ? "bg-chart-2" : i === idx ? "bg-accent" : "bg-track")} />
                      <span className={cn("mt-1.5 block truncate text-[11px]", i === idx ? "font-medium text-fg" : "text-fg-subtle")}>{t(s.label)}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-auto flex items-center gap-3">
                  <Avatar name={manager.name} size="xs" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-xs text-fg-muted">{manager.name}</span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-fg-muted tabular">
                    <Users className="size-3.5" aria-hidden />
                    <span className="sr-only">{c("Applicants", "Aday")}</span>
                    {r.applicants}
                  </span>
                  <Button size="xs" variant="ghost" disabled={last} onClick={() => onAdvance(r.id)}>
                    {last ? c("Awaiting answer", "Yanıt bekleniyor") : t(roleStages[idx + 1]!.label)}
                    {last ? null : <span className="sr-only">: {t(r.title)}</span>}
                    {last ? null : <ChevronRight aria-hidden />}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Stagger>
    </Card>
  );
}
