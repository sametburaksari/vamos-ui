import { AdSlot, Container, FeaturedPosts, JsonLd, NewsColumns, PopularPosts, PostBlock, newsItemListJsonLd } from "@vamos-ui/react/blocks";
import { HouseAd } from "./house-ad";
import { byId, copyFor, inSection, postOf, sectionHref, sections, type SiteLocale } from "./content";

/**
 * A section front (City): the section title with its sub-sections, a quad lead grid, then the
 * archive list with numbered pagination beside most read and an ad.
 */
export function CategoryPage({ locale }: { locale: SiteLocale }) {
  const { t, intl, newsLabels } = copyFor(locale);
  const common = { locale: intl, labels: newsLabels };
  const city = inSection("city").map((s) => postOf(s, locale));
  const others = ["heat", "air-sensors", "timber", "wind", "museum", "relay"].map((id) => postOf(byId(id), locale));
  const archive = [...city.slice(4), ...others];

  return (
    <>
      <JsonLd data={newsItemListJsonLd(city, { name: t(sections.city.label) })} />
      <Container className="flex flex-col gap-6 pt-8">
        <header className="flex flex-col gap-4 border-b border-line pb-5">
          <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{t({ en: "Section", tr: "Bölüm" })}</p>
          <h1 className="font-display text-[clamp(2.5rem,1.6rem+3vw,4.5rem)] leading-none tracking-[-0.02em] text-fg">{t(sections.city.label)}</h1>
          <nav aria-label={t({ en: "City sub-sections", tr: "Şehir alt bölümleri" })}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[0.875rem] font-medium">
              <li>
                <a href={sectionHref("city")} aria-current="page" className="rounded-[2px] text-fg underline decoration-accent decoration-2 underline-offset-[0.4em] focus-ring">
                  {t({ en: "All", tr: "Tümü" })}
                </a>
              </li>
              {sections.city.subs.map((s) => (
                <li key={s.id}>
                  <a href={sectionHref(s.id)} className="rounded-[2px] text-fg-muted hover:text-fg focus-ring">
                    {t(s.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <FeaturedPosts {...common} layout="quad" posts={city.slice(0, 4)} label={t({ en: "Lead stories in City", tr: "Şehir manşetleri" })} />
      </Container>
      <Container className="py-12">
        <NewsColumns
          asideLabel={t({ en: "Also in the paper", tr: "Gazetede ayrıca" })}
          aside={
            <>
              <PopularPosts {...common} title={t({ en: "Most read in City", tr: "Şehir’de en çok okunanlar" })} posts={["driving", "rents", "bridge", "tram", "schools"].map((id) => postOf(byId(id), locale))} />
            </>
          }
          asideSticky={
            <AdSlot {...common} size="half-page" mobileSize="rectangle" consent={false}>
              <HouseAd kind="newsletter" locale={locale} href="/newsletters" />
            </AdSlot>
          }
        >
          <PostBlock {...common} title={t({ en: "All City stories", tr: "Tüm Şehir haberleri" })} layout="list" posts={archive} pagination={{ page: 1, total: 23, hrefTemplate: "?page=category&p={page}" }} />
        </NewsColumns>
      </Container>
    </>
  );
}
