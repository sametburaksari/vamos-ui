"use client";

import * as React from "react";
import { ChevronRight, Route, Truck } from "lucide-react";
import { Avatar, Button, EmptyState, PinMap, ToggleGroup, ToggleGroupItem, cn, type MapPin } from "@vamos-ui/react";
import { CountUp, Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";
import { istanbulBounds, isMine, tech, vanPosition, technicianPositions, type DispatchMessage, type Job } from "./data";
import { JobStatusBadge, StatusTrack, useWindow } from "./job-parts";

const SHIFT_START = NOW_MS - (2 * 60 + 24) * 60_000; // 08:00
const SHIFT_END = SHIFT_START + 9 * 60 * 60_000; // 17:00

/* Today --------------------------------------------------------------------- */

export function TodayView({ jobs, onOpen }: { jobs: Job[]; onOpen: (id: string) => void }) {
  const { t, c, f } = useBlockFormat();
  const { hm, window } = useWindow();
  const mine = jobs.filter(isMine);
  const active = mine.find((j) => j.status === "on-site" || j.status === "en-route" || j.status === "delayed") ?? mine.find((j) => j.status === "unassigned");
  const done = mine.filter((j) => j.status === "done").length;
  const shift = (NOW_MS - SHIFT_START) / (SHIFT_END - SHIFT_START);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
      <div className="grid gap-6">
        <section aria-labelledby="shift-h">
          <p className="text-xs text-fg-muted">{f.date(new Date(NOW_MS), { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Istanbul" })}</p>
          <h1 id="shift-h" className="mt-1 font-heading text-2xl font-semibold tracking-tight md:text-3xl">
            {c(`Morning, ${tech.name.split(" ")[0]}`, `Günaydın ${tech.name.split(" ")[0]}`)}
          </h1>
          <div className="mt-4" role="img" aria-label={c(`Shift 08:00 to 17:00, ${Math.round(shift * 100)}% through`, `Vardiya 08:00–17:00, %${Math.round(shift * 100)} tamamlandı`)}>
            <div className="relative h-1.5 rounded-full bg-track">
              <span className="absolute inset-y-0 start-0 rounded-full bg-fg" style={{ width: `${shift * 100}%` }} />
              <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-scene bg-accent rtl:translate-x-1/2" style={{ insetInlineStart: `${shift * 100}%` }} />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-fg-subtle">
              <span>08:00</span>
              <span className="text-fg">{hm(new Date(NOW_MS).toISOString())}</span>
              <span>17:00</span>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-3 divide-x divide-line rounded-ui border border-line bg-surface rtl:divide-x-reverse">
            <div className="px-3 py-3">
              <dt className="text-xs text-fg-muted">{c("Jobs done", "Biten iş")}</dt>
              <dd className="mt-1 font-heading text-xl font-semibold tabular"><CountUp value={done} duration={600} /><span className="text-fg-subtle">/{mine.length}</span></dd>
            </div>
            <div className="px-3 py-3">
              <dt className="text-xs text-fg-muted">{c("Driven", "Yol")}</dt>
              <dd className="mt-1 font-heading text-xl font-semibold tabular"><CountUp value={18.4} duration={900} /> <span className="text-sm font-normal text-fg-muted">km</span></dd>
            </div>
            <div className="px-3 py-3">
              <dt className="text-xs text-fg-muted">{c("Van stock", "Araç stoğu")}</dt>
              <dd className="mt-1 font-heading text-xl font-semibold tabular"><CountUp value={96} duration={900} />%</dd>
            </div>
          </dl>
        </section>

        {active && (
          <section aria-labelledby="now-h" className="surface rounded-ui p-4 md:p-5">
            <div className="flex items-center gap-2">
              <h2 id="now-h" className="text-xs font-medium tracking-[0.08em] text-fg-muted uppercase">{active.status === "unassigned" ? c("Next stop", "Sıradaki durak") : c("Now", "Şimdi")}</h2>
              <JobStatusBadge status={active.status} />
              <span className="ms-auto font-mono text-xs text-fg-muted">{active.ref}</span>
            </div>
            <p className="mt-3 font-heading text-xl leading-tight font-semibold tracking-tight">{t(active.title)}</p>
            <p className="mt-1 text-[13.5px] text-fg-muted">{active.customer} · {active.district} · <span className="tabular">{window(active)}</span></p>
            <StatusTrack className="mt-4" status={active.status} />
            <Button variant="primary" size="lg" className="mt-4 w-full" onClick={() => onOpen(active.id)}>
              {c("Open job", "İşi aç")}
              <ChevronRight className="rtl:rotate-180" />
            </Button>
          </section>
        )}
      </div>

      <section aria-labelledby="route-h">
        <div className="mb-3 flex items-center gap-2">
          <Route className="size-4 text-fg-subtle" aria-hidden />
          <h2 id="route-h" className="font-heading text-[15px] font-semibold">{c("Today's route", "Bugünün rotası")}</h2>
          <span className="ms-auto text-xs text-fg-muted">{c(`${mine.length} stops`, `${mine.length} durak`)}</span>
        </div>
        <Stagger asChild step={50} effect="rise">
          <ol className="relative grid gap-2 before:absolute before:inset-y-4 before:start-[3.4rem] before:w-px before:bg-line">
            {mine.map((j) => {
              const current = j.id === active?.id;
              return (
                <li key={j.id}>
                  <button type="button" onClick={() => onOpen(j.id)} className={cn("group relative flex w-full items-start gap-3 rounded-ui p-2.5 text-start outline-none transition-colors focus-ring", current ? "bg-surface shadow-sm ring-1 ring-line" : "hover:bg-hover")}>
                    <span className={cn("w-11 shrink-0 pt-0.5 font-mono text-[13px] tabular", j.status === "done" ? "text-fg-subtle line-through" : "text-fg")}>{hm(j.windowStart)}</span>
                    <span aria-hidden className={cn("relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full ring-4 ring-scene", j.status === "done" ? "bg-fg-subtle" : current ? "bg-accent" : "border border-fg-muted bg-scene")} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-[14px] font-medium", j.status === "done" && "text-fg-muted")}>{t(j.title)}</span>
                      <span className="mt-0.5 block truncate text-xs text-fg-muted">{j.customer} · {j.district}</span>
                    </span>
                    <JobStatusBadge status={j.status} />
                  </button>
                </li>
              );
            })}
          </ol>
        </Stagger>
      </section>
    </div>
  );
}

/* Jobs ---------------------------------------------------------------------- */

type JobFilter = "mine" | "open" | "all";

export function JobsView({ jobs, onOpen }: { jobs: Job[]; onOpen: (id: string) => void }) {
  const { t, c } = useBlockFormat();
  const { window } = useWindow();
  const [filter, setFilter] = React.useState<JobFilter>("mine");
  const rows = jobs.filter((j) => (filter === "mine" ? isMine(j) : filter === "open" ? j.status !== "done" : true));
  return (
    <div className="mx-auto grid max-w-3xl gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="me-auto font-heading text-2xl font-semibold tracking-tight">{c("Jobs", "İşler")}</h1>
        <ToggleGroup type="single" size="sm" value={filter} onValueChange={(v) => v && setFilter(v as JobFilter)} aria-label={c("Filter jobs", "İşleri filtrele")}>
          <ToggleGroupItem value="mine">{c("Mine", "Benim")}</ToggleGroupItem>
          <ToggleGroupItem value="open">{c("Open", "Açık")}</ToggleGroupItem>
          <ToggleGroupItem value="all">{c("Team", "Ekip")}</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {rows.length === 0 ? (
        <EmptyState title={c("No open jobs", "Açık iş yok")} description={c("Everything on today's list is done.", "Bugünün listesindeki her şey bitti.")} />
      ) : (
        <Stagger key={filter} asChild step={40} effect="fade">
          <ul className="grid gap-px overflow-hidden rounded-ui border border-line bg-line">
            {rows.map((j) => (
              <li key={j.id} className="bg-surface">
                <button type="button" onClick={() => onOpen(j.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-start outline-none hover:bg-hover focus-ring">
                  {j.technicianId ? <Avatar name={person(j.technicianId).name} size="sm" /> : <span className="grid size-8 place-items-center rounded-full border border-dashed border-fg-subtle text-[10px] text-fg-muted">—</span>}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium">{t(j.title)}</span>
                    <span className="mt-0.5 block truncate text-xs text-fg-muted">
                      <span className="font-mono">{j.ref}</span> · {j.district} · <span className="tabular">{window(j)}</span>
                    </span>
                  </span>
                  <JobStatusBadge status={j.status} />
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle rtl:rotate-180" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Stagger>
      )}
    </div>
  );
}

/* Map ----------------------------------------------------------------------- */

const tone: Record<Job["status"], MapPin["tone"]> = { unassigned: "neutral", "en-route": "info", "on-site": "accent", done: "neutral", delayed: "warning" };

export function MapView({ jobs, onOpen }: { jobs: Job[]; onOpen: (id: string) => void }) {
  const { t, c, ago } = useBlockFormat();
  const { window } = useWindow();
  const [selected, setSelected] = React.useState<string | null>(jobs.find((j) => isMine(j) && j.status !== "done")?.id ?? null);
  const pins: MapPin[] = [
    ...jobs.filter((j) => j.status !== "done").map((j) => ({ id: j.id, lat: j.lat, lng: j.lng, label: `${t(j.title)} · ${j.district}`, description: window(j), tone: isMine(j) ? tone[j.status] : "neutral" })),
    ...technicianPositions.map((p) => ({ id: `van-${p.personId}`, lat: p.lat, lng: p.lng, label: p.personId === tech.id ? c("Your van", "Aracınız") : person(p.personId).name, description: ago(p.updatedAt), tone: (p.personId === tech.id ? "accent" : "info") as MapPin["tone"], pulse: p.personId === tech.id, icon: <Truck className="size-3" /> })),
  ];
  const job = jobs.find((j) => j.id === selected);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <h1 className="sr-only">{c("Map", "Harita")}</h1>
      <PinMap
        aria-label={c("Today's jobs and vans in Istanbul", "İstanbul'da bugünün işleri ve araçlar")}
        pins={pins}
        bounds={istanbulBounds}
        aspectRatio={4 / 3}
        selectedId={selected}
        onSelectedIdChange={setSelected}
        className="rounded-ui border border-line"
      />
      <div className="grid gap-3">
        {job ? (
          <div className="surface ui-fade rounded-ui p-4">
            <div className="flex items-center gap-2">
              <JobStatusBadge status={job.status} />
              <span className="ms-auto font-mono text-xs text-fg-muted">{job.ref}</span>
            </div>
            <p className="mt-2 font-heading text-lg font-semibold tracking-tight">{t(job.title)}</p>
            <p className="text-[13px] text-fg-muted">{job.customer} · {job.district} · <span className="tabular">{window(job)}</span></p>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => onOpen(job.id)}>{c("Open job", "İşi aç")}</Button>
          </div>
        ) : (
          <p className="rounded-ui border border-dashed border-line px-4 py-6 text-center text-[13px] text-fg-muted">{c("Tap a pin to see the job.", "İşi görmek için bir iğneye dokunun.")}</p>
        )}
        <p className="flex items-center gap-2 text-xs text-fg-muted">
          <Truck className="size-3.5" aria-hidden />
          {c(`Van location updated ${ago(vanPosition.updatedAt)}`, `Araç konumu ${ago(vanPosition.updatedAt)} güncellendi`)}
        </p>
      </div>
    </div>
  );
}

/* Inbox --------------------------------------------------------------------- */

export function InboxView({ messages, onRead, onOpenJob }: { messages: DispatchMessage[]; onRead: (id: string) => void; onOpenJob: (id: string) => void }) {
  const { t, c, ago } = useBlockFormat();
  const [open, setOpen] = React.useState<string | null>(null);
  return (
    <div className="mx-auto grid max-w-2xl gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{c("Dispatch", "Sevk")}</h1>
      <Stagger asChild step={40} effect="fade">
        <ul className="grid gap-2">
          {messages.map((m) => {
            const from = person(m.fromId);
            const expanded = open === m.id;
            return (
              <li key={m.id} className={cn("rounded-ui border transition-colors", m.unread ? "border-line bg-surface" : "border-transparent")}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => {
                    setOpen(expanded ? null : m.id);
                    if (m.unread) onRead(m.id);
                  }}
                  className="flex w-full items-start gap-3 rounded-ui p-3.5 text-start outline-none hover:bg-hover focus-ring"
                >
                  <Avatar name={from.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className={cn("truncate text-[14px]", m.unread ? "font-semibold" : "font-medium")}>{t(m.subject)}</span>
                      <span className="ms-auto shrink-0 text-xs text-fg-muted">{ago(m.at)}</span>
                    </span>
                    <span className={cn("mt-0.5 block text-[13px] text-fg-muted", !expanded && "truncate")}>{from.name} — {t(m.body)}</span>
                  </span>
                  {m.unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-accent-ink" aria-label={c("Unread", "Okunmadı")} />}
                </button>
                {expanded && m.jobId && (
                  <div className="px-3.5 pb-3.5 ps-14">
                    <Button size="sm" variant="secondary" onClick={() => onOpenJob(m.jobId!)}>{c("Open the job", "İşi aç")}</Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Stagger>
    </div>
  );
}
