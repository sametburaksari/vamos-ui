import { ContactForm } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Minimal: name, contact and message with the button in the same row — under a CTA.
export default function ContactFormMinimal() {
  return (
    <SiteFrame>
      <ContactForm
        variant="minimal"
        title="Planning a group dinner?"
        fields={[{ name: "name", required: true }, { name: "phone", required: true }, { name: "message", label: "Date and party size", required: true }]}
        submitLabel="Ask us"
        successMessage="Thanks — we’ll call you back today before 18:00."
      />
    </SiteFrame>
  );
}
