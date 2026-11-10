"use client";

import * as React from "react";
import { Field, UserPicker, type PickerUser } from "@vamos-ui/react";

const team: PickerUser[] = [
  { id: "u_ayse", name: "Ayşe Demir", email: "ayse@northwind.com", meta: "Account executive · Sales", status: "online" },
  { id: "u_mehmet", name: "Mehmet Kaya", email: "mehmet@northwind.com", meta: "Support lead", status: "busy" },
  { id: "u_priya", name: "Priya Raman", email: "priya@northwind.com", meta: "Product designer", status: "away" },
  { id: "u_tom", name: "Tom Hollis", email: "tom@northwind.com", meta: "Engineering manager", status: "online" },
  { id: "u_lea", name: "Léa Martin", email: "lea@northwind.com", meta: "Marketing", status: "offline" },
  { id: "u_jonas", name: "Jonas Weber", email: "jonas@northwind.com", meta: "Left in June", disabled: true },
];

export default function UserPickerDemo() {
  const [assignee, setAssignee] = React.useState<string | null>("u_priya");
  return (
    <div className="w-full max-w-sm">
      <Field label="Assignee" hint="Deactivated people stay listed but can't be picked.">
        <UserPicker source={team} value={assignee} onValueChange={setAssignee} />
      </Field>
    </div>
  );
}
