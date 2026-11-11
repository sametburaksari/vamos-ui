import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, FeatureGrid, Footer, GallerySection, MapHours, Navbar, SiteShellPage, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BookingPage } from "./booking-page";
import { branch, copyFor, EMAIL, PHONE, team, work, type SiteLocale } from "./content";
import { PackagesPage, PresetsSection, StudioHero } from "./studio-parts";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** One language version of Lumen Room: navbar, home · packages · booking, footer. */
export function StudioSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const place = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="split"
        sticky
        wordmark="LUMEN ROOM"
        homeHref={home()}
        items={[
          { label: t({ en: "Work", tr: "İşler" }), href: home("work") },
          { label: t({ en: "Studio", tr: "Stüdyo" }), href: home("studio") },
          { label: t({ en: "Packages", tr: "Paketler" }), href: sitePageHref("packages") },
          { label: t({ en: "Visit", tr: "Ziyaret" }), href: home("visit") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("booking"), label: t({ en: "Book", tr: "Ayırt" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Lumen Room — photo studio in Kadıköy", tr: "Lumen Room — Kadıköy’de fotoğraf stüdyosu" })}>
          <StudioHero />
          <GallerySection
            {...common}
            anchor="work"
            variant="mosaic"
            eyebrow={t({ en: "Selected frames, 2024–26", tr: "Seçilmiş kareler, 2024–26" })}
            title={t({ en: "Recent *work*", tr: "Son *işler*" })}
            images={work.map((w, i) => ({ image: { ...w.image, alt: t(w.image.alt) }, caption: `${String(i + 1).padStart(2, "0")} — ${t(w.caption)}`, span: w.span }))}
          />
          <FeatureGrid
            {...common}
            anchor="studio"
            variant="list"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "The room", tr: "Oda" })}
            title={t({ en: "What is *in the room*", tr: "Odada *neler var*" })}
            items={[
              { title: t({ en: "White cyclorama, 7 × 4 m", tr: "Beyaz sonsuz fon, 7 × 4 m" }), text: t({ en: "Repainted every Monday. Can be painted to any colour for a shoot (book it as an extra).", tr: "Her pazartesi yeniden boyanır. Bir çekim için istediğiniz renge boyanabilir (ekstra olarak ekleyin)." }) },
              { title: t({ en: "Eight strobes, two LED panels", tr: "Sekiz flaş, iki LED panel" }), text: t({ en: "Softboxes from 60 cm to a 2.2 m parabolic, grids, flags and a boom arm.", tr: "60 cm’den 2,2 m parabolik reflektöre softbox’lar, grid’ler, bayraklar ve bir bom kolu." }) },
              { title: t({ en: "North daylight", tr: "Kuzey ışığı" }), text: t({ en: "Six tall windows with blackout blinds — soft, even light from 10:00 to 16:00 all year.", tr: "Karartma perdeli altı yüksek pencere — yıl boyu 10:00–16:00 arası yumuşak, eşit ışık." }) },
              { title: t({ en: "Make-up room and rail", tr: "Makyaj odası ve askılık" }), text: t({ en: "Lit mirror for two, a steamer, a 3-metre clothes rail and a changing room with a door.", tr: "İki kişilik ışıklı ayna, buharlı ütü, 3 metrelik askılık ve kapılı bir soyunma odası." }) },
              { title: t({ en: "Tethered capture", tr: "Bilgisayara bağlı çekim" }), text: t({ en: "See every frame on a calibrated 32-inch screen as it is taken.", tr: "Her kareyi çekildiği anda kalibre edilmiş 32 inç ekranda görün." }) },
              { title: t({ en: "Coffee and a long table", tr: "Kahve ve uzun bir masa" }), text: t({ en: "For clients, agencies and the dog that came for the pet shoot.", tr: "Müşteriler, ajanslar ve evcil dost çekimine gelen köpek için." }) },
            ]}
          />
          <PresetsSection />
          <Team
            {...common}
            variant="feature"
            eyebrow={t({ en: "Behind the camera", tr: "Kameranın arkasında" })}
            title={t({ en: "One photographer, *every* shoot", tr: "Her çekimde *aynı* fotoğrafçı" })}
            members={team.map((m) => ({ name: m.name, role: t(m.role), bio: t(m.bio), photo: { ...m.photo, alt: t(m.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="wall"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Clients", tr: "Müşteriler" })}
            title={t({ en: "After the *shoot*", tr: "Çekimden *sonra*" })}
            items={[
              { quote: t({ en: "Twenty-two headshots before lunch, and every one of them looks like the same afternoon. Our careers page finally matches.", tr: "Öğleden önce yirmi iki vesikalık ve hepsi aynı öğleden sonra çekilmiş gibi. Kariyer sayfamız sonunda tutarlı." }), author: "Selin Avcı", role: t({ en: "People lead", tr: "İnsan kaynakları lideri" }), company: "Kayra Yazılım" },
              { quote: t({ en: "The quote from the builder was the invoice. No surprise line for the painted wall.", tr: "Oluşturucudaki teklif faturanın ta kendisiydi. Boyalı duvar için sürpriz kalem yoktu." }), author: "Emre Talu", role: t({ en: "Founder", tr: "Kurucu" }), company: "Ötüken Seramik" },
              { quote: t({ en: "Nil told me the light was wrong for my coat and moved us to the window. That frame is now the cover of the catalogue.", tr: "Nil ışığın montum için yanlış olduğunu söyleyip bizi pencereye taşıdı. O kare şimdi kataloğun kapağı." }), author: "Ayşe Doruk", role: t({ en: "Designer", tr: "Tasarımcı" }), company: "Doruk Atelier" },
            ]}
          />
          <MapHours
            {...common}
            anchor="visit"
            variant="info"
            eyebrow={t({ en: "Visit", tr: "Ziyaret" })}
            title={t({ en: "Third floor of an *old printing works*", tr: "*Eski bir matbaanın* üçüncü katı" })}
            businessType="ProfessionalService"
            branches={[place]}
          />
          <Faq
            {...common}
            variant="stacked"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *book*", tr: "Ayırtmadan *önce*" })}
            items={[
              { q: t({ en: "Can I hire the studio without a photographer?", tr: "Stüdyoyu fotoğrafçı olmadan kiralayabilir miyim?" }), a: t({ en: "Yes — dry hire is 1.900 ₺ an hour (minimum two hours) including strobes and the cyc. Call us to book it; the builder is for shoots with Nil.", tr: "Evet — kuru kiralama, flaşlar ve sonsuz fon dahil saatlik 1.900 ₺ (en az iki saat). Ayırtmak için arayın; oluşturucu Nil ile yapılan çekimler içindir." }) },
              { q: t({ en: "When do we get the images?", tr: "Kareleri ne zaman alırız?" }), a: t({ en: "A web gallery to choose from the next day, retouched images seven working days after you choose — or two with 48-hour delivery.", tr: "Ertesi gün seçim yapmanız için bir web galerisi; seçiminizden yedi iş günü sonra rötuşlu kareler — 48 saatte teslimle iki gün." }) },
              { q: t({ en: "Who owns the photos?", tr: "Fotoğrafların hakları kimin?" }), a: t({ en: "You get an unlimited licence for your own channels and ads. We keep the copyright and ask before using any frame in our portfolio.", tr: "Kendi kanallarınız ve reklamlarınız için sınırsız kullanım lisansı sizin. Telif hakkı bizde kalır; portfolyomuzda kullanmadan önce size sorarız." }) },
              { q: t({ en: "Can I bring my dog?", tr: "Köpeğimi getirebilir miyim?" }), a: t({ en: "Please do. Tell us in the brief so we can tape down the cables and have water ready.", tr: "Lütfen getirin. Kabloları sabitleyip su hazırlayabilmemiz için brifte belirtin." }) },
            ]}
          />
          <Cta
            {...common}
            variant="minimal"
            title={t({ en: "Build your shoot in two minutes", tr: "Çekiminizi iki dakikada oluşturun" })}
            actions={[{ link: { href: sitePageHref("packages"), label: t({ en: "Open the package builder", tr: "Paket oluşturucuyu aç" }) }, style: "primary" }]}
          />
        </SiteShellPage>

        <SiteShellPage id="packages" title={t({ en: "Packages — Lumen Room", tr: "Paketler — Lumen Room" })}>
          <PackagesPage />
        </SiteShellPage>

        <SiteShellPage id="booking" title={t({ en: "Booking — Lumen Room", tr: "Rezervasyon — Lumen Room" })}>
          <BookingPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Lumen Room", href: home() }}
        about={t({ en: "Photo studio and cyclorama in Kadıköy since 2019.", tr: "2019’dan beri Kadıköy’de fotoğraf stüdyosu ve sonsuz fon." })}
        columns={[
          { title: t({ en: "Studio", tr: "Stüdyo" }), links: [{ href: home("work"), label: t({ en: "Work", tr: "İşler" }) }, { href: sitePageHref("packages"), label: t({ en: "Packages", tr: "Paketler" }) }, { href: sitePageHref("booking"), label: t({ en: "Book a date", tr: "Tarih ayırt" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: place.address }}
        company={{ legalName: "Lumen Oda Fotoğrafçılık Ltd. Şti." }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Booking terms", tr: "Rezervasyon koşulları" }) }]}
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
