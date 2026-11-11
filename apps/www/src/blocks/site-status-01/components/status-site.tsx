import { CalendarClock } from "lucide-react";
import { Alert, Card } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { Container, Footer, Navbar, Section, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { CHECKED_AT, components, copyFor, EMAIL, groups, healthLabel, healthTone, incidents, PHONE, upcoming, type Health, type SiteLocale } from "./content";
import { HistoryPage } from "./history-page";
import { affected, ImpactBadge, IncidentUpdates } from "./incident-parts";
import { IncidentPage } from "./incident-page";
import { LatencyChart } from "./latency-chart";
import { IncidentLink } from "./status-provider";
import { StatusSubscribe } from "./subscribe";
import { UptimeBars } from "./uptime-bars";

const home = (anchor?: string) => sitePageHref("home", anchor);

function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-fg">
      <span aria-hidden className="relative inline-grid size-[20px] place-items-center rounded-[5px] bg-fg">
        <span className="absolute start-[4px] h-[2px] w-[8px] rounded-full bg-scene" />
        <span className="absolute end-[4px] size-[5px] rounded-full bg-success" />
      </span>
      Relay <span className="font-normal text-fg-muted">Status</span>
    </span>
  );
}

const rank: Record<Health, number> = { operational: 0, maintenance: 1, degraded: 2, partial: 3, major: 4 };

/**
 * One language version of the Relay status page: current status (banner, active incident,
 * scheduled maintenance, components with 90-day uptime bars, API latency, recent incidents,
 * subscribe), one incident in detail and the 90-day history. Server component; the bars,
 * chart, subscribe box and the two inner pages are client islands.
 */
export function StatusSite({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels, time, day } = copyFor(locale);
  const common = { locale: intl, labels };
  const active = incidents.filter((x) => !x.end && x.impact !== "maintenance");
  const worst = components.reduce<Health>((w, c) => (rank[c.now] > rank[w] ? c.now : w), "operational");
  const recent = incidents.filter((x) => x.end).slice(0, 3);

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Current status", tr: "Güncel durum" }), href: home() },
          { label: t({ en: "History", tr: "Geçmiş" }), href: sitePageHref("history") },
          { label: t({ en: "relay.example.com", tr: "relay.example.com" }), href: "https://relay.example.com" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("subscribe"), label: t({ en: "Subscribe to updates", tr: "Güncellemelere abone ol" }) }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Relay status", tr: "Relay durumu" })}>
          <Section anchor="now" headingId="st-now-title" theme={{ rhythm: "tight" }}>
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 pt-2">
                <h1 id="st-now-title" className="m-0 font-display text-[length:var(--text-display-m)] leading-[1.05] text-fg">
                  {t({ en: "Current status", tr: "Güncel durum" })}
                </h1>
                <p className="m-0 text-xs text-fg-muted tabular">
                  {t({ en: `Checked ${day(CHECKED_AT)}, ${time(CHECKED_AT)} UTC · every 30 s`, tr: `Kontrol ${day(CHECKED_AT)}, ${time(CHECKED_AT)} UTC · 30 sn’de bir` })}
                </p>
              </div>

              {/* Overall banner: a thick status-coloured edge, the summary, and the way to the incident. */}
              <div className="vm-enter mt-6 overflow-hidden rounded-ui-lg border border-line bg-surface">
                <div className={`h-1.5 ${healthTone[worst].fill}`} aria-hidden />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-5 sm:px-6">
                  <span aria-hidden className={`relative grid size-10 shrink-0 place-items-center rounded-full ${healthTone[worst].text}`}>
                    <span className="absolute inset-0 rounded-full bg-current opacity-15" />
                    <span className="size-3 rounded-full bg-current motion-safe:animate-pulse" />
                  </span>
                  <div className="min-w-0 flex-1 basis-[14rem]">
                    <p className="m-0 text-lg font-semibold text-fg">
                      {worst === "operational"
                        ? t({ en: "All systems operational", tr: "Tüm sistemler çalışıyor" })
                        : t({ en: "Minor delays in webhook delivery (EU)", tr: "Webhook teslimatında küçük gecikmeler (AB)" })}
                    </p>
                    <p className="m-0 mt-0.5 text-sm text-fg-muted">
                      {t({
                        en: `${components.filter((c) => c.now === "operational").length} of ${components.length} components operational. No data has been lost.`,
                        tr: `${components.length} bileşenden ${components.filter((c) => c.now === "operational").length} tanesi çalışıyor. Veri kaybı yok.`,
                      })}
                    </p>
                  </div>
                  {active[0] ? (
                    <IncidentLink id={active[0].id} className="vm-press inline-flex h-9 items-center rounded-ui border border-field-border px-3.5 text-sm font-medium text-fg no-underline focus-ring hover:bg-hover">
                      {t({ en: "View incident", tr: "Olayı görüntüle" })}
                    </IncidentLink>
                  ) : null}
                </div>
              </div>

              {/* Active incidents with their latest updates. */}
              {active.map((x) => (
                <Card key={x.id} variant="outline" padding="md" className="mt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <ImpactBadge impact={x.impact} locale={locale} />
                    <span className="text-xs text-fg-muted">{affected(x, locale)}</span>
                  </div>
                  <h2 className="m-0 mt-2 text-lg font-semibold text-fg">
                    <IncidentLink id={x.id} className="text-fg no-underline focus-ring hover:underline">
                      {t(x.title)}
                    </IncidentLink>
                  </h2>
                  <div className="mt-4">
                    <IncidentUpdates incident={x} locale={locale} limit={2} />
                  </div>
                </Card>
              ))}

              <Alert
                tone="info"
                className="mt-4"
                icon={<CalendarClock aria-hidden />}
              >
                <strong className="block font-semibold text-fg">
                  {t({ en: "Scheduled", tr: "Planlı" })} · {t(upcoming.title)}
                </strong>
                <span className="tabular">
                  {day(upcoming.start)}, {time(upcoming.start)}–{time(upcoming.end)} UTC.
                </span>{" "}
                {t(upcoming.text)}
              </Alert>
            </Container>
          </Section>

          <Section anchor="components" headingId="st-comp-title" theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="st-comp-title" className="m-0 text-sm font-semibold tracking-[0.02em] text-fg uppercase">
                  {t({ en: "Components · last 90 days", tr: "Bileşenler · son 90 gün" })}
                </h2>
                <ul aria-label={t({ en: "Legend", tr: "Açıklama" })} className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-fg-muted">
                  {(["operational", "degraded", "major", "maintenance"] as const).map((h) => (
                    <li key={h} className="inline-flex items-center gap-1.5">
                      <span aria-hidden className={`h-3 w-1.5 rounded-[1px] ${healthTone[h].fill}`} />
                      {t(healthLabel[h])}
                    </li>
                  ))}
                  <li className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="h-3 w-1.5 rounded-[1px] bg-track" />
                    {t({ en: "No data", tr: "Veri yok" })}
                  </li>
                </ul>
              </div>

              <div className="mt-5 grid gap-4">
                {groups.map((g) => (
                  <Card key={g.id} variant="surface" padding="none">
                    <h3 className="m-0 border-b border-line px-5 py-3 text-sm font-semibold text-fg">{t(g.name)}</h3>
                    <ul className="m-0 list-none p-0">
                      {components
                        .filter((c) => c.group === g.id)
                        .map((c) => (
                          <li key={c.id} className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                              <span className="font-medium text-fg">
                                {t(c.name)}
                                {c.note ? <span className="ms-2 text-xs font-normal text-fg-muted">{t(c.note)}</span> : null}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-fg">
                                <span aria-hidden className={`size-2 rounded-full ${healthTone[c.now].fill}`} />
                                {t(healthLabel[c.now])}
                              </span>
                            </div>
                            <UptimeBars component={c} locale={locale} />
                          </li>
                        ))}
                    </ul>
                  </Card>
                ))}
              </div>
              <p className="m-0 mt-3 text-xs text-fg-muted">
                {t({ en: "Hover or focus a day for details; use the arrow keys to move along a row. Days with an incident open its timeline.", tr: "Ayrıntı için bir günün üzerine gelin ya da odaklanın; satırda ok tuşlarıyla ilerleyin. Olaylı günler zaman çizelgesini açar." })}
              </p>
            </Container>
          </Section>

          <Section anchor="performance" headingId="st-perf-title" theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <Card variant="surface" padding="md" className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 id="st-perf-title" className="m-0 text-sm font-semibold text-fg">
                      {t({ en: "REST API p95 latency", tr: "REST API p95 gecikmesi" })}
                    </h2>
                    <span className="text-xs text-fg-muted">{t({ en: "Last 14 days · target 250 ms", tr: "Son 14 gün · hedef 250 ms" })}</span>
                  </div>
                  <div className="mt-4">
                    <LatencyChart locale={locale} />
                  </div>
                </Card>
                <Card variant="surface" padding="md">
                  <h2 className="m-0 text-sm font-semibold text-fg">{t({ en: "Recently resolved", tr: "Son çözülenler" })}</h2>
                  <Stagger asChild effect="fade" step={70}>
                  <ul className="m-0 mt-3 grid list-none gap-3 p-0">
                    {recent.map((x) => (
                      <li key={x.id} className="grid gap-1 border-t border-line pt-3 first:border-t-0 first:pt-0">
                        <IncidentLink id={x.id} className="text-sm font-medium text-fg underline decoration-line underline-offset-4 focus-ring hover:decoration-fg">
                          {t(x.title)}
                        </IncidentLink>
                        <span className="flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                          <ImpactBadge impact={x.impact} locale={locale} />
                          {day(x.start)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  </Stagger>
                  <a href={sitePageHref("history")} className="mt-4 inline-block text-sm font-medium text-fg underline underline-offset-4 focus-ring">
                    {t({ en: "Full history", tr: "Tüm geçmiş" })}
                  </a>
                </Card>
              </div>
            </Container>
          </Section>

          <Section anchor="subscribe" headingId="st-sub-title" theme={{ surface: "surface-2", rhythm: "tight" }}>
            <Container>
              <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-12">
                <div>
                  <h2 id="st-sub-title" className="m-0 font-display text-2xl text-fg">
                    {t({ en: "Get notified", tr: "Haberdar olun" })}
                  </h2>
                  <p className="m-0 mt-2 max-w-[40ch] text-sm text-fg-muted">
                    {t({ en: `Incidents and maintenance only — on average ${f.number(2.3, { maximumFractionDigits: 1 })} messages a month.`, tr: `Yalnızca olaylar ve bakımlar — ayda ortalama ${f.number(2.3, { maximumFractionDigits: 1 })} mesaj.` })}
                  </p>
                </div>
                <StatusSubscribe locale={locale} />
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="incident" title={t({ en: "Incident — Relay status", tr: "Olay — Relay durumu" })}>
          <IncidentPage locale={locale} />
        </SiteShellPage>

        <SiteShellPage id="history" title={t({ en: "History — Relay status", tr: "Geçmiş — Relay durumu" })}>
          <HistoryPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Relay", href: home() }}
        contact={{ email: EMAIL, phone: PHONE }}
        legalLinks={[
          { href: "https://relay.example.com/sla", label: "SLA" },
          { href: "https://relay.example.com/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "https://status.relay.example.com/history.rss", label: "RSS" },
        ]}
        year={2026}
      />
    </>
  );
}
