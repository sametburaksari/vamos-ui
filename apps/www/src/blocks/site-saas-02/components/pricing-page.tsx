import { ComparisonTable, Container, Faq, PageIntro, PricingTable, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, USD, type SiteLocale } from "./content";
import { CostEstimator } from "./cost-estimator";

/** Pricing: plans as rows, the estimator, the full comparison and billing questions. */
export function PricingPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const yes = true;
  const no = false;

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Plumbline", href: sitePageHref("home") }, { label: t({ en: "Pricing", tr: "Fiyatlar" }) }]}
        title={t({ en: "Pay for *editors*. Viewers are free.", tr: "*Editörler* için ödeyin. İzleyiciler ücretsiz." })}
        lead={t({ en: "Everyone who only reads charts and digests costs nothing, on every plan. Data scanned above the allowance is billed at cost.", tr: "Yalnızca grafik ve özet okuyan herkes, her pakette ücretsizdir. Kotanın üstünde taranan veri maliyetine faturalanır." })}
        meta={[
          { label: t({ en: "Trial", tr: "Deneme" }), value: t({ en: "Business free for 21 days", tr: "Business 21 gün ücretsiz" }) },
          { label: t({ en: "Billing", tr: "Faturalama" }), value: t({ en: "Monthly or yearly, in USD or TRY", tr: "Aylık ya da yıllık, USD veya TL" }) },
          { label: t({ en: "Contract", tr: "Sözleşme" }), value: t({ en: "Cancel any month", tr: "Her ay iptal edilebilir" }) },
        ]}
      />

      <PricingTable
        {...common}
        anchor="plans"
        variant="columns"
        billing="both"
        yearlySaving={t({ en: "2 months free", tr: "2 ay bedava" })}
        taxNote={t({ en: "Per editor per month. Prices exclude 20% VAT.", tr: "Editör başına aylık. Fiyatlara %20 KDV dahil değildir." })}
        footnote={t({ en: "Extra data scanned: $0.04 per GB on Team and Business. Yearly plans are billed up front; cancel within 14 days for a full refund.", tr: "Ek taranan veri: Team ve Business’ta GB başına 0,04 $. Yıllık paketler peşin faturalanır; 14 gün içinde iptalde tam iade." })}
        plans={[
          {
            name: "Free",
            description: t({ en: "A founder and an analyst, one database.", tr: "Bir kurucu ve bir analist, tek veritabanı." }),
            price: { monthly: USD("0"), yearly: USD("0") },
            features: [{ text: t({ en: "3 editors, unlimited viewers", tr: "3 editör, sınırsız izleyici" }) }, { text: t({ en: "1 connection, 50 GB scanned", tr: "1 bağlantı, 50 GB tarama" }) }, { text: t({ en: "Weekly digest", tr: "Haftalık özet" }) }, { text: t({ en: "Anomaly alerts", tr: "Anomali uyarıları" }), included: false }],
            cta: { link: { href: "/signup?plan=free", label: t({ en: "Start free", tr: "Ücretsiz başlayın" }) }, style: "secondary" },
          },
          {
            name: "Team",
            description: t({ en: "A data person plus the managers who ask.", tr: "Bir veri uzmanı ve soru soran yöneticiler." }),
            price: { monthly: USD("24"), yearly: USD("240") },
            highlight: t({ en: "Most teams", tr: "Çoğu ekip" }),
            features: [{ text: t({ en: "Up to 25 editors", tr: "25 editöre kadar" }) }, { text: t({ en: "5 connections, 500 GB scanned", tr: "5 bağlantı, 500 GB tarama" }) }, { text: t({ en: "Metric layer and alerts", tr: "Metrik katmanı ve uyarılar" }) }, { text: t({ en: "Embeds with signed URLs", tr: "İmzalı adresli gömme" }) }],
            cta: { link: { href: "/signup?plan=team", label: t({ en: "Try Team", tr: "Team’i deneyin" }) }, style: "primary" },
          },
          {
            name: "Business",
            description: t({ en: "Several teams, access rules, audits.", tr: "Birden çok ekip, erişim kuralları, denetim." }),
            price: { monthly: USD("49"), yearly: USD("490") },
            features: [{ text: t({ en: "Unlimited editors and connections", tr: "Sınırsız editör ve bağlantı" }) }, { text: t({ en: "2 TB scanned", tr: "2 TB tarama" }) }, { text: t({ en: "Row-level access, SSO, audit log", tr: "Satır düzeyi erişim, SSO, denetim kaydı" }) }, { text: t({ en: "Private network link", tr: "Özel ağ bağlantısı" }) }],
            cta: { link: { href: "/contact?topic=business", label: t({ en: "Talk to us", tr: "Bizimle görüşün" }) }, style: "secondary" },
          },
        ]}
      />

      <Section anchor="estimate" headingId="pl-estimator-title" theme={{ surface: "surface-2" }}>
        <Container size="wide">
          <CostEstimator />
        </Container>
      </Section>

      <ComparisonTable
        {...common}
        anchor="compare"
        eyebrow={t({ en: "Every line", tr: "Her satır" })}
        title={t({ en: "Compare the plans", tr: "Paketleri karşılaştırın" })}
        columns={[
          { name: "Free", note: t({ en: "$0", tr: "0 $" }) },
          { name: "Team", note: t({ en: "$24 / editor", tr: "Editör başı 24 $" }), highlight: true },
          { name: "Business", note: t({ en: "$49 / editor", tr: "Editör başı 49 $" }) },
        ]}
        groups={[
          {
            title: t({ en: "Data", tr: "Veri" }),
            rows: [
              { feature: t({ en: "Connections", tr: "Bağlantılar" }), values: ["1", "5", t({ en: "Unlimited", tr: "Sınırsız" })] },
              { feature: t({ en: "Data scanned per month", tr: "Aylık taranan veri" }), hint: t({ en: "Cached results are free", tr: "Önbellek sonuçları ücretsiz" }), values: ["50 GB", "500 GB", "2 TB"] },
              { feature: t({ en: "Result cache", tr: "Sonuç önbelleği" }), values: [t({ en: "1 hour", tr: "1 saat" }), t({ en: "24 hours", tr: "24 saat" }), t({ en: "Custom", tr: "Özel" })] },
              { feature: t({ en: "Incremental aggregates", tr: "Artımlı toplamlar" }), values: [no, yes, yes] },
            ],
          },
          {
            title: t({ en: "Analysis", tr: "Analiz" }),
            rows: [
              { feature: t({ en: "Metric layer", tr: "Metrik katmanı" }), values: [t({ en: "10 metrics", tr: "10 metrik" }), yes, yes] },
              { feature: t({ en: "Anomaly alerts", tr: "Anomali uyarıları" }), values: [no, yes, yes] },
              { feature: t({ en: "Drill to rows and CSV export", tr: "Satıra inme ve CSV" }), values: [yes, yes, yes] },
              { feature: t({ en: "Embeds", tr: "Gömme" }), values: [no, yes, yes] },
            ],
          },
          {
            title: t({ en: "Security", tr: "Güvenlik" }),
            rows: [
              { feature: "SSO (SAML, OIDC)", values: [no, no, yes] },
              { feature: t({ en: "Row-level access rules", tr: "Satır düzeyi erişim kuralları" }), values: [no, no, yes] },
              { feature: t({ en: "Audit log", tr: "Denetim kaydı" }), values: [no, t({ en: "30 days", tr: "30 gün" }), t({ en: "400 days", tr: "400 gün" })] },
              { feature: t({ en: "KVKK / GDPR data processing agreement", tr: "KVKK / GDPR veri işleme sözleşmesi" }), values: [yes, yes, yes] },
            ],
          },
        ]}
      />

      <Faq
        {...common}
        anchor="billing-faq"
        variant="split"
        eyebrow={t({ en: "Billing", tr: "Faturalama" })}
        title={t({ en: "Money questions", tr: "Para soruları" })}
        deepLink={false}
        items={[
          { q: t({ en: "Who counts as an editor?", tr: "Kim editör sayılır?" }), a: t({ en: "Anyone who saved a query, a chart or a metric in the billing month. Reading, filtering and exporting are free.", tr: "Fatura ayı içinde bir sorgu, grafik ya da metrik kaydeden herkes. Okumak, filtrelemek ve dışa aktarmak ücretsizdir." }) },
          { q: t({ en: "Can we pay in Turkish lira?", tr: "Türk lirasıyla ödeyebilir miyiz?" }), a: t({ en: "Yes. TRY invoices use the central bank’s selling rate on the invoice date, and we issue an e-invoice.", tr: "Evet. TL faturalar fatura tarihindeki Merkez Bankası satış kuruyla kesilir ve e-fatura düzenleriz." }) },
          { q: t({ en: "What if we go over the scan allowance?", tr: "Tarama kotasını aşarsak ne olur?" }), a: t({ en: "Queries keep running. You get an e-mail at 80% and 100%, and the extra is billed at $0.04 per GB at month end. You can set a hard cap.", tr: "Sorgular çalışmaya devam eder. %80 ve %100’de e-posta alırsınız; fazlası ay sonunda GB başına 0,04 $ faturalanır. Kesin bir üst sınır koyabilirsiniz." }) },
          { q: t({ en: "Is there a discount for non-profits and schools?", tr: "Dernek ve okullara indirim var mı?" }), a: t({ en: "Team is free for registered non-profits and public schools. Write to us with your registration number.", tr: "Kayıtlı dernekler ve devlet okulları için Team ücretsizdir. Kayıt numaranızla bize yazın." }) },
        ]}
      />
    </>
  );
}
