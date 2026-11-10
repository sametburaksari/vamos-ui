"use client";

import * as React from "react";
import { Checkbox } from "@vamos-cms/ui";

const invoices = [
  { id: "INV-2041", client: "Northwind Traders", total: "$4,820.00" },
  { id: "INV-2042", client: "Bosphorus Dental", total: "$1,260.00" },
  { id: "INV-2043", client: "Kadıköy Roasters", total: "$389.50" },
  { id: "INV-2044", client: "Lumen Architects", total: "$12,400.00" },
];

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = React.useState<string[]>(["INV-2042"]);
  const all = selected.length === invoices.length;
  const some = selected.length > 0 && !all;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-ui border border-line">
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
        <Checkbox
          size="sm"
          aria-label="Select all invoices"
          checked={some ? "indeterminate" : all}
          onCheckedChange={(c) => setSelected(c === true ? invoices.map((i) => i.id) : [])}
        />
        <span className="text-xs text-fg-muted">{selected.length ? `${selected.length} selected` : "Invoice"}</span>
      </div>
      <ul>
        {invoices.map((inv) => (
          <li key={inv.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0">
            <Checkbox
              size="sm"
              aria-label={`Select ${inv.id}`}
              checked={selected.includes(inv.id)}
              onCheckedChange={(c) => setSelected((s) => (c === true ? [...s, inv.id] : s.filter((x) => x !== inv.id)))}
            />
            <span className="w-20 font-mono text-xs text-fg-muted">{inv.id}</span>
            <span className="min-w-0 flex-1 truncate text-sm">{inv.client}</span>
            <span className="text-sm tabular">{inv.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
