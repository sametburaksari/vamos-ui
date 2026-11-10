"use client";

import * as React from "react";
import { Button, Field, Input } from "@vamos-cms/ui";
import { ImageField, type ImageFieldValue } from "@vamos-cms/ui/media";
import { createDemoMedia } from "../media-library/sample-media";

// Inside a form: Field supplies the label, hint, error and required; `name` posts the asset id.
export default function ImageFieldInForm() {
  const [adapter] = React.useState(() => createDemoMedia());
  const [logo, setLogo] = React.useState<ImageFieldValue | null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const error = submitted && !logo ? "Add a logo before saving the company." : undefined;
  return (
    <form
      className="grid w-full max-w-md gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <Field label="Company name" required>
        <Input defaultValue="Moda Mimarlık" />
      </Field>
      <Field label="Logo" required hint="Square, at least 400 × 400 px." error={error}>
        <ImageField adapter={adapter} name="logoId" aspect="1/1" size="sm" layout="inline" recommended={{ width: 400, height: 400 }} focal={false} value={logo} onChange={setLogo} />
      </Field>
      <Button type="submit" variant="primary" className="justify-self-start">
        Save company
      </Button>
    </form>
  );
}
