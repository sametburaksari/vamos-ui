"use client";

import * as React from "react";
import { ArrowLeft, Truck, Wrench } from "lucide-react";
import { Avatar, Badge, PinMap, Stat, StatGroup, toast, type MapPin } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { TODAY, minutesFromNow } from "../../_shared/time";
import { AssignDialog } from "./assign-dialog";
import { CrewList } from "./crew-list";
import { JobQueue } from "./job-queue";
import { driveMinutes, initialJobs, istanbulBounds, minutesUntil, statusTone, technicians, type Job } from "./data";

/**
 * Operations dispatch: the job queue, the city map with jobs and vans, and the crew with their load.
 * Selecting a job on the list or the map is the same selection.
 */
export function DispatchConsole() {
  const { f, t, c } = useBlockFormat();
  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [selected, setSelected] = React.useState<string | null>("jb-8");
  const [assigning, setAssigning] = React.useState<Job | null>(null);

  const selectedJob = jobs.find((j) => j.id === selected) ?? null;
  const selectedTech = selected?.startsWith("p-") ? selected : null;
  const active = jobs.filter((j) => j.status !== "done");
  const late = jobs.filter((j) => j.status === "delayed").length;
  const unassigned = jobs.filter((j) => j.status === "unassigned").length;
  const doneToday = technicians.reduce((s, x) => s + x.done, 0) + jobs.filter((j) => j.status === "done").length;

  const assign = (job: Job, techId: string) => {
    const tech = technicians.find((x) => x.id === techId)!;
    const eta = minutesFromNow(driveMinutes(tech, job));
    const before = jobs;
    setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, status: "en-route", technicianId: techId, eta } : j)));
    setAssigning(null);
    toast.success(c(`${tech.name} is on the way`, `${tech.name} yola çıktı`), {
      description: c(`${t(job.title)} · ETA ${f.time(eta, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}`, `${t(job.title)} · Varış ${f.time(eta, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}`),
      action: { label: c("Undo", "Geri al"), onClick: () => setJobs(before) },
    });
  };

  const notify = (job: Job) => {
    setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, notified: true } : j)));
    toast.success(c(`Text sent to ${job.customer}`, `${job.customer} kişisine SMS gönderildi`), {
      description: job.eta ? c(`New arrival time ${f.time(job.eta, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}, with a tracking link`, `Yeni varış saati ${f.time(job.eta, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}, takip bağlantısıyla`) : undefined,
    });
  };

  const unassign = (job: Job) => {
    const before = jobs;
    setJobs((list) => list.map((j) => (j.id === job.id ? { ...j, status: "unassigned", technicianId: undefined, eta: undefined } : j)));
    toast(c(`${t(job.title)} is back in the queue`, `${t(job.title)} kuyruğa geri döndü`), { action: { label: c("Undo", "Geri al"), onClick: () => setJobs(before) } });
  };

  const pins: MapPin[] = [
    ...active.map<MapPin>((j) => ({
      id: j.id,
      lat: j.lat,
      lng: j.lng,
      label: `${t(j.title)}, ${j.district}`,
      description: j.technicianId
        ? `${technicians.find((x) => x.id === j.technicianId)?.name} · ${t({ en: "window", tr: "aralık" })} ${f.time(j.windowStart, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}–${f.time(j.windowEnd, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}`
        : c(`Needs a technician · starts in ${minutesUntil(j.windowStart)} min`, `Teknisyen gerekli · ${minutesUntil(j.windowStart)} dk sonra başlıyor`),
      tone: j.status === "unassigned" ? (j.priority === "urgent" ? "danger" : "neutral") : statusTone[j.status] === "neutral" ? "neutral" : statusTone[j.status],
      icon: <Wrench />,
    })),
    ...technicians.map<MapPin>((x) => {
      const job = jobs.find((j) => j.technicianId === x.id && (j.status === "en-route" || j.status === "delayed"));
      return {
        id: x.id,
        lat: x.lat,
        lng: x.lng,
        label: x.name,
        description: job ? c(`Driving to ${job.district} · ${x.vehicle}`, `${job.district} yolunda · ${x.vehicle}`) : x.vehicle,
        tone: "accent",
        pulse: !!job,
        icon: <Truck />,
      };
    }),
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-scene">
      <header className="surface-bar sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line px-4 md:px-6">
        <a href="#operations" className="grid size-8 place-items-center rounded-ui-sm text-fg-muted hover:bg-hover hover:text-fg focus-ring" aria-label={c("Back to Operations", "Operasyona dön")}>
          <ArrowLeft className="size-4" aria-hidden />
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-fg">{c("Home service dispatch", "Ev hizmetleri sevk")}</p>
          <p className="truncate text-[11.5px] text-fg-subtle">Kiln & Linen · Istanbul · {f.date(TODAY, { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <Badge tone="success" dot className="max-sm:hidden">{c("GPS live", "GPS canlı")}</Badge>
        <Avatar name={me.name} size="sm" status="online" />
      </header>

      <main className="grid flex-1 gap-(--gap) p-4 md:p-6 lg:grid-cols-[minmax(19rem,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(20rem,23rem)_minmax(0,1fr)_minmax(17rem,20rem)]">
        <h1 className="sr-only">{c("Dispatch", "Sevk")}</h1>
        <JobQueue
          className="lg:row-span-2 xl:row-span-1"
          jobs={jobs}
          selectedId={selectedJob?.id ?? null}
          onSelect={setSelected}
          onAssign={setAssigning}
          onNotify={notify}
          onUnassign={unassign}
        />

        <section className="grid min-w-0 content-start gap-(--gap)" aria-label={c("Map and totals", "Harita ve toplamlar")}>
          <StatGroup columns={4} variant="plain" className="ui-rise">
            <Stat variant="plain" size="sm" label={c("Open jobs", "Açık iş")} value={active.length} />
            <Stat variant="plain" size="sm" label={c("Unassigned", "Atanmamış")} value={unassigned} intent="lower-is-better" />
            <Stat variant="plain" size="sm" label={c("Running late", "Gecikmede")} value={late} />
            <Stat variant="plain" size="sm" label={c("Done today", "Bugün biten")} value={doneToday} />
          </StatGroup>
          <div className="ui-rise surface min-w-0 overflow-hidden rounded-ui-lg p-2" style={{ animationDelay: "80ms" }}>
            <PinMap
              aria-label={c("Jobs and technicians in Istanbul", "İstanbul'daki işler ve teknisyenler")}
              pins={pins}
              bounds={istanbulBounds}
              aspectRatio={16 / 10}
              selectedId={selected}
              onSelectedIdChange={setSelected}
            />
            <ul className="flex flex-wrap gap-x-4 gap-y-1 px-2 pt-2 pb-1 text-xs text-fg-muted" aria-label={c("Map key", "Harita açıklaması")}>
              <li className="flex items-center gap-1.5"><Truck className="size-3.5 text-accent-ink" aria-hidden />{c("Technician", "Teknisyen")}</li>
              <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-danger" aria-hidden />{c("Urgent, unassigned", "Acil, atanmamış")}</li>
              <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-info" aria-hidden />{c("En route", "Yolda")}</li>
              <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" aria-hidden />{c("On site", "Sahada")}</li>
              <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-warning" aria-hidden />{c("Delayed", "Gecikti")}</li>
            </ul>
          </div>
        </section>

        <CrewList className="lg:col-start-2 xl:col-start-auto" jobs={jobs} selectedId={selectedTech} onSelect={setSelected} />
      </main>

      <AssignDialog job={assigning} jobs={jobs} onClose={() => setAssigning(null)} onAssign={assign} />
    </div>
  );
}
