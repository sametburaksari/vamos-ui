"use client";

import * as React from "react";
import { Button, cn, Field, RadioGroup, Slider, Switch } from "@vamos-ui/react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { useCourse } from "./course-provider";
import { courseById, courses, fill, licences, rowGroups, tl, weeksFor, type Cell, type CourseId, type LicenceId } from "./content";

const c = {
  caption: { en: "Driving courses compared", tr: "Direksiyon kursları karşılaştırması" },
  licence: { en: "Licence", tr: "Ehliyet sınıfı" },
  pace: { en: "Lessons you can do a week", tr: "Haftada alabileceğiniz ders" },
  paceValue: { en: "{n} a week", tr: "Haftada {n}" },
  diff: { en: "Only show differences", tr: "Yalnızca farkları göster" },
  hidden: { en: "{n} rows are the same on every course and are hidden.", tr: "Her kursta aynı olan {n} satır gizlendi." },
  course: { en: "Course", tr: "Kurs" },
  choose: { en: "Choose", tr: "Seç" },
  chosen: { en: "Chosen", tr: "Seçildi" },
  recommended: { en: "Most chosen", tr: "En çok seçilen" },
  ready: { en: "Test-ready in about", tr: "Sınava hazır olma süresi" },
  readyHint: { en: "At your pace, with the 4-week theory minimum", tr: "Sizin hızınızla, 4 haftalık teori asgarisiyle" },
  weeks: { en: "{n} weeks", tr: "{n} hafta" },
  fixedNote: { en: "fixed timetable", tr: "sabit program" },
  yes: { en: "Included", tr: "Dahil" },
  no: { en: "Not included", tr: "Dahil değil" },
  price: { en: "Price, VAT included", tr: "Fiyat, KDV dahil" },
  signUp: { en: "Sign up", tr: "Kayıt ol" },
  pick: { en: "Your pick", tr: "Seçiminiz" },
  lessons: { en: "{n} lessons", tr: "{n} ders" },
  scroll: { en: "Comparison table, scrolls sideways", tr: "Karşılaştırma tablosu, yana kayar" },
};

const key = (v: Cell) => (typeof v === "object" ? v.en : String(v));

/**
 * Signature: the course comparison table. Licence switch re-prices every column, the pace slider
 * recomputes weeks-to-test, "only differences" hides identical rows, and choosing a column
 * highlights it and carries the pick to sign-up.
 */
export function CourseCompare() {
  const { t, locale, licence, setLicence, course, setCourse, perWeek, setPerWeek, signUp } = useCourse();
  const [diffOnly, setDiffOnly] = React.useState(false);
  const chosen = courseById(course);
  const ci = courses.findIndex((x) => x.id === course);

  const groups = rowGroups.map((g) => ({ ...g, rows: g.rows.map((r) => ({ ...r, cells: r.values(licence) })).filter((r) => !diffOnly || new Set(r.cells.map(key)).size > 1) }));
  const total = rowGroups.reduce((n, g) => n + g.rows.length, 0);
  const shown = groups.reduce((n, g) => n + g.rows.length, 0);

  const cellView = (v: Cell) =>
    v === true ? (
      <span className="inline-flex items-center justify-center text-accent-ink">
        <Check aria-hidden className="size-5" strokeWidth={2.5} />
        <span className="sr-only">{t(c.yes)}</span>
      </span>
    ) : v === false || v === "—" ? (
      <span className="inline-flex items-center justify-center text-fg-subtle">
        <Minus aria-hidden className="size-4" />
        <span className="sr-only">{t(c.no)}</span>
      </span>
    ) : (
      <span className="text-fg">{typeof v === "object" ? t(v) : v}</span>
    );

  // Narrow screens show the row labels and the chosen course; wide screens show all three.
  const col = (i: number) => cn("px-4 text-center align-middle transition-colors", i === ci ? "bg-accent-soft/60" : "hidden @2xl:table-cell");

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 rounded-ui-lg border border-line p-5 @3xl:grid-cols-[auto_minmax(0,1fr)_auto] @3xl:items-end @3xl:gap-10">
        <Field label={t(c.licence)}>
          <RadioGroup variant="segmented" className="flex-wrap" value={licence} onValueChange={(v) => setLicence(v as LicenceId)} items={licences.map((l) => ({ value: l.id, label: t(l.name) }))} />
        </Field>
        <Field label={`${t(c.pace)} · ${fill(t(c.paceValue), { n: perWeek })}`}>
          <Slider value={[perWeek]} onValueChange={(v) => setPerWeek(v[0] ?? 3)} min={1} max={5} step={1} marks={[1, 2, 3, 4, 5]} formatValue={(n) => fill(t(c.paceValue), { n })} />
        </Field>
        <Switch checked={diffOnly} onCheckedChange={setDiffOnly} label={t(c.diff)} />
        <Field label={t(c.course)} className="@2xl:hidden">
          <RadioGroup variant="segmented" value={course} onValueChange={(v) => setCourse(v as CourseId)} items={courses.map((x) => ({ value: x.id, label: t(x.name) }))} />
        </Field>
      </div>

      <div role="region" aria-label={t(c.scroll)} tabIndex={0} className="relative -mx-4 overflow-x-auto px-4 focus-ring @4xl:mx-0 @4xl:px-0">
        <table className="w-full table-auto @2xl:table-fixed @2xl:min-w-[46rem] border-separate border-spacing-0 text-small">
          <caption className="sr-only">{`${t(c.caption)} — ${t(licences.find((l) => l.id === licence)!.name)}`}</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky start-0 z-10 w-[55%] @2xl:w-[31%] bg-scene px-0 pb-5 text-start align-bottom font-mono text-eyebrow font-normal uppercase tracking-[0.16em] text-fg-muted">
                {t(c.course)}
              </th>
              {courses.map((x, i) => (
                <th key={x.id} scope="col" className={cn(col(i), "rounded-t-ui-lg pt-5 pb-5 align-bottom font-normal", i === ci && "shadow-[inset_0_4px_0_var(--accent)]")}>
                  <div className="flex flex-col items-center gap-2">
                    <span className={cn("rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg", !x.recommended && "invisible")} aria-hidden={!x.recommended}>
                      {t(c.recommended)}
                    </span>
                    <span className="font-display text-h3 font-extrabold tracking-tight text-fg">{t(x.name)}</span>
                    <span className="max-w-[16ch] text-xs text-fg-muted">{t(x.tagline)}</span>
                    <span className="mt-1 font-display text-[1.6rem] font-extrabold tabular tracking-tight text-fg" data-testid={`cr-price-${x.id}`}>
                      {tl(x.price[licence], locale)}
                    </span>
                    <Button size="sm" variant={i === ci ? "primary" : "secondary"} aria-pressed={i === ci} onClick={() => setCourse(x.id as CourseId)}>
                      {i === ci ? <Check aria-hidden /> : null}
                      {i === ci ? t(c.chosen) : t(c.choose)}
                      <span className="sr-only"> {t(x.name)}</span>
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className="sticky start-0 z-10 border-t-2 border-fg bg-scene py-4 pe-4 text-start font-normal">
                <span className="block font-medium text-fg">{t(c.ready)}</span>
                <span className="block text-xs text-fg-muted">{t(c.readyHint)}</span>
              </th>
              {courses.map((x, i) => (
                <td key={x.id} className={cn(col(i), "border-t-2 border-fg py-4")} aria-live="polite">
                  <span className="font-display text-lead font-extrabold tabular text-fg" data-testid={`cr-weeks-${x.id}`}>
                    {fill(t(c.weeks), { n: weeksFor(x, licence, perWeek) })}
                  </span>
                  {x.fixedWeeks ? <span className="block text-xs text-fg-muted">{t(c.fixedNote)}</span> : null}
                </td>
              ))}
            </tr>
            {groups.map((g) =>
              g.rows.length ? (
                <React.Fragment key={g.title.en}>
                  <tr>
                    <th scope="colgroup" colSpan={4} className="sticky start-0 bg-scene pt-8 pb-2 text-start font-mono text-eyebrow font-normal uppercase tracking-[0.16em] text-accent-ink">
                      {t(g.title)}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.id}>
                      <th scope="row" className="sticky start-0 z-10 border-t border-line bg-scene py-3 pe-4 text-start font-normal">
                        <span className="block text-fg">{t(r.label)}</span>
                        {r.hint ? <span className="block text-xs text-fg-muted">{t(r.hint)}</span> : null}
                      </th>
                      {r.cells.map((v, i) => (
                        <td key={i} className={cn(col(i), "border-t border-line py-3 tabular")}>
                          {cellView(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ) : null,
            )}
            <tr>
              <th scope="row" className="sticky start-0 z-10 border-t border-line bg-scene py-5 pe-4 text-start font-normal text-fg-muted">
                {t(c.price)}
              </th>
              {courses.map((x, i) => (
                <td key={x.id} className={cn(col(i), "rounded-b-ui-lg border-t border-line py-5")}>
                  <Button size="sm" variant={i === ci ? "primary" : "ghost"} onClick={() => signUp(x.id, licence)} aria-label={`${t(c.signUp)} — ${t(x.name)}`}>
                    {t(c.signUp)}
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {diffOnly && shown < total ? <p className="text-small text-fg-muted" role="status">{fill(t(c.hidden), { n: total - shown })}</p> : null}

      <div className="surface flex flex-col gap-4 rounded-ui-lg p-5 @3xl:flex-row @3xl:items-center @3xl:justify-between" aria-live="polite">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.pick)}</span>
          <span className="font-display text-h3 font-extrabold text-fg">{t(chosen.name)}</span>
          <span className="text-fg-muted">
            {t(licences.find((l) => l.id === licence)!.name)} · {fill(t(c.lessons), { n: chosen.lessons[licence] })} · {fill(t(c.weeks), { n: weeksFor(chosen, licence, perWeek) })}
          </span>
          <span className="font-display text-h3 font-extrabold tabular text-fg">{tl(chosen.price[licence], locale)}</span>
        </p>
        <Button variant="primary" size="lg" onClick={() => signUp()}>
          {t(c.signUp)}
          <ArrowRight aria-hidden className="rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
