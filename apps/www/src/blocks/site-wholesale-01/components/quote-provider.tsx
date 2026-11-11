"use client";

import * as React from "react";
import { Toaster } from "@vamos-ui/react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { copyFor, COURIER_CAP, COURIER_PER_CASE, deliveries, priceAt, productBySku, tierOf, VAT_RATE, type Category, type Copy, type DeliveryId, type SiteLocale } from "./content";

export interface QuoteLine {
  sku: string;
  cases: number;
}

interface QuoteContextValue {
  c: Copy;
  lines: QuoteLine[];
  /** Cases across all lines. */
  cases: number;
  add: (sku: string, cases: number) => void;
  setCases: (sku: string, cases: number) => void;
  remove: (sku: string) => void;
  clear: () => void;
  delivery: DeliveryId;
  setDelivery: (d: DeliveryId) => void;
  totals: { subtotal: number; listTotal: number; savings: number; shipping: number; vat: number; total: number };
  /** Catalogue filter, kept here so the category index on the home page can preset it. */
  category: Category | "all";
  setCategory: (c: Category | "all") => void;
}

const QuoteContext = React.createContext<QuoteContextValue | null>(null);

export function useQuote() {
  const ctx = React.useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used inside <QuoteProvider>.");
  return ctx;
}

/** Unit price for a number of cases of one product. */
export const unitPrice = (sku: string, cases: number) => priceAt(productBySku(sku), tierOf(Math.max(1, cases)));

/** Two lines on arrival so the quote page shows real content. */
const STARTER: QuoteLine[] = [
  { sku: "CC-MB-A4", cases: 8 },
  { sku: "CC-TP-KR48", cases: 2 },
];

/**
 * The quote list, delivery choice and catalogue filter for the whole site. Lives inside SiteShell
 * but above the EN / TR switch, so changing language keeps the quote.
 */
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useSiteShell();
  const c = React.useMemo(() => copyFor((locale === "tr" ? "tr" : "en") as SiteLocale), [locale]);
  const [lines, setLines] = React.useState<QuoteLine[]>(STARTER);
  const [delivery, setDelivery] = React.useState<DeliveryId>("pallet");
  const [category, setCategory] = React.useState<Category | "all">("all");

  const value = React.useMemo<QuoteContextValue>(() => {
    const cases = lines.reduce((n, l) => n + l.cases, 0);
    let subtotal = 0;
    let listTotal = 0;
    for (const l of lines) {
      const p = productBySku(l.sku);
      subtotal += unitPrice(l.sku, l.cases) * p.perCase * l.cases;
      listTotal += priceAt(p, 0) * p.perCase * l.cases;
    }
    const d = deliveries.find((x) => x.id === delivery)!;
    const shipping = delivery === "courier" ? Math.min(COURIER_CAP, cases * COURIER_PER_CASE) : lines.length ? d.cost(subtotal) : 0;
    const vat = (subtotal + shipping) * VAT_RATE;
    return {
      c,
      lines,
      cases,
      add: (sku, n) =>
        setLines((prev) => {
          const at = prev.findIndex((l) => l.sku === sku);
          if (at === -1) return [...prev, { sku, cases: n }];
          return prev.map((l, i) => (i === at ? { ...l, cases: l.cases + n } : l));
        }),
      setCases: (sku, n) => setLines((prev) => prev.map((l) => (l.sku === sku ? { ...l, cases: Math.max(1, Math.min(999, n)) } : l))),
      remove: (sku) => setLines((prev) => prev.filter((l) => l.sku !== sku)),
      clear: () => setLines([]),
      delivery,
      setDelivery,
      totals: { subtotal, listTotal, savings: listTotal - subtotal, shipping, vat, total: subtotal + shipping + vat },
      category,
      setCategory,
    };
  }, [c, lines, delivery, category]);

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <Toaster />
    </QuoteContext.Provider>
  );
}

/** Navbar label with the live number of quote lines. */
export function QuoteCount({ label }: { label: string }) {
  const { lines } = useQuote();
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      <span className="tabular inline-grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 font-mono text-[11px] text-accent-fg">{lines.length}</span>
    </span>
  );
}
