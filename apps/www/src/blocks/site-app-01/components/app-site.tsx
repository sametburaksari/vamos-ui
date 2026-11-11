import { BlockHeading, Container, Cta, Footer, Navbar, Section, SectionHeader, SiteShellPage, StatsBand, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { chapters, copyFor, EMAIL, PHONE, reviews, type SiteLocale } from "./content";
import { DownloadPage } from "./download-page";
import { CoachScreen, LiveScreen, PhoneFrame, PlanScreen, RecoverScreen } from "./phone";
import { PlanTabs } from "./plan-tabs";
import { PricingPage } from "./pricing-page";
import { ScrollPhone } from "./scroll-phone";
import { StoreBadges } from "./store-badges";

const home = (anchor?: string) => sitePageHref("home", anchor);
const pricing = sitePageHref("pricing");
const download = sitePageHref("download");

/**
 * One language version of the Tempo Run site: navbar and footer around three pages (home,
 * pricing, download + FAQ). Server component; the SiteShell in page.tsx picks page and language.
 */
export function AppSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };

  const screens = { live: <LiveScreen c={c} />, plan: <PlanScreen c={c} />, coach: <CoachScreen c={c} />, recover: <RecoverScreen c={c} /> };

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-[-0.04em]">
            <span aria-hidden className="inline-block h-3 w-5 skew-x-[-18deg] rounded-[2px] bg-accent" />
            Tempo Run
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Features", tr: "Özellikler" }), href: home("features") },
          { label: t({ en: "Plans", tr: "Planlar" }), href: home("plans") },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: pricing },
          { label: t({ en: "Download", tr: "İndir" }), href: download },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: download, label: t({ en: "Get the app", tr: "Uygulamayı indir" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Tempo Run — a running coach in your pocket", tr: "Tempo Run — cebinizdeki koşu koçu" })}>
          {/* Hero: oversized title on the start side, two phones on a drawn running track on the end side. */}
          <Section anchor="top" className="overflow-hidden" theme={{ rhythm: "tight" }}>
            <Container size="wide">
              <div className="grid items-center gap-14 pt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
                <div>
                  <p className="m-0 inline-flex items-center gap-3 font-mono text-xs tracking-[0.1em] text-fg-muted uppercase">
                    <span aria-hidden className="size-2 rounded-full bg-accent" />
                    {t({ en: "Running coach · iPhone & Android", tr: "Koşu koçu · iPhone ve Android" })}
                  </p>
                  <BlockHeading level={1} size="display-2xl" className="mt-6 max-w-[11ch]" text={t({ en: "Run the pace you *planned.*", tr: "Planladığın *tempoda* koş." })} />
                  <p className="mt-8 max-w-[44ch] text-lead text-fg-muted">
                    {t({
                      en: "Tempo Run builds your week around your calendar, talks you through every rep and tells you honestly when today should be easy.",
                      tr: "Tempo Run haftanızı takviminize göre kurar, her tekrarda size eşlik eder ve bugünün kolay geçmesi gerektiğinde bunu dürüstçe söyler.",
                    })}
                  </p>
                  <StoreBadges c={c} className="mt-10" />
                  <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-6">
                    {[
                      [t({ en: "App rating", tr: "Uygulama puanı" }), f.number(4.8, { minimumFractionDigits: 1 }), t({ en: "38,400 ratings", tr: "38.400 değerlendirme" })],
                      [t({ en: "Runners", tr: "Koşucu" }), f.compact(310000), t({ en: "active in October", tr: "Ekim’de aktif" })],
                      [t({ en: "Free plan", tr: "Ücretsiz paket" }), t({ en: "Forever", tr: "Süresiz" }), t({ en: "no ads", tr: "reklamsız" })],
                    ].map(([k, v, s]) => (
                      <div key={k}>
                        <dt className="font-mono text-[11px] tracking-[0.08em] text-fg-subtle uppercase">{k}</dt>
                        <dd className="m-0 mt-1.5 font-display text-3xl font-bold tracking-[-0.04em] text-fg tabular">{v}</dd>
                        <dd className="m-0 font-mono text-[11px] text-fg-muted">{s}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="relative mx-auto flex h-[37rem] w-full max-w-[30rem] items-center justify-center sm:h-[40rem]">
                  <svg viewBox="0 0 400 640" className="absolute inset-0 size-full" aria-hidden preserveAspectRatio="xMidYMid meet">
                    <rect x="20" y="20" width="360" height="600" rx="180" fill="none" stroke="var(--line)" strokeWidth="1.5" />
                    <rect x="52" y="52" width="296" height="536" rx="148" fill="none" stroke="var(--line)" strokeWidth="1.5" />
                    <rect x="84" y="84" width="232" height="472" rx="116" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 8" />
                    <path d="M 380 200 A 180 180 0 0 0 200 20" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="380" cy="200" r="7" fill="var(--accent)" />
                  </svg>
                  <div role="img" aria-label={t({ en: "The live run screen and the morning readiness screen of Tempo Run", tr: "Tempo Run’ın canlı koşu ve sabah hazırlık ekranları" })} className="relative flex items-center">
                    <div aria-hidden className="flex items-center">
                      <PhoneFrame size="sm" time="06:58" className="absolute -start-24 top-16 hidden -rotate-6 sm:block">
                        <div className="flex flex-1 flex-col">{screens.recover}</div>
                      </PhoneFrame>
                      <PhoneFrame className="relative rotate-2 sm:translate-x-10 rtl:sm:-translate-x-10">
                        <div className="flex flex-1 flex-col">{screens.live}</div>
                      </PhoneFrame>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>

          {/* Signature: the phone that changes screens as the chapters scroll. */}
          <Section anchor="features" headingId="tr-features-title">
            <Container size="wide">
              <SectionHeader
                headingId="tr-features-title"
                align="split"
                eyebrow={t({ en: "What it does", tr: "Ne yapar" })}
                title={t({ en: "Four screens, *one* coach", tr: "Dört ekran, *tek* koç" })}
                lead={t({ en: "Scroll: the phone follows. Each screen is the real app, not a render.", tr: "Kaydırın: telefon takip eder. Her ekran gerçek uygulamadır, çizim değil." })}
              />
              <div className="mt-8 lg:mt-0">
                <ScrollPhone
                  navLabel={t({ en: "Feature chapters", tr: "Özellik bölümleri" })}
                  screenLabel={t({ en: "Phone screen", tr: "Telefon ekranı" })}
                  chapters={chapters.map((ch) => ({ id: ch.id, kicker: t(ch.kicker), title: t(ch.title), text: t(ch.text), points: ch.points.map(t), screen: screens[ch.id] }))}
                />
              </div>
            </Container>
          </Section>

          <StatsBand
            {...common}
            anchor="numbers"
            variant="inline"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Runners on Tempo, October 2026", tr: "Tempo koşucuları, Ekim 2026" })}
            items={[
              { value: 2.4, unit: "M", unitLabel: t({ en: "million", tr: "milyon" }), label: t({ en: "Kilometres logged last month", tr: "Geçen ay kaydedilen kilometre" }), source: t({ en: "Tempo Run data, Oct 2026", tr: "Tempo Run verisi, Ekim 2026" }) },
              { value: 71, unit: "%", label: t({ en: "Finish the plan they start", tr: "Başladığı planı bitirenler" }), source: t({ en: "Plans started Jan–Jun 2026", tr: "Ocak–Haziran 2026’da başlanan planlar" }) },
              { value: 3.8, unit: t({ en: "min", tr: "dk" }), unitLabel: t({ en: "minutes", tr: "dakika" }), label: t({ en: "Median 10K improvement", tr: "Ortanca 10K gelişimi" }), source: t({ en: "Users with 2+ timed 10Ks, n = 9,140", tr: "2+ ölçülü 10K koşan kullanıcılar, n = 9.140" }) },
              { value: 4.8, label: t({ en: "Average store rating", tr: "Ortalama mağaza puanı" }), source: t({ en: "38,400 ratings, both stores", tr: "İki mağazada 38.400 değerlendirme" }) },
            ]}
          />

          <Section anchor="plans" headingId="tr-plans-title">
            <Container>
              <SectionHeader
                headingId="tr-plans-title"
                eyebrow={t({ en: "Plans", tr: "Planlar" })}
                title={t({ en: "From your first 5K to *42.2*", tr: "İlk 5K’dan *42,2*’ye" })}
                lead={t({ en: "Pick a distance — the phone shows the plan’s shape: how volume builds, where it steps back, when it tapers.", tr: "Bir mesafe seçin — telefon planın şeklini gösterir: hacim nasıl artar, nerede geri çekilir, ne zaman azalır." })}
              />
              <div className="mt-12">
                <PlanTabs c={c} />
              </div>
            </Container>
          </Section>

          <Testimonials
            {...common}
            anchor="runners"
            variant="wall"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "From the stores", tr: "Mağazalardan" })}
            title={t({ en: "Written after the *run*, not before", tr: "Koşudan *sonra* yazılanlar" })}
            items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, role: t(r.role), date: r.date }))}
          />

          <Cta
            {...common}
            variant="band"
            theme={{ surface: "accent" }}
            title={t({ en: "Tomorrow’s run is *already* planned", tr: "Yarınki koşunuz *zaten* planlı" })}
            lead={t({ en: "Free to download. Pro free for 14 days.", tr: "İndirmesi ücretsiz. Pro 14 gün ücretsiz." })}
            actions={[
              { link: { href: download, label: t({ en: "Download Tempo Run", tr: "Tempo Run’ı indir" }) }, style: "primary" },
              { link: { href: pricing, label: t({ en: "See pricing", tr: "Fiyatları gör" }) }, style: "secondary" },
            ]}
            fineprint={t({ en: "iOS 17+ · Android 10+ · watchOS 10+ · Wear OS 4+", tr: "iOS 17+ · Android 10+ · watchOS 10+ · Wear OS 4+" })}
          />
        </SiteShellPage>

        <SiteShellPage id="pricing" title={t({ en: "Pricing — Tempo Run", tr: "Fiyatlar — Tempo Run" })}>
          <PricingPage c={c} />
        </SiteShellPage>

        <SiteShellPage id="download" title={t({ en: "Download — Tempo Run", tr: "İndir — Tempo Run" })}>
          <DownloadPage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Tempo Run", href: home() }}
        about={t({ en: "A running coach app made by runners in Kadıköy, Istanbul.", tr: "Kadıköy, İstanbul’da koşucular tarafından yapılan bir koşu koçu uygulaması." })}
        columns={[
          { title: t({ en: "App", tr: "Uygulama" }), links: [{ href: home("features"), label: t({ en: "Features", tr: "Özellikler" }) }, { href: home("plans"), label: t({ en: "Plans", tr: "Planlar" }) }, { href: pricing, label: t({ en: "Pricing", tr: "Fiyatlar" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: download, label: t({ en: "Download", tr: "İndir" }) }, { href: sitePageHref("download", "faq"), label: "FAQ" }, { href: "https://status.temporun.example.com", label: t({ en: "Status", tr: "Durum" }), newTab: true }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "/about", label: t({ en: "About", tr: "Hakkımızda" }) }, { href: "/press", label: t({ en: "Press kit", tr: "Basın kiti" }) }, { href: "/careers", label: t({ en: "Careers", tr: "Kariyer" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        social={[{ network: "instagram", href: "https://instagram.com/temporun.example" }, { network: "youtube", href: "https://youtube.com/@temporun.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }]}
        year={2026}
      />
    </>
  );
}
