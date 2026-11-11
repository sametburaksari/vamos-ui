"use client";

import { Card, CardBody, CardHeader } from "@vamos-ui/react";
import { Gauge } from "@vamos-ui/react/charts";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { daysBetween } from "../../_shared/time";
import { QUARTER, toTry, type Deal, tryCompact } from "./data";

/** Win rate on deals closed this quarter, the average cycle of won deals and why the rest were lost. */
export function WinRate({ deals }: { deals: Deal[] }) {
  const { f, t, c } = useBlockFormat();
  const closed = deals.filter((d) => (d.stage === "won" || d.stage === "lost") && d.closeDate >= QUARTER.start);
  const won = closed.filter((d) => d.stage === "won");
  const lost = closed.filter((d) => d.stage === "lost");
  const rate = closed.length ? won.length / closed.length : 0;
  const byValue = closed.length ? won.reduce((s, d) => s + toTry(d.amount), 0) / closed.reduce((s, d) => s + toTry(d.amount), 0) : 0;
  const cycle = won.length ? Math.round(won.reduce((s, d) => s + daysBetween(d.createdDate, d.closeDate), 0) / won.length) : 0;

  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "180ms" }}>
      <CardHeader titleAs="h2" title={c("Win rate", "Kazanma oranı")} description={c(`Deals closed in ${QUARTER.label}`, `${QUARTER.label} içinde kapanan fırsatlar`)} />
      <CardBody className="flex flex-1 flex-col gap-5 pt-1">
        <Gauge
          value={rate}
          max={1}
          arc={180}
          size="lg"
          format="percent"
          semantic="meter"
          color="accent"
          target={0.6}
          aria-label={c("Win rate this quarter", "Bu çeyrek kazanma oranı")}
          className="mx-auto"
        />
        <dl className="grid grid-cols-3 gap-3 text-center">
          <div>
            <dt className="text-xs text-fg-subtle">{c("Won", "Kazanılan")}</dt>
            <dd className="font-mono text-lg font-medium text-fg tabular"><CountUp value={won.length} /></dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">{c("Lost", "Kaybedilen")}</dt>
            <dd className="font-mono text-lg font-medium text-fg tabular"><CountUp value={lost.length} /></dd>
          </div>
          <div>
            <dt className="text-xs text-fg-subtle">{c("Avg cycle", "Ort. süre")}</dt>
            <dd className="font-mono text-lg font-medium text-fg tabular">{c(`${cycle} d`, `${cycle} g`)}</dd>
          </div>
        </dl>
        <p className="rounded-ui-sm bg-surface-2 px-3 py-2 text-[13px] text-fg-muted">
          {c("By value", "Tutara göre")}: <span className="font-mono text-fg tabular">{f.percent(byValue, { maximumFractionDigits: 0 })}</span>
          {" · "}
          {c("target 60%", "hedef %60")}
        </p>
        {lost.length ? (
          <div className="mt-auto">
            <h3 className="mb-2 text-xs font-medium text-fg-subtle">{c("Why we lost", "Kaybetme nedenleri")}</h3>
            <ul className="space-y-1.5 text-[13px]">
              {lost.map((d) => (
                <li key={d.id} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-fg-muted">{d.lostReason ? t(d.lostReason) : c("No reason given", "Neden belirtilmedi")}</span>
                  <span className="shrink-0 font-mono text-xs text-fg-subtle tabular">{tryCompact(f, toTry(d.amount))}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
