import { LocaleProvider } from "@vamos-ui/react";
import { ContactForm, Footer, Navbar, SiteShellPage, StatsBand, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { CollectionPage } from "./collection-page";
import { ADDRESS, copyFor, EMAIL, PHONE, type SiteLocale } from "./content";
import { FeaturedHouses, OfficeIntro, OffMarketBand, ResidenceFilm } from "./home-parts";
import { ResidencePage } from "./residence-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of Vellacourt: an overlay navbar over full-bleed photographs, three pages
 * (home, collection, residence) and the footer. The chosen residence lives in EstateProvider.
 */
export function EstateSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        overlay
        wordmark="Vellacourt"
        homeHref={home()}
        items={[
          { label: t({ en: "Collection", tr: "Koleksiyon" }), href: sitePageHref("collection") },
          { label: t({ en: "Off-market", tr: "Piyasa dışı" }), href: home("off-market") },
          { label: t({ en: "The office", tr: "Ofis" }), href: home("office") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("contact"), label: t({ en: "Private conversation", tr: "Özel görüşme" }) }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Vellacourt — private residences, Istanbul", tr: "Vellacourt — özel konutlar, İstanbul" })}>
          <ResidenceFilm />
          <div id="office">
            <OfficeIntro />
          </div>
          <FeaturedHouses />
          <div id="off-market">
            <OffMarketBand />
          </div>
          <StatsBand
            {...common}
            variant="ledger"
            eyebrow={t({ en: "Since 2009", tr: "2009’dan beri" })}
            title={t({ en: "Fewer houses, *known completely*", tr: "Daha az ev, *eksiksiz tanınan*" })}
            items={[
              { value: "€412m", label: t({ en: "of houses sold since 2009", tr: "2009’dan beri satılan ev değeri" }) },
              { value: "11", label: t({ en: "houses a year, on average", tr: "yılda ortalama ev" }) },
              { value: t({ en: "64%", tr: "%64" }), label: t({ en: "sold off-market, never advertised", tr: "piyasa dışı, hiç ilan edilmeden satıldı" }) },
              { value: t({ en: "6", tr: "6" }), label: t({ en: "people in the office, no franchise", tr: "kişilik ofis, franchise yok" }) },
            ]}
          />
          <Testimonials
            {...common}
            variant="feature"
            items={[
              {
                quote: t({
                  en: "They told us which room would be cold in February and which neighbour practises the cello. We bought the house a week later and have not been surprised once.",
                  tr: "Hangi odanın şubatta soğuk olacağını ve hangi komşunun çello çaldığını söylediler. Evi bir hafta sonra aldık ve bir kez bile şaşırmadık.",
                }),
                author: "Mert & Leyla Aydemir",
                role: t({ en: "Bought in Beykoz, 2025", tr: "2025’te Beykoz’dan aldılar" }),
              },
            ]}
          />
          <ContactForm
            {...common}
            anchor="contact"
            variant="split"
            eyebrow={t({ en: "Private conversation", tr: "Özel görüşme" })}
            title={t({ en: "Tell us about the house you have *not found yet*", tr: "Henüz *bulamadığınız* evi anlatın" })}
            lead={t({ en: "Buying, selling or simply curious about what a house is worth — one of the founders replies personally within a working day.", tr: "Alıyor, satıyor ya da bir evin değerini merak ediyorsanız — kuruculardan biri bir iş günü içinde bizzat yanıt verir." })}
            submitLabel={t({ en: "Send", tr: "Gönder" })}
            privacyLink={{ href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }}
            info={{ phone: PHONE, email: EMAIL, address: ADDRESS }}
            showInfo
          />
        </SiteShellPage>

        <SiteShellPage id="collection" title={t({ en: "The collection — Vellacourt", tr: "Koleksiyon — Vellacourt" })}>
          <CollectionPage />
        </SiteShellPage>

        <SiteShellPage id="residence" title={t({ en: "Residence — Vellacourt", tr: "Konut — Vellacourt" })}>
          <ResidencePage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Vellacourt", href: home() }}
        about={t({ en: "A private office for exceptional houses in and around Istanbul. Six people, since 2009.", tr: "İstanbul ve çevresindeki seçkin evler için özel bir ofis. Altı kişi, 2009’dan beri." })}
        columns={[
          { title: t({ en: "Houses", tr: "Evler" }), links: [{ href: sitePageHref("collection"), label: t({ en: "The collection", tr: "Koleksiyon" }) }, { href: home("off-market"), label: t({ en: "Off-market register", tr: "Piyasa dışı kayıt" }) }, { href: home("contact"), label: t({ en: "Valuation", tr: "Değerleme" }) }] },
          { title: t({ en: "Office", tr: "Ofis" }), links: [{ href: home("office"), label: t({ en: "About us", tr: "Hakkımızda" }) }, { href: home("contact"), label: t({ en: "Contact", tr: "İletişim" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: ADDRESS }}
        social={[{ network: "instagram", href: "https://instagram.com/vellacourt.example" }]}
        company={{ legalName: "Vellacourt Gayrimenkul Danışmanlık A.Ş.", registry: [{ label: t({ en: "Estate agent licence", tr: "Yetki belgesi no" }), value: "3400000" }] }}
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
