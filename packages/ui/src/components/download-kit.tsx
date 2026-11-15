"use client";

import * as React from "react";
import { Archive, Download, FileText } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { useControllableState } from "../lib/use-controllable-state";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { createZip, type ZipEntry } from "./_zip";

export { createZip, type ZipEntry } from "./_zip";

export const downloadKitLabels = {
  selectAll: "Select all",
  /** Selection summary next to "Select all". */
  selected: "{count} of {total} selected",
  /** Total size of the selection, after the summary. */
  selectedSize: "{size} in total",
  /** ZIP button. */
  downloadSelected: "{count, plural, =0 {Download as ZIP} one {Download # file as ZIP} other {Download # files as ZIP}}",
  /** Visible text of a row's download button. */
  download: "Download",
  /** Accessible name of a row's download button. */
  downloadOne: "Download {name}",
  /** Accessible name of a row's checkbox. */
  select: "Select {name}",
  preparing: "Preparing {file}…",
  saved: "Saved {file} ({size})",
  failed: "Couldn't download {file}. Try again.",
  /** Saved with some files left out. */
  partial: "Saved {file} without {count, plural, one {# file} other {# files}} that could not be fetched",
  /** First line of the note added to the archive for files that could not be fetched. */
  missingNote: "These files could not be fetched and are not in this archive:",
};
export type DownloadKitLabels = typeof downloadKitLabels;

export interface DownloadAsset {
  id: string;
  /** What it is ("Logo, light background"). */
  name: string;
  /** File name to save as (and its path inside the ZIP). */
  file: string;
  /** Size in bytes, shown and summed for the selection. */
  size?: number;
  /** Format label ("SVG", "PDF · 12 pages"). */
  format?: string;
  /** Second line (dimensions, licence, notes). */
  description?: React.ReactNode;
  /** Thumbnail image URL. */
  preview?: string;
  /** Icon when there is no preview. Default: a file icon. */
  icon?: React.ReactNode;
  /** URL of the file. Saved with a plain link; fetched for the ZIP (same origin or CORS). */
  href?: string;
  /** Builds the file on demand (generated text, an SVG from tokens…). Wins over `href`. */
  data?: () => Blob | Uint8Array | string | Promise<Blob | Uint8Array | string>;
}

export interface DownloadKitProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  assets: DownloadAsset[];
  /** Checkboxes and the ZIP button. Default `true`; `false` lists single downloads only. */
  selectable?: boolean;
  /** Selected ids (controlled). */
  selected?: string[];
  /** Initial selection. Default: everything. */
  defaultSelected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  /** ZIP file name without extension, also the folder inside it. Default `"downloads"`. */
  archiveName?: string;
  /** Called after a file or archive is saved. */
  onDownload?: (detail: { ids: string[]; file: string; size: number; kind: "file" | "zip" }) => void;
  labels?: Partial<DownloadKitLabels>;
}

async function toBytes(asset: DownloadAsset): Promise<{ bytes: Uint8Array; type: string }> {
  if (asset.data) {
    const out = await asset.data();
    if (typeof out === "string") return { bytes: new TextEncoder().encode(out), type: "text/plain;charset=utf-8" };
    if (out instanceof Uint8Array) return { bytes: out, type: "application/octet-stream" };
    return { bytes: new Uint8Array(await out.arrayBuffer()), type: out.type };
  }
  if (!asset.href) throw new Error(`${asset.id}: no href or data`);
  const res = await fetch(asset.href);
  if (!res.ok) throw new Error(`${asset.file}: HTTP ${res.status}`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), type: res.headers.get("content-type") ?? "application/octet-stream" };
}

function save(blob: Blob, file: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * A list of downloadable files (press kit, brand assets, templates, datasets) with sizes and
 * formats. Each row downloads on its own; ticked rows download together as one ZIP built in the
 * browser (stored, no dependency). Files that fail to fetch are listed in a note inside the
 * archive instead of breaking it. Progress and results are announced politely.
 *
 * ```tsx
 * <DownloadKit archiveName="press-kit" assets={[
 *   { id: "logo", name: "Logo, light background", file: "logo.svg", href: "/press/logo.svg", size: 4_200, format: "SVG" },
 *   { id: "facts", name: "Fact sheet", file: "facts.txt", data: () => factsText, format: "TXT" },
 * ]} />
 * ```
 */
export const DownloadKit = /*#__PURE__*/ React.forwardRef<HTMLDivElement, DownloadKitProps>(function DownloadKit(
  { assets, selectable = true, selected: selectedProp, defaultSelected, onSelectedChange, archiveName = "downloads", onDownload, labels, className, ...props },
  ref,
) {
  const t = useLabels("downloadKit", downloadKitLabels, labels);
  const f = useFormat();
  const [selected, setSelected] = useControllableState({
    value: selectedProp,
    defaultValue: defaultSelected ?? assets.map((a) => a.id),
    onChange: onSelectedChange,
    name: "DownloadKit",
  });
  const [busy, setBusy] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("");

  const picked = assets.filter((a) => selected.includes(a.id));
  const all = picked.length === assets.length && assets.length > 0;
  const knownSize = picked.reduce((n, a) => n + (a.size ?? 0), 0);
  const zipFile = `${archiveName}.zip`;

  const downloadOne = async (a: DownloadAsset) => {
    setBusy(a.id);
    setStatus(t("preparing", { file: a.file }));
    try {
      const { bytes, type } = await toBytes(a);
      const blob = new Blob([bytes as BlobPart], { type });
      save(blob, a.file);
      setStatus(t("saved", { file: a.file, size: f.bytes(blob.size) }));
      onDownload?.({ ids: [a.id], file: a.file, size: blob.size, kind: "file" });
    } catch {
      setStatus(t("failed", { file: a.file }));
    } finally {
      setBusy(null);
    }
  };

  const downloadZip = async () => {
    setBusy("zip");
    setStatus(t("preparing", { file: zipFile }));
    try {
      const entries: ZipEntry[] = [];
      const missing: string[] = [];
      for (const a of picked) {
        try {
          entries.push({ name: `${archiveName}/${a.file}`, data: (await toBytes(a)).bytes });
        } catch {
          missing.push(a.file);
        }
      }
      if (missing.length) entries.push({ name: `${archiveName}/MISSING.txt`, data: new TextEncoder().encode(`${t("missingNote")}\n${missing.join("\n")}\n`) });
      const blob = createZip(entries);
      save(blob, zipFile);
      setStatus(missing.length ? t("partial", { file: zipFile, count: missing.length }) : t("saved", { file: zipFile, size: f.bytes(blob.size) }));
      onDownload?.({ ids: picked.map((a) => a.id), file: zipFile, size: blob.size, kind: "zip" });
    } catch {
      setStatus(t("failed", { file: zipFile }));
    } finally {
      setBusy(null);
    }
  };

  const summary = t("selected", { count: picked.length, total: assets.length }) + (knownSize ? ` · ${t("selectedSize", { size: f.bytes(knownSize) })}` : "");

  return (
    <div ref={ref} data-slot="download-kit" className={cn("min-w-0 overflow-hidden rounded-ui border border-line bg-surface", className)} {...props}>
      {selectable ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <Checkbox
            checked={all ? true : picked.length ? "indeterminate" : false}
            onCheckedChange={(v) => setSelected(v === true ? assets.map((a) => a.id) : [])}
            label={t("selectAll")}
            description={summary}
            data-select-all=""
          />
          <Button variant="primary" onClick={downloadZip} disabled={!picked.length || busy !== null} loading={busy === "zip"} data-download-zip="">
            <Archive aria-hidden />
            {t("downloadSelected", { count: picked.length })}
          </Button>
        </div>
      ) : null}
      <ul className="m-0 list-none p-0">
        {assets.map((a) => {
          const on = selected.includes(a.id);
          const meta = [a.format, a.size != null ? f.bytes(a.size) : undefined].filter(Boolean).join(" · ");
          const linkOnly = !a.data && a.href;
          return (
            <li key={a.id} data-asset={a.id} data-selected={selectable && on ? "" : undefined} className={cn("flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0", selectable && on && "bg-selected")}>
              {selectable ? (
                <Checkbox checked={on} onCheckedChange={(v) => setSelected(v === true ? [...selected, a.id] : selected.filter((x) => x !== a.id))} aria-label={t("select", { name: a.name })} />
              ) : null}
              {a.preview ? (
                <img src={a.preview} alt="" width={64} height={40} loading="lazy" decoding="async" className="hidden h-10 w-16 shrink-0 rounded-ui-sm border border-line object-cover sm:block" />
              ) : (
                <span aria-hidden="true" className="hidden h-10 w-16 shrink-0 place-items-center rounded-ui-sm border border-line bg-surface-2 text-fg-muted sm:grid [&_svg]:size-4">
                  {a.icon ?? <FileText />}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-medium text-fg">{a.name}</p>
                <p className="m-0 flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
                  <span className="truncate font-mono" dir="ltr">
                    {a.file}
                  </span>
                  {meta ? <span className="tabular">{meta}</span> : null}
                </p>
                {a.description != null ? <div className="mt-0.5 text-xs text-fg-muted">{a.description}</div> : null}
              </div>
              {linkOnly ? (
                <Button asChild variant="ghost" size="sm" data-download={a.id}>
                  <a href={a.href} download={a.file} aria-label={t("downloadOne", { name: a.name })} onClick={() => onDownload?.({ ids: [a.id], file: a.file, size: a.size ?? 0, kind: "file" })}>
                    <Download aria-hidden />
                    <span className="hidden sm:inline">{t("download")}</span>
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => downloadOne(a)} disabled={busy !== null} loading={busy === a.id} aria-label={t("downloadOne", { name: a.name })} data-download={a.id}>
                  <Download aria-hidden />
                  <span className="hidden sm:inline">{t("download")}</span>
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <p role="status" className={cn("m-0 border-t border-line bg-surface-2 px-4 py-2 text-xs text-fg-muted", !status && "sr-only")}>
        {status}
      </p>
    </div>
  );
});
