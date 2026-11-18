"use client";

// Cart for the Commerce blocks, on top of the kit cart (@vamos-ui/react/commerce/cart): the kit
// keeps the lines in localStorage and prices them from `catalog`, exactly as the checkout endpoint
// will. This file adds what the storefront shows around it: the mini-cart drawer state, remove with
// an inline undo, and totals read from the kit's priced quote.
import * as React from "react";
import { useFormat, useLocale } from "@vamos-ui/react";
import type { Address } from "@vamos-ui/react";
import { formatMoney, priceCart, type CartIssue, type CartLine, type Quote } from "@vamos-ui/react/commerce";
import { CartProvider, useCart, type CartContextValue } from "@vamos-ui/react/commerce/cart";
import { langOf, tx, type L, type Lang } from "../../_shared/l10n";
import { catalog, FREE_SHIPPING_FROM, itemOf, type ShopItem } from "./catalogue";

/** Copy and money for storefront components: `const { c, t, money, date } = useShop();` */
export function useShop() {
  const f = useFormat();
  const { locale } = useLocale();
  const lang: Lang = langOf(locale);
  return React.useMemo(
    () => ({
      f,
      lang,
      intl: lang === "tr" ? "tr-TR" : "en-US",
      t: (value: L) => tx(value, lang),
      c: (en: string, tr: string) => (lang === "tr" ? tr : en),
      /** Minor units in TRY: 119000 → "₺1.190" / "TRY 1,190". */
      money: (minor: number) => formatMoney(minor, catalog.currency, lang === "tr" ? "tr-TR" : "en-US"),
      /** A date-only value ("2026-11-20") as "Fri 20 Nov" / "20 Kas Cum". */
      date: (ymd: string, o: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) => f.date(ymd, o),
    }),
    [f, lang],
  );
}

/** A cart row: the kit line, what it shows, and `removed` while its undo is offered. */
export interface CartRow extends CartLine {
  key: string;
  item: ShopItem;
  removed?: boolean;
}

/** Money in minor units, from the kit's priced quote. */
export interface Totals {
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  /** VAT contained in `total` (products and shipping). */
  vat: number;
  /** Left to spend for free standard delivery (0 once reached). */
  toFreeShipping: number;
}

export const lineKey = (l: Pick<CartLine, "productId" | "variantId">) => `${l.productId}:${l.variantId ?? ""}`;

interface StoreCartValue {
  /** The kit cart: `kit.checkout()`, `kit.quote`, `kit.ready`, `kit.clear()`. */
  kit: CartContextValue;
  rows: CartRow[];
  totals: Totals;
  /** Saved lines the catalog no longer sells (removed products, sold-out variants). */
  issues: CartIssue[];
  /** Removes the lines listed in `issues`. */
  dropUnavailable: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (productId: string, qty: number, variantId?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  restore: (key: string) => void;
}

const StoreCartContext = React.createContext<StoreCartValue | null>(null);

export function useStoreCart(): StoreCartValue {
  const v = React.useContext(StoreCartContext);
  if (!v) throw new Error("useStoreCart needs <StoreCartProvider>");
  return v;
}

/** Totals of the lines the catalog accepts (a stale saved line never blanks the summary). */
export function totalsOf(lines: CartLine[], bad: Set<number> = new Set()): Totals {
  const ok = lines.filter((_, i) => !bad.has(i));
  const priced = ok.length ? priceCart(catalog, ok) : null;
  const q = priced?.ok ? priced.quote : null;
  const subtotal = q?.subtotal ?? 0;
  return {
    count: ok.reduce((n, l) => n + l.qty, 0),
    subtotal,
    shipping: q?.shipping ?? 0,
    total: q?.total ?? 0,
    vat: q?.vat ?? 0,
    toFreeShipping: Math.max(0, FREE_SHIPPING_FROM - subtotal),
  };
}

function StoreCart({ children }: { children: React.ReactNode }) {
  const kit = useCart();
  const [open, setOpen] = React.useState(false);
  // Rows removed with an undo still offered, at the position they were in.
  const [removed, setRemoved] = React.useState<Array<{ at: number; row: CartRow }>>([]);

  const value = React.useMemo<StoreCartValue>(() => {
    const bad = new Set(kit.issues.map((i) => i.index).filter((i) => i >= 0));
    const live: CartRow[] = [];
    kit.lines.forEach((l, i) => {
      const item = itemOf(l);
      if (item && !bad.has(i)) live.push({ ...l, key: lineKey(l), item });
    });
    const liveKeys = new Set(live.map((r) => r.key));
    const rows = [...live];
    for (const r of removed) if (!liveKeys.has(r.row.key)) rows.splice(Math.min(r.at, rows.length), 0, { ...r.row, removed: true });
    const find = (key: string) => kit.lines.find((l) => lineKey(l) === key);
    return {
      kit,
      rows,
      totals: totalsOf(kit.lines, bad),
      issues: kit.issues,
      dropUnavailable: () => kit.issues.forEach((i) => i.index >= 0 && kit.lines[i.index] && kit.remove(kit.lines[i.index]!.productId, kit.lines[i.index]!.variantId)),
      open,
      setOpen,
      add: (productId, qty, variantId) => {
        setRemoved((prev) => prev.filter((r) => r.row.key !== lineKey({ productId, variantId })));
        kit.add(productId, { variantId, qty });
      },
      setQty: (key, qty) => {
        const l = find(key);
        if (l) kit.setQty(l.productId, l.variantId, Math.max(1, qty));
      },
      remove: (key) => {
        const at = live.findIndex((r) => r.key === key);
        if (at === -1) return;
        setRemoved((prev) => [...prev.filter((r) => r.row.key !== key), { at, row: live[at]! }]);
        kit.remove(live[at]!.productId, live[at]!.variantId);
      },
      restore: (key) => {
        const hit = removed.find((r) => r.row.key === key);
        if (!hit) return;
        setRemoved((prev) => prev.filter((r) => r.row.key !== key));
        kit.add(hit.row.productId, { variantId: hit.row.variantId, qty: hit.row.qty });
      },
    };
  }, [kit, open, removed]);
  return <StoreCartContext.Provider value={value}>{children}</StoreCartContext.Provider>;
}

/**
 * The kit `CartProvider` with this storefront's catalog, plus the drawer and undo state.
 * `storageKey`: one key for the whole shop, so the product page, cart and checkout share a cart.
 */
export function StoreCartProvider({ storageKey, initialLines, children }: { storageKey?: string; initialLines?: CartLine[]; children: React.ReactNode }) {
  return (
    // redirect={false}: the checkout page saves a short order summary for the confirmation page
    // before it sends the buyer to the payment page.
    <CartProvider catalog={catalog} storageKey={storageKey} initialLines={initialLines} redirect={false}>
      <StoreCart>{children}</StoreCart>
    </CartProvider>
  );
}

/**
 * What the confirmation page shows after the payment page sends the buyer back with `?order=`.
 * There is no order database (the order email is the record), so the checkout page keeps this
 * short summary in sessionStorage: this tab only, gone when it closes, no card data.
 */
export interface OrderSummary {
  order: string;
  placedAt: string;
  quote: Quote;
  firstName: string;
  name: string;
  email: string;
  address: Address;
  company?: string;
}

const summaryKey = (order: string) => `kiln-linen-order:${order}`;

export function saveOrderSummary(summary: OrderSummary) {
  try {
    window.sessionStorage.setItem(summaryKey(summary.order), JSON.stringify(summary));
  } catch {
    /* private mode: the confirmation page falls back to the order number */
  }
}

export function readOrderSummary(order: string): OrderSummary | null {
  try {
    const raw = window.sessionStorage.getItem(summaryKey(order));
    const data = raw ? (JSON.parse(raw) as OrderSummary) : null;
    return data && data.order === order && data.quote && Array.isArray(data.quote.lines) ? data : null;
  } catch {
    return null;
  }
}
