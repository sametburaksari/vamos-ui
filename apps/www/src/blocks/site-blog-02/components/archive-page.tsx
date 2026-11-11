import { Container, Section } from "@vamos-ui/react/blocks";
import { copyFor, indexLabelsFor, indexPostsFor, posts, tagCounts, type SiteLocale } from "./content";
import { PostIndex } from "./post-index";

/**
 * The archive: every post grouped by year, with the text filter (`/`) and a tag strip.
 * `?page=archive#tag-postgres` opens it filtered by a tag.
 */
export function ArchivePage({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const first = posts[posts.length - 1]!;
  const words = posts.reduce((s, p) => s + p.minutes * 220, 0);

  return (
    <Section headingId="cp-archive-title" className="pt-10 @4xl:pt-16">
      <Container className="flex flex-col gap-10">
        <header className="grid gap-6 border-b border-line pb-8 @4xl:grid-cols-12 @4xl:items-end">
          <div className="flex flex-col gap-4 @4xl:col-span-7">
            <p className="font-mono text-eyebrow text-fg-subtle">
              <span aria-hidden className="text-accent-ink">
                ${" "}
              </span>
              ls -lt posts/
            </p>
            <h1 id="cp-archive-title" className="font-display text-display-l">
              {t({ en: "Archive", tr: "Arşiv" })}
            </h1>
            <p className="max-w-[48ch] text-lead text-fg-muted text-pretty">
              {t({
                en: "Every post since the first one, newest first. Type to filter, or pick a tag.",
                tr: "İlk yazıdan bu yana tüm yazılar, en yenisi başta. Süzmek için yazın ya da bir etiket seçin.",
              })}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 font-mono @4xl:col-span-5">
            {[
              { k: t({ en: "posts", tr: "yazı" }), v: String(posts.length) },
              { k: t({ en: "words", tr: "kelime" }), v: f.compact(words) },
              { k: t({ en: "first post", tr: "ilk yazı" }), v: f.date(first.date, { month: "short", year: "numeric" }) },
            ].map((s) => (
              <div key={s.k} className="flex flex-col gap-1 border-s border-line ps-3">
                <dt className="text-eyebrow text-fg-subtle">{s.k}</dt>
                <dd className="text-h3 font-semibold tracking-[-0.02em] text-fg tabular">{s.v}</dd>
              </div>
            ))}
          </dl>
        </header>
        <PostIndex posts={indexPostsFor(locale)} tagList={tagCounts} labels={indexLabelsFor(locale)} tagFilter groupByYear />
      </Container>
    </Section>
  );
}
