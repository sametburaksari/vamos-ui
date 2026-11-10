"use client";

import * as React from "react";
import { CurrencyInput, Field, LocaleProvider } from "@vamos-cms/ui";

export default function CurrencyExample() {
  const [usd, setUsd] = React.useState<string | null>("48500.00");
  const [lira, setLira] = React.useState<string | null>("1250000.50");
  return (
    <div className="grid w-full max-w-xl gap-5 sm:grid-cols-2">
      <div className="grid gap-2">
        <Field label="Deal value" hint="en-US · USD">
          <CurrencyInput currency="USD" value={usd} onValueChange={setUsd} />
        </Field>
        <code className="font-mono text-xs text-fg-subtle">value: {JSON.stringify(usd)}</code>
      </div>
      <LocaleProvider locale="tr-TR">
        <div className="grid gap-2">
          <Field label="Teklif tutarı" hint="tr-TR · TRY — type . or , for kuruş">
            <CurrencyInput currency="TRY" value={lira} onValueChange={setLira} align="end" />
          </Field>
          <code className="font-mono text-xs text-fg-subtle">value: {JSON.stringify(lira)}</code>
        </div>
      </LocaleProvider>
      <Field label="Monthly retainer" hint="Code instead of symbol, euro after the amount in de-DE." className="sm:col-span-2">
        <LocaleProvider locale="de-DE">
          <CurrencyInput currency="EUR" currencyDisplay="code" defaultValue="2400" />
        </LocaleProvider>
      </Field>
    </div>
  );
}
