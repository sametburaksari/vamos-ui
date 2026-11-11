"use client";

import * as React from "react";
import { Button, Pagination, Select, Switch, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { categories, products, type Category, type Currency } from "./content";
import { ProductCard } from "./product-card";
import { useStore } from "./store-provider";

const PER_PAGE = 6;
type Sort = "featured" | "new" | "price-asc" | "price-desc";

const copy = {
  title: { en: "The *shop*", tr: "*Mağaza*" },
  lead: {
    en: "Everything from the last three firings. Each piece is thrown in Kuzguncuk; glazes vary a little from batch to batch — that is the point.",
    tr: "Son üç pişirimin hepsi. Her parça Kuzguncuk’ta çekilir; sırlar pişirimden pişirime biraz değişir — işin özü de bu.",
  },
  home: { en: "Kilnhouse", tr: "Kilnhouse" },
  shop: { en: "Shop", tr: "Mağaza" },
  all: { en: "All", tr: "Tümü" },
  category: { en: "Category", tr: "Kategori" },
  sort: { en: "Sort by", tr: "Sırala" },
  featured: { en: "Featured", tr: "Öne çıkanlar" },
  newest: { en: "Newest firing", tr: "En yeni pişirim" },
  priceAsc: { en: "Price: low to high", tr: "Fiyat: artan" },
  priceDesc: { en: "Price: high to low", tr: "Fiyat: azalan" },
  inStock: { en: "In stock only", tr: "Yalnızca stoktakiler" },
  results: { en: "{n} pieces", tr: "{n} parça" },
  none: { en: "Nothing in stock in this category right now. The next firing is on 18 November.", tr: "Bu kategoride şu an stokta ürün yok. Sonraki pişirim 18 Kasım’da." },
  reset: { en: "Clear filters", tr: "Filtreleri temizle" },
  pieces: { en: "Pieces", tr: "Parça" },
  firings: { en: "Next firing", tr: "Sonraki pişirim" },
  nextFiring: { en: "18 November", tr: "18 Kasım" },
  ships: { en: "Ships from", tr: "Gönderim" },
  shipsFrom: { en: "Üsküdar, İstanbul", tr: "Üsküdar, İstanbul" },
};

/** Shop: category filter, stock switch, sort, currency, a six-per-page grid and pagination. */
export function ShopPage() {
  const { t, locale, currency, setCurrency, shopCategory: category, setShopCategory: setCategory } = useStore();
  const [sort, setSort] = React.useState<Sort>("featured");
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const c = (k: keyof typeof copy) => copy[k][locale];

  const list = React.useMemo(() => {
    let out = products.filter((p) => category === "all" || p.category === category);
    if (inStockOnly) out = out.filter((p) => p.glazes.some((g) => g.stock > 0));
    const price = (p: (typeof products)[number]) => Number(p.price[currency]);
    if (sort === "new") out = [...out].sort((a, b) => b.batch.localeCompare(a.batch));
    if (sort === "price-asc") out = [...out].sort((a, b) => price(a) - price(b));
    if (sort === "price-desc") out = [...out].sort((a, b) => price(b) - price(a));
    return out;
  }, [category, sort, inStockOnly, currency]);

  const pageCount = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const current = Math.min(page, pageCount);
  const visible = list.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  React.useEffect(() => setPage(1), [category, sort, inStockOnly]);

  return (
    <>
      <PageIntro
        locale={locale === "tr" ? "tr-TR" : "en-US"}
        variant="ruled"
        breadcrumb={[{ label: t(copy.home), href: sitePageHref("home") }, { label: t(copy.shop) }]}
        title={t(copy.title)}
        lead={t(copy.lead)}
        meta={[
          { label: t(copy.pieces), value: String(products.length) },
          { label: t(copy.firings), value: t(copy.nextFiring) },
          { label: t(copy.ships), value: t(copy.shipsFrom) },
        ]}
      />
      <Section theme={{ rhythm: "tight" }} aria-label={t(copy.shop)}>
        <Container>
          <div className="sticky top-[calc(var(--topbar-h,4rem)+0.5rem)] z-20 -mx-2 mb-8 flex flex-col gap-3 rounded-ui-lg bg-scene/95 px-2 py-3 backdrop-blur-sm @4xl:flex-row @4xl:items-center @4xl:justify-between">
            <div className="-mx-2 overflow-x-auto px-2 scrollbar-none">
              <ToggleGroup
                type="single"
                variant="segmented"
                aria-label={t(copy.category)}
                value={category}
                onValueChange={(v) => setCategory((v || "all") as Category | "all")}
              >
                <ToggleGroupItem value="all">{t(copy.all)}</ToggleGroupItem>
                {categories.map((cat) => (
                  <ToggleGroupItem key={cat.id} value={cat.id}>
                    {t(cat.label)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <Switch label={t(copy.inStock)} checked={inStockOnly} onCheckedChange={setInStockOnly} />
              <div className="flex items-center gap-2">
                <Select
                  aria-label={t(copy.sort)}
                  value={sort}
                  onValueChange={(v) => v && setSort(v as Sort)}
                  size="sm"
                  items={[
                    { value: "featured", label: t(copy.featured) },
                    { value: "new", label: t(copy.newest) },
                    { value: "price-asc", label: t(copy.priceAsc) },
                    { value: "price-desc", label: t(copy.priceDesc) },
                  ]}
                />
                <ToggleGroup type="single" variant="segmented" size="sm" aria-label={locale === "tr" ? "Para birimi" : "Currency"} value={currency} onValueChange={(v) => v && setCurrency(v as Currency)}>
                  <ToggleGroupItem value="TRY">₺ TRY</ToggleGroupItem>
                  <ToggleGroupItem value="USD">$ USD</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>

          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-muted" aria-live="polite">
            {copy.results[locale].replace("{n}", String(list.length))}
          </p>

          <div ref={gridRef} className="grid grid-cols-1 gap-x-6 gap-y-12 @xl:grid-cols-2 @4xl:grid-cols-3">
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>

          {list.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-ui-lg border border-dashed border-line p-8">
              <p className="text-fg-muted">{t(copy.none)}</p>
              <Button
                variant="secondary"
                onClick={() => {
                  setCategory("all");
                  setInStockOnly(false);
                }}
              >
                {t(copy.reset)}
              </Button>
            </div>
          ) : null}

          {pageCount > 1 ? (
            <div className="mt-14 flex justify-center border-t border-line pt-8">
              <Pagination
                page={current}
                pageCount={pageCount}
                onPageChange={(p) => {
                  setPage(p);
                  gridRef.current?.scrollIntoView({ block: "start" });
                }}
              />
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
