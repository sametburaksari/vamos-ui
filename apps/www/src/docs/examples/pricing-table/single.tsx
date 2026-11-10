import { PricingTable } from "@vamos-cms/ui/blocks";
import { SiteFrame } from "../_site-1/frame";

// One package: price and action beside a two-column inclusion list; "Not included" below.
export default function PricingSingle() {
  return (
    <SiteFrame>
      <PricingTable
        variant="single"
        eyebrow="Ad management"
        title="Google Ads, *handled*"
        billing="monthly"
        taxNote="Ad spend is billed by Google, not included"
        plans={[
          {
            name: "Local retainer",
            description: "For restaurants, spas and clinics spending $1,000–5,000 a month on Google Ads.",
            price: { monthly: { amount: "650", currency: "USD" } },
            cta: { link: { href: "/contact?topic=ads", label: "Book a 20-minute call" }, style: "primary" },
            features: [
              { text: "Search and Performance Max campaigns" },
              { text: "Call and booking conversion tracking" },
              { text: "Weekly search-term cleanup" },
              { text: "Monthly report in plain language" },
              { text: "Landing page changes", note: "Up to 2 hours a month" },
              { text: "Google Business Profile posts" },
              { text: "Meta and TikTok ads", included: false },
              { text: "Creative production", included: false },
            ],
          },
        ]}
      />
    </SiteFrame>
  );
}
