"use client";

import * as React from "react";
import { Megaphone, Share2 } from "lucide-react";
import {
  ActivityTimeline,
  AttachmentList,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  PageHeader,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  Textarea,
  cn,
  toast,
  type TimelineEntry,
} from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { healthLabels, projectStatusLabels, type Health, type Milestone } from "../../_shared/projects";
import { NOW_MS, at } from "../../_shared/time";
import { BudgetCard } from "./budget-card";
import { DEFAULT_PROJECT, clientOf, files, healthTone, impactLabels, lastUpdates, projects, schedule, tasksOf, team, type StatusUpdate } from "./data";
import { MilestoneRail } from "./milestone-rail";
import { TaskPanel } from "./task-panel";

/** Project overview: health and schedule, budget burn, tasks, team load, risks, files and activity. */
export function ProjectOverview() {
  const { f, t, c } = useBlockFormat();
  const [projectId, setProjectId] = React.useState(DEFAULT_PROJECT);
  const project = projects.find((p) => p.id === projectId)!;
  const client = clientOf(project);
  const lead = person(project.leadId);
  const s = schedule(project);

  // Per-project local edits, so switching projects and back keeps what you did.
  const [milestoneEdits, setMilestoneEdits] = React.useState<Record<string, Record<string, boolean>>>({});
  const [updates, setUpdates] = React.useState<Record<string, StatusUpdate[]>>({});
  const [dialog, setDialog] = React.useState(false);

  const milestones: Milestone[] = project.milestones.map((m) => ({ ...m, done: milestoneEdits[project.id]?.[m.id] ?? m.done }));
  const projectUpdates = [...(updates[project.id] ?? []), lastUpdates[project.id]!].filter(Boolean);
  const health: Health = projectUpdates[0]?.health ?? project.health;
  const open = tasksOf(project).filter((x) => x.status !== "done").length;
  const members = team(project);
  const usedPct = (Number(project.spent.amount) / Number(project.budget.amount)) * 100;

  const toggleMilestone = (id: string, done: boolean) => {
    setMilestoneEdits((all) => ({ ...all, [project.id]: { ...all[project.id], [id]: done } }));
    const m = project.milestones.find((x) => x.id === id)!;
    toast.success(done ? c(`“${t(m.title)}” marked done`, `“${t(m.title)}” tamamlandı`) : c(`“${t(m.title)}” reopened`, `“${t(m.title)}” yeniden açıldı`), {
      description: done ? c(`${client.name} gets it in the weekly digest.`, `${client.name} haftalık özette görecek.`) : undefined,
      action: { label: c("Undo", "Geri al"), onClick: () => setMilestoneEdits((all) => ({ ...all, [project.id]: { ...all[project.id], [id]: !done } })) },
    });
  };

  const activity: TimelineEntry[] = React.useMemo(() => {
    const items: TimelineEntry[] = projectUpdates.map((u) => ({
      id: u.id,
      at: u.at,
      avatar: { name: person(u.authorId).name },
      actor: person(u.authorId).name,
      title: c(`posted a status update · ${healthLabels[u.health].en}`, `durum güncellemesi paylaştı · ${healthLabels[u.health].tr}`),
      body: t(u.text),
      tone: healthTone[u.health],
    }));
    milestones.filter((m) => m.done).forEach((m) =>
      items.push({ id: `ms-${m.id}`, at: `${m.due}T17:00:00+03:00`, avatar: { name: lead.name }, actor: lead.name, title: c(`closed milestone “${m.title.en}”`, `“${m.title.tr}” kilometre taşını kapattı`), tone: "success" }),
    );
    files(project).slice(0, 2).forEach((fl) => items.push({ id: `fl-${fl.id}`, at: fl.uploadedAt, avatar: { name: fl.uploadedBy }, actor: fl.uploadedBy, title: c(`uploaded ${fl.name}`, `${fl.name} dosyasını yükledi`) }));
    return items;
  }, [projectUpdates, milestones, project, lead, t, c]);

  const daysLabel =
    project.status === "completed" ? c("Delivered", "Teslim edildi") : s.left >= 0 ? c(`${s.left} days left`, `${s.left} gün kaldı`) : c(`${-s.left} days late`, `${-s.left} gün gecikti`);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        size="md"
        back={{ href: "/work/projects", label: c("Projects", "Projeler") }}
        eyebrow={
          <span className="font-mono tabular">
            {project.code} · {client.name}
          </span>
        }
        title={t(project.name)}
        meta={
          <>
            <Badge tone={healthTone[health]} dot>{t(healthLabels[health])}</Badge>
            <Badge tone="outline">{t(projectStatusLabels[project.status])}</Badge>
          </>
        }
        actions={
          <>
            <Select
              aria-label={c("Switch project", "Proje değiştir")}
              value={projectId}
              onValueChange={(v) => v && setProjectId(v)}
              items={projects.map((p) => ({ value: p.id, label: `${p.code} · ${t(p.name)}`, description: clientOf(p).name }))}
              triggerClassName="w-52 max-w-full"
            />
            <Button variant="secondary" onClick={() => toast.success(c(`Read-only link for ${client.name} copied`, `${client.name} için salt okunur bağlantı kopyalandı`))}>
              <Share2 aria-hidden />
              {c("Share", "Paylaş")}
            </Button>
            <Button variant="primary" onClick={() => setDialog(true)}>
              <Megaphone aria-hidden />
              {c("Post update", "Güncelleme paylaş")}
            </Button>
          </>
        }
      />

      {/* Key figures */}
      <dl className="mb-(--gap) grid grid-cols-2 gap-px overflow-hidden rounded-ui-lg border border-line bg-line lg:grid-cols-4">
        <Kpi label={c("Complete", "Tamamlanan")} hint={c(`${Math.round(s.timePct)}% of time used`, `sürenin %${Math.round(s.timePct)} kullanıldı`)}>
          <CountUp value={project.progress} format={{ maximumFractionDigits: 0 }} duration={800} />
          <span className="text-fg-subtle">%</span>
        </Kpi>
        <Kpi label={c("Budget used", "Kullanılan bütçe")} hint={`${f.currency(project.spent.amount, project.spent.currency, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 })} / ${f.currency(project.budget.amount, project.budget.currency, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 })}`} tone={usedPct > 100 ? "danger" : usedPct > project.progress + 10 ? "warning" : undefined}>
          <CountUp value={Math.round(usedPct)} format={{ maximumFractionDigits: 0 }} duration={800} />
          <span className="text-fg-subtle">%</span>
        </Kpi>
        <Kpi label={c("Due", "Teslim")} hint={f.date(project.due, "medium")} tone={s.left < 0 && project.status !== "completed" ? "danger" : undefined}>
          <span className="text-[0.8em]">{daysLabel}</span>
        </Kpi>
        <Kpi label={c("Open tasks", "Açık görev")} hint={c(`${tasksOf(project).length} in total`, `toplam ${tasksOf(project).length}`)}>
          <CountUp value={open} duration={600} />
        </Kpi>
      </dl>

      <div className="grid gap-(--gap)">
        <MilestoneRail key={project.id} project={project} milestones={milestones} onToggle={toggleMilestone} />

        <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 content-start gap-(--gap)">
            <BudgetCard project={project} />
            <TaskPanel key={project.id} project={project} />
            <Card as="section" aria-labelledby="act-title" className="overflow-hidden">
              <CardHeader titleId="act-title" titleAs="h2" title={c("Activity", "Etkinlik")} />
              <div className="px-(--card-p) pb-(--card-p)">
                <ActivityTimeline items={activity} now={NOW_MS + 60_000} timeZone="Europe/Istanbul" />
              </div>
            </Card>
          </div>

          <div className="grid min-w-0 content-start gap-(--gap)">
            <Card as="section" aria-labelledby="team-title" className="overflow-hidden">
              <CardHeader titleId="team-title" titleAs="h2" title={c("Team this week", "Bu hafta ekip")} action={<AvatarGroup size="sm" max={4}>{members.map((m) => <Avatar key={m.id} name={person(m.id).name} />)}</AvatarGroup>} />
              <ul className="divide-y divide-line border-t border-line">
                {members.map((m) => {
                  const p = person(m.id);
                  const over = m.booked > m.capacity;
                  return (
                    <li key={m.id} className="grid grid-cols-[auto_minmax(0,1fr)_7rem] items-center gap-3 px-(--card-p) py-2.5">
                      <Avatar name={p.name} size="sm" status={p.status} />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-fg">
                          {p.name}
                          {m.id === project.leadId ? <span className="ms-1.5 text-xs text-fg-subtle">{c("lead", "lider")}</span> : null}
                        </p>
                        <p className="truncate text-xs text-fg-muted">{t(m.role)}</p>
                      </div>
                      <div>
                        <Progress size="xs" value={Math.min(m.booked, m.capacity)} max={m.capacity} tone={over ? "danger" : "accent"} aria-label={c(`${p.name}: ${m.booked} of ${m.capacity} hours`, `${p.name}: ${m.capacity} saatin ${m.booked} saati`)} />
                        <p className={cn("mt-1 text-end font-mono text-[11px] tabular", over ? "text-danger" : "text-fg-subtle")}>
                          {m.booked}/{m.capacity} {c("h", "sa")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card as="section" aria-labelledby="risk-title" className="overflow-hidden">
              <CardHeader titleId="risk-title" titleAs="h2" title={c("Risks", "Riskler")} description={project.risks.length ? undefined : c("Nothing flagged. Keep it that way.", "İşaretlenmiş risk yok.")} />
              {project.risks.length ? (
                <ul className="grid gap-2 px-(--card-p) pb-(--card-p)">
                  {project.risks.map((r) => (
                    <li key={r.id} className={cn("rounded-ui border-s-2 px-3 py-2.5 surface-2", r.impact === "high" ? "border-s-danger" : r.impact === "medium" ? "border-s-warning" : "border-s-line")}>
                      <p className="text-sm text-fg">{t(r.title)}</p>
                      <p className="mt-0.5 text-xs text-fg-subtle">{t(impactLabels[r.impact])}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>

            <Card as="section" aria-labelledby="files-title" className="overflow-hidden">
              <CardHeader titleId="files-title" titleAs="h2" title={c("Files", "Dosyalar")} />
              <div className="px-(--card-p) pb-(--card-p)">
                <AttachmentList
                  key={project.id}
                  aria-label={c("Project files", "Proje dosyaları")}
                  size="sm"
                  items={files(project)}
                  onPreview={(fl) => toast(c(`Opening ${fl.name}`, `${fl.name} açılıyor`))}
                  onAddFiles={(added) => toast.success(c(`${added.length} file(s) uploading`, `${added.length} dosya yükleniyor`))}
                />
              </div>
            </Card>


          </div>
        </div>
      </div>

      <UpdateDialog
        open={dialog}
        onOpenChange={setDialog}
        current={health}
        onPost={(u) => {
          setUpdates((all) => ({ ...all, [project.id]: [{ ...u, id: `su-new-${(all[project.id]?.length ?? 0) + 1}` }, ...(all[project.id] ?? [])] }));
          setDialog(false);
          toast.success(c("Status update posted", "Durum güncellemesi paylaşıldı"), { description: c(`${project.memberIds.length} teammates and ${client.name} notified`, `${project.memberIds.length} ekip üyesi ve ${client.name} bilgilendirildi`) });
        }}
      />
    </div>
  );
}

function Kpi({ label, hint, tone, children }: { label: string; hint: string; tone?: "danger" | "warning"; children: React.ReactNode }) {
  return (
    <div className="min-w-0 bg-surface px-4 py-3.5 sm:px-5">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className={cn("mt-1 font-mono text-2xl leading-tight tracking-tight tabular", tone === "danger" ? "text-danger" : tone === "warning" ? "text-warning" : "text-fg")}>{children}</dd>
      <dd className="mt-0.5 truncate text-xs text-fg-muted">{hint}</dd>
    </div>
  );
}

function UpdateDialog({ open, onOpenChange, current, onPost }: { open: boolean; onOpenChange: (o: boolean) => void; current: Health; onPost: (u: Omit<StatusUpdate, "id">) => void }) {
  const { t, c } = useBlockFormat();
  const [health, setHealth] = React.useState<Health>(current);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    if (open) {
      setHealth(current);
      setText("");
      setError(false);
    }
  }, [open, current]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("Post a status update", "Durum güncellemesi paylaş")} description={c("Goes to the team and the client's portal.", "Ekibe ve müşteri portalına gider.")} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) {
              setError(true);
              return;
            }
            onPost({ authorId: "p-defne", at: at(0, "10:25"), health, text: { en: text.trim(), tr: text.trim() } });
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("Health", "Durum")}>
              <RadioGroup value={health} onValueChange={(v) => setHealth(v as Health)} variant="segmented" aria-label={c("Health", "Durum")}>
                {(["on-track", "at-risk", "off-track"] as Health[]).map((h) => (
                  <RadioGroupItem key={h} value={h} label={t(healthLabels[h])} />
                ))}
              </RadioGroup>
            </Field>
            <Field label={c("What changed", "Ne değişti")} error={error ? c("Write a sentence or two.", "Bir iki cümle yazın.") : undefined} required>
              <Textarea rows={4} value={text} onChange={(e) => { setText(e.target.value); setError(false); }} placeholder={c("Shipped, slipped, decided, blocked…", "Teslim edilen, kayan, karar verilen, takılan…")} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{c("Cancel", "Vazgeç")}</Button>
            <Button type="submit" variant="primary">{c("Post update", "Paylaş")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
