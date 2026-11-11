"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Avatar, Badge, Button, Checkbox, Field, Input, Select, Sheet, SheetBody, SheetContent, SheetHeader, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { peopleById } from "../../_shared/people";
import { TODAY, burnOf, clientOf, daysBetween, healthLabels, healthTone, impactLabels, tryCompact, type Health, type Project, type Risk, type RiskImpact } from "./data";

export interface ProjectSheetProps {
  project: Project | null;
  health: Record<string, Health>;
  done: Record<string, boolean>;
  risks: Risk[];
  onClose: () => void;
  onHealth: (id: string, h: Health) => void;
  onMilestone: (key: string, done: boolean, title: string) => void;
  onAddRisk: (projectId: string, title: string, impact: RiskImpact) => void;
}

/** One project in a side sheet: health call, budget forecast, milestone checklist, team and risks. */
export function ProjectSheet({ project, health, done, risks, onClose, onHealth, onMilestone, onAddRisk }: ProjectSheetProps) {
  const { f, t, c } = useBlockFormat();
  const [shown, setShown] = React.useState(project);
  const [title, setTitle] = React.useState("");
  const [impact, setImpact] = React.useState<RiskImpact>("medium");
  const [touched, setTouched] = React.useState(false);
  React.useEffect(() => {
    if (project) {
      setShown(project);
      setTitle("");
      setTouched(false);
    }
  }, [project]);
  const p = project ?? shown;
  if (!p) return null;
  const b = burnOf(p);
  const h = health[p.id] ?? p.health;
  const mine = risks.filter((r) => r.projectId === p.id);
  const pct = (v: number) => f.percent(v, { maximumFractionDigits: 0 });
  const error = touched && title.trim().length < 6 ? c("Describe the risk in a few words.", "Riski birkaç kelimeyle anlatın.") : undefined;

  return (
    <Sheet open={!!project} onOpenChange={(v) => !v && onClose()}>
      <SheetContent size="md">
        <SheetHeader title={t(p.name)} description={`${p.code} · ${clientOf(p)?.name ?? ""} · ${f.dateRange(p.start, p.due, { month: "short", day: "numeric", year: "numeric" })}`} />
        <SheetBody className="space-y-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <Field label={c("Health this week", "Bu haftaki durum")}>
              <Select
                value={h}
                onValueChange={(v) => v && onHealth(p.id, v as Health)}
                items={(["on-track", "at-risk", "off-track"] as const).map((k) => ({ value: k, label: t(healthLabels[k]) }))}
              />
            </Field>
            <Badge tone={healthTone[h]} size="lg">{t(healthLabels[h])}</Badge>
          </div>

          <dl className="grid grid-cols-3 gap-3 rounded-ui border border-line p-3 text-[13px]">
            <div>
              <dt className="text-xs text-fg-subtle">{c("Budget", "Bütçe")}</dt>
              <dd className="mt-0.5 font-mono text-fg tabular">{tryCompact(f, b.budget)}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Spent", "Harcanan")}</dt>
              <dd className="mt-0.5 font-mono text-fg tabular">
                {tryCompact(f, b.spent)} <span className="text-fg-subtle">{pct(b.used)}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Forecast", "Tahmin")}</dt>
              <dd className={cn("mt-0.5 font-mono tabular", b.eac > b.budget ? "text-danger" : "text-fg")}>{tryCompact(f, b.eac)}</dd>
            </div>
            {p.budget.currency !== "TRY" ? (
              <p className="col-span-3 text-xs text-fg-subtle">
                {c(`Contract in ${p.budget.currency}: ${f.currency(p.budget.amount, { currency: p.budget.currency, currencyDisplay: "narrowSymbol" }, { maximumFractionDigits: 0 })}, shown in TRY at the reporting rate.`, `Sözleşme ${p.budget.currency}: ${f.currency(p.budget.amount, { currency: p.budget.currency, currencyDisplay: "narrowSymbol" }, { maximumFractionDigits: 0 })}, raporlama kuruyla TL gösterilir.`)}
              </p>
            ) : null}
          </dl>

          <section>
            <h3 className="mb-2 text-[13px] font-medium text-fg">{c("Milestones", "Kilometre taşları")}</h3>
            <ul className="divide-y divide-line rounded-ui border border-line">
              {p.milestones.map((m) => {
                const key = `${p.id}:${m.id}`;
                const isDone = done[key] ?? m.done;
                const late = !isDone && daysBetween(m.due, TODAY) > 0;
                return (
                  <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                    <Checkbox
                      checked={isDone}
                      onCheckedChange={(v) => onMilestone(key, v === true, t(m.title))}
                      label={<span className={cn("text-[13px]", isDone ? "text-fg-muted line-through" : "text-fg")}>{t(m.title)}</span>}
                      className="min-w-0 flex-1"
                    />
                    <span className={cn("shrink-0 text-xs tabular", late ? "text-danger" : "text-fg-subtle")}>{f.date(m.due, { month: "short", day: "numeric" })}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-[13px] font-medium text-fg">{c("Team", "Ekip")}</h3>
            <ul className="flex flex-wrap gap-2">
              {p.memberIds.map((id) => {
                const m = peopleById[id]!;
                return (
                  <li key={id} className="inline-flex items-center gap-2 rounded-full border border-line py-0.5 ps-0.5 pe-2.5 text-xs text-fg">
                    <Avatar size="xs" name={m.name} />
                    {m.name}
                    {id === p.leadId ? <span className="text-fg-subtle">· {c("lead", "lider")}</span> : null}
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h3 className="mb-2 text-[13px] font-medium text-fg">{c("Risks", "Riskler")}</h3>
            {mine.length ? (
              <ul className="mb-3 space-y-2">
                {mine.map((r) => (
                  <li key={r.id} className="flex items-start gap-2 text-[13px] text-fg">
                    <Badge size="sm" tone={r.impact === "high" ? "danger" : r.impact === "medium" ? "warning" : "neutral"}>{t(impactLabels[r.impact])}</Badge>
                    {t(r.title)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-3 text-[13px] text-fg-muted">{c("No open risks.", "Açık risk yok.")}</p>
            )}
            <form
              className="grid gap-2 rounded-ui bg-surface-2 p-3 sm:grid-cols-[minmax(0,1fr)_8.5rem]"
              onSubmit={(e) => {
                e.preventDefault();
                setTouched(true);
                if (title.trim().length < 6) return;
                onAddRisk(p.id, title.trim(), impact);
                setTitle("");
                setTouched(false);
              }}
            >
              <Field label={c("New risk", "Yeni risk")} error={error}>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => title && setTouched(true)} placeholder={c("Supplier API not ready for testing", "Tedarikçi API'si teste hazır değil")} />
              </Field>
              <Field label={c("Impact", "Etki")}>
                <Select value={impact} onValueChange={(v) => v && setImpact(v as RiskImpact)} items={(["high", "medium", "low"] as const).map((k) => ({ value: k, label: t(impactLabels[k]) }))} />
              </Field>
              <Button type="submit" variant="secondary" size="sm" className="justify-self-start sm:col-span-2">
                <Plus aria-hidden />
                {c("Log risk", "Riski kaydet")}
              </Button>
            </form>
          </section>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
