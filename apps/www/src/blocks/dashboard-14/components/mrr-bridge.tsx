"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, cn } from "@vamos-ui/react";
import { ComboChart, type ChartConfig } from "@vamos-ui/react/charts";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { isLoss, movementHints, movementLabels, movementOrder, months, type Movement } from "./data";

const usdWhole: Intl.NumberFormatOptions = { style: "currency", currency: "USD", maximumFractionDigits: 0 };

/**
 * The month's MRR bridge: where the month started, what came in and went out (bars grow from a
 * shared zero line, gains to the end, losses to the start) and where it ended.
 */
export function MrrBridge({ index }: { index: number }) {
  const { f, t, c } = useBlockFormat();
  const m = months[index]!;
  const usd = (n: number) => f.currency(n, "USD", { maximumFractionDigits: 0 });
  const signed = (n: number, loss: boolean) => `${loss ? "−" : "+"}${usd(n)}`;
  const max = Math.max(...movementOrder.map((k) => m[k]));
  const net = m.newMrr + m.expansion - m.contraction - m.churned;
  const monthName = f.date(m.month, { month: "long", year: "numeric" });

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "60ms" }}>
      <CardHeader
        titleAs="h2"
        eyebrow={c("MRR bridge", "MRR köprüsü")}
        title={monthName}
        description={c("From the first day of the month to the last, in USD.", "Ayın ilk gününden son gününe, USD.")}
      />
      <CardBody className="pt-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-line pb-4">
          <div>
            <p className="text-xs text-fg-subtle">{c("Starting MRR", "Başlangıç MRR")}</p>
            <p className="font-mono text-[15px] text-fg-muted tabular">{usd(m.start)}</p>
          </div>
          <div className="text-end">
            <p className="text-xs text-fg-subtle">{c("Ending MRR", "Dönem sonu MRR")}</p>
            <p className="font-heading text-[28px] leading-none font-medium tracking-tight text-fg tabular">
              <CountUp key={m.month} value={m.mrr} from={m.start} format={usdWhole} duration={900} />
            </p>
          </div>
        </div>

        <ul className="divide-y divide-line" aria-label={c(`MRR movements in ${monthName}`, `${monthName} MRR hareketleri`)}>
          {movementOrder.map((k: Movement) => {
            const loss = isLoss(k);
            const width = `${(m[k] / max) * 100}%`;
            return (
              <li key={k} className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_auto] items-center gap-3 py-2.5 max-sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-fg">{t(movementLabels[k])}</p>
                  <p className="truncate text-[11.5px] text-fg-subtle sm:hidden">{t(movementHints[k])}</p>
                </div>
                {/* Two half-tracks around a zero line: losses grow towards the start, gains towards the end. */}
                <div className="grid grid-cols-2 items-center max-sm:col-span-2 max-sm:row-start-2" aria-hidden title={t(movementHints[k])}>
                  <div className="flex h-5 justify-end border-e border-fg-subtle/50">
                    {loss ? <span className="h-full rounded-s-ui-sm bg-danger/70 transition-[width] duration-500" style={{ width }} /> : null}
                  </div>
                  <div className="flex h-5">
                    {!loss ? <span className={cn("h-full rounded-e-ui-sm transition-[width] duration-500", k === "newMrr" ? "bg-chart-1" : "bg-chart-2")} style={{ width }} /> : null}
                  </div>
                </div>
                <p className="w-24 text-end font-mono text-[13px] text-fg tabular max-sm:col-start-2 max-sm:row-start-1">{signed(m[k], loss)}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
          <p className="text-[13px] font-medium text-fg">{c("Net new MRR", "Net yeni MRR")}</p>
          <p className="font-mono text-[15px] font-medium text-fg tabular">
            {signed(Math.abs(net), net < 0)}
            <span className="ms-2 text-xs font-normal text-fg-subtle">{f.percent(net / m.start, { maximumFractionDigits: 1, signDisplay: "always" })}</span>
          </p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-ui bg-surface-2 px-4 py-3 text-xs">
          <div>
            <dt className="text-fg-subtle">{c("Paying customers", "Ödeme yapan müşteri")}</dt>
            <dd className="mt-0.5 font-mono text-[13px] text-fg tabular">{f.number(m.customers)}</dd>
          </div>
          <div>
            <dt className="text-fg-subtle">{c("Average per account", "Hesap başına ortalama")}</dt>
            <dd className="mt-0.5 font-mono text-[13px] text-fg tabular">{f.currency(m.mrr / m.customers, "USD", { maximumFractionDigits: 0 })}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

/** Twelve months of movements (gains up, losses down) with MRR as a line. Click a month to open its bridge. */
export function MovementsChart({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const { c } = useBlockFormat();
  const rows = months.map((m) => ({ month: m.month, gained: m.newMrr + m.expansion, lost: m.contraction + m.churned, mrr: m.mrr }));
  const usdCompact = { currency: "USD", compact: true } as const;
  const config: ChartConfig = {
    gained: { label: c("Gained (new + expansion)", "Kazanılan (yeni + genişleme)"), color: "chart-1", format: usdCompact, axis: "start" },
    lost: { label: c("Lost (contraction + churn)", "Kaybedilen (daralma + kayıp)"), color: "chart-4", format: usdCompact, axis: "start" },
    mrr: { label: "MRR", color: "chart-3", format: usdCompact, axis: "end" },
  };
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "120ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("MRR movements", "MRR hareketleri")}
        description={c("Last 12 months · select a month to see its bridge", "Son 12 ay · köprüsünü görmek için bir ay seçin")}
      />
      <CardBody className="pt-1">
        <ComboChart
          title={c("MRR gained and lost per month, with total MRR, last 12 months", "Son 12 ay aylık MRR kazanç, kayıp ve toplam MRR")}
          data={rows}
          x="month"
          xFormat={{ date: { month: "short" } }}
          config={config}
          bars={["gained", "lost"]}
          lines={["mrr"]}
          startAxisLabel={c("Movement", "Hareket")}
          endAxisLabel="MRR"
          endAxisFormat={usdCompact}
          height="md"
          legend="bottom"
          tableToggle
          onPointClick={(row) => onSelect(rows.indexOf(row))}
          summary={c(
            `MRR grew from ${Math.round(rows[0]!.mrr / 1000)}k to ${Math.round(rows[rows.length - 1]!.mrr / 1000)}k USD. Selected: ${rows[index]!.month}.`,
            `MRR ${Math.round(rows[0]!.mrr / 1000)} binden ${Math.round(rows[rows.length - 1]!.mrr / 1000)} bin USD'ye çıktı. Seçili: ${rows[index]!.month}.`,
          )}
        />
      </CardBody>
    </Card>
  );
}

export function useMonthOptions() {
  const { f } = useBlockFormat();
  return React.useMemo(() => months.map((m, i) => ({ value: String(i), label: f.date(m.month, { month: "long", year: "numeric" }) })).reverse(), [f]);
}
