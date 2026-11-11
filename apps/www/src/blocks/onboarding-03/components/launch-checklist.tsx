"use client";

import * as React from "react";
import { CalendarClock, Eye, Phone, Rocket, Undo2 } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger, Alert, Avatar, Badge, Button, Card, CardBody, CardHeader,
  PageHeader, Progress, StepIndicator, toast,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { AdminShell } from "../../detail-04/components/admin-shell";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import type { L } from "../../_shared/l10n";
import { groupLabels, groupOrder, launchDate, launchTasks, type LaunchTask, type LaunchTaskId } from "./data";
import { TaskForm } from "./task-forms";
import { LaunchRail } from "./launch-rail";

const finished = (t: LaunchTask) => t.status !== "todo";

/**
 * A store's launch checklist: a segmented progress rail, tasks grouped by area that are completed
 * right in the list (each opens its own small form), optional tasks that can be skipped, and a
 * go-live check that unlocks once every required task is done.
 */
export function LaunchChecklist() {
  const { c, t, f } = useBlockFormat();
  const [tasks, setTasks] = React.useState(launchTasks);
  const [open, setOpen] = React.useState<string>(() => launchTasks.find((x) => !finished(x))?.id ?? "");
  const [live, setLive] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");

  const current = tasks.find((x) => !finished(x));
  const required = tasks.filter((x) => x.required);
  const blockers = required.filter((x) => x.status !== "done");
  const doneCount = tasks.filter(finished).length;
  const minutesLeft = tasks.filter((x) => !finished(x)).reduce((n, x) => n + x.minutes, 0);
  const ready = blockers.length === 0;

  const focusTask = (id: string) => {
    setOpen(id);
    requestAnimationFrame(() => {
      const el = document.getElementById(`launch-${id}`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      el?.querySelector<HTMLButtonElement>("[data-slot=accordion-trigger]")?.focus({ preventScroll: true });
    });
  };

  const update = (id: LaunchTaskId, patch: Partial<LaunchTask>) => {
    const next = tasks.map((x) => (x.id === id ? { ...x, ...patch } : x));
    setTasks(next);
    const nextOpen = next.find((x) => !finished(x));
    setOpen(nextOpen?.id ?? "");
    const done = next.filter(finished).length;
    setAnnounce(c(`${done} of ${next.length} tasks finished`, `${next.length} görevden ${done} tanesi tamam`));
  };

  const complete = (task: LaunchTask, result: L) => {
    update(task.id, { status: "done", result });
    toast.success(c(`${task.title.en} — saved`, `${task.title.tr} — kaydedildi`));
  };

  const goLive = () => {
    setLive(true);
    toast.success(c("Your store is live at shop.kilnlinen.example.com", "Mağazanız yayında: shop.kilnlinen.example.com"));
  };

  let n = 0;
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1320px]">
      <PageHeader
        eyebrow={c("Launch · Kiln & Linen", "Yayına hazırlık · Kiln & Linen")}
        title={live ? c("Your store is live", "Mağazanız yayında") : c("Get ready to take orders", "Sipariş almaya hazırlanın")}
        description={c(
          "Finish the required tasks and the store goes live on your domain. Everything stays editable in Settings.",
          "Zorunlu görevleri bitirin, mağaza alan adınızda yayına girsin. Hepsi daha sonra Ayarlar'dan değiştirilebilir.",
        )}
        meta={
          live ? (
            <Badge tone="success" dot>{c("Live", "Yayında")}</Badge>
          ) : (
            <Badge tone="outline">
              <CalendarClock aria-hidden className="size-3" /> {c("Target", "Hedef")} {f.date(launchDate, { day: "numeric", month: "short" })}
            </Badge>
          )
        }
        actions={
          <>
            <Button variant="ghost">
              <Eye /> {c("Preview store", "Mağazayı önizle")}
            </Button>
            <Button variant={ready && !live ? "primary" : "secondary"} disabled={!ready || live} onClick={goLive} title={ready ? undefined : c("Finish the required tasks first", "Önce zorunlu görevleri bitirin")}>
              <Rocket /> {live ? c("Live", "Yayında") : c("Go live", "Yayına al")}
            </Button>
          </>
        }
      />

      <LaunchRail tasks={tasks} currentId={current?.id} onSelect={focusTask} doneCount={doneCount} minutesLeft={minutesLeft} blockers={blockers.length} />
      <span className="sr-only" aria-live="polite">{announce}</span>

      <div className="mt-6 grid items-start gap-(--gap) xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="grid min-w-0 gap-(--gap)">
          {ready && !live ? (
            <Alert
              tone="success"
              title={c("Everything required is done", "Zorunlu görevlerin hepsi tamam")}
              live="polite"
              actions={<Button size="sm" variant="primary" onClick={goLive}><Rocket /> {c("Go live now", "Şimdi yayına al")}</Button>}
            >
              {c("Optional tasks can wait. Shoppers can order as soon as you go live.", "İsteğe bağlı görevler bekleyebilir. Yayına aldığınız anda müşteriler sipariş verebilir.")}
            </Alert>
          ) : null}

          {groupOrder.map((g) => {
            const list = tasks.filter((x) => x.group === g);
            const gDone = list.filter(finished).length;
            return (
              <Card key={g} aria-labelledby={`launch-group-${g}`} role="region">
                <div className="flex items-baseline justify-between gap-3 px-(--card-p) pt-4 pb-1">
                  <h2 id={`launch-group-${g}`} className="text-[15px] font-semibold tracking-[-0.01em] text-fg">{t(groupLabels[g])}</h2>
                  <span className="font-mono text-[12px] text-fg-subtle tabular">
                    {gDone}/{list.length}
                  </span>
                </div>
                <Accordion type="single" collapsible value={open} onValueChange={setOpen} headingLevel={3} className="px-(--card-p) pb-2">
                  {list.map((task) => {
                    n += 1;
                    const owner = person(task.owner);
                    const isCurrent = task.id === current?.id;
                    return (
                      <AccordionItem key={task.id} value={task.id} id={`launch-${task.id}`} className="scroll-mt-24">
                        <AccordionTrigger
                          icon={<StepIndicator size="sm" number={n} status={task.status === "done" ? "complete" : task.status === "skipped" ? "skipped" : isCurrent ? "current" : "upcoming"} />}
                          meta={
                            <span className="flex items-center gap-2">
                              {task.status === "done" ? (
                                <Badge tone="success">{c("Done", "Tamam")}</Badge>
                              ) : task.status === "skipped" ? (
                                <Badge tone="neutral">{c("Skipped", "Atlandı")}</Badge>
                              ) : (
                                <>
                                  {task.required ? null : <span className="hidden text-[11px] text-fg-subtle sm:inline">{c("Optional", "İsteğe bağlı")}</span>}
                                  <span className="font-mono text-[12px] text-fg-subtle tabular">{c(`${task.minutes} min`, `${task.minutes} dk`)}</span>
                                </>
                              )}
                              <Avatar name={owner.name} size="xs" className="hidden sm:inline-flex" />
                            </span>
                          }
                        >
                          <span className={task.status === "todo" ? undefined : "text-fg-muted"}>{t(task.title)}</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          {task.status === "todo" ? (
                            <div className="pb-1">
                              <p className="mb-3 max-w-prose text-[13px] text-fg-muted">
                                {t(task.lead)} <span className="text-fg-subtle">· {c("Owner", "Sorumlu")}: {owner.name}</span>
                              </p>
                              <div className="rounded-ui-lg surface-2 p-3 sm:p-4">
                                <TaskForm id={task.id} current={isCurrent} onDone={(r) => complete(task, r)} />
                              </div>
                              {task.required ? null : (
                                <Button size="sm" variant="ghost" className="mt-2" onClick={() => update(task.id, { status: "skipped" })}>
                                  {c("Skip for now", "Şimdilik atla")}
                                </Button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pb-1">
                              <p className="me-auto min-w-0 text-[13px] text-fg [overflow-wrap:anywhere]">
                                {task.status === "done" && task.result ? t(task.result) : c("Skipped — you can come back to it any time.", "Atlandı — istediğiniz zaman dönebilirsiniz.")}
                              </p>
                              <Button size="sm" variant="ghost" onClick={() => { update(task.id, { status: "todo" }); setOpen(task.id); }}>
                                {task.status === "done" ? c("Edit", "Düzenle") : <><Undo2 /> {c("Undo skip", "Atlamayı geri al")}</>}
                              </Button>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </Card>
            );
          })}
        </div>

        <Stagger className="grid gap-(--gap) md:grid-cols-2 xl:grid-cols-1">
          <Card>
            <CardHeader title={c("Go-live check", "Yayın kontrolü")} description={ready ? c("Nothing is blocking launch.", "Yayını engelleyen bir şey yok.") : c(`${blockers.length} required tasks left`, `${blockers.length} zorunlu görev kaldı`)} />
            <CardBody className="grid gap-4">
              {groupOrder.map((g) => {
                const req = required.filter((x) => x.group === g);
                const d = req.filter((x) => x.status === "done").length;
                return <Progress key={g} size="xs" label={t(groupLabels[g])} value={d} max={req.length} display="fraction" showValue />;
              })}
              {blockers.length ? (
                <ul className="m-0 grid list-none gap-1 border-t border-line p-0 pt-3" aria-label={c("Blocking launch", "Yayını engelleyenler")}>
                  {blockers.map((x) => (
                    <li key={x.id}>
                      <button type="button" onClick={() => focusTask(x.id)} className="focus-ring flex w-full items-center justify-between gap-2 rounded-ui px-1.5 py-1 text-start text-[13px] text-fg hover:bg-hover">
                        {t(x.title)}
                        <span className="font-mono text-[11px] text-fg-subtle">{c(`${x.minutes} min`, `${x.minutes} dk`)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={c("Who's on it", "Kimde")} description={c("Open tasks by owner", "Sorumluya göre açık görevler")} />
            <CardBody>
              <ul className="m-0 grid list-none gap-2.5 p-0">
                {Array.from(new Set(tasks.map((x) => x.owner))).map((id) => {
                  const p = person(id);
                  const openCount = tasks.filter((x) => x.owner === id && !finished(x)).length;
                  return (
                    <li key={id} className="flex items-center gap-2.5">
                      <Avatar name={p.name} size="sm" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-fg">{p.name}</span>
                        <span className="block truncate text-[12px] text-fg-subtle">{t(p.title)}</span>
                      </span>
                      <span className="font-mono text-[12px] text-fg-muted tabular">{openCount ? c(`${openCount} open`, `${openCount} açık`) : c("clear", "bitti")}</span>
                    </li>
                  );
                })}
              </ul>
            </CardBody>
          </Card>

          <Card className="md:col-span-2 xl:col-span-1">
            <CardHeader title={c("Stuck on a step?", "Bir adımda mı takıldınız?")} description={c("A setup specialist can do it with you on a 20-minute call.", "Kurulum uzmanı 20 dakikalık bir görüşmede sizinle birlikte yapar.")} />
            <CardBody className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm">
                <CalendarClock /> {c("Book a call", "Görüşme ayarla")}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="tel:+902160000000">
                  <Phone /> +90 216 000 00 00
                </a>
              </Button>
            </CardBody>
          </Card>
        </Stagger>
      </div>
    </div>
  );
}

export function LaunchChecklistScreen() {
  return (
    <AdminShell path="/commerce">
      <LaunchChecklist />
    </AdminShell>
  );
}
