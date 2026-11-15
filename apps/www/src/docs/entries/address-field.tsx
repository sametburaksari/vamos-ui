import { ex, type DocEntry } from "../types";
import AddressFieldDemo from "../examples/address-field/demo";
import AddressMultiCountry from "../examples/address-field/multi-country";
import AddressCompact from "../examples/address-field/compact";
import RegionSelectExample from "../examples/address-field/region-select";
import AddressReadOnly from "../examples/address-field/read-only";
import AddressNeighbourhoods from "../examples/address-field/neighbourhoods";

const entry: DocEntry = {
  slug: "address-field",
  title: "Address field",
  group: "Forms & inputs",
  description:
    "A structured postal address in one fieldset: country, then province and district pickers for countries with region data (Türkiye's 81 provinces and 973 districts ship built in, loaded on demand), free text everywhere else. An optional neighbourhood (mahalle / köy) level adds about 50 000 Turkish neighbourhoods and villages, one small file per province, loaded only when that province is picked. Changing a parent clears its children; read-only prints the address the way the country writes it.",
  source: ["components/address-field.tsx", "locale-data/tr/address.ts", "locale-data/tr/neighbourhoods.ts", "locale-data/core/types.ts"],
  basedOn: "Fieldset · Field · native select",
  usage: `import { AddressField } from "@vamos-ui/react";

<AddressField
  legend="Billing address"
  name="billing"                      // billing[country], billing[region1]…
  defaultValue={{ country: "TR" }}
  required={["region1", "region2", "line1"]}
  onValueChange={(address) => save(address)}
/>`,
  demo: ex("demo", "Demo", "address-field/demo.tsx", AddressFieldDemo),
  examples: [
    ex("neighbourhoods", "Neighbourhoods (mahalle)", "address-field/neighbourhoods.tsx", AddressNeighbourhoods, "sources={{ TR: trAddressWithNeighbourhoods }} adds a third picker. Values are labels such as \"Caferağa Mah.\" or \"Akören Köyü\" (a town's neighbourhood carries the town: \"Cami Mah. (Pınarbaşı)\"), so every option in a district is unique. Picking one fills the postal code unless the visitor typed their own."),
    ex("multi-country", "Several countries", "address-field/multi-country.tsx", AddressMultiCountry, "Countries without a data source get free-text State / Province and City fields; US gets a ZIP code label. formatAddress() orders the lines per country."),
    ex("compact", "Summary + edit in a dialog", "address-field/compact.tsx", AddressCompact, "For record pages: show the formatted line, edit in a Dialog, save on confirm."),
    ex("region-select", "Region pickers alone", "address-field/region-select.tsx", RegionSelectExample, "RegionSelect works without the fieldset — location filters, branch pickers."),
    ex("read-only", "Read-only", "address-field/read-only.tsx", AddressReadOnly, "A semantic <address> block in the country's order: \"34844 Maltepe/İstanbul\", \"San Francisco, CA 94104\"."),
  ],
  api: [
    { name: "AddressField", props: [
      { name: "value / defaultValue", type: "Address | null", description: "{ country, region1?, region2?, region3?, line1?, line2?, postalCode? } — regions are official names, not codes." },
      { name: "onValueChange", type: "(address: Address) => void", description: "Every change. A new parent clears its children." },
      { name: "sources", type: "Record<string, AddressDataSource>", default: "{ TR: trAddress }", description: "Region data per country (provinces(), districts(code), optional neighbourhoods(province, district); all async). trAddressWithNeighbourhoods adds the mahalle level." },
      { name: "countries", type: "string[]", default: "all", description: "Country list (names via Intl.DisplayNames in the provider locale)." },
      { name: "defaultCountry", type: "string", default: "TR for tr locales, else the locale region", description: "Initial country when there is no value." },
      { name: "fields", type: "AddressPart[]", default: "all; region3 only with a neighbourhood source", description: "Parts to render. region3 without a neighbourhood source is a text input." },
      { name: "required", type: "AddressPart[]", description: "Required parts (asterisk + native required)." },
      { name: "errors", type: "Partial<Record<AddressPart, ReactNode>>", description: "Per-part error messages from your validation." },
      { name: "layout", type: '"grid" | "stack"', default: '"grid"', description: "Two columns from sm, or one." },
      { name: "name", type: "string", description: "Form name prefix: billing → billing[country], billing[region1]…" },
      { name: "legend / hint", type: "ReactNode", description: "Fieldset legend and helper text." },
      { name: "readOnly · disabled · size", type: "boolean · boolean · sm | md | lg", description: "Read-only renders a formatted <address>." },
      { name: "labels", type: "Partial<AddressFieldLabels>", description: "Built-in strings (address namespace)." },
    ] },
    { name: "RegionSelect", props: [
      { name: "source", type: "AddressDataSource", description: "e.g. trAddress from @vamos-ui/react/locale-data." },
      { name: "level", type: '"province" | "district" | "neighbourhood"', description: "Which list to show. neighbourhood needs a source with a neighbourhoods level." },
      { name: "province / district", type: "string", description: "Parent names; the select is disabled until they are set." },
      { name: "onOptionChange", type: "(option: RegionOption | null) => void", description: "The picked option; a neighbourhood option carries { name, label, kind, town?, postalCode? }." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "The region name." },
      { name: "placeholder", type: "string", description: "First option text." },
    ] },
    { name: "Neighbourhood loaders (locale-data)", props: [
      { name: "trAddressWithNeighbourhoods", type: "AddressDataSource", description: "@vamos-ui/react/locale-data/tr-neighbourhoods: trAddress plus the files shipped in the package, one lazy chunk per province (7–37 kB raw, 1–8 kB gzip)." },
      { name: "trNeighbourhoodsFromUrl(url, { fetch?, init? })", type: "NeighbourhoodLoader", description: "Fetches province files the app serves: a template with {plate} (34) or {plate2} (01), or a function. Copy the files from @vamos-ui/react/locale-data/tr/neighbourhoods/*.json." },
      { name: "createTrNeighbourhoodLoader(load)", type: "NeighbourhoodLoader", description: "Any other origin (database, internal API) returning the same TrNeighbourhoodFile shape. One load per province, failures retried." },
      { name: "withNeighbourhoods(source, loader)", type: "AddressDataSource", description: "Adds the level to a source; trAddress itself stays two levels." },
    ] },
    { name: "formatAddress", props: [
      { name: "formatAddress(address, { locale?, includeCountry? })", type: "string[]", description: "Lines in the country's convention (TR, US/CA/AU, GB/IE, others)." },
    ] },
  ],
  notes: [
    "Turkish postal codes start with the plate code; a mismatch with the chosen province shows a hint, not an error.",
    "Neighbourhood data: github.com/ubeydeozdmr/turkiye-api (MIT), names from TÜİK MEDAS, postal codes from PTT (official codes only), 32 279 neighbourhoods and 18 183 villages. Every province file carries its source, licence and generation date; district codes are checked against the province / district list when the files are regenerated (packages/ui/scripts/tr-neighbourhoods.mjs).",
    "trAddress alone never loads neighbourhood data; only a source built with withNeighbourhoods does, and only for the province being edited.",
  ],
  covers: ["Address field"],
};

export default entry;
