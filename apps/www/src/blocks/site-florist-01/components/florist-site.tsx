import { Container, Footer, Navbar, PageIntro, Section, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { BouquetsGrid } from "./bouquets-page";
import { copyFor, CUTOFF, EMAIL, ISSUE, PHONE, shop, type SiteLocale } from "./content";
import { FloristHome } from "./home";
import { OrderForm } from "./order-form";

export const floristPages = ["home", "bouquets", "order"];
const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of Petal & Stem: navbar, three pages (home, bouquets, order) and footer.
 * Server component; SiteShell in page.tsx picks page and language.
 */
export function FloristSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="font-display text-[1.35rem] leading-none tracking-[-0.02em] text-fg">
            Petal <em className="text-accent-ink">&amp;</em> Stem
          </span>
        }
        homeHref={home()}
        phone={PHONE}
        items={[
          { label: t({ en: "Bouquets", tr: "Buketler" }), href: sitePageHref("bouquets") },
          { label: t({ en: "This week", tr: "Bu hafta" }), href: home("edit") },
          { label: t({ en: "Subscriptions", tr: "Abonelik" }), href: home("subscribe") },
          { label: t({ en: "Delivery", tr: "Teslimat" }), href: home("delivery") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("order"), label: t({ en: "Send flowers", tr: "Çiçek gönder" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Petal & Stem — florist in Kuzguncuk", tr: "Petal & Stem — Kuzguncuk’ta çiçekçi" })}>
          <FloristHome c={c} />
        </SiteShellPage>

        <SiteShellPage id="bouquets" title={t({ en: "Bouquets — Petal & Stem", tr: "Buketler — Petal & Stem" })}>
          <PageIntro
            {...common}
            variant="ruled"
            theme={{ rhythm: "tight" }}
            breadcrumb={[{ label: "Petal & Stem", href: home() }, { label: t({ en: "Bouquets", tr: "Buketler" }) }]}
            eyebrow={t({ en: `Issue ${ISSUE.no} · until Saturday`, tr: `Sayı ${ISSUE.no} · cumartesiye kadar` })}
            title={t({ en: "Eight bouquets, *no roses*", tr: "Sekiz buket, *gül yok*" })}
            lead={t({ en: "Three from this week’s market, five that we make all year. Every one is hand-tied, wrapped in paper and comes with a card we write for you.", tr: "Üçü bu haftanın halinden, beşi yıl boyunca yaptıklarımız. Hepsi elle bağlanır, kâğıda sarılır ve sizin için yazdığımız bir kartla gelir." })}
            meta={[
              { label: t({ en: "Same day", tr: "Aynı gün" }), value: t({ en: `Order by ${CUTOFF}`, tr: `${CUTOFF}’e kadar` }) },
              { label: t({ en: "Sizes", tr: "Boyutlar" }), value: t({ en: "9 · 15 · 25 stems", tr: "9 · 15 · 25 dal" }) },
            ]}
          />
          <Section anchor="all" theme={{ rhythm: "tight" }} className="pt-0 pb-24">
            <Container size="wide">
              <BouquetsGrid locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="order" title={t({ en: "Send flowers — Petal & Stem", tr: "Çiçek gönder — Petal & Stem" })}>
          <PageIntro
            {...common}
            variant="simple"
            theme={{ rhythm: "tight" }}
            breadcrumb={[{ label: "Petal & Stem", href: home() }, { label: t({ en: "Send flowers", tr: "Çiçek gönder" }) }]}
            title={t({ en: "Send *flowers*", tr: "*Çiçek* gönderin" })}
            lead={t({ en: "Pick a day, write the card, tell us where. We’ll send you a photo before it leaves the shop.", tr: "Günü seçin, kartı yazın, adresi söyleyin. Dükkândan çıkmadan önce size fotoğrafını göndereceğiz." })}
          />
          <Section anchor="order-form" theme={{ rhythm: "tight" }} className="pt-0 pb-24">
            <Container size="wide">
              <OrderForm locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Petal & Stem", href: home() }}
        about={t({ en: "Seasonal flowers from the Monday market, tied in Kuzguncuk since 2018. No red roses, no foam, no plastic.", tr: "2018’den beri Kuzguncuk’ta bağlanan, pazartesi halinden mevsim çiçekleri. Kırmızı gül, sünger ve plastik yok." })}
        columns={[
          { title: t({ en: "Flowers", tr: "Çiçekler" }), links: [{ href: sitePageHref("bouquets"), label: t({ en: "All bouquets", tr: "Tüm buketler" }) }, { href: home("edit"), label: t({ en: "This week’s edit", tr: "Haftanın seçkisi" }) }, { href: home("subscribe"), label: t({ en: "Subscriptions", tr: "Abonelik" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("delivery"), label: t({ en: "Delivery areas", tr: "Teslimat bölgeleri" }) }, { href: home("faq"), label: t({ en: "Questions", tr: "Sorular" }) }, { href: home("shop"), label: t({ en: "Visit the shop", tr: "Dükkâna gelin" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE, address: shop(t).address }}
        social={[{ network: "instagram", href: "https://instagram.com/petalandstem.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms of sale", tr: "Satış koşulları" }) }]}
        year={2026}
      />
    </>
  );
}
