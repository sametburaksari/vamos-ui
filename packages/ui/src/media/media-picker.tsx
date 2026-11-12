"use client";

import * as React from "react";
import { Link2, TriangleAlert, Upload, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { FieldContextReset } from "../lib/field-context";
import { Alert } from "../components/alert";
import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "../components/dialog";
import { Input } from "../components/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { MediaLibrary, MediaThumb, type MediaLibraryHandle, type MediaLibraryLabels } from "./media-library";
import { useMedia } from "./media-provider";
import { DECORATIVE_TAG, isAltMissing } from "./media-utils";
import type { MediaAdapter, MediaAsset } from "./types";

const pickerLabels = {
  title: "Select media",
  titleImage: "Select image",
  titleImages: "Select images",
  library: "Library",
  upload: "Upload",
  url: "From URL",
  uploadTitle: "Drop files to upload",
  uploadHint: "or choose them from your computer. They are added to the library and selected.",
  uploadButton: "Choose files",
  uploadAccept: "Accepted: {accept}",
  urlLabel: "File URL",
  urlHint: "Paste a link to an image or file. It is copied into the library.",
  urlPlaceholder: "https://",
  urlImport: "Import",
  urlImporting: "Importing…",
  urlError: "That URL couldn't be imported. Check the link and try again.",
  cancel: "Cancel",
  confirm: "{count, plural, =0 {Insert} one {Insert file} other {Insert # files}}",
  confirmImage: "{count, plural, =0 {Insert} one {Insert image} other {Insert # images}}",
  selected: "{count, plural, =0 {Nothing selected} one {# selected} other {# selected}}",
  maxHint: "Up to {max}",
  remove: "Remove {name} from selection",
  more: "+{count}",
  altTitle: "{count, plural, one {An image needs alt text} other {# images need alt text}}",
  altDescription: "Describe each image, or mark it as decorative.",
  altFor: "Alt text for {name}",
  decorative: "Decorative",
  shortcut: "Ctrl + Enter to confirm",
};
export type MediaPickerLabels = typeof pickerLabels;

export type MediaPickerTab = "library" | "upload" | "url";

export interface MediaPickerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Else from `MediaProvider`. */
  adapter?: MediaAdapter;
  multiple?: boolean;
  /** Selection limit with `multiple`. */
  max?: number;
  /** `"image/*"`: library filter and upload restriction. */
  accept?: string;
  /** Preselected asset ids. */
  value?: string[];
  /** Called with the chosen assets on confirm (alt text already saved when `requireAlt`). */
  onSelect?: (assets: MediaAsset[]) => void;
  /** Dialog title. Default "Select image(s)" / "Select media". */
  title?: string;
  /** Confirm button text ("Set featured image"). Default is pluralised: "Insert 2 images". */
  confirmLabel?: string;
  /** Tabs to show, in order. Default library + upload (+ "url" when the adapter can sideload). */
  tabs?: MediaPickerTab[];
  /** Ask for alt text on images that have none before confirming. */
  requireAlt?: boolean;
  /** `md` 720px · `lg` 1080px (with details panel) · `full`. Default `"lg"`. */
  size?: "md" | "lg" | "full";
  /** Optional trigger (rendered as `DialogTrigger asChild`). */
  children?: React.ReactNode;
  labels?: Partial<MediaPickerLabels>;
  libraryLabels?: Partial<MediaLibraryLabels>;
}

/**
 * A dialog that picks one or more files for a field: featured image, gallery blocks, logos,
 * profile photos, attachments. Library, Upload and From URL tabs; new uploads are selected
 * automatically; optional alt-text check before confirming. ⌘/Ctrl + Enter confirms.
 *
 * ```tsx
 * <MediaPicker accept="image/*" confirmLabel="Set featured image" onSelect={([asset]) => setCover(asset)}>
 *   <Button>Choose image</Button>
 * </MediaPicker>
 * ```
 */
export function MediaPicker({
  open: openProp,
  defaultOpen,
  onOpenChange,
  adapter: adapterProp,
  multiple = false,
  max,
  accept,
  value,
  onSelect,
  title,
  confirmLabel,
  tabs: tabsProp,
  requireAlt = false,
  size = "lg",
  children,
  labels,
  libraryLabels,
}: MediaPickerProps) {
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen ?? false, onChange: onOpenChange, name: "MediaPicker" });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      {open ? (
        <MediaPickerContent
          adapter={adapterProp}
          multiple={multiple}
          max={max}
          accept={accept}
          value={value}
          title={title}
          confirmLabel={confirmLabel}
          tabs={tabsProp}
          requireAlt={requireAlt}
          size={size}
          labels={labels}
          libraryLabels={libraryLabels}
          onCancel={() => setOpen(false)}
          onConfirm={(assets) => {
            onSelect?.(assets);
            setOpen(false);
          }}
        />
      ) : null}
    </Dialog>
  );
}

const SIZE_W = { md: "45rem", lg: "67.5rem", full: "none" } as const;

interface MediaPickerContentProps extends Omit<MediaPickerProps, "open" | "defaultOpen" | "onOpenChange" | "onSelect" | "children"> {
  onCancel: () => void;
  onConfirm: (assets: MediaAsset[]) => void;
}

function MediaPickerContent({ adapter: adapterProp, multiple, max, accept, value, title, confirmLabel, tabs: tabsProp, requireAlt, size = "lg", labels, libraryLabels, onCancel, onConfirm }: MediaPickerContentProps) {
  const t = useLabels("mediaPicker", pickerLabels, labels);
  const f = useFormat();
  const ctx = useMedia();
  const adapter = adapterProp ?? ctx;
  const imagesOnly = Boolean(accept && accept.split(",").every((r) => r.trim().startsWith("image/")));
  const tabs = tabsProp ?? (["library", "upload", ...(adapter?.sideload ? (["url"] as const) : [])] as MediaPickerTab[]);
  const [tab, setTab] = React.useState<MediaPickerTab>(tabs[0] ?? "library");
  const [ids, setIds] = React.useState<string[]>(value ?? []);
  const [assets, setAssets] = React.useState<Map<string, MediaAsset>>(new Map());
  const [altDrafts, setAltDrafts] = React.useState<Record<string, string>>({});
  const [decorative, setDecorative] = React.useState<Record<string, boolean>>({});
  const [saving, setSaving] = React.useState(false);
  const library = React.useRef<MediaLibraryHandle>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Preselected ids the library hasn't loaded yet.
  React.useEffect(() => {
    if (!adapter || !value?.length) return;
    const load = adapter.getMany ? adapter.getMany(value) : Promise.all(value.map((id) => adapter.get(id)));
    load.then((list) => setAssets((m) => new Map([...m, ...list.map((a) => [a.id, a] as const)]))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adapter]);

  const chosen = ids.map((id) => assets.get(id)).filter((a): a is MediaAsset => Boolean(a));
  const needsAlt = requireAlt ? chosen.filter((a) => isAltMissing(a) && !decorative[a.id]) : [];
  const unresolved = needsAlt.filter((a) => !(altDrafts[a.id] ?? "").trim());
  const canConfirm = chosen.length > 0 && unresolved.length === 0 && !saving;

  const confirm = async () => {
    if (!canConfirm) return;
    let out = chosen;
    if (requireAlt && adapter) {
      setSaving(true);
      try {
        out = await Promise.all(
          chosen.map(async (a) => {
            if (decorative[a.id]) return adapter.update(a.id, { alt: "", tags: [...(a.tags ?? []).filter((x) => x !== DECORATIVE_TAG), DECORATIVE_TAG] });
            const draft = altDrafts[a.id]?.trim();
            return draft && isAltMissing(a) ? adapter.update(a.id, { alt: draft }) : a;
          }),
        );
      } finally {
        setSaving(false);
      }
    }
    onConfirm(out);
  };

  const dialogTitle = title ?? (imagesOnly ? (multiple ? t("titleImages") : t("titleImage")) : t("title"));
  const buttonText = confirmLabel ?? t(imagesOnly ? "confirmImage" : "confirm", { count: chosen.length });
  const tabLabel: Record<MediaPickerTab, string> = { library: t("library"), upload: t("upload"), url: t("url") };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    library.current?.addFiles(files);
    setTab("library");
  };

  return (
    <DialogContent
      size={size === "full" ? "full" : "xl"}
      mobile="fullscreen"
      className="vui-media-picker"
      style={{ "--dialog-w": SIZE_W[size] } as React.CSSProperties}
      onOpenAutoFocus={(e) => {
        e.preventDefault();
        searchRef.current?.focus();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          void confirm();
        }
      }}
    >
      <FieldContextReset>
        <DialogHeader title={dialogTitle} />
        <Tabs value={tab} onValueChange={(v) => setTab(v as MediaPickerTab)} className="flex min-h-0 flex-1 flex-col">
          {tabs.length > 1 ? (
            <TabsList className="mx-6 shrink-0">
              {tabs.map((k) => (
                <TabsTrigger key={k} value={k}>
                  {tabLabel[k]}
                </TabsTrigger>
              ))}
            </TabsList>
          ) : null}
          <DialogBody flush className="flex min-h-0 flex-1 flex-col">
            <TabsContent value="library" forceMount className="min-h-0 flex-1 p-4 data-[state=inactive]:hidden">
              <MediaLibrary
                handleRef={library}
                adapter={adapter}
                searchRef={searchRef}
                selection={multiple ? "multiple" : "single"}
                max={multiple ? max : undefined}
                accept={accept}
                selected={ids}
                onSelectedChange={(next, list) => {
                  setIds(next);
                  setAssets((m) => new Map([...m, ...list.map((a) => [a.id, a] as const)]));
                }}
                selectUploaded
                detailsPanel={size === "md" ? false : "side"}
                height="min(30rem, 52dvh)"
                labels={libraryLabels}
                className="shadow-none"
              />
            </TabsContent>
            {tabs.includes("upload") ? (
              <TabsContent value="upload" className="p-4">
                <PickerDropzone accept={accept} multiple={Boolean(multiple)} onFiles={onFiles} t={t} />
              </TabsContent>
            ) : null}
            {tabs.includes("url") && adapter?.sideload ? (
              <TabsContent value="url" className="p-6">
                <PickerUrlForm
                  adapter={adapter}
                  t={t}
                  onImported={(asset) => {
                    setAssets((m) => new Map(m).set(asset.id, asset));
                    library.current?.addAssets([asset], { select: true });
                    setTab("library");
                  }}
                />
              </TabsContent>
            ) : null}
          </DialogBody>
        </Tabs>

        {needsAlt.length ? (
          <div data-slot="media-picker-alt" className="border-t border-line px-6 py-3">
            <Alert tone="warning" title={t("altTitle", { count: needsAlt.length })}>
              {t("altDescription")}
            </Alert>
            <ul className="mt-3 grid max-h-40 gap-2 overflow-y-auto">
              {needsAlt.map((a) => (
                <li key={a.id} className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3">
                  <span className="size-9 overflow-hidden rounded-ui-sm ring-1 ring-line">
                    <MediaThumb asset={a} rounded="none" />
                  </span>
                  <Input size="sm" aria-label={t("altFor", { name: a.filename })} placeholder={a.filename} value={altDrafts[a.id] ?? ""} onChange={(e) => setAltDrafts((d) => ({ ...d, [a.id]: e.target.value }))} />
                  <Checkbox size="sm" label={t("decorative")} checked={Boolean(decorative[a.id])} onCheckedChange={(c) => setDecorative((d) => ({ ...d, [a.id]: c === true }))} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DialogFooter align="between" className="gap-3">
          <div data-slot="media-picker-tray" className="flex min-w-0 items-center gap-2">
            {chosen.length ? (
              <ul aria-label={t("selected", { count: chosen.length })} className="flex items-center -space-x-1.5">
                {chosen.slice(0, 6).map((a) => (
                  <li key={a.id} className="group/tray relative size-9 overflow-hidden rounded-ui-sm bg-surface-2 ring-2 ring-[var(--popover)]">
                    <MediaThumb asset={a} rounded="none" />
                    <button
                      type="button"
                      aria-label={t("remove", { name: a.filename })}
                      onClick={() => setIds((l) => l.filter((id) => id !== a.id))}
                      className="focus-ring absolute inset-0 flex items-center justify-center bg-[color-mix(in_srgb,var(--scene)_70%,transparent)] text-fg opacity-0 transition-opacity group-hover/tray:opacity-100 focus-visible:opacity-100"
                    >
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
                {chosen.length > 6 ? <li className="tabular flex size-9 items-center justify-center rounded-ui-sm bg-surface-2 text-[11.5px] text-fg-muted ring-2 ring-[var(--popover)]">{t("more", { count: chosen.length - 6 })}</li> : null}
              </ul>
            ) : null}
            <span className="tabular truncate text-[12.5px] text-fg-muted">
              {t("selected", { count: chosen.length })}
              {multiple && max ? ` · ${t("maxHint", { max: f.number(max) })}` : null}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onCancel}>{t("cancel")}</Button>
            <Button variant="primary" disabled={!canConfirm} loading={saving} onClick={() => void confirm()} aria-keyshortcuts="Control+Enter Meta+Enter" title={t("shortcut")}>
              {buttonText}
            </Button>
          </div>
        </DialogFooter>
      </FieldContextReset>
    </DialogContent>
  );
}

function PickerDropzone({ accept, multiple, onFiles, t }: { accept?: string; multiple: boolean; onFiles: (f: FileList | null) => void; t: ReturnType<typeof useLabels<MediaPickerLabels>> }) {
  const input = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);
  return (
    <div
      data-slot="media-picker-dropzone"
      data-dragging={over ? "" : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(e.dataTransfer.files);
      }}
      className={cn("vui-media-dropzone flex min-h-72 flex-col items-center justify-center gap-3 rounded-ui border border-dashed border-field-border bg-surface-2 px-6 py-10 text-center transition-colors", over && "border-ring bg-accent-soft")}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-fg-muted ring-1 ring-line">
        <Upload aria-hidden className="size-5" />
      </span>
      <div className="grid gap-1">
        <p className="text-[15px] font-semibold text-fg">{t("uploadTitle")}</p>
        <p className="max-w-sm text-[13px] text-fg-muted">{t("uploadHint")}</p>
      </div>
      <Button variant="secondary" onClick={() => input.current?.click()}>
        {t("uploadButton")}
      </Button>
      {accept ? <p className="text-[12px] text-fg-subtle">{t("uploadAccept", { accept })}</p> : null}
      <input
        ref={input}
        type="file"
        hidden
        tabIndex={-1}
        aria-hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function PickerUrlForm({ adapter, onImported, t }: { adapter: MediaAdapter; onImported: (a: MediaAsset) => void; t: ReturnType<typeof useLabels<MediaPickerLabels>> }) {
  const [url, setUrl] = React.useState("");
  const [state, setState] = React.useState<"idle" | "loading" | "error">("idle");
  const id = React.useId();
  const hintId = React.useId();
  const valid = /^https?:\/\/\S+\.\S+/.test(url.trim());
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !adapter.sideload) return;
    setState("loading");
    try {
      const asset = await adapter.sideload(url.trim(), { signal: new AbortController().signal, onProgress: () => {} });
      setState("idle");
      setUrl("");
      onImported(asset);
    } catch {
      setState("error");
    }
  };
  return (
    <form onSubmit={submit} className="mx-auto grid max-w-xl gap-2 py-6">
      <label htmlFor={id} className="text-[13px] font-medium text-fg">
        {t("urlLabel")}
      </label>
      <div className="flex gap-2">
        <Input id={id} type="url" inputMode="url" leading={<Link2 aria-hidden />} placeholder={t("urlPlaceholder")} value={url} aria-describedby={hintId} invalid={state === "error"} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
        <Button type="submit" variant="secondary" disabled={!valid} loading={state === "loading"} loadingText={t("urlImporting")}>
          {t("urlImport")}
        </Button>
      </div>
      <p id={hintId} className={cn("text-[12.5px]", state === "error" ? "text-danger" : "text-fg-muted")}>
        {state === "error" ? (
          <span className="inline-flex items-center gap-1.5">
            <TriangleAlert aria-hidden className="size-3.5" />
            {t("urlError")}
          </span>
        ) : (
          t("urlHint")
        )}
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Imperative API                                                       */
/* ------------------------------------------------------------------ */

export type MediaPickOptions = Omit<MediaPickerProps, "open" | "defaultOpen" | "onOpenChange" | "onSelect" | "children">;
type PickFn = (options?: MediaPickOptions) => Promise<MediaAsset[]>;

const PickerContext = /*#__PURE__*/ React.createContext<PickFn | null>(null);

/**
 * Hosts one Media picker for `useMediaPicker()`. Put it once near the app root, inside `MediaProvider`.
 */
export function MediaPickerProvider({ children, adapter }: { children: React.ReactNode; adapter?: MediaAdapter }) {
  const [request, setRequest] = React.useState<{ options: MediaPickOptions; resolve: (a: MediaAsset[]) => void } | null>(null);
  const pick = React.useCallback<PickFn>((options = {}) => new Promise((resolve) => setRequest({ options, resolve })), []);
  return (
    <PickerContext.Provider value={pick}>
      {children}
      <MediaPicker
        adapter={adapter}
        {...request?.options}
        open={Boolean(request)}
        onOpenChange={(o) => {
          if (!o && request) {
            request.resolve([]);
            setRequest(null);
          }
        }}
        onSelect={(assets) => {
          request?.resolve(assets);
          setRequest(null);
        }}
      />
    </PickerContext.Provider>
  );
}

/**
 * Opens the picker from code and resolves with the chosen assets (`[]` when cancelled).
 *
 * ```ts
 * const pick = useMediaPicker();
 * const [logo] = await pick({ accept: "image/*", confirmLabel: "Use as logo" });
 * ```
 */
export function useMediaPicker(): PickFn {
  const pick = React.useContext(PickerContext);
  if (!pick) throw new Error("useMediaPicker() needs a <MediaPickerProvider> above it.");
  return pick;
}
