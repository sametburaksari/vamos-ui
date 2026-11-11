"use client";

import * as React from "react";
import { Button, EmptyState, Input, Kbd, RadioGroup, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Search } from "lucide-react";
import { useDesk, type ArchiveFilters } from "./desk-provider";
import { copyFor, issues, topics, type Issue, type SiteLocale, type TopicId } from "./content";

/** One char in → one char out, so indices in the folded text match the original. */
const foldChar = (c: string) => {
  if (c === "ı" || c === "İ" || c === "I") return "i";
  return (c.normalize("NFD")[0] ?? c).toLocaleLowerCase("en");
};
const fold = (s: string) => Array.from(s, foldChar).join("");
const terms = (q: string) => fold(q).split(/\s+/).filter((w) => w.length > 1);

/** Wraps every match of the search terms in <mark>. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const ws = terms(query);
  if (!ws.length) return <>{text}</>;
  const folded = fold(text);
  const hits: [number, number][] = [];
  for (const w of ws) {
    let i = folded.indexOf(w);
    while (i !== -1) {
      hits.push([i, i + w.length]);
      i = folded.indexOf(w, i + w.length);
    }
  }
  if (!hits.length) return <>{text}</>;
  hits.sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let pos = 0;
  hits.forEach(([s, e], k) => {
    if (s < pos) return;
    if (s > pos) out.push(text.slice(pos, s));
    out.push(
      <mark key={k} className="rounded-[2px] bg-accent-soft px-0.5 text-accent-ink">
        {text.slice(s, e)}
      </mark>,
    );
    pos = e;
  });
  out.push(text.slice(pos));
  return <>{out}</>;
}

export function matchIssue(i: Issue, f: ArchiveFilters) {
  if (f.topic !== "all" && i.topic !== f.topic) return false;
  if (f.year !== "all" && !i.date.startsWith(f.year)) return false;
  const ws = terms(f.query);
  if (!ws.length) return true;
  const hay = fold([i.title.en, i.title.tr, i.dek.en, i.dek.tr, ...i.body.flatMap((p) => [p.en, p.tr]), `#${i.n}`, `n${i.n}`].join(" "));
  return ws.every((w) => hay.includes(w));
}

/** A ruled archive row: number, title, dek, topic, date and reading time. */
export function IssueRow({ issue, locale, query = "" }: { issue: Issue; locale: SiteLocale; query?: string }) {
  const { t, f } = copyFor(locale);
  const { openIssue } = useDesk();
  const topic = topics.find((x) => x.id === issue.topic)!;
  return (
    <li className="border-b border-line">
      <button type="button" onClick={() => openIssue(issue.n)} className="group grid w-full grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 text-start focus-ring sm:grid-cols-[4.5rem_minmax(0,1fr)_9rem]">
        <span className="row-span-2 font-display text-[1.6rem] leading-none text-accent-ink tabular sm:text-[2rem]">
          <span className="sr-only">{t({ en: "Issue", tr: "Sayı" })} </span>
          {issue.n}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-[1.35rem] leading-tight text-fg group-hover:underline group-hover:decoration-accent group-hover:decoration-2 group-hover:underline-offset-4">
            <Highlight text={t(issue.title)} query={query} />
          </span>
          <span className="mt-1 block text-small text-fg-muted">
            <Highlight text={t(issue.dek)} query={query} />
          </span>
        </span>
        <span className="col-start-2 font-mono text-[11px] text-fg-muted sm:col-start-3 sm:row-start-1 sm:text-end">
          {f.date(issue.date, { day: "numeric", month: "short", year: "numeric" })}
          <br className="hidden sm:block" />
          <span className="sm:hidden"> · </span>
          {t(topic.name)} · {issue.minutes} {t({ en: "min", tr: "dk" })}
        </span>
      </button>
    </li>
  );
}

/**
 * The archive: search across titles, deks and full text (EN and TR, diacritics-insensitive, `/`
 * focuses the box), a topic switch, a year switch, live count, results by year with the
 * matches marked, and an empty state that offers to drop the filters.
 */
export function ArchiveSearch({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const { filters, setFilters } = useDesk();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const set = <K extends keyof ArchiveFilters>(k: K, v: ArchiveFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const results = issues.filter((i) => matchIssue(i, filters));
  const years = [...new Set(results.map((i) => i.date.slice(0, 4)))];
  const filtered = filters.query.trim() !== "" || filters.topic !== "all" || filters.year !== "all";

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || el?.closest("input, textarea, [contenteditable=true]")) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} aria-label={t({ en: "Search the archive", tr: "Arşivde ara" })} className="flex flex-col gap-5 border-y-2 border-fg py-6">
        <label htmlFor="sd-archive-q" className="sr-only">
          {t({ en: "Search all letters", tr: "Tüm mektuplarda ara" })}
        </label>
        <Input
          ref={inputRef}
          id="sd-archive-q"
          type="search"
          size="lg"
          leading={<Search aria-hidden />}
          trailing={<Kbd className="hidden sm:inline-flex">/</Kbd>}
          placeholder={t({ en: "Search 112 letters — try “notebook” or “ferry”", tr: "112 mektupta arayın — “defter” ya da “vapur” deneyin" })}
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          className="text-lead" inputClassName="[&::-webkit-search-cancel-button]:appearance-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ToggleGroup type="single" variant="ghost" size="sm" aria-label={t({ en: "Topic", tr: "Konu" })} value={filters.topic} onValueChange={(v) => set("topic", (v || "all") as TopicId | "all")} className="flex-wrap">
            <ToggleGroupItem value="all">{t({ en: "All topics", tr: "Tüm konular" })}</ToggleGroupItem>
            {topics.map((tp) => (
              <ToggleGroupItem key={tp.id} value={tp.id}>
                {t(tp.name)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <RadioGroup<ArchiveFilters["year"]>
            variant="segmented"
            size="sm"
            aria-label={t({ en: "Year", tr: "Yıl" })}
            value={filters.year}
            onValueChange={(v) => set("year", v)}
            items={[
              { value: "all", label: t({ en: "All years", tr: "Tüm yıllar" }) },
              { value: "2026", label: "2026" },
              { value: "2025", label: "2025" },
            ]}
          />
        </div>
      </form>

      <p aria-live="polite" className="mt-6 flex items-center justify-between gap-4 font-mono text-xs text-fg-muted">
        <span data-testid="archive-count">
          {results.length === issues.length && !filtered
            ? t({ en: `Showing ${results.length} recent letters`, tr: `Son ${results.length} mektup gösteriliyor` })
            : t({ en: `${results.length} ${results.length === 1 ? "letter matches" : "letters match"}`, tr: `${results.length} mektup eşleşiyor` })}
        </span>
        {filtered ? (
          <Button type="button" variant="ghost" size="xs" onClick={() => setFilters({ query: "", topic: "all", year: "all" })}>
            {t({ en: "Clear", tr: "Temizle" })}
          </Button>
        ) : null}
      </p>

      {results.length === 0 ? (
        <EmptyState
          className="mt-8"
          kind="no-results"
          title={t({ en: "Nothing in the archive says that — yet", tr: "Arşivde bunu söyleyen bir şey yok — henüz" })}
          description={t({ en: "Try a shorter word, or another topic. Or reply to any letter and ask; I might write it.", tr: "Daha kısa bir kelime ya da başka bir konu deneyin. Ya da herhangi bir mektubu yanıtlayıp sorun; belki yazarım." })}
          actions={
            <Button type="button" variant="secondary" onClick={() => setFilters({ query: "", topic: "all", year: "all" })}>
              {t({ en: "Show every letter", tr: "Tüm mektupları göster" })}
            </Button>
          }
        />
      ) : (
        years.map((y) => (
          <section key={y} aria-labelledby={`sd-year-${y}`} className="mt-8">
            <h2 id={`sd-year-${y}`} className="font-mono text-xs tracking-[0.12em] text-fg-muted uppercase">
              {y}
            </h2>
            <ul className="mt-2 border-t border-fg/60">
              {results
                .filter((i) => i.date.startsWith(y))
                .map((i) => (
                  <IssueRow key={i.n} issue={i} locale={locale} query={filters.query} />
                ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
