import { Avatar, Badge } from "@vamos-ui/react";
import { BlockImage, BlogList, Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArticleBody, type ResolvedBlock } from "./article-body";
import { article, authorHref, authors, copyFor, photos, postSummary, posts, topicHref, topicLabel, type SiteLocale } from "./content";
import { NewsletterBand } from "./newsletter";

const link = "rounded-[2px] focus-ring";

/**
 * One essay: header, cover, the body (client island: reading progress + side notes), the
 * author card, related essays and the newsletter band. Copy is resolved here, so the island
 * only receives strings.
 */
export function ArticlePage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, img, labels } = copyFor(locale);
  const post = article.post;
  const author = authors[post.author];
  const blocks: ResolvedBlock[] = article.blocks.map((b) =>
    b.type === "figure" ? { type: "figure", image: img(photos[b.photo]), caption: t(b.caption) } : { type: b.type, text: t(b.text) },
  );

  return (
    <>
      <Section as="article" headingId="essay-title" className="vb-essay" theme={{ rhythm: "tight" }}>
        <Container size="content" className="flex flex-col gap-12">
          <header className="grid gap-x-16 gap-y-6 @5xl:grid-cols-[minmax(0,40rem)_15rem] @5xl:justify-center">
            <nav aria-label={t({ en: "Breadcrumb", tr: "Gezinti yolu" })} className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted @5xl:col-span-2">
              <ol className="flex flex-wrap gap-x-2">
                <li>
                  <a href={sitePageHref("home")} className={`hover:text-fg ${link}`}>
                    {t({ en: "Issue 14", tr: "14. sayı" })}
                  </a>
                  <span aria-hidden> /</span>
                </li>
                <li>
                  <a href={topicHref(post.topic)} className={`text-accent-ink hover:underline ${link}`}>
                    {t(topicLabel(post.topic))}
                  </a>
                </li>
              </ol>
            </nav>
            <div className="flex flex-col gap-6">
              <h1 id="essay-title" className="font-display text-display-xl text-balance">
                {t(post.title)}
              </h1>
              <p className="text-lead text-fg-muted text-pretty">{t(post.dek)}</p>
            </div>
            <div className="flex flex-col gap-4 self-end border-t border-line pt-4 text-small @5xl:border-s @5xl:border-t-0 @5xl:ps-5 @5xl:pt-0">
              <div className="flex items-center gap-3">
                <Avatar src={author.photo.src} name={author.name} size="md" />
                <p className="flex flex-col">
                  <a href={authorHref(post.author)} className={`font-medium text-fg hover:underline ${link}`}>
                    {author.name}
                  </a>
                  <span className="text-fg-muted">{t(author.role)}</span>
                </p>
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-fg-muted">
                <time dateTime={post.date}>{f.date(post.date, "long")}</time>
                <span>{t({ en: `${post.minutes} min read`, tr: `${post.minutes} dk okuma` })}</span>
              </p>
              <Badge tone="outline" className="w-fit">{t({ en: `${article.notes.length} notes in the margin`, tr: `Kenarda ${article.notes.length} not` })}</Badge>
            </div>
          </header>

          <BlockImage
            {...img(photos[post.photo])}
            aspect="21:9"
            priority
            sizes="(min-width: 76rem) 76rem, 100vw"
            className="rounded-ui"
            caption={t({ en: "Looking down the hill from the tram stop, 4 October, 09:50.", tr: "Tramvay durağından yokuş aşağı bakış, 4 Ekim, 09:50." })}
          />

          <ArticleBody
            locale={locale}
            blocks={blocks}
            notes={article.notes.map(t)}
            minutes={post.minutes}
            labels={{
              progress: t({ en: "Reading progress", tr: "Okuma ilerlemesi" }),
              minutesLeft: t({ en: "{n} min left", tr: "{n} dk kaldı" }),
              done: t({ en: "Finished", tr: "Bitti" }),
              notes: t({ en: "Notes", tr: "Notlar" }),
              note: t({ en: "Note {n}", tr: "Not {n}" }),
              back: t({ en: "Back to the text", tr: "Metne dön" }),
            }}
          />

          <aside aria-labelledby="author-card" className="mx-auto grid w-full max-w-[40rem] grid-cols-[auto_1fr] gap-5 border-y border-line py-8 @5xl:max-w-[71rem] @5xl:grid-cols-[auto_minmax(0,40rem)] @5xl:justify-center">
            <Avatar src={author.photo.src} name={author.name} size="xl" />
            <div className="flex flex-col gap-2">
              <p id="author-card" className="font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">
                {t({ en: "About the author", tr: "Yazar hakkında" })}
              </p>
              <p className="font-display text-h3 text-fg">{author.name}</p>
              <p className="text-fg-muted text-pretty">{t(author.bio)}</p>
              <a href={authorHref(post.author)} className={`w-fit text-small font-medium text-accent-ink underline underline-offset-[0.25em] ${link}`}>
                {t({ en: "More essays by Selin", tr: "Selin’in diğer yazıları" })}
              </a>
            </div>
          </aside>
        </Container>
      </Section>

      <BlogList
        locale={intl}
        labels={labels}
        variant="grid"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Keep reading", tr: "Okumaya devam" })}
        title={t({ en: "More on *public space*", tr: "*Kamusal alan* üzerine daha fazlası" })}
        posts={[posts[7]!, posts[6]!, posts[2]!].map((p) => postSummary(p, locale))}
      />
      <NewsletterBand locale={locale} />
    </>
  );
}
