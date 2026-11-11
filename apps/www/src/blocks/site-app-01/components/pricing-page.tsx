import { ComparisonTable, Faq, PageIntro, PricingTable, sitePageHref } from "@vamos-ui/react/blocks";
import { faqPricing, USD, type Copy } from "./content";

/** Pricing: intro, three plans with a monthly/yearly switch, a feature comparison and billing FAQ. */
export function PricingPage({ c }: { c: Copy }) {
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  const download = sitePageHref("download");
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: "Tempo Run", href: sitePageHref("home") }, { label: t({ en: "Pricing", tr: "Fiyatlar" }) }]}
        eyebrow={t({ en: "Pricing", tr: "Fiyatlar" })}
        title={t({ en: "Free to run. *Pro* to train.", tr: "Koşmak ücretsiz. Antrenman *Pro*." })}
        lead={t({ en: "Tracking and the First 5K plan are free for good. Pro adds every plan, the voice coach and readiness.", tr: "Kayıt ve İlk 5K planı süresiz ücretsiz. Pro tüm planları, sesli koçu ve hazırlık skorunu ekler." })}
        meta={[
          { label: t({ en: "Trial", tr: "Deneme" }), value: t({ en: "14 days of Pro", tr: "14 gün Pro" }) },
          { label: t({ en: "Billing", tr: "Ödeme" }), value: t({ en: "Through the store", tr: "Mağaza üzerinden" }) },
          { label: t({ en: "Cancel", tr: "İptal" }), value: t({ en: "Any time, 2 taps", tr: "İstediğiniz an, 2 dokunuş" }) },
        ]}
      />

      <PricingTable
        {...common}
        anchor="plans"
        billing="both"
        defaultPeriod="yearly"
        yearlySaving={t({ en: "save 44%", tr: "%44 tasarruf" })}
        taxNote={t({ en: "Store prices include local VAT", tr: "Mağaza fiyatlarına yerel KDV dahildir" })}
        footnote={t({ en: "Charged by the App Store or Google Play. Yearly renews once a year; we email you 7 days before.", tr: "Ücreti App Store ya da Google Play alır. Yıllık paket yılda bir yenilenir; 7 gün önce e-posta göndeririz." })}
        plans={[
          {
            name: "Easy",
            description: t({ en: "Track runs and finish your first 5K.", tr: "Koşularınızı kaydedin, ilk 5K’nızı bitirin." }),
            price: { monthly: USD("0"), yearly: USD("0") },
            features: [
              { text: t({ en: "GPS tracking and splits", tr: "GPS kaydı ve ara süreler" }) },
              { text: t({ en: "First 5K plan", tr: "İlk 5K planı" }) },
              { text: t({ en: "Watch sync", tr: "Saat senkronu" }) },
              { text: t({ en: "Voice coach", tr: "Sesli koç" }), included: false },
            ],
            cta: { link: { href: download, label: t({ en: "Download free", tr: "Ücretsiz indir" }) }, style: "secondary" },
          },
          {
            name: "Pro",
            description: t({ en: "Every plan, the coach and readiness.", tr: "Tüm planlar, koç ve hazırlık skoru." }),
            price: { monthly: USD("8.99"), yearly: USD("59.99") },
            highlight: t({ en: "Most runners pick this", tr: "Çoğu koşucu bunu seçiyor" }),
            features: [
              { text: t({ en: "All plans, 5K to marathon", tr: "5K’dan maratona tüm planlar" }) },
              { text: t({ en: "Voice coach in EN and TR", tr: "İngilizce ve Türkçe sesli koç" }) },
              { text: t({ en: "Morning readiness", tr: "Sabah hazırlık skoru" }) },
              { text: t({ en: "Plan reshuffle", tr: "Plan kaydırma" }), note: t({ en: "moves missed sessions", tr: "kaçan antrenmanları taşır" }) },
            ],
            cta: { link: { href: download, label: t({ en: "Start 14 days free", tr: "14 gün ücretsiz başla" }) }, style: "primary" },
          },
          {
            name: "Crew",
            description: t({ en: "For run clubs and coaches, up to 25 runners.", tr: "Koşu kulüpleri ve koçlar için, 25 koşucuya kadar." }),
            price: { monthly: USD("24.99"), yearly: USD("239.99") },
            features: [
              { text: t({ en: "Pro for every member", tr: "Her üyeye Pro" }) },
              { text: t({ en: "Shared routes and group runs", tr: "Ortak rotalar ve grup koşuları" }) },
              { text: t({ en: "Coach dashboard on the web", tr: "Web’de koç paneli" }) },
              { text: t({ en: "Club leaderboard (opt-in)", tr: "Kulüp sıralaması (isteğe bağlı)" }) },
            ],
            cta: { link: { href: "mailto:crew@temporun.example.com", label: t({ en: "Set up a crew", tr: "Kulüp kur" }) }, style: "secondary" },
          },
        ]}
      />

      <ComparisonTable
        {...common}
        anchor="compare"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Side by side", tr: "Yan yana" })}
        title={t({ en: "What’s in each plan", tr: "Hangi pakette ne var" })}
        columns={[{ name: "Easy", note: t({ en: "Free", tr: "Ücretsiz" }) }, { name: "Pro", note: t({ en: "$59.99 / year", tr: "Yıllık 59,99 $" }), highlight: true }, { name: "Crew", note: t({ en: "$239.99 / year", tr: "Yıllık 239,99 $" }) }]}
        groups={[
          {
            title: t({ en: "Running", tr: "Koşu" }),
            rows: [
              { feature: t({ en: "GPS tracking, splits, maps", tr: "GPS kaydı, ara süreler, haritalar" }), values: [true, true, true] },
              { feature: t({ en: "Watch sync", tr: "Saat senkronu" }), hint: "watchOS 10+ · Wear OS 4+", values: [true, true, true] },
              { feature: t({ en: "Training plans", tr: "Antrenman planları" }), values: [t({ en: "First 5K", tr: "İlk 5K" }), t({ en: "All 14", tr: "14’ü de" }), t({ en: "All 14 + club plans", tr: "14’ü + kulüp planları" })] },
            ],
          },
          {
            title: t({ en: "Coaching", tr: "Koçluk" }),
            rows: [
              { feature: t({ en: "Voice coach", tr: "Sesli koç" }), values: [false, true, true] },
              { feature: t({ en: "Morning readiness", tr: "Sabah hazırlık skoru" }), values: [false, true, true] },
              { feature: t({ en: "Plan reshuffle", tr: "Plan kaydırma" }), values: [false, true, true] },
            ],
          },
          {
            title: t({ en: "Clubs", tr: "Kulüpler" }),
            rows: [
              { feature: t({ en: "Members", tr: "Üye" }), values: ["1", "1", t({ en: "up to 25", tr: "25’e kadar" })] },
              { feature: t({ en: "Coach dashboard", tr: "Koç paneli" }), values: [false, false, true] },
            ],
          },
        ]}
      />

      <Faq
        {...common}
        anchor="billing-faq"
        variant="split"
        eyebrow="FAQ"
        title={t({ en: "Billing, *plainly*", tr: "Ödeme, *açıkça*" })}
        contact={{ link: { href: "mailto:hello@temporun.example.com", label: t({ en: "Email support", tr: "Destek’e yazın" }) }, style: "link" }}
        items={faqPricing.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        deepLink={false}
      />
    </>
  );
}
