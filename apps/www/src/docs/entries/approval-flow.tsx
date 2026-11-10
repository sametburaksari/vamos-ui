import { ex, type DocEntry } from "../types";
import ApprovalFlowDemo from "../examples/approval-flow/demo";
import ApprovalFlowParallel from "../examples/approval-flow/parallel";
import ApprovalFlowConditional from "../examples/approval-flow/conditional";
import ApprovalFlowActions from "../examples/approval-flow/actions";
import ApprovalFlowCompact from "../examples/approval-flow/compact";

const entry: DocEntry = {
  slug: "approval-flow",
  title: "Approval flow",
  group: "Flows & wizards",
  description:
    "Shows and acts on a multi-stage approval: sequential and parallel stages (\"all of\" / \"any of\"), approvers with decisions, timestamps and comments, rule conditions, SLA deadlines and delegation. ApprovalActions confirms each decision in a dialog with a note; ApprovalSummary is the one-line status for table rows.",
  source: ["business/approval-flow.tsx"],
  basedOn: "Avatar · Badge · Dialog · Select",
  usage: `import { ApprovalFlow, ApprovalActions, ApprovalSummary } from "@vamos-ui/react/business";

<ApprovalFlow requester={{ name: "Deniz Aydın", at: request.createdAt }} stages={request.stages} />
<ApprovalActions canAct={me.isApprover} onApprove={approve} onReject={reject} onRequestChanges={sendBack} />
<ApprovalSummary stages={row.stages} />  // "2 of 3 approved · Now: Finance"`,
  demo: ex("demo", "Demo", "approval-flow/demo.tsx", ApprovalFlowDemo),
  examples: [
    ex("parallel", "Parallel branches", "approval-flow/parallel.tsx", ApprovalFlowParallel, "Consecutive stages with the same parallelGroup render side by side. Each says \"Any one of 2 approvers\" or \"All of 3 approvers\"; delegated decisions carry a badge."),
    ex("conditional", "Conditions and changes requested", "approval-flow/conditional.tsx", ApprovalFlowConditional, "A Director stage added by a rule (\"Amount > $10,000\") sent the request back; later stages are skipped."),
    ex("actions", "Approve, reject, request changes, delegate", "approval-flow/actions.tsx", ApprovalFlowActions, "Reject and Request changes require a note (requireNoteOn); the dialog focuses it. Results are announced politely."),
    ex("compact", "In a table row", "approval-flow/compact.tsx", ApprovalFlowCompact, "ApprovalSummary: one dot per stage plus \"2 of 3 approved\" — expense and leave lists."),
  ],
  api: [
    { name: "ApprovalFlow", props: [
      { name: "stages", type: "ApprovalStageData[]", description: "{ id, title, mode: \"all\" | \"any\", condition?, approvers[], status, dueAt?, parallelGroup? }. Status: waiting · active · approved · rejected · changes_requested · skipped · withdrawn." },
      { name: "requester", type: "{ name; avatarUrl?; at; note? }", description: "First node: who submitted, when and why." },
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Horizontal lays stages out in a scrollable row." },
      { name: "variant", type: '"full" | "compact"', default: '"full"', description: "compact renders ApprovalSummary." },
      { name: "now", type: "string | number", default: "Date.now()", description: "Reference time for SLA (pass it for SSR-stable output)." },
      { name: "labels", type: "Partial<ApprovalFlowLabels>", description: "Statuses, mode texts (plural-aware), SLA, actions." },
    ] },
    { name: "ApprovalApprover / ApprovalDecision", props: [
      { name: "approver", type: "{ id; name; avatarUrl?; role?; decision? }", description: "One person on a stage." },
      { name: "decision", type: '{ value: "approved" | "rejected" | "changes_requested"; at; note?; delegatedFrom? }', description: "UTC ISO instant; the note renders as a comment." },
    ] },
    { name: "ApprovalActions", props: [
      { name: "canAct", type: "boolean", description: "When false, shows cantActReason instead of buttons." },
      { name: "onApprove", type: "(note?: string) => Promise<void> | void", description: "Approve with an optional note." },
      { name: "onReject", type: "(note: string) => Promise<void> | void", description: "Reject; a note is required by default." },
      { name: "onRequestChanges", type: "(note: string) => Promise<void> | void", description: "Shows \"Request changes\"." },
      { name: "onDelegate / delegates", type: "(to, note?) => … / { id; name }[]", description: "Shows \"Delegate\" with a person Select." },
      { name: "requireNoteOn", type: '("approve" | "reject" | "changes")[]', default: '["reject", "changes"]', description: "Which actions need a note." },
      { name: "cantActReason", type: "string", description: "Text for viewers who can't act." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Button size." },
    ] },
    { name: "ApprovalSummary", props: [
      { name: "stages", type: "ApprovalStageData[]", description: "Same data as the flow." },
      { name: "showCurrent", type: "boolean", default: "true", description: "Append \"Now: {stage}\"." },
    ] },
  ],
  notes: ["The flow is an <ol>; parallel stages are a nested list named \"In parallel\". Status is always text (badge + decision words), never colour alone. A visual flow designer is out of scope: the server defines stages, this renders and acts on them."],
  covers: ["Approval flow"],
};

export default entry;
