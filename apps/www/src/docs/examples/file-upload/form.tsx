"use client";

import * as React from "react";
import { Button, Field, FileUpload, Input } from "@vamos-ui/react";

export default function FileUploadForm() {
  const [sent, setSent] = React.useState<string>();
  return (
    <form
      className="grid w-full max-w-lg gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const cv = data.get("cv");
        setSent(cv instanceof File && cv.size ? `${data.get("fullName")} · ${cv.name}` : "No file attached");
      }}
    >
      <Field label="Full name" name="fullName" required>
        <Input defaultValue="Selin Arslan" autoComplete="name" />
      </Field>
      <Field label="CV" hint="Sent with the form — no upload handler needed." name="cv" required>
        <FileUpload accept=".pdf,.docx" maxFiles={1} maxSize={8_000_000} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Apply for Front-end Engineer
        </Button>
        {sent ? <span className="text-xs text-fg-muted">FormData: {sent}</span> : null}
      </div>
    </form>
  );
}
