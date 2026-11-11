import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, MediaText, Navbar, SiteShellPage, sitePageHref, StatsBand, Steps, Team } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BookingPage } from "./booking-page";
import { areas, branch, copyFor, EMAIL, PHONE, photos, team, tl, type SiteLocale } from "./content";
import { PhysioHero } from "./home-parts";
import { TreatmentsPage } from "./treatments-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const book = sitePageHref("booking");

/** One language version of Motion Lab Physio: navbar, three pages and the footer. */
export function PhysioSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="MOTION LAB"
        homeHref={home()}
        items={[
          { label: t({ en: "Treatments", tr: "Tedaviler" }), href: sitePageHref("treatments") },
          { label: t({ en: "Physios", tr: "Fizyoterapistler" }), href: home("team") },
          { label: t({ en: "The gym", tr: "Salon" }), href: home("gym") },
          { label: t({ en: "Find us", tr: "Ulaşım" }), href: home("find-us") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: book, label: t({ en: "Book a slot", tr: "Randevu al" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Motion Lab Physio — physiotherapy in Suadiye, Kadıköy", tr: "Motion Lab Fizyoterapi — Suadiye, Kadıköy’de fizyoterapi" })}>
          <PhysioHero />
          <StatsBand
            {...common}
            variant="ledger"
            items={[
              { value: 3, label: t({ en: "physiotherapists, all full-time", tr: "fizyoterapist, hepsi tam zamanlı" }) },
              { value: 140, unit: "m²", unitLabel: t({ en: "square metres", tr: "metrekare" }), label: t({ en: "rehab gym on the same floor", tr: "aynı katta rehabilitasyon salonu" }) },
              { value: Object.keys(areas).length, label: t({ en: "body areas we see most", tr: "en sık baktığımız bölge" }) },
              { value: 24, unit: t({ en: "h", tr: "sa" }), unitLabel: t({ en: "hours", tr: "saat" }), label: t({ en: "free cancellation window", tr: "ücretsiz iptal süresi" }) },
            ]}
          />
          <Steps
            {...common}
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Your first visit", tr: "İlk ziyaretiniz" })}
            title={t({ en: "Sixty minutes, *four* parts", tr: "Altmış dakika, *dört* bölüm" })}
            steps={[
              { title: t({ en: "Your story", tr: "Hikâyeniz" }), text: t({ en: "When it started, what makes it better or worse, what you want to get back to.", tr: "Ne zaman başladı, neyle iyileşiyor ya da kötüleşiyor, neye geri dönmek istiyorsunuz." }), duration: t({ en: "15 min", tr: "15 dk" }) },
              { title: t({ en: "Movement tests", tr: "Hareket testleri" }), text: t({ en: "Strength, range and the movements that bother you, filmed if it helps you see them.", tr: "Kuvvet, hareket açıklığı ve sizi zorlayan hareketler; görmenize yardımcı olacaksa videoya alınır." }), duration: t({ en: "20 min", tr: "20 dk" }) },
              { title: t({ en: "First treatment", tr: "İlk tedavi" }), text: t({ en: "Hands-on work or a first exercise session, depending on what we find.", tr: "Bulgulara göre manuel çalışma ya da ilk egzersiz seansı." }), duration: t({ en: "20 min", tr: "20 dk" }) },
              { title: t({ en: "A written plan", tr: "Yazılı plan" }), text: t({ en: "How many visits we suggest, two exercises for home, and when to call us.", tr: "Önerdiğimiz seans sayısı, ev için iki egzersiz ve bizi ne zaman aramanız gerektiği." }), duration: t({ en: "5 min", tr: "5 dk" }) },
            ]}
            actions={[{ link: { href: book, label: t({ en: "Book an assessment", tr: "Değerlendirme ayırt" }) }, style: "primary" }]}
          />
          <MediaText
            {...common}
            anchor="gym"
            variant="bleed"
            mediaSide="start"
            eyebrow={t({ en: "The gym", tr: "Salon" })}
            title={t({ en: "Treatment ends with *you* moving", tr: "Tedavi *sizin* hareketinizle biter" })}
            body={t({
              en: "Every session finishes in the gym next door: racks, a reformer, a treadmill with video and a 20-metre lane. You leave knowing exactly what to do until the next visit.",
              tr: "Her seans yandaki salonda biter: kafes, reformer, videolu koşu bandı ve 20 metrelik bir şerit. Bir sonraki ziyarete kadar ne yapacağınızı tam olarak bilerek ayrılırsınız.",
            })}
            bullets={[
              t({ en: "Home programmes as short videos in the Motion Lab app", tr: "Ev programları Motion Lab uygulamasında kısa videolar olarak" }),
              t({ en: "Use the gym free for two weeks after your last session", tr: "Son seansınızdan sonra iki hafta salonu ücretsiz kullanın" }),
              t({ en: "Showers, lockers and towels", tr: "Duş, dolap ve havlu" }),
            ]}
            media={{ ...photos.gym, alt: t(photos.gym.alt) }}
            aspect="3:2"
          />
          <Team
            {...common}
            anchor="team"
            variant="portrait"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Physios", tr: "Fizyoterapistler" })}
            title={t({ en: "Three physios, *one* plan", tr: "Üç fizyoterapist, *tek* plan" })}
            lead={t({ en: "Your physio stays the same from assessment to discharge. They meet every Friday to review progress together.", tr: "Değerlendirmeden taburcu olana kadar fizyoterapistiniz değişmez. İlerlemeyi birlikte gözden geçirmek için her cuma toplanırlar." })}
            members={team.map((p) => ({ name: p.name, role: t(p.role), specialty: t(p.focus), photo: { ...p.photo, alt: t(p.photo.alt) } }))}
          />
          <Faq
            {...common}
            variant="split"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "What people *ask*", tr: "En çok *sorulanlar*" })}
            items={[
              { q: t({ en: "How many sessions will I need?", tr: "Kaç seansa ihtiyacım olacak?" }), a: t({ en: "It depends on you and the problem, and we tell you our estimate at the first visit. The body map shows typical ranges per area, not a promise.", tr: "Size ve soruna bağlı; tahminimizi ilk ziyarette söyleriz. Vücut haritası her bölge için olağan aralıkları gösterir, bir söz değildir." }) },
              { q: t({ en: "Is it going to hurt?", tr: "Acıyacak mı?" }), a: t({ en: "Some tests and exercises can be uncomfortable; we agree a level with you first and stop when you say so.", tr: "Bazı testler ve egzersizler rahatsız edici olabilir; önce sizinle bir seviye belirleriz ve siz dediğinizde dururuz." }) },
              { q: t({ en: "Do you treat children?", tr: "Çocuklara bakıyor musunuz?" }), a: t({ en: "From age 12, with a parent in the room. For younger children we recommend a paediatric physiotherapist.", tr: "12 yaşından itibaren, bir ebeveyn odadayken. Daha küçük çocuklar için pediatrik fizyoterapist öneririz." }) },
              { q: t({ en: "Do you work with surgeons?", tr: "Cerrahlarla çalışıyor musunuz?" }), a: t({ en: "Yes. Bring your surgeon’s protocol; we follow it and send short progress notes if you want us to.", tr: "Evet. Cerrahınızın protokolünü getirin; ona uyar, isterseniz kısa ilerleme notları göndeririz." }) },
            ]}
          />
          <MapHours
            {...common}
            anchor="find-us"
            variant="map-split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Find us", tr: "Ulaşım" })}
            title={t({ en: "Two minutes from *Suadiye* station", tr: "*Suadiye* istasyonuna iki dakika" })}
            businessType="LocalBusiness"
            branches={[place]}
          />
          <Cta
            {...common}
            variant="band"
            theme={{ mode: "dark", surface: "scene" }}
            eyebrow={t({ en: "Initial assessment", tr: "İlk değerlendirme" })}
            title={t({ en: "Come in sore, *leave with a plan*", tr: "Ağrıyla gelin, *planla çıkın*" })}
            lead={`${t({ en: "60 minutes", tr: "60 dakika" })} · ${tl(2600, locale)} · ${t({ en: "free cancellation up to 24 hours before", tr: "24 saat öncesine kadar ücretsiz iptal" })}`}
            actions={[{ link: { href: book, label: t({ en: "See free slots", tr: "Boş saatleri gör" }) }, style: "primary" }]}
            contact={{ phone: PHONE }}
          />
        </SiteShellPage>

        <SiteShellPage id="treatments" title={t({ en: "Treatments — Motion Lab Physio", tr: "Tedaviler — Motion Lab Fizyoterapi" })}>
          <TreatmentsPage />
        </SiteShellPage>

        <SiteShellPage id="booking" title={t({ en: "Booking — Motion Lab Physio", tr: "Randevu — Motion Lab Fizyoterapi" })}>
          <BookingPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Motion Lab Physio", href: home() }}
        about={t({ en: "Physiotherapy, rehab and Clinical Pilates in Suadiye since 2020.", tr: "2020’den beri Suadiye’de fizyoterapi, rehabilitasyon ve Klinik Pilates." })}
        columns={[
          { title: t({ en: "Clinic", tr: "Klinik" }), links: [{ href: sitePageHref("treatments"), label: t({ en: "Treatments", tr: "Tedaviler" }) }, { href: sitePageHref("treatments", "packs"), label: t({ en: "Packs", tr: "Paketler" }) }, { href: book, label: t({ en: "Booking", tr: "Randevu" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        company={{ legalName: "Motion Lab Fizyoterapi Hizmetleri Ltd. Şti." }}
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
