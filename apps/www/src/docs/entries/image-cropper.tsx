import { ex, type DocEntry } from "../types";
import ImageCropperDemo from "../examples/image-cropper/demo";
import ImageCropperAvatar from "../examples/image-cropper/avatar";
import ImageCropperPresets from "../examples/image-cropper/presets";
import ImageCropperSaveCopy from "../examples/image-cropper/save-copy";

const entry: DocEntry = {
  slug: "image-cropper",
  title: "Image cropper",
  group: "Editors & drag-and-drop",
  description:
    "Crops an image to a ratio with drag, pinch, wheel and keyboard, plus a toolbar: ratio presets, zoom, rotate ±90°, flip and reset. It outputs a non-destructive crop rect in source pixels for asset.crops; getCroppedBlob() bakes a copy when you need a new file.",
  source: ["media/image-cropper.tsx"],
  basedOn: "react-easy-crop",
  usage: `import { ImageCropper } from "@vamos-ui/react/media";

<ImageCropper src={asset} defaultAspect={1.91}
  onChange={(rect, preset) => adapter.update(asset.id, { crops: { ...asset.crops, [preset?.name ?? "custom"]: rect } })} />`,
  demo: ex("demo", "Demo", "image-cropper/demo.tsx", ImageCropperDemo),
  examples: [
    ex("avatar", "Round avatar (HR profile)", "image-cropper/avatar.tsx", ImageCropperAvatar, "shape=\"round\" locks 1:1; transform={false} hides rotate and flip."),
    ex("presets", "Named presets", "image-cropper/presets.tsx", ImageCropperPresets, "Each preset can carry a name; onChange reports it so you store asset.crops[name]."),
    ex("save-copy", "Save as copy", "image-cropper/save-copy.tsx", ImageCropperSaveCopy, "getCroppedBlob() renders the crop on a canvas (rotation- and flip-aware, optional maxWidth) for adapter.upload."),
  ],
  api: [
    { name: "ImageCropper", props: [
      { name: "src", type: "string | MediaAsset", description: "Image to crop. Must allow CORS for getCroppedBlob." },
      { name: "value / defaultValue", type: "CropRect | null", description: "Initial crop (e.g. asset.crops.og) in source pixels." },
      { name: "onChange", type: "(rect: CropRect, preset?: CropPreset) => void", description: "Fires when a drag, zoom or key press ends. rect = { x, y, width, height, rotation?, flip? }." },
      { name: "aspect / defaultAspect / onAspectChange", type: 'number | "original"', default: "first preset", description: "Controlled or uncontrolled ratio." },
      { name: "presets", type: "{ label; value: number | \"original\"; name? }[]", default: "Original, Square, Social 1.91:1, Landscape 16:9, Classic 4:3, Portrait 4:5", description: "Ratio buttons; labels get the ratio in the locale's decimals." },
      { name: "shape", type: '"rect" | "round"', default: '"rect"', description: "round = avatar mask, 1:1." },
      { name: "grid", type: "boolean", default: "true", description: "Rule-of-thirds grid." },
      { name: "minZoom / maxZoom", type: "number", default: "1 / 4", description: "Zoom range." },
      { name: "toolbar", type: "boolean", default: "true", description: "Show the toolbar." },
      { name: "transform", type: "boolean", default: "true", description: "Allow rotate and flip." },
      { name: "height", type: "number | string", default: '"22rem"', description: "Stage height." },
      { name: "labels", type: "Partial<ImageCropperLabels>", description: "cropper, zoom, rotateLeft, flipH, reset, preset names… (dictionary namespace imageCropper)." },
    ] },
    { name: "getCroppedBlob(src, rect, options?)", props: [
      { name: "type", type: '"image/webp" | "image/jpeg" | "image/png"', default: '"image/webp"', description: "Output format." },
      { name: "quality", type: "number", default: "0.9", description: "0..1." },
      { name: "maxWidth", type: "number", description: "Downscale wider crops." },
    ] },
    { name: "formatAspectRatio(value, locale?)", props: [{ name: "→", type: "string", description: "16/9 → \"16:9\", 1.91 → \"1.91:1\" (tr: \"1,91:1\")." }] },
  ],
  notes: [
    "Keyboard: focus the crop area and use the arrow keys to move; the zoom slider takes arrows, Page Up/Down, Home/End.",
    "Free-aspect drag handles are not supported (presets cover most needs).",
    "CropRect coordinates are in the rotated and flipped source space, matching getCroppedBlob.",
  ],
  covers: ["Image cropper"],
};

export default entry;
