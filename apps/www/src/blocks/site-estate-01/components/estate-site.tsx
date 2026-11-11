import { LocaleProvider } from "@vamos-ui/react";
import { ContactForm, Footer, Navbar, SiteShellPage, StatsBand, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { agents, copyFor, EMAIL, PHONE, type SiteLocale } from "./content";
import { CalculatorSection, FeaturedListings, NeighbourhoodGuides, SearchHero } from "./home-parts";
import { ListingPage } from "./listing-page";
import { ListingsPage } from "./listings-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of Harbourline Homes: navbar, three pages (home, listings, listing) and
 * the footer. Filters, the hovered listing and saved homes live in EstateProvider (page.tsx).
 */
export function EstateSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Harbourline"
        homeHref={home()}
        items={[
          { label: t({ en: "Listings", tr: "İlanlar" }), href: sitePageHref("listings") },
          { label: t({ en: "Neighbourhoods", tr: "Semtler" }), href: home("guides") },
          { label: t({ en: "Mortgage", tr: "Kredi" }), href: home("mortgage") },
          { label: t({ en: "Agents", tr: "Danışmanlar" }), href: home("agents") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: home("contact"), label: t({ en: "Sell with us", tr: "Evinizi satın" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Harbourline Homes — city flats on both shores", tr: "Harbourline Homes — iki yakada şehir daireleri" })}>
          <SearchHero />
          <StatsBand
            {...common}
            variant="inline"
            theme={{ rhythm: "tight" }}
            items={[
              { value: "8", label: t({ en: "neighbourhoods we cover", tr: "çalıştığımız semt" }) },
              { value: "412", label: t({ en: "homes sold or let since 2011", tr: "2011’den beri satılan ya da kiralanan ev" }) },
              { value: t({ en: "19 days", tr: "19 gün" }), label: t({ en: "median time to an accepted offer", tr: "kabul edilen teklife ortanca süre" }) },
              { value: t({ en: "2%", tr: "%2" }), label: t({ en: "commission + VAT, paid by the seller", tr: "komisyon + KDV, satıcı öder" }) },
            ]}
          />
          <FeaturedListings />
          <NeighbourhoodGuides />
          <CalculatorSection />
          <Team
            {...common}
            anchor="agents"
            variant="list"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Agents", tr: "Danışmanlar" })}
            title={t({ en: "Three people, *one* phone number", tr: "Üç kişi, *tek* telefon numarası" })}
            members={agents.map((a) => ({ name: a.name, role: t(a.role), specialty: t(a.areas), photo: { ...a.photo, alt: t(a.photo.alt) }, bio: t({ en: `Speaks ${a.languages.en}.`, tr: `${a.languages.tr} konuşur.` }) }))}
          />
          <ContactForm
            {...common}
            anchor="contact"
            variant="split"
            eyebrow={t({ en: "Selling or letting?", tr: "Satıyor ya da kiraya mı veriyorsunuz?" })}
            title={t({ en: "A valuation in *48 hours*", tr: "*48 saatte* değerleme" })}
            lead={t({ en: "Tell us the address and when we can visit. An agent who works that street replies within one working day.", tr: "Adresi ve ne zaman gelebileceğimizi yazın. O sokakta çalışan bir danışman bir iş günü içinde döner." })}
            submitLabel={t({ en: "Request a valuation", tr: "Değerleme iste" })}
            privacyLink={{ href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }}
            info={{ phone: PHONE, email: EMAIL, address: "Rıhtım Caddesi 21, Kat 3, 34710 Kadıköy / İstanbul" }}
            showInfo
          />
        </SiteShellPage>

        <SiteShellPage id="listings" title={t({ en: "Listings — Harbourline Homes", tr: "İlanlar — Harbourline Homes" })}>
          <ListingsPage />
        </SiteShellPage>

        <SiteShellPage id="listing" title={t({ en: "Listing — Harbourline Homes", tr: "İlan — Harbourline Homes" })}>
          <ListingPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Harbourline", href: home() }}
        about={t({ en: "City flats for sale and to rent on both shores of the Bosphorus, since 2011.", tr: "2011’den beri Boğaz’ın iki yakasında satılık ve kiralık şehir daireleri." })}
        columns={[
          { title: t({ en: "Homes", tr: "Evler" }), links: [{ href: sitePageHref("listings"), label: t({ en: "All listings", tr: "Tüm ilanlar" }) }, { href: home("guides"), label: t({ en: "Neighbourhood guides", tr: "Semt rehberleri" }) }, { href: home("mortgage"), label: t({ en: "Mortgage calculator", tr: "Kredi hesaplayıcı" }) }] },
          { title: t({ en: "Owners", tr: "Ev sahipleri" }), links: [{ href: home("contact"), label: t({ en: "Free valuation", tr: "Ücretsiz değerleme" }) }, { href: "/letting", label: t({ en: "Letting & management", tr: "Kiralama ve yönetim" }) }, { href: "/fees", label: t({ en: "Our fees", tr: "Ücretlerimiz" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: "Rıhtım Caddesi 21, Kat 3, 34710 Kadıköy / İstanbul" }}
        social={[{ network: "instagram", href: "https://instagram.com/harbourline.example" }, { network: "linkedin", href: "https://linkedin.com/company/harbourline-example" }]}
        company={{ legalName: "Harbourline Gayrimenkul Danışmanlık Ltd. Şti.", registry: [{ label: t({ en: "Estate agent licence", tr: "Yetki belgesi no" }), value: "3400000" }] }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr}>
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-GB">{site}</LocaleProvider>
  );
}
