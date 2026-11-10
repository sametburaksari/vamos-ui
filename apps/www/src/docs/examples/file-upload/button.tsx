"use client";

import { FileUploadButton } from "@vamos-cms/ui";
import { fakeUpload } from "./fake-upload";

export default function FileUploadButtonExample() {
  return (
    <div className="grid w-full max-w-lg gap-1.5">
      <p className="text-[13px] font-medium text-fg">Quote attachments</p>
      <FileUploadButton aria-label="Quote attachments" accept=".pdf,.docx,.xlsx" maxSize={20_000_000} upload={fakeUpload} />
    </div>
  );
}
