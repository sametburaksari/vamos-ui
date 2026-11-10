import { ContactForm } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// States, rendered from `initialState` (what your action returns): field errors with a linked
// summary, a server error with the fallback phone number, and success.
export default function ContactFormStates() {
  return (
    <div className="grid w-full gap-6">
      <SiteFrame>
        <ContactForm
          variant="stacked"
          title="Field errors"
          initialState={{
            status: "invalid",
            values: { name: "", email: "ayse@kidwell", message: "We need a site for two clinics." },
            errors: { name: "Please fill in full name.", email: "Enter an email address like name@company.com." },
          }}
        />
      </SiteFrame>
      <SiteFrame>
        <ContactForm variant="stacked" title="Server error" info={{ phone: "+902168072907" }} showInfo={false} initialState={{ status: "error", values: { name: "Ayşe Demir", email: "ayse@kidwell.com.tr", message: "Two clinics." } }} />
      </SiteFrame>
      <SiteFrame>
        <ContactForm variant="stacked" title="Sent" initialState={{ status: "success" }} successMessage="Thanks Ayşe — we’ll call you back today before 18:00." />
      </SiteFrame>
    </div>
  );
}
