"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Badge, Button, PageHeader, Select, Stat, StatGroup, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { AccountsWatch } from "./accounts-watch";
import { CohortCard } from "./cohort-card";
import { kpis, months } from "./data";
import { MovementsChart, MrrBridge, useMonthOptions } from "./mrr-bridge";

/** SaaS metrics: ARR and retention, the month's MRR bridge, 12 months of movements, cohorts and the accounts to act on. */
export function SaasDashboard() {
  const { f, c } = useBlockFormat();
  const last = months.length - 1;
  const [index, setIndex] = React.useState(last);
  const options = useMonthOptions();
  const k = kpis(index);
  const prev = index > 0 ? kpis(index - 1) : null;
  const upTo = (fn: (i: number) => number) => months.slice(0, index + 1).map((_, i) => fn(i)).slice(-8);
  const vsPrev = c("vs previous month", "önceki aya göre");

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        size="lg"
        eyebrow={c("Subscriptions · amounts in USD", "Abonelikler · tutarlar USD")}
        title={c("SaaS metrics", "SaaS metrikleri")}
        description={c("Recurring revenue, where it moved and which customers will move it next.", "Tekrarlayan gelir, nereye hareket etti ve onu sıradaki hangi müşteriler değiştirecek.")}
        meta={index === last ? <Badge tone="warning" dot>{c("Month in progress", "Ay sürüyor")}</Badge> : <Badge tone="success" dot>{c("Closed", "Kapandı")}</Badge>}
        actions={
          <>
            <Select
              aria-label={c("Month", "Ay")}
              value={String(index)}
              onValueChange={(v) => v != null && setIndex(Number(v))}
              items={options}
              triggerClassName="w-48"
            />
            <Button variant="secondary" onClick={() => toast(c("Metrics exported", "Metrikler dışa aktarıldı"), { description: `saas-metrics-${months[index]!.month.slice(0, 7)}.csv` })}>
              <Download aria-hidden />
              {c("Export", "Dışa aktar")}
            </Button>
          </>
        }
      />

      <StatGroup columns={4} variant="plain" className="ui-rise">
        <Stat
          variant="plain"
          label="ARR"
          value={k.arr}
          format={{ type: "currency", currency: "USD", options: { notation: "compact", maximumFractionDigits: 2 } }}
          delta={prev ? k.arr / prev.arr - 1 : null}
          comparison={vsPrev}
          trend={upTo((i) => kpis(i).arr)}
        />
        <Stat
          variant="plain"
          label={c("Net revenue retention", "Net gelir elde tutma")}
          value={k.nrr}
          format={{ type: "percent", options: { maximumFractionDigits: 1 } }}
          delta={prev ? k.nrr / prev.nrr - 1 : null}
          comparison={c("trailing 12 months", "son 12 ay")}
          trend={upTo((i) => kpis(i).nrr)}
        />
        <Stat
          variant="plain"
          label={c("Quick ratio", "Hızlı oran")}
          value={f.number(k.quickRatio, { maximumFractionDigits: 1 })}
          delta={prev ? Math.round((k.quickRatio - prev.quickRatio) * 10) / 10 : null}
          deltaKind="number"
          comparison={c("gains ÷ losses · above 4 is healthy", "kazanç ÷ kayıp · 4 üstü sağlıklı")}
          trend={upTo((i) => kpis(i).quickRatio)}
        />
        <Stat
          variant="plain"
          label={c("Logo churn", "Müşteri kaybı")}
          value={k.logoChurn}
          format={{ type: "percent", options: { maximumFractionDigits: 2 } }}
          delta={prev ? k.logoChurn / prev.logoChurn - 1 : null}
          intent="lower-is-better"
          comparison={c(`${f.number(k.customers)} paying customers`, `${f.number(k.customers)} ödeme yapan müşteri`)}
          trend={upTo((i) => kpis(i).logoChurn)}
        />
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
        <MrrBridge index={index} />
        <MovementsChart index={index} onSelect={(i) => i >= 0 && setIndex(i)} />
      </div>

      <div className="mt-(--gap) grid gap-(--gap) xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <AccountsWatch />
        <CohortCard />
      </div>
    </div>
  );
}
