import { Container, Cta, Faq, PageIntro, PricingTable, Section, SectionHeader, Steps } from "@vamos-ui/react/blocks";
import { faqMembership, joinSteps, photos, plans, SEASON, stands, TICKETS_EMAIL, type Copy } from "./content";
import { Hoops } from "./crest";

/** Membership page: four memberships, how joining works, the stands, FAQ and the ticket office. */
export function MembershipPage({ c }: { c: Copy }) {
  const { t, f } = c;
  const common = { locale: c.intl, labels: c.labels };
  return (
    <>
      <PageIntro
        {...common}
        variant="with-media"
        breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: "?page=home" }, { label: t({ en: "Membership", tr: "Üyelik" }) }]}
        eyebrow={`${t({ en: "Season", tr: "Sezon" })} ${SEASON}`}
        title={t({ en: "Same seat, *every* week", tr: "Her hafta *aynı* koltuk" })}
        lead={t({
          en: "Harbor City FC is owned by its 3,212 members. A membership is your ticket, your vote at the AGM and the reason the Lighthouse End has a roof again.",
          tr: "Harbor City FC, 3.212 üyesine aittir. Üyelik hem biletiniz hem genel kuruldaki oyunuz hem de Fener Tribünü’nün yeniden çatıya kavuşmasının sebebi.",
        })}
        media={{ ...photos.stadium, alt: t(photos.stadium.alt) }}
      />

      <PricingTable
        {...common}
        anchor="plans"
        variant="columns"
        billing="once"
        eyebrow={t({ en: "Memberships", tr: "Üyelikler" })}
        title={t({ en: "Pick your *membership*", tr: "Üyeliğinizi *seçin*" })}
        lead={t({
          en: "Full-season prices. Joining now? We take ₺420 off for every home league game already played (six so far).",
          tr: "Tam sezon fiyatları. Şimdi mi katılıyorsunuz? Oynanmış her iç saha lig maçı için ₺420 düşüyoruz (şu ana kadar altı).",
        })}
        plans={plans.map((p) => ({
          name: t(p.name),
          description: t(p.description),
          price: { once: { amount: String(p.price), currency: "TRY" } },
          features: p.features.map((x) => ({ text: t(x.text), included: x.included })),
          highlight: p.highlight ? t(p.highlight) : undefined,
          cta: { link: { href: `mailto:${TICKETS_EMAIL}?subject=${encodeURIComponent(`Membership: ${t(p.name)}`)}`, label: t({ en: "Join", tr: "Üye ol" }) }, style: p.highlight ? "primary" : "secondary" },
        }))}
        taxNote={t({ en: "Prices include 20% VAT.", tr: "Fiyatlara %20 KDV dahildir." })}
        footnote={t({
          en: "Adult and Family memberships can be paid in three monthly instalments. Concessions for over-65s and students: 30% off the adult price at the ticket office.",
          tr: "Yetişkin ve Aile üyelikleri üç aylık taksitle ödenebilir. 65 yaş üstü ve öğrencilere gişede yetişkin fiyatı üzerinden %30 indirim.",
        })}
      />

      <Steps
        {...common}
        variant="horizontal"
        anchor="join"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "How it works", tr: "Nasıl işler" })}
        title={t({ en: "Three steps to the *Lighthouse End*", tr: "Fener Tribünü’ne *üç adım*" })}
        steps={joinSteps.map((s) => ({ title: t(s.title), text: t(s.text) }))}
      />

      <Section anchor="stands" headingId="hc-stands-title">
        <Container>
          <SectionHeader
            headingId="hc-stands-title"
            align="split"
            eyebrow={t({ en: "The Quayside", tr: "The Quayside" })}
            title={t({ en: "Where you’ll *sit*", tr: "Nerede *oturacaksınız*" })}
            lead={t({ en: `${f.number(5150)} seats on three sides, the harbour on the fourth.`, tr: `Üç yanda ${f.number(5150)} koltuk, dördüncü yanda liman.` })}
          />
          <ol className="m-0 mt-10 grid list-none gap-0 border-t-2 border-fg p-0 md:grid-cols-3">
            {stands.map((s, i) => (
              <li key={i} className="relative grid content-start gap-2 border-b border-line py-6 md:border-b-0 md:border-s md:px-6 md:first:border-s-0 md:first:ps-0">
                <span className="font-mono text-xs text-fg-muted tabular">0{i + 1}</span>
                <h3 className="m-0 font-display text-h3 leading-none font-semibold text-fg">{t(s.name)}</h3>
                <p className="m-0 text-small text-fg-muted">{t(s.note)}</p>
                <p className="m-0 mt-2 font-mono text-xs text-fg">
                  {t({ en: `${f.number(s.seats)} seats`, tr: `${f.number(s.seats)} koltuk` })}
                </p>
              </li>
            ))}
          </ol>
          <Hoops className="mt-10 h-[50px] opacity-90" />
        </Container>
      </Section>

      <Faq
        {...common}
        anchor="faq"
        variant="split"
        eyebrow={t({ en: "Membership FAQ", tr: "Üyelik SSS" })}
        title={t({ en: "Before you *join*", tr: "Üye olmadan *önce*" })}
        items={faqMembership.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        deepLink={false}
      />

      <Cta
        {...common}
        variant="band"
        eyebrow={t({ en: "Ticket office", tr: "Bilet gişesi" })}
        title={t({ en: "Questions? The office is open *Tue–Sat*, 10:00–18:00", tr: "Sorunuz mu var? Gişe *Salı–Cumartesi* 10:00–18:00 açık" })}
        actions={[{ link: { href: `mailto:${TICKETS_EMAIL}`, label: TICKETS_EMAIL }, style: "primary" }]}
        contact={{ phone: "+902160000000" }}
      />
    </>
  );
}
