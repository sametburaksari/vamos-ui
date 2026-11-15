"use client";

import { AmountPicker } from "@vamos-ui/react";

export default function AmountPickerTopUp() {
  return (
    <div className="w-full max-w-md">
      <AmountPicker
        frequencies={[
          { id: "once", label: "Once" },
          { id: "weekly", label: "Every week", suffix: "a week" },
        ]}
        amounts={[{ value: 20 }, { value: 50 }, { value: 100 }, { value: 200 }]}
        columns={4}
        min={10}
        max={500}
        impact={(amount) => `About ${Math.floor(amount / 2.5)} rides at the standard fare.`}
        labels={{ amount: "Top up by" }}
      />
    </div>
  );
}
