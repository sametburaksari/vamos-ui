import { ScrollArea } from "@vamos-ui/react";

const events: [when: string, what: string, meta: string][] = [
  ["09:42", "Invoice INV-2026-0418 paid", "$4,250.00"],
  ["09:15", "New lead: Fabrikam Logistics", "Web form"],
  ["08:58", "Deal moved to Negotiation", "Contoso renewal"],
  ["08:31", "Contract signed", "Tailspin Toys"],
  ["Yesterday", "Refund issued", "$129.00"],
  ["Yesterday", "Meeting booked", "Northwind QBR"],
  ["Nov 8", "Invoice INV-2026-0411 overdue", "$1,980.00"],
  ["Nov 8", "Seat added", "Elif Kaya"],
  ["Nov 7", "Webhook failed 3×", "orders.created"],
  ["Nov 7", "Export finished", "contacts.csv"],
  ["Nov 6", "Plan upgraded", "Team → Business"],
  ["Nov 6", "Password reset", "jonas.weber@"],
];

export default function ScrollAreaDemo() {
  return (
    <div className="w-80 overflow-hidden rounded-ui-lg border border-line">
      <p className="border-b border-line px-4 py-2.5 text-[13px] font-medium">Recent activity</p>
      <ScrollArea maxHeight={260} fade aria-label="Recent activity">
        <ul className="divide-y divide-line">
          {events.map(([when, what, meta]) => (
            <li key={what + when} className="flex flex-col gap-0.5 px-4 py-2.5 text-[13px]">
              <span className="text-fg">{what}</span>
              <span className="tabular text-fg-subtle">
                {when} · {meta}
              </span>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
