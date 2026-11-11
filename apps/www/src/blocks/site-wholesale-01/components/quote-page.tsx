"use client";

import * as React from "react";
import { Badge, Button, EmptyState, Field, IconButton, Input, NativeSelect, NumberInput, RadioGroup, Textarea } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CircleCheck, Trash2 } from "lucide-react";
import { deliveries, fill, productBySku, TIER_MIN, tierMin, tierNames, tierOf, VAT_RATE, type DeliveryId } from "./content";
import { unitPrice, useQuote } from "./quote-provider";

const copy = {
  home: { en: "Crate & Co.", tr: "Crate & Co." },
  crumb: { en: "Request a quote", tr: "Teklif iste" },
  eyebrow: { en: "Reply within two working hours", tr: "İki iş saati içinde yanıt" },
  title: { en: "Your quote, *line by line*", tr: "Teklifiniz, *satır satır*" },
  lead: {
    en: "Adjust the cases and watch each line move between tiers. Send it and a person in Tuzla checks stock, confirms the delivery slot and replies with a PDF and a payment link.",
    tr: "Koli adetlerini değiştirin, her satırın kademeler arasında nasıl geçtiğini görün. Gönderdiğinizde Tuzla’dan biri stoğu kontrol eder, teslim saatini onaylar ve PDF ile ödeme bağlantısını iletir.",
  },
  lines: { en: "Quote lines", tr: "Teklif satırları" },
  product: { en: "Product", tr: "Ürün" },
  cases: { en: "Cases", tr: "Koli" },
  unit: { en: "Unit price", tr: "Birim fiyat" },
  total: { en: "Line total", tr: "Satır toplamı" },
  casesOf: { en: "Cases of {name}", tr: "{name} — koli adedi" },
  remove: { en: "Remove {name}", tr: "{name} satırını kaldır" },
  toNext: { en: "+{n} to {tier}", tr: "{tier} için +{n}" },
  empty: { en: "Your quote is empty", tr: "Teklifiniz boş" },
  emptyText: { en: "Add products from the catalogue — any number of cases, mixed sizes welcome.", tr: "Katalogdan ürün ekleyin — istediğiniz koli adedi, karışık ölçüler olur." },
  browse: { en: "Browse the catalogue", tr: "Kataloğa göz at" },
  delivery: { en: "Delivery", tr: "Teslimat" },
  summary: { en: "Summary", tr: "Özet" },
  subtotal: { en: "Goods, ex VAT", tr: "Ürünler, KDV hariç" },
  savings: { en: "Tier savings", tr: "Kademe indirimi" },
  shipping: { en: "Delivery", tr: "Teslimat" },
  free: { en: "Free", tr: "Ücretsiz" },
  vat: { en: "VAT {rate}", tr: "KDV {rate}" },
  grand: { en: "Total", tr: "Toplam" },
  details: { en: "Company details", tr: "Firma bilgileri" },
  company: { en: "Company name", tr: "Firma adı" },
  taxNo: { en: "Tax number (VKN or TCKN)", tr: "Vergi no (VKN veya TCKN)" },
  taxHint: { en: "10 digits for companies, 11 for sole traders.", tr: "Şirketler için 10, şahıs şirketleri için 11 hane." },
  contact: { en: "Your name", tr: "Adınız soyadınız" },
  email: { en: "Work email", tr: "İş e-postası" },
  phone: { en: "Phone", tr: "Telefon" },
  when: { en: "Needed by", tr: "Ne zaman lazım" },
  whenWeek: { en: "This week", tr: "Bu hafta" },
  when2: { en: "Within two weeks", tr: "İki hafta içinde" },
  whenFlex: { en: "Flexible — monthly restock", tr: "Esnek — aylık stok yenileme" },
  notes: { en: "Notes for the warehouse", tr: "Depo için notlar" },
  notesHint: { en: "Loading dock times, printed boxes, a PO number…", tr: "Rampa saatleri, baskılı kutu, sipariş numarası…" },
  send: { en: "Send quote request", tr: "Teklif talebini gönder" },
  sending: { en: "Sending…", tr: "Gönderiliyor…" },
  required: { en: "Required.", tr: "Zorunlu." },
  badEmail: { en: "Enter an email like name@company.com.", tr: "ad@firma.com gibi bir e-posta girin." },
  badTax: { en: "10 or 11 digits, numbers only.", tr: "Yalnızca rakam, 10 veya 11 hane." },
  doneTitle: { en: "Quote {ref} is on its way to Tuzla", tr: "{ref} numaralı teklif Tuzla’ya iletildi" },
  doneText: {
    en: "Ece from the trade desk will reply to {email} by {time} with a PDF and a payment link. Prices are held for 7 days.",
    tr: "Ticari masadan Ece, {time}’a kadar {email} adresine PDF ve ödeme bağlantısıyla dönecek. Fiyatlar 7 gün geçerli.",
  },
  again: { en: "Start a new quote", tr: "Yeni teklif başlat" },
  privacy: { en: "We use these details only to prepare and deliver this quote (KVKK notice in the footer).", tr: "Bu bilgileri yalnızca teklifi hazırlamak ve teslim etmek için kullanırız (KVKK metni altbilgide)." },
};

type Errors = Partial<Record<"company" | "taxNo" | "contact" | "email", string>>;

/** Quote: editable lines with live tiers, delivery choice, totals with VAT, and the company form. */
export function QuotePage() {
  const { c, lines, setCases, remove, delivery, setDelivery, totals, clear, cases } = useQuote();
  const { t, f, lira, liraRound } = c;
  const [errors, setErrors] = React.useState<Errors>({});
  const [sent, setSent] = React.useState<{ ref: string; email: string } | null>(null);
  const [sending, setSending] = React.useState(false);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const next: Errors = {};
    if (!get("company")) next.company = t(copy.required);
    if (!/^\d{10,11}$/.test(get("taxNo"))) next.taxNo = get("taxNo") ? t(copy.badTax) : t(copy.required);
    if (!get("contact")) next.contact = t(copy.required);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get("email"))) next.email = get("email") ? t(copy.badEmail) : t(copy.required);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent({ ref: "CQ-2611-0482", email: get("email") });
    }, 700);
  };

  return (
    <>
      <PageIntro
        locale={c.intl}
        labels={c.labels}
        variant="ruled"
        className="!pt-10 !pb-6 lg:!pt-14"
        breadcrumb={[{ label: t(copy.home), href: sitePageHref("home") }, { label: t(copy.crumb) }]}
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        lead={t(copy.lead)}
      />
      <Section theme={{ rhythm: "tight" }} aria-label={t(copy.crumb)} className="!pt-2">
        <Container size="wide">
          {sent ? (
            <div role="status" className="mx-auto flex max-w-2xl flex-col items-start gap-4 border-2 border-fg bg-surface p-6 sm:p-8">
              <CircleCheck aria-hidden className="size-8 text-accent-ink" />
              <h2 className="font-display text-[1.75rem] leading-tight font-semibold tracking-[-0.02em] text-fg">{fill(t(copy.doneTitle), { ref: sent.ref })}</h2>
              <p className="text-fg-muted">{fill(t(copy.doneText), { email: sent.email, time: "16:30" })}</p>
              <p className="tabular font-mono text-small text-fg">
                {f.number(lines.length)} × · {f.number(cases)} {t(copy.cases).toLocaleLowerCase(c.intl)} · {liraRound(totals.total)}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  clear();
                  setSent(null);
                }}
              >
                {t(copy.again)}
              </Button>
            </div>
          ) : lines.length === 0 ? (
            <EmptyState
              kind="first-use"
              title={t(copy.empty)}
              description={t(copy.emptyText)}
              actions={
                <Button asChild variant="primary">
                  <a href={sitePageHref("catalogue")}>{t(copy.browse)}</a>
                </Button>
              }
            />
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-x-10 gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <div className="flex min-w-0 flex-col gap-10">
                <section aria-labelledby="cq-lines">
                  <h2 id="cq-lines" className="border-b-2 border-fg pb-2 font-mono text-[11.5px] tracking-[0.1em] text-fg uppercase">
                    {t(copy.lines)}
                  </h2>
                  <ul role="list">
                    {lines.map((l) => {
                      const p = productBySku(l.sku);
                      const tier = tierOf(l.cases);
                      const next = tier < TIER_MIN.length - 1 ? tierMin(tier + 1) - l.cases : null;
                      const name = t(p.name);
                      return (
                        <li key={l.sku} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_8.5rem_7rem_7rem_auto] sm:items-center">
                          <div className="min-w-0">
                            <p className="font-medium text-fg">{name}</p>
                            <p className="tabular mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-muted">
                              {p.sku}
                              <Badge tone={tier > 0 ? "accent" : "neutral"} shape="square" size="sm">
                                {t(tierNames[tier]!)}
                              </Badge>
                              {next !== null ? (
                                <button type="button" onClick={() => setCases(l.sku, l.cases + next)} className="rounded-[2px] text-accent-ink underline decoration-dotted underline-offset-2 focus-ring">
                                  {fill(t(copy.toNext), { n: next, tier: t(tierNames[tier + 1]!) })}
                                </button>
                              ) : null}
                            </p>
                          </div>
                          <IconButton variant="ghost" size="sm" label={fill(t(copy.remove), { name })} onClick={() => remove(l.sku)} className="row-start-1 justify-self-end sm:col-start-5">
                            <Trash2 aria-hidden />
                          </IconButton>
                          <NumberInput
                            value={l.cases}
                            onValueChange={(v) => setCases(l.sku, v ?? 1)}
                            min={1}
                            max={999}
                            precision={0}
                            stepper
                            size="sm"
                            aria-label={fill(t(copy.casesOf), { name })}
                            className="w-32 sm:row-start-1 sm:col-start-2"
                          />
                          <p className="tabular text-end text-small text-fg-muted sm:row-start-1 sm:col-start-3">
                            <span className="sr-only">{t(copy.unit)}: </span>
                            {lira(unitPrice(l.sku, l.cases))}
                            <span className="text-fg-subtle"> /{t(p.unit)}</span>
                          </p>
                          <p className="tabular col-span-2 text-end font-medium text-fg sm:col-span-1 sm:row-start-1 sm:col-start-4">
                            <span className="sr-only">{t(copy.total)}: </span>
                            {liraRound(unitPrice(l.sku, l.cases) * p.perCase * l.cases)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section aria-labelledby="cq-delivery">
                  <h2 id="cq-delivery" className="mb-4 border-b-2 border-fg pb-2 font-mono text-[11.5px] tracking-[0.1em] text-fg uppercase">
                    {t(copy.delivery)}
                  </h2>
                  <RadioGroup<DeliveryId>
                    variant="card"
                    value={delivery}
                    onValueChange={setDelivery}
                    aria-labelledby="cq-delivery"
                    items={deliveries.map((d) => ({ value: d.id, label: t(d.label), description: t(d.detail) }))}
                  />
                </section>

                <section aria-labelledby="cq-details">
                  <h2 id="cq-details" className="mb-4 border-b-2 border-fg pb-2 font-mono text-[11.5px] tracking-[0.1em] text-fg uppercase">
                    {t(copy.details)}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t(copy.company)} required error={errors.company}>
                      <Input name="company" autoComplete="organization" placeholder="Örnek Ticaret Ltd. Şti." />
                    </Field>
                    <Field label={t(copy.taxNo)} required error={errors.taxNo} hint={t(copy.taxHint)}>
                      <Input name="taxNo" inputMode="numeric" maxLength={11} className="font-mono" />
                    </Field>
                    <Field label={t(copy.contact)} required error={errors.contact}>
                      <Input name="contact" autoComplete="name" />
                    </Field>
                    <Field label={t(copy.email)} required error={errors.email}>
                      <Input name="email" type="email" autoComplete="email" placeholder="buyer@example.com" />
                    </Field>
                    <Field label={t(copy.phone)} optional>
                      <Input name="phone" type="tel" autoComplete="tel" placeholder="+90 216 000 00 00" />
                    </Field>
                    <Field label={t(copy.when)}>
                      <NativeSelect
                        name="when"
                        defaultValue="week"
                        items={[
                          { value: "week", label: t(copy.whenWeek) },
                          { value: "two", label: t(copy.when2) },
                          { value: "flex", label: t(copy.whenFlex) },
                        ]}
                      />
                    </Field>
                    <Field label={t(copy.notes)} hint={t(copy.notesHint)} optional className="sm:col-span-2">
                      <Textarea name="notes" rows={3} />
                    </Field>
                  </div>
                </section>
              </div>

              <aside aria-labelledby="cq-summary" className="lg:sticky lg:top-24 lg:self-start">
                <div className="border-2 border-fg bg-surface">
                  <h2 id="cq-summary" className="border-b-2 border-fg px-5 py-3 font-mono text-[11.5px] tracking-[0.1em] text-fg uppercase">
                    {t(copy.summary)}
                  </h2>
                  <dl className="tabular flex flex-col gap-2.5 px-5 py-4 text-small">
                    <Row label={t(copy.subtotal)} value={liraRound(totals.listTotal)} />
                    {totals.savings > 0 ? <Row label={t(copy.savings)} value={`−${liraRound(totals.savings)}`} accent /> : null}
                    <Row label={t(copy.shipping)} value={totals.shipping === 0 ? t(copy.free) : liraRound(totals.shipping)} />
                    <Row label={fill(t(copy.vat), { rate: f.percent(VAT_RATE) })} value={liraRound(totals.vat)} />
                  </dl>
                  <div className="tabular flex items-baseline justify-between gap-4 border-t-2 border-fg px-5 py-4">
                    <span className="font-medium text-fg">{t(copy.grand)}</span>
                    <span className="font-display text-[1.9rem] leading-none font-semibold tracking-[-0.02em] text-fg">{liraRound(totals.total)}</span>
                  </div>
                  <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
                    <Button type="submit" variant="primary" size="lg" block loading={sending} loadingText={t(copy.sending)} className="rounded-[3px]">
                      {t(copy.send)}
                    </Button>
                    <p className="text-[12px] leading-relaxed text-fg-muted">{t(copy.privacy)}</p>
                  </div>
                </div>
              </aside>
            </form>
          )}
        </Container>
      </Section>
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd className={accent ? "font-medium text-accent-ink" : "text-fg"}>{value}</dd>
    </div>
  );
}
