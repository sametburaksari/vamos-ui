"use client";

import { Avatar, Badge, Progress, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { minutesUntil, technicians, type Job } from "./data";

/** The crew: what each van is doing now, the day's load and the last GPS ping. */
export function CrewList({ jobs, selectedId, onSelect, className }: { jobs: Job[]; selectedId: string | null; onSelect: (id: string) => void; className?: string }) {
  const { t, c, ago } = useBlockFormat();
  return (
    <section className={cn("ui-rise surface min-w-0 overflow-hidden rounded-ui-lg", className)} style={{ animationDelay: "120ms" }} aria-labelledby="crew-title">
      <div className="flex items-baseline justify-between gap-2 px-4 pt-4 pb-3">
        <h2 id="crew-title" className="text-[15px] font-medium text-fg">{c("Crew", "Ekip")}</h2>
        <span className="text-xs text-fg-subtle">{c(`${technicians.length} vans out`, `${technicians.length} araç sahada`)}</span>
      </div>
      <Stagger asChild effect="fade">
        <ul className="divide-y divide-line border-t border-line">
          {technicians.map((x) => {
            const current = jobs.find((j) => j.technicianId === x.id && j.status !== "done");
            const assigned = jobs.filter((j) => j.technicianId === x.id && j.status !== "done").length;
            const load = x.done + assigned;
            const state = !current ? "free" : current.status === "on-site" ? "on-site" : current.status === "delayed" ? "late" : "driving";
            const stateLabel = { free: c("Free", "Boşta"), "on-site": c("On site", "Sahada"), late: c("Running late", "Gecikmede"), driving: c("Driving", "Yolda") }[state];
            const tone = ({ free: "accent", "on-site": "success", late: "warning", driving: "info" } as const)[state];
            const sel = selectedId === x.id;
            return (
              <li key={x.id}>
                <button
                  type="button"
                  aria-pressed={sel}
                  onClick={() => onSelect(x.id)}
                  className={cn("grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 px-4 py-3 text-start hover:bg-hover focus-ring focus-visible:-outline-offset-2", sel && "bg-selected")}
                >
                  <Avatar name={x.name} size="sm" status={state === "free" ? "online" : undefined} />
                  <span className="min-w-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13.5px] font-medium text-fg">{x.name}</span>
                      <Badge tone={tone} size="sm">{stateLabel}</Badge>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-fg-muted">
                      {current
                        ? current.eta && current.status !== "on-site"
                          ? c(`${t(current.title)} · ${minutesUntil(current.eta)} min away`, `${t(current.title)} · ${minutesUntil(current.eta)} dk uzakta`)
                          : t(current.title)
                        : c("Ready for the next job", "Sıradaki işe hazır")}
                    </span>
                  </span>
                  <span className="col-start-2 grid gap-1">
                    <Progress size="xs" value={load} max={x.capacity} tone="auto" display="fraction" aria-label={c(`${x.name}, jobs today`, `${x.name}, bugünkü işler`)} />
                    <span className="flex justify-between text-[11px] text-fg-muted">
                      <span className="tabular">{c(`${load} of ${x.capacity} jobs`, `${x.capacity} işten ${load}`)}</span>
                      <span>
                        <span className="font-mono">{x.vehicle}</span> · {c("ping", "konum")} {ago(x.lastPing)}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Stagger>
    </section>
  );
}
