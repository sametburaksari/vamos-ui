import { Testimonials } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// Reviews: a sticky summary ("4.8 on Google — 1,240 reviews") beside a dated list. Imported reviews, not fetched.
export default function TestimonialsReviews() {
  return (
    <SiteFrame>
      <Testimonials
        variant="reviews"
        eyebrow="Reviews"
        title="What guests *say*"
        summary={{ rating: 4.8, count: 1240, source: "google", link: { href: "https://g.page/r/kiyi-meyhane/review", label: "Read all reviews" } }}
        items={[
          { quote: "The lakerda alone is worth the booking. Ask for a table by the window around sunset.", author: "Murat Ç.", rating: 5, source: "google", date: "2026-11-02" },
          { quote: "Great fish, attentive service, slightly loud after ten on Saturdays.", author: "Elena R.", rating: 4, source: "google", date: "2026-10-27" },
          { quote: "We booked the upstairs room for twelve. Set menu was generous and they handled two allergies without fuss.", author: "Selin Y.", rating: 5, source: "google", date: "2026-10-19" },
          { quote: "Proper meyhane, proper prices. The rakı list is long; let them recommend.", author: "Thomas B.", rating: 5, source: "tripadvisor", date: "2026-10-05" },
        ]}
      />
    </SiteFrame>
  );
}
