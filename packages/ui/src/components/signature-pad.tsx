"use client";

import * as React from "react";
import { getStroke } from "perfect-freehand";
import { Eraser, PenLine, Type, Undo2 } from "lucide-react";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { useFieldContext } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { useContainerWidth } from "../lib/use-container-width";
import { Button } from "./button";
import { Input } from "./input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

/* ------------------------------------------------------------------ */
/* Types & export helpers                                              */
/* ------------------------------------------------------------------ */

/** A point: x, y in pad pixels and pressure 0–1. */
export type SignaturePoint = [x: number, y: number, pressure: number];

export interface SignatureValue {
  kind: "drawn" | "typed";
  /** Standalone SVG document; ink is always solid dark so it prints on paper. */
  svg: string;
  /** PNG data URL (with `exportPng`). */
  png?: string;
  /** The typed name (typed signatures). */
  text?: string;
  /** Raw strokes of a drawn signature (keeps undo working after reload). */
  strokes?: SignaturePoint[][];
  /** Size of the pad the strokes were drawn on. */
  width?: number;
  height?: number;
  /** ISO instant. */
  signedAt: string;
}

/** Exported ink colour: the same in light and dark themes, so stored signatures print correctly. */
export const SIGNATURE_INK = "#14170f";
/** Font stack for typed signatures (override `--font-signature` to load a handwriting font). */
const TYPED_FONT = "var(--font-signature)";
const TYPED_FONT_EXPORT = '"Segoe Script", "Snell Roundhand", "Brush Script MT", "Apple Chancery", cursive';

const STROKE_OPTIONS = { size: 3.4, thinning: 0.62, smoothing: 0.55, streamline: 0.45, start: { taper: 6 }, end: { taper: 10 } };

/** SVG path data for a perfect-freehand outline. */
export function outlineToPath(outline: number[][]): string {
  if (outline.length < 2) return "";
  const r = (n: number) => Math.round(n * 100) / 100;
  let d = `M${r(outline[0]![0]!)} ${r(outline[0]![1]!)}Q`;
  for (let i = 0; i < outline.length; i++) {
    const [x0, y0] = outline[i]!;
    const [x1, y1] = outline[(i + 1) % outline.length]!;
    d += `${r(x0!)} ${r(y0!)} ${r((x0! + x1!) / 2)} ${r((y0! + y1!) / 2)} `;
  }
  return `${d.trim()}Z`;
}

/** SVG path for one stroke (a dot when it is a single tap). */
export function strokeToPath(points: SignaturePoint[], simulatePressure = true): string {
  return outlineToPath(getStroke(points, { ...STROKE_OPTIONS, simulatePressure }));
}

const escapeXml = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

/** Standalone SVG of drawn strokes. */
export function strokesToSvg(strokes: SignaturePoint[][], width: number, height: number): string {
  const paths = strokes.map((s) => `<path d="${strokeToPath(s)}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" width="${Math.round(width)}" height="${Math.round(height)}" fill="${SIGNATURE_INK}">${paths}</svg>`;
}

function typedFontSize(height: number) {
  return Math.round(Math.min(56, height * 0.32));
}

/** Standalone SVG of a typed name. */
export function textToSvg(text: string, width: number, height: number): string {
  const size = typedFontSize(height);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(width)} ${Math.round(height)}" width="${Math.round(width)}" height="${Math.round(height)}"><text x="24" y="${Math.round(height * 0.68)}" font-family='${TYPED_FONT_EXPORT}' font-size="${size}" font-style="italic" fill="${SIGNATURE_INK}">${escapeXml(text)}</text></svg>`;
}

function toPng(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void): string | undefined {
  try {
    if (typeof document === "undefined") return undefined;
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.scale(scale, scale);
    ctx.fillStyle = SIGNATURE_INK;
    draw(ctx);
    return canvas.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

/** PNG data URL of drawn strokes (transparent background). */
export function strokesToPng(strokes: SignaturePoint[][], width: number, height: number): string | undefined {
  if (typeof Path2D === "undefined") return undefined;
  return toPng(width, height, (ctx) => strokes.forEach((s) => ctx.fill(new Path2D(strokeToPath(s)))));
}

/** SVG data URL, for `<img src>` (safe: images never run scripts). */
export const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/* ------------------------------------------------------------------ */
/* SignaturePad                                                        */
/* ------------------------------------------------------------------ */

const signatureLabels = {
  draw: "Draw",
  type: "Type",
  clear: "Clear",
  undo: "Undo",
  placeholder: "Sign here",
  typePlaceholder: "Type your full name",
  typeLabel: "Full name",
  pad: "Signature pad. Drawing needs a mouse, pen or finger; use Type to sign with the keyboard.",
  drawn: "Signature drawn, {count, plural, one {# stroke} other {# strokes}}",
  preview: "Signature preview",
  signed: "Signed {date}",
  signature: "Signature",
  empty: "Not signed",
  cleared: "Signature cleared",
};
export type SignaturePadLabels = typeof signatureLabels;

export interface SignaturePadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: SignatureValue | null;
  defaultValue?: SignatureValue | null;
  onValueChange?: (value: SignatureValue | null) => void;
  /** Available modes. Default both — Type is the keyboard-accessible path, keep it unless another one exists. */
  modes?: ("draw" | "type")[];
  /** Pad height in px. Default 176. */
  height?: number;
  /** On-screen ink. Exported ink is always solid dark. Default `"fg"`. */
  penColor?: "fg" | "accent";
  /** Include a PNG data URL in the value (and in the hidden input instead of SVG). */
  exportPng?: boolean;
  /** Hidden input name; carries the SVG (or the PNG data URL with `exportPng`). */
  name?: string;
  disabled?: boolean;
  /** Shows the stored signature as an image with its timestamp. */
  readOnly?: boolean;
  invalid?: boolean;
  required?: boolean;
  labels?: Partial<SignaturePadLabels>;
}

/**
 * Captures a handwritten (pointer: mouse, pen with pressure, touch) or typed signature. Strokes
 * are smoothed with `perfect-freehand` and exported as SVG (and PNG on request); the ink you
 * export is always dark, so stored signatures print correctly in any theme.
 *
 * A drawn or typed image is not a qualified electronic signature (eIDAS, Turkey's Law 5070) —
 * the legal wording around it is the app's responsibility.
 *
 * ```tsx
 * <Field label="Customer signature" required><SignaturePad name="signature" exportPng /></Field>
 * ```
 */
export const SignaturePad = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SignaturePadProps>(function SignaturePad(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    modes = ["draw", "type"],
    height = 176,
    penColor = "fg",
    exportPng = false,
    name,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    invalid: invalidProp,
    required: requiredProp,
    labels,
    className,
    id,
    "aria-describedby": describedBy,
    ...rest
  } = props;
  const field = useFieldContext();
  const disabled = disabledProp ?? field?.disabled ?? false;
  const readOnly = readOnlyProp ?? field?.readOnly ?? false;
  const invalid = invalidProp ?? field?.invalid ?? false;
  const required = requiredProp ?? field?.required ?? false;
  const submitName = name ?? field?.name;
  const t = useLabels("signature", signatureLabels, labels);
  const f = useFormat();
  const autoId = React.useId();
  const rootId = id ?? field?.id ?? `sig${autoId.replace(/:/g, "")}`;

  const [sig, setSig] = useControllableState<SignatureValue | null>({ value, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "SignaturePad" });
  const [mode, setMode] = React.useState<"draw" | "type">(sig?.kind === "typed" && modes.includes("type") ? "type" : modes[0] ?? "draw");
  const [strokes, setStrokes] = React.useState<SignaturePoint[][]>(() => (sig?.kind === "drawn" ? sig.strokes ?? [] : []));
  const [current, setCurrent] = React.useState<SignaturePoint[] | null>(null);
  const [typed, setTyped] = React.useState(sig?.kind === "typed" ? sig.text ?? "" : "");
  const [announce, setAnnounce] = React.useState("");
  const { ref: measureRef, width: measured } = useContainerWidth<HTMLDivElement>();
  const width = measured ?? 480;
  const padSize = React.useRef<{ w: number; h: number } | null>(sig?.width && sig.height ? { w: sig.width, h: sig.height } : null);
  const drawing = React.useRef<{ id: number; pen: boolean; rect: DOMRect } | null>(null);
  const currentRef = React.useRef<SignaturePoint[] | null>(null);
  const latest = useLatest({ strokes, typed, width, height, exportPng });

  // Controlled reset (e.g. parent clears the value).
  React.useEffect(() => {
    if (value === undefined) return;
    if (value === null) {
      setStrokes([]);
      setTyped("");
      padSize.current = null;
    } else if (value.kind === "drawn" && value.strokes && value.strokes !== latest.current!.strokes) {
      setStrokes(value.strokes);
      if (value.width && value.height) padSize.current = { w: value.width, h: value.height };
    } else if (value.kind === "typed" && value.text !== undefined && value.text !== latest.current!.typed) setTyped(value.text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const emitDrawn = (next: SignaturePoint[][]) => {
    if (!next.length) {
      setSig(null);
      return;
    }
    const size = padSize.current ?? { w: latest.current!.width, h: latest.current!.height };
    setSig({
      kind: "drawn",
      svg: strokesToSvg(next, size.w, size.h),
      png: latest.current!.exportPng ? strokesToPng(next, size.w, size.h) : undefined,
      strokes: next,
      width: size.w,
      height: size.h,
      signedAt: new Date().toISOString(),
    });
  };

  const emitTyped = (text: string) => {
    const name = text.trim();
    if (!name) {
      setSig(null);
      return;
    }
    const { width: w, height: h, exportPng: png } = latest.current!;
    setSig({
      kind: "typed",
      text: name,
      svg: textToSvg(name, w, h),
      png: png
        ? toPng(w, h, (ctx) => {
            ctx.font = `italic ${typedFontSize(h)}px ${TYPED_FONT_EXPORT}`;
            ctx.fillText(name, 24, h * 0.68);
          })
        : undefined,
      width: w,
      height: h,
      signedAt: new Date().toISOString(),
    });
  };

  const inert = disabled || readOnly;
  const point = (e: React.PointerEvent, rect: DOMRect): SignaturePoint => {
    const size = padSize.current;
    const sx = size ? size.w / rect.width : 1;
    const sy = size ? size.h / rect.height : 1;
    return [(e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy, e.pointerType === "pen" ? e.pressure || 0.5 : 0.5];
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (inert || (e.pointerType === "mouse" && e.button !== 0)) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    if (!padSize.current) padSize.current = { w: rect.width || width, h: rect.height || height };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    drawing.current = { id: e.pointerId, pen: e.pointerType === "pen", rect };
    currentRef.current = [point(e, rect)];
    setCurrent(currentRef.current);
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drawing.current;
    if (!d || d.id !== e.pointerId) return;
    const events = typeof e.nativeEvent.getCoalescedEvents === "function" ? e.nativeEvent.getCoalescedEvents() : [];
    const pts = (events.length ? events : [e.nativeEvent]).map((ev) => point(ev as unknown as React.PointerEvent, d.rect));
    if (!currentRef.current) return;
    currentRef.current = [...currentRef.current, ...pts];
    setCurrent(currentRef.current);
  };
  const finish = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drawing.current;
    if (!d || d.id !== e.pointerId) return;
    drawing.current = null;
    const c = currentRef.current;
    currentRef.current = null;
    setCurrent(null);
    if (!c?.length) return;
    const next = [...latest.current!.strokes, c];
    setStrokes(next);
    emitDrawn(next);
    setAnnounce(t("drawn", { count: next.length }));
  };

  const undo = () => {
    if (mode === "type") {
      setTyped("");
      emitTyped("");
      return;
    }
    const next = strokes.slice(0, -1);
    setStrokes(next);
    if (!next.length) padSize.current = null;
    emitDrawn(next);
    setAnnounce(next.length ? t("drawn", { count: next.length }) : t("cleared"));
  };
  const clear = () => {
    setStrokes([]);
    setTyped("");
    padSize.current = null;
    setSig(null);
    setAnnounce(t("cleared"));
  };

  const ink = penColor === "accent" ? "text-accent-ink" : "text-fg";
  const viewW = padSize.current?.w ?? width;
  const viewH = padSize.current?.h ?? height;
  const hasDrawing = strokes.length > 0 || !!current;
  const empty = mode === "draw" ? !hasDrawing : !typed.trim();
  const hidden = submitName ? <input type="hidden" name={submitName} value={sig ? (exportPng && sig.png ? sig.png : sig.svg) : ""} disabled={disabled} /> : null;
  const groupLabel = field?.labelId ? { "aria-labelledby": field.labelId } : { "aria-label": t("signature") };

  const surface = cn(
    "ui-signature relative w-full overflow-hidden rounded-ui border bg-field select-none touch-none",
    invalid ? "border-danger" : "border-field-border",
    disabled && "opacity-50",
  );
  const baseline = (
    <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-[26%] flex items-end gap-2 border-b border-dashed border-line pb-1">
      <span className="font-display text-lg leading-none text-fg-subtle">×</span>
    </span>
  );

  /* ---------------- read-only ---------------- */
  if (readOnly) {
    return (
      <div ref={ref} {...rest} id={rootId} role="group" {...groupLabel} aria-describedby={mergeIds(field?.describedBy, describedBy)} data-slot="signature-pad" data-readonly="" className={cn("grid min-w-0 gap-1.5", className)}>
        <div className={cn(surface, "border-dashed bg-transparent")} style={{ height }}>
          {sig ? <img src={svgDataUrl(sig.svg)} alt={sig.kind === "typed" && sig.text ? `${t("signature")}: ${sig.text}` : t("signature")} className="ui-signature-ink absolute inset-0 size-full object-contain object-left p-3" /> : <span className="absolute inset-0 flex items-center justify-center text-sm text-fg-subtle">{t("empty")}</span>}
          {baseline}
        </div>
        {sig ? <p className="text-xs text-fg-subtle tabular">{t("signed", { date: f.dateTime(sig.signedAt) })}</p> : null}
        {hidden}
      </div>
    );
  }

  /* ---------------- editable ---------------- */
  const drawPad = (
    <div ref={measureRef} className={surface} style={{ height }} data-empty={!hasDrawing ? "" : undefined}>
      {baseline}
      {!hasDrawing ? (
        <span aria-hidden className="pointer-events-none absolute bottom-[calc(26%+0.5rem)] start-12 text-sm text-fg-subtle">
          {t("placeholder")}
        </span>
      ) : null}
      <svg
        role="img"
        aria-label={t("pad")}
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMinYMid meet"
        className={cn("absolute inset-0 size-full", ink, inert ? "cursor-not-allowed" : "cursor-crosshair")}
        fill="currentColor"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        data-slot="signature-pad-canvas"
      >
        {strokes.map((s, i) => (
          <path key={i} d={strokeToPath(s)} />
        ))}
        {current ? <path d={strokeToPath(current, !drawing.current?.pen)} /> : null}
      </svg>
    </div>
  );

  const typePad = (
    <div className="grid gap-2.5">
      <div className={surface} style={{ height }}>
        {baseline}
        <span
          aria-hidden
          className={cn("pointer-events-none absolute start-6 bottom-[calc(26%+0.25rem)] max-w-[calc(100%-3rem)] truncate italic leading-none", ink, !typed.trim() && "text-fg-subtle opacity-60")}
          style={{ fontFamily: TYPED_FONT, fontSize: typedFontSize(height) }}
        >
          {typed.trim() || t("placeholder")}
        </span>
      </div>
      <Input
        aria-label={t("typeLabel")}
        placeholder={t("typePlaceholder")}
        value={typed}
        disabled={disabled}
        autoComplete="name"
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setTyped(e.currentTarget.value);
          emitTyped(e.currentTarget.value);
        }}
      />
    </div>
  );

  const toolbar = (
    <div className="flex items-center gap-1">
      <Button size="xs" variant="ghost" onClick={undo} disabled={inert || empty} aria-label={t("undo")} title={t("undo")} className="px-1.5">
        <Undo2 aria-hidden className="rtl:-scale-x-100" />
      </Button>
      <Button size="xs" variant="ghost" onClick={clear} disabled={inert || (empty && !sig)}>
        <Eraser aria-hidden /> {t("clear")}
      </Button>
    </div>
  );

  return (
    <div
      ref={ref}
      {...rest}
      id={rootId}
      role="group"
      {...groupLabel}
      aria-describedby={mergeIds(field?.describedBy, describedBy)}
      aria-invalid={invalid || undefined}
      // No aria-required: it isn't allowed on role="group"; the Field label shows "required"
      // and the hidden input carries the constraint.
      data-required={required ? "" : undefined}
      aria-disabled={disabled || undefined}
      data-slot="signature-pad"
      data-mode={mode}
      data-signed={sig ? "" : undefined}
      className={cn("grid min-w-0 gap-2", className)}
    >
      {modes.length > 1 ? (
        <Tabs value={mode} onValueChange={(m) => setMode(m as "draw" | "type")} className="gap-2">
          <div className="flex items-center justify-between gap-2">
            <TabsList variant="segmented" size="sm" overflow="none">
              {modes.includes("draw") ? (
                <TabsTrigger value="draw" icon={<PenLine />} disabled={disabled}>
                  {t("draw")}
                </TabsTrigger>
              ) : null}
              {modes.includes("type") ? (
                <TabsTrigger value="type" icon={<Type />} disabled={disabled}>
                  {t("type")}
                </TabsTrigger>
              ) : null}
            </TabsList>
            {toolbar}
          </div>
          <TabsContent value="draw" className="focus-visible:outline-none" tabIndex={-1}>
            {drawPad}
          </TabsContent>
          <TabsContent value="type" className="focus-visible:outline-none" tabIndex={-1}>
            {typePad}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <div className="flex justify-end">{toolbar}</div>
          {mode === "draw" ? drawPad : typePad}
        </>
      )}
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
      {hidden}
    </div>
  );
});
