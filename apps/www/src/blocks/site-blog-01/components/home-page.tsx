import { Avatar } from "@vamos-ui/react";
import { BlockHeading, BlockImage, BlogList, Container, Section, renderEmphasis, sitePageHref } from "@vamos-ui/react/blocks";
import { NewsletterBand } from "./newsletter";
import { ARTICLE_HREF, authorHref, authors, copyFor, ISSUE, photos, postSummary, posts, topicHref, topicLabel, topics, type SiteLocale } from "./content";

const link = "rounded-[2px] focus-ring";

/**
 * The issue home: masthead with the table of contents, the lead essay, latest essays with
 * topic chips, the most-read list beside the editor's letter, and the newsletter band.
 */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, img, labels } = copyFor(locale);
  const lead = posts[0]!;
  const leadAuthor = authors[lead.author];
  const popular = [...posts].sort((a, b) => b.reads - a.reads).slice(0, 5);
  const mira = authors.mira;

  return (
    <>
      {/* Masthead: the issue as a cover — theme, dek and the contents in page order. */}
      <Section theme={{ rhythm: "tight" }} headingId="issue-title" className="border-b border-line">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-fg pb-3 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">
            <span>
              {t({ en: "Issue", tr: "Sayı" })} <span className="text-fg tabular">No. {ISSUE.number}</span> · {t(ISSUE.season)}
            </span>
            <span>
              {t({ en: "Published", tr: "Yayın" })} <time dateTime={ISSUE.published}>{f.date(ISSUE.published, "long")}</time>
            </span>
          </div>

          <div className="grid gap-x-(--gutter) gap-y-12 @4xl:grid-cols-12">
            <div className="flex flex-col gap-6 @4xl:col-span-7">
              <p className="font-mono text-eyebrow uppercase tracking-[0.12em] text-accent-ink">{t({ en: "This quarter", tr: "Bu çeyrek" })}</p>
              <BlockHeading id="issue-title" level={1} size="display-2xl" text={t(ISSUE.theme)} className="max-w-[12ch] pb-4" />
              <p className="max-w-[44ch] text-lead text-fg-muted text-pretty">{t(ISSUE.dek)}</p>
            </div>

            <nav aria-labelledby="contents-title" className="@4xl:col-span-5 @4xl:border-s @4xl:border-line @4xl:ps-(--gutter)">
              <h2 id="contents-title" className="mb-4 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">
                {t({ en: "In this issue", tr: "Bu sayıda" })}
              </h2>
              <ol className="flex flex-col">
                {posts.slice(0, 6).map((post, i) => (
                  <li key={post.slug} className="border-t border-line first:border-t-0">
                    <a href={ARTICLE_HREF} className={`group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 py-3 ${link}`}>
                      <span className="font-mono text-small tabular text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-display text-[1.3rem] leading-tight text-fg underline decoration-transparent underline-offset-[0.2em] transition-colors group-hover:decoration-current">{t(post.title)}</span>
                        <span className="text-small text-fg-muted">
                          {authors[post.author].name} · {t(topicLabel(post.topic))}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </Container>
      </Section>

      {/* Lead story. */}
      <Section headingId="lead-title">
        <Container>
          <article className="grid items-end gap-x-(--gutter) gap-y-8 @4xl:grid-cols-12">
            <BlockImage {...img(photos[lead.photo])} aspect="3:2" priority sizes="(min-width: 64rem) 58vw, 100vw" className="rounded-ui @4xl:col-span-7" />
            <div className="flex flex-col gap-5 @4xl:col-span-5 @4xl:pb-2">
              <p className="font-mono text-eyebrow uppercase tracking-[0.12em]">
                <a href={topicHref(lead.topic)} className={`text-accent-ink underline decoration-1 underline-offset-[0.25em] ${link}`}>
                  {t(topicLabel(lead.topic))}
                </a>
                <span className="text-fg-muted"> · {t({ en: "Cover essay", tr: "Kapak yazısı" })}</span>
              </p>
              <h2 id="lead-title" className="font-display text-display-l text-balance">
                <a href={ARTICLE_HREF} className={`hover:underline decoration-1 underline-offset-[0.12em] ${link}`}>
                  {t(lead.title)}
                </a>
              </h2>
              <p className="max-w-[42ch] text-lead text-fg-muted text-pretty">{t(lead.dek)}</p>
              <div className="flex items-center gap-3 border-t border-line pt-5 text-small">
                <Avatar src={leadAuthor.photo.src} name={leadAuthor.name} size="md" />
                <span className="flex flex-col">
                  <a href={authorHref(lead.author)} className={`font-medium text-fg hover:underline ${link}`}>
                    {leadAuthor.name}
                  </a>
                  <span className="text-fg-muted">
                    <time dateTime={lead.date}>{f.date(lead.date, "medium")}</time> · {t({ en: `${lead.minutes} min read`, tr: `${lead.minutes} dk okuma` })}
                  </span>
                </span>
              </div>
            </div>
          </article>
        </Container>
      </Section>

      <BlogList
        locale={intl}
        labels={labels}
        variant="grid"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Latest", tr: "En yeniler" })}
        title={t({ en: "Fresh from the *notebook*", tr: "Defterden *yeni* çıkanlar" })}
        allLink={{ href: sitePageHref("archive"), label: t({ en: "All essays", tr: "Tüm denemeler" }) }}
        categories={[{ label: t({ en: "All topics", tr: "Tüm konular" }), href: sitePageHref("archive"), active: true }, ...topics.map((topic) => ({ label: t(topic.label), href: topicHref(topic.id) }))]}
        posts={posts.slice(1, 7).map((p) => postSummary(p, locale))}
      />

      {/* Most read + the editor's letter. */}
      <Section anchor="editor" headingId="popular-title">
        <Container className="grid gap-x-(--gutter) gap-y-14 @4xl:grid-cols-12">
          <div className="@4xl:col-span-7">
            <h2 id="popular-title" className="mb-6 font-display text-display-m">{renderEmphasis(t({ en: "Most *read* this month", tr: "Bu ay en çok *okunanlar*" }))}</h2>
            <ol className="flex flex-col">
              {popular.map((post, i) => (
                <li key={post.slug} className="grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 border-t border-line py-5 @2xl:grid-cols-[5rem_1fr_auto]">
                  <span aria-hidden className="font-display text-[3rem] leading-none text-accent-ink tabular @2xl:text-[3.75rem]">
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-1">
                    <a href={ARTICLE_HREF} className={`font-display text-h3 text-fg hover:underline underline-offset-[0.15em] ${link}`}>
                      <span className="sr-only">{i + 1}. </span>
                      {t(post.title)}
                    </a>
                    <span className="text-small text-fg-muted">
                      {authors[post.author].name} · {t({ en: `${post.minutes} min`, tr: `${post.minutes} dk` })}
                    </span>
                  </span>
                  <span className="col-start-2 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted tabular @2xl:col-start-3">
                    {t({ en: `${f.number(post.reads)} reads`, tr: `${f.number(post.reads)} okuma` })}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <aside aria-labelledby="editor-title" className="@4xl:col-span-5">
            <div className="flex flex-col gap-6 rounded-ui-lg bg-surface-2 p-6 @2xl:p-8 @4xl:sticky @4xl:top-24">
              <p id="editor-title" className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">
                {t({ en: "From the editor", tr: "Editörden" })}
              </p>
              <blockquote className="font-display text-[1.5rem] leading-snug text-fg italic text-pretty">
                {t({
                  en: "“We started this quarterly because the most important design decisions in a city are made by people who never call themselves designers: the clerk who orders benches, the driver who chooses the last stop.”",
                  tr: "“Bu dergiyi, bir şehirdeki en önemli tasarım kararlarını kendine hiç tasarımcı demeyen insanlar verdiği için başlattık: bankları sipariş eden memur, son durağı seçen şoför.”",
                })}
              </blockquote>
              <div className="flex items-center gap-4 border-t border-line pt-5">
                <Avatar src={mira.photo.src} name={mira.name} size="lg" />
                <div className="flex flex-col text-small">
                  <a href={authorHref("mira")} className={`font-medium text-fg hover:underline ${link}`}>
                    {mira.name}
                  </a>
                  <span className="text-fg-muted">{t(mira.role)}</span>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-4 border-t border-line pt-5 text-small">
                {[
                  { k: t({ en: "Issues", tr: "Sayı" }), v: "14" },
                  { k: t({ en: "Writers", tr: "Yazar" }), v: "63" },
                  { k: t({ en: "Cities", tr: "Şehir" }), v: "22" },
                ].map((row) => (
                  <div key={row.k} className="flex flex-col gap-1">
                    <dt className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{row.k}</dt>
                    <dd className="font-display text-[1.75rem] leading-none tabular text-fg">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </Container>
      </Section>

      <NewsletterBand locale={locale} />
    </>
  );
}
