import { Cta } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { photos } from "../_site-1/assets";

// Booking embed: a static preview; the calendar iframe loads in place only after a click
// (no third-party cookies before the visitor asks).
export default function CtaBookingEmbed() {
  return (
    <SiteFrame>
      <Cta
        variant="booking"
        title="Book a free consultation"
        lead="Twenty minutes with Dr. Aylin Er, in Suadiye or by video."
        booking={{ provider: "embed", url: "https://calendly.com/lena-clinic/consultation", preview: { ...photos.spaRoom, decorative: true } }}
      />
    </SiteFrame>
  );
}
