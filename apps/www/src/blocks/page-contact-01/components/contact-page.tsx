import { ContactDock, ContactForm, Faq, Footer, MapHours, Navbar, PageIntro } from "@vamos-ui/react/blocks";
import { branches, copyFor, EMAIL, hours, PHONE, WHATSAPP } from "./content";
import type { SiteLocale } from "./locale-switch";

/** One language version of the contact page. Server component: every block is plain props. */
export function ContactPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const locations = branches(t);

  return (
    <div className="vb-scope min-h-dvh bg-scene">
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Ardıç Danışmanlık"
        homeHref="/"
        currentPath="/contact"
        items={[
          {
            label: t({ en: "Services", tr: "Hizmetler" }),
            href: "/services",
            children: [
              { label: t({ en: "Bookkeeping", tr: "Ön muhasebe" }), href: "/services/bookkeeping" },
              { label: t({ en: "Tax returns", tr: "Vergi beyannameleri" }), href: "/services/tax" },
              { label: t({ en: "Payroll", tr: "Bordro" }), href: "/services/payroll" },
            ],
          },
          { label: t({ en: "Team", tr: "Ekip" }), href: "/team" },
          { label: t({ en: "Prices", tr: "Fiyatlar" }), href: "/prices" },
          { label: t({ en: "Contact", tr: "İletişim" }), href: "/contact" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: "/book", label: t({ en: "Book a call", tr: "Görüşme planlayın" }) }, style: "primary" }]}
      />

      <main id="content">
        <PageIntro
          {...common}
          variant="ruled"
          theme={{ rhythm: "tight" }}
          breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: "/" }, { label: t({ en: "Contact", tr: "İletişim" }) }]}
          title={t({ en: "Talk to a *person*", tr: "Bir *insanla* konuşun" })}
          lead={t({ en: "Our client team answers the phone, WhatsApp and this form. Tax questions go to an advisor the same day.", tr: "Müşteri ekibimiz telefonu, WhatsApp’ı ve bu formu yanıtlar. Vergi sorularınız aynı gün bir danışmana iletilir." })}
          meta={[
            { label: t({ en: "Reply time", tr: "Yanıt süresi" }), value: t({ en: "Within one working day", tr: "Bir iş günü içinde" }) },
            { label: t({ en: "Languages", tr: "Diller" }), value: t({ en: "Turkish, English, Arabic", tr: "Türkçe, İngilizce, Arapça" }) },
            { label: t({ en: "Deadline week", tr: "Beyanname haftası" }), value: t({ en: "Open until 21:00", tr: "21.00’e kadar açığız" }) },
          ]}
        />

        <ContactForm
          {...common}
          variant="split"
          theme={{ rhythm: "tight" }}
          eyebrow={t({ en: "Write to us", tr: "Bize yazın" })}
          title={t({ en: "Ask us *anything*", tr: "Bize *her şeyi* sorun" })}
          lead={t({ en: "Questions about a service, a price or a meeting — tell us which office suits you.", tr: "Bir hizmet, fiyat ya da görüşme hakkında sorularınız mı var? Size uygun ofisi belirtin." })}
          fields={[
            { name: "name", required: true },
            { name: "phone", required: true, hint: t({ en: "We call back from 0212 000 00 00.", tr: "0212 000 00 00’dan geri döneriz." }) },
            { name: "email" },
            { name: "subject", label: t({ en: "Topic", tr: "Konu" }), options: [t({ en: "Bookkeeping", tr: "Ön muhasebe" }), t({ en: "Tax return", tr: "Vergi beyannamesi" }), t({ en: "Payroll", tr: "Bordro" }), t({ en: "Prices and payment", tr: "Fiyat ve ödeme" }), t({ en: "Something else", tr: "Diğer" })] },
            { name: "message", required: true, placeholder: t({ en: "Which service, which office, any preferred days…", tr: "Hangi hizmet, hangi ofis, tercih ettiğiniz günler…" }) },
          ]}
          privacyLink={{ href: "/kvkk", label: t({ en: "privacy notice (KVKK)", tr: "KVKK aydınlatma metni" }) }}
          privacyCheckbox
          marketingConsent
          info={{ phone: PHONE, email: EMAIL, address: locations[0]!.address, hours }}
        />

        <MapHours
          {...common}
          variant="branches"
          theme={{ surface: "surface-2" }}
          eyebrow={t({ en: "Offices", tr: "Ofisler" })}
          title={t({ en: "Three offices, *one* phone number", tr: "Üç ofis, *tek* telefon" })}
          lead={t({ en: "Every office has the same advisors on rotation and the same prices.", tr: "Tüm ofislerde aynı danışmanlar dönüşümlü çalışır, fiyatlar aynıdır." })}
          businessType="ProfessionalService"
          branches={locations}
          directions={["google", "apple", "yandex"]}
        />

        <Faq
          {...common}
          variant="stacked"
          eyebrow={t({ en: "Before you write", tr: "Yazmadan önce" })}
          title={t({ en: "Quick *answers*", tr: "Kısa *yanıtlar*" })}
          items={[
            { q: t({ en: "Is the first meeting free?", tr: "İlk görüşme ücretsiz mi?" }), a: t({ en: "Yes. The first 30-minute meeting is free; we look at your books and send a fixed monthly quote.", tr: "Evet. İlk 30 dakikalık görüşme ücretsizdir; defterlerinize bakar, sabit aylık teklifimizi göndeririz." }) },
            { q: t({ en: "Can I pay yearly?", tr: "Yıllık ödeyebilir miyim?" }), a: t({ en: "Yes. A yearly plan is billed once and costs the same as ten months.", tr: "Evet. Yıllık plan tek seferde faturalanır ve on ayın fiyatına denk gelir." }) },
            { q: t({ en: "Do you work with companies abroad?", tr: "Yurt dışındaki şirketlerle çalışıyor musunuz?" }), a: t({ en: "Yes. Write to us on WhatsApp or by email; an advisor answers in English or Arabic.", tr: "Evet. WhatsApp’tan ya da e-postayla yazın; bir danışmanımız İngilizce ya da Arapça yanıtlar." }) },
          ]}
          deepLink={false}
        />
      </main>

      <Footer
        {...common}
        theme={{ mode: "dark" }}
        brand={{ name: "Ardıç Danışmanlık", href: "/" }}
        about={t({ en: "Accounting, tax and payroll for small companies in Nişantaşı, Moda and Ataşehir.", tr: "Nişantaşı, Moda ve Ataşehir’de küçük şirketler için muhasebe, vergi ve bordro." })}
        columns={[
          { title: t({ en: "Services", tr: "Hizmetler" }), links: [{ href: "/services/bookkeeping", label: t({ en: "Bookkeeping", tr: "Ön muhasebe" }) }, { href: "/services/tax", label: t({ en: "Tax returns", tr: "Vergi beyannameleri" }) }, { href: "/services/payroll", label: t({ en: "Payroll", tr: "Bordro" }) }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "/team", label: t({ en: "Team", tr: "Ekip" }) }, { href: "/prices", label: t({ en: "Prices", tr: "Fiyatlar" }) }, { href: "/contact", label: t({ en: "Contact", tr: "İletişim" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: locations[0]!.address }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/example" }, { network: "youtube", href: "https://youtube.com/@example" }]}
        legalLinks={[{ href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }, { href: "/terms", label: t({ en: "Terms of service", tr: "Hizmet koşulları" }) }]}
        company={{ legalName: "Ardıç Danışmanlık Hizmetleri A.Ş.", registry: [{ label: "MERSİS", value: "0000 0000 0000 0000" }, { label: t({ en: "Tax office", tr: "Vergi dairesi" }), value: "Şişli · 000 000 0000" }] }}
        year={2026}
      />

      <ContactDock {...common} variant="both" phone={PHONE} whatsapp={WHATSAPP} email={EMAIL} bookingHref="/book" actions={["call", "whatsapp", "booking"]} message={t({ en: "Hi, I have a question about your services.", tr: "Merhaba, hizmetleriniz hakkında bir sorum var." })} />
    </div>
  );
}
