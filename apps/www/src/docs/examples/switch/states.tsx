import { Field, Switch } from "@vamos-ui/react";

export default function SwitchStates() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="grid gap-3">
        <Switch label="Medium (36 × 20)" defaultChecked />
        <Switch size="sm" label="Small (28 × 16)" defaultChecked />
        <Switch label="Saving…" loading defaultChecked />
      </div>
      <div className="grid gap-3">
        <Switch label="Disabled" disabled />
        <Switch label="Disabled, on" disabled defaultChecked />
        <Switch label="Read-only" readOnly defaultChecked />
        <Field label="Two-factor authentication" orientation="horizontal" error="Required by your organisation's policy.">
          <Switch />
        </Field>
      </div>
    </div>
  );
}
