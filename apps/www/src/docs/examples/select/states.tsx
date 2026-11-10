import { Field, Select } from "@vamos-ui/react";

const currencies = [
  { value: "usd", label: "USD — US dollar" },
  { value: "eur", label: "EUR — Euro" },
  { value: "gbp", label: "GBP — British pound" },
  { value: "try", label: "TRY — Turkish lira" },
];

export default function SelectStates() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <Field label="Small">
        <Select size="sm" defaultValue="usd" items={currencies} />
      </Field>
      <Field label="Large">
        <Select size="lg" defaultValue="eur" items={currencies} />
      </Field>
      <Field label="Invoice currency" error="Choose the currency the client pays in.">
        <Select placeholder="Choose currency" items={currencies} />
      </Field>
      <Field label="Loading options">
        <Select placeholder="Fetching currencies…" loading items={[]} />
      </Field>
      <Field label="Read-only" hint="Set by the workspace owner.">
        <Select readOnly defaultValue="try" items={currencies} />
      </Field>
      <Field label="Disabled">
        <Select disabled defaultValue="gbp" items={currencies} />
      </Field>
      <Field label="Ghost (table cell)">
        <Select variant="ghost" size="sm" defaultValue="usd" items={currencies} />
      </Field>
    </div>
  );
}
