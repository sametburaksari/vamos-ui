"use client";

import * as React from "react";
import { Badge, Breadcrumb, Button, CheckboxGroup, EmptyState, Input, NativeSelect, Select, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTrigger, Slider, Switch, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { BadgeCheck, Search, SlidersHorizontal, Star } from "lucide-react";
import { categories, fill, products, sellers, type Category } from "./content";
import { applyFilters, PRICE_MAX, useMarket, type Filters, type Sort } from "./market-provider";
import { ProductCard } from "./product-card";

const copy = {
  home: { en: "Makersrow", tr: "Makersrow" },
  crumb: { en: "Search", tr: "Arama" },
  title: { en: "Search results", tr: "Arama sonuçları" },
  titleQ: { en: "Results for “{q}”", tr: "“{q}” için sonuçlar" },
  search: { en: "Search makers and pieces", tr: "Üretici ve ürün arayın" },
  results: { en: "{n} pieces from {s} makers", tr: "{s} üreticiden {n} ürün" },
  filters: { en: "Filters", tr: "Filtreler" },
  filtersN: { en: "Filters · {n}", tr: "Filtreler · {n}" },
  show: { en: "Show {n} pieces", tr: "{n} ürünü göster" },
  sort: { en: "Sort by", tr: "Sırala" },
  match: { en: "Best match", tr: "En uygun" },
  rating: { en: "Seller rating", tr: "Satıcı puanı" },
  priceAsc: { en: "Price: low to high", tr: "Fiyat: artan" },
  priceDesc: { en: "Price: high to low", tr: "Fiyat: azalan" },
  newest: { en: "Newest", tr: "En yeni" },
  category: { en: "Category", tr: "Kategori" },
  price: { en: "Price", tr: "Fiyat" },
  priceThumbs: [{ en: "Minimum price", tr: "En düşük fiyat" }, { en: "Maximum price", tr: "En yüksek fiyat" }],
  sellerRating: { en: "Seller rating", tr: "Satıcı puanı" },
  any: { en: "Any", tr: "Tümü" },
  plus: { en: "{r}+", tr: "{r}+" },
  ratingHint: { en: "From {n} verified reviews per seller on average.", tr: "Satıcı başına ortalama {n} doğrulanmış değerlendirme." },
  top: { en: "Top makers only", tr: "Yalnızca öne çıkan üreticiler" },
  topHint: { en: "4.8+ and 95% on-time", tr: "4,8+ ve %95 zamanında" },
  ships: { en: "Dispatch", tr: "Kargoya veriliş" },
  shipsAny: { en: "Any time", tr: "Fark etmez" },
  ships2: { en: "Within 2 days", tr: "2 gün içinde" },
  ships5: { en: "Within 5 days", tr: "5 gün içinde" },
  free: { en: "Free delivery", tr: "Ücretsiz kargo" },
  clear: { en: "Clear all", tr: "Tümünü temizle" },
  none: { en: "Nothing matches all of that", tr: "Hepsine uyan bir şey yok" },
  noneText: { en: "Loosen the seller rating or the price — or clear the filters and browse.", tr: "Satıcı puanını veya fiyatı gevşetin — ya da filtreleri temizleyip gezinin." },
  remove: { en: "Remove filter", tr: "Filtreyi kaldır" },
};

const RATING_STEPS = [0, 4, 4.5, 4.8];

/** Active filters as removable chips. */
function chipsOf(f: Filters, c: ReturnType<typeof useMarket>["c"]): { key: string; label: string; clear: Partial<Filters> }[] {
  const { t, lira, rating } = c;
  const out: { key: string; label: string; clear: Partial<Filters> }[] = [];
  if (f.query) out.push({ key: "q", label: `“${f.query}”`, clear: { query: "" } });
  for (const cat of f.categories) out.push({ key: cat, label: t(categories.find((x) => x.id === cat)!.label), clear: { categories: f.categories.filter((x) => x !== cat) } });
  if (f.price[0] > 0 || f.price[1] < PRICE_MAX) out.push({ key: "price", label: `${lira(f.price[0])} – ${f.price[1] < PRICE_MAX ? lira(f.price[1]) : "∞"}`, clear: { price: [0, PRICE_MAX] } });
  if (f.minRating) out.push({ key: "rating", label: `★ ${rating(f.minRating)}+`, clear: { minRating: 0 } });
  if (f.topOnly) out.push({ key: "top", label: t(copy.top), clear: { topOnly: false } });
  if (f.shipsWithin) out.push({ key: "ships", label: f.shipsWithin === 2 ? t(copy.ships2) : t(copy.ships5), clear: { shipsWithin: 0 } });
  if (f.freeShipping) out.push({ key: "free", label: t(copy.free), clear: { freeShipping: false } });
  return out;
}

/** The filter panel: in the sidebar on wide screens, in a sheet on phones. */
function FilterPanel() {
  const { c, filters, setFilters } = useMarket();
  const { t, f, rating } = c;
  const avgReviews = Math.round(sellers.reduce((n, s) => n + s.reviews, 0) / sellers.length);
  const ratingId = React.useId();
  const priceId = React.useId();
  const shipsId = React.useId();

  return (
    <div className="flex flex-col gap-7">
      {/* The signature filter: seller rating, each option with the count it would leave. */}
      <fieldset className="flex flex-col gap-2.5">
        <legend id={ratingId} className="mb-2.5 flex items-center gap-1.5 text-small font-semibold text-fg">
          <Star aria-hidden className="size-3.5 fill-current text-accent-ink" />
          {t(copy.sellerRating)}
        </legend>
        <ToggleGroup type="single" block size="sm" value={String(filters.minRating)} onValueChange={(v) => setFilters({ minRating: Number(v || 0) })} aria-labelledby={ratingId}>
          {RATING_STEPS.map((r) => {
            const n = applyFilters(products, { ...filters, minRating: r }, c).length;
            return (
              <ToggleGroupItem key={r} value={String(r)} className="flex-col gap-0 py-1 h-auto">
                <span>{r ? fill(t(copy.plus), { r: rating(r) }) : t(copy.any)}</span>
                <span className="tabular text-[10.5px] font-normal text-fg-muted">{f.number(n)}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
        <p className="text-[12px] text-fg-muted">{fill(t(copy.ratingHint), { n: f.number(avgReviews) })}</p>
        <Switch
          checked={filters.topOnly}
          onCheckedChange={(v) => setFilters({ topOnly: v })}
          label={
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck aria-hidden className="size-4 text-accent-ink" />
              {t(copy.top)}
            </span>
          }
          description={t(copy.topHint)}
          size="sm"
          className="mt-1"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-small font-semibold text-fg">{t(copy.category)}</legend>
        <CheckboxGroup
          value={filters.categories}
          onValueChange={(v) => setFilters({ categories: v as Category[] })}
          items={categories.map((cat) => ({
            value: cat.id,
            label: (
              <span className="flex w-full justify-between gap-3">
                {t(cat.label)}
                <span className="tabular text-fg-subtle">{products.filter((p) => p.category === cat.id).length}</span>
              </span>
            ),
          }))}
        />
      </fieldset>

      <div className="flex flex-col gap-3">
        <p id={priceId} className="text-small font-semibold text-fg">
          {t(copy.price)}
        </p>
        <Slider
          value={filters.price}
          min={0}
          max={PRICE_MAX}
          step={100}
          minStepsBetweenThumbs={1}
          onValueChange={(v) => setFilters({ price: [v[0] ?? 0, v[1] ?? PRICE_MAX] })}
          thumbLabels={copy.priceThumbs.map((x) => t(x))}
          formatValue={(v) => c.lira(v)}
          withInputs
          aria-labelledby={priceId}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor={shipsId} className="text-small font-semibold text-fg">
          {t(copy.ships)}
        </label>
        <NativeSelect
          id={shipsId}
          value={String(filters.shipsWithin)}
          onChange={(e) => setFilters({ shipsWithin: Number(e.target.value) })}
          items={[
            { value: "0", label: t(copy.shipsAny) },
            { value: "2", label: t(copy.ships2) },
            { value: "5", label: t(copy.ships5) },
          ]}
        />
        <Switch checked={filters.freeShipping} onCheckedChange={(v) => setFilters({ freeShipping: v })} label={t(copy.free)} size="sm" />
      </div>
    </div>
  );
}

/** Search results: query, sort, active chips, filter panel (sidebar / sheet) and the grid. */
export function SearchPage() {
  const { c, filters, setFilters, resetFilters } = useMarket();
  const { t, f } = c;
  const list = applyFilters(products, filters, c);
  const sellerCount = new Set(list.map((p) => p.seller)).size;
  const chips = chipsOf(filters, c);
  const [draft, setDraft] = React.useState(filters.query);
  React.useEffect(() => setDraft(filters.query), [filters.query]);

  return (
    <Section theme={{ rhythm: "tight" }} headingId="mr-search-title" className="!pt-6">
      <Container size="wide">
        <Breadcrumb items={[{ label: t(copy.home), href: sitePageHref("home") }, { label: t(copy.crumb) }]} />
        <form
          role="search"
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFilters({ query: draft.trim() });
          }}
        >
          <Input type="search" size="lg" value={draft} onChange={(e) => setDraft(e.target.value)} leading={<Search aria-hidden className="size-4" />} placeholder={t(copy.search)} aria-label={t(copy.search)} className="flex-1" />
          <Button type="submit" variant="primary" size="lg">
            {t({ en: "Search", tr: "Ara" })}
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 id="mr-search-title" className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.02em] text-fg">
              {filters.query ? fill(t(copy.titleQ), { q: filters.query }) : t(copy.title)}
            </h1>
            <p className="tabular mt-1 text-small text-fg-muted" aria-live="polite">
              {fill(t(copy.results), { n: f.number(list.length), s: f.number(sellerCount) })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="lg:hidden">
                  <SlidersHorizontal aria-hidden />
                  {chips.length ? fill(t(copy.filtersN), { n: chips.length }) : t(copy.filters)}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" size="lg">
                <SheetHeader title={t(copy.filters)} />
                <SheetBody>
                  <FilterPanel />
                </SheetBody>
                <SheetFooter>
                  <Button variant="ghost" onClick={resetFilters}>
                    {t(copy.clear)}
                  </Button>
                  <SheetTrigger asChild>
                    <Button variant="primary">{fill(t(copy.show), { n: list.length })}</Button>
                  </SheetTrigger>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Select<Sort>
              value={filters.sort}
              onValueChange={(v) => setFilters({ sort: v ?? "match" })}
              aria-label={t(copy.sort)}
              items={[
                { value: "match", label: t(copy.match) },
                { value: "rating", label: t(copy.rating) },
                { value: "price-asc", label: t(copy.priceAsc) },
                { value: "price-desc", label: t(copy.priceDesc) },
                { value: "new", label: t(copy.newest) },
              ]}
              className="w-48"
            />
          </div>
        </div>

        {chips.length ? (
          <ul role="list" aria-label={t(copy.filters)} className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((ch) => (
              <li key={ch.key}>
                <Badge tone="accent" size="lg" onRemove={() => setFilters(ch.clear)} removeLabel={t(copy.remove)}>
                  {ch.label}
                </Badge>
              </li>
            ))}
            <li>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                {t(copy.clear)}
              </Button>
            </li>
          </ul>
        ) : null}

        <div className="mt-6 grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside aria-label={t(copy.filters)} className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>
          {list.length ? (
            <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 2xl:grid-cols-4">
              {list.map((p, i) => (
                <li key={p.id} className="min-w-0">
                  <ProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              kind="no-results"
              title={t(copy.none)}
              description={t(copy.noneText)}
              actions={
                <Button variant="secondary" onClick={() => resetFilters()}>
                  {t(copy.clear)}
                </Button>
              }
            />
          )}
        </div>
      </Container>
    </Section>
  );
}
