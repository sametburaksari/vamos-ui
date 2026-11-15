"use client";

import * as React from "react";
import { ChoiceGrid, type ChoiceGridValue } from "@vamos-ui/react";

const sizes = [
  { id: "small", label: "Small", description: "250 g · ~16 cups", grams: 250, price: 18 },
  { id: "medium", label: "Medium", description: "500 g · ~33 cups", grams: 500, price: 32 },
  { id: "large", label: "Large", description: "1 kg · ~66 cups", grams: 1000, price: 58 },
];
const frequencies = [
  { id: "weekly", label: "Weekly", description: "−15%", off: 0.15 },
  { id: "fortnightly", label: "Every 2 weeks", description: "−10%", off: 0.1 },
  { id: "monthly", label: "Monthly", description: "list price", off: 0 },
];

export default function ChoiceGridDemo() {
  const [plan, setPlan] = React.useState<ChoiceGridValue>({ row: "medium", column: "fortnightly" });
  const size = sizes.find((s) => s.id === plan.row)!;
  const freq = frequencies.find((f) => f.id === plan.column)!;
  const price = Math.round(size.price * (1 - freq.off));
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <ChoiceGrid
        caption="Choose a size and how often it arrives"
        corner="Size ↓ · how often →"
        rows={sizes}
        columns={frequencies}
        cell={(row, column) => {
          const s = sizes.find((x) => x.id === row)!;
          const p = Math.round(s.price * (1 - frequencies.find((x) => x.id === column)!.off));
          return { price: p, meta: `$${((p / s.grams) * 15).toFixed(2)} / cup`, badge: row === "medium" && column === "fortnightly" ? "Popular" : undefined };
        }}
        value={plan}
        onValueChange={setPlan}
        name="plan"
      />
      <p className="m-0 text-small text-fg-muted" aria-live="polite">
        <span className="font-medium text-fg">{size.label}</span>, {freq.label.toLowerCase()} — <span className="font-medium text-fg tabular">${price}</span> per delivery
      </p>
    </div>
  );
}
