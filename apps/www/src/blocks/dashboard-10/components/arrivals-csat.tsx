"use client";

import * as React from "react";
import { Badge, Card, CardBody, CardHeader, Sparkline, cn } from "@vamos-ui/react";
import { Gauge, Heatmap, type HeatmapCell } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import { companiesById } from "../../_shared/companies";
import { arrivalHours, arrivals, csatComments, csatTrend, queues, weekdays } from "./data";

/** When tickets arrive (weekday × hour), so the rota can follow the load. */
export function ArrivalsCard() {
  const { t, c } = useBlockFormat();
  const [picked, setPicked] = React.useState<HeatmapCell | null>(null);
  const days = weekdays.map((d) => t(d));
  const cells: HeatmapCell[] = arrivals.map((a) => ({ x: a.hour, y: days[a.day]!, value: a.value }));
  const peak = arrivals.reduce((p, a) => (a.value > p.value ? a : p));
  const total = arrivals.reduce((s, a) => s + a.value, 0);

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "260ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("When tickets arrive", "Talepler ne zaman geliyor")}
        description={c(`${total} tickets in the last four weeks · busiest ${days[peak.day]} ${peak.hour}:00`, `Son dört haftada ${total} talep · en yoğun ${days[peak.day]} ${peak.hour}:00`)}
      />
      <CardBody className="pt-1">
        <Heatmap
          mode="matrix"
          title={c("Ticket arrivals by weekday and hour, last four weeks", "Son dört hafta, gün ve saate göre gelen talepler")}
          data={cells}
          xLabels={arrivalHours}
          yLabels={days}
          valueLabel={c("Tickets", "Talep")}
          onCellClick={setPicked}
          tableToggle
        />
        <p className="mt-3 min-h-5 text-xs text-fg-muted" aria-live="polite">
          {picked
            ? c(`${picked.y} ${String(picked.x)}:00: ${picked.value} tickets — about ${Math.max(1, Math.ceil((picked.value ?? 0) / 6))} agents needed at 6 per hour.`, `${picked.y} ${String(picked.x)}:00: ${picked.value} talep — saatte 6 talepten yaklaşık ${Math.max(1, Math.ceil((picked.value ?? 0) / 6))} temsilci gerekir.`)
            : c("Select a cell to see how many agents that hour needs.", "O saatte kaç temsilci gerektiğini görmek için bir hücre seçin.")}
        </p>
      </CardBody>
    </Card>
  );
}

/** CSAT this week against the 90% target, the eight-week trend and the latest comments. */
export function CsatCard() {
  const { f, t, c } = useBlockFormat();
  const now = csatTrend[csatTrend.length - 1]!;
  const prev = csatTrend[csatTrend.length - 2]!;
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "320ms" }}>
      <CardHeader titleAs="h2" title={c("Customer satisfaction", "Müşteri memnuniyeti")} description={c("Share of 4 and 5 ratings on solved tickets", "Çözülen taleplerde 4 ve 5 puanların payı")} />
      <CardBody className="pt-0">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Gauge
            value={now}
            arc={180}
            size="lg"
            target={90}
            semantic="meter"
            format="percent"
            label={<span className="font-display text-2xl text-fg">{f.percent(now / 100, { maximumFractionDigits: 0 })}</span>}
            thresholds={[
              { at: 0, color: "danger", label: c("Poor", "Zayıf") },
              { at: 80, color: "warning", label: c("Fair", "Orta") },
              { at: 90, color: "success", label: c("Good", "İyi") },
            ]}
            aria-label={c("CSAT this week", "Bu haftaki memnuniyet")}
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-xs text-fg-subtle">{c("Last 8 weeks", "Son 8 hafta")}</p>
            <Sparkline values={csatTrend} variant="bars" width="100%" height={36} reference={90} domain={[70, 100]} color="chart-1" label={c("CSAT per week, last 8 weeks", "Son 8 hafta, haftalık memnuniyet")} />
            <p className={cn("font-mono text-xs tabular", now >= prev ? "text-success" : "text-danger")}>
              {now >= prev ? "+" : "−"}
              {Math.abs(now - prev)} {c("pts vs last week", "puan, geçen haftaya göre")}
            </p>
          </div>
        </div>
        <ul className="mt-4 space-y-2.5 border-t border-line pt-3">
          {csatComments.map((x) => (
            <li key={x.id} className="text-[13px]">
              <div className="flex items-center gap-2">
                <Badge size="sm" shape="square" tone={x.score >= 4 ? "success" : x.score === 3 ? "warning" : "danger"} className="font-mono">
                  {x.score}/5
                </Badge>
                <span className="truncate text-xs text-fg-muted">
                  {companiesById[x.who]?.name} · {t(queues.find((q) => q.key === x.queue)!.label)}
                </span>
              </div>
              <p className="mt-1 text-fg">“{t(x.text)}”</p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
