"use client";

import * as React from "react";
import { DatePicker, Field } from "@vamos-cms/ui";

export default function DatePickerDemo() {
  const [due, setDue] = React.useState<string | null>("2026-12-04");
  return (
    <div className="grid w-full max-w-xs gap-3">
      <Field label="Invoice due date" hint="Type 12/04/2026, 1204 or “tomorrow” — or open the calendar.">
        <DatePicker value={due} onValueChange={setDue} clearable />
      </Field>
      <p className="font-mono text-xs text-fg-subtle">value: {due ?? "null"}</p>
    </div>
  );
}
