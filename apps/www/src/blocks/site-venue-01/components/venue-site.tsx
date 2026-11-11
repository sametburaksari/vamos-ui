import { Container, Footer, Navbar, PageIntro, Section, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { CapacityFinder } from "./capacity-finder";
import { copyFor, EMAIL, mill, PHONE, type SiteLocale } from "./content";
import { EnquiryForm } from "./enquiry-form";
import { VenueHome } from "./home";

export const venuePages = ["home", "spaces", "enquiry"];
const home = (anchor?: string) => sitePageHref("home", anchor);

/** One language version of Old Mill Hall: navbar, three pages (home, spaces, enquiry), footer. Server component. */
export function VenueSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2.5 font-display text-lg leading-none tracking-[-0.02em] text-fg">
            <span aria-hidden className="grid size-6 place-items-center rounded-full border-2 border-fg">
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
            Old Mill Hall
          </span>
        }
        homeHref={home()}
        phone={PHONE}
        items={[
          { label: t({ en: "Spaces", tr: "Alanlar" }), href: sitePageHref("spaces") },
          { label: t({ en: "Capacity", tr: "Kapasite" }), href: home("finder") },
          { label: t({ en: "The building", tr: "Bina" }), href: home("history") },
          { label: t({ en: "Viewings", tr: "Gezi" }), href: home("visit") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: sitePageHref("enquiry"), label: t({ en: "Enquire", tr: "Talep gönder" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Old Mill Hall — event venue in a 1911 flour mill", tr: "Old Mill Hall — 1911 yapımı un değirmeninde etkinlik mekânı" })}>
          <VenueHome c={c} />
        </SiteShellPage>

        <SiteShellPage id="spaces" title={t({ en: "Spaces — Old Mill Hall", tr: "Alanlar — Old Mill Hall" })}>
          <PageIntro
            {...common}
            variant="ruled"
            theme={{ rhythm: "tight" }}
            breadcrumb={[{ label: "Old Mill Hall", href: home() }, { label: t({ en: "Spaces", tr: "Alanlar" }) }]}
            eyebrow={t({ en: "Spaces & capacities", tr: "Alanlar ve kapasiteler" })}
            title={t({ en: "Five spaces, *six layouts*", tr: "Beş alan, *altı düzen*" })}
            lead={t({ en: "Every room with its measurements, its capacity in each layout and its day rate. Weekend rates (Friday to Sunday) are about 30% higher.", tr: "Her oda ölçüleri, her düzendeki kapasitesi ve günlük fiyatıyla. Hafta sonu (cuma–pazar) fiyatları yaklaşık %30 daha yüksek." })}
            meta={[
              { label: t({ en: "Total floor", tr: "Toplam alan" }), value: `${c.num(1375)} m²` },
              { label: t({ en: "Hire hours", tr: "Kiralama" }), value: "08:00–01:30" },
            ]}
          />
          <Section anchor="all-spaces" theme={{ rhythm: "tight" }} className="pt-0 pb-24">
            <Container>
              <CapacityFinder locale={locale} detailed />
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="enquiry" title={t({ en: "Enquiry — Old Mill Hall", tr: "Talep — Old Mill Hall" })}>
          <PageIntro
            {...common}
            variant="simple"
            theme={{ rhythm: "tight" }}
            breadcrumb={[{ label: "Old Mill Hall", href: home() }, { label: t({ en: "Enquiry", tr: "Talep" }) }]}
            title={t({ en: "Tell us about *the day*", tr: "Bize *o günü* anlatın" })}
            lead={t({ en: "We hold your date for seven days while we talk. Selin replies within one working day.", tr: "Konuşurken tarihinizi yedi gün tutuyoruz. Selin bir iş günü içinde dönüyor." })}
          />
          <Section anchor="enquiry-form" theme={{ rhythm: "tight" }} className="pt-0 pb-24">
            <Container>
              <EnquiryForm locale={locale} />
            </Container>
          </Section>
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        theme={{ mode: "dark" }}
        brand={{ name: "Old Mill Hall", href: home() }}
        about={t({ en: "An event venue in a restored 1911 flour mill on the Ömerli stream. Four rooms, one terrace, up to 450 guests.", tr: "Ömerli deresi kıyısında, restore edilmiş 1911 yapımı bir un değirmeninde etkinlik mekânı. Dört oda, bir teras, 450 misafire kadar." })}
        columns={[
          { title: t({ en: "Venue", tr: "Mekân" }), links: [{ href: sitePageHref("spaces"), label: t({ en: "Spaces", tr: "Alanlar" }) }, { href: home("finder"), label: t({ en: "Capacity finder", tr: "Kapasite bulucu" }) }, { href: home("history"), label: t({ en: "The building", tr: "Bina" }) }] },
          { title: t({ en: "Plan", tr: "Planlama" }), links: [{ href: sitePageHref("enquiry"), label: t({ en: "Send an enquiry", tr: "Talep gönder" }) }, { href: home("visit"), label: t({ en: "Book a viewing", tr: "Gezi ayarla" }) }, { href: home("faq"), label: t({ en: "Questions", tr: "Sorular" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE, address: mill(t).address }}
        social={[{ network: "instagram", href: "https://instagram.com/oldmillhall.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/terms", label: t({ en: "Hire terms", tr: "Kiralama koşulları" }) }]}
        year={2026}
      />
    </>
  );
}
