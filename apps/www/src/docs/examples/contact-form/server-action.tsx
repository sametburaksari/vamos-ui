"use client";

import { ContactForm } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { sendLead } from "./_actions";

// The action lives in a "use server" file (./_actions.ts):
//
//   export async function sendLead(prev: SiteFormState, data: FormData) {
//     const v = validateContactForm(fields, data, { privacyCheckbox: true });
//     if (v.spam) return { status: "success" };   // bots get a fake success
//     if (!v.ok) return v.state;                   // field errors, values kept
//     await fetch(process.env.LEADS_WEBHOOK!, { method: "POST", body: JSON.stringify(v.values) });
//     return { status: "success" };
//   }
export default function ContactFormServerAction() {
  return (
    <SiteFrame>
      <ContactForm
        variant="stacked"
        title="Write to the *studio*"
        fields={[{ name: "name", required: true }, { name: "email", required: true }, { name: "message", required: true }]}
        action={sendLead}
        privacyLink={{ href: "/privacy" }}
        privacyCheckbox
        successMessage="Thanks — it’s in our inbox. Expect a reply from a person, not a bot, within a working day."
      />
    </SiteFrame>
  );
}
