/**
 * Billing details for Turkish e-invoices (e-Fatura / e-Arşiv): the buyer's party as the invoice
 * needs it. React-free and server-safe — the same validation runs in the browser and in the app's
 * server action. Fields only: no e-invoice integration.
 *
 * - individual (bireysel): first and last name, TCKN (or YKN for foreign residents);
 * - company (kurumsal): title (unvan), tax office (vergi dairesi), and a VKN — or the owner's TCKN
 *   for a sole proprietorship (şahıs şirketi), which invoices with it;
 * - both: e-mail (where the e-Arşiv invoice goes), optional phone, a structured address.
 */
import { trTaxSchemeId, validateTckn, validateTrTaxId } from "../locale-data/tr/id";
import type { Address } from "../components/address-field";

export type BillingPartyType = "individual" | "company";

export interface BillingDetails {
  type: BillingPartyType;
  /** individual */
  firstName?: string;
  lastName?: string;
  /** individual: TCKN or YKN. */
  nationalId?: string;
  /** company: legal title (unvan). */
  companyName?: string;
  /** company: VKN, or the owner's TCKN for a sole proprietorship. */
  taxId?: string;
  /** company: tax office (vergi dairesi). */
  taxOffice?: string;
  email?: string;
  phone?: string;
  address?: Address;
}

export type BillingField = "type" | "firstName" | "lastName" | "nationalId" | "companyName" | "taxId" | "taxOffice" | "email" | "phone" | "line1" | "region1" | "region2";

export type BillingErrorCode = "required" | "invalid" | "tooLong" | "unknownTckn";

/** What an invoice integration needs, normalised. */
export interface BillingParty {
  type: BillingPartyType;
  /** Full name ("Deniz Kaya") or the company title. */
  name: string;
  firstName?: string;
  lastName?: string;
  /** Digits only. */
  taxId: string;
  /** UBL-TR `PartyIdentification@schemeID`. */
  taxScheme: "TCKN" | "VKN";
  taxOffice?: string;
  email: string;
  phone?: string;
  address: Address;
}

export interface BillingValidation {
  ok: boolean;
  errors: Partial<Record<BillingField, BillingErrorCode>>;
  /** Set when `ok`. */
  party?: BillingParty;
}

export interface ValidateBillingOptions {
  /**
   * Accept `11111111111` as an individual's TCKN — the placeholder e-Arşiv invoices use for a
   * consumer who gives no ID number. Default false.
   */
  allowUnknownTckn?: boolean;
  /** Require a phone number. Default false. */
  requirePhone?: boolean;
}

/** Placeholder TCKN for e-Arşiv invoices to consumers without an ID number. */
export const UNKNOWN_TCKN = "11111111111";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;
const clean = (v: unknown) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");
const digits = (v: unknown) => (typeof v === "string" ? v.replace(/[\s\-.]/g, "") : "");

/**
 * Validates billing details and builds the normalised party.
 *
 * ```ts
 * const v = validateBillingDetails(billingDetailsFromFormData(data));
 * if (!v.ok) return { status: "invalid", errors: billingErrorMessages(v.errors) };
 * await invoices.create({ buyer: v.party! });
 * ```
 */
export function validateBillingDetails(d: BillingDetails, opts: ValidateBillingOptions = {}): BillingValidation {
  const errors: BillingValidation["errors"] = {};
  const type = d?.type;
  if (type !== "individual" && type !== "company") return { ok: false, errors: { type: "required" } };
  const text = (field: BillingField, v: unknown, max: number, required = true) => {
    const s = clean(v);
    if (!s) {
      if (required) errors[field] = "required";
    } else if (s.length > max) errors[field] = "tooLong";
    return s;
  };

  let taxId = "";
  let taxScheme: "TCKN" | "VKN" = "TCKN";
  const firstName = type === "individual" ? text("firstName", d.firstName, 80) : "";
  const lastName = type === "individual" ? text("lastName", d.lastName, 80) : "";
  const companyName = type === "company" ? text("companyName", d.companyName, 250) : "";
  const taxOffice = type === "company" ? text("taxOffice", d.taxOffice, 80) : "";
  if (type === "individual") {
    const raw = digits(d.nationalId);
    if (!raw) errors.nationalId = "required";
    else if (raw === UNKNOWN_TCKN) {
      if (opts.allowUnknownTckn) taxId = raw;
      else errors.nationalId = "unknownTckn";
    } else {
      const r = validateTckn(raw);
      if (r.valid) taxId = r.value;
      else errors.nationalId = "invalid";
    }
  } else {
    const raw = digits(d.taxId);
    const r = validateTrTaxId(raw);
    if (!raw) errors.taxId = "required";
    else if (!r.valid) errors.taxId = "invalid";
    else {
      taxId = r.value;
      taxScheme = trTaxSchemeId(r) ?? "VKN";
    }
  }

  const email = clean(d.email);
  if (!email) errors.email = "required";
  else if (email.length > 160) errors.email = "tooLong";
  else if (!EMAIL_RE.test(email)) errors.email = "invalid";
  const phone = clean(d.phone);
  if (!phone) {
    if (opts.requirePhone) errors.phone = "required";
  } else if (!PHONE_RE.test(phone)) errors.phone = "invalid";

  const a = d.address ?? { country: "TR" };
  const country = (a.country || "TR").toUpperCase();
  const line1 = text("line1", a.line1, 250);
  const region1 = text("region1", a.region1, 80);
  const region2 = text("region2", a.region2, 80);

  const ok = Object.keys(errors).length === 0;
  if (!ok) return { ok, errors };
  const address: Address = { country, region1, region2, line1 };
  for (const k of ["region3", "line2", "postalCode"] as const) {
    const v = clean(a[k]);
    if (v) address[k] = v;
  }
  const party: BillingParty =
    type === "individual"
      ? { type, name: `${firstName} ${lastName}`, firstName, lastName, taxId, taxScheme: "TCKN", email, address }
      : { type, name: companyName, taxId, taxScheme, taxOffice, email, address };
  if (phone) party.phone = phone;
  return { ok, errors, party };
}

/** English defaults for the field labels and error messages (the `billingDetails` namespace). */
export const billingDetailsLabels = {
  legend: "Billing details",
  type: "Invoice to",
  individual: "Individual",
  company: "Company",
  firstName: "First name",
  lastName: "Last name",
  nationalId: "Turkish ID number (TCKN)",
  nationalIdHint: "Foreign residents: the 99… number (YKN).",
  companyName: "Company title",
  taxId: "Tax number (VKN)",
  taxIdHint: "Sole proprietorships use the owner's TCKN.",
  taxOffice: "Tax office",
  email: "Email",
  emailHint: "The invoice is sent here.",
  phone: "Phone",
  address: "Billing address",
  street: "Street address",
  province: "Province",
  district: "District",
  required: "{field} is required",
  invalid: "{field} isn't valid. Check it for typos.",
  tooLong: "{field} is too long",
  unknownTckn: "Enter the real ID number",
};
export type BillingDetailsLabels = typeof billingDetailsLabels;

const FIELD_LABEL: Record<BillingField, keyof BillingDetailsLabels> = {
  type: "type",
  firstName: "firstName",
  lastName: "lastName",
  nationalId: "nationalId",
  companyName: "companyName",
  taxId: "taxId",
  taxOffice: "taxOffice",
  email: "email",
  phone: "phone",
  line1: "street",
  region1: "province",
  region2: "district",
};

/** Error codes → messages (server actions; the component does this itself). */
export function billingErrorMessages(
  errors: BillingValidation["errors"],
  labels: Partial<BillingDetailsLabels> = {},
  format: (template: string, vars: Record<string, string>) => string = (t, v) => t.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? ""),
): Partial<Record<BillingField, string>> {
  const L = { ...billingDetailsLabels, ...labels };
  const out: Partial<Record<BillingField, string>> = {};
  for (const [field, code] of Object.entries(errors) as [BillingField, BillingErrorCode][]) {
    // "Turkish ID number (TCKN)" → "Turkish ID number"
    out[field] = format(L[code], { field: L[FIELD_LABEL[field]].replace(/\s*\([^)]*\)\s*$/, "") });
  }
  return out;
}

/** Reads the fields `BillingDetailsFields` posts (`billing[type]`, `billing[address][region1]`…). */
export function billingDetailsFromFormData(data: FormData, name = "billing"): BillingDetails {
  const get = (k: string) => {
    const v = data.get(`${name}[${k}]`);
    return typeof v === "string" ? v : undefined;
  };
  const addr = (k: string) => {
    const v = data.get(`${name}[address][${k}]`);
    return typeof v === "string" && v !== "" ? v : undefined;
  };
  const type = get("type");
  return {
    type: type === "company" ? "company" : type === "individual" ? "individual" : (type as BillingPartyType),
    firstName: get("firstName"),
    lastName: get("lastName"),
    nationalId: get("nationalId"),
    companyName: get("companyName"),
    taxId: get("taxId"),
    taxOffice: get("taxOffice"),
    email: get("email"),
    phone: get("phone"),
    address: {
      country: addr("country") ?? "TR",
      region1: addr("region1"),
      region2: addr("region2"),
      region3: addr("region3"),
      line1: addr("line1"),
      line2: addr("line2"),
      postalCode: addr("postalCode"),
    },
  };
}
