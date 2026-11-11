import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, MediaText, Navbar, SiteShellPage, StatsBand, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { branch, copyFor, EMAIL, PHONE, photos, team, type SiteLocale } from "./content";
import { ServicesPage } from "./services-page";
import { TeamPage } from "./team-page";
import { ServicesPreview, VetHero } from "./vet-parts";

const home = (anchor?: string) => sitePageHref("home", anchor);
const book = sitePageHref("services", "book");

/**
 * One language version of Pawbridge Vets: navbar, three pages (home, services, team) and the
 * footer. The chosen pet lives in PetProvider (page.tsx), above the language switch.
 */
export function VetSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Pawbridge"
        homeHref={home()}
        items={[
          { label: t({ en: "Services & fees", tr: "Hizmetler ve ücretler" }), href: sitePageHref("services") },
          { label: t({ en: "Team", tr: "Ekip" }), href: sitePageHref("team") },
          { label: t({ en: "First visit", tr: "İlk ziyaret" }), href: home("first-visit") },
          { label: t({ en: "Find us", tr: "Ulaşım" }), href: home("find-us") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: book, label: t({ en: "Book a visit", tr: "Randevu iste" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Pawbridge Vets — dogs, cats, rabbits and birds in Kadıköy", tr: "Pawbridge Veteriner — Kadıköy’de köpek, kedi, tavşan ve kuşlar" })}>
          <VetHero />
          <StatsBand
            {...common}
            variant="inline"
            theme={{ rhythm: "tight" }}
            items={[
              { value: 11, label: t({ en: "years on Çınarlı Sokak", tr: "yıldır Çınarlı Sokak’ta" }) },
              { value: "24/7", label: t({ en: "a vet on the phone", tr: "telefonda bir veteriner" }) },
              { value: 20, unit: t({ en: "min", tr: "dk" }), unitLabel: t({ en: "minutes", tr: "dakika" }), label: t({ en: "shortest appointment we book", tr: "verdiğimiz en kısa randevu" }) },
              { value: 3, label: t({ en: "separate waiting areas", tr: "ayrı bekleme alanı" }) },
            ]}
          />
          <ServicesPreview />
          <MediaText
            {...common}
            anchor="first-visit"
            variant="side"
            mediaSide="start"
            eyebrow={t({ en: "Your first visit", tr: "İlk ziyaretiniz" })}
            title={t({ en: "What to *bring* along", tr: "Yanınızda *getirin*" })}
            body={t({
              en: "Registering takes five minutes at the desk. Come ten minutes early so your pet can sniff around before anyone touches them — it makes the exam calmer for everyone.",
              tr: "Danışmada kayıt beş dakika sürer. On dakika erken gelin ki dostunuz kimse dokunmadan önce etrafı koklayabilsin — muayene herkes için daha sakin geçer.",
            })}
            bullets={[
              t({ en: "The pet passport or any vaccination card", tr: "Pet pasaportu ya da aşı kartı" }),
              t({ en: "A list of food, treats and medicines, with doses", tr: "Mama, ödül ve ilaç listesi, dozlarıyla" }),
              t({ en: "Cats and small pets in a closed carrier; dogs on a short lead", tr: "Kedi ve küçük dostlar kapalı taşıma çantasında; köpekler kısa tasmayla" }),
              t({ en: "For rabbits: a handful of their usual hay", tr: "Tavşanlar için: alıştıkları ottan bir avuç" }),
              t({ en: "A favourite treat — we reward bravery", tr: "Sevdiği bir ödül — cesareti ödüllendiririz" }),
            ]}
            media={{ ...photos.room, alt: t(photos.room.alt) }}
            aspect="4:5"
          />
          <Team
            {...common}
            variant="portrait"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Vets & nurses", tr: "Hekimler ve hemşireler" })}
            title={t({ en: "Ask for the *same vet* every time", tr: "Her seferinde *aynı hekimi* isteyin" })}
            lead={t({ en: "Every pet has a named vet. The team page shows who sees which species and on which days.", tr: "Her dostun adı belli bir hekimi var. Ekip sayfasında kimin hangi türe, hangi günlerde baktığı yazıyor." })}
            members={team.map((v) => ({ name: v.name, title: v.title ? t(v.title) : undefined, role: t(v.role), photo: { ...v.photo, alt: t(v.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="wall"
            eyebrow={t({ en: "Owners", tr: "Sahipleri" })}
            title={t({ en: "In their *own words*", tr: "*Kendi sözleriyle*" })}
            items={[
              { quote: t({ en: "Pamuk hides under the sofa when the carrier comes out. Here she was out of it within five minutes and purring on Dr Korkmaz’s lap.", tr: "Pamuk taşıma çantasını görünce kanepenin altına saklanır. Burada beş dakikada çantadan çıktı ve Dr. Korkmaz’ın kucağında mırladı." }), author: "Ezgi B.", role: t({ en: "Pamuk, 14-year-old cat", tr: "Pamuk, 14 yaşında kedi" }) },
              { quote: t({ en: "They called at 23:00 to say Tarçın was awake after his surgery. I hadn’t even asked.", tr: "Tarçın ameliyattan uyandı diye gece 23:00’te aradılar. Ben sormamıştım bile." }), author: "Kaan Ö.", role: t({ en: "Tarçın, 3-year-old beagle", tr: "Tarçın, 3 yaşında beagle" }) },
              { quote: t({ en: "Finally a vet who knows rabbits. Dr Erten explained the teeth thing with a drawing I still have on the fridge.", tr: "Sonunda tavşandan anlayan bir veteriner. Dr. Erten diş meselesini bir çizimle anlattı; hâlâ buzdolabımda duruyor." }), author: "Deniz A.", role: t({ en: "Fıstık and Bulut, rabbits", tr: "Fıstık ve Bulut, tavşanlar" }) },
              { quote: t({ en: "Clear prices before anything was done, and a payment plan for the dental without me having to ask twice.", tr: "Her şeyden önce net fiyatlar ve diş tedavisi için iki kez sormama gerek kalmadan bir ödeme planı." }), author: "Murat T.", role: t({ en: "Lokum, 9-year-old terrier", tr: "Lokum, 9 yaşında terrier" }) },
            ]}
          />
          <MapHours
            {...common}
            anchor="find-us"
            variant="map-split"
            eyebrow={t({ en: "Find us", tr: "Ulaşım" })}
            title={t({ en: "Two streets from the *Moda* tram stop", tr: "*Moda* tramvay durağına iki sokak" })}
            businessType="LocalBusiness"
            branches={[place]}
          />
          <Faq
            {...common}
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *come in*", tr: "Gelmeden *önce*" })}
            contact={{ link: { href: `tel:${PHONE}`, label: t({ en: "Or call the desk", tr: "Ya da danışmayı arayın" }) }, style: "link" }}
            items={[
              { q: t({ en: "What happens out of hours?", tr: "Mesai dışında ne oluyor?" }), a: t({ en: "Call the clinic number. A vet on call answers, gives advice and, if your pet needs to be seen, meets you at the clinic — usually within 40 minutes. The out-of-hours fee is 2.800 ₺ on top of treatment.", tr: "Klinik numarasını arayın. Nöbetçi veteriner yanıtlar, önerilerde bulunur ve gerekiyorsa sizi klinikte karşılar — genellikle 40 dakika içinde. Mesai dışı ücreti tedaviye ek olarak 2.800 ₺’dir." }) },
              { q: t({ en: "Can I stay with my pet during the exam?", tr: "Muayene sırasında dostumun yanında kalabilir miyim?" }), a: t({ en: "Yes, always for consultations and vaccinations. For X-rays and surgery we will ask you to wait outside and call you as soon as we are done.", tr: "Evet; muayene ve aşılarda her zaman. Röntgen ve ameliyatta dışarıda beklemenizi rica eder, biter bitmez sizi ararız." }) },
              { q: t({ en: "Do you work with pet insurance?", tr: "Evcil hayvan sigortasıyla çalışıyor musunuz?" }), a: t({ en: "We fill in claim forms for every insurer at no charge. You pay us and the insurer pays you back; for bills over 10.000 ₺ we can bill some insurers directly.", tr: "Her sigortanın talep formunu ücretsiz doldururuz. Siz bize ödersiniz, sigorta size geri öder; 10.000 ₺ üzerindeki faturalarda bazı sigortalara doğrudan fatura kesebiliriz." }) },
              { q: t({ en: "Can I spread the cost of surgery?", tr: "Ameliyat ücretini bölebilir miyim?" }), a: t({ en: "Yes. Planned surgery and dental work can be paid in three or six monthly instalments with no interest on most cards.", tr: "Evet. Planlı ameliyat ve diş tedavileri çoğu kartta faizsiz üç ya da altı taksitle ödenebilir." }) },
              { q: t({ en: "Do you do home visits?", tr: "Eve geliyor musunuz?" }), a: t({ en: "For elderly pets, very anxious pets and end-of-life care, yes — on weekday afternoons within Kadıköy and Üsküdar. Please call to arrange.", tr: "Yaşlı, çok kaygılı dostlar ve yaşamın son dönemi bakımı için evet — hafta içi öğleden sonraları Kadıköy ve Üsküdar içinde. Ayarlamak için lütfen arayın." }) },
            ]}
          />
          <Cta
            {...common}
            variant="band"
            title={t({ en: "New to Pawbridge? Your first health check is *on us*.", tr: "Pawbridge’de yeni misiniz? İlk sağlık kontrolü *bizden*." })}
            lead={t({ en: "For pets registering before 31 December 2026. Vaccinations and tests at the normal price.", tr: "31 Aralık 2026’dan önce kayıt olan dostlar için. Aşı ve tahliller normal fiyatından." })}
            actions={[{ link: { href: book, label: t({ en: "Request a first visit", tr: "İlk ziyaret iste" }) }, style: "primary" }]}
            contact={{ phone: PHONE }}
          />
        </SiteShellPage>

        <SiteShellPage id="services" title={t({ en: "Services & fees — Pawbridge Vets", tr: "Hizmetler ve ücretler — Pawbridge Veteriner" })}>
          <ServicesPage />
        </SiteShellPage>

        <SiteShellPage id="team" title={t({ en: "Team — Pawbridge Vets", tr: "Ekip — Pawbridge Veteriner" })}>
          <TeamPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Pawbridge Vets", href: home() }}
        about={t({ en: "A small-animal practice for dogs, cats, rabbits and birds in Kadıköy since 2015.", tr: "2015’ten beri Kadıköy’de köpek, kedi, tavşan ve kuşlar için küçük hayvan kliniği." })}
        columns={[
          { title: t({ en: "Clinic", tr: "Klinik" }), links: [{ href: sitePageHref("services"), label: t({ en: "Services & fees", tr: "Hizmetler ve ücretler" }) }, { href: sitePageHref("team"), label: t({ en: "Team", tr: "Ekip" }) }, { href: book, label: t({ en: "Book a visit", tr: "Randevu iste" }) }] },
          { title: t({ en: "Owners", tr: "Sahipler" }), links: [{ href: home("first-visit"), label: t({ en: "Your first visit", tr: "İlk ziyaretiniz" }) }, { href: home("find-us"), label: t({ en: "Opening hours", tr: "Çalışma saatleri" }) }, { href: "/payment-plans", label: t({ en: "Payment plans", tr: "Ödeme planları" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        company={{ legalName: "Pawbridge Veteriner Hizmetleri Ltd. Şti.", registry: [{ label: t({ en: "Licence", tr: "Ruhsat" }), value: "34-VK-0000" }] }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }]}
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
