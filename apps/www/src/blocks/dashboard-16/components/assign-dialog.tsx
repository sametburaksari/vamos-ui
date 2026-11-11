"use client";

import * as React from "react";
import { Avatar, Badge, Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, RadioGroup, RadioGroupItem } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { driveMinutes, km, minutesUntil, skillLabels, technicians, type Job } from "./data";

/** Pick a technician for a job: ranked by skill match, then drive time; full vans are flagged. */
export function AssignDialog({ job, jobs, onClose, onAssign }: { job: Job | null; jobs: Job[]; onClose: () => void; onAssign: (job: Job, techId: string) => void }) {
  const { f, t, c } = useBlockFormat();
  const ranked = React.useMemo(() => {
    if (!job) return [];
    return technicians
      .map((x) => {
        const busy = jobs.filter((j) => j.technicianId === x.id && j.status !== "done").length;
        return { x, skilled: x.skills.includes(job.skill), minutes: driveMinutes(x, job), distance: km(x, job), busy, full: x.done + busy >= x.capacity };
      })
      .sort((a, b) => Number(b.skilled) - Number(a.skilled) || Number(a.full) - Number(b.full) || a.minutes - b.minutes);
  }, [job, jobs]);
  const [choice, setChoice] = React.useState<string | null>(null);
  React.useEffect(() => {
    setChoice(ranked.find((r) => r.skilled && !r.full)?.x.id ?? null);
  }, [ranked]);

  return (
    <Dialog open={!!job} onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="md">
        <DialogHeader
          title={c("Assign a technician", "Teknisyen ata")}
          description={job ? `${t(job.title)} · ${job.district} · ${c("needs", "gerekli")} ${t(skillLabels[job.skill]).toLowerCase()}` : undefined}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (job && choice) onAssign(job, choice);
          }}
        >
          <DialogBody>
            <RadioGroup aria-label={c("Technician", "Teknisyen")} value={choice} onValueChange={setChoice} variant="card" className="grid gap-2">
              {ranked.map((r, i) => {
                const late = job ? r.minutes > minutesUntil(job.windowEnd) - job.duration : false;
                return (
                  <RadioGroupItem
                    key={r.x.id}
                    value={r.x.id}
                    icon={<Avatar name={r.x.name} size="sm" />}
                    label={
                      <span className="flex flex-wrap items-center gap-2">
                        {r.x.name}
                        {i === 0 && r.skilled && !r.full ? <Badge tone="accent" size="sm">{c("Best match", "En uygun")}</Badge> : null}
                        {!r.skilled ? <Badge size="sm">{c("Missing skill", "Yetkinlik yok")}</Badge> : null}
                        {r.full ? <Badge tone="warning" size="sm">{c("Day is full", "Gün dolu")}</Badge> : null}
                      </span>
                    }
                    description={
                      <span className="tabular">
                        {c(`${r.minutes} min drive`, `${r.minutes} dk sürüş`)} · {f.number(r.distance, { maximumFractionDigits: 1 })} km · {c(`${r.busy} open`, `${r.busy} açık iş`)}
                        {late ? <span className="text-danger"> · {c("misses the window", "aralığı kaçırır")}</span> : null}
                      </span>
                    }
                  />
                );
              })}
            </RadioGroup>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>{c("Cancel", "Vazgeç")}</Button>
            <Button type="submit" variant="primary" disabled={!choice}>{c("Assign and notify", "Ata ve bildir")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
