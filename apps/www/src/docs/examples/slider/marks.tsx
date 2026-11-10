import { Field, Slider } from "@vamos-cms/ui";

export default function SliderMarks() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <Field label="Image opacity">
        <Slider defaultValue={[75]} marks={[0, 25, 50, 75, 100].map((v) => ({ value: v, label: `${v}%` }))} step={5} showValue="always" formatOptions={{ style: "unit", unit: "percent" }} />
      </Field>
      <Field label="Seniority" hint="Snaps to the five levels in your career framework.">
        <Slider
          defaultValue={[3]}
          min={1}
          max={5}
          marks={[
            { value: 1, label: "Junior" },
            { value: 2, label: "Mid" },
            { value: 3, label: "Senior" },
            { value: 4, label: "Staff" },
            { value: 5, label: "Principal" },
          ]}
          showValue="never"
        />
      </Field>
    </div>
  );
}
