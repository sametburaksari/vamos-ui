"use client";

import * as React from "react";
import { AddressField, Alert, Button, Checkbox, cn, Field, formatAddress, Image, Input, PhoneInput, RadioGroup, RadioGroupItem, TaxIdInput, toast, useLocale, type Address } from "@vamos-ui/react";
import type { OrderBuyer } from "@vamos-ui/react/commerce";
import type { CheckoutOutcome } from "@vamos-ui/react/commerce/cart";
import { Building2, Check, ChevronDown, CreditCard, Lock, Truck } from "lucide-react";
import { businessDay, delivery, photo } from "../../product-01/components/catalogue";
import { saveOrderSummary, useShop, useStoreCart } from "../../product-01/components/cart-store";
import { Eyebrow, storeHref, StoreContainer, SummaryRows } from "../../product-01/components/storefront";

interface CheckoutForm {
  email: string;
  phone: string;
  phoneValid: boolean;
  news: boolean;
  firstName: string;
  lastName: string;
  ship: Address;
  invoice: "individual" | "company";
  company: string;
  taxId: string;
  taxIdValid: boolean;
  taxOffice: string;
  terms: boolean;
}

const initial: CheckoutForm = {
  email: "",
  phone: "",
  phoneValid: false,
  news: false,
  firstName: "",
  lastName: "",
  ship: { country: "TR" },
  invoice: "individual",
  company: "",
  taxId: "",
  taxIdValid: false,
  taxOffice: "",
  terms: false,
};

/** Error keys in on-page order; the first one gets focus on submit. Each maps to a control selector. */
const FIELD_ORDER: Array<[string, string]> = [
  ["email", "#co-email"],
  ["phone", "#co-phone"],
  ["firstName", "#co-first"],
  ["lastName", "#co-last"],
  ["ship.region1", "[name='ship[region1]']"],
  ["ship.region2", "[name='ship[region2]']"],
  ["ship.line1", "[name='ship[line1]']"],
  ["ship.postalCode", "[name='ship[postalCode]']"],
  ["company", "#co-company"],
  ["taxId", "#co-taxid"],
  ["taxOffice", "#co-taxoffice"],
  ["terms", "#co-terms"],
];

/** Buyer fields the checkout endpoint can refuse (`invalid-buyer`) → the form field they come from. */
const SERVER_FIELD: Record<string, string> = {
  name: "firstName",
  surname: "lastName",
  email: "email",
  phone: "phone",
  address: "ship.line1",
  city: "ship.region1",
  district: "ship.region2",
  zipCode: "ship.postalCode",
};

type C = (en: string, tr: string) => string;

const messages = (c: C) => ({
  email: c("Enter an email like name@example.com.", "ad@example.com gibi bir e-posta girin."),
  phone: c("Enter a mobile number the courier can call.", "Kuryenin arayabileceği bir cep telefonu girin."),
  firstName: c("Enter your first name.", "Adınızı girin."),
  lastName: c("Enter your last name.", "Soyadınızı girin."),
  "ship.region1": c("Choose a province.", "Bir il seçin."),
  "ship.region2": c("Choose a district.", "Bir ilçe seçin."),
  "ship.line1": c("Enter the street and building number.", "Cadde / sokak ve bina numarasını girin."),
  "ship.postalCode": c("Postal codes in Türkiye have 5 digits.", "Türkiye’de posta kodu 5 hanelidir."),
  company: c("Enter the company’s registered name.", "Şirketin ticari unvanını girin."),
  taxId: c("Enter a valid 10-digit tax number.", "Geçerli, 10 haneli bir vergi numarası girin."),
  taxOffice: c("Enter the tax office.", "Vergi dairesini girin."),
  terms: c("Accept the distance sales agreement to place the order.", "Siparişi vermek için mesafeli satış sözleşmesini onaylayın."),
});

/** The street part the order carries: neighbourhood, street and building, flat. */
const streetOf = (a: Address) => [a.region3, a.line1, a.line2].map((x) => x?.trim()).filter(Boolean).join(", ");

function validate(f: CheckoutForm, c: C): Record<string, string> {
  const m = messages(c);
  const e: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = m.email;
  if (!f.phone || !f.phoneValid) e.phone = m.phone;
  if (!f.firstName.trim()) e.firstName = m.firstName;
  if (!f.lastName.trim()) e.lastName = m.lastName;
  if (!f.ship.region1) e["ship.region1"] = m["ship.region1"];
  if (!f.ship.region2) e["ship.region2"] = m["ship.region2"];
  // The endpoint wants at least 8 characters for a delivery address.
  if (!f.ship.line1?.trim() || streetOf(f.ship).length < 8) e["ship.line1"] = m["ship.line1"];
  if (f.ship.postalCode && !/^\d{5}$/.test(f.ship.postalCode)) e["ship.postalCode"] = m["ship.postalCode"];
  if (f.invoice === "company") {
    if (!f.company.trim()) e.company = m.company;
    if (!f.taxId || !f.taxIdValid) e.taxId = m.taxId;
    if (!f.taxOffice.trim()) e.taxOffice = m.taxOffice;
  }
  if (!f.terms) e.terms = m.terms;
  return e;
}

function toBuyer(f: CheckoutForm): OrderBuyer {
  return {
    name: f.firstName.trim(),
    surname: f.lastName.trim(),
    email: f.email.trim(),
    phone: f.phone,
    address: streetOf(f.ship),
    city: f.ship.region1 ?? "",
    district: f.ship.region2,
    zipCode: f.ship.postalCode || undefined,
    country: "Turkey",
    ...(f.invoice === "company" ? { company: { name: f.company.trim(), taxOffice: f.taxOffice.trim(), taxNumber: f.taxId } } : {}),
  };
}

type Failure = { title: string; body: string; fixCart?: boolean };

/** Why a checkout failed, in words the buyer can act on. */
function failureOf(res: Exclude<CheckoutOutcome, { ok: true }>, c: C): Failure {
  switch (res.error) {
    case "invalid-buyer":
      return { title: c("Check the highlighted fields", "İşaretli alanları kontrol edin"), body: c("The store could not accept some of your details.", "Mağaza bazı bilgilerinizi kabul edemedi.") };
    case "invalid-cart":
      return { title: c("Your cart changed", "Sepetiniz değişti"), body: c("An item is sold out or no longer sold. Edit the cart, then place the order again.", "Bir ürün tükendi ya da artık satılmıyor. Sepeti düzenleyip siparişi yeniden verin."), fixCart: true };
    case "payment-unavailable":
      return { title: c("Payments are unavailable right now", "Ödeme şu an alınamıyor"), body: c("Nothing was charged. Try again in a few minutes.", "Hiçbir tutar çekilmedi. Birkaç dakika sonra yeniden deneyin.") };
    case "too-large":
      return { title: c("This order is too large to place online", "Bu sipariş internetten verilemeyecek kadar büyük"), body: c("Split it into two orders, or write to us and we’ll send a payment link.", "İki siparişe bölün ya da bize yazın, ödeme bağlantısı gönderelim.") };
    default:
      return { title: c("We couldn’t reach the store", "Mağazaya ulaşılamadı"), body: c("Check your connection and try again. Nothing was charged.", "Bağlantınızı kontrol edip yeniden deneyin. Hiçbir tutar çekilmedi.") };
  }
}

function Step({ n, title, id, children, aside }: { n: number; title: string; id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line pt-7 first:border-t-0 first:pt-0">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={id} className="flex items-baseline gap-3 font-display text-[1.5rem] leading-tight text-fg">
          <span aria-hidden className="font-mono text-[12px] tracking-[0.08em] text-fg-subtle tabular">
            {String(n).padStart(2, "0")}
          </span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/**
 * One-page checkout. "Place order" validates, then `cart.checkout()` posts the cart and buyer to
 * /api/checkout and the buyer goes to the payment provider's page to enter the card; a failed
 * payment comes back here with `?payment=failed`. `demo` skips the request and shows a simulated
 * confirmation (the docs preview has no checkout endpoint).
 */
export function CheckoutPage({ demo = false }: { demo?: boolean }) {
  const { c, t, f: fmt, money, lang } = useShop();
  const { locale } = useLocale();
  const cart = useStoreCart();
  const [form, setForm] = React.useState<CheckoutForm>(initial);
  const [touched, setTouched] = React.useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<Record<string, string>>({});
  const [failure, setFailure] = React.useState<Failure | null>(null);
  const [paymentFailed, setPaymentFailed] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "placing" | "redirecting" | "done">("idle");
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);
  const failureRef = React.useRef<HTMLDivElement>(null);

  const set = (patch: Partial<CheckoutForm>) => {
    setForm((p) => ({ ...p, ...patch }));
    // A server error stays until the field it is about changes.
    setServerErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => !(k.split(".")[0]! in patch))));
  };
  const touch = (k: string) => setTouched((p) => (p.has(k) ? p : new Set(p).add(k)));

  const { totals } = cart;
  const all = validate(form, c);
  const err = (k: string) => serverErrors[k] ?? (submitted || touched.has(k) ? all[k] : undefined);
  const addrErr = { region1: err("ship.region1"), region2: err("ship.region2"), line1: err("ship.line1"), postalCode: err("ship.postalCode") };
  const eta = fmt.dateRange(businessDay(delivery.days[0]), businessDay(delivery.days[1]), { weekday: "short", day: "numeric", month: "short" });
  const live = cart.rows.filter((l) => !l.removed);

  // The payment page sends a failed or cancelled payment back here with ?payment=failed.
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("payment") === "failed") setPaymentFailed(true);
  }, []);

  React.useEffect(() => {
    if (status === "done") {
      doneRef.current?.focus();
      window.scrollTo({ top: 0 });
    }
  }, [status]);

  React.useEffect(() => {
    if (failure) failureRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [failure]);

  const focusFirst = (errors: Record<string, string>) => {
    const first = FIELD_ORDER.find(([k]) => errors[k]);
    const el = first ? formRef.current?.querySelector<HTMLElement>(first[1]) : null;
    el?.focus();
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFailure(null);
    const keys = Object.keys(all);
    if (keys.length) {
      focusFirst(all);
      toast.danger(c(`Check ${keys.length} ${keys.length === 1 ? "field" : "fields"} before placing the order`, `Siparişi vermeden önce ${keys.length} alanı kontrol edin`));
      return;
    }
    if (cart.issues.length || !cart.kit.quote) {
      setFailure(failureOf({ ok: false, error: "invalid-cart", issues: cart.issues }, c));
      return;
    }
    setStatus("placing");
    if (demo) {
      window.setTimeout(() => setStatus("done"), 1100);
      return;
    }
    const quote = cart.kit.quote;
    const res = await cart.kit.checkout({ buyer: toBuyer(form), locale: lang, ...(form.news ? { note: "Wants an email when a new firing comes out of the kiln." } : {}) });
    if (res.ok) {
      saveOrderSummary({
        order: res.order,
        placedAt: new Date().toISOString(),
        quote,
        firstName: form.firstName.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        address: form.ship,
        ...(form.invoice === "company" ? { company: form.company.trim() } : {}),
      });
      setStatus("redirecting");
      window.location.assign(res.paymentPageUrl);
      return;
    }
    setStatus("idle");
    if (res.error === "invalid-buyer") {
      const m = messages(c) as Record<string, string>;
      const mapped = Object.fromEntries(res.fields.map((f) => SERVER_FIELD[f]).filter((k): k is string => !!k).map((k) => [k, m[k] ?? c("Check this field.", "Bu alanı kontrol edin.")]));
      setServerErrors(mapped);
      focusFirst(mapped);
    }
    setFailure(failureOf(res, c));
  };

  if (status === "done") {
    const shipTo = formatAddress(form.ship, { locale });
    return (
      <StoreContainer className="max-w-[46rem] pt-12 lg:pt-20">
        <div className="flex flex-col gap-8">
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-accent text-accent-fg">
            <Check className="size-6" />
          </span>
          <div className="flex flex-col gap-3">
            <Eyebrow>{c("Order KL-30418 · placed", "Sipariş KL-30418 · alındı")}</Eyebrow>
            <h1 ref={doneRef} tabIndex={-1} className="font-display text-display-l text-balance text-fg outline-none">
              {c(`Thank you, ${form.firstName}. Your order is in.`, `Teşekkürler ${form.firstName}, siparişiniz alındı.`)}
            </h1>
            <p className="text-lead text-fg-muted">
              {c(`We’ve sent the receipt to ${form.email}.`, `Makbuzu ${form.email} adresine gönderdik.`)} {c(`It should arrive ${eta}.`, `Tahmini teslimat: ${eta}.`)}
            </p>
            <p className="text-small text-fg-subtle">{c("Demo: no request was sent and no card was charged.", "Demo: istek gönderilmedi, karttan çekim yapılmadı.")}</p>
          </div>
          <dl className="grid gap-x-8 gap-y-5 rounded-ui-lg border border-line p-5 text-small sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-fg-muted">{c("Total", "Toplam")}</dt>
              <dd className="tabular text-h3 text-fg">{money(totals.total)}</dd>
            </div>
            <div>
              <dt className="mb-1 text-fg-muted">{c("Payment", "Ödeme")}</dt>
              <dd className="text-fg">{c("Card, on the payment provider’s page", "Kart, ödeme sağlayıcısının sayfasında")}</dd>
            </div>
            <div>
              <dt className="mb-1 text-fg-muted">{c("Delivery", "Teslimat")}</dt>
              <dd className="text-fg">{t(delivery.name)}</dd>
            </div>
            <div>
              <dt className="mb-1 text-fg-muted">{c("Ship to", "Teslimat adresi")}</dt>
              <dd className="text-fg">{shipTo.join(", ")}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="primary" size="lg">
              <a href={storeHref.confirmation}>{c("View order details", "Sipariş detayını gör")}</a>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href={storeHref.product}>{c("Continue shopping", "Alışverişe devam et")}</a>
            </Button>
          </div>
        </div>
      </StoreContainer>
    );
  }

  const summary = (
    <div className="flex flex-col gap-5">
      <ul aria-label={c("Items in your order", "Siparişinizdeki ürünler")} className="flex flex-col gap-4">
        {live.map((l) => (
          <li key={l.key} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 text-small">
            <span className="relative">
              <Image src={photo(l.item.photo, 160)} width={160} height={200} alt="" aspect="4/5" rounded="ui" sizes="56px" />
              <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-fg text-[11px] font-medium text-scene tabular" aria-hidden>
                {l.qty}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block truncate text-fg">{t(l.item.name)}</span>
              <span className="block truncate text-[12px] text-fg-muted">
                {c(`Qty ${l.qty}`, `${l.qty} adet`)}
                {l.item.option ? ` · ${t(l.item.option)}` : ""}
              </span>
            </span>
            <span className="tabular text-fg">{money(l.item.price * l.qty)}</span>
          </li>
        ))}
      </ul>
      <SummaryRows totals={totals} shippingLabel={t(delivery.name)} />
    </div>
  );

  const busy = status === "placing" || status === "redirecting";

  return (
    <StoreContainer className="pt-6 lg:pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-20">
        <div className="min-w-0">
          <div className="mb-8">
            <Eyebrow className="mb-2">{c("Step 2 of 3 · Checkout", "Adım 2 / 3 · Ödeme")}</Eyebrow>
            <h1 className="font-display text-display-l text-fg">{c("Checkout", "Ödeme")}</h1>
          </div>

          {paymentFailed ? (
            <Alert tone="danger" live="assertive" className="mb-8" title={c("Your payment didn’t go through", "Ödemeniz tamamlanamadı")}>
              {c("Nothing was charged and your cart is still here. Check the card details or try another card.", "Hiçbir tutar çekilmedi, sepetiniz duruyor. Kart bilgilerini kontrol edin ya da başka bir kart deneyin.")}
            </Alert>
          ) : null}

          {cart.kit.ready && live.length === 0 ? (
            <Alert tone="info" live="polite" className="mb-8" title={c("Your cart is empty", "Sepetiniz boş")}>
              <a href={storeHref.product} className="rounded-ui-sm underline underline-offset-4 focus-ring">
                {c("Add something to check out", "Ödeme için bir ürün ekleyin")}
              </a>
            </Alert>
          ) : null}

          {/* Mobile: the summary collapses above the form, the total stays visible. */}
          <div className="surface mb-8 rounded-ui-lg lg:hidden">
            <button
              type="button"
              aria-expanded={summaryOpen}
              aria-controls="co-summary-mobile"
              onClick={() => setSummaryOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-ui-lg p-4 text-small focus-ring"
            >
              <span className="flex items-center gap-2 text-fg">
                {summaryOpen ? c("Hide order summary", "Sipariş özetini gizle") : c("Show order summary", "Sipariş özetini göster")}
                <ChevronDown aria-hidden className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} />
              </span>
              <span className="tabular text-body font-medium text-fg">{money(totals.total)}</span>
            </button>
            {summaryOpen ? (
              <div id="co-summary-mobile" className="border-t border-line p-4">
                {summary}
              </div>
            ) : null}
          </div>

          <form ref={formRef} noValidate onSubmit={submit} aria-label={c("Checkout", "Ödeme")} aria-busy={busy || undefined} className="flex flex-col gap-9">
            <Step n={1} id="co-contact" title={c("Contact", "İletişim")} aside={<a href="#" className="rounded-ui-sm text-small text-fg-muted underline underline-offset-4 hover:text-fg focus-ring">{c("Have an account? Sign in", "Hesabınız var mı? Giriş yapın")}</a>}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={c("Email", "E-posta")} error={err("email")} hint={err("email") ? undefined : c("For the receipt and delivery updates.", "Makbuz ve teslimat bilgileri için.")} required id="co-email">
                  <Input type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => set({ email: e.target.value })} onBlur={() => touch("email")} />
                </Field>
                <Field label={c("Mobile", "Cep telefonu")} error={err("phone")} hint={err("phone") ? undefined : c("The courier texts you on the day.", "Kurye teslimat günü SMS atar.")} required id="co-phone">
                  <PhoneInput defaultCountry="TR" autoComplete="tel" value={form.phone || null} onValueChange={(v, meta) => set({ phone: v ?? "", phoneValid: meta.valid && !!v })} onBlur={() => touch("phone")} />
                </Field>
                <Checkbox className="sm:col-span-2" checked={form.news} onCheckedChange={(v) => set({ news: v === true })} label={c("Email me when a new firing comes out of the kiln", "Fırından yeni parti çıkınca bana e-posta gönder")} />
              </div>
            </Step>

            <Step n={2} id="co-delivery" title={c("Delivery", "Teslimat")}>
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-3 rounded-ui-lg border border-line p-4 text-small">
                  <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <p className="min-w-0 flex-1 text-fg-muted">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-medium text-fg">{t(delivery.name)}</span>
                      <span className="tabular text-fg">{totals.shipping === 0 ? c("Free", "Ücretsiz") : money(totals.shipping)}</span>
                    </span>
                    {eta} · {t(delivery.carrier)}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={c("First name", "Ad")} error={err("firstName")} required id="co-first">
                    <Input autoComplete="given-name" value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} onBlur={() => touch("firstName")} />
                  </Field>
                  <Field label={c("Last name", "Soyad")} error={err("lastName")} required id="co-last">
                    <Input autoComplete="family-name" value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} onBlur={() => touch("lastName")} />
                  </Field>
                </div>

                <div onBlur={(e) => { const n = (e.target as HTMLInputElement).name?.match(/^ship\[(\w+)\]$/)?.[1]; if (n) touch(`ship.${n}`); }}>
                  <AddressField
                    legend={c("Delivery address", "Teslimat adresi")}
                    name="ship"
                    countries={["TR"]}
                    value={form.ship}
                    onValueChange={(a) => set({ ship: a })}
                    required={["region1", "region2", "line1"]}
                    errors={addrErr}
                  />
                  <p className="mt-3 text-[12px] text-fg-muted">{c("We deliver anywhere in Türkiye.", "Türkiye’nin her yerine teslim ediyoruz.")}</p>
                </div>
              </div>
            </Step>

            <Step n={3} id="co-payment" title={c("Payment", "Ödeme")} aside={<span className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted"><Lock aria-hidden className="size-3.5" />{c("Encrypted · 3-D Secure", "Şifreli · 3D Secure")}</span>}>
              <div className="flex items-start gap-3 rounded-ui-lg bg-surface-2 p-4 text-small">
                <CreditCard aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                <p className="text-fg-muted">
                  <span className="block font-medium text-fg">{c("Debit or credit card", "Banka ya da kredi kartı")}</span>
                  {c(
                    "After you place the order you enter the card on the payment provider’s secure page, where instalments are offered. Card details never reach this site.",
                    "Siparişi verdikten sonra kartı ödeme sağlayıcısının güvenli sayfasında girersiniz; taksit seçenekleri orada sunulur. Kart bilgileri bu siteye hiç gelmez.",
                  )}
                </p>
              </div>
            </Step>

            <Step n={4} id="co-billing" title={c("Invoice", "Fatura")}>
              <div className="flex flex-col gap-5">
                <Field label={c("Invoice type", "Fatura tipi")}>
                  <RadioGroup value={form.invoice} onValueChange={(v) => set({ invoice: v as CheckoutForm["invoice"] })} variant="segmented">
                    <RadioGroupItem value="individual" label={c("Individual", "Bireysel")} />
                    <RadioGroupItem value="company" icon={<Building2 aria-hidden />} label={c("Company", "Kurumsal")} />
                  </RadioGroup>
                </Field>
                {form.invoice === "company" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={c("Company name", "Ticari unvan")} error={err("company")} required id="co-company" className="sm:col-span-2">
                      <Input autoComplete="organization" value={form.company} onChange={(e) => set({ company: e.target.value })} onBlur={() => touch("company")} />
                    </Field>
                    <Field label={c("Tax number (VKN)", "Vergi numarası (VKN)")} error={err("taxId")} required id="co-taxid">
                      <TaxIdInput kind="tr-vkn" value={form.taxId || null} onValueChange={(v, meta) => set({ taxId: v ?? "", taxIdValid: meta.valid && !!v })} onBlur={() => touch("taxId")} />
                    </Field>
                    <Field label={c("Tax office", "Vergi dairesi")} error={err("taxOffice")} required id="co-taxoffice">
                      <Input value={form.taxOffice} onChange={(e) => set({ taxOffice: e.target.value })} onBlur={() => touch("taxOffice")} />
                    </Field>
                  </div>
                ) : (
                  <p className="text-[12px] text-fg-muted">{c("The invoice goes to the delivery address. We email it with the receipt.", "Fatura teslimat adresine düzenlenir; makbuzla birlikte e-postayla göndeririz.")}</p>
                )}
              </div>
            </Step>

            <div className="flex flex-col gap-5 border-t border-line pt-7">
              <Field error={err("terms")} id="co-terms">
                <Checkbox
                  checked={form.terms}
                  onCheckedChange={(v) => { set({ terms: v === true }); touch("terms"); }}
                  label={
                    <span>
                      {c("I’ve read and accept the ", "")}
                      <a href="#" className="underline underline-offset-4 focus-ring rounded-ui-sm">{c("distance sales agreement", "mesafeli satış sözleşmesini")}</a>
                      {c(" and the ", " ve ")}
                      <a href="#" className="underline underline-offset-4 focus-ring rounded-ui-sm">{c("pre-information form", "ön bilgilendirme formunu")}</a>
                      {c(".", " okudum, onaylıyorum.")}
                    </span>
                  }
                />
              </Field>
              {failure ? (
                <div ref={failureRef}>
                  <Alert tone="danger" live="assertive" title={failure.title}>
                    {failure.body}{" "}
                    {failure.fixCart ? (
                      <a href={storeHref.cart} className="rounded-ui-sm underline underline-offset-4 focus-ring">
                        {c("Edit cart", "Sepeti düzenle")}
                      </a>
                    ) : null}
                  </Alert>
                </div>
              ) : null}
              <Button type="submit" variant="primary" size="xl" block loading={busy} disabled={!cart.kit.ready || live.length === 0}>
                {status === "redirecting"
                  ? c("Opening the payment page…", "Ödeme sayfası açılıyor…")
                  : status === "placing"
                    ? c("Placing your order…", "Siparişiniz veriliyor…")
                    : <>{c("Place order", "Siparişi ver")} · <span className="tabular">{money(totals.total)}</span></>}
              </Button>
              <p className="text-center text-[12px] text-fg-subtle">{c("Next: the card on a secure payment page. Your bank may ask for a code by SMS.", "Sırada: güvenli ödeme sayfasında kart. Bankanız SMS ile bir kod isteyebilir.")}</p>
            </div>
          </form>
        </div>

        <aside aria-labelledby="co-summary-title" className="hidden lg:block">
          <div className="surface sticky top-6 flex flex-col gap-6 rounded-ui-lg p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="co-summary-title" className="font-display text-[1.5rem] leading-tight text-fg">
                {c("Order summary", "Sipariş özeti")}
              </h2>
              <a href={storeHref.cart} className="rounded-ui-sm text-small text-fg-muted underline underline-offset-4 hover:text-fg focus-ring">
                {c("Edit cart", "Sepeti düzenle")}
              </a>
            </div>
            {summary}
          </div>
        </aside>
      </div>
    </StoreContainer>
  );
}
