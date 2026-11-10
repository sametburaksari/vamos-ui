import { Field, Slider } from "@vamos-cms/ui";

export default function SliderRange() {
  return (
    <Field label="Price per night" className="w-full max-w-sm">
      <Slider
        names={["priceMin", "priceMax"]}
        defaultValue={[120, 340]}
        min={40}
        max={600}
        step={10}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        withInputs
      />
    </Field>
  );
}
