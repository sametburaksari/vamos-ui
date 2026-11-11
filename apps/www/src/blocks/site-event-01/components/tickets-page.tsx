import { ComparisonTable, Faq, PageIntro, PricingTable, RichTextSection, sitePageHref } from "@vamos-ui/react/blocks";
import { conduct, EUR, faqTickets, type Copy } from "./content";

/** Tickets: four tiers, what each includes, the code of conduct and ticket FAQ. */
export function TicketsPage({ c }: { c: Copy }) {
  const { t, f, eur, intl, labels } = c;
  const common = { locale: intl, labels };
  const buy = (tier: string) => `https://tickets.interfacedays.example.com/2027?tier=${tier}`;
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: "Interface Days", href: sitePageHref("home") }, { label: t({ en: "Tickets", tr: "Biletler" }) }]}
        eyebrow={t({ en: "Tickets", tr: "Biletler" })}
        title={t({ en: "One ticket, *both* days", tr: "Tek bilet, *iki* gün" })}
        lead={t({ en: "Every ticket covers both days, lunch, the ferry social and the recordings. Prices go up on 1 March.", tr: "Her bilet iki günü, öğle yemeklerini, vapur buluşmasını ve kayıtları kapsar. Fiyatlar 1 Mart’ta artar." })}
        meta={[
          { label: t({ en: "Seats", tr: "Koltuk" }), value: t({ en: "900, 612 left", tr: "900, 612 kaldı" }) },
          { label: t({ en: "Early bird until", tr: "Erken kayıt sonu" }), value: f.date("2027-02-28", { day: "numeric", month: "long" }) },
          { label: t({ en: "Refunds until", tr: "İade sonu" }), value: f.date("2027-03-14", { day: "numeric", month: "long" }) },
        ]}
      />

      <PricingTable
        {...common}
        anchor="tiers"
        billing="once"
        taxNote={t({ en: "Prices include 20% VAT", tr: "Fiyatlara %20 KDV dahildir" })}
        footnote={t({ en: "Card or bank transfer. Company invoices within one working day. Children under 12 come free.", tr: "Kart ya da havale. Şirket faturaları bir iş günü içinde. 12 yaş altı çocuklar ücretsiz." })}
        plans={[
          {
            name: t({ en: "Student", tr: "Öğrenci" }),
            description: t({ en: "With a valid student card at the door.", tr: "Kapıda geçerli öğrenci kartıyla." }),
            price: { once: EUR("95") },
            features: [{ text: t({ en: "Both days, all talks", tr: "İki gün, tüm konuşmalar" }) }, { text: t({ en: "Lunch and ferry social", tr: "Öğle yemeği ve vapur buluşması" }) }, { text: t({ en: "Workshop seat", tr: "Atölye koltuğu" }), included: false }],
            cta: { link: { href: buy("student"), label: t({ en: "Buy student ticket", tr: "Öğrenci bileti al" }) }, style: "secondary" },
          },
          {
            name: t({ en: "Early bird", tr: "Erken kayıt" }),
            description: t({ en: "Standard ticket, until 28 February.", tr: "Standart bilet, 28 Şubat’a kadar." }),
            price: { once: EUR("290") },
            highlight: t({ en: "143 left", tr: "143 kaldı" }),
            features: [{ text: t({ en: "Both days, all talks", tr: "İki gün, tüm konuşmalar" }) }, { text: t({ en: "One workshop seat", tr: "Bir atölye koltuğu" }) }, { text: t({ en: "Recordings in May", tr: "Mayıs’ta kayıtlar" }) }],
            cta: { link: { href: buy("early"), label: t({ en: "Buy early bird", tr: "Erken kayıt bileti al" }) }, style: "primary" },
          },
          {
            name: t({ en: "Standard", tr: "Standart" }),
            description: t({ en: "From 1 March.", tr: "1 Mart’tan itibaren." }),
            price: { once: EUR("390") },
            features: [{ text: t({ en: "Both days, all talks", tr: "İki gün, tüm konuşmalar" }) }, { text: t({ en: "One workshop seat", tr: "Bir atölye koltuğu" }) }, { text: t({ en: "Recordings in May", tr: "Mayıs’ta kayıtlar" }) }],
            cta: { link: { href: buy("standard"), label: t({ en: "Buy standard", tr: "Standart bilet al" }) }, style: "secondary" },
          },
          {
            name: t({ en: "Team of 5+", tr: "5+ kişilik ekip" }),
            description: t({ en: "Per person, one invoice.", tr: "Kişi başı, tek fatura." }),
            price: { once: EUR("255") },
            features: [{ text: t({ en: "Everything in Standard", tr: "Standart’taki her şey" }) }, { text: t({ en: "Names can change until 7 May", tr: "İsimler 7 Mayıs’a kadar değişebilir" }) }, { text: t({ en: "Reserved row on day one", tr: "İlk gün ayrılmış sıra" }) }],
            cta: { link: { href: "mailto:teams@interfacedays.example.com", label: t({ en: "Book for a team", tr: "Ekip için ayırt" }) }, style: "secondary" },
          },
        ]}
      />

      <ComparisonTable
        {...common}
        anchor="included"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Included", tr: "Dahil olanlar" })}
        title={t({ en: "What each ticket gets you", tr: "Her biletle neler geliyor" })}
        columns={[
          { name: t({ en: "Student", tr: "Öğrenci" }), note: eur(95) },
          { name: t({ en: "Early bird", tr: "Erken kayıt" }), note: eur(290), highlight: true },
          { name: t({ en: "Standard", tr: "Standart" }), note: eur(390) },
          { name: t({ en: "Team", tr: "Ekip" }), note: t({ en: `${eur(255)} each`, tr: `Kişi başı ${eur(255)}` }) },
        ]}
        groups={[
          {
            title: t({ en: "The conference", tr: "Konferans" }),
            rows: [
              { feature: t({ en: "All 18 talks, both days", tr: "18 konuşmanın tamamı, iki gün" }), values: [true, true, true, true] },
              { feature: t({ en: "Workshop seat", tr: "Atölye koltuğu" }), hint: t({ en: "24 per workshop, first come", tr: "Atölye başına 24, ilk gelen alır" }), values: [false, true, true, true] },
              { feature: t({ en: "Live Turkish captions", tr: "Canlı Türkçe altyazı" }), values: [true, true, true, true] },
            ],
          },
          {
            title: t({ en: "Around it", tr: "Etrafında" }),
            rows: [
              { feature: t({ en: "Lunch, coffee, simit", tr: "Öğle yemeği, kahve, simit" }), values: [true, true, true, true] },
              { feature: t({ en: "Ferry social", tr: "Vapur buluşması" }), values: [true, true, true, true] },
              { feature: t({ en: "Recordings", tr: "Kayıtlar" }), values: [t({ en: "September", tr: "Eylül" }), t({ en: "May", tr: "Mayıs" }), t({ en: "May", tr: "Mayıs" }), t({ en: "May", tr: "Mayıs" })] },
            ],
          },
        ]}
      />

      <RichTextSection
        {...common}
        anchor="conduct"
        variant="aside-heading"
        eyebrow={t({ en: "Code of conduct", tr: "Davranış kuralları" })}
        title={t({ en: "Everyone gets to *enjoy* this", tr: "Herkes bunun *tadını* çıkarmalı" })}
        note={t({ en: "Last updated 4 November 2026", tr: "Son güncelleme 4 Kasım 2026" })}
        body={t(conduct)}
      />

      <Faq
        {...common}
        anchor="ticket-faq"
        variant="split"
        eyebrow="FAQ"
        title={t({ en: "Ticket *questions*", tr: "Bilet *soruları*" })}
        contact={{ link: { href: "mailto:hello@interfacedays.example.com", label: t({ en: "Ask the team", tr: "Ekibe sorun" }) }, style: "link" }}
        items={faqTickets.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        deepLink={false}
      />
    </>
  );
}
