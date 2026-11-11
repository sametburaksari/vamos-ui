import { ComparisonTable, Container, Faq, PageIntro, PricingTable, Section } from "@vamos-ui/react/blocks";
import { copyFor, home, plans, SIGNUP_HREF, type SiteLocale } from "./content";
import { TrustBadges } from "./trust-badges";

/** Pricing: three plans with a monthly / yearly switch, the full comparison and fee questions. */
export function PricingPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const yes = true;
  const no = false;

  return (
    <>
      <PageIntro
        {...common}
        variant="simple"
        breadcrumb={[{ label: "Fernway", href: home() }, { label: t({ en: "Pricing", tr: "Fiyatlar" }) }]}
        eyebrow={t({ en: "Pricing", tr: "Fiyatlar" })}
        title={t({ en: "Plain prices, no small print", tr: "Açık fiyatlar, dipnot yok" })}
        lead={t({
          en: "Every plan has the same safeguarding, the same card and the same people on the phone. You pay for more pots, more people and better FX — and you can change plan on any day.",
          tr: "Her planda aynı koruma, aynı kart ve telefonda aynı insanlar var. Daha fazla kumbara, daha fazla kişi ve daha iyi kur için ödersiniz — planı istediğiniz gün değiştirebilirsiniz.",
        })}
      />

      <PricingTable
        {...common}
        variant="columns"
        billing="both"
        defaultPeriod="yearly"
        anchor="plans"
        yearlySaving={t({ en: "2 months free", tr: "2 ay bedava" })}
        plans={plans.map((p) => ({
          name: t(p.name),
          description: t(p.description),
          price: { monthly: { amount: p.monthly, currency: "TRY" }, yearly: { amount: p.yearly, currency: "TRY" } },
          highlight: p.highlight ? t(p.highlight) : undefined,
          features: p.features.map((x) => ({ text: t(x) })),
          cta: { link: { href: SIGNUP_HREF, label: p.monthly === "0" ? t({ en: "Open for free", tr: "Ücretsiz açın" }) : t({ en: "Start a 30-day trial", tr: "30 günlük denemeyi başlatın" }) }, style: p.highlight ? "primary" : "secondary" },
        }))}
        taxNote={t({ en: "Prices include VAT (20%).", tr: "Fiyatlara KDV (%20) dahildir." })}
        footnote={t({ en: "Trials end without a charge unless you confirm the plan in the app.", tr: "Denemeler, planı uygulamada onaylamadığınız sürece ücret alınmadan sona erer." })}
      />

      <ComparisonTable
        {...common}
        variant="table"
        anchor="compare"
        eyebrow={t({ en: "Side by side", tr: "Yan yana" })}
        title={t({ en: "Every limit, in one table", tr: "Tüm limitler tek tabloda" })}
        caption={t({ en: "Fernway plans compared", tr: "Fernway planlarının karşılaştırması" })}
        columns={plans.map((p) => ({ name: t(p.name), highlight: Boolean(p.highlight) }))}
        groups={[
          {
            title: t({ en: "Saving", tr: "Birikim" }),
            rows: [
              { feature: t({ en: "Pots with daily interest", tr: "Günlük faizli kumbara" }), values: ["2", "10", t({ en: "10 per person", tr: "Kişi başı 10" })] },
              { feature: t({ en: "Shared pots", tr: "Ortak kumbaralar" }), values: [no, no, yes] },
              { feature: t({ en: "Round-ups into a pot", tr: "Küsuratları kumbaraya aktarma" }), values: [yes, yes, yes] },
            ],
          },
          {
            title: t({ en: "Spending", tr: "Harcama" }),
            rows: [
              { feature: t({ en: "Free ATM withdrawals a month", tr: "Aylık ücretsiz ATM çekimi" }), values: ["2", t({ en: "Unlimited", tr: "Sınırsız" }), t({ en: "Unlimited", tr: "Sınırsız" })] },
              { feature: t({ en: "Foreign exchange", tr: "Döviz" }), hint: t({ en: "On top of the interbank rate", tr: "Bankalar arası kurun üzerine" }), values: ["+1.0%", "+0.4%", "+0.4%"] },
              { feature: t({ en: "Bill planner", tr: "Fatura planlayıcı" }), values: [no, yes, yes] },
            ],
          },
          {
            title: t({ en: "Support", tr: "Destek" }),
            rows: [
              { feature: t({ en: "In-app chat with a person", tr: "Uygulamada bir kişiyle sohbet" }), values: [yes, yes, yes] },
              { feature: t({ en: "Priority phone line", tr: "Öncelikli telefon hattı" }), values: [no, no, yes] },
            ],
          },
        ]}
      />

      <Section theme={{ rhythm: "tight" }} aria-label={t({ en: "Licences and certifications", tr: "Lisanslar ve sertifikalar" })}>
        <Container>
          <TrustBadges locale={locale} label={t({ en: "Licences and certifications", tr: "Lisanslar ve sertifikalar" })} />
        </Container>
      </Section>

      <Faq
        {...common}
        variant="stacked"
        anchor="fees"
        title={t({ en: "Fees, answered", tr: "Ücretler hakkında" })}
        items={[
          {
            q: t({ en: "Are there fees you don’t show here?", tr: "Burada göstermediğiniz ücretler var mı?" }),
            a: t({ en: "Two: a replacement card after the second one in a year (₺150) and cash deposits at partner stores (1%, min ₺10). Both are shown before you confirm.", tr: "İki tane: bir yıl içinde ikinciden sonraki yedek kart (150 ₺) ve anlaşmalı mağazalarda nakit yatırma (%1, en az 10 ₺). İkisi de onaylamadan önce gösterilir." }),
          },
          {
            q: t({ en: "What happens when I downgrade?", tr: "Planı düşürürsem ne olur?" }),
            a: t({ en: "Extra pots stay readable and keep earning; you just can’t add money to them until you are within the plan’s limit again.", tr: "Fazla kumbaralar görünür kalır ve kazanmaya devam eder; yalnızca planın limitine dönene kadar onlara para ekleyemezsiniz." }),
          },
          {
            q: t({ en: "Do you charge for transfers?", tr: "Havale için ücret alıyor musunuz?" }),
            a: t({ en: "No. FAST and EFT transfers are free on every plan, 24 hours a day.", tr: "Hayır. FAST ve EFT havaleleri her planda, günün 24 saati ücretsizdir." }),
          },
        ]}
      />
    </>
  );
}
