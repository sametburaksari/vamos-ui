"use client";

import * as React from "react";
import { EmptyState, RadioGroup, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { BlockImage } from "@vamos-ui/react/blocks";
import { bouquets, liraOf, pick, SIZE_NAME, SIZE_STEMS, type L, type SiteLocale, type Size } from "./content";
import { ChooseBouquet, useOrder } from "./order-provider";

type Filter = "all" | "edit" | "lasting" | "under";

const c = {
  filter: { en: "Show", tr: "Göster" },
  all: { en: "Everything", tr: "Hepsi" },
  edit: { en: "This week’s edit", tr: "Haftanın seçkisi" },
  lasting: { en: "Lasts two weeks+", tr: "İki hafta+ dayanır" },
  under: { en: "Under ₺1,500", tr: "1.500 ₺ altı" },
  size: { en: "Size", tr: "Boyut" },
  count: { en: "{n} bouquets", tr: "{n} buket" },
  order: { en: "Order", tr: "Sipariş et" },
  inEdit: { en: "In the edit", tr: "Seçkide" },
  lastingTag: { en: "Long-lasting", tr: "Uzun ömürlü" },
  empty: { en: "Nothing under ₺1,500 in this size", tr: "Bu boyutta 1.500 ₺ altı bir şey yok" },
  emptyHint: { en: "Try a smaller size, or A Handful — our small posy.", tr: "Daha küçük bir boyut deneyin ya da küçük demetimiz Bir Avuç’a bakın." },
} satisfies Record<string, L>;

/** All bouquets: filter by the edit / long-lasting / budget, prices follow the chosen size. */
export function BouquetsGrid({ locale }: { locale: SiteLocale }) {
  const t = (v: L) => pick(v, locale);
  const lira = liraOf(locale);
  const { size, setSize } = useOrder();
  const [filter, setFilter] = React.useState<Filter>("all");
  const list = bouquets.filter((b) => (filter === "edit" ? b.edit : filter === "lasting" ? b.lasting : filter === "under" ? b.prices[size] < 1500 : true));

  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <ToggleGroup aria-label={t(c.filter)} value={filter} onValueChange={(v) => v && setFilter(v as Filter)} className="max-w-full flex-wrap">
          {(["all", "edit", "lasting", "under"] as const).map((f) => (
            <ToggleGroupItem key={f} value={f}>
              {t(c[f])}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex flex-wrap items-center gap-3">
          <span id="ps-size" className="text-small text-fg-muted">
            {t(c.size)}
          </span>
          <RadioGroup aria-labelledby="ps-size" variant="segmented" value={size} onValueChange={(v) => setSize(v as Size)} items={(["s", "m", "l"] as const).map((s) => ({ value: s, label: t(SIZE_NAME[s]) }))} />
          <span className="font-mono text-xs text-fg-muted">{t(SIZE_STEMS[size]).split("·")[1]}</span>
        </div>
      </div>

      <p className="m-0 mt-4 font-mono text-xs text-fg-muted" aria-live="polite">
        {t(c.count).replace("{n}", String(list.length))}
      </p>

      {list.length === 0 ? (
        <EmptyState className="mt-10" title={t(c.empty)} description={t(c.emptyHint)} />
      ) : (
        <ul className="m-0 mt-8 grid list-none gap-x-8 gap-y-14 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b, i) => (
            <li key={b.id} className={`flex flex-col ${i % 3 === 1 ? "lg:mt-16" : ""}`}>
              <div className="relative">
                <BlockImage src={b.photo.src} width={b.photo.width} height={b.photo.height} alt={t(b.photo.alt)} aspect="4:5" sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 100vw" className="overflow-hidden rounded-ui" />
                <div className="absolute start-3 top-3 flex gap-1.5">
                  {b.edit ? <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg">{t(c.inEdit)}</span> : null}
                  {b.lasting ? <span className="surface-popover rounded-full px-2.5 py-1 text-xs font-medium text-fg">{t(c.lastingTag)}</span> : null}
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h2 className="m-0 font-display text-h3 text-fg">{t(b.name)}</h2>
                <span className="font-mono text-fg tabular">{lira(b.prices[size])}</span>
              </div>
              <p className="m-0 mt-1.5 text-fg-muted">{t(b.line)}</p>
              <p className="m-0 mt-2 font-mono text-xs leading-relaxed text-fg-muted">{t(b.stems)}</p>
              <div className="mt-auto pt-5">
                <ChooseBouquet id={b.id} size={size} label={`${t(c.order)} · ${t(SIZE_NAME[size])}`} variant="secondary" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
