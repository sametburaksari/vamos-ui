import { ArrowLeft, ArrowRight } from "lucide-react";
import { Alert, Avatar, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { Container, sitePageHref } from "@vamos-ui/react/blocks";
import { ScrollProgress } from "@vamos-ui/react/motion";
import { CodeFile, CodeLangSwitch, CodeSample } from "./code-sample";
import { ARCHIVE_HREF, article, articleToc, authors, benchmark, codeLabelsFor, copyFor, featured, POST_HREF, posts, subscribeLabelsFor, tagHref, type SiteLocale } from "./content";
import { SubscribeForm } from "./subscribe-form";

const link = "rounded-[2px] focus-ring";
const measure = "max-w-[66ch]";

/**
 * The article: a plain header (path, date, minutes, tags, authors), the body with code samples
 * that switch language together, a margin with the contents and the same language switch,
 * the benchmark table, author notes, previous / next and a short subscribe form.
 */
export function ArticlePage({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const code = codeLabelsFor(locale);
  const author = authors[featured.author]!;
  const reviewer = authors.mira!;
  const older = posts[1]!;

  return (
    <article aria-labelledby="cp-article-title" className="@container pb-[calc(var(--section-y,6rem)*0.75)]">
      {/* Reading progress: the site's one scroll-linked effect. */}
      <ScrollProgress />
      <Container className="flex flex-col gap-6 pt-10 @4xl:pt-16">
        <nav aria-label={t({ en: "Breadcrumb", tr: "Konum" })} className="font-mono text-eyebrow text-fg-subtle">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <a href={sitePageHref("home")} className={`hover:text-fg ${link}`}>
                ~
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <a href={ARCHIVE_HREF} className={`hover:text-fg ${link}`}>
                posts
              </a>
            </li>
            <li aria-hidden>/</li>
            <li>
              <a href={tagHref(featured.tags[0]!)} className={`hover:text-fg ${link}`}>
                {featured.tags[0]}
              </a>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="truncate text-fg-muted">
              {featured.slug}.md
            </li>
          </ol>
        </nav>

        <header className="flex max-w-[54rem] flex-col gap-5">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow text-fg-muted">
            <time dateTime={featured.date} className="tabular text-fg">
              {f.date(featured.date, "long")}
            </time>
            <span aria-hidden>·</span>
            <span className="tabular">{t({ en: `${featured.minutes} min read`, tr: `${featured.minutes} dk okuma` })}</span>
            <span aria-hidden>·</span>
            {featured.tags.map((tag) => (
              <a key={tag} href={tagHref(tag)} className={`text-accent-ink hover:underline underline-offset-[0.25em] ${link}`}>
                #{tag}
              </a>
            ))}
          </p>
          <h1 id="cp-article-title" className="font-display text-display-l text-balance">
            {t(featured.title)}
          </h1>
          <p className="max-w-[60ch] text-lead text-fg-muted text-pretty">{t(featured.excerpt)}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5">
            <div className="flex items-center gap-3">
              <Avatar name={author.name} size="md" />
              <p className="flex flex-col text-small leading-tight">
                <span className="font-medium">{author.name}</span>
                <span className="text-fg-muted">{t(author.role)}</span>
              </p>
            </div>
            <p className="font-mono text-eyebrow text-fg-subtle">
              {t({ en: "reviewed by", tr: "inceleyen" })} <span className="text-fg-muted">{reviewer.name}</span> · {t({ en: "updated", tr: "güncellendi" })}{" "}
              <time dateTime="2026-11-02" className="tabular">
                {f.date("2026-11-02", "medium")}
              </time>
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-x-12 gap-y-8 @5xl:grid-cols-[minmax(0,1fr)_15rem]">
          <aside aria-label={t({ en: "About this post", tr: "Bu yazı hakkında" })} className="@5xl:col-start-2 @5xl:row-start-1">
            <div className="flex flex-col gap-6 @5xl:sticky @5xl:top-20">
              <div className="flex flex-col gap-2">
                <p id="cp-lang" className="font-mono text-eyebrow text-fg-subtle">
                  {t({ en: "code samples in", tr: "kod örnekleri" })}
                </p>
                <CodeLangSwitch label={t({ en: "Language of every code sample", tr: "Tüm kod örneklerinin dili" })} />
                <p className="text-eyebrow text-fg-subtle text-pretty">
                  {t({ en: "One switch for the whole post. Remembered next time.", tr: "Tüm yazı için tek seçim. Bir sonraki ziyarette hatırlanır." })}
                </p>
              </div>
              <nav aria-labelledby="cp-toc" className="hidden flex-col gap-2 @5xl:flex">
                <p id="cp-toc" className="font-mono text-eyebrow text-fg-subtle">
                  {t({ en: "on this page", tr: "bu sayfada" })}
                </p>
                <ol className="flex flex-col border-s border-line text-small">
                  {articleToc.map((h, i) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className={`-ms-px flex gap-2 border-s border-transparent py-1 ps-3 text-fg-muted hover:border-accent hover:text-fg ${link}`}>
                        <span className="font-mono text-fg-subtle tabular">{String(i + 1).padStart(2, "0")}</span>
                        {t(h.text)}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          <div className="min-w-0 @5xl:col-start-1 @5xl:row-start-1">
            {article.map((node, i) => {
              switch (node.type) {
                case "p":
                  return (
                    <p key={i} className={`${measure} mb-5 text-body text-pretty`}>
                      {t(node.text)}
                    </p>
                  );
                case "h2":
                  return (
                    <h2 key={i} id={node.id} className={`${measure} mb-4 mt-12 scroll-mt-24 text-h3 font-semibold tracking-[-0.02em]`}>
                      <a href={`#${node.id}`} className={`group/h ${link}`}>
                        <span aria-hidden className="me-2 font-mono text-accent-ink opacity-60 group-hover/h:opacity-100">
                          #
                        </span>
                        {t(node.text)}
                      </a>
                    </h2>
                  );
                case "note":
                  return (
                    <Alert key={i} tone="accent" title={t(node.title)} className={`${measure} my-6`}>
                      {t(node.text)}
                    </Alert>
                  );
                case "code":
                  return <CodeSample key={i} samples={node.samples} caption={node.caption ? t(node.caption) : undefined} labels={code} />;
                case "sql":
                  return <CodeFile key={i} file={node.file} code={node.code} caption={node.caption ? t(node.caption) : undefined} labels={code} />;
                case "list":
                  return (
                    <ul key={i} className={`${measure} mb-6 flex flex-col gap-2`}>
                      {node.items.map((item, j) => (
                        <li key={j} className="grid grid-cols-[1.25rem_1fr] text-pretty">
                          <span aria-hidden className="font-mono text-accent-ink">
                            -
                          </span>
                          {t(item)}
                        </li>
                      ))}
                    </ul>
                  );
                case "bench":
                  return (
                    <TableContainer key={i} aria-label={t(node.caption)} className="my-8 rounded-ui border border-line">
                      <Table>
                        <TableCaption side="bottom" className="font-mono text-eyebrow">
                          {t(node.caption)}
                        </TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t({ en: "Workers", tr: "İşçi" })}</TableHead>
                            <TableHead numeric>{t({ en: "Jobs / s", tr: "İş / sn" })}</TableHead>
                            <TableHead numeric>p50 (ms)</TableHead>
                            <TableHead numeric>p99 (ms)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {benchmark.map((b) => (
                            <TableRow key={b.workers}>
                              <TableCell rowHeader numeric className="text-start">
                                {b.workers}
                              </TableCell>
                              <TableCell numeric className={b.workers === 64 ? "font-semibold text-accent-ink" : undefined}>
                                {f.number(b.rate)}
                              </TableCell>
                              <TableCell numeric>{f.number(b.p50, { minimumFractionDigits: 1 })}</TableCell>
                              <TableCell numeric>{f.number(b.p99, { minimumFractionDigits: 1 })}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  );
              }
            })}

            <section aria-labelledby="cp-about-author" className={`${measure} mt-14 flex gap-4 border-y border-line py-6`}>
              <Avatar name={author.name} size="xl" />
              <div className="flex flex-col gap-1.5">
                <h2 id="cp-about-author" className="font-semibold">
                  {author.name} <span className="font-mono text-eyebrow font-normal text-fg-subtle">{author.handle}</span>
                </h2>
                <p className="text-small text-fg-muted text-pretty">{t(author.bio)}</p>
                <p className="font-mono text-eyebrow text-fg-subtle">
                  {t({ en: "Corrections:", tr: "Düzeltmeler:" })}{" "}
                  <a href="https://git.example.com/cold-path/issues" className={`text-accent-ink hover:underline ${link}`}>
                    {t({ en: "open an issue", tr: "bir issue açın" })}
                  </a>
                </p>
              </div>
            </section>

            <nav aria-label={t({ en: "More posts", tr: "Diğer yazılar" })} className={`${measure} grid gap-3 py-8 @xl:grid-cols-2`}>
              <a href={POST_HREF} className={`group flex flex-col gap-1 rounded-ui border border-line p-4 hover:border-accent ${link}`}>
                <span className="inline-flex items-center gap-1.5 font-mono text-eyebrow text-fg-subtle">
                  <ArrowLeft aria-hidden className="size-3.5 rtl:-scale-x-100" /> {t({ en: "older", tr: "daha eski" })}
                </span>
                <span className="text-small font-medium group-hover:text-accent-ink">{t(older.title)}</span>
              </a>
              <a href={ARCHIVE_HREF} className={`group flex flex-col items-end gap-1 rounded-ui border border-line p-4 text-end hover:border-accent ${link}`}>
                <span className="inline-flex items-center gap-1.5 font-mono text-eyebrow text-fg-subtle">
                  {t({ en: "everything else", tr: "geri kalan her şey" })} <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
                </span>
                <span className="text-small font-medium group-hover:text-accent-ink">{t({ en: "The archive, by year and tag", tr: "Arşiv, yıla ve etikete göre" })}</span>
              </a>
            </nav>

            <section aria-labelledby="cp-article-sub" className={`${measure} flex flex-col gap-3 rounded-ui border border-dashed border-line p-5`}>
              <h2 id="cp-article-sub" className="font-mono text-small text-fg">
                <span className="text-accent-ink">$</span> {t({ en: "get the next one by email", tr: "bir sonrakini e-postayla alın" })}
              </h2>
              <SubscribeForm labels={subscribeLabelsFor(locale)} />
            </section>
          </div>
        </div>
      </Container>
    </article>
  );
}
