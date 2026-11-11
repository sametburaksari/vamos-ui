"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, ToggleGroup, ToggleGroupItem, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { BurnMap } from "./burn-map";
import { ProjectList } from "./project-list";
import { ProjectSheet } from "./project-sheet";
import { MilestoneRunway, RiskRegister } from "./runway-risks";
import { TODAY, healthLabels, initialDone, initialRisks, projects, type Health, type Risk, type RiskImpact } from "./data";

type Filter = Health | "all";

/** Agency project portfolio: burn against delivery, every project's health, milestones and risks. */
export function PortfolioDashboard() {
  const { f, t, c } = useBlockFormat();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [health, setHealth] = React.useState<Record<string, Health>>({});
  const [done, setDone] = React.useState(initialDone);
  const [risks, setRisks] = React.useState<Risk[]>(initialRisks);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const healthOf = (id: string) => health[id] ?? projects.find((p) => p.id === id)!.health;
  const visible = filter === "all" ? projects : projects.filter((p) => healthOf(p.id) === filter);
  const count = (h: Health) => projects.filter((p) => healthOf(p.id) === h).length;

  const changeHealth = (id: string, h: Health) => {
    const before = healthOf(id);
    if (before === h) return;
    setHealth((s) => ({ ...s, [id]: h }));
    const p = projects.find((x) => x.id === id)!;
    toast.success(c(`${p.code} marked ${t(healthLabels[h]).toLowerCase()}`, `${p.code}: ${t(healthLabels[h])}`), {
      description: c("The client sees this on their weekly status page.", "Müşteri bunu haftalık durum sayfasında görür."),
      action: { label: c("Undo", "Geri al"), onClick: () => setHealth((s) => ({ ...s, [id]: before })) },
    });
  };
  const toggleMilestone = (key: string, value: boolean, title: string) => {
    setDone((s) => ({ ...s, [key]: value }));
    toast(value ? c(`“${title}” done`, `“${title}” tamamlandı`) : c(`“${title}” reopened`, `“${title}” yeniden açıldı`), {
      action: { label: c("Undo", "Geri al"), onClick: () => setDone((s) => ({ ...s, [key]: !value })) },
    });
  };
  const resolveRisk = (r: Risk) => {
    setRisks((l) => l.filter((x) => x.id !== r.id));
    toast.success(c("Risk resolved", "Risk kapatıldı"), {
      description: t(r.title),
      action: { label: c("Undo", "Geri al"), onClick: () => setRisks((l) => [...l, r]) },
    });
  };
  const addRisk = (projectId: string, title: string, impact: RiskImpact) => {
    const p = projects.find((x) => x.id === projectId)!;
    const r: Risk = { id: `${projectId}-new-${Date.now()}`, projectId, title: { en: title, tr: title }, impact, ownerId: p.leadId };
    setRisks((l) => [r, ...l]);
    toast.success(c(`Risk logged on ${p.code}`, `${p.code} için risk kaydedildi`), { description: title });
  };

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        size="lg"
        eyebrow={c(`Delivery · week of ${f.date(TODAY, { month: "long", day: "numeric" })}`, `Teslimat · ${f.date(TODAY, { month: "long", day: "numeric" })} haftası`)}
        title={c("Project portfolio", "Proje portföyü")}
        description={c("Where the money goes against what is delivered, and what needs a decision.", "Para nereye gidiyor, karşılığında ne teslim ediliyor ve neye karar verilmeli.")}
        actions={
          <Button variant="secondary" onClick={() => toast(c("Portfolio pack exported", "Portföy raporu dışa aktarıldı"), { description: "portfolio-review-w47.pdf" })}>
            <Download aria-hidden />
            {c("Review pack", "İnceleme raporu")}
          </Button>
        }
      />

      <div className="-mx-1 mb-(--gap) overflow-x-auto px-1 pb-1">
        <ToggleGroup aria-label={c("Health", "Durum")} size="sm" value={filter} onValueChange={(v) => v && setFilter(v as Filter)}>
          <ToggleGroupItem value="all">
            {c("All", "Tümü")} <span className="font-mono text-fg-subtle tabular">{projects.length}</span>
          </ToggleGroupItem>
          {(["on-track", "at-risk", "off-track"] as const).map((h) => (
            <ToggleGroupItem key={h} value={h}>
              {t(healthLabels[h])} <span className="font-mono text-fg-subtle tabular">{count(h)}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <BurnMap projects={visible} health={Object.fromEntries(projects.map((p) => [p.id, healthOf(p.id)]))} onOpen={setOpenId} />

      <div className="mt-(--gap)">
        <ProjectList projects={visible} health={health} done={done} onOpen={setOpenId} />
      </div>

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <MilestoneRunway projects={visible} done={done} onOpen={setOpenId} />
        <RiskRegister risks={risks.filter((r) => visible.some((p) => p.id === r.projectId))} onResolve={resolveRisk} onOpen={setOpenId} />
      </div>

      <ProjectSheet
        project={openId ? projects.find((p) => p.id === openId) ?? null : null}
        health={health}
        done={done}
        risks={risks}
        onClose={() => setOpenId(null)}
        onHealth={changeHealth}
        onMilestone={toggleMilestone}
        onAddRisk={addRisk}
      />
    </div>
  );
}
