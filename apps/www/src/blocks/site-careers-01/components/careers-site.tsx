import { Button } from "@vamos-ui/react";
import { BlockHeading, BlockImage, Container, Cta, Faq, FeatureGrid, Footer, Navbar, PageIntro, Section, SectionHeader, SiteShellPage, StatsBand, Steps, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { Stagger } from "@vamos-ui/react/motion";
import { benefits, copyFor, EMAIL, faq, jobs, PHONE, photos, principles, process, teams, voices, type SiteLocale } from "./content";
import { JobBoard, LatestRoles } from "./job-board";
import { JobDetail } from "./job-detail";
import { TeamCompass } from "./team-compass";

const home = (anchor?: string) => sitePageHref("home", anchor);
const jobsHref = sitePageHref("jobs");

/** The Northpoint mark: a north arrow in the accent square (same mark as the app's sign-in). */
function Mark() {
  return (
    <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]">
      <span aria-hidden className="grid size-7 place-items-center rounded-[9px] bg-accent text-accent-fg">
        <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
          <path d="M8 1.5 12.5 14 8 11.2 3.5 14Z" />
        </svg>
      </span>
      Northpoint
      <span className="font-mono text-[11px] font-normal tracking-[0.08em] text-fg-muted uppercase">Careers</span>
    </span>
  );
}

/**
 * One language version of the Northpoint careers site: home (compass hero, principles, open
 * numbers, benefits, process, voices, newest roles, FAQ), the job board and one job with the
 * apply form. Server component; client islands read the shared careers state.
 */
export function CareersSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  const open = jobs.length;
  const people = teams.reduce((n, x) => n + x.size, 0);

  return (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark={<Mark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Open roles", tr: "Açık pozisyonlar" }), href: jobsHref },
          { label: t({ en: "How we work", tr: "Nasıl çalışırız" }), href: home("how") },
          { label: t({ en: "Benefits", tr: "Yan haklar" }), href: home("benefits") },
          { label: t({ en: "Hiring process", tr: "İşe alım süreci" }), href: home("process") },
          { label: "FAQ", href: home("faq") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: jobsHref, label: t({ en: `See ${open} roles`, tr: `${open} pozisyonu gör` }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Careers — Northpoint", tr: "Kariyer — Northpoint" })}>
          {/* Hero: the headline on the start side, the team compass on the end side. */}
          <Section anchor="top" className="overflow-hidden">
            <Container>
              <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-end lg:gap-16">
                <div>
                  <p className="vm-enter font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">
                    {t({ en: `Careers · ${open} open roles · Kadıköy and remote`, tr: `Kariyer · ${open} açık pozisyon · Kadıköy ve uzaktan` })}
                  </p>
                  <BlockHeading level={1} size="display-xl" className="vm-enter vm-enter-title mt-6 max-w-[14ch] [--vm-i:1]" text={t({ en: "Software for the people *behind* the counter.", tr: "Tezgâhın *arkasındaki* insanlar için yazılım." })} />
                  <p className="vm-enter mt-8 max-w-[52ch] text-lead text-fg-muted [--vm-i:2]">
                    {t({
                      en: "Northpoint plans the shifts, checklists and handovers of 2,400 shops, clinics and warehouses. We are 75 people, paid in euros, with every salary band published. Pick a team to see what is open.",
                      tr: "Northpoint 2.400 mağaza, klinik ve deponun vardiyalarını, kontrol listelerini ve devir teslimini planlar. 75 kişiyiz, euro ile ödeme alıyoruz ve tüm maaş bantları açık. Neyin açık olduğunu görmek için bir ekip seçin.",
                    })}
                  </p>
                  <div className="vm-enter mt-8 flex flex-wrap gap-3 [--vm-i:3]">
                    <Button asChild variant="primary" size="lg" className="vm-press vm-nudge">
                      <a href={jobsHref}>
                        {t({ en: "Browse open roles", tr: "Açık pozisyonlara göz atın" })}
                        <ArrowRight aria-hidden className="rtl:rotate-180" />
                      </a>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="vm-press">
                      <a href={home("process")}>{t({ en: "How we hire", tr: "Nasıl işe alırız" })}</a>
                    </Button>
                  </div>
                </div>
                <div aria-label={t({ en: "Teams and open roles", tr: "Ekipler ve açık pozisyonlar" })} role="group" className="vm-enter [--vm-i:2]">
                  <TeamCompass locale={locale} />
                </div>
              </div>
            </Container>
          </Section>

          {/* How we work: four numbered principles beside a photo of the office. */}
          <Section anchor="how" headingId="np-how-title" theme={{ surface: "surface-2" }}>
            <Container>
              <SectionHeader headingId="np-how-title" align="split" eyebrow={t({ en: "How we work", tr: "Nasıl çalışırız" })} title={t({ en: "Four habits we *hire* for", tr: "İşe alırken baktığımız *dört* alışkanlık" })} lead={t({ en: "Not values on a wall — things you will see in your first week.", tr: "Duvardaki değerler değil — ilk haftanızda göreceğiniz şeyler." })} />
              <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <BlockImage {...photos.office} alt={t(photos.office.alt)} aspect="4:5" className="rounded-ui-lg" sizes="(min-width: 1024px) 40vw, 100vw" />
                <Stagger asChild step={90}>
                <ol className="grid content-start gap-x-10 sm:grid-cols-2">
                  {principles.map((p) => (
                    <li key={p.n} className="border-t-2 border-fg pt-4 pb-10">
                      <span className="font-mono text-xs text-fg-muted">{p.n}</span>
                      <h3 className="mt-3 font-display text-[1.6rem] leading-tight text-fg">{t(p.title)}</h3>
                      <p className="mt-3 text-body text-fg-muted">{t(p.text)}</p>
                    </li>
                  ))}
                </ol>
                </Stagger>
              </div>
            </Container>
          </Section>

          <StatsBand
            {...common}
            anchor="numbers"
            variant="ledger"
            eyebrow={t({ en: "Open numbers", tr: "Açık rakamlar" })}
            title={t({ en: "The company in *five* figures", tr: "Beş rakamda *şirket*" })}
            items={[
              { value: people, label: t({ en: "People", tr: "Kişi" }), source: t({ en: "1 November 2026", tr: "1 Kasım 2026" }) },
              { value: 11, label: t({ en: "Countries we pay salaries in", tr: "Maaş ödediğimiz ülke" }) },
              { value: 41, unit: "%", label: t({ en: "Women in engineering and design", tr: "Mühendislik ve tasarımda kadın oranı" }), source: t({ en: "16 of 39", tr: "39 kişiden 16’sı" }) },
              { value: 3.4, unit: t({ en: "yrs", tr: "yıl" }), unitLabel: t({ en: "years", tr: "yıl" }), label: t({ en: "Median tenure", tr: "Ortanca kıdem" }) },
              { value: 22, unit: t({ en: "days", tr: "gün" }), unitLabel: t({ en: "days", tr: "gün" }), label: t({ en: "Median time from application to offer", tr: "Başvurudan teklife ortanca süre" }), source: t({ en: "Hires in 2026", tr: "2026 işe alımları" }) },
            ]}
          />

          <FeatureGrid
            {...common}
            anchor="benefits"
            variant="grid"
            columns={3}
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Benefits", tr: "Yan haklar" })}
            title={t({ en: "The same package *everywhere*", tr: "Her yerde *aynı* paket" })}
            items={benefits.map((b) => ({ icon: b.icon, title: t(b.title), text: t(b.text) }))}
          />

          <Steps
            {...common}
            anchor="process"
            variant="horizontal"
            eyebrow={t({ en: "Hiring process", tr: "İşe alım süreci" })}
            title={t({ en: "Five steps, about *three* weeks", tr: "Beş adım, yaklaşık *üç* hafta" })}
            lead={t({ en: "The same for every role. If we change it for yours, we tell you on the first call.", tr: "Her rol için aynı. Sizinki için değiştirirsek ilk görüşmede söyleriz." })}
            steps={process.map((p) => ({ title: t(p.title), text: t(p.text), duration: t(p.duration) }))}
          />

          {/* Voices: three short quotes as a ruled ledger, not avatar cards. */}
          <Section headingId="np-voices-title" theme={{ surface: "surface-2" }}>
            <Container>
              <BlockHeading id="np-voices-title" size="display-m" text={t({ en: "In their *words*", tr: "Kendi *sözleriyle*" })} />
              <Stagger effect="fade" step={120} className="mt-10 grid gap-px border-y-2 border-fg bg-line md:grid-cols-3">
                {voices.map((v) => (
                  <figure key={v.author} className="flex flex-col justify-between gap-8 bg-surface-2 py-6 md:px-6 md:first:ps-0 md:last:pe-0">
                    <blockquote className="font-display text-[1.3rem] leading-snug text-fg">“{t(v.quote)}”</blockquote>
                    <figcaption className="text-small">
                      <span className="block font-medium text-fg">{v.author}</span>
                      <span className="block text-fg-muted">{t(v.role)}</span>
                    </figcaption>
                  </figure>
                ))}
              </Stagger>
            </Container>
          </Section>

          <Section anchor="latest" headingId="np-latest-title">
            <Container>
              <SectionHeader
                headingId="np-latest-title"
                align="split"
                eyebrow={t({ en: "Newest roles", tr: "En yeni pozisyonlar" })}
                title={t({ en: "Opened in the last *three* weeks", tr: "Son *üç* haftada açılanlar" })}
                actions={
                  <Button asChild variant="secondary">
                    <a href={jobsHref}>{t({ en: `All ${open} roles`, tr: `${open} pozisyonun tümü` })}</a>
                  </Button>
                }
              />
              <div className="mt-10">
                <LatestRoles locale={locale} />
              </div>
            </Container>
          </Section>

          <Faq {...common} anchor="faq" variant="split" theme={{ surface: "surface-2" }} eyebrow="FAQ" title={t({ en: "Before you *apply*", tr: "Başvurmadan *önce*" })} items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))} deepLink={false} />

          <Cta
            {...common}
            variant="split"
            title={t({ en: "Nothing fits? Send an *open* application.", tr: "Uygun bir şey yok mu? *Açık* başvuru gönderin." })}
            lead={t({ en: "Tell us what you would build here. We keep open applications for 12 months and write when something matches.", tr: "Burada ne inşa edeceğinizi anlatın. Açık başvuruları 12 ay saklarız ve uygun bir şey çıktığında yazarız." })}
            actions={[{ link: { href: `mailto:${EMAIL}?subject=Open%20application`, label: t({ en: "Email the people team", tr: "İnsan ekibine yazın" }) }, style: "primary" }]}
            fineprint={EMAIL}
          />
        </SiteShellPage>

        <SiteShellPage id="jobs" title={t({ en: "Open roles — Northpoint careers", tr: "Açık pozisyonlar — Northpoint kariyer" })}>
          <PageIntro
            {...common}
            variant="ruled"
            breadcrumb={[{ label: t({ en: "Careers", tr: "Kariyer" }), href: home() }, { label: t({ en: "Open roles", tr: "Açık pozisyonlar" }) }]}
            title={t({ en: `${open} open *roles*`, tr: `${open} açık *pozisyon*` })}
            lead={t({ en: "Every post shows the band, where you can work from and who reads your application.", tr: "Her ilanda bant, nereden çalışabileceğiniz ve başvurunuzu kimin okuyacağı yazar." })}
            meta={[
              { label: t({ en: "Offices", tr: "Ofisler" }), value: t({ en: "Kadıköy, Alsancak", tr: "Kadıköy, Alsancak" }) },
              { label: t({ en: "Remote", tr: "Uzaktan" }), value: "UTC−1 → UTC+4" },
              { label: t({ en: "Reply time", tr: "Yanıt süresi" }), value: t({ en: "≤ 5 working days", tr: "≤ 5 iş günü" }) },
            ]}
          />
          <Section theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <JobBoard locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="job" title={t({ en: "Job post — Northpoint careers", tr: "İş ilanı — Northpoint kariyer" })}>
          <JobDetail locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Northpoint", href: home() }}
        about={t({ en: "Shift planning, checklists and handovers for teams that work on their feet. Northpoint Studio Ltd., Kadıköy, Istanbul.", tr: "Ayakta çalışan ekipler için vardiya planı, kontrol listeleri ve devir teslim. Northpoint Studio Ltd., Kadıköy, İstanbul." })}
        columns={[
          { title: t({ en: "Careers", tr: "Kariyer" }), links: [{ href: jobsHref, label: t({ en: "Open roles", tr: "Açık pozisyonlar" }) }, { href: home("benefits"), label: t({ en: "Benefits", tr: "Yan haklar" }) }, { href: home("process"), label: t({ en: "Hiring process", tr: "İşe alım süreci" }) }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "/about", label: t({ en: "About", tr: "Hakkımızda" }) }, { href: "/blog", label: t({ en: "Engineering blog", tr: "Mühendislik blogu" }) }, { href: "/press", label: t({ en: "Press", tr: "Basın" }) }] },
          { title: t({ en: "Candidates", tr: "Adaylar" }), links: [{ href: "/candidate-privacy", label: t({ en: "Candidate privacy notice", tr: "Aday aydınlatma metni" }) }, { href: "/accessibility", label: t({ en: "Interview adjustments", tr: "Mülakat düzenlemeleri" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE, address: t({ en: "Moda Cd. 00, Kadıköy, Istanbul", tr: "Moda Cd. 00, Kadıköy, İstanbul" }) }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/northpoint-example" }, { network: "instagram", href: "https://instagram.com/northpoint.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }]}
        year={2026}
      />
    </>
  );
}
