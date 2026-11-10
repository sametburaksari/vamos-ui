"use client";

import * as React from "react";
import { DateTimePicker, Field, todayIso } from "@vamos-cms/ui";

export default function DatePickerDateTime() {
  const [publishAt, setPublishAt] = React.useState<string | null>(null);
  return (
    <div className="grid w-full max-w-md gap-3">
      <Field label="Publish at" hint="The post goes live at this local time in Istanbul.">
        <DateTimePicker value={publishAt} onValueChange={setPublishAt} min={todayIso()} step={30} timeZone="Europe/Istanbul" />
      </Field>
      <p className="font-mono text-xs text-fg-subtle">value: {publishAt ?? "null"}</p>
    </div>
  );
}
