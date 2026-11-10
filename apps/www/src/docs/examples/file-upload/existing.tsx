"use client";

import * as React from "react";
import { Field, FileUpload, type UploadFile } from "@vamos-cms/ui";
import { fakeUpload } from "./fake-upload";

const serverFiles: UploadFile[] = [
  { key: "doc_81f2", name: "Master services agreement — Moda Wellness.pdf", size: 1_842_000, type: "application/pdf", status: "done", remoteId: "doc_81f2", url: "#" },
  { key: "doc_81f3", name: "Rate card 2026.xlsx", size: 96_400, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", status: "done", remoteId: "doc_81f3", url: "#" },
];

export default function FileUploadExisting() {
  const [files, setFiles] = React.useState(serverFiles);
  return (
    <div className="grid w-full max-w-lg gap-2">
      <Field label="Contract files">
        <FileUpload variant="compact" value={files} onValueChange={setFiles} upload={fakeUpload} />
      </Field>
      <p className="text-xs text-fg-subtle">{files.length} files · {files.filter((f) => f.file).length} new</p>
    </div>
  );
}
