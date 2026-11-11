import { LocaleProvider } from "@vamos-ui/react";
import { Faq, FeatureGrid, Footer, MapHours, MediaText, Navbar, SiteShellPage, Steps, Team, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { AppointmentPage } from "./appointment-page";
import { ClinicHero, DoctorsPage, ServicesList } from "./clinic-parts";
import { branch, clinicians, copyFor, EMAIL, PHONE, photos, type SiteLocale } from "./content";

const home = (anchor?: string) => sitePageHref("home", anchor);
const book = sitePageHref("appointment");

/**
 * One language version of Northline Family Clinic: navbar, three pages (home, clinicians,
 * appointment) and the footer. Booking progress lives in BookingProvider (page.tsx).
 */
export function ClinicSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const studio = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Northline"
        homeHref={home()}
        items={[
          { label: t({ en: "Services", tr: "Hizmetler" }), href: home("services") },
          { label: t({ en: "Clinicians", tr: "Hekimler" }), href: sitePageHref("doctors") },
          { label: t({ en: "Your visit", tr: "Ziyaretiniz" }), href: home("visit") },
          { label: t({ en: "Find us", tr: "Ulaşım" }), href: home("find-us") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: book, label: t({ en: "Book an appointment", tr: "Randevu al" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Northline Family Clinic — general practice in Ataşehir", tr: "Northline Aile Kliniği — Ataşehir’de aile hekimliği" })}>
          <ClinicHero />
          <ServicesList />
          <Team
            {...common}
            variant="portrait"
            eyebrow={t({ en: "Clinicians", tr: "Hekimler" })}
            title={t({ en: "See the *same* doctor next time", tr: "Bir dahaki sefere *aynı* hekim" })}
            lead={t({ en: "Every patient has a named family doctor; you can always book them directly.", tr: "Her hastanın adı belli bir aile hekimi var; doğrudan ondan randevu alabilirsiniz." })}
            members={clinicians.map((p) => ({ name: p.name, title: p.title ? t(p.title) : undefined, role: t(p.role), specialty: t(p.focus), photo: { ...p.photo, alt: t(p.photo.alt) } }))}
          />
          <MediaText
            {...common}
            anchor="visit"
            variant="side"
            theme={{ surface: "surface-2" }}
            mediaSide="end"
            eyebrow={t({ en: "Your first visit", tr: "İlk ziyaretiniz" })}
            title={t({ en: "What to *bring*", tr: "Yanınızda *getirin*" })}
            body={t({
              en: "Registering takes five minutes at the desk. Bring the things below and we can usually see you on time — most appointments start within seven minutes of the booked time.",
              tr: "Danışmada kayıt beş dakika sürer. Aşağıdakileri getirirseniz genellikle zamanında görürüz — randevuların çoğu saatinden en geç yedi dakika sonra başlar.",
            })}
            bullets={[
              t({ en: "Your ID card or passport", tr: "Kimlik kartınız ya da pasaportunuz" }),
              t({ en: "Insurance card, if you have private cover", tr: "Özel sigortanız varsa sigorta kartınız" }),
              t({ en: "A list of the medicines you take, with doses", tr: "Kullandığınız ilaçların dozlarıyla listesi" }),
              t({ en: "Recent test results or letters from other clinics", tr: "Son tahlil sonuçları ya da başka kliniklerden yazılar" }),
              t({ en: "For children: the vaccination card", tr: "Çocuklar için: aşı kartı" }),
            ]}
            media={{ ...photos.consult, alt: t(photos.consult.alt) }}
            aspect="4:5"
          />
          <Steps
            {...common}
            variant="horizontal"
            eyebrow={t({ en: "On the day", tr: "Randevu günü" })}
            title={t({ en: "From the door to the *results*", tr: "Kapıdan *sonuca* kadar" })}
            steps={[
              { title: t({ en: "Check in", tr: "Kayıt" }), text: t({ en: "Give your name at the desk on the second floor; the lift is beside the pharmacy.", tr: "İkinci kattaki danışmaya adınızı verin; asansör eczanenin yanında." }), duration: t({ en: "2 min", tr: "2 dk" }) },
              { title: t({ en: "Your appointment", tr: "Muayene" }), text: t({ en: "Your clinician calls you by name. Ask for a chaperone at any time.", tr: "Hekiminiz sizi adınızla çağırır. İstediğiniz an refakatçi isteyebilirsiniz." }) },
              { title: t({ en: "Tests if needed", tr: "Gerekirse tahlil" }), text: t({ en: "Bloods and ECG next door, usually the same morning.", tr: "Kan alma ve EKG yan odada, genellikle aynı sabah." }) },
              { title: t({ en: "Results online", tr: "Sonuçlar çevrimiçi" }), text: t({ en: "Most results reach your patient account the same evening, with a note from the doctor.", tr: "Çoğu sonuç aynı akşam, hekimin notuyla birlikte hasta hesabınıza düşer." }) },
            ]}
          />
          <FeatureGrid
            {...common}
            variant="list"
            theme={{ surface: "surface-2", rhythm: "tight" }}
            eyebrow={t({ en: "Insurance", tr: "Sigorta" })}
            title={t({ en: "Cover we *bill directly*", tr: "*Doğrudan* fatura ettiğimiz sigortalar" })}
            items={[
              { title: "Kuzey Sigorta", text: t({ en: "All outpatient plans; no up-front payment.", tr: "Tüm ayakta tedavi planları; ön ödeme yok." }) },
              { title: "Boğaz Sağlık", text: t({ en: "Gold and Platinum plans; Silver pays at the desk and claims back.", tr: "Altın ve Platin planlar; Gümüş danışmada öder, sonra geri alır." }) },
              { title: "Liman Hayat", text: t({ en: "Corporate plans, with approval by text in about ten minutes.", tr: "Kurumsal planlar; onay SMS ile yaklaşık on dakikada gelir." }) },
              { title: t({ en: "SGK + top-up", tr: "SGK + tamamlayıcı" }), text: t({ en: "We are a private clinic: SGK pays its share, the top-up policy covers the difference.", tr: "Özel bir kliniğiz: SGK payını öder, tamamlayıcı poliçe farkı karşılar." }) },
            ]}
          />
          <MapHours
            {...common}
            anchor="find-us"
            variant="map-split"
            eyebrow={t({ en: "Find us", tr: "Ulaşım" })}
            title={t({ en: "Above the pharmacy on *Ihlamur Sokak*", tr: "*Ihlamur Sokak*’ta, eczanenin üstünde" })}
            businessType="MedicalClinic"
            branches={[studio]}
          />
          <Faq
            {...common}
            variant="stacked"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *book*", tr: "Randevudan *önce*" })}
            contact={{ link: { href: `tel:${PHONE}`, label: t({ en: "Or call the desk", tr: "Ya da danışmayı arayın" }) }, style: "link" }}
            items={[
              { q: t({ en: "Can I book the same day?", tr: "Aynı gün randevu alabilir miyim?" }), a: t({ en: "We keep six slots every morning for same-day problems. Call at 08:00 or book online from 07:30.", tr: "Her sabah aynı gün sorunları için altı saat ayırıyoruz. 08:00’de arayın ya da 07:30’dan itibaren çevrimiçi alın." }) },
              { q: t({ en: "Do you see children?", tr: "Çocuklara bakıyor musunuz?" }), a: t({ en: "Yes. Dr Ece Yalın sees children from birth to 16 on Tuesday, Wednesday, Thursday and Saturday.", tr: "Evet. Dr. Ece Yalın salı, çarşamba, perşembe ve cumartesi günleri doğumdan 16 yaşa kadar çocuklara bakar." }) },
              { q: t({ en: "How do I cancel?", tr: "Nasıl iptal ederim?" }), a: t({ en: "Reply CANCEL to the confirmation text or use the link in the email, up to two hours before. There is no fee.", tr: "Onay SMS’ine İPTAL yazın ya da e-postadaki bağlantıyı kullanın; iki saat öncesine kadar. Ücret alınmaz." }) },
              { q: t({ en: "Is this an emergency clinic?", tr: "Burası acil kliniği mi?" }), a: t({ en: "No. For chest pain, difficulty breathing or a serious injury, call 112 or go to the nearest emergency department.", tr: "Hayır. Göğüs ağrısı, nefes darlığı ya da ciddi yaralanmada 112’yi arayın veya en yakın acil servise gidin." }) },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="doctors" title={t({ en: "Clinicians — Northline Family Clinic", tr: "Hekimler — Northline Aile Kliniği" })}>
          <DoctorsPage />
        </SiteShellPage>

        <SiteShellPage id="appointment" title={t({ en: "Book an appointment — Northline", tr: "Randevu al — Northline" })}>
          <AppointmentPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Northline Family Clinic", href: home() }}
        about={t({ en: "General practice for families in Ataşehir since 2016.", tr: "2016’dan beri Ataşehir’de ailelere aile hekimliği." })}
        columns={[
          { title: t({ en: "Clinic", tr: "Klinik" }), links: [{ href: home("services"), label: t({ en: "Services and fees", tr: "Hizmetler ve ücretler" }) }, { href: sitePageHref("doctors"), label: t({ en: "Clinicians", tr: "Hekimler" }) }, { href: book, label: t({ en: "Book an appointment", tr: "Randevu al" }) }] },
          { title: t({ en: "Patients", tr: "Hastalar" }), links: [{ href: home("visit"), label: t({ en: "Your first visit", tr: "İlk ziyaretiniz" }) }, { href: "/results", label: t({ en: "Test results", tr: "Tahlil sonuçları" }) }, { href: "/rights", label: t({ en: "Patient rights", tr: "Hasta hakları" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: studio.address }}
        company={{ legalName: "Northline Sağlık Hizmetleri A.Ş.", registry: [{ label: t({ en: "Licence", tr: "Ruhsat" }), value: "34-0000-2016" }] }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }, { href: "/accessibility", label: t({ en: "Accessibility", tr: "Erişilebilirlik" }) }]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr}>
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-GB">{site}</LocaleProvider>
  );
}
