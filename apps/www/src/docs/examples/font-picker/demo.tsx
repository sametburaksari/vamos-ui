"use client";

import * as React from "react";
import { Field } from "@vamos-cms/ui";
import { FontPicker } from "@vamos-cms/ui/fonts";

export default function FontPickerDemo() {
  const [family, setFamily] = React.useState<string | null>("Fraunces");
  return (
    <div className="w-full max-w-sm">
      <Field label="Heading font" hint="59 Google Fonts families, all with Turkish characters.">
        <FontPicker value={family} onValueChange={setFamily} />
      </Field>
    </div>
  );
}
