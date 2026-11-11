"use client";

import * as React from "react";
import { Avatar, Button, Image, Input } from "@vamos-ui/react";
import { RatingStars, sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { ArrowRight, BadgeCheck, Search } from "lucide-react";
import { categories, fill, isTopMaker, popularSearches, products, productsOf, sellerById, sellers, type Category } from "./content";
import { DEFAULT_FILTERS, useMarket } from "./market-provider";
import { ProductCard } from "./product-card";
import { ratingCopy, SellerRating } from "./seller-rating";

const hero = {
  search: { en: "Search 1,240 makers — oak table, wool, pendant lamp…", tr: "1.240 üretici arasında arayın — meşe sehpa, yün, sarkıt lamba…" },
  label: { en: "Search makers and pieces", tr: "Üretici ve ürün arayın" },
  go: { en: "Search", tr: "Ara" },
  popular: { en: "Popular:", tr: "Popüler:" },
};

/** The hero search: submitting (or a popular term) sets the query and opens the results. */
export function HeroSearch() {
  const { c, setFilters } = useMarket();
  const { navigate } = useSiteShell();
  const { t } = c;
  const [q, setQ] = React.useState("");
  const go = (query: string) => {
    setFilters({ ...DEFAULT_FILTERS, query });
    navigate({ page: "search" });
  };
  return (
    <div className="flex flex-col gap-3">
      <form
        role="search"
        className="flex gap-2 rounded-ui-lg border border-line bg-surface p-1.5 shadow-[0_18px_40px_-28px_color-mix(in_oklch,var(--color-fg)_45%,transparent)]"
        onSubmit={(e) => {
          e.preventDefault();
          go(q.trim());
        }}
      >
        <Input type="search" variant="ghost" size="lg" value={q} onChange={(e) => setQ(e.target.value)} leading={<Search aria-hidden className="size-5" />} placeholder={t(hero.search)} aria-label={t(hero.label)} className="flex-1" />
        <Button type="submit" variant="primary" size="lg">
          {t(hero.go)}
        </Button>
      </form>
      <p className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-small text-fg-muted">
        <span className="me-1">{t(hero.popular)}</span>
        {popularSearches.map((s, i) => (
          <button key={i} type="button" onClick={() => go(t(s))} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-fg focus-ring hover:border-fg-subtle">
            {t(s)}
          </button>
        ))}
      </p>
    </div>
  );
}

/** Hero collage: three pieces leaning on each other, each with its maker's rating chip. */
export function HeroCollage() {
  const { c } = useMarket();
  const picks = ["pendant", "bifold", "bud-vases"].map((id) => products.find((p) => p.id === id)!);
  return (
    <div className="grid h-[26rem] grid-cols-5 grid-rows-2 gap-3 sm:h-[32rem]">
      {picks.map((p, i) => (
        <figure key={p.id} className={i === 0 ? "col-span-3 row-span-2" : "col-span-2"}>
          <div className="surface flex h-full flex-col overflow-hidden rounded-ui-lg">
            <div className="relative min-h-0 flex-1">
              <Image src={p.photo.src} width={p.photo.width} height={p.photo.height} alt={c.t(p.alt)} priority={i === 0} sizes="(min-width: 1024px) 26vw, 60vw" className="my-0! absolute! inset-0 h-full w-full" />
            </div>
            <figcaption className="border-t border-line bg-surface px-3 py-2">
              <SellerRating seller={sellerById(p.seller)} />
            </figcaption>
          </div>
        </figure>
      ))}
    </div>
  );
}

const cat = {
  label: { en: "Browse by craft", tr: "Zanaata göre gezin" },
  n: { en: "{n} pieces", tr: "{n} ürün" },
};

/** Category row: a button presets the category filter and opens the results. */
export function CategoryRow() {
  const { c, setFilters } = useMarket();
  const { navigate } = useSiteShell();
  const { t } = c;
  return (
    <ul role="list" aria-label={t(cat.label)} className="grid grid-cols-2 gap-px overflow-hidden rounded-ui-lg border border-line bg-line sm:grid-cols-4 lg:grid-cols-7">
      {categories.map((x) => (
        <li key={x.id}>
          <button
            type="button"
            onClick={() => {
              setFilters({ ...DEFAULT_FILTERS, categories: [x.id as Category] });
              navigate({ page: "search" });
            }}
            className="flex h-full w-full flex-col items-start gap-1 bg-surface px-4 py-4 text-start focus-ring hover:bg-surface-2"
          >
            <span className="font-medium text-fg">{t(x.label)}</span>
            <span className="tabular text-[12px] text-fg-muted">{fill(t(cat.n), { n: products.filter((p) => p.category === x.id).length })}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

const makers = {
  onTime: { en: "{pct} on time", tr: "{pct} zamanında" },
  visit: { en: "Visit {name}", tr: "{name} dükkânına git" },
};

/** Top makers: rating first, then the evidence behind it, then three pieces. */
export function TopMakers() {
  const { c, openSeller } = useMarket();
  const { t, f, rating } = c;
  const list = [...sellers].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 3);
  return (
    <ul role="list" className="grid gap-5 lg:grid-cols-3">
      {list.map((s) => (
        <li key={s.id} className="surface relative flex flex-col gap-4 rounded-ui-lg p-5">
          <div className="flex items-start gap-3">
            <Avatar src={s.avatar} name={s.maker} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1.5 font-semibold text-fg">
                <a href={sitePageHref("seller")} onClick={() => openSeller(s.id)} aria-label={fill(t(makers.visit), { name: s.name })} className="rounded-[2px] focus-ring after:absolute after:inset-0 after:content-['']">
                  {s.name}
                </a>
                {isTopMaker(s) ? <BadgeCheck aria-label={t(ratingCopy.top)} className="size-4 text-accent-ink" /> : null}
              </h3>
              <p className="text-small text-fg-muted">
                {t(s.craft)} · {t(s.city)}
              </p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-end gap-2.5">
              <span className="tabular text-[2.4rem] leading-none font-semibold tracking-[-0.04em] text-fg">{rating(s.rating)}</span>
              <span className="flex flex-col gap-1 pb-0.5">
                <RatingStars rating={s.rating} label={fill(t(ratingCopy.outOf), { rating: rating(s.rating) })} size="sm" />
                <span className="tabular text-[12px] text-fg-muted">{fill(t(ratingCopy.reviews), { n: f.number(s.reviews) })}</span>
              </span>
            </div>
            <span className="tabular text-[12px] text-fg-muted">{fill(t(makers.onTime), { pct: f.percent(s.onTime) })}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {productsOf(s.id)
              .slice(0, 3)
              .map((p) => (
                <Image key={p.id} src={p.photo.src} width={p.photo.width} height={p.photo.height} alt={t(p.alt)} aspect="1/1" sizes="120px" className="my-0! rounded-ui" />
              ))}
          </div>
          <span aria-hidden className="inline-flex items-center gap-1 text-small font-medium text-accent-ink">
            {t({ en: "Visit shop", tr: "Dükkâna git" })}
            <ArrowRight className="size-3.5 rtl:-scale-x-100" />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Newest four listings. */
export function NewRail() {
  const fresh = [...products].sort((a, b) => b.listed.localeCompare(a.listed)).slice(0, 4);
  return (
    <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
      {fresh.map((p) => (
        <li key={p.id} className="min-w-0">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
