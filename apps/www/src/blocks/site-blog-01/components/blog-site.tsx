import { LocaleProvider } from "@vamos-ui/react";
import { Footer, Navbar, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { ArchivePage } from "./archive-page";
import { ArticlePage } from "./article-page";
import { authorHref, copyFor, ISSUE, topicHref, topics, type SiteLocale } from "./content";
import { HomePage } from "./home-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/**
 * One language version of the magazine: navbar, three pages and the footer. Server component;
 * the SiteShell in page.tsx picks the page and language. The essay body and the archive filter
 * are the only client islands.
 */
export function BlogSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  const site = (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<span className="font-display text-[1.35rem] tracking-[-0.01em]">Field Notes <em className="text-accent-ink">Quarterly</em></span>}
        homeHref={home()}
        items={[
          { label: t({ en: `Issue ${ISSUE.number}`, tr: `${ISSUE.number}. sayı` }), href: home() },
          { label: t({ en: "Essays", tr: "Denemeler" }), href: sitePageHref("archive") },
          {
            label: t({ en: "Topics", tr: "Konular" }),
            href: sitePageHref("archive"),
            children: topics.map((topic) => ({ label: t(topic.label), href: topicHref(topic.id) })),
          },
          { label: t({ en: "About", tr: "Hakkımızda" }), href: home("editor") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("newsletter"), label: t({ en: "Subscribe", tr: "Abone ol" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Field Notes Quarterly — essays on cities and design", tr: "Field Notes Quarterly — şehirler ve tasarım üzerine denemeler" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="article" title={t({ en: "The bench is a policy — Field Notes Quarterly", tr: "Bank bir politikadır — Field Notes Quarterly" })}>
          <ArticlePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="archive" title={t({ en: "The archive — Field Notes Quarterly", tr: "Arşiv — Field Notes Quarterly" })}>
          <ArchivePage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Field Notes Quarterly", href: home() }}
        about={t({
          en: "An independent quarterly about the parts of cities people actually touch. Four issues a year, in English and Turkish.",
          tr: "Şehirlerin insanların gerçekten dokunduğu yerleri üzerine bağımsız bir dergi. Yılda dört sayı, İngilizce ve Türkçe.",
        })}
        columns={[
          { title: t({ en: "Read", tr: "Okuyun" }), links: [{ href: home(), label: t({ en: "Current issue", tr: "Güncel sayı" }) }, { href: sitePageHref("archive"), label: t({ en: "All essays", tr: "Tüm denemeler" }) }, { href: topicHref("transit"), label: t({ en: "Transit", tr: "Ulaşım" }) }] },
          { title: t({ en: "Writers", tr: "Yazarlar" }), links: [{ href: authorHref("selin"), label: "Selin Okyar" }, { href: authorHref("teo"), label: "Teo Vasić" }, { href: authorHref("jonah"), label: "Jonah Pell" }] },
          { title: t({ en: "Contribute", tr: "Katkıda bulunun" }), links: [{ href: "/pitch", label: t({ en: "Pitch an essay", tr: "Yazı önerin" }) }, { href: "/style", label: t({ en: "House style", tr: "Yazım kılavuzu" }) }, { href: "/fees", label: t({ en: "Fees: 9,000 TL per essay", tr: "Ücret: deneme başına 9.000 TL" }) }] },
        ]}
        contact={{ email: "letters@fieldnotes.example", phone: "+902160000000" }}
        social={[{ network: "instagram", href: "https://instagram.com/fieldnotes.example" }, { network: "linkedin", href: "https://linkedin.com/company/fieldnotes-example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/corrections", label: t({ en: "Corrections", tr: "Düzeltmeler" }) }]}
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
