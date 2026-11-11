"use client";

import * as React from "react";
import { Calendar, RadioGroup, type CalendarMarker } from "@vamos-ui/react";
import { cohorts, copyFor, type Cohort, type SiteLocale } from "./content";

/**
 * Cohort picker beside a calendar of the chosen cohort's live sessions (Tuesday evenings and
 * Saturday mornings). Controlled from outside on the enrol page, uncontrolled on the home page.
 */
export function CohortDates({
  locale,
  value,
  onValueChange,
  name,
}: {
  locale: SiteLocale;
  value?: Cohort["id"];
  onValueChange?: (id: Cohort["id"]) => void;
  name?: string;
}) {
  const { t, f } = copyFor(locale);
  const [inner, setInner] = React.useState<Cohort["id"]>("winter");
  const id = value ?? inner;
  const cohort = cohorts.find((c) => c.id === id)!;
  const [month, setMonth] = React.useState(cohort.start.slice(0, 7));
  React.useEffect(() => setMonth(cohort.start.slice(0, 7)), [cohort.start]);

  const markers = React.useMemo(() => {
    const out: Record<string, CalendarMarker | CalendarMarker[]> = {};
    for (const day of cohort.live) {
      const tue = new Date(`${day}T12:00:00Z`).getUTCDay() === 2;
      out[day] = { label: tue ? t({ en: "Live session, 19:30", tr: "Canlı ders, 19:30" }) : t({ en: "Live lab, 11:00", tr: "Canlı uygulama, 11:00" }), tone: "accent" };
    }
    out[cohort.start] = { label: t({ en: "Cohort starts", tr: "Dönem başlıyor" }), tone: "success" };
    return out;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohort, locale]);

  const items = cohorts.map((c) => {
    const left = c.seats - c.taken;
    return {
      value: c.id,
      label: (
        <span className="flex w-full flex-col gap-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span>{t(c.name)}</span>
            <span className="font-mono text-[11px] tabular text-fg-muted">{f.dateRange(c.start, c.end, "medium")}</span>
          </span>
          <span className="text-small font-normal text-fg-muted">
            {left <= 14 ? t({ en: `${left} of ${c.seats} seats left`, tr: `${c.seats} yerden ${left} tanesi kaldı` }) : t({ en: `Open · ${left} seats`, tr: `Açık · ${left} yer` })}
          </span>
        </span>
      ),
    };
  });

  return (
    <div className="grid gap-x-(--gutter) gap-y-8 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="flex flex-col gap-4">
        <RadioGroup
          variant="card"
          name={name}
          aria-label={t({ en: "Cohort", tr: "Dönem" })}
          value={id}
          onValueChange={(v) => (onValueChange ? onValueChange(v as Cohort["id"]) : setInner(v as Cohort["id"]))}
          items={items}
        />
        <p className="text-small text-fg-muted">
          {t({
            en: "All sessions are live on video and recorded. Times are Istanbul time (GMT+3). Miss one and you watch the recording; miss three and a mentor calls you.",
            tr: "Tüm oturumlar canlı ve kaydediliyor. Saatler İstanbul saatidir (GMT+3). Birini kaçırırsanız kaydı izlersiniz; üçünü kaçırırsanız bir mentor sizi arar.",
          })}
        </p>
      </div>
      <Calendar
        mode="none"
        variant="card"
        month={month}
        onMonthChange={(m) => setMonth(m.slice(0, 7))}
        markers={markers}
        holidays={false}
        gridProps={{ showOutsideDays: false }}
        weekStartsOn={1}
        legend={[
          { label: t({ en: "Live session", tr: "Canlı ders" }), tone: "accent" },
          { label: t({ en: "First day", tr: "İlk gün" }), tone: "success" },
        ]}
        aria-label={t({ en: "Live sessions of the chosen cohort", tr: "Seçilen dönemin canlı dersleri" })}
      />
    </div>
  );
}
