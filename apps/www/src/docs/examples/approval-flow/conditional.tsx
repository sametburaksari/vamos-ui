import { ApprovalFlow, type ApprovalStageData } from "@vamos-cms/ui/business";

// Purchase request: a Director stage is added because the amount crossed a threshold.
const stages: ApprovalStageData[] = [
  { id: "mgr", title: "Budget owner", mode: "all", status: "approved", approvers: [{ id: "a", name: "Nora Lindqvist", decision: { value: "approved", at: "2026-11-04T08:15:00Z" } }] },
  {
    id: "director",
    title: "Director",
    mode: "all",
    condition: "Amount > $10,000",
    status: "changes_requested",
    approvers: [{ id: "b", name: "Rafael Duarte", decision: { value: "changes_requested", at: "2026-11-05T15:30:00Z", note: "Please attach the second supplier quote before I sign this." } }],
  },
  { id: "finance", title: "Finance", mode: "any", status: "skipped", approvers: [{ id: "c", name: "Priya Raman" }] },
];

export default function ApprovalFlowConditional() {
  return (
    <div className="w-full max-w-xl">
      <ApprovalFlow
        aria-label="PO-2026-0931 — 14 laptops, $18,620"
        requester={{ name: "Jonas Fischer", at: "2026-11-03T16:48:00Z" }}
        stages={stages}
        orientation="vertical"
      />
    </div>
  );
}
