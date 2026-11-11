import { LocaleProvider } from "@vamos-ui/react";
import { AnnouncementBar, Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { cohorts, copyFor, PHONE, type SiteLocale } from "./content";
import { CurriculumPage } from "./curriculum-page";
import { EnrolPage } from "./enrol-page";
import { HomePage } from "./home-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of the course site: announcement, navbar, three pages, footer. Server
 * component; the lesson map, cohort calendar and enrol form are the client islands.
 */
export function CourseSite({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const winter = cohorts[0]!;

  const site = (
    <>
      <AnnouncementBar
        {...common}
        text={t({ en: `Winter cohort: ${winter.seats - winter.taken} seats left, starts ${f.date(winter.start, "long")}.`, tr: `Kış dönemi: ${winter.seats - winter.taken} yer kaldı, ${f.date(winter.start, "long")} tarihinde başlıyor.` })}
        link={{ href: sitePageHref("enrol"), label: t({ en: "Hold a seat", tr: "Yer ayırın" }) }}
      />
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-baseline gap-2">
            <span className="font-display text-[1.35rem] tracking-[-0.01em]">Atlas</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">Academy</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Curriculum", tr: "Müfredat" }), href: sitePageHref("curriculum") },
          { label: t({ en: "Lesson map", tr: "Ders haritası" }), href: home("map") },
          { label: t({ en: "Dates", tr: "Tarihler" }), href: home("dates") },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: home("pricing") },
          { label: t({ en: "Instructor", tr: "Eğitmen" }), href: sitePageHref("enrol") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("enrol", "enrol"), label: t({ en: "Enrol", tr: "Kayıt ol" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Atlas Academy — data analysis in twelve weeks", tr: "Atlas Academy — on iki haftada veri analizi" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="curriculum" title={t({ en: "Curriculum — Atlas Academy", tr: "Müfredat — Atlas Academy" })}>
          <CurriculumPage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="enrol" title={t({ en: "Instructor & enrol — Atlas Academy", tr: "Eğitmen ve kayıt — Atlas Academy" })}>
          <EnrolPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        brand={{ name: "Atlas Academy", href: home() }}
        about={t({ en: "A small school for practical data analysis. Online, in English and Turkish, from Kadıköy.", tr: "Uygulamalı veri analizi için küçük bir okul. Çevrim içi, İngilizce ve Türkçe; Kadıköy’den." })}
        columns={[
          { title: t({ en: "Course", tr: "Kurs" }), links: [{ href: sitePageHref("curriculum"), label: t({ en: "Curriculum", tr: "Müfredat" }) }, { href: home("dates"), label: t({ en: "Cohort dates", tr: "Dönem tarihleri" }) }, { href: home("pricing"), label: t({ en: "Pricing", tr: "Fiyatlar" }) }] },
          { title: t({ en: "School", tr: "Okul" }), links: [{ href: sitePageHref("enrol"), label: t({ en: "Instructor", tr: "Eğitmen" }) }, { href: "/scholarships", label: t({ en: "Scholarships (4 per cohort)", tr: "Burslar (dönem başına 4)" }) }, { href: "/teams", label: t({ en: "For teams", tr: "Ekipler için" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("faq"), label: "FAQ" }, { href: "/refunds", label: t({ en: "Refund policy", tr: "İade politikası" }) }] },
        ]}
        contact={{ email: "hello@atlas-academy.example", phone: PHONE, address: t({ en: "Moda Cd. 00, Kadıköy, Istanbul", tr: "Moda Cd. 00, Kadıköy, İstanbul" }) }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/atlas-academy-example" }, { network: "youtube", href: "https://youtube.com/@atlas-academy-example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr}>
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-US">{site}</LocaleProvider>
  );
}
