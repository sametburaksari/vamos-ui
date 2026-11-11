"use client";

import * as React from "react";
import { Badge, Button, Slider } from "@vamos-ui/react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Reveal } from "@vamos-ui/react/motion";
import { addMonths, AS_OF, copyFor, fill, monthDiff, monthLabel, num, progressAt, projectEnd, projectStart, projects, type SiteLocale } from "./content";

const c = {
  month: { en: "Month", tr: "Ay" },
  complete: { en: "complete", tr: "tamamlandı" },
  asOf: { en: "as of {month}", tr: "{month} itibarıyla" },
  forecast: { en: "Forecast", tr: "Tahmin" },
  reported: { en: "Reported", tr: "Raporlandı" },
  today: { en: "Today", tr: "Bugün" },
  backToday: { en: "Back to today", tr: "Bugüne dön" },
  prev: { en: "Previous month", tr: "Önceki ay" },
  next: { en: "Next month", tr: "Sonraki ay" },
  done: { en: "Done", tr: "Bitti" },
  active: { en: "In progress · {pct}", tr: "Sürüyor · {pct}" },
  upcoming: { en: "Not started", tr: "Başlamadı" },
  planned: { en: "Planned {from} – {to}", tr: "Plan {from} – {to}" },
  phases: { en: "Phases", tr: "Aşamalar" },
  diary: { en: "Site diary", tr: "Şantiye günlüğü" },
  noDiary: { en: "No entry yet for this month.", tr: "Bu ay için henüz kayıt yok." },
  legendActual: { en: "Built", tr: "Yapılan" },
  legendForecast: { en: "Forecast", tr: "Tahmin" },
  legendPlan: { en: "Planned", tr: "Plan" },
};

export function ProgressTimeline({ locale, slug }: { locale: SiteLocale; slug: string }) {
  const { t } = copyFor(locale);
  const p = projects.find((x) => x.slug === slug)!;
  const start = projectStart(p);
  const end = projectEnd(p);
  const total = monthDiff(start, end); // index of the last month
  const todayIdx = Math.max(0, Math.min(total, monthDiff(start, AS_OF)));
  const [idx, setIdx] = React.useState(todayIdx);
  const at = addMonths(start, idx);
  const future = monthDiff(AS_OF, at) > 0;
  const shown = progressAt(p, at);
  const real = progressAt(p, monthDiff(AS_OF, at) > 0 ? AS_OF : at);
  const pct = (v: number) => `${num(Math.round(v * 100), locale)}%`;
  const pos = (ym: string) => (monthDiff(start, ym) / (total + 1)) * 100;
  const markerLeft = ((idx + 0.5) / (total + 1)) * 100;
  const todayLeft = ((todayIdx + 0.5) / (total + 1)) * 100;
  const entry = [...p.diary].reverse().find((d) => monthDiff(d.month, at) >= 0);
  const marks = [
    { value: 0, label: monthLabel(start, locale) },
    ...(todayIdx > 1 && todayIdx < total - 1 ? [{ value: todayIdx, label: t(c.today) }] : []),
    { value: total, label: monthLabel(end, locale) },
  ];

  return (
    <div className="flex flex-col gap-8" data-testid="sb-timeline">
      {/* Read-out */}
      <div className="grid gap-6 @3xl:grid-cols-[15rem_minmax(0,1fr)] @3xl:items-end @3xl:gap-x-6">
        <div className="flex flex-col" aria-live="polite" aria-atomic="true">
          <span className="flex items-center gap-2">
            <Badge tone={future ? "outline" : "accent"} size="sm">
              {future ? t(c.forecast) : t(c.reported)}
            </Badge>
            <span className="font-mono text-xs text-fg-muted">{fill(t(c.asOf), { month: monthLabel(at, locale, true) })}</span>
          </span>
          <span className="mt-2 font-display text-[clamp(4rem,3rem+4cqi,6.5rem)] leading-[0.9] tabular text-fg" data-testid="sb-overall">
            {pct(shown.overall)}
          </span>
          <span className="mt-1 text-small text-fg-muted">{t(c.complete)}</span>
        </div>
        <div className="flex flex-col gap-4">
          <div style={{ paddingInline: `${50 / (total + 1)}%` }}>
          <Slider
            aria-label={t(c.month)}
            value={[idx]}
            onValueChange={(v) => setIdx(v[0] ?? 0)}
            min={0}
            max={total}
            step={1}
            marks={marks}
            formatValue={(n) => monthLabel(addMonths(start, n), locale)}
          />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} aria-label={t(c.prev)}>
              <ChevronLeft aria-hidden className="rtl:rotate-180" />
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIdx((i) => Math.min(total, i + 1))} disabled={idx === total} aria-label={t(c.next)}>
              <ChevronRight aria-hidden className="rtl:rotate-180" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIdx(todayIdx)} disabled={idx === todayIdx}>
              <RotateCcw aria-hidden />
              {t(c.backToday)}
            </Button>
            <span className="ms-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted" aria-hidden>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-[2px] bg-accent" />
                {t(c.legendActual)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-[2px] bg-[repeating-linear-gradient(135deg,var(--accent)_0_3px,transparent_3px_6px)] ring-1 ring-accent ring-inset" />
                {t(c.legendForecast)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 rounded-[2px] bg-track" />
                {t(c.legendPlan)}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Gantt */}
      <div>
        <h3 className="sr-only">{t(c.phases)}</h3>
        <Reveal asChild effect="fade" duration={1500}>
        <ol className="sb-gantt flex flex-col border-t border-line">
          {shown.states.map((s, i) => {
            const r = real.states[i]!;
            const left = pos(s.phase.start);
            const width = ((monthDiff(s.phase.start, s.phase.end) + 1) / (total + 1)) * 100;
            const status = s.state === "done" ? t(c.done) : s.state === "active" ? fill(t(c.active), { pct: pct(s.pct) }) : t(c.upcoming);
            return (
              <li key={s.phase.id} className="grid gap-x-6 gap-y-2 border-b border-line py-3 @3xl:grid-cols-[15rem_minmax(0,1fr)] @3xl:items-center" data-state={s.state}>
                <div className="flex items-baseline justify-between gap-3 @3xl:flex-col @3xl:items-start @3xl:gap-0.5">
                  <span className={`text-small font-medium ${s.state === "upcoming" ? "text-fg-muted" : "text-fg"}`}>{t(s.phase.name)}</span>
                  <span className={`font-mono text-[11px] ${s.state === "active" ? "text-accent-ink" : "text-fg-muted"}`}>
                    {status}
                    <span className="sr-only">
                      {" · "}
                      {fill(t(c.planned), { from: monthLabel(s.phase.start, locale), to: monthLabel(s.phase.end, locale) })}
                    </span>
                  </span>
                </div>
                <div aria-hidden className="relative h-5">
                  <div className="sb-bar absolute inset-y-1.5 rounded-[2px] bg-track" style={{ insetInlineStart: `${left}%`, width: `${width}%`, "--sb-i": i } as React.CSSProperties}>
                    {/* Forecast part (beyond today) under the built part */}
                    <div className="absolute inset-y-0 start-0 rounded-[2px] bg-[repeating-linear-gradient(135deg,var(--accent)_0_3px,transparent_3px_6px)] ring-1 ring-accent ring-inset transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${s.pct * 100}%` }} />
                    <div className="absolute inset-y-0 start-0 rounded-[2px] bg-accent transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${r.pct * 100}%` }} />
                  </div>
                  <div className="absolute inset-y-0 w-px border-s border-dashed border-fg-muted" style={{ insetInlineStart: `${todayLeft}%` }} />
                  <div className="absolute -inset-y-1 w-0.5 bg-fg transition-[inset-inline-start] duration-150 motion-reduce:transition-none" style={{ insetInlineStart: `${markerLeft}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
        </Reveal>
      </div>

      {/* Diary */}
      <figure className="grid gap-3 border-s-4 border-accent ps-5 @3xl:grid-cols-[10rem_minmax(0,1fr)] @3xl:gap-8">
        <figcaption className="flex flex-col">
          <span className="font-mono text-eyebrow uppercase tracking-[0.14em] text-fg-muted">{t(c.diary)}</span>
          <span className="font-display text-h3 text-fg">{entry ? monthLabel(entry.month, locale, true) : monthLabel(at, locale, true)}</span>
        </figcaption>
        <blockquote className="max-w-[60ch] text-lead text-fg" aria-live="polite" data-testid="sb-diary">
          {entry ? t(entry.text) : t(c.noDiary)}
        </blockquote>
      </figure>
    </div>
  );
}

