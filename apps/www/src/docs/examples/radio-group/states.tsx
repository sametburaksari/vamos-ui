import { Field, RadioGroup } from "@vamos-ui/react";

const shipping = [
  { value: "standard", label: "Standard", description: "3–5 business days · Free" },
  { value: "express", label: "Express", description: "Next business day · $14.90" },
  { value: "pickup", label: "Pick up in store", description: "Not available for this order", disabled: true },
];

export default function RadioGroupStates() {
  return (
    <div className="grid gap-8 sm:grid-cols-3">
      <Field label="Shipping (small)">
        <RadioGroup size="sm" defaultValue="standard" items={shipping} />
      </Field>
      <Field label="Shipping" error="Choose a shipping method to continue.">
        <RadioGroup items={shipping} />
      </Field>
      <Field label="Shipping (read-only)" hint="Locked after the order was packed." readOnly>
        <RadioGroup defaultValue="express" items={shipping} />
      </Field>
    </div>
  );
}
