"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArticleLayout, Container, Section, sitePageHref, type RichBlock, type RichDoc } from "@vamos-ui/react/blocks";
import { copyFor, KINDS, kindLabel, kindPlural, releases, type L, type Release, type SiteLocale } from "./content";
import { useChangelog } from "./changelog-provider";
import { Subscribe } from "./subscribe";

/** One release as an article body: a section per kind of change, the code sample, the upgrade note. */
function bodyFor(r: Release, t: (v: L) => string): RichDoc {
  const content: RichBlock[] = [];
  for (const k of KINDS) {
    const items = r.changes.filter((c) => c.kind === k);
    if (!items.length) continue;
    content.push({ type: "heading", level: 2, anchor: k, content: [{ text: t(kindPlural[k]) }] });
    content.push({
      type: "list",
      items: items.map((c) => ({ content: [{ type: "paragraph", content: [{ text: t(c.title), marks: [{ type: "bold" }] }, { text: ` — ${t(c.text)}` }] }] })),
    });
  }
  if (r.code) {
    content.push({ type: "heading", level: 2, anchor: "try-it", content: [{ text: t({ en: "Try it", tr: "Deneyin" }) }] });
    content.push({ type: "code", language: r.code.language, text: r.code.text });
  }
  if (r.note) {
    content.push({ type: "heading", level: 2, anchor: "notes", content: [{ text: t({ en: "Upgrade notes", tr: "Yükseltme notları" }) }] });
    content.push({ type: "blockquote", content: [{ type: "paragraph", content: [{ text: t(r.note) }] }] });
  }
  return { type: "doc", content };
}

/** The entry page: the opened release as an article, then older / newer and the subscribe box. */
export function EntryPage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const { version, open } = useChangelog();
  const index = Math.max(0, releases.findIndex((r) => r.version === version));
  const r = releases[index]!;
  const newer = releases[index - 1];
  const older = releases[index + 1];
  const kindsHere = KINDS.filter((k) => r.changes.some((c) => c.kind === k));

  const nav = (target: Release | undefined, dir: "older" | "newer") =>
    target ? (
      <a
        href={sitePageHref("entry")}
        onClick={(e) => {
          e.preventDefault();
          open(target.version);
        }}
        className={`group flex min-w-0 flex-col gap-1 rounded-ui-lg border border-line bg-surface px-5 py-4 no-underline focus-ring hover:border-field-border-hover ${dir === "newer" ? "sm:items-end sm:text-end" : ""}`}
      >
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">
          {dir === "older" ? <ArrowLeft aria-hidden className="size-3.5 rtl:rotate-180" /> : null}
          {dir === "older" ? t({ en: "Older", tr: "Daha eski" }) : t({ en: "Newer", tr: "Daha yeni" })} · v{target.version}
          {dir === "newer" ? <ArrowRight aria-hidden className="size-3.5 rtl:rotate-180" /> : null}
        </span>
        <span className="font-display text-xl text-fg">{t(target.title)}</span>
      </a>
    ) : (
      <span aria-hidden />
    );

  return (
    <>
      <ArticleLayout
        locale={intl}
        labels={labels}
        variant="minimal"
        toc
        post={{
          title: `v${r.version} — ${t(r.title)}`,
          dek: t(r.lead),
          body: bodyFor(r, t),
          author: { name: r.author.name, role: t(r.author.role) },
          publishedAt: r.date,
          breadcrumb: [
            { href: sitePageHref("home"), label: t({ en: "Changelog", tr: "Değişiklikler" }) },
          ],
          tags: kindsHere.map((k) => ({ href: sitePageHref("home"), label: t(kindLabel[k]) })),
          readingMinutes: Math.max(1, Math.round(r.changes.length * 0.6 + (r.code ? 1 : 0))),
        }}
        share={["copy", "x", "linkedin"]}
        url={`https://relay.example.com/changelog/v${r.version}`}
      />
      <Section anchor="more" headingId="cl-more-title" theme={{ rhythm: "tight" }} className="pt-0!">
        <Container size="prose">
          <h2 id="cl-more-title" className="sr-only">
            {t({ en: "More releases", tr: "Diğer sürümler" })}
          </h2>
          <nav aria-label={t({ en: "Other releases", tr: "Diğer sürümler" })} className="grid gap-3 sm:grid-cols-2">
            {nav(older, "older")}
            {nav(newer, "newer")}
          </nav>
          <div className="mt-12 border-t border-line pt-8">
            <p className="m-0 mb-4 font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">
              {t({ en: `Released ${f.date(r.date, "long")}`, tr: `${f.date(r.date, "long")} tarihinde yayımlandı` })}
            </p>
            <Subscribe locale={locale} idPrefix="cl-entry" />
          </div>
        </Container>
      </Section>
    </>
  );
}
