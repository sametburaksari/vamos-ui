"use server";

import { validateContactForm, type ContactFieldConfig, type SiteFormState } from "@vamos-cms/ui/blocks";

const leadFields: ContactFieldConfig[] = [
  { name: "name", required: true },
  { name: "email", required: true },
  { name: "message", required: true },
];

// A Next.js server action: validate with the SAME field config, drop spam silently, post the
// lead to a webhook, return a state the form renders (works without JavaScript too).
export async function sendLead(_prev: SiteFormState, data: FormData): Promise<SiteFormState> {
  const v = validateContactForm(leadFields, data, { privacyCheckbox: true });
  if (v.spam) return { status: "success" }; // bots get a fake success
  if (!v.ok) return v.state;
  // await fetch(process.env.LEADS_WEBHOOK!, { method: "POST", body: JSON.stringify({ ...v.values, marketing: v.marketing }) });
  await new Promise((r) => setTimeout(r, 600));
  return { status: "success" };
}
