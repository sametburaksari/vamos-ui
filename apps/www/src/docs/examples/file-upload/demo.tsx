"use client";

import { Field, FileUpload } from "@vamos-cms/ui";
import { fakeUpload } from "./fake-upload";

export default function FileUploadDemo() {
  return (
    <Field label="Onboarding documents" hint="ID copy, signed contract and diploma. Name a file “fail.pdf” to see an error." className="w-full max-w-lg">
      <FileUpload accept=".pdf,image/png,image/jpeg" maxSize={10_000_000} maxFiles={6} upload={fakeUpload} />
    </Field>
  );
}
