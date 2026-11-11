"use client";

import * as React from "react";
import { Badge, Button, cn, Switch, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, ArrowUpRight, BellRing, Check } from "lucide-react";
import { copyFor, regions, shows, type Show, type SiteLocale } from "./content";

/**
 * The signature of the Mira Sol site: tour dates grouped by month, each with its state — on
 * sale, few left, moved (old date struck through), sold out (ticket link replaced by a
 * waitlist toggle). `full` adds the region filter and "Hide sold out"; `preview` shows the
 * next few dates on the home page.
 */
export function TourList({ locale, variant = "full", limit }: { locale: SiteLocale; variant?: "full" | "preview"; limit?: number }) {
  const { t, f, money, time } = copyFor(locale);
  const [region, setRegion] = React.useState("all");
  const [hideSold, setHideSold] = React.useState(false);
  const [waitlist, setWaitlist] = React.useState<string[]>([]);
  const [announce, setAnnounce] = React.useState("");

  const visible = shows.filter((s) => (region === "all" || s.region === region) && !(hideSold && s.status === "sold-out")).slice(0, limit ?? shows.length);
  const months = new Map<string, Show[]>();
  for (const s of visible) {
    const key = s.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), s]);
  }
  const soldOut = shows.filter((s) => s.status === "sold-out").length;

  const toggleWait = (s: Show) => {
    const on = waitlist.includes(s.id);
    setWaitlist((w) => (on ? w.filter((x) => x !== s.id) : [...w, s.id]));
    setAnnounce(
      on
        ? t({ en: `Left the waitlist for ${t(s.city)}.`, tr: `${t(s.city)} bekleme listesinden çıktınız.` })
        : t({ en: `You’re on the waitlist for ${t(s.city)}, ${f.date(s.date, { day: "numeric", month: "long" })}. We email you if a ticket comes back.`, tr: `${t(s.city)}, ${f.date(s.date, { day: "numeric", month: "long" })} için bekleme listesindesiniz. Bilet dönerse e-posta atarız.` }),
    );
  };

  return (
    <div>
      {variant === "full" ? (
        <div className="mb-8 flex flex-col gap-4 border-y border-line py-4 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <ToggleGroup type="single" variant="segmented" value={region} onValueChange={(v) => v && setRegion(v)} aria-label={t({ en: "Region", tr: "Bölge" })}>
              <ToggleGroupItem value="all">{t({ en: "All dates", tr: "Tüm tarihler" })}</ToggleGroupItem>
              {regions.map((r) => (
                <ToggleGroupItem key={r.id} value={r.id}>
                  {t(r.name)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex items-center gap-5">
            <p className="m-0 font-mono text-xs text-fg-muted tabular-nums" aria-live="polite" data-testid="tour-count">
              {t({ en: `${visible.length} shows`, tr: `${visible.length} konser` })}
            </p>
            <Switch checked={hideSold} onCheckedChange={setHideSold} label={t({ en: `Hide sold out (${soldOut})`, tr: `Tükenenleri gizle (${soldOut})` })} />
          </div>
        </div>
      ) : null}

      <p className="sr-only" role="status">
        {announce}
      </p>

      <div className="grid gap-12">
        {[...months.entries()].map(([key, list]) => {
          const gone = list.filter((s) => s.status === "sold-out").length;
          return (
            <section key={key} aria-labelledby={`ms-month-${variant}-${key}`} data-testid="tour-month">
              <header className="flex items-end justify-between gap-4 border-b-2 border-fg pb-2">
                <h3 id={`ms-month-${variant}-${key}`} className="m-0 font-display text-display-m leading-[0.85] lowercase">
                  {f.date(`${key}-01`, { month: "long" })}
                  <span className="ms-3 font-mono text-sm font-normal tracking-normal text-fg-muted">{key.slice(0, 4)}</span>
                </h3>
                <span className="pb-1 font-mono text-xs text-fg-muted tabular-nums">
                  {t({ en: `${list.length} ${list.length === 1 ? "show" : "shows"}`, tr: `${list.length} konser` })}
                  {gone ? t({ en: ` · ${gone} sold out`, tr: ` · ${gone} tükendi` }) : ""}
                </span>
              </header>
              <ol className="m-0 list-none p-0">
                {list.map((s) => {
                  const sold = s.status === "sold-out";
                  const waiting = waitlist.includes(s.id);
                  return (
                    <li
                      key={s.id}
                      data-status={s.status}
                      className={cn(
                        "grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-line py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:grid-cols-[4.5rem_7rem_minmax(0,1fr)_9rem_auto]",
                      )}
                    >
                      <span className={cn("row-span-2 font-display text-[2.6rem] leading-none tabular-nums sm:row-span-1 sm:text-[3.25rem]", sold && "text-fg-subtle line-through decoration-2")}>
                        {f.date(s.date, { day: "2-digit" })}
                      </span>
                      <span className="hidden font-mono text-xs leading-relaxed text-fg-muted uppercase md:block">
                        {f.date(s.date, { weekday: "short" })}
                        <br />
                        {t({ en: "Doors", tr: "Kapı" })} {time(s.doors)}
                      </span>
                      <span className="min-w-0">
                        <span className={cn("block text-xl leading-tight font-bold tracking-[-0.02em]", sold && "text-fg-muted")}>{t(s.city)}</span>
                        <span className="block truncate text-small text-fg-muted">
                          {s.venue} · {t(s.country)}
                          {s.support ? <span className="hidden sm:inline">{t({ en: ` · with ${s.support}`, tr: ` · konuk: ${s.support}` })}</span> : null}
                        </span>
                        {s.status === "moved" && s.was ? (
                          <span className="block font-mono text-xs text-fg-muted">
                            {t({ en: "Was", tr: "Eski tarih" })} <s>{f.date(s.was, { day: "numeric", month: "short" })}</s> — {t({ en: "tickets still valid", tr: "biletler geçerli" })}
                          </span>
                        ) : null}
                      </span>
                      <span className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-auto md:justify-self-start">
                        <StatusBadge s={s} locale={locale} />
                        {s.price && !sold ? <span className="font-mono text-xs text-fg-muted tabular-nums">{t({ en: `from ${money(s.price.amount, s.price.currency)}`, tr: `${money(s.price.amount, s.price.currency)}’dan` })}</span> : null}
                      </span>
                      <span className="col-span-2 sm:col-span-1 sm:col-start-3 md:col-start-auto md:justify-self-end">
                        {sold ? (
                          <Button variant={waiting ? "soft" : "ghost"} size="sm" aria-pressed={waiting} onClick={() => toggleWait(s)} className="w-full sm:w-auto" data-testid="waitlist">
                            {waiting ? <Check aria-hidden /> : <BellRing aria-hidden />}
                            {waiting ? t({ en: "On the waitlist", tr: "Bekleme listesinde" }) : t({ en: "Join waitlist", tr: "Bekleme listesine katıl" })}
                            <span className="sr-only">
                              : {t(s.city)} {f.date(s.date, { day: "numeric", month: "long" })}
                            </span>
                          </Button>
                        ) : (
                          <Button asChild variant={s.status === "few-left" ? "primary" : "secondary"} size="sm" className="w-full sm:w-auto">
                            <a href={`https://tickets.example.com/mira-sol/${s.id}`} target="_blank" rel="noopener noreferrer">
                              {t({ en: "Tickets", tr: "Bilet" })}
                              <span className="sr-only">
                                : {t(s.city)} {f.date(s.date, { day: "numeric", month: "long" })} {t({ en: "(opens in a new tab)", tr: "(yeni sekmede açılır)" })}
                              </span>
                              <ArrowUpRight aria-hidden className="rtl:-scale-x-100" />
                            </a>
                          </Button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      {visible.length === 0 ? <p className="m-0 py-10 text-center text-fg-muted">{t({ en: "No shows left here — try another region.", tr: "Burada konser kalmadı — başka bir bölge deneyin." })}</p> : null}

      {variant === "preview" ? (
        <Button asChild variant="secondary" size="lg" className="mt-8">
          <a href={sitePageHref("tour")}>
            {t({ en: `All ${shows.length} dates`, tr: `Tüm ${shows.length} tarih` })}
            <ArrowRight aria-hidden className="rtl:rotate-180" />
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function StatusBadge({ s, locale }: { s: Show; locale: SiteLocale }) {
  const { t } = copyFor(locale);
  switch (s.status) {
    case "sold-out":
      return <Badge tone="outline" shape="square">{t({ en: "Sold out", tr: "Tükendi" })}</Badge>;
    case "few-left":
      return <Badge tone="accent" shape="square">{t({ en: "Few left", tr: "Son biletler" })}</Badge>;
    case "moved":
      return <Badge tone="info" shape="square">{t({ en: "New date", tr: "Yeni tarih" })}</Badge>;
    default:
      return <Badge tone="neutral" shape="square">{t({ en: "On sale", tr: "Satışta" })}</Badge>;
  }
}
