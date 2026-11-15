import { ex, type DocEntry } from "../types";
import BillingDetailsDemo from "../examples/billing-details/demo";
import BillingDetailsTurkish from "../examples/billing-details/turkish";
import BillingDetailsCompanyOnly from "../examples/billing-details/company-only";

const entry: DocEntry = {
  slug: "billing-details",
  title: "Billing details",
  group: "Forms & inputs",
  description:
    "The buyer's party for a Turkish e-Fatura / e-Arşiv invoice: an individual / company toggle, first and last name with a TCKN, or a company title with tax office and a VKN (or the owner's TCKN for a sole proprietorship), e-mail, phone and a structured address. Fields only — the same validateBillingDetails runs in the browser and on the server and returns a normalised party with its UBL-TR scheme (TCKN / VKN). No e-invoice integration.",
  source: ["business/billing-details.tsx", "business/billing-details-core.ts", "locale-data/tr/id.ts"],
  basedOn: "Fieldset · Radio group (segmented) · ID input · Address field",
  usage: `import { BillingDetailsFields, billingDetailsFromFormData, billingErrorMessages, validateBillingDetails } from "@vamos-ui/react/business";

// page
<form action={saveBilling}>
  <BillingDetailsFields name="billing" defaultValue={{ type: "individual", address: { country: "TR" } }} />
</form>

// server action
async function saveBilling(data: FormData) {
  "use server";
  const v = validateBillingDetails(billingDetailsFromFormData(data, "billing"));
  if (!v.ok) return { errors: billingErrorMessages(v.errors) }; // pass back as errors={…}
  await customers.saveBillingParty(v.party!); // { type, name, taxId, taxScheme: "TCKN" | "VKN", taxOffice?, email, phone?, address }
}`,
  demo: ex("demo", "Demo", "billing-details/demo.tsx", BillingDetailsDemo),
  examples: [
    ex("turkish", "Turkish labels", "billing-details/turkish.tsx", BillingDetailsTurkish, "The tr dictionary (@vamos-ui/react/locale/tr) gives Bireysel / Kurumsal, Unvan, Vergi dairesi, VKN and the Turkish error messages; billingErrorMessages(errors, tr.billingDetails) formats server errors the same way."),
    ex("company-only", "Companies only, with neighbourhoods", "billing-details/company-only.tsx", BillingDetailsCompanyOnly, "types={[\"company\"]} hides the toggle (a hidden billing[type] is still posted); addressProps passes a neighbourhood source to the address fieldset; phone=\"required\"."),
  ],
  api: [
    {
      name: "BillingDetailsFields",
      props: [
        { name: "value / defaultValue / onValueChange", type: "BillingDetails", description: "{ type, firstName?, lastName?, nationalId?, companyName?, taxId?, taxOffice?, email?, phone?, address? }." },
        { name: "types", type: "BillingPartyType[]", default: '["individual", "company"]', description: "Offered party types; one type hides the toggle." },
        { name: "name", type: "string", description: "Form prefix: billing → billing[type], billing[taxId], billing[address][region1]… Read back with billingDetailsFromFormData(data, name)." },
        { name: "errors", type: "Partial<Record<BillingField, ReactNode>>", description: "Per-field messages (billingErrorMessages). The ID inputs also show their own checksum errors on blur." },
        { name: "phone", type: '"optional" | "required" | "hidden"', default: '"optional"', description: "The phone field." },
        { name: "addressProps", type: "Partial<AddressFieldProps>", description: "Passed to the address fieldset: sources (neighbourhoods), countries (default [\"TR\"]), fields, layout." },
        { name: "legend / hint / size / disabled / labels", type: "…", description: "Fieldset legend (default \"Billing details\"), helper text, control size, built-in strings (billingDetails namespace)." },
      ],
    },
    {
      name: "validateBillingDetails(details, opts)",
      props: [
        { name: "opts.allowUnknownTckn", type: "boolean", default: "false", description: "Accept 11111111111, the placeholder TCKN e-Arşiv invoices use for a consumer who gives no ID number." },
        { name: "opts.requirePhone", type: "boolean", default: "false", description: "Phone becomes required." },
        { name: "returns", type: "{ ok, errors, party? }", description: "errors: field → \"required\" | \"invalid\" | \"tooLong\" | \"unknownTckn\". party: name (full name or title), taxId digits, taxScheme, taxOffice, trimmed address." },
      ],
    },
    {
      name: "Helpers",
      props: [
        { name: "billingDetailsFromFormData(data, name = \"billing\")", type: "BillingDetails", description: "Reads the posted fields." },
        { name: "billingErrorMessages(errors, labels?, format?)", type: "Partial<Record<BillingField, string>>", description: "Codes to messages; labels from a dictionary (tr.billingDetails) for other languages." },
      ],
    },
  ],
  notes: [
    "A sole proprietorship (şahıs şirketi) invoices with the owner's TCKN, so the company tax number accepts 10-digit VKNs and 11-digit TCKNs; taxScheme tells which one it is.",
    "The tax office is free text: there is no bundled list of tax offices.",
    "Whether the buyer is registered for e-Fatura (and so gets an e-Fatura instead of an e-Arşiv invoice) is answered by your e-invoice provider, not by this form.",
  ],
  covers: ["Billing details (e-Fatura / e-Arşiv)"],
};

export default entry;
