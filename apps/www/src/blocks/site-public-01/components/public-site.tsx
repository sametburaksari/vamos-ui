import { ArrowRight, Clock, Phone, Search } from "lucide-react";
import { Badge, Button, Input } from "@vamos-ui/react";
import { AnnouncementBar, BlockHeading, Container, Footer, MapHours, Navbar, Section, SiteShellPage, StatsBand, sitePageHref } from "@vamos-ui/react/blocks";
import { A11yToolbar } from "./a11y";
import { AnnouncementPage } from "./announcement-page";
import { BRAND, copyFor, EMAIL, noticeKinds, notices, numbers, office, PHONE, topTasks, works, type SiteLocale } from "./content";
import { DistrictMark } from "./district-mark";
import { ServicesPage } from "./services-page";

export const publicPages = ["home", "services", "announcement"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const services = (anchor?: string) => sitePageHref("services", anchor);
const announcement = sitePageHref("announcement");

/**
 * One language version of the district office site: the accessibility toolbar, a service
 * notice, navigation, then home (task-first hero with today's desk waits, top tasks,
 * announcements, figures, hours and the accessibility statement), the services A–Z and one
 * announcement. Server component; the toolbar and the service finder are client islands.
 */
export function PublicSite({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const brand = t(BRAND);
  const branch = office(t);
  const time = (iso: string) => f.time(iso, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  return (
    <>
      <A11yToolbar
        labels={{
          region: t({ en: "Accessibility settings", tr: "Erişilebilirlik ayarları" }),
          title: t({ en: "Accessibility", tr: "Erişilebilirlik" }),
          size: t({ en: "Text size", tr: "Yazı boyutu" }),
          sizes: { standard: t({ en: "Standard text", tr: "Standart yazı" }), large: t({ en: "Large text", tr: "Büyük yazı" }), larger: t({ en: "Largest text", tr: "En büyük yazı" }) },
          contrast: t({ en: "Contrast", tr: "Kontrast" }),
          contrasts: { standard: t({ en: "Standard", tr: "Standart" }), high: t({ en: "High", tr: "Yüksek" }) },
          underline: t({ en: "Underline links", tr: "Bağlantıların altını çiz" }),
          reset: t({ en: "Reset", tr: "Sıfırla" }),
          on: t({ en: "adjusted", tr: "ayarlı" }),
          statement: t({ en: "Accessibility statement", tr: "Erişilebilirlik beyanı" }),
          statementHref: home("accessibility"),
        }}
      />

      <AnnouncementBar
        {...common}
        tone="warning"
        label={t({ en: "Service notice", tr: "Hizmet duyurusu" })}
        text={t({ en: "No water on Iskele Caddesi 1–58 and Fener Sokak from 12 Nov 09:00 to 14 Nov 18:00.", tr: "12 Kasım 09.00 ile 14 Kasım 18.00 arasında İskele Caddesi 1–58 ve Fener Sokak’ta su yok." })}
        link={{ href: announcement, label: t({ en: "What to do", tr: "Ne yapmalı" }) }}
      />

      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<DistrictMark name={brand} />}
        homeHref={home()}
        items={[
          { label: t({ en: "Services A–Z", tr: "Hizmetler A–Z" }), href: services() },
          { label: t({ en: "Announcements", tr: "Duyurular" }), href: home("announcements") },
          { label: t({ en: "Opening hours", tr: "Çalışma saatleri" }), href: home("visit") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: home("visit") },
        ]}
        phone={PHONE}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: services("svc-address"), label: t({ en: "Book a desk appointment", tr: "Banko randevusu alın" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Riverside District Office — public services", tr: "Riverside İlçe Ofisi — kamu hizmetleri" })}>
          {/* Task-first hero: the question, a search that opens the services A–Z, and today at the office. */}
          <section aria-labelledby="rdo-title" className="@container border-b border-line bg-surface">
            <Container>
              <div className="grid gap-10 py-12 @4xl:grid-cols-12 @4xl:gap-12 @4xl:py-16">
                <div className="@4xl:col-span-7">
                  <p className="m-0 text-small font-semibold tracking-[0.02em] text-accent-ink">{brand}</p>
                  <BlockHeading id="rdo-title" level={1} size="display-l" className="mt-3 max-w-[16ch]" text={t({ en: "What do you need to do today?", tr: "Bugün ne yapmanız gerekiyor?" })} />
                  <p className="m-0 mt-4 max-w-[52ch] text-lead text-fg-muted">
                    {t({ en: "Most things can be done online in under 15 minutes. Search 13 services, or pick one of the tasks people ask for most.", tr: "Çoğu işlem 15 dakikadan kısa sürede çevrimiçi yapılabilir. 13 hizmet içinde arayın ya da en çok istenen işlemlerden birini seçin." })}
                  </p>
                  <form method="get" role="search" aria-label={t({ en: "Search services", tr: "Hizmetlerde ara" })} className="mt-7 flex max-w-[34rem] flex-col gap-2 @md:flex-row">
                    <input type="hidden" name="page" value="services" />
                    {locale !== "en" ? <input type="hidden" name="lang" value={locale} /> : null}
                    <label htmlFor="rdo-q" className="sr-only">
                      {t({ en: "Search services, for example “parking”", tr: "Hizmetlerde arayın, örneğin “otopark”" })}
                    </label>
                    <Input id="rdo-q" name="q" type="search" size="lg" className="@md:flex-1" placeholder={t({ en: "e.g. parking, marriage, tax", tr: "ör. otopark, nikâh, vergi" })} autoComplete="off" />
                    <Button type="submit" variant="primary" size="lg">
                      <Search aria-hidden className="size-4" />
                      {t({ en: "Search", tr: "Ara" })}
                    </Button>
                  </form>
                </div>

                <aside aria-labelledby="rdo-today" className="self-start rounded-ui border-2 border-fg bg-surface p-5 @4xl:col-span-5 @4xl:p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 id="rdo-today" className="m-0 text-h3 font-semibold">
                      {t({ en: "Today at Iskele Caddesi 14", tr: "Bugün İskele Caddesi 14’te" })}
                    </h2>
                    <Badge tone="accent" size="md">
                      {t({ en: "Open", tr: "Açık" })}
                    </Badge>
                  </div>
                  <p className="m-0 mt-1 flex items-center gap-1.5 text-small text-fg-muted">
                    <Clock aria-hidden className="size-4" />
                    {t({ en: "Wednesday 11 November · 08:30–19:00 (late opening)", tr: "Çarşamba 11 Kasım · 08.30–19.00 (geç kapanış)" })}
                  </p>
                  <table className="mt-5 w-full border-collapse text-small">
                    <caption className="sr-only">{t({ en: "Waiting time at each desk", tr: "Her bankoda bekleme süresi" })}</caption>
                    <thead>
                      <tr className="border-b-2 border-fg text-start">
                        <th scope="col" className="py-2 text-start font-semibold">{t({ en: "Desk", tr: "Banko" })}</th>
                        <th scope="col" className="py-2 text-end font-semibold">{t({ en: "Wait now", tr: "Şu anki bekleme" })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { desk: "A", what: { en: "Residency and certificates", tr: "İkamet ve belgeler" }, wait: 12 },
                        { desk: "B", what: { en: "Births and marriages", tr: "Doğum ve nikâh" }, wait: 4 },
                        { desk: "C", what: { en: "Tax and payments", tr: "Vergi ve ödemeler" }, wait: 21 },
                        { desk: "D", what: { en: "Permits and licences", tr: "İzin ve ruhsatlar" }, wait: 8 },
                      ].map((d) => (
                        <tr key={d.desk} className="border-b border-line">
                          <th scope="row" className="py-2.5 text-start font-normal">
                            <span className="me-2 inline-grid size-6 place-items-center rounded-[4px] bg-accent font-bold text-accent-fg">{d.desk}</span>
                            {t(d.what)}
                          </th>
                          <td className="py-2.5 text-end font-semibold tabular-nums">{t({ en: `${d.wait} min`, tr: `${d.wait} dk` })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="m-0 mt-4 flex items-center gap-1.5 text-small">
                    <Phone aria-hidden className="size-4" />
                    {t({ en: "Out of hours emergencies:", tr: "Mesai dışı acil durumlar:" })}
                    <a href="tel:+902160000000" className="whitespace-nowrap font-semibold text-accent-ink underline underline-offset-[0.2em] focus-ring rounded-[2px]">
                      +90 216 000 00 00
                    </a>
                  </p>
                </aside>
              </div>
            </Container>
          </section>

          {/* Top tasks: numbered, ruled, large targets. */}
          <Section anchor="tasks" aria-labelledby="rdo-tasks" theme={{ rhythm: "tight" }}>
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="rdo-tasks" className="m-0 font-display text-display-m">
                  {t({ en: "Most requested", tr: "En çok yapılanlar" })}
                </h2>
                <a href={services()} className="inline-flex items-center gap-1.5 text-body font-semibold text-accent-ink underline underline-offset-[0.25em] focus-ring rounded-[2px]">
                  {t({ en: "All services A–Z", tr: "Tüm hizmetler A–Z" })}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
              <ol className="m-0 mt-8 grid list-none gap-x-10 p-0 @2xl:grid-cols-2 @5xl:grid-cols-3">
                {topTasks.map((task, i) => (
                  <li key={task.id} className="border-t-2 border-fg">
                    <a href={services(`svc-${task.service}`)} className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-x-3 py-5 focus-ring rounded-[2px]">
                      <span aria-hidden className="font-display text-[1.75rem] leading-none tabular-nums text-accent-ink">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-h3 font-semibold leading-snug text-fg underline decoration-transparent decoration-2 underline-offset-[0.2em] transition-[text-decoration-color] group-hover:decoration-current motion-reduce:transition-none">
                          {t(task.title)}
                        </span>
                        <span className="mt-1.5 block text-body text-fg-muted">{t(task.text)}</span>
                        <span className="mt-2 block text-small font-semibold text-fg">{t(task.meta)}</span>
                      </span>
                      <ArrowRight aria-hidden className="mt-1 size-5 text-accent-ink transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                    </a>
                  </li>
                ))}
              </ol>
            </Container>
          </Section>

          {/* Announcements: dated, typed, plain. */}
          <Section anchor="announcements" aria-labelledby="rdo-news" className="border-y border-line bg-surface">
            <Container>
              <div className="grid gap-8 @4xl:grid-cols-12">
                <div className="@4xl:col-span-4">
                  <h2 id="rdo-news" className="m-0 font-display text-display-m">
                    {t({ en: "Announcements", tr: "Duyurular" })}
                  </h2>
                  <p className="m-0 mt-3 max-w-[36ch] text-body text-fg-muted">
                    {t({ en: "Roadworks, closures, council meetings and consultations. Also by text message — reply STOP to 0000 to unsubscribe.", tr: "Yol çalışmaları, kapanışlar, meclis toplantıları ve görüşe açılan konular. SMS ile de gelir — iptal için 0000’a DUR yazın." })}
                  </p>
                </div>
                <ul className="m-0 list-none p-0 @4xl:col-span-8">
                  {notices.map((n) => (
                    <li key={n.id} className="grid gap-x-6 gap-y-1 border-t border-line py-5 first:border-t-2 first:border-fg @2xl:grid-cols-[8.5rem_minmax(0,1fr)]">
                      <div className="flex items-center gap-3 @2xl:block">
                        <time dateTime={n.date} className="block text-small font-semibold tabular-nums">
                          {f.date(n.date, "long")}
                        </time>
                        <Badge tone={n.kind === "works" || n.kind === "closure" ? "accent" : "outline"} size="md" className="@2xl:mt-2">
                          {t(noticeKinds[n.kind])}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="m-0 text-h3 font-semibold leading-snug">
                          {n.page ? (
                            <a href={announcement} className="text-fg underline decoration-2 underline-offset-[0.2em] hover:text-accent-ink focus-ring rounded-[2px]">
                              {t(n.title)}
                            </a>
                          ) : (
                            t(n.title)
                          )}
                        </h3>
                        <p className="m-0 mt-1.5 text-body text-fg-muted">{t(n.text)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </Section>

          <StatsBand
            {...common}
            variant="ledger"
            anchor="figures"
            eyebrow={t({ en: "How we are doing", tr: "Nasıl gidiyoruz" })}
            title={t({ en: "October 2026 in numbers", tr: "Rakamlarla Ekim 2026" })}
            lead={t({ en: "Published on the 5th of every month. The full data is open, as CSV.", tr: "Her ayın 5’inde yayımlanır. Tüm veri CSV olarak açık." })}
            items={numbers.map((n) => ({ value: n.value, unit: "unit" in n ? (n.unit as string) : undefined, label: t(n.label) }))}
          />

          <MapHours
            {...common}
            anchor="visit"
            variant="info"
            eyebrow={t({ en: "Visit or call", tr: "Ziyaret edin ya da arayın" })}
            title={t({ en: "Iskele Caddesi 14, ground floor", tr: "İskele Caddesi 14, zemin kat" })}
            lead={t({ en: "No appointment needed at desks A and C. Desks B and D are by appointment after 15:00.", tr: "A ve C bankoları için randevu gerekmez. B ve D bankoları saat 15.00’ten sonra randevuyla çalışır." })}
            businessType="LocalBusiness"
            mapProvider="none"
            branches={[branch]}
            now="2026-11-11T10:20:00+03:00"
          />

          <Section anchor="accessibility" aria-labelledby="rdo-a11y" className="border-t-2 border-fg">
            <Container size="prose">
              <h2 id="rdo-a11y" className="m-0 font-display text-display-m">
                {t({ en: "Accessibility statement", tr: "Erişilebilirlik beyanı" })}
              </h2>
              <div className="mt-5 flex flex-col gap-4 text-body">
                <p className="m-0">
                  {t({ en: "This website aims to meet WCAG 2.2 at level AAA for text contrast and level AA everywhere else. It was last tested on 3 November 2026, with screen readers on desktop and phone, by residents who use them every day.", tr: "Bu web sitesi metin kontrastında WCAG 2.2 AAA düzeyini, diğer her yerde AA düzeyini hedefler. Son olarak 3 Kasım 2026’da, ekran okuyucuyu her gün kullanan sakinler tarafından masaüstü ve telefonda test edildi." })}
                </p>
                <p className="m-0">
                  {t({ en: "Known gaps: two PDF forms (building permit, market licence) are not yet tagged; ask for them in Word or large print and we send them within 2 working days.", tr: "Bilinen eksikler: iki PDF form (yapı ruhsatı, pazar ruhsatı) henüz etiketli değil; Word ya da büyük puntolu hâlini isteyin, 2 iş günü içinde gönderelim." })}
                </p>
                <p className="m-0">
                  {t({ en: "Something hard to use? Write to", tr: "Kullanması zor bir şey mi var? Yazın:" })}{" "}
                  <a href={`mailto:${EMAIL}`} className="font-semibold text-accent-ink underline underline-offset-[0.2em] focus-ring rounded-[2px]">
                    {EMAIL}
                  </a>{" "}
                  {t({ en: "— a person reads every message.", tr: "— her mesajı bir kişi okur." })}
                </p>
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="services" title={t({ en: "Services A–Z — Riverside District Office", tr: "Hizmetler A–Z — Riverside İlçe Ofisi" })}>
          <ServicesPage locale={locale} />
        </SiteShellPage>

        <SiteShellPage id="announcement" title={`${t(notices[0]!.title)} — ${brand}`}>
          <AnnouncementPage locale={locale} time={{ start: time(works.start), end: time(works.end) }} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: brand, href: home() }}
        about={t({ en: "Local public services for the 84,000 residents of Riverside. Iskele Caddesi 14.", tr: "Riverside’ın 84.000 sakini için yerel kamu hizmetleri. İskele Caddesi 14." })}
        columns={[
          {
            title: t({ en: "Services", tr: "Hizmetler" }),
            links: [
              { href: services(), label: t({ en: "Services A–Z", tr: "Hizmetler A–Z" }) },
              { href: services("svc-report"), label: t({ en: "Report a problem", tr: "Sorun bildirin" }) },
              { href: services("svc-property-tax"), label: t({ en: "Pay property tax", tr: "Emlak vergisi" }) },
            ],
          },
          {
            title: t({ en: "The office", tr: "Ofis" }),
            links: [
              { href: home("announcements"), label: t({ en: "Announcements", tr: "Duyurular" }) },
              { href: home("figures"), label: t({ en: "Open data", tr: "Açık veri" }) },
              { href: home("accessibility"), label: t({ en: "Accessibility statement", tr: "Erişilebilirlik beyanı" }) },
            ],
          },
        ]}
        contact={{ address: branch.address, phone: PHONE, email: EMAIL }}
        legalLinks={[
          { href: "/kvkk", label: t({ en: "Privacy (KVKK)", tr: "KVKK" }) },
          { href: home("accessibility"), label: t({ en: "Accessibility", tr: "Erişilebilirlik" }) },
        ]}
        year={2026}
      />
    </>
  );
}
