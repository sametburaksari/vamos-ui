"use client";

import * as React from "react";
import { ColorPicker, Field } from "@vamos-cms/ui";

export default function ColorPickerContrast() {
  const [color, setColor] = React.useState("#d9822b");
  return (
    <div className="flex flex-wrap items-end gap-4">
      <Field label="Button color" hint="White text needs 4.5:1 for normal-size labels." className="w-full max-w-xs">
        <ColorPicker value={color} onValueChange={setColor} contrastAgainst="#ffffff" swatches="tokens" />
      </Field>
      <button type="button" className="h-(--control-h) rounded-ui px-4 text-sm font-medium" style={{ background: color, color: "#ffffff" }}>
        Book a table
      </button>
    </div>
  );
}
