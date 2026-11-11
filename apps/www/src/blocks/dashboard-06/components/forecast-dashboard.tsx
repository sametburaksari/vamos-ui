"use client";

import * as React from "react";
import { Download, Plus } from "lucide-react";
import { Badge, Button, PageHeader, Select, toast } from "@vamos-ui/react";
import { repQuota } from "../../_shared/deals";
import { useBlockFormat } from "../../_shared/format";
import { person } from "../../_shared/people";
import { DealsTable, type DealPatch } from "./deals-table";
import { ForecastHero, type ForecastTotals } from "./forecast-hero";
import { Leaderboard } from "./leaderboard";
import { StageLanes } from "./stage-lanes";
import { WinRate } from "./win-rate";
import { FX, QUARTER, categoryOf, daysLeftInQuarter, deals as seed, inQuarter, reps, teamQuota, toTry, type Deal, type DealStage } from "./data";

function totalsOf(list: Deal[]): ForecastTotals {
  const t: ForecastTotals = { won: 0, commit: 0, best: 0, pipeline: 0, counts: { won: 0, commit: 0, best: 0, pipeline: 0 } };
  for (const d of list) {
    const cat = categoryOf(d.stage);
    if (!cat) continue;
    if (cat === "won" ? d.closeDate < QUARTER.start : !inQuarter(d)) continue;
    t[cat] += toTry(d.amount);
    t.counts[cat] += 1;
  }
  return t;
}

/** CRM forecast: commit vs quota for the quarter, open pipeline per stage, win rate and reps. */
export function ForecastDashboard() {
  const { c } = useBlockFormat();
  const [deals, setDeals] = React.useState<Deal[]>(seed);
  const [rep, setRep] = React.useState<string | null>(null);
  const [stage, setStage] = React.useState<DealStage | null>(null);
  const [scope, setScope] = React.useState<"quarter" | "all">("quarter");

  const scoped = rep ? deals.filter((d) => d.ownerId === rep) : deals;
  const quota = rep ? Number(repQuota[rep]) : teamQuota;

  // Optimistic: apply at once, offer undo, keep the previous version for it.
  const update = (id: string, patch: DealPatch, message: { en: string; tr: string }) => {
    const before = deals.find((d) => d.id === id);
    if (!before) return;
    setDeals((all) => all.map((d) => (d.id === id ? { ...d, ...patch, probability: patch.stage ? probabilityOf(patch.stage) : d.probability } : d)));
    toast.success(c(message.en, message.tr), {
      description: c("Forecast updated", "Tahmin güncellendi"),
      action: { label: c("Undo", "Geri al"), onClick: () => setDeals((all) => all.map((d) => (d.id === id ? before : d))) },
    });
  };

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        size="lg"
        eyebrow={c(`${QUARTER.label} · ${daysLeftInQuarter} days left`, `${QUARTER.label} · ${daysLeftInQuarter} gün kaldı`)}
        title={c("Forecast", "Satış tahmini")}
        description={c(
          "What the team can call for the quarter, where the rest of the pipeline sits and who is carrying it.",
          "Ekibin bu çeyrek için söz verebileceği tutar, kalan fırsatların durumu ve kimin taşıdığı.",
        )}
        meta={
          <Badge tone="neutral" shape="square" className="font-mono">
            USD {FX.USD} · EUR {FX.EUR}
          </Badge>
        }
        actions={
          <>
            <Select
              aria-label={c("Sales rep", "Satış temsilcisi")}
              size="md"
              value={rep ?? "all"}
              onValueChange={(v) => setRep(!v || v === "all" ? null : v)}
              items={[{ value: "all", label: c("Whole team", "Tüm ekip") }, ...reps.map((id) => ({ value: id, label: person(id).name }))]}
              className="w-44"
            />
            <Button variant="secondary" onClick={() => toast(c("Forecast exported", "Tahmin dışa aktarıldı"), { description: `forecast-${QUARTER.label.replace(" ", "-").toLowerCase()}.xlsx` })}>
              <Download aria-hidden />
              {c("Export", "Dışa aktar")}
            </Button>
            <Button variant="primary" onClick={() => toast.info(c("New deal form opens here", "Yeni fırsat formu burada açılır"))}>
              <Plus aria-hidden />
              {c("New deal", "Yeni fırsat")}
            </Button>
          </>
        }
      />

      <ForecastHero totals={totalsOf(scoped)} quota={quota} scopeLabel={rep ? person(rep).name : c("Whole team", "Tüm ekip")} />

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_320px]">
        <StageLanes deals={scope === "quarter" ? scoped.filter(inQuarter) : scoped} scopeLabel={scope === "quarter" ? QUARTER.label : c("all open", "tüm açıklar")} active={stage} onToggle={(s) => setStage((cur) => (cur === s ? null : s))} />
        <WinRate deals={scoped} />
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <DealsTable deals={scoped} stage={stage} onClearStage={() => setStage(null)} scope={scope} onScopeChange={setScope} onUpdate={update} />
        <Leaderboard deals={deals} selected={rep} onSelect={setRep} />
      </div>
    </div>
  );
}

const probabilityOf = (s: DealStage) => ({ discovery: 10, qualified: 25, proposal: 50, negotiation: 75, won: 100, lost: 0 })[s];
