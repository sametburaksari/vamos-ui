import { Testimonials } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";
import { wordmark } from "../_site-1/assets";

// Feature: one large serif quote, the opening mark hanging into the margin.
export default function TestimonialsDemo() {
  return (
    <SiteFrame>
      <Testimonials
        items={[
          {
            quote: "We used to lose half our Friday bookings to missed calls. The new booking page and WhatsApp reminders brought no-shows down from one in five to one in twenty within a season.",
            author: "Deniz Arslan",
            role: "Chef-owner",
            company: "Kıyı Meyhane",
            logo: { ...wordmark("Kıyı Meyhane", "serif"), alt: "Kıyı Meyhane" },
          },
        ]}
      />
    </SiteFrame>
  );
}
