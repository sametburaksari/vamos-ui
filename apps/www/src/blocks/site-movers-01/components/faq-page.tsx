"use client";

import * as React from "react";
import { EmptyState, Input, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, Cta, Faq, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { Search } from "lucide-react";
import { useQuote } from "./quote-provider";
import { copyFor, faqCats, faqs, PHONE, type FaqCat } from "./content";

const c = {
  crumb: { en: "FAQ", tr: "SSS" },
  title: { en: "Questions, *answered plainly*", tr: "Sorular, *açık açık*" },
  lead: { en: "Prices, moving day, cleaning, insurance. If it is not here, the office answers the phone from 08:30.", tr: "Fiyatlar, taşınma günü, temizlik, sigorta. Burada yoksa ofis 08:30’dan itibaren telefonu açar." },
  search: { en: "Search the questions", tr: "Sorularda ara" },
  filter: { en: "Filter by topic", tr: "Konuya göre süz" },
  all: { en: "All", tr: "Tümü" },
  count: { en: "{n} questions", tr: "{n} soru" },
  none: { en: "Nothing matches that", tr: "Eşleşen bir şey yok" },
  noneText: { en: "Try another word, or call us — we will add the answer here.", tr: "Başka bir kelime deneyin ya da bizi arayın — cevabı buraya ekleriz." },
};

export function FaqPage() {
  const { t, locale } = useQuote();
  const { intl, labels } = copyFor(locale);
  const [cat, setCat] = React.useState<FaqCat | "all">("all");
  const [q, setQ] = React.useState("");
  const needle = q.trim().toLocaleLowerCase(intl);
  const list = faqs.filter((f) => (cat === "all" || f.cat === cat) && (!needle || `${t(f.q)} ${t(f.a)}`.toLocaleLowerCase(intl).includes(needle)));

  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Tidyframe", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-4!">
        <Container>
          <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <ToggleGroup type="single" variant="segmented" aria-label={t(c.filter)} value={cat} onValueChange={(v) => setCat((v || "all") as FaqCat | "all")} className="max-w-full overflow-x-auto">
              <ToggleGroupItem value="all">{t(c.all)}</ToggleGroupItem>
              {faqCats.map((f) => (
                <ToggleGroupItem key={f.id} value={f.id}>
                  {t(f.name)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Input type="search" aria-label={t(c.search)} placeholder={t(c.search)} value={q} onChange={(e) => setQ(e.target.value)} leading={<Search aria-hidden className="size-4" />} clearable onClear={() => setQ("")} className="@3xl:w-72" />
          </div>
          <p className="mt-4 text-small text-fg-muted" role="status">
            {t(c.count).replace("{n}", String(list.length))}
          </p>
        </Container>
      </Section>
      {list.length ? (
        <Faq key={`${cat}-${needle}`} locale={intl} labels={labels} variant="stacked" theme={{ rhythm: "tight" }} title={t({ en: "Answers", tr: "Cevaplar" })} items={list.map((f) => ({ q: t(f.q), a: t(f.a) }))} />
      ) : (
        <Section theme={{ rhythm: "tight" }} aria-label={t(c.none)}>
          <Container>
            <EmptyState title={t(c.none)} description={t(c.noneText)} />
          </Container>
        </Section>
      )}
      <Cta
        locale={intl}
        labels={labels}
        variant="minimal"
        title={t({ en: "Still deciding? See your price first.", tr: "Hâlâ karar veremediniz mi? Önce fiyatınızı görün." })}
        actions={[{ link: { href: sitePageHref("quote"), label: t({ en: "Start a quote", tr: "Teklif başlat" }) }, style: "primary" }, { link: { href: `tel:${PHONE}`, label: t({ en: "Call the office", tr: "Ofisi arayın" }) }, style: "secondary" }]}
      />
    </>
  );
}
