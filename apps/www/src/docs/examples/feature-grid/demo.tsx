import { FeatureGrid } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// List (default): two columns of rows — hairline, mono index, title, text. No cards, no icons.
export default function FeatureGridDemo() {
  return (
    <SiteFrame>
      <FeatureGrid
        eyebrow="Services"
        title="What we *build*"
        lead="Four things, done properly. Everything else we hand to people who do it better."
        items={[
          { title: "Restaurant & venue sites", text: "Menus your floor staff edit from a phone, allergens that stay in sync, booking that lands in WhatsApp.", link: { href: "/services/restaurants", label: "Restaurant sites" } },
          { title: "Clinic & spa sites", text: "Treatment pages that rank for the district, prices with tax notes, and appointment requests without a call centre.", link: { href: "/services/clinics", label: "Clinic sites" } },
          { title: "Ad management", text: "Google and Meta campaigns measured against real bookings, not clicks. A monthly report in plain language." },
          { title: "Local SEO", text: "Business Profile upkeep, review replies and a weekly grid of where you rank across the neighbourhood." },
        ]}
      />
    </SiteFrame>
  );
}
