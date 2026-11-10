import { ex, type DocEntry } from "../types";
import FileUploadDemo from "../examples/file-upload/demo";
import FileUploadButtonExample from "../examples/file-upload/button";
import ImageUploadExample from "../examples/file-upload/image";
import FileUploadRestrictions from "../examples/file-upload/restrictions";
import FileUploadExisting from "../examples/file-upload/existing";
import FileUploadForm from "../examples/file-upload/form";

const entry: DocEntry = {
  slug: "file-upload",
  title: "File upload",
  group: "Forms & inputs",
  description:
    "Pick or drop files, watch them upload with progress, retry failures, remove or cancel. The drop target is a real button, so the keyboard path is the same as the pointer path; type, size and count rejections come back as localized messages. Without an upload handler the files simply go with the form.",
  source: ["components/file-upload.tsx", "components/progress.tsx", "format/core.ts"],
  basedOn: "Native file input · Drag and Drop API",
  usage: `import { Field, FileUpload } from "@vamos-ui/react";

<Field label="Documents">
  <FileUpload
    accept=".pdf,image/*"
    maxSize={10_000_000}
    maxFiles={6}
    upload={async (file, { signal, onProgress }) => {
      const { id, url } = await uploadToStorage(file, { signal, onProgress });
      return { id, url };
    }}
  />
</Field>`,
  demo: ex("demo", "Demo", "file-upload/demo.tsx", FileUploadDemo),
  examples: [
    ex("button", "Button variant", "file-upload/button.tsx", FileUploadButtonExample, "FileUploadButton — for toolbars and tight forms. Dropping on the button still works."),
    ex("image", "Image upload", "file-upload/image.tsx", ImageUploadExample, "One image with a live preview in a fixed aspect ratio; Replace and Remove appear on hover or keyboard focus (always on touch)."),
    ex("restrictions", "Restrictions", "file-upload/restrictions.tsx", FileUploadRestrictions, "accept, maxSize and maxFiles reject with a reason and a localized message; sizes use the locale (2,4 MB in Turkish)."),
    ex("existing", "Existing files (compact)", "file-upload/existing.tsx", FileUploadExisting, "Server files are UploadFile objects without file. The compact variant sits in a form row like an input."),
    ex("form", "Plain form submit", "file-upload/form.tsx", FileUploadForm, "No upload: the hidden file input carries the files, so FormData and Server Actions work as is."),
  ],
  api: [
    { name: "FileUpload", props: [
      { name: "accept", type: "string | string[]", description: "MIME types, type/* wildcards and extensions: \"image/*,.pdf\"." },
      { name: "maxSize / minSize", type: "number", description: "Bytes per file." },
      { name: "maxFiles", type: "number", description: "Counted over the list (failed files don't count). maxFiles={1} replaces the file." },
      { name: "multiple", type: "boolean", default: "true unless maxFiles is 1", description: "Allow several files per pick." },
      { name: "value / defaultValue / onValueChange", type: "UploadFile[]", description: "{ key, file?, name, size, type, status, progress?, error?, remoteId?, url?, previewUrl? }." },
      { name: "upload", type: "(file, { signal, onProgress }) => Promise<{ id, url? }>", description: "Uploads each file when added; cancel aborts the signal; a rejected promise shows its message with Retry." },
      { name: "concurrency", type: "number", default: "3", description: "Parallel uploads." },
      { name: "onReject", type: "(rejections: { file, reason, message }[]) => void", description: "reason: type | size | small | count." },
      { name: "variant", type: '"dropzone" | "button" | "compact"', default: '"dropzone"', description: "Look of the trigger." },
      { name: "hint", type: "ReactNode", description: "Replaces the generated hint (\"PDF or PNG · up to 10 MB\")." },
      { name: "showList", type: "boolean", default: "true", description: "Render the file list (or render your own with FileUploadList/Item)." },
      { name: "name · required · disabled · invalid", type: "—", description: "Form name for the native input (only without upload); Field wiring." },
      { name: "labels", type: "Partial<FileUploadLabels>", description: "Built-in strings (upload namespace)." },
    ] },
    { name: "ImageUpload", props: [
      { name: "value / defaultValue / onValueChange", type: "UploadFile | null", description: "The single image." },
      { name: "aspect", type: "string", default: '"16/9"', description: "CSS aspect ratio of the frame." },
      { name: "fit", type: '"cover" | "contain"', default: '"cover"', description: "contain for logos." },
      { name: "accept / maxSize / upload / onReject / hint", type: "—", description: "As FileUpload." },
    ] },
    { name: "FileUploadList · FileUploadItem", props: [
      { name: "file", type: "UploadFile", description: "Thumbnail or type icon, name, size, status, per-file progressbar." },
      { name: "onRemove / onRetry", type: "() => void", description: "Remove (or cancel while uploading) and retry buttons, named after the file." },
    ] },
    { name: "useFileDropzone", props: [
      { name: "useFileDropzone(options)", type: "{ rootProps, inputProps, open, dragging, hint }", description: "The drag-and-drop + picker wiring with localized rejections, for custom drop targets." },
    ] },
  ],
  notes: [
    "File names are NFC-normalised: macOS sends decomposed characters, which breaks the display of ş, ğ and é.",
    "Resumable / chunked uploads (tus) are out of scope — wire them inside your upload function.",
  ],
  covers: ["File upload"],
};

export default entry;
