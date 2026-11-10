import { Field, Slider } from "@vamos-ui/react";

export default function SliderDemo() {
  return (
    <Field label="Deal probability" hint="Used to weight this deal in the revenue forecast." className="w-full max-w-sm">
      <Slider name="probability" defaultValue={[60]} step={5} formatOptions={{ style: "unit", unit: "percent" }} />
    </Field>
  );
}
