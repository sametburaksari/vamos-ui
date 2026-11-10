import { Field, RadioGroup } from "@vamos-cms/ui";

export default function RadioGroupSegmented() {
  return (
    <div className="grid gap-5">
      <Field label="Billing period">
        <RadioGroup
          variant="segmented"
          name="period"
          defaultValue="yearly"
          items={[
            { value: "monthly", label: "Monthly" },
            { value: "yearly", label: "Yearly · save 20%" },
          ]}
        />
      </Field>
      <Field label="Party size" hint="For larger groups, call the restaurant.">
        <RadioGroup
          variant="segmented"
          size="sm"
          name="guests"
          defaultValue="2"
          items={["1", "2", "3", "4", "5", "6"].map((n) => ({ value: n, label: n }))}
        />
      </Field>
    </div>
  );
}
