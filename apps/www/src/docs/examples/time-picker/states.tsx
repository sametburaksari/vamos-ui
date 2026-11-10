import { Field, TimeInput } from "@vamos-cms/ui";

export default function TimePickerStates() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3">
      <Field label="With seconds">
        <TimeInput hourCycle={24} seconds defaultValue="08:15:30" />
      </Field>
      <Field label="Disabled" disabled>
        <TimeInput hourCycle={24} defaultValue="12:00" />
      </Field>
      <Field label="Read-only" readOnly>
        <TimeInput hourCycle={24} defaultValue="18:00" />
      </Field>
      <Field label="Out of range" hint="Opening hours are 10:00–22:00.">
        <TimeInput hourCycle={24} defaultValue="23:30" min="10:00" max="22:00" />
      </Field>
      <Field label="Small">
        <TimeInput hourCycle={24} size="sm" />
      </Field>
      <Field label="Large">
        <TimeInput hourCycle={24} size="lg" defaultValue="07:05" />
      </Field>
    </div>
  );
}
