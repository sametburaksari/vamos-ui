import { LocaleProvider } from "@vamos-ui/react";
import { Faq, Footer, MapHours, Navbar, SiteShellPage, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BookPage } from "./book-page";
import { CheckupPath } from "./checkup-path";
import { branch, copyFor, EMAIL, PHONE, type SiteLocale } from "./content";
import { DoctorCircle, KiteHero, ServiceTiles, StoryTeaser } from "./home-parts";
import { StoryPreview, VisitPage } from "./visit-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const book = sitePageHref("book");

/**
 * One language version of Paperkite Children's Clinic: navbar, three pages (home, your visit,
 * book) and the footer. The child and visit being booked live in VisitProvider (page.tsx).
 */
export function ClinicSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark="Paperkite"
        homeHref={home()}
        items={[
          { label: t({ en: "Visits & fees", tr: "Ziyaretler ve ücretler" }), href: home("services") },
          { label: t({ en: "Check-up path", tr: "Kontrol yolu" }), href: home("path") },
          { label: t({ en: "Your visit", tr: "Ziyaretiniz" }), href: sitePageHref("visit") },
          { label: t({ en: "Doctors", tr: "Doktorlar" }), href: home("team") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: book, label: t({ en: "Book a visit", tr: "Randevu al" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Paperkite — children’s clinic in Koşuyolu", tr: "Paperkite — Koşuyolu’nda çocuk kliniği" })}>
          <KiteHero />
          <ServiceTiles />
          <CheckupPath />
          <DoctorCircle />
          <StoryTeaser preview={<StoryPreview />} />
          <Testimonials
            {...common}
            variant="wall"
            eyebrow={t({ en: "From the waiting room", tr: "Bekleme salonundan" })}
            title={t({ en: "What parents *tell us*", tr: "Ebeveynler *ne diyor*" })}
            items={[
              { quote: t({ en: "Dr Arıkan sat on the floor with our son for the whole check. He asks every week when we are going back to “the kite doctor”.", tr: "Dr. Arıkan bütün muayene boyunca oğlumuzla yere oturdu. Her hafta “uçurtma doktoruna” ne zaman gideceğimizi soruyor." }), author: "Elif K.", role: t({ en: "Mum of Deniz, 3", tr: "Deniz’in annesi (3 yaş)" }) },
              { quote: t({ en: "We got a same-day slot at 08:05 for an ear infection and were home by nine.", tr: "Kulak iltihabı için 08.05’te aynı gün randevu aldık, dokuzda evdeydik." }), author: "Murat S.", role: t({ en: "Dad of twins, 5", tr: "İkizlerin babası (5 yaş)" }) },
              { quote: t({ en: "The picture story is genius. Lara knew exactly where the giraffe was before we even got there.", tr: "Resimli hikâye harika. Lara, daha varmadan zürafanın nerede olduğunu biliyordu." }), author: "Zeynep A.", role: t({ en: "Mum of Lara, 4", tr: "Lara’nın annesi (4 yaş)" }) },
              { quote: t({ en: "Nurse Hülya does vaccines faster than my daughter can say “wait”. Then the sticker drawer.", tr: "Hemşire Hülya, kızım “dur” diyemeden aşıyı yapıyor. Sonra çıkartma çekmecesi." }), author: "Can B.", role: t({ en: "Dad of Ece, 18 months", tr: "Ece’nin babası (18 aylık)" }) },
            ]}
          />
          <MapHours
            {...common}
            anchor="find-us"
            variant="map-split"
            eyebrow={t({ en: "Find us", tr: "Ulaşım" })}
            title={t({ en: "The blue door on *Çınarlı Sokak*", tr: "*Çınarlı Sokak*’taki mavi kapı" })}
            businessType="MedicalClinic"
            branches={[place]}
          />
          <Faq
            {...common}
            variant="split"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *come*", tr: "Gelmeden *önce*" })}
            contact={{ link: { href: `tel:${PHONE}`, label: t({ en: "Or call the desk", tr: "Ya da danışmayı arayın" }) }, style: "link" }}
            items={[
              { q: t({ en: "Can we come in the same day?", tr: "Aynı gün gelebilir miyiz?" }), a: t({ en: "Six unwell slots are kept free every morning and released at 08:00, online and by phone. On Sundays we open 10:00–13:00 for unwell children only.", tr: "Her sabah altı hasta randevusu boş tutulur ve 08.00’de çevrimiçi ve telefonla açılır. Pazar günleri yalnızca hasta çocuklar için 10.00–13.00 açığız." }) },
              { q: t({ en: "Up to what age do you see children?", tr: "Kaç yaşına kadar bakıyorsunuz?" }), a: t({ en: "From birth to their sixteenth birthday. From twelve, part of every visit is with the young person alone, if they want.", tr: "Doğumdan on altıncı yaş gününe kadar. On iki yaştan itibaren, isterlerse her ziyaretin bir kısmı gençle baş başa geçer." }) },
              { q: t({ en: "Do you give the national-schedule vaccines?", tr: "Ulusal takvimdeki aşıları yapıyor musunuz?" }), a: t({ en: "Yes, with the visit fee of 750 ₺. Vaccines that are not on the national schedule are priced separately and we tell you the price before booking.", tr: "Evet, 750 ₺ ziyaret ücretiyle. Ulusal takvimde olmayan aşılar ayrıca fiyatlanır; fiyatı randevudan önce söyleriz." }) },
              { q: t({ en: "Is this an emergency clinic?", tr: "Burası acil kliniği mi?" }), a: t({ en: "No. For breathing problems, a seizure, a serious injury or a baby under three months with a fever, call 112 or go to the nearest emergency department.", tr: "Hayır. Nefes sorunu, nöbet, ciddi yaralanma ya da ateşi olan üç aydan küçük bir bebekte 112’yi arayın veya en yakın acil servise gidin." }) },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="visit" title={t({ en: "Your visit — Paperkite", tr: "Ziyaretiniz — Paperkite" })}>
          <VisitPage />
        </SiteShellPage>

        <SiteShellPage id="book" title={t({ en: "Book a visit — Paperkite", tr: "Randevu al — Paperkite" })}>
          <BookPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Paperkite", href: home() }}
        about={t({ en: "A children’s clinic in Koşuyolu, Kadıköy, since 2019. Birth to sixteen.", tr: "2019’dan beri Koşuyolu, Kadıköy’de bir çocuk kliniği. Doğumdan on altı yaşa." })}
        columns={[
          { title: t({ en: "Visits", tr: "Ziyaretler" }), links: [{ href: home("services"), label: t({ en: "Visits and fees", tr: "Ziyaretler ve ücretler" }) }, { href: home("path"), label: t({ en: "Check-up path", tr: "Kontrol yolu" }) }, { href: book, label: t({ en: "Book a visit", tr: "Randevu al" }) }] },
          { title: t({ en: "Families", tr: "Aileler" }), links: [{ href: sitePageHref("visit"), label: t({ en: "Picture story", tr: "Resimli hikâye" }) }, { href: home("team"), label: t({ en: "Doctors", tr: "Doktorlar" }) }, { href: home("find-us"), label: t({ en: "Find us", tr: "Ulaşım" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        social={[{ network: "instagram", href: "https://instagram.com/paperkite.example" }]}
        company={{ legalName: "Paperkite Çocuk Sağlığı Hizmetleri A.Ş.", registry: [{ label: t({ en: "Licence", tr: "Ruhsat" }), value: "34-0000-2019" }] }}
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
