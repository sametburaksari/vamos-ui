import { LocaleProvider } from "@vamos-ui/react";
import { AnnouncementBar, Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ArchivePage } from "./archive-page";
import { ADDRESS, copyFor, EMAIL, NEXT_DROP, PHONE, type SiteLocale } from "./content";
import { BagLabel } from "./drop-provider";
import { HomePage } from "./home-page";
import { ProductPage } from "./product-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of the Nöbet store: drop bar, navbar with a live bag count, three
 * pages (home with the Drop 07 countdown, the archive, a product) and the footer. The bag,
 * reminders and the drop clock live in DropProvider (page.tsx), above the locale switch.
 */
export function StoreSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <AnnouncementBar
        {...common}
        tone="accent"
        variant="centered"
        text={t({ en: "Drop 07 — Night Shift — Saturday 21 November, 20:00 Istanbul time.", tr: "Drop 07 — Gece Vardiyası — 21 Kasım Cumartesi, 20:00 TSİ." })}
        link={{ href: home("drop"), label: t({ en: "Set a reminder", tr: "Hatırlatma kur" }) }}
      />
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="font-display text-[1.35rem] font-[800] uppercase leading-none tracking-[-0.05em]">
            Nöbet<span className="text-accent-ink">/</span>
            <span className="font-mono text-[0.6em] font-medium tracking-[0.02em] text-fg-muted">{String(NEXT_DROP.no).padStart(2, "0")}</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Drop 07", tr: "Drop 07" }), href: home("drop") },
          { label: t({ en: "Still live", tr: "Hâlâ açık" }), href: home("live") },
          { label: t({ en: "Archive", tr: "Arşiv" }), href: sitePageHref("archive") },
          { label: t({ en: "How drops work", tr: "Drop nasıl işler" }), href: home("rules") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: "#bag", label: <BagLabel /> }, style: "link" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Nöbet — Drop 07: Night Shift", tr: "Nöbet — Drop 07: Gece Vardiyası" })}>
          <HomePage />
        </SiteShellPage>
        <SiteShellPage id="archive" title={t({ en: "Archive — Nöbet", tr: "Arşiv — Nöbet" })}>
          <ArchivePage />
        </SiteShellPage>
        <SiteShellPage id="product" title={t({ en: "Product — Nöbet", tr: "Ürün — Nöbet" })}>
          <ProductPage />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Nöbet", href: home() }}
        about={t({ en: "Numbered runs, cut in Istanbul. Drops on Saturdays at 20:00, never restocked.", tr: "Numaralı seriler, İstanbul’da kesilir. Drop’lar cumartesi 20:00’de, asla yeniden üretilmez." })}
        columns={[
          { title: t({ en: "Shop", tr: "Mağaza" }), links: [{ href: home("drop"), label: "Drop 07" }, { href: sitePageHref("archive"), label: t({ en: "Archive", tr: "Arşiv" }) }, { href: "/gift-cards", label: t({ en: "Gift cards", tr: "Hediye kartı" }) }] },
          { title: t({ en: "Help", tr: "Yardım" }), links: [{ href: home("faq"), label: t({ en: "Shipping", tr: "Kargo" }) }, { href: "/returns", label: t({ en: "Returns", tr: "İade" }) }, { href: home("rules"), label: t({ en: "Drop rules", tr: "Drop kuralları" }) }] },
          { title: t({ en: "Shop hours", tr: "Dükkân saatleri" }), links: [{ href: "/visit", label: t({ en: "Thu–Sun 12:00–20:00", tr: "Per–Paz 12:00–20:00" }) }, { href: "/visit", label: t({ en: "Drop nights until 23:00", tr: "Drop geceleri 23:00’e kadar" }) }] },
        ]}
        contact={{ phone: PHONE, email: EMAIL, address: ADDRESS }}
        social={[{ network: "instagram", href: "https://instagram.com/nobet.example" }]}
        legalLinks={[
          { href: "/terms", label: t({ en: "Terms of sale", tr: "Satış sözleşmesi" }) },
          { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "/kvkk", label: t({ en: "KVKK notice", tr: "KVKK aydınlatma metni" }) },
        ]}
        year={2026}
      />
    </>
  );

  return locale === "tr" ? (
    <LocaleProvider locale="tr-TR" messages={tr}>
      {site}
    </LocaleProvider>
  ) : (
    <LocaleProvider locale="en-US">{site}</LocaleProvider>
  );
}
