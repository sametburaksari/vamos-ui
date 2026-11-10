"use client";

import * as React from "react";
import { Switch } from "@vamos-ui/react";

// Pretend server: the second save fails so you can see the revert.
let calls = 0;
const save = (on: boolean) =>
  new Promise<void>((resolve, reject) => setTimeout(() => (++calls % 2 === 0 ? reject(new Error("Network")) : resolve()), 900 + (on ? 0 : 100)));

export default function SwitchAsync() {
  const [on, setOn] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");

  return (
    <div className="grid w-full max-w-md gap-2">
      <Switch
        label="Weekly pipeline summary"
        description="Every Monday at 9:00 to the whole sales team."
        checked={on}
        loading={saving}
        onCheckedChange={async (next) => {
          setOn(next); // optimistic
          setSaving(true);
          setMessage("");
          try {
            await save(next);
            setMessage(next ? "Summary turned on." : "Summary turned off.");
          } catch {
            setOn(!next); // revert
            setMessage("Couldn't save. Your previous setting is back.");
          } finally {
            setSaving(false);
          }
        }}
      />
      <p role="status" aria-live="polite" className="min-h-4 ps-12 text-xs text-fg-subtle">
        {message}
      </p>
    </div>
  );
}
