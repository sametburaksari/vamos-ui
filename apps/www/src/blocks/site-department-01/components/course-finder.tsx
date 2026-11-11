"use client";

import * as React from "react";
import { ChevronDown, SearchX } from "lucide-react";
import { Badge, Button, Input, NativeSelect, Switch, ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { copyFor, courses, formats, levels, people, terms, type Course, type Format, type Lang, type Level, type SiteLocale, type Term } from "./content";

type Sort = "code" | "ects" | "seats";

const fold = (s: string, locale: string) => s.toLocaleLowerCase(locale).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");

/** 2026-11-09 is a Monday: weekday 1–7 → a date to format the weekday name in the page's locale. */
const weekdayDate = (day: number) => `2026-11-${String(8 + day).padStart(2, "0")}`;

/**
 * The course finder (signature element): one catalogue of every course the department teaches,
 * filtered by level, term, format and teaching language, with free-text search over codes,
 * titles, descriptions and lecturers, an "only with free seats" switch and three sort orders.
 * Each entry shows its seat count as a meter and opens to its description, prerequisite and room.
 * `?q=` and `?level=` from the URL prefill it, so the home page search lands on results.
 */
export function CourseFinder({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const [query, setQuery] = React.useState("");
  const [level, setLevel] = React.useState<Level | "all">("all");
  const [termSet, setTermSet] = React.useState<Term[]>([]);
  const [formatSet, setFormatSet] = React.useState<Format[]>([]);
  const [langSet, setLangSet] = React.useState<Lang[]>([]);
  const [openOnly, setOpenOnly] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>("code");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get("q");
    const lv = p.get("level");
    if (q) setQuery(q);
    if (lv === "ba" || lv === "ma" || lv === "phd") setLevel(lv);
    // Arriving from a search elsewhere: bring the results into view.
    if (q || lv) requestAnimationFrame(() => document.getElementById("finder")?.scrollIntoView({ block: "start" }));
  }, []);

  const personName = (id: string) => people.find((p) => p.id === id)?.name ?? "";
  const words = fold(query.trim(), locale).split(/\s+/).filter(Boolean);
  // Both languages are searched: a Turkish page still finds "studio", an English one "konut".
  const text = (c: Course) => fold(`${c.code} ${c.code.replace(" ", "")} ${c.title.en} ${c.title.tr} ${t(c.text)} ${formats[c.format].en} ${formats[c.format].tr} ${personName(c.lead)}`, locale);

  const results = courses
    .filter(
      (c) =>
        (level === "all" || c.level === level) &&
        (termSet.length === 0 || termSet.includes(c.term)) &&
        (formatSet.length === 0 || formatSet.includes(c.format)) &&
        (langSet.length === 0 || langSet.includes(c.lang)) &&
        (!openOnly || c.taken < c.seats) &&
        words.every((w) => text(c).includes(w)),
    )
    .sort((a, b) => (sort === "ects" ? b.ects - a.ects : sort === "seats" ? b.seats - b.taken - (a.seats - a.taken) : a.code.localeCompare(b.code)));

  const ects = results.reduce((s, c) => s + c.ects, 0);
  const filtered = query !== "" || level !== "all" || termSet.length + formatSet.length + langSet.length > 0 || openOnly;
  const reset = () => {
    setQuery("");
    setLevel("all");
    setTermSet([]);
    setFormatSet([]);
    setLangSet([]);
    setOpenOnly(false);
  };

  const langName: Record<Lang, string> = { en: t({ en: "English", tr: "İngilizce" }), tr: t({ en: "Turkish", tr: "Türkçe" }) };
  const chip = "h-8 rounded-full border border-field-border px-3 text-small data-[state=on]:border-accent data-[state=on]:bg-accent data-[state=on]:text-accent-fg";

  return (
    <div data-course-finder="">
      {/* Filters: a bordered catalogue card, search first. */}
      <div className="rounded-ui border border-line bg-surface p-4 @2xl:p-6">
        <div className="grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_auto] @4xl:items-end">
          <div>
            <label htmlFor="cf-q" className="mb-1.5 block text-small font-semibold">
              {t({ en: "Search courses", tr: "Derslerde arayın" })}
            </label>
            <Input id="cf-q" type="search" size="lg" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t({ en: "Code, title, topic or lecturer — e.g. “housing”, “URB 312”", tr: "Kod, ad, konu ya da öğretim üyesi — ör. “konut”, “URB 312”" })} autoComplete="off" />
          </div>
          <div>
            <p id="cf-level" className="m-0 mb-1.5 text-small font-semibold">
              {t({ en: "Level", tr: "Düzey" })}
            </p>
            <ToggleGroup type="single" size="lg" aria-labelledby="cf-level" value={level} onValueChange={(v) => v && setLevel(v as Level | "all")} className="w-full @4xl:w-auto" block>
              <ToggleGroupItem value="all">{t({ en: "All", tr: "Tümü" })}</ToggleGroupItem>
              {(Object.keys(levels) as Level[]).map((l) => (
                <ToggleGroupItem key={l} value={l} aria-label={t(levels[l].long)}>
                  {t(levels[l].short)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-4">
          <FilterGroup label={t({ en: "Term", tr: "Dönem" })} id="cf-term">
            <ToggleGroup type="multiple" variant="ghost" size="sm" aria-labelledby="cf-term" value={termSet} onValueChange={(v) => setTermSet(v as Term[])} className="gap-1.5">
              {(Object.keys(terms) as Term[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className={chip}>
                  {t(terms[k])}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FilterGroup>
          <FilterGroup label={t({ en: "Format", tr: "Biçim" })} id="cf-format">
            <ToggleGroup type="multiple" variant="ghost" size="sm" aria-labelledby="cf-format" value={formatSet} onValueChange={(v) => setFormatSet(v as Format[])} className="flex-wrap gap-1.5">
              {(Object.keys(formats) as Format[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className={chip}>
                  {t(formats[k])}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FilterGroup>
          <FilterGroup label={t({ en: "Taught in", tr: "Öğretim dili" })} id="cf-lang">
            <ToggleGroup type="multiple" variant="ghost" size="sm" aria-labelledby="cf-lang" value={langSet} onValueChange={(v) => setLangSet(v as Lang[])} className="gap-1.5">
              {(["en", "tr"] as Lang[]).map((k) => (
                <ToggleGroupItem key={k} value={k} className={chip}>
                  {langName[k]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </FilterGroup>
          <Switch id="cf-open" size="sm" checked={openOnly} onCheckedChange={setOpenOnly} label={t({ en: "Free seats only", tr: "Yalnızca boş kontenjan" })} />
        </div>
      </div>

      {/* Result summary + sort */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-accent pb-3">
        <p role="status" aria-live="polite" className="m-0 text-body">
          <span className="font-display text-h3 tabular-nums">{results.length}</span>{" "}
          {t({ en: `of ${courses.length} courses`, tr: `/ ${courses.length} ders` })}
          <span className="text-fg-muted"> · {t({ en: `${f.number(ects)} ECTS`, tr: `${f.number(ects)} AKTS` })}</span>
        </p>
        <div className="flex items-center gap-3">
          {filtered ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              {t({ en: "Clear filters", tr: "Filtreleri temizle" })}
            </Button>
          ) : null}
          <label htmlFor="cf-sort" className="text-small whitespace-nowrap text-fg-muted">
            {t({ en: "Sort by", tr: "Sırala" })}
          </label>
          <NativeSelect
            id="cf-sort"
            size="sm"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            items={[
              { value: "code", label: t({ en: "Course code", tr: "Ders kodu" }) },
              { value: "ects", label: t({ en: "Most ECTS", tr: "En çok AKTS" }) },
              { value: "seats", label: t({ en: "Most free seats", tr: "En çok boş yer" }) },
            ]}
          />
        </div>
      </div>

      {results.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-12">
          <SearchX aria-hidden className="size-8 text-accent-ink" />
          <p className="m-0 font-display text-h3">{t({ en: "No course fits all of these filters", tr: "Bu filtrelerin hepsine uyan ders yok" })}</p>
          <p className="m-0 max-w-[50ch] text-fg-muted">{t({ en: "Remove a filter, or ask the student office which elective from another department counts toward your degree.", tr: "Bir filtreyi kaldırın ya da başka bölümlerden hangi seçmeli dersin sayıldığını öğrenci işlerine sorun." })}</p>
          <Button variant="secondary" onClick={reset}>
            {t({ en: "Show all courses", tr: "Tüm dersleri göster" })}
          </Button>
        </div>
      ) : (
        <ol className="m-0 list-none p-0">
          {results.map((c) => {
            const open = expanded === c.code;
            const free = c.seats - c.taken;
            const full = free <= 0;
            const panelId = `cf-${c.code.replace(" ", "")}`;
            return (
              <li key={c.code} className="vm-enter border-b border-line">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 py-5 @3xl:grid-cols-[7rem_minmax(0,1fr)_10rem_auto] @3xl:items-start">
                  <p className="m-0 font-mono text-small font-medium tracking-[0.02em] text-accent-ink @3xl:pt-1">{c.code}</p>
                  <div className="col-span-2 min-w-0 @3xl:col-span-1">
                    <h3 className="m-0 font-display text-h3 leading-snug">{t(c.title)}</h3>
                    <p className="m-0 mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-small text-fg-muted">
                      <span>{t(levels[c.level].long)}</span>
                      <span aria-hidden>·</span>
                      <span>{t(terms[c.term])}</span>
                      <span aria-hidden>·</span>
                      <span>{t(formats[c.format])}</span>
                      <span aria-hidden>·</span>
                      <span>{langName[c.lang]}</span>
                      <span aria-hidden>·</span>
                      <span className="font-semibold text-fg">{t({ en: `${f.number(c.ects)} ECTS`, tr: `${f.number(c.ects)} AKTS` })}</span>
                    </p>
                  </div>
                  <div className="col-start-1 row-start-3 @3xl:col-start-auto @3xl:row-start-auto @3xl:pt-1.5">
                    <div aria-hidden className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-selected">
                      <div className={cn("h-full rounded-full", full ? "bg-fg-muted" : "bg-accent")} style={{ width: `${Math.min(100, (c.taken / c.seats) * 100)}%` }} />
                    </div>
                    <p className="m-0 mt-1.5 text-small tabular-nums">
                      {full ? (
                        <Badge tone="outline">{t({ en: "Full · waiting list", tr: "Dolu · yedek liste" })}</Badge>
                      ) : (
                        t({ en: `${free} of ${c.seats} seats free`, tr: `${c.seats} yerden ${free} boş` })
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setExpanded(open ? null : c.code)}
                    className="col-start-2 row-start-3 inline-flex items-center gap-1 self-start justify-self-end rounded-ui-sm px-2 py-1 text-small font-semibold text-accent-ink hover:bg-hover focus-ring @3xl:col-start-auto @3xl:row-start-auto"
                  >
                    {t({ en: "Details", tr: "Ayrıntı" })}
                    <span className="sr-only"> — {c.code}</span>
                    <ChevronDown aria-hidden className={cn("size-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} />
                  </button>
                </div>
                <div id={panelId} hidden={!open} className="pb-6 @3xl:ps-[calc(7rem+1rem)]">
                  <div className="grid gap-5 rounded-ui bg-surface-2 p-5 @3xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <p className="m-0 max-w-[58ch] text-body">{t(c.text)}</p>
                    <dl className="m-0 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-small">
                      <dt className="text-fg-muted">{t({ en: "Lecturer", tr: "Öğretim üyesi" })}</dt>
                      <dd className="m-0 font-semibold">{personName(c.lead)}</dd>
                      <dt className="text-fg-muted">{t({ en: "When", tr: "Zaman" })}</dt>
                      <dd className="m-0">
                        {f.date(weekdayDate(c.slot.day), { weekday: "long" })} {c.slot.from}–{c.slot.to}
                      </dd>
                      <dt className="text-fg-muted">{t({ en: "Room", tr: "Derslik" })}</dt>
                      <dd className="m-0 font-mono">{c.room}</dd>
                      <dt className="text-fg-muted">{t({ en: "Requires", tr: "Ön koşul" })}</dt>
                      <dd className="m-0 font-mono">{c.prereq ?? t({ en: "—", tr: "—" })}</dd>
                    </dl>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function FilterGroup({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span id={id} className="text-small font-semibold">
        {label}
      </span>
      {children}
    </div>
  );
}
