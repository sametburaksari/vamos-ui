import { LocaleProvider } from "@vamos-ui/react";
import { AdSlot, Footer, SiteShellPage, sitePageHref, type NewsNavItem } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ArticlePage } from "./article-page";
import { CategoryPage } from "./category-page";
import { copyFor, inSection, inSub, postOf, sectionHref, sections, type SectionId, type SiteLocale } from "./content";
import { HomePage } from "./home-page";
import { HouseAd } from "./house-ad";
import { Masthead } from "./masthead";
import { TopBar } from "./top-bar";

/**
 * One language version of the paper: top bar, masthead with the section bar and mega menus,
 * three pages (front page, a section front, a story) and the footer. SiteShell (page.tsx) picks
 * the page and the language.
 */
export function NewsSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, brand, newsLabels, labels } = copyFor(locale);
  const common = { locale: intl, labels: newsLabels };

  const mega = (id: SectionId): NewsNavItem => ({
    label: t(sections[id].label),
    href: sectionHref(id),
    mega: [
      { id: "all", label: t({ en: "All", tr: "Tümü" }), href: sectionHref(id), posts: inSection(id).slice(0, 4).map((s) => postOf(s, locale)) },
      ...sections[id].subs.map((sub) => ({ id: sub.id, label: t(sub.label), href: sectionHref(sub.id), posts: inSub(sub.id).slice(0, 4).map((s) => postOf(s, locale)) })),
    ],
  });
  const nav: NewsNavItem[] = [
    { label: t({ en: "Home", tr: "Ana sayfa" }), href: sitePageHref("home") },
    mega("city"),
    mega("economy"),
    mega("science"),
    mega("culture"),
    mega("sport"),
    mega("tech"),
    { label: t(sections.environment.label), href: sectionHref("environment") },
    { label: t(sections.opinion.label), href: sectionHref("opinion") },
  ];
  const more = [
    { label: t({ en: "Letters", tr: "Okur mektupları" }), href: "/letters" },
    { label: t({ en: "Puzzles", tr: "Bulmaca" }), href: "/puzzles" },
    { label: t({ en: "Obituaries", tr: "Vefat ilanları" }), href: "/obituaries" },
    { label: t({ en: "Print edition", tr: "Basılı gazete" }), href: "/print" },
    { label: t({ en: "Archive since 1987", tr: "1987’den beri arşiv" }), href: "/archive" },
  ];

  const site = (
    <>
      <TopBar
        locale={intl}
        labels={newsLabels}
        brand={brand}
        place={locale === "tr" ? "Kıyıkent" : "Harbourside"}
        joinHref="/join"
        links={[
          { label: t({ en: "Newsletters", tr: "Bültenler" }), href: "/newsletters" },
          { label: t({ en: "Print edition", tr: "Basılı gazete" }), href: "/print" },
          { label: t({ en: "Contact", tr: "İletişim" }), href: "/contact" },
        ]}
        social={[
          { network: "x", href: "https://x.com/example" },
          { network: "instagram", href: "https://instagram.com/example" },
          { network: "facebook", href: "https://facebook.com/example" },
          { network: "youtube", href: "https://youtube.com/@example" },
        ]}
      />
      <Masthead
        {...common}
        brand={brand}
        homeHref={sitePageHref("home")}
        tagline={t({ en: "Independent news from the coast since 1987", tr: "1987’den beri kıyıdan bağımsız haber" })}
        nav={nav}
        more={more}
        search={{ action: "/search", param: "q" }}
        aside={
          <AdSlot {...common} size="leaderboard" consent={false} center={false} className="items-end">
            <HouseAd kind="print" locale={locale} href="/subscribe" />
          </AdSlot>
        }
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "The Harbour Ledger — news from the coast", tr: "Kıyı Gazetesi — kıyıdan haberler" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="category" title={t({ en: "City — The Harbour Ledger", tr: "Şehir — Kıyı Gazetesi" })}>
          <CategoryPage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="article" title={t({ en: "The night tram returns — The Harbour Ledger", tr: "Gece tramvayı geri dönüyor — Kıyı Gazetesi" })}>
          <ArticlePage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        locale={intl}
        labels={labels}
        variant="columns"
        theme={{ mode: "dark" }}
        brand={{ name: brand, href: sitePageHref("home") }}
        about={t({
          en: "A reader-funded daily for the coast: council, port, schools, science and the arts. Corrections are published within 24 hours.",
          tr: "Kıyı için okur destekli bir günlük gazete: meclis, liman, okullar, bilim ve sanat. Düzeltmeler 24 saat içinde yayımlanır.",
        })}
        contact={{ email: "newsroom@example.com", phone: "+902160000000" }}
        social={[
          { network: "x", href: "https://x.com/example" },
          { network: "instagram", href: "https://instagram.com/example" },
          { network: "facebook", href: "https://facebook.com/example" },
          { network: "youtube", href: "https://youtube.com/@example" },
        ]}
        columns={[
          { title: t({ en: "Sections", tr: "Bölümler" }), links: (["city", "economy", "science", "culture", "sport"] as SectionId[]).map((id) => ({ label: t(sections[id].label), href: sectionHref(id) })) },
          { title: t({ en: "The paper", tr: "Gazete" }), links: [{ label: t({ en: "About us", tr: "Hakkımızda" }), href: "/about" }, { label: t({ en: "Ethics code", tr: "Etik ilkeler" }), href: "/ethics" }, { label: t({ en: "Corrections", tr: "Düzeltmeler" }), href: "/corrections" }, { label: t({ en: "Jobs", tr: "Kariyer" }), href: "/jobs" }] },
          { title: t({ en: "Readers", tr: "Okurlar" }), links: [{ label: t({ en: "Subscribe", tr: "Abone olun" }), href: "/subscribe" }, { label: t({ en: "Newsletters", tr: "Bültenler" }), href: "/newsletters" }, { label: t({ en: "Send a tip", tr: "İhbar gönderin" }), href: "/tips" }, { label: t({ en: "Advertise", tr: "Reklam" }), href: "/advertise" }] },
        ]}
        legalLinks={[
          { label: t({ en: "Disclaimer", tr: "Sorumluluk reddi" }), href: "/disclaimer" },
          { label: t({ en: "Privacy", tr: "Gizlilik" }), href: "/privacy" },
          { label: t({ en: "Cookies", tr: "Çerezler" }), href: "/cookies" },
          { label: t({ en: "Contact us", tr: "Bize ulaşın" }), href: "/contact" },
        ]}
        cookieSettings
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
