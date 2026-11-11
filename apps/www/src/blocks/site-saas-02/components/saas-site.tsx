import { LocaleProvider } from "@vamos-ui/react";
import { AnnouncementBar, Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ConnectorsPage } from "./connectors-page";
import { ADDRESS, copyFor, EMAIL, PHONE, type SiteLocale } from "./content";
import { HomePage } from "./home-page";
import { PricingPage } from "./pricing-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** The wordmark: a plumb line drawn with two tokens, then the name in the mono display face. */
function Wordmark() {
  return (
    <span className="flex items-center gap-2 font-display text-[1.05rem] leading-none tracking-[-0.04em]">
      <span aria-hidden className="relative flex h-5 w-3 justify-center">
        <span className="h-full w-px bg-fg-muted" />
        <span className="absolute bottom-0 size-2.5 rotate-45 bg-accent" />
      </span>
      plumbline
    </span>
  );
}

/**
 * One language version of the Plumbline site: announcement, navbar, three pages (home with the
 * live query console, pricing with the estimator, connectors with filters) and the footer.
 */
export function SaasSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <AnnouncementBar
        {...common}
        tone="neutral"
        text={t({ en: "Plumbline 5.0 — anomaly bands now learn yearly seasonality.", tr: "Plumbline 5.0 — anomali bantları artık yıllık mevsimselliği öğreniyor." })}
        link={{ href: home("alerts"), label: t({ en: "See an alert", tr: "Bir uyarı görün" }) }}
      />
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Product", tr: "Ürün" }), href: home("product") },
          { label: t({ en: "Metric layer", tr: "Metrik katmanı" }), href: home("metrics") },
          { label: t({ en: "Alerts", tr: "Uyarılar" }), href: home("alerts") },
          { label: t({ en: "Connectors", tr: "Bağlayıcılar" }), href: sitePageHref("connectors") },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: sitePageHref("pricing") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: "/signup", label: t({ en: "Start free", tr: "Ücretsiz başla" }) }, style: "primary" },
          { link: { href: "/login", label: t({ en: "Sign in", tr: "Giriş" }) }, style: "secondary" },
        ]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Plumbline — define each metric once", tr: "Plumbline — her metriği bir kez tanımlayın" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="pricing" title={t({ en: "Pricing — Plumbline", tr: "Fiyatlar — Plumbline" })}>
          <PricingPage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="connectors" title={t({ en: "Connectors — Plumbline", tr: "Bağlayıcılar — Plumbline" })}>
          <ConnectorsPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Plumbline", href: home() }}
        about={t({ en: "Business intelligence for teams that would rather read a number than file a request. Built in Istanbul.", tr: "Talep açmak yerine sayıyı okumayı tercih eden ekipler için iş zekâsı. İstanbul’da geliştirildi." })}
        columns={[
          { title: t({ en: "Product", tr: "Ürün" }), links: [{ href: home("product"), label: t({ en: "Overview", tr: "Genel bakış" }) }, { href: home("metrics"), label: t({ en: "Metric layer", tr: "Metrik katmanı" }) }, { href: sitePageHref("connectors"), label: t({ en: "Connectors", tr: "Bağlayıcılar" }) }, { href: sitePageHref("pricing"), label: t({ en: "Pricing", tr: "Fiyatlar" }) }] },
          { title: t({ en: "Developers", tr: "Geliştiriciler" }), links: [{ href: "/docs", label: t({ en: "Docs", tr: "Belgeler" }) }, { href: "/docs/api", label: "API" }, { href: "https://status.plumbline.example.com", label: t({ en: "Status", tr: "Durum" }), newTab: true }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "/about", label: t({ en: "About", tr: "Hakkımızda" }) }, { href: "/security", label: t({ en: "Security", tr: "Güvenlik" }) }, { href: "/contact", label: t({ en: "Contact", tr: "İletişim" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE, address: ADDRESS }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/plumbline-example" }]}
        legalLinks={[
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
          { href: "/dpa", label: "DPA" },
        ]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr} currency="USD">
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-US" currency="USD">
      {site}
    </LocaleProvider>
  );
}
