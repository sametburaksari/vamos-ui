"use client";

import * as React from "react";
import { CircleAlert, Download, FileText, FolderInput, LayoutGrid, List, Play, Search, Trash2, Upload, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
  Button, Checkbox, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, EmptyState, Input, Progress,
  Select, ToggleGroup, ToggleGroupItem, cn,
} from "@vamos-ui/react";
import { Stagger } from "@vamos-ui/react/motion";
import { useBlockFormat } from "../../_shared/format";
import { leafFolders, type Asset, type AssetKind } from "../data";

export type KindFilter = "all" | AssetKind;
export type SortKey = "newest" | "name" | "size";

export interface Upload {
  id: string;
  name: string;
  progress: number;
}

export const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export interface MediaLibraryProps {
  title: string;
  assets: Asset[];
  totalInView: number;
  query: string;
  onQueryChange: (q: string) => void;
  kind: KindFilter;
  onKindChange: (k: KindFilter) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  layout: "grid" | "list";
  onLayoutChange: (l: "grid" | "list") => void;
  selected: Set<string>;
  onSelectedChange: (s: Set<string>) => void;
  focusedId: string | null;
  onOpen: (id: string) => void;
  uploads: Upload[];
  onUpload: () => void;
  onMove: (ids: string[], folder: string) => void;
  onDelete: (ids: string[]) => void;
}

export function MediaLibrary(p: MediaLibraryProps) {
  const { c, t, f } = useBlockFormat();
  const [confirm, setConfirm] = React.useState(false);
  const ids = [...p.selected];
  const allChecked = p.assets.length > 0 && p.assets.every((a) => p.selected.has(a.id));
  const someChecked = p.assets.some((a) => p.selected.has(a.id));

  const toggle = (id: string, on: boolean) => {
    const next = new Set(p.selected);
    if (on) next.add(id);
    else next.delete(id);
    p.onSelectedChange(next);
  };

  return (
    <section aria-labelledby="shell05-title" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3 px-4 pt-6 md:px-8">
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">{c("Media library", "Medya kütüphanesi")}</p>
          <h1 id="shell05-title" className="mt-1.5 truncate font-display text-[length:calc(30px*var(--display-scale,1))] leading-tight text-fg">
            {p.title}
          </h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            {c(`${f.number(p.totalInView)} ${p.totalInView === 1 ? "file" : "files"}`, `${f.number(p.totalInView)} dosya`)}
            {p.assets.length !== p.totalInView ? ` · ${c(`${f.number(p.assets.length)} shown`, `${f.number(p.assets.length)} gösteriliyor`)}` : null}
          </p>
        </div>
        <Button variant="primary" onClick={p.onUpload}>
          <Upload aria-hidden /> {c("Upload", "Yükle")}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-10 mt-5 flex flex-wrap items-center gap-2 border-y border-line bg-[color-mix(in_srgb,var(--scene)_80%,transparent)] px-4 py-2.5 backdrop-blur-xl md:px-8">
        <Checkbox
          aria-label={c("Select all shown", "Gösterilenlerin tümünü seç")}
          checked={allChecked ? true : someChecked ? "indeterminate" : false}
          onCheckedChange={(v) => p.onSelectedChange(v === true ? new Set(p.assets.map((a) => a.id)) : new Set())}
          className="me-1"
        />
        <Input
          size="sm"
          className="min-w-0 flex-1 basis-[11rem] sm:max-w-72"
          leading={<Search aria-hidden />}
          placeholder={c("Search file names and alt text", "Dosya adı ve alt metinde ara")}
          aria-label={c("Search media", "Medyada ara")}
          value={p.query}
          onChange={(e) => p.onQueryChange(e.target.value)}
          clearable
          onClear={() => p.onQueryChange("")}
        />
        <ToggleGroup type="single" size="sm" value={p.kind} onValueChange={(v) => v && p.onKindChange(v as KindFilter)} aria-label={c("File type", "Dosya türü")}>
          <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
          <ToggleGroupItem value="image">{c("Images", "Görseller")}</ToggleGroupItem>
          <ToggleGroupItem value="video">{c("Video", "Video")}</ToggleGroupItem>
          <ToggleGroupItem value="document">{c("Docs", "Belgeler")}</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex-1 max-sm:hidden" />
        <div className="w-36 max-sm:flex-1">
          <Select
            size="sm"
            aria-label={c("Sort", "Sırala")}
            value={p.sort}
            onValueChange={(v) => v && p.onSortChange(v as SortKey)}
            items={[
              { value: "newest", label: c("Newest first", "En yeni") },
              { value: "name", label: c("Name A–Z", "Ada göre A–Z") },
              { value: "size", label: c("Largest first", "En büyük") },
            ]}
          />
        </div>
        <ToggleGroup type="single" size="sm" value={p.layout} onValueChange={(v) => v && p.onLayoutChange(v as "grid" | "list")} aria-label={c("Layout", "Görünüm")}>
          <ToggleGroupItem value="grid" aria-label={c("Grid", "Izgara")}>
            <LayoutGrid aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label={c("List", "Liste")}>
            <List aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="min-h-0 flex-1 px-4 pt-5 pb-28 md:px-8">
        {p.uploads.length > 0 && (
          <ul aria-label={c("Uploading", "Yükleniyor")} className="mb-5 grid gap-2 rounded-ui border border-line bg-surface-2 p-3 sm:grid-cols-2">
            {p.uploads.map((u) => (
              <li key={u.id}>
                <Progress size="xs" value={u.progress} label={<span className="truncate font-mono text-[12px]">{u.name}</span>} showValue />
              </li>
            ))}
          </ul>
        )}

        {p.assets.length === 0 ? (
          <EmptyState
            kind="no-results"
            title={c("Nothing matches", "Eşleşen dosya yok")}
            description={c("Try another word or file type, or clear the search.", "Başka bir kelime ya da dosya türü deneyin veya aramayı temizleyin.")}
            actions={<Button size="sm" onClick={() => { p.onQueryChange(""); p.onKindChange("all"); }}>{c("Clear filters", "Filtreleri temizle")}</Button>}
          />
        ) : p.layout === "grid" ? (
          <Stagger asChild key={p.title} effect="fade">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6" aria-label={p.title}>
              {p.assets.map((a) => (
                <AssetTile key={a.id} asset={a} checked={p.selected.has(a.id)} selecting={p.selected.size > 0} focused={p.focusedId === a.id} onCheck={(v) => toggle(a.id, v)} onOpen={() => p.onOpen(a.id)} />
              ))}
            </ul>
          </Stagger>
        ) : (
          <ul className="divide-y divide-line rounded-ui border border-line bg-surface" aria-label={p.title}>
            {p.assets.map((a) => (
              <li key={a.id} className={cn("flex items-center gap-3 px-3 py-2", p.focusedId === a.id && "bg-selected")}>
                <Checkbox aria-label={c(`Select ${a.name}`, `${a.name} seç`)} checked={p.selected.has(a.id)} onCheckedChange={(v) => toggle(a.id, v === true)} />
                <Thumb asset={a} className="size-10 shrink-0 rounded-ui-sm" />
                <button type="button" onClick={() => p.onOpen(a.id)} className="min-w-0 flex-1 rounded-sm text-start focus-ring">
                  <span className="block truncate font-mono text-[12.5px] text-fg">{a.name}</span>
                  <span className="block text-[12px] text-fg-subtle">
                    {a.width ? `${a.width}×${a.height} · ` : ""}
                    {f.bytes(a.size)}
                  </span>
                </button>
                {a.kind !== "document" && !a.alt ? <CircleAlert aria-label={c("Missing alt text", "Alt metni eksik")} className="size-4 shrink-0 text-warning" /> : null}
                <span className="w-28 shrink-0 text-end text-[12px] text-fg-subtle max-sm:hidden">{f.date(a.uploadedAt, "medium")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selection bar */}
      {p.selected.size > 0 && (
        <div role="region" aria-label={c("Selection", "Seçim")} data-state="open" className="ui-fade pointer-events-none sticky bottom-4 z-20 -mt-20 flex justify-center px-4">
          <div className="surface-popover pointer-events-auto flex max-w-full items-center gap-1 rounded-full border border-popover-border p-1 ps-4 shadow-xl">
            <span className="tabular me-2 text-[13px] font-medium whitespace-nowrap text-fg" aria-live="polite">
              {c(`${f.number(p.selected.size)} selected`, `${f.number(p.selected.size)} seçili`)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <FolderInput aria-hidden /> <span className="max-sm:sr-only">{c("Move to", "Taşı")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top">
                <DropdownMenuLabel>{c("Move to folder", "Klasöre taşı")}</DropdownMenuLabel>
                {leafFolders.map((fo) => (
                  <DropdownMenuItem key={fo.id} onSelect={() => p.onMove(ids, fo.id)}>
                    {t(fo.name)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="ghost" onClick={() => p.onSelectedChange(new Set())} className="max-sm:hidden">
              <Download aria-hidden /> {c("Download", "İndir")}
            </Button>
            <Button size="sm" variant="danger-ghost" onClick={() => setConfirm(true)}>
              <Trash2 aria-hidden /> <span className="max-sm:sr-only">{c("Delete", "Sil")}</span>
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label={c("Clear selection", "Seçimi temizle")} onClick={() => p.onSelectedChange(new Set())}>
              <X aria-hidden />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent tone="danger">
          <AlertDialogHeader
            title={c(`Delete ${f.number(ids.length)} files?`, `${f.number(ids.length)} dosya silinsin mi?`)}
            description={c(
              "Pages that use them will show an empty slot until you pick a new file. You can undo for a few seconds.",
              "Bu dosyaları kullanan sayfalarda yeni bir dosya seçene kadar boş alan görünür. Birkaç saniye içinde geri alabilirsiniz.",
            )}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{c("Cancel", "Vazgeç")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => p.onDelete(ids)}>{c("Delete files", "Dosyaları sil")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export function Thumb({ asset, className }: { asset: Asset; className?: string }) {
  if (asset.thumb) {
    return (
      <span className={cn("relative block overflow-hidden bg-surface-2", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.thumb} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
        {asset.kind === "video" ? (
          <span aria-hidden className="absolute inset-0 grid place-items-center">
            <span className="grid size-8 place-items-center rounded-full bg-[color-mix(in_srgb,var(--scene)_70%,transparent)] text-fg backdrop-blur">
              <Play className="size-3.5 translate-x-px fill-current" />
            </span>
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <span className={cn("relative grid place-items-center overflow-hidden border border-line bg-surface-2 text-fg-subtle", className)}>
      <FileText className="size-[38%] max-h-10 max-w-10" strokeWidth={1.3} aria-hidden />
      <span className="absolute bottom-[10%] font-mono text-[10px] font-semibold tracking-wider text-fg-muted uppercase">{asset.ext}</span>
    </span>
  );
}

function AssetTile({ asset: a, checked, selecting, focused, onCheck, onOpen }: { asset: Asset; checked: boolean; selecting: boolean; focused: boolean; onCheck: (v: boolean) => void; onOpen: () => void }) {
  const { c, f } = useBlockFormat();
  const missingAlt = a.kind !== "document" && !a.alt;
  return (
    <li className="group relative min-w-0">
      <div
        className={cn(
          "relative overflow-hidden rounded-ui ring-offset-2 ring-offset-[var(--scene)] transition-shadow",
          checked ? "ring-2 ring-accent" : focused ? "ring-2 ring-fg-subtle" : "",
        )}
      >
        <button type="button" onClick={onOpen} className="block w-full focus-ring rounded-ui" aria-label={c(`Open ${a.name}`, `${a.name} aç`)}>
          <Thumb asset={a} className="aspect-[4/5] w-full" />
        </button>
        <span
          className={cn(
            "absolute start-2 top-2 grid size-7 place-items-center rounded-md bg-[color-mix(in_srgb,var(--scene)_75%,transparent)] backdrop-blur transition-opacity",
            checked || selecting ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
          )}
        >
          <Checkbox aria-label={c(`Select ${a.name}`, `${a.name} seç`)} checked={checked} onCheckedChange={(v) => onCheck(v === true)} />
        </span>
        {a.duration ? (
          <span className="tabular absolute end-2 bottom-2 rounded-md bg-[color-mix(in_srgb,var(--scene)_75%,transparent)] px-1.5 py-0.5 font-mono text-[10.5px] text-fg backdrop-blur">
            {fmtDuration(a.duration)}
          </span>
        ) : null}
        {missingAlt ? (
          <span className="absolute end-2 top-2 grid size-6 place-items-center rounded-full bg-[color-mix(in_srgb,var(--scene)_75%,transparent)] text-warning backdrop-blur" title={c("Missing alt text", "Alt metni eksik")}>
            <CircleAlert className="size-3.5" aria-hidden />
            <span className="sr-only">{c("Missing alt text", "Alt metni eksik")}</span>
          </span>
        ) : null}
      </div>
      <p className="mt-2 truncate font-mono text-[11.5px] text-fg">{a.name}</p>
      <p className="tabular text-[11.5px] text-fg-subtle">
        {a.width ? `${a.width}×${a.height} · ` : ""}
        {f.bytes(a.size)}
      </p>
    </li>
  );
}
