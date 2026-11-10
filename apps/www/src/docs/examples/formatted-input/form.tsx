"use client";

import * as React from "react";
import { Button, CurrencyInput, Field, IbanInput, NationalIdInput, PhoneInput } from "@vamos-ui/react";

export default function FormattedForm() {
  const [submitted, setSubmitted] = React.useState<Record<string, string>>();
  return (
    <form
      className="grid w-full max-w-xl gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gross salary" name="salary">
          <CurrencyInput currency="TRY" defaultValue="68500" />
        </Field>
        <Field label="ID number" name="nationalId">
          <NationalIdInput defaultValue="38291746550" />
        </Field>
        <Field label="Phone" name="phone">
          <PhoneInput defaultCountry="TR" defaultValue="+905321234567" />
        </Field>
        <Field className="sm:col-span-2" label="IBAN" name="iban">
          <IbanInput defaultValue="TR330001000950410386520001" />
        </Field>
      </div>
      <div className="flex items-start gap-4">
        <Button type="submit" variant="primary">
          Save employee
        </Button>
        {submitted ? <pre className="min-w-0 flex-1 overflow-x-auto rounded-ui bg-surface-2 px-3 py-2 font-mono text-[11.5px] text-fg-muted">{JSON.stringify(submitted, null, 2)}</pre> : null}
      </div>
    </form>
  );
}
