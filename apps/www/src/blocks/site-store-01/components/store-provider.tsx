"use client";

import * as React from "react";
import { Button, Image, LocaleProvider, NumberInput, Progress, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, Toaster, toast } from "@vamos-ui/react";
import { sitePageHref, useSiteShell } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { Trash2 } from "lucide-react";
import { defaultCurrency, fill, FREE_SHIPPING, money, productById, SHIPPING, ui, type Category, type Currency, type L, type SiteLocale } from "./content";

export interface CartLine {
  productId: string;
  glazeId: string;
  qty: number;
}

interface StoreContextValue {
  locale: SiteLocale;
  /** `ui` string in the current language. */
  s: (key: keyof typeof ui, vars?: Record<string, string | number>) => string;
  t: (value: L) => string;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmt: (value: number | string) => string;
  lines: CartLine[];
  count: number;
  subtotal: number;
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

const lineKey = (l: { productId: string; glazeId: string }) => `${l.productId}:${l.glazeId}`;

/** Two pieces in the cart on arrival, so the drawer, totals and checkout show real content. */
const STARTER: CartLine[] = [
  { productId: "morning-cup", glazeId: "clay-foot", qty: 2 },
  { productId: "bud-vase-pair", glazeId: "milk", qty: 1 },
];

/**
 * Cart, currency and the selected product for the whole site. Lives inside SiteShell but
 * outside the locale switch, so changing language keeps the cart. Any `a[href="#cart"]`
 * inside (the navbar's cart link) opens the cart drawer.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { locale: shellLocale, navigate } = useSiteShell();
  const locale: SiteLocale = shellLocale === "tr" ? "tr" : "en";
  const [chosenCurrency, setChosenCurrency] = React.useState<Currency | null>(null);
  const currency = chosenCurrency ?? defaultCurrency(locale);
  const [lines, setLines] = React.useState<CartLine[]>(STARTER);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [selected, setSelected] = React.useState({ productId: "tide-plates", glazeId: "sea-salt" });
  const [shopCategory, setShopCategory] = React.useState<Category | "all">("all");

  const value = React.useMemo<StoreContextValue>(() => {
    const t = (v: L) => v[locale];
    const s = (key: keyof typeof ui, vars?: Record<string, string | number>) => fill(ui[key][locale], vars ?? {});
    const subtotal = lines.reduce((sum, l) => sum + Number(productById(l.productId).price[currency]) * l.qty, 0);
    return {
      locale,
      s,
      t,
      currency,
      setCurrency: setChosenCurrency,
      fmt: (v) => money(v, currency, locale),
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal,
      add: (productId, glazeId, qty = 1) => {
        setLines((prev) => {
          const at = prev.findIndex((l) => lineKey(l) === lineKey({ productId, glazeId }));
          if (at === -1) return [...prev, { productId, glazeId, qty }];
          return prev.map((l, i) => (i === at ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
        });
        const p = productById(productId);
        const g = p.glazes.find((x) => x.id === glazeId) ?? p.glazes[0]!;
        toast.success(s("added"), { description: `${t(p.name)} · ${t(g.name)} × ${qty}`, action: { label: s("cart"), onClick: () => setCartOpen(true) } });
      },
      setQty: (productId, glazeId, qty) => setLines((prev) => prev.map((l) => (lineKey(l) === lineKey({ productId, glazeId }) ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l))),
      remove: (productId, glazeId) => setLines((prev) => prev.filter((l) => lineKey(l) !== lineKey({ productId, glazeId }))),
      cartOpen,
      setCartOpen,
      selected,
      select: (productId, glazeId) => setSelected({ productId, glazeId }),
      shopCategory,
      setShopCategory,
    };
  }, [locale, currency, lines, cartOpen, selected, shopCategory]);

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
  const { s, subtotal, currency, fmt } = useStore();
  const goal = FREE_SHIPPING[currency];
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
  const { t, s, fmt, currency, setQty, remove } = useStore();
  const p = productById(line.productId);
  const g = p.glazes.find((x) => x.id === line.glazeId) ?? p.glazes[0]!;
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
          <p className="tabular shrink-0 text-fg">{fmt(Number(p.price[currency]) * line.qty)}</p>
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
              max={20}
              precision={0}
              stepper
              onValueChange={(v) => v != null && setQty(line.productId, line.glazeId, v)}
              className="w-32"
            />
            <Button variant="ghost" size="sm" onClick={() => remove(line.productId, line.glazeId)} aria-label={s("removeItem", { name })}>
              <Trash2 aria-hidden />
              {s("remove")}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

/** Totals block: subtotal, shipping (free above the threshold) and total. */
export function CartTotals({ shippingCost }: { shippingCost?: number }) {
  const { s, fmt, subtotal, currency } = useStore();
  const ship = shippingCost ?? (subtotal >= FREE_SHIPPING[currency] || subtotal === 0 ? 0 : SHIPPING[currency]);
  return (
    <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1.5 text-small">
      <dt className="text-fg-muted">{s("subtotal")}</dt>
      <dd className="tabular text-end text-fg">{fmt(subtotal)}</dd>
      <dt className="text-fg-muted">{s("shipping")}</dt>
      <dd className="tabular text-end text-fg">{ship === 0 ? s("free") : fmt(ship)}</dd>
      <dt className="mt-2 border-t border-line pt-2 text-body font-medium text-fg">{s("total")}</dt>
      <dd className="tabular mt-2 border-t border-line pt-2 text-end text-body font-medium text-fg">{fmt(subtotal + ship)}</dd>
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
