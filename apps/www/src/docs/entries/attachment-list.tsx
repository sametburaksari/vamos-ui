import { ex, type DocEntry } from "../types";
import AttachmentListDemo from "../examples/attachment-list/demo";
import AttachmentListGrid from "../examples/attachment-list/grid";
import AttachmentListUploadStates from "../examples/attachment-list/upload-states";
import AttachmentListChips from "../examples/attachment-list/chips";

const entry: DocEntry = {
  slug: "attachment-list",
  title: "Attachment list",
  group: "Data display",
  description:
    "Files attached to a record — contracts on a deal, an employee's documents, a post's downloads. Mime icons tinted per file family, sizes in the current locale, upload progress, processing and error states, preview, download, remove with undo, and an add button or your own upload slot.",
  source: ["components/attachment-list.tsx", "styles/data.css"],
  basedOn: "Native list semantics + Intl.NumberFormat (bytes)",
  usage: `import { AttachmentList } from "@vamos-ui/react";

<AttachmentList
  items={files}
  onPreview={(file) => openLightbox(file)}
  onRemove={(file) => removeWithUndo(file)}
  onAddFiles={(files) => upload(files)}
/>`,
  demo: ex("demo", "Deal documents (CRM)", "attachment-list/demo.tsx", AttachmentListDemo, "Remove fades the row while the promise runs; the toast offers Undo instead of a confirm dialog."),
  examples: [
    ex("grid", "Thumbnail grid", "attachment-list/grid.tsx", AttachmentListGrid, "layout=\"grid\": image thumbnails, or a tinted tile with the extension for other files."),
    ex("upload-states", "Uploading, processing, error (HR)", "attachment-list/upload-states.tsx", AttachmentListUploadStates, "Progress is a progressbar with aria-valuetext like \"45%, contract.pdf\"; errors offer Retry."),
    ex("chips", "Inline chips and empty", "attachment-list/chips.tsx", AttachmentListChips, "layout=\"chips\" for comments and forms; readOnly hides remove and add."),
  ],
  api: [
    { name: "AttachmentList", props: [
      { name: "items", type: "AttachmentData[]", description: "Files to show." },
      { name: "layout", type: '"list" | "grid" | "chips"', default: '"list"', description: "Rows with meta, thumbnail tiles or inline chips." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Row height and text size (list)." },
      { name: "onPreview", type: "(file) => void", description: "Makes the name a button (open a Lightbox). Without it a file with url links to it." },
      { name: "onDownload", type: "(file) => void", description: "Download button. Default: a native download link when url is set." },
      { name: "onRemove", type: "(file) => void | Promise<void>", description: "Remove button; the row fades until the promise settles." },
      { name: "onRetry", type: "(file) => void", description: "Retry on failed uploads." },
      { name: "onAddFiles", type: "(files: File[]) => void", description: "Built-in \"Add files\" button with a file chooser." },
      { name: "accept", type: "string", description: "accept for the built-in chooser." },
      { name: "uploadSlot", type: "ReactNode", description: "Your own upload control after the files (File upload drop zone)." },
      { name: "readOnly", type: "boolean", default: "false", description: "Hides remove, retry and add." },
      { name: "empty", type: "ReactNode", default: '"No files attached"', description: "Shown when there is nothing to list or add." },
      { name: "labels", type: "Partial<AttachmentListLabels>", description: "list, empty, preview, download, remove, retry, uploading, progress, processing, failed, add." },
    ] },
    { name: "AttachmentData", props: [
      { name: "id / name / size / mime", type: "string / string / number / string", description: "Identity, file name with extension, bytes, MIME type." },
      { name: "url / thumbUrl", type: "string", description: "Open/download URL and image thumbnail." },
      { name: "uploadedBy / uploadedAt", type: "string", description: "Meta line: \"1.2 MB · Ayşe Kaya · Nov 4, 2026\"." },
      { name: "status", type: '"uploading" | "processing" | "ready" | "error"', default: '"ready"', description: "Upload state." },
      { name: "progress / error", type: "number / string", description: "0–100 while uploading; message on error." },
    ] },
    { name: "Helpers", props: [
      { name: "AttachmentIcon", type: "{ mime, name, size }", description: "The tinted mime tile on its own." },
      { name: "AttachmentName", type: "{ name }", description: "File name that truncates its base but keeps the extension." },
      { name: "attachmentKind(mime, name)", type: "AttachmentKind", description: "pdf, image, document, spreadsheet, presentation, archive, audio, video, code, text, other." },
      { name: "splitFileName(name)", type: "[base, ext]", description: "\"contract.final.pdf\" → [\"contract.final\", \".pdf\"]." },
    ] },
  ],
  covers: ["Attachment list"],
};

export default entry;
