"use client";

import * as React from "react";
import {
  AddressField,
  Badge,
  Button,
  Checkbox,
  cn,
  Field,
  formatAddress,
  Image,
  Input,
  PhoneInput,
  RadioGroup,
  RadioGroupItem,
  TaxIdInput,
  toast,
  useLocale,
  type Address,
} from "@vamos-ui/react";
import { Building2, Check, ChevronDown, Copy, CreditCard, Landmark, Lock, PackageOpen, Truck } from "lucide-react";
import { TODAY } from "../../_shared/time";
import { businessDay, itemOf, PAY_AT_DOOR_FEE, photo, shippingMethods, STORE, times, type ShippingId } from "../../product-01/components/catalogue";
import { computeTotals, useCart, useShop } from "../../product-01/components/cart-store";
import { Eyebrow, storeHref, StoreContainer, SummaryRows } from "../../product-01/components/storefront";
import { CardFields, cardErrors, emptyCard, type CardValue } from "./card-fields";

type Pay = "card" | "transfer" | "door";

interface CheckoutForm {
  email: string;
  phone: string;
  phoneValid: boolean;
  news: boolean;
  firstName: string;
  lastName: string;
  ship: Address;
  shippingId: ShippingId;
  pay: Pay;
  card: CardValue;
  billingSame: boolean;
  billing: Address;
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
  news: true,
  firstName: "",
  lastName: "",
  ship: { country: "TR" },
  shippingId: "standard",
  pay: "card",
  card: emptyCard,
  billingSame: true,
  billing: { country: "TR" },
  invoice: "individual",
  company: "",
  taxId: "",
  taxIdValid: false,
  taxOffice: "",
  terms: false,
};

/** International parcels: one tracked rate, no same-city courier. */
const INTERNATIONAL = "449.90";

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
  ["card.name", "#card-name"],
  ["card.number", "#card-number"],
  ["card.exp", "#card-exp"],
  ["card.cvc", "#card-cvc"],
  ["billing.region1", "[name='billing[region1]']"],
  ["billing.region2", "[name='billing[region2]']"],
  ["billing.line1", "[name='billing[line1]']"],
  ["billing.postalCode", "[name='billing[postalCode]']"],
  ["company", "#co-company"],
  ["taxId", "#co-taxid"],
  ["taxOffice", "#co-taxoffice"],
  ["terms", "#co-terms"],
];

function addressErrors(a: Address, prefix: string, c: (en: string, tr: string) => string, out: Record<string, string>) {
  const tr = a.country === "TR";
  if (tr && !a.region1) out[`${prefix}.region1`] = c("Choose a province.", "Bir il seçin.");
  if (!a.region2) out[`${prefix}.region2`] = tr ? c("Choose a district.", "Bir ilçe seçin.") : c("Enter a city.", "Bir şehir girin.");
  if (!a.line1?.trim()) out[`${prefix}.line1`] = c("Enter the street and building number.", "Cadde / sokak ve bina numarasını girin.");
  if (tr && a.postalCode && !/^\d{5}$/.test(a.postalCode)) out[`${prefix}.postalCode`] = c("Postal codes in Türkiye have 5 digits.", "Türkiye’de posta kodu 5 hanelidir.");
}

function validate(f: CheckoutForm, c: (en: string, tr: string) => string): Record<string, string> {
  const e: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = c("Enter an email like name@example.com.", "ad@example.com gibi bir e-posta girin.");
  if (!f.phone || !f.phoneValid) e.phone = c("Enter a mobile number the courier can call.", "Kuryenin arayabileceği bir cep telefonu girin.");
  if (!f.firstName.trim()) e.firstName = c("Enter your first name.", "Adınızı girin.");
  if (!f.lastName.trim()) e.lastName = c("Enter your last name.", "Soyadınızı girin.");
  if (f.shippingId !== "pickup") addressErrors(f.ship, "ship", c, e);
  if (f.pay === "card") for (const [k, v] of Object.entries(cardErrors(f.card, TODAY, c))) e[`card.${k}`] = v!;
  if (!f.billingSame || f.shippingId === "pickup") addressErrors(f.billing, "billing", c, e);
  if (f.invoice === "company") {
    if (!f.company.trim()) e.company = c("Enter the company’s registered name.", "Şirketin ticari unvanını girin.");
    if (!f.taxId || !f.taxIdValid) e.taxId = c("Enter a valid 10-digit tax number.", "Geçerli, 10 haneli bir vergi numarası girin.");
    if (!f.taxOffice.trim()) e.taxOffice = c("Enter the tax office.", "Vergi dairesini girin.");
  }
  if (!f.terms) e.terms = c("Accept the distance sales agreement to place the order.", "Siparişi vermek için mesafeli satış sözleşmesini onaylayın.");
  return e;
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

/** One-page checkout → confirmation state. */
export function CheckoutPage() {
  const { c, t, f: fmt, money, date } = useShop();
  const { locale } = useLocale();
  const cart = useCart();
  const [form, setForm] = React.useState<CheckoutForm>(initial);
  const [touched, setTouched] = React.useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "placing" | "done">("idle");
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const doneRef = React.useRef<HTMLHeadingElement>(null);

  const set = (patch: Partial<CheckoutForm>) => setForm((p) => ({ ...p, ...patch }));
  const touch = (k: string) => setTouched((p) => (p.has(k) ? p : new Set(p).add(k)));

  const abroad = form.shippingId !== "pickup" && form.ship.country !== "TR";
  const shippingId: ShippingId = abroad && form.shippingId === "express" ? "standard" : form.shippingId;
  const fee = form.pay === "door" ? PAY_AT_DOOR_FEE : "0.00";
  const totals = computeTotals(cart.lines, cart.coupon, shippingId, fee, abroad ? INTERNATIONAL : undefined);
  const all = validate(form, c);
  const err = (k: string) => (submitted || touched.has(k) ? all[k] : undefined);
  const addrErr = (prefix: string) => ({
    region1: err(`${prefix}.region1`),
    region2: err(`${prefix}.region2`),
    line1: err(`${prefix}.line1`),
    postalCode: err(`${prefix}.postalCode`),
  });
  const method = shippingMethods.find((m) => m.id === shippingId)!;
  const eta = (id: ShippingId) => {
    const m = shippingMethods.find((x) => x.id === id)!;
    if (abroad && id === "standard") return fmt.dateRange(businessDay(5), businessDay(9), { day: "numeric", month: "short" });
    if (m.days[1] === 0) return c("Ready today from 12:30", "Bugün 12:30’dan itibaren hazır");
    return m.days[0] === m.days[1] ? date(businessDay(m.days[0]), { weekday: "long", day: "numeric", month: "short" }) : fmt.dateRange(businessDay(m.days[0]), businessDay(m.days[1]), { weekday: "short", day: "numeric", month: "short" });
  };

  // Pay at the door needs a Turkish courier delivery.
  React.useEffect(() => {
    if (form.pay === "door" && (form.shippingId === "pickup" || abroad)) set({ pay: "card" });
  }, [form.pay, form.shippingId, abroad]);

  React.useEffect(() => {
    if (status === "done") {
      doneRef.current?.focus();
      window.scrollTo({ top: 0 });
    }
  }, [status]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const keys = Object.keys(all);
    if (keys.length) {
      const first = FIELD_ORDER.find(([k]) => all[k]);
      const el = first ? formRef.current?.querySelector<HTMLElement>(first[1]) : null;
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      toast.danger(c(`Check ${keys.length} ${keys.length === 1 ? "field" : "fields"} before placing the order`, `Siparişi vermeden önce ${keys.length} alanı kontrol edin`));
      return;
    }
    setStatus("placing");
    window.setTimeout(() => setStatus("done"), 1100);
  };

  const live = cart.lines.filter((l) => !l.removed);
  const last4 = form.card.number.slice(-4);

  if (status === "done") {
    const shipTo = form.shippingId === "pickup" ? null : formatAddress(form.ship, { locale });
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
              {c(`We’ve sent the receipt to ${form.email}.`, `Makbuzu ${form.email} adresine gönderdik.`)}{" "}
              {form.pay === "transfer"
                ? c("Your items are reserved for 24 hours while we wait for the transfer.", "Havale beklenirken ürünleriniz 24 saat ayrıldı.")
                : form.shippingId === "pickup"
                  ? c("We’ll text you when it’s ready to collect.", "Teslim almaya hazır olunca size SMS göndereceğiz.")
                  : c(`It should arrive ${eta(shippingId)}.`, `Tahmini teslimat: ${eta(shippingId)}.`)}
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-5 rounded-ui-lg border border-line p-5 text-small sm:grid-cols-2">
            <div>
              <dt className="mb-1 text-fg-muted">{c("Total", "Toplam")}</dt>
              <dd className="tabular text-h3 text-fg">{money(totals.total)}</dd>
            </div>
            <div>
              <dt className="mb-1 text-fg-muted">{c("Payment", "Ödeme")}</dt>
              <dd className="text-fg">
                {form.pay === "card"
                  ? `${c("Card", "Kart")} •••• ${last4}${form.card.installments !== "1" ? ` · ${c(`${form.card.installments} months`, `${form.card.installments} taksit`)}` : ""}`
                  : form.pay === "transfer"
                    ? c("Bank transfer (awaiting)", "Havale / EFT (bekleniyor)")
                    : c("Pay at the door", "Kapıda ödeme")}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-fg-muted">{c("Delivery", "Teslimat")}</dt>
              <dd className="text-fg">{t(method.name)}</dd>
            </div>
            <div>
              <dt className="mb-1 text-fg-muted">{shipTo ? c("Ship to", "Teslimat adresi") : c("Collect from", "Teslim noktası")}</dt>
              <dd className="text-fg">{shipTo ? shipTo.join(", ") : c("Kiln & Linen studio, Kadıköy", "Kiln & Linen atölyesi, Kadıköy")}</dd>
            </div>
          </dl>
          {form.pay === "transfer" ? (
            <div className="rounded-ui-lg bg-surface-2 p-5 text-small">
              <p className="mb-1 text-fg-muted">{c("Transfer to", "Havale bilgileri")}</p>
              <p className="font-mono text-fg">{STORE.iban}</p>
              <p className="text-fg-muted">{t(STORE.bank)} · {c("Reference: KL-30418", "Açıklama: KL-30418")}</p>
            </div>
          ) : null}
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
        {live.map((l) => {
          const item = itemOf(l);
          return (
            <li key={l.key} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 text-small">
              <span className="relative">
                <Image src={photo(item.photo, 160)} width={160} height={200} alt="" aspect="4/5" rounded="ui" sizes="56px" />
                <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-fg text-[11px] font-medium text-scene tabular" aria-hidden>
                  {l.qty}
                </span>
              </span>
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
      <SummaryRows
        totals={totals}
        couponCode={cart.coupon?.code}
        shippingLabel={abroad ? c("International tracked", "Uluslararası takipli") : t(method.name)}
        feeLabel={c("Pay-at-door fee", "Kapıda ödeme bedeli")}
      />
    </div>
  );

  return (
    <StoreContainer className="pt-6 lg:pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_28rem] xl:gap-20">
        <div className="min-w-0">
          <div className="mb-8">
            <Eyebrow className="mb-2">{c("Step 2 of 3 · Checkout", "Adım 2 / 3 · Ödeme")}</Eyebrow>
            <h1 className="font-display text-display-l text-fg">{c("Checkout", "Ödeme")}</h1>
          </div>

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

          <form ref={formRef} noValidate onSubmit={submit} aria-label={c("Checkout", "Ödeme")} className="flex flex-col gap-9">
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
                <Field label={c("Delivery method", "Teslimat yöntemi")}>
                  <RadioGroup value={shippingId} onValueChange={(v) => set({ shippingId: v as ShippingId })} variant="card" className="grid gap-2">
                    {shippingMethods.map((m) => {
                      const disabled = abroad && m.id === "express";
                      const price = abroad && m.id === "standard" ? INTERNATIONAL : m.id === "standard" && totals.toFreeShipping === "0.00" ? "0.00" : m.price;
                      return (
                        <RadioGroupItem
                          key={m.id}
                          value={m.id}
                          disabled={disabled}
                          icon={m.id === "pickup" ? <PackageOpen aria-hidden /> : <Truck aria-hidden />}
                          label={
                            <span className="flex w-full flex-wrap items-baseline justify-between gap-x-3">
                              <span>{abroad && m.id === "standard" ? c("International tracked", "Uluslararası takipli") : t(m.name)}</span>
                              <span className="tabular font-normal text-fg">{price === "0.00" ? c("Free", "Ücretsiz") : money(price)}</span>
                            </span>
                          }
                          description={disabled ? c("Only within Türkiye", "Yalnızca Türkiye içi") : m.id === "pickup" ? t(m.carrier) : `${eta(m.id)} · ${abroad && m.id === "standard" ? c("Duties may be charged on arrival", "Varışta gümrük vergisi alınabilir") : t(m.carrier)}`}
                        />
                      );
                    })}
                  </RadioGroup>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={c("First name", "Ad")} error={err("firstName")} required id="co-first">
                    <Input autoComplete="given-name" value={form.firstName} onChange={(e) => set({ firstName: e.target.value })} onBlur={() => touch("firstName")} />
                  </Field>
                  <Field label={c("Last name", "Soyad")} error={err("lastName")} required id="co-last">
                    <Input autoComplete="family-name" value={form.lastName} onChange={(e) => set({ lastName: e.target.value })} onBlur={() => touch("lastName")} />
                  </Field>
                </div>

                {form.shippingId === "pickup" ? (
                  <div className="flex items-start gap-3 rounded-ui-lg bg-surface-2 p-4 text-small">
                    <PackageOpen aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                    <p className="text-fg-muted">
                      <span className="block font-medium text-fg">{c("Kiln & Linen studio", "Kiln & Linen atölyesi")}</span>
                      {c("Moda Cad. No: 00, Kadıköy / İstanbul · Mon–Sat 10:00–19:00. Bring the order number or the SMS.", "Moda Cad. No: 00, Kadıköy / İstanbul · Pzt–Cmt 10:00–19:00. Sipariş numarasını ya da SMS’i getirin.")}
                    </p>
                  </div>
                ) : (
                  <div onBlur={(e) => { const n = (e.target as HTMLInputElement).name?.match(/^ship\[(\w+)\]$/)?.[1]; if (n) touch(`ship.${n}`); }}>
                    <AddressField
                      legend={c("Delivery address", "Teslimat adresi")}
                      name="ship"
                      value={form.ship}
                      onValueChange={(a) => set({ ship: a })}
                      required={["region1", "region2", "line1"]}
                      errors={addrErr("ship")}
                    />
                    {abroad ? <p className="mt-3 text-[12px] text-fg-muted">{c("We ship to 38 countries with a tracked courier. Prices exclude any import duties.", "38 ülkeye takipli kargoyla gönderiyoruz. Fiyatlara gümrük vergileri dahil değildir.")}</p> : null}
                  </div>
                )}
              </div>
            </Step>

            <Step n={3} id="co-payment" title={c("Payment", "Ödeme")} aside={<span className="inline-flex items-center gap-1.5 text-[12px] text-fg-muted"><Lock aria-hidden className="size-3.5" />{c("Encrypted · 3-D Secure", "Şifreli · 3D Secure")}</span>}>
              <div className="flex flex-col gap-6">
                <Field label={c("Payment method", "Ödeme yöntemi")}>
                  <RadioGroup value={form.pay} onValueChange={(v) => set({ pay: v as Pay })} variant="card" orientation="horizontal" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <RadioGroupItem value="card" icon={<CreditCard aria-hidden />} label={c("Card", "Kart")} description={c("Debit or credit", "Banka / kredi kartı")} />
                    <RadioGroupItem value="transfer" icon={<Landmark aria-hidden />} label={c("Bank transfer", "Havale / EFT")} description={c("Reserved for 24 h", "24 saat ayrılır")} />
                    <RadioGroupItem
                      value="door"
                      icon={<Truck aria-hidden />}
                      label={c("Pay at the door", "Kapıda ödeme")}
                      description={c(`Cash or card · +${money(PAY_AT_DOOR_FEE)}`, `Nakit ya da kart · +${money(PAY_AT_DOOR_FEE)}`)}
                      disabled={form.shippingId === "pickup" || abroad}
                    />
                  </RadioGroup>
                </Field>

                {form.pay === "card" ? (
                  <CardFields
                    value={form.card}
                    onChange={(patch) => setForm((p) => ({ ...p, card: { ...p.card, ...patch } }))}
                    errors={{ name: err("card.name"), number: err("card.number"), exp: err("card.exp"), cvc: err("card.cvc") }}
                    onBlurField={(k) => touch(`card.${k}`)}
                    total={totals.total}
                  />
                ) : form.pay === "transfer" ? (
                  <div className="flex flex-col gap-3 rounded-ui-lg bg-surface-2 p-4 text-small">
                    <p className="text-fg-muted">{c("Transfer the total within 24 hours with your order number as the reference. We ship once it lands — usually within an hour on weekdays.", "Toplam tutarı 24 saat içinde, açıklamaya sipariş numaranızı yazarak gönderin. Ödeme ulaşınca kargolarız — hafta içi genelde bir saat içinde.")}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-line bg-surface p-3">
                      <span className="min-w-0">
                        <span className="block text-[12px] text-fg-muted">IBAN</span>
                        <span className="block font-mono text-fg">{STORE.iban}</span>
                        <span className="block text-[12px] text-fg-muted">{t(STORE.bank)}</span>
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          void navigator.clipboard?.writeText(STORE.iban.replace(/\s/g, "")).catch(() => {});
                          toast.success(c("IBAN copied", "IBAN kopyalandı"));
                        }}
                      >
                        <Copy aria-hidden />
                        {c("Copy IBAN", "IBAN’ı kopyala")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-ui-lg bg-surface-2 p-4 text-small text-fg-muted">
                    {c(`Pay the courier in cash or by card when the parcel arrives. A ${money(PAY_AT_DOOR_FEE)} handling fee is added to the total.`, `Paket geldiğinde kuryeye nakit ya da kartla ödeyin. Toplama ${money(PAY_AT_DOOR_FEE)} hizmet bedeli eklenir.`)}
                  </p>
                )}
              </div>
            </Step>

            <Step n={4} id="co-billing" title={c("Billing & invoice", "Fatura")}>
              <div className="flex flex-col gap-5">
                {form.shippingId === "pickup" ? null : (
                  <Checkbox checked={form.billingSame} onCheckedChange={(v) => set({ billingSame: v === true })} label={c("Billing address is the same as delivery", "Fatura adresi teslimat adresiyle aynı")} />
                )}
                {!form.billingSame || form.shippingId === "pickup" ? (
                  <div onBlur={(e) => { const n = (e.target as HTMLInputElement).name?.match(/^billing\[(\w+)\]$/)?.[1]; if (n) touch(`billing.${n}`); }}>
                    <AddressField legend={c("Billing address", "Fatura adresi")} name="billing" value={form.billing} onValueChange={(a) => set({ billing: a })} required={["region1", "region2", "line1"]} errors={addrErr("billing")} />
                  </div>
                ) : null}
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
                  <p className="text-[12px] text-fg-muted">{c("We email an e-Archive invoice with the receipt.", "e-Arşiv faturanızı makbuzla birlikte e-postayla göndeririz.")}</p>
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
              <Button type="submit" variant="primary" size="xl" block loading={status === "placing"} disabled={live.length === 0}>
                {status === "placing" ? c("Placing your order…", "Siparişiniz veriliyor…") : <>{c("Place order", "Siparişi ver")} · <span className="tabular">{money(totals.total)}</span></>}
              </Button>
              <p className="text-center text-[12px] text-fg-subtle">
                {form.pay === "card" ? c("Your bank may ask you to confirm with a code by SMS.", "Bankanız SMS ile gelen bir kodla onay isteyebilir.") : c("No payment is taken now.", "Şu anda ödeme alınmaz.")}
              </p>
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
            {cart.coupon ? null : (
              <p className="flex items-center gap-2 text-[12px] text-fg-muted">
                <Badge tone="outline" shape="square">KILN10</Badge>
                {c("Have a code? Add it in the cart.", "Kodunuz mu var? Sepette ekleyin.")}
              </p>
            )}
          </div>
        </aside>
      </div>
    </StoreContainer>
  );
}
