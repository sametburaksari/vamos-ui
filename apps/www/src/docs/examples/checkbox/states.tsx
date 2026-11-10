import { Checkbox } from "@vamos-ui/react";

export default function CheckboxStates() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="grid gap-3">
        <Checkbox label="Default (md, 18px)" defaultChecked />
        <Checkbox size="sm" label="Small (16px) — tables and dense lists" defaultChecked />
        <Checkbox label="Partially selected" checked="indeterminate" />
      </div>
      <div className="grid gap-3">
        <Checkbox label="Disabled" disabled />
        <Checkbox label="Disabled and checked" disabled defaultChecked />
        <Checkbox label="Read-only" description="Set by your administrator." readOnly defaultChecked />
        <Checkbox label="Invalid" invalid />
      </div>
    </div>
  );
}
