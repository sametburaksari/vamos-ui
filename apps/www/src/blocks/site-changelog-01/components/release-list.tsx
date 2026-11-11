"use client";

import * as React from "react";
import { ArrowRight, Sparkles, TrendingUp, Wrench } from "lucide-react";
import { Badge, Button, cn, Timeline, TimelineContent, TimelineIndicator, TimelineItem, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, KINDS, kindLabel, kindPlural, releaseId, releases, type Kind, type SiteLocale } from "./content";
import { useChangelog } from "./changelog-provider";

const icon: Record<Kind, typeof Sparkles> = { feature: Sparkles, improvement: TrendingUp, fix: Wrench };
const tone: Record<Kind, "accent" | "info" | "neutral"> = { feature: "accent", improvement: "info", fix: "neutral" };

/**
 * The release list with its signature: a date rail that sticks beside each release while you
 * read it (wide screens) and a "you are here" date bar under the navbar (narrow screens).
 * Filters by kind; releases with nothing left are hidden.
 */
export function ReleaseList({ locale }: { locale: SiteLocale }) {
  const { t, f, intl } = copyFor(locale);
  const { kinds, setKinds, open } = useChangelog();
  const counts = Object.fromEntries(KINDS.map((k) => [k, releases.reduce((n, r) => n + r.changes.filter((c) => c.kind === k).length, 0)])) as Record<Kind, number>;
  const visible = releases.map((r) => ({ ...r, changes: r.changes.filter((c) => kinds.includes(c.kind)) })).filter((r) => r.changes.length > 0);

  // Which release is under the reading line — drives the narrow-screen date bar.
  const [current, setCurrent] = React.useState(visible[0]?.version);
  const listRef = React.useRef<HTMLOListElement>(null);
  const visibleKey = visible.map((r) => r.version).join("|");
  React.useEffect(() => {
    const root = listRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-release]"));
    setCurrent(items[0]?.dataset.release);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent((e.target as HTMLElement).dataset.release);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [visibleKey]);
  const currentRelease = visible.find((r) => r.version === current) ?? visible[0];

  const day = (iso: string) => f.date(iso, { day: "2-digit" });
  const monthYear = (iso: string) => f.date(iso, { month: "short", year: "numeric" });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-line py-4">
        <p id="cl-filter-label" className="m-0 font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">
          {t({ en: "Show", tr: "Göster" })}
        </p>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="sm"
          aria-labelledby="cl-filter-label"
          value={kinds}
          onValueChange={(v) => setKinds(v as Kind[])}
          className="max-w-full"
        >
          {KINDS.map((k) => {
            const Icon = icon[k];
            return (
              <ToggleGroupItem key={k} value={k} className="gap-1.5 max-sm:px-2">
                <Icon aria-hidden className="max-sm:hidden" />
                {t(kindPlural[k])}
                <span className="font-mono text-[11px] text-fg-subtle tabular">{f.number(counts[k])}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </div>
      <p className="sr-only" aria-live="polite">
        {t({ en: `${visible.length} releases shown`, tr: `${visible.length} sürüm gösteriliyor` })}
      </p>

      {/* Narrow screens: the date of the release you're reading, pinned under the navbar. */}
      {currentRelease ? (
        <div aria-hidden className="sticky top-[var(--vb-nav-h,4.5rem)] z-10 -mx-(--gutter,1rem) flex items-center justify-between gap-3 border-b border-line bg-scene/95 px-(--gutter,1rem) py-2 font-mono text-[12px] text-fg-muted backdrop-blur-sm lg:hidden">
          <span>
            <span className="text-fg tabular">{f.date(currentRelease.date, "long")}</span>
          </span>
          <span className="text-accent-ink">v{currentRelease.version}</span>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="mt-12 rounded-ui-lg border border-dashed border-line px-6 py-12 text-center">
          <p className="m-0 font-display text-2xl text-fg">{t({ en: "Nothing to show", tr: "Gösterilecek bir şey yok" })}</p>
          <p className="m-0 mt-2 text-fg-muted">{t({ en: "Every kind of change is filtered out.", tr: "Tüm değişiklik türleri filtrelendi." })}</p>
          <Button className="mt-5" variant="secondary" onClick={() => setKinds(KINDS)}>
            {t({ en: "Show everything", tr: "Hepsini göster" })}
          </Button>
        </div>
      ) : (
        <ol ref={listRef} className="m-0 list-none p-0">
          {visible.map((r) => (
            <li key={r.version} id={releaseId(r.version)} data-release={r.version} className="grid scroll-mt-28 gap-x-12 border-b border-line py-12 last:border-b-0 lg:grid-cols-[8.5rem_minmax(0,1fr)]">
              {/* The rail: sticks while this release scrolls past. */}
              <div className="lg:relative">
                <div className="flex items-baseline gap-3 lg:sticky lg:top-[calc(var(--vb-nav-h,4.5rem)+2rem)] lg:flex-col lg:items-start lg:gap-0">
                  <time dateTime={r.date} className="contents">
                    <span className="font-display text-[length:var(--text-display-m)] leading-none text-fg tabular">{day(r.date)}</span>
                    <span className="font-mono text-[12px] tracking-[0.08em] text-fg-muted uppercase lg:mt-2">{monthYear(r.date)}</span>
                  </time>
                  <span className="ms-auto font-mono text-[12px] text-accent-ink lg:ms-0 lg:mt-4">v{r.version}</span>
                  <span aria-hidden className="mt-4 hidden h-px w-10 bg-accent lg:block" />
                </div>
              </div>

              <article aria-labelledby={`${releaseId(r.version)}-t`} className="mt-5 min-w-0 lg:mt-0">
                <h2 id={`${releaseId(r.version)}-t`} className="m-0 font-display text-[length:var(--text-display-m)] leading-[1.08] text-fg">
                  <a
                    href={sitePageHref("entry")}
                    onClick={(e) => {
                      e.preventDefault();
                      open(r.version);
                    }}
                    className="text-fg no-underline decoration-accent decoration-2 underline-offset-[6px] focus-ring hover:underline"
                  >
                    {t(r.title)}
                  </a>
                </h2>
                <p className="m-0 mt-4 text-lead text-fg-muted">{t(r.lead)}</p>
                <Timeline className="mt-8">
                  {r.changes.map((c, i) => {
                    const Icon = icon[c.kind];
                    return (
                      <TimelineItem key={i}>
                        <TimelineIndicator tone={tone[c.kind]} icon={<Icon aria-hidden />} />
                        <TimelineContent className="text-[15px] leading-6">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-medium text-fg">{t(c.title)}</span>
                            <Badge tone="outline" size="sm" shape="square">
                              {t(kindLabel[c.kind])}
                            </Badge>
                          </div>
                          <p className="m-0 mt-1 text-fg-muted">{t(c.text)}</p>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
                <a
                  href={sitePageHref("entry")}
                  onClick={(e) => {
                    e.preventDefault();
                    open(r.version);
                  }}
                  className={cn("mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink no-underline focus-ring hover:underline")}
                >
                  {t({ en: `Read the v${r.version} notes`, tr: `v${r.version} notlarını oku` })}
                  <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
                </a>
              </article>
            </li>
          ))}
        </ol>
      )}
      <p className="m-0 mt-6 font-mono text-[11px] text-fg-subtle" lang={intl}>
        {t({ en: "Older releases: v1.0 (2023-03-14) to v4.5 are in the archive.", tr: "Eski sürümler: v1.0 (2023-03-14) ile v4.5 arası arşivde." })}
      </p>
    </div>
  );
}
