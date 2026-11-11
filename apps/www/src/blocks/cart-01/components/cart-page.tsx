"use client";

import * as React from "react";
import { Button, EmptyState, Field, Input, RadioGroup, RadioGroupItem, toast } from "@vamos-ui/react";
import { Lock, ShoppingBag, Tag, X } from "lucide-react";
import { businessDay, recommendedIds, shippingMethods, shopItems, type ShippingId, type ShopItem } from "../../product-01/components/catalogue";
import { useCart, useShop } from "../../product-01/components/cart-store";
import { CartLineItem, Eyebrow, FreeShippingMeter, ProductTile, storeHref, StoreContainer, SummaryRows } from "../../product-01/components/storefront";

/** Coupon entry: apply, inline error, applied chip with remove. */
function CouponForm() {
  const { c, t } = useShop();
  const { coupon, applyCoupon, clearCoupon } = useCart();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  if (coupon) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-ui border border-dashed border-line px-3 py-2.5">
        <p className="flex min-w-0 items-center gap-2 text-small">
          <Tag aria-hidden className="size-4 shrink-0 text-accent-ink" />
          <span className="font-mono text-[12px] tracking-[0.06em] text-fg">{coupon.code}</span>
          <span className="truncate text-fg-muted">{t(coupon.label)}</span>
        </p>
        <Button variant="ghost" size="icon-xs" onClick={clearCoupon} aria-label={c(`Remove code ${coupon.code}`, `${coupon.code} kodunu kaldır`)}>
          <X aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex"
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return setError(c("Enter a code.", "Bir kod girin."));
        const r = applyCoupon(code);
        if (r === "unknown") return setError(c(`“${code.trim().toUpperCase()}” isn’t a valid code.`, `“${code.trim().toUpperCase()}” geçerli bir kod değil.`));
        if (r === "minimum") return setError(c("This code needs a subtotal of ₺1,000 or more.", "Bu kod için ara toplam en az 1.000 ₺ olmalı."));
        setError(null);
        setCode("");
        toast.success(c("Code applied", "Kod uygulandı"));
      }}
    >
      <Field label={c("Discount code", "İndirim kodu")} hint={error ? undefined : c("Try KILN10", "KILN10’u deneyin")} error={error} className="min-w-0 flex-1">
        <div className="flex gap-2">
          <Input value={code} onChange={(e) => { setCode(e.target.value); setError(null); }} autoComplete="off" autoCapitalize="characters" spellCheck={false} className="min-w-0 flex-1 uppercase" />
          <Button type="submit" variant="secondary">
            {c("Apply", "Uygula")}
          </Button>
        </div>
      </Field>
    </form>
  );
}

/** Cart page: lines with quantity + remove / undo, coupon, free delivery meter, summary, recommendations. */
export function CartPage() {
  const { c, t, f, date } = useShop();
  const cart = useCart();
  const { lines, totals, shippingId, setShippingId } = cart;
  const live = lines.filter((l) => !l.removed);
  const empty = live.length === 0;

  const addRecommended = (item: ShopItem) => {
    const id = Object.keys(shopItems).find((k) => shopItems[k] === item)!;
    cart.add(id, 1);
    toast.success(c("Added to your cart", "Sepetinize eklendi"), { description: t(item.name) });
  };

  const eta = (id: ShippingId) => {
    const m = shippingMethods.find((x) => x.id === id)!;
    if (m.days[1] === 0) return c("Today", "Bugün");
    return m.days[0] === m.days[1] ? date(businessDay(m.days[0])) : f.dateRange(businessDay(m.days[0]), businessDay(m.days[1]), { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <>
      <StoreContainer className="pt-8 lg:pt-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
          <div>
            <Eyebrow className="mb-2">{c("Step 1 of 3 · Cart", "Adım 1 / 3 · Sepet")}</Eyebrow>
            <h1 className="font-display text-display-l text-fg">
              {c("Your cart", "Sepetiniz")} <span className="tabular text-fg-subtle">({totals.count})</span>
            </h1>
          </div>
          <Button variant="link" onClick={() => cart.setOpen(true)}>
            {c("Open mini-cart", "Mini sepeti aç")}
          </Button>
        </div>

        {empty ? (
          <EmptyState
            size="lg"
            icon={<ShoppingBag aria-hidden />}
            as="h2"
            title={c("Your cart is empty", "Sepetiniz boş")}
            description={c("Things you add show up here. Your cart is kept for 30 days on this device.", "Eklediğiniz ürünler burada görünür. Sepetiniz bu cihazda 30 gün saklanır.")}
            actions={
              <>
                <Button asChild variant="primary">
                  <a href={storeHref.product}>{c("Shop ceramics", "Seramiklere göz at")}</a>
                </Button>
                {lines.some((l) => l.removed) ? (
                  <Button variant="secondary" onClick={() => lines.forEach((l) => l.removed && cart.restore(l.key))}>
                    {c("Undo remove", "Çıkarmayı geri al")}
                  </Button>
                ) : null}
              </>
            }
            className="py-16"
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <section aria-labelledby="cart-lines-title" className="min-w-0">
              <h2 id="cart-lines-title" className="sr-only">
                {c("Items", "Ürünler")}
              </h2>
              <FreeShippingMeter totals={totals} className="mb-2 rounded-ui-lg bg-surface-2 p-4" />
              <ul aria-label={c("Items in your cart", "Sepetteki ürünler")}>
                {lines.map((l) => (
                  <CartLineItem key={l.key} line={l} />
                ))}
              </ul>
              <p className="mt-4 text-[12px] text-fg-subtle">
                {c("Items in your cart aren’t reserved. Quantities are limited to what’s on the shelf in İzmir.", "Sepetteki ürünler ayrılmaz. Adetler İzmir deposundaki stokla sınırlıdır.")}
              </p>
            </section>

            <aside aria-labelledby="summary-title" className="lg:sticky lg:top-6 lg:self-start">
              <div className="surface flex flex-col gap-6 rounded-ui-lg p-5 sm:p-6">
                <h2 id="summary-title" className="font-display text-[1.5rem] leading-tight text-fg">
                  {c("Order summary", "Sipariş özeti")}
                </h2>
                <Field label={c("Delivery", "Teslimat")}>
                  <RadioGroup value={shippingId} onValueChange={(v) => setShippingId(v as ShippingId)} size="sm" className="gap-3">
                    {shippingMethods.map((m) => (
                      <RadioGroupItem key={m.id} value={m.id} label={t(m.name)} description={eta(m.id)} />
                    ))}
                  </RadioGroup>
                </Field>
                <CouponForm />
                <SummaryRows totals={totals} couponCode={cart.coupon?.code} shippingLabel={t(shippingMethods.find((m) => m.id === shippingId)!.name)} />
                <div className="flex flex-col gap-2">
                  <Button asChild variant="primary" size="lg" block>
                    <a href={storeHref.checkout}>
                      <Lock aria-hidden />
                      {c("Check out securely", "Güvenli ödemeye geç")}
                    </a>
                  </Button>
                  <p className="text-center text-[12px] text-fg-subtle">{c("Card, bank transfer or pay at the door", "Kart, havale / EFT ya da kapıda ödeme")}</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </StoreContainer>

      <StoreContainer className="mt-20">
        <section aria-labelledby="recommended-title">
          <h2 id="recommended-title" className="mb-8 font-display text-display-m text-fg">
            {empty ? c("Start with these", "Bunlarla başlayın") : c("You might also like", "Bunlar da hoşunuza gidebilir")}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {recommendedIds.map((id) => (
              <ProductTile key={id} item={shopItems[id]!} onAdd={addRecommended} />
            ))}
          </div>
        </section>
      </StoreContainer>
    </>
  );
}
