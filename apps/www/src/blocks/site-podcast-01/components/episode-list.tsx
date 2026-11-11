"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Button, EmptyState, Input, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Search } from "lucide-react";
import { clock, copyFor, episodes, topics, type SiteLocale } from "./content";

/** Lower-case and strip Turkish/Latin accents so "borek" finds "börek". */
const fold = (s: string, locale: SiteLocale) =>
  s
    .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i");

/** Every episode: search (title, guest, summary), a topic filter, rows that open into notes. */
export function EpisodeList({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const [q, setQ] = React.useState("");
  const [topic, setTopic] = React.useState("all");
  const needle = fold(q.trim(), locale);
  const shown = episodes.filter(
    (e) => (topic === "all" || e.topic === topic) && (!needle || fold(`${t(e.title)} ${e.guest} ${t(e.summary)} ${t(e.guestRole)}`, locale).includes(needle)),
  );
  const topicName = (id: string) => t(topics.find((x) => x.id === id)!.name);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          leading={<Search />}
          placeholder={t({ en: "Search episodes, guests, dishes…", tr: "Bölüm, konuk, yemek ara…" })}
          aria-label={t({ en: "Search episodes", tr: "Bölümlerde ara" })}
          className="md:max-w-sm"
          clearable
        />
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <ToggleGroup type="single" variant="segmented" value={topic} onValueChange={(v) => v && setTopic(v)} aria-label={t({ en: "Topic", tr: "Konu" })}>
            <ToggleGroupItem value="all">{t({ en: "All", tr: "Tümü" })}</ToggleGroupItem>
            {topics.map((tp) => (
              <ToggleGroupItem key={tp.id} value={tp.id}>
                {t(tp.name)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <p className="m-0 mt-4 font-mono text-xs text-fg-muted" aria-live="polite" data-testid="episode-count">
        {t({ en: `${shown.length} of ${episodes.length} episodes`, tr: `${episodes.length} bölümden ${shown.length}` })}
      </p>

      {shown.length === 0 ? (
        <EmptyState
          className="mt-6"
          title={t({ en: "No episode about that — yet", tr: "Bununla ilgili bölüm yok — henüz" })}
          description={t({ en: "Suggest a guest below and we might fix that.", tr: "Aşağıdan bir konuk önerin, belki bunu düzeltiriz." })}
          actions={
            <Button variant="secondary" onClick={() => { setQ(""); setTopic("all"); }}>
              {t({ en: "Clear search", tr: "Aramayı temizle" })}
            </Button>
          }
        />
      ) : (
        <Accordion type="single" collapsible className="mt-2" headingLevel={3}>
          {shown.map((e) => (
            <AccordionItem key={e.no} value={String(e.no)} className="vm-enter">
              <AccordionTrigger className="py-4">
                <span className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-3 text-start sm:grid-cols-[3.5rem_minmax(0,1fr)_auto]">
                  <span className="font-mono text-sm text-accent-ink tabular-nums">{String(e.no).padStart(3, "0")}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg leading-tight font-semibold">{t(e.title)}</span>
                    <span className="block text-small font-normal text-fg-muted">
                      {e.guest} · {t(e.guestRole)}
                    </span>
                  </span>
                  <span className="col-start-2 font-mono text-xs font-normal text-fg-muted tabular-nums sm:col-start-auto">
                    {f.date(e.date, { day: "numeric", month: "short" })} · {clock(e.length)}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="ps-[3.25rem] sm:ps-[4.25rem]">
                  <p className="m-0 max-w-[62ch] text-fg-muted">{t(e.summary)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Badge tone="outline">{topicName(e.topic)}</Badge>
                    {e.no === episodes[0]!.no ? (
                      <Button asChild variant="soft" size="sm">
                        <a href={sitePageHref("episode")}>
                          {t({ en: "Episode page and transcript", tr: "Bölüm sayfası ve döküm" })}
                          <ArrowRight aria-hidden className="rtl:rotate-180" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-small text-fg-muted">{t({ en: "Transcript coming with the archive rebuild in January.", tr: "Döküm, ocaktaki arşiv yenilemesiyle geliyor." })}</span>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
