import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, MediaText, Navbar, SiteShellPage, sitePageHref, Steps, Team, Testimonials } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BookingPage } from "./booking-page";
import { branch, copyFor, EMAIL, PHONE, photos, team, tl, type SiteLocale } from "./content";
import { DietHero } from "./home-parts";
import { ProgrammePicker } from "./programme-picker";
import { ProgrammesPage } from "./programmes-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const book = sitePageHref("booking");

/** One language version of Greenplate Nutrition: navbar, three pages and the footer. */
export function DietitianSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Greenplate"
        homeHref={home()}
        items={[
          { label: t({ en: "Programmes", tr: "Programlar" }), href: sitePageHref("programmes") },
          { label: t({ en: "Find yours", tr: "Size uygun olan" }), href: home("picker") },
          { label: t({ en: "Dietitians", tr: "Diyetisyenler" }), href: home("team") },
          { label: t({ en: "Visit us", tr: "Ulaşım" }), href: home("visit") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: book, label: t({ en: "Book", tr: "Randevu" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Greenplate Nutrition — dietitians in Ataşehir and online", tr: "Greenplate Beslenme — Ataşehir’de ve çevrim içi diyetisyenler" })}>
          <DietHero locale={locale} />
          <ProgrammePicker anchor="picker" surface="surface-2" />
          <Steps
            {...common}
            variant="horizontal"
            eyebrow={t({ en: "How it works", tr: "Nasıl işler" })}
            title={t({ en: "From first visit to *no longer needing us*", tr: "İlk görüşmeden *bize ihtiyaç kalmamasına*" })}
            steps={[
              { title: t({ en: "First consultation", tr: "İlk görüşme" }), text: t({ en: "Your history, a three-day food diary and what a normal week looks like.", tr: "Geçmişiniz, üç günlük beslenme günlüğü ve sıradan bir haftanızın nasıl geçtiği." }), duration: t({ en: "60 min", tr: "60 dk" }) },
              { title: t({ en: "A plan on one page", tr: "Tek sayfalık plan" }), text: t({ en: "Three changes at a time, written in plain words, emailed the same day.", tr: "Her seferde üç değişiklik, sade bir dille yazılmış, aynı gün e-postayla." }), duration: t({ en: "same day", tr: "aynı gün" }) },
              { title: t({ en: "Follow-ups", tr: "Kontroller" }), text: t({ en: "Short visits to keep what works and drop what doesn’t.", tr: "İşe yarayanı tutmak, yaramayanı bırakmak için kısa görüşmeler." }), duration: t({ en: "30 min", tr: "30 dk" }) },
              { title: t({ en: "A handover", tr: "Devir" }), text: t({ en: "The last visit is about carrying on alone, with a plan for holidays and busy months.", tr: "Son görüşme, tatiller ve yoğun aylar için bir planla tek başınıza devam etmek üzerinedir." }) },
            ]}
          />
          <MediaText
            {...common}
            variant="side"
            mediaSide="end"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Plans, not prescriptions", tr: "Reçete değil, plan" })}
            title={t({ en: "Built from your *shopping receipt*", tr: "*Market fişinizden* yola çıkarak" })}
            body={t({
              en: "Bring a photo of last week’s shopping receipt to your first visit. We build your plan from the food you already buy, the market you go to and the twenty minutes you actually have for dinner.",
              tr: "İlk görüşmeye geçen haftaki market fişinizin fotoğrafını getirin. Planınızı zaten aldığınız yiyeceklerden, gittiğiniz marketten ve akşam yemeğine gerçekten ayırabildiğiniz yirmi dakikadan kurarız.",
            })}
            bullets={[
              t({ en: "No supplements sold, no brands recommended for money", tr: "Takviye satmayız, para karşılığı marka önermeyiz" }),
              t({ en: "Medical conditions handled together with your doctor", tr: "Tıbbi durumlar hekiminizle birlikte ele alınır" }),
              t({ en: "Plans in Turkish or English", tr: "Türkçe ya da İngilizce planlar" }),
            ]}
            media={{ ...photos.prep, alt: t(photos.prep.alt) }}
            aspect="3:2"
          />
          <Team
            {...common}
            anchor="team"
            variant="portrait"
            eyebrow={t({ en: "Dietitians", tr: "Diyetisyenler" })}
            title={t({ en: "Three dietitians, *one* way of working", tr: "Üç diyetisyen, *tek* çalışma biçimi" })}
            lead={t({ en: "All hold a bachelor’s degree in nutrition and dietetics and meet every Monday to review difficult cases together.", tr: "Hepsi beslenme ve diyetetik lisans mezunudur ve zor vakaları birlikte değerlendirmek için her pazartesi toplanır." })}
            members={team.map((d) => ({ name: d.name, role: t(d.role), specialty: t(d.focus), photo: { ...d.photo, alt: t(d.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="wall"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "First visits", tr: "İlk görüşmeler" })}
            title={t({ en: "What people *walk in* with", tr: "İnsanlar *neyle* geliyor" })}
            items={[
              { quote: t({ en: "I work night shifts and honestly don’t know when breakfast is supposed to be.", tr: "Gece vardiyasında çalışıyorum ve kahvaltının ne zaman olması gerektiğini gerçekten bilmiyorum." }), author: t({ en: "Nurse, first visit", tr: "Hemşire, ilk görüşme" }), role: t({ en: "Now on Steady", tr: "Şu an İstikrar programında" }) },
              { quote: t({ en: "My first trail ultra is in May and I have no idea what to eat after 30 kilometres.", tr: "İlk patika ultram mayısta ve 30 kilometreden sonra ne yiyeceğimi bilmiyorum." }), author: t({ en: "Trail runner, first visit", tr: "Patika koşucusu, ilk görüşme" }), role: t({ en: "Now on Performance", tr: "Şu an Performans programında" }) },
              { quote: t({ en: "Our six-year-old eats four things. We would like dinner to stop being a negotiation.", tr: "Altı yaşındaki kızımız dört şey yiyor. Akşam yemeğinin pazarlık olmaktan çıkmasını istiyoruz." }), author: t({ en: "Two parents, first visit", tr: "İki ebeveyn, ilk görüşme" }), role: t({ en: "Now on Family Table", tr: "Şu an Aile Sofrası programında" }) },
            ]}
          />
          <Faq
            {...common}
            variant="columns"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *book*", tr: "Randevu almadan *önce*" })}
            items={[
              { q: t({ en: "Will you put me on a diet?", tr: "Beni diyete mi sokacaksınız?" }), a: t({ en: "No. We don’t hand out calorie sheets or banned-food lists. Plans change a few habits at a time, around what you already eat.", tr: "Hayır. Kalori listesi ya da yasak yiyecek listesi vermeyiz. Planlar, zaten yediklerinizin etrafında, her seferinde birkaç alışkanlığı değiştirir." }) },
              { q: t({ en: "Do I need a doctor’s referral?", tr: "Hekim sevki gerekiyor mu?" }), a: t({ en: "Not to book. For diabetes, kidney conditions, eating disorders or pregnancy complications we work alongside your doctor and will ask for recent results.", tr: "Randevu için gerekmez. Diyabet, böbrek hastalıkları, yeme bozuklukları ya da gebelik komplikasyonlarında hekiminizle birlikte çalışır, güncel sonuçlarınızı isteriz." }) },
              { q: t({ en: "Is online as useful as the clinic?", tr: "Çevrim içi klinik kadar faydalı mı?" }), a: t({ en: "For most programmes, yes, and it is 10% less. Body-composition scans and the sweat-rate test need a clinic visit.", tr: "Çoğu program için evet ve %10 daha uygundur. Vücut analizi ve terleme testi için kliniğe gelmeniz gerekir." }) },
              { q: t({ en: "Can I pay in instalments?", tr: "Taksitle ödeyebilir miyim?" }), a: t({ en: "Programmes can be paid in up to three instalments on most cards at no extra cost.", tr: "Programlar çoğu kartta ek ücret olmadan üç taksite kadar ödenebilir." }) },
              { q: t({ en: "What if I need to pause?", tr: "Ara vermem gerekirse?" }), a: t({ en: "Pause once for up to eight weeks — illness, travel, a new baby. The remaining visits wait for you.", tr: "Bir kez, sekiz haftaya kadar ara verebilirsiniz — hastalık, seyahat, yeni bebek. Kalan görüşmeler sizi bekler." }) },
              { q: t({ en: "Is my health information private?", tr: "Sağlık bilgilerim gizli mi?" }), a: t({ en: "Yes. Records stay in our clinic system in Türkiye, are seen only by your dietitian and are never shared with gyms, brands or insurers.", tr: "Evet. Kayıtlar Türkiye’deki klinik sistemimizde kalır, yalnızca diyetisyeniniz görür ve spor salonları, markalar ya da sigortalarla asla paylaşılmaz." }) },
            ]}
          />
          <MapHours
            {...common}
            anchor="visit"
            variant="map-split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Visit us", tr: "Ulaşım" })}
            title={t({ en: "Five minutes from the *metro*", tr: "*Metroya* beş dakika" })}
            businessType="LocalBusiness"
            branches={[place]}
          />
          <Cta
            {...common}
            variant="band"
            title={t({ en: "Start with one *60-minute* consultation", tr: "*60 dakikalık* tek bir görüşmeyle başlayın" })}
            lead={`${tl(2200, locale)}${t({ en: ", deducted if you continue with a programme within a month.", tr: "; bir ay içinde bir programa geçerseniz düşülür." })}`}
            actions={[{ link: { href: book, label: t({ en: "Book a first consultation", tr: "İlk görüşmeyi ayırtın" }) }, style: "primary" }]}
            contact={{ phone: PHONE }}
          />
        </SiteShellPage>

        <SiteShellPage id="programmes" title={t({ en: "Programmes — Greenplate Nutrition", tr: "Programlar — Greenplate Beslenme" })}>
          <ProgrammesPage />
        </SiteShellPage>

        <SiteShellPage id="booking" title={t({ en: "Booking — Greenplate Nutrition", tr: "Randevu — Greenplate Beslenme" })}>
          <BookingPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Greenplate Nutrition", href: home() }}
        about={t({ en: "Registered dietitians in Ataşehir and online since 2019. We sell advice, never supplements.", tr: "2019’dan beri Ataşehir’de ve çevrim içi diyetisyenler. Takviye değil, danışmanlık satıyoruz." })}
        columns={[
          { title: t({ en: "Programmes", tr: "Programlar" }), links: [{ href: sitePageHref("programmes"), label: t({ en: "All programmes", tr: "Tüm programlar" }) }, { href: home("picker"), label: t({ en: "Programme picker", tr: "Program seçici" }) }, { href: sitePageHref("programmes", "single"), label: t({ en: "Single sessions", tr: "Tek görüşmeler" }) }] },
          { title: t({ en: "Clinic", tr: "Klinik" }), links: [{ href: home("team"), label: t({ en: "Dietitians", tr: "Diyetisyenler" }) }, { href: home("visit"), label: t({ en: "Opening hours", tr: "Çalışma saatleri" }) }, { href: book, label: t({ en: "Book", tr: "Randevu" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        company={{ legalName: "Greenplate Beslenme Danışmanlığı Ltd. Şti." }}
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
