import { Faq } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Split: sticky title + "Can't find your question?" link, native <details name> accordion
// (one open at a time, 0 JS). #faq-is-there-parking opens that answer on load.
export default function FaqDemo() {
  return (
    <SiteFrame>
      <Faq
        eyebrow="Visiting"
        title="Before you *book*"
        openFirst
        contact={{ link: { href: "https://wa.me/905321234567", label: "Message us on WhatsApp", newTab: true }, style: "link" }}
        items={[
          { q: "Is there parking?", a: "Yes — the Piazza garage, level −2. Show your receipt at the exit for three hours free." },
          { q: "Can I cancel or move a booking?", a: "Free until 24 hours before. After that we keep the ₺500 deposit per person, or move it to another date within a month." },
          { q: "Do you cater for allergies and vegetarians?", a: "Tell us when you book. Every dish on the menu lists its 14 allergens, and two-thirds of the meze are vegetarian." },
          { q: "Can we bring a cake?", a: "Of course. We’ll keep it cold and bring it out with candles; there’s no plating charge." },
          { q: "Do you take card and Troy?", a: "Visa, Mastercard, Amex and Troy. We don’t accept cheques or meal cards." },
        ]}
      />
    </SiteFrame>
  );
}
