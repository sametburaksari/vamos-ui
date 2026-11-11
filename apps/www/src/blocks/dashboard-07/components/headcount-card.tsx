"use client";

import { Card, CardHeader } from "@vamos-ui/react";
import { BarList, ComboChart, type ChartConfig } from "@vamos-ui/react/charts";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { teamLabels } from "../../_shared/people";
import { departments, headcountTrend, ytd } from "./data";

/** Headcount over 12 months with monthly hires and leavers, plus today's split by department. */
export function HeadcountCard() {
  const { f, t, c } = useBlockFormat();
  const rows = headcountTrend.map((m) => ({ month: `${m.month}-01`, headcount: m.headcount, hires: m.hires, leavers: m.leavers }));
  const now = headcountTrend.at(-1)!.headcount;
  const yearAgo = headcountTrend[0]!.headcount;
  const config: ChartConfig = {
    hires: { label: c("Hires", "İşe alım"), color: "accent-ink", axis: "start" },
    leavers: { label: c("Leavers", "Ayrılan"), color: "chart-4", axis: "start" },
    headcount: { label: c("Headcount", "Çalışan sayısı"), color: "chart-2", axis: "end" },
  };

  return (
    <Card className="ui-rise min-w-0">
      <div className="grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <CardHeader titleAs="h2" eyebrow={c("Headcount", "Çalışan sayısı")} title={c("Growing, steadily", "İstikrarlı büyüme")} />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3 px-(--card-p) pb-2">
            <p className="font-display text-display-xl leading-none text-fg">
              <CountUp value={now} />
            </p>
            <dl className="flex gap-6 pb-1.5 text-[13px]">
              <div>
                <dt className="text-fg-subtle">{c("12-month growth", "12 aylık büyüme")}</dt>
                <dd className="font-mono text-fg tabular">+{f.percent(now / yearAgo - 1, { maximumFractionDigits: 1 })}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">{c("Hires / leavers YTD", "Giriş / çıkış (yıl)")}</dt>
                <dd className="font-mono text-fg tabular">{ytd.hires} / {ytd.leavers}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">{c("Attrition", "Ayrılma oranı")}</dt>
                <dd className="font-mono text-fg tabular">{f.percent(ytd.attrition, { maximumFractionDigits: 1 })}</dd>
              </div>
            </dl>
          </div>
          <div className="px-(--card-p) pb-(--card-p)">
            <ComboChart
              title={c("Headcount with monthly hires and leavers, last 12 months", "Son 12 ay çalışan sayısı, aylık giriş ve çıkışlar")}
              data={rows}
              x="month"
              xFormat={{ date: { month: "short" } }}
              config={config}
              bars={["hires", "leavers"]}
              lines={["headcount"]}
              startAxisLabel={c("People per month", "Aylık kişi")}
              endAxisLabel={c("Headcount", "Çalışan")}
              height="sm"
              legend="bottom"
            />
          </div>
        </div>
        <section aria-labelledby="dept-title" className="border-line px-(--card-p) pb-(--card-p) max-lg:border-t max-lg:pt-4 lg:border-s lg:pt-(--card-p)">
          <h3 id="dept-title" className="mb-3 text-[13px] font-medium text-fg">{c("By department", "Departmana göre")}</h3>
          <BarList
            aria-label={c("Headcount by department", "Departmana göre çalışan sayısı")}
            size="sm"
            data={departments.map((d) => ({ key: d.key, label: t(teamLabels[d.key]), value: d.count, delta: d.delta ? d.delta / (d.count - d.delta) : undefined }))}
          />
        </section>
      </div>
    </Card>
  );
}
