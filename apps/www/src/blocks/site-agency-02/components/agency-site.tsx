import { LocaleProvider } from "@vamos-ui/react";
import { Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { CasePage } from "./case-page";
import { ContactPage } from "./contact-page";
import { ADDRESS, copyFor, EMAIL, PHONE, type SiteLocale } from "./content";
import { HomePage } from "./home-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of the Tamtam site: minimal navbar, three pages (home with the colour
 * stage, a case study, start-a-project) and a wordmark footer. The chosen project lives in
 * ProjectProvider (page.tsx), above the locale switch.
 */
export function AgencySite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <Navbar
        {...common}
        variant="minimal"
        sticky
        wordmark={<span className="font-display text-[1.6rem] leading-none tracking-[-0.06em]">tamtam</span>}
        homeHref={home()}
        items={[
          { label: t({ en: "Work", tr: "İşler" }), href: home("work") },
          { label: t({ en: "Services", tr: "Hizmetler" }), href: home("services") },
          { label: t({ en: "Studio", tr: "Stüdyo" }), href: home("studio") },
          { label: t({ en: "Case study", tr: "Vaka" }), href: sitePageHref("case") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("contact"), label: t({ en: "Start a project", tr: "Proje başlatın" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Tamtam — brands you can point at", tr: "Tamtam — parmakla gösterilen markalar" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="case" title={t({ en: "Case study — Tamtam", tr: "Vaka — Tamtam" })}>
          <CasePage />
        </SiteShellPage>
        <SiteShellPage id="contact" title={t({ en: "Start a project — Tamtam", tr: "Proje başlatın — Tamtam" })}>
          <ContactPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "tamtam", href: home() }}
        about={t({ en: "Brand studio in Karaköy. Names, identities, packaging, websites and motion since 2014.", tr: "Karaköy’de marka stüdyosu. 2014’ten beri isim, kimlik, ambalaj, web sitesi ve hareket." })}
        columns={[
          { title: t({ en: "Studio", tr: "Stüdyo" }), links: [{ href: home("work"), label: t({ en: "Work", tr: "İşler" }) }, { href: home("services"), label: t({ en: "Services", tr: "Hizmetler" }) }, { href: home("people"), label: t({ en: "People", tr: "Ekip" }) }] },
          { title: t({ en: "Talk", tr: "Konuşalım" }), links: [{ href: sitePageHref("contact"), label: t({ en: "Start a project", tr: "Proje başlatın" }) }, { href: "/jobs", label: t({ en: "Jobs (1 open)", tr: "İş ilanları (1 açık)" }) }, { href: "/press", label: t({ en: "Press kit", tr: "Basın kiti" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: ADDRESS }}
        social={[
          { network: "instagram", href: "https://instagram.com/tamtam.example" },
          { network: "linkedin", href: "https://linkedin.com/company/tamtam-example" },
        ]}
        legalLinks={[
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
        ]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr} currency="TRY">
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-US" currency="USD">
      {site}
    </LocaleProvider>
  );
}
