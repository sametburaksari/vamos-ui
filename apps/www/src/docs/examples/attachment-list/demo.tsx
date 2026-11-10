"use client";

import * as React from "react";
import { AttachmentList, Card, CardBody, CardHeader, toast, type AttachmentData } from "@vamos-cms/ui";

const initial: AttachmentData[] = [
  { id: "f1", name: "Master services agreement — Northwind Traders 2027.pdf", size: 1_240_000, mime: "application/pdf", url: "#", uploadedBy: "Ayşe Kaya", uploadedAt: "2026-11-04" },
  { id: "f2", name: "Q4 pricing proposal.docx", size: 312_000, mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", url: "#", uploadedBy: "Daniel Brooks", uploadedAt: "2026-11-02" },
  { id: "f3", name: "Seat forecast.xlsx", size: 86_400, mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", url: "#", uploadedBy: "Ayşe Kaya", uploadedAt: "2026-10-28" },
  { id: "f4", name: "Kickoff deck.pptx", size: 8_700_000, mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", url: "#", uploadedBy: "Mehmet Yılmaz", uploadedAt: "2026-10-21" },
];

export default function AttachmentListDemo() {
  const [files, setFiles] = React.useState(initial);
  const [previewing, setPreviewing] = React.useState<string | null>(null);

  const remove = async (file: AttachmentData) => {
    await new Promise((r) => setTimeout(r, 400));
    const index = files.findIndex((f) => f.id === file.id);
    setFiles((all) => all.filter((f) => f.id !== file.id));
    toast(`Removed “${file.name}”`, {
      action: { label: "Undo", onClick: () => setFiles((all) => [...all.slice(0, index), file, ...all.slice(index)]) },
    });
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader title="Documents" description={previewing ? `Previewing ${previewing}` : "Deal · Northwind renewal 2027"} />
      <CardBody>
        <AttachmentList
          items={files}
          onPreview={(f) => setPreviewing(f.name)}
          onRemove={remove}
          onAddFiles={(added) => toast.success(`${added.length} file(s) queued for upload`)}
        />
      </CardBody>
    </Card>
  );
}
