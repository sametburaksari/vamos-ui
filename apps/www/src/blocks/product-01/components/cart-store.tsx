"use client";

// Cart state for the Commerce blocks: lines, quantity, remove with undo, one coupon and the
// shipping method, plus the totals derived from them (decimal strings, VAT included).
import * as React from "react";
import { useFormat, useLocale } from "@vamos-ui/react";
import { langOf, tx, type L, type Lang } from "../../_shared/l10n";
import {
  coupons,
  couponDiscount,
  FREE_SHIPPING_FROM,
  gte,
  minus,
  shippingCost,
  shippingMethods,
  itemOf,
  starterCart,
  times,
  total,
  vatIncluded,
  type CartLine,
  type Coupon,
  type ShopItem,
  type ShippingId,
} from "./catalogue";

/** Copy and money for storefront components: `const { c, t, money, date } = useShop();` */
export function useShop() {
  const f = useFormat();
  const { locale } = useLocale();
  const lang: Lang = langOf(locale);
  return React.useMemo(
    () => ({
      f,
      lang,
      t: (value: L) => tx(value, lang),
      c: (en: string, tr: string) => (lang === "tr" ? tr : en),
      /** TRY with the narrow ₺ sign in every locale: "₺1,190.00" / "₺1.190,00". */
      money: (amount: string) => f.currency(amount, { currency: "TRY", display: "narrowSymbol" }),
      /** A date-only value ("2026-11-20") as "Fri 20 Nov" / "20 Kas Cum". */
      date: (ymd: string, o: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) => f.date(ymd, o),
    }),
    [f, lang],
  );
}

export interface CartRow extends CartLine {
  removed?: boolean;
}

export interface Totals {
  count: number;
  subtotal: string;
  discount: string;
  afterDiscount: string;
  shipping: string;
  fee: string;
  total: string;
  vat: string;
  /** Left to spend for free standard delivery ("0.00" once reached). */
  toFreeShipping: string;
}

/** `shippingPrice` overrides the method price (international rates, a carrier quote). */
export function computeTotals(lines: CartRow[], coupon: Coupon | null, shippingId: ShippingId | null, fee = "0.00", shippingPrice?: string): Totals {
  const live = lines.filter((l) => !l.removed);
  const subtotal = total(live.map((l) => times(itemOf(l).price, l.qty)));
  const discount = couponDiscount(coupon, subtotal);
  const afterDiscount = minus(subtotal, discount);
  const method = shippingMethods.find((m) => m.id === shippingId) ?? null;
  const shipping = live.length === 0 || !method ? "0.00" : (shippingPrice ?? shippingCost(method, afterDiscount));
  const grand = total([afterDiscount, shipping, fee]);
  return {
    count: live.reduce((n, l) => n + l.qty, 0),
    subtotal,
    discount,
    afterDiscount,
    shipping,
    fee,
    total: grand,
    vat: vatIncluded(grand),
    toFreeShipping: gte(afterDiscount, FREE_SHIPPING_FROM) ? "0.00" : minus(FREE_SHIPPING_FROM, afterDiscount),
  };
}

interface CartValue {
  lines: CartRow[];
  totals: Totals;
  coupon: Coupon | null;
  shippingId: ShippingId;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (itemId: string, qty: number, key?: string, item?: ShopItem) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  restore: (key: string) => void;
  /** Applies a code; returns the reason when it fails. */
  applyCoupon: (code: string) => "ok" | "unknown" | "minimum";
  clearCoupon: () => void;
  setShippingId: (id: ShippingId) => void;
}

const CartContext = React.createContext<CartValue | null>(null);

export function useCart(): CartValue {
  const v = React.useContext(CartContext);
  if (!v) throw new Error("useCart needs <CartProvider>");
  return v;
}

export function CartProvider({ initialLines = starterCart, initialCoupon = null, children }: { initialLines?: CartLine[]; initialCoupon?: string | null; children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartRow[]>(initialLines);
  const [coupon, setCoupon] = React.useState<Coupon | null>(() => coupons.find((x) => x.code === initialCoupon) ?? null);
  const [shippingId, setShippingId] = React.useState<ShippingId>("standard");
  const [open, setOpen] = React.useState(false);
  const totals = React.useMemo(() => computeTotals(lines, coupon, shippingId), [lines, coupon, shippingId]);

  const value = React.useMemo<CartValue>(
    () => ({
      lines,
      totals,
      coupon,
      shippingId,
      open,
      setOpen,
      add: (itemId, qty, key = itemId, item) =>
        setLines((prev) => {
          // Drop rows removed earlier, so a re-added item comes back as a live line.
          const kept = prev.filter((l) => !l.removed);
          const hit = kept.find((l) => l.key === key);
          return hit ? kept.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + qty) } : l)) : [...kept, { key, itemId, qty, item }];
        }),
      setQty: (key, qty) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l))),
      remove: (key) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, removed: true } : l))),
      restore: (key) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, removed: false } : l))),
      applyCoupon: (raw) => {
        const hit = coupons.find((x) => x.code === raw.trim().toUpperCase());
        if (!hit) return "unknown";
        if (hit.min && !gte(totals.subtotal, hit.min)) return "minimum";
        setCoupon(hit);
        return "ok";
      },
      clearCoupon: () => setCoupon(null),
      setShippingId,
    }),
    [lines, totals, coupon, shippingId, open],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
