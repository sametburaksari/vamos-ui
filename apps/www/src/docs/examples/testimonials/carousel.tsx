import { Testimonials } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Carousel: scroll-snap track, arrow buttons beside the title, "2 / 5" counter, ←/→ on the track. No autoplay.
export default function TestimonialsCarousel() {
  return (
    <SiteFrame>
      <Testimonials
        variant="carousel"
        title="Guests after a *visit*"
        items={[
          { quote: "The kese was exactly as hard as I asked for, and the foam massage afterwards was worth the trip across the city.", author: "Melis T.", role: "Guest" },
          { quote: "Booked at 11 pm on my phone, confirmed on WhatsApp a minute later. Easiest spa booking I’ve made.", author: "Oğuz A.", role: "Guest" },
          { quote: "We came for a couples’ treatment for our anniversary. Quiet room, warm tea, no upselling.", author: "Ece and Tolga", role: "Guests" },
          { quote: "The 80-minute deep tissue sorted a shoulder that had bothered me for months.", author: "Hakan B.", role: "Member" },
          { quote: "Clean, unhurried, and the staff remembered my name on the second visit.", author: "Jana K.", role: "Guest from Prague" },
        ]}
      />
    </SiteFrame>
  );
}
