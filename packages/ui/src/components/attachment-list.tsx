"use client";

import * as React from "react";
import {
  AlertCircle,
  Download,
  Eye,
  File as FileGeneric,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Paperclip,
  Plus,
  Presentation,
  RotateCcw,
  X,
  type LucideIcon,
} from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { IconButton } from "./button";

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

/** One file attached to a record. */
export interface AttachmentData {
  id: string;
  /** File name with extension ("Master services agreement.pdf"). */
  name: string;
  /** Size in bytes. */
  size: number;
  /** MIME type. Used with the extension to pick the icon. */
  mime: string;
  /** Download / open URL. Without `onPreview` the name links here. */
  url?: string;
  /** Image thumbnail (grid layout and image files). */
  thumbUrl?: string;
  uploadedBy?: string;
  /** ISO instant or `YYYY-MM-DD`. */
  uploadedAt?: string;
  /** Default `"ready"`. */
  status?: "uploading" | "processing" | "ready" | "error";
  /** 0–100 while uploading. */
  progress?: number;
  /** Error message for `status: "error"`. */
  error?: string;
}

export type AttachmentKind = "image" | "pdf" | "document" | "spreadsheet" | "presentation" | "archive" | "audio" | "video" | "code" | "text" | "other";

const EXT: Record<string, AttachmentKind> = {
  pdf: "pdf",
  doc: "document", docx: "document", odt: "document", rtf: "document", pages: "document",
  xls: "spreadsheet", xlsx: "spreadsheet", ods: "spreadsheet", csv: "spreadsheet", numbers: "spreadsheet",
  ppt: "presentation", pptx: "presentation", odp: "presentation", key: "presentation",
  zip: "archive", rar: "archive", "7z": "archive", gz: "archive", tar: "archive",
  png: "image", jpg: "image", jpeg: "image", gif: "image", webp: "image", avif: "image", svg: "image", heic: "image",
  mp3: "audio", wav: "audio", m4a: "audio", ogg: "audio",
  mp4: "video", mov: "video", webm: "video", mkv: "video",
  js: "code", ts: "code", tsx: "code", json: "code", html: "code", css: "code", xml: "code", sql: "code",
  txt: "text", md: "text", log: "text",
};

/** Splits "contract.final.pdf" into `["contract.final", ".pdf"]` (no extension → `[name, ""]`). */
export function splitFileName(name: string): [base: string, ext: string] {
  const i = name.lastIndexOf(".");
  if (i <= 0 || i === name.length - 1 || name.length - i > 8) return [name, ""];
  return [name.slice(0, i), name.slice(i)];
}

/** Picks the file family from MIME type and extension — drives the icon and its tint. */
export function attachmentKind(mime: string | undefined, name = ""): AttachmentKind {
  const ext = splitFileName(name)[1].slice(1).toLowerCase();
  const m = (mime ?? "").toLowerCase();
  if (m === "application/pdf") return "pdf";
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  if (EXT[ext]) return EXT[ext]!;
  if (/spreadsheet|excel|csv/.test(m)) return "spreadsheet";
  if (/presentation|powerpoint/.test(m)) return "presentation";
  if (/word|opendocument\.text|rtf/.test(m)) return "document";
  if (/zip|compressed|tar|rar/.test(m)) return "archive";
  if (/json|javascript|xml|html/.test(m)) return "code";
  if (m.startsWith("text/")) return "text";
  return "other";
}

const KIND_ICON: Record<AttachmentKind, LucideIcon> = {
  image: FileImage,
  pdf: FileText,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  archive: FileArchive,
  audio: FileAudio,
  video: FileVideo,
  code: FileCode,
  text: FileText,
  other: FileGeneric,
};
/** Token-based tint per family (distinct, never raw colours). */
const KIND_TONE: Record<AttachmentKind, string> = {
  image: "var(--chart-4)",
  pdf: "var(--danger)",
  document: "var(--info)",
  spreadsheet: "var(--success)",
  presentation: "var(--warning)",
  archive: "var(--chart-5)",
  audio: "var(--chart-6)",
  video: "var(--chart-3)",
  code: "var(--chart-2)",
  text: "var(--fg-muted)",
  other: "var(--fg-muted)",
};

export const attachmentLabels = {
  list: "Attachments",
  empty: "No files attached",
  preview: "Preview {name}",
  download: "Download {name}",
  remove: "Remove {name}",
  retry: "Retry {name}",
  uploading: "Uploading… {percent}",
  progress: "{percent}, {name}",
  processing: "Processing…",
  failed: "Upload failed",
  add: "Add files",
  removing: "Removing…",
};
export type AttachmentListLabels = Partial<typeof attachmentLabels>;

/* ------------------------------------------------------------------ */
/* Small parts                                                          */
/* ------------------------------------------------------------------ */

export interface AttachmentIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  mime?: string;
  name?: string;
  /** Tile size. Default `"md"` (36px). `"lg"` is the grid tile. */
  size?: "sm" | "md" | "lg";
}

/** Mime-family tile: tinted icon, plus the extension in mono on larger tiles. Decorative. */
export function AttachmentIcon({ mime, name = "", size = "md", className, style, ...props }: AttachmentIconProps) {
  const kind = attachmentKind(mime, name);
  const Icon = KIND_ICON[kind];
  const ext = splitFileName(name)[1].slice(1).toUpperCase();
  return (
    <span
      aria-hidden
      data-slot="attachment-icon"
      data-kind={kind}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-ui-sm text-(--kind)",
        "bg-[color-mix(in_oklch,var(--kind)_11%,var(--surface-solid))] ring-1 ring-inset ring-[color-mix(in_oklch,var(--kind)_22%,transparent)]",
        size === "sm" && "size-6 [&_svg]:size-3.5",
        size === "md" && "size-9 [&_svg]:size-[18px]",
        size === "lg" && "size-full flex-col gap-1.5 rounded-none ring-0 [&_svg]:size-7",
        className,
      )}
      style={{ ...style, ["--kind" as string]: KIND_TONE[kind] }}
      {...props}
    >
      <Icon strokeWidth={1.6} />
      {size === "lg" && ext ? <span className="font-mono text-[10px] font-medium tracking-[0.08em]">{ext}</span> : null}
    </span>
  );
}

/** File name that truncates its base but always keeps the extension visible ("Quarterly board rep….pdf"). */
export function AttachmentName({ name, className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { name: string }) {
  const [base, ext] = splitFileName(name);
  return (
    <span data-slot="attachment-name" dir="auto" title={name} className={cn("flex min-w-0 items-baseline", className)} {...props}>
      <span className="truncate">{base}</span>
      {ext ? <span className="shrink-0">{ext}</span> : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* AttachmentList                                                       */
/* ------------------------------------------------------------------ */

const listVariants = /*#__PURE__*/ cva("", {
  variants: {
    layout: {
      list: "flex flex-col divide-y divide-line overflow-hidden rounded-ui border border-line",
      grid: "grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3",
      chips: "flex flex-wrap gap-1.5",
    },
  },
  defaultVariants: { layout: "list" },
});

export interface AttachmentListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  items: AttachmentData[];
  /** `list` (rows with meta), `grid` (thumbnail tiles) or `chips` (inline, inside comments and forms). Default `"list"`. */
  layout?: "list" | "grid" | "chips";
  /** Row height and text size. Default `"md"`. */
  size?: "sm" | "md";
  /** Makes the file name a button (open a Lightbox / preview sheet). */
  onPreview?: (file: AttachmentData) => void;
  /** Download button. Without it, a ready file with `url` gets a native download link. */
  onDownload?: (file: AttachmentData) => void;
  /** Remove button. The row fades while the promise runs; a rejection restores it. Offer Undo in a toast. */
  onRemove?: (file: AttachmentData) => void | Promise<void>;
  /** Retry button on failed uploads. */
  onRetry?: (file: AttachmentData) => void;
  /** Built-in "Add files" button that opens the file chooser. */
  onAddFiles?: (files: File[]) => void;
  /** `accept` for the built-in chooser ("image/*,.pdf"). */
  accept?: string;
  /** Your own upload control (a File upload drop zone), rendered after the files. */
  uploadSlot?: React.ReactNode;
  /** Hides remove / retry / add. */
  readOnly?: boolean;
  /** Shown when there are no files (and nothing to add). Default "No files attached". */
  empty?: React.ReactNode;
  /** Accessible name of the list. Default "Attachments". */
  "aria-label"?: string;
  labels?: AttachmentListLabels;
}

/**
 * Files on a record — contracts on a deal, an employee's documents, a post's downloads. Mime
 * icons tinted per family, sizes in the current locale ("1.2 MB" / "1,2 MB"), upload progress,
 * processing and error states, preview, download and remove.
 *
 * ```tsx
 * <AttachmentList items={files} onPreview={openLightbox} onRemove={removeWithUndo} onAddFiles={upload} />
 * <AttachmentList layout="grid" items={photos} />
 * <AttachmentList layout="chips" items={commentFiles} readOnly />
 * ```
 */
export const AttachmentList = /*#__PURE__*/ React.forwardRef<HTMLDivElement, AttachmentListProps>(function AttachmentList(
  { items, layout = "list", size = "md", onPreview, onDownload, onRemove, onRetry, onAddFiles, accept, uploadSlot, readOnly, empty, labels, className, "aria-label": ariaLabel, ...props },
  ref,
) {
  const t = useLabels("attachments", attachmentLabels, labels);
  const [removing, setRemoving] = React.useState<Set<string>>(() => new Set());
  const inputRef = React.useRef<HTMLInputElement>(null);

  const remove = React.useCallback(
    async (file: AttachmentData) => {
      if (!onRemove) return;
      setRemoving((s) => new Set(s).add(file.id));
      try {
        await onRemove(file);
      } finally {
        setRemoving((s) => {
          const n = new Set(s);
          n.delete(file.id);
          return n;
        });
      }
    },
    [onRemove],
  );

  const canAdd = !readOnly && Boolean(onAddFiles);
  const hasTail = canAdd || (!readOnly && uploadSlot);

  if (items.length === 0 && !hasTail) {
    return (
      <div
        ref={ref}
        data-slot="attachment-list"
        className={cn("flex items-center gap-2 rounded-ui border border-dashed border-line px-3 py-3 text-sm text-fg-subtle", className)}
        {...props}
      >
        <Paperclip className="size-4" aria-hidden />
        {empty ?? t("empty")}
      </div>
    );
  }

  const addButton = canAdd ? (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        hidden
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = Array.from(e.currentTarget.files ?? []);
          if (files.length) onAddFiles!(files);
          e.currentTarget.value = "";
        }}
      />
      <button
        type="button"
        data-slot="attachment-add"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex cursor-pointer items-center justify-center gap-1.5 text-fg-muted transition-colors hover:text-fg focus-ring [&_svg]:size-4",
          layout === "list" && "h-10 w-full px-3 text-[13px] hover:bg-hover",
          layout === "grid" && "aspect-[4/3] w-full flex-col rounded-ui border border-dashed border-field-border text-[13px] hover:border-field-border-hover hover:bg-hover",
          layout === "chips" && "h-7 rounded-full border border-dashed border-field-border px-2.5 text-xs hover:bg-hover",
        )}
      >
        <Plus aria-hidden />
        {t("add")}
      </button>
    </>
  ) : null;

  return (
    <div
      ref={ref}
      role="list"
      aria-label={ariaLabel ?? t("list")}
      data-slot="attachment-list"
      data-layout={layout}
      className={cn(listVariants({ layout }), className)}
      {...props}
    >
      {items.map((file) => (
        <AttachmentItem
          key={file.id}
          file={file}
          layout={layout}
          size={size}
          removing={removing.has(file.id)}
          onPreview={onPreview}
          onDownload={onDownload}
          onRemove={readOnly || !onRemove ? undefined : remove}
          onRetry={readOnly ? undefined : onRetry}
          t={t}
        />
      ))}
      {hasTail ? (
        <div role="listitem" data-slot="attachment-tail" className={cn(layout === "chips" && "contents")}>
          {!readOnly ? uploadSlot : null}
          {addButton}
        </div>
      ) : null}
    </div>
  );
});

interface AttachmentItemProps {
  file: AttachmentData;
  layout: "list" | "grid" | "chips";
  size: "sm" | "md";
  removing: boolean;
  onPreview?: (file: AttachmentData) => void;
  onDownload?: (file: AttachmentData) => void;
  onRemove?: (file: AttachmentData) => void;
  onRetry?: (file: AttachmentData) => void;
  t: LabelFn<typeof attachmentLabels>;
}

function AttachmentItem({ file, layout, size, removing, onPreview, onDownload, onRemove, onRetry, t }: AttachmentItemProps) {
  const f = useFormat();
  const status = file.status ?? "ready";
  const ready = status === "ready";
  const percent = f.percent(Math.max(0, Math.min(100, file.progress ?? 0)) / 100, { maximumFractionDigits: 0 });
  const isImage = attachmentKind(file.mime, file.name) === "image";

  const nameEl =
    ready && onPreview ? (
      <button type="button" onClick={() => onPreview(file)} className="min-w-0 cursor-pointer text-start font-medium text-fg after:absolute after:inset-0 hover:underline focus-ring focus-visible:after:rounded-[inherit] underline-offset-2">
        <AttachmentName name={file.name} />
      </button>
    ) : ready && file.url ? (
      <a href={file.url} target="_blank" rel="noreferrer" className="min-w-0 font-medium text-fg after:absolute after:inset-0 hover:underline focus-ring underline-offset-2">
        <AttachmentName name={file.name} />
      </a>
    ) : (
      <AttachmentName name={file.name} className={cn("font-medium", ready ? "text-fg" : "text-fg-muted")} />
    );

  const meta: string[] = [f.bytes(file.size)];
  if (file.uploadedBy) meta.push(file.uploadedBy);
  if (file.uploadedAt) meta.push(f.date(file.uploadedAt, "medium"));

  const statusLine =
    status === "uploading" ? (
      <span className="tabular">{t("uploading", { percent })}</span>
    ) : status === "processing" ? (
      <span>{t("processing")}</span>
    ) : status === "error" ? (
      <span className="inline-flex items-center gap-1 text-danger">
        <AlertCircle className="size-3.5" aria-hidden />
        {file.error ?? t("failed")}
      </span>
    ) : (
      <span className="tabular">{meta.join(" · ")}</span>
    );

  const progressBar =
    status === "uploading" || status === "processing" ? (
      <span
        role="progressbar"
        aria-label={file.name}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={status === "uploading" ? (file.progress ?? 0) : undefined}
        aria-valuetext={status === "uploading" ? t("progress", { percent, name: file.name }) : t("processing")}
        data-indeterminate={status === "processing" ? "" : undefined}
        className="ui-attachment-progress relative block h-1 w-full overflow-hidden rounded-full bg-track"
      >
        <span className="absolute inset-y-0 start-0 rounded-full bg-accent transition-[width] duration-300" style={status === "uploading" ? { width: `${file.progress ?? 0}%` } : undefined} />
      </span>
    ) : null;

  const download =
    ready && (onDownload || file.url) ? (
      onDownload ? (
        <IconButton label={t("download", { name: file.name })} size="xs" tooltip={false} onClick={() => onDownload(file)}>
          <Download />
        </IconButton>
      ) : (
        <IconButton asChild label={t("download", { name: file.name })} size="xs" tooltip={false}>
          <a href={file.url} download={file.name}>
            <Download />
          </a>
        </IconButton>
      )
    ) : null;

  const actions = (
    <span data-slot="attachment-actions" className="relative z-1 flex shrink-0 items-center gap-0.5">
      {status === "error" && onRetry ? (
        <IconButton label={t("retry", { name: file.name })} size="xs" tooltip={false} onClick={() => onRetry(file)}>
          <RotateCcw />
        </IconButton>
      ) : null}
      {layout !== "chips" && ready && onPreview ? (
        <IconButton label={t("preview", { name: file.name })} size="xs" tooltip={false} onClick={() => onPreview(file)} className="max-sm:hidden">
          <Eye />
        </IconButton>
      ) : null}
      {layout !== "chips" ? download : null}
      {onRemove ? (
        <IconButton label={t("remove", { name: file.name })} size="xs" tooltip={false} variant="ghost" disabled={removing} onClick={() => onRemove(file)} className="hover:text-danger">
          <X />
        </IconButton>
      ) : null}
    </span>
  );

  const common = {
    role: "listitem",
    "data-slot": "attachment",
    "data-status": status,
    "data-removing": removing ? "" : undefined,
    "aria-busy": removing || status === "uploading" || status === "processing" || undefined,
  } as const;

  if (layout === "chips") {
    return (
      <div
        {...common}
        className={cn(
          "relative inline-flex h-7 max-w-64 items-center gap-1.5 rounded-full border border-line bg-surface-2 ps-1 pe-0.5 text-xs transition-opacity",
          status === "error" && "border-[color-mix(in_srgb,var(--danger)_40%,transparent)]",
          removing && "opacity-40",
          !onRemove && "pe-2.5",
        )}
      >
        <AttachmentIcon mime={file.mime} name={file.name} size="sm" className="size-5 rounded-full [&_svg]:size-3" />
        {nameEl}
        <span className="shrink-0 text-fg-subtle tabular">{status === "uploading" ? percent : f.bytes(file.size)}</span>
        {(onRemove || (status === "error" && onRetry)) ? actions : null}
      </div>
    );
  }

  if (layout === "grid") {
    return (
      <div {...common} className={cn("group relative flex min-w-0 flex-col overflow-hidden rounded-ui border border-line bg-surface-2 transition-[opacity,border-color] hover:border-field-border-hover", removing && "opacity-40")}>
        <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-[color-mix(in_oklch,var(--surface-2),var(--fg)_3%)]">
          {file.thumbUrl || (isImage && file.url && ready) ? (
            <img src={file.thumbUrl ?? file.url} alt="" loading="lazy" className={cn("size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]", !ready && "opacity-50 grayscale")} />
          ) : (
            <AttachmentIcon mime={file.mime} name={file.name} size="lg" />
          )}
          {progressBar ? <span className="absolute inset-x-2 bottom-2">{progressBar}</span> : null}
          <span className="absolute end-1.5 top-1.5 z-1 flex rounded-ui-sm border border-popover-border bg-popover-nested p-0.5 shadow-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            {actions}
          </span>
        </div>
        <div className="grid min-w-0 gap-0.5 px-2.5 py-2 text-[13px]">
          {nameEl}
          <span className="truncate text-[11.5px] text-fg-muted">{statusLine}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      {...common}
      className={cn(
        "group relative flex items-center gap-3 bg-transparent transition-[opacity,background-color] hover:bg-hover",
        size === "sm" ? "min-h-11 px-2.5 py-1.5 text-[13px]" : "min-h-14 px-3 py-2 text-sm",
        removing && "opacity-40",
        status === "error" && "bg-[color-mix(in_srgb,var(--danger)_5%,transparent)]",
      )}
    >
      {isImage && (file.thumbUrl || file.url) && ready ? (
        <img src={file.thumbUrl ?? file.url} alt="" loading="lazy" className={cn("shrink-0 rounded-ui-sm object-cover ring-1 ring-line", size === "sm" ? "size-7" : "size-9")} />
      ) : (
        <AttachmentIcon mime={file.mime} name={file.name} size={size === "sm" ? "sm" : "md"} className={size === "sm" ? "size-7" : undefined} />
      )}
      <div className="grid min-w-0 flex-1 gap-1">
        {nameEl}
        {progressBar ? <span className="flex items-center gap-2 text-xs text-fg-muted">{progressBar}<span className="shrink-0">{statusLine}</span></span> : <span className="truncate text-xs text-fg-muted">{statusLine}</span>}
      </div>
      {actions}
    </div>
  );
}
