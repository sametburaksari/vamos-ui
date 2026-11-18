"use client";

import * as React from "react";
import { Alert, Button, EmptyState, toast } from "@vamos-ui/react";
import { Lock, ShoppingBag, Truck } from "lucide-react";
import { businessDay, delivery, recommendedIds, shopItems, type ShopItem } from "../../product-01/components/catalogue";
import { useShop, useStoreCart } from "../../product-01/components/cart-store";
import { CartLineItem, Eyebrow, FreeShippingMeter, ProductTile, storeHref, StoreContainer, SummaryRows } from "../../product-01/components/storefront";

/** Cart page: lines with quantity + remove / undo, free delivery meter, summary, recommendations. */
export function CartPage() {
  const { c, t, f } = useShop();
  const cart = useStoreCart();
  const { rows: lines, totals, issues } = cart;
  const live = lines.filter((l) => !l.removed);
  const empty = live.length === 0;

  const addRecommended = (item: ShopItem) => {
    const id = Object.keys(shopItems).find((k) => shopItems[k] === item)!;
    cart.add(id, 1);
    toast.success(c("Added to your cart", "Sepetinize eklendi"), { description: t(item.name) });
  };

  const eta = f.dateRange(businessDay(delivery.days[0]), businessDay(delivery.days[1]), { weekday: "short", day: "numeric", month: "short" });

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

        {issues.length ? (
          <Alert tone="warning" live="assertive" className="mb-6" title={c("Some saved items are no longer sold", "Kayıtlı bazı ürünler artık satılmıyor")}>
            <span className="flex flex-wrap items-center gap-3">
              {c("They are left out of the total. Remove them to check out.", "Toplama katılmadılar. Ödemeye geçmek için çıkarın.")}
              <Button variant="secondary" size="sm" onClick={cart.dropUnavailable}>
                {c("Remove them", "Çıkar")}
              </Button>
            </span>
          </Alert>
        ) : null}

        {!cart.kit.ready ? (
          <div aria-busy="true" className="h-64 animate-pulse rounded-ui-lg bg-surface-2" />
        ) : empty ? (
          <EmptyState
            size="lg"
            icon={<ShoppingBag aria-hidden />}
            as="h2"
            title={c("Your cart is empty", "Sepetiniz boş")}
            description={c("Things you add show up here. Your cart is saved on this device.", "Eklediğiniz ürünler burada görünür. Sepetiniz bu cihazda saklanır.")}
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
                <div className="flex items-start gap-3 text-small">
                  <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <p className="text-fg-muted">
                    <span className="block text-fg">{t(delivery.name)}</span>
                    {t(delivery.carrier)} · {eta}
                  </p>
                </div>
                <SummaryRows totals={totals} shippingLabel={t(delivery.name)} />
                <div className="flex flex-col gap-2">
                  <Button asChild variant="primary" size="lg" block>
                    <a href={storeHref.checkout}>
                      <Lock aria-hidden />
                      {c("Check out securely", "Güvenli ödemeye geç")}
                    </a>
                  </Button>
                  <p className="text-center text-[12px] text-fg-subtle">{c("Debit or credit card, instalments available", "Banka ya da kredi kartı, taksit seçenekli")}</p>
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
