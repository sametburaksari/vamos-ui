"use client";

import * as React from "react";
import { RecordLayout, ToggleGroup, ToggleGroupItem, type RecordLayoutState } from "@vamos-cms/ui";
import { ContactAside, ContactHeader, ContactMain } from "./contact";

// Loading skeleton, not found and forbidden — the same layout, no extra wiring.
export default function RecordLayoutStates() {
  const [state, setState] = React.useState<RecordLayoutState>("loading");
  const [readOnly, setReadOnly] = React.useState(false);
  return (
    <div className="grid w-full gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup aria-label="Record state" value={state} onValueChange={(v) => setState(v as RecordLayoutState)} size="sm">
          {(["ready", "loading", "not-found", "forbidden"] as const).map((s) => (
            <ToggleGroupItem key={s} value={s}>
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup type="multiple" aria-label="Options" value={readOnly ? ["ro"] : []} onValueChange={(v) => setReadOnly(v.includes("ro"))} size="sm">
          <ToggleGroupItem value="ro">read-only</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="rounded-ui-lg border border-line bg-scene p-6">
        <RecordLayout state={state} readOnly={readOnly}>
          <ContactHeader />
          <ContactMain />
          <ContactAside />
        </RecordLayout>
      </div>
    </div>
  );
}
