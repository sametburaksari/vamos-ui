import { ex, type DocEntry } from "../types";
import FormattedInputDemo from "../examples/formatted-input/demo";
import CurrencyExample from "../examples/formatted-input/currency";
import NumberExample from "../examples/formatted-input/number";
import PhoneExample from "../examples/formatted-input/phone";
import IbanExample from "../examples/formatted-input/iban";
import NationalIdExample from "../examples/formatted-input/national-id";
import MaskExample from "../examples/formatted-input/mask";
import FormattedStates from "../examples/formatted-input/states";
import FormattedForm from "../examples/formatted-input/form";

const base = [
  { name: "onValueChange", type: "(value, meta: { valid, formatted, reason?, kind? }) => void", description: "Every change, with the locale-free value and what the field shows." },
  { name: "validateOn", type: '"blur" | "change"', default: '"blur"', description: "When the invalid state and onValidate kick in. Once an error shows it re-checks on every change, so it clears as the user fixes it." },
  { name: "onValidate", type: "(result: { valid, reason?, message? }) => void", description: "Localized message at validation moments — pass it to <Field error>." },
  { name: "name", type: "string", description: "Submits the raw value through a hidden input (the visible input keeps the formatted text). Falls back to the Field's name." },
  { name: "mono", type: "boolean", description: "Monospace tabular digits (default on for IBAN and ID inputs)." },
  { name: "size · variant · leading · trailing · disabled · readOnly · invalid", type: "Input props", description: "Same box as Input: density-aware sizes, ghost/nav variants, adornments, Field wiring." },
];

const entry: DocEntry = {
  slug: "formatted-input",
  title: "Formatted inputs",
  group: "Forms & inputs",
  description:
    "Business inputs that format while you type without moving the caret: money, numbers and percentages with locale separators, phone numbers with a country picker, grouped IBANs with bank lookup, and national / tax IDs with checksum rules. Values are always locale-free — a decimal string, E.164, a compact IBAN.",
  source: [
    "lib/use-formatted-input.ts",
    "components/formatted-input.tsx",
    "components/currency-input.tsx",
    "components/phone-input.tsx",
    "components/iban-input.tsx",
    "components/id-input.tsx",
    "locale-data/tr/id.ts",
    "locale-data/core/iban.ts",
  ],
  basedOn: "Input · libphonenumber-js (min, lazy) · Intl.NumberFormat",
  usage: `import { CurrencyInput, Field, IbanInput, NationalIdInput, PhoneInput } from "@vamos-ui/react";

<Field label="Amount"><CurrencyInput currency="TRY" onValueChange={(v) => setAmount(v)} /></Field>  // "1250.50"
<Field label="Mobile"><PhoneInput defaultCountry="TR" /></Field>                                   // "+905321234567"
<Field label="IBAN" error={error}><IbanInput onValidate={(r) => setError(r.message)} /></Field>    // "TR33…"
<Field label="ID number"><NationalIdInput /></Field>                                              // TCKN / YKN`,
  demo: ex("demo", "Demo", "formatted-input/demo.tsx", FormattedInputDemo),
  examples: [
    ex("currency", "Currency", "formatted-input/currency.tsx", CurrencyExample, "Grouping follows the locale; either . or , starts the decimals (group separators are inserted for you). Paste \"₺1.250,50\" or \"(42.00)\" and it parses. The value is a decimal string padded to the currency's precision."),
    ex("number", "Number and percent", "formatted-input/number.tsx", NumberExample, "NumberInput is an ARIA spinbutton: arrow keys step, Shift steps ×10, stepper buttons are optional. PercentInput puts % where the locale does (%12,5 in Turkish)."),
    ex("phone", "Phone", "formatted-input/phone.tsx", PhoneExample, "Formats for the selected country and accepts 0532…, 532…, 90532…, 0090…; typing + and a calling code switches the country. The metadata loads lazily on first mount."),
    ex("iban", "IBAN", "formatted-input/iban.tsx", IbanExample, "Groups of four as you type, capped at the country length, checked with mod-97 and the country's BBAN pattern. Turkish IBANs show the bank."),
    ex("national-id", "National and tax IDs", "formatted-input/national-id.tsx", NationalIdExample, "Checksum rules come from locale packs (tr: TCKN, YKN, VKN). masked shows 382******50 until the field is focused."),
    ex("mask", "Pattern masks", "formatted-input/mask.tsx", MaskExample, "FormattedInput takes a pattern (# digit, A letter, * either) or your own formatter object."),
    ex("states", "States", "formatted-input/states.tsx", FormattedStates, "Read-only, disabled, an error from the Field, and the small size."),
    ex("form", "In a form", "formatted-input/form.tsx", FormattedForm, "Each input submits its raw value under the Field's name — no parsing on the server."),
  ],
  api: [
    { name: "CurrencyInput", props: [
      { name: "value / defaultValue", type: "string | null", description: "Decimal string (\"1250.50\"). Never a float." },
      { name: "currency", type: "string", default: "provider currency", description: "ISO 4217 code." },
      { name: "precision", type: "number", default: "from currency", description: "Fraction digits (TRY 2, JPY 0, KWD 3)." },
      { name: "min / max", type: "string", description: "Inclusive bounds as decimal strings. Checked on blur, never clamped." },
      { name: "allowNegative", type: "boolean", default: "false", description: "Credit notes and adjustments. - toggles the sign." },
      { name: "currencyDisplay", type: '"narrowSymbol" | "symbol" | "code" | "none"', default: '"narrowSymbol"', description: "How the currency mark is shown; its side comes from the locale." },
      { name: "symbol", type: "ReactNode", description: "Custom mark, e.g. \"TL\" on printed Turkish invoices." },
      { name: "align", type: '"start" | "end"', default: '"start"', description: "end lines amounts up in totals and tables." },
      ...base,
    ] },
    { name: "NumberInput · PercentInput", props: [
      { name: "value / defaultValue", type: "number | null", description: "A JS number (PercentInput: percent units, 12.5 = 12.5%)." },
      { name: "min / max / step", type: "number", default: "step 1", description: "Bounds (checked on blur) and the arrow / stepper increment." },
      { name: "precision", type: "number", description: "Max fraction digits; 0 = whole numbers. PercentInput default 2." },
      { name: "stepper", type: "boolean", default: "false", description: "Labelled − / + buttons at the end." },
      { name: "grouping", type: "boolean", default: "true", description: "Locale grouping separators." },
    ] },
    { name: "PhoneInput", props: [
      { name: "value / defaultValue", type: "string | null", description: "E.164 (\"+905321234567\"); null while the number is incomplete." },
      { name: "country / defaultCountry / onCountryChange", type: "string", default: "TR for tr locales, else the locale region", description: "Selected country (ISO 3166-1 alpha-2)." },
      { name: "countries", type: "string[]", description: "Limit the picker." },
      { name: "preferredCountries", type: "string[]", description: "Listed first under \"Suggested\"." },
      { name: "display", type: '"national" | "international"', default: '"national"', description: "How a complete number is shown after blur." },
      { name: "hideCountry", type: "boolean", default: "false", description: "Single-country forms." },
      { name: "preloadPhoneInput()", type: "() => Promise", description: "Load the metadata early (e.g. on hover of \"Add contact\")." },
    ] },
    { name: "IbanInput", props: [
      { name: "value / defaultValue", type: "string | null", description: "Electronic format, uppercase, no spaces." },
      { name: "countries", type: "string[]", description: "Allowed countries; others fail with reason \"country\"." },
      { name: "rules", type: "IbanCountryRule[]", default: "[trIbanRule]", description: "Per-country length, BBAN pattern and bank lookup from locale packs." },
      { name: "showBank", type: "boolean | (iban) => string | undefined", default: "true", description: "Bank name next to the number." },
    ] },
    { name: "IdInput · NationalIdInput · TaxIdInput", props: [
      { name: "kind", type: '"tr-tckn" | "tr-vkn" | "tr-tax-id" | string | IdInputRule', default: "tr-tckn / tr-tax-id", description: "A registered rule or a rule object. meta.kind reports sub-kinds (tr-ykn)." },
      { name: "masked", type: "boolean", default: "false", description: "Privacy mask while not focused (123******01)." },
      { name: "registerIdRule(rule)", type: "(rule: IdInputRule) => void", description: "Add rules from locale packs or your own (charset: digits | alphanumeric)." },
    ] },
    { name: "FormattedInput", props: [
      { name: "mask", type: "string", description: "# digit, A letter, * letter or digit; other characters are literals inserted for you." },
      { name: "formatter", type: "{ accept, format, parse, toDisplay?, formatOnBlur?, validate? }", description: "Your own rules on the same caret-preserving engine (useFormattedInput)." },
      { name: "uppercase", type: "boolean", description: "Uppercase letters as typed." },
      { name: "valueFormat", type: '"unmasked" | "masked"', default: '"unmasked"', description: "Raw value with or without literals." },
    ] },
  ],
  notes: [
    "Screen readers read the formatted value; the caret never jumps when separators appear or disappear, and Backspace on a separator deletes the digit before it.",
    "Numbers and IBANs stay left-to-right (dir=\"ltr\") on RTL pages.",
    "Turkish rules come from @vamos-ui/react/locale-data (tr pack). Other countries plug in through registerIdRule and IbanInput rules.",
  ],
  covers: ["Formatted inputs (currency · phone · IBAN · ID)"],
};

export default entry;
