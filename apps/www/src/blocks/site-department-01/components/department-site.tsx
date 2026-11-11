import { ArrowRight, MapPin, Search } from "lucide-react";
import { Button, Input } from "@vamos-ui/react";
import { BlockHeading, Container, Footer, Navbar, Section, SiteShellPage, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { CityPlan } from "./city-plan";
import { copyFor, courses, DEPT, EMAIL, events, FACULTY, groups, levels, PHONE, people, programmes, UNI, type SiteLocale } from "./content";
import { PeoplePage } from "./people-page";
import { ProgrammesPage } from "./programmes-page";

export const departmentPages = ["home", "programmes", "people"];

const home = (anchor?: string) => sitePageHref("home", anchor);
const programmesHref = (anchor?: string) => sitePageHref("programmes", anchor);
const peopleHref = sitePageHref("people");

const rule = "border-t border-[color-mix(in_oklch,var(--accent-ink)_40%,transparent)]";

/**
 * One language version of the department site: home (burgundy masthead with a city-plan
 * drawing and a course search, admissions table, research groups, seminars, faculty), the
 * programmes page with the course finder, and the people directory.
 */
export function DepartmentSite({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const dept = t(DEPT);
  const lead = (id: string) => people.find((p) => p.id === id)!;

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="flex flex-col leading-none">
            <span className="text-[0.6875rem] font-semibold tracking-[0.14em] text-fg-muted uppercase">{t(UNI)}</span>
            <span className="mt-1 font-display text-[1.125rem] text-fg">{dept}</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Programmes", tr: "Programlar" }), href: programmesHref() },
          { label: t({ en: "Course finder", tr: "Ders bulucu" }), href: programmesHref("finder") },
          { label: t({ en: "Research", tr: "Araştırma" }), href: home("research") },
          { label: t({ en: "People", tr: "Kadro" }), href: peopleHref },
          { label: t({ en: "Events", tr: "Etkinlikler" }), href: home("events") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: programmesHref("apply"), label: t({ en: "Apply for 2027", tr: "2027 başvurusu" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Department of Urban Studies — Halden University", tr: "Kentsel Çalışmalar Bölümü — Halden Üniversitesi" })}>
          {/* Masthead: burgundy band, serif title, a plan of an invented quarter, course search. */}
          <section aria-labelledby="dus-title" className="@container relative overflow-hidden bg-accent text-accent-fg">
            <Container>
              <div className="grid gap-10 pt-12 pb-10 @4xl:grid-cols-12 @4xl:pt-20 @4xl:pb-14">
                <div className="@4xl:col-span-7">
                  <p className="m-0 text-small font-semibold tracking-[0.12em] uppercase opacity-90">
                    {t(UNI)} · {t(FACULTY)}
                  </p>
                  <BlockHeading id="dus-title" level={1} size="display-xl" className="mt-5 max-w-[12ch] text-accent-fg [&_em]:text-accent-fg" text={t({ en: "Urban *Studies*", tr: "Kentsel *Çalışmalar*" })} />
                  <p className="m-0 mt-6 max-w-[46ch] text-lead">
                    {t({
                      en: "We study how cities are made, shared and repaired — on the streets of Istanbul and in fourteen partner cities. 34 staff, 410 students, three research groups.",
                      tr: "Kentlerin nasıl yapıldığını, paylaşıldığını ve onarıldığını inceliyoruz — İstanbul sokaklarında ve on dört ortak kentte. 34 akademisyen, 410 öğrenci, üç araştırma grubu.",
                    })}
                  </p>
                </div>
                <div className="hidden @4xl:col-span-5 @4xl:block">
                  <figure className="m-0">
                    <CityPlan className="h-auto w-full opacity-90" />
                    <figcaption className="mt-2 font-mono text-[0.75rem] tracking-[0.04em] opacity-80">
                      {t({ en: "Fig. 1 — Studio I survey, a quarter between river and avenue", tr: "Şek. 1 — Stüdyo I saha çalışması, nehir ile cadde arasında bir mahalle" })}
                    </figcaption>
                  </figure>
                </div>
              </div>

              <form method="get" role="search" aria-label={t({ en: "Find a course", tr: "Ders bulun" })} className="grid gap-3 border-t border-[color-mix(in_oklch,var(--accent-fg)_35%,transparent)] py-6 @3xl:grid-cols-[auto_minmax(0,1fr)_auto] @3xl:items-center">
                <input type="hidden" name="page" value="programmes" />
                {locale !== "en" ? <input type="hidden" name="lang" value={locale} /> : null}
                <label htmlFor="dus-q" className="font-display text-h3">
                  {t({ en: "Find a course", tr: "Ders bulun" })}
                </label>
                <Input id="dus-q" name="q" type="search" size="lg" placeholder={t({ en: "e.g. housing, climate, URB 312", tr: "ör. konut, iklim, URB 312" })} autoComplete="off" />
                <Button type="submit" variant="solid" size="lg">
                  <Search aria-hidden className="size-4" />
                  {t({ en: `Search ${courses.length} courses`, tr: `${courses.length} derste ara` })}
                </Button>
              </form>
            </Container>
          </section>

          {/* Admissions: a ruled table, not cards. */}
          <Section anchor="admissions" aria-labelledby="dus-adm">
            <Container>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="m-0 text-small font-semibold tracking-[0.12em] text-accent-ink uppercase">{t({ en: "Admissions 2027–28", tr: "2027–28 kabul" })}</p>
                  <h2 id="dus-adm" className="m-0 mt-2 font-display text-display-m">
                    {t({ en: "Three degrees, one studio culture", tr: "Üç derece, tek stüdyo kültürü" })}
                  </h2>
                </div>
                <a href={programmesHref()} className="inline-flex items-center gap-1.5 font-semibold text-accent-ink underline decoration-1 underline-offset-[0.3em] hover:decoration-2 focus-ring rounded-[2px]">
                  {t({ en: "Programmes and courses", tr: "Programlar ve dersler" })}
                  <ArrowRight aria-hidden className="size-4" />
                </a>
              </div>
              <div className="mt-8 overflow-x-auto rounded-ui-sm focus-ring" tabIndex={0} role="region" aria-labelledby="dus-adm">
                <table className="w-full min-w-[40rem] border-collapse text-start">
                  <caption className="sr-only">{t({ en: "Degree programmes with length, language, places and deadline", tr: "Süre, dil, kontenjan ve son başvuru tarihiyle programlar" })}</caption>
                  <thead>
                    <tr className="border-b-2 border-accent text-small text-fg-muted">
                      <th scope="col" className="py-2.5 pe-4 text-start font-semibold">{t({ en: "Programme", tr: "Program" })}</th>
                      <th scope="col" className="py-2.5 pe-4 text-start font-semibold">{t({ en: "Length", tr: "Süre" })}</th>
                      <th scope="col" className="py-2.5 pe-4 text-start font-semibold">{t({ en: "Language", tr: "Dil" })}</th>
                      <th scope="col" className="py-2.5 pe-4 text-end font-semibold">{t({ en: "Places", tr: "Kontenjan" })}</th>
                      <th scope="col" className="py-2.5 text-end font-semibold">{t({ en: "Apply by", tr: "Son başvuru" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programmes.map((p) => (
                      <tr key={p.level} className="border-b border-line align-top">
                        <th scope="row" className="py-5 pe-4 text-start font-normal">
                          <span className="block font-display text-h3">{t(p.title)}</span>
                          <span className="mt-1 block max-w-[52ch] text-small text-fg-muted">{t(p.text)}</span>
                        </th>
                        <td className="py-5 pe-4 whitespace-nowrap">{t(p.years)}</td>
                        <td className="py-5 pe-4">{t(p.language)}</td>
                        <td className="py-5 pe-4 text-end tabular-nums">{p.places}</td>
                        <td className="py-5 text-end font-semibold whitespace-nowrap tabular-nums">{f.date(p.deadline, "long")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Container>
          </Section>

          {/* Research groups */}
          <Section anchor="research" aria-labelledby="dus-research" className="bg-surface">
            <Container>
              <p className="m-0 text-small font-semibold tracking-[0.12em] text-accent-ink uppercase">{t({ en: "Research", tr: "Araştırma" })}</p>
              <h2 id="dus-research" className="m-0 mt-2 max-w-[22ch] font-display text-display-m">
                {t({ en: "Three groups, each with a project you can join", tr: "Her birinde katılabileceğiniz bir proje olan üç grup" })}
              </h2>
              <ol className="m-0 mt-10 grid list-none gap-10 p-0 @3xl:grid-cols-3 @3xl:gap-8">
                {groups.map((g, i) => {
                  const p = lead(g.lead);
                  return (
                    <li key={g.id} className={`${rule} pt-5`}>
                      <p className="m-0 font-mono text-small text-accent-ink">{`0${i + 1}`}</p>
                      <h3 className="m-0 mt-2 font-display text-h3">{t(g.title)}</h3>
                      <p className="m-0 mt-2 text-fg-muted">{t(g.text)}</p>
                      <p className="m-0 mt-5 text-small font-semibold tracking-[0.08em] text-fg-muted uppercase">{t({ en: "Now working on", tr: "Şu an üzerinde çalışılan" })}</p>
                      <p className="m-0 mt-1 font-display text-[1.125rem] italic leading-snug">{t(g.project)}</p>
                      <p className="m-0 mt-4 text-small">
                        {t({ en: "Led by", tr: "Yürütücü" })} <span className="font-semibold">{p.name}</span>
                      </p>
                    </li>
                  );
                })}
              </ol>
            </Container>
          </Section>

          {/* Seminars: a dated list with a big serif day. */}
          <Section anchor="events" aria-labelledby="dus-events">
            <Container>
              <div className="grid gap-8 @4xl:grid-cols-12">
                <div className="@4xl:col-span-4">
                  <p className="m-0 text-small font-semibold tracking-[0.12em] text-accent-ink uppercase">{t({ en: "Events", tr: "Etkinlikler" })}</p>
                  <h2 id="dus-events" className="m-0 mt-2 font-display text-display-m">
                    {t({ en: "Wednesday seminars", tr: "Çarşamba seminerleri" })}
                  </h2>
                  <p className="m-0 mt-3 max-w-[34ch] text-fg-muted">
                    {t({ en: "Open to everyone, no registration. Tea from 16:30 outside B-204.", tr: "Herkese açık, kayıt gerekmez. 16.30’dan itibaren B-204 önünde çay." })}
                  </p>
                </div>
                <ul className="m-0 list-none p-0 @4xl:col-span-8">
                  {events.map((e) => (
                    <li key={e.date} className={`${rule} grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-5 py-5 @2xl:grid-cols-[5.5rem_minmax(0,1fr)_auto]`}>
                      <time dateTime={`${e.date}T${e.time}`} className="flex flex-col leading-none">
                        <span className="font-display text-[2.75rem] leading-[0.9] tabular-nums text-accent-ink">{f.date(e.date, { day: "numeric" })}</span>
                        <span className="mt-1.5 text-small font-semibold uppercase tracking-[0.08em] text-fg-muted">{f.date(e.date, { month: "short" })}</span>
                      </time>
                      <div className="min-w-0">
                        <p className="m-0 text-small font-semibold text-accent-ink">{t(e.kind)}</p>
                        <h3 className="m-0 mt-1 font-display text-h3 leading-snug">{t(e.title)}</h3>
                        <p className="m-0 mt-1 text-small text-fg-muted">{e.who}</p>
                      </div>
                      <p className="col-start-2 m-0 mt-2 flex items-center gap-1.5 text-small whitespace-nowrap @2xl:col-start-auto @2xl:mt-1">
                        <MapPin aria-hidden className="size-3.5 text-fg-muted" />
                        <span className="font-mono">{e.room}</span> · {e.time}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </Section>

          <Team
            {...common}
            variant="portrait"
            anchor="faculty"
            theme={{ surface: "surface" }}
            className="!pb-10"
            eyebrow={t({ en: "Faculty", tr: "Öğretim üyeleri" })}
            title={t({ en: "Who teaches *here*", tr: "Burada *kimler* ders veriyor" })}
            lead={t({ en: "Office hours are listed in the directory; no appointment needed.", tr: "Ofis saatleri rehberde yer alır; randevu gerekmez." })}
            members={people
              .filter((p) => p.photo)
              .slice(0, 4)
              .map((p) => ({ name: p.name, role: t(p.title), specialty: t(p.interests), photo: p.photo ? { ...p.photo, alt: p.name } : undefined }))}
          />
          <div className="bg-surface">
            <Container className="pb-[var(--section-y,5rem)]">
              <a href={peopleHref} className="inline-flex items-center gap-2 font-semibold text-accent-ink underline decoration-1 underline-offset-[0.3em] hover:decoration-2 focus-ring rounded-[2px]">
                {t({ en: `All ${people.length} people, with office hours`, tr: `Ofis saatleriyle ${people.length} kişinin tamamı` })}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </Container>
          </div>
        </SiteShellPage>

        <SiteShellPage id="programmes" title={t({ en: "Programmes and courses — Urban Studies, Halden University", tr: "Programlar ve dersler — Kentsel Çalışmalar, Halden Üniversitesi" })}>
          <ProgrammesPage locale={locale} />
        </SiteShellPage>

        <SiteShellPage id="people" title={t({ en: "People — Urban Studies, Halden University", tr: "Kadro — Kentsel Çalışmalar, Halden Üniversitesi" })}>
          <PeoplePage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: dept, href: home() }}
        about={t({ en: "Halden University, Faculty of Architecture and Planning. Building B, Halden Campus, İstanbul.", tr: "Halden Üniversitesi, Mimarlık ve Planlama Fakültesi. B Blok, Halden Kampüsü, İstanbul." })}
        columns={[
          {
            title: t({ en: "Study", tr: "Eğitim" }),
            links: [
              ...programmes.map((p) => ({ href: programmesHref(`prog-${p.level}`), label: `${t(levels[p.level].long)}` })),
              { href: programmesHref("finder"), label: t({ en: "Course finder", tr: "Ders bulucu" }) },
            ],
          },
          {
            title: t({ en: "Department", tr: "Bölüm" }),
            links: [
              { href: peopleHref, label: t({ en: "People", tr: "Kadro" }) },
              { href: home("research"), label: t({ en: "Research groups", tr: "Araştırma grupları" }) },
              { href: home("events"), label: t({ en: "Seminars", tr: "Seminerler" }) },
            ],
          },
        ]}
        contact={{ address: t({ en: "Building B, Halden Campus, 34000 İstanbul", tr: "B Blok, Halden Kampüsü, 34000 İstanbul" }), phone: PHONE, email: EMAIL }}
        legalLinks={[
          { href: "/kvkk", label: t({ en: "Privacy (KVKK)", tr: "KVKK" }) },
          { href: "/accessibility", label: t({ en: "Accessibility", tr: "Erişilebilirlik" }) },
        ]}
        year={2026}
      />
    </>
  );
}
