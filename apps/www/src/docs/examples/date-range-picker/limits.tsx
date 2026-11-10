"use client";

import * as React from "react";
import { DateRangePicker, Field, addIsoDays, todayIso, type IsoDateRange } from "@vamos-cms/ui";

export default function DateRangePickerLimits() {
  const today = todayIso();
  // Two nights already booked next week.
  const booked = [addIsoDays(today, 8), addIsoDays(today, 9)];
  const [stay, setStay] = React.useState<IsoDateRange | null>(null);
  return (
    <div className="w-full max-w-sm">
      <Field label="Your stay" hint="2 to 14 nights. Greyed-out dates are already booked.">
        <DateRangePicker
          value={stay}
          onValueChange={setStay}
          min={today}
          minDays={3}
          maxDays={15}
          disabledDays={booked}
          excludeDisabled
          placeholder="Check-in – check-out"
        />
      </Field>
    </div>
  );
}
