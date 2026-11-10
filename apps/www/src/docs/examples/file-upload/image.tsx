"use client";

import { Field, ImageUpload } from "@vamos-ui/react";
import { fakeUpload } from "./fake-upload";

export default function ImageUploadExample() {
  return (
    <div className="grid w-full max-w-xl items-start gap-5 sm:grid-cols-[1fr_9rem]">
      <Field label="Cover image" hint="1600 × 900 or larger.">
        <ImageUpload aspect="16/9" maxSize={5_000_000} upload={fakeUpload} />
      </Field>
      <Field label="Logo">
        <ImageUpload aspect="1/1" fit="contain" accept="image/png,image/svg+xml" hint="PNG or SVG" />
      </Field>
    </div>
  );
}
