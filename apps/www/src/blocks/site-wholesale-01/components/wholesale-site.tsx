import { Button, LocaleProvider, Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { AnnouncementBar, Container, Cta, Faq, Footer, MediaText, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref, Steps, Testimonials } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ArrowRight } from "lucide-react";
import { CataloguePage } from "./catalogue-page";
import { ADDRESS, copyFor, EMAIL, faqItems, PHONE, photos, TIER_MIN, tierNames, tierRange, zones, type SiteLocale } from "./content";
import { CategoryIndex, HeroLabel } from "./home-parts";
import { QuoteCount } from "./quote-provider";
import { QuotePage } from "./quote-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const catalogue = sitePageHref("catalogue");
const quote = sitePageHref("quote");

/** Average saving of each tier against the case price, across the catalogue. */
const TIER_OFF = [0, 8, 17, 25];

/** The mark: a crate seen from the end, two slats. */
function CrateMark() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="16" height="14" />
      <path d="M2 8.5h16M2 12.5h16" />
    </svg>
  );
}

/**
 * One language version of Crate & Co. Supply: announcement, navbar with the live quote count,
 * three pages (home, catalogue, quote) and the footer. Server component; the quote list lives in
 * QuoteProvider (page.tsx), above the locale switch.
 */
export function WholesaleSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };

  const site = (
    <>
      <AnnouncementBar
        {...common}
        tone="neutral"
        variant="centered"
        text={t({ en: "Order by 15:00 on a working day — it leaves Tuzla the same afternoon.", tr: "İş günlerinde 15:00’e kadar verilen sipariş aynı öğleden sonra Tuzla’dan çıkar." })}
        link={{ href: home("delivery"), label: t({ en: "Delivery zones", tr: "Teslimat bölgeleri" }) }}
      />
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display text-[15px] font-bold tracking-[0.02em] uppercase">
            <CrateMark />
            Crate &amp; Co.
            <span className="hidden font-mono text-[10.5px] font-normal tracking-[0.12em] text-fg-muted sm:inline">Supply</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Catalogue", tr: "Katalog" }), href: catalogue },
          { label: t({ en: "Price tiers", tr: "Fiyat kademeleri" }), href: home("tiers") },
          { label: t({ en: "Trade account", tr: "Ticari hesap" }), href: home("account") },
          { label: t({ en: "Delivery", tr: "Teslimat" }), href: home("delivery") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: quote, label: <QuoteCount label={t({ en: "Quote", tr: "Teklif" })} /> }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Crate & Co. Supply — packaging and shipping supplies, wholesale", tr: "Crate & Co. Supply — toptan ambalaj ve kargo malzemeleri" })}>
          {/* Hero: the promise on the left, a live price-check label on the right. */}
          <Section headingId="cc-hero-title" theme={{ rhythm: "tight" }} className="!pt-8 lg:!pt-12">
            <Container size="wide">
              <div className="grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-7">
                  <p className="font-mono text-[11.5px] tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Packaging wholesale · Tuzla, İstanbul · since 2011", tr: "Toptan ambalaj · Tuzla, İstanbul · 2011’den beri" })}</p>
                  <h1 id="cc-hero-title" className="font-display text-[clamp(2.6rem,7.2vw,5.4rem)] leading-[0.92] font-bold tracking-[-0.045em] text-balance text-fg">
                    {t({ en: "Boxes by the pallet.", tr: "Kutular paletle." })}
                    <span className="block text-accent-ink">{t({ en: "Priced by the case.", tr: "Fiyatlar koliyle." })}</span>
                  </h1>
                  <p className="max-w-[34rem] text-lead text-fg-muted">
                    {t({
                      en: "Cartons, mailers, paper bags, tape and labels for online shops, roasters and makers. Order one case or two hundred — the price on every line drops as the count goes up, and you see it before you ask.",
                      tr: "Online mağazalar, kavurucular ve üreticiler için koli, kargo kutusu, kâğıt çanta, bant ve etiket. Bir koli de alın iki yüz de — her satırın fiyatı adet arttıkça düşer ve bunu sormadan görürsünüz.",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="primary" size="lg" className="rounded-[3px]">
                      <a href={catalogue}>
                        {t({ en: "Browse the catalogue", tr: "Kataloğa göz at" })}
                        <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                      </a>
                    </Button>
                    <Button asChild variant="secondary" size="lg" className="rounded-[3px]">
                      <a href={quote}>{t({ en: "Request a quote", tr: "Teklif iste" })}</a>
                    </Button>
                  </div>
                  <dl className="mt-2 grid grid-cols-3 border-y-2 border-fg">
                    {[
                      { v: f.number(1140), l: t({ en: "SKUs on the shelf", tr: "Raftaki ürün" }) },
                      { v: "15:00", l: t({ en: "Same-day cut-off", tr: "Aynı gün son saat" }) },
                      { v: t({ en: "1 case", tr: "1 koli" }), l: t({ en: "Minimum order", tr: "En az sipariş" }) },
                    ].map((m, i) => (
                      <div key={i} className={`flex flex-col-reverse gap-1 py-4 ${i > 0 ? "border-s border-line ps-4" : ""}`}>
                        <dt className="text-[12.5px] leading-snug text-fg-muted">{m.l}</dt>
                        <dd className="tabular font-display text-[clamp(1.35rem,3vw,2rem)] leading-none font-bold tracking-[-0.03em] text-fg">{m.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <HeroLabel />
              </div>
            </Container>
          </Section>

          {/* Category index */}
          <Section anchor="catalogue" headingId="cc-cat-title">
            <Container size="wide">
              <SectionHeader
                headingId="cc-cat-title"
                align="split"
                index="01"
                eyebrow={t({ en: "The catalogue", tr: "Katalog" })}
                title={t({ en: "Six aisles, *1,140 SKUs*", tr: "Altı koridor, *1.140 ürün*" })}
                lead={t({ en: "The lowest pallet price per category, ex VAT. Pick a row to open the catalogue on that aisle.", tr: "Kategori başına en düşük palet fiyatı, KDV hariç. Bir satıra tıklayın, katalog o koridorda açılsın." })}
              />
              <div className="mt-10">
                <CategoryIndex />
              </div>
            </Container>
          </Section>

          {/* Tiers explained — a dark band, stacked crates per tier. */}
          <Section anchor="tiers" headingId="cc-tiers-title" theme={{ mode: "dark", surface: "surface" }}>
            <Container size="wide">
              <SectionHeader
                headingId="cc-tiers-title"
                align="split"
                index="02"
                eyebrow={t({ en: "Price tiers", tr: "Fiyat kademeleri" })}
                title={t({ en: "Four prices per product. *No haggling, no account needed.*", tr: "Ürün başına dört fiyat. *Pazarlık yok, hesap gerekmez.*" })}
                lead={t({ en: "Tiers count whole cases of one product on one order. Average saving against the case price, across the catalogue:", tr: "Kademeler tek siparişte aynı üründen alınan tam koliyle sayılır. Katalog genelinde koli fiyatına göre ortalama indirim:" })}
              />
              <ol className="mt-12 grid gap-px border-2 border-fg bg-fg sm:grid-cols-2 lg:grid-cols-4" role="list">
                {TIER_MIN.map((min, i) => (
                  <li key={min} className="flex flex-col gap-5 bg-surface p-5 lg:p-6">
                    <div aria-hidden className="flex h-16 flex-wrap-reverse content-start items-end gap-[3px]">
                      {Array.from({ length: [1, 3, 7, 14][i]! }).map((_, k) => (
                        <span key={k} className={`h-[18px] w-[26px] border-[1.5px] ${i === 3 ? "border-accent bg-accent/25" : "border-fg-muted"}`} />
                      ))}
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-[1.4rem] font-semibold tracking-[-0.02em] text-fg">{t(tierNames[i]!)}</h3>
                      <span className="tabular font-mono text-small text-fg-muted">
                        {tierRange(i)} {t({ en: "cases", tr: "koli" })}
                      </span>
                    </div>
                    <p className="tabular font-display text-[3rem] leading-none font-bold tracking-[-0.04em] text-accent-ink">{i === 0 ? t({ en: "List", tr: "Liste" }) : `−${f.number(TIER_OFF[i]!)}%`}</p>
                    <p className="text-small text-fg-muted">
                      {t(
                        [
                          { en: "Try a size, restock a gap. Same price for walk-ins and accounts.", tr: "Bir ölçüyü deneyin, eksik kapatın. Gelen müşteriye de hesaplıya da aynı fiyat." },
                          { en: "A month of mailers for a small shop. Ships in one go, on our van.", tr: "Küçük bir mağazanın bir aylık kargo kutusu. Tek seferde, kendi aracımızla." },
                          { en: "Half a pallet, shrink-wrapped. Mix cases within one product family.", tr: "Yarım palet, streçli. Aynı ürün ailesinde koli karıştırılabilir." },
                          { en: "Full pallet, delivered by tail-lift. Contract prices from 500 cases.", tr: "Tam palet, liftli araçla teslim. 500 koliden sözleşmeli fiyat." },
                        ][i]!,
                      )}
                    </p>
                  </li>
                ))}
              </ol>
            </Container>
          </Section>

          <MediaText
            {...common}
            anchor="warehouse"
            variant="side"
            eyebrow={t({ en: "03 · The warehouse", tr: "03 · Depo" })}
            title={t({ en: "18,000 m² in Tuzla, *forty pallets out a day*", tr: "Tuzla’da 18.000 m², *günde kırk palet*" })}
            body={t({
              en: "Everything in the catalogue is on our own racks — no drop-shipping, no “usually ships in”. Stock is counted twice a day, so the number on a product is the number on the shelf.\n\nOur two vans cover both sides of Istanbul every working day; pallets go out with a tail-lift truck.",
              tr: "Katalogdaki her şey kendi raflarımızda — dropshipping yok, “genelde şu sürede” yok. Stok günde iki kez sayılır; üründe gördüğünüz sayı raftaki sayıdır.\n\nİki aracımız her iş günü İstanbul’un iki yakasını dolaşır; paletler liftli kamyonla çıkar.",
            })}
            bullets={[
              t({ en: "Dispatch before 15:00, Monday to Friday", tr: "Pazartesi–cuma 15:00’e kadar sevk" }),
              t({ en: "Collection counter open Saturday 09:00–13:00", tr: "Teslim alma bankosu cumartesi 09:00–13:00 açık" }),
              t({ en: "Sealed cases returnable within 30 days", tr: "Açılmamış koliler 30 gün içinde iade" }),
            ]}
            media={{ ...photos.aisle, alt: t(photos.aisle.alt) }}
            aspect="4:5"
            mediaSide="start"
          />

          <Steps
            {...common}
            anchor="account"
            variant="horizontal"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "04 · Trade account", tr: "04 · Ticari hesap" })}
            title={t({ en: "Thirty-day terms in *three steps*", tr: "Üç adımda *30 gün vade*" })}
            lead={t({ en: "Optional. Order without one; open one when you want terms and saved price lists.", tr: "İsteğe bağlı. Hesapsız da sipariş verebilirsiniz; vade ve kayıtlı fiyat listesi isteyince açın." })}
            steps={[
              { title: t({ en: "Send your tax certificate", tr: "Vergi levhanızı gönderin" }), text: t({ en: "A PDF of the vergi levhası and your trading address. Takes two minutes on the quote form.", tr: "Vergi levhasının PDF’i ve ticari adresiniz. Teklif formunda iki dakika sürer." }), duration: t({ en: "2 min", tr: "2 dk" }) },
              { title: t({ en: "We check and call", tr: "Kontrol edip ararız" }), text: t({ en: "Ece or Baran from the trade desk calls you, agrees a credit limit and your delivery days.", tr: "Ticari masadan Ece veya Baran sizi arar, kredi limitini ve teslim günlerinizi belirler." }), duration: t({ en: "1 working day", tr: "1 iş günü" }) },
              { title: t({ en: "Order on terms", tr: "Vadeli sipariş verin" }), text: t({ en: "One invoice a month (e-Fatura), payment 30 days after. Your price list is saved for repeat orders.", tr: "Ayda tek fatura (e-Fatura), ödeme 30 gün sonra. Fiyat listeniz tekrar siparişler için kayıtlı." }), duration: t({ en: "From the next order", tr: "Sonraki siparişten" }) },
            ]}
            actions={[{ link: { href: quote, label: t({ en: "Start with a quote", tr: "Teklifle başlayın" }) }, style: "primary" }]}
          />

          <Testimonials
            {...common}
            variant="wall"
            eyebrow={t({ en: "05 · Buyers", tr: "05 · Alıcılar" })}
            title={t({ en: "Who reorders, *and why*", tr: "Kim tekrar sipariş veriyor, *neden*" })}
            items={[
              { quote: t({ en: "We ship 600 orders a week. The A4 mailer at the Half-pallet price is the only reason our margins survived this year.", tr: "Haftada 600 sipariş gönderiyoruz. A4 kargo kutusunun yarım palet fiyatı, bu yıl kâr marjımızın ayakta kalmasının tek sebebi." }), author: "Duygu Ersoy", role: t({ en: "Operations, Bahar Kitabevi (online books)", tr: "Operasyon, Bahar Kitabevi (online kitap)" }) },
              { quote: t({ en: "I order paper bags at 14:40 and they are at the roastery before 11:00 the next day. That is the whole review.", tr: "Kâğıt çantaları 14:40’ta sipariş ediyorum, ertesi gün 11:00’den önce kavurmahanede. Yorumum bu kadar." }), author: "Levent Akın", role: t({ en: "Owner, Kuzey Kahve Kavurucuları", tr: "Sahibi, Kuzey Kahve Kavurucuları" }) },
              { quote: t({ en: "The tier ladder on the quote made the decision for us — we saw we were six cases off the Stack price and rounded up.", tr: "Teklifteki kademe merdiveni kararı bizim yerimize verdi — İstif fiyatına altı koli kaldığını görüp yuvarladık." }), author: "Sena Bilgin", role: t({ en: "Buyer, Atölye Dokuma (textiles)", tr: "Satın alma, Atölye Dokuma (tekstil)" }) },
            ]}
          />

          {/* Delivery zones */}
          <Section anchor="delivery" headingId="cc-delivery-title">
            <Container size="wide">
              <SectionHeader
                headingId="cc-delivery-title"
                align="split"
                index="06"
                eyebrow={t({ en: "Delivery", tr: "Teslimat" })}
                title={t({ en: "Where it goes, and *when*", tr: "Nereye gider, *ne zaman*" })}
                lead={t({ en: "Times are for stock items ordered before 15:00 on a working day.", tr: "Süreler, iş günü 15:00’ten önce sipariş edilen stok ürünleri içindir." })}
              />
              <TableContainer className="mt-10 border-y-2 border-fg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t({ en: "Zone", tr: "Bölge" })}</TableHead>
                      <TableHead>{t({ en: "Arrives", tr: "Varış" })}</TableHead>
                      <TableHead>{t({ en: "Minimum", tr: "En az" })}</TableHead>
                      <TableHead>{t({ en: "Cost", tr: "Ücret" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zones.map((z, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-fg">{t(z.zone)}</TableCell>
                        <TableCell>{t(z.when)}</TableCell>
                        <TableCell>{t(z.minimum)}</TableCell>
                        <TableCell className="tabular">{t(z.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Container>
          </Section>

          <Faq
            {...common}
            anchor="faq"
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "07 · Questions", tr: "07 · Sorular" })}
            title={t({ en: "Before you *order*", tr: "Sipariş *öncesi*" })}
            items={faqItems.map((q) => ({ q: t(q.q), a: t(q.a) }))}
            contact={{ link: { href: `mailto:${EMAIL}`, label: t({ en: "Email the trade desk", tr: "Ticari masaya yazın" }) }, style: "link" }}
          />

          <Cta
            {...common}
            variant="band"
            theme={{ surface: "accent" }}
            title={t({ en: "Send a list. *Get prices by 16:30.*", tr: "Listenizi gönderin. *Fiyatlar 16:30’da elinizde.*" })}
            lead={t({ en: "Paste SKUs or describe what you ship — the trade desk replies within two working hours.", tr: "Stok kodlarını yapıştırın ya da ne gönderdiğinizi anlatın — ticari masa iki iş saati içinde döner." })}
            actions={[
              { link: { href: quote, label: t({ en: "Request a quote", tr: "Teklif iste" }) }, style: "primary" },
              { link: { href: `tel:${PHONE}`, label: "+90 216 000 00 00" }, style: "secondary" },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="catalogue" title={t({ en: "Catalogue — Crate & Co. Supply", tr: "Katalog — Crate & Co. Supply" })}>
          <CataloguePage />
        </SiteShellPage>

        <SiteShellPage id="quote" title={t({ en: "Request a quote — Crate & Co. Supply", tr: "Teklif iste — Crate & Co. Supply" })}>
          <QuotePage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Crate & Co. Supply", href: home() }}
        about={t({ en: "Packaging and shipping supplies, wholesale. Tuzla, İstanbul, since 2011.", tr: "Toptan ambalaj ve kargo malzemeleri. Tuzla, İstanbul, 2011’den beri." })}
        columns={[
          { title: t({ en: "Catalogue", tr: "Katalog" }), links: [{ href: catalogue, label: t({ en: "All products", tr: "Tüm ürünler" }) }, { href: home("tiers"), label: t({ en: "Price tiers", tr: "Fiyat kademeleri" }) }, { href: "/printed-boxes", label: t({ en: "Printed boxes", tr: "Baskılı kutular" }) }] },
          { title: t({ en: "Trade", tr: "Ticari" }), links: [{ href: home("account"), label: t({ en: "Trade account", tr: "Ticari hesap" }) }, { href: quote, label: t({ en: "Request a quote", tr: "Teklif iste" }) }, { href: home("delivery"), label: t({ en: "Delivery zones", tr: "Teslimat bölgeleri" }) }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: home("warehouse"), label: t({ en: "The warehouse", tr: "Depo" }) }, { href: "/careers", label: t({ en: "Careers", tr: "Kariyer" }) }, { href: "/sustainability", label: t({ en: "Recycled content", tr: "Geri dönüştürülmüş içerik" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: ADDRESS }}
        legalLinks={[
          { href: "/terms", label: t({ en: "Terms of sale", tr: "Satış koşulları" }) },
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
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
