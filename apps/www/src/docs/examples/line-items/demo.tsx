"use client";

import * as React from "react";
import { LineItems, type LineItem } from "@vamos-ui/react/business";

const quote: LineItem[] = [
  { id: "l1", description: "Discovery workshop (2 days, on site)", quantity: "2", unit: "day", unitPrice: "1450.00", taxRate: "20" },
  { id: "l2", description: "UX design — booking flow", quantity: "36", unit: "hour", unitPrice: "95.00", taxRate: "20" },
  { id: "l3", description: "Front-end build", quantity: "80", unit: "hour", unitPrice: "85.00", taxRate: "20", discount: { type: "percent", value: "10" } },
];

export default function LineItemsDemo() {
  const [rows, setRows] = React.useState(quote);
  return (
    <div className="w-full">
      <LineItems aria-label="Quote Q-2026-114 lines" currency="EUR" units={["day", "hour", "pcs", "month"]} value={rows} onValueChange={setRows} />
    </div>
  );
}
