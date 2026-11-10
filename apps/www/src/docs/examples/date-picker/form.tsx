"use client";

import * as React from "react";
import { Button, DatePicker, Field } from "@vamos-cms/ui";

export default function DatePickerForm() {
  const [submitted, setSubmitted] = React.useState<Record<string, string> | null>(null);
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
      }}
    >
      <Field label="Start date" required>
        <DatePicker name="startDate" defaultValue="2027-01-04" />
      </Field>
      <Field label="Probation ends" optional>
        <DatePicker name="probationEnd" clearable />
      </Field>
      <Button type="submit" variant="primary" className="justify-self-start">
        Save hire details
      </Button>
      {submitted ? <pre className="rounded-ui bg-surface-2 p-3 font-mono text-xs text-fg-muted">{JSON.stringify(submitted, null, 2)}</pre> : null}
    </form>
  );
}
