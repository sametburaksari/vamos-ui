import { ex, type DocEntry } from "../types";
import DownloadKitDemo from "../examples/download-kit/demo";
import DownloadKitLinks from "../examples/download-kit/links";

const entry: DocEntry = {
  slug: "download-kit",
  title: "Download kit",
  group: "Data display",
  description:
    "A list of files to download (press kit, brand assets, templates, datasets) with format and size. Each row downloads on its own; ticked rows download together as one ZIP built in the browser with no dependency. Files can be hosted (href) or generated on demand (data), and a file that fails to fetch is listed in a note inside the archive instead of breaking it.",
  source: ["components/download-kit.tsx", "components/_zip.ts"],
  usage: `import { DownloadKit } from "@vamos-ui/react";

<DownloadKit archiveName="press-kit" assets={[
  { id: "logo", name: "Logo, light background", file: "logo.svg", href: "/press/logo.svg", format: "SVG", size: 4_200 },
  { id: "facts", name: "Fact sheet", file: "facts.txt", data: () => factSheetText, format: "TXT" },
]} />`,
  demo: ex("demo", "Demo", "download-kit/demo.tsx", DownloadKitDemo),
  examples: [
    ex("links", "Links only", "download-kit/links.tsx", DownloadKitLinks, "selectable={false}: hosted files become plain download links that work without JavaScript."),
  ],
  api: [
    { name: "DownloadKit", props: [
      { name: "assets", type: "DownloadAsset[]", description: "{ id, name, file, size? (bytes), format?, description?, preview?, icon?, href?, data? }. data (string, bytes, Blob or a promise) wins over href." },
      { name: "selectable", type: "boolean", default: "true", description: "Checkboxes, select all and the ZIP button." },
      { name: "selected / defaultSelected / onSelectedChange", type: "string[]", description: "Selected ids (default: all)." },
      { name: "archiveName", type: "string", default: '"downloads"', description: "ZIP name without .zip, also the folder inside it." },
      { name: "onDownload", type: "({ ids, file, size, kind }) => void", description: "After a file or the archive is saved (analytics)." },
      { name: "labels", type: "Partial<DownloadKitLabels>", description: 'Dictionary namespace "downloadKit".' },
    ] },
    { name: "createZip(entries, date?)", props: [
      { name: "returns", type: "Blob", description: "A stored (uncompressed) ZIP with UTF-8 names from { name, data: Uint8Array }[]." },
    ] },
  ],
  notes: [
    "The ZIP fetches hosted files, so they must be same-origin or allow CORS; the single download of a hosted file is a plain link and has no such limit.",
    "Progress and results go to a polite status line. Select all is tri-state and every row checkbox is named after its file.",
    "Stored ZIPs are not compressed: fine for images, PDFs and archives; compress large text datasets on the server.",
  ],
  covers: [],
};

export default entry;
