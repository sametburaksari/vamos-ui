"use client";

import * as React from "react";
import { Alert, Button, Field, formatAddress, Image, Input, Stepper, toast, useLocale, type Address } from "@vamos-ui/react";
import { priceCart, type Quote } from "@vamos-ui/react/commerce";
import { Check, Copy, MessageSquareText, PackageCheck, Printer, UserRound } from "lucide-react";
import { customers } from "../../_shared/orders";
import { NOW } from "../../_shared/time";
import { businessDay, catalog, delivery, itemOf, photo, starterLines, STORE } from "../../product-01/components/catalogue";
import { readOrderSummary, useShop, useStoreCart, type Totals } from "../../product-01/components/cart-store";
import { Eyebrow, storeHref, StoreContainer, SummaryRows } from "../../product-01/components/storefront";

/** What the page shows about one order. Only `number` is certain: the rest comes from this tab. */
interface OrderView {
  number: string;
  placedAt?: string;
  firstName?: string;
  name?: string;
  email?: string;
  address?: Address;
  quote: Quote | null;
  /** Card and instalments, when known (the demo; the payment provider's receipt has them). */
  payment?: { brand: string; last4: string; installments: number };
}

/** The demo order: the starter cart, standard delivery, card in 3 instalments. */
function demoOrder(): OrderView {
  const customer = customers[0]!;
  const priced = priceCart(catalog, starterLines);
  return {
    number: "KL-30418",
    placedAt: NOW,
    firstName: customer.name.split(" ")[0],
    name: customer.name,
    email: customer.email,
    address: { country: "TR", region1: "İstanbul", region2: "Kadıköy", line1: "Caferağa Mah. Moda Cad. No: 00 D: 4", postalCode: "34710" },
    quote: priced.ok ? priced.quote : null,
    payment: { brand: "Visa", last4: "4242", installments: 3 },
  };
}

const totalsOf = (q: Quote): Totals => ({ count: q.lines.reduce((n, l) => n + l.qty, 0), subtotal: q.subtotal, shipping: q.shipping, total: q.total, vat: q.vat, toFreeShipping: 0 });

type PageState = { kind: "loading" } | { kind: "order"; view: OrderView } | { kind: "failed" } | { kind: "none" };

/**
 * Reads where the payment page sent the buyer: `?order=<id>` after a paid order (the cart is
 * emptied and the summary the checkout page kept in this tab is shown), `?payment=failed` when it
 * did not go through. `demo` shows a sample order instead.
 */
function useOrderPage(demo: boolean): PageState {
  const cart = useStoreCart();
  const [state, setState] = React.useState<PageState>(() => (demo ? { kind: "order", view: demoOrder() } : { kind: "loading" }));
  React.useEffect(() => {
    if (demo) return;
    const q = new URLSearchParams(window.location.search);
    const order = q.get("order")?.trim().slice(0, 40);
    if (q.get("payment") === "failed") return setState({ kind: "failed" });
    if (!order) return setState({ kind: "none" });
    const saved = readOrderSummary(order);
    setState({ kind: "order", view: saved ? { number: order, ...saved } : { number: order, quote: null } });
  }, [demo]);
  // The order is paid: empty the cart once (after the saved cart was read, so it is not restored).
  const cleared = React.useRef(false);
  const { ready, clear } = cart.kit;
  React.useEffect(() => {
    if (state.kind === "order" && !demo && ready && !cleared.current) {
      cleared.current = true;
      clear();
    }
  }, [state.kind, demo, ready, clear]);
  return state;
}

/** Thank-you page: order number, where the order is now, summary, delivery / payment, next steps. */
export function ThankYou({ demo = false }: { demo?: boolean }) {
  const { c } = useShop();
  const state = useOrderPage(demo);
  if (state.kind === "loading") return <StoreContainer className="pt-10 lg:pt-16" aria-busy="true"><div className="h-72 animate-pulse rounded-ui-lg bg-surface-2" /></StoreContainer>;
  if (state.kind === "order") return <Confirmed order={state.view} />;
  const failed = state.kind === "failed";
  return (
    <StoreContainer className="max-w-[46rem] pt-12 lg:pt-20">
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-display-l text-balance text-fg">{failed ? c("Your payment didn’t go through", "Ödemeniz tamamlanamadı") : c("No order to show", "Gösterilecek sipariş yok")}</h1>
        {failed ? (
          <Alert tone="danger" live="assertive" title={c("Nothing was charged", "Hiçbir tutar çekilmedi")}>
            {c("Your cart is still saved. Go back to checkout and try again, or use another card.", "Sepetiniz kayıtlı. Ödemeye dönüp yeniden deneyin ya da başka bir kart kullanın.")}
          </Alert>
        ) : (
          <p className="text-lead text-fg-muted">{c("This page shows your order right after payment. Your receipt email has the order number.", "Bu sayfa siparişinizi ödemeden hemen sonra gösterir. Sipariş numarası makbuz e-postanızda.")}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <a href={failed ? storeHref.checkout : storeHref.product}>{failed ? c("Back to checkout", "Ödemeye dön") : c("Continue shopping", "Alışverişe devam et")}</a>
          </Button>
        </div>
      </div>
    </StoreContainer>
  );
}

function Confirmed({ order: ORDER }: { order: OrderView }) {
  const { c, t, f, money } = useShop();
  const { locale } = useLocale();
  const [account, setAccount] = React.useState<"idle" | "done">("idle");
  const [password, setPassword] = React.useState("");
  const [pwError, setPwError] = React.useState<string | null>(null);
  const totals = ORDER.quote ? totalsOf(ORDER.quote) : null;
  const first = ORDER.firstName;
  const arrives = f.dateRange(businessDay(delivery.days[0]), businessDay(delivery.days[1]), { weekday: "short", day: "numeric", month: "short" });
  const monthly = totals && ORDER.payment ? money(Math.round(totals.total / ORDER.payment.installments)) : null;
  const time = (iso: string) => f.dateTime(iso, { hour: "2-digit", minute: "2-digit" });
  const placed = ORDER.placedAt ? `${c("Today", "Bugün")}, ${time(ORDER.placedAt)}` : undefined;

  const copy = () => {
    void navigator.clipboard?.writeText(ORDER.number).catch(() => {});
    toast.success(c(`Order number ${ORDER.number} copied`, `Sipariş numarası ${ORDER.number} kopyalandı`));
  };

  const steps = [
    { id: "placed", title: c("Order placed", "Sipariş alındı"), description: placed },
    { id: "paid", title: c("Payment confirmed", "Ödeme onaylandı"), description: ORDER.payment ? `${ORDER.payment.brand} •••• ${ORDER.payment.last4}` : c("Card, 3-D Secure", "Kart, 3D Secure") },
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
            {c("Order", "Sipariş")} {ORDER.number}
            {ORDER.placedAt ? ` · ${f.dateTime(ORDER.placedAt, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}` : null}
          </Eyebrow>
          <h1 className="max-w-[22ch] font-display text-display-xl text-balance text-fg">{first ? c(`Thank you, ${first}. Your order is confirmed.`, `Teşekkürler ${first}, siparişiniz onaylandı.`) : c("Thank you. Your order is confirmed.", "Teşekkürler, siparişiniz onaylandı.")}</h1>
          <p className="max-w-[60ch] text-lead text-fg-muted">
            {ORDER.email
              ? c(`A receipt and your e-Archive invoice are on their way to ${ORDER.email}. Expected delivery: ${arrives}.`, `Makbuz ve e-Arşiv faturanız ${ORDER.email} adresine gönderiliyor. Tahmini teslimat: ${arrives}.`)
              : c(`A receipt and your e-Archive invoice are on their way to your email. Expected delivery: ${arrives}.`, `Makbuz ve e-Arşiv faturanız e-posta adresinize gönderiliyor. Tahmini teslimat: ${arrives}.`)}
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

          {ORDER.email ? (
          <section aria-labelledby="oc-account" className="rounded-ui-lg bg-surface-2 p-5 sm:p-6">
            {account === "done" ? (
              <p role="status" className="flex items-center gap-3 text-fg">
                <Check aria-hidden className="size-5 text-success" />
                {c(`Account created for ${ORDER.email}. This order is already in it.`, `${ORDER.email} için hesap açıldı. Bu sipariş hesabınızda.`)}
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
                  <p className="text-small text-fg-muted">{c(`Add a password to ${ORDER.email} — your address and this order carry over.`, `${ORDER.email} için bir şifre belirleyin — adresiniz ve bu sipariş aktarılır.`)}</p>
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
          ) : null}
        </div>

        <aside aria-labelledby="oc-summary" className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface flex flex-col gap-6 rounded-ui-lg p-5 sm:p-6">
            <h2 id="oc-summary" className="font-display text-[1.5rem] leading-tight text-fg">
              {c("Order summary", "Sipariş özeti")}
            </h2>
            {ORDER.quote && totals ? (
              <>
                <ul aria-label={c("Items in this order", "Bu siparişteki ürünler")} className="flex flex-col gap-4">
                  {ORDER.quote.lines.map((l) => {
                    const item = itemOf(l);
                    return (
                      <li key={`${l.productId}:${l.variantId ?? ""}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 text-small">
                        {item ? <Image src={photo(item.photo, 160)} width={160} height={200} alt="" aspect="4/5" rounded="ui" sizes="56px" /> : <span aria-hidden className="aspect-[4/5] rounded-ui bg-surface-2" />}
                        <span className="min-w-0">
                          <span className="block truncate text-fg">{item ? t(item.name) : l.name}</span>
                          <span className="block truncate text-[12px] text-fg-muted">
                            {c(`Qty ${l.qty}`, `${l.qty} adet`)}
                            {item?.option ? ` · ${t(item.option)}` : ""}
                          </span>
                        </span>
                        <span className="tabular text-fg">{money(l.total)}</span>
                      </li>
                    );
                  })}
                </ul>
                <SummaryRows totals={totals} shippingLabel={t(delivery.name)} />
              </>
            ) : (
              <p className="text-small text-fg-muted">{c("The full summary is in your receipt email.", "Tam özet makbuz e-postanızda.")}</p>
            )}
            <dl className="grid gap-4 border-t border-line pt-5 text-small">
              {ORDER.address ? (
                <div>
                  <dt className="mb-1 text-fg-muted">{c("Delivering to", "Teslimat adresi")}</dt>
                  <dd className="text-fg">
                    {ORDER.name ? <span className="block">{ORDER.name}</span> : null}
                    {formatAddress(ORDER.address, { locale }).map((line) => (
                      <span key={line} className="block text-fg-muted">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="mb-1 text-fg-muted">{c("Payment", "Ödeme")}</dt>
                <dd className="text-fg">
                  {ORDER.payment
                    ? `${ORDER.payment.brand} •••• ${ORDER.payment.last4}${monthly ? ` · ${c(`${ORDER.payment.installments} interest-free instalments of ${monthly}`, `${ORDER.payment.installments} × ${monthly} faizsiz taksit`)}` : ""}`
                    : c("Card, paid on the payment provider’s page", "Kart, ödeme sağlayıcısının sayfasında ödendi")}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-fg-muted">{c("Delivery", "Teslimat")}</dt>
                <dd className="text-fg">
                  {t(delivery.name)} · {arrives}
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
