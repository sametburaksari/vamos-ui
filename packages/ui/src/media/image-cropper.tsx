"use client";

import * as React from "react";
import Cropper from "react-easy-crop";
import { FlipHorizontal2, FlipVertical2, RotateCcw, RotateCcwSquare, RotateCwSquare, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { IconButton } from "../components/button";
import { Slider } from "../components/slider";
import { isMediaAsset } from "./media-provider";
import type { CropRect, MediaAsset } from "./types";

const cropperLabels = {
  cropper: "Crop area",
  toolbar: "Crop tools",
  instructions: "Drag or use the arrow keys to move the image. Scroll, pinch or use the slider to zoom.",
  aspect: "Aspect ratio",
  zoom: "Zoom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  rotateLeft: "Rotate left",
  rotateRight: "Rotate right",
  flipH: "Flip horizontally",
  flipV: "Flip vertically",
  reset: "Reset crop",
  original: "Original",
  square: "Square",
  social: "Social",
  landscape: "Landscape",
  classic: "Classic",
  portrait: "Portrait",
  story: "Story",
  avatar: "Avatar",
  summary: "{width} × {height} px",
};
export type ImageCropperLabels = typeof cropperLabels;

export interface CropPreset {
  /** Visible name ("Social"). The ratio is appended ("Social 1.91:1"). */
  label: string;
  /** Width / height, or `"original"` for the image's own ratio. */
  value: number | "original";
  /** Key to store the crop under (`asset.crops[name]`), e.g. `"og"`. */
  name?: string;
}

const RATIO_NAMES: [number, string][] = [
  [1, "1:1"],
  [16 / 9, "16:9"],
  [9 / 16, "9:16"],
  [4 / 3, "4:3"],
  [3 / 4, "3:4"],
  [3 / 2, "3:2"],
  [2 / 3, "2:3"],
  [4 / 5, "4:5"],
  [21 / 9, "21:9"],
];

/** `1.91` → "1.91:1" (locale decimal: "1,91:1"), `16/9` → "16:9". */
export function formatAspectRatio(value: number, locale = "en-US"): string {
  const known = RATIO_NAMES.find(([v]) => Math.abs(v - value) < 0.005);
  if (known) return known[1];
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)}:1`;
}

export interface ImageCropperProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  src: string | MediaAsset;
  /** Crop in source pixels (rotated + flipped space). Controlled. */
  value?: CropRect | null;
  /** Initial crop (e.g. `asset.crops.og`). */
  defaultValue?: CropRect | null;
  /** Fires when an interaction ends, with the non-destructive crop. */
  onChange?: (rect: CropRect, preset: CropPreset | undefined) => void;
  aspect?: number | "original";
  defaultAspect?: number | "original";
  onAspectChange?: (aspect: number | "original") => void;
  /** Ratio buttons. Pass `[]` to lock the ratio to `aspect`. */
  presets?: CropPreset[];
  shape?: "rect" | "round";
  /** Rule-of-thirds grid while cropping. Default `true`. */
  grid?: boolean;
  minZoom?: number;
  maxZoom?: number;
  /** Show the toolbar (presets, zoom, rotate, flip, reset). Default `true`. */
  toolbar?: boolean;
  /** Allow rotate / flip. Default `true`. */
  transform?: boolean;
  /** Stage height. Default 22rem. */
  height?: number | string;
  labels?: Partial<ImageCropperLabels>;
}

/**
 * Crops an image to a ratio with drag, pinch, wheel and keyboard (arrows move, the slider zooms),
 * plus a toolbar: ratio presets, zoom, rotate ±90°, flip, reset. It outputs a **non-destructive**
 * `CropRect` in source pixels — store it in `asset.crops` and let the loader apply it, or bake a
 * copy with `getCroppedBlob()`.
 *
 * ```tsx
 * <ImageCropper src={asset} defaultAspect={1.91} onChange={(rect) => adapter.update(asset.id, { crops: { ...asset.crops, og: rect } })} />
 * ```
 */
export const ImageCropper = React.forwardRef<HTMLDivElement, ImageCropperProps>(function ImageCropper(
  {
    src,
    value,
    defaultValue,
    onChange,
    aspect: aspectProp,
    defaultAspect,
    onAspectChange,
    presets: presetsProp,
    shape = "rect",
    grid = true,
    minZoom = 1,
    maxZoom = 4,
    toolbar = true,
    transform = true,
    height = "22rem",
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("imageCropper", cropperLabels, labels);
  const { locale } = useLocale();
  const url = isMediaAsset(src) ? src.url : src;
  const alt = isMediaAsset(src) ? src.alt : "";
  const initial = value ?? defaultValue ?? null;
  const presets = React.useMemo<CropPreset[]>(
    () =>
      presetsProp ??
      (shape === "round"
        ? [{ label: t("avatar"), value: 1 }]
        : [
            { label: t("original"), value: "original" },
            { label: t("square"), value: 1, name: "square" },
            { label: t("social"), value: 1.91, name: "og" },
            { label: t("landscape"), value: 16 / 9 },
            { label: t("classic"), value: 4 / 3 },
            { label: t("portrait"), value: 4 / 5 },
          ]),
    [presetsProp, shape, t],
  );
  const [aspectChoice, setAspectChoice] = useControllableState<number | "original">({
    value: aspectProp,
    defaultValue: defaultAspect ?? (initial ? initial.width / initial.height : presets[0]?.value ?? 1),
    onChange: onAspectChange,
    name: "ImageCropper",
  });

  const [natural, setNatural] = React.useState<{ width: number; height: number } | null>(
    isMediaAsset(src) && src.width && src.height ? { width: src.width, height: src.height } : null,
  );
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(initial?.rotation ?? 0);
  const [flip, setFlip] = React.useState(initial?.flip ?? { h: false, v: false });
  const [area, setArea] = React.useState<CropRect | null>(initial);
  const [resetKey, setResetKey] = React.useState(0);

  const rotatedNatural = natural ? (Math.abs(rotation % 180) === 90 ? { width: natural.height, height: natural.width } : natural) : null;
  const rawAspect = aspectChoice === "original" ? (rotatedNatural ? rotatedNatural.width / rotatedNatural.height : 4 / 3) : aspectChoice;
  const aspect = Number.isFinite(rawAspect) && rawAspect > 0 ? rawAspect : 4 / 3;
  const activePreset = presets.find((p) => (p.value === "original" ? aspectChoice === "original" : typeof aspectChoice === "number" && Math.abs(p.value - aspectChoice) < 0.005));

  const latest = React.useRef({ rotation, flip, activePreset, onChange });
  latest.current = { rotation, flip, activePreset, onChange };

  const emit = React.useCallback((px: { x: number; y: number; width: number; height: number }) => {
    const { rotation: r, flip: f, activePreset: p, onChange: cb } = latest.current;
    const rect: CropRect = { x: Math.round(px.x), y: Math.round(px.y), width: Math.round(px.width), height: Math.round(px.height), ...(r ? { rotation: r } : null), ...(f.h || f.v ? { flip: f } : null) };
    setArea(rect);
    cb?.(rect, p);
  }, []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ h: false, v: false });
    setResetKey((k) => k + 1);
  };
  const rotate = (d: number) => setRotation((r) => (((r + d) % 360) + 360) % 360);

  const tool = "text-fg-muted hover:text-fg";
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const instructionsId = React.useId();

  return (
    <div ref={ref} data-slot="image-cropper" data-shape={shape} className={cn("vui-cropper flex flex-col gap-3", className)} {...props}>
      <div data-slot="image-cropper-stage" className="vui-cropper-stage relative overflow-hidden rounded-ui bg-scene" style={{ height }}>
        <Cropper
          key={resetKey}
          image={url}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          minZoom={minZoom}
          maxZoom={maxZoom}
          cropShape={shape}
          showGrid={grid}
          zoomSpeed={0.5}
          keyboardStep={8}
          restrictPosition
          objectFit="contain"
          transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom * (flip.h ? -1 : 1)}, ${zoom * (flip.v ? -1 : 1)})`}
          initialCroppedAreaPixels={resetKey === 0 && initial ? { x: initial.x, y: initial.y, width: initial.width, height: initial.height } : undefined}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={(_, px) => emit(px)}
          onMediaLoaded={(m) => {
            if (m.naturalWidth > 0 && m.naturalHeight > 0) setNatural({ width: m.naturalWidth, height: m.naturalHeight });
          }}
          mediaProps={{ alt } as React.ImgHTMLAttributes<HTMLElement>}
          cropperProps={{ "aria-label": t("cropper"), "aria-describedby": instructionsId, role: "application" } as React.HTMLAttributes<HTMLDivElement>}
          classes={{ containerClassName: "vui-cropper-container", cropAreaClassName: "vui-cropper-area focus-ring", mediaClassName: "vui-cropper-media" }}
        />
        <p id={instructionsId} className="sr-only">
          {t("instructions")}
        </p>
        {area ? (
          <span aria-live="polite" className="tabular surface-popover pointer-events-none absolute start-3 bottom-3 rounded-full px-2.5 py-1 text-[11.5px] text-fg-muted">
            {t("summary", { width: nf.format(area.width), height: nf.format(area.height) })}
          </span>
        ) : null}
      </div>

      {toolbar ? (
        <div data-slot="image-cropper-toolbar" role="toolbar" aria-label={t("toolbar")} className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          {presets.length > 1 ? (
            <div role="group" aria-label={t("aspect")} className="flex flex-wrap items-center gap-1 rounded-ui bg-surface-2 p-1">
              {presets.map((p) => {
                const ratio = p.value === "original" ? null : formatAspectRatio(p.value, locale);
                const selected = activePreset === p;
                return (
                  <button
                    key={p.label + String(p.value)}
                    type="button"
                    aria-pressed={selected}
                    data-slot="image-cropper-preset"
                    onClick={() => setAspectChoice(p.value)}
                    className={cn(
                      "focus-ring inline-flex h-7 items-center gap-1.5 rounded-ui-sm px-2.5 text-[12.5px] font-medium whitespace-nowrap text-fg-muted transition-colors hover:text-fg",
                      selected && "bg-surface text-fg shadow-sm ring-1 ring-line",
                    )}
                  >
                    <PresetGlyph ratio={p.value === "original" ? aspect : p.value} round={shape === "round"} />
                    {p.label}
                    {ratio ? <span className="tabular font-normal text-fg-subtle">{ratio}</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="flex min-w-48 flex-1 items-center gap-1.5">
            <IconButton label={t("zoomOut")} tooltip={false} size="sm" className={tool} disabled={zoom <= minZoom} onClick={() => setZoom((z) => Math.max(minZoom, z - 0.25))}>
              <ZoomOut />
            </IconButton>
            <Slider aria-label={t("zoom")} size="sm" min={minZoom} max={maxZoom} step={0.01} value={[zoom]} onValueChange={([z]) => z !== undefined && setZoom(z)} formatValue={(z) => `${nf.format(Math.round(z * 100))}%`} showValue="never" className="flex-1" />
            <IconButton label={t("zoomIn")} tooltip={false} size="sm" className={tool} disabled={zoom >= maxZoom} onClick={() => setZoom((z) => Math.min(maxZoom, z + 0.25))}>
              <ZoomIn />
            </IconButton>
          </div>

          <div className="ms-auto flex items-center gap-0.5">
            {transform ? (
              <>
                <IconButton label={t("rotateLeft")} tooltip={false} size="sm" className={tool} onClick={() => rotate(-90)}>
                  <RotateCcwSquare />
                </IconButton>
                <IconButton label={t("rotateRight")} tooltip={false} size="sm" className={tool} onClick={() => rotate(90)}>
                  <RotateCwSquare />
                </IconButton>
                <IconButton label={t("flipH")} tooltip={false} size="sm" aria-pressed={flip.h} className={cn(tool, flip.h && "bg-selected text-fg")} onClick={() => setFlip((f) => ({ ...f, h: !f.h }))}>
                  <FlipHorizontal2 />
                </IconButton>
                <IconButton label={t("flipV")} tooltip={false} size="sm" aria-pressed={flip.v} className={cn(tool, flip.v && "bg-selected text-fg")} onClick={() => setFlip((f) => ({ ...f, v: !f.v }))}>
                  <FlipVertical2 />
                </IconButton>
                <span aria-hidden className="mx-1 h-4 w-px bg-line" />
              </>
            ) : null}
            <IconButton label={t("reset")} tooltip={false} size="sm" className={tool} onClick={reset}>
              <RotateCcw />
            </IconButton>
          </div>
        </div>
      ) : null}
    </div>
  );
});

function PresetGlyph({ ratio, round }: { ratio: number; round?: boolean }) {
  const w = ratio >= 1 ? 14 : Math.max(6, 14 * ratio);
  const h = ratio >= 1 ? Math.max(6, 14 / ratio) : 14;
  return <span aria-hidden className={cn("inline-block border-[1.5px] border-current opacity-70", round ? "rounded-full" : "rounded-[2px]")} style={{ width: w, height: h }} />;
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */

export interface CroppedBlobOptions {
  type?: "image/webp" | "image/jpeg" | "image/png";
  /** 0..1, default 0.9. */
  quality?: number;
  /** Downscale so the output is at most this wide. */
  maxWidth?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/**
 * Bakes a `CropRect` into a new image (canvas, rotation- and flip-aware) for "Save as copy".
 * The source must be same-origin or served with CORS, or the canvas is tainted.
 */
export async function getCroppedBlob(src: string, rect: CropRect, options: CroppedBlobOptions = {}): Promise<Blob> {
  const { type = "image/webp", quality = 0.9, maxWidth } = options;
  const img = await loadImage(src);
  const rad = ((rect.rotation ?? 0) * Math.PI) / 180;
  const bw = Math.abs(Math.cos(rad) * img.naturalWidth) + Math.abs(Math.sin(rad) * img.naturalHeight);
  const bh = Math.abs(Math.sin(rad) * img.naturalWidth) + Math.abs(Math.cos(rad) * img.naturalHeight);
  const stage = document.createElement("canvas");
  stage.width = Math.round(bw);
  stage.height = Math.round(bh);
  const s = stage.getContext("2d");
  if (!s) throw new Error("Canvas is not available");
  s.translate(bw / 2, bh / 2);
  s.rotate(rad);
  s.scale(rect.flip?.h ? -1 : 1, rect.flip?.v ? -1 : 1);
  s.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  const scale = maxWidth && rect.width > maxWidth ? maxWidth / rect.width : 1;
  const out = document.createElement("canvas");
  out.width = Math.round(rect.width * scale);
  out.height = Math.round(rect.height * scale);
  const o = out.getContext("2d");
  if (!o) throw new Error("Canvas is not available");
  o.imageSmoothingQuality = "high";
  o.drawImage(stage, rect.x, rect.y, rect.width, rect.height, 0, 0, out.width, out.height);
  return new Promise((resolve, reject) => out.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), type, quality));
}
