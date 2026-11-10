"use client";

import * as React from "react";
import { Crop, Crosshair, ImagePlus, Pencil, RefreshCw, Trash2, TriangleAlert } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { useFieldControl } from "../lib/field-context";
import { useControllableState } from "../lib/use-controllable-state";
import { Button, IconButton } from "../components/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "../components/dialog";
import { Image, aspectRatioOf, type ImageAspect } from "../components/image";
import { Input } from "../components/input";
import { Progress } from "../components/progress";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import { FocalPointPicker, type FocalPoint } from "./focal-point";
import { ImageCropper, getCroppedBlob, type CropPreset } from "./image-cropper";
import { MediaPicker } from "./media-picker";
import { useMedia } from "./media-provider";
import { isAltMissing } from "./media-utils";
import { useUploadQueue } from "./use-upload-queue";
import type { CropRect, MediaAdapter, MediaAsset } from "./types";

const fieldLabels = {
  set: "Set image",
  setRound: "Add photo",
  hint: "Drop an image here or choose one from the library",
  recommended: "Recommended {width} × {height} px or larger",
  replace: "Replace image",
  crop: "Crop",
  focal: "Focal point",
  remove: "Remove image",
  alt: "Alt text",
  altMissing: "Missing alt text",
  altAdd: "Add alt text",
  altEdit: "Edit alt text",
  altDecorative: "Decorative image",
  altSave: "Done",
  lowRes: "Low resolution: {width} × {height} px. Recommended at least {minWidth} × {minHeight}.",
  uploading: "Uploading {name}",
  uploadError: "Upload failed: {reason}",
  dropHint: "Drop to upload",
  cropTitle: "Crop image",
  cropMode: "Save the crop",
  cropMetadata: "Keep the original, store the crop",
  cropMetadataHint: "Non-destructive: the original file stays untouched.",
  cropCopy: "Save as a new copy",
  cropCopyHint: "Creates a new file in the library.",
  cropSave: "Apply crop",
  cropTainted: "This image is hosted elsewhere, so it can't be edited here. Upload it to the library to crop it.",
  focalTitle: "Set focal point",
  focalDescription: "Mark the part that must stay in view when layouts crop the image.",
  focalSave: "Save focal point",
  cancel: "Cancel",
  pickerTitle: "Select image",
  pickerConfirm: "Use image",
};
export type ImageFieldLabels = typeof fieldLabels;

/** The field's value: the asset plus per-use overrides. */
export interface ImageFieldValue {
  asset: MediaAsset;
  /** Per-use alt text; falls back to `asset.alt`. */
  alt?: string;
  /** Per-use focal point; falls back to `asset.focalPoint`. */
  focal?: FocalPoint;
  /** Named crop (`asset.crops[name]`) or a rect. */
  crop?: string | CropRect;
}

export interface ImageFieldCropPreset {
  label: string;
  value: number;
  /** Stored as `asset.crops[name]` and referenced by name from the value. */
  name?: string;
}

export const imageFieldVariants = cva("vui-image-field group/imgfield relative grid min-w-0 gap-2", {
  variants: {
    size: { sm: "w-24", md: "w-full max-w-[22rem]", full: "w-full" },
    layout: { stacked: "", inline: "grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4" },
  },
  // Inline: the preview keeps the size, the row takes the width.
  compoundVariants: [{ layout: "inline", class: "w-full max-w-md" }],
  defaultVariants: { size: "md", layout: "stacked" },
});

export interface ImageFieldProps {
  value?: ImageFieldValue | null;
  defaultValue?: ImageFieldValue | null;
  onChange?: (value: ImageFieldValue | null) => void;
  /** Else from `MediaProvider`. */
  adapter?: MediaAdapter;
  /** Preview ratio and default crop ratio. Default `"16/9"` (`"1/1"` for `shape="round"`). */
  aspect?: ImageAspect;
  /** Crop ratio buttons. Default: the field's aspect only. */
  cropPresets?: ImageFieldCropPreset[];
  /** Low-resolution warning below this size (e.g. 1200 × 630 for social cards). */
  recommended?: { width: number; height: number };
  shape?: "rect" | "round";
  /** `sm` 96px avatar · `md` card · `full` container width. */
  size?: "sm" | "md" | "full";
  /** `inline` puts the actions beside the preview (avatars, logos). */
  layout?: "stacked" | "inline";
  /** Show the focal-point tool. Default `true` (rect). */
  focal?: boolean;
  /**
   * Crop tool: `true` offers both modes when the adapter can edit, `"metadata"` stores a crop
   * rect (non-destructive), `"copy"` uploads a cropped copy, `false` hides it. Default `true`.
   */
  crop?: boolean | "copy" | "metadata";
  /** The picker asks for alt text; the field warns while it is missing. */
  requireAlt?: boolean;
  /** Default `"image/*"`. */
  accept?: string;
  disabled?: boolean;
  readOnly?: boolean;
  /** Renders a hidden input with the asset id for native forms. */
  name?: string;
  id?: string;
  required?: boolean;
  invalid?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
  className?: string;
  labels?: Partial<ImageFieldLabels>;
}

const ratioOf = (aspect: ImageAspect | undefined, a?: MediaAsset) => aspectRatioOf(aspect ?? "auto", a?.width, a?.height) ?? (a?.width && a?.height ? a.width / a.height : 16 / 9);

/**
 * A form field that holds one image: pick from the library or drop a file, preview, replace,
 * remove, crop to a ratio (non-destructive or as a copy), set a focal point and a per-use alt text.
 * Works inside `Field` (label, hint, error, required).
 *
 * ```tsx
 * <Field label="Featured image" hint="Shown on the blog index and social cards">
 *   <ImageField aspect="16/9" recommended={{ width: 1200, height: 630 }} value={cover} onChange={setCover} />
 * </Field>
 * ```
 */
export const ImageField = React.forwardRef<HTMLDivElement, ImageFieldProps>(function ImageField(props, ref) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    adapter: adapterProp,
    aspect: aspectProp,
    cropPresets,
    recommended,
    shape = "rect",
    size = "md",
    layout = "stacked",
    focal: focalEnabled = shape !== "round",
    crop: cropMode = true,
    requireAlt = false,
    accept = "image/*",
    name,
    className,
    labels,
  } = props;
  const control = useFieldControl({ id: props.id, "aria-describedby": props["aria-describedby"], disabled: props.disabled, readOnly: props.readOnly, required: props.required, "aria-invalid": props.invalid || undefined });
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean(control.readOnly);
  const t = useLabels("imageField", fieldLabels, labels);
  const f = useFormat();
  const { locale } = useLocale();
  const ctx = useMedia();
  const adapter = adapterProp ?? ctx;
  const aspect: ImageAspect = aspectProp ?? (shape === "round" ? "1/1" : "16/9");
  const [value, setValue] = useControllableState<ImageFieldValue | null>({ value: valueProp, defaultValue: defaultValue ?? null, onChange, name: "ImageField" });
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [cropOpen, setCropOpen] = React.useState(false);
  const [focalOpen, setFocalOpen] = React.useState(false);
  const [editingAlt, setEditingAlt] = React.useState(false);
  const [over, setOver] = React.useState(false);
  const altInput = React.useRef<HTMLInputElement>(null);
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const interactive = !disabled && !readOnly;

  const queue = useUploadQueue(adapter, {
    accept,
    guardUnload: true,
    onUploaded: (asset) => setValue({ asset }),
  });
  const current = queue.items.find((it) => it.status === "queued" || it.status === "uploading" || it.status === "processing");
  const failed = !current ? queue.items.filter((it) => it.status === "error").at(-1) : undefined;

  const asset = value?.asset;
  const alt = value?.alt ?? asset?.alt ?? "";
  const missingAlt = asset ? isAltMissing(asset, alt) : false;
  const lowRes = asset && recommended && asset.width && asset.height && (asset.width < recommended.width || asset.height < recommended.height);
  const editable = Boolean(adapter?.capabilities.edit);
  const cropAvailable = cropMode !== false;

  const drop = interactive
    ? {
        onDragOver: (e: React.DragEvent) => {
          if (!Array.from(e.dataTransfer?.types ?? []).includes("Files")) return;
          e.preventDefault();
          setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (e: React.DragEvent) => {
          setOver(false);
          const file = e.dataTransfer?.files?.[0];
          if (!file) return;
          e.preventDefault();
          queue.clearDone();
          queue.add([file]);
        },
      }
    : {};

  const ratio = ratioOf(aspect, asset);
  const round = shape === "round";
  const hintId = React.useId();
  const describedBy = [control["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined;

  const empty = (
    <button
      type="button"
      id={control.id}
      data-slot="image-field-empty"
      data-dragging={over ? "" : undefined}
      aria-describedby={describedBy}
      aria-invalid={control["aria-invalid"]}
      // No aria-required / aria-readonly: not allowed on a button (axe aria-allowed-attr). The Field
      // marks the label as required; read-only is data-readonly and no picker opens.
      data-readonly={readOnly ? "" : undefined}
      disabled={disabled}
      onClick={() => interactive && setPickerOpen(true)}
      className={cn(
        "vui-image-field-empty focus-ring relative flex w-full flex-col items-center justify-center gap-1.5 overflow-hidden border border-dashed border-field-border bg-surface-2 px-3 text-center text-fg-muted transition-colors",
        "hover:border-field-border-hover hover:text-fg disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-danger",
        round ? "rounded-full" : "rounded-ui",
        over && "border-ring bg-accent-soft text-fg",
      )}
      style={{ aspectRatio: String(round ? 1 : ratio) }}
    >
      {current ? (
        <span className="grid w-full max-w-[14rem] gap-2 px-2">
          <span className="truncate text-[12.5px]">{t("uploading", { name: current.file.name })}</span>
          <Progress aria-label={t("uploading", { name: current.file.name })} value={current.status === "uploading" ? current.progress * 100 : current.status === "processing" ? null : 0} />
        </span>
      ) : (
        <>
          {/* An aria-label becomes a hidden prefix so the visible "Add photo" stays in the name (label-in-name). */}
          {props["aria-label"] ? <span className="sr-only">{props["aria-label"]}, </span> : null}
          <ImagePlus aria-hidden strokeWidth={1.5} className={size === "sm" ? "size-5" : "size-6"} />
          <span className={cn("font-medium text-fg", size === "sm" ? "text-[12px]" : "text-[13.5px]")}>{over ? t("dropHint") : round ? t("setRound") : t("set")}</span>
          {size !== "sm" ? <span className="max-w-[16rem] text-[12px] leading-snug text-fg-subtle">{t("hint")}</span> : null}
        </>
      )}
    </button>
  );

  const preview = asset ? (
    <div className={cn("relative", round && "aspect-square")}>
      <button
        type="button"
        id={control.id}
        data-slot="image-field-preview"
        data-dragging={over ? "" : undefined}
        aria-label={`${t("replace")}${alt ? `: ${alt}` : ""}`}
        aria-describedby={describedBy}
        aria-invalid={control["aria-invalid"]}
        data-readonly={readOnly ? "" : undefined}
        disabled={disabled}
        onClick={() => interactive && setPickerOpen(true)}
        className={cn(
          "vui-image-field-preview focus-ring group/preview relative block w-full overflow-hidden bg-surface-2 ring-1 ring-line",
          round ? "rounded-full" : "rounded-ui",
          interactive ? "cursor-pointer" : "cursor-default",
          over && "ring-2 ring-ring",
        )}
      >
        <Image src={asset} alt="" aspect={round ? "1/1" : aspect} focal={value?.focal ?? asset.focalPoint} crop={value?.crop} sizes={size === "sm" ? "96px" : "(min-width: 768px) 360px, 100vw"} placeholder={asset.placeholder ? "blur" : "skeleton"} />
        {interactive ? (
          <span aria-hidden className="vui-image-field-scrim absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/preview:opacity-100">
            <span className="surface-popover inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium">
              <RefreshCw className="size-3.5" />
              {size === "sm" ? null : t("replace")}
            </span>
          </span>
        ) : null}
        {current ? (
          <span className="absolute inset-x-3 bottom-3">
            <Progress aria-label={t("uploading", { name: current.file.name })} value={current.status === "uploading" ? current.progress * 100 : null} />
          </span>
        ) : null}
      </button>
    </div>
  ) : null;

  const actions =
    asset && interactive ? (
      <div data-slot="image-field-actions" className={cn("flex flex-wrap items-center gap-1", layout === "inline" && "col-start-2")}>
        {layout === "inline" ? (
          <Button size="xs" onClick={() => setPickerOpen(true)}>
            <RefreshCw />
            {t("replace")}
          </Button>
        ) : null}
        {cropAvailable ? (
          <Button size="xs" variant="ghost" className="text-fg-muted" onClick={() => setCropOpen(true)}>
            <Crop />
            {t("crop")}
          </Button>
        ) : null}
        {focalEnabled && !round ? (
          <Button size="xs" variant="ghost" className="text-fg-muted" onClick={() => setFocalOpen(true)}>
            <Crosshair />
            {t("focal")}
          </Button>
        ) : null}
        <IconButton label={t("remove")} tooltip={false} size="xs" variant="ghost" className="ms-auto text-fg-muted hover:text-danger" onClick={() => setValue(null)}>
          <Trash2 />
        </IconButton>
      </div>
    ) : null;

  const altLine = asset ? (
    <div data-slot="image-field-alt" className={cn("grid gap-1 text-[12.5px]", layout === "inline" && "col-start-2")}>
      {editingAlt ? (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            setValue({ ...value!, alt: altInput.current?.value ?? "" });
            setEditingAlt(false);
          }}
        >
          <Input ref={altInput} size="sm" autoFocus aria-label={t("alt")} defaultValue={alt} className="flex-1" onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setEditingAlt(false))} />
          <Button size="sm" type="submit">
            {t("altSave")}
          </Button>
        </form>
      ) : missingAlt ? (
        <p className={cn("flex items-center gap-1.5", requireAlt ? "text-warning" : "text-fg-muted")}>
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
          <span>{t("altMissing")}</span>
          {interactive ? (
            <Button size="xs" variant="link" className="ms-1" onClick={() => setEditingAlt(true)}>
              {t("altAdd")}
            </Button>
          ) : null}
        </p>
      ) : (
        <p className="flex min-w-0 items-baseline gap-1.5 text-fg-muted">
          <span className="shrink-0 text-[11px] font-medium tracking-[0.06em] text-fg-subtle uppercase">{t("alt")}</span>
          <span className="min-w-0 truncate text-fg">{alt || t("altDecorative")}</span>
          {interactive ? (
            <IconButton label={t("altEdit")} tooltip={false} size="xs" variant="ghost" className="-my-1 shrink-0 text-fg-subtle" onClick={() => setEditingAlt(true)}>
              <Pencil />
            </IconButton>
          ) : null}
        </p>
      )}
      {lowRes ? (
        <p className="flex items-start gap-1.5 text-warning">
          <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          {t("lowRes", { width: nf.format(asset.width!), height: nf.format(asset.height!), minWidth: nf.format(recommended!.width), minHeight: nf.format(recommended!.height) })}
        </p>
      ) : null}
    </div>
  ) : null;

  return (
    <div ref={ref} data-slot="image-field" data-shape={shape} data-state={asset ? "filled" : "empty"} className={cn(imageFieldVariants({ size, layout }), className)} {...drop}>
      <div className={cn(layout === "inline" && (size === "sm" ? "w-24" : "w-40"), layout === "inline" && "row-span-3 self-start")}>{asset ? preview : empty}</div>
      {actions}
      {altLine}
      <p id={hintId} className={cn("text-[12px]", failed ? "text-danger" : "sr-only")}>
        {failed ? t("uploadError", { reason: failed.error ?? "" }) : recommended ? t("recommended", { width: nf.format(recommended.width), height: nf.format(recommended.height) }) : null}
      </p>
      {!asset && recommended && size !== "sm" && !failed ? (
        <p aria-hidden className={cn("tabular text-[12px] text-fg-subtle", layout === "inline" && "col-start-2")}>
          {t("recommended", { width: f.number(recommended.width), height: f.number(recommended.height) })}
        </p>
      ) : null}
      {name ? <input type="hidden" name={name} value={asset?.id ?? ""} /> : null}

      {interactive ? (
        <MediaPicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          adapter={adapter}
          accept={accept}
          value={asset ? [asset.id] : undefined}
          requireAlt={requireAlt}
          title={t("pickerTitle")}
          confirmLabel={t("pickerConfirm")}
          onSelect={([picked]) => picked && setValue({ asset: picked })}
        />
      ) : null}

      {asset && interactive && cropAvailable ? (
        <ImageFieldCropDialog
          open={cropOpen}
          onOpenChange={setCropOpen}
          asset={asset}
          adapter={adapter}
          aspect={ratio}
          presets={cropPresets}
          shape={shape}
          mode={cropMode === true ? (editable ? "both" : "copy") : cropMode === "metadata" ? "metadata" : "copy"}
          initial={typeof value?.crop === "object" ? value.crop : typeof value?.crop === "string" ? asset.crops?.[value.crop] : undefined}
          t={t}
          onApply={(result) => {
            if (result.kind === "copy") setValue({ asset: result.asset, alt: value?.alt });
            else setValue({ ...value!, asset: result.asset ?? asset, crop: result.crop });
          }}
        />
      ) : null}

      {asset && interactive && focalEnabled && !round ? (
        <Dialog open={focalOpen} onOpenChange={setFocalOpen}>
          <DialogContent size="lg">
            <DialogHeader title={t("focalTitle")} description={t("focalDescription")} />
            {focalOpen ? <ImageFieldFocalBody asset={asset} initial={value?.focal ?? asset.focalPoint} t={t} onSave={(focal) => {
              setValue({ ...value!, focal });
              setFocalOpen(false);
            }} onCancel={() => setFocalOpen(false)} /> : null}
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
});

function ImageFieldFocalBody({ asset, initial, onSave, onCancel, t }: { asset: MediaAsset; initial?: FocalPoint; onSave: (p: FocalPoint) => void; onCancel: () => void; t: ReturnType<typeof useLabels<ImageFieldLabels>> }) {
  const [point, setPoint] = React.useState<FocalPoint>(initial ?? { x: 0.5, y: 0.5 });
  return (
    <>
      <DialogBody>
        <FocalPointPicker src={asset} value={point} onValueChange={setPoint} />
      </DialogBody>
      <DialogFooter>
        <Button onClick={onCancel}>{t("cancel")}</Button>
        <Button variant="primary" onClick={() => onSave(point)}>
          {t("focalSave")}
        </Button>
      </DialogFooter>
    </>
  );
}

type CropResult = { kind: "metadata"; crop: string | CropRect; asset?: MediaAsset } | { kind: "copy"; asset: MediaAsset };

/** The crop dialog of Image field: Image cropper + save mode (non-destructive rect or a new copy). */
function ImageFieldCropDialog({
  open,
  onOpenChange,
  asset,
  adapter,
  aspect,
  presets,
  shape,
  mode,
  initial,
  onApply,
  t,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  asset: MediaAsset;
  adapter?: MediaAdapter;
  aspect: number;
  presets?: ImageFieldCropPreset[];
  shape: "rect" | "round";
  mode: "both" | "metadata" | "copy";
  initial?: CropRect;
  onApply: (r: CropResult) => void;
  t: ReturnType<typeof useLabels<ImageFieldLabels>>;
}) {
  const [rect, setRect] = React.useState<CropRect | null>(initial ?? null);
  const [preset, setPreset] = React.useState<CropPreset | undefined>();
  const [choice, setChoice] = React.useState<"metadata" | "copy">(mode === "copy" ? "copy" : "metadata");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (open) {
      setError(null);
      setRect(initial ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cropperPresets: CropPreset[] | undefined = presets?.map((p) => ({ label: p.label, value: p.value, name: p.name }));

  const apply = async () => {
    if (!rect) return;
    setError(null);
    if (choice === "metadata") {
      let saved: MediaAsset | undefined;
      if (preset?.name && adapter?.capabilities.edit) {
        try {
          saved = await adapter.update(asset.id, { crops: { ...asset.crops, [preset.name]: rect } });
        } catch {
          /* keep the per-use rect */
        }
      }
      onApply({ kind: "metadata", crop: preset?.name && saved ? preset.name : rect, asset: saved });
      onOpenChange(false);
      return;
    }
    if (!adapter) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(asset.url, rect, { type: asset.mime === "image/png" ? "image/png" : "image/webp" });
      const ext = blob.type === "image/png" ? "png" : "webp";
      const file = new File([blob], asset.filename.replace(/\.[^.]+$/, "") + `-crop.${ext}`, { type: blob.type });
      const copy = await adapter.upload(file, { folderId: asset.folderId ?? null, alt: asset.alt, signal: new AbortController().signal, onProgress: () => {} });
      onApply({ kind: "copy", asset: copy });
      onOpenChange(false);
    } catch {
      setError(t("cropTainted"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" mobile="fullscreen">
        <DialogHeader title={t("cropTitle")} />
        <DialogBody className="grid gap-4">
          {open ? (
            <ImageCropper
              src={asset}
              defaultValue={initial}
              defaultAspect={shape === "round" ? 1 : aspect}
              presets={cropperPresets ?? (shape === "round" ? undefined : [])}
              shape={shape}
              height="min(24rem, 50dvh)"
              onChange={(r, p) => {
                setRect(r);
                setPreset(p);
              }}
            />
          ) : null}
          {mode === "both" ? (
            <RadioGroup aria-label={t("cropMode")} value={choice} onValueChange={(v) => setChoice(v as "metadata" | "copy")} className="grid gap-2 sm:grid-cols-2">
              <RadioGroupItem value="metadata" label={t("cropMetadata")} description={t("cropMetadataHint")} />
              <RadioGroupItem value="copy" label={t("cropCopy")} description={t("cropCopyHint")} />
            </RadioGroup>
          ) : null}
          {error ? (
            <p role="alert" className="flex items-start gap-1.5 text-[13px] text-danger">
              <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button variant="primary" disabled={!rect} loading={busy} onClick={() => void apply()}>
            {t("cropSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

