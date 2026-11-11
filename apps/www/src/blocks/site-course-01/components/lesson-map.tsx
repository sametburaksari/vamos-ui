"use client";

import * as React from "react";
import { Badge, Progress, Slider, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { cohorts, copyFor, kindLabel, modules, STUDY_FACTOR, totals, type SiteLocale } from "./content";

const PACES = [4, 6, 8] as const;

interface Slot {
  mi: number;
  li: number;
  /** Study hours from the start of the course. */
  start: number;
  end: number;
}

const schedule: Slot[] = (() => {
  let at = 0;
  return modules.flatMap((m, mi) =>
    m.lessons.map((l, li) => {
      const start = at;
      at += (l.minutes * STUDY_FACTOR) / 60;
      return { mi, li, start, end: at };
    }),
  );
})();

/**
 * The signature of the course site: the whole curriculum as a progress-style map. Every lesson
 * is a segment sized by its length; pick a weekly pace and drag through the weeks to see what is
 * finished, what you are on, what that week holds and the date you would finish.
 */
export function LessonMap({ locale, idPrefix = "map" }: { locale: SiteLocale; idPrefix?: string }) {
  const { t, f } = copyFor(locale);
  const [pace, setPace] = React.useState<(typeof PACES)[number]>(6);
  const weeks = Math.ceil(totals.studyHours / pace);
  const [weekState, setWeek] = React.useState(5);
  const week = Math.min(weekState, weeks);
  const now = week * pace;
  const from = (week - 1) * pace;

  const done = (s: Slot) => Math.min(1, Math.max(0, (now - s.start) / (s.end - s.start)));
  const thisWeek = schedule.filter((s) => s.end > from && s.start < now);
  const finished = schedule.filter((s) => s.end <= now).length;
  const lastDoneModule = [...modules.keys()].filter((mi) => schedule.filter((s) => s.mi === mi).every((s) => s.end <= now)).pop();
  const current = schedule.find((s) => s.start < now && s.end > now);
  const pct = Math.min(100, Math.round((now / totals.studyHours) * 100));

  const cohort = cohorts[0]!;
  const finishDate = (() => {
    const [y, m, d] = cohort.start.split("-").map(Number) as [number, number, number];
    return new Date(Date.UTC(y, m - 1, d + weeks * 7 - 1)).toISOString().slice(0, 10);
  })();
  const weekLabel = (n: number) => t({ en: `Week ${n}`, tr: `${n}. hafta` });
  const dur = (minutes: number) => f.duration(minutes, { unit: "min" });

  return (
    <div className="grid gap-x-(--gutter) gap-y-10 @5xl:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="flex min-w-0 flex-col gap-8">
        {/* Controls */}
        <div className="grid gap-6 border-b border-line pb-6 @2xl:grid-cols-[auto_1fr] @2xl:items-end @2xl:gap-10">
          <div className="flex flex-col gap-2">
            <span id={`${idPrefix}-pace`} className="font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">
              {t({ en: "Hours a week", tr: "Haftada saat" })}
            </span>
            <ToggleGroup type="single" aria-labelledby={`${idPrefix}-pace`} value={String(pace)} onValueChange={(v) => v && setPace(Number(v) as (typeof PACES)[number])}>
              {PACES.map((p) => (
                <ToggleGroupItem key={p} value={String(p)} className="font-mono tabular">
                  {t({ en: `${p} h`, tr: `${p} sa` })}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <span className="flex items-baseline justify-between font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">
              <span id={`${idPrefix}-week`}>{t({ en: "Drag through the course", tr: "Kursta ilerleyin" })}</span>
              <span className="tabular text-fg">
                {weekLabel(week)} / {weeks}
              </span>
            </span>
            <Slider
              aria-labelledby={`${idPrefix}-week`}
              min={1}
              max={weeks}
              step={1}
              value={[week]}
              onValueChange={(v) => setWeek(v[0] ?? 1)}
              formatValue={weekLabel}
              thumbLabels={[t({ en: "Week", tr: "Hafta" })]}
              marks={[1, Math.round(weeks / 2), weeks]}
            />
          </div>
        </div>

        {/* The map */}
        <ol className="flex flex-col" aria-label={t({ en: "Curriculum map", tr: "Müfredat haritası" })}>
          {modules.map((m, mi) => {
            const slots = schedule.filter((s) => s.mi === mi);
            const doneCount = slots.filter((s) => s.end <= now).length;
            const minutes = m.lessons.reduce((sum, l) => sum + l.minutes, 0);
            const state = doneCount === slots.length ? "done" : slots.some((s) => s.start < now) ? "active" : "next";
            return (
              <li key={m.code} data-state={state} className="group grid grid-cols-1 gap-x-6 gap-y-2 border-t border-line py-3.5 @2xl:grid-cols-[15rem_1fr] @2xl:items-center">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-small tabular text-fg-muted group-data-[state=active]:text-accent-ink group-data-[state=done]:text-fg">{m.code}</span>
                  <span className="min-w-0 flex-1 text-fg">
                    {t(m.title)}
                    <span className="sr-only">
                      {" "}
                      — {t({ en: `${doneCount} of ${slots.length} lessons done by ${weekLabel(week).toLowerCase()}`, tr: `${weekLabel(week)} sonunda ${slots.length} dersin ${doneCount} tanesi bitti` })}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] tabular text-fg-muted @2xl:hidden">{dur(minutes)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div aria-hidden className="flex h-5 min-w-0 flex-1 items-end gap-[3px]">
                    {m.lessons.map((l, li) => {
                      const slot = slots[li]!;
                      const p = done(slot);
                      const isCurrent = current === slot;
                      return (
                        <span
                          key={li}
                          title={`${t(l.title)} · ${dur(l.minutes)}`}
                          data-kind={l.kind}
                          style={{ flexGrow: l.minutes, flexBasis: 0 }}
                          className={`relative min-w-1.5 overflow-hidden rounded-[2px] bg-track ${l.kind === "video" ? "h-2.5" : "h-5"} ${isCurrent ? "outline-2 outline-offset-2 outline-fg" : ""}`}
                        >
                          <span className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none" style={{ width: `${p * 100}%` }} />
                        </span>
                      );
                    })}
                  </div>
                  <span className="hidden w-14 text-end font-mono text-[11px] tabular text-fg-muted @2xl:inline">{dur(minutes)}</span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-fg-muted">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-5 rounded-[2px] bg-track" /> {t({ en: "Lesson", tr: "Ders" })}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-4 w-5 rounded-[2px] bg-track" /> {t({ en: "Lab, review or project", tr: "Uygulama, değerlendirme ya da proje" })}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-5 rounded-[2px] bg-accent" /> {t({ en: "Finished", tr: "Bitti" })}
          </span>
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-5 rounded-[2px] bg-track outline-2 outline-offset-2 outline-fg" /> {t({ en: "You are here", tr: "Buradasınız" })}
          </span>
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {`${weekLabel(week)} · ${pct}% · ${t({ en: `${finished} of ${totals.lessons} lessons`, tr: `${totals.lessons} dersin ${finished} tanesi` })}`}
      </p>

      {/* Week panel */}
      <aside aria-labelledby={`${idPrefix}-panel`} className="flex flex-col gap-6 self-start rounded-ui-lg border border-line bg-surface p-6 @5xl:sticky @5xl:top-24">
        <div className="flex flex-col gap-1">
          <p id={`${idPrefix}-panel`} className="font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">
            {t({ en: `At ${pace} hours a week`, tr: `Haftada ${pace} saatle` })}
          </p>
          <p className="font-display text-display-m tabular text-fg">{weekLabel(week)}</p>
        </div>
        <Progress
          value={pct}
          size="md"
          label={t({ en: `${finished} of ${totals.lessons} lessons`, tr: `${totals.lessons} dersin ${finished} tanesi` })}
          showValue
        />
        <div className="flex flex-col gap-3">
          <p className="font-mono text-eyebrow uppercase tracking-[0.1em] text-fg-muted">{t({ en: "This week", tr: "Bu hafta" })}</p>
          <ul className="flex flex-col gap-2.5 text-small">
            {thisWeek.map((s) => {
              const l = modules[s.mi]!.lessons[s.li]!;
              return (
                <li key={`${s.mi}-${s.li}`} className="flex items-start justify-between gap-3">
                  <span className="text-fg">
                    <span className="me-2 font-mono text-[11px] text-fg-muted">{modules[s.mi]!.code}</span>
                    {t(l.title)}
                  </span>
                  {l.kind === "video" ? (
                    <span className="shrink-0 font-mono text-[11px] tabular text-fg-muted">{dur(l.minutes)}</span>
                  ) : (
                    <Badge tone={l.kind === "lab" ? "neutral" : "outline"} shape="square">
                      {t(kindLabel[l.kind])}
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="border-t border-line pt-5 text-small text-fg-muted text-pretty">
          {lastDoneModule === undefined ? (
            t({ en: "By the end of this week you have set up your tools and written your first analysis brief.", tr: "Bu haftanın sonunda araçlarınızı kurmuş ve ilk analiz özetinizi yazmış olursunuz." })
          ) : (
            <>
              {t({ en: "By now you can ", tr: "Artık şunu yapabilirsiniz: " })}
              <span className="text-fg">{t(modules[lastDoneModule]!.outcome)}</span>.
            </>
          )}
        </p>
        <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-small">
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t({ en: "Course length", tr: "Kurs süresi" })}</dt>
            <dd className="tabular text-fg">{t({ en: `${weeks} weeks`, tr: `${weeks} hafta` })}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t({ en: "Finish, winter start", tr: "Bitiş, kış dönemi" })}</dt>
            <dd className="tabular text-fg">{f.date(finishDate, "medium")}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
