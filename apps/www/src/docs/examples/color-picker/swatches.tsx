"use client";

import * as React from "react";
import { Badge, ColorSwatchPicker, Field } from "@vamos-ui/react";

const palette = [
  { value: "#2f6fd6", name: "Blue" },
  { value: "#1a9c8c", name: "Teal" },
  { value: "#0f8a5f", name: "Green" },
  { value: "#d9822b", name: "Orange" },
  { value: "#d0303c", name: "Red" },
  { value: "#c94f7c", name: "Rose" },
  { value: "#8a5cd1", name: "Violet" },
  { value: "#5a6053", name: "Graphite" },
];

export default function ColorPickerSwatches() {
  const [color, setColor] = React.useState("#1a9c8c");
  return (
    <div className="grid gap-4">
      <Field label="Label color">
        <ColorSwatchPicker name="labelColor" swatches={palette} value={color} onValueChange={setColor} />
      </Field>
      <div className="flex items-center gap-2 text-xs text-fg-muted">
        Preview
        <Badge color={color} size="md" dot>
          Follow-up
        </Badge>
      </div>
    </div>
  );
}
