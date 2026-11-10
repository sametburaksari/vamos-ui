import { ColorPicker, Field } from "@vamos-cms/ui";

export default function ColorPickerAlpha() {
  return (
    <Field label="Hero overlay" hint="Darkens the cover image so the headline stays readable." className="w-full max-w-xs">
      <ColorPicker name="overlay" alpha defaultValue="#12150fa6" defaultFormat="rgb" />
    </Field>
  );
}
