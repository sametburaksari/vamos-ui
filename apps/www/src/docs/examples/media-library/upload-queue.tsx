"use client";

import * as React from "react";
import { Button } from "@vamos-cms/ui";
import { MediaLibrary, createMemoryAdapter, type MediaLibraryHandle } from "@vamos-cms/ui/media";

// Upload queue: three at a time, per-file progress, cancel, retry, and the reason a file was
// rejected (type, size). Drop files anywhere on the library, paste them, or use the buttons.
export default function MediaLibraryUploadQueue() {
  const [adapter] = React.useState(() => createMemoryAdapter({ latency: 120, uploadDuration: 2600, capabilities: { maxFileSize: 5_000_000 } }));
  const library = React.useRef<MediaLibraryHandle>(null);

  const addSamples = () => {
    const pdf = (name: string, kb: number) => new File([new Uint8Array(kb * 1024)], name, { type: "application/pdf" });
    library.current?.addFiles([
      pdf("supplier-invoice-0412.pdf", 380),
      pdf("lease-agreement-signed.pdf", 1200),
      pdf("site-survey-scans.pdf", 7200), // over the 5 MB limit
      new File(["MZ"], "installer.exe", { type: "application/x-msdownload" }), // not accepted
    ]);
  };

  return (
    <div className="grid w-full gap-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={addSamples}>
          Add sample files
        </Button>
        <Button size="sm" variant="ghost" onClick={() => library.current?.openFileDialog()}>
          Choose from computer…
        </Button>
      </div>
      <MediaLibrary handleRef={library} adapter={adapter} accept="image/*,application/pdf" maxDimension={2560} detailsPanel={false} height="24rem" />
    </div>
  );
}
