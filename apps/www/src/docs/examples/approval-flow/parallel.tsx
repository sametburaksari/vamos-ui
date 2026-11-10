import { ApprovalFlow, type ApprovalStageData } from "@vamos-cms/ui/business";

// Legal contract sign-off: Finance (any of 2) and Legal (all of 2) review in parallel, then the CEO.
const stages: ApprovalStageData[] = [
  {
    id: "finance",
    title: "Finance",
    mode: "any",
    status: "approved",
    parallelGroup: "review",
    approvers: [
      { id: "f1", name: "Kerem Demir", decision: { value: "approved", at: "2026-11-06T13:40:00Z" } },
      { id: "f2", name: "Elif Şahin" },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    mode: "all",
    status: "active",
    parallelGroup: "review",
    dueAt: "2026-11-11T12:00:00Z",
    approvers: [
      { id: "l1", name: "Zeynep Kaya", decision: { value: "approved", at: "2026-11-07T10:05:00Z", note: "Liability cap is acceptable." } },
      { id: "l2", name: "Oliver Grant", role: "External counsel", decision: { value: "approved", at: "2026-11-08T16:20:00Z", delegatedFrom: { id: "l3", name: "Hannah Weiss" } } },
      { id: "l4", name: "Mehmet Uçar" },
    ],
  },
  { id: "ceo", title: "CEO signature", mode: "all", status: "waiting", approvers: [{ id: "c1", name: "Can Öztürk" }] },
];

export default function ApprovalFlowParallel() {
  return (
    <div className="w-full max-w-2xl">
      <ApprovalFlow aria-label="Master services agreement — Fabrikam" stages={stages} now="2026-11-10T09:00:00Z" />
    </div>
  );
}
