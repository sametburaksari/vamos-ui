import { ComparisonTable, Cta, Faq, Footer, LogoStrip, Navbar, PageIntro, PricingTable, Testimonials } from "@vamos-ui/react/blocks";
import { copyFor, customerLogos, frontDesk, USD } from "./content";
import type { SiteLocale } from "./locale-switch";

/** One language version of the pricing page. Server component: every block is plain props. */
export function PricingPage({ locale }: { locale: SiteLocale }) {
  const { t, img, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const perMonth = (n: number) => t({ en: `$${n} / month`, tr: `$${n} / ay` });

  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <Navbar
        {...common}
        variant="rail"
        sticky
        wordmark="Relay"
        homeHref="/"
        currentPath="/pricing"
        items={[
          { label: t({ en: "Product", tr: "Ürün" }), href: "/product" },
          { label: t({ en: "Customers", tr: "Müşteriler" }), href: "/customers" },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: "/pricing" },
          { label: t({ en: "Guides", tr: "Rehberler" }), href: "/docs" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: "/login", label: t({ en: "Sign in", tr: "Giriş yap" }) }, style: "secondary" },
          { link: { href: "/signup", label: t({ en: "Try free", tr: "Ücretsiz dene" }) }, style: "primary" },
        ]}
      />

      <main id="content">
        <PageIntro
          {...common}
          variant="simple"
          breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: "/" }, { label: t({ en: "Pricing", tr: "Fiyatlar" }) }]}
          title={t({ en: "Pay per *location*. Everyone else is free.", tr: "*Şube* başına ödeyin. Ekip ücretsiz." })}
          lead={t({ en: "Unlimited seats on every plan, because the person on the evening shift needs the inbox as much as the manager does.", tr: "Her pakette sınırsız kullanıcı; çünkü akşam vardiyasındaki kişinin de gelen kutusuna müdür kadar ihtiyacı var." })}
        />

        <PricingTable
          {...common}
          variant="columns"
          theme={{ rhythm: "tight" }}
          billing="both"
          defaultPeriod="yearly"
          yearlySaving={t({ en: "2 months free", tr: "2 ay bedava" })}
          taxNote={t({ en: "Prices in US dollars, excluding 20% VAT. Billed in lira at the day’s rate.", tr: "Fiyatlar ABD doları cinsindendir, %20 KDV hariçtir. Günün kuruyla TL faturalanır." })}
          footnote={t({ en: "Yearly plans are billed once, up front. Cancel within 14 days for a full refund; after that, plans run to the end of the period.", tr: "Yıllık paketler peşin faturalanır. 14 gün içinde iptalde tam iade; sonrasında paket dönem sonuna kadar sürer." })}
          plans={[
            {
              name: "Solo",
              description: t({ en: "One location, one WhatsApp number.", tr: "Tek şube, tek WhatsApp numarası." }),
              price: { monthly: USD("29"), yearly: USD("290") },
              features: [
                { text: t({ en: "1 location", tr: "1 şube" }) },
                { text: t({ en: "WhatsApp, Instagram and forms", tr: "WhatsApp, Instagram ve formlar" }) },
                { text: t({ en: "Message history", tr: "Mesaj geçmişi" }), note: t({ en: "30 days", tr: "30 gün" }) },
                { text: t({ en: "Assignments and notes", tr: "Atama ve notlar" }), included: false },
                { text: t({ en: "Reply-time reports", tr: "Yanıt süresi raporları" }), included: false },
              ],
              cta: { link: { href: "/signup?plan=solo", label: t({ en: "Start with Solo", tr: "Solo ile başla" }) }, style: "secondary" },
            },
            {
              name: "Team",
              description: t({ en: "A busy venue with a front desk.", tr: "Resepsiyonu olan yoğun bir mekân." }),
              price: { monthly: USD("79"), yearly: USD("790") },
              highlight: t({ en: "Most chosen", tr: "En çok tercih edilen" }),
              features: [
                { text: t({ en: "Up to 3 locations", tr: "3 şubeye kadar" }) },
                { text: t({ en: "WhatsApp, Instagram and forms", tr: "WhatsApp, Instagram ve formlar" }) },
                { text: t({ en: "Message history", tr: "Mesaj geçmişi" }), note: t({ en: "Unlimited", tr: "Sınırsız" }) },
                { text: t({ en: "Assignments and notes", tr: "Atama ve notlar" }) },
                { text: t({ en: "Reply-time reports", tr: "Yanıt süresi raporları" }) },
              ],
              cta: { link: { href: "/signup?plan=team", label: t({ en: "Start with Team", tr: "Team ile başla" }) }, style: "primary" },
            },
            {
              name: "Group",
              description: t({ en: "Several brands or many branches.", tr: "Birden çok marka ya da çok sayıda şube." }),
              price: { monthly: USD("249"), yearly: USD("2490"), from: true },
              features: [
                { text: t({ en: "Unlimited locations", tr: "Sınırsız şube" }) },
                { text: t({ en: "Everything in Team", tr: "Team’deki her şey" }) },
                { text: t({ en: "SSO and audit log", tr: "SSO ve denetim kaydı" }) },
                { text: t({ en: "A named account manager", tr: "Size özel müşteri temsilcisi" }) },
              ],
              cta: { link: { href: "/contact?topic=group", label: t({ en: "Talk to sales", tr: "Satışla görüşün" }) }, style: "secondary" },
            },
          ]}
        />

        <LogoStrip {...common} variant="row" theme={{ surface: "surface-2", rhythm: "tight" }} caption={t({ en: "1,900 teams answer from Relay", tr: "1.900 ekip Relay’den yanıtlıyor" })} logos={customerLogos.slice(0, 6)} />

        <ComparisonTable
          {...common}
          eyebrow={t({ en: "Compare", tr: "Karşılaştır" })}
          title={t({ en: "Every plan, *line by line*", tr: "Tüm paketler, *satır satır*" })}
          columns={[
            { name: "Solo", note: perMonth(29), cta: { link: { href: "/signup?plan=solo", label: t({ en: "Start", tr: "Başla" }) }, style: "secondary" } },
            { name: "Team", note: perMonth(79), highlight: true, cta: { link: { href: "/signup?plan=team", label: t({ en: "Start", tr: "Başla" }) }, style: "primary" } },
            { name: "Group", note: t({ en: "From $249 / month", tr: "$249 / ay’dan başlayan" }), cta: { link: { href: "/contact?topic=group", label: t({ en: "Talk to sales", tr: "Satışla görüşün" }) }, style: "secondary" } },
          ]}
          groups={[
            {
              title: t({ en: "Inbox", tr: "Gelen kutusu" }),
              rows: [
                { feature: t({ en: "Locations", tr: "Şubeler" }), values: ["1", t({ en: "Up to 3", tr: "3’e kadar" }), t({ en: "Unlimited", tr: "Sınırsız" })] },
                { feature: t({ en: "Seats", tr: "Kullanıcılar" }), values: [t({ en: "Unlimited", tr: "Sınırsız" }), t({ en: "Unlimited", tr: "Sınırsız" }), t({ en: "Unlimited", tr: "Sınırsız" })] },
                { feature: "WhatsApp Business", values: [true, true, true] },
                { feature: t({ en: "Instagram and Facebook messages", tr: "Instagram ve Facebook mesajları" }), values: [true, true, true] },
                { feature: t({ en: "Message history", tr: "Mesaj geçmişi" }), values: [t({ en: "30 days", tr: "30 gün" }), t({ en: "Unlimited", tr: "Sınırsız" }), t({ en: "Unlimited", tr: "Sınırsız" })] },
              ],
            },
            {
              title: t({ en: "Teamwork", tr: "Ekip çalışması" }),
              rows: [
                { feature: t({ en: "Assignments and internal notes", tr: "Atama ve iç notlar" }), values: [false, true, true] },
                { feature: t({ en: "Quiet-hours auto-reply", tr: "Sessiz saat otomatik yanıtı" }), hint: t({ en: "Tells guests when you’ll answer, based on your opening hours.", tr: "Çalışma saatlerinize göre misafire ne zaman yanıt vereceğinizi söyler." }), values: [true, true, true] },
                { feature: t({ en: "Reply-time reports", tr: "Yanıt süresi raporları" }), values: [false, true, true] },
                { feature: t({ en: "Booking sync with vRest or Google Calendar", tr: "vRest veya Google Takvim ile rezervasyon senkronu" }), values: [false, true, true] },
              ],
            },
            {
              title: t({ en: "Account", tr: "Hesap" }),
              rows: [
                { feature: t({ en: "Single sign-on", tr: "Tek oturum açma (SSO)" }), values: [false, false, true] },
                { feature: t({ en: "Audit log", tr: "Denetim kaydı" }), hint: t({ en: "Who replied, reassigned or deleted what, and when.", tr: "Kim neyi ne zaman yanıtladı, devretti ya da sildi." }), values: [false, t({ en: "30 days", tr: "30 gün" }), t({ en: "1 year", tr: "1 yıl" })] },
                { feature: t({ en: "Signed DPA and KVKK commitment", tr: "İmzalı DPA ve KVKK taahhüdü" }), values: [true, true, true] },
                { feature: t({ en: "Account manager", tr: "Müşteri temsilcisi" }), values: [null, null, true] },
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
              quote: t({ en: "We pay for two branches and nineteen people use it. Nobody has to share a login any more.", tr: "İki şube için ödüyoruz ve on dokuz kişi kullanıyor. Artık kimse şifre paylaşmak zorunda değil." }),
              author: "Ayşe Korkmaz",
              role: t({ en: "Clinic manager", tr: "Klinik müdürü" }),
              company: "Lena Clinic",
              logo: customerLogos[2]!.image,
            },
          ]}
        />

        <Faq
          {...common}
          variant="split"
          eyebrow={t({ en: "Billing", tr: "Faturalama" })}
          title={t({ en: "Questions about *paying*", tr: "*Ödeme* hakkında sorular" })}
          contact={{ link: { href: "/contact?topic=billing", label: t({ en: "Ask the billing team", tr: "Faturalama ekibine sorun" }) }, style: "link" }}
          items={[
            { q: t({ en: "What counts as a location?", tr: "Şube neye denir?" }), a: t({ en: "One address with its own opening hours and WhatsApp number. A restaurant with a separate bar number is still one location.", tr: "Kendi çalışma saatleri ve WhatsApp numarası olan tek bir adres. Ayrı bar numarası olan bir restoran yine tek şubedir." }) },
            { q: t({ en: "Can I pay in Turkish lira?", tr: "Türk lirasıyla ödeyebilir miyim?" }), a: t({ en: "Yes. Turkish companies are invoiced in lira at the Central Bank selling rate on the invoice date, with an e-Arşiv invoice.", tr: "Evet. Türk şirketlerine fatura tarihindeki Merkez Bankası satış kuru üzerinden TL ve e-Arşiv faturası kesilir." }) },
            { q: t({ en: "What happens if we go over three locations on Team?", tr: "Team’de üç şubeyi aşarsak ne olur?" }), a: t({ en: "Nothing breaks. We’ll write to suggest Group, and you have 30 days to decide.", tr: "Hiçbir şey bozulmaz. Group’u önermek için yazarız; karar vermek için 30 gününüz olur." }) },
            { q: t({ en: "Do you offer discounts for non-profits?", tr: "Dernek ve vakıflara indirim var mı?" }), a: t({ en: "Yes — 50% off Team for registered associations and foundations. Send us your registry number.", tr: "Evet — kayıtlı dernek ve vakıflara Team’de %50 indirim. Sicil numaranızı gönderin." }) },
          ]}
          deepLink={false}
        />

        <Cta
          {...common}
          variant="split"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Not sure which plan?", tr: "Hangi paket emin değil misiniz?" })}
          title={t({ en: "Start on Team. *Downgrade* any month.", tr: "Team ile başlayın. İstediğiniz ay *düşürün*." })}
          lead={t({ en: "The trial includes every Team feature for 14 days, no card needed.", tr: "Deneme 14 gün boyunca tüm Team özelliklerini içerir, kart gerekmez." })}
          actions={[
            { link: { href: "/signup?plan=team", label: t({ en: "Try free for 14 days", tr: "14 gün ücretsiz deneyin" }) }, style: "primary" },
            { link: { href: "/demo", label: t({ en: "Book a demo", tr: "Demo talep edin" }) }, style: "secondary" },
          ]}
          media={img(frontDesk)}
        />
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Relay", href: "/" }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Terms", tr: "Koşullar" }) }, { href: "/dpa", label: "DPA" }]}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/relay-inbox" }]}
        year={2026}
      />
    </div>
  );
}
