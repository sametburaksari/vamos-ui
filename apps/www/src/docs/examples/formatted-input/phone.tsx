"use client";

import * as React from "react";
import { Field, PhoneInput } from "@vamos-ui/react";

export default function PhoneExample() {
  const [phone, setPhone] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string>();
  return (
    <div className="grid w-full max-w-md gap-2">
      <Field label="Mobile number" hint="Try 0532 123 45 67, 90532…, or +44 20 7183 8750." error={error}>
        <PhoneInput
          defaultCountry="TR"
          preferredCountries={["TR", "DE", "GB", "NL"]}
          value={phone}
          onValueChange={setPhone}
          onValidate={(r) => setError(r.message)}
        />
      </Field>
      <code className="font-mono text-xs text-fg-subtle">E.164: {JSON.stringify(phone)}</code>
    </div>
  );
}
