import { FieldDiff } from "@vamos-cms/ui";

export default function VersionHistoryFieldDiff() {
  return (
    <FieldDiff
      className="w-full max-w-2xl"
      beforeLabel="Quote v2 · Nov 3"
      afterLabel="Quote v3 · Nov 9"
      before={{ amount: "48500.00", discount: 0.15, stage: "Proposal", owner: "Daniel Brooks", seats: 40, sso: false, closeDate: "2026-12-01", notes: "Annual billing, net 30. Price valid for 30 days." }}
      after={{ amount: "52000.00", discount: 0.12, stage: "Negotiation", owner: "Ayşe Kaya", seats: 45, sso: true, closeDate: "2026-12-01", notes: "Annual billing, net 45. Price locked for 12 months if signed by Dec 15." }}
      fields={[
        { key: "amount", label: "Amount", format: "currency" },
        { key: "discount", label: "Discount", format: "percent" },
        { key: "stage", label: "Stage" },
        { key: "owner", label: "Owner" },
        { key: "seats", label: "Seats", format: "integer" },
        { key: "sso", label: "SSO included", type: "boolean" },
        { key: "closeDate", label: "Close date", format: "date" },
        { key: "notes", label: "Terms", type: "text-long" },
      ]}
    />
  );
}
