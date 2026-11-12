"use client";

import * as React from "react";
import {
  CircleAlert,
  CircleCheck,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  ImagePlus,
  RotateCw,
  Upload,
  X,
} from "lucide-react";
import { cn } from "../lib/cn";
import { mergeIds } from "../lib/compose-refs";
import { useFieldControl } from "../lib/field-context";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { controlVariants } from "../lib/variants";
import { Button } from "./button";
import { Progress } from "./progress";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** One file in the list: a new local file or an existing server file (no `file`). */
export interface UploadFile {
  /** Stable key (generated for new files). */
  key: string;
  /** The local file; absent for files that already live on the server. */
  file?: File;
  /** NFC-normalised file name. */
  name: string;
  size: number;
  type: string;
  status: "queued" | "uploading" | "done" | "error";
  /** 0–100 while uploading. */
  progress?: number;
  error?: string;
  /** Id returned by `upload`. */
  remoteId?: string;
  url?: string;
  /** Object URL for image thumbnails (created and revoked by the component). */
  previewUrl?: string;
}

export type FileRejectionReason = "type" | "size" | "small" | "count";

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  /** Localized message ("Brochure.mov: this file type isn't supported (only PDF or PNG)"). */
  message: string;
}

/** Uploads one file. Report progress (0–100) and honour the abort signal. */
export type UploadHandler = (file: File, ctx: { signal: AbortSignal; onProgress: (percent: number) => void }) => Promise<{ id: string; url?: string }>;

const uploadLabels = {
  drop: "Drop files here or {browse}",
  dropOne: "Drop a file here or {browse}",
  browse: "browse",
  choose: "Choose files",
  chooseOne: "Choose file",
  dragActive: "Release to add",
  noFile: "No file chosen",
  hintTypes: "{types}",
  hintSize: "up to {size}",
  hintCount: "{count, plural, one {# file} other {up to # files}}",
  images: "Images",
  videos: "Videos",
  audio: "Audio",
  rejectType: "{name}: this file type isn't supported (only {types})",
  rejectSize: "{name} is larger than {size}",
  rejectSmall: "{name} is smaller than {size}",
  rejectCount: "{name} wasn't added: you can add {count, plural, one {# file} other {up to # files}}",
  queued: "Waiting",
  uploading: "Uploading {percent}",
  done: "Uploaded",
  attached: "Ready to send",
  failed: "Upload failed",
  retry: "Retry {name}",
  retryShort: "Retry",
  progress: "Uploading {name}",
  remove: "Remove {name}",
  cancel: "Cancel upload of {name}",
  announceDone: "{name} uploaded",
  announceError: "{name} failed to upload",
  dismiss: "Dismiss",
  replace: "Replace",
  removeImage: "Remove image",
  imageAlt: "Preview of {name}",
};
export type FileUploadLabels = typeof uploadLabels;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

let keySeq = 0;
const newKey = () => `f${Date.now().toString(36)}${(keySeq++).toString(36)}`;

/** Splits an `accept` value into lowercase tokens: `"image/*,.pdf"` → `["image/*", ".pdf"]`. */
export function parseAccept(accept?: string | string[]): string[] {
  if (!accept) return [];
  return (Array.isArray(accept) ? accept : accept.split(","))
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);
}

/** True when the file matches one of the accept tokens (extension, exact MIME or `type/*`). */
export function matchesAccept(file: { name: string; type: string }, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return tokens.some((a) => (a.startsWith(".") ? name.endsWith(a) : a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a));
}

const MIME_NAMES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/svg+xml": "SVG",
  "image/gif": "GIF",
  "image/avif": "AVIF",
  "text/csv": "CSV",
  "text/plain": "TXT",
  "application/zip": "ZIP",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/json": "JSON",
  "video/mp4": "MP4",
};

function typeNames(tokens: string[], t: LabelFn<FileUploadLabels>): string[] {
  const out: string[] = [];
  for (const a of tokens) {
    const n =
      a === "image/*" ? t("images") : a === "video/*" ? t("videos") : a === "audio/*" ? t("audio") : a.startsWith(".") ? a.slice(1).toUpperCase() : MIME_NAMES[a] ?? a.split("/").pop()!.toUpperCase();
    if (!out.includes(n)) out.push(n);
  }
  return out;
}

function iconFor(type: string, name: string) {
  const n = name.toLowerCase();
  if (type.startsWith("image/")) return FileImage;
  if (type.startsWith("video/")) return FileVideo;
  if (type.startsWith("audio/")) return FileAudio;
  if (/\.(csv|xlsx?|numbers|ods)$/.test(n) || type.includes("spreadsheet") || type === "text/csv") return FileSpreadsheet;
  if (/\.(zip|rar|7z|gz|tar)$/.test(n) || type.includes("zip")) return FileArchive;
  if (/\.(pdf|docx?|txt|md|rtf|odt)$/.test(n) || type === "application/pdf" || type.startsWith("text/")) return FileText;
  return FileIcon;
}

const canPreview = (f: { type: string }) => /^image\/(png|jpe?g|gif|webp|avif|svg\+xml)$/.test(f.type);
function objectUrl(file: File): string | undefined {
  try {
    return typeof URL !== "undefined" && typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined;
  } catch {
    return undefined;
  }
}
function revoke(url?: string) {
  if (url?.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }
}

/** Turns a File into a queued `UploadFile` (NFC-normalised name, image preview). */
export function toUploadFile(file: File, status: UploadFile["status"] = "queued"): UploadFile {
  return {
    key: newKey(),
    file,
    name: file.name.normalize("NFC"),
    size: file.size,
    type: file.type,
    status,
    progress: status === "queued" ? 0 : undefined,
    previewUrl: canPreview(file) ? objectUrl(file) : undefined,
  };
}

/* ------------------------------------------------------------------ */
/* useFileDropzone                                                      */
/* ------------------------------------------------------------------ */

export interface UseFileDropzoneOptions {
  accept?: string | string[];
  maxSize?: number;
  minSize?: number;
  /** Remaining slots (`maxFiles − current`). `undefined` = unlimited. */
  remaining?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  labels?: Partial<FileUploadLabels>;
}

/**
 * Drag-and-drop + file picker wiring with localized rejections. Spread `rootProps` on the drop
 * target, `inputProps` on a hidden `<input type="file">`, and call `open()` from a button.
 */
export function useFileDropzone({ accept, maxSize, minSize, remaining, maxFiles, multiple = true, disabled, onFiles, onReject, labels }: UseFileDropzoneOptions) {
  const t = useLabels("upload", uploadLabels, labels);
  const f = useFormat();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const depth = React.useRef(0);
  const tokens = React.useMemo(() => parseAccept(accept), [accept]);
  const cb = useLatest({ onFiles, onReject });

  const take = React.useCallback(
    (list: FileList | File[] | null) => {
      if (!list || disabled) return;
      const files = Array.from(list);
      const ok: File[] = [];
      const rejected: FileRejection[] = [];
      const typesText = f.list(typeNames(tokens, t), { type: "disjunction" });
      let slots = remaining ?? Infinity;
      if (!multiple) slots = Math.min(slots, 1);
      for (const file of files) {
        const name = file.name.normalize("NFC");
        if (!matchesAccept(file, tokens)) rejected.push({ file, reason: "type", message: t("rejectType", { name, types: typesText }) });
        else if (maxSize !== undefined && file.size > maxSize) rejected.push({ file, reason: "size", message: t("rejectSize", { name, size: f.bytes(maxSize) }) });
        else if (minSize !== undefined && file.size < minSize) rejected.push({ file, reason: "small", message: t("rejectSmall", { name, size: f.bytes(minSize) }) });
        else if (ok.length >= slots) rejected.push({ file, reason: "count", message: t("rejectCount", { name, count: multiple ? maxFiles ?? slots : 1 }) });
        else ok.push(file);
      }
      if (ok.length) cb.current!.onFiles(ok);
      if (rejected.length) cb.current!.onReject?.(rejected);
    },
    [disabled, tokens, maxSize, minSize, remaining, maxFiles, multiple, f, t, cb],
  );

  const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

  const rootProps = {
    "data-dragging": dragging ? "" : undefined,
    onDragEnter: (e: React.DragEvent) => {
      if (disabled || !hasFiles(e)) return;
      e.preventDefault();
      depth.current++;
      setDragging(true);
    },
    onDragOver: (e: React.DragEvent) => {
      if (disabled || !hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (e: React.DragEvent) => {
      if (disabled) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
      void e;
    },
    onDrop: (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      take(e.dataTransfer?.files ?? null);
    },
  };

  const inputProps = {
    ref: inputRef,
    type: "file" as const,
    accept: tokens.join(",") || undefined,
    multiple,
    disabled,
    tabIndex: -1,
    "aria-hidden": true,
    className: "sr-only",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      take(e.currentTarget.files);
      // Let the same file be picked again after removal.
      if (!e.currentTarget.name) e.currentTarget.value = "";
    },
  };

  const open = React.useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const hint = (opts: { maxFiles?: number } = {}) => {
    const parts: string[] = [];
    if (tokens.length) parts.push(f.list(typeNames(tokens, t), { type: "disjunction" }));
    if (maxSize !== undefined) parts.push(t("hintSize", { size: f.bytes(maxSize) }));
    if (opts.maxFiles !== undefined && opts.maxFiles > 1) parts.push(t("hintCount", { count: opts.maxFiles }));
    return parts.join(" · ");
  };

  return { rootProps, inputProps, inputRef, dragging, open, take, hint, t };
}

/* ------------------------------------------------------------------ */
/* Upload queue                                                         */
/* ------------------------------------------------------------------ */

function useUploadQueue(files: UploadFile[], setFiles: (next: UploadFile[]) => void, upload: UploadHandler | undefined, concurrency: number, t: LabelFn<FileUploadLabels>) {
  const filesRef = React.useRef(files);
  filesRef.current = files;
  const controllers = React.useRef(new Map<string, AbortController>());
  const uploadRef = useLatest(upload);
  const [announcement, setAnnouncement] = React.useState("");

  const update = React.useCallback(
    (fn: (prev: UploadFile[]) => UploadFile[]) => {
      const next = fn(filesRef.current);
      filesRef.current = next;
      setFiles(next);
    },
    [setFiles],
  );
  const patch = React.useCallback((key: string, p: Partial<UploadFile>) => update((prev) => prev.map((x) => (x.key === key ? { ...x, ...p } : x))), [update]);

  React.useEffect(() => {
    const run = uploadRef.current;
    if (!run) return;
    const active = files.filter((x) => x.status === "uploading").length;
    const waiting = files.filter((x) => x.status === "queued" && x.file && !controllers.current.has(x.key));
    for (const item of waiting.slice(0, Math.max(0, concurrency - active))) {
      const ac = new AbortController();
      controllers.current.set(item.key, ac);
      patch(item.key, { status: "uploading", progress: 0, error: undefined });
      let last = -1;
      run(item.file!, {
        signal: ac.signal,
        onProgress: (pct) => {
          const p = Math.max(0, Math.min(100, Math.round(pct)));
          if (p !== last && !ac.signal.aborted) {
            last = p;
            patch(item.key, { progress: p });
          }
        },
      })
        .then((res) => {
          controllers.current.delete(item.key);
          if (ac.signal.aborted) return;
          patch(item.key, { status: "done", progress: 100, remoteId: res.id, url: res.url ?? filesRef.current.find((x) => x.key === item.key)?.url });
          setAnnouncement(t("announceDone", { name: item.name }));
        })
        .catch((err: unknown) => {
          controllers.current.delete(item.key);
          if (ac.signal.aborted) return;
          patch(item.key, { status: "error", error: err instanceof Error && err.message ? err.message : t("failed") });
          setAnnouncement(t("announceError", { name: item.name }));
        });
    }
  }, [files, concurrency, patch, uploadRef, t]);

  React.useEffect(() => {
    const map = controllers.current;
    return () => {
      for (const ac of map.values()) ac.abort();
      map.clear();
    };
  }, []);

  const add = (list: File[], replace = false) => {
    const status: UploadFile["status"] = uploadRef.current ? "queued" : "done";
    const added = list.map((file) => toUploadFile(file, status));
    update((prev) => {
      if (replace) prev.forEach((x) => remove(x.key, true));
      return replace ? added : [...prev, ...added];
    });
  };
  const remove = (key: string, silent = false) => {
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    const item = filesRef.current.find((x) => x.key === key);
    if (item?.file) revoke(item.previewUrl);
    if (!silent) update((prev) => prev.filter((x) => x.key !== key));
  };
  const retry = (key: string) => patch(key, { status: "queued", progress: 0, error: undefined });

  return { add, remove, retry, announcement, filesRef };
}

/** Puts the local files into the native input so a plain form submit carries them. */
function useSyncNativeFiles(inputRef: React.RefObject<HTMLInputElement | null>, files: UploadFile[], enabled: boolean) {
  React.useEffect(() => {
    const el = inputRef.current;
    if (!enabled || !el || typeof DataTransfer === "undefined") return;
    try {
      const dt = new DataTransfer();
      for (const x of files) if (x.file) dt.items.add(x.file);
      el.files = dt.files;
    } catch {
      /* DataTransfer unsupported: the picker selection is used as is */
    }
  }, [inputRef, files, enabled]);
}

/* ------------------------------------------------------------------ */
/* FileUpload                                                          */
/* ------------------------------------------------------------------ */

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** MIME types / extensions: `"image/*,.pdf"` or `["image/png", ".pdf"]`. */
  accept?: string | string[];
  /** Max bytes per file. */
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
  /** Default `true` (unless `maxFiles` is 1). */
  multiple?: boolean;
  value?: UploadFile[];
  defaultValue?: UploadFile[];
  onValueChange?: (files: UploadFile[]) => void;
  /**
   * Uploads each file as soon as it is added (with progress, retry and cancel). Without it, files
   * go with the form: the hidden file input named `name` holds them for a plain submit.
   */
  upload?: UploadHandler;
  /** Parallel uploads. Default 3. */
  concurrency?: number;
  onReject?: (rejections: FileRejection[]) => void;
  /** `"dropzone"` (default) · `"button"` · `"compact"` (one line, like an input). */
  variant?: "dropzone" | "button" | "compact";
  /** Replaces the generated hint ("PNG or PDF · up to 10 MB"). */
  hint?: React.ReactNode;
  /** Show the file list. Default true. */
  showList?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  labels?: Partial<FileUploadLabels>;
  "aria-describedby"?: string;
}

/**
 * Pick or drop files, see them upload, retry or remove them. The drop target is a real button
 * (Enter / Space opens the picker); dragging is an enhancement. Rejections (type, size, count)
 * come back as localized messages, file sizes are locale-formatted and names NFC-normalised
 * (macOS sends decomposed "ş" / "ğ").
 *
 * ```tsx
 * <Field label="Documents">
 *   <FileUpload accept=".pdf,image/*" maxSize={10_000_000} upload={uploadToS3} />
 * </Field>
 * <FileUpload name="cv" accept=".pdf" maxFiles={1} />   // no upload → sent with the form
 * ```
 */
export const FileUpload = /*#__PURE__*/ React.forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(props, ref) {
  const {
    accept,
    maxSize,
    minSize,
    maxFiles,
    multiple: multipleProp,
    value,
    defaultValue,
    onValueChange,
    upload,
    concurrency = 3,
    onReject,
    variant = "dropzone",
    hint: hintProp,
    showList = true,
    name,
    id,
    disabled: disabledProp,
    invalid,
    required,
    labels,
    className,
    "aria-describedby": describedBy,
    ...rest
  } = props;
  const control = useFieldControl({ id, name, disabled: disabledProp, required, "aria-describedby": describedBy, "aria-invalid": invalid ? true : undefined });
  const disabled = control.disabled;
  const multiple = multipleProp ?? maxFiles !== 1;
  const autoId = React.useId();
  const buttonId = control.id ?? `upload${autoId.replace(/:/g, "")}`;
  const hintId = `${buttonId}-upload-hint`;
  const rejectId = `${buttonId}-upload-rejections`;

  const [files, setFiles] = useControllableState<UploadFile[]>({ value, defaultValue: defaultValue ?? [], onChange: onValueChange, name: "FileUpload" });
  const [rejections, setRejections] = React.useState<FileRejection[]>([]);
  const t = useLabels("upload", uploadLabels, labels);
  const queue = useUploadQueue(files, setFiles, upload, concurrency, t);
  const counted = files.filter((x) => x.status !== "error").length;
  const remaining = maxFiles === undefined ? undefined : Math.max(0, maxFiles - counted);
  const singleReplace = !multiple && maxFiles === 1;

  const dz = useFileDropzone({
    accept,
    maxSize,
    minSize,
    maxFiles,
    remaining: singleReplace ? 1 : remaining,
    multiple,
    disabled,
    labels,
    onFiles: (list) => {
      setRejections([]);
      queue.add(list, singleReplace);
    },
    onReject: (r) => {
      setRejections(r);
      onReject?.(r);
    },
  });
  useSyncNativeFiles(dz.inputRef, files, !upload && !!control.name);

  const hintText = hintProp ?? dz.hint({ maxFiles });
  const prompt = (
    <>
      {t(multiple ? "drop" : "dropOne", { browse: "\u0000" })
        .split("\u0000")
        .flatMap((part, i) => (i === 0 ? [part] : [<span key="b" className="font-semibold text-accent-ink underline decoration-[color-mix(in_srgb,var(--accent-ink)_35%,transparent)] underline-offset-[3px]">{t("browse")}</span>, part]))}
    </>
  );
  const ariaDescribedBy = mergeIds(control["aria-describedby"], hintText ? hintId : undefined, rejections.length ? rejectId : undefined);

  const nativeInput = <input {...dz.inputProps} name={!upload ? control.name : undefined} required={!upload && required && files.length === 0 ? true : undefined} />;

  let trigger: React.ReactNode;
  if (variant === "button") {
    trigger = (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5" {...dz.rootProps}>
        <Button id={buttonId} variant="secondary" onClick={dz.open} disabled={disabled} aria-describedby={ariaDescribedBy} aria-invalid={control["aria-invalid"]} data-slot="file-upload-button">
          <Upload aria-hidden /> {t(multiple ? "choose" : "chooseOne")}
        </Button>
        {hintText ? (
          <span id={hintId} className="text-xs text-fg-subtle">
            {hintText}
          </span>
        ) : null}
      </div>
    );
  } else if (variant === "compact") {
    const only = files[0];
    trigger = (
      <div {...dz.rootProps} data-slot="file-upload-compact" className={cn(controlVariants({ size: "md" }), "gap-2 ps-1 pe-3 data-dragging:border-accent-ink data-dragging:bg-accent-soft", disabled && "opacity-50")}>
        <button
          id={buttonId}
          type="button"
          onClick={dz.open}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid={control["aria-invalid"]}
          className="inline-flex h-[calc(100%-0.5rem)] shrink-0 items-center gap-1.5 rounded-[calc(var(--radius)-3px)] bg-surface-2 px-2.5 text-[13px] font-medium text-fg transition-colors hover:bg-hover focus-ring disabled:cursor-not-allowed [&_svg]:size-3.5"
        >
          <Upload aria-hidden /> {t(multiple ? "choose" : "chooseOne")}
        </button>
        <span className="min-w-0 flex-1 truncate text-sm text-fg-subtle">
          {dz.dragging ? t("dragActive") : files.length ? (multiple ? f_names(files) : only?.name) : t("noFile")}
        </span>
        {hintText ? (
          <span id={hintId} className="sr-only">
            {hintText}
          </span>
        ) : null}
      </div>
    );
  } else {
    trigger = (
      <button
        id={buttonId}
        type="button"
        {...dz.rootProps}
        onClick={dz.open}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-invalid={control["aria-invalid"]}
        data-slot="file-upload-dropzone"
        className={cn(
          "ui-dropzone group/dz relative flex w-full flex-col items-center justify-center gap-2.5 rounded-ui border border-dashed border-field-border bg-field px-6 py-8 text-center",
          "transition-[border-color,background-color,box-shadow] duration-150 hover:border-field-border-hover",
          "focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] focus-visible:outline-none",
          "data-dragging:border-accent-ink data-dragging:bg-accent-soft",
          "aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <span aria-hidden className="ui-dropzone-icon flex size-10 items-center justify-center rounded-ui border border-line bg-surface text-fg-muted shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-colors group-data-dragging/dz:border-transparent group-data-dragging/dz:bg-accent group-data-dragging/dz:text-accent-fg">
          <Upload className="size-[18px]" />
        </span>
        <span className="text-sm text-fg">{dz.dragging ? t("dragActive") : prompt}</span>
        {hintText ? (
          <span id={hintId} className="text-xs text-fg-subtle">
            {hintText}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div ref={ref} {...rest} data-slot="file-upload" data-variant={variant} data-disabled={disabled ? "" : undefined} className={cn("grid min-w-0 gap-2.5", className)}>
      {trigger}
      {nativeInput}
      {rejections.length ? (
        <div id={rejectId} role="alert" data-slot="file-upload-rejections" className="ui-form-reveal flex items-start gap-2 rounded-ui-sm tone-danger tone-soft px-3 py-2 text-xs">
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          <ul className="grid min-w-0 flex-1 gap-0.5">
            {rejections.map((r, i) => (
              <li key={i} className="break-words">
                {r.message}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setRejections([])} aria-label={t("dismiss")} className="-m-1 inline-flex size-6 shrink-0 items-center justify-center rounded-ui-sm opacity-70 transition-opacity hover:opacity-100 focus-ring [&_svg]:size-3.5">
            <X aria-hidden />
          </button>
        </div>
      ) : null}
      {showList && files.length ? (
        <FileUploadList>
          {files.map((file) => (
            <FileUploadItem key={file.key} file={file} formMode={!upload} labels={labels} onRemove={disabled ? undefined : () => queue.remove(file.key)} onRetry={() => queue.retry(file.key)} />
          ))}
        </FileUploadList>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {queue.announcement}
      </span>
    </div>
  );
});

function f_names(files: UploadFile[]) {
  return files.map((x) => x.name).join(", ");
}

/** `FileUpload` with `variant="button"`. */
export const FileUploadButton = /*#__PURE__*/ React.forwardRef<HTMLDivElement, Omit<FileUploadProps, "variant">>(function FileUploadButton(props, ref) {
  return <FileUpload ref={ref} variant="button" {...props} />;
});

/* ------------------------------------------------------------------ */
/* List + item                                                         */
/* ------------------------------------------------------------------ */

/** The list of files under a FileUpload (usable alone for attachment lists). */
export const FileUploadList = /*#__PURE__*/ React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(function FileUploadList({ className, ...props }, ref) {
  return <ul ref={ref} data-slot="file-upload-list" className={cn("grid gap-1.5", className)} {...props} />;
});

export interface FileUploadItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  file: UploadFile;
  onRemove?: () => void;
  onRetry?: () => void;
  /** No `upload` handler: done files read "Ready to send". */
  formMode?: boolean;
  labels?: Partial<FileUploadLabels>;
}

/** One file row: thumbnail or type icon, name, size, status, progress and actions. */
export const FileUploadItem = /*#__PURE__*/ React.forwardRef<HTMLLIElement, FileUploadItemProps>(function FileUploadItem({ file, onRemove, onRetry, formMode, labels, className, ...props }, ref) {
  const t = useLabels("upload", uploadLabels, labels);
  const f = useFormat();
  const Icon = iconFor(file.type, file.name);
  const thumb = file.previewUrl ?? (canPreview(file) ? file.url : undefined);
  const progressText = f.percent((file.progress ?? 0) / 100, { maximumFractionDigits: 0 });
  const status =
    file.status === "uploading" ? t("uploading", { percent: progressText }) : file.status === "queued" ? t("queued") : file.status === "error" ? file.error || t("failed") : formMode ? t("attached") : t("done");
  const action = "inline-flex size-7 shrink-0 items-center justify-center rounded-ui-sm text-fg-subtle transition-colors hover:bg-hover hover:text-fg focus-ring [&_svg]:size-3.5";

  return (
    <li
      ref={ref}
      data-slot="file-upload-item"
      data-status={file.status}
      className={cn(
        "ui-form-reveal relative flex min-w-0 items-center gap-3 overflow-hidden rounded-ui border border-line bg-surface px-2.5 py-2",
        file.status === "error" && "border-[color-mix(in_srgb,var(--danger)_35%,var(--line))]",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-ui-sm border border-line bg-surface-2 text-fg-muted">
        {thumb ? <img src={thumb} alt="" className="size-full object-cover" /> : <Icon className="size-4" />}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="truncate text-[13px] font-medium text-fg" title={file.name}>
          {file.name}
        </span>
        <span className={cn("flex min-w-0 items-center gap-1.5 text-xs text-fg-subtle", file.status === "error" && "text-danger")}>
          <span className="shrink-0 tabular">{f.bytes(file.size)}</span>
          <span aria-hidden className="text-fg-subtle/60">·</span>
          {file.status === "done" && !formMode ? <CircleCheck aria-hidden className="size-3 shrink-0 text-success" /> : null}
          <span className="truncate">{status}</span>
        </span>
        {file.status === "uploading" || file.status === "queued" ? (
          <Progress size="xs" value={file.status === "queued" ? 0 : file.progress ?? 0} aria-label={t("progress", { name: file.name })} valueText={progressText} className="mt-1" />
        ) : null}
      </span>
      {file.status === "error" && onRetry && file.file ? (
        <button type="button" onClick={onRetry} aria-label={t("retry", { name: file.name })} title={t("retry", { name: file.name })} className={action}>
          <RotateCw aria-hidden />
        </button>
      ) : null}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={file.status === "uploading" ? t("cancel", { name: file.name }) : t("remove", { name: file.name })}
          title={file.status === "uploading" ? t("cancel", { name: file.name }) : t("remove", { name: file.name })}
          className={action}
        >
          <X aria-hidden />
        </button>
      ) : null}
    </li>
  );
});

/* ------------------------------------------------------------------ */
/* ImageUpload                                                         */
/* ------------------------------------------------------------------ */

export interface ImageUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  value?: UploadFile | null;
  defaultValue?: UploadFile | null;
  onValueChange?: (file: UploadFile | null) => void;
  /** CSS aspect ratio: `"16/9"` (default), `"1/1"`, `"4/5"`. */
  aspect?: string;
  /** Default `"image/png,image/jpeg,image/webp"`. */
  accept?: string | string[];
  maxSize?: number;
  upload?: UploadHandler;
  onReject?: (rejections: FileRejection[]) => void;
  /** Replaces the generated hint. */
  hint?: React.ReactNode;
  /** `cover` (default) crops to the frame; `contain` shows the whole image (logos). */
  fit?: "cover" | "contain";
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  labels?: Partial<FileUploadLabels>;
  "aria-describedby"?: string;
}

/**
 * A single image with a live preview: cover images, avatars, logos. Replace and Remove sit on the
 * image; the empty state is a drop target. The base of the media group's Image field.
 *
 * ```tsx
 * <Field label="Cover image"><ImageUpload aspect="16/9" maxSize={5_000_000} upload={uploadImage} /></Field>
 * ```
 */
export const ImageUpload = /*#__PURE__*/ React.forwardRef<HTMLDivElement, ImageUploadProps>(function ImageUpload(props, ref) {
  const {
    value,
    defaultValue,
    onValueChange,
    aspect = "16/9",
    accept = "image/png,image/jpeg,image/webp",
    maxSize,
    upload,
    onReject,
    hint: hintProp,
    fit = "cover",
    name,
    id,
    disabled: disabledProp,
    invalid,
    required,
    labels,
    className,
    style,
    "aria-describedby": describedBy,
    ...rest
  } = props;
  const control = useFieldControl({ id, name, disabled: disabledProp, required, "aria-describedby": describedBy, "aria-invalid": invalid ? true : undefined });
  const disabled = control.disabled;
  const autoId = React.useId();
  const buttonId = control.id ?? `image${autoId.replace(/:/g, "")}`;
  const hintId = `${buttonId}-upload-hint`;
  const [image, setImage] = useControllableState<UploadFile | null>({ value, defaultValue: defaultValue ?? null, onChange: onValueChange, name: "ImageUpload" });
  const [rejection, setRejection] = React.useState<string | null>(null);
  const t = useLabels("upload", uploadLabels, labels);
  const list = React.useMemo(() => (image ? [image] : []), [image]);
  const setList = React.useCallback((next: UploadFile[]) => setImage(next[0] ?? null), [setImage]);
  const queue = useUploadQueue(list, setList, upload, 1, t);
  const dz = useFileDropzone({
    accept,
    maxSize,
    multiple: false,
    remaining: 1,
    maxFiles: 1,
    disabled,
    labels,
    onFiles: (files) => {
      setRejection(null);
      queue.add(files.slice(0, 1), true);
    },
    onReject: (r) => {
      setRejection(r[0]?.message ?? null);
      onReject?.(r);
    },
  });
  useSyncNativeFiles(dz.inputRef, list, !upload && !!control.name);
  const hintText = hintProp ?? dz.hint();
  const src = image?.previewUrl ?? image?.url;
  const ariaDescribedBy = mergeIds(control["aria-describedby"], hintText && !src ? hintId : undefined);
  const busy = image?.status === "uploading" || image?.status === "queued";

  return (
    <div ref={ref} {...rest} data-slot="image-upload" className={cn("grid min-w-0 gap-2", className)} style={style}>
      <div
        {...dz.rootProps}
        data-has-image={src ? "" : undefined}
        className={cn(
          "group/img relative w-full overflow-hidden rounded-ui",
          src ? "border border-line bg-surface-2" : "",
          "data-dragging:[&>[data-slot=file-upload-dropzone]]:border-accent-ink",
        )}
        style={{ aspectRatio: aspect }}
      >
        {src ? (
          <>
            <img src={src} alt={t("imageAlt", { name: image!.name })} className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain p-4")} />
            {busy ? (
              <div className="absolute inset-x-3 bottom-3 rounded-ui-sm bg-popover/90 p-2 shadow-sm">
                <Progress size="xs" value={image!.progress ?? 0} aria-label={t("progress", { name: image!.name })} />
              </div>
            ) : null}
            {image?.status === "error" ? (
              <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-ui-sm tone-danger tone-soft bg-popover px-2.5 py-1.5 text-xs">
                <CircleAlert aria-hidden className="size-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{image.error || t("failed")}</span>
                {image.file ? (
                  <button type="button" onClick={() => queue.retry(image.key)} className="font-medium underline underline-offset-2 focus-ring">
                    {t("retryShort")}
                  </button>
                ) : null}
              </div>
            ) : null}
            {!disabled ? (
              <div className="ui-image-actions absolute end-2 top-2 flex gap-1.5">
                <Button id={buttonId} size="xs" variant="secondary" className="bg-popover shadow-sm" onClick={dz.open} aria-describedby={ariaDescribedBy}>
                  <ImagePlus aria-hidden /> {t("replace")}
                </Button>
                <button
                  type="button"
                  onClick={() => queue.remove(image!.key)}
                  aria-label={t("removeImage")}
                  title={t("removeImage")}
                  className="inline-flex size-7 items-center justify-center rounded-ui-sm border border-field-border bg-popover text-fg-muted shadow-sm transition-colors hover:text-danger focus-ring [&_svg]:size-3.5"
                >
                  <X aria-hidden />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <button
            id={buttonId}
            type="button"
            onClick={dz.open}
            disabled={disabled}
            aria-describedby={ariaDescribedBy}
            aria-invalid={control["aria-invalid"]}
            data-slot="file-upload-dropzone"
            className={cn(
              "group/dz absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-ui border border-dashed border-field-border bg-field px-4 text-center",
              "transition-[border-color,background-color,box-shadow] duration-150 hover:border-field-border-hover",
              "focus-visible:border-ring focus-visible:shadow-[0_0_0_3px_var(--accent-soft)] focus-visible:outline-none",
              "group-data-dragging/img:border-accent-ink group-data-dragging/img:bg-accent-soft aria-invalid:border-danger disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <ImagePlus aria-hidden className="size-5 text-fg-muted" />
            <span className="text-sm text-fg">
              {dz.dragging
                ? t("dragActive")
                : t("dropOne", { browse: "\u0000" })
                    .split("\u0000")
                    .flatMap((part, i) => (i === 0 ? [part] : [<span key="b" className="font-semibold text-accent-ink underline underline-offset-[3px]">{t("browse")}</span>, part]))}
            </span>
            {hintText ? (
              <span id={hintId} className="text-xs text-fg-subtle">
                {hintText}
              </span>
            ) : null}
          </button>
        )}
      </div>
      <input {...dz.inputProps} name={!upload ? control.name : undefined} />
      {rejection ? (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-danger">
          <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
          {rejection}
        </p>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {queue.announcement}
      </span>
    </div>
  );
});
