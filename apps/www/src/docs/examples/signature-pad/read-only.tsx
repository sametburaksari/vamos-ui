"use client";

import { Field, SignaturePad, textToSvg } from "@vamos-cms/ui";

const stored = {
  kind: "typed" as const,
  text: "Elif Demir",
  svg: textToSvg("Elif Demir", 480, 140),
  signedAt: "2026-11-04T09:32:00Z",
};

export default function SignatureReadOnly() {
  return (
    <Field label="Approved by HR manager" className="w-full max-w-md">
      <SignaturePad readOnly value={stored} height={140} />
    </Field>
  );
}
