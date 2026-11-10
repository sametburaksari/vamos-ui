import { ContactForm } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Stacked quote request: one 42rem column, subject and budget as native selects.
export default function ContactFormStackedQuote() {
  return (
    <SiteFrame>
      <ContactForm
        variant="stacked"
        eyebrow="New project"
        title="Tell us about the *project*"
        lead="A written quote within two working days. No sales calls unless you ask for one."
        submitLabel="Request a quote"
        fields={[
          { name: "name", required: true },
          { name: "email", required: true },
          { name: "company" },
          { name: "date", label: "Ideal launch date" },
          { name: "subject", label: "What do you need?", required: true, options: ["New website", "Booking system", "Google Ads management", "Maintenance"] },
          { name: "budget", options: ["Under $5,000", "$5,000–15,000", "$15,000–40,000", "Over $40,000"] },
          { name: "message", required: true, label: "Project details", placeholder: "Who it’s for, what exists today, what should change." },
        ]}
        privacyLink={{ href: "/privacy" }}
      />
    </SiteFrame>
  );
}
