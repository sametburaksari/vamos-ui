import { LocaleProvider } from "@vamos-ui/react";
import { AnnouncementBar, Cta, Footer, MediaText, Navbar, SiteShellPage, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { CheckoutPage } from "./checkout-page";
import { copyFor, EMAIL, PHONE, photos, type SiteLocale } from "./content";
import { CategoryTiles, HeroProduct, NewRail } from "./home-parts";
import { ProductPage } from "./product-page";
import { ShopPage } from "./shop-page";
import { CartLabel } from "./store-provider";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of the Kilnhouse store: announcement, navbar with a live cart count,
 * four pages (home, shop, product, checkout) and the footer. The cart lives in StoreProvider
 * (page.tsx), above the locale switch.
 */
export function StoreSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <AnnouncementBar
        {...common}
        tone="accent"
        variant="centered"
        text={t({ en: "Free delivery in Türkiye over ₺2,500 — and worldwide over $75.", tr: "Türkiye içi 2.500 ₺ üzeri ücretsiz kargo — yurt dışına 75 $ üzeri." })}
        link={{ href: home("delivery"), label: t({ en: "Delivery & returns", tr: "Kargo ve iade" }) }}
      />
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark="Kilnhouse"
        homeHref={home()}
        items={[
          { label: t({ en: "Shop", tr: "Mağaza" }), href: sitePageHref("shop") },
          { label: t({ en: "New this week", tr: "Bu hafta yeni" }), href: home("new") },
          { label: t({ en: "The studio", tr: "Atölye" }), href: home("studio") },
          { label: t({ en: "Delivery", tr: "Kargo" }), href: home("delivery") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: "#cart", label: <CartLabel /> }, style: "link" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Kilnhouse — small-batch ceramics from Kuzguncuk", tr: "Kilnhouse — Kuzguncuk’tan küçük seri seramik" })}>
          <HeroProduct />
          <CategoryTiles />
          <div id="new" className="scroll-mt-24">
            <NewRail />
          </div>
          <MediaText
            {...common}
            anchor="studio"
            variant="overlap"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "The studio", tr: "Atölye" })}
            title={t({ en: "Two wheels, one kiln, *Ayla and Kerem*", tr: "İki torna, bir fırın, *Ayla ve Kerem*" })}
            body={t({
              en: "Kilnhouse started in 2019 in a former bakery on Fırın Sokak. Ayla throws, Kerem glazes, and the kiln fires twice a month. Nothing is outsourced, so every piece in the shop has been in both our hands.\n\nOpen studio on Saturdays from 11:00 to 18:00 — come and see a firing being unpacked.",
              tr: "Kilnhouse 2019’da Fırın Sokak’taki eski bir fırında başladı. Ayla çeker, Kerem sırlar; fırın ayda iki kez yanar. Hiçbir iş dışarıya verilmez; mağazadaki her parça ikimizin de elinden geçti.\n\nCumartesi 11:00–18:00 atölye açık — bir pişirimin fırından çıkarılışını izlemeye gelin.",
            })}
            bullets={[
              t({ en: "Lead-free glazes, mixed in the studio", tr: "Kurşunsuz sırlar, atölyede karıştırılır" }),
              t({ en: "Seconds sold at 40% off on the first Saturday", tr: "Kusurlu parçalar her ayın ilk cumartesi %40 indirimli" }),
              t({ en: "Wheel classes for two, Thursday evenings", tr: "Perşembe akşamları iki kişilik torna dersi" }),
            ]}
            media={{ ...photos.maker, alt: t(photos.maker.alt) }}
            aspect="4:5"
          />
          <Testimonials
            {...common}
            variant="carousel"
            eyebrow={t({ en: "From the order notes", tr: "Sipariş notlarından" })}
            title={t({ en: "Kept on the *table*, not the shelf", tr: "Rafta değil, *sofrada*" })}
            items={[
              { quote: t({ en: "I bought one morning cup to try. Six months later the whole family drinks from them and nobody touches the old mugs.", tr: "Denemek için bir sabah fincanı aldım. Altı ay sonra bütün aile onlardan içiyor, eski kupalara kimse dokunmuyor." }), author: "Selin Arıkan", role: t({ en: "Moda", tr: "Moda" }), rating: 5, source: "direct", date: "2026-11-02" },
              { quote: t({ en: "A plate arrived chipped. I sent a photo at 9 pm and a new one was posted the next morning.", tr: "Bir tabak çatlak geldi. Akşam 9’da fotoğraf attım, ertesi sabah yenisi kargodaydı." }), author: "Tom Reilly", role: t({ en: "Dublin", tr: "Dublin" }), rating: 5, source: "direct", date: "2026-10-18" },
              { quote: t({ en: "The sea-salt glaze is quieter than the photos, in the best way. They stack perfectly.", tr: "Deniz tuzu sır fotoğraflardan daha sakin, en iyi anlamda. Kusursuz üst üste duruyorlar." }), author: "Defne Kaya", role: t({ en: "Ankara", tr: "Ankara" }), rating: 5, source: "direct", date: "2026-10-09" },
              { quote: t({ en: "Went to the Saturday open studio and left with a moon vase and clay under my nails.", tr: "Cumartesi açık atölyeye gittim; bir ay vazo ve tırnaklarımda kille döndüm." }), author: "Mert Özkan", role: t({ en: "Üsküdar", tr: "Üsküdar" }), rating: 5, source: "direct", date: "2026-09-27" },
            ]}
          />
          <Cta
            {...common}
            anchor="delivery"
            variant="newsletter"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Twice a month", tr: "Ayda iki kez" })}
            title={t({ en: "Hear when the *kiln* opens", tr: "*Fırın* açılınca haber alın" })}
            lead={t({
              en: "One email per firing, the evening before it goes on sale — so you see new glazes before they sell out. Delivery: 2–4 working days in Türkiye, 6–10 worldwide; returns within 14 days.",
              tr: "Her pişirimde, satışa çıkmadan önceki akşam bir e-posta — yeni sırları tükenmeden görürsünüz. Kargo: Türkiye içi 2–4, yurt dışı 6–10 iş günü; 14 gün içinde iade.",
            })}
            newsletter={{
              action: "/newsletter",
              placeholder: "you@example.com",
              buttonLabel: t({ en: "Notify me", tr: "Haber ver" }),
              consent: t({ en: "No more than two emails a month. Unsubscribe in one click.", tr: "Ayda en fazla iki e-posta. Tek tıkla ayrılın." }),
            }}
          />
        </SiteShellPage>

        <SiteShellPage id="shop" title={t({ en: "Shop — Kilnhouse", tr: "Mağaza — Kilnhouse" })}>
          <ShopPage />
        </SiteShellPage>

        <SiteShellPage id="product" title={t({ en: "Product — Kilnhouse", tr: "Ürün — Kilnhouse" })}>
          <ProductPage />
        </SiteShellPage>

        <SiteShellPage id="checkout" title={t({ en: "Check out — Kilnhouse", tr: "Ödeme — Kilnhouse" })}>
          <CheckoutPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Kilnhouse", href: home() }}
        about={t({ en: "Small-batch stoneware, thrown and glazed in Kuzguncuk since 2019.", tr: "2019’dan beri Kuzguncuk’ta çekilip sırlanan küçük seri taşkil." })}
        columns={[
          { title: t({ en: "Shop", tr: "Mağaza" }), links: [{ href: sitePageHref("shop"), label: t({ en: "All pieces", tr: "Tüm parçalar" }) }, { href: home("new"), label: t({ en: "New this week", tr: "Bu hafta yeni" }) }, { href: "/gift-cards", label: t({ en: "Gift cards", tr: "Hediye kartı" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("delivery"), label: t({ en: "Delivery", tr: "Kargo" }) }, { href: "/returns", label: t({ en: "Returns & breakage", tr: "İade ve kırılma" }) }, { href: "/care", label: t({ en: "Caring for stoneware", tr: "Taşkil bakımı" }) }] },
          { title: t({ en: "Studio", tr: "Atölye" }), links: [{ href: home("studio"), label: t({ en: "Open Saturdays", tr: "Cumartesi açık" }) }, { href: "/classes", label: t({ en: "Wheel classes", tr: "Torna dersleri" }) }, { href: "/wholesale", label: t({ en: "Cafés & wholesale", tr: "Kafe ve toptan" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: "Fırın Sokak 12, Kuzguncuk, 34674 Üsküdar / İstanbul" }}
        social={[{ network: "instagram", href: "https://instagram.com/kilnhouse.example" }]}
        legalLinks={[
          { href: "/terms", label: t({ en: "Terms of sale", tr: "Satış sözleşmesi" }) },
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
          { href: "/withdrawal", label: t({ en: "Right of withdrawal", tr: "Cayma hakkı" }) },
        ]}
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
