"use client";

import { Button, Image } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { categories, categoryPhoto, productById, products } from "./content";
import { ProductCard } from "./product-card";
import { useStore } from "./store-provider";

const copy = {
  eyebrow: { en: "Firing no. 47 · out of the kiln 3 November", tr: "47. pişirim · 3 Kasım’da fırından çıktı" },
  title: { en: "Thrown by hand, *used* every day.", tr: "Elde çekildi, *her gün* kullanılır." },
  lead: {
    en: "Stoneware cups, plates and vases from a two-wheel studio in Kuzguncuk. Pick a glaze under any piece — the photo is that exact glaze from this firing.",
    tr: "Kuzguncuk’ta iki tornalı bir atölyeden taşkil fincan, tabak ve vazolar. Herhangi bir parçanın altından sır seçin — fotoğraf, bu pişirimdeki o sırrın kendisi.",
  },
  shop: { en: "Shop firing no. 47", tr: "47. pişirimi incele" },
  studio: { en: "Visit the studio", tr: "Atölyeyi ziyaret et" },
  facts: [
    { k: { en: "Thrown in", tr: "Üretim" }, v: { en: "Kuzguncuk", tr: "Kuzguncuk" } },
    { k: { en: "Fired at", tr: "Pişirim" }, v: { en: "1,240 °C", tr: "1.240 °C" } },
    { k: { en: "Each month", tr: "Her ay" }, v: { en: "≈ 300 pieces", tr: "≈ 300 parça" } },
  ],
  tryIt: { en: "Try a glaze", tr: "Bir sır deneyin" },
  catsEyebrow: { en: "Shop by shape", tr: "Forma göre" },
  catsTitle: { en: "Four shapes, *nine* pieces", tr: "Dört form, *dokuz* parça" },
  pieces: { en: "{n} pieces", tr: "{n} parça" },
  newEyebrow: { en: "New this week", tr: "Bu hafta yeni" },
  newTitle: { en: "Just out of the *kiln*", tr: "Fırından *yeni* çıktı" },
  newLead: { en: "Four pieces from the 3 and 5 November firings. Small runs: when a glaze is gone, it comes back with the next firing, or not at all.", tr: "3 ve 5 Kasım pişirimlerinden dört parça. Küçük seriler: bir sır bitince sonraki pişirimle döner ya da hiç dönmez." },
  all: { en: "See all pieces", tr: "Tüm parçalar" },
};

const em = (text: string) => text.split("*").map((part, i) => (i === 1 ? <em key={i}>{part}</em> : part));

/** Editorial hero: type on the start side, one product with live glaze swatches on the end side. */
export function HeroProduct() {
  const { t } = useStore();
  const hero = productById("morning-cup");
  return (
    <Section theme={{ rhythm: "tight" }} aria-labelledby="kh-hero-title" className="overflow-hidden">
      <Container>
        <div className="grid items-end gap-12 py-6 @4xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @4xl:gap-20 @4xl:py-12">
          <div className="flex flex-col gap-8 @4xl:pb-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">{t(copy.eyebrow)}</p>
            <h1 id="kh-hero-title" className="font-display text-display-2xl text-balance text-fg">
              {em(t(copy.title))}
            </h1>
            <p className="max-w-[48ch] text-lead text-fg-muted">{t(copy.lead)}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild variant="primary" size="lg">
                <a href={sitePageHref("shop")}>{t(copy.shop)}</a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href="#studio">{t(copy.studio)}</a>
              </Button>
            </div>
            <dl className="mt-4 grid max-w-xl grid-cols-3 border-t border-line pt-5">
              {copy.facts.map((f) => (
                <div key={f.k.en} className="flex flex-col gap-1">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg-muted">{t(f.k)}</dt>
                  <dd className="font-display text-[1.35rem] leading-tight text-fg">{t(f.v)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <p aria-hidden className="pointer-events-none absolute -start-10 top-8 hidden origin-top-left -rotate-90 font-mono text-[11px] uppercase tracking-[0.3em] text-fg-subtle @4xl:block">
              {t(copy.tryIt)} ↓
            </p>
            <ProductCard product={hero} priority size="lg" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Category tiles: one tall, three short; each presets the shop filter. */
export function CategoryTiles() {
  const { t, locale, setShopCategory } = useStore();
  return (
    <Section theme={{ surface: "surface-2" }} aria-labelledby="kh-cats-title">
      <Container>
        <div className="mb-10 flex flex-col gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">{t(copy.catsEyebrow)}</p>
          <h2 id="kh-cats-title" className="font-display text-display-m text-fg">
            {em(t(copy.catsTitle))}
          </h2>
        </div>
        <ul className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-[1.25fr_1fr_1fr] @5xl:grid-rows-2">
          {categories.map((cat, i) => {
            const ref = categoryPhoto[cat.id];
            const g = productById(ref.product).glazes[ref.glaze]!;
            const count = products.filter((p) => p.category === cat.id).length;
            return (
              <li key={cat.id} className={i === 0 ? "@5xl:row-span-2" : i === 3 ? "@5xl:col-span-2" : undefined}>
                <a
                  href={sitePageHref("shop")}
                  onClick={() => setShopCategory(cat.id)}
                  className="group relative flex h-full min-h-64 flex-col justify-end overflow-hidden rounded-ui-lg bg-surface focus-ring"
                >
                  <Image src={g.photo.src} width={g.photo.width} height={g.photo.height} alt="" aspect="auto" className="absolute! inset-0 size-full transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" sizes="(min-width: 1024px) 33vw, 100vw" />
                  <span className="relative m-3 flex items-end justify-between gap-4 rounded-ui bg-surface px-4 py-3">
                    <span className="flex flex-col">
                      <span className="font-display text-[1.4rem] leading-tight text-fg">{t(cat.label)}</span>
                      <span className="text-small text-fg-muted">{t(cat.blurb)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-fg-muted">
                      {copy.pieces[locale].replace("{n}", String(count))}
                      <ArrowRight aria-hidden className="size-4 text-fg transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/** "New this week": a snap-scrolling rail of product cards (scrolls inside itself, never the page). */
export function NewRail() {
  const { t } = useStore();
  const fresh = products.filter((p) => p.isNew);
  return (
    <Section aria-labelledby="kh-new-title">
      <Container>
        <div className="mb-10 flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">{t(copy.newEyebrow)}</p>
            <h2 id="kh-new-title" className="font-display text-display-m text-fg">
              {em(t(copy.newTitle))}
            </h2>
            <p className="text-fg-muted">{t(copy.newLead)}</p>
          </div>
          <Button asChild variant="secondary">
            <a href={sitePageHref("shop")}>
              {t(copy.all)}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </a>
          </Button>
        </div>
        <ul className="-mx-(--gutter) flex snap-x snap-mandatory gap-6 overflow-x-auto px-(--gutter) pb-4 scrollbar-none" aria-label={t(copy.newEyebrow)}>
          {fresh.map((p) => (
            <li key={p.id} className="w-[78%] shrink-0 snap-start @xl:w-[22rem]">
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
