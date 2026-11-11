"use client";

import * as React from "react";
import { Button, Field, formatAddress, Image, Input, Stepper, toast, useLocale, type Address } from "@vamos-ui/react";
import { multiplyDecimal } from "@vamos-ui/react/format";
import { Check, Copy, MessageSquareText, PackageCheck, Printer, UserRound } from "lucide-react";
import { customers } from "../../_shared/orders";
import { NOW } from "../../_shared/time";
import { businessDay, coupons, itemOf, photo, shippingMethods, starterCart, STORE, times } from "../../product-01/components/catalogue";
import { computeTotals, useShop } from "../../product-01/components/cart-store";
import { Eyebrow, storeHref, StoreContainer, SummaryRows } from "../../product-01/components/storefront";

/** The order being confirmed: the starter cart with KILN10, standard delivery, card in 3 instalments. */
const ORDER = {
  number: "KL-30418",
  placedAt: NOW,
  customer: customers[0]!,
  coupon: coupons[0]!,
  shippingId: "standard" as const,
  address: { country: "TR", region1: "İstanbul", region2: "Kadıköy", line1: "Caferağa Mah. Moda Cad. No: 00 D: 4", postalCode: "34710" } satisfies Address,
  card: { brand: "Visa", last4: "4242", installments: 3 },
};

/** Thank-you page: order number, where the order is now, summary, delivery / payment, next steps. */
export function ThankYou() {
  const { c, t, f, money } = useShop();
  const { locale } = useLocale();
  const [account, setAccount] = React.useState<"idle" | "done">("idle");
  const [password, setPassword] = React.useState("");
  const [pwError, setPwError] = React.useState<string | null>(null);
  const totals = computeTotals(starterCart, ORDER.coupon, ORDER.shippingId);
  const method = shippingMethods.find((m) => m.id === ORDER.shippingId)!;
  const first = ORDER.customer.name.split(" ")[0];
  const arrives = f.dateRange(businessDay(2), businessDay(4), { weekday: "short", day: "numeric", month: "short" });
  const monthly = money(multiplyDecimal(totals.total, (1 / ORDER.card.installments).toFixed(12)));
  const time = (iso: string) => f.dateTime(iso, { hour: "2-digit", minute: "2-digit" });

  const copy = () => {
    void navigator.clipboard?.writeText(ORDER.number).catch(() => {});
    toast.success(c(`Order number ${ORDER.number} copied`, `Sipariş numarası ${ORDER.number} kopyalandı`));
  };

  const steps = [
    { id: "placed", title: c("Order placed", "Sipariş alındı"), description: `${c("Today", "Bugün")}, ${time(ORDER.placedAt)}` },
    { id: "paid", title: c("Payment confirmed", "Ödeme onaylandı"), description: `${ORDER.card.brand} •••• ${ORDER.card.last4} · ${time(ORDER.placedAt)}` },
    {
      id: "packing",
      title: c("Packing in İzmir", "İzmir’de paketleniyor"),
      description: c("Each piece is wrapped in recycled paper. Ships today by 14:00.", "Her parça geri dönüştürülmüş kâğıda sarılıyor. Bugün 14:00’e kadar kargoda."),
    },
    { id: "shipped", title: c("Shipped", "Kargoya verildi"), description: c("We text you the tracking link", "Takip bağlantısını SMS ile göndeririz") },
    { id: "delivered", title: c("Delivered", "Teslim edildi"), description: c(`Expected ${arrives}`, `Tahmini ${arrives}`) },
  ];

  return (
    <StoreContainer className="pt-10 lg:pt-16">
      <header className="flex flex-col gap-6 border-b border-line pb-10">
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
          <Check className="size-6" />
        </span>
        <div className="flex flex-col gap-3">
          <Eyebrow>
            {c("Order", "Sipariş")} {ORDER.number} · {f.dateTime(ORDER.placedAt, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </Eyebrow>
          <h1 className="max-w-[22ch] font-display text-display-xl text-balance text-fg">{c(`Thank you, ${first}. Your order is confirmed.`, `Teşekkürler ${first}, siparişiniz onaylandı.`)}</h1>
          <p className="max-w-[60ch] text-lead text-fg-muted">
            {c(`A receipt and your e-Archive invoice are on their way to ${ORDER.customer.email}. Expected delivery: ${arrives}.`, `Makbuz ve e-Arşiv faturanız ${ORDER.customer.email} adresine gönderiliyor. Tahmini teslimat: ${arrives}.`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={copy}>
            <Copy aria-hidden />
            {c("Copy order number", "Sipariş numarasını kopyala")}
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <Printer aria-hidden />
            {c("Print receipt", "Makbuzu yazdır")}
          </Button>
        </div>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="oc-status">
            <h2 id="oc-status" className="mb-6 font-display text-[1.6rem] leading-tight text-fg">
              {c("Where your order is", "Siparişiniz nerede")}
            </h2>
            <Stepper value={2} steps={steps} orientation="vertical" loading aria-label={c("Order progress", "Sipariş durumu")} />
          </section>

          <section aria-labelledby="oc-next">
            <h2 id="oc-next" className="mb-6 font-display text-[1.6rem] leading-tight text-fg">
              {c("What happens next", "Sırada ne var")}
            </h2>
            <ol className="grid gap-px overflow-hidden rounded-ui-lg border border-line bg-line md:grid-cols-3">
              {[
                { icon: MessageSquareText, title: c("Tracking by SMS", "SMS ile takip"), body: c("When the parcel leaves İzmir we text the courier’s link to the number you gave us.", "Paket İzmir’den çıkınca kargo takip bağlantısını verdiğiniz numaraya SMS ile göndeririz.") },
                { icon: PackageCheck, title: c("Check it on arrival", "Teslimatta kontrol edin"), body: c("Open the box within 7 days. Anything chipped? Reply to the receipt with a photo and we send a new one.", "Kutuyu 7 gün içinde açın. Kırık bir şey mi var? Makbuza fotoğrafla yanıt verin, yenisini gönderelim.") },
                { icon: UserRound, title: c("Returns in two taps", "İki dokunuşla iade"), body: c("30-day returns, free from any parcel point. An account keeps your orders in one place.", "Herhangi bir kargo noktasından 30 gün ücretsiz iade. Hesap açarsanız siparişleriniz tek yerde durur.") },
              ].map((s, i) => (
                <li key={s.title} className="flex flex-col gap-3 bg-surface p-5">
                  <span className="flex items-center justify-between">
                    <s.icon aria-hidden className="size-5 text-fg-muted" />
                    <span aria-hidden className="font-mono text-[11px] text-fg-subtle tabular">
                      0{i + 1}
                    </span>
                  </span>
                  <h3 className="font-medium text-fg">{s.title}</h3>
                  <p className="text-small text-fg-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="oc-account" className="rounded-ui-lg bg-surface-2 p-5 sm:p-6">
            {account === "done" ? (
              <p role="status" className="flex items-center gap-3 text-fg">
                <Check aria-hidden className="size-5 text-success" />
                {c(`Account created for ${ORDER.customer.email}. This order is already in it.`, `${ORDER.customer.email} için hesap açıldı. Bu sipariş hesabınızda.`)}
              </p>
            ) : (
              <form
                noValidate
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (password.length < 8) return setPwError(c("Use at least 8 characters.", "En az 8 karakter kullanın."));
                  setPwError(null);
                  setAccount("done");
                  toast.success(c("Account created", "Hesap oluşturuldu"));
                }}
              >
                <div>
                  <h2 id="oc-account" className="font-medium text-fg">
                    {c("Save your details for next time", "Bilgilerinizi bir dahaki sefere saklayın")}
                  </h2>
                  <p className="text-small text-fg-muted">{c(`Add a password to ${ORDER.customer.email} — your address and this order carry over.`, `${ORDER.customer.email} için bir şifre belirleyin — adresiniz ve bu sipariş aktarılır.`)}</p>
                </div>
                <Field label={c("Password", "Şifre")} error={pwError} hint={pwError ? undefined : c("At least 8 characters", "En az 8 karakter")}>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="min-w-0 sm:max-w-80 sm:flex-1" />
                    <Button type="submit" variant="secondary">
                      {c("Create account", "Hesap oluştur")}
                    </Button>
                  </div>
                </Field>
              </form>
            )}
          </section>
        </div>

        <aside aria-labelledby="oc-summary" className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface flex flex-col gap-6 rounded-ui-lg p-5 sm:p-6">
            <h2 id="oc-summary" className="font-display text-[1.5rem] leading-tight text-fg">
              {c("Order summary", "Sipariş özeti")}
            </h2>
            <ul aria-label={c("Items in this order", "Bu siparişteki ürünler")} className="flex flex-col gap-4">
              {starterCart.map((l) => {
                const item = itemOf(l);
                return (
                  <li key={l.key} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 text-small">
                    <Image src={photo(item.photo, 160)} width={160} height={200} alt="" aspect="4/5" rounded="ui" sizes="56px" />
                    <span className="min-w-0">
                      <span className="block truncate text-fg">{t(item.name)}</span>
                      <span className="block truncate text-[12px] text-fg-muted">
                        {c(`Qty ${l.qty}`, `${l.qty} adet`)}
                        {item.option ? ` · ${t(item.option)}` : ""}
                      </span>
                    </span>
                    <span className="tabular text-fg">{money(times(item.price, l.qty))}</span>
                  </li>
                );
              })}
            </ul>
            <SummaryRows totals={totals} couponCode={ORDER.coupon.code} shippingLabel={t(method.name)} />
            <dl className="grid gap-4 border-t border-line pt-5 text-small">
              <div>
                <dt className="mb-1 text-fg-muted">{c("Delivering to", "Teslimat adresi")}</dt>
                <dd className="text-fg">
                  <span className="block">{ORDER.customer.name}</span>
                  {formatAddress(ORDER.address, { locale }).map((line) => (
                    <span key={line} className="block text-fg-muted">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-fg-muted">{c("Payment", "Ödeme")}</dt>
                <dd className="text-fg">
                  {ORDER.card.brand} •••• {ORDER.card.last4} · {c(`${ORDER.card.installments} interest-free instalments of ${monthly}`, `${ORDER.card.installments} × ${monthly} faizsiz taksit`)}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-fg-muted">{c("Delivery", "Teslimat")}</dt>
                <dd className="text-fg">
                  {t(method.name)} · {arrives}
                </dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 px-1 text-[12px] text-fg-muted">
            {c("Questions about this order? ", "Bu siparişle ilgili sorunuz mu var? ")}
            <a className="rounded-ui-sm text-fg underline underline-offset-4 focus-ring" href={`mailto:${STORE.email}?subject=${ORDER.number}`}>
              {STORE.email}
            </a>{" "}
            · {STORE.phone}
          </p>
          <Button asChild variant="primary" size="lg" block className="mt-6">
            <a href={storeHref.product}>{c("Continue shopping", "Alışverişe devam et")}</a>
          </Button>
        </aside>
      </div>
    </StoreContainer>
  );
}
