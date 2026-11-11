import { Button, LocaleProvider } from "@vamos-ui/react";
import { ComparisonTable, Container, Cta, Faq, FeatureGrid, Footer, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref, Testimonials } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ArrowDown } from "lucide-react";
import { CountUp } from "@vamos-ui/react/motion";
import { CheckoutPage } from "./checkout-page";
import { copyFor, EMAIL, faqItems, licences, PHONE, templates, type SiteLocale } from "./content";
import { HeroPreview, TemplateGrid } from "./home-parts";
import { ProductPage } from "./product-page";
import { CartLabel } from "./shop-provider";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** The mark: a 2 × 2 grid with one cell filled. */
function GridMark() {
  return (
    <span aria-hidden className="grid size-[18px] grid-cols-2 gap-[2px]">
      <span className="rounded-[2px] bg-accent" />
      <span className="rounded-[2px] border-[1.5px] border-fg" />
      <span className="rounded-[2px] border-[1.5px] border-fg" />
      <span className="rounded-[2px] border-[1.5px] border-fg" />
    </span>
  );
}

/**
 * One language version of Gridwork Templates: navbar with the cart, three pages (home, product,
 * checkout) and the footer. Server component; the cart and selected template live in ShopProvider.
 */
export function DigitalSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, usd, intl, labels } = c;
  const common = { locale: intl, labels };
  const sold = templates.reduce((n, x) => n + x.sales, 0);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-[-0.02em]">
            <GridMark />
            Gridwork
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Templates", tr: "Şablonlar" }), href: home("templates") },
          { label: t({ en: "Licences", tr: "Lisanslar" }), href: home("licences") },
          { label: t({ en: "What’s inside", tr: "İçinde ne var" }), href: home("inside") },
          { label: "FAQ", href: home("faq") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("checkout"), label: <CartLabel label={t({ en: "Cart", tr: "Sepet" })} /> }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Gridwork — templates you can try before you buy", tr: "Gridwork — satın almadan deneyebileceğiniz şablonlar" })}>
          <Section headingId="gw-hero-title" theme={{ rhythm: "tight" }} className="!pt-4 [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px]">
            <Container size="wide">
              <div className="grid gap-x-12 gap-y-6 pt-4 pb-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:pt-12">
                <div className="flex flex-col gap-5">
                  <p className="vm-enter inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-3 py-1 font-mono text-[11.5px] text-fg-muted">
                    <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                    {t({ en: "6 templates · 63 pages · built on Vamos UI", tr: "6 şablon · 63 sayfa · Vamos UI ile" })}
                  </p>
                  <h1 id="gw-hero-title" className="vm-enter [--vm-i:1] font-display text-[clamp(2.7rem,7.5vw,6rem)] leading-[0.9] font-semibold tracking-[-0.05em] text-balance text-fg">
                    {t({ en: "Try the template", tr: "Şablonu" })} <em className="text-accent-ink not-italic">{t({ en: "before", tr: "satın almadan" })}</em> {t({ en: "you buy it.", tr: "deneyin." })}
                  </h1>
                </div>
                <div className="vm-enter flex flex-col gap-5 [--vm-i:2] lg:pb-2">
                  <p className="text-lead text-fg-muted">
                    {t({
                      en: "Every preview here is the template itself, running. Switch pages, devices, dark mode, accent and fonts — what you see is what the code does after you download it.",
                      tr: "Buradaki her önizleme şablonun kendisi, çalışır hâlde. Sayfayı, cihazı, koyu modu, vurguyu ve yazı tiplerini değiştirin — gördüğünüz, indirdikten sonra kodun yaptığı şeydir.",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="primary" size="lg" className="vm-press">
                      <a href={home("templates")}>
                        {t({ en: "Browse templates", tr: "Şablonlara göz at" })}
                        <ArrowDown aria-hidden />
                      </a>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="vm-press">
                      <a href={home("licences")}>{t({ en: "How licences work", tr: "Lisanslar nasıl işler" })}</a>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="vm-enter [--vm-i:3]">
                <HeroPreview />
              </div>
              <dl className="vm-enter tabular mt-8 grid [--vm-i:4] grid-cols-2 gap-y-4 border-t border-line pt-5 text-small sm:grid-cols-4">
                {[
                  [<CountUp key="s" value={sold} locale={intl} />, t({ en: "licences sold", tr: "satılan lisans" })],
                  [usd(licences[0]!.price), t({ en: "personal licence", tr: "kişisel lisans" })],
                  [<CountUp key="m" value={12} locale={intl} duration={900} />, t({ en: "months of updates included", tr: "ay güncelleme dahil" })],
                  [<CountUp key="d" value={14} locale={intl} duration={900} />, t({ en: "day refund window", tr: "gün iade süresi" })],
                ].map(([v, l]) => (
                  <div key={String(l)} className="flex flex-row-reverse items-baseline justify-end gap-2">
                    <dt className="text-fg-muted">{l}</dt>
                    <dd className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-fg">{v}</dd>
                  </div>
                ))}
              </dl>
            </Container>
          </Section>

          <Section anchor="templates" headingId="gw-templates-title">
            <Container size="wide">
              <SectionHeader
                headingId="gw-templates-title"
                align="split"
                eyebrow={t({ en: "The shelf", tr: "Raf" })}
                title={t({ en: "Six templates, *each one live*", tr: "Altı şablon, *her biri canlı*" })}
                lead={t({ en: "The thumbnails are rendered, not exported. Open one to switch pages, devices and themes.", tr: "Küçük resimler dışa aktarılmadı, çiziliyor. Sayfa, cihaz ve temaları değiştirmek için birini açın." })}
              />
              <div className="mt-10">
                <TemplateGrid />
              </div>
            </Container>
          </Section>

          <FeatureGrid
            {...common}
            anchor="inside"
            variant="list"
            numbered
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "What’s inside", tr: "İçinde ne var" })}
            title={t({ en: "Source you would *write yourself*", tr: "*Kendiniz yazacağınız* kaynak kod" })}
            items={[
              { title: t({ en: "Plain React, no page builder", tr: "Düz React, sayfa oluşturucu yok" }), text: t({ en: "Next.js App Router pages and components in TypeScript. Delete what you do not need.", tr: "TypeScript ile Next.js App Router sayfaları ve bileşenleri. İhtiyacınız olmayanı silin." }) },
              { title: t({ en: "Tokens, not hex codes", tr: "Hex kodu değil, token" }), text: t({ en: "Colours, radius, density and fonts come from Vamos UI tokens, which is why the preview can switch them.", tr: "Renk, köşe, yoğunluk ve yazı tipleri Vamos UI token’larından gelir; önizlemenin bunları değiştirebilmesinin sebebi bu." }) },
              { title: t({ en: "Accessible by default", tr: "Varsayılan olarak erişilebilir" }), text: t({ en: "Landmarks, focus states and keyboard paths checked with axe and by hand on every release.", tr: "Yer işaretleri, odak durumları ve klavye yolları her sürümde axe ile ve elle kontrol edilir." }) },
              { title: t({ en: "Two languages already", tr: "Şimdiden iki dil" }), text: t({ en: "English and Turkish strings in one file per page; dates and money through Intl.", tr: "Sayfa başına tek dosyada İngilizce ve Türkçe metinler; tarih ve para Intl ile." }) },
            ]}
          />

          <ComparisonTable
            {...common}
            anchor="licences"
            variant="table"
            eyebrow={t({ en: "Licences", tr: "Lisanslar" })}
            title={t({ en: "Pay once, per template", tr: "Şablon başına, bir kez ödeyin" })}
            lead={t({ en: "Prices exclude VAT. Upgrade later for the difference.", tr: "Fiyatlara KDV dahil değildir. Sonradan farkı ödeyerek yükseltin." })}
            columns={licences.map((l) => ({ name: t(l.name), note: usd(l.price), highlight: l.id === "team" }))}
            groups={[
              {
                title: t({ en: "Use", tr: "Kullanım" }),
                rows: [
                  { feature: t({ en: "People", tr: "Kişi" }), values: ["1", t({ en: "Up to 8", tr: "8’e kadar" }), t({ en: "Up to 20", tr: "20’ye kadar" })] },
                  { feature: t({ en: "Your own projects", tr: "Kendi projeleriniz" }), values: [true, true, true] },
                  { feature: t({ en: "Client work", tr: "Müşteri işi" }), values: [false, true, true] },
                  { feature: t({ en: "Inside a product you sell", tr: "Sattığınız bir ürünün içinde" }), hint: t({ en: "SaaS, themes, starter kits", tr: "SaaS, tema, başlangıç kitleri" }), values: [false, false, true] },
                ],
              },
              {
                title: t({ en: "Support", tr: "Destek" }),
                rows: [
                  { feature: t({ en: "Updates", tr: "Güncellemeler" }), values: [t({ en: "12 months", tr: "12 ay" }), t({ en: "12 months", tr: "12 ay" }), t({ en: "Lifetime", tr: "Ömür boyu" })] },
                  { feature: t({ en: "Email support", tr: "E-posta desteği" }), values: [t({ en: "2 working days", tr: "2 iş günü" }), t({ en: "1 working day", tr: "1 iş günü" }), t({ en: "Same day", tr: "Aynı gün" })] },
                ],
              },
            ]}
          />

          <Testimonials
            {...common}
            variant="feature"
            theme={{ surface: "surface-2" }}
            items={[
              {
                quote: t({
                  en: "I switched Ledger to our accent and Plex in the preview, showed the client the link, and we bought the Team licence in the same call. The code matched the preview line for line.",
                  tr: "Önizlemede Ledger’ı kendi vurgu rengimize ve Plex’e çevirdim, bağlantıyı müşteriye gösterdim ve Ekip lisansını aynı görüşmede aldık. Kod, önizlemeyle satır satır aynıydı.",
                }),
                author: "Nadia Korkmaz",
                role: t({ en: "Front-end lead", tr: "Ön yüz lideri" }),
                company: "Brightloom",
              },
            ]}
          />

          <Faq {...common} anchor="faq" variant="stacked" eyebrow="FAQ" title={t({ en: "Before you *download*", tr: "İndirmeden *önce*" })} items={faqItems.map((q) => ({ q: t(q.q), a: t(q.a) }))} />

          <Cta
            {...common}
            variant="newsletter"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "One email a month", tr: "Ayda bir e-posta" })}
            title={t({ en: "A new template *every month*", tr: "*Her ay* yeni bir şablon" })}
            lead={t({ en: "Next up, 2 December: Tally — a booking and invoicing app for small studios.", tr: "Sıradaki, 2 Aralık: Tally — küçük stüdyolar için randevu ve fatura uygulaması." })}
            newsletter={{
              action: "/newsletter",
              placeholder: "you@example.com",
              buttonLabel: t({ en: "Tell me", tr: "Haber ver" }),
              consent: t({ en: "Monthly. Unsubscribe in one click.", tr: "Aylık. Tek tıkla ayrılın." }),
            }}
          />
        </SiteShellPage>

        <SiteShellPage id="product" title={t({ en: "Template — Gridwork", tr: "Şablon — Gridwork" })}>
          <ProductPage />
        </SiteShellPage>

        <SiteShellPage id="checkout" title={t({ en: "Checkout — Gridwork", tr: "Ödeme — Gridwork" })}>
          <CheckoutPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Gridwork Templates", href: home() }}
        about={t({ en: "Website and dashboard templates built on Vamos UI. Made by three people in Kadıköy.", tr: "Vamos UI ile yapılmış web sitesi ve panel şablonları. Kadıköy’de üç kişi tarafından." })}
        columns={[
          { title: t({ en: "Templates", tr: "Şablonlar" }), links: templates.slice(0, 4).map((x) => ({ href: home("templates"), label: x.name })) },
          { title: t({ en: "Buying", tr: "Satın alma" }), links: [{ href: home("licences"), label: t({ en: "Licences", tr: "Lisanslar" }) }, { href: "/refunds", label: t({ en: "Refunds", tr: "İadeler" }) }, { href: "/invoices", label: t({ en: "Invoices & VAT", tr: "Fatura ve KDV" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("faq"), label: "FAQ" }, { href: "/docs", label: t({ en: "Setup guide", tr: "Kurulum rehberi" }) }, { href: `mailto:${EMAIL}`, label: t({ en: "Email us", tr: "Bize yazın" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        legalLinks={[
          { href: "/licence-terms", label: t({ en: "Licence terms", tr: "Lisans koşulları" }) },
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
    <LocaleProvider locale="en-US">{site}</LocaleProvider>
  );
}
