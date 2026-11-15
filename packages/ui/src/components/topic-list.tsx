"use client";

import * as React from "react";
import { CheckCircle2, Lock, MessageSquare, Pin } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Avatar } from "./avatar";
import { Badge } from "./badge";

export const topicListLabels = {
  topic: "Topic",
  replies: "Replies",
  views: "Views",
  activity: "Last post",
  repliesCount: "{count, plural, one {# reply} other {# replies}}",
  viewsCount: "{count, plural, one {# view} other {# views}}",
  pinned: "Pinned",
  solved: "Solved",
  locked: "Locked",
  unread: "New",
  /** Sentence for the last-activity cell. */
  lastBy: "Last post by {name}, {time}",
  noReplies: "No replies yet",
  empty: "No topics yet.",
};
export type TopicListLabels = typeof topicListLabels;

type DateLike = string | number | Date;

export interface TopicPerson {
  name: string;
  /** Avatar photo; initials without it. */
  src?: string | null;
}

export interface TopicRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  /** The topic page. The whole row is clickable through this link. */
  href: string;
  /** One line of the first post (hidden on narrow screens). */
  excerpt?: string;
  /** Category or board, with its own link. */
  category?: { label: string; href?: string };
  /** Tags, shown as `#tag`; give `tagHref` to make them links. */
  tags?: string[];
  tagHref?: (tag: string) => string;
  replies: number;
  views?: number;
  /** Who posted last and when; avatar, name and relative time. */
  lastPost?: TopicPerson & { at: DateLike };
  /** Kept at the top; a pin icon. */
  pinned?: boolean;
  /** Has an accepted answer; a "Solved" badge. */
  solved?: boolean;
  /** Closed for replies; a lock icon. */
  locked?: boolean;
  /** Has posts the reader hasn't seen; a "New" badge and a bold title. */
  unread?: boolean;
  /** Heading level of the title. Default `3`. */
  headingLevel?: 2 | 3 | 4 | 5;
  /** Fixed "now" (epoch ms) for relative times; omit for the current time after hydration. */
  now?: number;
  labels?: Partial<TopicListLabels>;
}

const COLS = "@3xl:grid-cols-[minmax(0,1fr)_5rem_5rem_11rem]";

/** "Now" that is the same on the server and in the first client render, then the real clock. */
function useNow(fixed?: number) {
  const [now, setNow] = React.useState<number | null>(fixed ?? null);
  React.useEffect(() => {
    if (fixed == null) setNow(Date.now());
  }, [fixed]);
  return fixed ?? now;
}

/**
 * One forum or discussion topic: title (the whole row is a link), category, tags, reply and view
 * counts, and who posted last and when — with pinned, solved, locked and unread states. Inside
 * `TopicList` it is a list item; on its own, put it in your own `<ul>` / `<li>`.
 *
 * ```tsx
 * <TopicRow title="Best way to back up a home server?" href="/t/412" category={{ label: "Hardware" }}
 *   tags={["backup", "nas"]} replies={14} views={1280} solved lastPost={{ name: "Mira Kaya", at: "2026-11-14T18:20:00Z" }} />
 * ```
 */
export const TopicRow = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TopicRowProps>(function TopicRow(
  { title, href, excerpt, category, tags = [], tagHref, replies, views, lastPost, pinned, solved, locked, unread, headingLevel = 3, now: fixedNow, labels, className, ...props },
  ref,
) {
  const t = useLabels("topicList", topicListLabels, labels);
  const f = useFormat();
  const now = useNow(fixedNow);
  const H = `h${headingLevel}` as "h3";
  const at = lastPost ? new Date(lastPost.at) : null;
  const when = at ? (now == null ? f.date(at) : f.relative(at, { now, style: "short" })) : "";
  const chipLink = "relative z-10 rounded-[2px] hover:text-fg hover:underline focus-ring";

  return (
    <div
      ref={ref}
      data-slot="topic-row"
      data-pinned={pinned ? "" : undefined}
      data-solved={solved ? "" : undefined}
      data-locked={locked ? "" : undefined}
      data-unread={unread ? "" : undefined}
      className={cn(
        "group relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 px-3 py-3 transition-colors hover:bg-hover motion-reduce:transition-none @3xl:items-center",
        COLS,
        pinned && "bg-surface-2",
        className,
      )}
      {...props}
    >
      <div className="min-w-0">
        <H className={cn("m-0 text-[0.9375rem] leading-snug text-fg", unread ? "font-semibold" : "font-medium")}>
          {pinned ? (
            <span className="me-0.5 inline-flex -translate-y-px align-middle text-accent-ink">
              <Pin aria-hidden className="size-3.5" />
              <span className="sr-only">{t("pinned")}:</span>
            </span>
          ) : null}
          {pinned ? " " : null}
          {locked ? (
            <span className="me-0.5 inline-flex -translate-y-px align-middle text-fg-muted">
              <Lock aria-hidden className="size-3.5" />
              <span className="sr-only">{t("locked")}:</span>
            </span>
          ) : null}
          {locked ? " " : null}
          <a href={href} className="rounded-[2px] text-fg after:absolute after:inset-0 after:content-[''] hover:text-accent-ink focus-ring">
            {title}
          </a>
          {solved ? " " : null}
          {solved ? (
            <Badge tone="success" className="ms-1 align-middle">
              <CheckCircle2 aria-hidden />
              {t("solved")}
            </Badge>
          ) : null}
          {unread ? " " : null}
          {unread ? (
            <Badge tone="accent" className="ms-1 align-middle">
              {t("unread")}
            </Badge>
          ) : null}
        </H>
        {category || tags.length ? (
          <p className="m-0 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8125rem] text-fg-muted">
            {category ? (
              category.href ? (
                <a href={category.href} className={cn(chipLink, "font-medium text-fg")}>
                  {category.label}
                </a>
              ) : (
                <span className="font-medium text-fg">{category.label}</span>
              )
            ) : null}
            {tags.map((tag) =>
              tagHref ? (
                <a key={tag} href={tagHref(tag)} className={cn(chipLink, "font-mono text-xs")}>
                  #{tag}
                </a>
              ) : (
                <span key={tag} className="font-mono text-xs">
                  #{tag}
                </span>
              ),
            )}
          </p>
        ) : null}
        {excerpt ? <p className="m-0 mt-1 hidden truncate text-[0.8125rem] text-fg-muted @2xl:block">{excerpt}</p> : null}
      </div>

      {/* Narrow screens: replies count at the end of the row. */}
      <p className="m-0 flex items-center gap-1 self-start text-sm text-fg-muted tabular @3xl:hidden">
        <MessageSquare aria-hidden className="size-3.5" />
        <span className="sr-only">{t("repliesCount", { count: replies })}</span>
        <span aria-hidden="true">{f.compact(replies)}</span>
      </p>

      <p className="m-0 hidden text-end text-sm font-semibold text-fg tabular @3xl:block">
        <span className="sr-only">{t("repliesCount", { count: replies })}</span>
        <span aria-hidden="true">{f.compact(replies)}</span>
      </p>
      <p className="m-0 hidden text-end text-sm text-fg-muted tabular @3xl:block">
        {views != null ? (
          <>
            <span className="sr-only">{t("viewsCount", { count: views })}</span>
            <span aria-hidden="true">{f.compact(views)}</span>
          </>
        ) : null}
      </p>

      <div className="col-span-2 flex min-w-0 items-center gap-2 text-xs text-fg-muted @3xl:col-span-1">
        {lastPost && at ? (
          <>
            <Avatar name={lastPost.name} src={lastPost.src} size="xs" aria-hidden="true" />
            <span className="min-w-0 truncate">
              <span className="sr-only">{t("lastBy", { name: lastPost.name, time: when })}</span>
              <span aria-hidden="true">
                <span className="font-medium text-fg">{lastPost.name}</span> ·{" "}
                <time dateTime={at.toISOString()} title={f.dateTime(at)}>
                  {when}
                </time>
              </span>
            </span>
          </>
        ) : replies === 0 ? (
          <span>{t("noReplies")}</span>
        ) : null}
      </div>
    </div>
  );
});

export interface TopicListItem
  extends Pick<TopicRowProps, "title" | "href" | "excerpt" | "category" | "tags" | "tagHref" | "replies" | "views" | "lastPost" | "pinned" | "solved" | "locked" | "unread"> {
  id: string;
}

export interface TopicListProps extends React.HTMLAttributes<HTMLDivElement> {
  topics: TopicListItem[];
  /** Column heads (Topic · Replies · Views · Last post) on wide containers. Default `true`. */
  showHeader?: boolean;
  /** Shown when `topics` is empty. Default "No topics yet." */
  empty?: React.ReactNode;
  /** Heading level of each title. Default `3`. */
  headingLevel?: 2 | 3 | 4 | 5;
  /** Fixed "now" for every row's relative time (static pages, tests). */
  now?: number;
  /** Name of the list for screen readers (or pass `aria-labelledby`). */
  "aria-label"?: string;
  labels?: Partial<TopicListLabels>;
}

/**
 * A list of forum topics — `TopicRow`s with column heads on wide containers. The heads are for
 * sighted readers; each cell carries its own words for screen readers. Sorting, filtering and
 * paging stay in the app (pair it with ToggleGroup and Pagination).
 *
 * ```tsx
 * <TopicList aria-label="Latest topics" topics={topics} />
 * ```
 */
export const TopicList = /*#__PURE__*/ React.forwardRef<HTMLDivElement, TopicListProps>(function TopicList(
  { topics, showHeader = true, empty, headingLevel, now, labels, className, "aria-label": ariaLabel, "aria-labelledby": labelledBy, ...props },
  ref,
) {
  const t = useLabels("topicList", topicListLabels, labels);
  return (
    <div ref={ref} data-slot="topic-list" className={cn("@container min-w-0", className)} {...props}>
      {showHeader && topics.length > 0 ? (
        <div aria-hidden="true" className={cn("hidden gap-x-4 border-b border-line px-3 pb-2 text-xs font-medium text-fg-muted @3xl:grid", COLS)}>
          <span>{t("topic")}</span>
          <span className="text-end">{t("replies")}</span>
          <span className="text-end">{t("views")}</span>
          <span>{t("activity")}</span>
        </div>
      ) : null}
      {topics.length === 0 ? (
        <div data-slot="topic-list-empty" className="flex flex-col items-start gap-2 border-b border-line px-3 py-10 text-sm text-fg-muted">
          <MessageSquare aria-hidden className="size-5" />
          {empty ?? <p className="m-0">{t("empty")}</p>}
        </div>
      ) : (
        <ul aria-label={ariaLabel} aria-labelledby={labelledBy} className="m-0 list-none divide-y divide-line border-b border-line p-0">
          {topics.map(({ id, ...topic }) => (
            <li key={id} data-topic={id}>
              <TopicRow {...topic} headingLevel={headingLevel} now={now} labels={labels} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
