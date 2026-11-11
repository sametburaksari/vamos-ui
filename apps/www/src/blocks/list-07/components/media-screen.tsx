"use client";

import * as React from "react";
import { ImagePlus } from "lucide-react";
import {
  Badge,
  Button,
  PageHeader,
  Select,
  cn,
} from "@vamos-ui/react";
import {
  MediaLibrary,
  createMemoryAdapter,
  isAltMissing,
  type MediaAsset,
  type MediaLibraryHandle,
  type MediaQuery,
} from "@vamos-ui/react/media";
import { useBlockFormat } from "../../_shared/format";
import {
  ARCHIVED_BYTES,
  STORAGE_LIMIT,
  folderNamesTr,
  folders,
  kindLabels,
  seedAssets,
} from "./media-data";

type Bucket = keyof typeof kindLabels;
const bucketOf = (a: MediaAsset): Bucket =>
  a.kind === "image" ? "image" : a.kind === "video" ? "video" : "document";
const bucketTone: Record<Bucket, string> = {
  image: "bg-chart-1",
  video: "bg-chart-3",
  document: "bg-chart-5",
};

/** Draws a small PNG in the theme's colours, so "Add sample files" has real images to upload. */
async function sampleImage(name: string, i: number): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 640;
  const ctx = canvas.getContext("2d")!;
  const css = getComputedStyle(document.documentElement);
  const tone = (v: string) => css.getPropertyValue(v).trim();
  ctx.fillStyle = tone("--surface-2") || tone("--scene");
  ctx.fillRect(0, 0, 960, 640);
  ctx.fillStyle = tone(`--chart-${(i % 5) + 1}`) || tone("--accent");
  ctx.beginPath();
  ctx.arc(300 + i * 160, 330, 210 - i * 30, 0, Math.PI * 2);
  ctx.fill();
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/png"),
  );
  return new File([blob ?? new Blob()], name, { type: "image/png" });
}

/** The website media library: kit Media library with folders, multi-select, upload queue and a details panel, plus storage at a glance. */
export function MediaScreen() {
  const { c, t, f, lang } = useBlockFormat();
  const handle = React.useRef<MediaLibraryHandle>(null);
  const [query, setQuery] = React.useState<MediaQuery>({ sort: "newest" });
  const [assets, setAssets] = React.useState<MediaAsset[]>(seedAssets);
  const [adding, setAdding] = React.useState(false);

  // One adapter per language: folder names are data, so the Turkish preview gets Turkish folders.
  const adapter = React.useMemo(() => {
    const a = createMemoryAdapter({
      seed: seedAssets,
      folders: folders.map((fo) => ({
        ...fo,
        name: lang === "tr" ? (folderNamesTr[fo.id] ?? fo.name) : fo.name,
      })),
      latency: 160,
      uploadDuration: 2600,
      locale: lang === "tr" ? "tr-TR" : "en-US",
      capabilities: {
        maxFileSize: 250 * 1024 ** 2,
        folders: true,
        edit: true,
        bulk: true,
        replace: true,
      },
    });
    // Keep the storage meter in step with what the library uploads, edits and deletes.
    const sync = () =>
      void a.list({ limit: 500 }).then((p) => setAssets(p.items));
    const wrap = <K extends "upload" | "remove" | "update">(k: K) => {
      const orig = a[k].bind(a) as (...args: unknown[]) => Promise<unknown>;
      (a as unknown as Record<K, unknown>)[k] = async (...args: unknown[]) => {
        const r = await orig(...args);
        sync();
        return r;
      };
    };
    wrap("upload");
    wrap("remove");
    wrap("update");
    return a;
  }, [lang]);

  const used = assets.reduce((s, a) => s + a.size, 0) + ARCHIVED_BYTES;
  const byBucket = (["image", "video", "document"] as Bucket[]).map((k) => ({
    k,
    bytes: assets
      .filter((a) => bucketOf(a) === k)
      .reduce((s, a) => s + a.size, 0),
    n: assets.filter((a) => bucketOf(a) === k).length,
  }));
  const noAlt = assets.filter((a) => isAltMissing(a)).length;
  const unused = assets.filter((a) => !a.usage?.count).length;
  const folderName = (id: string) =>
    (lang === "tr"
      ? folderNamesTr[id]
      : folders.find((x) => x.id === id)?.name) ?? id;

  const addSamples = async () => {
    setAdding(true);
    try {
      const files = await Promise.all(
        [
          "atelier-window-light.png",
          "glaze-test-tiles.png",
          "studio-floor-plan.png",
        ].map(sampleImage),
      );
      files.push(
        new File(
          [
            `Kiln & Linen · AW26 shot list\n\n1. Mugs on the oak table\n2. Linen throws, window light\n`,
          ],
          "aw26-shot-list.txt",
          { type: "text/plain" },
        ),
      );
      handle.current?.addFiles(files);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <PageHeader
        eyebrow={c("Website", "Web sitesi")}
        title={c("Media", "Medya")}
        meta={
          <Badge tone="outline" className="tabular">
            {assets.length}
          </Badge>
        }
        description={c(
          "Photos, films and downloads used across kilnandlinen.example.com. Drop files anywhere on the library to upload.",
          "kilnandlinen.example.com genelinde kullanılan fotoğraflar, filmler ve indirmeler. Yüklemek için dosyaları kütüphanenin üzerine bırakın.",
        )}
        actions={
          <Button onClick={addSamples} loading={adding}>
            <ImagePlus /> {c("Add sample files", "Örnek dosya ekle")}
          </Button>
        }
      />

      <section
        aria-label={c("Storage", "Depolama")}
        className="surface mt-6 grid gap-4 rounded-ui-lg px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center md:gap-8"
      >
        <div className="grid gap-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-[13px] text-fg">
              <span className="tabular text-[20px] font-medium tracking-tight">
                {f.bytes(used)}
              </span>{" "}
              <span className="text-fg-muted">
                {c(
                  `of ${f.bytes(STORAGE_LIMIT)} used`,
                  `/ ${f.bytes(STORAGE_LIMIT)} kullanıldı`,
                )}
              </span>
            </p>
            <p className="tabular text-[12px] text-fg-subtle">
              {c(
                `${f.bytes(STORAGE_LIMIT - used)} left on the Studio plan`,
                `Studio planında ${f.bytes(STORAGE_LIMIT - used)} kaldı`,
              )}
            </p>
          </div>
          <div
            role="meter"
            aria-valuemin={0}
            aria-valuemax={STORAGE_LIMIT}
            aria-valuenow={Math.round(used)}
            aria-valuetext={c(
              `${f.bytes(used)} of ${f.bytes(STORAGE_LIMIT)}`,
              `${f.bytes(STORAGE_LIMIT)} içinden ${f.bytes(used)}`,
            )}
            aria-label={c("Storage used", "Kullanılan depolama")}
            className="flex h-2 overflow-hidden rounded-full bg-track"
          >
            {byBucket.map((b) => (
              <span
                key={b.k}
                className={cn(
                  "h-full transition-[width] duration-500 motion-reduce:transition-none",
                  bucketTone[b.k],
                )}
                style={{ width: `${(b.bytes / STORAGE_LIMIT) * 100}%` }}
              />
            ))}
            <span
              className="h-full bg-fg-subtle/40"
              style={{ width: `${(ARCHIVED_BYTES / STORAGE_LIMIT) * 100}%` }}
            />
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-fg-muted">
            {byBucket.map((b) => (
              <li key={b.k} className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className={cn("size-2 rounded-full", bucketTone[b.k])}
                />
                {t(kindLabels[b.k])}{" "}
                <span className="tabular text-fg-subtle">
                  {f.bytes(b.bytes)}
                </span>
              </li>
            ))}
            <li className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2 rounded-full bg-fg-subtle/40"
              />
              {c("Archived campaigns", "Arşivlenmiş kampanyalar")}{" "}
              <span className="tabular text-fg-subtle">
                {f.bytes(ARCHIVED_BYTES)}
              </span>
            </li>
          </ul>
        </div>
        <dl className="grid grid-cols-2 gap-3 border-line max-md:border-t max-md:pt-4 md:border-s md:ps-8">
          <div className="grid gap-0.5">
            <dt className="text-[12px] text-fg-muted">
              {c("Missing alt text", "Alt metni eksik")}
            </dt>
            <dd
              className={cn(
                "tabular text-[20px] font-medium tracking-tight",
                noAlt ? "text-warning" : "text-fg",
              )}
            >
              {noAlt}
            </dd>
            <dd className="text-[11.5px] text-fg-subtle">
              {c("Open a file to add it", "Eklemek için dosyayı açın")}
            </dd>
          </div>
          <div className="grid gap-0.5">
            <dt className="text-[12px] text-fg-muted">
              {c("Not used anywhere", "Hiçbir yerde kullanılmıyor")}
            </dt>
            <dd className="tabular text-[20px] font-medium tracking-tight text-fg">
              {unused}
            </dd>
            <dd>
              <Button
                size="xs"
                variant="link"
                onClick={() =>
                  setQuery((q) => ({ ...q, unattached: !q.unattached }))
                }
                aria-pressed={Boolean(query.unattached)}
              >
                {query.unattached
                  ? c("Show all files", "Tüm dosyaları göster")
                  : c("Show only these", "Yalnızca bunları göster")}
              </Button>
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-4 sm:hidden">
        <Select
          size="sm"
          aria-label={c("Folder", "Klasör")}
          value={
            query.folderId === undefined ? "all" : (query.folderId ?? "root")
          }
          onValueChange={(v) =>
            setQuery((q) => ({
              ...q,
              folderId: v === "all" || !v ? undefined : v === "root" ? null : v,
            }))
          }
          items={[
            { value: "all", label: c("All files", "Tüm dosyalar") },
            { value: "root", label: c("Not in a folder", "Klasörsüz") },
            ...folders.map((fo) => ({
              value: fo.id,
              label: fo.parentId ? `— ${folderName(fo.id)}` : folderName(fo.id),
            })),
          ]}
        />
      </div>

      <MediaLibrary
        key={lang}
        adapter={adapter}
        handleRef={handle}
        query={query}
        onQueryChange={setQuery}
        folders="sidebar"
        selection="multiple"
        detailsPanel="side"
        tileSize="md"
        height="clamp(30rem, calc(100dvh - 22rem), 52rem)"
        aria-label={c("Media library", "Medya kütüphanesi")}
        className="mt-4"
      />
    </div>
  );
}
