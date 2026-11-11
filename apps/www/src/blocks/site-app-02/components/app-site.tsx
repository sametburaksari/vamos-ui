import { Footer, Navbar, SiteShellPage } from "@vamos-ui/react/blocks";
import { BRAND, copyFor, EMAIL, home, PHONE, PRICING_HREF, SECURITY_HREF, SIGNUP_HREF, type SiteLocale } from "./content";
import { HomePage } from "./home-page";
import { PricingPage } from "./pricing-page";
import { SecurityPage } from "./security-page";

/** The wordmark: a small leaf-like mark (two offset arcs) and the name. */
function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-[1.15rem] font-semibold tracking-[-0.03em]">
      <svg aria-hidden viewBox="0 0 24 24" className="size-6 text-accent-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 19c0-8 6-14 14-14" />
        <path d="M5 19c4 0 9-2 11-8" opacity=".55" />
      </svg>
      {BRAND}
    </span>
  );
}

/**
 * One language version of the Fernway site: framed-rail navbar, home / pricing / security,
 * and a footer that carries the regulatory notes.
 */
export function AppSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="rail"
        sticky
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "How it works", tr: "Nasıl çalışır" }), href: home("features") },
          { label: t({ en: "Planner", tr: "Planlayıcı" }), href: home("planner") },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: PRICING_HREF },
          { label: t({ en: "Security", tr: "Güvenlik" }), href: SECURITY_HREF },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: "https://example.com/sign-in", label: t({ en: "Sign in", tr: "Giriş" }) }, style: "secondary" },
          { link: { href: SIGNUP_HREF, label: t({ en: "Open an account", tr: "Hesap açın" }) }, style: "primary" },
        ]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Fernway — everyday money, kept calm", tr: "Fernway — gündelik para, sakin tutulur" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="pricing" title={t({ en: "Pricing — Fernway", tr: "Fiyatlar — Fernway" })}>
          <PricingPage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="security" title={t({ en: "Security — Fernway", tr: "Güvenlik — Fernway" })}>
          <SecurityPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: BRAND, href: home() }}
        about={t({
          en: "Fernway is a fictional e-money brand made to demonstrate this template. Money held with an e-money institution is safeguarded, not covered by the savings deposit insurance fund.",
          tr: "Fernway, bu şablonu göstermek için oluşturulmuş kurgusal bir elektronik para markasıdır. Elektronik para kuruluşunda tutulan para koruma altındadır; tasarruf mevduatı sigorta fonu kapsamında değildir.",
        })}
        columns={[
          {
            title: t({ en: "Product", tr: "Ürün" }),
            links: [
              { href: home("features"), label: t({ en: "How it works", tr: "Nasıl çalışır" }) },
              { href: home("planner"), label: t({ en: "Goal planner", tr: "Hedef planlayıcı" }) },
              { href: PRICING_HREF, label: t({ en: "Pricing", tr: "Fiyatlar" }) },
            ],
          },
          {
            title: t({ en: "Trust", tr: "Güven" }),
            links: [
              { href: SECURITY_HREF, label: t({ en: "Security & safeguarding", tr: "Güvenlik ve koruma" }) },
              { href: `${SECURITY_HREF}#status`, label: t({ en: "Service status", tr: "Hizmet durumu" }) },
              { href: `${SECURITY_HREF}#report`, label: t({ en: "Report a vulnerability", tr: "Açık bildirin" }) },
            ],
          },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: t({ en: "Example Plaza, Floor 4, Ataşehir, Istanbul", tr: "Example Plaza, Kat 4, Ataşehir, İstanbul" }) }}
        social={[
          { network: "linkedin", href: "https://www.linkedin.com/company/example" },
          { network: "instagram", href: "https://www.instagram.com/example" },
        ]}
        legalLinks={[
          { href: "https://example.com/terms", label: t({ en: "Terms", tr: "Koşullar" }) },
          { href: "https://example.com/kvkk", label: t({ en: "Privacy (KVKK)", tr: "KVKK aydınlatma metni" }) },
          { href: "https://example.com/complaints", label: t({ en: "Complaints", tr: "Şikâyetler" }) },
        ]}
        company={{
          legalName: t({ en: "Fernway Elektronik Para A.Ş. (fictional)", tr: "Fernway Elektronik Para A.Ş. (kurgusal)" }),
          registry: [
            { label: t({ en: "Licence no.", tr: "Lisans no." }), value: "00/000" },
            { label: t({ en: "Trade registry no.", tr: "Ticaret sicil no." }), value: "000000" },
          ],
        }}
        year={2026}
      />
    </>
  );
}
