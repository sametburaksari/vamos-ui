"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button, Input, Kbd, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";

export interface IndexPost {
  href: string;
  title: string;
  excerpt: string;
  /** `YYYY-MM-DD` */
  iso: string;
  /** Formatted date. */
  date: string;
  year: string;
  minutes: string;
  author: string;
  tags: string[];
}

export interface PostIndexLabels {
  filter: string;
  filterPlaceholder: string;
  /** "{count} posts" */
  count: string;
  /** "Nothing matches “{query}”" */
  empty: string;
  clear: string;
  allTags: string;
  tags: string;
  keys: string;
  focus: string;
  move: string;
  open: string;
  list: string;
}

/**
 * The post index, read like `git log`: mono date, title, tags, minutes. Press `/` anywhere on
 * the page to filter, `j` / `k` (or the arrow keys) to move between posts, Enter to open one.
 * With `tagFilter` a tag strip narrows the list; with `groupByYear` posts are grouped by year.
 */
export function PostIndex({
  posts,
  tagList,
  labels,
  tagFilter = false,
  groupByYear = false,
}: {
  posts: IndexPost[];
  tagList?: { tag: string; count: number }[];
  labels: PostIndexLabels;
  tagFilter?: boolean;
  groupByYear?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [tag, setTag] = React.useState("all");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const id = React.useId();

  // `?page=archive#tag-postgres` opens the archive filtered by that tag.
  React.useEffect(() => {
    if (!tagFilter) return;
    const m = window.location.hash.match(/^#tag-([a-z-]+)$/);
    if (m && tagList?.some((t) => t.tag === m[1])) setTag(m[1]!);
  }, [tagFilter, tagList]);

  // "/" focuses the filter from anywhere on the page (not while typing elsewhere).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (!inputRef.current || inputRef.current.offsetParent === null) return;
      e.preventDefault();
      inputRef.current.focus();
      inputRef.current.select();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLocaleLowerCase();
  const shown = posts.filter(
    (p) =>
      (tag === "all" || p.tags.includes(tag)) &&
      (!q || p.title.toLocaleLowerCase().includes(q) || p.excerpt.toLocaleLowerCase().includes(q) || p.tags.some((t) => t.includes(q)) || p.author.toLocaleLowerCase().includes(q)),
  );

  const groups = groupByYear
    ? shown.reduce<{ year: string; posts: IndexPost[] }[]>((acc, p) => {
        const g = acc.find((x) => x.year === p.year);
        if (g) g.posts.push(p);
        else acc.push({ year: p.year, posts: [p] });
        return acc;
      }, [])
    : [{ year: "", posts: shown }];

  // j / k and the arrow keys move between post links; Enter follows the link.
  const onListKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const down = e.key === "j" || e.key === "ArrowDown";
    const up = e.key === "k" || e.key === "ArrowUp";
    if (!down && !up) return;
    const links = Array.from(listRef.current?.querySelectorAll<HTMLAnchorElement>("a[data-post]") ?? []);
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = links[Math.min(links.length - 1, Math.max(0, at + (down ? 1 : -1)))];
    if (next) {
      e.preventDefault();
      next.focus();
      next.scrollIntoView({ block: "nearest" });
    }
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      listRef.current?.querySelector<HTMLAnchorElement>("a[data-post]")?.focus();
    }
    if (e.key === "Escape" && query) setQuery("");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center">
        <div className="relative @3xl:w-[22rem]">
          <label htmlFor={`${id}-q`} className="sr-only">
            {labels.filter}
          </label>
          <Input
            ref={inputRef}
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={labels.filterPlaceholder}
            leading={<Search aria-hidden />}
            trailing={query ? undefined : <Kbd size="sm">/</Kbd>}
            className="font-mono"
            aria-controls={`${id}-list`}
          />
        </div>
        <p className="hidden flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow text-fg-subtle @3xl:ms-auto @3xl:flex" aria-label={labels.keys}>
          <span className="inline-flex items-center gap-1.5">
            <Kbd size="sm">/</Kbd> {labels.focus}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd size="sm">j</Kbd>
            <Kbd size="sm">k</Kbd> {labels.move}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Kbd size="sm">↵</Kbd> {labels.open}
          </span>
        </p>
      </div>

      {tagFilter && tagList ? (
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <ToggleGroup type="single" variant="ghost" size="sm" value={tag} onValueChange={(v) => setTag(v || "all")} aria-label={labels.tags} className="font-mono">
            <ToggleGroupItem value="all">{labels.allTags}</ToggleGroupItem>
            {tagList.map((t) => (
              <ToggleGroupItem key={t.tag} value={t.tag}>
                #{t.tag}
                <span className="ms-1 text-fg-subtle tabular">{t.count}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : null}

      <p role="status" className="sr-only">
        {labels.count.replace("{count}", String(shown.length))}
      </p>

      <div ref={listRef} id={`${id}-list`} onKeyDown={onListKey} aria-label={labels.list} role="region" className="flex flex-col gap-8">
        {shown.length === 0 ? (
          <div className="flex flex-col items-start gap-3 border-y border-dashed border-line py-10 font-mono text-small text-fg-muted">
            <p>{labels.empty.replace("{query}", query.trim() || `#${tag}`)}</p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setQuery("");
                setTag("all");
                inputRef.current?.focus();
              }}
            >
              {labels.clear}
            </Button>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.year || "all"} className="flex flex-col">
              {groupByYear ? (
                <h2 className="mb-1 flex items-baseline gap-3 font-mono text-small text-fg-muted">
                  <span className="text-fg tabular">{g.year}</span>
                  <span aria-hidden className="h-px flex-1 translate-y-[-0.3em] bg-line" />
                  <span className="tabular">{labels.count.replace("{count}", String(g.posts.length))}</span>
                </h2>
              ) : null}
              <Stagger asChild effect="fade" step={40}>
              <ol className="flex flex-col">
                {g.posts.map((p) => (
                  <li key={p.href + p.title} className="group relative border-b border-line last:border-b-0 before:absolute before:inset-y-4 before:-start-3 before:w-0.5 before:origin-top before:scale-y-0 before:bg-accent before:content-[''] motion-safe:before:transition-transform motion-safe:before:duration-200 hover:before:scale-y-100 has-focus-visible:before:scale-y-100">
                    <div className="grid gap-x-6 gap-y-1 py-4 @3xl:grid-cols-[9.5rem_1fr_auto] @3xl:items-baseline">
                      <time dateTime={p.iso} className="font-mono text-eyebrow text-fg-subtle tabular @3xl:text-small">
                        {p.date}
                      </time>
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-fg text-pretty">
                          <a
                            data-post=""
                            href={p.href}
                            className="rounded-[2px] outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-accent-ink focus-visible:text-accent-ink focus-visible:after:rounded-ui-sm focus-visible:after:outline-2 focus-visible:after:outline-offset-[-2px] focus-visible:after:outline-ring"
                          >
                            {p.title}
                          </a>
                        </h3>
                        <p className="max-w-[68ch] text-small text-fg-muted text-pretty">{p.excerpt}</p>
                      </div>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow text-fg-subtle @3xl:justify-end @3xl:text-end">
                        <span>{p.tags.map((t) => `#${t}`).join(" ")}</span>
                        <span className="tabular text-fg-muted">{p.minutes}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              </Stagger>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
