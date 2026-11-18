"use client";

import * as React from "react";
import { Button, Field, Image, Input, LocaleProvider, NumberInput, Progress, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, Toaster, toast } from "@vamos-ui/react";
import { isCouponIssue, normalizeCouponCode, type CartLine } from "@vamos-ui/react/commerce";
import { CartProvider, useCart, type CartContextValue } from "@vamos-ui/react/commerce/cart";
import { sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { Trash2, X } from "lucide-react";
import { catalog, fill, FREE_SHIPPING, money, productById, ui, type Category, type L, type SiteLocale } from "./content";

export type { CartLine };

interface StoreContextValue {
  locale: SiteLocale;
  /** `ui` string in the current language. */
  s: (key: keyof typeof ui, vars?: Record<string, string | number>) => string;
  t: (value: L) => string;
  /** Minor units → "₺3.400" / "TRY 3,400". */
  fmt: (minor: number) => string;
  /** The kit cart: lines, `quote` (priced from the catalog), `checkout()`. */
  cart: CartContextValue;
  lines: CartLine[];
  count: number;
  subtotal: number;
  /** True in the docs preview: checkout simulates the order instead of calling /api/checkout. */
  demo: boolean;
  add: (productId: string, glazeId: string, qty?: number) => void;
  setQty: (productId: string, glazeId: string, qty: number) => void;
  remove: (productId: string, glazeId: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  /** The product (and glaze) the detail page shows. */
  selected: { productId: string; glazeId: string };
  select: (productId: string, glazeId: string) => void;
  /** Shop filter, kept here so category tiles on the home page can preset it. */
  shopCategory: Category | "all";
  setShopCategory: (c: Category | "all") => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>.");
  return ctx;
}

const lineKey = (l: CartLine) => `${l.productId}:${l.variantId ?? ""}`;

/** Two pieces in the demo cart on arrival, so the drawer, totals and checkout show real content. */
const STARTER: CartLine[] = [
  { productId: "morning-cup", variantId: "clay-foot", qty: 2 },
  { productId: "bud-vase-pair", variantId: "milk", qty: 1 },
];

/**
 * The kit cart (saved in localStorage, priced from `catalog`), the cart drawer and the selected
 * product for the whole site. Lives inside SiteShell but outside the locale switch, so changing
 * language keeps the cart. Any `a[href="#cart"]` inside (the navbar's cart link) opens the drawer.
 * `demo` (the docs preview) gives the preview its own cart that starts with two pieces.
 */
export function StoreProvider({ demo = false, children }: { demo?: boolean; children: React.ReactNode }) {
  return (
    <CartProvider catalog={catalog} storageKey={demo ? "vb-demo:site-store-01" : "kilnhouse-cart"} initialLines={demo ? STARTER : undefined}>
      <StoreState demo={demo}>{children}</StoreState>
    </CartProvider>
  );
}

function StoreState({ demo, children }: { demo: boolean; children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const cart = useCart();
  const [cartOpen, setCartOpen] = React.useState(false);
  const [selected, setSelected] = React.useState({ productId: "tide-plates", glazeId: "sea-salt" });
  const [shopCategory, setShopCategory] = React.useState<Category | "all">("all");

  const value = React.useMemo<StoreContextValue>(() => {
    const t = (v: L) => v[locale];
    const s = (key: keyof typeof ui, vars?: Record<string, string | number>) => fill(ui[key][locale], vars ?? {});
    // Lines whose product or glaze is gone (an old saved cart) are not shown or counted.
    const lines = cart.lines.filter((l) => {
      const p = productById(l.productId);
      return p.id === l.productId && p.glazes.some((g) => g.id === l.variantId);
    });
    return {
      locale,
      s,
      t,
      fmt: (v) => money(v, locale),
      cart,
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: cart.quote?.subtotal ?? lines.reduce((sum, l) => sum + productById(l.productId).price * l.qty, 0),
      demo,
      add: (productId, glazeId, qty = 1) => {
        cart.add(productId, { variantId: glazeId, qty });
        const p = productById(productId);
        const g = p.glazes.find((x) => x.id === glazeId) ?? p.glazes[0]!;
        toast.success(s("added"), { description: `${t(p.name)} · ${t(g.name)} × ${qty}`, action: { label: s("cart"), onClick: () => setCartOpen(true) } });
      },
      setQty: (productId, glazeId, qty) => cart.setQty(productId, glazeId, Math.max(1, qty)),
      remove: (productId, glazeId) => cart.remove(productId, glazeId),
      cartOpen,
      setCartOpen,
      selected,
      select: (productId, glazeId) => setSelected({ productId, glazeId }),
      shopCategory,
      setShopCategory,
    };
  }, [locale, cart, demo, cartOpen, selected, shopCategory]);

  const onClickCapture = (e: React.MouseEvent) => {
    const a = (e.target as Element | null)?.closest?.('a[href="#cart"]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll<HTMLElement>("[popover]").forEach((p) => {
      try {
        p.hidePopover();
      } catch {
        /* not open */
      }
    });
    setCartOpen(true);
  };

  return (
    <StoreContext.Provider value={value}>
      <div className="contents" onClickCapture={onClickCapture}>
        {children}
      </div>
      <LocaleProvider locale={locale === "tr" ? "tr-TR" : "en-US"} messages={locale === "tr" ? tr : undefined}>
        <CartSheet onCheckout={() => navigate({ page: "checkout" })} />
        <Toaster />
      </LocaleProvider>
    </StoreContext.Provider>
  );
}

/** The navbar's cart label: "Cart · 3". A client island inside the server Navbar. */
export function CartLabel() {
  const { s, count } = useStore();
  return (
    <span className="inline-flex items-center gap-2">
      {s("cart")}
      <span className="tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[11px] text-accent-fg" aria-hidden={count === 0 || undefined}>
        {count}
      </span>
    </span>
  );
}

/** Free-delivery meter, shared by the drawer and the checkout summary. */
export function FreeShippingMeter() {
  const { s, subtotal, fmt } = useStore();
  const goal = FREE_SHIPPING;
  const left = Math.max(0, goal - subtotal);
  return (
    <Progress
      size="xs"
      value={Math.min(goal, subtotal)}
      max={goal}
      label={<span className="text-small text-fg">{left === 0 ? s("freeDone") : s("freeLeft", { amount: fmt(left) })}</span>}
    />
  );
}

/** One cart row: photo, name, glaze, quantity and line total. */
export function CartLineRow({ line, compact }: { line: CartLine; compact?: boolean }) {
  const { t, s, fmt, setQty, remove } = useStore();
  const p = productById(line.productId);
  const g = p.glazes.find((x) => x.id === line.variantId) ?? p.glazes[0]!;
  const name = `${t(p.name)} · ${t(g.name)}`;
  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-line py-4 last:border-b-0">
      <Image src={g.photo.src} width={g.photo.width} height={g.photo.height} focal={g.photo.focal} alt={t(g.alt)} aspect="4/5" rounded="ui" sizes="72px" />
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-fg">{t(p.name)}</p>
            <p className="flex items-center gap-1.5 text-small text-fg-muted">
              <span aria-hidden className="size-2.5 rounded-full ring-1 ring-line" style={{ background: g.swatch }} />
              {t(g.name)}
            </p>
          </div>
          <p className="tabular shrink-0 text-fg">{fmt(p.price * line.qty)}</p>
        </div>
        {compact ? (
          <p className="text-small text-fg-muted">
            {s("quantity")}: {line.qty}
          </p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <NumberInput
              aria-label={s("quantityOf", { name })}
              value={line.qty}
              min={1}
              max={Math.max(1, Math.min(20, g.stock))}
              precision={0}
              stepper
              onValueChange={(v) => v != null && setQty(line.productId, g.id, v)}
              className="w-32"
            />
            <Button variant="ghost" size="sm" onClick={() => remove(line.productId, g.id)} aria-label={s("removeItem", { name })}>
              <Trash2 aria-hidden />
              {s("remove")}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Discount code on the kit cart: apply, one error message per issue code, the applied code with
 * remove. A code below its minimum stays and starts working once the cart qualifies.
 */
export function CouponField() {
  const { s, fmt, cart } = useStore();
  const [code, setCode] = React.useState("");
  const [empty, setEmpty] = React.useState(false);
  const applied = cart.coupon && !cart.couponIssue ? (cart.catalog.coupons?.find((x) => normalizeCouponCode(x.code) === normalizeCouponCode(cart.coupon!)) ?? null) : null;
  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-ui border border-dashed border-line px-3 py-2">
        <p role="status" className="font-mono text-[12px] tracking-[0.06em] text-fg">
          {applied.code}
        </p>
        <Button variant="ghost" size="sm" onClick={cart.removeCoupon} aria-label={s("removeCode", { code: applied.code })}>
          <X aria-hidden />
        </Button>
      </div>
    );
  }
  const issue = cart.coupon && cart.couponIssue ? cart.couponIssue.code : null;
  const min = issue === "coupon-min-subtotal" ? (cart.catalog.coupons?.find((x) => normalizeCouponCode(x.code) === normalizeCouponCode(cart.coupon!))?.minSubtotal ?? 0) : 0;
  const error = empty ? s("codeEmpty") : issue && isCouponIssue(cart.couponIssue!) ? s(issue as "coupon-invalid", { code: cart.coupon!.trim().toUpperCase(), amount: fmt(min) }) : undefined;
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return setEmpty(true);
        setEmpty(false);
        if (!cart.applyCoupon(code)) {
          setCode("");
          toast.success(s("codeApplied"));
        }
      }}
    >
      <Field label={s("code")} hint={error ? undefined : s("codeHint")} error={error}>
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setEmpty(false);
              if (cart.coupon && cart.couponIssue) cart.removeCoupon();
            }}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 uppercase"
          />
          <Button type="submit" variant="secondary">
            {s("apply")}
          </Button>
        </div>
      </Field>
    </form>
  );
}

/** Totals block: subtotal, discount, shipping (free above the threshold) and total, from the kit's quote. */
export function CartTotals() {
  const { s, fmt, subtotal, cart } = useStore();
  const ship = cart.quote?.shipping ?? 0;
  const discount = cart.quote?.discount ?? 0;
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-small">
      <dt className="text-fg-muted">{s("subtotal")}</dt>
      <dd className="tabular text-end text-fg">{fmt(subtotal)}</dd>
      {discount > 0 ? (
        <>
          <dt className="text-fg-muted">
            {s("discount")}
            {cart.quote?.coupon ? <span className="ms-1.5 font-mono text-[11px] text-accent-ink">{cart.quote.coupon.code}</span> : null}
          </dt>
          <dd className="tabular text-end text-success">−{fmt(discount)}</dd>
        </>
      ) : null}
      <dt className="text-fg-muted">{s("shipping")}</dt>
      <dd className="tabular text-end text-fg">{ship === 0 ? s("free") : fmt(ship)}</dd>
      <dt className="mt-2 border-t border-line pt-2 text-body font-medium text-fg">{s("total")}</dt>
      <dd className="tabular mt-2 border-t border-line pt-2 text-end text-body font-medium text-fg">{fmt(cart.quote?.total ?? subtotal + ship)}</dd>
    </dl>
  );
}

function CartSheet({ onCheckout }: { onCheckout: () => void }) {
  const { s, lines, count, cartOpen, setCartOpen, locale } = useStore();
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="end" size="md">
        <SheetHeader title={`${s("cartTitle")} (${count})`} />
        <SheetBody>
          <div className="mb-2 rounded-ui bg-surface-2 p-3">
            <FreeShippingMeter />
          </div>
          {lines.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-8">
              <p className="text-fg-muted">{s("cartEmpty")}</p>
              <Button asChild variant="secondary" onClick={() => setCartOpen(false)}>
                <a href={sitePageHref("shop")}>{s("browse")}</a>
              </Button>
            </div>
          ) : (
            <ul aria-label={s("cartTitle")} lang={locale}>
              {lines.map((l) => (
                <CartLineRow key={lineKey(l)} line={l} />
              ))}
            </ul>
          )}
        </SheetBody>
        {lines.length > 0 ? (
          <SheetFooter className="flex-col items-stretch gap-4">
            <CartTotals />
            <Button
              variant="primary"
              size="lg"
              block
              onClick={() => {
                setCartOpen(false);
                onCheckout();
              }}
            >
              {s("checkout")}
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
