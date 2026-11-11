import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, FeatureGrid, Footer, MapHours, Navbar, SiteShellPage, StatsBand, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { branch, copyFor, EMAIL, PHONE, teachers, type SiteLocale } from "./content";
import { EnrolPage } from "./enrol-page";
import { ProgrammePage } from "./programme-page";
import { FeesSummary, GroupsOverview, RhythmSection, SchoolHero } from "./school-parts";

const home = (anchor?: string) => sitePageHref("home", anchor);
const enrol = sitePageHref("enrol");

/** One language version of Little Orchard: navbar, home · programme · enrol, footer. */
export function PreschoolSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Little Orchard"
        homeHref={home()}
        items={[
          { label: t({ en: "A day here", tr: "Burada bir gün" }), href: home("day") },
          { label: t({ en: "Programme", tr: "Program" }), href: sitePageHref("programme") },
          { label: t({ en: "Fees", tr: "Ücretler" }), href: home("fees") },
          { label: t({ en: "Visit", tr: "Ziyaret" }), href: home("visit") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: enrol, label: t({ en: "Apply", tr: "Başvur" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Little Orchard — bilingual preschool in Suadiye", tr: "Little Orchard — Suadiye’de iki dilli anaokulu" })}>
          <SchoolHero />
          <StatsBand
            {...common}
            variant="inline"
            theme={{ rhythm: "tight" }}
            items={[
              { value: "1:5", label: t({ en: "adults to children, on average", tr: "ortalama yetişkin / çocuk oranı" }) },
              { value: 40, label: t({ en: "children in the whole school", tr: "okulun tamamında çocuk" }) },
              { value: 2, label: t({ en: "languages, every single day", tr: "dil, her gün" }) },
              { value: 420, unit: "m²", unitLabel: t({ en: "square metres", tr: "metrekare" }), label: t({ en: "of garden and roof terrace", tr: "bahçe ve çatı terası" }) },
            ]}
          />
          <RhythmSection />
          <GroupsOverview />
          <FeatureGrid
            {...common}
            variant="grid"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "How we work", tr: "Nasıl çalışıyoruz" })}
            title={t({ en: "Calm adults, *real* materials, lots of outside", tr: "Sakin yetişkinler, *gerçek* malzemeler, bolca açık hava" })}
            items={[
              { title: t({ en: "Two languages, one person each", tr: "İki dil, her birine bir kişi" }), text: t({ en: "Every group has a Turkish-speaking and an English-speaking teacher. Children are never tested; they just hear both all day.", tr: "Her grupta Türkçe ve İngilizce konuşan birer öğretmen var. Çocuklar sınanmaz; gün boyu ikisini de duyar." }) },
              { title: t({ en: "Outside in all weather", tr: "Her havada dışarıda" }), text: t({ en: "At least 90 minutes a day in the garden or on the roof. We provide the waterproofs.", tr: "Günde en az 90 dakika bahçede ya da çatıda. Yağmurlukları biz sağlıyoruz." }) },
              { title: t({ en: "A kitchen, not a caterer", tr: "Catering değil, mutfak" }), text: t({ en: "Ayten Hanım cooks breakfast and lunch here every day; the four-week menu is on the parents’ app.", tr: "Ayten Hanım her gün kahvaltıyı ve öğle yemeğini burada pişirir; dört haftalık menü veli uygulamasında." }) },
              { title: t({ en: "A photo, not a report", tr: "Karne değil, fotoğraf" }), text: t({ en: "One photo and two sentences about your child’s day, every day. A proper conversation with the teacher each term.", tr: "Her gün çocuğunuzun gününden bir fotoğraf ve iki cümle. Her dönem öğretmenle gerçek bir görüşme." }) },
            ]}
          />
          <Team
            {...common}
            variant="portrait"
            eyebrow={t({ en: "Teachers", tr: "Öğretmenler" })}
            title={t({ en: "The *same faces* all year", tr: "Tüm yıl *aynı yüzler*" })}
            lead={t({ en: "Eleven staff for forty children. Our teachers have been here for six years on average.", tr: "Kırk çocuk için on bir çalışan. Öğretmenlerimiz ortalama altı yıldır burada." })}
            members={teachers.map((p) => ({ name: p.name, role: t(p.role), specialty: t(p.specialty), photo: { ...p.photo, alt: t(p.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="feature"
            theme={{ surface: "surface-2" }}
            items={[
              {
                quote: t({ en: "Ada came home singing in English on the third week. What I value more is that she runs to the gate every morning — and that the teachers know exactly why she was grumpy on Tuesday.", tr: "Ada üçüncü haftada eve İngilizce şarkı söyleyerek geldi. Benim için daha değerlisi, her sabah kapıya koşması — ve öğretmenlerin salı günü neden huysuz olduğunu tam olarak bilmesi." }),
                author: "Zeynep Kaya",
                role: t({ en: "Mother of Ada, Saplings", tr: "Ada’nın annesi, Fidanlar" }),
              },
            ]}
          />
          <FeesSummary anchor="fees" />
          <MapHours
            {...common}
            anchor="visit"
            variant="map-split"
            eyebrow={t({ en: "Visit us", tr: "Bizi ziyaret edin" })}
            title={t({ en: "A yellow gate on *Erguvan Sokak*", tr: "*Erguvan Sokak*’ta sarı bir kapı" })}
            businessType="LocalBusiness"
            branches={[place]}
          />
          <Faq
            {...common}
            variant="columns"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "What parents *ask first*", tr: "Velilerin *ilk sorduğu*" })}
            items={[
              { q: t({ en: "How does settling in work?", tr: "Uyum süreci nasıl işliyor?" }), a: t({ en: "Over two weeks: one hour with you in the room on day one, then a little longer and a little further away each day. Most children are happy alone by day eight.", tr: "İki hafta boyunca: ilk gün sizinle birlikte bir saat, sonra her gün biraz daha uzun ve biraz daha uzakta. Çoğu çocuk sekizinci gün tek başına mutludur." }) },
              { q: t({ en: "Does my child need to be out of nappies?", tr: "Çocuğumun bezi bırakmış olması gerekiyor mu?" }), a: t({ en: "No. We help with toilet learning in Sprouts and Saplings when your child is ready, and we supply the nappies.", tr: "Hayır. Çocuğunuz hazır olduğunda Filizler ve Fidanlar’da tuvalet eğitimine yardım ederiz; bezleri de biz sağlarız." }) },
              { q: t({ en: "What about allergies?", tr: "Alerjiler ne olacak?" }), a: t({ en: "The kitchen is nut-free. We cook separate meals for diagnosed allergies and keep each child’s plan on the classroom wall.", tr: "Mutfağımızda kuruyemiş kullanılmaz. Teşhisli alerjiler için ayrı yemek pişirir, her çocuğun planını sınıf duvarında tutarız." }) },
              { q: t({ en: "Can we pay per term?", tr: "Dönemlik ödeyebilir miyiz?" }), a: t({ en: "Yes — pay the term up front and get 4% off, or pay monthly by direct debit on the 1st.", tr: "Evet — dönemi peşin ödeyin, %4 indirim alın; ya da her ayın 1’inde otomatik ödemeyle aylık ödeyin." }) },
              { q: t({ en: "Who can collect my child?", tr: "Çocuğumu kim alabilir?" }), a: t({ en: "Only adults on your list, with ID the first time. Add or remove people in the parents’ app at any time.", tr: "Yalnızca listenizdeki yetişkinler; ilk seferde kimlikle. Veli uygulamasından istediğiniz zaman kişi ekleyip çıkarabilirsiniz." }) },
              { q: t({ en: "Is there a waiting list?", tr: "Bekleme listesi var mı?" }), a: t({ en: "For Sprouts, usually. Apply early; places are offered in order of application once you have visited.", tr: "Filizler için genellikle var. Erken başvurun; yerler ziyaretinizden sonra başvuru sırasına göre verilir." }) },
            ]}
          />
          <Cta
            {...common}
            variant="split"
            title={t({ en: "Come and see it on a *Saturday morning*", tr: "Bir *cumartesi sabahı* gelip görün" })}
            lead={t({ en: "Open mornings run from 10:00 to 11:30. Children are very welcome; the sand garden will be open.", tr: "Tanışma sabahları 10:00–11:30 arası. Çocuklarınızı da getirin; kum bahçesi açık olacak." })}
            actions={[{ link: { href: enrol, label: t({ en: "Book a visit", tr: "Ziyaret ayarla" }) }, style: "primary" }]}
            media={{ src: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=1400&q=72&auto=format&fit=crop", width: 1400, height: 1050, alt: t({ en: "A boy watching deer through a fence on a nature walk", tr: "Doğa yürüyüşünde çitin ardından geyikleri izleyen bir çocuk" }) }}
          />
        </SiteShellPage>

        <SiteShellPage id="programme" title={t({ en: "Programme — Little Orchard", tr: "Program — Little Orchard" })}>
          <ProgrammePage />
        </SiteShellPage>

        <SiteShellPage id="enrol" title={t({ en: "Apply — Little Orchard", tr: "Başvuru — Little Orchard" })}>
          <EnrolPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Little Orchard", href: home() }}
        about={t({ en: "A bilingual preschool for children aged 2 to 6 in Suadiye, since 2017.", tr: "2017’den beri Suadiye’de 2–6 yaş çocuklar için iki dilli anaokulu." })}
        columns={[
          { title: t({ en: "School", tr: "Okul" }), links: [{ href: sitePageHref("programme"), label: t({ en: "Programme", tr: "Program" }) }, { href: home("day"), label: t({ en: "Daily rhythm", tr: "Günlük ritim" }) }, { href: home("fees"), label: t({ en: "Fees", tr: "Ücretler" }) }] },
          { title: t({ en: "Parents", tr: "Veliler" }), links: [{ href: enrol, label: t({ en: "Apply", tr: "Başvur" }) }, { href: home("visit"), label: t({ en: "Open mornings", tr: "Tanışma sabahları" }) }, { href: "/parents-app", label: t({ en: "Parents’ app", tr: "Veli uygulaması" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        company={{ legalName: "Küçük Bahçe Eğitim Hizmetleri A.Ş.", registry: [{ label: t({ en: "Licence", tr: "Ruhsat" }), value: "MEB 000000" }] }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) }, { href: "/safeguarding", label: t({ en: "Safeguarding", tr: "Çocuk koruma" }) }]}
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
