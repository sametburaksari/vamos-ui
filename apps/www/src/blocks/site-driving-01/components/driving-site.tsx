import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, Navbar, SiteShellPage, StatsBand, Steps, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { CoursesPage } from "./courses-page";
import { CourseLanes, DrivingHero } from "./home-parts";
import { SignupPage } from "./signup-page";
import { branch, copyFor, EMAIL, faqs, instructors, PHONE, reviews, type SiteLocale } from "./content";

const home = (anchor?: string) => sitePageHref("home", anchor);
const signup = sitePageHref("signup");

/** One language version of Clearroad Driving: home, courses (the comparison) and sign-up. */
export function DrivingSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const school = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="rail"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2 font-display font-black tracking-[-0.03em]">
            <span aria-hidden className="grid size-6 place-items-center rounded-[4px] border-2 border-accent bg-surface text-[13px] leading-none text-accent-ink">
              L
            </span>
            clearroad
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Courses", tr: "Kurslar" }), href: sitePageHref("courses") },
          { label: t({ en: "How it works", tr: "Nasıl işler" }), href: home("how") },
          { label: t({ en: "Instructors", tr: "Eğitmenler" }), href: home("instructors") },
          { label: t({ en: "Contact", tr: "İletişim" }), href: home("contact") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: `tel:${PHONE}`, label: t({ en: "Call us", tr: "Arayın" }) }, style: "secondary" },
          { link: { href: signup, label: t({ en: "Sign up", tr: "Kayıt ol" }) }, style: "primary" },
        ]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Clearroad Driving — driving lessons in Ataşehir", tr: "Clearroad Sürücü Kursu — Ataşehir’de direksiyon dersi" })}>
          <DrivingHero />
          <StatsBand
            {...common}
            variant="ledger"
            items={[
              { value: t({ en: "84%", tr: "%84" }), label: t({ en: "pass first time on Standard", tr: "Standart’ta ilk seferde geçiyor" }) },
              { value: t({ en: "2,310", tr: "2.310" }), label: t({ en: "licences since 2014", tr: "2014’ten beri ehliyet" }) },
              { value: "11", label: t({ en: "instructors, all full-time", tr: "eğitmen, hepsi tam zamanlı" }) },
              { value: "9", label: t({ en: "dual-control cars, none over 3 years", tr: "çift kumandalı araç, hiçbiri 3 yaşından büyük değil" }) },
            ]}
          />
          <CourseLanes />
          <Steps
            {...common}
            anchor="how"
            variant="vertical"
            eyebrow={t({ en: "How it works", tr: "Nasıl işler" })}
            title={t({ en: "From first lesson to *test day*", tr: "İlk dersten *sınav gününe*" })}
            steps={[
              { title: t({ en: "Free trial lesson", tr: "Ücretsiz deneme dersi" }), text: t({ en: "Thirty minutes in a quiet car park with your future instructor. No commitment.", tr: "Gelecekteki eğitmeninizle sakin bir otoparkta otuz dakika. Taahhüt yok." }), duration: t({ en: "30 min", tr: "30 dk" }) },
              { title: t({ en: "Theory & simulator", tr: "Teori ve simülatör" }), text: t({ en: "Online modules at your pace, classes on Tuesday and Thursday evenings, simulator for hill starts.", tr: "Kendi hızınızda çevrimiçi modüller, salı ve perşembe akşamları sınıf, rampa kalkışı için simülatör." }), duration: t({ en: "4 weeks", tr: "4 hafta" }) },
              { title: t({ en: "Lessons on real roads", tr: "Gerçek yolda dersler" }), text: t({ en: "From lesson four you drive parts of the actual test route around Kayışdağı.", tr: "Dördüncü dersten itibaren Kayışdağı çevresindeki gerçek sınav güzergâhının bölümlerini sürersiniz." }) },
              { title: t({ en: "Mock test", tr: "Deneme sınavı" }), text: t({ en: "A full test with a different instructor marking you, so the real one feels familiar.", tr: "Sizi başka bir eğitmenin değerlendirdiği tam bir sınav; böylece gerçeği tanıdık gelir." }), duration: t({ en: "40 min", tr: "40 dk" }) },
              { title: t({ en: "Test day", tr: "Sınav günü" }), text: t({ en: "A warm-up lesson in the same car, then your instructor waits for you at the centre.", tr: "Aynı araçla ısınma dersi; ardından eğitmeniniz sizi sınav merkezinde bekler." }) },
            ]}
          />
          <Team
            {...common}
            anchor="instructors"
            variant="list"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Instructors", tr: "Eğitmenler" })}
            title={t({ en: "Calm voices in the *passenger seat*", tr: "Yolcu koltuğunda *sakin sesler*" })}
            members={instructors.map((m) => ({ name: m.name, role: t(m.role), specialty: t(m.specialty), photo: { ...m.photo, alt: t(m.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="wall"
            eyebrow={t({ en: "Passed with us", tr: "Bizimle geçenler" })}
            title={t({ en: "In their *own words*", tr: "*Kendi sözleriyle*" })}
            summary={{ rating: 4.9, count: 418, source: "google" }}
            items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, role: t(r.role), rating: 5, source: "google" as const, date: r.date }))}
          />
          <Faq {...common} variant="columns" eyebrow={t({ en: "Questions", tr: "Sorular" })} title={t({ en: "Good to *know*", tr: "Bilmekte *fayda var*" })} items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))} />
          <MapHours
            {...common}
            anchor="contact"
            variant="map-split"
            eyebrow={t({ en: "Office & classroom", tr: "Ofis ve sınıf" })}
            title={t({ en: "Above the bakery on *Kayışdağı Caddesi*", tr: "*Kayışdağı Caddesi*’nde, fırının üstünde" })}
            businessType="LocalBusiness"
            branches={[school]}
          />
          <Cta
            {...common}
            variant="split"
            title={t({ en: "Not sure you’re ready? Try 30 minutes free.", tr: "Hazır olduğunuzdan emin değil misiniz? 30 dakikayı ücretsiz deneyin." })}
            lead={t({ en: "A quiet car park, your future instructor, no commitment. Most people book a course afterwards — some don’t, and that is fine.", tr: "Sakin bir otopark, gelecekteki eğitmeniniz, taahhüt yok. Çoğu kişi ardından kursa yazılır — yazılmayanlar da olur, sorun değil." })}
            actions={[{ link: { href: signup, label: t({ en: "Book the trial lesson", tr: "Deneme dersini ayırt" }) }, style: "primary" }, { link: { href: sitePageHref("courses"), label: t({ en: "Compare courses", tr: "Kursları karşılaştır" }) }, style: "secondary" }]}
          />
        </SiteShellPage>

        <SiteShellPage id="courses" title={t({ en: "Courses compared — Clearroad Driving", tr: "Kurs karşılaştırması — Clearroad" })}>
          <CoursesPage />
        </SiteShellPage>

        <SiteShellPage id="signup" title={t({ en: "Sign up — Clearroad Driving", tr: "Kayıt — Clearroad" })}>
          <SignupPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Clearroad Driving", href: home() }}
        about={t({ en: "Car and motorcycle lessons in Ataşehir since 2014. Licensed by the provincial directorate of education.", tr: "2014’ten beri Ataşehir’de otomobil ve motosiklet dersleri. İl milli eğitim müdürlüğü izinlidir." })}
        columns={[
          { title: t({ en: "Learn", tr: "Öğren" }), links: [{ href: sitePageHref("courses"), label: t({ en: "Compare courses", tr: "Kursları karşılaştır" }) }, { href: signup, label: t({ en: "Sign up", tr: "Kayıt ol" }) }, { href: home("how"), label: t({ en: "How it works", tr: "Nasıl işler" }) }] },
          { title: t({ en: "School", tr: "Okul" }), links: [{ href: home("instructors"), label: t({ en: "Instructors", tr: "Eğitmenler" }) }, { href: home("contact"), label: t({ en: "Contact", tr: "İletişim" }) }, { href: "/careers", label: t({ en: "Become an instructor", tr: "Eğitmen olun" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: school.address }}
        company={{ legalName: "Clearroad Sürücü Kursu Ltd. Şti.", registry: [{ label: t({ en: "Licence", tr: "İzin no." }), value: "34-MTSK-0000" }] }}
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
