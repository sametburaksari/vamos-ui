import { Cta } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Band: accent surface by default; the primary action inverts on accent. Mono phone +
// WhatsApp line under the actions.
export default function CtaDemo() {
  return (
    <SiteFrame>
      <Cta
        title="Book the *long table*"
        lead="Up to fourteen guests, a set menu of nine plates and the wine pairing Ece picks on the day."
        actions={[
          { link: { href: "/reservations", label: "Book a table" }, style: "primary" },
          { link: { href: "/private-dining", label: "Private dining" }, style: "secondary" },
        ]}
        contact={{ phone: "+902160000000", whatsapp: "+905321234567", whatsappText: "Hi, a question about the long table:" }}
        locale="tr-TR"
      />
    </SiteFrame>
  );
}
