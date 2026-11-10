"use client";

import * as React from "react";
import { Field, TimePicker } from "@vamos-ui/react";

export default function TimePickerSlots() {
  const [time, setTime] = React.useState<string | null>(null);
  return (
    <div className="w-full max-w-[14rem]">
      <Field label="Pickup time" hint="Store open 09:00–18:00, every 30 minutes.">
        <TimePicker slots step={30} min="09:00" max="18:00" value={time} onValueChange={setTime} disabledTimes={(t) => t >= "12:30" && t < "13:30"} />
      </Field>
    </div>
  );
}
