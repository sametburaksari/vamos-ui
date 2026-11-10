"use client";

import * as React from "react";
import { DatePicker, Field } from "@vamos-cms/ui";

export default function DatePickerDropdownCaption() {
  const [birthDate, setBirthDate] = React.useState<string | null>("1991-04-17");
  return (
    <div className="w-full max-w-xs">
      <Field label="Date of birth" hint="Used for benefits enrolment only.">
        <DatePicker
          value={birthDate}
          onValueChange={setBirthDate}
          max="2008-12-31"
          showToday={false}
          calendarProps={{ captionLayout: "dropdown", startMonth: new Date(1940, 0), endMonth: new Date(2008, 11) }}
        />
      </Field>
    </div>
  );
}
