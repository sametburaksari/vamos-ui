"use client";

import * as React from "react";
import { Badge, Button, cn, EmptyState, Input, NumberInput, Select, Switch, toast, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { Check, Plus, Search } from "lucide-react";
import { categories, fill, products, type Category, type Product } from "./content";
import { Barcode } from "./home-parts";
import { useQuote } from "./quote-provider";
import { TierLadder } from "./tier-ladder";

type Sort = "popular" | "price" | "name" | "lead";

const copy = {
  home: { en: "Crate & Co.", tr: "Crate & Co." },
  crumb: { en: "Catalogue", tr: "Katalog" },
  eyebrow: { en: "Trade catalogue · prices ex VAT", tr: "Ticari katalog · fiyatlar KDV hariç" },
  title: { en: "Everything we ship, *priced by the case*", tr: "Gönderdiğimiz her şey, *koli fiyatıyla*" },
  lead: {
    en: "Set the number of cases on any line and the price drops through four tiers as you go. Stock is counted at 07:00 and 13:00 each working day.",
    tr: "Herhangi bir satırda koli sayısını girin; fiyat dört kademede düşer. Stok her iş günü 07:00 ve 13:00’te sayılır.",
  },
  metaSkus: { en: "Products listed", tr: "Listelenen ürün" },
  metaUpdated: { en: "Stock counted", tr: "Stok sayımı" },
  metaUpdatedValue: { en: "Today, 07:00", tr: "Bugün, 07:00" },
  metaCutoff: { en: "Same-day cut-off", tr: "Aynı gün son saat" },
  search: { en: "Search by name, size or SKU", tr: "Ad, ölçü veya stok koduyla arayın" },
  category: { en: "Category", tr: "Kategori" },
  all: { en: "All", tr: "Tümü" },
  inStock: { en: "In stock only", tr: "Yalnızca stoktakiler" },
  sort: { en: "Sort by", tr: "Sırala" },
  popular: { en: "Most ordered", tr: "En çok sipariş edilen" },
  price: { en: "Lowest pallet price", tr: "En düşük palet fiyatı" },
  name: { en: "Name", tr: "Ad" },
  lead2: { en: "Fastest dispatch", tr: "En hızlı sevk" },
  results: { en: "{n} products", tr: "{n} ürün" },
  none: { en: "No products match", tr: "Eşleşen ürün yok" },
  noneText: { en: "Try another size or clear the filters. We stock 300 more SKUs than are listed here — ask for them on a quote.", tr: "Başka bir ölçü deneyin veya filtreleri temizleyin. Burada listelenenden 300 ürün daha fazlası stokta — teklifte isteyin." },
  reset: { en: "Clear filters", tr: "Filtreleri temizle" },
  cases: { en: "Cases", tr: "Koli" },
  casesOf: { en: "Cases of {name}", tr: "{name} — koli adedi" },
  add: { en: "Add to quote", tr: "Teklife ekle" },
  inQuote: { en: "In quote · {n} cases", tr: "Teklifte · {n} koli" },
  added: { en: "{n} cases of {name} added", tr: "{name}: {n} koli eklendi" },
  open: { en: "Open quote", tr: "Teklifi aç" },
  stock: { en: "{n} cases in stock", tr: "Stokta {n} koli" },
  low: { en: "Low · {n} cases", tr: "Az kaldı · {n} koli" },
  out: { en: "Back {date}", tr: "{date} tekrar stokta" },
  today: { en: "Dispatch today", tr: "Bugün sevk" },
  days: { en: "Dispatch in {n} working days", tr: "{n} iş gününde sevk" },
  day: { en: "Dispatch next working day", tr: "Ertesi iş günü sevk" },
  popularBadge: { en: "Most ordered", tr: "Çok satan" },
  filters: { en: "Filters", tr: "Filtreler" },
};

/** Catalogue: search, category, stock switch and sort over product rows with the tier ladder each. */
export function CataloguePage() {
  const { c, category, setCategory } = useQuote();
  const { t, f } = c;
  const [query, setQuery] = React.useState("");
  const [inStock, setInStock] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>("popular");

  const q = query.trim().toLocaleLowerCase(c.intl);
  const list = products
    .filter((p) => category === "all" || p.category === category)
    .filter((p) => !inStock || p.stock > 0)
    .filter((p) => !q || `${t(p.name)} ${t(p.spec)} ${p.sku}`.toLocaleLowerCase(c.intl).includes(q))
    .sort((a, b) => {
      if (sort === "price") return a.price[3] - b.price[3];
      if (sort === "name") return t(a.name).localeCompare(t(b.name), c.intl);
      if (sort === "lead") return a.leadDays - b.leadDays;
      return Number(!!b.popular) - Number(!!a.popular);
    });

  return (
    <>
      <PageIntro
        locale={c.intl}
        labels={c.labels}
        variant="ruled"
        className="!pt-10 !pb-6 lg:!pt-14"
        breadcrumb={[{ label: t(copy.home), href: sitePageHref("home") }, { label: t(copy.crumb) }]}
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        lead={t(copy.lead)}
        meta={[
          { label: t(copy.metaSkus), value: f.number(products.length) },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
          { label: t(copy.metaCutoff), value: "15:00" },
        ]}
      />
      <Section theme={{ rhythm: "tight" }} aria-label={t(copy.crumb)} className="!pt-2">
        <Container size="wide">
          <div className="-mx-(--gutter) flex flex-col gap-3 border-y-2 border-fg bg-scene px-(--gutter) py-3 lg:flex-row lg:items-center">
            <h2 className="sr-only">{t(copy.filters)}</h2>
            <Input type="search" leading={<Search aria-hidden className="size-4" />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t(copy.search)} aria-label={t(copy.search)} className="lg:w-80" />
            <div className="-mx-(--gutter) overflow-x-auto px-(--gutter) scrollbar-none lg:mx-0 lg:px-0">
              <ToggleGroup type="single" value={category} onValueChange={(v) => setCategory((v || "all") as Category | "all")} aria-label={t(copy.category)} size="sm" className="w-max">
                <ToggleGroupItem value="all">{t(copy.all)}</ToggleGroupItem>
                {categories.map((cat) => (
                  <ToggleGroupItem key={cat.id} value={cat.id}>
                    {t(cat.label)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="flex items-center justify-between gap-4 lg:ms-auto">
              <Switch checked={inStock} onCheckedChange={setInStock} label={t(copy.inStock)} size="sm" className="shrink-0 whitespace-nowrap" />
              <Select<Sort>
                value={sort}
                onValueChange={(v) => setSort(v ?? "popular")}
                aria-label={t(copy.sort)}
                size="sm"
                items={[
                  { value: "popular", label: t(copy.popular) },
                  { value: "price", label: t(copy.price) },
                  { value: "lead", label: t(copy.lead2) },
                  { value: "name", label: t(copy.name) },
                ]}
              />
            </div>
          </div>

          <p className="tabular mt-5 font-mono text-[11.5px] tracking-[0.06em] text-fg-muted uppercase" aria-live="polite">
            {fill(t(copy.results), { n: f.number(list.length) })}
          </p>

          {list.length === 0 ? (
            <EmptyState
              kind="no-results"
              className="mt-6"
              title={t(copy.none)}
              description={t(copy.noneText)}
              actions={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setInStock(false);
                    setCategory("all");
                  }}
                >
                  {t(copy.reset)}
                </Button>
              }
            />
          ) : (
            <ul role="list" className="mt-3">
              {list.map((p) => (
                <li key={p.sku}>
                  <ProductRow product={p} />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}

function ProductRow({ product }: { product: Product }) {
  const { c, add, lines } = useQuote();
  const { navigate } = useSiteShell();
  const { t, f } = c;
  const [cases, setCases] = React.useState(product.popular ? 10 : 1);
  const titleId = React.useId();
  const out = product.stock === 0;
  const inQuote = lines.find((l) => l.sku === product.sku);

  const stockLabel = out
    ? fill(t(copy.out), { date: f.date(product.restock!, { day: "numeric", month: "short" }) })
    : product.stock < 60
      ? fill(t(copy.low), { n: f.number(product.stock) })
      : fill(t(copy.stock), { n: f.number(product.stock) });
  const lead = product.leadDays === 0 ? t(copy.today) : product.leadDays === 1 ? t(copy.day) : fill(t(copy.days), { n: product.leadDays });

  return (
    <article aria-labelledby={titleId} className="@container grid gap-x-8 gap-y-5 border-b border-line py-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tabular rounded-[2px] border border-fg px-1.5 py-0.5 font-mono text-[11px] tracking-[0.04em] text-fg">{product.sku}</span>
          {product.popular ? (
            <Badge tone="accent" shape="square" size="sm">
              {t(copy.popularBadge)}
            </Badge>
          ) : null}
        </div>
        <h3 id={titleId} className="font-display text-[1.4rem] leading-tight font-semibold tracking-[-0.02em] text-balance text-fg">
          {t(product.name)}
        </h3>
        <p className="text-small text-fg-muted">{t(product.spec)}</p>
        <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-2 text-small">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{t({ en: "Stock", tr: "Stok" })}</dt>
            <span aria-hidden className={cn("size-2 rounded-full", out ? "bg-danger" : product.stock < 60 ? "bg-warning" : "bg-success")} />
            <dd className={cn("text-fg", out && "font-medium")}>{stockLabel}</dd>
          </div>
          <div>
            <dt className="sr-only">{t({ en: "Dispatch", tr: "Sevk" })}</dt>
            <dd className="text-fg-muted">{lead}</dd>
          </div>
        </dl>
        <Barcode value={product.sku} className="mt-1 h-6 opacity-70" />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <TierLadder product={product} cases={cases} onCasesChange={setCases} />
        <div className="flex flex-wrap items-center gap-3">
          <NumberInput
            value={cases}
            onValueChange={(v) => setCases(Math.max(1, Math.min(999, v ?? 1)))}
            min={1}
            max={999}
            precision={0}
            stepper
            aria-label={fill(t(copy.casesOf), { name: t(product.name) })}
            className="w-36"
          />
          <Button
            variant={inQuote ? "secondary" : "primary"}
            disabled={out}
            className="rounded-[3px]"
            onClick={() => {
              add(product.sku, cases);
              toast.success(fill(t(copy.added), { n: cases, name: t(product.name) }), { action: { label: t(copy.open), onClick: () => navigate({ page: "quote" }) } });
            }}
          >
            {inQuote ? <Check aria-hidden /> : <Plus aria-hidden />}
            {t(copy.add)}
          </Button>
          {inQuote ? <span className="tabular text-small text-accent-ink">{fill(t(copy.inQuote), { n: f.number(inQuote.cases) })}</span> : null}
        </div>
      </div>
    </article>
  );
}
