import { ApprovalFlow, type ApprovalStageData } from "@vamos-ui/react/business";

// HR time-off request: Employee → Manager → HR, sequential.
const stages: ApprovalStageData[] = [
  {
    id: "manager",
    title: "Manager approval",
    mode: "all",
    status: "approved",
    approvers: [{ id: "u1", name: "Ayşe Yılmaz", role: "Engineering manager", decision: { value: "approved", at: "2026-11-03T11:02:00Z", note: "Fine by me — Mert covers the on-call week." } }],
  },
  {
    id: "hr",
    title: "HR review",
    mode: "any",
    status: "active",
    dueAt: "2026-11-12T17:00:00Z",
    approvers: [
      { id: "u2", name: "Selin Arslan", role: "People partner" },
      { id: "u3", name: "Burak Koç", role: "People operations" },
    ],
  },
  { id: "payroll", title: "Payroll update", mode: "all", status: "waiting", approvers: [{ id: "u4", name: "Gizem Er", role: "Payroll" }] },
];

export default function ApprovalFlowDemo() {
  return (
    <div className="w-full max-w-xl">
      <ApprovalFlow
        aria-label="Annual leave, 17–28 November"
        requester={{ name: "Deniz Aydın", at: "2026-11-03T09:12:00Z", note: "Annual leave, 17–28 November (10 working days)." }}
        stages={stages}
        now="2026-11-10T09:00:00Z"
      />
    </div>
  );
}
