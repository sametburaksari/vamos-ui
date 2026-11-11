"use client";

import * as React from "react";
import { CurrencyInput, Field, NumberInput, Select, Slider } from "@vamos-ui/react";
import { fill, tl } from "./content";
import { useEstate } from "./estate-provider";

const c = {
  title: { en: "What would it cost a month?", tr: "Aylık ne öder miyim?" },
  price: { en: "Home price", tr: "Konut fiyatı" },
  down: { en: "Down payment", tr: "Peşinat" },
  downHint: { en: "{amount} · banks lend up to 80% for a first home", tr: "{amount} · ilk konutta bankalar %80’e kadar kredi verir" },
  rate: { en: "Monthly interest rate (%)", tr: "Aylık faiz oranı (%)" },
  rateHint: { en: "Housing loans in Türkiye are quoted per month", tr: "Konut kredisi faizi aylık verilir" },
  term: { en: "Term", tr: "Vade" },
  months: { en: "{n} months", tr: "{n} ay" },
  monthly: { en: "Monthly payment", tr: "Aylık taksit" },
  loan: { en: "Loan", tr: "Kredi" },
  interest: { en: "Total interest", tr: "Toplam faiz" },
  total: { en: "Total repaid", tr: "Toplam geri ödeme" },
  note: { en: "An illustration, not an offer. Fees, insurance and BSMV are not included; your bank sets the final rate.", tr: "Bir örnektir, teklif değildir. Masraf, sigorta ve BSMV dahil değildir; nihai oranı bankanız belirler." },
  split: { en: "Principal vs interest", tr: "Anapara ve faiz" },
};

/** Annuity: P · r / (1 − (1 + r)^−n). */
export function monthlyPayment(principal: number, monthlyRatePct: number, months: number) {
  const r = monthlyRatePct / 100;
  if (principal <= 0 || months <= 0) return 0;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - (1 + r) ** -months);
}

/** Price, down payment, rate and term → monthly payment, with a principal/interest bar. */
export function MortgageCalculator({ defaultPrice = 14_750_000, idPrefix = "calc" }: { defaultPrice?: number; idPrefix?: string }) {
  const { locale, t } = useEstate();
  const [price, setPrice] = React.useState<number>(defaultPrice);
  const [downPct, setDownPct] = React.useState(30);
  const [rate, setRate] = React.useState<number>(2.79);
  const [term, setTerm] = React.useState("120");
  React.useEffect(() => setPrice(defaultPrice), [defaultPrice]);

  const loan = Math.max(0, price * (1 - downPct / 100));
  const months = Number(term);
  const pay = monthlyPayment(loan, rate, months);
  const total = pay * months;
  const interest = Math.max(0, total - loan);
  const principalShare = total > 0 ? (loan / total) * 100 : 0;

  return (
    <div className="grid gap-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @3xl:gap-12">
      <div className="grid gap-5">
        <Field label={t(c.price)}>
          <CurrencyInput currency="TRY" precision={0} value={String(price)} onValueChange={(v) => setPrice(Number(v ?? 0))} />
        </Field>
        <Field label={`${t(c.down)} · ${new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", { style: "percent" }).format(downPct / 100)}`} hint={fill(t(c.downHint), { amount: tl(price * (downPct / 100), locale) })}>
          <Slider value={[downPct]} onValueChange={(v) => setDownPct(v[0] ?? 30)} min={20} max={80} step={5} aria-label={t(c.down)} />
        </Field>
        <div className="grid gap-5 @md:grid-cols-2">
          <Field label={t(c.rate)} hint={t(c.rateHint)}>
            <NumberInput value={rate} onValueChange={(v) => setRate(v ?? 0)} min={0} max={10} step={0.01} precision={2} stepper />
          </Field>
          <Field label={t(c.term)}>
            <Select value={term} onValueChange={(v) => v && setTerm(v)} items={["36", "60", "96", "120"].map((n) => ({ value: n, label: fill(t(c.months), { n }) }))} />
          </Field>
        </div>
      </div>

      <div className="surface-2 flex flex-col justify-between gap-6 rounded-ui-lg p-6" aria-live="polite" id={`${idPrefix}-result`}>
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-muted">{t(c.monthly)}</p>
          <p className="tabular font-display text-display-l text-fg">{tl(Math.round(pay), locale)}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-small text-fg-muted">{t(c.split)}</p>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-track" aria-hidden>
            <span className="bg-accent" style={{ width: `${principalShare}%` }} />
          </div>
          <dl className="mt-2 grid grid-cols-[1fr_auto] gap-y-1.5 text-small">
            <dt className="flex items-center gap-2 text-fg-muted">
              <span aria-hidden className="size-2 rounded-full bg-accent" />
              {t(c.loan)}
            </dt>
            <dd className="tabular text-end text-fg">{tl(Math.round(loan), locale)}</dd>
            <dt className="flex items-center gap-2 text-fg-muted">
              <span aria-hidden className="size-2 rounded-full bg-track ring-1 ring-line" />
              {t(c.interest)}
            </dt>
            <dd className="tabular text-end text-fg">{tl(Math.round(interest), locale)}</dd>
            <dt className="border-t border-line pt-1.5 text-fg">{t(c.total)}</dt>
            <dd className="tabular border-t border-line pt-1.5 text-end font-medium text-fg">{tl(Math.round(total), locale)}</dd>
          </dl>
        </div>
        <p className="text-xs text-fg-muted">{t(c.note)}</p>
      </div>
    </div>
  );
}
