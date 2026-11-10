import { Field, NumberInput, PercentInput } from "@vamos-cms/ui";

export default function NumberExample() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3">
      <Field label="Seats" hint="1–250, arrow keys step, Shift ×10.">
        <NumberInput defaultValue={12} min={1} max={250} precision={0} stepper />
      </Field>
      <Field label="Weight (kg)">
        <NumberInput defaultValue={2.75} min={0} step={0.25} precision={2} />
      </Field>
      <Field label="Discount">
        <PercentInput defaultValue={12.5} stepper step={2.5} />
      </Field>
    </div>
  );
}
