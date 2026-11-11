"use client";

import * as React from "react";
import { Field, FormattedInput, Input, RadioGroup, RadioGroupItem } from "@vamos-ui/react";
import { multiplyDecimal } from "@vamos-ui/react/format";
import { CreditCard } from "lucide-react";
import { useShop } from "../../product-01/components/cart-store";

export interface CardValue {
  name: string;
  /** Digits only. */
  number: string;
  /** MMYY digits. */
  exp: string;
  cvc: string;
  installments: "1" | "3" | "6";
}

export const emptyCard: CardValue = { name: "", number: "", exp: "", cvc: "", installments: "1" };

/** Card network from the first digits (display only; the payment provider decides). */
export function cardBrand(digits: string): "visa" | "mastercard" | "amex" | "troy" | null {
  if (/^4/.test(digits)) return "visa";
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (/^(9792|65)/.test(digits)) return "troy";
  return null;
}
const brandName = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", troy: "Troy" };

/** Luhn checksum. */
export function luhn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

/** Card errors keyed by field. `today` is YYYY-MM-DD so expiry is checked against the fixed clock. */
export function cardErrors(card: CardValue, today: string, c: (en: string, tr: string) => string): Partial<Record<"name" | "number" | "exp" | "cvc", string>> {
  const e: Partial<Record<"name" | "number" | "exp" | "cvc", string>> = {};
  if (card.name.trim().length < 3) e.name = c("Enter the name as it appears on the card.", "Kart üzerindeki adı girin.");
  const amex = cardBrand(card.number) === "amex";
  if (!card.number) e.number = c("Enter your card number.", "Kart numaranızı girin.");
  else if (card.number.length < (amex ? 15 : 16) || !luhn(card.number)) e.number = c("This card number isn’t valid. Check the digits.", "Kart numarası geçersiz. Rakamları kontrol edin.");
  if (card.exp.length < 4) e.exp = c("Enter the expiry as MM/YY.", "Son kullanma tarihini AA/YY olarak girin.");
  else {
    const mm = Number(card.exp.slice(0, 2));
    const yy = Number(card.exp.slice(2, 4));
    const [ty, tm] = [Number(today.slice(2, 4)), Number(today.slice(5, 7))];
    if (mm < 1 || mm > 12) e.exp = c("The month must be 01–12.", "Ay 01–12 arasında olmalı.");
    else if (yy < ty || (yy === ty && mm < tm)) e.exp = c("This card has expired.", "Bu kartın süresi dolmuş.");
  }
  if (card.cvc.length < (amex ? 4 : 3)) e.cvc = c(`Enter the ${amex ? 4 : 3}-digit security code.`, `${amex ? 4 : 3} haneli güvenlik kodunu girin.`);
  return e;
}

/** Name, masked number with the detected network, MM/YY, CVC and (for Turkish cards) instalments. */
export function CardFields({
  value,
  onChange,
  errors,
  onBlurField,
  total,
}: {
  value: CardValue;
  onChange: (patch: Partial<CardValue>) => void;
  errors: Partial<Record<"name" | "number" | "exp" | "cvc", string>>;
  onBlurField: (field: "name" | "number" | "exp" | "cvc") => void;
  total: string;
}) {
  const { c, money } = useShop();
  const brand = cardBrand(value.number);
  const amex = brand === "amex";
  const monthly = (n: number) => money(multiplyDecimal(total, (1 / n).toFixed(12)));
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label={c("Name on card", "Kart üzerindeki ad")} error={errors.name} required id="card-name" className="col-span-2">
        <Input value={value.name} onChange={(e) => onChange({ name: e.target.value })} onBlur={() => onBlurField("name")} autoComplete="cc-name" />
      </Field>
      <Field label={c("Card number", "Kart numarası")} error={errors.number} hint={errors.number ? undefined : c("Test card: 4242 4242 4242 4242", "Test kartı: 4242 4242 4242 4242")} required id="card-number" className="col-span-2">
        <FormattedInput
          mask={amex ? "#### ###### #####" : "#### #### #### ####"}
          inputMode="numeric"
          autoComplete="cc-number"
          mono
          value={value.number}
          onValueChange={(v) => onChange({ number: v ?? "" })}
          onBlur={() => onBlurField("number")}
          leading={<CreditCard aria-hidden />}
          trailing={brand ? <span className="pe-2 text-[12px] font-medium text-fg-muted">{brandName[brand]}</span> : undefined}
        />
      </Field>
      <Field label={c("Expiry (MM/YY)", "Son kullanma (AA/YY)")} error={errors.exp} required id="card-exp">
        <FormattedInput mask="##/##" inputMode="numeric" autoComplete="cc-exp" mono placeholder={c("MM/YY", "AA/YY")} value={value.exp} onValueChange={(v) => onChange({ exp: v ?? "" })} onBlur={() => onBlurField("exp")} />
      </Field>
      <Field label={c("Security code", "Güvenlik kodu")} error={errors.cvc} hint={errors.cvc ? undefined : amex ? c("4 digits on the front", "Ön yüzdeki 4 hane") : c("3 digits on the back", "Arka yüzdeki 3 hane")} required id="card-cvc">
        <FormattedInput mask={amex ? "####" : "###"} inputMode="numeric" autoComplete="cc-csc" mono value={value.cvc} onValueChange={(v) => onChange({ cvc: v ?? "" })} onBlur={() => onBlurField("cvc")} />
      </Field>
      <Field label={c("Instalments", "Taksit")} hint={c("Interest-free on Turkish credit cards.", "Türkiye’de çıkarılmış kredi kartlarında faizsiz.")} className="col-span-2">
        <RadioGroup value={value.installments} onValueChange={(v) => onChange({ installments: v as CardValue["installments"] })} variant="card" orientation="horizontal" size="sm" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <RadioGroupItem value="1" label={c("Pay in full", "Tek çekim")} description={money(total)} />
          <RadioGroupItem value="3" label={c("3 months", "3 taksit")} description={c(`${monthly(3)} / month`, `Aylık ${monthly(3)}`)} />
          <RadioGroupItem value="6" label={c("6 months", "6 taksit")} description={c(`${monthly(6)} / month`, `Aylık ${monthly(6)}`)} />
        </RadioGroup>
      </Field>
    </div>
  );
}
