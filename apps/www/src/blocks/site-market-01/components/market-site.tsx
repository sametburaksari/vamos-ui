import { LocaleProvider } from "@vamos-ui/react";
import { Container, Cta, Faq, Footer, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref, StatsBand, Steps } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { copyFor, EMAIL, fill, PHONE, sellers, type SiteLocale } from "./content";
import { CategoryRow, HeroCollage, HeroSearch, NewRail, TopMakers } from "./home-parts";
import { SearchPage } from "./search-page";
import { SellerPage } from "./seller-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const search = sitePageHref("search");

/** The mark: three stalls in a row, the middle one raised. */
function RowMark() {
  return (
    <span aria-hidden className="flex h-[18px] items-end gap-[3px]">
      <span className="h-[11px] w-[6px] rounded-t-[2px] bg-fg" />
      <span className="h-[18px] w-[6px] rounded-t-[2px] bg-accent" />
      <span className="h-[11px] w-[6px] rounded-t-[2px] bg-fg" />
    </span>
  );
}

/**
 * One language version of Makersrow: navbar, three pages (home, search results, seller) and the
 * footer. Server component; filters, the open seller and saved items live in MarketProvider.
 */
export function MarketSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };
  const reviewTotal = sellers.reduce((n, s) => n + s.reviews, 0);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 text-[17px] font-bold tracking-[-0.03em]">
            <RowMark />
            makersrow
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Browse", tr: "Gezin" }), href: search },
          { label: t({ en: "Makers", tr: "Üreticiler" }), href: home("makers") },
          { label: t({ en: "How it works", tr: "Nasıl işler" }), href: home("how") },
          { label: t({ en: "Sell on Makersrow", tr: "Makersrow’da satın" }), href: home("sell") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("sell"), label: t({ en: "Open a shop", tr: "Dükkân aç" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Makersrow — buy from independent makers, rated by real buyers", tr: "Makersrow — gerçek alıcıların puanladığı bağımsız üreticilerden alın" })}>
          <Section headingId="mr-hero-title" theme={{ rhythm: "tight" }} className="!pt-8">
            <Container size="wide">
              <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-6">
                  <p className="text-small font-medium text-accent-ink">{t({ en: "1,240 makers · 81 provinces · every one rated", tr: "1.240 üretici · 81 il · her biri puanlı" })}</p>
                  <h1 id="mr-hero-title" className="text-[clamp(2.4rem,6.4vw,4.75rem)] leading-[0.98] font-bold tracking-[-0.045em] text-balance text-fg">
                    {t({ en: "Made by hand. Rated by the people who bought it.", tr: "Elde yapıldı. Alanlar puanladı." })}
                  </h1>
                  <p className="max-w-[36rem] text-lead text-fg-muted">
                    {t({
                      en: "Furniture, leather, ceramics, lamps and wool straight from the workshop. Every maker shows their real rating, how often they ship on time and how fast they reply — before you pay.",
                      tr: "Mobilya, deri, seramik, lamba ve yün doğrudan atölyeden. Her üretici gerçek puanını, ne sıklıkla zamanında kargoladığını ve ne kadar hızlı yanıt verdiğini ödeme yapmadan önce gösterir.",
                    })}
                  </p>
                  <HeroSearch />
                </div>
                <HeroCollage />
              </div>
              <div className="mt-12">
                <CategoryRow />
              </div>
            </Container>
          </Section>

          <Section anchor="makers" headingId="mr-makers-title">
            <Container size="wide">
              <SectionHeader
                headingId="mr-makers-title"
                align="split"
                eyebrow={t({ en: "Highest rated this month", tr: "Bu ayın en yüksek puanlıları" })}
                title={t({ en: "Makers with the *receipts*", tr: "*Kanıtı olan* üreticiler" })}
                lead={fill(t({ en: "Ratings come only from completed orders — {n} reviews across the makers below. Tap a rating anywhere to see the breakdown.", tr: "Puanlar yalnızca tamamlanmış siparişlerden gelir — aşağıdaki üreticilerde {n} değerlendirme. Ayrıntı için herhangi bir puana dokunun." }), { n: f.number(reviewTotal) })}
              />
              <div className="mt-10">
                <TopMakers />
              </div>
            </Container>
          </Section>

          <Section anchor="new" headingId="mr-new-title" theme={{ surface: "surface-2" }}>
            <Container size="wide">
              <SectionHeader
                headingId="mr-new-title"
                align="split"
                eyebrow={t({ en: "Just listed", tr: "Yeni eklenenler" })}
                title={t({ en: "New this *week*", tr: "Bu *hafta* yeni" })}
                actions={
                  <a href={search} className="rounded-[2px] text-small font-medium text-accent-ink underline underline-offset-4 focus-ring">
                    {t({ en: "See all pieces", tr: "Tüm ürünler" })}
                  </a>
                }
              />
              <div className="mt-10">
                <NewRail />
              </div>
            </Container>
          </Section>

          <Steps
            {...common}
            anchor="how"
            variant="horizontal"
            eyebrow={t({ en: "How buying works", tr: "Alışveriş nasıl işler" })}
            title={t({ en: "Your money waits *until it arrives*", tr: "Paranız *ürün gelene kadar* bekler" })}
            steps={[
              { title: t({ en: "Pay Makersrow, not the maker", tr: "Üreticiye değil Makersrow’a ödeyin" }), text: t({ en: "Card or bank transfer. We hold the payment while the piece is made and shipped.", tr: "Kart veya havale. Ürün yapılıp kargolanırken ödemeyi biz tutarız." }), duration: t({ en: "At checkout", tr: "Ödemede" }) },
              { title: t({ en: "Track it from the workshop", tr: "Atölyeden itibaren takip edin" }), text: t({ en: "Makers post a dispatch photo and a tracking number. Late dispatch lowers their on-time score.", tr: "Üreticiler kargo fotoğrafı ve takip numarası paylaşır. Geç kargo, zamanında oranını düşürür." }), duration: t({ en: "1–10 days", tr: "1–10 gün" }) },
              { title: t({ en: "Confirm, then rate", tr: "Onaylayın, sonra puanlayın" }), text: t({ en: "The maker is paid when you confirm delivery. Your rating goes on their shop for the next buyer.", tr: "Teslimatı onayladığınızda üreticiye ödenir. Puanınız bir sonraki alıcı için dükkânında yer alır." }), duration: t({ en: "On delivery", tr: "Teslimde" }) },
            ]}
          />

          <StatsBand
            {...common}
            variant="ledger"
            theme={{ surface: "surface-2" }}
            items={[
              { value: 1240, label: t({ en: "makers selling", tr: "satış yapan üretici" }), source: t({ en: "November 2026", tr: "Kasım 2026" }) },
              { value: 4.7, label: t({ en: "average seller rating", tr: "ortalama satıcı puanı" }), source: t({ en: "Completed orders only", tr: "Yalnızca tamamlanan siparişler" }) },
              { value: 94, unit: "%", label: t({ en: "orders shipped on time", tr: "zamanında kargolanan sipariş" }), source: t({ en: "Last 12 months", tr: "Son 12 ay" }) },
              { value: "8%", label: t({ en: "commission, no listing fees", tr: "komisyon, ilan ücreti yok" }) },
            ]}
          />

          <Cta
            {...common}
            anchor="sell"
            variant="split"
            eyebrow={t({ en: "For makers", tr: "Üreticiler için" })}
            title={t({ en: "Sell what you make. *Keep 92%.*", tr: "Yaptığınızı satın. *%92’si sizin.*" })}
            lead={t({ en: "No listing fees, payouts every Friday, and a rating that belongs to you. Shops open within one working day after a short call.", tr: "İlan ücreti yok, her cuma ödeme ve size ait bir puan. Kısa bir görüşmeden sonra dükkânlar bir iş gününde açılır." })}
            actions={[
              { link: { href: "/sell", label: t({ en: "Open a shop", tr: "Dükkân aç" }) }, style: "primary" },
              { link: { href: "/sell/guide", label: t({ en: "Read the seller guide", tr: "Satıcı rehberini okuyun" }) }, style: "secondary" },
            ]}
          />

          <Faq
            {...common}
            anchor="faq"
            variant="columns"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Buying on *Makersrow*", tr: "*Makersrow*’da alışveriş" })}
            items={[
              { q: t({ en: "How is a seller rating calculated?", tr: "Satıcı puanı nasıl hesaplanır?" }), a: t({ en: "The average of every star rating from a completed order in the last 24 months. Makers cannot delete reviews; they can reply once.", tr: "Son 24 ayda tamamlanan her siparişin yıldız puanlarının ortalaması. Üreticiler değerlendirme silemez; bir kez yanıt verebilir." }) },
              { q: t({ en: "What does “Top maker” mean?", tr: "“Öne çıkan üretici” ne demek?" }), a: t({ en: "A rating of 4.8 or higher and at least 95% of orders dispatched on time, over the last 12 months. It is recalculated every Monday.", tr: "Son 12 ayda 4,8 veya üzeri puan ve siparişlerin en az %95’inin zamanında kargolanması. Her pazartesi yeniden hesaplanır." }) },
              { q: t({ en: "What if my order arrives broken?", tr: "Siparişim kırık gelirse?" }), a: t({ en: "Send a photo within 48 hours. The maker replaces it, or we refund you from the held payment.", tr: "48 saat içinde fotoğraf gönderin. Üretici yenisini gönderir ya da tutulan ödemeden iade ederiz." }) },
              { q: t({ en: "Do makers ship abroad?", tr: "Üreticiler yurt dışına gönderiyor mu?" }), a: t({ en: "About half do; it is shown on each piece. Duties are paid by the buyer.", tr: "Yaklaşık yarısı; her üründe belirtilir. Gümrük vergisini alıcı öder." }) },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="search" title={t({ en: "Search — Makersrow", tr: "Arama — Makersrow" })}>
          <SearchPage />
        </SiteShellPage>

        <SiteShellPage id="seller" title={t({ en: "Maker — Makersrow", tr: "Üretici — Makersrow" })}>
          <SellerPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Makersrow", href: home() }}
        about={t({ en: "A marketplace for independent makers in Türkiye. Payments held until delivery.", tr: "Türkiye’deki bağımsız üreticiler için bir pazar yeri. Ödemeler teslimata kadar tutulur." })}
        columns={[
          { title: t({ en: "Buy", tr: "Satın al" }), links: [{ href: search, label: t({ en: "All pieces", tr: "Tüm ürünler" }) }, { href: home("makers"), label: t({ en: "Top makers", tr: "Öne çıkan üreticiler" }) }, { href: "/gift-cards", label: t({ en: "Gift cards", tr: "Hediye kartı" }) }] },
          { title: t({ en: "Sell", tr: "Sat" }), links: [{ href: home("sell"), label: t({ en: "Open a shop", tr: "Dükkân aç" }) }, { href: "/sell/fees", label: t({ en: "Fees", tr: "Ücretler" }) }, { href: "/sell/guide", label: t({ en: "Seller guide", tr: "Satıcı rehberi" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("how"), label: t({ en: "How it works", tr: "Nasıl işler" }) }, { href: home("faq"), label: t({ en: "Questions", tr: "Sorular" }) }, { href: "/disputes", label: t({ en: "Problems with an order", tr: "Siparişle ilgili sorunlar" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: "Kuyu Sokak 7, 34710 Kadıköy / İstanbul" }}
        legalLinks={[
          { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) },
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
          { href: "/distance-sales", label: t({ en: "Distance sales agreement", tr: "Mesafeli satış sözleşmesi" }) },
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
    <LocaleProvider locale="en-GB">{site}</LocaleProvider>
  );
}
