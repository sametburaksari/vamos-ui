import { ColorPicker, Field } from "@vamos-cms/ui";

export default function ColorPickerDemo() {
  return (
    <Field label="Brand color" hint="Used for buttons, links and the booking widget." className="w-full max-w-xs">
      <ColorPicker name="brand" defaultValue="#2f6fd6" />
    </Field>
  );
}
