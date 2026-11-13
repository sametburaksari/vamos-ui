// Contact-form contract: field config, the action state, and a validator the app's server action
// calls with the same config the form was rendered from. React-free, zod-free, server-safe.

import { formatMessage } from "../../../lib/message-format";
import { site2Labels, type Site2BlockLabels } from "./labels-2";

export type ContactFieldName = "name" | "email" | "phone" | "company" | "subject" | "budget" | "message" | "date";

export interface ContactFieldConfig {
  name: ContactFieldName;
  required?: boolean;
  /** Overrides the built-in label ("Full name"). */
  label?: string;
  /** subject / budget: a select with these options instead of free text. */
  options?: string[];
  placeholder?: string;
  hint?: string;
  /** Max characters. Defaults: message 2000, others 160. */
  max?: number;
}

/** What the action returns; the form renders from it (also without JS, after a full round trip). */
export interface SiteFormState {
  status: "idle" | "success" | "error" | "invalid";
  /** Field name → error message. */
  errors?: Partial<Record<string, string>>;
  /** Submitted values, so a failed submit keeps what the visitor typed. */
  values?: Record<string, string>;
  /** Server error detail (shown with the fallback phone number). */
  message?: string;
  /** Changes on every submit (remounts the fields with `values`). */
  ts?: number;
}

export type SiteFormAction = (prev: SiteFormState, data: FormData) => Promise<SiteFormState>;

/** Name of the honeypot input. Real visitors never see or fill it. */
export const HONEYPOT_FIELD = "website";
/** Hidden render timestamp for the time trap. */
export const TIMESTAMP_FIELD = "_ts";
/** Hidden field with the form's id; a URL action redirects back with `?vb_sent=<id>`. */
export const FORM_FIELD = "_form";
export const SENT_PARAM = "vb_sent";
export const PRIVACY_FIELD = "privacy";
export const MARKETING_FIELD = "marketing";

const LABEL_KEY: Record<ContactFieldName, keyof typeof site2Labels> = {
  name: "fieldName",
  email: "fieldEmail",
  phone: "fieldPhone",
  company: "fieldCompany",
  subject: "fieldSubject",
  budget: "fieldBudget",
  message: "fieldMessage",
  date: "fieldDate",
};

/** The label shown for a field: config label → `labels` → English. */
export function contactFieldLabel(field: ContactFieldConfig, labels?: Site2BlockLabels | Record<string, string>): string {
  if (field.label) return field.label;
  const k = LABEL_KEY[field.name];
  const v = labels ? (labels as Record<string, unknown>)[k] : undefined;
  return typeof v === "string" ? v : site2Labels[k];
}

/** True for honeypot hits and submits faster than `minMs` after render (bots). */
export function isSpam(data: FormData, opts: { minMs?: number; now?: number } = {}): boolean {
  const trap = data.get(HONEYPOT_FIELD);
  if (typeof trap === "string" && trap.trim() !== "") return true;
  const ts = Number(data.get(TIMESTAMP_FIELD));
  if (ts > 0 && (opts.now ?? Date.now()) - ts < (opts.minMs ?? 2500)) return true;
  return false;
}

export interface ContactValidation {
  ok: boolean;
  /** Honeypot / time trap hit: answer with a fake success, store nothing. */
  spam: boolean;
  values: Record<string, string>;
  errors: Partial<Record<string, string>>;
  privacy: boolean;
  marketing: boolean;
  /** A ready state for `useActionState` (invalid with errors, or success for spam). */
  state: SiteFormState;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s().-]{7,20}$/;

/**
 * Validates a submission against the field config the form was rendered with. Call it first in
 * the app's server action — the browser runs it too, but only the server's verdict counts.
 *
 * ```ts
 * "use server";
 * export async function contact(prev: SiteFormState, data: FormData) {
 *   const v = validateContactForm(fields, data, { privacyCheckbox: true });
 *   if (v.spam) return { status: "success" };
 *   if (!v.ok) return v.state;
 *   await crm.createLead(v.values);
 *   return { status: "success" };
 * }
 * ```
 */
export function validateContactForm(
  fields: readonly ContactFieldConfig[],
  data: FormData,
  opts: { privacyCheckbox?: boolean; labels?: Site2BlockLabels | Record<string, string>; locale?: string; spamMinMs?: number } = {},
): ContactValidation {
  const merged: Record<string, string> = { ...site2Labels };
  if (opts.labels) for (const [k, v] of Object.entries(opts.labels)) if (typeof v === "string") merged[k] = v;
  const t = (k: keyof typeof site2Labels, vars?: Record<string, unknown>) => formatMessage(merged[k] ?? k, vars, opts.locale ?? "en-US");
  const values: Record<string, string> = {};
  const errors: Partial<Record<string, string>> = {};

  for (const f of fields) {
    const raw = data.get(f.name);
    const v = typeof raw === "string" ? raw.trim() : "";
    values[f.name] = v;
    const label = contactFieldLabel(f, merged);
    const max = f.max ?? (f.name === "message" ? 2000 : 160);
    if (!v) {
      if (f.required) errors[f.name] = t("errorRequired", { field: label.toLowerCase() });
      continue;
    }
    if (v.length > max) errors[f.name] = t("errorTooLong", { field: label.toLowerCase(), max });
    else if (f.name === "email" && !EMAIL_RE.test(v)) errors[f.name] = t("errorEmail");
    else if (f.name === "phone" && !PHONE_RE.test(v)) errors[f.name] = t("errorPhone");
    else if (f.options?.length && !f.options.includes(v)) errors[f.name] = t("errorRequired", { field: label.toLowerCase() });
  }
  const privacy = data.get(PRIVACY_FIELD) === "on" || data.get(PRIVACY_FIELD) === "true";
  const marketing = data.get(MARKETING_FIELD) === "on" || data.get(MARKETING_FIELD) === "true";
  if (opts.privacyCheckbox && !privacy) errors[PRIVACY_FIELD] = t("privacyRequired");

  const spam = isSpam(data, { minMs: opts.spamMinMs });
  const ok = Object.keys(errors).length === 0;
  const state: SiteFormState = spam ? { status: "success", ts: Date.now() } : ok ? { status: "success", ts: Date.now() } : { status: "invalid", errors, values, ts: Date.now() };
  return { ok, spam, values, errors, privacy, marketing, state };
}

/** HTML constraints for a field (the no-JS path relies on these). */
export function fieldConstraints(f: ContactFieldConfig): { type: string; autoComplete?: string; inputMode?: "tel" | "email" | "text"; maxLength: number } {
  const maxLength = f.max ?? (f.name === "message" ? 2000 : 160);
  switch (f.name) {
    case "name":
      return { type: "text", autoComplete: "name", maxLength };
    case "email":
      return { type: "email", autoComplete: "email", inputMode: "email", maxLength };
    case "phone":
      return { type: "tel", autoComplete: "tel", inputMode: "tel", maxLength };
    case "company":
      return { type: "text", autoComplete: "organization", maxLength };
    case "date":
      return { type: "date", maxLength };
    default:
      return { type: "text", maxLength };
  }
}
