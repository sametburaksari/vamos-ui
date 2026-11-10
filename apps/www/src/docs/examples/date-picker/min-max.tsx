"use client";

import * as React from "react";
import { DatePicker, Field, addIsoDays, todayIso } from "@vamos-cms/ui";

export default function DatePickerMinMax() {
  const today = todayIso();
  const [validUntil, setValidUntil] = React.useState<string | null>(addIsoDays(today, 30));
  const [error, setError] = React.useState("");
  return (
    <div className="w-full max-w-xs">
      <Field label="Quote valid until" hint="Between today and 90 days out. Weekends are allowed." error={error}>
        <DatePicker
          value={validUntil}
          onValueChange={setValidUntil}
          min={today}
          max={addIsoDays(today, 90)}
          onInputError={(_, message) => setError(message)}
        />
      </Field>
    </div>
  );
}
