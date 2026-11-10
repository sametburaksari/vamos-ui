"use client";

import * as React from "react";
import { Field, IbanInput } from "@vamos-cms/ui";

export default function IbanExample() {
  const [error, setError] = React.useState<string>();
  return (
    <div className="grid w-full max-w-md gap-4">
      <Field label="Salary account" hint="Turkish IBANs only. The bank appears once the bank code is typed." error={error}>
        <IbanInput countries={["TR"]} onValidate={(r) => setError(r.message)} />
      </Field>
      <Field label="Supplier IBAN (any country)">
        <IbanInput defaultValue="DE89370400440532013000" />
      </Field>
    </div>
  );
}
