"use client";

import * as React from "react";
import { BellRing, MapPin as MapPinIcon, Phone, UserMinus, UserPlus } from "lucide-react";
import { Avatar, Badge, Button, SlaTimer, Tabs, TabsContent, TabsList, TabsTrigger, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS, jobStatusLabels, minutesUntil, skillLabels, statusTone, technicians, type Job } from "./data";

type Lane = "queue" | "active" | "done";
const laneOf = (j: Job): Lane => (j.status === "unassigned" ? "queue" : j.status === "done" ? "done" : "active");

interface JobQueueProps {
  jobs: Job[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAssign: (job: Job) => void;
  onNotify: (job: Job) => void;
  onUnassign: (job: Job) => void;
  className?: string;
}

/** Jobs in three lanes. The selected job opens in place with its address, window and actions. */
export function JobQueue({ jobs, selectedId, onSelect, onAssign, onNotify, onUnassign, className }: JobQueueProps) {
  const { f, t, c } = useBlockFormat();
  const selected = jobs.find((j) => j.id === selectedId);
  const [lane, setLane] = React.useState<Lane>(selected ? laneOf(selected) : "queue");
  // Follow the selection (a pin clicked on the map) to its lane.
  React.useEffect(() => {
    if (selected) setLane(laneOf(selected));
  }, [selected?.id, selected?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const hhmm = (iso: string) => f.time(iso, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
  const sorted = (l: Lane) =>
    jobs
      .filter((j) => laneOf(j) === l)
      .sort((a, b) => (l === "queue" ? Number(b.priority === "urgent") - Number(a.priority === "urgent") : 0) || Date.parse(a.windowStart) - Date.parse(b.windowStart));

  const row = (j: Job) => {
    const tech = technicians.find((x) => x.id === j.technicianId);
    const open = j.id === selectedId;
    return (
      <li key={j.id} className="relative">
        {open ? <span className="absolute inset-y-0 start-0 w-0.5 bg-accent" aria-hidden /> : null}
        <button type="button" aria-expanded={open} aria-controls={`job-${j.id}`} onClick={() => onSelect(j.id)} className="grid w-full gap-1 px-4 py-3 text-start hover:bg-hover focus-ring focus-visible:-outline-offset-2">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium text-fg">{t(j.title)}</span>
              <span className="block truncate text-xs text-fg-muted">{j.customer} · {j.district}</span>
            </span>
            {j.priority === "urgent" && j.status === "unassigned" ? (
              <Badge tone="danger" size="sm">{c("Urgent", "Acil")}</Badge>
            ) : (
              <Badge tone={statusTone[j.status]} size="sm" dot>{t(jobStatusLabels[j.status])}</Badge>
            )}
          </span>
          <span className="flex items-center gap-2 text-xs text-fg-subtle">
            <span className="font-mono tabular">{hhmm(j.windowStart)}–{hhmm(j.windowEnd)}</span>
            <span aria-hidden>·</span>
            <span>{t(skillLabels[j.skill])}</span>
            {tech ? (
              <span className="ms-auto flex min-w-0 items-center gap-1.5 text-fg-muted">
                <Avatar name={tech.name} size="xs" />
                <span className="truncate">{tech.name.split(" ")[0]}</span>
              </span>
            ) : null}
          </span>
        </button>
        {open ? (
          <div id={`job-${j.id}`} className="ui-fade grid gap-3 px-4 pb-4">
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs">
              <dt className="text-fg-subtle"><MapPinIcon className="size-3.5" aria-label={c("Address", "Adres")} /></dt>
              <dd className="text-fg-muted">{j.address}</dd>
              <dt className="text-fg-subtle"><Phone className="size-3.5" aria-label={c("Phone", "Telefon")} /></dt>
              <dd><a className="font-mono text-fg-muted hover:text-fg hover:underline focus-ring" href={`tel:${j.phone.replace(/\s/g, "")}`}>{j.phone}</a></dd>
            </dl>
            {j.status === "unassigned" ? (
              <p className="flex items-center justify-between gap-2 rounded-ui-sm bg-surface-2 px-3 py-2 text-xs text-fg-muted">
                {c("Window opens in", "Aralığın başlamasına")}
                <SlaTimer label={c("Window opens", "Aralık başlıyor")} due={j.windowStart} start={new Date(NOW_MS - 120 * 60_000).toISOString()} now={NOW_MS} warnMinutes={45} />
              </p>
            ) : j.status === "on-site" ? (
              <SlaTimer variant="bar" label={c("Window closes", "Aralık bitiyor")} due={j.windowEnd} start={j.windowStart} now={NOW_MS} />
            ) : j.eta ? (
              <p className="flex items-center justify-between rounded-ui-sm bg-surface-2 px-3 py-2 text-xs">
                <span className="text-fg-muted">{c("Arrives", "Varış")} <span className="font-mono text-fg tabular">{hhmm(j.eta)}</span></span>
                <span className={cn("font-medium", Date.parse(j.eta) > Date.parse(j.windowEnd) - j.duration * 60_000 ? "text-danger" : "text-fg-muted")}>
                  {c(`in ${minutesUntil(j.eta)} min`, `${minutesUntil(j.eta)} dk sonra`)}
                </span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {j.status === "unassigned" ? (
                <Button size="sm" variant="primary" onClick={() => onAssign(j)}>
                  <UserPlus aria-hidden />
                  {c("Assign technician", "Teknisyen ata")}
                </Button>
              ) : null}
              {j.status === "delayed" ? (
                <Button size="sm" variant={j.notified ? "ghost" : "primary"} disabled={j.notified} onClick={() => onNotify(j)}>
                  <BellRing aria-hidden />
                  {j.notified ? c("Customer notified", "Müşteri bilgilendirildi") : c("Text new ETA", "Yeni saati SMS'le")}
                </Button>
              ) : null}
              {j.status === "en-route" || j.status === "delayed" ? (
                <Button size="sm" variant="ghost" onClick={() => onUnassign(j)}>
                  <UserMinus aria-hidden />
                  {c("Unassign", "Atamayı kaldır")}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </li>
    );
  };

  const empty = (text: string) => <p className="px-4 py-10 text-center text-sm text-fg-muted">{text}</p>;

  return (
    <section className={cn("ui-rise surface flex min-w-0 flex-col overflow-hidden rounded-ui-lg", className)} aria-labelledby="queue-title">
      <Tabs value={lane} onValueChange={(v) => setLane(v as Lane)} className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 px-4 pt-4">
          <h2 id="queue-title" className="text-[15px] font-medium text-fg">{c("Jobs", "İşler")}</h2>
          <span className="text-xs text-fg-subtle">{c(`${jobs.length} today`, `Bugün ${jobs.length}`)}</span>
        </div>
        <div className="px-4 pt-2">
          <TabsList aria-label={c("Job lanes", "İş kulvarları")} variant="underline">
            <TabsTrigger value="queue" count={sorted("queue").length} badgeTone={sorted("queue").length ? "danger" : "neutral"}>{c("Queue", "Sırada")}</TabsTrigger>
            <TabsTrigger value="active" count={sorted("active").length}>{c("Active", "Aktif")}</TabsTrigger>
            <TabsTrigger value="done" count={sorted("done").length}>{c("Done", "Biten")}</TabsTrigger>
          </TabsList>
        </div>
        {(["queue", "active", "done"] as const).map((l) => (
          <TabsContent key={l} value={l} className="min-h-0 flex-1 lg:overflow-y-auto">
            {sorted(l).length ? (
              <Stagger asChild effect="fade">
                <ul className="divide-y divide-line">{sorted(l).map(row)}</ul>
              </Stagger>
            ) : (
              empty(l === "queue" ? c("Every job has a technician.", "Her işin bir teknisyeni var.") : c("Nothing here yet.", "Henüz bir şey yok."))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
