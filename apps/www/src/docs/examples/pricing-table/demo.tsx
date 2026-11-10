import { PricingTable } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

const USD = (amount: string) => ({ amount, currency: "USD" });

// SaaS, three plans, monthly/yearly switch — hidden radios + :has(), no JavaScript.
export default function PricingTableDemo() {
  return (
    <SiteFrame>
      <PricingTable
        eyebrow="Pricing"
        title="One booking page, three *sizes*"
        lead="Every plan includes the booking page, WhatsApp confirmations and a Google Business Profile sync. Change or cancel any month."
        billing="both"
        yearlySaving="2 months free"
        taxNote="Prices exclude 20% VAT"
        footnote="Yearly plans are billed once, up front. Cancel within 14 days for a full refund."
        plans={[
          {
            name: "Solo",
            description: "One practitioner, one calendar.",
            price: { monthly: USD("29"), yearly: USD("290") },
            features: [{ text: "1 calendar" }, { text: "Booking page and widget" }, { text: "WhatsApp reminders", note: "Up to 300 a month" }, { text: "Deposits and prepayment", included: false }],
            cta: { link: { href: "/signup?plan=solo", label: "Start with Solo" }, style: "secondary" },
          },
          {
            name: "Studio",
            description: "A salon, spa or clinic with a front desk.",
            price: { monthly: USD("79"), yearly: USD("790") },
            highlight: "Most chosen",
            features: [{ text: "Up to 8 calendars" }, { text: "Deposits and prepayment" }, { text: "WhatsApp reminders", note: "Up to 2,000 a month" }, { text: "Gift cards" }],
            cta: { link: { href: "/signup?plan=studio", label: "Start with Studio" }, style: "primary" },
          },
          {
            name: "Group",
            description: "Several branches under one brand.",
            custom: "Custom",
            features: [{ text: "Unlimited branches" }, { text: "Central reporting" }, { text: "SSO and audit log" }, { text: "A named account manager" }],
            cta: { link: { href: "/contact?topic=group", label: "Talk to sales" }, style: "secondary" },
          },
        ]}
      />
    </SiteFrame>
  );
}
