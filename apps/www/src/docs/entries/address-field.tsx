import { ex, type DocEntry } from "../types";
import AddressFieldDemo from "../examples/address-field/demo";
import AddressMultiCountry from "../examples/address-field/multi-country";
import AddressCompact from "../examples/address-field/compact";
import RegionSelectExample from "../examples/address-field/region-select";
import AddressReadOnly from "../examples/address-field/read-only";

const entry: DocEntry = {
  slug: "address-field",
  title: "Address field",
  group: "Forms & inputs",
  description:
    "A structured postal address in one fieldset: country, then province and district pickers for countries with region data (Türkiye's 81 provinces and 973 districts ship built in, loaded on demand), free text everywhere else. Changing a parent clears its children; read-only prints the address the way the country writes it.",
  source: ["components/address-field.tsx", "locale-data/tr/address.ts", "locale-data/core/types.ts"],
  basedOn: "Fieldset · Field · native select",
  usage: `import { AddressField } from "@vamos-cms/ui";

<AddressField
  legend="Billing address"
  name="billing"                      // billing[country], billing[region1]…
  defaultValue={{ country: "TR" }}
  required={["region1", "region2", "line1"]}
  onValueChange={(address) => save(address)}
/>`,
  demo: ex("demo", "Demo", "address-field/demo.tsx", AddressFieldDemo),
  examples: [
    ex("multi-country", "Several countries", "address-field/multi-country.tsx", AddressMultiCountry, "Countries without a data source get free-text State / Province and City fields; US gets a ZIP code label. formatAddress() orders the lines per country."),
    ex("compact", "Summary + edit in a dialog", "address-field/compact.tsx", AddressCompact, "For record pages: show the formatted line, edit in a Dialog, save on confirm."),
    ex("region-select", "Region pickers alone", "address-field/region-select.tsx", RegionSelectExample, "RegionSelect works without the fieldset — location filters, branch pickers."),
    ex("read-only", "Read-only", "address-field/read-only.tsx", AddressReadOnly, "A semantic <address> block in the country's order: \"34846 Maltepe/İstanbul\", \"San Francisco, CA 94104\"."),
  ],
  api: [
    { name: "AddressField", props: [
      { name: "value / defaultValue", type: "Address | null", description: "{ country, region1?, region2?, region3?, line1?, line2?, postalCode? } — regions are official names, not codes." },
      { name: "onValueChange", type: "(address: Address) => void", description: "Every change. A new parent clears its children." },
      { name: "sources", type: "Record<string, AddressDataSource>", default: "{ TR: trAddress }", description: "Region data per country (provinces(), districts(code), both async)." },
      { name: "countries", type: "string[]", default: "all", description: "Country list (names via Intl.DisplayNames in the provider locale)." },
      { name: "defaultCountry", type: "string", default: "TR for tr locales, else the locale region", description: "Initial country when there is no value." },
      { name: "fields", type: "AddressPart[]", default: "all except region3", description: "Parts to render." },
      { name: "required", type: "AddressPart[]", description: "Required parts (asterisk + native required)." },
      { name: "errors", type: "Partial<Record<AddressPart, ReactNode>>", description: "Per-part error messages from your validation." },
      { name: "layout", type: '"grid" | "stack"', default: '"grid"', description: "Two columns from sm, or one." },
      { name: "name", type: "string", description: "Form name prefix: billing → billing[country], billing[region1]…" },
      { name: "legend / hint", type: "ReactNode", description: "Fieldset legend and helper text." },
      { name: "readOnly · disabled · size", type: "boolean · boolean · sm | md | lg", description: "Read-only renders a formatted <address>." },
      { name: "labels", type: "Partial<AddressFieldLabels>", description: "Built-in strings (address namespace)." },
    ] },
    { name: "RegionSelect", props: [
      { name: "source", type: "AddressDataSource", description: "e.g. trAddress from @vamos-cms/ui/locale-data." },
      { name: "level", type: '"province" | "district"', description: "Which list to show." },
      { name: "province", type: "string", description: "Parent province name for districts; disabled until set." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "The region name." },
      { name: "placeholder", type: "string", description: "First option text." },
    ] },
    { name: "formatAddress", props: [
      { name: "formatAddress(address, { locale?, includeCountry? })", type: "string[]", description: "Lines in the country's convention (TR, US/CA/AU, GB/IE, others)." },
    ] },
  ],
  notes: [
    "Turkish postal codes start with the plate code; a mismatch with the chosen province shows a hint, not an error.",
    "Neighbourhoods (region3) are too large to bundle — fetch them from your own endpoint and pass them in.",
  ],
  covers: ["Address field"],
};

export default entry;
