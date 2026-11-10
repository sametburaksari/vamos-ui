import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@vamos-cms/ui";
import { ApprovalSummary, type ApprovalStageData } from "@vamos-cms/ui/business";

const s = (statuses: ApprovalStageData["status"][]): ApprovalStageData[] =>
  statuses.map((status, i) => ({ id: String(i), title: ["Manager", "Finance", "Director"][i]!, mode: "all", status, approvers: [] }));

const rows = [
  { id: "EXP-2041", who: "Ayla Çelik", what: "Client dinner, Izmir", amount: "$412.80", stages: s(["approved", "active", "waiting"]) },
  { id: "EXP-2040", who: "Ben Hartley", what: "Flights IST → LHR", amount: "$1,284.00", stages: s(["approved", "approved", "approved"]) },
  { id: "EXP-2038", who: "Farah Jansen", what: "Conference ticket", amount: "$899.00", stages: s(["rejected", "skipped", "skipped"]) },
  { id: "EXP-2035", who: "Omar Ekström", what: "Taxi, airport transfer", amount: "$64.20", stages: s(["changes_requested", "waiting", "waiting"]) },
];

export default function ApprovalFlowCompact() {
  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Expense</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead className="text-end">Amount</TableHead>
            <TableHead>Approval</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <span className="font-mono text-xs text-fg-subtle">{r.id}</span>
                <span className="block text-fg">{r.what}</span>
              </TableCell>
              <TableCell>{r.who}</TableCell>
              <TableCell className="text-end tabular">{r.amount}</TableCell>
              <TableCell>
                <ApprovalSummary stages={r.stages} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
