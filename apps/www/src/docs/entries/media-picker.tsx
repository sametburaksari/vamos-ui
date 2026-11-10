import { ex, type DocEntry } from "../types";
import MediaPickerDemo from "../examples/media-picker/demo";
import MediaPickerMultiple from "../examples/media-picker/multiple";
import MediaPickerImperative from "../examples/media-picker/imperative";
import MediaPickerUrlTab from "../examples/media-picker/url-tab";
import MediaPickerRequireAlt from "../examples/media-picker/require-alt";

const entry: DocEntry = {
  slug: "media-picker",
  title: "Media picker",
  group: "Media",
  description:
    "A dialog that picks one or more files for a field: featured image, gallery blocks, company logo, profile photo, document attachment. Library, Upload and From URL tabs; new uploads are selected automatically; a selection tray, a pluralised confirm button, an optional alt-text check, and an imperative useMediaPicker() for code paths.",
  source: ["media/media-picker.tsx", "media/media-library.tsx"],
  basedOn: "Radix Dialog + Tabs · Media library",
  usage: `import { MediaPicker } from "@vamos-cms/ui/media";

<MediaPicker accept="image/*" confirmLabel="Set featured image" onSelect={([asset]) => setCover(asset)}>
  <Button>Set featured image</Button>
</MediaPicker>`,
  demo: ex("demo", "Demo", "media-picker/demo.tsx", MediaPickerDemo),
  examples: [
    ex("multiple", "Multiple with a limit (listing gallery)", "media-picker/multiple.tsx", MediaPickerMultiple, "multiple + max: tiles beyond the limit are disabled, the button reads “Insert 3 images”."),
    ex("imperative", "Imperative (CRM company logo)", "media-picker/imperative.tsx", MediaPickerImperative, "const [asset] = await pick({ accept }) — resolves [] when cancelled. Needs MediaPickerProvider once."),
    ex("url-tab", "From URL", "media-picker/url-tab.tsx", MediaPickerUrlTab, "Shown when the adapter implements sideload; the imported file is added to the library and selected."),
    ex("require-alt", "Require alt text", "media-picker/require-alt.tsx", MediaPickerRequireAlt, "Images without alt text get an inline field or Decorative before Insert is enabled; the text is saved to the library."),
  ],
  api: [
    { name: "MediaPicker", props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Controlled or uncontrolled; or pass a trigger as children." },
      { name: "children", type: "ReactNode", description: "Trigger element (DialogTrigger asChild)." },
      { name: "onSelect", type: "(assets: MediaAsset[]) => void", description: "On confirm, in selection order." },
      { name: "multiple / max", type: "boolean · number", default: "false", description: "Several files, with an optional limit." },
      { name: "accept", type: "string", description: '"image/*": library filter and upload restriction; also switches copy to “image(s)”.' },
      { name: "value", type: "string[]", description: "Preselected asset ids (loaded with getMany)." },
      { name: "title / confirmLabel", type: "string", description: "Dialog title and confirm text. Default “Select image” / “Insert 2 images” (plural rules per locale)." },
      { name: "tabs", type: '("library" | "upload" | "url")[]', default: "library, upload (+ url with sideload)", description: "Tabs and their order." },
      { name: "requireAlt", type: "boolean", default: "false", description: "Ask for alt text before confirming." },
      { name: "size", type: '"md" | "lg" | "full"', default: '"lg"', description: "720px · 1080px with the details panel · full screen." },
      { name: "adapter", type: "MediaAdapter", description: "Default: MediaProvider." },
      { name: "labels / libraryLabels", type: "Partial<MediaPickerLabels> · Partial<MediaLibraryLabels>", description: "Built-in strings (dictionary namespace mediaPicker)." },
    ] },
    { name: "MediaPickerProvider", props: [
      { name: "adapter", type: "MediaAdapter", description: "Optional; default MediaProvider." },
      { name: "children", type: "ReactNode", description: "The app." },
    ] },
    { name: "useMediaPicker()", props: [{ name: "→", type: "(options?: MediaPickOptions) => Promise<MediaAsset[]>", description: "Same options as MediaPicker without open/onSelect." }] },
  ],
  notes: [
    "Focus starts in the search field. The selection count is announced (“2 files selected”). Ctrl/⌘ + Enter confirms.",
    "Files dropped on the Upload tab go to the library and are selected as they finish.",
    "The embedded library is drawn flat inside the dialog, so the dialog stays the only glass layer.",
  ],
  covers: ["Media picker"],
};

export default entry;
