"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, Copy, Download, File as FileIcon, FileArchive, FileText, Film, Folder, FolderPlus, LayoutGrid, List as ListIcon, Music, RotateCw, Search, Sparkles, Trash2, TriangleAlert, Upload, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat, useLocale } from "../lib/locale";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { useContainerWidth } from "../lib/use-container-width";
import { Alert } from "../components/alert";
import { ConfirmDialog } from "../components/alert-dialog";
import { Badge } from "../components/badge";
import { Button, IconButton } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Dialog, DialogBody, DialogContent, DialogHeader } from "../components/dialog";
import { EmptyState } from "../components/empty-state";
import { Image } from "../components/image";
import { Input, Textarea } from "../components/input";
import { NativeSelect } from "../components/native-select";
import { Progress } from "../components/progress";
import { Skeleton } from "../components/skeleton";
import { FocalPointPicker } from "./focal-point";
import { useMedia } from "./media-provider";
import { DECORATIVE_TAG, acceptsMedia, extensionOf, isAltMissing, isDecorative, kindsFromAccept, monthDate, monthKey, thumbUrl } from "./media-utils";
import { countGraphemes } from "./serp";
import { useUploadQueue, type UploadQueue, type UploadQueueItem } from "./use-upload-queue";
import type { MediaAdapter, MediaAsset, MediaFolder, MediaKind, MediaPatch, MediaQuery } from "./types";

/* ------------------------------------------------------------------ */
/* Labels                                                               */
/* ------------------------------------------------------------------ */

const libraryLabels = {
  library: "Media library",
  search: "Search files",
  kind: "File type",
  kindAll: "All types",
  kindImage: "Images",
  kindVideo: "Video",
  kindAudio: "Audio",
  kindDocument: "Documents",
  kindArchive: "Archives",
  kindOther: "Other",
  month: "Date",
  monthAll: "All dates",
  folder: "Folder",
  folderAll: "All folders",
  folderRoot: "No folder",
  uploader: "Uploaded by",
  uploaderAll: "Anyone",
  unattached: "Unattached",
  sort: "Sort",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  sortName: "Name",
  sortSize: "Largest first",
  view: "View",
  grid: "Grid",
  list: "List",
  upload: "Upload",
  files: "Files",
  emptyTitle: "No files yet",
  emptyDescription: "Drop files here or upload them from your computer.",
  noResults: "No results for “{query}”",
  noResultsFiltered: "No files match these filters",
  noResultsDescription: "Try another search, or clear the filters.",
  clearFilters: "Clear filters",
  error: "The media library could not be loaded.",
  retry: "Retry",
  loadMore: "Load more",
  dropHint: "Drop files to upload",
  count: "{count, plural, one {# file} other {# files}}",
  selected: "{count, plural, one {# selected} other {# selected}}",
  selectedAnnounce: "{count, plural, =0 {No files selected} one {# file selected} other {# files selected}}",
  maxReached: "You can pick up to {max}",
  select: "Select {name}",
  missingAlt: "Missing alt text",
  processing: "Processing",
  failed: "Failed",
  move: "Move to…",
  moveTo: "Move selected files",
  download: "Download",
  delete: "Delete",
  clearSelection: "Clear selection",
  selectAll: "Select all",
  deleteTitle: "{count, plural, one {Delete this file?} other {Delete # files?}}",
  deleteDescription: "Pages that use them will show a broken image. This can't be undone.",
  trashDescription: "They move to the trash and can be restored for 30 days.",
  newFolder: "New folder",
  folderName: "Folder name",
  create: "Create",
  colName: "Name",
  colType: "Type",
  colSize: "Size",
  colDimensions: "Dimensions",
  colUploaded: "Uploaded",
  colAlt: "Alt text",
  altOk: "Set",
  altDecorative: "Decorative",
  details: "File details",
};
export type MediaLibraryLabels = typeof libraryLabels;

const queueLabels = {
  title: "Uploads",
  summary: "{done} of {total} uploaded",
  queued: "Waiting",
  uploading: "Uploading",
  processing: "Processing",
  done: "Uploaded",
  error: "Failed",
  canceled: "Canceled",
  cancel: "Cancel upload of {name}",
  retry: "Retry upload of {name}",
  dismiss: "Clear finished",
  typeError: "This file type isn't allowed here",
  sizeError: "File is larger than {max}",
};
export type MediaUploadQueueLabels = typeof queueLabels;

const detailsLabels = {
  title: "File details",
  alt: "Alt text",
  altHint: "Describe the image for people who can't see it. Leave out “image of”.",
  altCount: "{count} / 125",
  decorative: "Decorative image",
  decorativeHint: "Purely visual: screen readers skip it and the alt text is cleared.",
  suggest: "Suggest",
  suggesting: "Suggesting…",
  fileTitle: "Title",
  caption: "Caption",
  description: "Description",
  focal: "Focal point",
  info: "File info",
  type: "Type",
  size: "Size",
  dimensions: "Dimensions",
  duration: "Duration",
  uploaded: "Uploaded",
  uploadedBy: "{date} by {name}",
  usage: "Used in",
  usageCount: "{count, plural, =0 {Not used anywhere} one {# place} other {# places}}",
  copyUrl: "Copy URL",
  copied: "Copied",
  download: "Download",
  replace: "Replace file",
  delete: "Delete",
  saving: "Saving…",
  saved: "Saved",
  saveError: "Couldn't save. Try again.",
  close: "Close details",
};
export type MediaDetailsLabels = typeof detailsLabels;

/* ------------------------------------------------------------------ */
/* Small parts                                                          */
/* ------------------------------------------------------------------ */

const KIND_ICON: Record<MediaKind, React.ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number }>> = {
  image: FileIcon,
  video: Film,
  audio: Music,
  document: FileText,
  archive: FileArchive,
  other: FileIcon,
};

/** File glyph for non-image assets: an icon over the extension. */
export function MediaFileGlyph({ asset, className, size = "md" }: { asset: Pick<MediaAsset, "kind" | "filename">; className?: string; size?: "sm" | "md" }) {
  const Icon = KIND_ICON[asset.kind];
  return (
    <span data-slot="media-file-glyph" aria-hidden className={cn("flex size-full flex-col items-center justify-center gap-1.5 text-fg-subtle", className)}>
      <Icon aria-hidden strokeWidth={1.4} className={size === "sm" ? "size-4" : "size-7"} />
      {size === "md" ? <span className="tabular text-[10.5px] font-semibold tracking-[0.08em] text-fg-muted">{extensionOf(asset.filename) || asset.kind.toUpperCase()}</span> : null}
    </span>
  );
}

/** Square thumbnail for tiles, rows and trays. */
export function MediaThumb({ asset, className, rounded = "ui" }: { asset: MediaAsset; className?: string; rounded?: "ui" | "none" }) {
  const url = thumbUrl(asset);
  return url ? (
    <Image src={{ ...asset, url }} alt="" aspect="1/1" rounded={rounded === "ui" ? "ui" : "none"} className={cn("size-full", className)} sizes="160px" />
  ) : (
    <span className={cn("block aspect-square size-full bg-surface-2", rounded === "ui" && "rounded-ui", className)}>
      <MediaFileGlyph asset={asset} size="sm" />
    </span>
  );
}

const dimensions = (a: MediaAsset, nf: Intl.NumberFormat) => (a.width && a.height ? `${nf.format(a.width)} × ${nf.format(a.height)}` : "—");

/* ------------------------------------------------------------------ */
/* Upload queue                                                         */
/* ------------------------------------------------------------------ */

export interface MediaUploadQueueProps extends React.HTMLAttributes<HTMLDivElement> {
  queue: UploadQueue;
  /** `"inline"`: compact strip inside the library · `"panel"`: full-page upload screen. */
  variant?: "inline" | "panel";
  labels?: Partial<MediaUploadQueueLabels>;
}

/** Per-file progress with cancel, retry and the reason a file failed; a polite live summary. */
export const MediaUploadQueue = /*#__PURE__*/ React.forwardRef<HTMLDivElement, MediaUploadQueueProps>(function MediaUploadQueue({ queue, variant = "inline", labels, className, ...props }, ref) {
  const t = useLabels("mediaUploadQueue", queueLabels, labels);
  const f = useFormat();
  if (!queue.items.length) return null;
  const finished = queue.items.some((it) => it.status === "done" || it.status === "error" || it.status === "canceled");
  return (
    <div ref={ref} data-slot="media-upload-queue" data-variant={variant} className={cn("surface-2 rounded-ui", variant === "panel" ? "p-4" : "p-3", className)} {...props}>
      <div className="mb-2 flex items-center gap-3">
        <span className="text-[13px] font-semibold text-fg">{t("title")}</span>
        <span role="status" aria-live="polite" className="tabular text-[12.5px] text-fg-muted">
          {t("summary", { done: f.number(queue.done), total: f.number(queue.total) })}
        </span>
        {finished && !queue.active ? (
          <Button size="xs" variant="ghost" className="ms-auto text-fg-muted" onClick={queue.clearDone}>
            {t("dismiss")}
          </Button>
        ) : null}
      </div>
      <ul className={cn("grid gap-1.5", variant === "inline" && "max-h-44 overflow-y-auto overscroll-contain pe-1")}>
        {queue.items.map((it) => (
          <MediaUploadRow key={it.id} item={it} queue={queue} t={t} />
        ))}
      </ul>
    </div>
  );
});

function MediaUploadRow({ item, queue, t }: { item: UploadQueueItem; queue: UploadQueue; t: ReturnType<typeof useLabels<MediaUploadQueueLabels>> }) {
  const f = useFormat();
  const nameId = React.useId();
  const running = item.status === "queued" || item.status === "uploading" || item.status === "processing";
  const tone = item.status === "error" ? "danger" : item.status === "done" ? "success" : "accent";
  return (
    <li data-slot="media-upload-item" data-status={item.status} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-ui-sm px-1 py-1">
      <div className="flex min-w-0 items-baseline gap-2">
        <span id={nameId} className="truncate text-[13px] text-fg">{item.file.name}</span>
        <span className="tabular shrink-0 text-[11.5px] text-fg-subtle">{f.bytes(item.file.size)}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={cn("text-[12px]", item.status === "error" ? "text-danger" : item.status === "done" ? "text-success" : "text-fg-muted")}>
          {item.status === "uploading" ? f.percent(item.progress, { maximumFractionDigits: 0 }) : t(item.status)}
        </span>
        {running ? (
          <IconButton label={t("cancel", { name: item.file.name })} tooltip={false} size="xs" variant="ghost" className="text-fg-subtle" onClick={() => queue.cancel(item.id)}>
            <X />
          </IconButton>
        ) : (item.status === "error" && !item.rejected) || item.status === "canceled" ? (
          <IconButton label={t("retry", { name: item.file.name })} tooltip={false} size="xs" variant="ghost" className="text-fg-subtle" onClick={() => queue.retry(item.id)}>
            <RotateCw />
          </IconButton>
        ) : null}
      </div>
      {item.status === "error" ? (
        <p className="col-span-2 text-[12px] text-danger">{item.error}</p>
      ) : item.status !== "canceled" ? (
        <Progress
          aria-labelledby={nameId}
          className="col-span-2"
          value={item.status === "queued" ? 0 : item.status === "processing" ? null : item.progress * 100}
          tone={tone}
        />
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Details                                                              */
/* ------------------------------------------------------------------ */

export interface MediaDetailsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  asset: MediaAsset;
  adapter?: MediaAdapter;
  /** Called with the saved asset after an autosave. */
  onChange?: (asset: MediaAsset) => void;
  /** Delete button; hidden when not set. */
  onDelete?: (asset: MediaAsset) => void;
  /** Close button (dialog / panel). */
  onClose?: () => void;
  readOnly?: boolean;
  /** Autosave delay in ms. Default 700. */
  autosaveDelay?: number;
  labels?: Partial<MediaDetailsLabels>;
}

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Preview, editable metadata with autosave (alt text, decorative, title, caption, description),
 * focal point, file info, usage and actions. The body of the library's details panel.
 */
export const MediaDetails = /*#__PURE__*/ React.forwardRef<HTMLDivElement, MediaDetailsProps>(function MediaDetails(
  { asset, adapter: adapterProp, onChange, onDelete, onClose, readOnly: readOnlyProp, autosaveDelay = 700, labels, className, ...props },
  ref,
) {
  const t = useLabels("mediaDetails", detailsLabels, labels);
  const f = useFormat();
  const { locale } = useLocale();
  const ctxAdapter = useMedia();
  const adapter = adapterProp ?? ctxAdapter;
  const readOnly = readOnlyProp || !adapter?.capabilities.edit;
  const [draft, setDraft] = React.useState(() => fieldsOf(asset));
  const [save, setSave] = React.useState<SaveState>("idle");
  const [suggesting, setSuggesting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const pending = React.useRef<MediaPatch>({});
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onChangeRef = useLatest(onChange);
  const replaceInput = React.useRef<HTMLInputElement>(null);
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);

  // A different asset: flush nothing, reset the form.
  React.useEffect(() => {
    setDraft(fieldsOf(asset));
    setSave("idle");
    pending.current = {};
    clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.id]);

  const flush = React.useCallback(async () => {
    clearTimeout(timer.current);
    const patch = pending.current;
    if (!adapter || !Object.keys(patch).length) return;
    pending.current = {};
    setSave("saving");
    try {
      const next = await adapter.update(asset.id, patch);
      setSave("saved");
      onChangeRef.current?.(next);
    } catch {
      pending.current = { ...patch, ...pending.current };
      setSave("error");
    }
  }, [adapter, asset.id, onChangeRef]);

  React.useEffect(() => () => void flush(), [flush]);

  const queue = (patch: MediaPatch, immediate = false) => {
    pending.current = { ...pending.current, ...patch };
    clearTimeout(timer.current);
    if (immediate) void flush();
    else timer.current = setTimeout(() => void flush(), autosaveDelay);
  };

  const setField = (key: "alt" | "title" | "caption" | "description", value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    queue({ [key]: value });
  };

  const decorative = draft.tags.includes(DECORATIVE_TAG);
  const toggleDecorative = (on: boolean) => {
    const tags = on ? [...draft.tags.filter((x) => x !== DECORATIVE_TAG), DECORATIVE_TAG] : draft.tags.filter((x) => x !== DECORATIVE_TAG);
    setDraft((d) => ({ ...d, tags, alt: on ? "" : d.alt }));
    queue(on ? { tags, alt: "" } : { tags }, true);
  };

  const suggest = async () => {
    if (!adapter?.suggestAlt) return;
    setSuggesting(true);
    try {
      const alt = await adapter.suggestAlt(asset.id);
      setField("alt", alt);
    } finally {
      setSuggesting(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const replace = async (file: File | undefined) => {
    if (!file || !adapter?.replace) return;
    setSave("saving");
    try {
      const next = await adapter.replace(asset.id, file, { signal: new AbortController().signal, onProgress: () => {} });
      setSave("saved");
      onChangeRef.current?.(next);
    } catch {
      setSave("error");
    }
  };

  const isImage = asset.kind === "image";
  const altCount = countGraphemes(draft.alt, locale);
  const altId = React.useId();
  const altHintId = React.useId();

  return (
    <div ref={ref} data-slot="media-details" className={cn("grid content-start gap-5", className)} {...props}>
      <div className="grid gap-3">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-[14px] leading-snug font-semibold break-all text-fg">{asset.filename}</h3>
          <span aria-live="polite" className={cn("tabular shrink-0 pt-0.5 text-[11.5px]", save === "error" ? "text-danger" : "text-fg-subtle")}>
            {save === "saving" ? t("saving") : save === "saved" ? t("saved") : save === "error" ? t("saveError") : null}
          </span>
          {onClose ? (
            <IconButton label={t("close")} tooltip={false} size="xs" variant="ghost" className="-me-1 -mt-0.5 text-fg-subtle" onClick={onClose}>
              <X />
            </IconButton>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-ui bg-scene">
          {isImage ? (
            <Image src={asset} alt="" fit="contain" aspect={asset.width && asset.height && asset.width / asset.height < 0.8 ? "1/1" : "4/3"} placeholder="none" className="w-full" sizes="320px" />
          ) : (
            <div className="aspect-[4/3]">
              <MediaFileGlyph asset={asset} />
            </div>
          )}
        </div>
      </div>

      {isImage ? (
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={altId} className="text-[13px] font-medium text-fg">
              {t("alt")}
            </label>
            {adapter?.suggestAlt && !readOnly && !decorative ? (
              <Button size="xs" variant="ghost" className="text-fg-muted" loading={suggesting} loadingText={t("suggesting")} onClick={suggest}>
                <Sparkles />
                {t("suggest")}
              </Button>
            ) : null}
          </div>
          <Textarea
            id={altId}
            rows={3}
            value={draft.alt}
            disabled={decorative}
            readOnly={readOnly}
            aria-describedby={altHintId}
            onChange={(e) => setField("alt", e.target.value)}
            onBlur={() => void flush()}
            className="resize-none"
          />
          <div id={altHintId} className="flex items-start justify-between gap-3 text-[12px] text-fg-muted">
            <span className={cn(!decorative && !draft.alt.trim() && "text-warning")}>
              {!decorative && !draft.alt.trim() ? (
                <span className="inline-flex items-center gap-1">
                  <TriangleAlert aria-hidden className="size-3.5" />
                  {t("altHint")}
                </span>
              ) : (
                t("altHint")
              )}
            </span>
            <span className={cn("tabular shrink-0", altCount > 125 && "text-warning")}>{t("altCount", { count: nf.format(altCount) })}</span>
          </div>
          <Checkbox size="sm" label={t("decorative")} description={t("decorativeHint")} checked={decorative} disabled={readOnly} onCheckedChange={(c) => toggleDecorative(c === true)} />
        </div>
      ) : null}

      <div className="grid gap-3">
        <DetailsText label={t("fileTitle")} value={draft.title} readOnly={readOnly} onChange={(v) => setField("title", v)} onBlur={flush} />
        <DetailsText label={t("caption")} value={draft.caption} readOnly={readOnly} multiline onChange={(v) => setField("caption", v)} onBlur={flush} />
        <DetailsText label={t("description")} value={draft.description} readOnly={readOnly} multiline onChange={(v) => setField("description", v)} onBlur={flush} />
      </div>

      {isImage && !readOnly ? (
        <div className="grid gap-2">
          <span className="text-[13px] font-medium text-fg">{t("focal")}</span>
          <FocalPointPicker key={asset.id} src={asset} previews={["1/1", "16/9", "4/5"]} maxHeight="12rem" onValueCommit={(focalPoint) => queue({ focalPoint }, true)} />
        </div>
      ) : null}

      <section aria-label={t("info")} className="grid gap-2">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[12.5px]">
          <dt className="text-fg-muted">{t("type")}</dt>
          <dd className="m-0 truncate text-fg">{asset.mime}</dd>
          <dt className="text-fg-muted">{t("size")}</dt>
          <dd className="tabular m-0 text-fg">{f.bytes(asset.size)}</dd>
          {asset.width && asset.height ? (
            <>
              <dt className="text-fg-muted">{t("dimensions")}</dt>
              <dd className="tabular m-0 text-fg">{dimensions(asset, nf)} px</dd>
            </>
          ) : null}
          {asset.duration ? (
            <>
              <dt className="text-fg-muted">{t("duration")}</dt>
              <dd className="tabular m-0 text-fg">{f.duration(asset.duration)}</dd>
            </>
          ) : null}
          <dt className="text-fg-muted">{t("uploaded")}</dt>
          <dd className="m-0 text-fg">{asset.uploadedBy ? t("uploadedBy", { date: f.date(asset.createdAt), name: asset.uploadedBy.name }) : f.date(asset.createdAt)}</dd>
          {asset.usage ? (
            <>
              <dt className="text-fg-muted">{t("usage")}</dt>
              <dd className="m-0 text-fg">
                {asset.usage.items?.length ? (
                  <ul className="grid gap-0.5">
                    {asset.usage.items.map((u) => (
                      <li key={u.type + u.id} className="truncate">
                        {u.href ? (
                          <a href={u.href} className="focus-ring rounded-sm text-fg underline decoration-line underline-offset-2 hover:decoration-fg">
                            {u.title}
                          </a>
                        ) : (
                          u.title
                        )}
                        <span className="ms-1.5 text-fg-subtle">{u.type}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  t("usageCount", { count: asset.usage.count })
                )}
              </dd>
            </>
          ) : null}
        </dl>
      </section>

      <div className="flex flex-wrap gap-1.5 border-t border-line pt-4">
        <Button size="sm" onClick={copy}>
          {copied ? <Check /> : <Copy />}
          {copied ? t("copied") : t("copyUrl")}
        </Button>
        <Button size="sm" asChild>
          <a href={asset.url} download={asset.filename}>
            <Download />
            {t("download")}
          </a>
        </Button>
        {!readOnly && adapter?.replace && adapter.capabilities.replace ? (
          <>
            <Button size="sm" onClick={() => replaceInput.current?.click()}>
              <RotateCw />
              {t("replace")}
            </Button>
            <input ref={replaceInput} type="file" hidden tabIndex={-1} accept={asset.mime} onChange={(e) => void replace(e.target.files?.[0])} />
          </>
        ) : null}
        {onDelete && !readOnly ? (
          <Button size="sm" variant="danger-ghost" className="ms-auto" onClick={() => onDelete(asset)}>
            <Trash2 />
            {t("delete")}
          </Button>
        ) : null}
      </div>
    </div>
  );
});

function fieldsOf(a: MediaAsset) {
  return { alt: a.alt ?? "", title: a.title ?? "", caption: a.caption ?? "", description: a.description ?? "", tags: a.tags ?? [] };
}

function DetailsText({ label, value, onChange, onBlur, readOnly, multiline }: { label: string; value: string; onChange: (v: string) => void; onBlur: () => void; readOnly?: boolean; multiline?: boolean }) {
  const id = React.useId();
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-medium text-fg">
        {label}
      </label>
      {multiline ? (
        <Textarea id={id} rows={2} value={value} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} className="resize-none" />
      ) : (
        <Input id={id} size="sm" value={value} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Library                                                              */
/* ------------------------------------------------------------------ */

export type MediaLibraryView = "grid" | "list";
export type MediaSelectionMode = "none" | "single" | "multiple";

/** Imperative handle (`handleRef`): Media picker's Upload and From URL tabs drive the library with it. */
export interface MediaLibraryHandle {
  /** Queue files for upload (same checks as drop / the Upload button). */
  addFiles(files: FileList | File[]): void;
  /** Insert assets created elsewhere (sideload) at the top; `select` also selects them. */
  addAssets(assets: MediaAsset[], options?: { select?: boolean }): void;
  /** Opens the native file dialog. */
  openFileDialog(): void;
  /** Reloads the current page of results. */
  reload(): void;
}

export interface MediaLibraryProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Else from `MediaProvider` / `VamosProvider media`. */
  adapter?: MediaAdapter;
  view?: MediaLibraryView;
  defaultView?: MediaLibraryView;
  onViewChange?: (view: MediaLibraryView) => void;
  /** Filters, search and sort. URL sync is the app's job (`onQueryChange` → search params). */
  query?: MediaQuery;
  defaultQuery?: MediaQuery;
  onQueryChange?: (query: MediaQuery) => void;
  /** `"none"` (browse, click opens details) · `"single"` · `"multiple"`. Default `"multiple"`. */
  selection?: MediaSelectionMode;
  selected?: string[];
  defaultSelected?: string[];
  /** Ids in selection order, plus the assets the library knows for them. */
  onSelectedChange?: (ids: string[], assets: MediaAsset[]) => void;
  /** `"image/*,.pdf"`: filters the library and restricts uploads. */
  accept?: string;
  /** Selection limit (multiple). */
  max?: number;
  /** Where file details open. Default `"side"`. */
  detailsPanel?: "side" | "dialog" | false;
  /** Folder control: a toolbar select, a sidebar list, or none. Default `"select"` when the adapter has folders. */
  folders?: "select" | "sidebar" | false;
  /** Items per request. Default 60. */
  pageSize?: number;
  /** Tile size in grid view. Default `"md"`. */
  tileSize?: "sm" | "md" | "lg";
  /** Height of the scrolling file area. Default `"34rem"`. */
  height?: number | string;
  /** Virtualise rows above this many items. Default 120. */
  virtualizeAfter?: number;
  /** Hide upload, delete and editing (also when the adapter can't edit). */
  readOnly?: boolean;
  /** Select files as soon as they finish uploading. Default `false` (`true` inside Media picker). */
  selectUploaded?: boolean;
  /** Client-side downscale before upload (longer side in px). */
  maxDimension?: number;
  /** Replaces the default "No files yet" state. */
  emptyState?: React.ReactNode;
  /** Ref to the search input (Media picker focuses it). */
  searchRef?: React.Ref<HTMLInputElement>;
  /** Show the toolbar. Default `true`. */
  toolbar?: boolean;
  /** Called after files were deleted. */
  onDeleted?: (ids: string[]) => void;
  /** Imperative handle: `addFiles`, `addAssets`, `openFileDialog`, `reload`. */
  handleRef?: React.Ref<MediaLibraryHandle>;
  labels?: Partial<MediaLibraryLabels>;
  queueLabels?: Partial<MediaUploadQueueLabels>;
  detailsLabels?: Partial<MediaDetailsLabels>;
}

const TILE_MIN = { sm: 104, md: 148, lg: 212 } as const;
const GRID_GAP = 12;

/**
 * Browse, search, filter, upload, edit and delete files through any `MediaAdapter`: grid or list,
 * folders, an upload queue with progress, a details panel with alt text and focal point, bulk
 * actions, and a virtualised grid for large libraries. Also the body of Media picker.
 *
 * ```tsx
 * <MediaProvider adapter={createRestAdapter({ baseUrl: "/api" })}>
 *   <MediaLibrary selection="multiple" detailsPanel="side" onQueryChange={syncToUrl} />
 * </MediaProvider>
 * ```
 *
 * Keyboard (grid): arrows move, Space selects, Shift + arrows extends, Ctrl/⌘ + A selects all,
 * Enter opens details, Delete asks to delete, Esc clears the selection.
 */
export const MediaLibrary = /*#__PURE__*/ React.forwardRef<HTMLDivElement, MediaLibraryProps>(function MediaLibrary(
  {
    adapter: adapterProp,
    view: viewProp,
    defaultView = "grid",
    onViewChange,
    query: queryProp,
    defaultQuery,
    onQueryChange,
    selection = "multiple",
    selected: selectedProp,
    defaultSelected,
    onSelectedChange,
    accept,
    max,
    detailsPanel = "side",
    folders: foldersMode,
    pageSize = 60,
    tileSize = "md",
    height = "34rem",
    virtualizeAfter = 120,
    readOnly: readOnlyProp,
    selectUploaded = false,
    maxDimension,
    emptyState,
    searchRef,
    toolbar = true,
    onDeleted,
    handleRef,
    labels,
    queueLabels: queueLabelsProp,
    detailsLabels: detailsLabelsProp,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("mediaLibrary", libraryLabels, labels);
  const tq = useLabels("mediaUploadQueue", queueLabels, queueLabelsProp);
  const f = useFormat();
  const { locale } = useLocale();
  const ctxAdapter = useMedia();
  const adapter = adapterProp ?? ctxAdapter;
  const caps = adapter?.capabilities;
  const canUpload = Boolean(adapter) && !readOnlyProp;
  const canEdit = Boolean(caps?.edit) && !readOnlyProp;
  const hasFolders = Boolean(adapter?.folders && caps?.folders);
  const folderMode = foldersMode === undefined ? (hasFolders ? "select" : false) : hasFolders ? foldersMode : false;

  const [view, setView] = useControllableState<MediaLibraryView>({ value: viewProp, defaultValue: defaultView, onChange: onViewChange, name: "MediaLibrary" });
  const [query, setQuery] = useControllableState<MediaQuery>({ value: queryProp, defaultValue: defaultQuery ?? {}, onChange: onQueryChange, name: "MediaLibrary" });
  const known = React.useRef(new Map<string, MediaAsset>());
  const emitSelected = React.useCallback(
    (ids: string[]) => onSelectedChange?.(ids, ids.map((id) => known.current.get(id)).filter((a): a is MediaAsset => Boolean(a))),
    [onSelectedChange],
  );
  const [selected, setSelectedRaw] = useControllableState<string[]>({ value: selectedProp, defaultValue: defaultSelected ?? [], onChange: emitSelected, name: "MediaLibrary" });

  const [items, setItems] = React.useState<MediaAsset[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [cursor, setCursor] = React.useState<string | undefined>();
  const [total, setTotal] = React.useState<number | undefined>();
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [reload, setReload] = React.useState(0);
  const [folders, setFolders] = React.useState<MediaFolder[]>([]);
  const [months, setMonths] = React.useState<string[]>([]);
  const [uploaders, setUploaders] = React.useState<{ id: string; name: string }[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [anchor, setAnchor] = React.useState<number | null>(null);
  const [confirm, setConfirm] = React.useState<string[] | null>(null);
  const [dragDepth, setDragDepth] = React.useState(0);
  const [search, setSearch] = React.useState(query.search ?? "");
  const fileInput = React.useRef<HTMLInputElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();

  const remember = React.useCallback((list: MediaAsset[]) => list.forEach((a) => known.current.set(a.id, a)), []);

  const effective = React.useMemo<MediaQuery>(() => {
    const kinds = query.kind ?? kindsFromAccept(accept);
    return { ...query, kind: kinds, accept: accept ?? query.accept, limit: pageSize, cursor: undefined };
  }, [query, accept, pageSize]);
  const queryKey = JSON.stringify(effective);

  // Load the first page whenever the query changes.
  React.useEffect(() => {
    if (!adapter) return;
    const ctrl = new AbortController();
    setStatus("loading");
    adapter
      .list(effective, { signal: ctrl.signal })
      .then((page) => {
        if (ctrl.signal.aborted) return;
        remember(page.items);
        setItems(page.items);
        setCursor(page.nextCursor);
        setTotal(page.total);
        setStatus("ready");
        setMonths((m) => [...new Set([...m, ...page.items.map((a) => monthKey(a.createdAt))])].sort().reverse());
        setUploaders((u) => {
          const map = new Map(u.map((x) => [x.id, x]));
          page.items.forEach((a) => a.uploadedBy && map.set(a.uploadedBy.id, { id: a.uploadedBy.id, name: a.uploadedBy.name }));
          return [...map.values()];
        });
      })
      .catch((err) => {
        if (!ctrl.signal.aborted && (err as Error)?.name !== "AbortError") setStatus("error");
      });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter, queryKey, reload, remember]);

  React.useEffect(() => {
    if (!adapter?.folders || !hasFolders) return;
    let live = true;
    adapter.folders.list().then((list) => live && setFolders(list)).catch(() => {});
    return () => {
      live = false;
    };
  }, [adapter, hasFolders, reload]);

  React.useEffect(() => {
    if (!adapter?.subscribe) return;
    return adapter.subscribe((e) => {
      if (e.type === "removed" && e.id) setItems((list) => list.filter((a) => a.id !== e.id));
      else if (e.asset) {
        const asset = e.asset;
        remember([asset]);
        setItems((list) => (list.some((a) => a.id === asset.id) ? list.map((a) => (a.id === asset.id ? asset : a)) : list));
      }
    });
  }, [adapter, remember]);

  const loadMore = React.useCallback(async () => {
    if (!adapter || !cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await adapter.list({ ...effective, cursor });
      remember(page.items);
      setItems((list) => [...list, ...page.items.filter((a) => !list.some((b) => b.id === a.id))]);
      setCursor(page.nextCursor);
    } catch {
      /* keep the button; the user can retry */
    } finally {
      setLoadingMore(false);
    }
  }, [adapter, cursor, effective, loadingMore, remember]);

  // Debounced search → query.
  const queryRef = useLatest(query);
  React.useEffect(() => {
    if ((queryRef.current.search ?? "") === search) return;
    const id = setTimeout(() => setQuery({ ...queryRef.current, search: search || undefined, cursor: undefined }), 250);
    return () => clearTimeout(id);
  }, [search, setQuery, queryRef]);
  React.useEffect(() => {
    setSearch(query.search ?? "");
  }, [query.search]);

  const patchQuery = (p: Partial<MediaQuery>) => setQuery({ ...query, ...p, cursor: undefined });
  const filtered = Boolean(query.search || query.kind || query.month || query.folderId !== undefined || query.uploadedBy || query.unattached);

  /* ---- selection ---- */
  const atMax = selection === "multiple" && max !== undefined && selected.length >= max;
  const setSelected = (ids: string[]) => {
    const unique = [...new Set(ids)];
    setSelectedRaw(selection === "single" ? unique.slice(-1) : max !== undefined ? unique.slice(0, max) : unique);
  };
  const isDisabled = (a: MediaAsset) => selection !== "none" && ((accept && !acceptsMedia(accept, a)) || (atMax && !selected.includes(a.id)));

  const toggle = (index: number, range = false) => {
    const a = items[index];
    if (!a || selection === "none" || isDisabled(a)) return;
    if (selection === "single") {
      setSelected(selected.includes(a.id) ? [] : [a.id]);
    } else if (range && anchor !== null) {
      const [from, to] = anchor < index ? [anchor, index] : [index, anchor];
      setSelected([...selected, ...items.slice(from, to + 1).filter((x) => !isDisabled(x) || selected.includes(x.id)).map((x) => x.id)]);
    } else {
      setSelected(selected.includes(a.id) ? selected.filter((id) => id !== a.id) : [...selected, a.id]);
      setAnchor(index);
    }
  };

  const openDetails = (a: MediaAsset) => {
    if (detailsPanel) setActiveId(a.id);
  };

  /* ---- uploads ---- */
  const uploadQueue = useUploadQueue(adapter, {
    accept,
    maxDimension,
    messages: { type: tq("typeError"), size: tq("sizeError", { max: caps?.maxFileSize ? f.bytes(caps.maxFileSize) : "" }) },
    onUploaded: (asset) => {
      remember([asset]);
      setItems((list) => [asset, ...list.filter((a) => a.id !== asset.id)]);
      setTotal((n) => (n === undefined ? n : n + 1));
      if (selectUploaded && selection !== "none") setSelectedRaw((prev) => (selection === "single" ? [asset.id] : max !== undefined && prev.length >= max ? prev : [...prev, asset.id]));
    },
  });
  const addFiles = (files: FileList | File[] | null | undefined) => {
    if (!files || !Array.from(files).length || !canUpload) return;
    uploadQueue.add(files, { folderId: query.folderId ?? null });
  };

  React.useImperativeHandle(handleRef, () => ({
    addFiles: (files) => addFiles(files),
    addAssets: (assets, o) => {
      remember(assets);
      setItems((list) => [...assets, ...list.filter((a) => !assets.some((b) => b.id === a.id))]);
      if (o?.select && selection !== "none") setSelected(selection === "single" ? assets.slice(-1).map((a) => a.id) : [...selected, ...assets.map((a) => a.id)]);
    },
    openFileDialog: () => fileInput.current?.click(),
    reload: () => setReload((n) => n + 1),
  }));

  /* ---- delete ---- */
  const remove = async (ids: string[]) => {
    if (!adapter) return;
    await adapter.remove(ids, { permanent: !caps?.trash });
    setItems((list) => list.filter((a) => !ids.includes(a.id)));
    setTotal((n) => (n === undefined ? n : Math.max(0, n - ids.length)));
    setSelected(selected.filter((id) => !ids.includes(id)));
    if (activeId && ids.includes(activeId)) setActiveId(null);
    onDeleted?.(ids);
  };

  const moveTo = async (folderId: string | null) => {
    if (!adapter) return;
    const ids = [...selected];
    const updated = await Promise.all(ids.map((id) => adapter.update(id, { folderId })));
    remember(updated);
    setItems((list) => list.map((a) => updated.find((u) => u.id === a.id) ?? a).filter((a) => query.folderId === undefined || (a.folderId ?? null) === query.folderId));
    setReload((n) => (query.folderId === undefined ? n : n + 1));
  };

  const downloadSelected = () => {
    selected.forEach((id) => {
      const a = known.current.get(id);
      if (!a) return;
      const link = document.createElement("a");
      link.href = a.url;
      link.download = a.filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };

  /* ---- grid geometry ---- */
  const tile = TILE_MIN[tileSize];
  const cols = width ? Math.max(1, Math.floor((width + GRID_GAP) / (tile + GRID_GAP))) : tileSize === "lg" ? 3 : tileSize === "sm" ? 6 : 4;
  const rows = React.useMemo(() => {
    const out: MediaAsset[][] = [];
    for (let i = 0; i < items.length; i += cols) out.push(items.slice(i, i + cols));
    return out;
  }, [items, cols]);
  const virtual = items.length > virtualizeAfter;
  const colWidth = width ? (width - GRID_GAP * (cols - 1)) / cols : tile;
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => colWidth + 30 + GRID_GAP,
    overscan: 3,
  });

  const focusTile = React.useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      setFocusIndex(clamped);
      if (virtual) virtualizer.scrollToIndex(Math.floor(clamped / cols), { align: "auto" });
      requestAnimationFrame(() => {
        const el = gridRef.current?.querySelector<HTMLElement>(`[data-tile="${clamped}"]`);
        el?.focus({ preventScroll: virtual });
        if (!virtual) el?.scrollIntoView?.({ block: "nearest" });
      });
    },
    [items.length, virtual, virtualizer, cols],
  );

  React.useEffect(() => {
    if (focusIndex > items.length - 1) setFocusIndex(Math.max(0, items.length - 1));
  }, [items.length, focusIndex]);

  const onGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
    if (!target) return;
    const index = Number(target.dataset.tile);
    const mod = e.metaKey || e.ctrlKey;
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
        next = index + 1;
        break;
      case "ArrowLeft":
        next = index - 1;
        break;
      case "ArrowDown":
        next = index + cols;
        break;
      case "ArrowUp":
        next = index - cols;
        break;
      case "Home":
        next = mod ? 0 : index - (index % cols);
        break;
      case "End":
        next = mod ? items.length - 1 : Math.min(items.length - 1, index - (index % cols) + cols - 1);
        break;
      case "PageDown":
        next = index + cols * 3;
        break;
      case "PageUp":
        next = index - cols * 3;
        break;
      case " ":
        e.preventDefault();
        if (selection === "none") openDetails(items[index]!);
        else toggle(index, e.shiftKey);
        return;
      case "Enter":
        e.preventDefault();
        if (detailsPanel) openDetails(items[index]!);
        else toggle(index);
        return;
      case "Delete":
      case "Backspace":
        if (!canUpload) return;
        e.preventDefault();
        setConfirm(selected.length && selected.includes(items[index]!.id) ? [...selected] : [items[index]!.id]);
        return;
      case "Escape":
        if (selected.length && selection !== "none") {
          e.preventDefault();
          e.stopPropagation();
          setSelected([]);
        }
        return;
      case "a":
      case "A":
        if (mod && selection === "multiple") {
          e.preventDefault();
          setSelected(items.filter((a) => !isDisabled(a) || selected.includes(a.id)).map((a) => a.id));
        }
        return;
      default:
        return;
    }
    if (next === null) return;
    e.preventDefault();
    next = Math.max(0, Math.min(items.length - 1, next));
    if (e.shiftKey && selection === "multiple") {
      const from = anchor ?? index;
      const [lo, hi] = from < next ? [from, next] : [next, from];
      setAnchor(from);
      setSelected([...selected.filter((id) => !items.slice(lo, hi + 1).some((a) => a.id === id)), ...items.slice(lo, hi + 1).filter((a) => !isDisabled(a)).map((a) => a.id)]);
    } else if (!e.shiftKey) setAnchor(next);
    focusTile(next);
  };

  const onTileClick = (e: React.MouseEvent, index: number) => {
    const a = items[index]!;
    setFocusIndex(index);
    if (selection === "none") return openDetails(a);
    if (e.shiftKey) toggle(index, true);
    else toggle(index);
    if (detailsPanel === "side") setActiveId(a.id);
  };

  /* ---- drag & drop / paste ---- */
  const dropHandlers = canUpload
    ? {
        onDragEnter: (e: React.DragEvent) => {
          if (!Array.from(e.dataTransfer?.types ?? []).includes("Files")) return;
          e.preventDefault();
          setDragDepth((d) => d + 1);
        },
        onDragOver: (e: React.DragEvent) => {
          if (Array.from(e.dataTransfer?.types ?? []).includes("Files")) e.preventDefault();
        },
        onDragLeave: () => setDragDepth((d) => Math.max(0, d - 1)),
        onDrop: (e: React.DragEvent) => {
          if (!e.dataTransfer?.files?.length) return;
          e.preventDefault();
          setDragDepth(0);
          addFiles(e.dataTransfer.files);
        },
        onPaste: (e: React.ClipboardEvent) => {
          const target = e.target as HTMLElement;
          if (target.closest("input, textarea, [contenteditable=true]")) return;
          if (e.clipboardData?.files?.length) {
            e.preventDefault();
            addFiles(e.clipboardData.files);
          }
        },
      }
    : {};

  const active = activeId ? items.find((a) => a.id === activeId) ?? known.current.get(activeId) : undefined;
  const onAssetChange = (next: MediaAsset) => {
    remember([next]);
    setItems((list) => list.map((a) => (a.id === next.id ? next : a)));
  };

  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const monthFmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }), [locale]);
  const kindOptions: { value: string; label: string }[] = [
    { value: "", label: t("kindAll") },
    { value: "image", label: t("kindImage") },
    { value: "video", label: t("kindVideo") },
    { value: "audio", label: t("kindAudio") },
    { value: "document", label: t("kindDocument") },
    { value: "archive", label: t("kindArchive") },
  ];
  const lockedKinds = kindsFromAccept(accept);
  const kindValue = Array.isArray(query.kind) ? query.kind[0] ?? "" : query.kind ?? "";
  const monthList = query.month && !months.includes(query.month) ? [query.month, ...months] : months;
  const liveId = React.useId();

  /* ---- render parts ---- */
  const toolbarEl = toolbar ? (
    <div data-slot="media-toolbar" role="search" aria-label={t("library")} className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
      <Input
        ref={searchRef}
        type="search"
        size="sm"
        aria-label={t("search")}
        placeholder={t("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leading={<Search aria-hidden />}
        clearable
        onClear={() => setSearch("")}
        className="min-w-44 flex-[1_1_14rem] @3xl:max-w-[22rem]"
        data-autofocus
      />
      {!lockedKinds || lockedKinds.length > 1 ? (
        <NativeSelect size="sm" aria-label={t("kind")} value={kindValue} onChange={(e) => patchQuery({ kind: (e.target.value || undefined) as MediaKind | undefined })} items={lockedKinds ? kindOptions.filter((o) => !o.value || lockedKinds.includes(o.value as MediaKind)) : kindOptions} className="w-auto" />
      ) : null}
      <NativeSelect
        size="sm"
        aria-label={t("month")}
        value={query.month ?? ""}
        onChange={(e) => patchQuery({ month: e.target.value || undefined })}
        items={[{ value: "", label: t("monthAll") }, ...monthList.map((m) => ({ value: m, label: monthFmt.format(monthDate(m)) }))]}
        className="w-auto"
      />
      {folderMode === "select" ? (
        <NativeSelect
          size="sm"
          aria-label={t("folder")}
          value={query.folderId === undefined ? "__all" : query.folderId === null ? "__root" : query.folderId}
          onChange={(e) => patchQuery({ folderId: e.target.value === "__all" ? undefined : e.target.value === "__root" ? null : e.target.value })}
          items={[{ value: "__all", label: t("folderAll") }, { value: "__root", label: t("folderRoot") }, ...folders.map((fo) => ({ value: fo.id, label: fo.name }))]}
          className="w-auto"
        />
      ) : null}
      {uploaders.length > 1 ? (
        <NativeSelect size="sm" aria-label={t("uploader")} value={query.uploadedBy ?? ""} onChange={(e) => patchQuery({ uploadedBy: e.target.value || undefined })} items={[{ value: "", label: t("uploaderAll") }, ...uploaders.map((u) => ({ value: u.id, label: u.name }))]} className="w-auto" />
      ) : null}
      <Button size="sm" variant="ghost" aria-pressed={Boolean(query.unattached)} className={cn("text-fg-muted", query.unattached && "bg-selected text-fg")} onClick={() => patchQuery({ unattached: query.unattached ? undefined : true })}>
        {t("unattached")}
      </Button>
      <div className="ms-auto flex items-center gap-2">
        <NativeSelect
          size="sm"
          variant="ghost"
          aria-label={t("sort")}
          value={query.sort ?? "newest"}
          onChange={(e) => patchQuery({ sort: e.target.value as MediaQuery["sort"] })}
          items={[
            { value: "newest", label: t("sortNewest") },
            { value: "oldest", label: t("sortOldest") },
            { value: "name", label: t("sortName") },
            { value: "size", label: t("sortSize") },
          ]}
          className="w-auto min-w-[8.5rem]"
        />
        <div role="group" aria-label={t("view")} className="flex items-center rounded-ui-sm bg-surface-2 p-0.5">
          <IconButton label={t("grid")} size="xs" variant="ghost" aria-pressed={view === "grid"} className={cn("text-fg-muted", view === "grid" && "bg-surface text-fg shadow-sm")} onClick={() => setView("grid")}>
            <LayoutGrid />
          </IconButton>
          <IconButton label={t("list")} size="xs" variant="ghost" aria-pressed={view === "list"} className={cn("text-fg-muted", view === "list" && "bg-surface text-fg shadow-sm")} onClick={() => setView("list")}>
            <ListIcon />
          </IconButton>
        </div>
        {canUpload ? (
          <Button size="sm" variant={selection === "none" ? "primary" : "secondary"} onClick={() => fileInput.current?.click()}>
            <Upload />
            {t("upload")}
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

  const bulkBar =
    selection === "multiple" && selected.length > 0 ? (
      <div data-slot="media-bulk-bar" className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2 px-4 py-2">
        <span className="tabular text-[13px] font-medium text-fg">{t("selected", { count: selected.length })}</span>
        {atMax ? <span className="text-[12px] text-fg-muted">· {t("maxReached", { max: nf.format(max!) })}</span> : null}
        <div className="ms-auto flex flex-wrap items-center gap-1.5">
          {selection === "multiple" && !max ? (
            <Button size="xs" variant="ghost" className="text-fg-muted" onClick={() => setSelected(items.filter((a) => !isDisabled(a) || selected.includes(a.id)).map((a) => a.id))}>
              {t("selectAll")}
            </Button>
          ) : null}
          {canEdit && hasFolders && caps?.bulk ? (
            <NativeSelect size="sm" variant="ghost" aria-label={t("moveTo")} value="" onChange={(e) => e.target.value && void moveTo(e.target.value === "__root" ? null : e.target.value)} items={[{ value: "", label: t("move") }, { value: "__root", label: t("folderRoot") }, ...folders.map((fo) => ({ value: fo.id, label: fo.name }))]} className="w-auto" />
          ) : null}
          <Button size="xs" variant="ghost" onClick={downloadSelected}>
            <Download />
            {t("download")}
          </Button>
          {canUpload && caps?.bulk !== false ? (
            <Button size="xs" variant="danger-ghost" onClick={() => setConfirm([...selected])}>
              <Trash2 />
              {t("delete")}
            </Button>
          ) : null}
          <IconButton label={t("clearSelection")} tooltip={false} size="xs" variant="ghost" className="text-fg-muted" onClick={() => setSelected([])}>
            <X />
          </IconButton>
        </div>
      </div>
    ) : null;

  const renderTile = (a: MediaAsset, index: number) => {
    const isSel = selected.includes(a.id);
    const disabled = isDisabled(a);
    const missing = isAltMissing(a);
    return (
      <div
        key={a.id}
        role="gridcell"
        data-tile={index}
        data-slot="media-tile"
        data-selected={isSel ? "" : undefined}
        data-active={activeId === a.id ? "" : undefined}
        aria-selected={selection === "none" ? undefined : isSel}
        aria-disabled={disabled || undefined}
        // The name carries every visible overlay (duration, "Failed"); those overlays are aria-hidden so
        // the visible text never contradicts the name (axe label-content-name-mismatch, WCAG 2.5.3).
        aria-label={[a.filename, a.kind === "video" && a.duration ? f.duration(a.duration) : null, missing ? t("missingAlt") : null, a.status === "processing" ? t("processing") : a.status === "failed" ? t("failed") : null].filter(Boolean).join(", ")}
        tabIndex={index === focusIndex ? 0 : -1}
        onClick={(e) => onTileClick(e, index)}
        onDoubleClick={() => detailsPanel && openDetails(a)}
        onFocus={() => setFocusIndex(index)}
        className={cn("vui-media-tile group/tile focus-ring relative grid min-w-0 cursor-pointer gap-1.5 rounded-ui outline-none", disabled && "cursor-not-allowed opacity-45")}
      >
        <div className="vui-media-tile-frame relative overflow-hidden rounded-ui bg-surface-2">
          <MediaThumb asset={a} rounded="none" />
          {a.kind === "video" && a.duration ? <span aria-hidden className="tabular absolute end-1.5 bottom-1.5 rounded-sm bg-[color-mix(in_srgb,var(--scene)_82%,transparent)] px-1.5 py-0.5 text-[10.5px] font-medium text-fg">{f.duration(a.duration)}</span> : null}
          {a.status === "failed" ? <Badge aria-hidden tone="danger" className="absolute start-1.5 top-1.5">{t("failed")}</Badge> : null}
          {missing ? <span aria-hidden title={t("missingAlt")} className="vui-media-alt-dot absolute end-2 top-2 size-2 rounded-full bg-warning" /> : null}
          {selection !== "none" ? (
            <span aria-hidden data-slot="media-tile-check" className={cn("vui-media-check absolute start-1.5 top-1.5 flex size-5 items-center justify-center rounded-full", isSel ? "bg-accent text-accent-fg" : "border border-[color-mix(in_srgb,var(--fg)_30%,transparent)] bg-[color-mix(in_srgb,var(--scene)_70%,transparent)] text-transparent")}>
              <Check className="size-3" strokeWidth={3} />
            </span>
          ) : null}
        </div>
        <span className={cn("truncate px-0.5 text-[12px] leading-tight", isSel ? "text-fg" : "text-fg-muted")}>{a.filename}</span>
      </div>
    );
  };

  const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: GRID_GAP } as React.CSSProperties;

  const gridEl = (
    <div
      ref={gridRef}
      role="grid"
      aria-label={t("files")}
      aria-multiselectable={selection === "multiple" || undefined}
      aria-rowcount={virtual ? rows.length : undefined}
      aria-describedby={liveId}
      data-slot="media-grid"
      onKeyDown={onGridKeyDown}
      className="relative"
      style={virtual ? { height: virtualizer.getTotalSize() } : undefined}
    >
      {virtual
        ? virtualizer.getVirtualItems().map((vr) => (
            <div key={vr.key} role="row" aria-rowindex={vr.index + 1} data-index={vr.index} ref={virtualizer.measureElement} className="absolute inset-x-0 grid" style={{ ...gridStyle, top: 0, transform: `translateY(${vr.start}px)`, paddingBottom: GRID_GAP }}>
              {rows[vr.index]!.map((a, i) => renderTile(a, vr.index * cols + i))}
            </div>
          ))
        : rows.map((row, r) => (
            <div key={r} role="row" className="grid" style={{ ...gridStyle, marginBottom: r < rows.length - 1 ? GRID_GAP : 0 }}>
              {row.map((a, i) => renderTile(a, r * cols + i))}
            </div>
          ))}
    </div>
  );

  const listEl = (
    <table data-slot="media-list" aria-label={t("files")} className="w-full border-collapse text-[13px]">
      <thead>
        <tr className="text-start text-[11.5px] tracking-wide text-fg-subtle uppercase">
          {selection !== "none" ? (
            <th scope="col" className="w-10 pb-2 ps-1 text-start font-medium">
              <span className="sr-only">{t("select", { name: "" })}</span>
            </th>
          ) : null}
          <th scope="col" className="w-full pb-2 text-start font-medium">{t("colName")}</th>
          <th scope="col" className="hidden pb-2 ps-4 text-start font-medium whitespace-nowrap @lg:table-cell">{t("colType")}</th>
          <th scope="col" className="pb-2 ps-4 text-end font-medium whitespace-nowrap">{t("colSize")}</th>
          <th scope="col" className="hidden pb-2 ps-4 text-end font-medium whitespace-nowrap @xl:table-cell">{t("colDimensions")}</th>
          <th scope="col" className="hidden pb-2 ps-4 text-end font-medium whitespace-nowrap @md:table-cell">{t("colUploaded")}</th>
          <th scope="col" className="hidden pb-2 ps-4 pe-1 text-end font-medium whitespace-nowrap @lg:table-cell">{t("colAlt")}</th>
        </tr>
      </thead>
      <tbody>
        {items.map((a, index) => {
          const isSel = selected.includes(a.id);
          const disabled = isDisabled(a);
          return (
            <tr key={a.id} data-slot="media-row" aria-selected={selection === "none" ? undefined : isSel} data-selected={isSel ? "" : undefined} className={cn("border-t border-line transition-colors hover:bg-hover", (isSel || activeId === a.id) && "bg-selected", disabled && "opacity-45")}>
              {selection !== "none" ? (
                <td className="py-1.5 ps-1">
                  <Checkbox size="sm" aria-label={t("select", { name: a.filename })} checked={isSel} disabled={Boolean(disabled)} onCheckedChange={() => toggle(index)} />
                </td>
              ) : null}
              <td className="max-w-0 py-1.5">
                <button type="button" className="focus-ring flex w-full min-w-0 items-center gap-3 rounded-ui-sm text-start" onClick={() => (detailsPanel ? openDetails(a) : toggle(index))}>
                  <span className="size-9 shrink-0 overflow-hidden rounded-ui-sm ring-1 ring-line">
                    <MediaThumb asset={a} rounded="none" />
                  </span>
                  <span className="truncate text-fg">{a.filename}</span>
                </button>
              </td>
              <td className="hidden py-1.5 ps-4 text-fg-muted @lg:table-cell">{extensionOf(a.filename) || a.kind}</td>
              <td className="tabular py-1.5 ps-4 text-end whitespace-nowrap text-fg-muted">{f.bytes(a.size)}</td>
              <td className="tabular hidden py-1.5 ps-4 text-end whitespace-nowrap text-fg-muted @xl:table-cell">{dimensions(a, nf)}</td>
              <td className="tabular hidden py-1.5 ps-4 text-end whitespace-nowrap text-fg-muted @md:table-cell">{f.date(a.createdAt)}</td>
              <td className="hidden py-1.5 ps-4 pe-1 text-end whitespace-nowrap @lg:table-cell">
                {a.kind !== "image" ? <span className="text-fg-subtle">—</span> : isAltMissing(a) ? <Badge tone="warning">{t("missingAlt")}</Badge> : isDecorative(a) ? <span className="text-fg-subtle">{t("altDecorative")}</span> : <span className="text-fg-muted">{t("altOk")}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const skeleton = (
    <div aria-hidden className="grid" style={gridStyle}>
      {Array.from({ length: cols * 2 }, (_, i) => (
        <div key={i} className="grid gap-1.5">
          <Skeleton className="aspect-square rounded-ui" />
          <Skeleton className="h-3 w-3/4 rounded-sm" />
        </div>
      ))}
    </div>
  );

  let body: React.ReactNode;
  if (!adapter) body = null;
  else if (status === "error")
    body = (
      <Alert tone="danger" live="assertive" title={t("error")} actions={<Button size="sm" onClick={() => setReload((n) => n + 1)}>{t("retry")}</Button>} />
    );
  else if (status === "loading") body = skeleton;
  else if (!items.length)
    body = filtered ? (
      <EmptyState
        kind="no-results"
        size="sm"
        title={query.search ? t("noResults", { query: query.search }) : t("noResultsFiltered")}
        description={t("noResultsDescription")}
        actions={
          <Button size="sm" onClick={() => setQuery({ sort: query.sort })}>
            {t("clearFilters")}
          </Button>
        }
      />
    ) : (
      emptyState ?? (
        <EmptyState
          kind="first-use"
          size="sm"
          framed
          icon={<Upload aria-hidden />}
          title={t("emptyTitle")}
          description={canUpload ? t("emptyDescription") : undefined}
          actions={
            canUpload ? (
              <Button size="sm" variant="primary" onClick={() => fileInput.current?.click()}>
                <Upload />
                {t("upload")}
              </Button>
            ) : undefined
          }
        />
      )
    );
  else body = view === "grid" ? gridEl : listEl;

  const folderSidebar =
    folderMode === "sidebar" ? (
      <MediaFolderNav folders={folders} value={query.folderId} onValueChange={(folderId) => patchQuery({ folderId })} adapter={canEdit ? adapter : undefined} onCreated={(fo) => setFolders((l) => [...l, fo])} t={t} />
    ) : null;

  const showSide = detailsPanel === "side" && active;

  return (
    <div
      ref={ref}
      data-slot="media-library"
      data-view={view}
      data-dragging={dragDepth > 0 ? "" : undefined}
      className={cn("vui-media-library surface @container relative flex flex-col overflow-hidden rounded-ui-lg", className)}
      {...dropHandlers}
      {...props}
    >
      {toolbarEl}
      {bulkBar}
      <div className="flex min-h-0 flex-1">
        {folderSidebar}
        <div ref={scrollRef} className="vui-media-scroll @container relative min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4" style={{ height }}>
          {uploadQueue.items.length ? <MediaUploadQueue queue={uploadQueue} labels={queueLabelsProp} className="mb-4" /> : null}
          <div ref={measureRef}>{body}</div>
          {status === "ready" && cursor ? (
            <div className="mt-4 flex justify-center">
              <Button size="sm" variant="ghost" loading={loadingMore} onClick={() => void loadMore()}>
                {t("loadMore")}
              </Button>
            </div>
          ) : null}
          {status === "ready" && items.length ? (
            <p className="tabular mt-4 text-center text-[11.5px] text-fg-subtle">{t("count", { count: total ?? items.length })}</p>
          ) : null}
        </div>
        {showSide ? (
          <aside aria-label={t("details")} data-slot="media-details-panel" className="vui-media-side hidden w-[19rem] shrink-0 overflow-y-auto overscroll-contain border-s border-line px-4 py-4 @container md:block" style={{ height }}>
            <MediaDetails asset={active} adapter={adapter} readOnly={!canEdit} onChange={onAssetChange} onDelete={canUpload ? (a) => setConfirm([a.id]) : undefined} onClose={() => setActiveId(null)} labels={detailsLabelsProp} />
          </aside>
        ) : null}
      </div>
      <span id={liveId} role="status" aria-live="polite" className="sr-only">
        {selection !== "none" ? t("selectedAnnounce", { count: selected.length }) : ""}
      </span>
      {canUpload ? (
        <input
          ref={fileInput}
          type="file"
          multiple={selection !== "single"}
          accept={accept}
          hidden
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      ) : null}
      {canUpload ? (
        <div aria-hidden data-slot="media-drop-overlay" className="vui-media-drop pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-ui">
          <span className="surface-popover inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium">
            <Upload className="size-4" />
            {t("dropHint")}
          </span>
        </div>
      ) : null}

      {/* Details as a dialog: always for detailsPanel="dialog", and on small screens for "side". */}
      {detailsPanel === "dialog" || detailsPanel === "side" ? (
        <Dialog open={Boolean(active) && (detailsPanel === "dialog" || narrowViewport())} onOpenChange={(o) => !o && setActiveId(null)}>
          <DialogContent size="md" mobile="fullscreen">
            <DialogHeader title={t("details")} srOnly />
            <DialogBody>{active ? <MediaDetails asset={active} adapter={adapter} readOnly={!canEdit} onChange={onAssetChange} onDelete={canUpload ? (a) => setConfirm([a.id]) : undefined} labels={detailsLabelsProp} /> : null}</DialogBody>
          </DialogContent>
        </Dialog>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirm)}
        tone="danger"
        title={t("deleteTitle", { count: confirm?.length ?? 1 })}
        description={caps?.trash ? t("trashDescription") : t("deleteDescription")}
        confirmLabel={t("delete")}
        onConfirm={() => (confirm ? remove(confirm) : undefined)}
        onResult={() => setConfirm(null)}
      />
    </div>
  );
});

function narrowViewport() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 767px)").matches;
}

/* ------------------------------------------------------------------ */
/* Folder sidebar                                                       */
/* ------------------------------------------------------------------ */

function MediaFolderNav({
  folders,
  value,
  onValueChange,
  adapter,
  onCreated,
  t,
}: {
  folders: MediaFolder[];
  value: string | null | undefined;
  onValueChange: (id: string | null | undefined) => void;
  adapter?: MediaAdapter;
  onCreated: (f: MediaFolder) => void;
  t: ReturnType<typeof useLabels<MediaLibraryLabels>>;
}) {
  const [creating, setCreating] = React.useState(false);
  const [name, setName] = React.useState("");
  const f = useFormat();
  const byParent = (parent: string | null) => folders.filter((fo) => (fo.parentId ?? null) === parent);
  const item = (id: string | null | undefined, label: string, count?: number, depth = 0) => {
    const current = value === id;
    return (
      <li key={String(id)}>
        <button
          type="button"
          aria-current={current || undefined}
          onClick={() => onValueChange(id)}
          className={cn("focus-ring flex h-8 w-full items-center gap-2 rounded-ui-sm px-2 text-start text-[13px] transition-colors hover:bg-hover", current ? "bg-selected font-medium text-fg" : "text-fg-muted")}
          style={{ paddingInlineStart: 8 + depth * 14 }}
        >
          <Folder aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
          {count !== undefined ? <span className="tabular ms-auto text-[11.5px] text-fg-subtle">{f.number(count)}</span> : null}
        </button>
      </li>
    );
  };
  const tree = (parent: string | null, depth: number): React.ReactNode[] => byParent(parent).flatMap((fo) => [item(fo.id, fo.name, fo.count, depth), ...tree(fo.id, depth + 1)]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adapter?.folders || !name.trim()) return;
    const created = await adapter.folders.create(name.trim(), null);
    onCreated(created);
    setName("");
    setCreating(false);
  };
  return (
    <nav aria-label={t("folder")} data-slot="media-folders" className="hidden w-52 shrink-0 flex-col gap-2 border-e border-line px-2 py-3 sm:flex">
      <ul className="grid gap-0.5">
        {item(undefined, t("folderAll"))}
        {item(null, t("folderRoot"))}
        {tree(null, 0)}
      </ul>
      {adapter?.folders ? (
        creating ? (
          <form onSubmit={submit} className="grid gap-1.5 px-1">
            <Input size="sm" autoFocus aria-label={t("folderName")} placeholder={t("folderName")} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Escape" && setCreating(false)} />
            <Button size="xs" type="submit" variant="secondary" disabled={!name.trim()}>
              {t("create")}
            </Button>
          </form>
        ) : (
          <Button size="xs" variant="ghost" className="justify-start text-fg-muted" onClick={() => setCreating(true)}>
            <FolderPlus />
            {t("newFolder")}
          </Button>
        )
      ) : null}
    </nav>
  );
}

