"use client";

import { Field, RecordPicker, arrayRecordSource } from "@vamos-cms/ui";

const owners = [
  { id: "acc_1", name: "Harbor & Pine Legal", plan: "Scale" },
  { id: "acc_2", name: "Fjord Freight", plan: "Growth" },
];
const source = arrayRecordSource("accounts", owners, { getId: (a) => a.id, getLabel: (a) => a.name, getDescription: (a) => a.plan, getAvatar: (a) => ({ name: a.name, shape: "square" }) });

export default function RecordPickerStates() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <Field label="Billing account" required error="Choose the account that pays for this subscription.">
        <RecordPicker source={source} placeholder="Select account" />
      </Field>
      <Field label="Parent account" hint="Locked after the contract is signed." disabled>
        <RecordPicker source={source} defaultValue="acc_1" selectedRecords={owners} />
      </Field>
      <Field label="Sister accounts" readOnly>
        <RecordPicker multiple source={source} defaultValue={["acc_1", "acc_2"]} selectedRecords={owners} />
      </Field>
      <RecordPicker aria-label="Small account picker" size="sm" source={source} placeholder="Small (tables, toolbars)" />
    </div>
  );
}
