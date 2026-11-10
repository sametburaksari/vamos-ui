"use client";

import * as React from "react";
import { Field, TimeRangePicker, type TimeRange } from "@vamos-ui/react";

export default function TimePickerRange() {
  const [day, setDay] = React.useState<TimeRange>({ start: "09:00", end: "17:30" });
  const [night, setNight] = React.useState<TimeRange>({ start: "22:00", end: "06:00" });
  return (
    <div className="grid w-full max-w-md gap-5">
      <Field label="Day shift" hint="Front desk, Monday to Friday.">
        <TimeRangePicker hourCycle={24} step={15} value={day} onValueChange={setDay} />
      </Field>
      <Field label="Night shift" hint="Ends the next morning.">
        <TimeRangePicker hourCycle={24} overnight value={night} onValueChange={setNight} />
      </Field>
    </div>
  );
}
