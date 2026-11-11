import { ArrowRight, Rss } from "lucide-react";
import { Avatar } from "@vamos-ui/react";
import { Container, Section } from "@vamos-ui/react/blocks";
import { CodeTeaser } from "./code-sample";
import { ARCHIVE_HREF, authors, copyFor, featured, indexLabelsFor, indexPostsFor, POST_HREF, posts, subscribeLabelsFor, tagCounts, tagHref, teaser, type SiteLocale } from "./content";
import { PostIndex } from "./post-index";
import { SubscribeForm } from "./subscribe-form";

const link = "rounded-[2px] focus-ring";
const prompt = "font-mono text-eyebrow text-fg-subtle";

/** A shell-prompt eyebrow: `$ ls posts/`. */
function Prompt({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <p id={id} className={prompt}>
      <span aria-hidden className="text-accent-ink">
        ${" "}
      </span>
      {children}
    </p>
  );
}

/**
 * Home: a plain-text masthead beside the latest post shown as code, the keyboard-first post
 * index, topics as a `du`-style bar list beside the authors, and the subscribe band.
 */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const lead = authors[featured.author]!;
  const recent = indexPostsFor(locale).filter((p) => p.iso !== featured.date).slice(0, 7);
  const maxTag = tagCounts[0]!.count;
  const minutes = posts.reduce((s, p) => s + p.minutes, 0);

  return (
    <>
      <Section theme={{ rhythm: "tight" }} headingId="cp-title" className="border-b border-line">
        <Container className="grid gap-x-(--gutter) gap-y-12 pt-4 @4xl:grid-cols-12 @4xl:pt-10">
          <div className="flex flex-col gap-6 @4xl:col-span-6">
            <Prompt>cat README.md</Prompt>
            <h1 id="cp-title" className="max-w-[13ch] font-display text-display-xl text-balance">
              {t({ en: "Notes from the cold path", tr: "Soğuk yoldan notlar" })}
            </h1>
            <p className="max-w-[46ch] text-lead text-fg-muted text-pretty">
              {t({
                en: "Long-form writing on databases, queues and the parts of production nobody demos. One post a month, with the code that goes with it — in Go, Rust and TypeScript.",
                tr: "Veritabanları, kuyruklar ve üretimde kimsenin demo yapmadığı kısımlar üzerine uzun yazılar. Ayda bir yazı, beraberindeki kodla — Go, Rust ve TypeScript’te.",
              })}
            </p>
            <dl className="grid max-w-[34rem] grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line font-mono @md:grid-cols-4">
              {[
                { k: t({ en: "posts", tr: "yazı" }), v: String(posts.length) },
                { k: t({ en: "authors", tr: "yazar" }), v: String(Object.keys(authors).length) },
                { k: t({ en: "reading", tr: "okuma" }), v: f.duration(minutes, { unit: "min", style: "narrow" }) },
                { k: t({ en: "since", tr: "başlangıç" }), v: f.date("2025-08-20", { month: "short", year: "numeric" }) },
              ].map((s) => (
                <div key={s.k} className="flex flex-col gap-0.5 bg-surface px-3 py-2.5">
                  <dt className="text-eyebrow text-fg-subtle">{s.k}</dt>
                  <dd className="text-small text-fg tabular">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <article aria-labelledby="cp-latest" className="flex flex-col overflow-hidden rounded-ui border border-line bg-surface @4xl:col-span-6 @4xl:self-end">
            <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2 font-mono text-eyebrow text-fg-muted">
              <span className="text-accent-ink">{t({ en: "latest", tr: "son yazı" })}</span>
              <time dateTime={featured.date} className="tabular">
                {f.date(featured.date, "medium")}
              </time>
              <span className="ms-auto tabular">{t({ en: `${featured.minutes} min read`, tr: `${featured.minutes} dk okuma` })}</span>
            </div>
            <div className="border-b border-line bg-surface-2">
              <CodeTeaser code={teaser} label={t({ en: "Excerpt from the post, in SQL", tr: "Yazıdan bir alıntı, SQL" })} />
            </div>
            <div className="group relative flex flex-col gap-3 p-5">
              <h2 id="cp-latest" className="text-h3 font-semibold leading-tight tracking-[-0.02em] text-balance">
                <a href={POST_HREF} className="outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-accent-ink focus-visible:after:rounded-ui focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-ring">
                  {t(featured.title)}
                </a>
              </h2>
              <p className="text-small text-fg-muted text-pretty">{t(featured.excerpt)}</p>
              <div className="flex items-center gap-2.5 pt-1">
                <Avatar name={lead.name} size="sm" />
                <p className="text-small">
                  <span className="font-medium">{lead.name}</span> <span className="font-mono text-eyebrow text-fg-subtle">{lead.handle}</span>
                </p>
                <ArrowRight aria-hidden className="ms-auto size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent-ink rtl:-scale-x-100" />
              </div>
            </div>
          </article>
        </Container>
      </Section>

      <Section anchor="posts" headingId="cp-posts">
        <Container className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Prompt>git log --since=2026-01-01</Prompt>
              <h2 id="cp-posts" className="font-display text-display-m">
                {t({ en: "Recent posts", tr: "Son yazılar" })}
              </h2>
            </div>
            <a href={ARCHIVE_HREF} className={`inline-flex items-center gap-1.5 font-mono text-small text-accent-ink underline-offset-[0.3em] hover:underline ${link}`}>
              {t({ en: `All ${posts.length} posts`, tr: `${posts.length} yazının tümü` })} <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
            </a>
          </div>
          <PostIndex posts={recent} labels={indexLabelsFor(locale)} />
        </Container>
      </Section>

      <Section anchor="authors" headingId="cp-authors" theme={{ surface: "surface" }} className="border-y border-line">
        <Container className="grid gap-x-(--gutter) gap-y-12 @4xl:grid-cols-12">
          <div className="flex flex-col gap-5 @4xl:col-span-5">
            <Prompt>du -h --max-depth=1 tags/</Prompt>
            <h2 className="font-display text-display-m">{t({ en: "What we write about", tr: "Neler yazıyoruz" })}</h2>
            <ul className="flex flex-col font-mono text-small">
              {tagCounts.map(({ tag, count }) => (
                <li key={tag} className="grid grid-cols-[2ch_8rem_1fr] items-center gap-3 border-b border-line py-2 last:border-b-0">
                  <span className="text-end text-fg tabular">{count}</span>
                  <a href={tagHref(tag)} className={`truncate text-fg-muted hover:text-accent-ink ${link}`}>
                    #{tag}
                  </a>
                  <span aria-hidden className="h-1.5 rounded-full bg-accent-soft">
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${(count / maxTag) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5 @4xl:col-span-6 @4xl:col-start-7">
            <Prompt>finger @authors</Prompt>
            <h2 id="cp-authors" className="font-display text-display-m">
              {t({ en: "Who writes here", tr: "Burada kimler yazıyor" })}
            </h2>
            <ul className="flex flex-col">
              {Object.values(authors).map((a) => {
                const count = posts.filter((p) => p.author === a.id).length;
                return (
                  <li key={a.id} className="flex gap-4 border-b border-line py-4 last:border-b-0">
                    <Avatar name={a.name} size="lg" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold">{a.name}</span>
                        <span className="font-mono text-eyebrow text-fg-subtle">{a.handle}</span>
                        <span className="font-mono text-eyebrow text-fg-subtle tabular">· {t({ en: `${count} posts`, tr: `${count} yazı` })}</span>
                      </p>
                      <p className="text-small text-fg-muted">{t(a.role)}</p>
                      <p className="text-small text-pretty">{t(a.bio)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </Section>

      <Section anchor="subscribe" headingId="cp-subscribe">
        <Container className="grid gap-x-(--gutter) gap-y-8 @4xl:grid-cols-12 @4xl:items-end">
          <div className="flex flex-col gap-4 @4xl:col-span-6">
            <Prompt>subscribe --monthly</Prompt>
            <h2 id="cp-subscribe" className="max-w-[18ch] font-display text-display-m text-balance">
              {t({ en: "One post a month. No tracking pixels.", tr: "Ayda bir yazı. İzleme pikseli yok." })}
            </h2>
            <p className="max-w-[46ch] text-fg-muted">
              {t({
                en: "The full post arrives as plain text with the code inline. 3,180 engineers read it this way.",
                tr: "Yazının tamamı, kod içinde olacak şekilde düz metin olarak gelir. 3.180 mühendis bu şekilde okuyor.",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-4 @4xl:col-span-5 @4xl:col-start-8">
            <SubscribeForm labels={subscribeLabelsFor(locale)} />
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-eyebrow text-fg-muted">
              <Rss aria-hidden className="size-3.5 text-accent-ink" />
              <a href="https://example.com/rss.xml" className={`hover:text-fg ${link}`}>
                rss.xml
              </a>
              <a href="https://example.com/atom.xml" className={`hover:text-fg ${link}`}>
                atom.xml
              </a>
              <a href="https://example.com/feed.json" className={`hover:text-fg ${link}`}>
                feed.json
              </a>
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
