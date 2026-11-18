"use client";

/**
 * The browser cart: lines in localStorage (per store), priced with the same catalog the server
 * charges from, plus `checkout()` that posts to your checkout endpoint and sends the buyer to the
 * payment page.
 *
 * ```tsx
 * <CartProvider catalog={catalog}>…</CartProvider>
 * const cart = useCart(); cart.add("mug", { variantId: "sand" });
 * cart.applyCoupon("YAZ10");   // cart.quote.discount, or cart.couponIssue when it does not apply
 * ```
 */
import * as React from "react";
import type { OrderBuyer } from "./order";
import { priceCart, type CartIssue, type CartLine, type Catalog, type Quote } from "./pricing";

const MAX_CODE = 64;

export interface CartContextValue {
  catalog: Catalog;
  lines: CartLine[];
  /** Number of items (sum of quantities). */
  count: number;
  /** The priced cart, or null when it is empty or a line no longer exists. */
  quote: Quote | null;
  /** Lines the catalog no longer accepts (removed products, sold-out variants). Never coupon issues. */
  issues: CartIssue[];
  /** The discount code the buyer entered (as typed, trimmed), or null. Sent with `checkout()`. */
  coupon: string | null;
  /**
   * Why `coupon` does not apply ("coupon-invalid", "coupon-expired", "coupon-min-subtotal",
   * "coupon-not-applicable"), or null. While set, `quote` is the cart without the discount.
   */
  couponIssue: CartIssue | null;
  /** Sets the discount code and returns its issue (null when it applies, or the cart is empty). */
  applyCoupon: (code: string) => CartIssue | null;
  removeCoupon: () => void;
  add: (productId: string, opts?: { variantId?: string; qty?: number }) => void;
  setQty: (productId: string, variantId: string | undefined, qty: number) => void;
  remove: (productId: string, variantId?: string) => void;
  /** Empties the cart and drops the discount code. */
  clear: () => void;
  /** True once the saved cart was read (avoids a flash of "empty" before hydration). */
  ready: boolean;
  /** Posts the cart and buyer to `endpoint` and redirects to the payment page. */
  checkout: (input: { buyer: OrderBuyer; note?: string; locale?: "tr" | "en" }) => Promise<CheckoutOutcome>;
}

export type CheckoutOutcome =
  | { ok: true; order: string; paymentPageUrl: string }
  | { ok: false; error: "invalid-buyer"; fields: string[] }
  | { ok: false; error: "invalid-cart"; issues: CartIssue[] }
  | { ok: false; error: "network" | "payment-unavailable" | "too-large" | "forbidden-origin" | "bad-request" };

const CartContext = /*#__PURE__*/ React.createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>.");
  return ctx;
}

export interface CartProviderProps {
  catalog: Catalog;
  /** localStorage key. Default "vb-cart". */
  storageKey?: string;
  /** Checkout endpoint. Default "/api/checkout". */
  endpoint?: string;
  /** Lines before anything is saved (demos). */
  initialLines?: CartLine[];
  /** Redirect to the payment page after a successful checkout. Default true. */
  redirect?: boolean;
  children?: React.ReactNode;
}

const same = (l: CartLine, productId: string, variantId?: string) => l.productId === productId && (l.variantId ?? "") === (variantId ?? "");

interface Saved {
  lines: CartLine[];
  coupon: string | null;
}

/** Reads `{ lines, coupon }`, or the plain array of lines earlier versions saved. */
function load(key: string): Saved | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const obj = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
    const data = Array.isArray(parsed) ? parsed : obj && Array.isArray(obj.lines) ? (obj.lines as unknown[]) : null;
    if (!data) return null;
    const coupon = obj && typeof obj.coupon === "string" && obj.coupon.trim() ? obj.coupon.trim().slice(0, MAX_CODE) : null;
    const lines = data
      .filter((l): l is CartLine => !!l && typeof l === "object" && typeof (l as CartLine).productId === "string" && Number.isInteger((l as CartLine).qty))
      .slice(0, 30)
      .map((l) => ({ productId: l.productId, ...(l.variantId ? { variantId: String(l.variantId) } : {}), qty: l.qty }));
    return { lines, coupon };
  } catch {
    return null;
  }
}

export function CartProvider({ catalog, storageKey = "vb-cart", endpoint = "/api/checkout", initialLines = [], redirect = true, children }: CartProviderProps) {
  const [lines, setLines] = React.useState<CartLine[]>(initialLines);
  const [coupon, setCoupon] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const saved = load(storageKey);
    if (saved) {
      setLines(saved.lines);
      setCoupon(saved.coupon);
    }
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      const next = load(storageKey);
      setLines(next?.lines ?? []);
      setCoupon(next?.coupon ?? null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

  React.useEffect(() => {
    if (!ready) return;
    try {
      // Without a code the saved shape stays the plain array earlier versions read.
      window.localStorage.setItem(storageKey, JSON.stringify(coupon ? { lines, coupon } : lines));
    } catch {
      /* private mode or full storage: the cart still works for this page */
    }
  }, [lines, coupon, ready, storageKey]);

  const value = React.useMemo<CartContextValue>(() => {
    // Lines first, then the code: a code that does not apply leaves the plain quote in place.
    const plain = lines.length ? priceCart(catalog, lines) : null;
    const withCode = (code: string | null) => (plain?.ok && code ? priceCart(catalog, lines, { coupon: code }) : null);
    const discounted = withCode(coupon);
    const priced = discounted?.ok ? discounted : plain;
    const maxOf = (productId: string) => catalog.products.find((p) => p.id === productId)?.maxQty ?? 20;
    return {
      catalog,
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      quote: priced?.ok ? priced.quote : null,
      issues: priced && !priced.ok ? priced.issues : [],
      coupon,
      couponIssue: discounted && !discounted.ok ? (discounted.issues[0] ?? null) : null,
      applyCoupon: (code) => {
        const next = String(code ?? "").trim().slice(0, MAX_CODE) || null;
        setCoupon(next);
        const r = withCode(next);
        return r && !r.ok ? (r.issues[0] ?? null) : null;
      },
      removeCoupon: () => setCoupon(null),
      ready,
      add: (productId, opts = {}) =>
        setLines((prev) => {
          const qty = Math.max(1, Math.trunc(opts.qty ?? 1));
          const at = prev.findIndex((l) => same(l, productId, opts.variantId));
          if (at === -1) return [...prev, { productId, ...(opts.variantId ? { variantId: opts.variantId } : {}), qty: Math.min(qty, maxOf(productId)) }];
          return prev.map((l, i) => (i === at ? { ...l, qty: Math.min(l.qty + qty, maxOf(productId)) } : l));
        }),
      setQty: (productId, variantId, qty) =>
        setLines((prev) => (qty < 1 ? prev.filter((l) => !same(l, productId, variantId)) : prev.map((l) => (same(l, productId, variantId) ? { ...l, qty: Math.min(Math.trunc(qty), maxOf(productId)) } : l)))),
      remove: (productId, variantId) => setLines((prev) => prev.filter((l) => !same(l, productId, variantId))),
      clear: () => {
        setLines([]);
        setCoupon(null);
      },
      checkout: async ({ buyer, note, locale }) => {
        let res: Response;
        try {
          res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ lines, buyer, note, locale, ...(coupon ? { coupon } : {}) }) });
        } catch {
          return { ok: false, error: "network" };
        }
        const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (res.ok && typeof data.paymentPageUrl === "string") {
          if (redirect) window.location.assign(data.paymentPageUrl);
          return { ok: true, order: String(data.order), paymentPageUrl: data.paymentPageUrl };
        }
        if (data.error === "invalid-buyer") return { ok: false, error: "invalid-buyer", fields: (data.fields as string[]) ?? [] };
        if (data.error === "invalid-cart") return { ok: false, error: "invalid-cart", issues: (data.issues as CartIssue[]) ?? [] };
        const known = ["payment-unavailable", "too-large", "forbidden-origin", "bad-request"] as const;
        return { ok: false, error: known.includes(data.error as (typeof known)[number]) ? (data.error as (typeof known)[number]) : "network" };
      },
    };
  }, [catalog, lines, coupon, ready, endpoint, redirect]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
