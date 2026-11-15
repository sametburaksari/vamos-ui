import {
  AdSlot,
  CategoryCounts,
  Container,
  FeaturedPosts,
  FollowCounts,
  JsonLd,
  NewsColumns,
  NewsTicker,
  PopularPosts,
  PostBlock,
  PostLayout,
  PostTabs,
  RecentComments,
  newsItemListJsonLd,
} from "@vamos-ui/react/blocks";
import { HouseAd } from "./house-ad";
import { ARTICLE_HREF, byId, copyFor, inSection, postOf, sectionHref, sections, stories, type SectionId, type SiteLocale } from "./content";

/**
 * The front page, top to bottom: trending ticker, the lead grid, then a main column of section
 * modules (tabbed "Don't miss", city, economy, an ad, technology, culture, latest with
 * pagination) beside a sticky sidebar (follow counts, an ad, most read, opinion, comments,
 * editor's picks, sections with counts).
 */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, intl, newsLabels, brand } = copyFor(locale);
  const common = { locale: intl, labels: newsLabels };
  const post = (id: string) => postOf(byId(id), locale);
  const list = (ids: SectionId) => inSection(ids).map((s) => postOf(s, locale));
  const lead = ["tram", "port-cranes", "seagrass", "derby", "rents", "festival", "chips", "heat"].map(post);
  const latest = [...stories].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6).map((s) => postOf(s, locale));
  const mostRead = ["derby", "op-ed", "driving", "rents", "bridge"].map(post);

  const tabIds: (SectionId | "all")[] = ["all", "city", "economy", "science", "culture", "sport", "tech", "environment", "opinion"];
  const tabs = tabIds.map((id) => {
    const posts = id === "all" ? ["library", "unions", "seagrass", "startup", "marathon"].map(post) : list(id).slice(0, 5);
    return {
      id,
      label: id === "all" ? t({ en: "All", tr: "Tümü" }) : t(sections[id].label),
      content: <PostLayout layout="lead-list" posts={posts} columns={2} level={3} common={common} empty={t({ en: "No stories yet.", tr: "Henüz haber yok." })} />,
    };
  });

  return (
    <>
      <JsonLd data={newsItemListJsonLd(lead.slice(0, 4), { name: t({ en: "Top stories", tr: "Manşet" }) })} />
      <Container className="flex flex-col gap-6 pt-5">
        <NewsTicker
          {...common}
          items={[
            { title: t({ en: "Swing bridge closes at 22:00 tonight for six weeks", tr: "Döner köprü bu gece 22.00’de altı haftalığına kapanıyor" }), href: ARTICLE_HREF, category: t({ en: "Traffic", tr: "Trafik" }), breaking: true },
            { title: post("tram").title, href: ARTICLE_HREF, category: t(sections.city.label) },
            { title: post("port-cranes").title, href: ARTICLE_HREF, category: t(sections.economy.label) },
            { title: post("derby").title, href: ARTICLE_HREF, category: t(sections.sport.label) },
            { title: post("seagrass").title, href: ARTICLE_HREF, category: t(sections.science.label) },
          ]}
        />
        <h1 className="sr-only">{t({ en: `${brand} — news from the coast`, tr: `${brand} — kıyıdan haberler` })}</h1>
        <FeaturedPosts {...common} posts={lead} slider label={t({ en: "Top stories", tr: "Manşet" })} />
      </Container>

      <Container className="py-12">
        <NewsColumns
          asideLabel={t({ en: `More from ${brand}`, tr: `${brand}’nden daha fazlası` })}
          aside={
            <>
              <FollowCounts
                {...common}
                title={t({ en: "Stay connected", tr: "Bizi takip edin" })}
                accounts={[
                  { network: "facebook", href: "https://facebook.com/example", count: 48210, unit: t({ en: "fans", tr: "beğeni" }), action: t({ en: "Like", tr: "Beğen" }) },
                  { network: "x", href: "https://x.com/example", count: 21340 },
                  { network: "instagram", href: "https://instagram.com/example", count: 36800 },
                  { network: "youtube", href: "https://youtube.com/@example", count: 9120, unit: t({ en: "subscribers", tr: "abone" }), action: t({ en: "Subscribe", tr: "Abone ol" }) },
                ]}
              />
              <PopularPosts {...common} title={t({ en: "Most read", tr: "En çok okunanlar" })} posts={mostRead} />
              <PostBlock {...common} title={t({ en: "Opinion & environment", tr: "Görüş ve çevre" })} href={sectionHref("opinion")} layout="featured-list" headingSize="sm" posts={["op-ed", "heat", "wind", "timber"].map(post)} />
              <RecentComments
                {...common}
                title={t({ en: "Recent comments", tr: "Son yorumlar" })}
                comments={[
                  { author: "Leyla K.", postTitle: post("tram").title, postHref: ARTICLE_HREF, excerpt: t({ en: "Finally. My shift ends at 00:30 and the walk home is the worst part of the day.", tr: "Sonunda. Vardiyam 00.30’da bitiyor ve eve yürüyüş günün en kötü kısmı." }), at: "2026-11-15T08:12:00+03:00" },
                  { author: "Tomasz W.", postTitle: post("driving").title, postHref: ARTICLE_HREF, at: "2026-11-14T21:40:00+03:00" },
                  { author: "Berk A.", postTitle: post("rents").title, postHref: ARTICLE_HREF, excerpt: t({ en: "Our street is on your map. Four of nine flats are now short-term lets.", tr: "Sokağımız haritanızda. Dokuz dairenin dördü artık kısa dönem kiralık." }), at: "2026-11-14T13:05:00+03:00" },
                ]}
              />
              <PopularPosts {...common} variant="thumbs" title={t({ en: "Editor’s picks", tr: "Editörün seçtikleri" })} posts={["library", "startup", "jazz", "housing-coop"].map(post)} limit={4} />
            </>
          }
          asideSticky={
            <>
              <AdSlot {...common} size="rectangle" slotId="ad-side-1" />
              <CategoryCounts
                {...common}
                title={t({ en: "Sections", tr: "Bölümler" })}
                categories={(Object.keys(sections) as SectionId[]).map((id) => ({ label: t(sections[id].label), href: sectionHref(id), count: inSection(id).length * 37 + 12 }))}
              />
            </>
          }
        >
          <PostTabs {...common} title={t({ en: "Don’t miss", tr: "Kaçırmayın" })} tabs={tabs} />
          <PostBlock {...common} title={t(sections.city.label)} href={sectionHref("city")} layout="lead-grid" posts={["rents", "schools", "bridge", "housing-coop", "driving", "exam"].map(post)} />
          <PostBlock {...common} title={t(sections.economy.label)} href={sectionHref("economy")} layout="big-2" posts={["port-cranes", "inflation", "unions"].map(post)} pages={[["budget", "tax", "unions"].map(post)]} />
          <AdSlot {...common} size="leaderboard" mobileSize="large-mobile-banner" consent={false} slotId="ad-main-1">
            <HouseAd kind="print" locale={locale} href="/subscribe" />
          </AdSlot>
          <PostBlock {...common} title={t(sections.tech.label)} href={sectionHref("tech")} layout="list" posts={list("tech")} />
          <PostBlock {...common} title={t(sections.culture.label)} href={sectionHref("culture")} layout="grid" excerpts posts={list("culture").slice(0, 4)} />
          <PostBlock {...common} title={t(sections.sport.label)} href={sectionHref("sport")} layout="trio" posts={list("sport")} />
          <PostBlock {...common} title={t({ en: "Latest", tr: "Son haberler" })} layout="list" posts={latest} pagination={{ page: 1, total: 17, hrefTemplate: "?page=home&p={page}#latest" }} id="latest" />
        </NewsColumns>
      </Container>
    </>
  );
}
