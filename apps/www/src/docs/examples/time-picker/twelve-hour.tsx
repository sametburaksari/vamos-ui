"use client";

import * as React from "react";
import { Field, LocaleProvider, TimeInput } from "@vamos-ui/react";

export default function TimePickerTwelveHour() {
  const [time, setTime] = React.useState<string | null>("19:45");
  return (
    <div className="grid w-full max-w-md gap-5 sm:grid-cols-2">
      <Field label="Dinner reservation (en-US)" hint="Press A or P to switch.">
        <TimeInput value={time} onValueChange={setTime} />
      </Field>
      <LocaleProvider locale="tr-TR">
        <Field label="Rezervasyon (tr-TR)" hint="Same value, 24-hour display.">
          <TimeInput value={time} onValueChange={setTime} />
        </Field>
      </LocaleProvider>
    </div>
  );
}
