"use client";

import * as React from "react";
import { Field, TimePicker } from "@vamos-ui/react";

export default function TimePickerDemo() {
  const [time, setTime] = React.useState<string | null>("14:30");
  return (
    <div className="grid w-full max-w-[13rem] gap-3">
      <Field label="Meeting starts" hint="Type digits or use ↑ ↓.">
        <TimePicker hourCycle={24} value={time} onValueChange={setTime} />
      </Field>
      <p className="font-mono text-xs text-fg-subtle">value: {time ?? "null"}</p>
    </div>
  );
}
