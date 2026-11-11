"use client";

import { ArrowLeft } from "lucide-react";
import { Card, DescriptionList } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CHECKED_AT, copyFor, incidents, type SiteLocale } from "./content";
import { affected, ImpactBadge, IncidentUpdates, StatusPill } from "./incident-parts";
import { useStatus } from "./status-provider";

/** One incident: what was hit, for how long, every update, and the postmortem when there is one. */
export function IncidentPage({ locale }: { locale: SiteLocale }) {
  const { t, time, day, minutes } = copyFor(locale);
  const { incident: id } = useStatus();
  const x = incidents.find((i) => i.id === id) ?? incidents[0]!;
  const ongoing = !x.end;
  const mins = Math.round((new Date(x.end ?? CHECKED_AT).getTime() - new Date(x.start).getTime()) / 60000);

  return (
    <Section anchor="incident" headingId="st-incident-title" theme={{ rhythm: "tight" }}>
      <Container size="prose">
        <a href={sitePageHref("history")} className="inline-flex items-center gap-1.5 text-sm text-fg-muted no-underline focus-ring hover:text-fg">
          <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
          {t({ en: "Incident history", tr: "Olay geçmişi" })}
        </a>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <ImpactBadge impact={x.impact} locale={locale} />
          {ongoing ? (
            <StatusPill fill="bg-warning">{t({ en: "Ongoing", tr: "Sürüyor" })}</StatusPill>
          ) : (
            <StatusPill fill="bg-success">{x.impact === "maintenance" ? t({ en: "Completed", tr: "Tamamlandı" }) : t({ en: "Resolved", tr: "Çözüldü" })}</StatusPill>
          )}
        </div>
        <h1 id="st-incident-title" className="m-0 mt-3 font-display text-[length:var(--text-display-m)] leading-[1.1] text-fg">
          {t(x.title)}
        </h1>

        <Card variant="outline" padding="md" className="mt-6">
          <DescriptionList
            layout="grid"
            columns={2}
            items={[
              { key: "affected", label: t({ en: "Affected", tr: "Etkilenen" }), value: affected(x, locale) },
              { key: "started", label: t({ en: "Started", tr: "Başlangıç" }), value: `${day(x.start)} · ${time(x.start)} UTC` },
              { key: "duration", label: ongoing ? t({ en: "Running for", tr: "Süre (devam)" }) : t({ en: "Duration", tr: "Süre" }), value: minutes(mins) },
              { key: "ref", label: t({ en: "Reference", tr: "Referans" }), value: <span className="font-mono text-[13px]">{x.id}</span> },
            ]}
          />
        </Card>

        <h2 className="m-0 mt-10 text-sm font-semibold tracking-[0.02em] text-fg uppercase">{t({ en: "Updates", tr: "Güncellemeler" })}</h2>
        <div className="mt-4">
          <IncidentUpdates incident={x} locale={locale} />
        </div>

        {x.postmortem ? (
          <section aria-labelledby="st-pm-title" className="mt-12 border-t border-line pt-8">
            <h2 id="st-pm-title" className="m-0 font-display text-2xl text-fg">
              {t({ en: "Postmortem", tr: "Olay sonrası inceleme" })}
            </h2>
            <h3 className="m-0 mt-6 text-sm font-semibold text-fg">{t({ en: "What happened", tr: "Ne oldu" })}</h3>
            <p className="m-0 mt-2 text-fg-muted">{t(x.postmortem.summary)}</p>
            <h3 className="m-0 mt-6 text-sm font-semibold text-fg">{t({ en: "Why", tr: "Neden" })}</h3>
            <p className="m-0 mt-2 text-fg-muted">{t(x.postmortem.cause)}</p>
            <h3 className="m-0 mt-6 text-sm font-semibold text-fg">{t({ en: "What we changed", tr: "Neyi değiştirdik" })}</h3>
            <ul className="m-0 mt-2 grid gap-2 ps-5 text-fg-muted">
              {x.postmortem.actions.map((a, i) => (
                <li key={i}>{t(a)}</li>
              ))}
            </ul>
          </section>
        ) : !ongoing && x.impact !== "maintenance" ? (
          <p className="m-0 mt-10 text-sm text-fg-muted">{t({ en: "Incidents shorter than 30 minutes without data loss get no written postmortem.", tr: "30 dakikadan kısa ve veri kaybı olmayan olaylar için yazılı inceleme yayımlanmaz." })}</p>
        ) : null}
      </Container>
    </Section>
  );
}
