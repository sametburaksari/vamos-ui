"use client";

import * as React from "react";
import { ColorPicker, Field } from "@vamos-cms/ui";

export default function ColorPickerInline() {
  const [accent, setAccent] = React.useState("#c6f432");
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-[auto_1fr]">
      <Field label="Site accent">
        <ColorPicker variant="inline" value={accent} onValueChange={setAccent} defaultFormat="oklch" contrastAgainst="#12150f" swatches="tokens" />
      </Field>
      <div className="grid content-start gap-3 rounded-ui-lg border border-line bg-surface-2 p-5">
        <span className="text-xs text-fg-subtle">Preview</span>
        <p className="text-lg font-semibold text-fg">Spring menu is here</p>
        <p className="text-sm text-fg-muted">Twelve new dishes from the Aegean coast, served from 18:00.</p>
        <span className="inline-flex h-9 w-fit items-center rounded-full px-4 text-sm font-medium" style={{ background: accent, color: "#12150f" }}>
          Reserve
        </span>
      </div>
    </div>
  );
}
