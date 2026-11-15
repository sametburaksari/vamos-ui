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
    "A structured postal address in one fieldset, laid out the way each country writes addresses: Germany gets street, PLZ and city; the US street, city, state and ZIP code; Japan postal code, prefecture and street; the Emirates no postal code at all. Labels follow the country (Prefecture, Emirate, PIN code, Eircode), postal codes are checked against its pattern, and states, provinces, prefectures and emirates of 202 countries are pickers (one small file per country, loaded when it is picked); the formats for 250 countries load as one 5.5 kB chunk on first use. Türkiye's 81 provinces and 973 districts are cascading pickers (built in, loaded on demand), with an optional neighbourhood level of about 50 000 neighbourhoods and villages, one small file per province. Changing a parent clears its children; read-only prints the address the way the country writes it.",
  source: ["components/address-field.tsx", "locale-data/world/formats.ts", "locale-data/world/format-address.ts", "locale-data/world/subdivisions.ts", "locale-data/tr/address.ts", "locale-data/tr/neighbourhoods.ts", "locale-data/core/types.ts"],
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
    ex("multi-country", "Every country", "address-field/multi-country.tsx", AddressMultiCountry, "Switch the country: the parts, their order and their names change with it (US: City · State · ZIP code; JP: Postal code · Prefecture; AE: Emirate, no postal code). A postal code that does not fit the country's pattern gets a hint with an example; one that fits once upper-cased is normalised on blur. formatAddress() prints the lines in the same order."),
    ex("compact", "Summary + edit in a dialog", "address-field/compact.tsx", AddressCompact, "For record pages: show the formatted line, edit in a Dialog, save on confirm."),
    ex("region-select", "Region pickers alone", "address-field/region-select.tsx", RegionSelectExample, "RegionSelect works without the fieldset — location filters, branch pickers. country=\"US\" lists a country's subdivisions; source={trAddress} cascades province → district."),
    ex("read-only", "Read-only", "address-field/read-only.tsx", AddressReadOnly, "A semantic <address> block in the country's order: \"34844 Maltepe/İstanbul\", \"San Francisco, CA 94104\"."),
  ],
  api: [
    { name: "AddressField", props: [
      { name: "value / defaultValue", type: "Address | null", description: "{ country, region1?, region2?, region3?, line1?, line2?, postalCode? } — regions are official names, not codes." },
      { name: "onValueChange", type: "(address: Address) => void", description: "Every change. A new parent clears its children." },
      { name: "sources", type: "Record<string, AddressDataSource>", default: "{ TR: trAddress }", description: "Cascading region data per country (provinces(), districts(code), optional neighbourhoods(province, district); all async). trAddressWithNeighbourhoods adds the mahalle level." },
      { name: "subdivisions", type: "SubdivisionLoader | false", default: "bundled files", description: "State / province / prefecture lists for the other countries: the 202 files in the package, one lazy chunk per country. subdivisionsFromUrl(\"/data/subdivisions/{cc}.json\") serves them yourself; false keeps a text field." },
      { name: "countries", type: "string[]", default: "all", description: "Country list (names via Intl.DisplayNames in the provider locale)." },
      { name: "defaultCountry", type: "string", default: "TR for tr locales, else the locale region", description: "Initial country when there is no value." },
      { name: "fields", type: "AddressPart[]", default: "the country's parts", description: "Parts to render. Default: the parts the country's addresses use, in its order (no state for DE, no postal code for AE); with a cascading source all parts, region3 only with neighbourhoods." },
      { name: "required", type: 'AddressPart[] | "auto"', description: "Required parts (asterisk + native required). \"auto\" uses the country's rules (US: street, city, state, ZIP)." },
      { name: "errors", type: "Partial<Record<AddressPart, ReactNode>>", description: "Per-part error messages from your validation." },
      { name: "layout", type: '"grid" | "stack"', default: '"grid"', description: "Rows as the country writes them, side by side from sm (City · State · ZIP on one row for the US), or one column." },
      { name: "name", type: "string", description: "Form name prefix: billing → billing[country], billing[region1]…" },
      { name: "legend / hint", type: "ReactNode", description: "Fieldset legend and helper text." },
      { name: "readOnly · disabled · size", type: "boolean · boolean · sm | md | lg", description: "Read-only renders a formatted <address>." },
      { name: "labels", type: "Partial<AddressFieldLabels>", description: "Built-in strings (address namespace)." },
    ] },
    { name: "RegionSelect", props: [
      { name: "country", type: "string", description: "Lists that country's subdivisions (no source needed). Values are what an address writes (US: \"CA\"; JP: \"東京都\", or \"Tokyo\" in a non-Japanese UI); options show names in the UI language when the country's own differs. A stored name or ISO code (\"California\", \"US-CA\") selects its option." },
      { name: "subdivisions", type: "SubdivisionLoader", default: "bundled files", description: "Where country files come from." },
      { name: "source", type: "AddressDataSource", description: "Cascading data instead, e.g. trAddress from @vamos-ui/react/locale-data." },
      { name: "level", type: '"province" | "district" | "neighbourhood"', default: '"province"', description: "With a source: which list to show. neighbourhood needs a source with a neighbourhoods level." },
      { name: "province / district", type: "string", description: "Parent names; the select is disabled until they are set." },
      { name: "onOptionChange", type: "(option: RegionOption | null) => void", description: "The picked option; a neighbourhood option carries { name, label, kind, town?, postalCode? }, a subdivision { code (ISO 3166-2), value, label, name, localName }." },
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
      { name: "formatAddress(address, { locale?, includeCountry?, format?, postal?, latin? })", type: "string[]", description: "Lines in the country's convention. format: pass await loadAddressFormat(cc) to be exact before the data has loaded (otherwise built-in rules for TR, US, CA, AU, GB, DE). postal: capitals where the country wants them (GB town and postcode). latin: the Latin-script order for JP, CN, KR… (default: when the address is in Latin script)." },
    ] },
    { name: "Subdivisions (locale-data)", props: [
      { name: "bundledSubdivisions", type: "SubdivisionLoader", description: "@vamos-ui/react/locale-data/world-subdivisions: the package files, one lazy chunk per country (0.1–9 kB raw; 196 kB for all 202 countries)." },
      { name: "subdivisionsFromUrl(url, { fetch?, init? })", type: "SubdivisionLoader", description: "Files the app serves: a template with {cc} (US) or {cc_lower} (us), or a function. A 404 means \"none\". Copy them from @vamos-ui/react/locale-data/world/subdivisions/*.json." },
      { name: "createSubdivisionLoader(load) · loadSubdivisions(loader, cc, locale) · findSubdivision(list, text)", type: "", description: "Any other origin (cached per country, failures retried); entries for a locale; lookup by value, name or ISO code." },
    ] },
    { name: "Address formats (locale-data)", props: [
      { name: "loadAddressFormat(country)", type: "Promise<AddressFormat>", description: "{ fields, required, upper, kinds: { region1: \"state\" | \"prefecture\" | \"emirate\" …, postalCode: \"zip\" | \"pin\" … }, postalCode?: { pattern, examples, prefix? }, lines, latinLines? }. One lazy chunk for all countries, cached." },
      { name: "checkPostalCode(code, format)", type: "{ status, value }", description: "status ok | format | empty | none (no postal codes); value is trimmed and upper-cased, the printed prefix (CH-) removed." },
      { name: "validateAddress(address, format, { required? })", type: "Partial<Record<AddressPart, \"required\" | \"format\">>", description: "The same rules on the server: required parts and the postal code pattern." },
    ] },
  ],
  notes: [
    "Address formats (field order, required fields, upper-casing, field names, postal code patterns and examples) come from Google's Address Data Service, the metadata behind libaddressinput and Chromium autofill, licensed CC BY 4.0 (© Google LLC). packages/ui/scripts/world-address.mjs regenerates locale-data/world/address-formats.json and stamps the source, licence and date in it.",
    "Turkish postal codes start with the plate code; a mismatch with the chosen province shows a hint, not an error.",
    "Neighbourhood data: github.com/ubeydeozdmr/turkiye-api (MIT), names from TÜİK MEDAS, postal codes from PTT (official codes only), 32 279 neighbourhoods and 18 183 villages. Every province file carries its source, licence and generation date; district codes are checked against the province / district list when the files are regenerated (packages/ui/scripts/tr-neighbourhoods.mjs).",
    "Subdivisions: where Google's address data lists the regions addresses use (61 countries: US states with their postal codes, JP prefectures, IT and ES provinces, AE emirates…), that list with its ISO 3166-2 ids (CC BY 4.0, © Google LLC); for the other 140 countries the level-1 subdivisions of Unicode CLDR with English and local-language names (Unicode License v3, © Unicode, Inc.). Türkiye uses the official province names of the built-in list. Every file carries its source, licence and date.",
    "trAddress alone never loads neighbourhood data; only a source built with withNeighbourhoods does, and only for the province being edited.",
  ],
  covers: ["Address field"],
};

export default entry;
