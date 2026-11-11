"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { listings, type Deal, type Hood, type L, type Listing, type SiteLocale } from "./content";

export const PRICE_RANGE: Record<Deal, { min: number; max: number; step: number }> = {
  sale: { min: 5_000_000, max: 50_000_000, step: 500_000 },
  rent: { min: 30_000, max: 130_000, step: 2_000 },
};

export interface Filters {
  deal: Deal;
  rooms: "any" | Listing["rooms"];
  hood: "any" | Hood;
  price: [number, number];
}

export const defaultFilters = (deal: Deal = "sale"): Filters => ({ deal, rooms: "any", hood: "any", price: [PRICE_RANGE[deal].min, PRICE_RANGE[deal].max] });

export function matches(l: Listing, f: Filters) {
  const p = Number(l.price);
  return l.deal === f.deal && (f.rooms === "any" || l.rooms === f.rooms) && (f.hood === "any" || l.hood === f.hood) && p >= f.price[0] && p <= f.price[1];
}

interface EstateContextValue {
  locale: SiteLocale;
  t: (v: L) => string;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  results: Listing[];
  /** The listing under the pointer or focus — shared by the list and the map. */
  active: string | null;
  setActive: (id: string | null) => void;
  selected: string;
  open: (id: string) => void;
  saved: string[];
  toggleSaved: (id: string) => void;
}

const EstateContext = React.createContext<EstateContextValue | null>(null);

export function useEstate() {
  const ctx = React.useContext(EstateContext);
  if (!ctx) throw new Error("useEstate must be used inside <EstateProvider>.");
  return ctx;
}

/** Search filters, the hovered listing, the opened listing and saved homes — above the locale switch. */
export function EstateProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [filters, setFilters] = React.useState<Filters>(() => defaultFilters("sale"));
  const [active, setActive] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState(listings[0]!.id);
  const [saved, setSaved] = React.useState<string[]>(["bebek-1930s"]);

  const value = React.useMemo<EstateContextValue>(
    () => ({
      locale,
      t: (v) => v[locale],
      filters,
      setFilters,
      results: listings.filter((l) => matches(l, filters)),
      active,
      setActive,
      selected,
      open: (id) => {
        setSelected(id);
        navigate({ page: "listing" });
        window.scrollTo({ top: 0 });
      },
      saved,
      toggleSaved: (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    }),
    [locale, filters, active, selected, saved, navigate],
  );

  return <EstateContext.Provider value={value}>{children}</EstateContext.Provider>;
}
