"use client";

import { Card, CardBody, CardHeader, cn } from "@vamos-ui/react";
import { BarChart, type ChartConfig } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import { ageingBucket, ageingLabels, buckets, cashBalance, toTry, tryAxis, tryCompact, type Invoice } from "./data";

/** Money in and out per month with the net as a line. */
export function CashFlowCard() {
  const { c } = useBlockFormat();
  const rows = cashBalance.map((r) => ({ month: r.month, cashIn: Number(r.cashIn), cashOut: Number(r.cashOut), net: Number(r.cashIn) - Number(r.cashOut) }));
  const config: ChartConfig = {
    cashIn: { label: c("Cash in", "Giren"), color: "chart-2", format: tryAxis, axis: "start" },
    cashOut: { label: c("Cash out", "Çıkan"), color: "chart-4", format: tryAxis, axis: "start" },
  };
  const negMonths = rows.filter((r) => r.net < 0).length;
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "120ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Cash in and out", "Nakit giriş ve çıkışı")}
        description={c(`Last 12 months · in ${negMonths} of them more went out than came in`, `Son 12 ay · ${negMonths} ayında çıkan giren nakitten fazlaydı`)}
      />
      <CardBody className="pt-1">
        <BarChart
          title={c("Monthly cash in and cash out, last 12 months", "Son 12 ay aylık nakit girişi ve çıkışı")}
          data={rows}
          x="month"
          xFormat={{ date: { month: "short" } }}
          yFormat={tryAxis}
          config={config}
          series={["cashIn", "cashOut"]}
          height="md"
          legend="bottom"
          tableToggle
        />
      </CardBody>
    </Card>
  );
}

/** Receivables and payables by days past due, mirrored on one axis. */
export function AgeingCard({ open }: { open: Invoice[] }) {
  const { f, t, c } = useBlockFormat();
  const sumOf = (dir: Invoice["direction"], b: string) =>
    open.filter((i) => i.direction === dir && ageingBucket(i) === b).reduce((s, i) => s + toTry(i.balance), 0);
  const rows = buckets.map((b) => ({ b, ar: sumOf("receivable", b), ap: sumOf("payable", b) }));
  const max = Math.max(1, ...rows.flatMap((r) => [r.ar, r.ap]));
  const totalAr = rows.reduce((s, r) => s + r.ar, 0);
  const totalAp = rows.reduce((s, r) => s + r.ap, 0);
  const overdueAr = totalAr - rows[0]!.ar;

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "180ms" }}>
      <CardHeader titleAs="h2" title={c("Ageing", "Yaşlandırma")} description={c("Open balances by days past due", "Vadesi geçen gün sayısına göre açık bakiyeler")} />
      <CardBody className="pt-1">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-x-3 pb-2 text-xs">
          <div>
            <p className="text-fg-subtle">{c("Receivable", "Alacak")}</p>
            <p className="font-mono text-[15px] font-medium text-fg tabular">{tryCompact(f, totalAr)}</p>
          </div>
          <span />
          <div className="text-end">
            <p className="text-fg-subtle">{c("Payable", "Borç")}</p>
            <p className="font-mono text-[15px] font-medium text-fg tabular">{tryCompact(f, totalAp)}</p>
          </div>
        </div>
        <table className="w-full border-separate border-spacing-y-1.5 text-xs">
          <caption className="sr-only">{c("Receivables and payables by ageing bucket", "Yaşlandırma dilimine göre alacak ve borçlar")}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{c("Receivable", "Alacak")}</th>
              <th scope="col">{c("Days past due", "Gecikme")}</th>
              <th scope="col">{c("Payable", "Borç")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.b}>
                <td className="w-[42%] p-0">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-fg-muted tabular">{r.ar ? tryCompact(f, r.ar) : "—"}</span>
                    <span aria-hidden className="block h-5 max-w-[70%] rounded-s-ui-sm" style={{ width: `${(r.ar / max) * 70}%`, background: i === 0 ? "var(--color-chart-2)" : `color-mix(in oklab, var(--color-danger) ${35 + i * 15}%, transparent)` }} />
                  </div>
                </td>
                <th scope="row" className={cn("px-2 text-center font-normal whitespace-nowrap", i === 0 ? "text-fg-muted" : "text-fg")}>
                  {t(ageingLabels[r.b])}
                </th>
                <td className="w-[42%] p-0">
                  <div className="flex items-center gap-2">
                    <span aria-hidden className="block h-5 max-w-[70%] rounded-e-ui-sm" style={{ width: `${(r.ap / max) * 70}%`, background: i === 0 ? "var(--color-fg-subtle)" : `color-mix(in oklab, var(--color-warning) ${35 + i * 15}%, transparent)` }} />
                    <span className="font-mono text-fg-muted tabular">{r.ap ? tryCompact(f, r.ap) : "—"}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 rounded-ui-sm bg-surface-2 px-3 py-2 text-xs text-fg-muted">
          {c(
            `${f.percent(totalAr ? overdueAr / totalAr : 0, { maximumFractionDigits: 0 })} of receivables are past due. Chasing them buys more runway than any cut.`,
            `Alacakların ${f.percent(totalAr ? overdueAr / totalAr : 0, { maximumFractionDigits: 0 })} kadarının vadesi geçti. Bunları tahsil etmek her kesintiden daha çok nakit ömrü kazandırır.`,
          )}
        </p>
      </CardBody>
    </Card>
  );
}
