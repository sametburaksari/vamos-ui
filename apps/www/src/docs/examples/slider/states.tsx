import { Field, Slider } from "@vamos-cms/ui";

export default function SliderStates() {
  return (
    <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-[1fr_auto]">
      <div className="grid gap-6">
        <Field label="Small">
          <Slider size="sm" defaultValue={[30]} />
        </Field>
        <Field label="Disabled" disabled>
          <Slider defaultValue={[40, 70]} />
        </Field>
        <Field label="Read-only" hint="Set by your manager." readOnly>
          <Slider defaultValue={[55]} />
        </Field>
        <Field label="Discount" error="Discounts above 40% need approval.">
          <Slider defaultValue={[55]} formatOptions={{ style: "unit", unit: "percent" }} />
        </Field>
      </div>
      <Field label="Volume" className="h-48 justify-items-center">
        <Slider orientation="vertical" defaultValue={[65]} />
      </Field>
    </div>
  );
}
