"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Avatar, Input, Pagination, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BlogList, Container, PageIntro, sitePageHref } from "@vamos-ui/react/blocks";
import { authors, copyFor, postSummary, posts, topics, topicLabel, type AuthorId, type SiteLocale, type TopicId } from "./content";

const PER_PAGE = 4;
type Filter = { kind: "all" } | { kind: "topic"; id: TopicId } | { kind: "author"; id: AuthorId };

/** `#topic-transit` / `#author-selin` → a filter. */
function readHash(): Filter {
  if (typeof window === "undefined") return { kind: "all" };
  const m = /^#(topic|author)-([a-z]+)$/.exec(window.location.hash);
  if (m?.[1] === "topic" && topics.some((x) => x.id === m[2])) return { kind: "topic", id: m[2] as TopicId };
  if (m?.[1] === "author" && m[2]! in authors) return { kind: "author", id: m[2] as AuthorId };
  return { kind: "all" };
}

/**
 * The archive: every essay, filtered by topic, author or a search, four per page. The filter
 * lives in the URL hash (`?page=archive#topic-transit`), so topic chips and author links on
 * other pages open it pre-filtered, and back/forward keep working.
 */
export function ArchivePage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const [filter, setFilterState] = React.useState<Filter>({ kind: "all" });
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const sync = () => {
      setFilterState(readHash());
      setPage(1);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const setFilter = (next: Filter) => {
    setFilterState(next);
    setPage(1);
    const hash = next.kind === "all" ? "" : `#${next.kind}-${next.id}`;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
  };

  const q = query.trim().toLocaleLowerCase(intl);
  const matches = posts.filter((p) => {
    if (filter.kind === "topic" && p.topic !== filter.id) return false;
    if (filter.kind === "author" && p.author !== filter.id) return false;
    if (!q) return true;
    return `${t(p.title)} ${t(p.dek)} ${authors[p.author].name}`.toLocaleLowerCase(intl).includes(q);
  });
  const pageCount = Math.max(1, Math.ceil(matches.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const shown = matches.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const author = filter.kind === "author" ? authors[filter.id] : null;
  const title =
    filter.kind === "topic" ? t(topicLabel(filter.id)) : author ? author.name : t({ en: "The *archive*", tr: "*Arşiv*" });
  const lead =
    filter.kind === "topic"
      ? t({ en: "Every essay we have published on this topic, newest first.", tr: "Bu konuda yayımladığımız tüm denemeler, en yenisi önce." })
      : author
        ? `${t(author.role)}. ${t(author.bio)}`
        : t({ en: "Fourteen issues, read in any order. Filter by topic or writer, or search the titles.", tr: "On dört sayı, istediğiniz sırayla okuyun. Konuya ya da yazara göre süzün veya başlıklarda arayın." });

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        breadcrumb={[{ label: "Field Notes", href: sitePageHref("home") }, { label: t({ en: "Archive", tr: "Arşiv" }) }]}
        eyebrow={author ? t({ en: "Writer", tr: "Yazar" }) : filter.kind === "topic" ? t({ en: "Topic", tr: "Konu" }) : undefined}
        title={title}
        lead={lead}
        meta={[
          { label: t({ en: "Essays", tr: "Deneme" }), value: String(matches.length) },
          { label: t({ en: "Writers", tr: "Yazar" }), value: String(new Set(matches.map((p) => p.author)).size) },
          { label: t({ en: "Since", tr: "Başlangıç" }), value: "2023" },
        ]}
      />

      <search aria-label={t({ en: "Filter essays", tr: "Denemeleri süz" })} className="block @container">
        <Container className="-mt-6 flex flex-col gap-5 pb-2">
          <div className="grid gap-4 @4xl:grid-cols-[minmax(0,22rem)_1fr] @4xl:items-center">
            <Input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              leading={<Search aria-hidden className="size-4" />}
              clearable
              onClear={() => setQuery("")}
              placeholder={t({ en: "Search titles and writers", tr: "Başlık ve yazarlarda ara" })}
              aria-label={t({ en: "Search the archive", tr: "Arşivde ara" })}
            />
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <ToggleGroup
                type="single"
                variant="segmented"
                value={filter.kind === "topic" ? filter.id : filter.kind === "all" ? "all" : ""}
                onValueChange={(v) => setFilter(v && v !== "all" ? { kind: "topic", id: v as TopicId } : { kind: "all" })}
                aria-label={t({ en: "Topic", tr: "Konu" })}
              >
                <ToggleGroupItem value="all">{t({ en: "All", tr: "Tümü" })}</ToggleGroupItem>
                {topics.map((topic) => (
                  <ToggleGroupItem key={topic.id} value={topic.id} id={`topic-${topic.id}`} className="whitespace-nowrap">
                    {t(topic.label)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="me-2 font-mono text-eyebrow uppercase tracking-[0.12em] text-fg-muted">{t({ en: "Writers", tr: "Yazarlar" })}</span>
            {(Object.keys(authors) as AuthorId[]).map((id) => {
              const on = filter.kind === "author" && filter.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  id={`author-${id}`}
                  aria-pressed={on}
                  onClick={() => setFilter(on ? { kind: "all" } : { kind: "author", id })}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line pe-3.5 ps-1 text-small text-fg transition-colors hover:bg-hover focus-ring aria-pressed:border-accent aria-pressed:bg-accent-soft"
                >
                  <Avatar src={authors[id].photo.src} name={authors[id].name} size="xs" />
                  {authors[id].name}
                </button>
              );
            })}
          </div>
        </Container>
      </search>

      <div aria-live="polite" className="sr-only">
        {t({ en: `${matches.length} essays`, tr: `${matches.length} deneme` })}
      </div>

      <BlogList
        locale={intl}
        labels={labels}
        variant="list"
        theme={{ rhythm: "tight" }}
        className="pt-8"
        posts={shown.map((p) => postSummary(p, locale))}
        postHeadingLevel={2}
        empty={{
          title: t({ en: "Nothing matches yet", tr: "Henüz eşleşen yok" }),
          text: t({ en: "Try another word, or clear the topic and writer filters.", tr: "Başka bir kelime deneyin ya da konu ve yazar filtrelerini temizleyin." }),
        }}
      />

      {pageCount > 1 ? (
        <Container className="pb-16">
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} aria-label={t({ en: "Archive pages", tr: "Arşiv sayfaları" })} />
        </Container>
      ) : null}
    </>
  );
}
