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
        wordmark="Defne Clinic"
        homeHref="/"
        currentPath="/contact"
        items={[
          {
            label: t({ en: "Treatments", tr: "Tedaviler" }),
            href: "/treatments",
            children: [
              { label: t({ en: "Laser hair removal", tr: "Lazer epilasyon" }), href: "/treatments/laser" },
              { label: t({ en: "Facials", tr: "Yüz bakımı" }), href: "/treatments/facials" },
              { label: t({ en: "Post-op care", tr: "Ameliyat sonrası bakım" }), href: "/treatments/post-op" },
            ],
          },
          { label: t({ en: "Doctors", tr: "Doktorlar" }), href: "/doctors" },
          { label: t({ en: "Prices", tr: "Fiyatlar" }), href: "/prices" },
          { label: t({ en: "Contact", tr: "İletişim" }), href: "/contact" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: "/book", label: t({ en: "Book a consultation", tr: "Muayene randevusu" }) }, style: "primary" }]}
      />

      <main id="content">
        <PageIntro
          {...common}
          variant="ruled"
          theme={{ rhythm: "tight" }}
          breadcrumb={[{ label: t({ en: "Home", tr: "Ana sayfa" }), href: "/" }, { label: t({ en: "Contact", tr: "İletişim" }) }]}
          title={t({ en: "Talk to a *person*", tr: "Bir *insanla* konuşun" })}
          lead={t({ en: "Our patient coordinators answer the phone, WhatsApp and this form. Medical questions go to a doctor the same day.", tr: "Hasta koordinatörlerimiz telefonu, WhatsApp’ı ve bu formu yanıtlar. Tıbbi sorular aynı gün bir doktora iletilir." })}
          meta={[
            { label: t({ en: "Reply time", tr: "Yanıt süresi" }), value: t({ en: "Within one working day", tr: "Bir iş günü içinde" }) },
            { label: t({ en: "Languages", tr: "Diller" }), value: t({ en: "Turkish, English, Arabic", tr: "Türkçe, İngilizce, Arapça" }) },
            { label: t({ en: "Emergencies", tr: "Acil durumlar" }), value: t({ en: "Call 112", tr: "112’yi arayın" }) },
          ]}
        />

        <ContactForm
          {...common}
          variant="split"
          theme={{ rhythm: "tight" }}
          eyebrow={t({ en: "Write to us", tr: "Bize yazın" })}
          title={t({ en: "Ask us *anything*", tr: "Bize *her şeyi* sorun" })}
          lead={t({ en: "Questions about a treatment, a price or an appointment — tell us which branch suits you.", tr: "Bir tedavi, fiyat ya da randevu hakkında sorularınız — size uygun şubeyi belirtin." })}
          fields={[
            { name: "name", required: true },
            { name: "phone", required: true, hint: t({ en: "We call back from 0212 230 44 55.", tr: "0212 230 44 55’ten geri döneriz." }) },
            { name: "email" },
            { name: "subject", label: t({ en: "Topic", tr: "Konu" }), options: [t({ en: "Laser treatment", tr: "Lazer tedavisi" }), t({ en: "Facial", tr: "Yüz bakımı" }), t({ en: "Post-op care", tr: "Ameliyat sonrası bakım" }), t({ en: "Prices and payment", tr: "Fiyat ve ödeme" }), t({ en: "Something else", tr: "Diğer" })] },
            { name: "message", required: true, placeholder: t({ en: "Which treatment, which branch, any preferred days…", tr: "Hangi tedavi, hangi şube, tercih ettiğiniz günler…" }) },
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
          eyebrow={t({ en: "Branches", tr: "Şubeler" })}
          title={t({ en: "Three clinics, *one* phone number", tr: "Üç klinik, *tek* telefon" })}
          lead={t({ en: "Every branch has the same doctors on rotation and the same prices.", tr: "Tüm şubelerde aynı doktorlar dönüşümlü çalışır, fiyatlar aynıdır." })}
          businessType="MedicalClinic"
          branches={locations}
          directions={["google", "apple", "yandex"]}
        />

        <Faq
          {...common}
          variant="stacked"
          eyebrow={t({ en: "Before you write", tr: "Yazmadan önce" })}
          title={t({ en: "Quick *answers*", tr: "Kısa *yanıtlar*" })}
          items={[
            { q: t({ en: "Is the first consultation free?", tr: "İlk muayene ücretsiz mi?" }), a: t({ en: "A 20-minute skin consultation is free when you book a treatment the same day; otherwise it is ₺900.", tr: "Aynı gün tedavi alırsanız 20 dakikalık cilt muayenesi ücretsizdir; aksi halde ₺900’dür." }) },
            { q: t({ en: "Can I pay in instalments?", tr: "Taksitle ödeyebilir miyim?" }), a: t({ en: "Yes, up to six instalments with Bonus, World and Axess cards.", tr: "Evet, Bonus, World ve Axess kartlarla altı taksite kadar." }) },
            { q: t({ en: "Do you treat patients from abroad?", tr: "Yurt dışından hasta kabul ediyor musunuz?" }), a: t({ en: "Yes. Write to us on WhatsApp with photos and your travel dates; a coordinator plans the visit in English or Arabic.", tr: "Evet. Fotoğraflar ve seyahat tarihlerinizle WhatsApp’tan yazın; koordinatör ziyareti İngilizce ya da Arapça planlar." }) },
          ]}
          deepLink={false}
        />
      </main>

      <Footer
        {...common}
        theme={{ mode: "dark" }}
        brand={{ name: "Defne Clinic", href: "/" }}
        about={t({ en: "Dermatology and aesthetic medicine in Nişantaşı, Moda and Ataşehir.", tr: "Nişantaşı, Moda ve Ataşehir’de dermatoloji ve estetik tıp." })}
        columns={[
          { title: t({ en: "Treatments", tr: "Tedaviler" }), links: [{ href: "/treatments/laser", label: t({ en: "Laser", tr: "Lazer" }) }, { href: "/treatments/facials", label: t({ en: "Facials", tr: "Yüz bakımı" }) }, { href: "/treatments/post-op", label: t({ en: "Post-op care", tr: "Ameliyat sonrası" }) }] },
          { title: t({ en: "Clinic", tr: "Klinik" }), links: [{ href: "/doctors", label: t({ en: "Doctors", tr: "Doktorlar" }) }, { href: "/prices", label: t({ en: "Prices", tr: "Fiyatlar" }) }, { href: "/contact", label: t({ en: "Contact", tr: "İletişim" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: locations[0]!.address }}
        social={[{ network: "instagram", href: "https://instagram.com/lenaclinic" }, { network: "youtube", href: "https://youtube.com/@lenaclinic" }]}
        legalLinks={[{ href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }, { href: "/patient-rights", label: t({ en: "Patient rights", tr: "Hasta hakları" }) }]}
        company={{ legalName: "Defne Sağlık Hizmetleri A.Ş.", registry: [{ label: "MERSİS", value: "0598 1234 5670 0015" }, { label: t({ en: "Tax office", tr: "Vergi dairesi" }), value: "Şişli · 5981 234 567" }] }}
        year={2026}
      />

      <ContactDock {...common} variant="both" phone={PHONE} whatsapp={WHATSAPP} email={EMAIL} bookingHref="/book" actions={["call", "whatsapp", "booking"]} message={t({ en: "Hi, I have a question about a treatment.", tr: "Merhaba, bir tedavi hakkında sorum var." })} />
    </div>
  );
}
