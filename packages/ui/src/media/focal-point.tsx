"use client";

import * as React from "react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { Image } from "../components/image";
import { isMediaAsset } from "./media-provider";
import type { MediaAsset } from "./types";

const focalLabels = {
  label: "Focal point",
  roledescription: "focal point",
  valuetext: "horizontal {x}, vertical {y}",
  instructions: "Click or drag on the image, or use the arrow keys (Shift for bigger steps), to mark the part that must stay in view when the image is cropped.",
  previews: "Crop previews",
  reset: "Center",
};
export type FocalPointLabels = typeof focalLabels;

export type FocalPoint = { x: number; y: number };

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const round = (n: number) => Math.round(n * 1000) / 1000;

export interface FocalPointPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  src: string | MediaAsset;
  /** 0..1 in image space (not mirrored in RTL). */
  value?: FocalPoint;
  defaultValue?: FocalPoint;
  /** Fires while dragging and on every key press. */
  onValueChange?: (value: FocalPoint) => void;
  /** Fires once when a drag or key press ends (autosave here). */
  onValueCommit?: (value: FocalPoint) => void;
  /** Live crop previews next to the image. Default `["1/1", "16/9", "4/5"]`; `false` hides them. */
  previews?: false | ("1/1" | "16/9" | "4/5" | "4/3" | "1.91/1" | "3/2")[];
  /** Max height of the image stage. Default 20rem. */
  maxHeight?: number | string;
  disabled?: boolean;
  labels?: Partial<FocalPointLabels>;
}

/**
 * Marks the part of an image that must stay in view when layouts crop it. A draggable marker over
 * the image plus live previews in common ratios. The marker is a focusable 2-D control:
 * arrows step 1%, Shift + arrows 10%, Home centres it.
 *
 * ```tsx
 * <FocalPointPicker src={asset} defaultValue={asset.focalPoint} onValueCommit={(focalPoint) => adapter.update(asset.id, { focalPoint })} />
 * ```
 */
export const FocalPointPicker = React.forwardRef<HTMLDivElement, FocalPointPickerProps>(function FocalPointPicker(
  { src, value, defaultValue, onValueChange, onValueCommit, previews = ["1/1", "16/9", "4/5"], maxHeight = "20rem", disabled, labels, className, ...props },
  ref,
) {
  const t = useLabels("focalPoint", focalLabels, labels);
  const { locale } = useLocale();
  const [point, setPoint] = useControllableState<FocalPoint>({ value, defaultValue: defaultValue ?? (isMediaAsset(src) ? src.focalPoint : undefined) ?? { x: 0.5, y: 0.5 }, onChange: onValueChange, name: "FocalPointPicker" });
  const stage = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);
  const latest = React.useRef(point);
  latest.current = point;
  const instructionsId = React.useId();
  const url = isMediaAsset(src) ? src.url : src;
  const pct = React.useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }), [locale]);

  const fromPointer = (e: React.PointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r || !r.width || !r.height) return latest.current;
    return { x: round(clamp((e.clientX - r.left) / r.width)), y: round(clamp((e.clientY - r.top) / r.height)) };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const next = fromPointer(e);
    setPoint(next);
    latest.current = next;
    (stage.current?.querySelector("[data-slot=focal-point-marker]") as HTMLElement | null)?.focus({ preventScroll: true });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const next = fromPointer(e);
    setPoint(next);
    latest.current = next;
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    onValueCommit?.(latest.current);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const step = e.shiftKey ? 0.1 : 0.01;
    const p = latest.current;
    let next: FocalPoint | null = null;
    if (e.key === "ArrowLeft") next = { x: clamp(p.x - step), y: p.y };
    else if (e.key === "ArrowRight") next = { x: clamp(p.x + step), y: p.y };
    else if (e.key === "ArrowUp") next = { x: p.x, y: clamp(p.y - step) };
    else if (e.key === "ArrowDown") next = { x: p.x, y: clamp(p.y + step) };
    else if (e.key === "Home") next = { x: 0.5, y: 0.5 };
    if (!next) return;
    e.preventDefault();
    next = { x: round(next.x), y: round(next.y) };
    setPoint(next);
    latest.current = next;
    onValueCommit?.(next);
  };

  const ratio = isMediaAsset(src) && src.width && src.height ? src.width / src.height : undefined;

  return (
    <div ref={ref} data-slot="focal-point" data-disabled={disabled ? "" : undefined} className={cn("vui-focal @container", className)} {...props}>
      <div className={cn("grid gap-4", previews && "@md:grid-cols-[minmax(0,1fr)_9.5rem]")}>
      <div className="flex min-w-0 items-center justify-center rounded-ui bg-scene p-2">
        <div
          ref={stage}
          data-slot="focal-point-stage"
          className={cn("vui-focal-stage relative inline-block max-w-full touch-none select-none", disabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" draggable={false} className="block h-auto max-w-full rounded-ui-sm object-contain" style={{ maxHeight, aspectRatio: ratio ? String(ratio) : undefined }} />
          <span aria-hidden className="vui-focal-guides pointer-events-none absolute inset-0" style={{ "--fx": `${point.x * 100}%`, "--fy": `${point.y * 100}%` } as React.CSSProperties} />
          <div
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-label={t("label")}
            aria-roledescription={t("roledescription")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(point.x * 100)}
            aria-valuetext={t("valuetext", { x: pct.format(point.x), y: pct.format(point.y) })}
            aria-describedby={instructionsId}
            aria-disabled={disabled || undefined}
            data-slot="focal-point-marker"
            onKeyDown={onKeyDown}
            className="vui-focal-marker focus-ring absolute"
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          />
        </div>
        <p id={instructionsId} className="sr-only">
          {t("instructions")}
        </p>
      </div>

      {previews ? (
        <div role="group" aria-label={t("previews")} className="grid grid-cols-3 content-start gap-2 @md:grid-cols-1">
          {previews.map((r) => (
            <figure key={r} className="m-0 grid gap-1">
              <Image src={url} alt="" aspect={r} focal={point} rounded="ui" placeholder="none" className="rounded-ui-sm bg-surface-2" />
              <figcaption aria-hidden className="tabular text-[11px] text-fg-subtle">{r.replace("/", ":")}</figcaption>
            </figure>
          ))}
        </div>
      ) : null}
      </div>
    </div>
  );
});
