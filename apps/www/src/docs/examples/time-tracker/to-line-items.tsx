"use client";

import * as React from "react";
import { useFormat } from "@vamos-ui/react";
import { lineItemsTotal, toLineItems, type TimeEntry } from "@vamos-ui/react/scheduler";

const rate = { amount: "95.00", currency: "EUR" };
const entries: TimeEntry[] = [
  { id: "1", start: "2026-11-02T09:00:00Z", end: "2026-11-02T12:20:00Z", projectLabel: "Mobile app", taskLabel: "Checkout", billable: true, rate },
  { id: "2", start: "2026-11-03T13:00:00Z", durationMin: 150, projectLabel: "Mobile app", taskLabel: "Push notifications", billable: true, rate },
  { id: "3", start: "2026-11-04T09:00:00Z", durationMin: 240, projectLabel: "Website relaunch", taskLabel: "Booking flow", billable: true, rate: { amount: "85.00", currency: "EUR" } },
  { id: "4", start: "2026-11-05T15:00:00Z", durationMin: 60, projectLabel: "Mobile app", taskLabel: "Standup", billable: false },
];

/** Billable entries → invoice line drafts (hours as decimal strings, HUR unit), ready for Line items. */
export default function TimeTrackerToLineItems() {
  const f = useFormat();
  const lines = toLineItems(entries, "project");
  return (
    <div className="surface w-full max-w-xl overflow-hidden rounded-ui-lg">
      <table className="w-full text-[13px]">
        <thead className="border-b border-line text-start text-[11.5px] text-fg-muted">
          <tr>
            <th className="px-4 py-2 text-start font-medium">Description</th>
            <th className="px-4 py-2 text-end font-medium">Hours</th>
            <th className="px-4 py-2 text-end font-medium">Rate</th>
            <th className="px-4 py-2 text-end font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="tabular">
          {lines.map((l) => (
            <tr key={l.description + l.unitPrice} className="border-b border-line">
              <td className="px-4 py-2.5 font-medium text-fg">{l.description}</td>
              <td className="px-4 py-2.5 text-end">{f.number(l.quantity)}</td>
              <td className="px-4 py-2.5 text-end text-fg-muted">{f.currency(l.unitPrice, l.currency)}</td>
              <td className="px-4 py-2.5 text-end">{f.currency(l.total, l.currency)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-end font-medium text-fg-muted">Total</td>
            <td className="px-4 py-2.5 text-end font-semibold tabular text-fg">{f.currency(lineItemsTotal(lines), "EUR")}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
