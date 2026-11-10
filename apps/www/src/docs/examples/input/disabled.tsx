import { Field, Input } from "@vamos-cms/ui";

export default function InputStates() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Field label="Customer ID" hint="Assigned by the billing system.">
        <Input readOnly defaultValue="CUS-20431" />
      </Field>
      <Field label="Plan" disabled>
        <Input defaultValue="Growth (annual)" />
      </Field>
      <Field label="Phone" error="Enter a number with country code, e.g. +90 216 807 29 07.">
        <Input type="tel" defaultValue="216 807" />
      </Field>
    </div>
  );
}
