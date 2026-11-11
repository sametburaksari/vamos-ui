"use client";

import * as React from "react";
import { CheckCircle2, MessageSquare, Pin } from "lucide-react";
import { Avatar, AvatarGroup, Pagination, Sparkline, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { categories, categoryById, copyFor, member, topicHref, topics, type CategoryId, type SiteLocale, type Topic } from "./content";

export type TopicSort = "latest" | "hot" | "top" | "unanswered";

const week = (t: Topic) => t.activity.slice(-7).reduce((a, b) => a + b, 0);

function sortTopics(list: Topic[], sort: TopicSort) {
  const by = [...list];
  if (sort === "unanswered") return by.filter((t) => t.replies === 0).sort((a, b) => b.created.localeCompare(a.created));
  if (sort === "hot") return by.filter((t) => !t.pinned).sort((a, b) => week(b) - week(a) || b.last.localeCompare(a.last));
  if (sort === "top") return by.sort((a, b) => b.likes - a.likes);
  return by.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.last.localeCompare(a.last));
}

export interface TopicListProps {
  locale: SiteLocale;
  /** Show the category rail beside the list (the topics page). */
  rail?: boolean;
  /** Rows per page; without it every match is shown. */
  pageSize?: number;
  /** Cap the rows (the home page). */
  limit?: number;
  /** Heading id the list region is labelled by. */
  labelledBy?: string;
}

/**
 * The topic list with activity (signature element). Every row carries its own pulse: who took
 * part, replies and views, a 14-day bar sparkline of posts and how long since the last one.
 * Sort by latest, hot (most posts in the last 7 days), top (most liked) or unanswered; on the
 * topics page a category rail filters the list (deep-linkable as `#cat-<id>`) and it pages.
 */
export function TopicList({ locale, rail, pageSize, limit, labelledBy }: TopicListProps) {
  const { t, f, ago } = copyFor(locale);
  const [sort, setSort] = React.useState<TopicSort>("latest");
  const [cat, setCat] = React.useState<CategoryId | "all">("all");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (!rail) return;
    const read = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (h.startsWith("cat-") && categories.some((c) => c.id === h.slice(4))) {
        setCat(h.slice(4) as CategoryId);
        setPage(1);
      }
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [rail]);

  const filtered = sortTopics(cat === "all" ? topics : topics.filter((x) => x.category === cat), sort);
  const pageCount = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const shown = pageSize ? filtered.slice((page - 1) * pageSize, page * pageSize) : limit ? filtered.slice(0, limit) : filtered;

  const sorts: { id: TopicSort; label: string }[] = [
    { id: "latest", label: t({ en: "Latest", tr: "En yeni" }) },
    { id: "hot", label: t({ en: "Hot this week", tr: "Bu hafta hareketli" }) },
    { id: "top", label: t({ en: "Top", tr: "En beğenilen" }) },
    { id: "unanswered", label: t({ en: "Unanswered", tr: "Yanıtsız" }) },
  ];
  const catName = cat === "all" ? t({ en: "All categories", tr: "Tüm kategoriler" }) : t(categoryById(cat).title);

  const list = (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup type="single" size="sm" aria-label={t({ en: "Sort topics", tr: "Konuları sırala" })} value={sort} onValueChange={(v) => { if (v) { setSort(v as TopicSort); setPage(1); } }} className="max-w-full overflow-x-auto">
          {sorts.map((s) => (
            <ToggleGroupItem key={s.id} value={s.id} className="whitespace-nowrap">
              {s.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p role="status" aria-live="polite" className="m-0 text-small text-fg-muted">
          {t({ en: `${filtered.length} topics`, tr: `${filtered.length} konu` })}
          {rail ? ` · ${catName}` : null}
        </p>
      </div>

      {/* Column heads (wide screens); each cell also carries its own label for screen readers. */}
      <div aria-hidden className="mt-3 hidden grid-cols-[minmax(0,1fr)_6.5rem_4rem_4rem_6.5rem_5rem] gap-x-4 border-b border-line px-3 pb-2 text-[0.75rem] font-medium tracking-[0.04em] text-fg-muted uppercase @4xl:grid">
        <span>{t({ en: "Topic", tr: "Konu" })}</span>
        <span>{t({ en: "People", tr: "Kişiler" })}</span>
        <span className="text-end">{t({ en: "Replies", tr: "Yanıt" })}</span>
        <span className="text-end">{t({ en: "Views", tr: "Görüntü" })}</span>
        <span>{t({ en: "14 days", tr: "14 gün" })}</span>
        <span className="text-end">{t({ en: "Last", tr: "Son" })}</span>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-start gap-2 border-b border-line px-3 py-10">
          <MessageSquare aria-hidden className="size-6 text-fg-muted" />
          <p className="m-0 font-semibold">{sort === "unanswered" ? t({ en: "Every topic here has an answer.", tr: "Buradaki her konuya yanıt verilmiş." }) : t({ en: "No topics here yet.", tr: "Burada henüz konu yok." })}</p>
          <p className="m-0 text-small text-fg-muted">{t({ en: "Start one — the first reply usually comes within the hour.", tr: "Bir tane başlatın — ilk yanıt genellikle bir saat içinde gelir." })}</p>
        </div>
      ) : (
        /* Keyed by the view: a new sort, category or page fades in as a fresh list, fast. */
        <Stagger asChild key={`${sort}-${cat}-${page}`} effect="fade" step={30} duration={360}>
        <ul aria-labelledby={labelledBy} className="m-0 list-none p-0">
          {shown.map((topic) => {
            const c = categoryById(topic.category);
            const lastBy = member(topic.participants[topic.participants.length - 1] ?? topic.author);
            const fresh = topic.replies === 0;
            return (
              <li key={topic.id} data-topic={topic.id} className={cn("group relative border-b border-line px-3 py-3 transition-colors hover:bg-hover motion-reduce:transition-none", topic.pinned && "bg-[color-mix(in_oklch,var(--accent)_6%,transparent)]")}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 @4xl:grid-cols-[minmax(0,1fr)_6.5rem_4rem_4rem_6.5rem_5rem] @4xl:items-center">
                  <div className="min-w-0">
                    <h3 className="m-0 text-[0.9375rem] leading-snug font-semibold">
                      {topic.pinned ? <Pin aria-label={t({ en: "Pinned", tr: "Sabitlendi" })} className="me-1 inline size-3.5 -translate-y-px text-accent-ink" /> : null}
                      {topic.solved ? <CheckCircle2 aria-label={t({ en: "Solved", tr: "Çözüldü" })} className="me-1 inline size-3.5 -translate-y-px text-success" /> : null}
                      <a href={topicHref(topic)} className="text-fg after:absolute after:inset-0 after:content-[''] hover:text-accent-ink focus-ring rounded-[2px]">
                        {t(topic.title)}
                      </a>
                    </h3>
                    <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-fg-muted">
                      <span className="inline-flex items-center gap-1.5 font-medium text-fg">
                        <span aria-hidden className="size-2 rounded-[2px]" style={{ background: c.color }} />
                        {t(c.title)}
                      </span>
                      {topic.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[0.75rem]">
                          #{tag}
                        </span>
                      ))}
                    </p>
                    <p className="m-0 mt-1 hidden truncate text-[0.8125rem] text-fg-muted @2xl:block">{t(topic.excerpt)}</p>
                  </div>

                  {/* Activity cells. */}
                  <div className="relative hidden @4xl:block">
                    <AvatarGroup size="xs" max={4} total={topic.participants.length} spacing="sm" aria-label={t({ en: `${topic.participants.length} people`, tr: `${topic.participants.length} kişi` })}>
                      {topic.participants.map((h) => (
                        <Avatar key={h} name={member(h).name} />
                      ))}
                    </AvatarGroup>
                  </div>
                  <p className={cn("m-0 hidden text-end tabular-nums @4xl:block", fresh ? "font-semibold text-accent-ink" : "font-semibold")}>
                    <span className="sr-only">{t({ en: "Replies:", tr: "Yanıt:" })} </span>
                    {topic.replies}
                  </p>
                  <p className="m-0 hidden text-end text-small tabular-nums text-fg-muted @4xl:block">
                    <span className="sr-only">{t({ en: "Views:", tr: "Görüntülenme:" })} </span>
                    {f.compact(topic.views)}
                  </p>
                  <div className="row-span-2 self-center @4xl:row-span-1">
                    <Sparkline values={topic.activity} variant="bars" size="sm" color={week(topic) >= 10 ? "accent-ink" : "fg-subtle"} label={t({ en: `Posts per day, last 14 days: ${topic.activity.join(", ")}`, tr: `Son 14 günde günlük ileti: ${topic.activity.join(", ")}` })} />
                  </div>
                  <p className="m-0 text-[0.8125rem] text-fg-muted @4xl:text-end">
                    <span className="@4xl:hidden">
                      {t({ en: `${topic.replies} replies · ${f.compact(topic.views)} views · `, tr: `${topic.replies} yanıt · ${f.compact(topic.views)} görüntülenme · ` })}
                    </span>
                    <time dateTime={topic.last} title={f.dateTime(topic.last)} className="font-medium text-fg">
                      {ago(topic.last)}
                    </time>
                    <span className="block truncate text-[0.75rem]">{fresh ? t({ en: "new, no replies", tr: "yeni, yanıt yok" }) : lastBy.handle}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        </Stagger>
      )}

      {pageSize && pageCount > 1 ? (
        <div className="mt-4 flex justify-center">
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} size="sm" />
        </div>
      ) : null}
    </div>
  );

  if (!rail) return list;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 @4xl:grid-cols-[13rem_minmax(0,1fr)] @4xl:gap-8">
      <nav aria-label={t({ en: "Categories", tr: "Kategoriler" })} className="min-w-0 @4xl:sticky @4xl:top-[calc(var(--topbar-h,4rem)+1rem)] @4xl:self-start">
        <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 pb-1 @4xl:flex-col @4xl:overflow-visible">
          {[{ id: "all" as const, title: { en: "All categories", tr: "Tüm kategoriler" }, color: "var(--fg)", topics: categories.reduce((s, c) => s + c.topics, 0) }, ...categories].map((c) => (
            <li key={c.id} className="shrink-0">
              <button
                type="button"
                id={`cat-${c.id}`}
                aria-pressed={cat === c.id}
                onClick={() => {
                  setCat(c.id);
                  setPage(1);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-ui-sm px-2.5 py-1.5 text-start text-small whitespace-nowrap focus-ring scroll-mt-28",
                  cat === c.id ? "bg-selected font-semibold text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
                )}
              >
                <span aria-hidden className="size-2.5 shrink-0 rounded-[3px]" style={{ background: c.color }} />
                <span className="flex-1">{t(c.title)}</span>
                <span className="text-[0.75rem] tabular-nums text-fg-muted">{f.compact(c.topics)}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {list}
    </div>
  );
}
