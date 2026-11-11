import { LocaleProvider } from "@vamos-ui/react";
import { Cta, Faq, Footer, MapHours, Navbar, SiteShellPage, Steps, Team, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BookingPage } from "./booking-page";
import { BuildYourJob, GarageHero } from "./home-parts";
import { ServicesPage } from "./services-page";
import { branch, copyFor, EMAIL, faqs, PHONE, reviews, team, type SiteLocale } from "./content";

const home = (anchor?: string) => sitePageHref("home", anchor);
const book = sitePageHref("booking");

/**
 * One language version of Gearline Garage: navbar, three pages (home, prices & times, booking)
 * and the footer. The job being built lives in JobProvider (page.tsx), so it follows you
 * from page to page and across the language switch.
 */
export function AutoserviceSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const garage = branch(t);

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<span className="font-display font-extrabold uppercase tracking-[-0.02em]">Gearline<span className="text-accent-ink">/</span>Garage</span>}
        homeHref={home()}
        items={[
          { label: t({ en: "Prices & times", tr: "Fiyatlar ve süreler" }), href: sitePageHref("services") },
          { label: t({ en: "How it works", tr: "Nasıl işler" }), href: home("how") },
          { label: t({ en: "Team", tr: "Ekip" }), href: home("team") },
          { label: t({ en: "Find us", tr: "Ulaşım" }), href: home("find-us") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        phone={PHONE}
        actions={[{ link: { href: book, label: t({ en: "Book a bay", tr: "Bölme ayırt" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Gearline Garage — car service and hand wash in Kozyatağı", tr: "Gearline Garage — Kozyatağı’nda servis ve elde yıkama" })}>
          <GarageHero />
          <BuildYourJob />
          <Steps
            {...common}
            anchor="how"
            variant="horizontal"
            eyebrow={t({ en: "How a visit works", tr: "Ziyaret nasıl işler" })}
            title={t({ en: "From the yellow gate to *your keys*", tr: "Sarı kapıdan *anahtarınıza*" })}
            steps={[
              { title: t({ en: "Drop off", tr: "Bırakın" }), text: t({ en: "Drive in, hand the keys to Selin, agree the job card together.", tr: "Girin, anahtarı Selin’e verin, iş kartını birlikte onaylayın." }), duration: t({ en: "5 min", tr: "5 dk" }) },
              { title: t({ en: "Workshop + wash", tr: "Atölye + yıkama" }), text: t({ en: "Bay and wash lane work at the same time. Photos of anything worn go to your phone.", tr: "Bölme ve yıkama hattı aynı anda çalışır. Aşınmış parçaların fotoğrafı telefonunuza gelir." }) },
              { title: t({ en: "Text when ready", tr: "Hazır olunca SMS" }), text: t({ en: "You get a text with the final bill — it matches the quote unless you approved extra work.", tr: "Son faturayla bir SMS alırsınız — ek işe onay vermediyseniz teklifle aynıdır." }) },
              { title: t({ en: "Walk-round", tr: "Teslim turu" }), text: t({ en: "We show you the old parts and stamp the service book.", tr: "Eski parçaları gösterir, servis kitabını damgalarız." }), duration: t({ en: "10 min", tr: "10 dk" }) },
            ]}
          />
          <Team
            {...common}
            anchor="team"
            variant="portrait"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "The crew", tr: "Ekip" })}
            title={t({ en: "Four people, *one job card*", tr: "Dört kişi, *tek iş kartı*" })}
            lead={t({ en: "The same technician works on your car from start to finish, and Selin is the one who calls.", tr: "Aracınızda baştan sona aynı teknisyen çalışır; arayan hep Selin’dir." })}
            members={team.map((m) => ({ name: m.name, role: t(m.role), specialty: t(m.specialty), photo: { ...m.photo, alt: t(m.photo.alt) } }))}
          />
          <Testimonials
            {...common}
            variant="reviews"
            eyebrow={t({ en: "Reviews", tr: "Yorumlar" })}
            title={t({ en: "Ready when we *said*", tr: "Söylediğimiz *saatte* hazır" })}
            summary={{ rating: 4.8, count: 612, source: "google" }}
            items={reviews.map((r) => ({ quote: t(r.quote), author: r.author, role: t(r.role), rating: 5, source: "google" as const, date: r.date }))}
          />
          <MapHours
            {...common}
            anchor="find-us"
            variant="map-split"
            eyebrow={t({ en: "Find us", tr: "Ulaşım" })}
            title={t({ en: "Behind the yellow gate on *Sanayi Sokak*", tr: "*Sanayi Sokak*’ta, sarı kapının ardında" })}
            businessType="LocalBusiness"
            branches={[garage]}
          />
          <Faq
            {...common}
            variant="split"
            eyebrow={t({ en: "Questions", tr: "Sorular" })}
            title={t({ en: "Before you *book*", tr: "Randevudan *önce*" })}
            contact={{ link: { href: `tel:${PHONE}`, label: t({ en: "Or call the workshop", tr: "Ya da atölyeyi arayın" }) }, style: "link" }}
            items={faqs.map((f) => ({ q: t(f.q), a: t(f.a) }))}
          />
          <Cta
            {...common}
            variant="band"
            theme={{ surface: "accent" }}
            title={t({ en: "Free bays from 11:00 today", tr: "Bugün 11:00’den itibaren boş bölme var" })}
            lead={t({ en: "Oil, tyres or a wash — book in two minutes and see your ready-by time.", tr: "Yağ, lastik ya da yıkama — iki dakikada ayırtın, hazır olma saatini görün." })}
            actions={[{ link: { href: book, label: t({ en: "Book a bay", tr: "Bölme ayırt" }) }, style: "primary" }]}
          />
        </SiteShellPage>

        <SiteShellPage id="services" title={t({ en: "Prices & times — Gearline Garage", tr: "Fiyatlar ve süreler — Gearline Garage" })}>
          <ServicesPage />
        </SiteShellPage>

        <SiteShellPage id="booking" title={t({ en: "Book a bay — Gearline Garage", tr: "Bölme ayırt — Gearline Garage" })}>
          <BookingPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Gearline Garage", href: home() }}
        about={t({ en: "Independent service, tyres and hand wash in Kozyatağı since 2011.", tr: "2011’den beri Kozyatağı’nda bağımsız servis, lastik ve elde yıkama." })}
        columns={[
          { title: t({ en: "Workshop", tr: "Atölye" }), links: [{ href: sitePageHref("services"), label: t({ en: "Prices & times", tr: "Fiyatlar ve süreler" }) }, { href: book, label: t({ en: "Book a bay", tr: "Bölme ayırt" }) }, { href: home("how"), label: t({ en: "How it works", tr: "Nasıl işler" }) }] },
          { title: t({ en: "Garage", tr: "Garaj" }), links: [{ href: home("team"), label: t({ en: "Team", tr: "Ekip" }) }, { href: home("find-us"), label: t({ en: "Find us", tr: "Ulaşım" }) }, { href: "/warranty", label: t({ en: "Warranty terms", tr: "Garanti koşulları" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: garage.address }}
        company={{ legalName: "Gearline Otomotiv Hizmetleri Ltd. Şti." }}
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
