"use client";

import * as React from "react";
import { Toaster } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { copyFor, isTopMaker, products, sellerById, type Category, type Copy, type Product, type SiteLocale } from "./content";

export type Sort = "match" | "rating" | "price-asc" | "price-desc" | "new";
export const PRICE_MAX = 7000;

export interface Filters {
  query: string;
  categories: Category[];
  price: [number, number];
  /** Minimum seller rating; 0 = any. */
  minRating: number;
  topOnly: boolean;
  /** Dispatch within N working days; 0 = any. */
  shipsWithin: number;
  freeShipping: boolean;
  sort: Sort;
}

export const DEFAULT_FILTERS: Filters = { query: "", categories: [], price: [0, PRICE_MAX], minRating: 0, topOnly: false, shipsWithin: 0, freeShipping: false, sort: "match" };

interface MarketContextValue {
  c: Copy;
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  resetFilters: () => void;
  /** The seller page shows this seller. */
  seller: string;
  openSeller: (id: string) => void;
  saved: Set<string>;
  toggleSaved: (productId: string) => void;
}

const MarketContext = React.createContext<MarketContextValue | null>(null);

export function useMarket() {
  const ctx = React.useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <MarketProvider>.");
  return ctx;
}

/** Products after every filter except `skip` (used to count what each rating option would show). */
export function applyFilters(list: Product[], f: Filters, c: Copy, skip?: keyof Filters): Product[] {
  const q = f.query.trim().toLocaleLowerCase(c.intl);
  const out = list.filter((p) => {
    const s = sellerById(p.seller);
    if (skip !== "query" && q && !`${c.t(p.name)} ${s.name} ${c.t(s.craft)}`.toLocaleLowerCase(c.intl).includes(q)) return false;
    if (skip !== "categories" && f.categories.length && !f.categories.includes(p.category)) return false;
    if (skip !== "price" && (p.price < f.price[0] || (f.price[1] < PRICE_MAX && p.price > f.price[1]))) return false;
    if (skip !== "minRating" && f.minRating && s.rating < f.minRating) return false;
    if (skip !== "topOnly" && f.topOnly && !isTopMaker(s)) return false;
    if (skip !== "shipsWithin" && f.shipsWithin && p.ships > f.shipsWithin) return false;
    if (skip !== "freeShipping" && f.freeShipping && !p.freeShipping) return false;
    return true;
  });
  const by = {
    match: (a: Product, b: Product) => sellerById(b.seller).rating * 100 + sellerById(b.seller).reviews / 100 - (sellerById(a.seller).rating * 100 + sellerById(a.seller).reviews / 100),
    rating: (a: Product, b: Product) => sellerById(b.seller).rating - sellerById(a.seller).rating || sellerById(b.seller).reviews - sellerById(a.seller).reviews,
    "price-asc": (a: Product, b: Product) => a.price - b.price,
    "price-desc": (a: Product, b: Product) => b.price - a.price,
    new: (a: Product, b: Product) => b.listed.localeCompare(a.listed),
  }[f.sort];
  return [...out].sort(by);
}

/**
 * Search filters, the open seller and saved items for the whole site. Inside SiteShell, above
 * the EN / TR switch, so a language change keeps them.
 */
export function MarketProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useSiteShell();
  const c = React.useMemo(() => copyFor((locale === "tr" ? "tr" : "en") as SiteLocale), [locale]);
  const [filters, setAll] = React.useState<Filters>(DEFAULT_FILTERS);
  const [seller, setSeller] = React.useState("kokler");
  const [saved, setSaved] = React.useState<Set<string>>(() => new Set(["pendant"]));

  const value = React.useMemo<MarketContextValue>(
    () => ({
      c,
      filters,
      setFilters: (patch) => setAll((prev) => ({ ...prev, ...patch })),
      resetFilters: () => setAll(DEFAULT_FILTERS),
      seller,
      openSeller: setSeller,
      saved,
      toggleSaved: (id) =>
        setSaved((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        }),
    }),
    [c, filters, seller, saved],
  );

  return (
    <MarketContext.Provider value={value}>
      {children}
      <Toaster />
    </MarketContext.Provider>
  );
}
