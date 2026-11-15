"use client";

import { LocaleProvider } from "@vamos-ui/react";
import { tr } from "@vamos-ui/react/locale/tr";
import { BillingDetailsFields } from "@vamos-ui/react/business";

export default function BillingDetailsTurkish() {
  return (
    <LocaleProvider locale="tr-TR" messages={tr}>
      <BillingDetailsFields
        name="fatura"
        defaultValue={{ type: "company", companyName: "Yelken Atölye Tasarım Ltd. Şti.", taxOffice: "Kozyatağı", email: "muhasebe@ornek.com.tr", address: { country: "TR", region1: "İstanbul", region2: "Maltepe" } }}
        className="w-full max-w-xl"
      />
    </LocaleProvider>
  );
}
