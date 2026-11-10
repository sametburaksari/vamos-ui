import { PricingTable } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Quote-only plans: no price, a short custom line instead. Two columns.
export default function PricingQuoteOnly() {
  return (
    <SiteFrame>
      <PricingTable
        title="Built to *order*"
        lead="Every project starts with a free 30-minute call and a written quote within two working days."
        taxNote="Quotes exclude VAT"
        plans={[
          { name: "Website", description: "Design, build and launch in 4–8 weeks.", custom: "From $4,500", features: [{ text: "Up to 20 pages" }, { text: "Two languages" }, { text: "Booking or contact flows" }], cta: { link: { href: "/quote?type=website", label: "Request a quote" }, style: "primary" } },
          { name: "Booking system", description: "Calendars, deposits and reminders for multi-branch businesses.", custom: "Get a quote", features: [{ text: "Staff and room calendars" }, { text: "iyzico deposits" }, { text: "WhatsApp reminders" }], cta: { link: { href: "/quote?type=booking", label: "Request a quote" }, style: "secondary" } },
        ]}
      />
    </SiteFrame>
  );
}
