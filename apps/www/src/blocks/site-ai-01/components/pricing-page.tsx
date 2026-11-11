import { ComparisonTable, Faq, PageIntro, PricingTable, sitePageHref } from "@vamos-ui/react/blocks";
import { EMAIL, faqPricing, USD, type Copy } from "./content";

/** Pricing: intro, three plans with a monthly/yearly switch, a feature comparison and billing FAQ. */
export function PricingPage({ c }: { c: Copy }) {
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: "Quill", href: sitePageHref("home") }, { label: t({ en: "Pricing", tr: "Fiyatlar" }) }]}
        eyebrow={t({ en: "Pricing", tr: "Fiyatlar" })}
        title={t({ en: "Pay per writer, *not* per word", tr: "Kelime başına *değil*, yazar başına ödeyin" })}
        lead={t({ en: "Start free. Move to Team when more than one person writes for the company. Seats nobody used are credited back.", tr: "Ücretsiz başlayın. Şirket adına birden fazla kişi yazınca Ekip paketine geçin. Kullanılmayan koltuklar iade edilir." })}
        meta={[
          { label: t({ en: "Trial", tr: "Deneme" }), value: t({ en: "Team, 14 days", tr: "Ekip, 14 gün" }) },
          { label: t({ en: "Card", tr: "Kart" }), value: t({ en: "Not needed to start", tr: "Başlamak için gerekmez" }) },
          { label: t({ en: "Training on your text", tr: "Metninizle eğitim" }), value: t({ en: "Never, any plan", tr: "Hiçbir pakette" }) },
        ]}
      />

      <PricingTable
        {...common}
        anchor="plans"
        billing="both"
        defaultPeriod="yearly"
        yearlySaving={t({ en: "2 months free", tr: "2 ay bedava" })}
        taxNote={t({ en: "Prices per seat, excluding VAT", tr: "Koltuk başı fiyatlar, KDV hariç" })}
        footnote={t({ en: "Yearly plans are billed once a year; we email the admin 14 days before renewal.", tr: "Yıllık paketler yılda bir faturalanır; yenilemeden 14 gün önce yöneticiye e-posta göndeririz." })}
        plans={[
          {
            name: t({ en: "Draft", tr: "Taslak" }),
            description: t({ en: "For one person trying it on real email.", tr: "Gerçek e-postalarda deneyen tek kişi için." }),
            price: { monthly: USD("0"), yearly: USD("0") },
            features: [
              { text: t({ en: "40 rewrites a month", tr: "Ayda 40 yeniden yazım" }) },
              { text: t({ en: "Plain, Warm and Brief tones", tr: "Sade, Sıcak ve Kısa tonlar" }) },
              { text: t({ en: "Browser extension", tr: "Tarayıcı eklentisi" }) },
              { text: t({ en: "House style guide", tr: "Kurum üslup kılavuzu" }), included: false },
            ],
            cta: { link: { href: "/signup", label: t({ en: "Start free", tr: "Ücretsiz başla" }) }, style: "secondary" },
          },
          {
            name: t({ en: "Team", tr: "Ekip" }),
            description: t({ en: "For teams that write to customers every day.", tr: "Her gün müşteriye yazan ekipler için." }),
            price: { monthly: USD("14"), yearly: USD("140") },
            highlight: t({ en: "Most teams start here", tr: "Çoğu ekip buradan başlar" }),
            features: [
              { text: t({ en: "Unlimited rewrites", tr: "Sınırsız yeniden yazım" }) },
              { text: t({ en: "House style guide and banned phrases", tr: "Kurum üslubu ve yasaklı ifadeler" }) },
              { text: t({ en: "All integrations and the API", tr: "Tüm entegrasyonlar ve API" }) },
              { text: t({ en: "Retention 0–30 days, you choose", tr: "0–30 gün saklama, seçim sizin" }) },
            ],
            cta: { link: { href: "/signup?plan=team", label: t({ en: "Try Team free for 14 days", tr: "Ekip’i 14 gün ücretsiz dene" }) }, style: "primary" },
          },
          {
            name: t({ en: "Organisation", tr: "Kurum" }),
            description: t({ en: "For 100+ writers, SSO and your own paperwork.", tr: "100+ yazar, SSO ve kendi sözleşmeleriniz için." }),
            custom: t({ en: "From $11 per seat", tr: "Koltuk başı 11 $’dan" }),
            features: [
              { text: t({ en: "SAML SSO and SCIM", tr: "SAML SSO ve SCIM" }) },
              { text: t({ en: "EU or US region lock", tr: "AB ya da ABD bölge kilidi" }) },
              { text: t({ en: "Audit log up to 7 years", tr: "7 yıla kadar denetim kaydı" }) },
              { text: t({ en: "Invoice in TRY, EUR or USD", tr: "TL, EUR ya da USD fatura" }) },
            ],
            cta: { link: { href: `mailto:${EMAIL}?subject=Organisation%20plan`, label: t({ en: "Talk to sales", tr: "Satışla görüşün" }) }, style: "secondary" },
          },
        ]}
      />

      <ComparisonTable
        {...common}
        anchor="compare"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Side by side", tr: "Yan yana" })}
        title={t({ en: "What’s in each plan", tr: "Hangi pakette ne var" })}
        columns={[
          { name: t({ en: "Draft", tr: "Taslak" }), note: t({ en: "Free", tr: "Ücretsiz" }) },
          { name: t({ en: "Team", tr: "Ekip" }), note: t({ en: "$140 / seat / year", tr: "Koltuk başı yıllık 140 $" }), highlight: true },
          { name: t({ en: "Organisation", tr: "Kurum" }), note: t({ en: "From $11 / seat / month", tr: "Koltuk başı aylık 11 $’dan" }) },
        ]}
        groups={[
          {
            title: t({ en: "Writing", tr: "Yazım" }),
            rows: [
              { feature: t({ en: "Rewrites", tr: "Yeniden yazım" }), values: [t({ en: "40 / month", tr: "Ayda 40" }), t({ en: "Unlimited", tr: "Sınırsız" }), t({ en: "Unlimited", tr: "Sınırsız" })] },
              { feature: t({ en: "Tones", tr: "Tonlar" }), values: ["3", t({ en: "3 + your own", tr: "3 + sizinkiler" }), t({ en: "3 + your own", tr: "3 + sizinkiler" })] },
              { feature: t({ en: "Rewrite between languages", tr: "Diller arası yazım" }), hint: t({ en: "7 languages", tr: "7 dil" }), values: [false, true, true] },
              { feature: t({ en: "House style guide", tr: "Kurum üslup kılavuzu" }), values: [false, true, true] },
            ],
          },
          {
            title: t({ en: "Data", tr: "Veri" }),
            rows: [
              { feature: t({ en: "Training on your text", tr: "Metninizle eğitim" }), values: [t({ en: "Never", tr: "Asla" }), t({ en: "Never", tr: "Asla" }), t({ en: "Never", tr: "Asla" })] },
              { feature: t({ en: "Text retention", tr: "Metin saklama" }), values: [t({ en: "None", tr: "Yok" }), t({ en: "0–30 days", tr: "0–30 gün" }), t({ en: "0–30 days or your bucket", tr: "0–30 gün ya da kendi depolamanız" })] },
              { feature: t({ en: "Region lock", tr: "Bölge kilidi" }), values: [false, false, true] },
            ],
          },
          {
            title: t({ en: "Admin", tr: "Yönetim" }),
            rows: [
              { feature: "SSO", values: [false, t({ en: "OIDC sign-in", tr: "OIDC ile giriş" }), "SAML + SCIM"] },
              { feature: t({ en: "Audit log", tr: "Denetim kaydı" }), values: [false, t({ en: "1 year", tr: "1 yıl" }), t({ en: "Up to 7 years", tr: "7 yıla kadar" })] },
              { feature: t({ en: "Support", tr: "Destek" }), values: [t({ en: "Help centre", tr: "Yardım merkezi" }), t({ en: "Email, 1 working day", tr: "E-posta, 1 iş günü" }), t({ en: "Named manager, 4 h", tr: "Atanmış yönetici, 4 sa" })] },
            ],
          },
        ]}
      />

      <Faq
        {...common}
        anchor="billing-faq"
        variant="split"
        eyebrow="FAQ"
        title={t({ en: "Billing, *in plain words*", tr: "Ödeme, *sade bir dille*" })}
        contact={{ link: { href: `mailto:${EMAIL}`, label: t({ en: "Email billing", tr: "Ödeme ekibine yazın" }) }, style: "link" }}
        items={faqPricing.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        deepLink={false}
      />
    </>
  );
}
