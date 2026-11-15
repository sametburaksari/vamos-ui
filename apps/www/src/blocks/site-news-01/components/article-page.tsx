import { ArticleLayout, Container, JsonLd, PostBlock, newsArticleJsonLd, sitePageHref } from "@vamos-ui/react/blocks";
import { articleBody, authors, byId, copyFor, inSection, postOf, sectionHref, sections, type SiteLocale } from "./content";

/**
 * One story, on the kit `ArticleLayout` (breadcrumb, section, title, dek, byline, cover, contents,
 * body, share, author box), with `NewsArticle` JSON-LD and a "More in City" module after it.
 */
export function ArticlePage({ locale }: { locale: SiteLocale }) {
  const { t, intl, newsLabels, labels, brand } = copyFor(locale);
  const story = byId("tram");
  const post = postOf(story, locale);
  const author = authors[story.author];
  const more = inSection("city").filter((s) => s.id !== story.id).slice(0, 3).map((s) => postOf(s, locale));

  return (
    <>
      <JsonLd data={newsArticleJsonLd({ ...post, updatedAt: "2026-11-15T09:05:00+03:00" }, { origin: "https://example.com", publisher: { name: brand, url: "https://example.com" } })} />
      <ArticleLayout
        locale={intl}
        labels={labels}
        variant="classic"
        share={["copy", "whatsapp", "x", "email"]}
        post={{
          title: post.title,
          dek: post.excerpt,
          body: articleBody[locale],
          cover: post.cover,
          coverCaption: t({ en: "The coast line at dusk. The trial adds eleven departures each way after 23:30.", tr: "Alacakaranlıkta sahil hattı. Deneme 23.30’dan sonra her yönde on bir sefer ekliyor." }),
          author: { name: author.name, role: t(author.role), bio: t({ en: "Covers the council, transport and housing. Before the Ledger she drove a night bus for two winters.", tr: "Meclis, ulaşım ve konut haberlerini izliyor. Gazeteden önce iki kış gece otobüsü kullandı." }) },
          publishedAt: post.publishedAt,
          readingMinutes: post.readingMinutes,
          updatedAt: "2026-11-15T09:05:00+03:00",
          category: { label: t(sections.city.subs[0]!.label), href: sectionHref("transport") },
          breadcrumb: [
            { label: t({ en: "Home", tr: "Ana sayfa" }), href: sitePageHref("home") },
            { label: t(sections.city.label), href: sectionHref("city") },
          ],
          tags: [
            { label: t({ en: "Night tram", tr: "Gece tramvayı" }), href: sectionHref("transport") },
            { label: t({ en: "City council", tr: "Belediye meclisi" }), href: sectionHref("city") },
          ],
        }}
      />
      <Container className="pb-16">
        <PostBlock locale={intl} labels={newsLabels} title={t({ en: "More in City", tr: "Şehir’den daha fazlası" })} href={sectionHref("city")} layout="trio" excerpts posts={more} />
      </Container>
    </>
  );
}
