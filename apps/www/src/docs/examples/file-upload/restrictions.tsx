"use client";

import * as React from "react";
import { Field, FileUpload, type FileRejection } from "@vamos-cms/ui";

export default function FileUploadRestrictions() {
  const [log, setLog] = React.useState<FileRejection[]>([]);
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Field label="Product photos" hint="Drop a PDF, a 3 MB photo or more than three files to see each rejection.">
        <FileUpload accept="image/png,image/jpeg,image/webp" maxSize={2_000_000} maxFiles={3} onReject={setLog} />
      </Field>
      {log.length ? (
        <code className="font-mono text-xs text-fg-subtle">onReject: {log.map((r) => r.reason).join(", ")}</code>
      ) : null}
    </div>
  );
}
