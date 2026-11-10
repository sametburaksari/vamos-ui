import { CalendarCheck } from "lucide-react";
import { EmptyState } from "@vamos-cms/ui";

export default function EmptyStateInTable() {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-ui border border-line bg-surface">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b border-line text-fg-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">Employee</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Until</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3}>
              <EmptyState size="sm" kind="done" icon={<CalendarCheck />} title="Nobody is on leave today" description="The whole Istanbul team is in." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
