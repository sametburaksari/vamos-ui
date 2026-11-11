"use client";

import * as React from "react";
import { Button, NativeSelect, Switch, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, Section } from "@vamos-ui/react/blocks";
import { categories, currencyOf, products, SIZES, totalStock, type Category } from "./content";
import { ProductTile } from "./drop-card";
import { useDrop } from "./drop-provider";
import { Stagger } from "@vamos-ui/react/motion";

type Sort = "drop" | "price-asc" | "price-desc" | "stock";

/** Every piece from Drops 03–06: category, size and stock filters, sort, a dense grid. */
export function ArchivePage() {
  const { t, locale } = useDrop();
  const cur = currencyOf(locale);
  const [category, setCategory] = React.useState<Category | "all">("all");
  const [sizes, setSizes] = React.useState<string[]>([]);
  const [inStock, setInStock] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>("drop");

  const shown = React.useMemo(() => {
    const list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (!inStock || totalStock(p) > 0) &&
        (sizes.length === 0 || sizes.some((s) => (p.stock[s as keyof typeof p.stock] ?? 0) > 0 || (p.stock.OS ?? 0) > 0)),
    );
    const price = (id: string) => Number(products.find((p) => p.id === id)!.price[cur]);
    return [...list].sort((a, b) =>
      sort === "price-asc" ? price(a.id) - price(b.id) : sort === "price-desc" ? price(b.id) - price(a.id) : sort === "stock" ? totalStock(b) - totalStock(a) : b.drop - a.drop,
    );
  }, [category, sizes, inStock, sort, cur]);

  const reset = () => {
    setCategory("all");
    setSizes([]);
    setInStock(false);
  };

  return (
    <>
      <Section aria-labelledby="nb-archive" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <div className="grid gap-4 border-b border-fg pb-4 @3xl:grid-cols-12 @3xl:items-end">
            <div className="@3xl:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-ink">/ 03 — 06</p>
              <h1 id="nb-archive" tabIndex={-1} className="vm-enter vm-enter-title mt-2 font-display text-[clamp(3rem,1rem+8cqi,7.5rem)] font-[800] uppercase leading-[0.82] tracking-[-0.045em] outline-none">
                {t({ en: "Archive", tr: "Arşiv" })}
              </h1>
            </div>
            <p className="max-w-[48ch] text-small text-fg-muted @3xl:col-span-5">
              {t({
                en: "What’s left from earlier drops, at drop price. Returned pieces are re-listed every Friday at 12:00. Sold-out pieces stay here as a record of the run.",
                tr: "Önceki drop’lardan kalanlar, drop fiyatıyla. İade edilen parçalar her cuma 12:00’de yeniden eklenir. Tükenen parçalar serinin kaydı olarak burada kalır.",
              })}
            </p>
          </div>

          {/* Filter bar */}
          <div role="group" aria-label={t({ en: "Filter and sort", tr: "Süz ve sırala" })} className="grid gap-3 border-b border-line py-3 @5xl:grid-cols-[auto_auto_1fr_auto] @5xl:items-center">
            <ToggleGroup aria-label={t({ en: "Category", tr: "Kategori" })} value={category} onValueChange={(v) => setCategory(v as Category | "all")} size="sm">
              <ToggleGroupItem value="all">{t({ en: "All", tr: "Tümü" })}</ToggleGroupItem>
              {categories.map((c) => (
                <ToggleGroupItem key={c.id} value={c.id}>
                  {t(c.label)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup type="multiple" variant="outline" aria-label={t({ en: "Sizes", tr: "Bedenler" })} value={sizes} onValueChange={setSizes} size="sm">
              {SIZES.map((s) => (
                <ToggleGroupItem key={s} value={s} className="font-mono">
                  {s}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Switch checked={inStock} onCheckedChange={setInStock} label={t({ en: "In stock only", tr: "Yalnızca stokta olanlar" })} size="sm" />
            <NativeSelect
              aria-label={t({ en: "Sort", tr: "Sırala" })}
              size="sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              items={[
                { value: "drop", label: t({ en: "Newest drop first", tr: "En yeni drop önce" }) },
                { value: "price-asc", label: t({ en: "Price, low to high", tr: "Fiyat, artan" }) },
                { value: "price-desc", label: t({ en: "Price, high to low", tr: "Fiyat, azalan" }) },
                { value: "stock", label: t({ en: "Most left", tr: "En çok kalan" }) },
              ]}
            />
          </div>

          <p aria-live="polite" className="py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
            {t({ en: `${shown.length} of ${products.length} pieces`, tr: `${products.length} parçadan ${shown.length}` })}
          </p>

          {shown.length === 0 ? (
            <div className="flex flex-col items-start gap-3 border border-line p-6">
              <p className="font-display text-h3 uppercase">{t({ en: "Nothing in that combination", tr: "Bu birleşimde parça yok" })}</p>
              <p className="text-small text-fg-muted">{t({ en: "Try another size, or set a reminder for Drop 07.", tr: "Başka bir beden deneyin ya da Drop 07 için hatırlatma kurun." })}</p>
              <Button variant="secondary" size="sm" onClick={reset}>
                {t({ en: "Clear filters", tr: "Süzgeçleri temizle" })}
              </Button>
            </div>
          ) : (
            /* Keyed by the result: a new filter or sort deals the tiles out again, fast. */
            <Stagger asChild key={shown.map((p) => p.id).join()} effect="fade" step={30} duration={380}>
              <div className="grid grid-cols-2 gap-px border border-line bg-line @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-6">
                {shown.map((p, i) => (
                  <ProductTile key={p.id} product={p} priority={i < 2} />
                ))}
              </div>
            </Stagger>
          )}
        </Container>
      </Section>
    </>
  );
}
