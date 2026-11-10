"use client";

import { Field } from "@vamos-ui/react";
import { FontPicker } from "@vamos-ui/react/fonts";

export default function FontPickerCategories() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      {/* Only monospaced families: code blocks, invoice numbers, IDs. */}
      <Field label="Code & numbers">
        <FontPicker categories={["mono"]} defaultValue="JetBrains Mono" />
      </Field>
      {/* Reading faces for long-form body text. */}
      <Field label="Article body">
        <FontPicker categories={["serif"]} defaultValue="Newsreader" />
      </Field>
    </div>
  );
}
