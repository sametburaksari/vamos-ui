"use client";

import * as React from "react";
import { DatePicker, Field, LocaleProvider } from "@vamos-ui/react";

export default function DatePickerNaturalInput() {
  const [en, setEn] = React.useState<string | null>(null);
  const [tr, setTr] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-xl gap-5 sm:grid-cols-2">
      <Field label="Follow-up (en-US)" hint="Try “tomorrow”, “+7”, “1123” or “Nov 23”.">
        <DatePicker value={en} onValueChange={setEn} />
      </Field>
      <LocaleProvider
        locale="tr-TR"
        messages={{ datePicker: { dayToken: "GG", monthToken: "AA", wordsToday: "bugün", wordsTomorrow: "yarın", wordsYesterday: "dün" } }}
      >
        <Field label="Takip tarihi (tr-TR)" hint="“yarın”, “23.11” veya “23112026” yazın.">
          <DatePicker value={tr} onValueChange={setTr} />
        </Field>
      </LocaleProvider>
    </div>
  );
}
