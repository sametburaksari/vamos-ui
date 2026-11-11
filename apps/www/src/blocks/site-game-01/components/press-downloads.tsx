"use client";

import * as React from "react";
import { Badge, Button, Checkbox, cn } from "@vamos-ui/react";
import { createFormatter } from "@vamos-ui/react/format";
import { Archive, Download, FileImage, FileText, Image as ImageIcon, PenTool } from "lucide-react";
import { atlasSvg, logoSvg } from "./atlas-geometry";
import { zip, type ZipEntry } from "./zip";

export type PressAsset =
  | { id: string; kind: "text"; file: string; name: string; note: string; content: string }
  | { id: string; kind: "logo"; file: string; name: string; note: string; variant: "on-dark" | "on-light" }
  | { id: string; kind: "keyart"; file: string; name: string; note: string }
  | { id: string; kind: "image"; file: string; name: string; note: string; src: string; preview: string };

export interface PressLabels {
  title: string;
  selectAll: string;
  /** "Download selected ({n})" */
  downloadSelected: string;
  download: string;
  /** "Download {name}" */
  downloadOne: string;
  preparing: string;
  /** "Saved {file} ({size})" */
  saved: string;
  /** "{n} of {total} selected" */
  selected: string;
  failed: string;
  vector: string;
  generated: string;
}

const ICONS = { text: FileText, logo: PenTool, keyart: FileImage, image: ImageIcon } as const;
const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

/** Resolves a token (`--accent`) on an element to `#rrggbb`, whatever colour syntax it uses. */
function tokenHex(el: Element, token: string): string {
  const value = getComputedStyle(el).getPropertyValue(token).trim();
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx || !value) return value;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map((n) => (n ?? 0).toString(16).padStart(2, "0")).join("")}`;
}

const luminance = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
};

function save(blob: Blob, file: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Press kit downloads (signature, part two): every asset can be saved on its own, or ticked and
 * bundled into one ZIP built in the browser. Logos and key art are generated from the page's own
 * colour tokens as SVG; texts are the copy on this page; screenshots are fetched at full size.
 */
export function PressDownloads({ assets, labels, game, intl, zipName }: { assets: PressAsset[]; labels: PressLabels; game: string; intl: string; zipName: string }) {
  const [picked, setPicked] = React.useState<string[]>(assets.map((a) => a.id));
  const [busy, setBusy] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("");
  const root = React.useRef<HTMLDivElement>(null);
  const f = React.useMemo(() => createFormatter(intl), [intl]);

  const build = async (a: PressAsset): Promise<Uint8Array> => {
    const enc = new TextEncoder();
    const el = root.current ?? document.documentElement;
    const colors = { bg: tokenHex(el, "--scene"), ink: tokenHex(el, "--fg"), ember: tokenHex(el, "--accent") };
    switch (a.kind) {
      case "text":
        return enc.encode(a.content);
      case "logo":
      {
        // Light ink for dark backgrounds and the other way round — whichever of the two tokens fits.
        const [light, dark] = luminance(colors.ink) > luminance(colors.bg) ? [colors.ink, colors.bg] : [colors.bg, colors.ink];
        return enc.encode(logoSvg({ ink: a.variant === "on-dark" ? light : dark, ember: colors.ember }, game));
      }
      case "keyart":
        return enc.encode(atlasSvg(colors, { title: `${game} — key art` }));
      case "image": {
        const res = await fetch(a.src, { mode: "cors" });
        if (!res.ok) throw new Error(String(res.status));
        return new Uint8Array(await res.arrayBuffer());
      }
    }
  };

  const typeOf = (a: PressAsset) => (a.kind === "text" ? "text/plain;charset=utf-8" : a.kind === "image" ? "image/jpeg" : "image/svg+xml");

  const downloadOne = async (a: PressAsset) => {
    setBusy(a.id);
    setStatus(labels.preparing);
    try {
      const data = await build(a);
      const blob = new Blob([data as BlobPart], { type: typeOf(a) });
      save(blob, a.file);
      setStatus(fill(labels.saved, { file: a.file, size: f.bytes(blob.size) }));
    } catch {
      setStatus(fill(labels.failed, { file: a.file }));
    } finally {
      setBusy(null);
    }
  };

  const downloadZip = async () => {
    setBusy("zip");
    setStatus(labels.preparing);
    const entries: ZipEntry[] = [];
    const missing: string[] = [];
    for (const a of assets.filter((x) => picked.includes(x.id))) {
      try {
        entries.push({ name: `${zipName}/${a.file}`, data: await build(a) });
      } catch {
        missing.push(a.file);
      }
    }
    if (missing.length) entries.push({ name: `${zipName}/MISSING.txt`, data: new TextEncoder().encode(`These files could not be fetched and are not in this archive:\n${missing.join("\n")}\n`) });
    const blob = zip(entries);
    save(blob, `${zipName}.zip`);
    setStatus(fill(labels.saved, { file: `${zipName}.zip`, size: f.bytes(blob.size) }));
    setBusy(null);
  };

  const all = picked.length === assets.length;

  return (
    <div ref={root} className="overflow-hidden rounded-ui border border-line bg-surface" data-press-downloads="">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <Checkbox
          checked={all ? true : picked.length ? "indeterminate" : false}
          onCheckedChange={(v) => setPicked(v === true ? assets.map((a) => a.id) : [])}
          label={labels.selectAll}
          description={fill(labels.selected, { n: picked.length, total: assets.length })}
          data-select-all=""
        />
        <Button variant="primary" onClick={downloadZip} disabled={!picked.length || busy !== null} loading={busy === "zip"} data-download-zip="">
          <Archive aria-hidden />
          {fill(labels.downloadSelected, { n: picked.length })}
        </Button>
      </div>
      <ul className="m-0 list-none p-0">
        {assets.map((a) => {
          const Icon = ICONS[a.kind];
          const on = picked.includes(a.id);
          return (
            <li key={a.id} className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[auto_auto_1fr_auto] sm:px-5", on && "bg-accent-soft/40")} data-asset={a.id}>
              <Checkbox
                checked={on}
                onCheckedChange={(v) => setPicked((p) => (v === true ? [...p, a.id] : p.filter((x) => x !== a.id)))}
                aria-label={a.name}
              />
              {a.kind === "image" ? (
                <img src={a.preview} alt="" width={64} height={36} loading="lazy" className="hidden h-9 w-16 rounded-ui-sm object-cover grayscale sm:block" />
              ) : (
                <span aria-hidden className="hidden h-9 w-16 place-items-center rounded-ui-sm border border-line bg-surface-2 text-fg-muted sm:grid [&_svg]:size-4">
                  <Icon />
                </span>
              )}
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-fg">{a.name}</p>
                <p className="m-0 flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
                  <span className="font-mono">{a.file}</span>
                  <span aria-hidden>·</span>
                  <span>{a.note}</span>
                  {a.kind === "logo" || a.kind === "keyart" ? (
                    <Badge size="sm" tone="outline">
                      {labels.vector}
                    </Badge>
                  ) : null}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => downloadOne(a)} disabled={busy !== null} loading={busy === a.id} aria-label={fill(labels.downloadOne, { name: a.name })} data-download={a.id}>
                <Download aria-hidden />
                <span className="hidden sm:inline">{labels.download}</span>
              </Button>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="m-0 min-h-10 border-t border-line bg-surface-2 px-4 py-2.5 font-mono text-xs text-fg-muted sm:px-5" data-press-status="">
        {status || labels.generated}
      </p>
    </div>
  );
}
