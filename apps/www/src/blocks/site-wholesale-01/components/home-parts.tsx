"use client";

import * as React from "react";
import { Button, NumberInput, Slider, toast } from "@vamos-ui/react";
import { sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { ArrowRight, Plus } from "lucide-react";
import { categories, fill, productBySku, products, type L } from "./content";
import { useQuote } from "./quote-provider";
import { TierLadder } from "./tier-ladder";

/** A decorative barcode drawn from a string: bar widths come from the character codes. */
export function Barcode({ value, className }: { value: string; className?: string }) {
  const bars = Array.from(value).flatMap((ch, i) => {
    const n = ch.charCodeAt(0) + i;
    return [1 + (n % 3), 1 + ((n >> 2) % 2)];
  });
  return (
    <span aria-hidden className={`flex h-9 items-stretch ${className ?? ""}`}>
      {bars.map((w, i) => (
        <span key={i} style={{ width: `${w * 1.5}px` }} className={i % 2 === 0 ? "bg-fg" : "bg-transparent"} />
      ))}
    </span>
  );
}

const hero = {
  label: { en: "Price check", tr: "Fiyat kontrolü" },
  from: { en: "From", tr: "Çıkış" },
  fromValue: { en: "Tuzla hub, bay C-14", tr: "Tuzla depo, C-14 rampası" },
  to: { en: "To", tr: "Varış" },
  toValue: { en: "Your stockroom", tr: "Sizin deponuz" },
  cases: { en: "Cases", tr: "Koli" },
  slide: { en: "Cases of this carton", tr: "Bu koliden kaç koli" },
  add: { en: "Add to quote", tr: "Teklife ekle" },
  added: { en: "{n} cases of {name} added to your quote", tr: "{name} için {n} koli teklifinize eklendi" },
  open: { en: "Open quote", tr: "Teklifi aç" },
  inStock: { en: "{n} cases in stock · dispatch today", tr: "Stokta {n} koli · bugün sevk" },
};

/**
 * The hero's right column: a pallet label for the best-selling carton with the live tier ladder.
 * Dragging the slider (or typing) moves the active tier; the steps jump to a tier.
 */
export function HeroLabel() {
  const { c, add } = useQuote();
  const { navigate } = useSiteShell();
  const { t, f } = c;
  const product = productBySku("CC-SC-403030");
  const [cases, setCases] = React.useState(12);

  return (
    <div className="@container relative border-2 border-fg bg-surface">
      <div className="flex items-center justify-between gap-4 border-b-2 border-fg px-4 py-2.5">
        <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">{t(hero.label)}</span>
        <span className="tabular font-mono text-[11px] text-fg-muted">{product.sku}</span>
      </div>
      <dl className="grid grid-cols-2 border-b border-line text-small">
        <div className="border-e border-line px-4 py-2.5">
          <dt className="font-mono text-[10.5px] tracking-[0.08em] text-fg-muted uppercase">{t(hero.from)}</dt>
          <dd className="text-fg">{t(hero.fromValue)}</dd>
        </div>
        <div className="px-4 py-2.5">
          <dt className="font-mono text-[10.5px] tracking-[0.08em] text-fg-muted uppercase">{t(hero.to)}</dt>
          <dd className="text-fg">{t(hero.toValue)}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-5 p-4 @md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-[1.35rem] leading-tight font-semibold tracking-[-0.02em] text-fg">{t(product.name)}</p>
            <p className="mt-1 text-small text-fg-muted">{t(product.spec)}</p>
          </div>
          <Barcode value={product.sku} className="hidden shrink-0 @md:flex" />
        </div>

        <TierLadder product={product} cases={cases} onCasesChange={setCases} size="lg" />

        <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-t-2 border-fg pt-4">
          <Slider value={[cases]} min={1} max={240} step={1} onValueChange={(v) => setCases(v[0] ?? 1)} aria-label={t(hero.slide)} showValue="never" />
          <NumberInput value={cases} onValueChange={(v) => setCases(Math.max(1, Math.min(999, v ?? 1)))} min={1} max={999} precision={0} aria-label={t(hero.cases)} className="w-24" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tabular font-mono text-[11.5px] text-fg-muted">{fill(t(hero.inStock), { n: f.number(product.stock) })}</p>
          <Button
            variant="primary"
            className="rounded-[3px]"
            onClick={() => {
              add(product.sku, cases);
              toast.success(fill(t(hero.added), { n: cases, name: t(product.name) }), { action: { label: t(hero.open), onClick: () => navigate({ page: "quote" }) } });
            }}
          >
            <Plus aria-hidden />
            {t(hero.add)}
          </Button>
        </div>
      </div>
    </div>
  );
}

const index = {
  skus: { en: "{n} SKUs", tr: "{n} ürün" },
  from: { en: "from {price}", tr: "{price}’den başlayan" },
  per: { en: "per {unit}", tr: "{unit} başı" },
};

/** Numbered category index; a row presets the catalogue filter and opens the catalogue. */
export function CategoryIndex() {
  const { c, setCategory } = useQuote();
  const { t, f, lira } = c;
  return (
    <ol className="border-t-2 border-fg" role="list">
      {categories.map((cat, i) => {
        const items = products.filter((p) => p.category === cat.id);
        const cheapest = items.reduce((m, p) => (p.price[3] < m.price[3] ? p : m), items[0]!);
        return (
          <li key={cat.id} className="border-b border-line">
            <a
              href={sitePageHref("catalogue")}
              onClick={() => setCategory(cat.id)}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-4 focus-ring sm:grid-cols-[3.5rem_1.2fr_1fr_auto_auto] sm:py-5"
            >
              <span className="tabular font-mono text-small text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-[clamp(1.25rem,2.6vw,1.75rem)] leading-tight font-semibold tracking-[-0.02em] text-fg group-hover:text-accent-ink">{t(cat.label)}</span>
              <span className="col-start-2 text-small text-fg-muted sm:col-start-auto">{t(cat.blurb)}</span>
              <span className="tabular col-start-2 font-mono text-small text-fg-muted sm:col-start-auto">{fill(t(index.skus), { n: f.number(cat.skus) })}</span>
              <span className="tabular col-start-2 flex items-center gap-3 text-small text-fg sm:col-start-auto">
                {fill(t(index.from), { price: lira(cheapest.price[3]) })} <span className="text-fg-subtle">{fill(t(index.per), { unit: t(cheapest.unit as L) })}</span>
                <ArrowRight aria-hidden className="size-4 text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent-ink motion-reduce:transition-none rtl:-scale-x-100" />
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
