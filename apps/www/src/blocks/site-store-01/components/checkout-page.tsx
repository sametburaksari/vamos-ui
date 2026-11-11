"use client";

import * as React from "react";
import { Alert, Button, Checkbox, Field, Input, RadioGroup, Stepper } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { COURIER, FREE_SHIPPING, SHIPPING } from "./content";
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
  method: { en: "Delivery method", tr: "Teslimat yöntemi" },
  standard: { en: "Standard parcel", tr: "Standart kargo" },
  standardHint: { en: "2–4 working days, anywhere in Türkiye", tr: "2–4 iş günü, Türkiye’nin her yerine" },
  courier: { en: "Same-day courier", tr: "Aynı gün kurye" },
  courierHint: { en: "Istanbul only, order before 13:00", tr: "Yalnızca İstanbul, 13:00’e kadar sipariş" },
  pickup: { en: "Pick up at the studio", tr: "Atölyeden teslim al" },
  pickupHint: { en: "Fırın Sokak 12, Kuzguncuk · Tue–Sat 11:00–18:00", tr: "Fırın Sokak 12, Kuzguncuk · Salı–Cumartesi 11:00–18:00" },
  gift: { en: "This is a gift — leave the price off the slip", tr: "Hediye — fişe fiyat yazılmasın" },
  summary: { en: "Order summary", tr: "Sipariş özeti" },
  back: { en: "Back to cart", tr: "Sepete dön" },
  toPayment: { en: "Continue to payment", tr: "Ödemeye devam et" },
  required: { en: "Please fill this in.", tr: "Lütfen doldurun." },
  badEmail: { en: "Enter an email like name@example.com.", tr: "ad@example.com gibi bir e-posta girin." },
  fixErrors: { en: "A few fields need a look before we can continue.", tr: "Devam etmeden önce birkaç alana bakmak gerekiyor." },
  ready: { en: "Delivery saved", tr: "Teslimat kaydedildi" },
  readyText: { en: "This is a demo shop, so no card is taken. In a real store the payment provider’s form opens here.", tr: "Bu bir demo mağaza; karttan çekim yapılmaz. Gerçek bir mağazada ödeme sağlayıcısının formu burada açılır." },
  edit: { en: "Edit delivery", tr: "Teslimatı düzenle" },
  empty: { en: "Your cart is empty — add a piece or two first.", tr: "Sepetiniz boş — önce bir iki parça ekleyin." },
  shop: { en: "Go to the shop", tr: "Mağazaya git" },
  free: { en: "Free", tr: "Ücretsiz" },
};

type Method = "standard" | "courier" | "pickup";
type Errors = Partial<Record<"name" | "email" | "phone" | "address" | "district", string>>;

/** Checkout, step 2 of 3: delivery details + method beside the order summary. */
export function CheckoutPage() {
  const { t, fmt, lines, subtotal, currency, locale } = useStore();
  const [step, setStep] = React.useState(1);
  const [method, setMethod] = React.useState<Method>("standard");
  const [errors, setErrors] = React.useState<Errors>({});
  const formRef = React.useRef<HTMLFormElement>(null);
  const free = subtotal >= FREE_SHIPPING[currency];
  const cost = method === "pickup" ? 0 : method === "courier" ? COURIER[currency] : free ? 0 : SHIPPING[currency];
  const price = (n: number) => (n === 0 ? t(copy.free) : fmt(n));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const v = (k: string) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    for (const k of ["name", "email", "phone"] as const) if (!v(k)) next[k] = t(copy.required);
    if (v("email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email"))) next.email = t(copy.badEmail);
    if (method !== "pickup") for (const k of ["address", "district"] as const) if (!v(k)) next[k] = t(copy.required);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setStep(2);
  };

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

        {lines.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-fg-muted">{t(copy.empty)}</p>
            <Button asChild variant="primary">
              <a href={sitePageHref("shop")}>{t(copy.shop)}</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-12 @4xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @4xl:gap-16">
            {step === 1 ? (
              <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-8">
                {Object.keys(errors).length ? <Alert tone="danger">{t(copy.fixErrors)}</Alert> : null}
                <fieldset className="grid gap-4 @xl:grid-cols-2">
                  <legend className="mb-4 font-display text-h3 text-fg">{t(copy.contact)}</legend>
                  <Field label={t(copy.name)} required error={errors.name} className="@xl:col-span-2">
                    <Input name="name" autoComplete="name" defaultValue="Ayla Demir" />
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
                  <RadioGroup
                    aria-label={t(copy.method)}
                    variant="card"
                    value={method}
                    onValueChange={(v) => setMethod(v as Method)}
                    items={[
                      { value: "standard", label: <span className="flex justify-between gap-4"><span>{t(copy.standard)}</span><span className="tabular">{price(free ? 0 : SHIPPING[currency])}</span></span>, description: t(copy.standardHint) },
                      { value: "courier", label: <span className="flex justify-between gap-4"><span>{t(copy.courier)}</span><span className="tabular">{price(COURIER[currency])}</span></span>, description: t(copy.courierHint) },
                      { value: "pickup", label: <span className="flex justify-between gap-4"><span>{t(copy.pickup)}</span><span className="tabular">{price(0)}</span></span>, description: t(copy.pickupHint) },
                    ]}
                  />
                </fieldset>

                {method !== "pickup" ? (
                  <fieldset className="grid gap-4 @xl:grid-cols-2">
                    <legend className="mb-4 font-display text-h3 text-fg">{t(copy.address)}</legend>
                    <Field label={t(copy.address)} hint={t(copy.addressHint)} required error={errors.address} className="@xl:col-span-2">
                      <Input name="address" autoComplete="street-address" />
                    </Field>
                    <Field label={t(copy.district)} required error={errors.district}>
                      <Input name="district" autoComplete="address-level2" />
                    </Field>
                    <Field label={t(copy.city)}>
                      <Input name="city" autoComplete="address-level1" defaultValue="İstanbul" />
                    </Field>
                  </fieldset>
                ) : null}

                <Checkbox name="gift" label={t(copy.gift)} />

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
                  <Button variant="ghost" asChild>
                    <a href="#cart">{t(copy.back)}</a>
                  </Button>
                  <Button type="submit" variant="primary" size="lg">
                    {t(copy.toPayment)}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-start gap-5" role="status">
                <Alert tone="success" title={t(copy.ready)}>
                  {t(copy.readyText)}
                </Alert>
                <Button variant="secondary" onClick={() => setStep(1)}>
                  {t(copy.edit)}
                </Button>
              </div>
            )}

            <aside aria-labelledby="summary-title" className="surface flex flex-col gap-5 self-start rounded-ui-lg p-6 @4xl:sticky @4xl:top-24">
              <h2 id="summary-title" className="font-display text-h3 text-fg">
                {t(copy.summary)}
              </h2>
              <FreeShippingMeter />
              <ul>
                {lines.map((l) => (
                  <CartLineRow key={`${l.productId}:${l.glazeId}`} line={l} compact />
                ))}
              </ul>
              <CartTotals shippingCost={cost} />
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
