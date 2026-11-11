"use client";

import { Card, Tooltip, cn } from "@vamos-ui/react";
import { CountUp } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { NOW_MS, clockOf, firstResponseHitRate, firstResponseMinutes, median, type Ticket } from "./data";

const FROM = -120; // minutes before now
const TO = 240; // minutes after now
const pos = (m: number) => ((Math.min(TO, Math.max(FROM, m)) - FROM) / (TO - FROM)) * 100;

const tone = {
  breached: { dot: "bg-danger", stem: "bg-danger/40", text: "text-danger" },
  "at-risk": { dot: "bg-warning", stem: "bg-warning/40", text: "text-warning" },
  "on-track": { dot: "bg-success", stem: "bg-success/40", text: "text-success" },
} as const;

/**
 * KPIs plus a six-hour horizon: every running SLA clock as a marker on a time axis around "now",
 * so the next breaches are visible before they happen. Markers select the ticket in the list.
 */
export function DeadlineHorizon({ tickets, all, focusId, onFocus }: { tickets: Ticket[]; all: Ticket[]; focusId: string | null; onFocus: (id: string) => void }) {
  const { f, t, c } = useBlockFormat();

  const running = tickets
    .map((x) => ({ x, clock: clockOf(x) }))
    .filter((r) => !r.clock.paused)
    .map((r) => ({ ...r, min: Math.round((Date.parse(r.clock.due) - NOW_MS) / 60_000) }))
    .sort((a, b) => a.min - b.min);
  const older = running.filter((r) => r.min < FROM);
  const shown = running.filter((r) => r.min >= FROM && r.min <= TO);
  const later = running.filter((r) => r.min > TO).length;

  // Greedy lanes so markers closer than ~5% stack instead of overlapping.
  const lanes: number[] = [];
  const placed = shown.map((r) => {
    const p = pos(r.min);
    let lane = lanes.findIndex((end) => p - end > 5);
    if (lane === -1) lane = lanes.length < 4 ? lanes.length : lanes.indexOf(Math.min(...lanes));
    lanes[lane] = p;
    return { ...r, p, lane };
  });

  const breached = running.filter((r) => r.clock.state === "breached").length;
  const nextHour = running.filter((r) => r.min >= 0 && r.min <= 60).length;
  const fr = median(firstResponseMinutes(all));
  const hit = firstResponseHitRate(all);
  const ticks = [-120, -60, 0, 60, 120, 180, 240];
  const clock = (m: number) => f.dateTime(new Date(NOW_MS + m * 60_000), { timeStyle: "short", timeZone: "Europe/Istanbul" });
  const kindLabel = (k: string) => (k === "first-response" ? c("First response", "İlk yanıt") : c("Resolution", "Çözüm"));
  const when = (m: number) => (m < 0 ? c(`breached ${f.duration(-m, { unit: "min", smallest: "min" })} ago`, `${f.duration(-m, { unit: "min", smallest: "min" })} önce aşıldı`) : c(`due in ${f.duration(m, { unit: "min", smallest: "min" })}`, `${f.duration(m, { unit: "min", smallest: "min" })} içinde`));

  const kpis = [
    { key: "breached", label: c("Breached now", "Şu an aşılan"), value: breached, cls: breached ? "text-danger" : "text-fg", hint: c("running clocks past target", "hedefi geçen saatler") },
    { key: "next", label: c("Due in the next hour", "Bir saat içinde dolacak"), value: nextHour, cls: nextHour ? "text-warning" : "text-fg", hint: c("reply or reassign now", "şimdi yanıtla ya da devret") },
    { key: "fr", label: c("Median first response", "Ortanca ilk yanıt"), value: fr, cls: "text-fg", unit: c("min", "dk"), hint: c("last 7 days", "son 7 gün") },
    { key: "hit", label: c("First replies on time", "Zamanında ilk yanıt"), value: Math.round(hit * 100) / 100, cls: hit < 0.8 ? "text-warning" : "text-fg", pct: true, hint: c("target 85%", "hedef %85") },
  ];

  return (
    <Card className="ui-rise min-w-0 overflow-hidden">
      <dl className="grid grid-cols-2 border-b border-line lg:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.key} className={cn("min-w-0 border-line px-(--card-p) py-4", i % 2 === 1 && "border-s", i >= 2 && "max-lg:border-t lg:border-s")}>
            <dt className="text-[13px] text-fg-muted">{k.label}</dt>
            <dd className={cn("mt-1.5 flex items-baseline gap-1 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none", k.cls)}>
              <CountUp value={k.value} format={k.pct ? { style: "percent", maximumFractionDigits: 0 } : undefined} />
              {k.unit ? <span className="font-sans text-sm text-fg-subtle">{k.unit}</span> : null}
            </dd>
            <dd className="mt-1.5 text-xs text-fg-subtle">{k.hint}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="horizon-title" className="px-(--card-p) pt-4 pb-3">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="horizon-title" className="text-[15px] font-medium text-fg">{c("Deadline horizon", "Hedef ufku")}</h2>
          <p className="text-xs text-fg-subtle">
            {c(`${shown.length} clocks between ${clock(FROM)} and ${clock(TO)}`, `${clock(FROM)}–${clock(TO)} arası ${shown.length} saat`)}
            {later ? c(` · ${later} later`, ` · ${later} tanesi daha sonra`) : ""}
          </p>
        </div>

        <div className="relative">
          {/* Overdue zone + plot */}
          <div className="relative h-[124px] rounded-ui-sm border border-line bg-surface-2">
            <div aria-hidden className="absolute inset-y-0 start-0 rounded-s-ui-sm bg-danger/[0.06]" style={{ width: `${pos(0)}%` }} />
            {ticks.map((m) => (
              <span key={m} aria-hidden className={cn("absolute inset-y-0 w-px", m === 0 ? "bg-fg" : "bg-line")} style={{ insetInlineStart: `${pos(m)}%` }} />
            ))}
            <span aria-hidden className="absolute top-1.5 rounded-ui-sm bg-fg px-1.5 py-0.5 text-[10px] font-medium text-surface" style={{ insetInlineStart: `calc(${pos(0)}% + 4px)` }}>
              {c("Now", "Şimdi")}
            </span>

            {older.length ? (
              <span className="absolute start-1.5 bottom-1.5 rounded-ui-sm bg-danger/15 px-1.5 py-0.5 font-mono text-[11px] text-danger tabular">
                {c(`+${older.length} older`, `+${older.length} daha eski`)}
              </span>
            ) : null}

            <ul aria-label={c("Running SLA clocks by due time", "Hedef saatine göre işleyen SLA saatleri")} className="absolute inset-0">
              {placed.map(({ x, clock: k, min, p, lane }) => {
                const st = tone[(k.state === "breached" || k.state === "at-risk" ? k.state : "on-track") as keyof typeof tone];
                const label = `#${x.number} ${t(x.subject)} · ${kindLabel(k.kind)} ${when(min)}`;
                return (
                  <li key={x.id} className="absolute bottom-0" style={{ insetInlineStart: `${p}%`, top: `${28 + lane * 22}px` }}>
                    <span aria-hidden className={cn("absolute top-2 bottom-0 start-0 w-px", st.stem)} />
                    <Tooltip content={label}>
                      <button
                        type="button"
                        aria-label={label}
                        aria-pressed={focusId === x.id}
                        onClick={() => onFocus(x.id)}
                        className={cn(
                          "focus-ring absolute -start-[7px] top-0 grid size-[15px] place-items-center rounded-full border-2 border-surface-2 transition-transform hover:scale-125",
                          st.dot,
                          focusId === x.id && "scale-125 ring-2 ring-fg",
                        )}
                      />
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </div>
          <div aria-hidden className="relative mt-1.5 h-4 text-[11px] text-fg-subtle tabular">
            {ticks.map((m, i) => (
              <span
                key={m}
                className={cn("absolute -translate-x-1/2 whitespace-nowrap rtl:translate-x-1/2", i === 0 && "translate-x-0 rtl:translate-x-0", i === ticks.length - 1 && "-translate-x-full rtl:translate-x-full", (m === -60 || m === 60 || m === 180) && "max-sm:hidden", m === 0 && "font-medium text-fg")}
                style={{ insetInlineStart: `${pos(m)}%` }}
              >
                {clock(m)}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
          {(["breached", "at-risk", "on-track"] as const).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2 rounded-full", tone[s].dot)} />
              {s === "breached" ? c("Breached", "Aşıldı") : s === "at-risk" ? c("Under 25% left", "%25'ten az kaldı") : c("On track", "Yolunda")}
            </span>
          ))}
        </p>
      </section>
    </Card>
  );
}
