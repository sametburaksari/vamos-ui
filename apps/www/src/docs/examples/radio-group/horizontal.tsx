"use client";

import * as React from "react";
import { Field, Input, RadioGroup } from "@vamos-ui/react";

export default function RadioGroupHorizontal() {
  const [type, setType] = React.useState<"individual" | "company">("company");
  return (
    <div className="grid w-full max-w-md gap-4">
      <Field label="Invoice to">
        <RadioGroup
          orientation="horizontal"
          name="invoiceType"
          value={type}
          onValueChange={setType}
          items={[
            { value: "individual", label: "Individual" },
            { value: "company", label: "Company" },
          ]}
        />
      </Field>
      {type === "company" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" required>
            <Input name="company" defaultValue="Lumen Architects Ltd." />
          </Field>
          <Field label="Tax number" required>
            <Input name="taxId" inputMode="numeric" defaultValue="4870129356" />
          </Field>
        </div>
      ) : (
        <Field label="Full name" required>
          <Input name="fullName" defaultValue="Deniz Arslan" />
        </Field>
      )}
    </div>
  );
}
