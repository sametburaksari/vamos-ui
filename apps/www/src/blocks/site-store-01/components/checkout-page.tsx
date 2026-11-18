"use client";

import * as React from "react";
import { Alert, Button, Checkbox, Field, Input, Stepper } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import type { OrderBuyer } from "@vamos-ui/react/commerce";
import type { CheckoutOutcome } from "@vamos-ui/react/commerce/cart";
import { Truck } from "lucide-react";
import { CartLineRow, CartTotals, FreeShippingMeter, useStore } from "./store-provider";

const copy = {
  title: { en: "Check out", tr: "Ödeme" },
  stepCart: { en: "Cart", tr: "Sepet" },
  stepDelivery: { en: "Delivery", tr: "Teslimat" },
  stepPayment: { en: "Payment", tr: "Ödeme" },
  steps: { en: "Checkout steps", tr: "Ödeme adımları" },
  contact: { en: "Contact", tr: "İletişim" },
  name: { en: "Full name", tr: "Ad soyad" },
  email: { en: "Email", tr: "E-posta" },
  emailHint: { en: "For the receipt and tracking link.", tr: "Fatura ve kargo takip bağlantısı için." },
  phone: { en: "Phone", tr: "Telefon" },
  address: { en: "Address", tr: "Adres" },
  addressHint: { en: "Street, number, flat", tr: "Sokak, numara, daire" },
  district: { en: "District", tr: "İlçe" },
  city: { en: "City", tr: "Şehir" },
  method: { en: "Delivery", tr: "Teslimat" },
  standard: { en: "Standard parcel", tr: "Standart kargo" },
  standardHint: { en: "2–4 working days, anywhere in Türkiye", tr: "2–4 iş günü, Türkiye’nin her yerine" },
  gift: { en: "This is a gift — leave the price off the slip", tr: "Hediye — fişe fiyat yazılmasın" },
  terms1: { en: "I’ve read and accept the ", tr: "" },
  contract: { en: "distance sales agreement", tr: "mesafeli satış sözleşmesini" },
  and: { en: " and the ", tr: " ve " },
  preinfo: { en: "pre-information form", tr: "ön bilgilendirme formunu" },
  terms2: { en: ".", tr: " okudum, onaylıyorum." },
  summary: { en: "Order summary", tr: "Sipariş özeti" },
  back: { en: "Back to cart", tr: "Sepete dön" },
  toPayment: { en: "Continue to payment", tr: "Ödemeye devam et" },
  redirecting: { en: "Opening the payment page…", tr: "Ödeme sayfası açılıyor…" },
  payNote: { en: "You enter the card on the payment provider’s secure page. Card details never reach this site.", tr: "Kartı ödeme sağlayıcısının güvenli sayfasında girersiniz. Kart bilgileri bu siteye hiç gelmez." },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  fullName: { en: "Enter your first and last name.", tr: "Adınızı ve soyadınızı girin." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  badPhone: { en: "Enter a phone number with the area code.", tr: "Alan koduyla birlikte bir telefon numarası girin." },
  badAddress: { en: "Add the street and building number.", tr: "Sokak ve bina numarasını ekleyin." },
  terms: { en: "Accept the agreement to continue.", tr: "Devam etmek için sözleşmeyi onaylayın." },
  fixErrors: { en: "A few fields need a look before we can continue.", tr: "Devam etmeden önce birkaç alana bakmak gerekiyor." },
  refused: { en: "The shop could not accept the highlighted fields.", tr: "Mağaza işaretli alanları kabul edemedi." },
  cartChanged: { en: "A piece in your cart is sold out or no longer sold. Check the cart and try again.", tr: "Sepetinizdeki bir parça tükendi ya da artık satılmıyor. Sepeti kontrol edip yeniden deneyin." },
  unavailable: { en: "Payments are unavailable right now. Nothing was charged — try again in a few minutes.", tr: "Ödeme şu an alınamıyor. Hiçbir tutar çekilmedi — birkaç dakika sonra yeniden deneyin." },
  network: { en: "We couldn’t reach the shop. Check your connection and try again. Nothing was charged.", tr: "Mağazaya ulaşılamadı. Bağlantınızı kontrol edip yeniden deneyin. Hiçbir tutar çekilmedi." },
  failedTitle: { en: "Your payment didn’t go through", tr: "Ödemeniz tamamlanamadı" },
  failedText: { en: "Nothing was charged and your cart is still here. Try again or use another card.", tr: "Hiçbir tutar çekilmedi, sepetiniz duruyor. Yeniden deneyin ya da başka bir kart kullanın." },
  paidTitle: { en: "Thank you — your order is in", tr: "Teşekkürler — siparişiniz alındı" },
  paidText: { en: "Order {order}. The receipt is on its way to your email; we pack within two working days.", tr: "Sipariş {order}. Makbuz e-postanıza gönderiliyor; iki iş günü içinde paketliyoruz." },
  ready: { en: "Delivery saved", tr: "Teslimat kaydedildi" },
  readyText: { en: "This is a demo shop, so no card is taken. In a real store the payment provider’s form opens here.", tr: "Bu bir demo mağaza; karttan çekim yapılmaz. Gerçek bir mağazada ödeme sağlayıcısının formu burada açılır." },
  edit: { en: "Edit delivery", tr: "Teslimatı düzenle" },
  empty: { en: "Your cart is empty — add a piece or two first.", tr: "Sepetiniz boş — önce bir iki parça ekleyin." },
  shop: { en: "Go to the shop", tr: "Mağazaya git" },
  free: { en: "Free", tr: "Ücretsiz" },
};

type FieldName = "name" | "email" | "phone" | "address" | "district" | "city" | "terms";
type Errors = Partial<Record<FieldName, string>>;

/** Buyer fields the checkout endpoint can refuse (`invalid-buyer`) → the form field they come from. */
const SERVER_FIELD: Record<string, FieldName> = { name: "name", surname: "name", email: "email", phone: "phone", address: "address", district: "district", city: "city" };
const ORDER: FieldName[] = ["name", "email", "phone", "address", "district", "city", "terms"];

/** "Ayla Nur Demir" → name "Ayla Nur", surname "Demir". */
function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { name: parts.slice(0, -1).join(" "), surname: parts.length > 1 ? parts[parts.length - 1]! : "" };
}

/**
 * Checkout, step 2 of 3: delivery details beside the order summary. Continue posts the kit cart
 * and the buyer to /api/checkout and the buyer goes to the payment page; the payment page sends
 * them back here with `?order=` (paid: the cart is emptied) or `?payment=failed`. In the demo the
 * step only confirms the details.
 */
export function CheckoutPage() {
  const { t, fmt, lines, cart, demo, locale } = useStore();
  const [step, setStep] = React.useState(1);
  const [errors, setErrors] = React.useState<Errors>({});
  const [failure, setFailure] = React.useState<string | null>(null);
  const [returned, setReturned] = React.useState<{ paid: string } | { failed: true } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const shipping = cart.quote?.shipping ?? 0;
  const price = (n: number) => (n === 0 ? t(copy.free) : fmt(n));

  // Back from the payment page.
  React.useEffect(() => {
    if (demo) return;
    const q = new URLSearchParams(window.location.search);
    const order = q.get("order")?.trim().slice(0, 40);
    if (q.get("payment") === "failed") setReturned({ failed: true });
    else if (order) setReturned({ paid: order });
  }, [demo]);
  // Paid: empty the cart once the saved cart has been read.
  const cleared = React.useRef(false);
  React.useEffect(() => {
    if (returned && "paid" in returned && cart.ready && !cleared.current) {
      cleared.current = true;
      cart.clear();
    }
  }, [returned, cart]);

  const focus = (e: Errors) => {
    const first = ORDER.find((k) => e[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFailure(null);
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    for (const k of ["name", "email", "phone", "address", "district", "city"] as const) if (!v(k)) next[k] = t(copy.required);
    if (v("name") && !splitName(v("name")).surname) next.name = t(copy.fullName);
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(copy.badEmail);
    const digits = v("phone").replace(/\D/g, "");
    if (v("phone") && (digits.length < 10 || digits.length > 15)) next.phone = t(copy.badPhone);
    if (v("address") && v("address").length < 8) next.address = t(copy.badAddress);
    if (!data.get("terms")) next.terms = t(copy.terms);
    setErrors(next);
    if (Object.keys(next).length) return focus(next);
    if (demo) return setStep(2);

    const buyer: OrderBuyer = { ...splitName(v("name")), email: v("email"), phone: v("phone"), address: v("address"), district: v("district"), city: v("city"), country: "Turkey" };
    setBusy(true);
    const res = await cart.checkout({ buyer, locale, ...(data.get("gift") ? { note: "Gift: leave the price off the slip." } : {}) });
    if (res.ok) return; // the kit cart is sending the browser to the payment page (stays busy)
    setBusy(false);
    setFailure(failureText(res));
    if (res.error === "invalid-buyer") {
      const refused: Errors = {};
      for (const f of res.fields) if (SERVER_FIELD[f]) refused[SERVER_FIELD[f]] = t(copy.refused);
      setErrors(refused);
      focus(refused);
    }
  };

  const failureText = (res: Exclude<CheckoutOutcome, { ok: true }>) =>
    t(res.error === "invalid-buyer" ? copy.refused : res.error === "invalid-cart" ? copy.cartChanged : res.error === "payment-unavailable" ? copy.unavailable : copy.network);

  if (returned && "paid" in returned) {
    return (
      <Section theme={{ rhythm: "tight" }} aria-labelledby="checkout-title">
        <Container>
          <div className="flex max-w-2xl flex-col items-start gap-5">
            <h1 id="checkout-title" className="font-display text-display-l text-fg">
              {t(copy.paidTitle)}
            </h1>
            <p className="text-lead text-fg-muted">{t(copy.paidText).replace("{order}", returned.paid)}</p>
            <Button asChild variant="primary">
              <a href={sitePageHref("shop")}>{t(copy.shop)}</a>
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section theme={{ rhythm: "tight" }} aria-labelledby="checkout-title">
      <Container>
        <div className="mb-10 flex flex-col gap-6 border-b border-line pb-8">
          <h1 id="checkout-title" className="font-display text-display-l text-fg">
            {t(copy.title)}
          </h1>
          <Stepper
            aria-label={t(copy.steps)}
            value={step}
            onValueChange={(i) => (i === 0 ? null : setStep(i))}
            navigable="completed"
            size="sm"
            steps={[{ id: "cart", title: t(copy.stepCart) }, { id: "delivery", title: t(copy.stepDelivery) }, { id: "payment", title: t(copy.stepPayment) }]}
            className="max-w-2xl"
          />
        </div>

        {returned && "failed" in returned ? (
          <Alert tone="danger" live="assertive" className="mb-8" title={t(copy.failedTitle)}>
            {t(copy.failedText)}
          </Alert>
        ) : null}

        {cart.ready && lines.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-fg-muted">{t(copy.empty)}</p>
            <Button asChild variant="primary">
              <a href={sitePageHref("shop")}>{t(copy.shop)}</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-12 @4xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @4xl:gap-16">
            {step === 2 ? (
              <div className="flex flex-col items-start gap-5" role="status">
                <Alert tone="success" title={t(copy.ready)}>
                  {t(copy.readyText)}
                </Alert>
                <Button variant="secondary" onClick={() => setStep(1)}>
                  {t(copy.edit)}
                </Button>
              </div>
            ) : (
              <form ref={formRef} noValidate onSubmit={submit} aria-busy={busy || undefined} className="flex flex-col gap-8">
                {Object.keys(errors).length && !failure ? <Alert tone="danger">{t(copy.fixErrors)}</Alert> : null}
                <fieldset className="grid gap-4 @xl:grid-cols-2">
                  <legend className="mb-4 font-display text-h3 text-fg">{t(copy.contact)}</legend>
                  <Field label={t(copy.name)} required error={errors.name} className="@xl:col-span-2">
                    <Input name="name" autoComplete="name" defaultValue={demo ? "Ayla Demir" : undefined} />
                  </Field>
                  <Field label={t(copy.email)} required hint={t(copy.emailHint)} error={errors.email}>
                    <Input name="email" type="email" autoComplete="email" placeholder="ayla@example.com" />
                  </Field>
                  <Field label={t(copy.phone)} required error={errors.phone}>
                    <Input name="phone" type="tel" autoComplete="tel" placeholder="+90 216 000 00 00" />
                  </Field>
                </fieldset>

                <fieldset className="flex flex-col gap-4">
                  <legend className="mb-4 font-display text-h3 text-fg">{t(copy.method)}</legend>
                  <div className="flex items-start gap-3 rounded-ui border border-line p-4">
                    <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                    <p className="min-w-0 flex-1 text-small text-fg-muted">
                      <span className="flex justify-between gap-4 text-body text-fg">
                        <span>{t(copy.standard)}</span>
                        <span className="tabular">{price(shipping)}</span>
                      </span>
                      {t(copy.standardHint)}
                    </p>
                  </div>
                </fieldset>

                <fieldset className="grid gap-4 @xl:grid-cols-2">
                  <legend className="mb-4 font-display text-h3 text-fg">{t(copy.address)}</legend>
                  <Field label={t(copy.address)} hint={t(copy.addressHint)} required error={errors.address} className="@xl:col-span-2">
                    <Input name="address" autoComplete="street-address" />
                  </Field>
                  <Field label={t(copy.district)} required error={errors.district}>
                    <Input name="district" autoComplete="address-level2" />
                  </Field>
                  <Field label={t(copy.city)} required error={errors.city}>
                    <Input name="city" autoComplete="address-level1" defaultValue="İstanbul" />
                  </Field>
                </fieldset>

                <div className="flex flex-col gap-3">
                  <Checkbox name="gift" label={t(copy.gift)} />
                  <Field error={errors.terms}>
                    <Checkbox
                      name="terms"
                      label={
                        <span>
                          {t(copy.terms1)}
                          <a href="#" className="rounded-ui-sm underline underline-offset-4 focus-ring">{t(copy.contract)}</a>
                          {t(copy.and)}
                          <a href="#" className="rounded-ui-sm underline underline-offset-4 focus-ring">{t(copy.preinfo)}</a>
                          {t(copy.terms2)}
                        </span>
                      }
                    />
                  </Field>
                </div>

                {failure ? (
                  <Alert tone="danger" live="assertive">
                    {failure}
                  </Alert>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-line pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="ghost" asChild>
                      <a href="#cart">{t(copy.back)}</a>
                    </Button>
                    <Button type="submit" variant="primary" size="lg" loading={busy} disabled={!cart.ready || lines.length === 0}>
                      {busy ? t(copy.redirecting) : t(copy.toPayment)}
                    </Button>
                  </div>
                  <p className="text-[12px] text-fg-subtle">{t(copy.payNote)}</p>
                </div>
              </form>
            )}

            <aside aria-labelledby="summary-title" className="surface flex flex-col gap-5 self-start rounded-ui-lg p-6 @4xl:sticky @4xl:top-24">
              <h2 id="summary-title" className="font-display text-h3 text-fg">
                {t(copy.summary)}
              </h2>
              <FreeShippingMeter />
              <ul>
                {lines.map((l) => (
                  <CartLineRow key={`${l.productId}:${l.variantId ?? ""}`} line={l} compact />
                ))}
              </ul>
              <CartTotals />
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
