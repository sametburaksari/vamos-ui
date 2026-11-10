"use client";

import * as React from "react";
import { Badge, Field, UserPicker, type PickerUser } from "@vamos-cms/ui";

const agents: PickerUser[] = [
  { id: "a1", name: "Elif Şahin", meta: "Tier 2 support", status: "online" },
  { id: "a2", name: "Daniel Osei", meta: "Tier 1 support", status: "online" },
  { id: "a3", name: "Mira Kovač", meta: "Tier 1 support", status: "away" },
  { id: "a4", name: "Hugo Brandt", meta: "Billing specialist", status: "busy" },
];

export default function UserPickerMe() {
  const [owner, setOwner] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-sm gap-3 rounded-ui border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-fg-subtle">#48213</span>
        <Badge tone="warning" dot>Waiting on us</Badge>
      </div>
      <p className="text-sm font-medium text-fg">Invoice INV-2042 was charged twice</p>
      <Field label="Ticket owner">
        <UserPicker source={agents} currentUserId="a2" value={owner} onValueChange={setOwner} />
      </Field>
    </div>
  );
}
