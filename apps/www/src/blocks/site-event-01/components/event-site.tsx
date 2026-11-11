import { Button } from "@vamos-ui/react";
import { Container, Cta, Faq, Footer, LogoStrip, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, DAYS, EMAIL, faqHome, PHONE, photos, sessions, speakers, sponsorLogos, type SiteLocale } from "./content";
import { EventHero } from "./hero";
import { TrackShape } from "./schedule-board";
import { SchedulePage } from "./schedule-page";
import { Speakers } from "./speakers";
import { TicketsPage } from "./tickets-page";
import { Venue } from "./venue";

const home = (anchor?: string) => sitePageHref("home", anchor);
const schedule = sitePageHref("schedule");
const tickets = sitePageHref("tickets");

/**
 * One language version of the Interface Days site: navbar and footer around three pages (home,
 * schedule, tickets). Server component; the SiteShell in page.tsx picks page and language.
 */
export function EventSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, time, eur, intl, labels } = c;
  const common = { locale: intl, labels };
  const people = new Map(speakers.map((s) => [s.id, s]));

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display text-[15px] font-bold tracking-[-0.02em] uppercase">
            <span aria-hidden className="flex items-center gap-[3px]">
              <span className="size-3 rounded-full bg-accent" />
              <span className="size-3 bg-fg" />
            </span>
            Interface Days
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Speakers", tr: "Konuşmacılar" }), href: home("speakers") },
          { label: t({ en: "Schedule", tr: "Program" }), href: schedule },
          { label: t({ en: "Venue", tr: "Mekân" }), href: home("venue") },
          { label: t({ en: "Tickets", tr: "Biletler" }), href: tickets },
          { label: "FAQ", href: home("faq") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: tickets, label: t({ en: "Get tickets", tr: "Bilet al" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Interface Days 2027 — 14–15 May, Istanbul", tr: "Interface Days 2027 — 14–15 Mayıs, İstanbul" })}>
          <EventHero c={c} />

          <Speakers c={c} />

          {/* Programme at a glance: the keynotes per day, then the link to the full board. */}
          <Section anchor="programme" headingId="ifd-glance-title" theme={{ surface: "surface-2" }}>
            <Container size="wide">
              <SectionHeader
                headingId="ifd-glance-title"
                align="split"
                eyebrow={t({ en: "Programme", tr: "Program" })}
                title={t({ en: "Four keynotes, *three* tracks", tr: "Dört ana konuşma, *üç* kulvar" })}
                lead={t({ en: "Design in Studio B, engineering on the main stage, hands-on work in the loft. Build your own agenda on the schedule page.", tr: "Tasarım Stüdyo B’de, mühendislik ana sahnede, uygulamalı çalışma atölye katında. Program sayfasında kendi ajandanızı oluşturun." })}
                actions={
                  <Button asChild variant="solid" className="rounded-none">
                    <a href={schedule}>{t({ en: "Open the full schedule", tr: "Tüm programı aç" })}</a>
                  </Button>
                }
              />
              <div className="mt-12 grid gap-px border-2 border-fg bg-fg md:grid-cols-2">
                {DAYS.map((d, day) => {
                  const keynotes = sessions.filter((s) => s.day === day && s.kind === "keynote");
                  const talks = sessions.filter((s) => s.day === day && s.kind === "talk").length;
                  const workshops = sessions.filter((s) => s.day === day && s.kind === "workshop").length;
                  return (
                    <div key={d} className="flex flex-col bg-scene p-5 sm:p-7">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="m-0 font-display text-display-m font-bold uppercase">{f.date(d, { weekday: "long" })}</h3>
                        <span className="font-mono text-xs font-semibold text-fg-muted tabular">{f.date(d, { day: "numeric", month: "short" })}</span>
                      </div>
                      <ol className="m-0 mt-6 grid list-none gap-0 p-0">
                        {keynotes.map((k) => (
                          <li key={k.id} className="grid grid-cols-[4rem_1fr] gap-4 border-t border-line py-4">
                            <span className="font-mono text-sm font-semibold text-fg tabular">{time(k.start)}</span>
                            <span>
                              <span className="block text-lg leading-snug font-bold tracking-[-0.02em] text-fg">{t(k.title)}</span>
                              <span className="block text-small text-fg-muted">{k.speaker ? people.get(k.speaker)?.name : null}</span>
                            </span>
                          </li>
                        ))}
                      </ol>
                      <p className="m-0 mt-auto flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-4 font-mono text-[11px] text-fg-muted">
                        <span className="flex items-center gap-2"><TrackShape shape="circle" />{t({ en: `${talks} talks`, tr: `${talks} konuşma` })}</span>
                        <span className="flex items-center gap-2"><TrackShape shape="triangle" />{t({ en: `${workshops} workshops`, tr: `${workshops} atölye` })}</span>
                        {day === 0 ? <span>{t({ en: `Ferry social ${time("18:30")}`, tr: `Vapur buluşması ${time("18:30")}` })}</span> : null}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Container>
          </Section>

          <Venue c={c} />

          <LogoStrip {...common} anchor="sponsors" variant="grid" columns={4} caption={t({ en: "Made possible by — none of them get a talk", tr: "Destekleyenler — hiçbiri konuşma satın almadı" })} logos={sponsorLogos} />

          <Cta
            {...common}
            variant="split"
            theme={{ surface: "accent" }}
            eyebrow={t({ en: "Early bird", tr: "Erken kayıt" })}
            title={t({ en: `${eur(290)} until *28 February*`, tr: `*28 Şubat*’a kadar ${eur(290)}` })}
            lead={t({ en: "143 early-bird tickets left. Both days, a workshop seat, lunch and the ferry.", tr: "143 erken kayıt bileti kaldı. İki gün, bir atölye koltuğu, öğle yemeği ve vapur." })}
            media={{ ...photos.crowd, alt: t(photos.crowd.alt) }}
            actions={[
              { link: { href: tickets, label: t({ en: "See all tickets", tr: "Tüm biletleri gör" }) }, style: "primary" },
              { link: { href: "mailto:teams@interfacedays.example.com", label: t({ en: "Teams of 5+", tr: "5+ kişilik ekipler" }) }, style: "secondary" },
            ]}
          />

          <Faq
            {...common}
            anchor="faq"
            variant="columns"
            eyebrow="FAQ"
            title={t({ en: "Before you *book*", tr: "Bilet almadan *önce*" })}
            items={faqHome.map((x) => ({ q: t(x.q), a: t(x.a) }))}
            contact={{ link: { href: sitePageHref("tickets", "conduct"), label: t({ en: "Read the code of conduct", tr: "Davranış kurallarını okuyun" }) }, style: "link" }}
            deepLink={false}
          />
        </SiteShellPage>

        <SiteShellPage id="schedule" title={t({ en: "Schedule — Interface Days 2027", tr: "Program — Interface Days 2027" })}>
          <SchedulePage c={c} />
        </SiteShellPage>

        <SiteShellPage id="tickets" title={t({ en: "Tickets — Interface Days 2027", tr: "Biletler — Interface Days 2027" })}>
          <TicketsPage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Interface Days", href: home() }}
        about={t({ en: "An independent, not-for-profit conference for people who design and build interfaces. Istanbul, since 2025.", tr: "Arayüz tasarlayan ve geliştirenler için bağımsız, kâr amacı gütmeyen bir konferans. 2025’ten beri İstanbul’da." })}
        columns={[
          { title: "2027", links: [{ href: schedule, label: t({ en: "Schedule", tr: "Program" }) }, { href: home("speakers"), label: t({ en: "Speakers", tr: "Konuşmacılar" }) }, { href: tickets, label: t({ en: "Tickets", tr: "Biletler" }) }] },
          { title: t({ en: "Attend", tr: "Katılım" }), links: [{ href: home("venue"), label: t({ en: "Venue and travel", tr: "Mekân ve ulaşım" }) }, { href: sitePageHref("tickets", "conduct"), label: t({ en: "Code of conduct", tr: "Davranış kuralları" }) }, { href: home("faq"), label: "FAQ" }] },
          { title: t({ en: "Get involved", tr: "Katkı" }), links: [{ href: "/cfp", label: t({ en: "Call for workshops", tr: "Atölye çağrısı" }) }, { href: "/volunteer", label: t({ en: "Volunteer", tr: "Gönüllü ol" }) }, { href: "mailto:sponsors@interfacedays.example.com", label: t({ en: "Sponsor", tr: "Sponsor ol" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/interfacedays-example" }, { network: "youtube", href: "https://youtube.com/@interfacedays.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: sitePageHref("tickets", "conduct"), label: t({ en: "Code of conduct", tr: "Davranış kuralları" }) }]}
        year={2026}
      />
    </>
  );
}
