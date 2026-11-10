import { ColorPicker, Field } from "@vamos-cms/ui";

export default function ColorPickerStates() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-3">
      <Field label="Small">
        <ColorPicker size="sm" defaultValue="#8a5cd1" />
      </Field>
      <Field label="Read-only" hint="Inherited from the parent brand.">
        <ColorPicker readOnly defaultValue="#0f8a5f" />
      </Field>
      <Field label="Disabled">
        <ColorPicker disabled defaultValue="#c94f7c" />
      </Field>
      <Field label="Invalid" error="This color is reserved for alerts.">
        <ColorPicker defaultValue="#d0303c" />
      </Field>
      <Field label="Transparent">
        <ColorPicker alpha defaultValue="#ffffff00" />
      </Field>
    </div>
  );
}
