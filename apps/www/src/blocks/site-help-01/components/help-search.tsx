"use client";

import * as React from "react";
import { FileText, Folder, LifeBuoy } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, Kbd, foldText, highlightParts } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { articles, categories, categoryById, copyFor, suggestions, type SiteLocale } from "./content";
import { useHelp } from "./help-provider";

interface Hit {
  id: string;
  title: string;
  summary: string;
  category: string;
  minutes: number;
  score: number;
}

/** True when `w` starts a word in `text` (both already folded). */
const startsWord = (text: string, w: string) => new RegExp(`(^|[^\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "u").test(text);

/** Scores an article: the whole query starting a title word beats single words in the title, then keywords, then the summary. */
function score(q: string, fields: { title: string; keywords: string; summary: string }, locale: string) {
  const words = q.split(/\s+/).filter(Boolean);
  const title = foldText(fields.title, locale);
  const kw = foldText(fields.keywords, locale);
  const sum = foldText(fields.summary, locale);
  let s = 0;
  if (startsWord(title, q)) s += 10;
  for (const w of words) {
    if (startsWord(title, w)) s += 4;
    else if (startsWord(kw, w)) s += 3;
    else if (startsWord(sum, w)) s += 1;
    else return 0; // every word must match somewhere
  }
  return s;
}

/** Marks the query where it starts a word ("in" → **In**vite, not m*in*utes). */
function Highlight({ text, query, locale }: { text: string; query: string; locale: string }) {
  const parts = highlightParts(text, query, locale);
  return (
    <>
      {parts.map((p, i) =>
        p.match && (i === 0 || /[^\p{L}\p{N}]$/u.test(parts[i - 1]!.text)) ? (
          <mark key={i} className="rounded-[3px] bg-accent-soft px-px text-accent-ink">
            {p.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

/**
 * The signature of the help centre: results appear under the field while you type (no Enter,
 * no results page) — articles with the match highlighted, matching categories, and a way to ask
 * support with the words you typed. Arrow keys move, Enter opens, Escape closes, "/" focuses.
 */
export function HelpSearch({ locale, size = "lg", autoFocusKey = true }: { locale: SiteLocale; size?: "lg" | "md"; autoFocusKey?: boolean }) {
  const { t, f, intl } = copyFor(locale);
  const { openArticle, openCategory } = useHelp();
  const { navigate } = useSiteShell();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selected, setSelected] = React.useState("");

  const query = foldText(q.trim(), intl);
  const hits = React.useMemo<Hit[]>(() => {
    if (!query) return [];
    return articles
      .map((a) => ({
        id: a.id,
        title: t(a.title),
        summary: t(a.summary),
        category: t(categoryById(a.category)!.title),
        minutes: a.minutes,
        score: score(query, { title: t(a.title), keywords: t(a.keywords), summary: t(a.summary) }, intl),
      }))
      .filter((h) => h.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, intl))
      .slice(0, 6);
  }, [query, t, intl]);
  const cats = React.useMemo(() => (query ? categories.filter((c) => startsWord(foldText(`${t(c.title)} ${t(c.text)}`, intl), query)).slice(0, 3) : []), [query, t, intl]);

  // Keep the first result highlighted as the query changes.
  React.useEffect(() => {
    setSelected(hits[0]?.id ?? cats[0]?.id ?? "support");
  }, [hits, cats]);

  // "/" focuses the search from anywhere on the page.
  React.useEffect(() => {
    if (!autoFocusKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [autoFocusKey]);

  const close = () => {
    setOpen(false);
  };
  const done = () => {
    setOpen(false);
    setQ("");
  };

  const showPanel = open && query.length > 0;
  const big = size === "lg";

  return (
    <div
      ref={wrapRef}
      className="relative"
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node | null)) close();
      }}
      data-search-open={showPanel ? "" : undefined}
    >
      <Command
        shouldFilter={false}
        value={selected}
        onValueChange={setSelected}
        label={t({ en: "Search the help centre", tr: "Yardım merkezinde ara" })}
        className="relative overflow-visible"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (q) setQ("");
            else close();
          }
        }}
      >
        <div className={["surface rounded-ui-lg ring-accent/40 focus-within:ring-2", big ? "[&_[data-slot=command-input]]:border-0 [&_[data-slot=command-input]]:px-5" : "[&_[data-slot=command-input]]:border-0"].join(" ")}>
          <CommandInput
            ref={inputRef}
            value={q}
            onValueChange={(v) => {
              setQ(v);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={t({ en: "Search for “frost date”, “invite”, “cancel”…", tr: "“don tarihi”, “davet”, “iptal” gibi arayın…" })}
            className={big ? "h-16 text-lg" : "h-12"}
            end={autoFocusKey ? <Kbd size="sm" variant="ghost" className="hidden sm:inline-flex">/</Kbd> : undefined}
          />
        </div>

        <div hidden={!showPanel} className="surface-popover absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-ui-lg">
          <CommandList className="max-h-[min(30rem,65dvh)]">
            {hits.length ? (
              <CommandGroup heading={t({ en: "Articles", tr: "Makaleler" })}>
                {hits.map((h) => (
                  <CommandItem
                    key={h.id}
                    value={h.id}
                    onSelect={() => {
                      done();
                      openArticle(h.id);
                    }}
                    icon={<FileText className="size-4" />}
                    description={
                      <>
                        {h.category} · {f.number(h.minutes)} {t({ en: "min read", tr: "dk okuma" })}
                      </>
                    }
                  >
                    <Highlight text={h.title} query={q.trim()} locale={intl} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <p className="m-0 px-3 pt-4 pb-2 text-sm text-fg-muted">
                {t({ en: "No articles match", tr: "Eşleşen makale yok:" })} “{q.trim()}”.
              </p>
            )}
            {cats.length ? (
              <CommandGroup heading={t({ en: "Categories", tr: "Kategoriler" })}>
                {cats.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    onSelect={() => {
                      done();
                      openCategory(c.id);
                    }}
                    icon={<Folder className="size-4" />}
                    chevron
                  >
                    <Highlight text={t(c.title)} query={q.trim()} locale={intl} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
            <CommandGroup heading={t({ en: "Still stuck?", tr: "Hâlâ takıldınız mı?" })}>
              <CommandItem
                value="support"
                onSelect={() => {
                  done();
                  navigate({ page: "home", anchor: "contact" });
                }}
                icon={<LifeBuoy className="size-4" />}
              >
                {t({ en: "Ask support about", tr: "Destek’e sorun:" })} “{q.trim()}”
              </CommandItem>
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2 text-xs text-fg-muted">
            <span aria-live="polite">
              {hits.length
                ? t({ en: `${hits.length} ${hits.length === 1 ? "article" : "articles"}`, tr: `${hits.length} makale` })
                : t({ en: "No articles", tr: "Makale yok" })}
            </span>
            <span className="hidden items-center gap-1.5 sm:flex" aria-hidden>
              <Kbd size="sm" keyName="enter" /> {t({ en: "open", tr: "aç" })}
              <Kbd size="sm" keyName="esc" className="ms-2" /> {t({ en: "close", tr: "kapat" })}
            </span>
          </div>
        </div>
      </Command>

      {big ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-fg-muted">{t({ en: "Popular:", tr: "Sık arananlar:" })}</span>
          {suggestions.map((s) => (
            <button
              key={t(s)}
              type="button"
              onClick={() => {
                setQ(t(s));
                setOpen(true);
                inputRef.current?.focus();
              }}
              className="focus-ring rounded-full border border-line bg-surface px-3 py-1 text-fg transition-colors hover:border-field-border-hover hover:bg-hover"
            >
              {t(s)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
