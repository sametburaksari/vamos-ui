"use client";

import * as React from "react";
import { Card, CardHeader, Progress, cn } from "@vamos-ui/react";
import { AreaChart, type ChartConfig } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import type { Project } from "../../_shared/projects";
import { burn, forecast } from "./data";

/** Spend against an even plan, the budget line, and the forecast at completion. */
export function BudgetCard({ project }: { project: Project }) {
  const { f, c } = useBlockFormat();
  const cur = project.budget.currency;
  const rows = React.useMemo(() => burn(project), [project]);
  const fc = forecast(project);
  const budget = Number(project.budget.amount);
  const spent = Number(project.spent.amount);
  const money = (v: number) => f.currency(v, cur, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const config: ChartConfig = {
    planned: { label: c("Even plan", "Eşit dağılım planı"), color: "fg-subtle", format: { currency: cur } },
    actual: { label: c("Spent", "Harcanan"), color: "chart-1", format: { currency: cur } },
  };
  const over = fc.variance > 0.005;

  return (
    <Card as="section" aria-labelledby="budget-title" className="min-w-0 overflow-hidden">
      <CardHeader titleId="budget-title" titleAs="h2" title={c("Budget", "Bütçe")} description={c("Cumulative spend by week, time and expenses", "Haftalık kümülatif harcama, emek ve gider")} />
      <div className="grid gap-4 px-(--card-p) pb-(--card-p)">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="min-w-0">
            <dt className="text-xs text-fg-subtle">{c("Spent", "Harcanan")}</dt>
            <dd className="mt-0.5 truncate font-mono text-lg text-fg tabular">{money(spent)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-fg-subtle">{c("Budget", "Bütçe")}</dt>
            <dd className="mt-0.5 truncate font-mono text-lg text-fg tabular">{money(budget)}</dd>
          </div>
          <div className="col-span-2 min-w-0 sm:col-span-1">
            <dt className="text-xs text-fg-subtle">{c("Forecast at completion", "Tamamlanma tahmini")}</dt>
            <dd className={cn("mt-0.5 truncate font-mono text-lg tabular", over ? "text-danger" : "text-fg")}>
              {money(fc.eac)}
              <span className="ms-1.5 text-xs">{over ? "+" : ""}{f.percent(fc.variance, { maximumFractionDigits: 0 })}</span>
            </dd>
          </div>
        </dl>
        <Progress size="sm" value={spent} max={budget} tone="auto" aria-label={c("Budget used", "Kullanılan bütçe")} />
        <AreaChart
          title={c(`${project.code} cumulative spend against plan`, `${project.code} plana göre kümülatif harcama`)}
          data={rows}
          x="week"
          xFormat={{ date: { day: "numeric", month: "short" } }}
          yFormat={{ currency: cur, compact: true }}
          config={config}
          height={200}
          fill="gradient"
          curve="monotone"
          reference={[{ y: budget, label: c("Budget", "Bütçe"), color: "danger", labelPosition: "above" }]}
          animate={false}
        />
      </div>
    </Card>
  );
}
