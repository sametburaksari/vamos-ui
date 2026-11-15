"use client";

import { AmountPicker, type AmountOption } from "@vamos-ui/react";

const once: AmountOption[] = [
  { value: 250, impact: "Ten new picture books for the children's corner." },
  { value: 500, impact: "A month of the Saturday reading club.", badge: "Most chosen" },
  { value: 1000, impact: "A full shelf for a new reading room." },
];
const monthly: AmountOption[] = [
  { value: 100, impact: "Four new books every month." },
  { value: 200, impact: "Keeps one reading room open an extra evening a month." },
  { value: 400, impact: "Pays a volunteer coordinator's travel for a month." },
];

export default function AmountPickerDemo() {
  return (
    <div className="w-full max-w-md">
      <AmountPicker amounts={(f) => (f === "monthly" ? monthly : once)} defaultValue={{ frequency: "monthly", amount: 200 }} min={50} name="amount" frequencyName="frequency" />
    </div>
  );
}
