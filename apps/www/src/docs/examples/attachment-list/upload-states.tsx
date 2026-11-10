"use client";

import * as React from "react";
import { AttachmentList, type AttachmentData } from "@vamos-ui/react";

export default function AttachmentListUploadStates() {
  const [progress, setProgress] = React.useState(12);
  React.useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p >= 96 ? 12 : p + 7)), 600);
    return () => clearInterval(id);
  }, []);

  const files: AttachmentData[] = [
    { id: "u1", name: "Employment contract — Selin Arslan.pdf", size: 420_000, mime: "application/pdf", status: "uploading", progress },
    { id: "u2", name: "Passport scan.png", size: 1_900_000, mime: "image/png", status: "processing" },
    { id: "u3", name: "Diploma (notarised).tiff", size: 14_600_000, mime: "image/tiff", status: "error", error: "File is larger than 10 MB" },
    { id: "u4", name: "Bank details form.pdf", size: 96_000, mime: "application/pdf", url: "#", uploadedBy: "Selin Arslan", uploadedAt: "2026-11-09" },
  ];

  return <AttachmentList items={files} onRetry={() => setProgress(12)} onRemove={() => {}} className="w-full max-w-xl" />;
}
