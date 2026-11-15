"use client";

import { EmailCapture } from "@vamos-ui/react";
import { validateContactForm, type SiteFormState } from "@vamos-ui/react/blocks";

// In an app this is a "use server" function; validateContactForm is the same check ContactForm uses.
async function subscribe(_prev: SiteFormState, data: FormData): Promise<SiteFormState> {
  const v = validateContactForm([{ name: "email", required: true }], data, { privacyCheckbox: true });
  if (v.spam) return { status: "success" };
  if (!v.ok) return v.state;
  await new Promise((r) => setTimeout(r, 600)); // await mailingList.add(v.values.email, { notice: v.noticeVersion })
  return { status: "success" };
}

export default function EmailCaptureServerAction() {
  return (
    <div className="w-full max-w-xl">
      <EmailCapture action={subscribe} privacyCheckbox privacyLink={{ href: "#privacy", label: "privacy notice", version: "2026-01" }} />
    </div>
  );
}
