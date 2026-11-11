"use client";

// Storefront chrome shared by the Commerce blocks: the EN / TR locale switch (TRY everywhere),
// header with the mini-cart drawer, footer, cart line rows, the free-delivery meter and the
// order summary. Swap `KilnMark` and the nav for your own shop.
import * as React from "react";
import {
  Button,
  cn,
  Image,
  LocaleProvider,
  NumberInput,
  Progress,
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  Toaster,
} from "@vamos-ui/react";
import { tr } from "@vamos-ui/react/locale/tr";
import { RotateCcw, ShoppingBag, Trash2, Truck } from "lucide-react";
import { KilnMark } from "../../auth-2fa-setup-01/components/kiln-brand";
import { FREE_SHIPPING_FROM, itemOf, photo, STORE, times, type ShopItem } from "./catalogue";
import { CartProvider, useCart, useShop, type CartRow, type Totals } from "./cart-store";
import type { CartLine } from "./catalogue";

export type StoreLang = "en" | "tr";

/** Where the storefront links go. In your app these are routes; here they open the sibling blocks. */
export const storeHref = {
  product: "/view/product-01",
  cart: "/view/cart-01",
  checkout: "/view/checkout-01",
  confirmation: "/view/order-confirmation-01",
};

const nav = [
  { en: "Ceramics", tr: "Seramik" },
  { en: "Textiles", tr: "Tekstil" },
  { en: "Kitchen", tr: "Mutfak" },
  { en: "Lighting", tr: "Aydınlatma" },
  { en: "Journal", tr: "Günlük" },
];

/**
 * Page frame: locale (en-US / tr-TR, TRY, Europe/Istanbul), cart state, header, main and footer.
 * `minimal` drops the nav and mini-cart (checkout keeps people on the task).
 */
export function StoreFrame({
  children,
  minimal,
  initialLines,
  initialCoupon,
  defaultLang = "en",
}: {
  children: React.ReactNode;
  minimal?: boolean;
  initialLines?: CartLine[];
  initialCoupon?: string | null;
  defaultLang?: StoreLang;
}) {
  const [lang, setLang] = React.useState<StoreLang>(defaultLang);
  return (
    <LocaleProvider locale={lang === "tr" ? "tr-TR" : "en-US"} messages={lang === "tr" ? tr : undefined} currency="TRY" timeZone="Europe/Istanbul">
      <CartProvider initialLines={initialLines} initialCoupon={initialCoupon}>
        <div lang={lang} className="flex min-h-dvh flex-col bg-scene text-fg">
          <StoreHeader lang={lang} onLang={setLang} minimal={minimal} />
          <main className="flex-1">{children}</main>
          <StoreFooter minimal={minimal} />
          {minimal ? null : <MiniCart />}
          <Toaster />
        </div>
      </CartProvider>
    </LocaleProvider>
  );
}

/** Page width and gutters used by every storefront section. */
export function StoreContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[86rem] px-4 sm:px-6 lg:px-10", className)} {...props} />;
}

/** Small uppercase label. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle", className)} {...props} />;
}

function LangSwitch({ lang, onLang }: { lang: StoreLang; onLang: (l: StoreLang) => void }) {
  const { c } = useShop();
  return (
    <div role="group" aria-label={c("Language", "Dil")} className="flex items-center rounded-ui border border-line p-0.5">
      {(["en", "tr"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={lang === l}
          onClick={() => onLang(l)}
          className={cn(
            "h-7 rounded-[calc(var(--radius)-2px)] px-2 font-mono text-[11px] uppercase tracking-[0.08em] focus-ring transition-colors",
            lang === l ? "bg-selected text-fg" : "text-fg-muted hover:text-fg",
          )}
        >
          {l}
          <span className="sr-only"> {l === "en" ? "English" : "Türkçe"}</span>
        </button>
      ))}
    </div>
  );
}

function StoreHeader({ lang, onLang, minimal }: { lang: StoreLang; onLang: (l: StoreLang) => void; minimal?: boolean }) {
  const { c, t, money } = useShop();
  const { totals, setOpen } = useCart();
  return (
    <>
      {minimal ? null : (
        <p className="border-b border-line bg-surface-2 px-4 py-2 text-center text-[12px] text-fg-muted">
          {c(`Free delivery over ${money(FREE_SHIPPING_FROM)} · 30-day returns · Made in İzmir`, `${money(FREE_SHIPPING_FROM)} üzeri ücretsiz kargo · 30 gün iade · İzmir’de üretildi`)}
        </p>
      )}
      <header className="border-b border-line">
        <StoreContainer className="flex h-16 items-center justify-between gap-4">
          <a href={storeHref.product} className="rounded-ui-sm focus-ring" aria-label={`${STORE.name} — ${c("home", "ana sayfa")}`}>
            <KilnMark />
          </a>
          {minimal ? null : (
            <nav aria-label={c("Shop", "Mağaza")} className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-7 text-[13px] text-fg-muted">
                {nav.map((n, i) => (
                  <li key={n.en}>
                    <a href={storeHref.product} aria-current={i === 0 ? "page" : undefined} className="rounded-ui-sm py-1 transition-colors hover:text-fg focus-ring aria-[current]:text-fg">
                      {t(n)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="flex items-center gap-2">
            {minimal ? (
              <span className="me-2 hidden items-center gap-1.5 text-[12px] text-fg-muted sm:inline-flex">
                <span aria-hidden className="size-1.5 rounded-full bg-success" />
                {c("Secure checkout", "Güvenli ödeme")}
              </span>
            ) : null}
            <LangSwitch lang={lang} onLang={onLang} />
            {minimal ? null : (
              <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={c(`Cart, ${totals.count} items`, `Sepet, ${totals.count} ürün`)} className="gap-2">
                <ShoppingBag aria-hidden />
                <span className="tabular" aria-hidden>
                  {totals.count}
                </span>
              </Button>
            )}
          </div>
        </StoreContainer>
      </header>
    </>
  );
}

function StoreFooter({ minimal }: { minimal?: boolean }) {
  const { c } = useShop();
  return (
    <footer className="mt-16 border-t border-line">
      <StoreContainer className="flex flex-col gap-3 py-8 text-[12px] text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © 2026 {STORE.name} · {c("Kadıköy studio, Istanbul", "Kadıköy atölyesi, İstanbul")}
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <a className="rounded-ui-sm hover:text-fg focus-ring" href={`tel:${STORE.phone.replace(/\s/g, "")}`}>
            {STORE.phone}
          </a>
          <a className="rounded-ui-sm hover:text-fg focus-ring" href={`mailto:${STORE.email}`}>
            {STORE.email}
          </a>
          {minimal ? null : <span>{c("Prices include 20% VAT", "Fiyatlara %20 KDV dahildir")}</span>}
        </p>
      </StoreContainer>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

/** Price with the sale price first and the old price struck through. */
export function PriceTag({ price, compareAt, size = "md", className }: { price: string; compareAt?: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const { money, c } = useShop();
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 tabular", className)}>
      <span className={cn("text-fg", size === "lg" ? "text-h3 font-medium" : size === "md" ? "text-body font-medium" : "text-small")}>
        {compareAt ? <span className="sr-only">{c("Sale price", "İndirimli fiyat")} </span> : null}
        {money(price)}
      </span>
      {compareAt ? (
        <s className={cn("text-fg-subtle", size === "lg" ? "text-body" : "text-small")}>
          <span className="sr-only">{c("was", "önceki fiyat")} </span>
          {money(compareAt)}
        </s>
      ) : null}
    </span>
  );
}

/** Progress towards free standard delivery. */
export function FreeShippingMeter({ totals, className }: { totals: Totals; className?: string }) {
  const { c, money } = useShop();
  const left = totals.toFreeShipping;
  const done = left === "0.00";
  const value = Math.min(Number(totals.afterDiscount), Number(FREE_SHIPPING_FROM));
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Progress
        size="xs"
        value={value}
        max={Number(FREE_SHIPPING_FROM)}
        tone={done ? "success" : undefined}
        aria-label={c("Progress to free delivery", "Ücretsiz kargoya ilerleme")}
        label={
          <span className="inline-flex items-center gap-2 text-small text-fg">
            <Truck aria-hidden className="size-4 text-fg-muted" />
            {done ? c("Free standard delivery unlocked", "Ücretsiz standart kargo kazandınız") : c(`${money(left)} away from free delivery`, `Ücretsiz kargoya ${money(left)} kaldı`)}
          </span>
        }
      />
    </div>
  );
}

/** One cart line: photo, name, option, quantity stepper, remove (inline undo row once removed). */
export function CartLineItem({ line, size = "md" }: { line: CartRow; size?: "sm" | "md" }) {
  const { t, c, money } = useShop();
  const { setQty, remove, restore } = useCart();
  const item = itemOf(line);
  const name = t(item.name);
  const undoRef = React.useRef<HTMLButtonElement>(null);
  const removeRef = React.useRef<HTMLButtonElement>(null);
  const wasRemoved = React.useRef(line.removed);
  React.useEffect(() => {
    // Keep focus on the row: Undo after removing, the remove button after restoring.
    if (line.removed && !wasRemoved.current) undoRef.current?.focus();
    if (!line.removed && wasRemoved.current) removeRef.current?.focus();
    wasRemoved.current = line.removed;
  }, [line.removed]);

  if (line.removed) {
    return (
      <li className="flex items-center justify-between gap-3 border-b border-line py-4 text-small text-fg-muted last:border-b-0">
        <span className="min-w-0 truncate" role="status">
          {c(`${name} removed from your cart.`, `${name} sepetten çıkarıldı.`)}
        </span>
        <Button ref={undoRef} variant="ghost" size="sm" onClick={() => restore(line.key)} aria-label={c(`Undo: put ${name} back`, `Geri al: ${name} sepete dönsün`)}>
          <RotateCcw aria-hidden />
          {c("Undo", "Geri al")}
        </Button>
      </li>
    );
  }

  const sm = size === "sm";
  return (
    <li className={cn("grid gap-4 border-b border-line py-4 last:border-b-0", sm ? "grid-cols-[4rem_minmax(0,1fr)]" : "grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-6 sm:py-6")}>
      <Image src={photo(item.photo, 240)} width={240} height={300} alt="" aspect="4/5" rounded="ui" sizes="104px" className="self-start" />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <p className="font-medium text-fg">{name}</p>
            <p className="text-small text-fg-muted">
              {item.option ? `${t(item.option)} · ` : ""}
              {money(item.price)}
              {item.compareAt ? <s className="ms-1.5 text-fg-subtle">{money(item.compareAt)}</s> : null}
            </p>
            {!sm && item.stock > 0 && item.stock <= 20 ? <p className="mt-1 text-[12px] text-warning">{c(`Only ${item.stock} left`, `Son ${item.stock} adet`)}</p> : null}
          </div>
          <p className="tabular text-fg">{money(times(item.price, line.qty))}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <NumberInput
            aria-label={c(`Quantity of ${name}`, `${name} adedi`)}
            value={line.qty}
            min={1}
            max={20}
            precision={0}
            stepper
            size="sm"
            onValueChange={(v) => v != null && setQty(line.key, v)}
            className="w-28"
          />
          <Button ref={removeRef} variant="ghost" size="sm" onClick={() => remove(line.key)} aria-label={c(`Remove ${name}`, `${name} ürününü çıkar`)}>
            <Trash2 aria-hidden />
            {c("Remove", "Çıkar")}
          </Button>
        </div>
      </div>
    </li>
  );
}

/** Subtotal → discount → shipping → total, with the VAT contained in it. */
export function SummaryRows({ totals, couponCode, shippingLabel, feeLabel, className }: { totals: Totals; couponCode?: string | null; shippingLabel?: string; feeLabel?: string; className?: string }) {
  const { c, money } = useShop();
  return (
    <dl className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-y-2 text-small [&>dd]:ps-6", className)}>
      <dt className="text-fg-muted">{c(`Subtotal · ${totals.count} items`, `Ara toplam · ${totals.count} ürün`)}</dt>
      <dd className="tabular text-end text-fg">{money(totals.subtotal)}</dd>
      {totals.discount !== "0.00" ? (
        <>
          <dt className="text-fg-muted">
            {c("Discount", "İndirim")}
            {couponCode ? <span className="ms-1.5 rounded-ui-sm bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] text-accent-ink">{couponCode}</span> : null}
          </dt>
          <dd className="tabular text-end text-success">−{money(totals.discount)}</dd>
        </>
      ) : null}
      <dt className="text-fg-muted">{shippingLabel ?? c("Delivery", "Kargo")}</dt>
      <dd className="tabular text-end text-fg">{totals.shipping === "0.00" ? c("Free", "Ücretsiz") : money(totals.shipping)}</dd>
      {totals.fee !== "0.00" ? (
        <>
          <dt className="text-fg-muted">{feeLabel ?? c("Service fee", "Hizmet bedeli")}</dt>
          <dd className="tabular text-end text-fg">{money(totals.fee)}</dd>
        </>
      ) : null}
      <dt className="mt-2 border-t border-line pt-3 text-body font-medium text-fg">{c("Total", "Toplam")}</dt>
      <dd className="tabular mt-2 border-t border-line pt-3 text-end text-h3 font-medium text-fg">{money(totals.total)}</dd>
      <dt className="sr-only">{c("VAT included", "Dahil KDV")}</dt>
      <dd className="col-span-2 text-end text-[12px] text-fg-subtle">{c(`Includes ${money(totals.vat)} VAT (20%)`, `${money(totals.vat)} KDV (%20) dahildir`)}</dd>
    </dl>
  );
}

/** Small product tile for related / recommended rails. */
export function ProductTile({ item, onAdd }: { item: ShopItem; onAdd?: (item: ShopItem) => void }) {
  const { t, c } = useShop();
  const name = t(item.name);
  return (
    <article className="group flex min-w-0 flex-col gap-3">
      <a href={storeHref.product} className="relative block overflow-hidden rounded-ui-lg focus-ring">
        <Image src={photo(item.photo, 480)} width={480} height={600} alt={name} aspect="4/5" sizes="(min-width: 1024px) 22vw, 45vw" imgClassName="transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]" />
        {item.compareAt ? <span className="absolute start-3 top-3 rounded-ui-sm bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-fg">{c("Sale", "İndirim")}</span> : null}
      </a>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-small font-medium text-fg">{name}</h3>
          <PriceTag price={item.price} compareAt={item.compareAt} size="sm" className="text-fg-muted" />
        </div>
        {onAdd ? (
          <Button variant="secondary" size="icon-sm" onClick={() => onAdd(item)} aria-label={c(`Add ${name} to cart`, `${name} sepete ekle`)} disabled={item.stock === 0}>
            <ShoppingBag aria-hidden />
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/** The header's mini-cart drawer. */
export function MiniCart() {
  const { c } = useShop();
  const { lines, totals, open, setOpen } = useCart();
  const empty = lines.every((l) => l.removed);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="end" size="md">
        <SheetHeader title={c(`Your cart (${totals.count})`, `Sepetiniz (${totals.count})`)} />
        <SheetBody>
          {empty ? (
            <div className="flex flex-col items-start gap-4 py-10">
              <p className="text-fg-muted">{c("Your cart is empty.", "Sepetiniz boş.")}</p>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                {c("Keep shopping", "Alışverişe devam et")}
              </Button>
            </div>
          ) : (
            <>
              <FreeShippingMeter totals={totals} className="mb-2 rounded-ui bg-surface-2 p-3" />
              <ul aria-label={c("Items in your cart", "Sepetteki ürünler")}>
                {lines.map((l) => (
                  <CartLineItem key={l.key} line={l} size="sm" />
                ))}
              </ul>
            </>
          )}
        </SheetBody>
        {empty ? null : (
          <SheetFooter className="flex-col items-stretch gap-3">
            <SummaryRows totals={totals} shippingLabel={c("Standard delivery", "Standart kargo")} />
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="secondary">
                <a href={storeHref.cart}>{c("View cart", "Sepete git")}</a>
              </Button>
              <Button asChild variant="primary">
                <a href={storeHref.checkout}>{c("Checkout", "Ödemeye geç")}</a>
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
