import { ContactForm } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { clinicHours } from "../_site-2/data";

// Split: contact details as a typographic list (big phone number), the form beside it.
// Without `action` the form validates in the browser only — pass your server action in a real site.
export default function ContactFormDemo() {
  return (
    <SiteFrame>
      <ContactForm
        eyebrow="Contact"
        title="Ask us *anything*"
        lead="Questions about a treatment, a price or an appointment — we answer within one working day."
        fields={[
          { name: "name", required: true },
          { name: "phone", required: true, hint: "We call back from 0216 000 00 00." },
          { name: "email" },
          { name: "subject", options: ["Laser treatment", "Facial", "Post-op care", "Something else"] },
          { name: "message", required: true, placeholder: "Which treatment, which branch, any preferred days…" },
        ]}
        privacyLink={{ href: "/kvkk", label: "privacy notice (KVKK)" }}
        privacyCheckbox
        marketingConsent
        info={{
          phone: "+902160000000",
          email: "info@lenaclinic.com.tr",
          address: { line: "Abdi İpekçi Caddesi 21, Kat 3", district: "Nişantaşı", city: "Şişli", postalCode: "34367", country: "TR" },
          hours: clinicHours,
        }}
      />
    </SiteFrame>
  );
}
