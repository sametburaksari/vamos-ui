"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, ToggleGroup, ToggleGroupItem, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { AttributionCard } from "./attribution-card";
import { CampaignTable } from "./campaign-table";
import { KpiLedger } from "./kpi-ledger";
import { PerformanceCard } from "./performance-card";
import { TODAY, campaigns as seed, channels, ranges, type Campaign, type ChannelKey, type Model, type Range } from "./data";

/** Marketing campaigns: spend and return, cost per acquisition, channel mix under different attribution models, pacing. */
export function MarketingDashboard() {
  const { f, t, c } = useBlockFormat();
  const [range, setRange] = React.useState<Range>("30");
  const [picked, setPicked] = React.useState<ChannelKey[]>(channels);
  const [model, setModel] = React.useState<Model>("position");
  const [list, setList] = React.useState<Campaign[]>(seed);
  const only = picked.length ? picked : channels;

  const update = (id: string, change: Partial<Campaign>, message: string, description?: string) => {
    const before = list.find((x) => x.id === id)!;
    setList((l) => l.map((x) => (x.id === id ? { ...x, ...change } : x)));
    toast.success(message, { description, action: { label: c("Undo", "Geri al"), onClick: () => setList((l) => l.map((x) => (x.id === id ? before : x))) } });
  };

  return (
    <div className="mx-auto max-w-[1360px]">
      <PageHeader
        size="lg"
        eyebrow={c(`Growth · Kiln & Linen · to ${f.date(TODAY, { month: "long", day: "numeric" })}`, `Büyüme · Kiln & Linen · ${f.date(TODAY, { month: "long", day: "numeric" })} itibarıyla`)}
        title={c("Campaigns", "Kampanyalar")}
        description={c("What the money bought, which channels earn their keep, and where budgets run hot.", "Para neyi satın aldı, hangi kanal kendini amorti ediyor, hangi bütçe hızlı tükeniyor.")}
        actions={
          <Button variant="secondary" onClick={() => toast(c("Report exported", "Rapor dışa aktarıldı"), { description: `campaigns-${range}d-${TODAY}.csv` })}>
            <Download aria-hidden />
            {c("Export", "Dışa aktar")}
          </Button>
        }
      />

      <div className="mb-(--gap) flex flex-wrap items-center gap-2">
        <ToggleGroup aria-label={c("Date range", "Tarih aralığı")} size="sm" value={range} onValueChange={(v) => v && setRange(v as Range)}>
          {ranges.map((r) => (
            <ToggleGroupItem key={r.key} value={r.key}>{t(r.label)}</ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-xs text-fg-subtle">{c("vs the previous period of the same length", "aynı uzunluktaki önceki döneme göre")}</span>
      </div>

      <KpiLedger range={range} only={only} />

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <PerformanceCard range={range} picked={picked} onPicked={setPicked} />
        <AttributionCard model={model} onModel={setModel} range={range} />
      </div>

      <div className="mt-(--gap)">
        <CampaignTable
          campaigns={list}
          onToggle={(cp, on) =>
            update(cp.id, { status: on ? "active" : "paused" }, on ? c(`${cp.name} resumed`, `${cp.name} yeniden başladı`) : c(`${cp.name} paused`, `${cp.name} duraklatıldı`), on ? c("Ads start serving again within 15 minutes.", "Reklamlar 15 dakika içinde yeniden yayına girer.") : c("Spend stops; the remaining budget is kept.", "Harcama durur; kalan bütçe korunur."))
          }
          onBudget={(cp, amount) =>
            update(cp.id, { budget: { amount, currency: cp.budget.currency } }, c(`Budget updated for ${cp.name}`, `${cp.name} bütçesi güncellendi`), f.currency(amount, { currency: cp.budget.currency, currencyDisplay: "narrowSymbol" }, { maximumFractionDigits: 0 }))
          }
        />
      </div>
    </div>
  );
}
