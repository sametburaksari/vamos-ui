import { DateRangePicker, Field } from "@vamos-ui/react";

export default function DateRangePickerStates() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <Field label="Campaign flight (small)">
        <DateRangePicker size="sm" defaultValue={{ from: "2026-11-24", to: "2026-12-01" }} />
      </Field>
      <Field label="Contract term" disabled>
        <DateRangePicker defaultValue={{ from: "2026-01-01", to: "2026-12-31" }} />
      </Field>
      <Field label="Billing period" error="The period overlaps an issued invoice.">
        <DateRangePicker defaultValue={{ from: "2026-10-15", to: "2026-11-14" }} />
      </Field>
      <Field label="Empty">
        <DateRangePicker />
      </Field>
    </div>
  );
}
