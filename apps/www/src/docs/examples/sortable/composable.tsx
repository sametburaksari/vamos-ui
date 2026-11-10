"use client";

import * as React from "react";
import { Sortable, SortableHandle, SortableItem, SortableMoveMenu, SortableOverlay } from "@vamos-cms/ui/sortable";
import { useFormat } from "@vamos-cms/ui";
import { multiplyDecimal } from "@vamos-cms/ui/locale-data";

interface Line {
  id: string;
  description: string;
  qty: number;
  unit: string;
  price: string;
}

const initial: Line[] = [
  { id: "l1", description: "Discovery workshop (2 days)", qty: 2, unit: "day", price: "1450.00" },
  { id: "l2", description: "UX design — booking flow", qty: 36, unit: "hour", price: "95.00" },
  { id: "l3", description: "Front-end build", qty: 80, unit: "hour", price: "85.00" },
  { id: "l4", description: "Hosting, first year", qty: 1, unit: "year", price: "1200.00" },
];

export default function SortableComposable() {
  const [lines, setLines] = React.useState(initial);
  const format = useFormat();
  const money = (v: string) => format.currency(v, "EUR");
  return (
    <Sortable items={lines} getLabel={(l) => l.description} onReorder={setLines}>
      <div className="w-full overflow-x-auto rounded-ui-lg border border-line bg-surface">
        <table className="w-full min-w-[34rem] text-sm">
          <caption className="sr-only">Invoice lines</caption>
          <thead className="text-xs text-fg-muted">
            <tr className="border-b border-line">
              <th className="w-9" />
              <th className="py-2 text-start font-medium">Description</th>
              <th className="py-2 text-end font-medium">Qty</th>
              <th className="py-2 text-end font-medium">Price</th>
              <th className="py-2 pe-2 text-end font-medium">Amount</th>
              <th className="w-9">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <SortableItem key={l.id} id={l.id} as="tr" className="border-b border-line bg-surface last:border-0">
                <td className="ps-1">
                  <SortableHandle size="sm" />
                </td>
                <td className="py-2">{l.description}</td>
                <td className="tabular py-2 text-end text-fg-muted">
                  {l.qty} {l.unit}
                </td>
                <td className="tabular py-2 text-end text-fg-muted">{money(l.price)}</td>
                <td className="tabular py-2 pe-2 text-end font-medium">{money(multiplyDecimal(l.price, l.qty))}</td>
                <td className="pe-1">
                  <SortableMoveMenu size="xs" />
                </td>
              </SortableItem>
            ))}
          </tbody>
        </table>
      </div>
      <SortableOverlay>
        {(id) => {
          const l = lines.find((x) => x.id === id)!;
          return (
            <div className="vui-sortable-clone flex w-80 items-center justify-between gap-3 rounded-ui border border-line px-3 py-2 text-sm">
              <span className="truncate">{l.description}</span>
              <span className="tabular font-medium">{money(multiplyDecimal(l.price, l.qty))}</span>
            </div>
          );
        }}
      </SortableOverlay>
    </Sortable>
  );
}
