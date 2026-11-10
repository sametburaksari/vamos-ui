import { ex, type DocEntry } from "../types";
import ImageFieldDemo from "../examples/image-field/demo";
import ImageFieldAvatar from "../examples/image-field/avatar";
import ImageFieldSocialImage from "../examples/image-field/social-image";
import ImageFieldFocalPoint from "../examples/image-field/focal-point";
import ImageFieldCropModes from "../examples/image-field/crop-modes";
import ImageFieldInForm from "../examples/image-field/in-form";

const entry: DocEntry = {
  slug: "image-field",
  title: "Image field",
  group: "Media",
  description:
    "A form field that holds one image: pick it from the library or drop a file, preview, replace, remove, crop to a ratio (non-destructive or as a new copy), set a focal point and a per-use alt text. Warns about missing alt text and low resolution. For featured images, social cards, logos, profile photos and block props.",
  source: ["media/image-field.tsx", "media/focal-point.tsx", "media/image-cropper.tsx", "media/media-picker.tsx"],
  basedOn: "Media picker · Image cropper (react-easy-crop) · own focal-point control",
  usage: `import { ImageField } from "@vamos-ui/react/media";

<Field label="Featured image">
  <ImageField aspect="16/9" recommended={{ width: 1200, height: 630 }} value={cover} onChange={setCover} />
</Field>`,
  demo: ex("demo", "Demo", "image-field/demo.tsx", ImageFieldDemo),
  examples: [
    ex("avatar", "Round avatar (HR profile)", "image-field/avatar.tsx", ImageFieldAvatar, "shape=\"round\" + size=\"sm\" (96px) + layout=\"inline\"; crop locks to 1:1."),
    ex("social-image", "Social image with a low-res warning", "image-field/social-image.tsx", ImageFieldSocialImage, "recommended={{ width: 1200, height: 630 }} warns below that size; the crop preset named og is stored as asset.crops.og."),
    ex("focal-point", "Focal point", "image-field/focal-point.tsx", ImageFieldFocalPoint, "FocalPointPicker on its own: drag, or arrows (Shift for 10%), with live 1:1, 16:9 and 4:5 previews."),
    ex("crop-modes", "Crop modes", "image-field/crop-modes.tsx", ImageFieldCropModes, "metadata keeps the file and stores a rect for the loader; copy uploads a cropped file."),
    ex("in-form", "In a form with validation (CRM)", "image-field/in-form.tsx", ImageFieldInForm, "Field passes label, hint, error and required; name posts the asset id."),
  ],
  api: [
    { name: "ImageField", props: [
      { name: "value / defaultValue / onChange", type: "ImageFieldValue | null", description: "{ asset, alt?, focal?, crop? } — alt and focal override the asset per use; crop is a name or a rect." },
      { name: "aspect", type: 'ImageAspect ("16/9", "1/1", "1.91/1", number…)', default: '"16/9" ("1/1" round)', description: "Preview ratio and default crop ratio." },
      { name: "cropPresets", type: "{ label; value: number; name? }[]", description: "Ratio buttons in the crop dialog; name stores asset.crops[name]." },
      { name: "recommended", type: "{ width; height }", description: "Shows a hint, and a warning when the image is smaller." },
      { name: "shape", type: '"rect" | "round"', default: '"rect"', description: "round for avatars." },
      { name: "size", type: '"sm" | "md" | "full"', default: '"md"', description: "96px avatar · card (22rem) · container width." },
      { name: "layout", type: '"stacked" | "inline"', default: '"stacked"', description: "inline puts actions and alt text beside the preview." },
      { name: "focal", type: "boolean", default: "true (rect)", description: "Focal point tool." },
      { name: "crop", type: 'boolean | "metadata" | "copy"', default: "true", description: "true offers both modes when the adapter can edit (else copy)." },
      { name: "requireAlt", type: "boolean", default: "false", description: "The picker asks for alt text; the field warns while it is missing." },
      { name: "accept", type: "string", default: '"image/*"', description: "Picker filter and drop restriction." },
      { name: "disabled / readOnly / required / invalid", type: "boolean", description: "Also read from a surrounding Field." },
      { name: "name", type: "string", description: "Hidden input with the asset id for native forms." },
      { name: "adapter", type: "MediaAdapter", description: "Default: MediaProvider." },
      { name: "labels", type: "Partial<ImageFieldLabels>", description: "Built-in strings (dictionary namespace imageField)." },
    ] },
    { name: "FocalPointPicker", props: [
      { name: "src", type: "string | MediaAsset", description: "The image." },
      { name: "value / defaultValue / onValueChange", type: "{ x: number; y: number }", description: "0..1 in image space (not mirrored in RTL)." },
      { name: "onValueCommit", type: "(point) => void", description: "Once per drag or key press (autosave)." },
      { name: "previews", type: 'false | ("1/1" | "16/9" | "4/5" | "4/3" | "1.91/1" | "3/2")[]', default: '["1/1","16/9","4/5"]', description: "Live crop previews." },
      { name: "maxHeight", type: "number | string", default: '"20rem"', description: "Image stage height." },
      { name: "disabled / labels", type: "boolean · Partial<FocalPointLabels>", description: "Dictionary namespace focalPoint." },
    ] },
  ],
  notes: [
    "The empty state is a real button (and a drop target); the filled preview is the Replace button and Remove is separate, both labelled. The chosen alt text is shown under the preview.",
    "The focal marker is a focusable 2-D control: aria-roledescription “focal point”, aria-valuetext “horizontal 62%, vertical 40%”; arrows step 1%, Shift + arrows 10%, Home centres.",
    "Save as copy needs a same-origin or CORS-enabled image; otherwise the dialog explains that the image must be uploaded to the library first.",
  ],
  covers: ["Image field (select · crop · focal point)"],
};

export default entry;
