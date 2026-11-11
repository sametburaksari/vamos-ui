"use client";

import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CHECKED_AT, components, copyFor, groups, incidents, type GroupId, type SiteLocale } from "./content";
import { affected, ImpactBadge } from "./incident-parts";
import { IncidentLink } from "./status-provider";

/** Every incident and maintenance of the last 90 days, by month, filterable by component group. */
export function HistoryPage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels, day, time, minutes } = copyFor(locale);
  const [group, setGroup] = React.useState<"all" | GroupId>("all");
  const list = incidents.filter((x) => group === "all" || x.components.some((id) => components.find((c) => c.id === id)?.group === group));
  const months = Array.from(new Set(list.map((x) => x.start.slice(0, 7))));
  const totalMinutes = incidents.filter((x) => x.impact !== "maintenance").reduce((s, x) => s + Math.round((new Date(x.end ?? CHECKED_AT).getTime() - new Date(x.start).getTime()) / 60000), 0);

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="simple"
        breadcrumb={[{ label: t({ en: "Status", tr: "Durum" }), href: sitePageHref("home") }, { label: t({ en: "History", tr: "Geçmiş" }) }]}
        title={t({ en: "Incident history", tr: "Olay geçmişi" })}
        lead={t({ en: "Every incident and maintenance window of the last 90 days, newest first. Times in UTC.", tr: "Son 90 günün tüm olayları ve bakım pencereleri, en yeni önce. Saatler UTC." })}
        meta={[
          { label: t({ en: "Incidents", tr: "Olay" }), value: f.number(incidents.filter((x) => x.impact !== "maintenance").length) },
          { label: t({ en: "Total impact", tr: "Toplam etki" }), value: minutes(totalMinutes) },
        ]}
      />
      <Section anchor="list" headingId="st-hist-title" theme={{ rhythm: "tight" }}>
        <Container>
          <h2 id="st-hist-title" className="sr-only">
            {t({ en: "Incidents by month", tr: "Aylara göre olaylar" })}
          </h2>
          <ToggleGroup aria-label={t({ en: "Filter by component", tr: "Bileşene göre süz" })} value={group} onValueChange={(v) => setGroup(v as "all" | GroupId)} size="sm">
            <ToggleGroupItem value="all">{t({ en: "All", tr: "Tümü" })}</ToggleGroupItem>
            {groups.map((g) => (
              <ToggleGroupItem key={g.id} value={g.id}>
                {t(g.name)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="sr-only" aria-live="polite">
            {t({ en: `${list.length} incidents shown`, tr: `${list.length} olay gösteriliyor` })}
          </p>

          <div className="mt-8 grid gap-10">
            {months.map((m) => (
              <section key={m} aria-labelledby={`st-m-${m}`}>
                <h3 id={`st-m-${m}`} className="m-0 border-b border-line pb-2 text-sm font-semibold text-fg">
                  {f.date(`${m}-01`, { month: "long", year: "numeric" })}
                </h3>
                <ul className="m-0 list-none p-0">
                  {list
                    .filter((x) => x.start.startsWith(m))
                    .map((x) => {
                      const mins = Math.round((new Date(x.end ?? CHECKED_AT).getTime() - new Date(x.start).getTime()) / 60000);
                      return (
                        <li key={x.id} className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <div className="min-w-0">
                            <IncidentLink id={x.id} className="font-medium text-fg underline decoration-line underline-offset-4 focus-ring hover:decoration-fg">
                              {t(x.title)}
                            </IncidentLink>
                            <p className="m-0 mt-1 text-sm text-fg-muted">
                              {affected(x, locale)} · {day(x.start)}, {time(x.start)}–{x.end ? time(x.end) : t({ en: "ongoing", tr: "sürüyor" })} UTC · {minutes(mins)}
                            </p>
                          </div>
                          <div className="sm:pt-0.5">
                            <ImpactBadge impact={x.impact} locale={locale} />
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
            {list.length === 0 ? <p className="m-0 text-fg-muted">{t({ en: "No incidents for these components in 90 days.", tr: "Bu bileşenlerde 90 günde olay yok." })}</p> : null}
          </div>
        </Container>
      </Section>
    </>
  );
}
