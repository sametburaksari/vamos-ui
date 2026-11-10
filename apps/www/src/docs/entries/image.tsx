import { ex, type DocEntry } from "../types";
import ImageDemo from "../examples/image/demo";
import ImageAspect from "../examples/image/aspect";
import ImageFocalPoint from "../examples/image/focal-point";
import ImagePlaceholder from "../examples/image/placeholder";
import ImageLoaderExample from "../examples/image/loader";
import ImageNextBridge from "../examples/image/next";
import ImageFigure from "../examples/image/figure";
import ImageError from "../examples/image/error";

const entry: DocEntry = {
  slug: "image",
  title: "Image",
  group: "Media",
  description:
    "One image primitive for panels and websites: no layout shift (width/height + aspect-ratio), focal point to object-position, a blur / colour / skeleton placeholder that cross-fades out, srcset from a CDN loader or the asset's variants. Framework-agnostic: a plain <img>, or your framework's image through VamosProvider.",
  source: ["components/image.tsx", "media/types.ts"],
  basedOn: "Native <img> (no dependencies)",
  usage: `import { Image } from "@vamos-cms/ui";

<Image src={asset} aspect="16/9" sizes="(min-width: 1024px) 50vw, 100vw" rounded="ui" />
<Image src="/team/elif.jpg" alt="Elif Demir" width={800} height={800} aspect="1/1" rounded="full" />`,
  demo: ex("demo", "Demo", "image/demo.tsx", ImageDemo),
  examples: [
    ex("aspect", "Aspect ratios", "image/aspect.tsx", ImageAspect, "The box ratio comes from aspect, not from a size prop; the width follows the container."),
    ex("focal-point", "Focal point", "image/focal-point.tsx", ImageFocalPoint, "focal (0..1) becomes object-position, so every crop keeps the subject in frame. It is image space and is not mirrored in RTL."),
    ex("placeholder", "Placeholders", "image/placeholder.tsx", ImagePlaceholder, "blur sharpens an LQIP over 240 ms, color fills with the dominant colour, skeleton shimmers. A MediaAsset picks blur or color automatically."),
    ex("loader", "CDN loader", "image/loader.tsx", ImageLoaderExample, "ImageLoaderProvider (or the media adapter's loader) builds the srcset. Same signature as the Next.js loader."),
    ex("next", "Next.js bridge", "image/next.tsx", ImageNextBridge, "Hand next/image to VamosProvider once; every kit Image renders through it (fill inside the ratio box)."),
    ex("figure", "Captioned figure", "image/figure.tsx", ImageFigure, "Figure + FigureCaption render <figure>/<figcaption> with an optional credit line."),
    ex("error", "Error and processing", "image/error.tsx", ImageError, "A broken source shows a quiet icon (or your fallback); assets with status \"processing\" get a badge."),
  ],
  api: [
    { name: "Image", props: [
      { name: "src", type: "string | MediaAsset", description: "A URL, or an asset that supplies alt, width/height, focal point, placeholder, variants and crops." },
      { name: "alt", type: "string", description: "Required with a URL; optional with an asset (overrides asset.alt). \"\" marks the image decorative (role=\"presentation\"). Dev warning when it looks like a file name." },
      { name: "width / height", type: "number", description: "Intrinsic size. Sets the box ratio when aspect is \"auto\" (no CLS)." },
      { name: "aspect", type: '"auto" | "1/1" | "4/3" | "3/2" | "16/9" | "21/9" | "4/5" | "1.91/1" | number', default: '"auto"', description: "Box ratio. auto uses width/height; without either the image flows at its natural height." },
      { name: "fit", type: '"cover" | "contain"', default: '"cover"', description: "object-fit inside the box." },
      { name: "focal", type: "{ x: number; y: number }", default: "asset.focalPoint", description: "0..1 → object-position. Passed to the loader as focal too." },
      { name: "crop", type: "string | CropRect", description: "Named crop from asset.crops, or a rect. Applied by the loader (non-destructive)." },
      { name: "sizes", type: "string", default: '"100vw" with a srcset', description: "The sizes attribute, e.g. \"(min-width: 1024px) 50vw, 100vw\"." },
      { name: "widths", type: "number[]", default: "[320, 480, 640, 768, 1024, 1280, 1600, 1920]", description: "srcset steps with a loader (capped at the asset width)." },
      { name: "quality", type: "number", description: "Passed to the loader." },
      { name: "priority", type: "boolean", default: "false", description: "Above the fold: loading=\"eager\" + fetchpriority=\"high\"." },
      { name: "placeholder", type: '"blur" | "color" | "skeleton" | "none"', default: "blur → color → skeleton", description: "What shows while loading. Default picks blur with a blurDataURL, color with a colour, else skeleton." },
      { name: "blurDataURL", type: "string", default: "asset.placeholder", description: "Tiny preview (LQIP data URL or small URL), blurred and scaled under the image." },
      { name: "color", type: "string", default: "asset.dominantColor", description: "Placeholder colour." },
      { name: "loader", type: "ImageLoader", description: "Overrides the provider loader for this image." },
      { name: "rounded", type: '"none" | "ui" | "ui-lg" | "full"', default: '"none"', description: "Corner radius from --radius." },
      { name: "frame", type: '"none" | "surface"', default: '"none"', description: "A hairline --surface-border drawn above the image (logos on white, screenshots)." },
      { name: "fallback", type: "ReactNode", description: "Shown instead of the broken-image icon on error (initials, a logo mark)." },
      { name: "processing", type: "boolean", default: 'asset.status === "processing"', description: "Shows the Processing badge." },
      { name: "imgClassName", type: "string", description: "Class for the <img>; className goes to the wrapper." },
      { name: "labels", type: "Partial<{ processing; error }>", description: "Override built-in strings (dictionary namespace image)." },
    ] },
    { name: "ImageLoaderProvider", props: [
      { name: "loader", type: "ImageLoader", description: "({ src, width, quality, focal, crop, format }) => string. Used by every Image below." },
    ] },
    { name: "Figure / FigureCaption", props: [
      { name: "gap", type: '"sm" | "md"', default: '"sm"', description: "Figure: space between media and caption." },
      { name: "credit", type: "ReactNode", description: "FigureCaption: small uppercase credit after the caption." },
    ] },
    { name: "Helpers", props: [
      { name: "getImageSources(src, options)", type: "→ { src, srcSet?, sizes? }", description: "Pure (server-safe) src/srcset builder. useImageSources() is the hook version with the provider loader." },
      { name: "aspectRatioOf(aspect, w?, h?)", type: "→ number | undefined", description: "\"16/9\" → 1.777…" },
      { name: "focalToObjectPosition(focal)", type: "→ string", description: "{ x: 0.62, y: 0.4 } → \"62% 40%\"." },
    ] },
  ],
  notes: [
    "The kit never imports next/image. Pass it to VamosProvider (or use createVamosNextProvider from @vamos-cms/ui/next).",
    "Formats (AVIF/WebP) are the loader's job (format: \"auto\"); art-direction <picture> sources are planned.",
    "Glass mode never blurs over the image; only the frame is drawn above it.",
  ],
  covers: ["Image (aspect · blur placeholder)"],
};

export default entry;
