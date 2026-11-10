"use client";

import { Field } from "@vamos-ui/react";
import { FontPicker } from "@vamos-ui/react/fonts";

export default function FontPickerStates() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      <Field label="Empty" hint="Nothing chosen yet.">
        <FontPicker placeholder="Pick a body font" />
      </Field>
      <Field label="Invalid" error="Choose a font that supports Greek for the Athens site." required>
        <FontPicker defaultValue="Syne" />
      </Field>
      <Field label="Disabled" hint="Locked by the brand kit." disabled>
        <FontPicker defaultValue="Hanken Grotesk" />
      </Field>
    </div>
  );
}
