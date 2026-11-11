"use client";

import * as React from "react";
import { BookOpen, CalendarClock, ClipboardCheck, Inbox, ListChecks, LogOut, Map, Menu, Package, Settings, Sun } from "lucide-react";
import { Avatar, Badge, DialogTitle, Sheet, SheetContent, Switch, cn, toast, useMediaQuery } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { initialJobs, initialMessages, tech, type Job, type JobStatus } from "./data";
import { JobSheet } from "./job-sheet";
import { InboxView, JobsView, MapView, TodayView } from "./views";

type Tab = "today" | "jobs" | "map" | "inbox";

/**
 * Field service app, phone first: four tabs in a bottom bar and everything else in a sheet
 * behind "More". From 768px the bar becomes a side rail and the views gain a second column.
 */
export function FieldApp() {
  const { c } = useBlockFormat();
  const [tab, setTab] = React.useState<Tab>("today");
  const [jobs, setJobs] = React.useState<Job[]>(initialJobs);
  const [messages, setMessages] = React.useState(initialMessages);
  const [openJob, setOpenJob] = React.useState<string | null>(null);
  const [more, setMore] = React.useState(false);
  const [onBreak, setOnBreak] = React.useState(false);
  const wide = useMediaQuery("(min-width: 768px)");
  const mainRef = React.useRef<HTMLElement>(null);

  const unread = messages.filter((m) => m.unread).length;
  const tabs: Array<{ key: Tab; label: string; icon: React.ReactNode; badge?: number }> = [
    { key: "today", label: c("Today", "Bugün"), icon: <Sun /> },
    { key: "jobs", label: c("Jobs", "İşler"), icon: <ListChecks /> },
    { key: "map", label: c("Map", "Harita"), icon: <Map /> },
    { key: "inbox", label: c("Dispatch", "Sevk"), icon: <Inbox />, badge: unread },
  ];

  const go = (next: Tab) => {
    setTab(next);
    mainRef.current?.scrollTo({ top: 0 });
  };

  const update = (id: string, fn: (j: Job) => Partial<Job>) => setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...fn(j) } : j)));

  const advance = (job: Job, next: JobStatus) => {
    const prev = job.status;
    update(job.id, () => ({ status: next, signed: next === "done" ? true : job.signed }));
    const undo = { label: c("Undo", "Geri al"), onClick: () => update(job.id, () => ({ status: prev })) };
    if (next === "en-route") toast(c("On your way — the customer gets an ETA text", "Yoldasınız; müşteriye tahmini varış SMS'i gitti"), { action: undo });
    if (next === "on-site") toast(c("Arrival logged", "Varış kaydedildi"), { description: c("Timer started for on-site time.", "Sahada geçen süre başladı."), action: undo });
    if (next === "done") {
      setOpenJob(null);
      toast.success(c(`${job.ref} complete`, `${job.ref} tamamlandı`), { description: c("Report and signature synced to the office.", "Rapor ve imza ofise iletildi."), action: undo });
    }
  };

  return (
    <div className="relative z-10 flex min-h-dvh md:h-dvh">
      {/* Side rail, 768px and up */}
      <nav aria-label={c("Main", "Ana menü")} className="hidden w-20 shrink-0 flex-col items-center gap-1 border-e border-nav-line bg-nav py-4 text-nav-fg md:flex">
        <span className="mb-4 grid size-9 place-items-center rounded-ui bg-accent font-heading text-sm font-bold text-accent-fg" aria-hidden>
          KL
        </span>
        {tabs.map((x) => (
          <RailButton key={x.key} active={tab === x.key} label={x.label} icon={x.icon} badge={x.badge} onClick={() => go(x.key)} />
        ))}
        <span className="my-2 h-px w-10 bg-nav-line" aria-hidden />
        <RailButton active={false} label={c("More", "Daha fazla")} icon={<Menu />} onClick={() => setMore(true)} />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-bar px-4 backdrop-blur md:px-6">
          <Avatar name={tech.name} size="sm" status={onBreak ? "away" : "online"} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold">{tech.name}</p>
            <p className="truncate text-xs text-fg-muted">{onBreak ? c("On break", "Molada") : c("On shift · Van 34 KLN 07", "Vardiyada · Araç 34 KLN 07")}</p>
          </div>
          <Badge tone="success" className="ms-auto" dot>
            {c("Synced", "Eşitlendi")}
          </Badge>
        </header>

        <main ref={mainRef} className="min-w-0 flex-1 px-4 pt-5 pb-28 md:overflow-y-auto md:px-8 md:py-8">
          <div key={tab} className="ui-fade mx-auto max-w-6xl">
            {tab === "today" && <TodayView jobs={jobs} onOpen={setOpenJob} />}
            {tab === "jobs" && <JobsView jobs={jobs} onOpen={setOpenJob} />}
            {tab === "map" && <MapView jobs={jobs} onOpen={setOpenJob} />}
            {tab === "inbox" && (
              <InboxView
                messages={messages}
                onRead={(id) => setMessages((all) => all.map((m) => (m.id === id ? { ...m, unread: false } : m)))}
                onOpenJob={setOpenJob}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom tab bar, phones */}
      <nav aria-label={c("Main", "Ana menü")} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bar pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {tabs.map((x) => (
            <li key={x.key}>
              <TabButton active={tab === x.key} label={x.label} icon={x.icon} badge={x.badge} onClick={() => go(x.key)} />
            </li>
          ))}
          <li>
            <TabButton active={false} label={c("More", "Daha fazla")} icon={<Menu />} onClick={() => setMore(true)} />
          </li>
        </ul>
      </nav>

      <JobSheet
        job={jobs.find((j) => j.id === openJob) ?? null}
        onOpenChange={(o) => !o && setOpenJob(null)}
        onAdvance={advance}
        onCheck={(job, itemId, done) => update(job.id, (j) => ({ checklist: j.checklist.map((x) => (x.id === itemId ? { ...x, done } : x)) }))}
        onDelay={(job) => {
          update(job.id, () => ({ status: "delayed" }));
          toast.warning(c("Dispatch and the customer were told you're running late", "Sevk ve müşteriye geciktiğiniz bildirildi"));
        }}
      />

      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side={wide ? "start" : "bottom"} size={wide ? "sm" : "lg"} className={wide ? undefined : "rounded-t-[calc(var(--radius)*2)]"}>
          <DialogTitle className="sr-only">{c("More", "Daha fazla")}</DialogTitle>
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <Avatar name={tech.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{tech.name}</p>
              <p className="truncate text-xs text-fg-muted">{tech.phone}</p>
            </div>
          </div>
          <label className="flex items-center gap-3 border-b border-line px-5 py-3.5 text-[14px]">
            <span className="flex-1">{c("On break", "Moladayım")}</span>
            <Switch
              checked={onBreak}
              onCheckedChange={(v) => {
                setOnBreak(v);
                toast(v ? c("Break started. Dispatch won't send new jobs.", "Mola başladı. Sevk yeni iş göndermeyecek.") : c("Welcome back", "Tekrar hoş geldiniz"));
              }}
            />
          </label>
          <nav aria-label={c("More pages", "Diğer sayfalar")} className="overflow-y-auto px-2 py-2">
            <ul className="grid gap-px">
              {[
                { icon: <Package />, en: "Van stock", tr: "Araç stoğu", meta: "42" },
                { icon: <CalendarClock />, en: "Timesheet", tr: "Puantaj", meta: "2h 24m" },
                { icon: <ClipboardCheck />, en: "Safety checks", tr: "Güvenlik kontrolleri", meta: c("Done", "Tamam") },
                { icon: <BookOpen />, en: "Install guides", tr: "Montaj rehberleri" },
                { icon: <Settings />, en: "Settings", tr: "Ayarlar" },
              ].map((x) => (
                <li key={x.en}>
                  <button
                    type="button"
                    onClick={() => {
                      setMore(false);
                      toast(c(`${x.en} opens here`, `${x.tr} burada açılır`));
                    }}
                    className="flex h-12 w-full items-center gap-3 rounded-ui-sm px-3 text-start text-[14px] outline-none hover:bg-hover focus-ring [&_svg]:size-[18px] [&_svg]:text-fg-muted"
                  >
                    {x.icon}
                    <span className="flex-1">{c(x.en, x.tr)}</span>
                    {x.meta && <span className="text-xs text-fg-muted tabular">{x.meta}</span>}
                  </button>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-1">
                <button type="button" onClick={() => setMore(false)} className="flex h-12 w-full items-center gap-3 rounded-ui-sm px-3 text-start text-[14px] text-danger outline-none hover:bg-hover focus-ring [&_svg]:size-[18px]">
                  <LogOut />
                  {c("End shift", "Vardiyayı bitir")}
                </button>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TabButton({ active, label, icon, badge, onClick }: { active: boolean; label: string; icon: React.ReactNode; badge?: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn("relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] outline-none focus-ring [&_svg]:size-[22px]", active ? "font-semibold text-fg" : "text-fg-muted")}
    >
      <span className={cn("relative grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-accent-soft text-accent-ink")}>
        {icon}
        {!!badge && <span className="absolute -top-1 end-0 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg tabular">{badge}</span>}
      </span>
      {label}
    </button>
  );
}

function RailButton({ active, label, icon, badge, onClick }: { active: boolean; label: string; icon: React.ReactNode; badge?: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn("relative flex w-16 flex-col items-center gap-1 rounded-ui py-2 text-[11px] outline-none transition-colors focus-ring [&_svg]:size-5", active ? "bg-nav-active text-nav-fg-strong" : "text-nav-fg hover:bg-nav-hover hover:text-nav-fg-strong")}
    >
      {icon}
      {label}
      {!!badge && <span className="absolute top-1 end-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg tabular">{badge}</span>}
    </button>
  );
}
