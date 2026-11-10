import { DatePicker, Field } from "@vamos-ui/react";

export default function DatePickerStates() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Small">
        <DatePicker size="sm" defaultValue="2026-11-23" />
      </Field>
      <Field label="Large">
        <DatePicker size="lg" defaultValue="2026-11-23" />
      </Field>
      <Field label="Contract signed" readOnly>
        <DatePicker defaultValue="2026-03-02" />
      </Field>
      <Field label="Renewal date" disabled hint="Set automatically from the plan.">
        <DatePicker defaultValue="2027-03-02" />
      </Field>
      <Field label="Delivery date" error="Pick a weekday — the warehouse is closed at weekends.">
        <DatePicker defaultValue="2026-11-22" />
      </Field>
    </div>
  );
}
