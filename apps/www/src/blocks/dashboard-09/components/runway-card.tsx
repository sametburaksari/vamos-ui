"use client";

import { Card, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { LineChart, type ChartConfig } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import { projection, scenarios, tryAxis, tryCompact, tryExact, type Scenario } from "./data";
import { LiveCount } from "./live-count";

/** Cash on hand, burn and runway, with an 18-month projection for the chosen scenario. */
export function RunwayCard({ cash, scenario, onScenario }: { cash: number; scenario: Scenario; onScenario: (s: Scenario) => void }) {
  const { f, t, c } = useBlockFormat();
  const p = projection(cash, scenario);
  const s = scenarios.find((x) => x.key === scenario)!;
  const config: ChartConfig = {
    actual: { label: c("Month-end cash", "Ay sonu nakit"), color: "chart-2", format: tryExact },
    projected: { label: c("Projected", "Tahmini"), color: "accent-ink", format: tryExact, pattern: "dashed" },
  };
  const months = Math.floor(p.runway);
  const tone = p.runway < 9 ? "text-danger" : p.runway < 15 ? "text-warning" : "text-success";

  return (
    <Card className="ui-rise min-w-0 overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6 border-line p-(--card-p) max-lg:border-b lg:border-e">
          <div>
            <p className="text-eyebrow text-fg-subtle">{c("Cash on hand", "Eldeki nakit")}</p>
            <p className="mt-2 font-display text-display-l leading-none text-fg">
              <LiveCount value={Math.round(cash)} format={{ style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", minimumFractionDigits: 0, maximumFractionDigits: 0 }} />
            </p>
            <p className="mt-1.5 text-[13px] text-fg-muted">{c("Across 3 bank accounts, today 10:24", "3 banka hesabında, bugün 10:24")}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-fg-subtle">{c("Net burn / month", "Aylık net harcama")}</dt>
              <dd className="mt-0.5 font-mono text-lg font-medium text-fg tabular">{tryCompact(f, p.monthlyBurn)}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-subtle">{c("Runway", "Nakit ömrü")}</dt>
              <dd className={cn("mt-0.5 font-mono text-lg font-medium tabular", tone)}>
                {c(`${f.number(p.runway, { maximumFractionDigits: 1 })} months`, `${f.number(p.runway, { maximumFractionDigits: 1 })} ay`)}
              </dd>
            </div>
          </dl>
          <div className="mt-auto rounded-ui border border-line bg-surface-2 p-3 text-[13px]">
            <p className="text-fg-muted">
              {p.outMonth
                ? c("At this pace cash runs out in", "Bu hızla nakit şu ayda biter:")
                : c(`Cash lasts beyond the ${18}-month window.`, `Nakit ${18} aylık pencerenin ötesine yeter.`)}
            </p>
            {p.outMonth ? <p className="mt-0.5 font-medium text-fg">{f.date(p.outMonth, "month-year")}</p> : null}
            <p className="mt-2 text-xs text-fg-subtle">{c(`${months} full months of payroll, rent and suppliers.`, `${months} tam ay maaş, kira ve tedarikçi.`)}</p>
          </div>
        </div>

        <div className="min-w-0 p-(--card-p)">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-medium text-fg">{c("Runway projection", "Nakit projeksiyonu")}</h2>
              <p className="text-[13px] text-fg-muted">{t(s.hint)}</p>
            </div>
            <ToggleGroup aria-label={c("Scenario", "Senaryo")} size="sm" value={scenario} onValueChange={(v) => v && onScenario(v as Scenario)}>
              {scenarios.map((x) => (
                <ToggleGroupItem key={x.key} value={x.key}>{t(x.label)}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <LineChart
            title={c(`Cash balance, last 12 months and 18-month projection: ${t(s.label)}`, `Nakit bakiyesi, son 12 ay ve 18 aylık projeksiyon: ${t(s.label)}`)}
            data={p.rows}
            x="month"
            xFormat={{ date: { month: "short", year: "numeric" } }}
            yFormat={tryAxis}
            config={config}
            dots="none"
            height="md"
            legend="bottom"
            tableToggle
          />
        </div>
      </div>
    </Card>
  );
}
