"use client";

import * as React from "react";
import { Button, DatePicker } from "@vamos-cms/ui";
import { SlidersHorizontal } from "lucide-react";

export default function DatePickerButtonTrigger() {
  const [createdOn, setCreatedOn] = React.useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-ui-lg border border-line bg-surface-2 p-2">
      <Button size="sm" variant="ghost">
        <SlidersHorizontal /> Filters
      </Button>
      <span aria-hidden className="h-5 w-px bg-line" />
      <DatePicker
        trigger="button"
        size="sm"
        aria-label="Created on"
        placeholder="Created on: any day"
        displayFormat="medium"
        value={createdOn}
        onValueChange={setCreatedOn}
        clearable
      />
      <span className="ms-auto pe-2 text-xs text-fg-muted tabular">{createdOn ? "18 deals" : "214 deals"}</span>
    </div>
  );
}
