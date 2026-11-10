"use client";

import * as React from "react";
import { DateRangePicker, Field, type IsoDateRange } from "@vamos-cms/ui";

export default function DateRangePickerInput() {
  const [leave, setLeave] = React.useState<IsoDateRange | null>({ from: "2026-12-21", to: "2027-01-02" });
  const [error, setError] = React.useState("");
  return (
    <div className="w-full max-w-sm">
      <Field label="Annual leave" hint="Type both dates or pick them from the calendar." error={error}>
        <DateRangePicker trigger="input" value={leave} onValueChange={setLeave} nameFrom="leaveFrom" nameTo="leaveTo" clearable onInputError={(_, m) => setError(m)} />
      </Field>
    </div>
  );
}
