import { Combobox, Field } from "@vamos-ui/react";

const countries = [
  { value: "de", label: "Germany", keywords: ["Deutschland"] },
  { value: "es", label: "Spain", keywords: ["España"] },
  { value: "fr", label: "France" },
  { value: "gb", label: "United Kingdom", keywords: ["UK", "Britain"] },
  { value: "ie", label: "Ireland" },
  { value: "it", label: "Italy", keywords: ["Italia"] },
  { value: "nl", label: "Netherlands", keywords: ["Holland"] },
  { value: "pl", label: "Poland", keywords: ["Polska"] },
  { value: "pt", label: "Portugal" },
  { value: "se", label: "Sweden", keywords: ["Sverige"] },
  { value: "tr", label: "Türkiye", keywords: ["Turkey"] },
  { value: "us", label: "United States", keywords: ["USA", "America"] },
];

export default function ComboboxDemo() {
  return (
    <Field label="Billing country" hint="Used for tax on your invoices." className="w-full max-w-xs">
      <Combobox name="country" items={countries} placeholder="Choose a country" searchPlaceholder="Search countries…" clearable />
    </Field>
  );
}
