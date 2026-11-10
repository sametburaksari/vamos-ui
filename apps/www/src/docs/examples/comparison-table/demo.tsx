import { ComparisonTable } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";

// Plan × feature table: sticky header, scoped headers, hidden Yes/No text, faint band on the highlighted plan.
export default function ComparisonTableDemo() {
  return (
    <SiteFrame>
      <ComparisonTable
        eyebrow="Compare"
        title="Every plan, *line by line*"
        columns={[
          { name: "Solo", note: "$29 / month", cta: { link: { href: "/signup?plan=solo", label: "Start" }, style: "secondary" } },
          { name: "Studio", note: "$79 / month", highlight: true, cta: { link: { href: "/signup?plan=studio", label: "Start" }, style: "primary" } },
          { name: "Group", note: "Custom", cta: { link: { href: "/contact", label: "Talk to sales" }, style: "secondary" } },
        ]}
        groups={[
          { title: "Booking", rows: [
            { feature: "Calendars", values: ["1", "Up to 8", "Unlimited"] },
            { feature: "Deposits and prepayment", hint: "Card payments through iyzico; refunds from the dashboard.", values: [false, true, true] },
            { feature: "Waiting list", values: [false, true, true] },
          ] },
          { title: "Messaging", rows: [
            { feature: "WhatsApp reminders", values: ["300 / mo", "2,000 / mo", "Unlimited"] },
            { feature: "SMS fallback", values: [false, true, true] },
          ] },
          { title: "Account", rows: [
            { feature: "Single sign-on", values: [false, false, true] },
            { feature: "Audit log", hint: "Who moved, cancelled or refunded what, and when.", values: [false, "30 days", "1 year"] },
            { feature: "Account manager", values: [null, null, true] },
          ] },
        ]}
      />
    </SiteFrame>
  );
}
