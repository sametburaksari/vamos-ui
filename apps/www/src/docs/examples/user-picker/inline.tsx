"use client";

import * as React from "react";
import { UserPicker, type PickerUser } from "@vamos-cms/ui";

const staff: PickerUser[] = [
  { id: "s1", name: "Zeynep Acar", meta: "Barista · 32 h/week" },
  { id: "s2", name: "Liam O'Connor", meta: "Barista · 20 h/week" },
  { id: "s3", name: "Sofia Ricci", meta: "Shift lead · 40 h/week" },
  { id: "s4", name: "Emre Tunç", meta: "Kitchen · 30 h/week" },
  { id: "s5", name: "Noah Fischer", meta: "On leave until Dec 2", disabled: true },
];

export default function UserPickerInline() {
  const [onShift, setOnShift] = React.useState(["s3"]);
  return (
    <div className="grid w-full max-w-xs gap-2">
      <div>
        <p className="text-sm font-medium text-fg">Saturday, 07:00 – 15:00</p>
        <p className="text-xs text-fg-muted">{onShift.length} of 3 positions filled</p>
      </div>
      <UserPicker aria-label="Staff on this shift" multiple max={3} trigger="inline" source={staff} value={onShift} onValueChange={setOnShift} />
    </div>
  );
}
