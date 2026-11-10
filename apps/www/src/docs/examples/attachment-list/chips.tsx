import { AttachmentList } from "@vamos-cms/ui";

export default function AttachmentListChips() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <AttachmentList
        layout="chips"
        readOnly
        items={[
          { id: "c1", name: "invoice-2026-0412.pdf", size: 182_000, mime: "application/pdf", url: "#" },
          { id: "c2", name: "delivery-note.jpg", size: 1_100_000, mime: "image/jpeg", url: "#" },
          { id: "c3", name: "partner-commission-october.csv", size: 24_300, mime: "text/csv", url: "#" },
        ]}
      />
      <AttachmentList layout="chips" size="sm" items={[]} empty="No files on this ticket yet" />
    </div>
  );
}
